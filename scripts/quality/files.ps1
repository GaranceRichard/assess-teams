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

    $excludedDirectories = '(^|/)(\.git|\.venv|venv|node_modules|dist|build|coverage|htmlcov|playwright-report|test-results|__pycache__|\.pytest_cache|\.ruff_cache|\.mypy_cache|\.cache)(/|$)'
    $lockFiles = '(^|/)(package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml|poetry\.lock|Pipfile\.lock|Cargo\.lock|composer\.lock|Gemfile\.lock|uv\.lock)$'
    $generatedFiles = '(\.min\.(js|css)$|\.map$|(^|/)migrations/[^/]+\.py$)'

    return $tracked |
        ForEach-Object { $_.Replace('\', '/') } |
        Where-Object { $_ -notmatch $excludedDirectories } |
        Where-Object { $_ -notmatch $lockFiles } |
        Where-Object { $_ -notmatch $generatedFiles } |
        Sort-Object -Unique
}

function Test-BinaryFile {
    param([Parameter(Mandatory)][string]$Path)

    $binaryExtensions = @(
        '.7z', '.avi', '.bmp', '.class', '.dll', '.doc', '.docx', '.eot', '.exe',
        '.gif', '.gz', '.ico', '.jar', '.jpeg', '.jpg', '.mov', '.mp3', '.mp4',
        '.otf', '.pdf', '.png', '.pyc', '.so', '.tar', '.ttf', '.wav', '.webm',
        '.webp', '.woff', '.woff2', '.xls', '.xlsx', '.zip'
    )
    if ($binaryExtensions -contains [IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        return $true
    }

    $stream = [IO.File]::OpenRead($Path)
    try {
        $buffer = New-Object byte[] 8192
        $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
        if ($bytesRead -eq 0) { return $false }
        return $buffer[0..($bytesRead - 1)] -contains 0
    } finally {
        $stream.Dispose()
    }
}

function Get-MaintainedFiles {
    param([Parameter(Mandatory)][string]$Root)

    return Get-QualityFiles -Root $Root | Where-Object {
        $path = Join-Path $Root $_
        (Test-Path -LiteralPath $path -PathType Leaf) -and -not (Test-BinaryFile -Path $path)
    }
}
