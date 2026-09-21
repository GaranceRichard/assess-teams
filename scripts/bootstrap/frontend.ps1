param(
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path,
    [string]$NpmCommand,
    [switch]$QuietIfReady
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'common.ps1')

$frontend = Join-Path $Root 'frontend'
$lockfile = Join-Path $frontend 'package-lock.json'
$modules = Join-Path $frontend 'node_modules'
$stampPath = Join-Path $modules '.assess-teams-bootstrap.json'
$vite = if ($env:OS -eq 'Windows_NT') {
    Join-Path $modules '.bin\vite.cmd'
} else {
    Join-Path $modules '.bin/vite'
}

try {
    if (-not (Test-Path -LiteralPath $lockfile -PathType Leaf)) {
        throw "Lockfile frontend introuvable : $lockfile"
    }
    Assert-PhysicalDirectory $modules 'frontend/node_modules'
    if (-not $NpmCommand) {
        $name = if ($env:OS -eq 'Windows_NT') { 'npm.cmd' } else { 'npm' }
        $command = Get-Command $name -ErrorAction SilentlyContinue
        if (-not $command) { throw 'npm est introuvable.' }
        $NpmCommand = $command.Source
    }
    $lockHash = Get-ContentSha256 @($lockfile)
    $stamp = Read-BootstrapStamp $stampPath
    $treeReady = $false
    if ((Test-Path -LiteralPath $vite -PathType Leaf) -and $stamp -and
        $stamp.schema -eq 1 -and $stamp.lockfileSha256 -eq $lockHash) {
        Push-Location $frontend
        try {
            & $NpmCommand ls --all --silent *> $null
            $treeReady = $LASTEXITCODE -eq 0
        } finally { Pop-Location }
    }
    if ($treeReady) {
        if (-not $QuietIfReady) { Write-Host '[bootstrap frontend] dependances deja conformes.' }
        return
    }

    $reason = if (-not (Test-Path $modules)) { 'node_modules absent' } elseif (
        $stamp -and $stamp.lockfileSha256 -ne $lockHash
    ) { 'lockfile modifie' } else { 'dependances incoherentes' }
    Write-Host "[bootstrap frontend] npm ci ($reason)..." -ForegroundColor Cyan
    Push-Location $frontend
    try {
        & $NpmCommand ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw "npm ci a echoue ($LASTEXITCODE)" }
        & $NpmCommand ls --all --silent *> $null
        if ($LASTEXITCODE -ne 0) { throw "npm ls a refuse l'installation ($LASTEXITCODE)" }
    } finally { Pop-Location }
    if (-not (Test-Path -LiteralPath $vite -PathType Leaf)) {
        throw 'Vite est absent apres npm ci.'
    }
    Write-BootstrapStamp $stampPath @{ schema = 1; lockfileSha256 = $lockHash }
    Write-Host "[bootstrap frontend] pret : $modules" -ForegroundColor Green
} catch {
    throw "[bootstrap frontend] ECHEC : $($_.Exception.Message)"
}
