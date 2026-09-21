param(
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path,
    [string]$RemoteName = 'origin',
    [string]$PushUpdates
)

$ErrorActionPreference = 'Stop'
$failures = @()

function Add-Failure {
    param([string]$Message)
    $script:failures += $Message
}

function Get-NormalizedPath {
    param([string]$Path)
    return [IO.Path]::GetFullPath($Path).TrimEnd('\', '/')
}

if ($RemoteName -ne 'origin') {
    Add-Failure "La publication doit utiliser le remote origin, pas '$RemoteName'."
}

$currentRoot = Get-NormalizedPath $Root
$worktreeList = @(& git -C $Root worktree list --porcelain)
if ($LASTEXITCODE -ne 0) { throw 'Impossible de lire les worktrees Git.' }
$primaryEntry = $worktreeList | Where-Object { $_ -like 'worktree *' } | Select-Object -First 1
if (-not $primaryEntry) { throw 'Worktree principal introuvable.' }
$primaryRoot = Get-NormalizedPath $primaryEntry.Substring('worktree '.Length)
$pathComparison = [StringComparison]::OrdinalIgnoreCase
if ($currentRoot.Equals($primaryRoot, $pathComparison)) {
    Add-Failure 'Le push depuis le checkout principal est interdit.'
}
$primaryPrefix = $primaryRoot + [IO.Path]::DirectorySeparatorChar
if ($currentRoot.StartsWith($primaryPrefix, $pathComparison)) {
    Add-Failure 'Le worktree doit etre cree hors du depot principal.'
}

$branch = (& git -C $Root symbolic-ref --quiet --short HEAD 2>$null)
if ($LASTEXITCODE -ne 0 -or -not $branch) {
    Add-Failure 'Une branche de travail dediee est obligatoire.'
} elseif ($branch -eq 'main') {
    Add-Failure 'Le travail direct sur la branche main est interdit.'
}

$statusLines = @(& git -C $Root status --porcelain)
if ($LASTEXITCODE -ne 0) { throw 'Impossible de lire le statut Git.' }
if ($statusLines.Count -gt 0) {
    Add-Failure 'Tout etat destine a main doit etre entierement commite avant le push.'
}

if (-not $PSBoundParameters.ContainsKey('PushUpdates')) {
    $PushUpdates = [Console]::In.ReadToEnd()
}
$updates = @($PushUpdates -split "`r?`n" | Where-Object { $_.Trim() })
if ($updates.Count -ne 1) {
    Add-Failure 'Le push de publication doit contenir une unique mise a jour vers main.'
} else {
    $fields = @($updates[0] -split '\s+')
    if ($fields.Count -ne 4) {
        Add-Failure 'Les references du pre-push sont illisibles.'
    } else {
        $localSha = $fields[1]
        $remoteRef = $fields[2]
        $remoteSha = $fields[3]
        $headSha = (& git -C $Root rev-parse HEAD)
        if ($remoteRef -ne 'refs/heads/main') {
            Add-Failure 'La branche de travail doit etre poussee directement vers main.'
        }
        if ($localSha -ne $headSha) {
            Add-Failure 'Le SHA pousse doit etre exactement le HEAD valide du chantier.'
        }
        if ($remoteSha -match '^0+$') {
            Add-Failure 'La branche main distante doit deja exister.'
        } else {
            & git -C $Root merge-base --is-ancestor $remoteSha $localSha 2>$null
            if ($LASTEXITCODE -ne 0) {
                Add-Failure 'Le candidat doit etre resynchronise sur le dernier main annonce par origin.'
            }
        }
    }
}

if ($failures.Count -gt 0) {
    Write-Host '[FAIL] Garde du workflow de contribution :' -ForegroundColor Red
    $failures | ForEach-Object { Write-Host "  - $_" }
    exit 1
}

Write-Host '[PASS] Branche, worktree, destination main et resynchronisation conformes.' -ForegroundColor Green
exit 0
