[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Package,
    [Parameter(Mandatory)][ValidatePattern('^[a-f0-9]{64}$')][string]$ManifestSha256,
    [Parameter(Mandatory)][ValidatePattern('^[a-f0-9]{40}$')][string]$Source,
    [switch]$IntegrityOnly
)
$ErrorActionPreference = 'Stop'
try {
    $root = (Resolve-Path -LiteralPath $Package).Path
    if ((Get-Item -LiteralPath $root).Attributes -band [IO.FileAttributes]::ReparsePoint) {
        throw 'Package link refused'
    }
    $manifestPath = Join-Path $root 'manifest.json'
    if ((Get-FileHash -LiteralPath $manifestPath -Algorithm SHA256).Hash.ToLowerInvariant() -cne $ManifestSha256) {
        throw 'External manifest SHA-256 mismatch'
    }
    $manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($manifest.format -ne 1 -or $manifest.product -cne 'assess-teams' -or
        $manifest.profile -cne 'REF-WIN-01' -or $manifest.sourceCommit -cne $Source) {
        throw 'Incomplete or inconsistent package identity'
    }
    if ($manifest.installable -cne $false -or $null -ne $manifest.runtime -or
        @($manifest.blockers).Count -ne 1 -or $manifest.blockers[0] -cne
        'I01: corrected standard Windows x64 cp313 runtime not qualified') {
        throw 'Unqualified runtime refused (I01)'
    }
    if (@($manifest.targetRequires).Count -ne 0) { throw 'Network/Node/Docker requirement refused' }
    if (-not $manifest.version -or $manifest.sourceTree -notmatch '^[a-f0-9]{40}$' -or
        @($manifest.sourceFiles).Count -eq 0 -or @($manifest.components).Count -ne 19) {
        throw 'Incomplete component or source provenance'
    }
    $actual = @(Get-ChildItem -LiteralPath $root -Recurse -Force)
    if (@($actual | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) {
        throw 'Package link refused'
    }
    $actualFiles = @($actual | Where-Object { -not $_.PSIsContainer } | ForEach-Object {
        $_.FullName.Substring($root.Length + 1).Replace('\', '/')
    } | Where-Object { $_ -cne 'manifest.json' } | Sort-Object)
    $declared = @($manifest.files | ForEach-Object { $_.path } | Sort-Object)
    if ($declared.Count -eq 0 -or
        @($declared | Select-Object -Unique).Count -ne $declared.Count -or
        ($actualFiles -join "`n") -cne ($declared -join "`n")) {
        throw 'Missing, duplicate or unexpected package file'
    }
    foreach ($entry in $manifest.files) {
        if ($entry.path -match '[\\:\x00-\x1f]' -or
            @($entry.path.Split('/') | Where-Object { $_ -in @('', '.', '..') }).Count) {
            throw 'Unsafe package path'
        }
        $path = Join-Path $root $entry.path
        if ((Get-Item -LiteralPath $path).Length -ne $entry.size -or
            (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant() -cne $entry.sha256) {
            throw 'Missing or altered package file'
        }
    }
    $required = @('LICENSE', 'NOTICE', 'REFUSED.txt', 'backend/manage.py',
        'backend/config/wsgi.py', 'backend/config/installation.schema.json',
        'web/manifest.json', 'python/requirements.txt', 'hosting/caddy/caddy.exe',
        'hosting/caddy/LICENSE', 'hosting/caddy/Go-LICENSE', 'hosting/caddy/manifest.json',
        'web/static/swagger-ui/NOTICE', 'verification/verify-package.ps1')
    foreach ($path in $required) {
        if ($path -cnotin $declared) { throw 'Required component missing' }
    }
    foreach ($entry in $manifest.sourceFiles) {
        $file = @($manifest.files | Where-Object { $_.path -ceq $entry.path })
        if ($file.Count -ne 1 -or $file[0].sha256 -cne $entry.sha256) {
            throw 'Source payload mismatch'
        }
    }
    if (-not $IntegrityOnly) { throw 'REFUSED: I01 runtime absent; package NOT INSTALLABLE' }
    Write-Host ('PASS partial integrity only: {0} files; I01 OPEN; NOT INSTALLABLE' -f $declared.Count)
    exit 0
} catch {
    Write-Error ('REFUS ' + $_.Exception.Message) -ErrorAction Continue
    exit 1
}
