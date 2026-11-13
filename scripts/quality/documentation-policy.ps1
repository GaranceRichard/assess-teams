# Observable preparation, never a semantic or chronological attestation.
function Test-DocumentOwner {
    param([string]$Document, [string]$TechnicalFile)
    if ($TechnicalFile -match '^(scripts/quality(/|\.ps1$)|\.github/|\.githooks/)') {
        return $Document -match '^docs/quality/[^.][^\r\n]*\.md$'
    }
    return $Document -eq 'README.md' -or $Document -eq 'docs/development-environments.md' -or
        $Document -match '^docs/(architecture|quality|operations)/[^.][^\r\n]*\.md$' -or
        $Document -match '^docs/backlog/(source|planning)/[^.][^\r\n]*\.md$' -or
        $Document -eq 'docs/product/vision.md'
}

function Get-AddedDocumentation {
    param([string]$Root, [string]$Base, [string]$Document)
    if ($Document -match '(^|/)\.\.(/|$)' -or [IO.Path]::IsPathRooted($Document)) { return '' }
    $path = Join-Path $Root $Document
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { return '' }
    if ((Get-Item -LiteralPath $path).Attributes -band [IO.FileAttributes]::ReparsePoint) { return '' }
    $tracked = @(& git -C $Root ls-files -- $Document)
    if ($LASTEXITCODE -ne 0) { throw 'Lecture Git des documents impossible.' }
    if (-not $tracked.Count) { return Get-Content -LiteralPath $path -Raw -Encoding utf8 }
    $diff = @(& git -C $Root diff --no-ext-diff --no-textconv --unified=0 $Base -- $Document)
    if ($LASTEXITCODE -ne 0) { throw 'Diff documentaire impossible.' }
    return ($diff | Where-Object { $_ -match '^\+(?!\+\+)' } |
        ForEach-Object { $_.Substring(1) }) -join "`n"
}

function Test-Preparation {
    param([string]$Added, [string]$TechnicalFile)
    if (-not $Added) { return $false }
    $blocks = [regex]::Matches($Added, '(?ms)^## Préparation du changement[^\r\n]*\r?\n(.*?)(?=^## |\z)')
    foreach ($block in $blocks) {
        $body = $block.Groups[1].Value
        $valid = $true
        foreach ($field in @('Périmètre', 'Objectif', 'Effets attendus', 'Risques', 'Vérification')) {
            $match = [regex]::Match($body, "(?m)^- ${field} : (.+)$")
            $value = $match.Groups[1].Value.Trim()
            if ($value.Length -lt 25 -or ([regex]::Matches($value, '\p{L}{2,}')).Count -lt 4 -or
                $value -match '(?i)\b(TODO|TBD|placeholder|lorem ipsum)\b|à compléter') {
                $valid = $false
            }
        }
        $reference = '- Fichier : `' + $TechnicalFile + '`'
        if ($valid -and ($body -split '\r?\n' | ForEach-Object { $_.Trim() }) -ccontains $reference) {
            return $true
        }
    }
    return $false
}
