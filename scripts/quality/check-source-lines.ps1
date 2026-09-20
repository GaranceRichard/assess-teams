param([string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'files.ps1')

$violations = @()
foreach ($relativePath in Get-SourceFiles -Root $Root) {
    $path = Join-Path $Root $relativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { continue }
    $lineCount = @(Get-Content -LiteralPath $path).Count
    if ($lineCount -gt 200) {
        $violations += [PSCustomObject]@{
            Path = $relativePath
            Lines = $lineCount
        }
    }
}

if ($violations.Count -gt 0) {
    Write-Host 'FAIL - Files exceeding 200 lines:' -ForegroundColor Red
    Write-Host
    $violations | ForEach-Object { Write-Host "$($_.Path) : $($_.Lines) lines" }
    Write-Host
    Write-Host "$($violations.Count) files exceed the maximum allowed size of 200 lines."
    exit 1
}

Write-Host 'PASS - No source file exceeds 200 lines.' -ForegroundColor Green
exit 0
