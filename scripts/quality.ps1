param(
    [Parameter(Position = 0)]
    [ValidateSet('quick', 'full')]
    [string]$Mode = 'quick'
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$hostExecutable = (Get-Process -Id $PID).Path
$failures = 0

function Write-NotApplicable {
    param([string]$Name, [string]$Reason)
    Write-Host "[NON APPLICABLE] $Name - $Reason" -ForegroundColor DarkGray
}

function Invoke-QualityStep {
    param(
        [string]$Name,
        [scriptblock]$Action,
        [string]$WorkingDirectory = $root
    )
    Write-Host "`n--- $Name ---" -ForegroundColor Cyan
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
        return
    }
    $script:failures++
    $label = if ($Mode -eq 'quick') { 'FAIL informatif' } else { 'FAIL' }
    Write-Host "[$label] $Name" -ForegroundColor Red
}

function Invoke-PowerShellCheck {
    param([string]$Name, [string]$RelativePath)
    $path = Join-Path $root $RelativePath
    Invoke-QualityStep $Name { & $hostExecutable -NoProfile -File $path -Root $root }
}

function Get-PythonExecutable {
    $windowsPython = Join-Path $root 'backend\.venv\Scripts\python.exe'
    $unixPython = Join-Path $root 'backend/.venv/bin/python'
    if (Test-Path $windowsPython) { return $windowsPython }
    if (Test-Path $unixPython) { return $unixPython }
    return 'python'
}

function Test-FrontendCoverageConfiguration {
    $candidates = @('vitest.config.ts', 'vitest.config.js', 'vite.config.ts', 'vite.config.js')
    $config = $candidates | ForEach-Object { Join-Path $root "frontend/$_" } |
        Where-Object { Test-Path $_ } | Select-Object -First 1
    if (-not $config) { throw 'Configuration Vitest de coverage introuvable.' }
    $content = Get-Content -LiteralPath $config -Raw
    foreach ($metric in @('branches', 'functions', 'lines', 'statements')) {
        $thresholdPattern = '(?m)\b{0}\s*:\s*(9[0-9]|100)\b' -f $metric
        if ($content -notmatch $thresholdPattern) {
            throw "Seuil Vitest $metric >= 90 absent de $config."
        }
    }
}

function Invoke-NpmScript {
    param([string]$ScriptName, [object]$Package)
    $available = @($Package.scripts.PSObject.Properties.Name)
    if ($available -notcontains $ScriptName) { throw "Script npm '$ScriptName' obligatoire et absent." }
    & npm run $ScriptName
}

Write-Host "Quality gate '$Mode' - Assess teams" -ForegroundColor White
Invoke-QualityStep 'Limite de 200 lignes' { & npm run check:lines }
Invoke-PowerShellCheck 'Detection locale de secrets' 'scripts\quality\check-secrets.ps1'
Invoke-PowerShellCheck 'Coherence du repository' 'scripts\quality\check-repository.ps1'
Invoke-PowerShellCheck 'README prealable au travail' 'scripts\quality\check-documentation.ps1'
Invoke-PowerShellCheck 'Workflow documentaire des agents' 'scripts\quality\check-agent-workflow.ps1'
Invoke-PowerShellCheck 'Tests du socle qualite' 'scripts\quality\tests\run-tests.ps1'

$backendPath = Join-Path $root 'backend'
$backendPresent = (Test-Path (Join-Path $backendPath 'manage.py')) -or
    (Test-Path (Join-Path $backendPath 'pyproject.toml'))
if (-not $backendPresent) {
    Write-NotApplicable 'Backend' 'bootstrap Django absent'
} else {
    $python = Get-PythonExecutable
    Invoke-QualityStep 'Backend lint' { & $python -m ruff check . } $backendPath
    Invoke-QualityStep 'Backend format check' { & $python -m ruff format --check . } $backendPath
    $coverageConfig = Join-Path $root '.coveragerc'
    if ($Mode -eq 'quick') {
        Invoke-QualityStep 'Backend tests rapides et coverage courant' {
            & $python -m pytest -m 'unit or functional' --cov=. --cov-config=$coverageConfig
        } $backendPath
    } else {
        if (Test-Path (Join-Path $backendPath 'manage.py')) {
            Invoke-QualityStep 'Coherence des migrations Django' {
                & $python manage.py makemigrations --check --dry-run
            } $backendPath
        }
    }
}

$frontendPath = Join-Path $root 'frontend'
$packagePath = Join-Path $frontendPath 'package.json'
if (-not (Test-Path $packagePath)) {
    Write-NotApplicable 'Frontend et E2E' 'bootstrap React absent'
} else {
    $package = Get-Content -LiteralPath $packagePath -Raw | ConvertFrom-Json
    Invoke-QualityStep 'Frontend lint' { Invoke-NpmScript 'lint' $package } $frontendPath
    Invoke-QualityStep 'Frontend format check' { Invoke-NpmScript 'format:check' $package } $frontendPath
    Invoke-QualityStep 'Configuration coverage frontend >= 90 %' {
        Test-FrontendCoverageConfiguration
    } $frontendPath
    if ($Mode -eq 'quick') {
        Invoke-QualityStep 'Frontend tests rapides et coverage courant' {
            Invoke-NpmScript 'test:coverage' $package
        } $frontendPath
    }
}

if ($Mode -eq 'full') {
    $allTests = Join-Path $root 'scripts\test-all.ps1'
    Invoke-QualityStep 'Suite globale test:all' {
        & $hostExecutable -NoProfile -File $allTests
    }
}

Write-Host "`n=== Resultat : $failures echec(s) ===" -ForegroundColor White
if ($Mode -eq 'quick') {
    if ($failures -gt 0) { Write-Host '[WARNING] Echecs informatifs : commit autorise.' -ForegroundColor Yellow }
    exit 0
}
if ($failures -gt 0) { Write-Host '[FAIL] Push/livraison bloque.' -ForegroundColor Red; exit 1 }
Write-Host '[PASS] Full quality gate conforme.' -ForegroundColor Green
exit 0
