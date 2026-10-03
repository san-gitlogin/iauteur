# Record one take from demos/<slug>.json in a freshly wiped workspace.
#   powershell -File briefs/agent-reach/take.ps1 ar-doctor
#   powershell -File briefs/agent-reach/take.ps1 ar-install -Fresh     (empty venv: the install is filmed for real)
#   powershell -File briefs/agent-reach/take.ps1 ar-agent2 -Skill      (the agent gets Agent Reach's skill file first)
#
# Everything the take touches lives under IAUTEUR_REC_ROOT: a recording HOME (so the tools' config,
# the Reddit credential and the Claude config never touch the real profile), the venv that holds
# Agent Reach and its backends, and the two X cookie values in a file that is never committed.
param([Parameter(Mandatory = $true)][string]$Slug, [switch]$Fresh, [switch]$Skill)
$R = $env:IAUTEUR_REC_ROOT
if (-not $R) { throw 'set IAUTEUR_REC_ROOT to the recording workspace root' }
Set-Location (Resolve-Path "$PSScriptRoot\..\..").Path

$ws = Join-Path $R $Slug
if (Test-Path $ws) { Remove-Item -Recurse -Force $ws }

# The authoring session's own Claude variables must not reach a `claude` started inside the take.
Get-ChildItem Env: | Where-Object { $_.Name -like 'CLAUDE*' } | ForEach-Object { Remove-Item "Env:$($_.Name)" }

# NOTHING UNDER THE REAL PROFILE MAY BE ON PATH. An agent take ran `which` for a tool that was not
# installed, the shell printed the whole PATH, and the operator's user name was on screen in a dozen
# entries (2026-10-03). The recorder's identity guard reads USERPROFILE, which this script redirects,
# so it did not see it. So: claude is copied to the tools folder beside the recording root, every PATH
# entry under the real profile is dropped, and VS Code keeps its server (which it adds to PATH) there too.
$realHome = $env:USERPROFILE
$tools = Join-Path (Split-Path $R) 'tools'
$env:UV_PYTHON_INSTALL_DIR = Join-Path $tools 'python'
$claudeSrc = Join-Path $realHome '.local\bin\claude.exe'
$claudeDir = Join-Path $tools 'claude'
if (Test-Path $claudeSrc) {
  New-Item -ItemType Directory -Force $claudeDir | Out-Null
  $dst = Join-Path $claudeDir 'claude.exe'
  if (-not (Test-Path $dst) -or (Get-Item $dst).Length -ne (Get-Item $claudeSrc).Length) { Copy-Item $claudeSrc $dst -Force }
}
$env:VSCODE_CLI_DATA_DIR = Join-Path $tools 'vscode\cli-data'

$recHome = Join-Path $R '_ar-home'
$env:USERPROFILE = $recHome; $env:HOME = $recHome
$env:CLAUDE_CONFIG_DIR = Join-Path $recHome '.claude'
# Claude Code must not install or wake its editor extension inside the recorded window.
$env:CLAUDE_CODE_IDE_SKIP_AUTO_INSTALL = '1'
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
$kept = ($env:PATH -split ';') | Where-Object { $_ -and -not $_.StartsWith($realHome, [System.StringComparison]::OrdinalIgnoreCase) }
$env:PATH = (@("$venv\Scripts", $claudeDir) + $kept) -join ';'

$secrets = Join-Path $R '_ar-secrets.env'
if (Test-Path $secrets) {
  Get-Content $secrets | ForEach-Object { $k, $v = $_ -split '=', 2; if ($k -and $v) { Set-Item "Env:$k" $v } }
}

# THE SKILL FILE IS HOW AN AGENT KNOWS TO TRY A CHANNEL THE DOCTOR HIDES. Without it, an agent trusted
# the doctor command (which never live-checks X or Reddit and so never lists them as available) and
# answered for YouTube only. With -Skill the take starts the way the project intends: the English skill
# installed where Claude Code loads skills, and the X cookies saved through the tool's own command. Both
# run off camera because they print the home path; the cookie values go in on stdin and are never echoed.
if ($Skill) {
  $env:AGENT_REACH_LANG = 'en'
  if ($env:TWITTER_AUTH_TOKEN -and $env:TWITTER_CT0) {
    "auth_token=$($env:TWITTER_AUTH_TOKEN); ct0=$($env:TWITTER_CT0)" | agent-reach configure twitter-cookies | Out-Null
  }
  agent-reach skill --install | Out-Null
}

node scripts/record.mjs "demos/$Slug.json" 2>&1 | Where-Object { $_ -notmatch 'DEP0190|trace-deprecation' }
