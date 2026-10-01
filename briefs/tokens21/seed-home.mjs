// Seed the CLEAN Claude Code config the takes run under (<rec-root>/_claude-home; rec-root comes from IAUTEUR_REC_ROOT).
// Why: the owner's own config carries private user skills and connectors that must not reach a
// public video. The clean home holds only a copy of the login and the onboarding flags, so every
// take shows what a fresh install shows. Workspaces listed here are marked trusted in BOTH
// config files (the recorder's pre-flight reads ~/.claude.json).
import fs from 'node:fs';
import os from 'node:os';
const ROOT = process.env.IAUTEUR_REC_ROOT;
if (!ROOT) { console.error('set IAUTEUR_REC_ROOT to the recording workspace root'); process.exit(1); }
const H = `${ROOT}/_claude-home`;
const WS = process.argv.slice(2);
const src = JSON.parse(fs.readFileSync(os.homedir() + '/.claude.json', 'utf8'));
const drop = ['projects', 'mcpServers', 'githubRepoPaths', 'skillUsage', 'pluginUsage', 'claudeAiMcpEverConnected'];
const clean = Object.fromEntries(Object.entries(src).filter(([k]) => !drop.includes(k)));
const trust = (cfg) => {
  cfg.projects ??= {};
  for (const w of WS) {
    const k = `${ROOT}/${w}`;
    cfg.projects[k] = {...(cfg.projects[k] ?? {}), hasTrustDialogAccepted: true, hasCompletedProjectOnboarding: true,
      allowedTools: cfg.projects[k]?.allowedTools ?? []};
  }
};
let cur = {};
try { cur = JSON.parse(fs.readFileSync(H + '/.claude.json', 'utf8')); } catch {}
const out = {...clean, projects: cur.projects ?? {}};
trust(out);
fs.writeFileSync(H + '/.claude.json', JSON.stringify(out, null, 2));
const user = JSON.parse(fs.readFileSync(os.homedir() + '/.claude.json', 'utf8'));
trust(user);
fs.writeFileSync(os.homedir() + '/.claude.json', JSON.stringify(user, null, 2));
// The owner's claude.ai account SYNCS its skills into every terminal session (docs: "Skills synced from
// claude.ai"), clean home or not, and /context lists them by name. Some are personal. Hide every synced
// skill with skillOverrides "off", which removes it from the listing entirely.
const synced = ['docs', 'pptx', 'xlsx', 'docx', 'pdf', 'itr-filing-assistant', 'spec-driven-development', 'agent-prompting',
  'law-entrance-exam-answerer', 'remotion-component-design', 'release-notes-observations', 'morning', 'skill-creator', 'import-memory'];
fs.writeFileSync(H + '/settings.json', JSON.stringify({autoUpdatesChannel: 'latest', skipDangerousModePermissionPrompt: true, effortLevel: 'medium',
  skillOverrides: Object.fromEntries(synced.flatMap((n) => [[n, 'off'], [`anthropic-skills:${n}`, 'off']]))}, null, 2));
console.log('seeded', H, 'trusted:', WS.join(', '));
