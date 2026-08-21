#!/usr/bin/env node
// PUBLISH SAFETY GATE — run BEFORE any push. This repo is PUBLIC.
//
// Why this exists (2026-08-21): a session committed and pushed docs naming an external
// drive by letter and saying the owner's un-published renders live on it. No credential
// leaked, but nothing was checked either — the push happened with no inspection step at
// all. Owner: *"its a public repo dude ... pushing needs thorough attention and
// inspection before any git actions."*
//
// (The first run of this guard flagged this very comment, because the original version
// quoted the offending path verbatim. Left as a note: a guard that spells out the thing
// it forbids is the leak. Describe it, never quote it.)
//
// This repo's own philosophy: a rule written only in prose gets forgotten by the next
// session; a rule with a guard behind it cannot be. So this is the guard.
//
// It NEVER prints a detected secret value. It reports rule + file:line + a redacted
// excerpt, so the output itself is safe to paste anywhere.
//
// Usage:
//   node scripts/check-publish-safety.mjs                 # staged changes (pre-commit)
//   node scripts/check-publish-safety.mjs --range a..b    # commits not yet pushed
//   node scripts/check-publish-safety.mjs --tracked       # every tracked file (audit)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';

const args = process.argv.slice(2);
const mode = args.includes('--tracked') ? 'tracked' : args.includes('--range') ? 'range' : 'staged';
const range = mode === 'range' ? args[args.indexOf('--range') + 1] : null;

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 28 });

// ── Secrets taken from the LOCAL .env, matched by VALUE ────────────────────────────
// The strongest possible check: does anything about to be published contain a string
// that is a secret on this machine? Values are loaded but never echoed.
const parseEnv = (p) => {
  const out = {};
  if (!fs.existsSync(p)) return out;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = /^\s*#?\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
};

const envSecrets = [];
{
  const real = parseEnv('.env');
  // `.env.example` is the TRACKED template. Any value identical to its template value is
  // a shipped default, not a secret — that is what cleared IAUTEUR_CHANNEL_LOGO
  // (`img:channel_logo.png`, a filename CLAUDE.md deliberately documents), the Azure API
  // version, and an unset API key still sitting at its placeholder. This comparison is
  // the whole false-positive story: it is automatic and needs no hand-maintained list.
  const template = parseEnv('.env.example');
  for (const [key, val] of Object.entries(real)) {
    if (!val || val === template[key]) continue;
    if (/^[\d.]+$/.test(val)) continue;                 // 4000, 0.7, 300
    const isIdentity = /CHANNEL|HANDLE|BRAND/i.test(key);
    // Identity strings are short AND must never be published — that is the entire point
    // of keeping brand identity out of a public repo. Everything else needs real length
    // before a substring match means anything.
    if (val.length >= (isIdentity ? 3 : 12)) envSecrets.push({ key, val });
  }
}

// ── Identity strings, DERIVED at runtime ──────────────────────────────────────────
// Never hardcode the owner's name or channel here — a guard that contains the secret
// it is guarding is itself the leak. These come from the machine and the gitignored
// .env, so this file stays publishable.
const identity = [];
{
  const add = (v, label) => {
    const s = String(v ?? '').trim();
    if (s.length >= 4 && !/^(user|users|admin|root|home|guest|runner|ubuntu|node|app|deploy|me|dev|test)$/i.test(s))
      identity.push({ val: s, label });
  };
  try { add(os.userInfo().username, 'your OS username'); } catch {}
  for (const k of ['user.name', 'user.email']) {
    try {
      const v = execFileSync('git', ['config', '--get', k], { encoding: 'utf8' }).trim();
      add(v, `git ${k}`);
      if (k === 'user.email' && v.includes('@')) add(v.split('@')[0].replace(/^\d+\+/, ''), 'git email local-part');
    } catch {}
  }
}

const GENERIC_HOME = /^(user|users|me|dev|deploy|admin|root|guest|ubuntu|runner|node|app|alice|bob|ada|foo|bar|someone|yourname|youruser)$/i;
const FAKE_MAIL = /@(example|acme|mail|test|foo|bar|invalid|localhost|sample|demo)\./i;
const PLACEHOLDER = /(\.\.\.|…|<[^>]{1,24}>|\$\{?[A-Z_]+\}?|%[A-Z_]+%|USERNAME|USER|youruser|example|test|dummy|placeholder)/i;

