param([string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path)

$ErrorActionPreference = 'Stop'
$hostExecutable = (Get-Process -Id $PID).Path
$lineChecker = Join-Path $Root 'scripts\quality\check-source-lines.ps1'
$secretChecker = Join-Path $Root 'scripts\quality\check-secrets.ps1'
$docChecker = Join-Path $Root 'scripts\quality\check-documentation.ps1'
$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$testRoot = Join-Path $tempBase ("assess-teams-quality-" + [guid]::NewGuid())
$failures = @()

function Invoke-ExpectedExit {
    param(
        [string]$Name,
        [string]$Script,
        [string[]]$Arguments,
        [int]$Expected
    )
    $output = & $hostExecutable -NoProfile -File $Script @Arguments 2>&1
    if ($LASTEXITCODE -ne $Expected) {
        $script:failures += "$Name (attendu $Expected, obtenu $LASTEXITCODE): $output"
    }
}

try {
    New-Item -ItemType Directory -Path $testRoot -Force | Out-Null
    $source = Join-Path $testRoot 'sample.py'

    1..200 | ForEach-Object { 'pass' } | Set-Content -LiteralPath $source
    Invoke-ExpectedExit '200 lignes acceptees' $lineChecker @('-Root', $testRoot) 0

    Add-Content -LiteralPath $source -Value 'fail'
    Invoke-ExpectedExit '201 lignes refusees' $lineChecker @('-Root', $testRoot) 1

    Set-Content -LiteralPath $source -Value 'safe_value = "example"'
    Invoke-ExpectedExit 'contenu sur accepte' $secretChecker @('-Root', $testRoot) 0

    $fakeCredential = ('AKIA' + ('A' * 16))
    Set-Content -LiteralPath $source -Value "credential = '$fakeCredential'"
    Invoke-ExpectedExit 'credential refuse' $secretChecker @('-Root', $testRoot) 1

    Invoke-ExpectedExit 'README absent refuse' $docChecker @(
        '-Root', $testRoot, '-ChangedFilesList', 'backend/app.py'
    ) 1
    Invoke-ExpectedExit 'README present accepte' $docChecker @(
        '-Root', $testRoot, '-ChangedFilesList', 'backend/app.py;README.md'
    ) 0
} finally {
    $resolvedTestRoot = [IO.Path]::GetFullPath($testRoot)
    if ($resolvedTestRoot.StartsWith($tempBase) -and (Test-Path -LiteralPath $resolvedTestRoot)) {
        Remove-Item -LiteralPath $resolvedTestRoot -Recurse -Force
    }
}

if ($failures.Count -gt 0) {
    Write-Host '[FAIL] Tests du socle qualite :' -ForegroundColor Red
    $failures | ForEach-Object { Write-Host "  - $_" }
    exit 1
}

Write-Host '[PASS] Tests positifs et negatifs du socle qualite.' -ForegroundColor Green
exit 0
