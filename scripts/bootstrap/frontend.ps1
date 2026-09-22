param(
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path,
    [string]$NpmCommand,
    [switch]$QuietIfReady
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'common.ps1')

try {
    Initialize-NodeDependencies -WorkingDirectory (Join-Path $Root 'frontend') `
        -ExecutableName 'vite' -Label 'frontend' -NpmCommand $NpmCommand -QuietIfReady:$QuietIfReady
} catch {
    throw "[bootstrap frontend] ECHEC : $($_.Exception.Message)"
}
