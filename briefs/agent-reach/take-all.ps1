# Record several takes in a row; each one's log tail goes to <rec-root>/_ar-logs/<slug>.log.
#   powershell -File briefs/agent-reach/take-all.ps1 ar-repo ar-install:fresh ar-read
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Takes)
$R = $env:IAUTEUR_REC_ROOT
$logs = Join-Path $R '_ar-logs'; New-Item -ItemType Directory -Force $logs | Out-Null
foreach ($t in $Takes) {
  $slug, $mode = $t -split ':', 2
  $a = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "$PSScriptRoot\take.ps1", $slug)
  if ($mode -eq 'fresh') { $a += '-Fresh' }
  if ($mode -eq 'skill') { $a += '-Skill' }
  $out = & powershell @a 2>&1 | ForEach-Object { "$_" }
  $out | Set-Content -Encoding utf8 (Join-Path $logs "$slug.log")
  $verdict = if ($out -match '^OK ') { 'OK' } else { 'FAILED' }
  "$slug $verdict"
}
