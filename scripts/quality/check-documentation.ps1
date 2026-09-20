param(
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path,
    [string[]]$ChangedFiles,
    [string]$ChangedFilesList
)

$ErrorActionPreference = 'Stop'

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
    '(^|/)[^/]+\.(py|pyi|js|jsx|mjs|cjs|ts|tsx|ps1|psm1|sh)$'
)
$substantiveChanges = @($ChangedFiles | Where-Object {
    $_ -match ($workPatterns -join '|')
})

if ($substantiveChanges.Count -eq 0) {
    Write-Host '[NON APPLICABLE] Aucun changement applicatif ou technique detecte.' -ForegroundColor DarkGray
    exit 0
}
if ($ChangedFiles -notcontains 'README.md') {
    Write-Host '[FAIL] Un changement applicatif ou technique existe sans README.md modifie.' -ForegroundColor Red
    Write-Host '       Le script verifie la coherence du lot, pas l ordre temporel des modifications.'
    exit 1
}

Write-Host '[PASS] Le lot de changements techniques inclut README.md.' -ForegroundColor Green
exit 0
