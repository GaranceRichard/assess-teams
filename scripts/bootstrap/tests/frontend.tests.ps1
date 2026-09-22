param([Parameter(Mandatory)][string]$Root)

$ErrorActionPreference = 'Stop'
$bootstrap = Join-Path $Root 'scripts\bootstrap\frontend.ps1'
$dev = Join-Path $Root 'scripts\dev-frontend.ps1'
$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$testRoot = Join-Path $tempBase ('assess-frontend-bootstrap-' + [guid]::NewGuid())

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
}

function New-FrontendFixture {
    param([string]$Path)
    $frontend = Join-Path $Path 'frontend'
    New-Item -ItemType Directory -Path $frontend -Force | Out-Null
    Set-Content (Join-Path $frontend 'package.json') '{"name":"fixture","version":"1.0.0"}'
    Set-Content (Join-Path $frontend 'package-lock.json') '{"lockfileVersion":3}'
}

try {
    New-FrontendFixture $testRoot
    if ($env:OS -eq 'Windows_NT') {
        $fakeNpm = Join-Path $testRoot 'fake-npm.cmd'
        $fake = @'
@echo off
echo %*>>npm-calls.log
if "%1"=="ci" (
  if exist .fail-ci exit /b 42
  if exist node_modules rmdir /s /q node_modules
  mkdir node_modules\.bin
  type nul > node_modules\.bin\vite.cmd
  exit /b 0
)
if "%1"=="ls" (
  if not exist node_modules\.bin\vite.cmd exit /b 1
  exit /b 0
)
if "%1"=="run" exit /b 0
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
  : > node_modules/.bin/vite
  chmod +x node_modules/.bin/vite
  exit 0
fi
if [ "$1" = "ls" ]; then
  [ -f node_modules/.bin/vite ] && exit 0
  exit 1
fi
[ "$1" = "run" ] && exit 0
exit 3
'@
        [IO.File]::WriteAllText($fakeNpm, $fake, [Text.UTF8Encoding]::new($false))
        & chmod +x $fakeNpm
    }

    $first = & $bootstrap -Root $testRoot -NpmCommand $fakeNpm 6>&1 | Out-String
    Assert-True ($first.Contains('node_modules absent')) 'node_modules absent ne declenche pas npm ci.'
    $callsPath = Join-Path $testRoot 'frontend\npm-calls.log'
    $ciCount = @(Get-Content $callsPath | Where-Object { $_ -like 'ci *' }).Count
    Assert-True ($ciCount -eq 1) 'Le premier bootstrap frontend doit executer un npm ci.'
    $stamp = Join-Path $testRoot 'frontend\node_modules\.assess-teams-bootstrap.json'
    $initialWrite = (Get-Item -LiteralPath $stamp -Force).LastWriteTimeUtc

    $second = & $bootstrap -Root $testRoot -NpmCommand $fakeNpm 6>&1 | Out-String
    Assert-True ($second.Contains('deja conformes')) 'Le frontend conforme n est pas reutilise.'
    Assert-True ((Get-Item -LiteralPath $stamp -Force).LastWriteTimeUtc -eq $initialWrite) `
        'Le stamp frontend a ete reecrit.'
    $ciCount = @(Get-Content $callsPath | Where-Object { $_ -like 'ci *' }).Count
    Assert-True ($ciCount -eq 1) 'Le frontend conforme a relance npm ci.'

    Add-Content (Join-Path $testRoot 'frontend\package-lock.json') ' '
    $changed = & $bootstrap -Root $testRoot -NpmCommand $fakeNpm 6>&1 | Out-String
    Assert-True ($changed.Contains('lockfile modifie')) 'Le changement du lockfile est ignore.'
    & $dev -Root $testRoot -NpmCommand $fakeNpm
    $calls = Get-Content $callsPath
    Assert-True (($calls | Where-Object { $_ -eq 'run dev -- --host 127.0.0.1' }).Count -eq 1) `
        'Le demarrage frontend n utilise pas le runtime local prepare.'

    $failureRoot = Join-Path $testRoot 'failure'
    New-FrontendFixture $failureRoot
    New-Item (Join-Path $failureRoot 'frontend\.fail-ci') -ItemType File | Out-Null
    $failed = $false
    try { & $bootstrap -Root $failureRoot -NpmCommand $fakeNpm 2>&1 | Out-Null } catch {
        $failed = $_.Exception.Message.Contains('[bootstrap frontend] ECHEC')
    }
    Assert-True $failed 'Un echec npm ci ne bloque pas explicitement le bootstrap frontend.'
    Write-Host '[PASS] Bootstrap frontend absent, conforme, modifie, en echec et runtime local.'
} finally {
    if ((Test-Path $testRoot) -and $testRoot.StartsWith($tempBase)) {
        Remove-Item -LiteralPath $testRoot -Recurse -Force
    }
}
