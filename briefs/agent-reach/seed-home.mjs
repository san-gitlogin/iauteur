// Seed the CLEAN Claude Code config the agent take runs under: <rec-root>/_ar-home/.claude.
//   node briefs/agent-reach/seed-home.mjs ar-agent        (run from the NORMAL shell, before take.ps1)
// Why: the owner's own config carries private skills and connectors that must not reach a public
// video. The clean home holds only a copy of the login and the onboarding flags, so the take shows
// what a fresh install shows. take.ps1 points both USERPROFILE and CLAUDE_CONFIG_DIR at it, so a
// skill Agent Reach installs into ~/.claude/skills is the one this Claude actually loads.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const ROOT = process.env.IAUTEUR_REC_ROOT;
if (!ROOT) { console.error('set IAUTEUR_REC_ROOT to the recording workspace root'); process.exit(1); }
const real = os.homedir();
const H = path.join(ROOT, '_ar-home', '.claude');
fs.mkdirSync(H, {recursive: true});
const src = JSON.parse(fs.readFileSync(path.join(real, '.claude.json'), 'utf8'));
const drop = ['projects', 'mcpServers', 'githubRepoPaths', 'skillUsage', 'pluginUsage', 'claudeAiMcpEverConnected'];
const clean = Object.fromEntries(Object.entries(src).filter(([k]) => !drop.includes(k)));
clean.projects = {};
for (const w of process.argv.slice(2)) {
  const ws = path.join(ROOT, w);
  for (const k of new Set([ws, ws.split(path.sep).join('/')]))
    clean.projects[k] = {hasTrustDialogAccepted: true, hasCompletedProjectOnboarding: true, allowedTools: []};
}
fs.writeFileSync(path.join(H, '.claude.json'), JSON.stringify(clean, null, 2));
// The login itself. Never printed, never committed: the recording home is outside the repo.
const cred = path.join(real, '.claude', '.credentials.json');
if (fs.existsSync(cred)) fs.copyFileSync(cred, path.join(H, '.credentials.json'));
else console.error('no .credentials.json in the real config — the take will ask to log in');
// claude.ai-synced skills are listed by name in any session, clean home or not; some are personal.
const synced = ['docs', 'pptx', 'xlsx', 'docx', 'pdf', 'itr-filing-assistant', 'spec-driven-development', 'agent-prompting',
  'law-entrance-exam-answerer', 'remotion-component-design', 'release-notes-observations', 'morning', 'skill-creator',
  'import-memory', 'google-workspace'];
fs.writeFileSync(path.join(H, 'settings.json'), JSON.stringify({autoUpdatesChannel: 'latest',
  skipDangerousModePermissionPrompt: true, effortLevel: 'medium',
  skillOverrides: Object.fromEntries(synced.flatMap((n) => [[n, 'off'], [`anthropic-skills:${n}`, 'off']]))}, null, 2));
console.log('seeded the clean Claude home; trusted:', process.argv.slice(2).join(', '));
