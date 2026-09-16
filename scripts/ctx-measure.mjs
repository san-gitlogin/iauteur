#!/usr/bin/env node
/**
 * ctx-measure.mjs — what a Claude Code session ACTUALLY cost, read from Claude Code's own books.
 *
 * WHY THIS EXISTS. context-mode ships `ctx_stats`, which reports how much context context-mode
 * saved. That is the tool grading its own homework: it counts bytes it diverted, not tokens the
 * model was billed for, and it cannot see the cost of its own tool definitions. A claim measured
 * by the thing being claimed about is not evidence (CLAUDE.md: anything that MEASURES gets a
 * check that its measurement can be read back).
 *
 * So this reads the transcript Claude Code writes for every session —
 * ~/.claude/projects/<slug>/<session-id>.jsonl — where each assistant message carries
 * `message.usage`. Verified present on this machine, 2026-09-16:
 *
 *   input_tokens · cache_creation_input_tokens · cache_read_input_tokens · output_tokens
 *
 * THE ONE NUMBER THAT MATTERS, and why it is a sum of three fields: the prompt sent on a given
 * turn is input + cache_creation + cache_read. Those three are a partition of the same prompt —
 * fresh tokens, tokens written to cache, tokens read from cache — so their sum IS the size of
 * the conversation at that turn. The max across turns is peak context occupancy. No other field
 * answers "how full was the window", and picking only `input_tokens` (which is ~2 when the
 * cache is warm) is the mistake that makes a session look free.
 *
 * TOKENS SAVED IS NOT MONEY SAVED. Cache reads are billed at a fraction of fresh input, and in
 * Claude Code almost the whole window is a cache read on every turn after the first. So the
 * report prints fresh and cached separately and never adds them into one "tokens" figure.
 *
 * Usage:
 *   node scripts/ctx-measure.mjs <session.jsonl> [--label NAME] [--json]
 *   node scripts/ctx-measure.mjs --compare <A.jsonl> <B.jsonl> [--labels A,B]
 *   node scripts/ctx-measure.mjs --find <project-dir-slug> [--since <iso>]   # list candidates
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const PROJECTS = path.join(os.homedir(), '.claude', 'projects');

/** Read a JSONL transcript, skipping lines that are not JSON (the file is appended live). */
function readTranscript(file) {
  const rows = [];
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try { rows.push(JSON.parse(line)); } catch { /* partial final line while a session runs */ }
  }
  return rows;
}

/**
 * Bytes of tool OUTPUT that entered the conversation.
 *
 * This is the quantity context-mode claims to shrink, and it is measured here from the
 * transcript rather than from the tool: every tool_result block in a user message, whatever
 * produced it. A result may be a string or an array of content blocks, so both shapes are
 * walked. Counted in bytes because that is what is comparable across runs; tokens for the same
 * bytes vary with the tokenizer and are already counted above.
 */
function toolResultBytes(rows) {
  let bytes = 0, count = 0;
  const perTool = new Map();
  const nameFor = new Map();

  for (const row of rows) {
    const content = row?.message?.content;
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (block?.type === 'tool_use' && block.id) nameFor.set(block.id, block.name || 'unknown');
    }
  }
  for (const row of rows) {
    const content = row?.message?.content;
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (block?.type !== 'tool_result') continue;
      const c = block.content;
      const text = typeof c === 'string'
        ? c
        : Array.isArray(c)
          ? c.map((p) => (typeof p === 'string' ? p : p?.text || '')).join('')
          : '';
      const n = Buffer.byteLength(text, 'utf8');
      bytes += n; count += 1;
      const tool = nameFor.get(block.tool_use_id) || 'unknown';
      perTool.set(tool, (perTool.get(tool) || 0) + n);
    }
  }
  return { bytes, count, perTool };
}

function measure(file, label) {
  const rows = readTranscript(file);
  const turns = [];

  for (const row of rows) {
    const u = row?.message?.usage;
    if (!u) continue;
    const fresh = u.input_tokens || 0;
    const created = u.cache_creation_input_tokens || 0;
    const read = u.cache_read_input_tokens || 0;
    turns.push({
      ts: row.timestamp || null,
      prompt: fresh + created + read,   // the whole prompt sent this turn — see header
      fresh, created, read,
      output: u.output_tokens || 0,
      model: row?.message?.model || null
    });
  }

  if (!turns.length) throw new Error(`no assistant usage found in ${file} — is it a session transcript?`);

  const tools = toolResultBytes(rows);
  const stamps = rows.map((r) => r.timestamp).filter(Boolean).sort();
  const wallMs = stamps.length >= 2 ? Date.parse(stamps.at(-1)) - Date.parse(stamps[0]) : null;

  // A compaction shows up as the prompt COLLAPSING between turns: the window was rebuilt
  // smaller. Reported rather than inferred from any hook, so it stays true whatever produced it.
  let compactions = 0;
  for (let i = 1; i < turns.length; i++) {
    if (turns[i].prompt < turns[i - 1].prompt * 0.6) compactions++;
  }

  return {
    label: label || path.basename(file, '.jsonl').slice(0, 8),
    file,
    turns: turns.length,
    peakPrompt: Math.max(...turns.map((t) => t.prompt)),
    finalPrompt: turns.at(-1).prompt,
    firstPrompt: turns[0].prompt,          // the fixed cost: system + tools, before any work
    freshTotal: turns.reduce((a, t) => a + t.fresh + t.created, 0),
    cachedTotal: turns.reduce((a, t) => a + t.read, 0),
    outputTotal: turns.reduce((a, t) => a + t.output, 0),
    toolResultBytes: tools.bytes,
    toolResultCount: tools.count,
    perTool: [...tools.perTool.entries()].sort((a, b) => b[1] - a[1]),
    compactions,
    wallMs,
    model: turns.at(-1).model,
    series: turns.map((t) => t.prompt)     // for the chart the video draws
  };
}

