#!/usr/bin/env node
// PUBLISH SAFETY GATE - run BEFORE any push. This repo is PUBLIC.
//
// Why this exists (2026-08-21): a session committed and pushed docs naming an external
// drive by letter and saying the owner's un-published renders live on it. No credential
// leaked, but nothing was checked either - the push happened with no inspection step at
// all. Owner: "its a public repo dude ... pushing needs thorough attention and
// inspection before any git actions."
//
// (The first run of this guard flagged its own header comment, because the original
// version quoted the offending path verbatim. Kept as a note: a guard that spells out
// the thing it forbids is the leak. Describe it, never quote it.)
//
// This repo's philosophy: a rule written only in prose gets forgotten by the next
// session; a rule with a guard behind it cannot be. So this is the guard.
//
// It NEVER prints a detected value. It reports rule + file:line + a redacted excerpt,
// so its own output is safe to paste anywhere.
//
// Usage:
//   node scripts/check-publish-safety.mjs                    # staged changes
//   node scripts/check-publish-safety.mjs --range a..b       # commits not yet pushed
//   node scripts/check-publish-safety.mjs --tracked          # every tracked file
//   ... --show-accepted                                      # include accepted findings
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';

const args = process.argv.slice(2);
const mode = args.includes('--tracked') ? 'tracked' : args.includes('--range') ? 'range' : 'staged';
const range = mode === 'range' ? args[args.indexOf('--range') + 1] : null;
const showAccepted = args.includes('--show-accepted');

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 28 });

// -- Secrets from the LOCAL .env, matched by VALUE --------------------------------
// The strongest check available: does anything about to be published contain a string
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
  // `.env.example` is the TRACKED template. A value identical to its template value is a
  // shipped default, not a secret. That single comparison cleared every false positive
  // in the first audit - the logo filename CLAUDE.md documents on purpose, the Azure API
  // version, and an API key still sitting at its placeholder - with no hand-kept list.
  const template = parseEnv('.env.example');
  for (const [key, val] of Object.entries(real)) {
    if (!val || val === template[key]) continue;
    if (/^[\d.]+$/.test(val)) continue; // 4000, 0.7, 300
    // Identity strings are short AND must never be published; that is the whole point of
    // keeping brand identity out of a public repo. Everything else needs real length
    // before a substring match means anything.
    const isIdentity = /CHANNEL|HANDLE|BRAND/i.test(key);
    if (val.length >= (isIdentity ? 3 : 12)) envSecrets.push({ key, val });
  }
}

// -- Identity strings, DERIVED at runtime ------------------------------------------
// Never hardcode the owner's name here: a guard containing the secret it guards is
// itself the leak. These come from the machine and the gitignored .env, so this file
// stays publishable.
const identity = [];
{
  const add = (v, label) => {
    const s = String(v ?? '').trim();
    if (s.length >= 4 && !/^(user|users|admin|root|home|guest|runner|ubuntu|node|app|deploy|me|dev|test)$/i.test(s))
      identity.push({ val: s.toLowerCase(), label });
  };
  try { add(os.userInfo().username, 'your OS username'); } catch { /* no userInfo */ }
  for (const k of ['user.name', 'user.email']) {
    try {
      const v = git('config', '--get', k).trim();
      add(v, `git ${k}`);
      if (k === 'user.email' && v.includes('@')) add(v.split('@')[0].replace(/^\d+\+/, ''), 'git email local-part');
    } catch { /* unset */ }
  }
}

