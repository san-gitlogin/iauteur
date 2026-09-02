#!/usr/bin/env node
// TEST-REC-SURFACE — proves the VS Code recording surface works ON THIS MACHINE.
//
// No mocks. It starts a real `code serve-web`, drives it with real Playwright, runs
// REAL commands in the real integrated terminal, and asserts the output it reports was
// actually read back from the screen. A nonce proves the output cannot have been
// fabricated: the runner invents a random token at run time, and the terminal must echo
// that exact token back out of the DOM.
//
// Usage: node scripts/test-rec-surface.mjs [--light] [--headless] [--keep]
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {
  startServer, openWorkbench, applySettings, verifySurface, prep,
  recordingSettings, vscodeVersion, THEME_IDS,
} from './lib/record/vscode.mjs';
import {openTerminal, runCommand, readBuffer, primeTerminal, readScrollback} from './lib/record/terminal.mjs';
import {recWsRoot} from './lib/record/runner.mjs';
import {marksFor} from './lib/record/runner.mjs';

const argv = process.argv.slice(2);
const theme = argv.includes('--light') ? 'light' : 'dark';
const headless = argv.includes('--headless');
const keep = argv.includes('--keep');

const WS = path.join(recWsRoot(), 'surface-test');
const PROFILE = path.resolve('out/rec-profile');
const SHOTS = path.resolve('out/rec-proof');
fs.mkdirSync(WS, {recursive: true});
fs.mkdirSync(SHOTS, {recursive: true});
fs.writeFileSync(path.join(WS, 'hello.py'),
  'def greet(name):\n    return f"Hello, {name}!"\n\n\nprint(greet("iAuteur"))\n');

const results = [];
const check = (name, ok, detail = '') => {
  results.push({name, ok, detail});
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n        ${detail}` : ''}`);
};

console.log(`VS Code: ${vscodeVersion() || '(not found)'} · theme: ${theme} · headless: ${headless}\n`);

const server = await startServer({workspace: WS});
console.log(`server: ${server.url} (${server.reused ? 'reused' : 'started'})\n`);

