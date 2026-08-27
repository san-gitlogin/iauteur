// TERMINAL — REAL execution, and GROUND-TRUTH READ-BACK.
//
// The rule this module exists to enforce (owner, 2026-08-26):
//   "you must have solid control over what is being executed, and what the terminal
//    would actually display, at no cost there must be hallucinations, assumptions,
//    skipping of showing crucial parts."
//
// So: every character reported as terminal output is read back out of the DOM that is
// ACTUALLY ON SCREEN (`.xterm-rows`, the xterm.js DOM renderer). Not a re-run in a side
// channel, not a reconstruction, not "what it would print". The text we report and the
// pixels the viewer sees come from the same place.
//
// If the command cannot be confirmed complete, this module THROWS. It never guesses.
//
// Requires `terminal.integrated.gpuAcceleration: "off"` (see vscode.mjs) — on the
// canvas/webgl renderer `.xterm-rows` does not exist and there is no ground truth.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {palette} from './vscode.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** The literal text currently displayed by the focused terminal. */
export const readBuffer = async (page) =>
  page.evaluate(() => {
    const rows = document.querySelectorAll('.xterm-rows');
    if (!rows.length) return null;
    // The visible (focused) terminal is the last mounted one that has size.
    const el = Array.from(rows).reverse().find((r) => r.getBoundingClientRect().height > 0) || rows[0];
    return el.innerText;
  });

const lines = (buf) => (buf || '').split('\n').map((l) => l.replace(/\s+$/, ''));
const nonEmpty = (buf) => lines(buf).filter((l) => l.trim());

