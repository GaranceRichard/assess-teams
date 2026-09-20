param([switch]$NoReload)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$backend = Join-Path $root 'backend'
$windowsPython = Join-Path $backend '.venv\Scripts\python.exe'
$unixPython = Join-Path $backend '.venv/bin/python'

if (Test-Path $windowsPython) {
    $python = $windowsPython
} elseif (Test-Path $unixPython) {
    $python = $unixPython
} else {
    $python = 'python'
}

Push-Location $backend
try {
    & $python manage.py migrate --noinput
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    $serverArguments = @('manage.py', 'runserver', '127.0.0.1:8000')
    if ($NoReload) { $serverArguments += '--noreload' }
    & $python @serverArguments
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
