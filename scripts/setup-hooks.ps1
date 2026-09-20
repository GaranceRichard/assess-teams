$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

& git -C $root rev-parse --is-inside-work-tree 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Le repertoire courant n est pas un depot Git.' }

& git -C $root config core.hooksPath .githooks
if ($LASTEXITCODE -ne 0) { throw 'Impossible de configurer core.hooksPath.' }

if ($env:OS -ne 'Windows_NT') {
    & chmod +x (Join-Path $root '.githooks/pre-commit')
    & chmod +x (Join-Path $root '.githooks/pre-push')
    & chmod +x (Join-Path $root '.githooks/run-quality')
}

Write-Host '[PASS] Hooks Git versionnes actives via core.hooksPath=.githooks.' -ForegroundColor Green