// Detecting the prompt is how we know a command has finished; we do NOT time-box and hope.
//
// Match on the LINE ENDING, not on a `PS ` prefix. Before priming, the prompt is the full
// absolute path, and a long path WRAPS across xterm rows — the continuation row then has
// no `PS ` prefix, so a prefix-anchored test misses it and the terminal looks like it
// never started. `>` PowerShell, `$` bash/zsh, `#` root.
const isPromptLine = (l) => /[>$#]\s*$/.test(String(l).trimEnd());

export const openTerminal = async (page, {timeout = 120000} = {}) => {
  await palette(page, 'Terminal: Create New Terminal');
  const started = Date.now();
  for (;;) {
    const buf = await readBuffer(page);
    if (buf && nonEmpty(buf).some((l) => isPromptLine(l))) return true;
    if (Date.now() - started > timeout) {
      const rows = await page.evaluate(() => document.querySelectorAll('.xterm-rows').length);
      const tail = nonEmpty(buf).slice(-4).join(' | ');
      throw new Error(
        `Terminal never produced a prompt within ${timeout}ms. xterm-rows nodes: ${rows}. ` +
        (rows === 0
          ? 'rows=0 means the DOM renderer is OFF — check terminal.integrated.gpuAcceleration is "off" and that settings were applied AND the page reloaded.'
          : `rows exist, so the shell is slow to start or the prompt was not recognised. Buffer tail: ${tail}`),
      );
    }
    await sleep(800);
  }
};

/**
 * PRIME — give the terminal a short prompt, then clear it. PREP ONLY, never recorded.
 *
 * The default PowerShell prompt prints the full absolute path; in a capture it wrapped
 * across two lines and looked terrible. We cannot set it through a custom terminal
 * profile because VS Code uses those args to bootstrap shell integration (doing so cost
 * every exit code). So we set it the way a person would: type it, then clear the screen.
 * The shell, the cwd, and every later command remain completely real.
 */
// Where the prompt hook drops the last command's real exit status. Read from disk by
// the runner; never visible in the frame.
export const exitFilePath = () => path.join(os.tmpdir(), 'iauteur-rec-exit.txt');

export const primeTerminal = async (page, {exitFile = exitFilePath()} = {}) => {
  // THE EXIT-CODE HOOK. VS Code's shell integration decorations never materialised in
  // VS Code Web + PowerShell (measured: `.terminal-command-decoration` count 0, so every
  // exit code came back null). Rather than infer a code from output text — which is
  // exactly the kind of guess this subsystem forbids — the prompt itself records the
  // truth. Every shell runs its prompt hook after EVERY command, so this captures the
  // real status straight from the shell, writes it to a file outside the workspace, and
  // prints nothing. Zero pixels of pollution, and the value is the shell's own.
  //
  // The serve-web backend runs on THIS machine, so the runner's platform IS the shell's.
  await runCommand(page, promptHook(exitFile), {typeDelay: 4, jitter: 0, exitFile});
  await runCommand(page, 'clear', {typeDelay: 4, jitter: 0, exitFile});
};

/**
 * The one-liner that installs the prompt hook, per shell family.
 * Both write the SAME two fields, tab-separated: an ok flag ("True"/"False") and the
 * numeric exit code — so `readExitStatus` parses one format on every platform.
 */
export const promptHook = (exitFile, platform = os.platform()) => {
  const TAB = String.fromCharCode(9);
  if (platform === 'win32') {
    // A PowerShell single-quoted string is literal, so a Windows path needs no escaping.
    // `$ok = $?` MUST be the first statement — almost anything else resets `$?`.
    return `function prompt { $ok = $?; $code = $global:LASTEXITCODE; ` +
      `"$ok\`t$code" | Out-File -Encoding ascii -NoNewline '${exitFile}'; ` +
      `'PS ' + (Split-Path -Leaf (Get-Location)) + '> ' }`;
  }
  // POSIX: bash runs PROMPT_COMMAND before each prompt, zsh runs precmd. Defining BOTH is
  // harmless in either shell, so one line covers bash and zsh without having to sniff
  // which is running. `local c=$?` as the first statement captures the previous command's
  // status, exactly as `$ok = $?` does in PowerShell.
  const f = exitFile.split('\\').join('/');
  return `__iauteur_hook() { local c=$?; if [ $c -eq 0 ]; then o=True; else o=False; fi; ` +
    `printf '%s${TAB}%s' "$o" "$c" > '${f}'; }; ` +
    `PROMPT_COMMAND=__iauteur_hook; precmd() { __iauteur_hook; }; ` +
    `PS1='PS \\W> '; PROMPT='PS %1~> '`;
};

/** The REAL exit status of the last command, read from the prompt hook's file.
 *  Returns null when the hook is not installed — honest absence, never a fabricated 0. */
export const readExitStatus = ({exitFile = exitFilePath()} = {}) => {
  try {
    const raw = fs.readFileSync(exitFile, 'utf8').trim();
    if (!raw) return null;
    const [ok, code] = raw.split('\t');
    const n = Number(code);
    return {
      ok: ok === 'True',
      exitCode: Number.isFinite(n) ? n : (ok === 'True' ? 0 : 1),
      source: os.platform() === 'win32' ? 'powershell-prompt-hook' : 'posix-prompt-hook',
    };
  } catch {
    return null;
  }
};

/**
 * THE FULL TRANSCRIPT, including what scrolled off screen.
 *
 * MEASURED, and it is the reason this exists: `python -c "for i in range(1,61): print(...)"`
 * finishes in about ten milliseconds. The terminal goes from a prompt to sixty lines
 * printed inside ONE poll interval, so there is no intermediate state to observe and
 * stitching consecutive windows recovers only what is still on screen — 12 of 60, with two
 * provable gaps. Polling cannot beat a fast writer, and pretending otherwise would ship a
 * truncated transcript as if it were complete.
 *
 * VS Code keeps the scrollback itself, and will hand it over: `Terminal: Select All` then
 * `Terminal: Copy Selection` puts the WHOLE buffer on the clipboard. Verified 60/60,
 * LINE-001 through LINE-060.
 *
 * ⚠ This SELECTS text, which is visible. Call it only AFTER a step's capture window has
 * closed (see `runFinalize` in the runner) — never inside the take.
 */
export const readScrollback = async (page) => {
  await palette(page, 'Terminal: Select All');
  await sleep(700);
  await palette(page, 'Terminal: Copy Selection');
  await sleep(700);
  const text = await page.evaluate(async () => {
    try { return await navigator.clipboard.readText(); } catch { return null; }
  });
  await page.keyboard.press('Escape'); // drop the selection highlight
  await sleep(250);
  if (!text) return null;
  const rows = String(text).split(String.fromCharCode(10)).map((l) => l.replace(/\s+$/, ''));
  while (rows.length && !rows[rows.length - 1].trim()) rows.pop();
  return rows;
};

/** Dump whatever shell-integration decorations exist, so exit-code reading is based on
 *  what the DOM ACTUALLY contains rather than a guessed selector. */
export const dumpDecorations = async (page) =>
  page.evaluate(() => {
    const out = {};
    for (const sel of ['.terminal-command-decoration', '.xterm-decoration', '[class*="command-decoration"]', '[class*="decoration"]']) {
      const els = document.querySelectorAll(sel);
      out[sel] = {count: els.length, classes: Array.from(els).slice(-4).map((e) => e.className)};
    }
    return out;
  });

/**
 * STITCH a sequence of VISIBLE-window snapshots into the full transcript.
 *
 * `.xterm-rows` holds only the rows currently ON SCREEN. A command that prints more than
 * the terminal is tall (a `SELECT *`, a test run, a package install) pushes its own earlier
 * lines out of reach, and a single read at the end would report a TRUNCATED transcript as
 * if it were the whole thing — the exact silent half-truth this subsystem exists to stop.
 *
 * So the runner polls while the command runs and keeps every snapshot. Consecutive
 * snapshots OVERLAP (the terminal scrolls a line or two between polls), so they stitch:
 * find the largest suffix of what we have that equals a prefix of the next snapshot, and
 * append only the remainder.
 *
 * If two consecutive snapshots share NO overlap, the terminal moved further than one poll
 * could see and the stitch is not provable — that is reported, never papered over.
 */
export const stitchSnapshots = (snapshots) => {
  const NL = String.fromCharCode(10);
  let full = [];
  let gaps = 0;
  for (const snap of snapshots) {
    const rows = String(snap || '').split(NL).map((l) => l.replace(/\s+$/, ''));
    while (rows.length && !rows[rows.length - 1].trim()) rows.pop();
    if (!rows.length) continue;
    if (!full.length) { full = rows; continue; }
    // Largest suffix of what we have that equals a prefix of the next window.
    let best = 0;
    const max = Math.min(full.length, rows.length);
    for (let k = max; k > 0; k--) {
      if (full.slice(-k).join(NL) === rows.slice(0, k).join(NL)) { best = k; break; }
    }
    if (best === 0) {
      // No shared rows: the screen jumped further than one poll could follow. Count it —
      // an unprovable stitch is reported, never papered over.
      if (full.join(NL) !== rows.join(NL)) { gaps++; full = full.concat(rows); }
    } else {
      full = full.concat(rows.slice(best));
    }
  }
  return {lines: full, gaps};
};

/**
 * Type a command like a person, run it, and READ BACK what the terminal displays.
 *
 * Returns {sent, output, lines, exitCode, truth, scrolled, tStart, tEnd}.
 * `truth` is always 'read-back' on success — bake-rec.mjs refuses anything else.
 */
export const runCommand = async (page, cmd, {
  timeout = 120000,
  typeDelay = 55,
  jitter = 35,
  stableMs = 900,
  exitFile = exitFilePath(),
  // LIVE / LONG-RUNNING PROCESSES. Waiting for the prompt is right for a command that
  // FINISHES, and a category error for one that does not: a dev server, a watcher, a REPL
  // or `tail -f` never return, so prompt-waiting burns the whole timeout and then throws.
  //   waitFor    — resolve as soon as this text appears. That IS the completion signal for
  //                a server ("Listening on http://…"), and it is read back off the screen
  //                like every other claim this module makes.
  //   background — do not wait for a prompt at all; the process is meant to keep running.
  //                Combine with waitFor to know it actually started.
  //   settleMs   — for a background step with no waitFor: how long to let it draw.
  waitFor = null,
  background = false,
  settleMs = 2500,
} = {}) => {
  const before = await readBuffer(page);
  if (before == null) throw new Error('No readable terminal buffer — the DOM renderer is not active.');
  const beforeCount = nonEmpty(before).length;
  const beforeBuf = before;

  const tStart = Date.now();
  // Human-ish typing: per-character delay with bounded jitter. Deterministic enough to
  // re-record, irregular enough not to read as a robot.
  for (const ch of cmd) {
    await page.keyboard.type(ch);
    await sleep(Math.max(12, typeDelay + (Math.random() * 2 - 1) * jitter));
  }
  await sleep(280);
  await page.keyboard.press('Enter');

  // Wait for a NEW prompt after the command, and for the buffer to stop changing.
  //
  // PAID-FOR BUG: this used to require the buffer to have GROWN (`ne.length >
  // beforeCount`). `clear` SHRINKS it, so priming hung for the full 120s timeout and
  // then threw. Completion is "the buffer changed, it now ends at a prompt, and it has
  // stopped moving" — never "there is more text than there was".
  const MIN_WAIT = 500; // never accept completion in the instant after Enter
  let last = '';
  let lastChange = Date.now();
  let settled = false;
  const snapshots = [before]; // keep every window so scrolled-off lines are not lost
  for (;;) {
    const buf = await readBuffer(page);
    const ne = nonEmpty(buf);
    if (buf !== last) {
      last = buf;
      lastChange = Date.now();
      snapshots.push(buf);
    }
    const changed = buf !== beforeBuf;
    const endsAtPrompt = ne.length > 0 && isPromptLine(ne[ne.length - 1]);
    const quiet = Date.now() - lastChange > stableMs;
    const waited = Date.now() - tStart > MIN_WAIT;

    // A live process announces itself in its OWN output; that is the completion signal,
    // read off the screen exactly like any other claim.
    if (waitFor && changed && String(buf || '').includes(waitFor)) { settled = true; break; }
    // A background step is done once it has had a moment to draw — it is never coming back
    // to a prompt, and waiting for one would be waiting for something that cannot happen.
    if (background && !waitFor && waited && Date.now() - tStart > settleMs) { settled = true; break; }

    if (!background && changed && endsAtPrompt && quiet && waited) {
      settled = true;
      break;
    }
    if (Date.now() - tStart > timeout) break;
    await sleep(250);
  }
  const tEnd = Date.now();

  const after = await readBuffer(page);
  if (!settled) {
    throw new Error(
      `Command did not complete within ${timeout}ms and its output could not be confirmed: ${JSON.stringify(cmd)}\n` +
      (waitFor
        ? `Waited for ${JSON.stringify(waitFor)} to appear and it never did — the process may ` +
          `have failed, or it prints something else. Compare the buffer below with what you expected.\n`
        : `A recording NEVER guesses at output. Raise the timeout, or fix the command.\n` +
          `If this process is NOT meant to finish (a server, a watcher, a REPL), give the step ` +
          `"background": true and a "waitFor" string it really prints.\n`) +
      `--- last buffer ---\n${nonEmpty(after).slice(-12).join('\n')}`,
    );
  }

  // Slice out THIS command's output from the STITCHED transcript, not from the final
  // window — otherwise anything that scrolled off during the run is silently dropped.
  const stitched = stitchSnapshots(snapshots);
  const all = stitched.lines.filter((l) => l.trim() !== '');
  let startIdx = -1;
  for (let i = all.length - 1; i >= 0; i--) {
    if (all[i].includes(cmd)) { startIdx = i; break; }
  }
  const body = startIdx >= 0 ? all.slice(startIdx + 1) : all.slice(beforeCount);
  while (body.length && isPromptLine(body[body.length - 1])) body.pop();

  // Did the output outgrow the visible window? Compare what we stitched against what a
  // single final read would have seen. Reported either way, never hidden.
  // MEASURE the terminal's capacity rather than inferring it. `.xterm-rows > div` IS the
  // set of rendered rows, so its count is exactly how many lines the terminal can show.
  // Comparing against a stitched line count instead made a 3-line background step report
  // itself as "scrolled", which then triggered a scrollback fetch it did not need.
  const rowCapacity = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('.xterm-rows'))
      .reverse().find((r) => r.getBoundingClientRect().height > 0);
    return el ? el.children.length : 0;
  }).catch(() => 0);
  const visibleNow = nonEmpty(after).length;
  const scrolled = rowCapacity > 0 && all.length > rowCapacity;
  const scrolledLines = Math.max(0, all.length - rowCapacity);

  // The exit status comes from the shell itself via the prompt hook (primeTerminal).
  // When the hook is not installed it is null — an honest absence, never a fabricated 0.
  // A background process has NOT exited, so there is no exit status. Reading the hook file
  // would report the PREVIOUS command's, which is a stale number wearing a fresh label.
  // Null is the honest answer.
  const st = background ? null : readExitStatus({exitFile});

  return {
    sent: cmd,
    output: body.join('\n'),
    lines: body,
    exitCode: st ? st.exitCode : null,
    ok: st ? st.ok : null,
    exitCodeSource: st ? st.source : null,
    truth: 'read-back',
    scrolled,
    scrolledLines,
    rowCapacity,
    // A stitch gap means the screen moved further than one poll could follow, so the
    // transcript is not provably complete. Surfaced so a demo can be fixed (fewer rows,
    // a LIMIT, a taller panel) rather than shipping an unverifiable claim.
    stitchGaps: stitched.gaps,
    tStart,
    tEnd,
  };
};
