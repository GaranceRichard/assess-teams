param([string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'files.ps1')

$violations = @()
foreach ($relativePath in Get-SourceFiles -Root $Root) {
    $path = Join-Path $Root $relativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { continue }
    $lineCount = @(Get-Content -LiteralPath $path).Count
    if ($lineCount -gt 200) {
        $violations += "${relativePath}: $lineCount lignes"
    }
}

if ($violations.Count -gt 0) {
    Write-Host '[FAIL] Limite absolue de 200 lignes depassee :' -ForegroundColor Red
    $violations | ForEach-Object { Write-Host "  - $_" }
    exit 1
}

Write-Host '[PASS] Aucun fichier source maintenu ne depasse 200 lignes.' -ForegroundColor Green
exit 0