const K = (n) => (n / 1000).toFixed(1) + 'K';
const KB = (n) => (n / 1024).toFixed(1) + ' KB';
const pct = (a, b) => (b === 0 ? '—' : ((a - b) / a * 100).toFixed(1) + '%');

function report(m) {
  const secs = m.wallMs == null ? '—' : (m.wallMs / 1000).toFixed(1) + 's';
  console.log(`\n── ${m.label} ${'─'.repeat(Math.max(0, 56 - m.label.length))}`);
  console.log(`  model                 ${m.model || '—'}`);
  console.log(`  turns                 ${m.turns}${m.compactions ? `   (${m.compactions} compaction(s))` : ''}`);
  console.log(`  FIRST prompt          ${K(m.firstPrompt)} tok   ← fixed cost: system + tool defs`);
  console.log(`  PEAK context          ${K(m.peakPrompt)} tok   ← how full the window got`);
  console.log(`  final prompt          ${K(m.finalPrompt)} tok`);
  console.log(`  billed fresh          ${K(m.freshTotal)} tok`);
  console.log(`  billed cache-read     ${K(m.cachedTotal)} tok   (priced far below fresh)`);
  console.log(`  output                ${K(m.outputTotal)} tok`);
  console.log(`  tool output into ctx  ${KB(m.toolResultBytes)} over ${m.toolResultCount} result(s)`);
  for (const [tool, bytes] of m.perTool.slice(0, 8)) {
    console.log(`      ${tool.padEnd(20)} ${KB(bytes)}`);
  }
  console.log(`  wall time             ${secs}`);
}

function compare(a, b) {
  console.log(`\n${'='.repeat(62)}`);
  console.log(`COMPARISON — ${a.label} (control)  vs  ${b.label} (treatment)`);
  console.log('='.repeat(62));
  const row = (name, av, bv, fmt = K, better = 'lower') => {
    const delta = better === 'lower' ? pct(av, bv) : pct(bv, av);
    console.log(`  ${name.padEnd(22)} ${String(fmt(av)).padStart(10)}  ${String(fmt(bv)).padStart(10)}   ${delta}`);
  };
  console.log(`  ${''.padEnd(22)} ${a.label.padStart(10)}  ${b.label.padStart(10)}   change`);
  row('FIRST prompt', a.firstPrompt, b.firstPrompt);
  row('PEAK context', a.peakPrompt, b.peakPrompt);
  row('billed fresh', a.freshTotal, b.freshTotal);
  row('billed cache-read', a.cachedTotal, b.cachedTotal);
  row('output', a.outputTotal, b.outputTotal);
  row('tool output into ctx', a.toolResultBytes, b.toolResultBytes, KB);
  row('turns', a.turns, b.turns, (n) => String(n));
  if (a.wallMs != null && b.wallMs != null) row('wall time', a.wallMs, b.wallMs, (n) => (n / 1000).toFixed(1) + 's');

  console.log(`\n  The fixed cost of the treatment's tool definitions is ` +
    `${K(b.firstPrompt - a.firstPrompt)} tok on turn one,`);
  console.log(`  and it is re-sent every turn. Over ${b.turns} turn(s) that is ` +
    `${K((b.firstPrompt - a.firstPrompt) * b.turns)} tok of prompt.`);
  const saved = a.toolResultBytes - b.toolResultBytes;
  console.log(`  Tool output kept out of the window: ${KB(saved)}.`);
  console.log(`\n  NOTE: peak context and money are different questions — see the cache-read row.`);
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
if (!argv.length) {
  console.error('usage: ctx-measure.mjs <session.jsonl> [--label X] [--json]');
  console.error('       ctx-measure.mjs --compare <A.jsonl> <B.jsonl> [--labels a,b]');
  console.error('       ctx-measure.mjs --find <project-slug> [--since <iso>]');
  process.exit(2);
}

if (argv[0] === '--find') {
  const slug = argv[1];
  const dir = path.join(PROJECTS, slug);
  if (!fs.existsSync(dir)) {
    console.error(`no such project dir: ${dir}`);
    console.error(`available:\n  ${fs.readdirSync(PROJECTS).join('\n  ')}`);
    process.exit(1);
  }
  const since = argv.includes('--since') ? Date.parse(argv[argv.indexOf('--since') + 1]) : 0;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.jsonl'))
    .map((f) => ({ f, s: fs.statSync(path.join(dir, f)) }))
    .filter((x) => x.s.mtimeMs >= since)
    .sort((a, b) => b.s.mtimeMs - a.s.mtimeMs);
  for (const { f, s } of files) {
    console.log(`${new Date(s.mtimeMs).toISOString()}  ${(s.size / 1024).toFixed(0).padStart(6)} KB  ${path.join(dir, f)}`);
  }
  process.exit(0);
}

if (argv[0] === '--compare') {
  const [, A, B] = argv;
  const labels = argv.includes('--labels') ? argv[argv.indexOf('--labels') + 1].split(',') : ['without', 'with'];
  const a = measure(A, labels[0]);
  const b = measure(B, labels[1]);
  report(a); report(b); compare(a, b);
  if (argv.includes('--json')) {
    const out = path.join('out', 'ctx-measure.json');
    fs.mkdirSync('out', { recursive: true });
    fs.writeFileSync(out, JSON.stringify({ control: a, treatment: b }, null, 2));
    console.log(`\nwrote ${out}`);
  }
  process.exit(0);
}

const label = argv.includes('--label') ? argv[argv.indexOf('--label') + 1] : undefined;
const m = measure(argv[0], label);
if (argv.includes('--json')) console.log(JSON.stringify(m, null, 2));
else report(m);
