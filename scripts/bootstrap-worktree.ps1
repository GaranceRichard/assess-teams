param([string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path)

$ErrorActionPreference = 'Stop'
Write-Host '[bootstrap worktree] preparation des runtimes locaux...' -ForegroundColor Cyan
& (Join-Path $PSScriptRoot 'bootstrap\root.ps1') -Root $Root -QuietIfReady
& (Join-Path $PSScriptRoot 'bootstrap\backend.ps1') -Root $Root -QuietIfReady
& (Join-Path $PSScriptRoot 'bootstrap\frontend.ps1') -Root $Root -QuietIfReady
Write-Host '[bootstrap worktree] runtimes locaux prets.' -ForegroundColor Green
