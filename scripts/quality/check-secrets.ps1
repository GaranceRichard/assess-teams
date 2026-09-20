param([string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'files.ps1')

$patterns = @(
    ('-----BEGIN ' + '(RSA |EC |OPENSSH )?PRIVATE KEY-----'),
    ('AKIA' + '[0-9A-Z]{16}'),
    ('gh' + '[pousr]_[A-Za-z0-9_]{30,}'),
    ('xox' + '[aboprs]-[A-Za-z0-9-]{10,}'),
    '(?i)(api[_-]?key|client[_-]?secret|password|access[_-]?token)\s*[:=]\s*["''][^"'']{8,}["'']'
)
$findings = @()

foreach ($relativePath in Get-QualityFiles -Root $Root) {
    $path = Join-Path $Root $relativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { continue }
    try { $content = Get-Content -LiteralPath $path -Raw -ErrorAction Stop } catch { continue }
    foreach ($pattern in $patterns) {
        if ($content -match $pattern) {
            $findings += $relativePath
            break
        }
    }
}

if ($findings.Count -gt 0) {
    Write-Host '[FAIL] Secret ou credential potentiel detecte :' -ForegroundColor Red
    $findings | Sort-Object -Unique | ForEach-Object { Write-Host "  - $_" }
    exit 1
}

Write-Host '[PASS] Aucun secret evident detecte par le scanner local.' -ForegroundColor Green
exit 0
