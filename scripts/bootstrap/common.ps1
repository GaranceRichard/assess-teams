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
