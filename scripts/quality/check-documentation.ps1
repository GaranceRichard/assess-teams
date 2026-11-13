param(
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path,
    [string[]]$ChangedFiles,
    [string]$ChangedFilesList
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'documentation-policy.ps1')

# The same base as the impact plan/pre-push; local additions include staged and untracked work.
$base = $env:QUALITY_DIFF_BASE
if (-not $base) {
    $upstream = @(& git -C $Root for-each-ref '--format=%(upstream:short)' (git -C $Root symbolic-ref -q HEAD))
    $base = if ($upstream.Count -and $upstream[0]) { $upstream[0] } else { 'HEAD' }
}
& git -C $Root cat-file -e "${base}^{commit}"
if ($LASTEXITCODE -ne 0) { throw 'Base documentaire invalide ; controle refuse.' }

function Get-ChangedFiles {
    param([string]$RepositoryRoot)

    $files = @()
    $committedRangeFound = $false
    if ($env:QUALITY_DIFF_BASE) {
        $previousErrorPreference = $ErrorActionPreference
        $ErrorActionPreference = 'SilentlyContinue'
        & git -C $RepositoryRoot cat-file -e "$($env:QUALITY_DIFF_BASE)^{commit}" 2>$null
        $baseExists = $LASTEXITCODE -eq 0
        $ErrorActionPreference = $previousErrorPreference
        if ($baseExists) {
            $files += & git -C $RepositoryRoot diff --name-only "$($env:QUALITY_DIFF_BASE)...HEAD"
            $committedRangeFound = $true
        }
    } else {
        $previousErrorPreference = $ErrorActionPreference
        $ErrorActionPreference = 'SilentlyContinue'
        $upstream = & git -C $RepositoryRoot rev-parse --abbrev-ref '@{upstream}' 2>$null
        $upstreamExists = $LASTEXITCODE -eq 0
        $ErrorActionPreference = $previousErrorPreference
        if ($upstreamExists) {
            $files += & git -C $RepositoryRoot diff --name-only "$upstream...HEAD"
            $committedRangeFound = $true
        }
    }
    if (-not $committedRangeFound) {
        $files += & git -C $RepositoryRoot show --pretty= --name-only HEAD
    }
    $files += & git -C $RepositoryRoot diff --name-only
    $files += & git -C $RepositoryRoot diff --cached --name-only
    $files += & git -C $RepositoryRoot ls-files --others --exclude-standard
    return $files | ForEach-Object { $_.Replace('\', '/') } | Sort-Object -Unique
}

if ($PSBoundParameters.ContainsKey('ChangedFilesList')) {
    $ChangedFiles = @($ChangedFilesList.Split(';') | Where-Object { $_ })
} elseif (-not $PSBoundParameters.ContainsKey('ChangedFiles')) {
    $ChangedFiles = @(Get-ChangedFiles -RepositoryRoot $Root)
}

$workPatterns = @(
    '^(backend|frontend|e2e|scripts|\.githooks|\.github)/',
    '(^|/)[^/]+\.(py|pyi|js|jsx|mjs|cjs|ts|tsx|ps1|psm1|sh)$',
    '(^|/)(package[^/]*\.json|.*lock[^/]*|requirements[^/]*|pyproject\.toml|.*config[^/]*|\.coveragerc)$'
)
$substantiveChanges = @($ChangedFiles | Where-Object {
    $_ -match ($workPatterns -join '|')
})

if ($substantiveChanges.Count -eq 0) {
    Write-Host '[NON APPLICABLE] Aucun changement applicatif ou technique detecte.' -ForegroundColor DarkGray
    exit 0
}
$documents = @{}
foreach ($file in $ChangedFiles | Where-Object { $_ -match '\.md$' }) {
    $documents[$file] = Get-AddedDocumentation -Root $Root -Base $base -Document $file
}
$missing = @()
foreach ($technical in $substantiveChanges) {
    $covered = @($documents.Keys | Where-Object {
        (Test-DocumentOwner $_ $technical) -and (Test-Preparation $documents[$_] $technical)
    })
    if (-not $covered.Count) { $missing += $technical }
}
if ($missing.Count) {
    Write-Host '[FAIL] Preparation documentaire ajoutee, complete et rattachee requise pour :' -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "  - $_" }
    Write-Host 'Voir docs/quality/documentation-policy.md ; une simple presence de README ne suffit pas.'
    exit 1
}
Write-Host '[PASS] Chaque fichier technique possede une preparation dans un document proprietaire.' -ForegroundColor Green
Write-Host '[REVIEW] Pertinence, chronologie et impact README exigent une revue de contenu explicite.'
exit 0
