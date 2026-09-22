param([Parameter(Mandatory)][string]$Root)

$ErrorActionPreference = 'Stop'
$bootstrap = Join-Path $Root 'scripts\bootstrap\backend.ps1'
$dev = Join-Path $Root 'scripts\dev-backend.ps1'
$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$testRoot = Join-Path $tempBase ('assess-backend-bootstrap-' + [guid]::NewGuid())

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
}

try {
    $backend = Join-Path $testRoot 'backend'
    New-Item -ItemType Directory -Path $backend -Force | Out-Null
    Set-Content (Join-Path $backend 'requirements.txt') '# empty runtime requirements'
    Set-Content (Join-Path $backend 'requirements-dev.txt') '-r requirements.txt'

    $first = & $bootstrap -Root $testRoot 6>&1 | Out-String
    $python = if ($env:OS -eq 'Windows_NT') {
        Join-Path $backend '.venv\Scripts\python.exe'
    } else {
        Join-Path $backend '.venv/bin/python'
    }
    $stamp = Join-Path $backend '.venv\.assess-teams-bootstrap.json'
    Assert-True (Test-Path $python -PathType Leaf) 'Le virtualenv backend absent n a pas ete cree.'
    Assert-True ($first.Contains('synchronisation (absent)')) 'La creation initiale n est pas explicite.'
    $initialWrite = (Get-Item -LiteralPath $stamp -Force).LastWriteTimeUtc

    $second = & $bootstrap -Root $testRoot 6>&1 | Out-String
    Assert-True ($second.Contains('deja conforme')) 'Un environnement conforme n est pas reutilise.'
    Assert-True ((Get-Item -LiteralPath $stamp -Force).LastWriteTimeUtc -eq $initialWrite) `
        'Le stamp conforme a ete reecrit.'

    Add-Content (Join-Path $backend 'requirements-dev.txt') '# requirements changed'
    $changed = & $bootstrap -Root $testRoot 6>&1 | Out-String
    Assert-True ($changed.Contains('requirements modifies')) 'Le changement de requirements est ignore.'

    $records = Join-Path $backend 'runtime-records.jsonl'
    $manage = @'
import json
import pathlib
import sys

record = {"args": sys.argv[1:], "prefix": str(pathlib.Path(sys.prefix).resolve())}
with open(pathlib.Path(__file__).with_name("runtime-records.jsonl"), "a", encoding="utf-8") as stream:
    stream.write(json.dumps(record) + "\n")
'@
    Set-Content (Join-Path $backend 'manage.py') $manage
    & $dev -Root $testRoot -NoReload
    $calls = @(Get-Content $records | ForEach-Object { $_ | ConvertFrom-Json })
    Assert-True ($calls.Count -eq 3) 'Django ne lance pas migrate, seed puis runserver.'
    Assert-True ($calls[1].args[0] -eq 'seed_development_users') `
        'Les identites de developpement ne sont pas preparees avant le serveur.'
    $expectedPrefix = [IO.Path]::GetFullPath((Join-Path $backend '.venv'))
    Assert-True (($calls | Where-Object { $_.prefix -ne $expectedPrefix }).Count -eq 0) `
        'Django a utilise un Python autre que backend/.venv.'

    $failureRoot = Join-Path $testRoot 'failure'
    New-Item -ItemType Directory -Path (Join-Path $failureRoot 'backend') -Force | Out-Null
    Set-Content (Join-Path $failureRoot 'backend\requirements.txt') '# empty'
    Set-Content (Join-Path $failureRoot 'backend\requirements-dev.txt') 'invalid requirement ???'
    $failed = $false
    try { & $bootstrap -Root $failureRoot 2>&1 | Out-Null } catch {
        $failed = $_.Exception.Message.Contains('[bootstrap backend] ECHEC')
    }
    Assert-True $failed 'Un echec pip ne bloque pas explicitement le bootstrap backend.'
    Write-Host '[PASS] Bootstrap backend absent, conforme, modifie, en echec et runtime local.'
} finally {
    if ((Test-Path $testRoot) -and $testRoot.StartsWith($tempBase)) {
        Remove-Item -LiteralPath $testRoot -Recurse -Force
    }
}
