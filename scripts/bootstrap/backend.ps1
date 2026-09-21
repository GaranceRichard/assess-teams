param(
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path,
    [switch]$QuietIfReady
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'common.ps1')

$backend = Join-Path $Root 'backend'
$environment = Join-Path $backend '.venv'
$requirements = @(Get-ChildItem -LiteralPath $backend -Filter 'requirements*.txt' -File |
    Select-Object -ExpandProperty FullName)
$stampPath = Join-Path $environment '.assess-teams-bootstrap.json'
$localPython = if ($env:OS -eq 'Windows_NT') {
    Join-Path $environment 'Scripts\python.exe'
} else {
    Join-Path $environment 'bin/python'
}

function Test-Python {
    param([string]$Command, [string[]]$Prefix = @(), [switch]$Local)
    $probe = if ($Local) {
        'import pathlib,sys; expected=pathlib.Path(sys.argv[1]).resolve(); actual=pathlib.Path(sys.prefix).resolve(); raise SystemExit(0 if actual == expected and sys.prefix != sys.base_prefix and sys.version_info[:2] in ((3,12),(3,13)) else 1)'
    } else {
        'import sys; raise SystemExit(0 if sys.version_info[:2] in ((3,12),(3,13)) else 1)'
    }
    $arguments = @($Prefix) + @('-c', $probe)
    if ($Local) { $arguments += $environment }
    try {
        & $Command @arguments *> $null
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Find-CompatiblePython {
    $candidates = @(
        @{ Name = 'py.exe'; Prefix = @('-3.13') },
        @{ Name = 'py.exe'; Prefix = @('-3.12') },
        @{ Name = 'python3'; Prefix = @() },
        @{ Name = 'python'; Prefix = @() }
    )
    foreach ($candidate in $candidates) {
        $command = Get-Command $candidate.Name -ErrorAction SilentlyContinue
        if ($command -and (Test-Python $command.Source $candidate.Prefix)) {
            return @{ Command = $command.Source; Prefix = $candidate.Prefix }
        }
    }
    throw 'Python 3.12 ou 3.13 est requis pour creer backend/.venv.'
}

function Get-InventoryHash {
    $inventory = & $localPython -m pip freeze --all 2>$null
    if ($LASTEXITCODE -ne 0) { return $null }
    $bytes = [Text.Encoding]::UTF8.GetBytes(($inventory -join "`n"))
    return Get-BytesSha256 $bytes
}

try {
    if (-not (Test-Path -LiteralPath $backend -PathType Container)) {
        throw "Repertoire backend introuvable : $backend"
    }
    if ($requirements.Count -eq 0) { throw 'Aucun fichier requirements*.txt trouve.' }
    Assert-PhysicalDirectory $environment 'backend/.venv'
    $requirementsHash = Get-ContentSha256 $requirements
    $localReady = Test-Python $localPython -Local
    $stamp = Read-BootstrapStamp $stampPath
    $inventoryHash = if ($localReady) { Get-InventoryHash } else { $null }
    $pipReady = $false
    if ($localReady) {
        & $localPython -m pip check *> $null
        $pipReady = $LASTEXITCODE -eq 0
    }
    $ready = $localReady -and $pipReady -and $stamp -and
        $stamp.schema -eq 1 -and $stamp.requirementsSha256 -eq $requirementsHash -and
        $stamp.inventorySha256 -eq $inventoryHash
    if ($ready) {
        if (-not $QuietIfReady) { Write-Host '[bootstrap backend] environnement deja conforme.' }
        return
    }

    $reason = if (-not (Test-Path $environment)) { 'absent' } elseif (-not $localReady) {
        'inexploitable'
    } elseif ($stamp -and $stamp.requirementsSha256 -ne $requirementsHash) {
        'requirements modifies'
    } else { 'dependances incoherentes' }
    Write-Host "[bootstrap backend] synchronisation ($reason)..." -ForegroundColor Cyan
    if (-not $localReady -or ($stamp -and $stamp.requirementsSha256 -ne $requirementsHash)) {
        $creator = Find-CompatiblePython
        $arguments = @($creator.Prefix) + @('-m', 'venv')
        if (Test-Path $environment) { $arguments += '--clear' }
        $arguments += $environment
        & $creator.Command @arguments
        if ($LASTEXITCODE -ne 0) { throw "creation du virtualenv echouee ($LASTEXITCODE)" }
    }
    if (-not (Test-Python $localPython -Local)) { throw 'virtualenv cree mais inexploitable' }
    & $localPython -m pip install --disable-pip-version-check --no-input -r (Join-Path $backend 'requirements-dev.txt')
    if ($LASTEXITCODE -ne 0) { throw "installation pip echouee ($LASTEXITCODE)" }
    & $localPython -m pip check
    if ($LASTEXITCODE -ne 0) { throw "pip check a refuse l'environnement ($LASTEXITCODE)" }
    $inventoryHash = Get-InventoryHash
    if (-not $inventoryHash) { throw "inventaire pip illisible" }
    Write-BootstrapStamp $stampPath @{
        schema = 1; requirementsSha256 = $requirementsHash; inventorySha256 = $inventoryHash
    }
    Write-Host "[bootstrap backend] pret : $localPython" -ForegroundColor Green
} catch {
    throw "[bootstrap backend] ECHEC : $($_.Exception.Message)"
}
