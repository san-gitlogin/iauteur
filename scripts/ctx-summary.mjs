#!/usr/bin/env node
/**
 * ctx-summary.mjs — one table across every A/B cell, with the spread shown, not hidden.
 *
 * WHY THE SPREAD IS PRINTED. Agent runs are stochastic and, in Claude Code, COST is additionally
 * confounded by prompt caching: a run whose prefix is already warm is billed at a fraction of a
 * cold one, so the same arm can span 2-3x in dollars with nothing else different. Reporting a
 * bare mean of that would invent a difference the data does not contain.
 *
 * Tool bytes into the window and peak occupancy are far steadier — they are counted from the
 * transcript and are not priced — so those are the numbers a conclusion should rest on. The
 * report therefore prints min-max beside every mean and marks the cost column as noisy, rather
 * than letting a reader assume all four columns are equally trustworthy.
 *
 * Usage: node scripts/ctx-summary.mjs out/ctx-ab/*.json
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CTX = /^mcp__plugin_context-mode_context-mode__/;
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

function scan(dir, sessionId) {
  const file = path.join(dir, `${sessionId}.jsonl`);
  if (!fs.existsSync(file)) return null;
  const turns = []; let toolBytes = 0, ctxCalls = 0;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let d; try { d = JSON.parse(line); } catch { continue; }
    const u = d?.message?.usage;
    if (u) turns.push((u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0));
    const c = d?.message?.content;
    if (!Array.isArray(c)) continue;
    for (const b of c) {
      if (b?.type === 'tool_use' && CTX.test(b.name || '')) ctxCalls++;
      if (b?.type === 'tool_result') {
        const cc = b.content;
        const t = typeof cc === 'string' ? cc
          : Array.isArray(cc) ? cc.map((p) => (typeof p === 'string' ? p : p?.text || '')).join('') : '';
        toolBytes += Buffer.byteLength(t, 'utf8');
      }
    }
  }
  return turns.length ? { first: turns[0], peak: Math.max(...turns), toolBytes, ctxCalls } : null;
}

const cells = new Map();   // "task|model" -> { arm -> rows[] }

// On macOS /tmp is a symlink to /private/tmp and Claude Code names the project dir after the
// REAL path, so deriving it from the manifest's cwd silently misses. --project is explicit.
const pi = process.argv.indexOf('--project');
const projectSlug = pi !== -1 ? process.argv[pi + 1] : null;
const files = process.argv.slice(2).filter((a, i) => a.endsWith('.json') && process.argv[i + 1] !== undefined || a.endsWith('.json'));

for (const f of files) {
  const m = JSON.parse(fs.readFileSync(f, 'utf8'));
  const dir = path.join(os.homedir(), '.claude', 'projects',
    projectSlug || ('-' + fs.realpathSync(m.cwd).replace(/^\//, '').replace(/[/_.]/g, '-')));
  // tag shape: t<N>-<model>[-md]
  const [, taskNo, model] = /^t(\d)-([a-z]+)/.exec(m.tag) || [];
  const key = `task${taskNo}|${model === 'log' ? 'opus' : model}`;
  if (!cells.has(key)) cells.set(key, {});
  const bucket = cells.get(key);
  for (const r of m.results) {
    const s = scan(dir, r.sessionId);
    if (!s) continue;
    (bucket[r.arm] ||= []).push({ ...r, ...s });
  }
}

const LABEL = { off: 'plain Claude Code', on: 'context-mode plugin', md: 'CLAUDE.md only (free)' };
const TASK = { task1: 'code comprehension (57 KB source)', task2: 'log analysis (535 KB access.log)' };

const kb = (n) => (n / 1024).toFixed(1);
const range = (xs, f) => `${f(mean(xs))}  [${f(Math.min(...xs))}–${f(Math.max(...xs))}]`;

for (const [key, arms] of [...cells.entries()].sort()) {
  const [task, model] = key.split('|');
  console.log(`\n■ ${TASK[task]}  ·  ${model === 'opus' ? 'Claude Opus 5' : 'Claude Haiku 4.5'}`);
  console.log(`  ${'arm'.padEnd(23)} ${'tool bytes into ctx'.padEnd(26)} ${'peak context'.padEnd(24)} ${'cost (NOISY)'.padEnd(24)} ctx calls`);
  const base = arms.off ? mean(arms.off.map((r) => r.toolBytes)) : null;
  for (const arm of ['off', 'on', 'md']) {
    const rows = arms[arm];
    if (!rows?.length) continue;
    const tb = rows.map((r) => r.toolBytes);
    const pk = rows.map((r) => r.peak);
    const cs = rows.map((r) => r.costUsd).filter((x) => typeof x === 'number');
    const factor = base && arm !== 'off' ? `  ${(base / mean(tb)).toFixed(1)}× less` : '';
    console.log(`  ${LABEL[arm].padEnd(23)} ${range(tb, (n) => kb(n) + 'KB').padEnd(26)} ` +
      `${range(pk, (n) => (n / 1000).toFixed(1) + 'K').padEnd(24)} ` +
      `${(cs.length ? range(cs, (n) => '$' + n.toFixed(3)) : '—').padEnd(24)} ` +
      `${rows.reduce((a, r) => a + r.ctxCalls, 0)}${factor}`);
  }
}

console.log(`\nCost spans 2-3x WITHIN an arm because of prompt-cache warmth — treat the cost column`);
console.log(`as indicative only. Tool bytes and peak context are counted, not priced, and are the`);
console.log(`numbers any conclusion here rests on.`);
