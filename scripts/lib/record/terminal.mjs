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

/**
 * The literal text currently displayed by the ACTIVE terminal.
 *
 * "The last mounted xterm that has size" is not the active terminal. VS Code mounts a
 * SECOND, one-row xterm alongside the real one — an accessibility mirror that holds only
 * the current command line — and being mounted later, it won the old heuristic.
 *
 * Measured: `cat pyproject.toml` completed perfectly in terminal 0 (13 rows, ending
 * `build-backend = "uv_build"` and a fresh prompt) while readBuffer returned terminal 1's
 * lone `PS probe-term> cat pyproject.toml`. The completion check therefore never saw a
 * prompt and the step died on its 120s timeout — a command that had already succeeded.
 * Every recording died on its third step, because the mirror only appears once there is a
 * command line to mirror.
 *
 * So: ask VS Code which terminal is active, and only fall back to a guess if it will not
 * say. The fallback prefers the WIDEST-content terminal rather than the newest, because
 * the mirror is always the degenerate one.
 */
export const readBuffer = async (page) =>
  page.evaluate(() => {
    const visible = (el) => el.getBoundingClientRect().height > 0;
    const active = document.querySelector('.terminal-wrapper.active .xterm-rows');
    if (active && visible(active)) return active.innerText;
    const rows = [...document.querySelectorAll('.terminal-wrapper .xterm-rows')].filter(visible);
    const any = rows.length ? rows : [...document.querySelectorAll('.xterm-rows')].filter(visible);
    if (!any.length) return null;
    // Most RENDERED rows wins: the real terminal draws its whole viewport, the mirror one line.
    return any.reduce((a, b) =>
      (b.children.length > a.children.length ? b : a)).innerText;
  });

const lines = (buf) => (buf || '').split('\n').map((l) => l.replace(/\s+$/, ''));
const nonEmpty = (buf) => lines(buf).filter((l) => l.trim());