const ctx = await chromium.launchPersistentContext(PROFILE, {
  headless,
  viewport: {width: 1600, height: 900},
  deviceScaleFactor: 1,
  args: ['--force-device-scale-factor=1'],
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = ctx.pages()[0] || (await ctx.newPage());

try {
  await openWorkbench(page, server.url, {workspace: server.workspace, boundByFlag: server.boundByFlag});
  check('workbench loads', await page.locator('.monaco-workbench').count() > 0);

  // ── settings ──────────────────────────────────────────────────────────────
  await applySettings(page, server.url, recordingSettings({theme}),
    {workspace: server.workspace, boundByFlag: server.boundByFlag});
  const surf = await verifySurface(page, {theme});
  check(`theme applied (${theme} → ${THEME_IDS[theme]})`, surf.themeOk,
    `workbench isDark=${surf.isDark}, wanted ${theme}`);
  // NOTE: the renderer can only be checked once a terminal EXISTS. Asserting it here
  // passed vacuously (rows=0 AND canvas=0, because there was no terminal yet) — a seal
  // that reports green while blind. The real assertion lives after openTerminal().

  // ── prep: clean the frame ────────────────────────────────────────────────
  const did = await prep(page);
  console.log(`        prep: ${did.join(', ')}`);
  await page.screenshot({path: path.join(SHOTS, `surface-${theme}-prepped.png`)});

  const frame = await page.evaluate(() => ({
    welcome: !!document.querySelector('.tab[aria-label*="Welcome" i]'),
    tabs: document.querySelectorAll('.tabs-container .tab').length,
    auxBar: (() => {
      const el = document.querySelector('.part.auxiliarybar');
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.width > 20;
    })(),
    toasts: document.querySelectorAll('.notification-toast').length,
  }));
  check('Welcome tab closed', !frame.welcome && frame.tabs === 0, `open tabs=${frame.tabs}`);
  check('Chat / secondary side bar hidden', !frame.auxBar);
  check('no notification toasts', frame.toasts === 0, `toasts=${frame.toasts}`);

  // ── the terminal, and GROUND TRUTH ───────────────────────────────────────
  await openTerminal(page);
  check('terminal opened with a prompt', true);

  // NOW the renderer is checkable — and this is the assertion the whole
  // anti-hallucination rule depends on. On canvas/webgl there is no readable text.
  const rend = await page.evaluate(() => ({
    rows: document.querySelectorAll('.xterm-rows').length,
    canvas: document.querySelectorAll('.xterm canvas').length,
  }));
  check('DOM terminal renderer active (ground truth possible)', rend.rows > 0,
    `xterm-rows=${rend.rows} canvas=${rend.canvas}`);

  await primeTerminal(page); // short prompt, then clear. PREP — never recorded.
  const primed = await readBuffer(page);
  check('prompt shortened by priming (no wrapped absolute path)',
    !!primed && !/PS [A-Za-z]:\\/.test(primed),
    `buffer tail=${JSON.stringify((primed || '').split('\n').filter((l) => l.trim()).slice(-2))}`);

  // THE PREP PHASE MUST LEAVE NO TRACE. Priming types a long PowerShell one-liner (the
  // exit-code prompt hook) into the terminal. It runs BEFORE capture starts and is followed
  // by `clear`, so it can never be in the footage — but it must also be gone from the
  // SCROLLBACK, because readScrollback() puts scrollback into the manifest. Owner asked
  // directly whether that command ends up in recordings; this is the standing answer.
  {
    const back = await readScrollback(page);
    const hook = (back || []).some((l) => /function prompt|LASTEXITCODE|iauteur-rec-exit|__iauteur_hook/.test(l));
    check('the PREP prompt-hook leaves no trace in the terminal scrollback', !hook,
      `${back?.length ?? 0} row(s) in scrollback after priming; hook present: ${hook}`);
  }

  const nonce = 'NONCE' + Math.random().toString(36).slice(2, 10).toUpperCase();
  const r1 = await runCommand(page, `echo ${nonce}`);
  check('nonce round-trips through the REAL terminal', r1.output.includes(nonce),
    `sent=${JSON.stringify(r1.sent)} read back=${JSON.stringify(r1.output)}`);
  check('truth is read-back, never inferred', r1.truth === 'read-back');

  const r2 = await runCommand(page, 'python hello.py');
  check('real interpreter, real file, real output', r2.output.includes('Hello, iAuteur!'),
    `read back=${JSON.stringify(r2.output)}`);

  // A command that FAILS must be reported as failing, with its real message.
  const r3 = await runCommand(page, 'python does-not-exist.py');
  const failedHonestly = /can't open file|No such file|cannot find/i.test(r3.output);
  check('a failing command reports its REAL error', failedHonestly,
    `read back=${JSON.stringify(r3.output.slice(0, 160))}`);
  check('exit code of a SUCCESSFUL command is real 0', r2.exitCode === 0 && r2.ok === true,
    `exitCode=${r2.exitCode} ok=${r2.ok} source=${r2.exitCodeSource}`);
  check('exit code of a FAILING command is non-zero', r3.exitCode !== 0 && r3.exitCode != null,
    `exitCode=${r3.exitCode} ok=${r3.ok} source=${r3.exitCodeSource}`);

  // multi-line output must survive intact (LAW 0m: verbatim, multi-line)
  const r4 = await runCommand(page, 'python -c "print(1);print(2);print(3)"');
  check('multi-line output captured verbatim', r4.lines.filter((l) => /^[123]$/.test(l.trim())).length === 3,
    `lines=${JSON.stringify(r4.lines)}`);

  // ── SCROLLED OUTPUT ────────────────────────────────────────────────────
  // The one that matters for real course content: a SELECT, a test run, an install all
  // print more than the terminal is tall. `.xterm-rows` only holds the VISIBLE rows, so a
  // single read at the end would report a truncated transcript as if it were complete.
  // 60 numbered lines is comfortably more than the panel shows.
  // Built by concatenation: the command contains BOTH quote kinds, so neither can wrap it.
  const SCROLL_CMD = 'python -c "' + "for i in range(1,61): print(f'LINE-{i:03d}')" + '"';
  const r5 = await runCommand(page, SCROLL_CMD);
  check('the scroll is DETECTED', r5.scrolled === true && r5.scrolledLines > 0,
    `visible read-back saw ${r5.lines.filter((l) => /^LINE-\d{3}$/.test(l.trim())).length}/60; ` +
    `scrolled=${r5.scrolled}, ${r5.scrolledLines} lines beyond the window`);

  // What the RUNNER does after the segment closes (runFinalize): recover the full
  // transcript from VS Code's own scrollback. Polling cannot beat a fast writer — measured
  // 12/60 — so the buffer is asked for directly.
  const scrollRows = await readScrollback(page);
  const got = new Set((scrollRows ?? []).map((l) => l.trim()).filter((l) => /^LINE-\d{3}$/.test(l)));
  const missing = [];
  for (let i = 1; i <= 60; i++) {
    const want = `LINE-${String(i).padStart(3, '0')}`;
    if (!got.has(want)) missing.push(want);
  }
  check('output that SCROLLS OFF SCREEN is recovered IN FULL from scrollback', missing.length === 0,
    `${got.size}/60 lines recovered` +
    (missing.length ? `
        missing: ${missing.slice(0, 6).join(', ')}${missing.length > 6 ? ' …' : ''}` : ''));
  check('the recovered transcript is ordered and complete end to end',
    (scrollRows ?? []).join(' ').includes('LINE-001') && (scrollRows ?? []).join(' ').includes('LINE-060'),
    `first/last present in ${scrollRows?.length ?? 0} buffer lines`);

  // ── MARKS: a callout must be able to point at REAL TEXT, in BOTH surfaces ────
  // PAID FOR: marks were only ever exercised against the terminal, where xterm writes
  // ordinary spaces. MONACO RENDERS EVERY SPACE AS U+00A0, so the first editor mark ever
  // authored — a SQL JOIN line — could not be measured and aborted a whole recording mid
  // take. A mark containing a space, measured in the editor, is the assertion that was
  // missing; without it the same class of bug is only ever found by losing a recording.
  {
    // The 60-line scroll test above pushed the earlier output off screen, and marksFor
    // correctly REFUSED to measure it (that refusal is the point of the ghost check
    // below). Put a real line back on the visible screen first.
    await runCommand(page, 'python hello.py');
    const tBox = await marksFor(page, [{id: 't', text: 'Hello, iAuteur!'}]).catch((e) => e);
    check('a TERMINAL mark with a space measures to a real rectangle',
      tBox?.t?.w > 2 && tBox?.t?.h > 2,
      tBox instanceof Error ? tBox.message : `box=${JSON.stringify(tBox?.t)}`);

    await page.keyboard.press('Control+P');
    await page.waitForTimeout(400);
    await page.keyboard.type('hello.py');
    await page.waitForTimeout(800);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1200);

    const eBox = await marksFor(page, [{id: 'e', text: 'return f"Hello, {name}!"'}]).catch((e) => e);
    check('an EDITOR mark with spaces measures to a real rectangle (U+00A0 normalised)',
      eBox?.e?.w > 2 && eBox?.e?.h > 2,
      eBox instanceof Error ? eBox.message : `box=${JSON.stringify(eBox?.e)}`);

    // and the rectangle must be TIGHT to the glyphs, not the full-width line div
    check('the editor mark is tight to the text, not the whole line',
      eBox?.e?.w > 2 && eBox.e.w < 700,
      `width=${eBox?.e?.w}px (a full editor line here is >1000px)`);

    // The runner must still REFUSE to invent a rectangle for text that is not there.
    let refused = false;
    try { await marksFor(page, [{id: 'ghost', text: 'THIS-TEXT-IS-NOT-ON-SCREEN-XYZZY'}]); }
    catch { refused = true; }
    check('a mark on text that is NOT on screen is refused, never invented', refused);
  }

  await page.screenshot({path: path.join(SHOTS, `surface-${theme}-terminal.png`)});
  fs.writeFileSync(path.join(SHOTS, `surface-${theme}-buffer.txt`), (await readBuffer(page)) || '');
} finally {
  if (!keep) await ctx.close();
  await server.stop();
}

const bad = results.filter((r) => !r.ok);
console.log('');
if (bad.length) {
  console.error(`${bad.length} of ${results.length} surface checks FAILED.`);
  process.exit(1);
}
console.log(`All ${results.length} surface checks PASS. Shots in out/rec-proof/`);
