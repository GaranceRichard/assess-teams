$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$frontend = Join-Path $root 'frontend'
$npm = if ($IsLinux -or $IsMacOS) { 'npm' } else { 'npm.cmd' }

Push-Location $frontend
try {
    & $npm run dev -- --host 127.0.0.1
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