// Detecting the prompt is how we know a command has finished; we do NOT time-box and hope.
//
// Match on the LINE ENDING, not on a `PS ` prefix. Before priming, the prompt is the full
// absolute path, and a long path WRAPS across xterm rows — the continuation row then has
// no `PS ` prefix, so a prefix-anchored test misses it and the terminal looks like it
// never started. `>` PowerShell, `$` bash/zsh, `#` root.
// `%` is ZSH, the default login shell on macOS since Catalina. It was missing, so the
// first recording attempt on a Mac sat through the whole 120s timeout with a perfectly
// good prompt on screen and reported "never produced a prompt".
const isPromptLine = (l) => /[>$#%]\s*$/.test(String(l).trimEnd());

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
  // NOTE: neither branch may contain a LITERAL tab. This string is typed into a live
  // shell and a tab keystroke is completion, not a character — see the POSIX branch.
  if (platform === 'win32') {
    // A PowerShell single-quoted string is literal, so a Windows path needs no escaping.
    // `$ok = $?` MUST be the first statement — almost anything else resets `$?`.
    return `function prompt { $ok = $?; $code = $global:LASTEXITCODE; ` +
      `"$ok\`t$code" | Out-File -Encoding ascii -NoNewline '${exitFile}'; ` +
      `'PS ' + (Split-Path -Leaf (Get-Location)) + '> ' }`;
  }
  // POSIX: bash runs PROMPT_COMMAND before each prompt, zsh runs precmd_functions.
  // Setting both is harmless in either shell, so one line covers bash and zsh without sniffing
  // which is running. `local c=$?` as the first statement captures the previous command's
  // status, exactly as `$ok = $?` does in PowerShell.
  const f = exitFile.split('\\').join('/');
  // THE HOOK MUST RUN *FIRST*, BEFORE VS CODE'S OWN.
  //
  // The first version defined `precmd() { __iauteur_hook; }`. In zsh — the default macOS
  // login shell — VS Code's shell integration has ALREADY registered its own precmd, and
  // whichever of the two runs first leaves `$?` holding ITS last internal command's status
  // rather than the user's. Measured: `echo hello`, `uv --version` and `false` all reported
  // exit code 1, with the output read back correctly. Wrong exit codes are worse than
  // missing ones, because `expect: {exitCode: 0}` then fails on every command that worked
  // and the manifest still claims truth: 'read-back'.
  //
  // `precmd_functions` is zsh's supported extension point and takes an ORDER, so the hook
  // goes at the FRONT and sees the real status. bash has no such array and does not need
  // one — PROMPT_COMMAND is prepended there for the same reason. Defining `precmd`
  // directly is deliberately NOT done any more: it would override VS Code's rather than
  // sit beside it.
  return `__iauteur_hook() { local c=$?; if [ $c -eq 0 ]; then o=True; else o=False; fi; ` +
    // \t AS TWO CHARACTERS, NOT A TAB. This line is TYPED into a live shell, and a real
    // tab keystroke is COMPLETION, not a character — so the separator never arrived,
    // `readExitStatus` split "False1" on a tab it could not find, and every command in
    // every recording reported exit code 1 (the ok !== 'True' fallback). PowerShell was
    // unaffected because its half escapes the tab as `t and never types a control
    // character. printf expands the escape itself, which is the whole point of using it.
    `printf '%s\\t%s' "$o" "$c" > '${f}'; return $c; }; ` +
    `PROMPT_COMMAND="__iauteur_hook\${PROMPT_COMMAND:+;$PROMPT_COMMAND}"; ` +
    `typeset -ga precmd_functions 2>/dev/null; ` +
    `precmd_functions=(__iauteur_hook \${precmd_functions[@]}); ` +
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
  // SCROLL AND READ. Do NOT go through the palette.
  //
  // The first version drove `Terminal: Select All` + `Terminal: Copy Selection` and read
  // the clipboard. It reads the buffer correctly and wrecks the NEXT command: each palette
  // round-trip costs the terminal one key event, so the following command lost its first
  // character (`echo BBB` -> `cho BBB`), and the attempts to repair that made it worse —
  // Ctrl+U/Ctrl+K came back echoed as a literal `^K` with the previous command still on the
  // line (`u^Kls -av run myapp`). Every one of those is a REAL command with REAL output, so
  // it would have been recorded as truth.
  //
  // This runs in runFinalize, AFTER the step's t1 mark and after the command has completed,
  // so nothing is writing to the buffer any more. That is what makes scrolling
  // deterministic here where gotcha 41 showed polling DURING a fast write is not: there is
  // no race left to lose. The viewport is walked top to bottom, each window read from the
  // DOM, and the windows stitched on their overlap — no palette, no clipboard, no focus
  // change, and therefore nothing for the next command to trip over.
  const geo = await page.evaluate(() => {
    const w = document.querySelector('.terminal-wrapper.active .xterm-viewport')
           || document.querySelector('.terminal-wrapper .xterm-viewport');
    return w ? {h: w.clientHeight, total: w.scrollHeight} : null;
  });
  if (!geo || !geo.h) return null;

  const step = Math.max(1, Math.floor(geo.h * 0.6)); // 40% overlap gives the stitcher a join
  const snaps = [];
  for (let top = 0; ; top += step) {
    const at = Math.min(top, Math.max(0, geo.total - geo.h));
    await page.evaluate((y) => {
      const w = document.querySelector('.terminal-wrapper.active .xterm-viewport')
             || document.querySelector('.terminal-wrapper .xterm-viewport');
      if (w) w.scrollTop = y;
    }, at);
    await sleep(90); // xterm re-renders rows on scroll
    snaps.push(await readBuffer(page));
    if (at >= geo.total - geo.h) break;
  }

  // Leave the viewport where the user would: at the bottom, on the live prompt.
  await page.evaluate(() => {
    for (const w of document.querySelectorAll('.xterm-viewport')) w.scrollTop = w.scrollHeight;
  });
  await sleep(80);

  const {lines: rows} = stitchSnapshots(snaps);
  while (rows.length && !rows[rows.length - 1].trim()) rows.pop();
  return rows.length ? rows : null;
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
  // NOTE: an earlier fix pressed `End` here to absorb the key event the terminal drops
  // after readScrollback's palette round-trip. It cost more than it bought — the very next
  // prep command (a 118-char mkdir && cp) stopped returning a prompt at all and burned the
  // full 300s timeout. The verify-and-retype below covers the same fault without sending
  // anything extra: the swallow only happens on the step AFTER a scrollback read, and
  // every authored step command is short enough to be verified.
  // Human-ish typing: per-character delay with bounded jitter. Deterministic enough to
  // re-record, irregular enough not to read as a robot.
  for (const ch of cmd) {
    await page.keyboard.type(ch);
    await sleep(Math.max(12, typeDelay + (Math.random() * 2 - 1) * jitter));
  }
  await sleep(280);

  // READ THE COMMAND LINE BACK BEFORE COMMITTING IT.
  //
  // Measured: the FIRST keystroke after `readScrollback` is swallowed — not a focus
  // problem (document.activeElement is already the xterm helper textarea, and a bare "X"
  // sent by hand vanished too), but the terminal dropping one event after the palette
  // round-trip that Select All / Copy Selection needs.
  //
  // The failure mode is the dangerous one. `echo BBB` arrives as `cho BBB`, which is still
  // a REAL command with REAL output, so the step completes, `truth: 'read-back'` is
  // honestly recorded, and the footage shows a typo that no gate can see — the runner
  // cannot know what the author MEANT. So the command line is verified against the intent
  // before Enter, exactly as every other claim in this module is verified against reality.
  // Compare with whitespace COLLAPSED on both sides. A long command wraps across xterm
  // rows and each row is right-trimmed, so a wrap that lands on a space loses it and an
  // exact match fails on a line that is perfectly correct (the prompt hook is ~300 chars
  // and wrapped four ways). Collapsing still catches the case this exists for: a dropped
  // leading character makes "echo BBB" into "cho BBB", which no amount of whitespace
  // normalisation can turn back into a match.
  //
  // Only SHORT commands are verified. xterm wraps a long line across rows and the wrap is
  // not reconstructable — it right-trims each row and can split inside a word, so the
  // prompt hook (~300 chars) came back with a space wedged into `precmd_functions` and no
  // amount of normalising made it match a line that was in fact typed perfectly. Every
  // AUTHORED step command is far under the wrap width; the long ones are prep, which is
  // typed before the camera rolls and whose effect is asserted separately.
  // Compare the command line EXACTLY, not with `includes`. A stray character that lands
  // BEFORE the command still contains it: `ls -a` typed after a leaked `u` reads `uls -a`,
  // which `includes("ls -a")` happily accepts — and zsh then answered
  // "command not found: uls" four steps into an otherwise good take. The text after the
  // last prompt marker is the whole command and must equal what was asked for.
  const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
  const wantNorm = norm(cmd);
  const WRAP_SAFE = 100;
  // Strip the PROMPT specifically, anchored at the start of the line. Searching for the
  // last "> " finds a REDIRECT instead: `printf '…' > /tmp/iauteur-gitconfig` was read as
  // the command `/tmp/iauteur-gitconfig` and rejected three times in a row, on a line that
  // had been typed perfectly. primeTerminal sets the prompt to `PS <dir]> `, so it is a
  // known shape rather than something to guess at.
  const PROMPT = /^PS [^>]*>\s?/;
  const typedLine = async () => {
    const rows = nonEmpty(await readBuffer(page));
    const last = rows[rows.length - 1] ?? '';
    return norm(last.replace(PROMPT, ''));
  };
  for (let attempt = 0; cmd.length <= WRAP_SAFE; attempt++) {
    const shown = await typedLine();
    if (shown === wantNorm) break;
    if (attempt >= 2) {
      throw new Error(
        `Could not type "${cmd}" into the terminal — after ${attempt + 1} attempts the ` +
        `command line reads ${JSON.stringify(shown.slice(-160))}. Refusing to press Enter: ` +
        `a mistyped command runs and produces real output, which would be recorded as truth.`);
    }
    // Clear with BACKSPACE, not Ctrl+U/Ctrl+K. The control keys were not always
    // interpreted — one came back echoed into the line as a literal `^K`, which turned a
    // repair attempt into more corruption. Backspace is unambiguous, and the line is
    // short by construction (only commands under WRAP_SAFE reach here).
    await page.keyboard.press('End');
    for (let i = 0; i < shown.length + 8; i++) await page.keyboard.press('Backspace');
    await sleep(200);
    for (const ch of cmd) {
      await page.keyboard.type(ch);
      await sleep(Math.max(12, typeDelay + (Math.random() * 2 - 1) * jitter));
    }
    await sleep(280);
  }

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
