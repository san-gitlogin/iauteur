#!/usr/bin/env node
/**
 * ctx-ab.mjs — run the context-mode A/B matrix reproducibly.
 *
 * WHY A DRIVER RATHER THAN TYPING THE COMMANDS. An A/B is only evidence if the two arms differ
 * in exactly ONE thing. Typed by hand, they drift: a flag here, a reordered --allowedTools there,
 * and the comparison silently becomes a comparison of something else. This holds the prompt, the
 * model, the tool list and the working directory identical across arms, and varies only whether
 * the context-mode plugin is loaded.
 *
 * ISOLATION (the owner chose sandbox-first, so this is load-bearing):
 *   --plugin-dir <clone>  loads context-mode for this invocation only; ~/.claude is never written
 *   CONTEXT_MODE_DIR      sends its SQLite stores into the workspace, not into the home directory
 * Nothing here installs anything. Deleting the workspace removes every trace.
 *
 * REPETITION IS NOT OPTIONAL. An agent run is stochastic — tool choice, turn count and token use
 * all vary between identical invocations. One run per arm is an anecdote, so the default is three
 * and the report prints the spread, not just a mean.
 *
 * Usage:
 *   node scripts/ctx-ab.mjs --task <file.txt> --cwd <dir> --plugin <cm-dir> [--n 3] [--tag t1]
 *   node scripts/ctx-ab.mjs ... --arm on        # only the treatment arm
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? dflt : process.argv[i + 1];
};

const taskFile = arg('task');
const cwd = arg('cwd');
const plugin = arg('plugin');
const n = Number(arg('n', 3));
const tag = arg('tag', 'ab');
const only = arg('arm');                    // 'off' | 'on' | 'md' | undefined (all configured)
const store = arg('store', path.join(cwd || '.', '.cm-store'));

/**
 * ARM 'md' — the free alternative, and the reason it exists.
 *
 * Six treatment runs on Opus called a context-mode tool ZERO times and still came out 14%
 * cheaper, because the plugin's SessionStart hook injects a routing argument that changes how
 * the model uses its ORDINARY tools. That makes the prompt and the sandbox separable effects,
 * and separable effects have to be separated before either gets the credit.
 *
 * This arm loads no plugin and pays no per-turn rent: it drops a CLAUDE.md carrying the same
 * ARGUMENT — rewritten against Bash/Read/Grep, with every ctx_ tool name removed — into the
 * working directory for the duration of the run, then removes it. Anything this arm captures
 * is available to any user for nothing.
 */
const mdFile = arg('md');

if (!taskFile || !cwd || !plugin) {
  console.error('usage: ctx-ab.mjs --task <file> --cwd <dir> --plugin <cm-dir> [--n 3] [--tag t1] [--arm on|off]');
  process.exit(2);
}

const task = fs.readFileSync(taskFile, 'utf8').trim();
const P = 'mcp__plugin_context-mode_context-mode__';

// The SAME base tools in both arms. The treatment ADDS the ctx tools and nothing else — if the
// control were given a smaller tool list the comparison would be measuring the tool list.
const BASE = ['Read', 'Grep', 'Glob', 'Bash'];
const CTX = ['ctx_execute', 'ctx_execute_file', 'ctx_index', 'ctx_search', 'ctx_batch_execute', 'ctx_stats']
  .map((t) => P + t);

/** Deterministic session ids so a transcript can always be traced back to the run that made it. */
const sid = (arm, i) => {
  const h = [...`${tag}${arm}${i}`].reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 5381)
    .toString(16).padStart(8, '0');
  return `${h}-0000-4000-8000-${String(i).padStart(4, '0')}${arm === 'on' ? 'aaaa' : 'bbbb'}0000`.slice(0, 36);
};

const results = [];

const arms = only ? [only] : (mdFile ? ['off', 'on', 'md'] : ['off', 'on']);
const cwdClaudeMd = path.join(cwd, 'CLAUDE.md');

for (const arm of arms) {
  // The md arm's file must exist for ITS runs and for no others, or the comparison is ruined.
  // Written and removed around each run rather than once, so a crash cannot leak it into a
  // later arm — and refuse outright if the workspace already has one we would clobber.
  if (arm === 'md') {
    if (fs.existsSync(cwdClaudeMd)) {
      console.error(`refusing: ${cwdClaudeMd} already exists — the md arm would overwrite it`);
      process.exit(1);
    }
  }

  for (let i = 1; i <= n; i++) {
    const sessionId = sid(arm, i);
    const args = ['-p', task, '--session-id', sessionId, '--output-format', 'json',
      ...(process.env.CTXAB_MODEL ? ['--model', process.env.CTXAB_MODEL] : []),
      '--allowedTools', [...BASE, ...(arm === 'on' ? CTX : [])].join(' ')];
    if (arm === 'on') args.push('--plugin-dir', plugin);
    if (arm === 'md') fs.copyFileSync(mdFile, cwdClaudeMd);

    process.stderr.write(`\n▶ ${tag} arm=${arm} run ${i}/${n}  session=${sessionId}\n`);
    const started = Date.now();
    let out;
    try {
      out = execFileSync('claude', args, {
        cwd,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
        // CONTEXT_MODE_DIR is read by the plugin; harmless in the control arm where nothing reads it.
        env: { ...process.env, CONTEXT_MODE_DIR: path.resolve(store) }
      });
    } catch (e) {
      process.stderr.write(`  FAILED: ${e.message.slice(0, 300)}\n`);
      results.push({ tag, arm, i, sessionId, failed: true });
      if (arm === 'md') fs.rmSync(cwdClaudeMd, { force: true });
      continue;
    } finally {
      if (arm === 'md') fs.rmSync(cwdClaudeMd, { force: true });
    }
    let parsed = {};
    try { parsed = JSON.parse(out); } catch { /* keep the raw text below */ }
    const row = {
      tag, arm, i, sessionId,
      wallMs: Date.now() - started,
      turns: parsed.num_turns ?? null,
      costUsd: parsed.total_cost_usd ?? null,
      durationMs: parsed.duration_ms ?? null,
      answer: parsed.result ?? out.slice(0, 4000)
    };
    results.push(row);
    process.stderr.write(`  turns=${row.turns}  cost=$${(row.costUsd ?? 0).toFixed(4)}  ${(row.wallMs / 1000).toFixed(1)}s\n`);
  }
}

const outDir = path.join('out', 'ctx-ab');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `${tag}.json`);
fs.writeFileSync(outFile, JSON.stringify({ tag, task, cwd, plugin, n, at: new Date().toISOString(), results }, null, 2));

console.log(`\nwrote ${outFile}`);
console.log(`${'arm'.padEnd(5)} ${'run'.padEnd(4)} ${'turns'.padEnd(6)} ${'cost'.padEnd(9)} session`);
for (const r of results) {
  console.log(`${r.arm.padEnd(5)} ${String(r.i).padEnd(4)} ${String(r.turns ?? '—').padEnd(6)} ${('$' + (r.costUsd ?? 0).toFixed(4)).padEnd(9)} ${r.sessionId}`);
}
