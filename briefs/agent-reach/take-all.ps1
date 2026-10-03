# Record several takes in a row; each one's log goes to <rec-root>/_ar-logs/<slug>.log.
#   powershell -File briefs/agent-reach/take-all.ps1 ar-repo ar-install:fresh ar-agent2:skill
#
# Each take runs as its own process with its output sent to a FILE, and this script waits for that
# process only. Piping the output instead made the batch wait for every handle to close, and a VS Code
# server left behind by one take kept the pipe open: the next take never started (2026-10-03, seven
# minutes lost before anyone noticed). The leftover server is also stopped after each take.
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Takes)
$R = $env:IAUTEUR_REC_ROOT
$logs = Join-Path $R '_ar-logs'; New-Item -ItemType Directory -Force $logs | Out-Null
foreach ($t in $Takes) {
  $slug, $mode = $t -split ':', 2
  $a = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$PSScriptRoot\take.ps1`"", $slug)
  if ($mode -eq 'fresh') { $a += '-Fresh' }
  if ($mode -eq 'skill') { $a += '-Skill' }
  $log = Join-Path $logs "$slug.log"
  $p = Start-Process powershell -ArgumentList $a -NoNewWindow -PassThru -RedirectStandardOutput $log -RedirectStandardError "$log.err"
  $p.WaitForExit()
  Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'cli-data\\serve-web\\[0-9a-f]+\\' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  $verdict = if (Select-String -Path $log -Pattern '^OK ' -Quiet) { 'OK' } else { 'FAILED' }
  "$slug $verdict"
}
