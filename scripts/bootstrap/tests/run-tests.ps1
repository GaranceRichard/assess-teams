param([string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path)

$ErrorActionPreference = 'Stop'
$hostExecutable = (Get-Process -Id $PID).Path
$failures = @()

foreach ($test in @('root.tests.ps1', 'backend.tests.ps1', 'frontend.tests.ps1', 'worktree.tests.ps1')) {
    $path = Join-Path $PSScriptRoot $test
    & $hostExecutable -NoProfile -ExecutionPolicy Bypass -File $path -Root $Root
    if ($LASTEXITCODE -ne 0) { $failures += $test }
}

if ($failures.Count -gt 0) {
    throw "Tests de bootstrap en echec : $($failures -join ', ')"
}
Write-Host '[PASS] Tous les tests de bootstrap local sont conformes.' -ForegroundColor Green
