#!/usr/bin/env node
/**
 * ctx-score.mjs — join an A/B run manifest to the transcripts and print one honest table.
 *
 * WHY THIS IS SEPARATE FROM ctx-ab.mjs. The driver knows what it LAUNCHED; the transcript knows
 * what actually HAPPENED. Keeping them apart means the numbers come from Claude Code's own books
 * (see ctx-measure.mjs) rather than from anything the driver believed, and it means a run matrix
 * can be re-scored later without re-running a single agent.
 *
 * WHAT IT COUNTS, and the one that decides everything:
 *   ctx: calls — how many times a context-mode tool was ACTUALLY invoked. A treatment arm that
 *   never calls one is not a test of context-mode's mechanism; it is a test of what merely
 *   INSTALLING it costs. Both are worth knowing, and conflating them is how a review goes wrong.
 *
 * Usage: node scripts/ctx-score.mjs out/ctx-ab/<tag>.json [--project <slug>]
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const manifest = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const slugArg = process.argv.indexOf('--project');
const slug = slugArg !== -1
  ? process.argv[slugArg + 1]
  : '-' + path.resolve(manifest.cwd).replace(/^\//, '').replace(/[/_.]/g, '-');
const dir = path.join(os.homedir(), '.claude', 'projects', slug);

const CTX = /^mcp__plugin_context-mode_context-mode__/;

function scan(sessionId) {
  const file = path.join(dir, `${sessionId}.jsonl`);
  if (!fs.existsSync(file)) return null;
  const turns = [];
  const tools = new Map();
  let toolBytes = 0, ctxCalls = 0, injections = 0;

  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let d; try { d = JSON.parse(line); } catch { continue; }
    if (d.type === 'attachment') injections++;
    const u = d?.message?.usage;
    if (u) turns.push((u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0));
    const content = d?.message?.content;
    if (!Array.isArray(content)) continue;
    for (const b of content) {
      if (b?.type === 'tool_use') {
        const raw = b.name || '?';
        if (CTX.test(raw)) ctxCalls++;
        const name = raw.replace(CTX, 'ctx:');
        tools.set(name, (tools.get(name) || 0) + 1);
      }
      if (b?.type === 'tool_result') {
        const c = b.content;
        const text = typeof c === 'string' ? c
          : Array.isArray(c) ? c.map((p) => (typeof p === 'string' ? p : p?.text || '')).join('') : '';
        toolBytes += Buffer.byteLength(text, 'utf8');
      }
    }
  }
  if (!turns.length) return null;
  return {
    first: turns[0], peak: Math.max(...turns), turnCount: turns.length,
    toolBytes, ctxCalls, injections,
    tools: [...tools.entries()].map(([k, v]) => `${k}×${v}`).join(' ')
  };
}

const rows = [];
for (const r of manifest.results) {
  const s = scan(r.sessionId);
  if (!s) { console.error(`! no transcript for ${r.sessionId}`); continue; }
  rows.push({ ...r, ...s });
}

const K = (n) => (n / 1000).toFixed(1) + 'K';
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const fmtRange = (xs, f = K) => xs.length > 1 ? `${f(mean(xs))}  [${f(Math.min(...xs))}–${f(Math.max(...xs))}]` : f(xs[0]);

console.log(`\n${manifest.tag}  —  ${manifest.n} run(s) per arm   ${manifest.at}`);
console.log(`task: ${manifest.task.slice(0, 96)}${manifest.task.length > 96 ? '…' : ''}`);
console.log('─'.repeat(100));
console.log(`${'arm'.padEnd(4)} ${'#'.padEnd(2)} ${'first'.padStart(7)} ${'peak'.padStart(7)} ${'turns'.padStart(6)} ${'toolKB'.padStart(7)} ${'ctx'.padStart(4)} ${'cost'.padStart(8)}  tools`);
for (const r of rows) {
  console.log(`${r.arm.padEnd(4)} ${String(r.i).padEnd(2)} ${K(r.first).padStart(7)} ${K(r.peak).padStart(7)} ${String(r.turnCount).padStart(6)} ${(r.toolBytes / 1024).toFixed(1).padStart(7)} ${String(r.ctxCalls).padStart(4)} ${('$' + r.costUsd.toFixed(4)).padStart(8)}  ${r.tools}`);
}

const off = rows.filter((r) => r.arm === 'off');
const on = rows.filter((r) => r.arm === 'on');
if (off.length && on.length) {
  console.log('─'.repeat(100));
  const line = (name, sel, f = K) =>
    console.log(`  ${name.padEnd(22)} off ${fmtRange(off.map(sel), f).padEnd(26)} on ${fmtRange(on.map(sel), f)}`);
  line('first prompt (fixed)', (r) => r.first);
  line('peak context', (r) => r.peak);
  line('tool bytes into ctx', (r) => r.toolBytes, (n) => (n / 1024).toFixed(1) + 'KB');
  line('cost', (r) => r.costUsd, (n) => '$' + n.toFixed(4));
  const dFixed = mean(on.map((r) => r.first)) - mean(off.map((r) => r.first));
  const dCost = (mean(on.map((r) => r.costUsd)) - mean(off.map((r) => r.costUsd))) / mean(off.map((r) => r.costUsd)) * 100;
  const totalCtx = on.reduce((a, r) => a + r.ctxCalls, 0);
  console.log(`\n  fixed overhead of loading it : +${K(dFixed)} tok on turn one, re-sent every turn`);
  console.log(`  cost change                  : ${dCost >= 0 ? '+' : ''}${dCost.toFixed(1)}%`);
  console.log(`  context-mode tools CALLED    : ${totalCtx} across ${on.length} treatment run(s)` +
    (totalCtx === 0 ? '   ← the tools were available and never used' : ''));
}
