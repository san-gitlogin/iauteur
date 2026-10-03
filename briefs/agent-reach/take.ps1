# Record one take from demos/<slug>.json in a freshly wiped workspace.
#   powershell -File briefs/agent-reach/take.ps1 ar-doctor
#   powershell -File briefs/agent-reach/take.ps1 ar-install -Fresh     (empty venv: the install is filmed for real)
#
# Everything the take touches lives under IAUTEUR_REC_ROOT: a recording HOME (so the tools' config,
# the Reddit credential and the Claude config never touch the real profile), the venv that holds
# Agent Reach and its backends, and the two X cookie values in a file that is never committed.
param([Parameter(Mandatory = $true)][string]$Slug, [switch]$Fresh)
$R = $env:IAUTEUR_REC_ROOT
if (-not $R) { throw 'set IAUTEUR_REC_ROOT to the recording workspace root' }
Set-Location (Resolve-Path "$PSScriptRoot\..\..").Path

$ws = Join-Path $R $Slug
if (Test-Path $ws) { Remove-Item -Recurse -Force $ws }

# The authoring session's own Claude variables must not reach a `claude` started inside the take.
Get-ChildItem Env: | Where-Object { $_.Name -like 'CLAUDE*' } | ForEach-Object { Remove-Item "Env:$($_.Name)" }

$recHome = Join-Path $R '_ar-home'
$env:USERPROFILE = $recHome; $env:HOME = $recHome
$env:CLAUDE_CONFIG_DIR = Join-Path $recHome '.claude'
$env:PYTHONUTF8 = '1'; $env:PYTHONIOENCODING = 'utf-8'

$venv = Join-Path $R 'agent-reach\venv'
if ($Fresh) {
  $venv = Join-Path $R '_ar-venv-fresh'
  if (Test-Path $venv) { Remove-Item -Recurse -Force $venv }
  uv venv --seed --python 3.12 $venv | Out-Null
  $state = Join-Path $recHome '.agent-reach'
  if (Test-Path $state) { Remove-Item -Recurse -Force $state }
}
$env:VIRTUAL_ENV = $venv
$env:PATH = "$venv\Scripts;$env:PATH"

$secrets = Join-Path $R '_ar-secrets.env'
if (Test-Path $secrets) {
  Get-Content $secrets | ForEach-Object { $k, $v = $_ -split '=', 2; if ($k -and $v) { Set-Item "Env:$k" $v } }
}

node scripts/record.mjs "demos/$Slug.json" 2>&1 | Where-Object { $_ -notmatch 'DEP0190|trace-deprecation' }
