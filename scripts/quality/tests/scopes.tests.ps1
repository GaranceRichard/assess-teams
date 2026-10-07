param([string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path)

$ErrorActionPreference = 'Stop'
$hostExecutable = (Get-Process -Id $PID).Path
$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$fixture = Join-Path $tempBase ('assess-quality-scopes-' + [guid]::NewGuid())
$wrapper = @'
param([string]$Script, [string]$Scope)
function Invoke-FakeTool {
    Add-Content -LiteralPath $env:SCOPE_CALLS ($args -join ' ')
    $global:LASTEXITCODE = if (($args -join ' ') -match $env:SCOPE_FAILURE) { 7 } else { 0 }
}
function global:npm { Invoke-FakeTool npm @args }
function global:npm.cmd { Invoke-FakeTool npm @args }
function global:python { Invoke-FakeTool python @args }
function global:node { Invoke-FakeTool node @args }
if ((Split-Path $Script -Leaf) -eq 'quality.ps1') {
    & $Script full -Scope $Scope
} else {
    & $Script -Scope $Scope
}
exit $LASTEXITCODE
'@

function Assert-Scope {
    param([string]$Script, [string]$Scope, [string[]]$Expected, [int]$Code = 0)
    $env:SCOPE_CALLS = Join-Path $fixture 'calls.log'
    Set-Content -LiteralPath $env:SCOPE_CALLS -Value ''
    $output = & $hostExecutable -NoProfile -ExecutionPolicy Bypass -File (Join-Path $fixture 'wrapper.ps1') `
        -Script (Join-Path $fixture "scripts/$Script") -Scope $Scope 2>&1
    if ($LASTEXITCODE -ne $Code) { throw "$Script/$Scope : attendu $Code, obtenu $LASTEXITCODE : $output" }
    $calls = @(Get-Content -LiteralPath $env:SCOPE_CALLS | Where-Object { $_ })
    $difference = Compare-Object $Expected $calls
    if ($difference) { throw "$Script/$Scope : commandes inattendues : $($difference | Out-String)" }
}

try {
    New-Item -ItemType Directory -Path (Join-Path $fixture 'scripts/quality/tests') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $fixture 'backend') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $fixture 'frontend') -Force | Out-Null
    Set-Content (Join-Path $fixture 'wrapper.ps1') $wrapper
    Set-Content (Join-Path $fixture 'backend/manage.py') ''
    Set-Content (Join-Path $fixture 'frontend/package.json') `
        '{"scripts":{"lint":"","format:check":"","build":"","test:coverage":"","test:e2e":""}}'
    Set-Content (Join-Path $fixture 'frontend/vite.config.ts') `
        'thresholds: { branches: 90, functions: 90, lines: 90, statements: 90 }'
    Copy-Item (Join-Path $Root 'scripts/quality.ps1') (Join-Path $fixture 'scripts/quality.ps1')
    $checks = @('check-secrets.ps1', 'check-repository.ps1', 'check-documentation.ps1', 'check-agent-workflow.ps1',
        'tests/run-tests.ps1', 'tests/scopes.tests.ps1')
    foreach ($check in $checks) {
        Set-Content (Join-Path $fixture "scripts/quality/$check") 'param($Root); exit 0'
    }
    New-Item -ItemType Directory -Path (Join-Path $fixture 'scripts/bootstrap/tests') -Force | Out-Null
    Set-Content (Join-Path $fixture 'scripts/bootstrap/tests/run-tests.ps1') 'param($Root); exit 0'
    Set-Content (Join-Path $fixture 'scripts/test-all.ps1') `
        'param($Scope); Add-Content -LiteralPath $env:SCOPE_CALLS "suite $Scope"; exit 0'

    $env:SCOPE_FAILURE = 'NEVER_MATCH'
    $repository = @('npm run check:lines', 'node --test scripts/quality/tests/complete-ci.test.mjs')
    $backend = @('python -m ruff check .', 'python -m ruff format --check .',
        'python manage.py makemigrations --check --dry-run --settings=config.settings_development')
    $frontend = @('npm run lint', 'npm run format:check', 'npm run build')
    Assert-Scope 'quality.ps1' 'repository' $repository
    Assert-Scope 'quality.ps1' 'backend' ($backend + @('suite backend'))
    Assert-Scope 'quality.ps1' 'frontend' ($frontend + @('suite frontend'))
    Assert-Scope 'quality.ps1' 'e2e' @('suite e2e')
    Assert-Scope 'quality.ps1' 'all' ($repository + $backend + $frontend + @('suite all'))
    $env:SCOPE_FAILURE = 'run build'
    Assert-Scope 'quality.ps1' 'frontend' ($frontend + @('suite frontend')) 1

    Copy-Item (Join-Path $Root 'scripts/test-all.ps1') (Join-Path $fixture 'scripts/test-all.ps1') -Force
    $env:SCOPE_FAILURE = 'NEVER_MATCH'
    $backendTests = @("python -m pytest --cov=. --cov-config=$(Join-Path $fixture '.coveragerc') --cov-report=term-missing")
    Assert-Scope 'test-all.ps1' 'backend' $backendTests
    Assert-Scope 'test-all.ps1' 'frontend' @('npm run test:coverage')
    Assert-Scope 'test-all.ps1' 'e2e' @('npm run test:e2e')
    Assert-Scope 'test-all.ps1' 'all' ($backendTests + @('npm run test:coverage', 'npm run test:e2e'))
    $env:SCOPE_FAILURE = 'test:e2e'
    Assert-Scope 'test-all.ps1' 'e2e' @('npm run test:e2e') 1
    Write-Host '[PASS] Scopes independants, suite complete sans doublons et echecs bloquants.'
} finally {
    Remove-Item Env:SCOPE_CALLS, Env:SCOPE_FAILURE -ErrorAction SilentlyContinue
    $resolved = [IO.Path]::GetFullPath($fixture)
    if ($resolved.StartsWith($tempBase) -and (Test-Path -LiteralPath $resolved)) {
        Remove-Item -LiteralPath $resolved -Recurse -Force
    }
}