const RULES = [
  { id: 'PRIVATE_KEY', sev: 'BLOCK',
    re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g,
    why: 'a private key block' },
  { id: 'API_KEY_SHAPE', sev: 'BLOCK',
    re: /\b(?:sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{20,}|gho_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,})\b/g,
    why: 'a token/API-key shaped string' },
  { id: 'BEARER', sev: 'BLOCK',
    re: /\b(?:Bearer|Authorization:)\s+[A-Za-z0-9._~+/=-]{20,}/g,
    why: 'a bearer credential' },
  { id: 'EMAIL', sev: 'BLOCK',
    re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    why: 'an email address',
    // Fixture identities (ada@acme.io, you@mail.com) are sample data in showcase specs
    // and component examples — they are meant to be on screen.
    ok: (h) => FAKE_MAIL.test(h) || /@(anthropic\.com|pypi\.org|astral\.sh)\b/i.test(h) },
  { id: 'HOME_PATH', sev: 'BLOCK',
    re: /(?:[A-Za-z]:[\\/]+Users|\/c\/Users|\/Users|\/home)[\\/]+[A-Za-z0-9._-]+/g,
    why: 'a real home directory (identifies the machine + user)',
    // /home/user and /home/deploy are teaching content in a Linux course, not disclosure.
    ok: (h) => { const n = h.split(/[\\/]/).pop() ?? ''; return GENERIC_HOME.test(n) || PLACEHOLDER.test(n); } },
  { id: 'FOREIGN_DRIVE', sev: 'BLOCK',
    re: /\b[D-Zd-z]:[\\/][A-Za-z0-9._\\/-]{2,}/g,
    why: 'a machine-specific drive path — broken on any other machine, and it discloses local layout',
    // `/^\d\d:\d\d/` is a timestamp regex, not a path. Escape sequences give it away.
    ok: (h) => /^[A-Za-z]:[\\/]+(?:\.\.\.|…|<)/.test(h) || /\\[dswbnrtDSWB]/.test(h) },
];

// sha256 digests from public package indexes are legitimate course content.
const ALLOW_LINE = [/\bsha256:/i, /files\.pythonhosted\.org/i];

const findings = [];
const scanText = (file, text) => {
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (ALLOW_LINE.some((r) => r.test(line))) return;
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      for (const m of line.matchAll(rule.re)) {
        if (rule.ok?.(m[0])) continue;
        findings.push({ file, line: i + 1, id: rule.id, sev: rule.sev, why: rule.why, hit: redact(m[0]) });
      }
    }
    for (const { key, val } of envSecrets) {
      if (line.includes(val))
        findings.push({ file, line: i + 1, id: `ENV:${key}`, sev: 'BLOCK',
                        why: `the value of ${key} from your local .env`, hit: '<redacted>' });
    }
    // Plain case-insensitive substring — no regex, so no escaping to get wrong. Identity
    // strings are >=4 chars and distinctive enough that substring matching is right here.
    const lower = line.toLowerCase();
    for (const { val, label } of identity) {
      if (lower.includes(val.toLowerCase()))
        findings.push({ file, line: i + 1, id: 'IDENTITY', sev: 'BLOCK',
                        why: `${label} — links this public repo to you personally`, hit: '<redacted>' });
    }
  });
};

const redact = (s) => (s.length <= 12 ? s : `${s.slice(0, 6)}…${s.slice(-4)} (${s.length} chars)`);

// ── Gather content ────────────────────────────────────────────────────────────────
let scanned = 0;
if (mode === 'tracked') {
  for (const f of git('ls-files', '-z').split('\0').filter(Boolean)) {
    if (!fs.existsSync(f)) continue;
    const buf = fs.readFileSync(f);
    if (buf.includes(0)) continue; // binary
    scanText(f, buf.toString('utf8'));
    scanned++;
  }
} else {
  const diffArgs = mode === 'range'
    ? ['diff', '--unified=0', range]
    : ['diff', '--cached', '--unified=0'];
  const diff = git(...diffArgs);
  let file = '?';
  for (const line of diff.split(/\r?\n/)) {
    const fm = /^\+\+\+ b\/(.*)$/.exec(line);
    if (fm) { file = fm[1]; scanned++; continue; }
    if (line.startsWith('+') && !line.startsWith('+++')) scanText(file, line.slice(1));
  }
}

// ── Report ────────────────────────────────────────────────────────────────────────
const label = mode === 'tracked' ? 'every tracked file' : mode === 'range' ? `range ${range}` : 'staged changes';
if (!findings.length) {
  console.log(`✓ PUBLISH SAFETY — clean (${label}, ${scanned} file${scanned === 1 ? '' : 's'} scanned)`);
  process.exit(0);
}
const blocks = findings.filter((f) => f.sev === 'BLOCK');
console.error(`\n✗ PUBLISH SAFETY — ${findings.length} finding(s) in ${label}\n`);
for (const f of findings) console.error(`  [${f.sev}] ${f.id}  ${f.file}:${f.line}\n         ${f.why}\n         found: ${f.hit}`);
console.error(`\nThis repo is PUBLIC. Fix these before pushing — do not --no-verify past them.`);
console.error(`If a finding is a false positive, add it to ALLOW_LINE or a rule's ok() in ${'scripts/check-publish-safety.mjs'}, with a comment saying why.\n`);
process.exit(blocks.length ? 1 : 0);
