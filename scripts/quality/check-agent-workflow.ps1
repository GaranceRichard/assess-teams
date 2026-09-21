param([string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path)

$ErrorActionPreference = 'Stop'
$requirements = @(
    @('AGENTS.md', 'Aucun chantier ne modifie directement le checkout principal ouvert dans VS Code.'),
    @('AGENTS.md', 'Le premier PBI'),
    @('AGENTS.md', 'workspace multi-root'),
    @('docs/quality/agent-rules.md', 'Chaque PBI parall'),
    @('docs/quality/agent-rules.md', 'ne cible pas `main`'),
    @('README.md', 'Pre-push vers main'),
    @('.githooks/pre-push', 'check-contribution-workflow.ps1')
)
$failures = @()

foreach ($requirement in $requirements) {
    $relativePath, $expected = $requirement
    $path = Join-Path $Root $relativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        $failures += "$relativePath est absent."
        continue
    }
    $content = Get-Content -LiteralPath $path -Raw -Encoding utf8
    if (-not $content.Contains($expected)) {
        $failures += "$relativePath ne contient pas la regle attendue: $expected"
    }
}

if ($failures.Count -gt 0) {
    Write-Host '[FAIL] Workflow documentaire des agents :' -ForegroundColor Red
    $failures | ForEach-Object { Write-Host "  - $_" }
    exit 1
}

Write-Host '[PASS] Workflow documentaire des agents coherent.' -ForegroundColor Green
exit 0
