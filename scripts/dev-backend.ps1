param(
    [switch]$NoReload,
    [int]$Port = 8000,
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
$backend = Join-Path $Root 'backend'
$windowsPython = Join-Path $backend '.venv\Scripts\python.exe'
$unixPython = Join-Path $backend '.venv/bin/python'

if (Test-Path (Join-Path $Root '.git')) {
    & (Join-Path $PSScriptRoot 'setup-hooks.ps1') -Root $Root -Quiet
}
& (Join-Path $PSScriptRoot 'bootstrap\backend.ps1') -Root $Root -QuietIfReady
$python = if (Test-Path $windowsPython) { $windowsPython } else { $unixPython }
if (-not (Test-Path $python -PathType Leaf)) { throw 'Python local prepare introuvable.' }

Push-Location $backend
try {
    $env:DJANGO_SETTINGS_MODULE = 'config.settings_development'
    & $python manage.py migrate --noinput
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    & $python manage.py seed_development_users
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    $serverArguments = @('manage.py', 'runserver', "127.0.0.1:$Port")
    if ($NoReload) { $serverArguments += '--noreload' }
    $workerOptions = @{
        FilePath = $python
        ArgumentList = @('manage.py', 'send_password_reset_emails', '--watch')
        WorkingDirectory = $backend
        PassThru = $true
    }
    if ($env:OS -eq 'Windows_NT') { $workerOptions.WindowStyle = 'Hidden' }
    $passwordWorker = Start-Process @workerOptions
    & $python @serverArguments
    exit $LASTEXITCODE
} finally {
    if ($passwordWorker -and -not $passwordWorker.HasExited) {
        $passwordWorker.Kill()
        $passwordWorker.WaitForExit()
    }
    Pop-Location
}
