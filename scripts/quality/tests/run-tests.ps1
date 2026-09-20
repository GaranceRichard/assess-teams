param([string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path)

$ErrorActionPreference = 'Stop'
$hostExecutable = (Get-Process -Id $PID).Path
$lineChecker = Join-Path $Root 'scripts\quality\check-source-lines.ps1'
$secretChecker = Join-Path $Root 'scripts\quality\check-secrets.ps1'
$docChecker = Join-Path $Root 'scripts\quality\check-documentation.ps1'
$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$testRoot = Join-Path $tempBase ("assess-teams-quality-" + [guid]::NewGuid())
$failures = @()

function Invoke-ExpectedExit {
    param(
        [string]$Name,
        [string]$Script,
        [string[]]$Arguments,
        [int]$Expected
    )
    $output = & $hostExecutable -NoProfile -File $Script @Arguments 2>&1
    if ($LASTEXITCODE -ne $Expected) {
        $script:failures += "$Name (attendu $Expected, obtenu $LASTEXITCODE): $output"
    }
}

function Set-LineFixture {
    param([string]$Path, [int]$LineCount)
    $parent = Split-Path $Path -Parent
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
    1..$LineCount | ForEach-Object { "line $_" } | Set-Content -LiteralPath $Path
}

function Invoke-LineCheck {
    param(
        [string]$Name,
        [string]$TestDirectory,
        [int]$Expected,
        [string[]]$ExpectedOutput
    )
    $output = & $hostExecutable -NoProfile -File $lineChecker -Root $TestDirectory 2>&1
    $actual = $LASTEXITCODE
    $text = $output -join "`n"
    if ($actual -ne $Expected) {
        $script:failures += "$Name (attendu $Expected, obtenu $actual): $text"
    }
    foreach ($fragment in $ExpectedOutput) {
        if (-not $text.Contains($fragment)) {
            $script:failures += "$Name (sortie absente '$fragment'): $text"
        }
    }
}

try {
    New-Item -ItemType Directory -Path $testRoot -Force | Out-Null
    $case199 = Join-Path $testRoot 'case-199'
    Set-LineFixture (Join-Path $case199 'sample-199.py') 199
    Invoke-LineCheck '199 lignes acceptees' $case199 0 @(
        'PASS - No source file exceeds 200 lines.'
    )

    $case200 = Join-Path $testRoot 'case-200'
    Set-LineFixture (Join-Path $case200 'sample-200.py') 200
    Invoke-LineCheck '200 lignes acceptees' $case200 0 @(
        'PASS - No source file exceeds 200 lines.'
    )

    $case201 = Join-Path $testRoot 'case-201'
    Set-LineFixture (Join-Path $case201 'sample-201.py') 201
    Invoke-LineCheck '201 lignes refusees' $case201 1 @(
        'sample-201.py : 201 lines'
    )

    $caseMultiple = Join-Path $testRoot 'case-multiple'
    Set-LineFixture (Join-Path $caseMultiple 'first.py') 201
    Set-LineFixture (Join-Path $caseMultiple 'nested/second.ts') 205
    Invoke-LineCheck 'plusieurs fichiers refuses' $caseMultiple 1 @(
        'first.py : 201 lines',
        'nested/second.ts : 205 lines',
        '2 files exceed the maximum allowed size of 200 lines.'
    )

    $caseExcluded = Join-Path $testRoot 'case-excluded'
    Set-LineFixture (Join-Path $caseExcluded 'sample.py') 1
    Set-LineFixture (Join-Path $caseExcluded 'package-lock.json') 201
    Invoke-LineCheck 'lock file exclu' $caseExcluded 0 @(
        'PASS - No source file exceeds 200 lines.'
    )

    $source = Join-Path $testRoot 'sample.py'

    Set-Content -LiteralPath $source -Value 'safe_value = "example"'
    Invoke-ExpectedExit 'contenu sur accepte' $secretChecker @('-Root', $testRoot) 0

    $fakeCredential = ('AKIA' + ('A' * 16))
    Set-Content -LiteralPath $source -Value "credential = '$fakeCredential'"
    Invoke-ExpectedExit 'credential refuse' $secretChecker @('-Root', $testRoot) 1

    Invoke-ExpectedExit 'README absent refuse' $docChecker @(
        '-Root', $testRoot, '-ChangedFilesList', 'backend/app.py'
    ) 1
    Invoke-ExpectedExit 'README present accepte' $docChecker @(
        '-Root', $testRoot, '-ChangedFilesList', 'backend/app.py;README.md'
    ) 0
} finally {
    $resolvedTestRoot = [IO.Path]::GetFullPath($testRoot)
    if ($resolvedTestRoot.StartsWith($tempBase) -and (Test-Path -LiteralPath $resolvedTestRoot)) {
        Remove-Item -LiteralPath $resolvedTestRoot -Recurse -Force
    }
}

if ($failures.Count -gt 0) {
    Write-Host '[FAIL] Tests du socle qualite :' -ForegroundColor Red
    $failures | ForEach-Object { Write-Host "  - $_" }
    exit 1
}

Write-Host '[PASS] Tests positifs et negatifs du socle qualite.' -ForegroundColor Green
exit 0