const GENERIC_HOME = /^(user|users|me|dev|deploy|admin|root|guest|ubuntu|runner|node|app|alice|bob|ada|foo|bar|someone|yourname|youruser)$/i;
const FAKE_MAIL = /@(example|acme|mail|test|foo|bar|invalid|localhost|sample|demo)\./i;
const PLACEHOLDER = /(\.\.\.|\u2026|<[^>]{1,24}>|\$\{?[A-Z_]+\}?|%[A-Z_]+%|USERNAME|USER|youruser|example|test|dummy|placeholder)/i;
const REGEX_CTX = /RegExp\(|=~|\/\^|\$\/|\.test\(|\.match\(|\.replace\(\/|\.split\(\//;

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
    // Fixture identities are sample data in showcase specs and component examples -
    // they are meant to be on screen.
    ok: (h) => FAKE_MAIL.test(h) || /@(anthropic\.com|pypi\.org|astral\.sh)\b/i.test(h) },
  { id: 'HOME_PATH', sev: 'BLOCK',
    re: /(?:[A-Za-z]:[\\/]+Users|\/c\/Users|\/Users|\/home)[\\/]+[A-Za-z0-9._-]+/g,
    why: 'a real home directory (identifies the machine + user)',
    // /home/user and /home/deploy are teaching content in a Linux course, not disclosure.
    ok: (h) => { const n = h.split(/[\\/]/).pop() ?? ''; return GENERIC_HOME.test(n) || PLACEHOLDER.test(n); } },
  { id: 'FOREIGN_DRIVE', sev: 'BLOCK',
    re: /\b[D-Zd-z]:[\\/][A-Za-z0-9._\\/-]{2,}/g,
    why: 'a machine-specific drive path - broken on any other machine, and it discloses local layout',
    // A timestamp regex like /^\d\d:\d\d/ is not a path. Judge that from the LINE, never
    // from the match: an earlier version tested the match itself for a regex escape and
    // so silently cleared a real drive path whose first folder began with the letter w,
    // because that reads as an escape sequence. The gate's own leak test caught it -
    // which is why that test exists. (Describing it rather than quoting it, because
    // quoting the path made this very comment fail the gate. Twice.)
    ok: (h, line) => /^[A-Za-z]:[\\/]+(?:\.\.\.|\u2026|<)/.test(h) || REGEX_CTX.test(line ?? '') },
];

// sha256 digests from public package indexes are legitimate course content.
const ALLOW_LINE = [/\bsha256:/i, /files\.pythonhosted\.org/i];

// -- Owner-accepted findings --------------------------------------------------------
// `.publish-safety-allow.json` names rule + path glob, never a value. Accepted findings
// are counted and reported, never silently dropped: a gate that hides things stops being
// read, and a gate that is permanently red stops being read too.
const accepts = (() => {
  try {
    const j = JSON.parse(fs.readFileSync('.publish-safety-allow.json', 'utf8'));
    return (j.accept ?? []).map((a) => ({
      rule: a.rule,
      res: (a.paths ?? ['**']).map((p) => new RegExp('^' + p
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '\u0001')
        .replace(/\*/g, '[^/]*')
        .replace(/\u0001/g, '.*') + '$')),
    }));
  } catch { return []; }
})();
const isAccepted = (f) => accepts.some((a) => a.rule === f.id && a.res.some((r) => r.test(f.file)));

const redact = (s) => (s.length <= 12 ? s : `${s.slice(0, 6)}\u2026${s.slice(-4)} (${s.length} chars)`);

const findings = [];
const scanLine = (file, lineNo, line) => {
  if (ALLOW_LINE.some((r) => r.test(line))) return;
  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    for (const m of line.matchAll(rule.re)) {
      if (rule.ok?.(m[0], line)) continue;
      findings.push({ file, line: lineNo, id: rule.id, sev: rule.sev, why: rule.why, hit: redact(m[0]) });
    }
  }
  for (const { key, val } of envSecrets) {
    if (line.includes(val))
      findings.push({ file, line: lineNo, id: `ENV:${key}`, sev: 'BLOCK',
                      why: `the value of ${key} from your local .env`, hit: '<redacted>' });
  }
  // Plain case-insensitive substring: no regex, so no escaping to get wrong. Identity
  // strings are >=4 chars and distinctive enough that substring matching is right here.
  const lower = line.toLowerCase();
  for (const { val, label } of identity) {
    if (lower.includes(val))
      findings.push({ file, line: lineNo, id: 'IDENTITY', sev: 'BLOCK',
                      why: `${label} - links this public repo to you personally`, hit: '<redacted>' });
  }
};

// -- Gather content -----------------------------------------------------------------
let scanned = 0;
if (mode === 'tracked') {
  for (const f of git('ls-files', '-z').split('\0').filter(Boolean)) {
    if (!fs.existsSync(f)) continue;
    const buf = fs.readFileSync(f);
    // Binary files are skipped. NOTE: a text file corrupted with stray NUL bytes would
    // also be skipped and thus silently unscanned - that happened once, to this very
    // file, via a bad patch script. BINARY_SUSPECT below reports it instead of hiding it.
    if (buf.includes(0)) {
      if (/\.(mjs|js|ts|tsx|json|md|py|sh|yml|yaml|toml)$/i.test(f))
        findings.push({ file: f, line: 1, id: 'BINARY_SUSPECT', sev: 'BLOCK',
                        why: 'a source/text file containing NUL bytes - corrupted, and it would be skipped by this scan',
                        hit: '<binary>' });
      continue;
    }
    buf.toString('utf8').split(/\r?\n/).forEach((l, i) => scanLine(f, i + 1, l));
    scanned++;
  }
} else {
  const diff = mode === 'range'
    ? git('diff', '--unified=0', range)
    : git('diff', '--cached', '--unified=0');
  let file = '?';
  let lineNo = 0;
  for (const line of diff.split(/\r?\n/)) {
    const fm = /^\+\+\+ b\/(.*)$/.exec(line);
    if (fm) { file = fm[1]; scanned++; continue; }
    // Track real line numbers from the hunk header, so a finding points at the line it
    // is actually on. An earlier version reported everything as line 1.
    const hm = /^@@ -\S+ \+(\d+)(?:,\d+)? @@/.exec(line);
    if (hm) { lineNo = Number(hm[1]); continue; }
    if (line.startsWith('+') && !line.startsWith('+++')) scanLine(file, lineNo++, line.slice(1));
  }
}

// -- Report -------------------------------------------------------------------------
const label = mode === 'tracked' ? 'every tracked file' : mode === 'range' ? `range ${range}` : 'staged changes';
const accepted = findings.filter(isAccepted);
const live = showAccepted ? findings : findings.filter((f) => !isAccepted(f));
const note = accepted.length ? ` \u00b7 ${accepted.length} accepted (see .publish-safety-allow.json)` : '';
// Accepted findings never fail the gate, even when --show-accepted lists them.
const blocks = live.filter((f) => f.sev === 'BLOCK' && !isAccepted(f));

if (!live.length) {
  console.log(`\u2713 PUBLISH SAFETY - clean (${label}, ${scanned} file${scanned === 1 ? '' : 's'} scanned)${note}`);
  process.exit(0);
}
console.error(`\n\u2717 PUBLISH SAFETY - ${live.length} finding(s) in ${label}${note}\n`);
for (const f of live)
  console.error(`  [${isAccepted(f) ? 'ACCEPTED' : f.sev}] ${f.id}  ${f.file}:${f.line}\n         ${f.why}\n         found: ${f.hit}`);
if (blocks.length) {
  console.error(`\nThis repo is PUBLIC. Fix these before pushing - do not --no-verify past them.`);
  console.error(`A genuine false positive belongs in a rule's ok() with a comment saying why.`);
  console.error(`An owner-accepted finding belongs in .publish-safety-allow.json with a reason.\n`);
}
process.exit(blocks.length ? 1 : 0);
