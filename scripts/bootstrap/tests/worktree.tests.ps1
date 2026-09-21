param([Parameter(Mandatory)][string]$Root)

$ErrorActionPreference = 'Stop'
$setup = Join-Path $Root 'scripts\setup-hooks.ps1'
$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$testRoot = Join-Path $tempBase ('assess-worktree-bootstrap-' + [guid]::NewGuid())
$repository = Join-Path $testRoot 'repository'
$worktree = Join-Path $testRoot 'worktree'
$gitVariables = @(& git rev-parse --local-env-vars)
$savedGitEnvironment = @{}

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
}

try {
    foreach ($name in $gitVariables) {
        $savedGitEnvironment[$name] = [Environment]::GetEnvironmentVariable($name)
        Remove-Item "Env:$name" -ErrorAction SilentlyContinue
    }
    New-Item -ItemType Directory -Path (Join-Path $repository '.githooks') -Force | Out-Null
    $postCheckout = @'
#!/bin/sh
repo_root=$(git rev-parse --show-toplevel)
printf prepared > "$repo_root/worktree-bootstrap.txt"
'@
    [IO.File]::WriteAllText(
        (Join-Path $repository '.githooks\post-checkout'),
        $postCheckout,
        [Text.UTF8Encoding]::new($false)
    )
    foreach ($name in @('pre-commit', 'pre-push', 'run-quality')) {
        Set-Content (Join-Path $repository ".githooks\$name") "#!/bin/sh`nexit 0" -Encoding ascii
    }
    & git -C $repository init --initial-branch=main | Out-Null
    & git -C $repository config user.email 'bootstrap-tests@example.invalid'
    & git -C $repository config user.name 'Bootstrap Tests'
    & git -C $repository add .githooks
    & git -C $repository commit -m 'fixture' | Out-Null
    & $setup -Root $repository | Out-Null
    $hooksPath = & git -C $repository config --get core.hooksPath
    Assert-True ([IO.Path]::IsPathRooted($hooksPath)) 'core.hooksPath doit etre stable et absolu.'
    Assert-True (-not ((Get-Item $hooksPath).Attributes -band [IO.FileAttributes]::ReparsePoint)) `
        'Le repertoire de dispatchers ne doit pas etre un lien.'

    $ErrorActionPreference = 'Continue'
    & git -C $repository worktree add -b test-bootstrap $worktree main 2>&1 | Out-Null
    $ErrorActionPreference = 'Stop'
    Assert-True ($LASTEXITCODE -eq 0) 'La creation du worktree de test a echoue.'
    Assert-True (Test-Path (Join-Path $worktree 'worktree-bootstrap.txt')) `
        'Le post-checkout du nouveau worktree n a pas ete execute.'
    Assert-True (-not ((Get-Item $worktree).Attributes -band [IO.FileAttributes]::ReparsePoint)) `
        'Le nouveau worktree ne doit pas etre un lien.'
    Write-Host '[PASS] Nouveau worktree prepare via des dispatchers physiques partages.'
} finally {
    foreach ($name in $gitVariables) {
        [Environment]::SetEnvironmentVariable($name, $savedGitEnvironment[$name])
    }
    if ((Test-Path $testRoot) -and $testRoot.StartsWith($tempBase)) {
        Remove-Item -LiteralPath $testRoot -Recurse -Force
    }
}
