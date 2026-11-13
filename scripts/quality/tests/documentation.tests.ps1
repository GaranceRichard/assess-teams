param([string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path)

$ErrorActionPreference = 'Stop'
$hostExecutable = (Get-Process -Id $PID).Path
$checker = Join-Path $Root 'scripts/quality/check-documentation.ps1'
$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$fixture = Join-Path $tempBase ('assess-documentation-' + [guid]::NewGuid())
$oldBase = $env:QUALITY_DIFF_BASE
$failures = @()
$gitVariables = @(& git -C $Root rev-parse --local-env-vars)
$savedGitEnvironment = @{}
$hostHead = (& git -C $Root rev-parse HEAD) -join "`n"
$hostStatus = (& git -C $Root status --porcelain) -join "`n"
$hostConfig = (& git -C $Root config --local --list) -join "`n"

function Write-Fixture {
    param([string]$Path, [string]$Content)
    $full = Join-Path $fixture $Path
    New-Item -ItemType Directory -Force (Split-Path $full) | Out-Null
    [IO.File]::WriteAllText($full, $Content, [Text.UTF8Encoding]::new($false))
}

function New-Trace {
    param([string]$File = 'backend/app.py')
    return @"
## Préparation du changement

- Périmètre : corriger le contrat de lecture de l'organisation active.
- Objectif : conserver les résultats visibles dans le périmètre autorisé.
- Effets attendus : refuser les lectures hors de l'organisation courante.
- Risques : une ancienne session pourrait conserver un rattachement périmé.
- Vérification : tester le succès local et le refus sans fuite de données.
- Fichier : ``$File``
"@
}

function Assert-Documentation {
    param([string]$Name, [string]$Files, [int]$Expected)
    $output = & $hostExecutable -NoProfile -File $checker -Root $fixture -ChangedFilesList $Files 2>&1
    if ($LASTEXITCODE -ne $Expected) {
        $script:failures += "$Name : attendu $Expected, obtenu $LASTEXITCODE : $output"
    } else {
        Write-Host "[PASS] $Name"
    }
}

try {
    # Hooks export repository/index locations. -C alone does not isolate a fixture.
    foreach ($name in $gitVariables) {
        if (Test-Path "Env:$name") {
            $savedGitEnvironment[$name] = (Get-Item "Env:$name").Value
        }
        Remove-Item "Env:$name" -ErrorAction SilentlyContinue
    }
    New-Item -ItemType Directory $fixture | Out-Null
    & git -C $fixture init -q
    & git -C $fixture config user.name 'Documentation tests'
    & git -C $fixture config user.email 'documentation@example.invalid'
    & git -C $fixture config core.autocrlf false
    Write-Fixture 'backend/app.py' '# initial'
    Write-Fixture 'README.md' '# Produit initial'
    Write-Fixture 'docs/architecture/old.md' (New-Trace)
    & git -C $fixture add .
    & git -C $fixture -c core.hooksPath=not-installed commit -qm 'baseline'
    $env:QUALITY_DIFF_BASE = (& git -C $fixture rev-parse HEAD).Trim()

    Assert-Documentation 'Changement applicatif sans trace refuse' 'backend/app.py' 1
    Write-Fixture 'docs/architecture/change.md' (New-Trace)
    Assert-Documentation 'Architecture pertinente sans README acceptee' 'backend/app.py;docs/architecture/change.md' 0
    Write-Fixture 'README.md' '# Produit et parcours de découverte améliorés'
    Assert-Documentation 'Accueil seul accepte sans campagne applicative' 'README.md' 0
    Assert-Documentation 'Accueil visible avec trace pertinente accepte' 'backend/app.py;README.md;docs/architecture/change.md' 0
    Assert-Documentation 'README cosmetique seul ne justifie pas le code' 'backend/app.py;README.md' 1
    Assert-Documentation 'Prose seule acceptee' 'docs/architecture/change.md' 0

    Write-Fixture 'docs/architecture/empty.md' ''
    Assert-Documentation 'Document vide refuse' 'backend/app.py;docs/architecture/empty.md' 1
    Write-Fixture 'docs/architecture/empty.md' '# Documentation mise à jour pour le gate'
    Assert-Documentation 'Texte artificiel sans preparation refuse' 'backend/app.py;docs/architecture/empty.md' 1
    $placeholder = (New-Trace).Replace('corriger le contrat de lecture de l''organisation active.', 'TODO compléter plus tard ce document de préparation.')
    Write-Fixture 'docs/architecture/empty.md' $placeholder
    Assert-Documentation 'Champs TODO refuses' 'backend/app.py;docs/architecture/empty.md' 1
    Write-Fixture 'docs/architecture/empty.md' ((New-Trace) -replace '(?m)^- Risques.*$', '- Risques : aucun')
    Assert-Documentation 'Champ vide de sens refuse' 'backend/app.py;docs/architecture/empty.md' 1
    Write-Fixture 'docs/architecture/empty.md' (New-Trace 'backend/other.py')
    Assert-Documentation 'Autre fichier technique ne couvre pas le lot' 'backend/app.py;docs/architecture/empty.md' 1
    Assert-Documentation 'Ancienne preparation inchangee refusee' 'backend/app.py;docs/architecture/old.md' 1
    Write-Fixture 'docs/architecture/old.md' ((New-Trace) + "`nCommentaire ajouté après les travaux.")
    Assert-Documentation 'Ancienne preparation avec ajout cosmetique refusee' 'backend/app.py;docs/architecture/old.md' 1
    Assert-Documentation 'Document supprime refuse' 'backend/app.py;docs/architecture/missing.md' 1
    Write-Fixture 'docs/arbitrary.md' (New-Trace)
    Assert-Documentation 'Emplacement non proprietaire refuse' 'backend/app.py;docs/arbitrary.md' 1
    Write-Fixture 'frontend/src/README.md' (New-Trace)
    Assert-Documentation 'Markdown runtime ne justifie pas le code' 'backend/app.py;frontend/src/README.md' 1
    Write-Fixture 'docs/backlog/tracking/pbis.md' (New-Trace)
    Assert-Documentation 'Statut de backlog seul refuse' 'backend/app.py;docs/backlog/tracking/pbis.md' 1

    Write-Fixture 'docs/quality/change.md' (New-Trace 'scripts/quality/gate.ps1')
    Assert-Documentation 'Script de validation documente accepte' 'scripts/quality/gate.ps1;docs/quality/change.md' 0
    Write-Fixture 'docs/architecture/wrong.md' (New-Trace 'scripts/quality/gate.ps1')
    Assert-Documentation 'Gate exige son domaine qualite' 'scripts/quality/gate.ps1;docs/architecture/wrong.md' 1
    Assert-Documentation 'Lot mixte exige toutes ses traces' 'backend/app.py;scripts/quality/gate.ps1;docs/architecture/change.md' 1
    Assert-Documentation 'Lot mixte couvert accepte' 'backend/app.py;scripts/quality/gate.ps1;docs/architecture/change.md;docs/quality/change.md' 0
    Assert-Documentation 'Configuration racine sans trace refusee' 'package.json' 1

    & git -C $fixture add docs/architecture/change.md
    Assert-Documentation 'Trace stagee acceptee' 'backend/app.py;docs/architecture/change.md' 0
    & git -C $fixture -c core.hooksPath=not-installed commit -qm 'trace'
    Assert-Documentation 'Trace commitee acceptee sur la base exacte' 'backend/app.py;docs/architecture/change.md' 0
} finally {
    $env:QUALITY_DIFF_BASE = $oldBase
    foreach ($name in $gitVariables) {
        Remove-Item "Env:$name" -ErrorAction SilentlyContinue
    }
    foreach ($name in $savedGitEnvironment.Keys) {
        Set-Item "Env:$name" -Value $savedGitEnvironment[$name]
    }
    $resolved = [IO.Path]::GetFullPath($fixture)
    if ($resolved.StartsWith($tempBase) -and (Test-Path -LiteralPath $resolved)) {
        Remove-Item -LiteralPath $resolved -Recurse -Force
    }
}

foreach ($name in $gitVariables) {
    $present = Test-Path "Env:$name"
    if ($present -ne $savedGitEnvironment.ContainsKey($name) -or
        ($present -and (Get-Item "Env:$name").Value -cne $savedGitEnvironment[$name])) {
        $failures += "Presence ou valeur de $name modifiee apres la fixture."
    }
}
$afterHead = (& git -C $Root rev-parse HEAD) -join "`n"
$afterStatus = (& git -C $Root status --porcelain) -join "`n"
$afterConfig = (& git -C $Root config --local --list) -join "`n"
if ($afterHead -cne $hostHead -or $afterStatus -cne $hostStatus -or $afterConfig -cne $hostConfig) {
    $failures += 'La fixture a modifie HEAD, index/checkout ou configuration du depot appelant.'
} else {
    Write-Host '[PASS] Depot appelant inchange : HEAD, index/checkout et configuration.'
}

if ($failures.Count) {
    $failures | ForEach-Object { Write-Host "[FAIL] $_" }
    exit 1
}
Write-Host '[PASS] Preparation documentaire : succes et vrais refus.'
exit 0
