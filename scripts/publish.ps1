param([string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path)

$ErrorActionPreference = 'Stop'
function Invoke-Git {
    param([string[]]$Arguments, [string]$Directory = $Root)
    & git -C $Directory @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Git refuse: $($Arguments -join ' ')" }
}
function Assert-Clean {
    param([string]$Directory)
    $status = @(Invoke-Git @('status', '--porcelain') $Directory)
    if ($status.Count) { throw "Checkout sale: $Directory" }
}

$common = (Invoke-Git @('rev-parse', '--path-format=absolute', '--git-common-dir')).Trim()
$lockPath = Join-Path $common 'assess-integration.lock'
try {
    $lock = [IO.File]::Open($lockPath, 'OpenOrCreate', 'ReadWrite', 'None')
} catch {
    throw 'Une integration est deja active. Reessayer apres sa publication ; aucun fetch/test lance.'
}
try {
    $entries = @(Invoke-Git @('worktree', 'list', '--porcelain'))
    $primaryLine = $entries | Where-Object { $_ -like 'worktree *' } | Select-Object -First 1
    $primary = $primaryLine.Substring('worktree '.Length)
    $branch = (Invoke-Git @('symbolic-ref', '--short', 'HEAD')).Trim()
    if ($branch -eq 'main' -or [IO.Path]::GetFullPath($Root) -eq [IO.Path]::GetFullPath($primary)) {
        throw 'Publication uniquement depuis la branche et le worktree du chantier.'
    }
    Assert-Clean $Root
    Assert-Clean $primary
    if ((Invoke-Git @('symbolic-ref', '--short', 'HEAD') $primary).Trim() -ne 'main') {
        throw 'Le checkout principal doit etre sur main.'
    }
    Invoke-Git @('fetch', 'origin', 'main')
    Invoke-Git @('merge-base', '--is-ancestor', 'main', 'origin/main') $primary
    Invoke-Git @('rebase', 'origin/main')
    Assert-Clean $Root
    $candidate = (Invoke-Git @('rev-parse', 'HEAD')).Trim()
    Invoke-Git @('push', 'origin', "${branch}:main")
    Invoke-Git @('fetch', 'origin', 'main')
    Invoke-Git @('merge-base', '--is-ancestor', $candidate, 'origin/main')
    Assert-Clean $primary
    Invoke-Git @('merge', '--ff-only', 'origin/main') $primary
    $local = (Invoke-Git @('rev-parse', 'HEAD') $primary).Trim()
    $remote = (Invoke-Git @('rev-parse', 'origin/main')).Trim()
    if ($local -ne $remote) { throw 'Main local reste en retard.' }
    Write-Host "[PUSH] Publie $candidate ; main local synchronise. Attente CI apres liberation du verrou."
} finally {
    $lock.Dispose()
    # Keep the inode: deleting the lock file could let another process lock a different one.
}

& node (Join-Path $PSScriptRoot 'quality/wait-ci.mjs') $Root $candidate
if ($LASTEXITCODE -ne 0) { throw "Push effectue et main synchronise, mais CI non verte : livraison non terminee ($candidate)." }
Write-Host "[PASS] Livraison $candidate ; CI verte et main synchronise. Nettoyer uniquement ce chantier."
