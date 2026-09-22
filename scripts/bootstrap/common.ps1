function Get-ContentSha256 {
    param([Parameter(Mandatory)][string[]]$Paths)

    $builder = [Text.StringBuilder]::new()
    foreach ($path in ($Paths | Sort-Object)) {
        [void]$builder.AppendLine([IO.Path]::GetFileName($path))
        [void]$builder.AppendLine([Convert]::ToBase64String([IO.File]::ReadAllBytes($path)))
    }
    $bytes = [Text.Encoding]::UTF8.GetBytes($builder.ToString())
    return Get-BytesSha256 $bytes
}

function Get-BytesSha256 {
    param([Parameter(Mandatory)][byte[]]$Bytes)

    $algorithm = [Security.Cryptography.SHA256]::Create()
    try {
        $hash = $algorithm.ComputeHash($Bytes)
        return ([BitConverter]::ToString($hash) -replace '-', '').ToLowerInvariant()
    } finally {
        $algorithm.Dispose()
    }
}

function Read-BootstrapStamp {
    param([Parameter(Mandatory)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
    try {
        return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
    } catch {
        return $null
    }
}

function Write-BootstrapStamp {
    param([Parameter(Mandatory)][string]$Path, [Parameter(Mandatory)][hashtable]$Value)

    $temporary = "$Path.tmp"
    $Value | ConvertTo-Json | Set-Content -LiteralPath $temporary -Encoding utf8
    Move-Item -LiteralPath $temporary -Destination $Path -Force
}

function Assert-PhysicalDirectory {
    param([Parameter(Mandatory)][string]$Path, [Parameter(Mandatory)][string]$Name)

    if (-not (Test-Path -LiteralPath $Path)) { return }
    $item = Get-Item -LiteralPath $Path -Force
    if (-not $item.PSIsContainer) { throw "$Name doit etre un repertoire : $Path" }
    if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "$Name ne peut pas etre un lien ou une junction : $Path"
    }
}

function Initialize-NodeDependencies {
    param(
        [Parameter(Mandatory)][string]$WorkingDirectory,
        [Parameter(Mandatory)][string]$ExecutableName,
        [Parameter(Mandatory)][string]$Label,
        [string]$NpmCommand,
        [switch]$QuietIfReady
    )

    $lockfile = Join-Path $WorkingDirectory 'package-lock.json'
    $modules = Join-Path $WorkingDirectory 'node_modules'
    $stampPath = Join-Path $modules '.assess-teams-bootstrap.json'
    $executable = if ($env:OS -eq 'Windows_NT') {
        Join-Path $modules ".bin\$ExecutableName.cmd"
    } else {
        Join-Path $modules ".bin/$ExecutableName"
    }
    if (-not (Test-Path -LiteralPath $lockfile -PathType Leaf)) {
        throw "Lockfile $Label introuvable : $lockfile"
    }
    Assert-PhysicalDirectory $modules "$Label/node_modules"
    if (-not $NpmCommand) {
        $name = if ($env:OS -eq 'Windows_NT') { 'npm.cmd' } else { 'npm' }
        $command = Get-Command $name -ErrorAction SilentlyContinue
        if (-not $command) { throw 'npm est introuvable.' }
        $NpmCommand = $command.Source
    }

    $lockHash = Get-ContentSha256 @($lockfile)
    $stamp = Read-BootstrapStamp $stampPath
    $treeReady = $false
    if ((Test-Path -LiteralPath $executable -PathType Leaf) -and $stamp -and
        $stamp.schema -eq 1 -and $stamp.lockfileSha256 -eq $lockHash) {
        Push-Location $WorkingDirectory
        try {
            & $NpmCommand ls --all --silent *> $null
            $treeReady = $LASTEXITCODE -eq 0
        } finally { Pop-Location }
    }
    if ($treeReady) {
        if (-not $QuietIfReady) { Write-Host "[bootstrap $Label] dependances deja conformes." }
        return
    }

    $reason = if (-not (Test-Path $modules)) { 'node_modules absent' } elseif (
        $stamp -and $stamp.lockfileSha256 -ne $lockHash
    ) { 'lockfile modifie' } else { 'dependances incoherentes' }
    Write-Host "[bootstrap $Label] npm ci ($reason)..." -ForegroundColor Cyan
    Push-Location $WorkingDirectory
    try {
        & $NpmCommand ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw "npm ci a echoue ($LASTEXITCODE)" }
        & $NpmCommand ls --all --silent *> $null
        if ($LASTEXITCODE -ne 0) { throw "npm ls a refuse l'installation ($LASTEXITCODE)" }
    } finally { Pop-Location }
    if (-not (Test-Path -LiteralPath $executable -PathType Leaf)) {
        throw "$ExecutableName est absent apres npm ci."
    }
    Write-BootstrapStamp $stampPath @{ schema = 1; lockfileSha256 = $lockHash }
    Write-Host "[bootstrap $Label] pret : $modules" -ForegroundColor Green
}
