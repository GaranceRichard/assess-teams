param(
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
    [string]$NpmCommand
)

$ErrorActionPreference = 'Stop'
$frontend = Join-Path $Root 'frontend'
$npm = if ($NpmCommand) { $NpmCommand } elseif ($IsLinux -or $IsMacOS) { 'npm' } else { 'npm.cmd' }

& (Join-Path $PSScriptRoot 'bootstrap\frontend.ps1') -Root $Root -NpmCommand $npm -QuietIfReady

Push-Location $frontend
try {
    & $npm run dev -- --host 127.0.0.1
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
