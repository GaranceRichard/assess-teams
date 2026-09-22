param([Parameter(Mandatory)][string]$Root)

$ErrorActionPreference = 'Stop'
$bootstrap = Join-Path $Root 'scripts\bootstrap\root.ps1'
$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$testRoot = Join-Path $tempBase ('assess-root-bootstrap-' + [guid]::NewGuid())

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
}

try {
    New-Item -ItemType Directory -Path $testRoot -Force | Out-Null
    Set-Content (Join-Path $testRoot 'package.json') '{"name":"fixture","version":"1.0.0"}'
    Set-Content (Join-Path $testRoot 'package-lock.json') '{"lockfileVersion":3}'
    $concurrently = if ($env:OS -eq 'Windows_NT') {
        Join-Path $testRoot 'node_modules\.bin\concurrently.cmd'
    } else { Join-Path $testRoot 'node_modules/.bin/concurrently' }
    if ($env:OS -eq 'Windows_NT') {
        $fakeNpm = Join-Path $testRoot 'fake-npm.cmd'
        $fake = @'
@echo off
echo %*>>npm-calls.log
if "%1"=="ci" (
  if exist .fail-ci exit /b 42
  if exist node_modules rmdir /s /q node_modules
  mkdir node_modules\.bin
  type nul > node_modules\.bin\concurrently.cmd
  exit /b 0
)
if "%1"=="ls" (
  if not exist node_modules\.bin\concurrently.cmd exit /b 1
  exit /b 0
)
exit /b 3
'@
        Set-Content $fakeNpm $fake -Encoding ascii
    } else {
        $fakeNpm = Join-Path $testRoot 'fake-npm'
        $fake = @'
#!/bin/sh
printf '%s\n' "$*" >> npm-calls.log
if [ "$1" = "ci" ]; then
  [ -f .fail-ci ] && exit 42
  rm -rf node_modules
  mkdir -p node_modules/.bin
  : > node_modules/.bin/concurrently
  chmod +x node_modules/.bin/concurrently
  exit 0
fi
if [ "$1" = "ls" ]; then
  [ -f node_modules/.bin/concurrently ] && exit 0
  exit 1
fi
exit 3
'@
        [IO.File]::WriteAllText($fakeNpm, $fake, [Text.UTF8Encoding]::new($false))
        & chmod +x $fakeNpm
    }

    $first = & $bootstrap -Root $testRoot -NpmCommand $fakeNpm 6>&1 | Out-String
    Assert-True ($first.Contains('node_modules absent')) 'La racine absente ne declenche pas npm ci.'
    $callsPath = Join-Path $testRoot 'npm-calls.log'
    $ciCount = @(Get-Content $callsPath | Where-Object { $_ -like 'ci *' }).Count
    Assert-True ($ciCount -eq 1) 'Le premier bootstrap racine doit executer un npm ci.'

    $second = & $bootstrap -Root $testRoot -NpmCommand $fakeNpm 6>&1 | Out-String
    Assert-True ($second.Contains('deja conformes')) 'La racine conforme n est pas reutilisee.'
    $ciCount = @(Get-Content $callsPath | Where-Object { $_ -like 'ci *' }).Count
    Assert-True ($ciCount -eq 1) 'La racine conforme a relance npm ci.'

    Add-Content (Join-Path $testRoot 'package-lock.json') ' '
    $changed = & $bootstrap -Root $testRoot -NpmCommand $fakeNpm 6>&1 | Out-String
    Assert-True ($changed.Contains('lockfile modifie')) 'Le changement du lockfile racine est ignore.'

    New-Item (Join-Path $testRoot '.fail-ci') -ItemType File | Out-Null
    Remove-Item $concurrently -ErrorAction SilentlyContinue
    $failed = $false
    try { & $bootstrap -Root $testRoot -NpmCommand $fakeNpm 2>&1 | Out-Null } catch {
        $failed = $_.Exception.Message.Contains('[bootstrap root] ECHEC')
    }
    Assert-True $failed 'Un echec npm ci ne bloque pas explicitement le bootstrap racine.'
    Write-Host '[PASS] Bootstrap racine absent, conforme, modifie et en echec.'
} finally {
    if ((Test-Path $testRoot) -and $testRoot.StartsWith($tempBase)) {
        Remove-Item -LiteralPath $testRoot -Recurse -Force
    }
}
