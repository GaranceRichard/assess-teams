param([string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'files.ps1')

$failed = $false
& git -C $Root diff --check
if ($LASTEXITCODE -ne 0) { $failed = $true }
& git -C $Root diff --cached --check
if ($LASTEXITCODE -ne 0) { $failed = $true }

$markers = '^(<<<<<<< |=======|>>>>>>> )'
$conflicts = @()
foreach ($relativePath in Get-QualityFiles -Root $Root) {
    $path = Join-Path $Root $relativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { continue }
    if (Select-String -LiteralPath $path -Pattern $markers -Quiet -ErrorAction SilentlyContinue) {
        $conflicts += $relativePath
    }
}
if ($conflicts.Count -gt 0) {
    Write-Host '[FAIL] Marqueurs de conflit detectes :' -ForegroundColor Red
    $conflicts | ForEach-Object { Write-Host "  - $_" }
    $failed = $true
}

if ($failed) { exit 1 }
Write-Host '[PASS] Aucun defaut structurel evident detecte.' -ForegroundColor Green
exit 0
