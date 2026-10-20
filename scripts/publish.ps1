param(
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
    [switch]$Prepare
)

$ErrorActionPreference = 'Stop'
function Invoke-Git {
    param([string[]]$Arguments, [string]$Directory = $Root)
    & git -C $Directory @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Git refuse: $($Arguments -join ' ')" }
}
function Assert-Clean {
    param([string]$Directory)
    if (@(Invoke-Git @('status', '--porcelain') $Directory).Count) { throw "Checkout sale: $Directory" }
}
function Sync-Primary {
    Invoke-Git @('fetch', 'origin', 'main')
    Invoke-Git @('merge-base', '--is-ancestor', $candidate, 'origin/main')
    Assert-Clean $primary
    if ((Invoke-Git @('symbolic-ref', '--short', 'HEAD') $primary).Trim() -ne 'main') {
        throw 'Le checkout principal doit rester sur main.'
    }
    Invoke-Git @('merge', '--ff-only', 'origin/main') $primary
    if ((Invoke-Git @('rev-parse', 'HEAD') $primary).Trim() -ne
        (Invoke-Git @('rev-parse', 'origin/main')).Trim()) { throw 'Main local reste en retard.' }
}

$common = (Invoke-Git @('rev-parse', '--path-format=absolute', '--git-common-dir')).Trim()
try {
    $lock = [IO.File]::Open((Join-Path $common 'assess-integration.lock'), 'OpenOrCreate', 'ReadWrite', 'None')
} catch {
    throw 'Une integration est deja active. Reessayer apres sa publication ; aucun fetch/test lance.'
}
try {
    $entries = @(Invoke-Git @('worktree', 'list', '--porcelain'))
    $primaryLine = $entries | Where-Object { $_ -like 'worktree *' } | Select-Object -First 1
    $primary = $primaryLine.Substring('worktree '.Length)
    $branch = (Invoke-Git @('symbolic-ref', '--short', 'HEAD')).Trim()
    $currentPath = [IO.Path]::GetFullPath($Root).TrimEnd('\', '/')
    $primaryPath = [IO.Path]::GetFullPath($primary).TrimEnd('\', '/')
    if ($branch -eq 'main' -or $currentPath.Equals($primaryPath, [StringComparison]::OrdinalIgnoreCase) -or
        $currentPath.StartsWith($primaryPath + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Publication uniquement depuis la branche et le worktree du chantier, hors du principal.'
    }
    Assert-Clean $Root
    Assert-Clean $primary
    if ((Invoke-Git @('symbolic-ref', '--short', 'HEAD') $primary).Trim() -ne 'main') {
        throw 'Le checkout principal doit etre sur main.'
    }
    Invoke-Git @('merge-base', '--is-ancestor', 'main', 'origin/main') $primary
    & node (Join-Path $PSScriptRoot 'quality/publish-pr.mjs') $Root --check-origin
    if ($LASTEXITCODE -ne 0) { throw 'Origin GitHub requis ; aucun fallback direct-main.' }
    Invoke-Git @('fetch', 'origin', 'main')
    Invoke-Git @('merge-base', '--is-ancestor', 'main', 'origin/main') $primary
    $publishedBranch = @(Invoke-Git @('ls-remote', '--heads', 'origin', "refs/heads/$branch"))
    if ($publishedBranch.Count) {
        Invoke-Git @('fetch', 'origin', "refs/heads/${branch}:refs/remotes/origin/${branch}")
        Invoke-Git @('merge-base', '--is-ancestor', "origin/$branch", 'HEAD')
        Invoke-Git @('merge', '--no-edit', 'origin/main')
    } else {
        Invoke-Git @('rebase', 'origin/main')
    }
    Assert-Clean $Root
    $candidate = (Invoke-Git @('rev-parse', 'HEAD')).Trim()
    $remoteHead = if ($publishedBranch.Count) { ($publishedBranch[0] -split '\s+')[0] } else { '' }
    if ($remoteHead -eq $candidate) {
        Write-Host '[PR] Branche deja publiee au HEAD exact ; attente de sa CI sans nouveau push.'
    } else {
        Invoke-Git @('push', 'origin', "${branch}:refs/heads/${branch}")
    }
    $arguments = @((Join-Path $PSScriptRoot 'quality/publish-pr.mjs'), $Root, $candidate, $branch)
    if ($Prepare) { $arguments += '--prepare' }
    & node @arguments
    if ($LASTEXITCODE -ne 0) { throw 'PR non livree ; conserver le chantier et corriger sans bypass.' }
    if ($Prepare) { return }
    $result = Get-Content -LiteralPath (Join-Path $Root '.cache/quality/published.json') -Raw | ConvertFrom-Json
    if ($result.head -ne $candidate -or -not $result.mergeSha) { throw 'Identite de fusion invalide.' }
    Sync-Primary
    Invoke-Git @('merge-base', '--is-ancestor', $result.mergeSha, 'origin/main')
    $mergedTree = (Invoke-Git @('rev-parse', "$($result.mergeSha)^{tree}")).Trim()
    $testedTree = $result.testedTree
    if ($mergedTree -ne $testedTree) { throw 'Arbre integre different du merge synthetique valide.' }
    & node (Join-Path $PSScriptRoot 'quality/wait-ci.mjs') $Root $result.mergeSha
    if ($LASTEXITCODE -ne 0) { throw 'Fusion effectuee et main synchronise, mais CI non verte : livraison non terminee.' }
    Sync-Primary
    Write-Host "[PASS] Livraison $($result.mergeSha) ; CI verte et main synchronise. Nettoyer uniquement ce chantier."
} finally {
    $lock.Dispose()
    # Keep the inode: deleting the lock file could let another process lock a different one.
}
