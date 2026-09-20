function Get-QualityFiles {
    param([Parameter(Mandatory)][string]$Root)

    $tracked = $null
    if (Test-Path (Join-Path $Root '.git')) {
        $tracked = & git -C $Root ls-files --cached --others --exclude-standard 2>$null
    }
    if (-not $tracked) {
        $rootPrefix = $Root.TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar
        $tracked = Get-ChildItem -LiteralPath $Root -File -Recurse |
            ForEach-Object { $_.FullName.Substring($rootPrefix.Length) }
    }

    $excludedDirectories = '(^|/)(\.git|\.venv|venv|node_modules|dist|build|coverage)(/|$)'
    $lockFiles = '(^|/)(package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml|poetry\.lock|Pipfile\.lock)$'
    $generatedFiles = '(\.min\.(js|css)$|(^|/)migrations/[^/]+\.py$)'

    return $tracked |
        ForEach-Object { $_.Replace('\', '/') } |
        Where-Object { $_ -notmatch $excludedDirectories } |
        Where-Object { $_ -notmatch $lockFiles } |
        Where-Object { $_ -notmatch $generatedFiles } |
        Sort-Object -Unique
}

function Get-SourceFiles {
    param([Parameter(Mandatory)][string]$Root)

    $sourceExtensions = @(
        '.py', '.pyi', '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx',
        '.ps1', '.psm1', '.sh', '.yml', '.yaml', '.toml', '.json', '.ini', '.cfg'
    )
    $configurationNames = @('.coveragerc', '.gitignore', '.gitattributes', 'Dockerfile', 'Makefile')
    return Get-QualityFiles -Root $Root | Where-Object {
        $extension = [IO.Path]::GetExtension($_).ToLowerInvariant()
        $name = Split-Path $_ -Leaf
        $isHook = $_ -like '.githooks/*'
        ($sourceExtensions -contains $extension) -or ($configurationNames -contains $name) -or $isHook
    }
}
