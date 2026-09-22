param(
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path,
    [string]$NpmCommand,
    [switch]$QuietIfReady
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'common.ps1')

try {
    Initialize-NodeDependencies -WorkingDirectory $Root -ExecutableName 'concurrently' `
        -Label 'root' -NpmCommand $NpmCommand -QuietIfReady:$QuietIfReady
} catch {
    throw "[bootstrap root] ECHEC : $($_.Exception.Message)"
}
