$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$failures = 0

function Invoke-TestGroup {
    param(
        [string]$Name,
        [string]$WorkingDirectory,
        [scriptblock]$Action
    )
    Write-Host "`n=== $Name ===" -ForegroundColor Cyan
    Push-Location $WorkingDirectory
    try {
        $global:LASTEXITCODE = 0
        & $Action
        $code = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    } catch {
        Write-Host $_.Exception.Message -ForegroundColor Red
        $code = 1
    } finally {
        Pop-Location
    }
    if ($code -eq 0) {
        Write-Host "[PASS] $Name" -ForegroundColor Green
    } else {
        $script:failures++
        Write-Host "[FAIL] $Name" -ForegroundColor Red
    }
}

function Get-PythonExecutable {
    $windowsPython = Join-Path $root 'backend\.venv\Scripts\python.exe'
    $unixPython = Join-Path $root 'backend/.venv/bin/python'
    if (Test-Path $windowsPython) { return $windowsPython }
    if (Test-Path $unixPython) { return $unixPython }
    return 'python'
}

function Write-Applicability {
    param([string[]]$Applicable, [string[]]$NotApplicable)
    Write-Host ('[APPLICABLE] ' + ($Applicable -join ', '))
    if ($NotApplicable.Count -gt 0) {
        Write-Host ('[NON APPLICABLE] ' + ($NotApplicable -join ', ')) -ForegroundColor DarkGray
    }
}

$backend = Join-Path $root 'backend'
if (Test-Path (Join-Path $backend 'manage.py')) {
    Write-Applicability `
        -Applicable @('fonctionnel', 'API', 'integration', 'contrat') `
        -NotApplicable @('unitaire: aucune logique isolee', 'regression: aucun bug corrige')
    $python = Get-PythonExecutable
    $coverageConfig = Join-Path $root '.coveragerc'
    Invoke-TestGroup 'Backend - tests et coverage >= 90 %' $backend {
        & $python -m pytest --cov=. --cov-config=$coverageConfig --cov-report=term-missing
    }
} else {
    Write-Host '[NON APPLICABLE] Backend - bootstrap absent.' -ForegroundColor DarkGray
}

$frontend = Join-Path $root 'frontend'
$package = Join-Path $frontend 'package.json'
if (Test-Path $package) {
    $npm = if ($IsLinux -or $IsMacOS) { 'npm' } else { 'npm.cmd' }
    Write-Applicability `
        -Applicable @('unitaire', 'composant', 'fonctionnel', 'integration', 'contrat') `
        -NotApplicable @('regression: aucun bug corrige')
    Invoke-TestGroup 'Frontend - tests et coverage >= 90 %' $frontend {
        & $npm run test:coverage
    }
    Invoke-TestGroup 'E2E - smoke test technique Playwright' $frontend {
        & $npm run test:e2e
    }
} else {
    Write-Host '[NON APPLICABLE] Frontend et E2E - bootstrap absent.' -ForegroundColor DarkGray
}

Write-Host "`n=== Synthese test:all : $failures echec(s) ===" -ForegroundColor White
if ($failures -gt 0) { exit 1 }
Write-Host '[PASS] Tous les tests applicables et leurs seuils de coverage sont conformes.' -ForegroundColor Green
exit 0
