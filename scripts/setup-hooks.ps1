param(
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
    [switch]$Quiet
)

$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath($Root)

& git -C $root rev-parse --is-inside-work-tree 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Le repertoire courant n est pas un depot Git.' }

$commonGitDirectory = (& git -C $root rev-parse --git-common-dir).Trim()
if ($LASTEXITCODE -ne 0) { throw 'Impossible de resoudre le repertoire Git commun.' }
if (-not [IO.Path]::IsPathRooted($commonGitDirectory)) {
    $commonGitDirectory = [IO.Path]::GetFullPath((Join-Path $root $commonGitDirectory))
}
$dispatcherRoot = Join-Path $commonGitDirectory 'assess-teams-hooks'
New-Item -ItemType Directory -Path $dispatcherRoot -Force | Out-Null

foreach ($hookName in @('post-checkout', 'pre-commit', 'pre-push')) {
    $required = if ($hookName -eq 'pre-push') {
        '  echo "[FAIL] Hook pre-push versionne introuvable." >&2; exit 1'
    } else { '  exit 0' }
    $dispatcher = @"
#!/bin/sh
set -eu
repo_root=`$(git rev-parse --show-toplevel)
versioned_hook="`$repo_root/.githooks/$hookName"
if [ ! -f "`$versioned_hook" ]; then
$required
fi
exec sh "`$versioned_hook" "`$@"
"@
    $dispatcherPath = Join-Path $dispatcherRoot $hookName
    [IO.File]::WriteAllText($dispatcherPath, $dispatcher, [Text.UTF8Encoding]::new($false))
}

& git -C $root config core.hooksPath $dispatcherRoot
if ($LASTEXITCODE -ne 0) { throw 'Impossible de configurer core.hooksPath.' }

if ($env:OS -ne 'Windows_NT') {
    & chmod +x (Join-Path $root '.githooks/pre-commit')
    & chmod +x (Join-Path $root '.githooks/pre-push')
    & chmod +x (Join-Path $root '.githooks/post-checkout')
    & chmod +x (Join-Path $root '.githooks/run-quality')
    Get-ChildItem -LiteralPath $dispatcherRoot -File | ForEach-Object { & chmod +x $_.FullName }
}

if (-not $Quiet) {
    Write-Host "[PASS] Dispatchers Git actifs via core.hooksPath=$dispatcherRoot." -ForegroundColor Green
}
