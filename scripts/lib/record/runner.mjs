// RUNNER — demo.json (intent) -> segments + manifest (reality).
//
// The contract, in one line: the author declares WHAT should happen; the runner records
// WHEN it happened, WHERE on screen, and WHAT the machine actually said back.
//
// Every step becomes exactly one CFR segment, cut on paint-accurate boundaries. Every
// step that produces terminal output carries that output READ BACK from the screen, and
// every step that changes the editor is verified by reading the editor back. A step that
// cannot be verified THROWS — the runner never writes a manifest entry it did not
// confirm (docs/SCREEN_RECORDING.md §1, the anti-hallucination rule).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {chromium} from 'playwright';
import {
  startServer, openWorkbench, applySettings, verifySurface, prep,
  recordingSettings, vscodeVersion, palette, reapStaleServers,
} from './vscode.mjs';
import {openTerminal, primeTerminal, runCommand, readBuffer, readScrollback} from './terminal.mjs';
import {startCapture} from './capture.mjs';
import {snapshot, pressChord, capsFor} from './keyprobe.mjs';
import {CHECKS} from './keyprobe-table.mjs';
import {setupBrowser, browserActions, BROWSER_FOCUS} from './browser.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Wait until the browser has PAINTED, so a mark lands on what is actually on screen.
 *  Marking at the DOM mutation instead put every boundary a frame early (measured). */
const painted = (page) =>
  page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

/** Where to look for this step, in CAPTURE space. deviceScaleFactor is pinned to 1 and
 *  the screencast is not downscaled, so page coordinates ARE capture pixels. */
const FOCUS_SELECTORS = {
  terminal: '.part.panel',
  editor: '.part.editor .editor-instance',
  explorer: '.part.sidebar',
  window: '.monaco-workbench',
};

/**
 * NAMED MARKS — the runner measures a rectangle, the spec points a callout at it BY NAME.
 * Nothing is ever hand-positioned, so a callout still lands after a viewport change or a
 * re-record. Two kinds, both resolved against what is really on screen:
 *   {id, selector}  -> the bounding box of that element
 *   {id, text}      -> the bounding box of the RENDERED LINE containing that text
 *                      (a terminal row or an editor line) — this is how you point at
 *                      "the line that says Hello, world!" without knowing where it is.
 */
/**
 * PATH TOKENS — a demo script must never contain a machine path.
 *
 * PAID FOR: the three SQLite demos pinned their interpreter with an absolute
 * `Set-Alias sq 'C:/Users/<name>/AppData/...'`. `demos/` is TRACKED and this repo is PUBLIC,
 * so committing them would have published the operator's username three times (LAW 0m
 * corollary 2 / LAW 11). The recording itself was always safe — the prompt is primed to show
 * only the workspace leaf — but the SCRIPT was not.
 *
 * So a demo writes a token and the runner resolves it here, at run time, on whatever machine
 * is recording:
 *   {{REPO}}   the repository root
 *   {{TOOLS}}  {{REPO}}/tools — gitignored, where pinned binaries for a course live
 *
 * A demo that needs a pinned tool documents it in `prep.requires` so a fresh clone is told
 * what to put there rather than failing with a confusing shell error.
 */
export const expandTokens = (s) => String(s ?? '')
  .split('{{TOOLS}}').join(path.resolve('tools').split(path.sep).join('/'))
  .split('{{REPO}}').join(path.resolve('.').split(path.sep).join('/'));

export const marksFor = async (page, marks = []) => {
  const out = {};
  for (const m of marks) {
    if (!m?.id) continue;
    let box = null;
    if (m.selector) {
      box = await page.locator(m.selector).first().boundingBox({timeout: 3000}).catch(() => null);
    } else if (m.text) {
      box = await page.evaluate((rawNeedle) => {
        // PAID FOR: MONACO RENDERS EVERY SPACE AS U+00A0 (measured — a probe dumped the
        // char codes of a .view-line and `includes(" ")` was false on all seven lines).
        // xterm uses ordinary spaces, so terminal marks worked and the FIRST editor mark
        // ever authored ("JOIN products p ON p.id = o.product_id") failed to measure and
        // aborted the whole recording. The substitution is one char for one char, so
        // normalising keeps every index the Range below depends on exactly where it was.
        const NBSP = String.fromCharCode(160); // written by code point: an invisible NBSP in a regex literal is a landmine
        const flat = (s) => String(s || '').split(NBSP).join(' ');
        const needle = flat(rawNeedle);
        const rows = Array.from(document.querySelectorAll('.xterm-rows > div, .view-lines .view-line'));
        // last match wins: in a terminal the most recent occurrence is the one meant
        const hit = rows.filter((r) => flat(r.innerText).includes(needle)).pop();
        if (!hit) return null;
        // TIGHT to the TEXT, not to the row. An xterm row is a full-width div, so using
        // its rect drew a highlight stretching the whole terminal instead of around the
        // words. A Range over the matched characters gives the real glyph extent — and
        // the text is usually split across several spans, hence the tree walk.
        const walker = document.createTreeWalker(hit, NodeFilter.SHOW_TEXT);
        const nodes = [];
        let acc = '';
        while (walker.nextNode()) {
          nodes.push({node: walker.currentNode, start: acc.length});
          acc += flat(walker.currentNode.nodeValue); // same 1:1 normalisation as the row test
        }
        const idx = acc.indexOf(needle);
        let r = null;
        if (idx >= 0) {
          const end = idx + needle.length;
          const find = (pos) => {
            let best = nodes[0];
            for (const n of nodes) if (n.start <= pos) best = n;
            return {node: best.node, offset: Math.min(pos - best.start, best.node.nodeValue.length)};
          };
          const a = find(idx);
          const b = find(end);
          try {
            const range = document.createRange();
            range.setStart(a.node, a.offset);
            range.setEnd(b.node, b.offset);
            const rr = range.getBoundingClientRect();
            if (rr.width > 2 && rr.height > 2) r = rr;
          } catch { /* fall through to the row rect */ }
        }
        if (!r) r = hit.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return null;
        return {x: r.x, y: r.y, w: r.width, h: r.height};
      }, m.text).catch(() => null);
      if (box) box = {x: box.x, y: box.y, width: box.w, height: box.h};
    }
    if (!box) {
      throw new Error(
        `Mark "${m.id}" could not be measured (${m.selector ? `selector ${m.selector}` : `text ${JSON.stringify(m.text)}`}). ` +
        `A callout must point at something that is REALLY on screen — the runner will not invent a rectangle.`);
    }
    out[m.id] = {
      x: Math.round(box.x), y: Math.round(box.y),
      w: Math.round(box.width), h: Math.round(box.height),
    };
  }
  return Object.keys(out).length ? out : null;
};

const bboxFor = async (page, focus, table = FOCUS_SELECTORS) => {
  if (!focus) return null;
  // "the whole page" means the VIEWPORT, which is what the capture contains. Using
  // `body` returned the full document rect (measured: 2153px tall in a 900px viewport,
  // and y=-700 after a scroll), which would make any punch-in nonsense.
  if (focus === 'page' || focus === 'window' || focus === 'viewport') {
    const vp = page.viewportSize();
    return vp ? {x: 0, y: 0, w: vp.width, h: vp.height} : null;
  }
  const sel = table[focus] || focus; // allow a raw CSS selector
  try {
    const box = await page.locator(sel).first().boundingBox({timeout: 4000});
    if (!box) return null;
    return {x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height)};
  } catch {
    return null;
  }
};

// ── step actions ─────────────────────────────────────────────────────────────

const actions = {
  /** Run a real command; its output is read back off the screen. */
  // FOCUS THE TERMINAL EXPLICITLY, and do it BEFORE the segment starts. Two bugs, one
  // fix. (a) After an editor step the focus is in the EDITOR, so the command was typed
  // straight into the source file and the run timed out. (b) When the focus command ran
  // INSIDE the timed body, the command palette overlay was captured in the footage —
  // three seconds of a viewer watching me type "Terminal: Focus Terminal". Housekeeping
  // belongs in prepare(); only the performance belongs in the segment.
  async runPrepare(page) {
    await palette(page, 'Terminal: Focus Terminal');
    await sleep(700);
  },
  async run(page, step) {
    const r = await runCommand(page, step.cmd, {
      timeout: step.timeout ?? 120000,
      waitFor: step.waitFor ?? null,
      background: step.background === true,
      settleMs: step.settleMs ?? 2500,
    });
    if (step.expect?.contains && !r.output.includes(step.expect.contains)) {
      throw new Error(
        `Step "${step.id}": expected output to contain ${JSON.stringify(step.expect.contains)}, ` +
        `but the terminal actually said:\n${r.output}`);
    }
    if (step.expect?.exitCode != null && r.exitCode !== step.expect.exitCode) {
      throw new Error(`Step "${step.id}": expected exit code ${step.expect.exitCode}, got ${r.exitCode}`);
    }
    // Forward EVERY field the finalizer and the manifest need. Re-packaging by hand dropped
    // `scrolledLines`, which then rendered as "undefined beyond the window" in the manifest —
    // a small lie in a file whose whole job is to be trustworthy.
    return {
      sent: r.sent, output: r.output, lines: r.lines,
      exitCode: r.exitCode, ok: r.ok, exitCodeSource: r.exitCodeSource,
      scrolled: r.scrolled, scrolledLines: r.scrolledLines, stitchGaps: r.stitchGaps,
      rowCapacity: r.rowCapacity,
      truth: 'read-back', verified: 'terminal buffer',
    };
  },

  /** Complete a scrolled transcript from VS Code's own scrollback. Only when the output
   *  outgrew the window — there is no reason to select text otherwise. */
  async runFinalize(page, step, res) {
    if (!res?.scrolled) return null;
    const rows = await readScrollback(page);
    if (!rows) {
      // Could not read it back: say so rather than passing off the visible tail as the
      // whole thing. The gate treats anything that is not 'read-back' as unshippable.
      return {truth: 'partial-visible-only', verified: 'VISIBLE ROWS ONLY — scrollback unreadable'};
    }
    // Slice this command's output out of the full buffer: after the last echo of the
    // command, up to the trailing prompt.
    let start = -1;
    for (let i = rows.length - 1; i >= 0; i--) if (rows[i].includes(step.cmd)) { start = i; break; }
    const body = (start >= 0 ? rows.slice(start + 1) : rows).filter((l) => l.trim() !== '');
    while (body.length && /[>$#]\s*$/.test(body[body.length - 1])) body.pop();
    return {
      output: body.join(String.fromCharCode(10)),
      lines: body,
      verified: `terminal scrollback (${body.length} lines, ${res.scrolledLines} beyond the window)`,
    };
  },

  /** Open a file via Quick Open, then confirm the editor really holds it.
   *  Ctrl+P is pressed via the PALETTE path because raw Ctrl+P can be swallowed by the
   *  integrated terminal when it holds focus (the terminal forwards most Ctrl chords to
   *  the shell). Escape first, so any leftover widget is dismissed. */
  async openFile(page, step) {
    await page.keyboard.press('Escape');
    await sleep(200);
    await palette(page, 'Go to File');
    await sleep(600);
    await page.keyboard.type(path.basename(step.path), {delay: 45});
    await sleep(1100);
    await page.keyboard.press('Enter');
    await sleep(1600);
    const want = path.basename(step.path).toLowerCase();
    const tabs = await page.locator('.part.editor .tab').allInnerTexts().catch(() => []);
    const active = await page.locator('.part.editor .tab.active').first().innerText().catch(() => '');
    if (!active.toLowerCase().includes(want)) {
      const shot = path.resolve('out/rec-proof', `openfile-fail-${step.id}.png`);
      await page.screenshot({path: shot}).catch(() => {});
      throw new Error(
        `Step "${step.id}": asked to open ${step.path}, but the active tab reads "${active.trim()}".
` +
        `  all tabs: ${JSON.stringify(tabs)}
  screenshot: ${shot}`);
    }
    return {sent: step.path, output: active.trim(), keys: ['Ctrl', 'P'],
            truth: 'read-back', verified: 'active editor tab'};
  },

  /** Type into the active editor, then READ THE EDITOR BACK and confirm it matches.
   *  Monaco's auto-closing/auto-indent/suggestions are disabled for the take, so what
   *  is typed is what appears — but we verify rather than trust that. */
  async typePrepare(page, step) {
    // Focus the editor and place the caret BEFORE the segment starts, for the same
    // reason as runPrepare: a swallowed click sent a whole typed line into the shell,
    // and doing it inside the segment put the palette overlay in the footage.
    await palette(page, 'View: Focus Active Editor Group');
    await sleep(500);
    if (step.at === 'end') { await page.keyboard.press('Control+End'); await sleep(250); }
    if (step.at === 'start') { await page.keyboard.press('Control+Home'); await sleep(250); }
  },
  async type(page, step) {
    const text = step.text ?? '';
    for (const line of text.split('\n')) {
      for (const ch of line) {
        await page.keyboard.type(ch);
        await sleep(Math.max(10, (step.typeDelay ?? 45) + (Math.random() * 2 - 1) * 25));
      }
      await page.keyboard.press('Enter');
      await sleep(90);
    }
    await sleep(600);
    // Read `.view-lines` (the code), NOT `.monaco-editor` — the latter includes the line
    // number gutter, so the read-back came back prefixed with the line numbers 1,2,3...
    const got = await page.locator('.part.editor .monaco-editor .view-lines').first().innerText().catch(() => '');
    const norm = (s) => s.replace(/\s+/g, ' ').trim();
    const firstLine = text.split('\n')[0] || '';
    if (firstLine && !norm(got).includes(norm(firstLine))) {
      throw new Error(
        `Step "${step.id}": typed text was not found in the editor. Monaco may have transformed it.\n` +
        `  wanted (first line): ${JSON.stringify(firstLine)}\n  editor shows: ${JSON.stringify(got.slice(0, 200))}`);
    }
    return {sent: text, output: got.slice(0, 2000), truth: 'read-back', verified: 'editor contents'};
  },

  /**
   * REVEAL — scroll something into view, then PROVE it is in view.
   *
   * The owner's question was the right one: *"how will you even know where to scroll?"*
   * The runner already MEASURES rectangles, and a mark is found by its own TEXT, so
   * "scroll to the line that says X" is the same mechanism as "point at the line that says
   * X" — no line numbers to keep in sync, no pixel offsets to guess.
   *
   *   line     — `Go to Line/Column…` reveals a line in the editor
   *   terminal — `Terminal: Scroll to Previous/Next Command` moves by COMMAND, the unit a
   *              viewer actually thinks in ("go back to the install output")
   *   text     — scrolls the RENDERED row carrying that text into view, wherever it lives
   *   selector — scrolls any element into view
   *
   * It VERIFIES afterwards: the target's rectangle must really be inside the viewport. A
   * scroll command that silently did nothing is exactly the sort of thing that otherwise
   * only shows up in a finished render.
   */
  async reveal(page, step) {
    const where = step.target ?? 'terminal';
    if (step.line != null) {
      await palette(page, 'Go to Line/Column');
      await sleep(500);
      await page.keyboard.type(String(step.line), {delay: 40});
      await sleep(400);
      await page.keyboard.press('Enter');
    } else if (step.selector) {
      await page.locator(step.selector).first().scrollIntoViewIfNeeded({timeout: 8000});
    } else if (step.text) {
      const ok = await page.evaluate((needle) => {
        const rows = Array.from(document.querySelectorAll('.xterm-rows > div, .view-lines .view-line'));
        const hit = rows.filter((r) => (r.innerText || '').includes(needle)).pop();
        if (!hit) return false;
        hit.scrollIntoView({block: 'center'});
        return true;
      }, step.text);
      if (!ok) throw new Error(`Step "${step.id}": nothing on screen contains ${JSON.stringify(step.text)} to scroll to`);
    } else if (where === 'terminal') {
      const cmd = step.direction === 'next' ? 'Terminal: Scroll to Next Command'
        : step.direction === 'bottom' ? 'Terminal: Scroll to Bottom'
          : 'Terminal: Scroll to Previous Command';
      for (let i = 0; i < Math.max(1, Number(step.times ?? 1)); i++) { await palette(page, cmd); await sleep(400); }
    }
    await sleep(step.settleMs ?? 900);

    let seen = null;
    if (step.text) {
      seen = await page.evaluate((needle) => {
        const rows = Array.from(document.querySelectorAll('.xterm-rows > div, .view-lines .view-line'));
        const hit = rows.filter((r) => (r.innerText || '').includes(needle)).pop();
        if (!hit) return null;
        const r = hit.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= window.innerHeight ? (hit.innerText || '').trim() : null;
      }, step.text);
      if (!seen) throw new Error(`Step "${step.id}": scrolled, but ${JSON.stringify(step.text)} is still not in view`);
    }
    return {sent: step.text ?? step.selector ?? `${where}:${step.direction ?? 'previous'}`,
            output: seen ?? '', truth: seen ? 'read-back' : 'no-output',
            verified: seen ? 'target measured inside the viewport after scrolling' : 'scrolled'};
  },

  /**
   * INTERRUPT — stop a live process the way a person does: Ctrl+C.
   *
   * PAID FOR: `background: true` means "do not wait for a prompt", but the process still
   * OCCUPIES the terminal. A later step that TYPED `taskkill …` sent those keystrokes into
   * a shell that was not at a prompt, so nothing ran and the step timed out after 30s with
   * the server still serving. A foreground process is ended by a signal, not by a command.
   *
   * Waits for the prompt to come back, so "I stopped it" is observed rather than assumed.
   */
  async interrupt(page, step) {
    await palette(page, 'Terminal: Focus Terminal');
    await sleep(500);
    await page.keyboard.press('Control+C');
    await sleep(step.settleMs ?? 1200);
    // The shell is only really back when it prints a prompt again.
    const back = await (async () => {
      for (let i = 0; i < 24; i++) {
        const buf = await readBuffer(page);
        const rows = String(buf || '').split(String.fromCharCode(10)).map((l) => l.trimEnd()).filter((l) => l.trim());
        if (rows.length && /[>$#]\s*$/.test(rows[rows.length - 1])) return rows[rows.length - 1];
        await sleep(500);
      }
      return null;
    })();
    if (!back) throw new Error(`Step "${step.id}": sent Ctrl+C but the shell never returned to a prompt`);
    return {sent: '(Ctrl+C)', output: back, keys: ['Ctrl', 'C'], truth: 'read-back',
            verified: 'prompt observed after the interrupt'};
  },

  /** A SECOND terminal, for the common shape where a server holds the first one and you
   *  still need to run something (curl it, run the tests, check a log). */
  async splitTerminal(page, step) {
    await palette(page, 'Terminal: Split Terminal');
    await sleep(1500);
    const n = await page.evaluate(() => document.querySelectorAll('.terminal-tabs-entry').length);
    if (n < 2) throw new Error(`Step "${step.id}": asked to split the terminal but there is still ${n}`);
    return {sent: '(split terminal)', output: `${n} terminals`, truth: 'read-back',
            verified: 'terminal count read from the workbench'};
  },

  /** Two code windows side by side — the shape a tutorial needs when a change in one file
   *  explains a result in another. */
  async splitEditor(page, step) {
    await palette(page, step.direction === 'down' ? 'View: Split Editor Down' : 'View: Split Editor');
    await sleep(900);
    if (step.path) await actions.openFile(page, {id: step.id, path: step.path});
    const groups = await page.locator('.part.editor .editor-group-container').count().catch(() => 0);
    if (groups < 2) throw new Error(`Step "${step.id}": asked to split the editor but there is still ${groups} group`);
    return {sent: '(split editor)', output: `${groups} editor groups`, truth: 'read-back',
            verified: 'editor group count read from the workbench'};
  },

  /** A LIVE FRONTEND, in the same frame as the code that made it.
   *  VS Code's Simple Browser renders a URL in an editor tab, so a dev server started in
   *  the terminal can sit beside its own source — one recorded viewport, no second window,
   *  no OS capture. This is the answer to "I built a frontend and want to show it". */
  async preview(page, step) {
    await palette(page, 'Simple Browser: Show');
    await sleep(900);
    await page.keyboard.type(step.url, {delay: 25});
    await sleep(400);
    await page.keyboard.press('Enter');
    await sleep(step.settleMs ?? 3000);
    const tab = await page.locator('.part.editor .tab.active').first().innerText().catch(() => '');
    if (!/simple browser/i.test(tab)) {
      throw new Error(`Step "${step.id}": Simple Browser did not open (active tab reads "${tab.trim()}")`);
    }

    // VERIFY THE PAGE ACTUALLY RENDERED, not merely that a tab opened.
    // PAID FOR: the first version asserted only "is the tab active", and PASSED while the
    // webview showed a broken-page icon — a green tick over a blank frame, which is the
    // precise failure this whole subsystem exists to prevent. An open tab is not a loaded
    // page. Look INSIDE the webview frames for real content.
    // ── VERIFY THE PAGE, AND NOTHING ELSE ──────────────────────────────────
    // This assertion took FOUR attempts, each accepting weaker evidence than the last:
    //   1. "the tab is active"          -> passed on a broken-page icon
    //   2. "some frame has body text"   -> passed on Chrome's own error page
    //   3. "...that is not error text"  -> passed on the OUTER VS CODE UI, whose body text
    //                                      is the whole workbench
    // The only assertion that means anything is the precise one: a frame LOADED AT THE URL
    // WE ASKED FOR, carrying content. Anything else is evidence about some other document.
    const target = new URL(step.url);
    const BROWSER_ERROR = /connection is blocked|ERR_[A-Z_]+|can.t be reached|refused to connect|took too long to respond/i;
    let content = null;
    let blocked = null;
    let errored = false;
    for (const f of page.frames()) {
      const u = f.url();
      if (u.startsWith('chrome-error://')) { errored = true; continue; }
      let sameDoc = false;
      try {
        const fu = new URL(u);
        sameDoc = fu.origin === target.origin && fu.pathname === target.pathname;
      } catch { continue; }
      if (!sameDoc) continue;               // not the document we asked for
      try {
        const txt = await f.evaluate(() => (document.body ? document.body.innerText : ''));
        const title = await f.title().catch(() => '');
        const flat = String(txt || '').replace(/\s+/g, ' ').trim();
        if (BROWSER_ERROR.test(flat)) { blocked = flat.slice(0, 160); continue; }
        if (flat.length > 10) content = {title, text: flat.slice(0, 160)};
      } catch { /* cross-origin: cannot read, so cannot claim */ }
    }
    if (content && step.expect?.text &&
        !content.text.includes(step.expect.text) && !content.title.includes(step.expect.text)) {
      throw new Error(`Step "${step.id}": the page rendered, but ${JSON.stringify(step.expect.text)} is not on it.
  got: ${JSON.stringify(content.text)}`);
    }
    if (!content) {
      const local = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/i.test(target.hostname);
      throw new Error(
        `Step "${step.id}": Simple Browser opened but NO FRAME loaded ${step.url}` +
        (blocked ? `
  the browser said: ${blocked}` : errored ? ' (the webview reported a load error).' : '.') +
        (local
          ? `
  ROOT CAUSE (measured on this machine): Chrome's Private Network Access policy.` +
            `
  VS Code Web serves the Simple Browser webview from a PUBLIC-looking origin, and` +
            `
  Chrome refuses to let a public page open a connection to the loopback interface.` +
            `
  Not a VS Code setting, and not fixable from the demo. Verified: localhost and` +
            `
  127.0.0.1 are both blocked; an external https URL renders fully.` +
            `
  TO SHOW A LOCAL APP, record it with the BROWSER surface instead —` +
            `
    {"surface": "browser", "prep": {"url": "${step.url}"}}` +
            `
  a real Playwright page reaches localhost fine. Cut it beside the VS Code footage` +
            `
  as its own clip; several clips in one scene is what RECORDED_STEP is for.`
          : `
  The page may be slow: raise "settleMs", or check the URL is reachable.`));
    }
    return {sent: step.url, output: `${content.title}
${content.text}`, truth: 'read-back',
            verified: 'page content read from inside the webview'};
  },

  /** Make the terminal tall, for a step whose output genuinely needs the room. */
  async maximizePanel(page) {
    await palette(page, 'View: Toggle Maximized Panel');
    await sleep(800);
    return {sent: '(toggle maximized panel)', output: '', truth: 'no-output', verified: 'nothing to verify'};
  },

  /** A deliberate look-at-it beat. Nothing happens, on purpose (LAW 0e rule 4).
   *  `no-output` is not a weaker `read-back`: the step makes NO claim about output, so
   *  there is nothing that could be fabricated. The gate distinguishes the two. */
  /**
   * PRESS A SHORTCUT, AND PROVE IT LANDED.
   *
   * Owner: *"You don't wanna always use the search thing you do and execute, some places
   * shortcuts might help you work even faster."* Correct, and there is a second reason: a
   * tutorial that opens the command palette for every action is teaching the palette. A real
   * developer's hands use keys, and the keycap overlay already exists to draw them.
   *
   * The rule this enforces is the one the whole recorder runs on: a dispatched key is NOT a
   * working shortcut. Almost every chord carries a `when` clause, so a press at a workbench
   * focused somewhere else does nothing, throws nothing, and looks exactly like success. So
   * `verify` is REQUIRED - it names the observable that has to move - and the step fails loudly
   * when it does not. `briefs/vscode-shortcuts/verified.json` records which chords have been
   * measured on this surface; do not press one that is not in there.
   *
   *   {action: 'keys', id: 'sidebar', chord: 'ctrl+b', focus: 'editor', verify: 'sidebarToggled'}
   */
  async keysPrepare(page, step) {
    // Focus is housekeeping, so it runs BEFORE t0 and never lands in the captured segment.
    if (step.focus === 'terminal') { await palette(page, 'Terminal: Focus Terminal'); await sleep(600); }
    else if (step.focus === 'editor') { await palette(page, 'View: Focus Active Editor Group'); await sleep(400); }
  },
  async keys(page, step) {
    if (!step.chord) throw new Error(`Step "${step.id}": a keys step needs a "chord", e.g. "ctrl+b".`);
    const check = CHECKS[step.verify];
    if (!check) {
      throw new Error(`Step "${step.id}": a keys step needs "verify" naming an observable. ` +
        `Known: ${Object.keys(CHECKS).join(', ')}. Pressing a chord without checking it is how a ` +
        `shortcut silently does nothing on camera.`);
    }
    const before = await snapshot(page);
    await pressChord(page, step.chord);
    await sleep(step.settleMs ?? 900);
    const after = await snapshot(page);

    const fn = check.length === 2 ? check : check(step.arg);
    const moved = () => Object.keys(after)
      .filter((k) => JSON.stringify(after[k]) !== JSON.stringify(before[k]));
    if (!fn(before, after)) {
      const m = moved();
      throw new Error(`Step "${step.id}": pressed ${step.chord} but "${step.verify}" did not hold. ` +
        (m.length ? `What did move: ${m.join(', ')}.` : 'The workbench did not change at all.') +
        ' Check the chord against its `when` clause and the focus this step set.');
    }
    return {
      sent: `(${step.chord})`,
      output: step.reads ? String(after[step.reads] ?? '') : '',
      keys: capsFor(step.chord),
      truth: 'read-back',
      verified: `${step.verify} held; moved: ${moved().join(', ') || '(nothing measurable)'}`,
    };
  },

  async pause(page, step) {
    await sleep(step.ms ?? 1500);
    return {sent: `(pause ${step.ms ?? 1500}ms)`, output: '', truth: 'no-output', verified: 'nothing to verify'};
  },

  /** Save the active editor, and CONFIRM it saved by checking the tab is no longer
   *  dirty. "I pressed Ctrl+S" is an intention; "the tab stopped showing the unsaved
   *  dot" is evidence. */
  async savePrepare(page) {
    await palette(page, 'View: Focus Active Editor Group');
    await sleep(400);
  },
  async save(page, step) {
    await page.keyboard.press('Control+S');
    await sleep(1400);
    const dirty = await page.locator('.part.editor .tab.active.dirty').count().catch(() => 0);
    if (dirty > 0) throw new Error(`Step "${step.id}": pressed save but the editor tab is still dirty`);
    const title = await page.locator('.part.editor .tab.active').first().innerText().catch(() => '');
    return {sent: '(save)', output: title.trim(), keys: ['Ctrl', 'S'],
            truth: 'read-back', verified: 'editor tab no longer dirty'};
  },
};

// ── the run ──────────────────────────────────────────────────────────────────

export const recordDemo = async (demo, {outDir, keepFrames = false, headless = false} = {}) => {
  const fps = demo.fps ?? 30;
  const theme = demo.theme ?? 'dark'; // owner D7: dark unless asked otherwise
  const viewport = demo.viewport ?? {width: 1600, height: 900};
  const slug = demo.slug;
  if (!slug) throw new Error('demo.json needs a slug');

  const surface = demo.surface ?? 'vscode';
  if (surface === 'browser') return recordBrowserDemo(demo, {outDir, keepFrames, headless});

  const ws = path.resolve('out/rec-ws', demo.workspace || slug);
  fs.mkdirSync(ws, {recursive: true});
  // PREP: scaffold files. Written directly to disk — the workspace is real, and this is
  // setup, not performance. Nothing here is recorded.
  for (const [rel, content] of Object.entries(demo.prep?.files ?? {})) {
    const p = path.join(ws, rel);
    fs.mkdirSync(path.dirname(p), {recursive: true});
    fs.writeFileSync(p, content);
  }

  const rec = path.resolve(outDir || path.join('public/rec', slug));
  fs.rmSync(rec, {recursive: true, force: true, maxRetries: 20, retryDelay: 250});
  fs.mkdirSync(rec, {recursive: true});
  const framesDir = path.join(rec, '.frames');

  // Clear orphaned servers from earlier runs BEFORE starting one. They accumulate silently and
  // starve the machine; ten probe runs left 87 of them and the next render could not allocate
  // five megabytes for ffmpeg. See reapStaleServers.
  const reaped = reapStaleServers();
  if (reaped) console.log(`  reaped ${reaped} stale serve-web process(es) from earlier runs`);
  console.log(`  starting serve-web for ${ws} ...`);
  const server = await startServer({workspace: ws});
  console.log(`  server ready at ${server.url}`);
  const profile = path.resolve('out/rec-profile');
  const ctx = await chromium.launchPersistentContext(profile, {
    headless,
    viewport,
    deviceScaleFactor: 1,
    args: ['--force-device-scale-factor=1'],
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = ctx.pages()[0] || (await ctx.newPage());

  const steps = [];
  let capture = null;
  try {
    // ── PREP (never recorded) ────────────────────────────────────────────────
    console.log('  opening workbench...');
    await openWorkbench(page, server.url);
    console.log('  applying settings...');
    await applySettings(page, server.url, recordingSettings({theme, ...(demo.settings ?? {})}));
    const surf = await verifySurface(page, {theme});
    if (!surf.themeOk) throw new Error(`Theme did not apply: wanted ${theme}, workbench isDark=${surf.isDark}`);
    const prepDid = await prep(page);
    {
      const st = await page.evaluate(() => ({
        tabs: Array.from(document.querySelectorAll('.part.editor .tab')).map((t) => t.innerText.trim()),
        files: Array.from(document.querySelectorAll('.explorer-item')).map((t) => t.innerText.trim()).slice(0, 20),
      }));
      console.log(`  prep: ${prepDid.join(', ')}`);
      console.log(`  after prep -> tabs=${JSON.stringify(st.tabs)} explorer=${JSON.stringify(st.files)}`);
      await page.screenshot({path: path.resolve('out/rec-proof', 'diag-after-prep.png')}).catch(() => {});
    }
    // Open the prep file BEFORE the terminal exists. Once the terminal holds focus it
    // forwards Ctrl chords to the shell, and editor navigation becomes unreliable.
    if (demo.prep?.openFile) await actions.openFile(page, {id: 'prep', path: demo.prep.openFile});
    console.log('  opening terminal...');
    await openTerminal(page);
    await primeTerminal(page);
    for (const cmd of demo.prep?.commands ?? []) {
      await runCommand(page, expandTokens(cmd), {typeDelay: 6, jitter: 0, timeout: 300000});
    }
    await painted(page);
    await sleep(600);

    // ── TAKE ─────────────────────────────────────────────────────────────────
    console.log('  TAKE: capture started');
    capture = await startCapture(page, {dir: framesDir, quality: demo.quality ?? 92});
    await sleep(400); // let the first frame land so t0 always has something behind it

    for (const [i, step] of (demo.steps ?? []).entries()) {
      const fn = actions[step.action];
      if (!fn) throw new Error(`Step "${step.id}": unknown action ${JSON.stringify(step.action)}. ` +
        `Known: ${Object.keys(actions).filter((k) => !k.endsWith('Prepare')).join(', ')}`);

      // PREPARE — focus, caret placement, anything that is housekeeping rather than
      // performance. Runs BEFORE t0, so none of it lands in the segment.
      const prepFn = actions[`${step.action}Prepare`];
      if (prepFn) await prepFn(page, step);
      await painted(page);
      await sleep(250);
      const t0 = Date.now();
      const res = await fn(page, step);
      // HOLD: let the finished state sit on screen so the segment's last frame — the one
      // the renderer freezes on while the voice catches up — shows the RESULT, not the
      // instant it completed.
      await sleep(step.holdMs ?? 700);
      await painted(page);
      const t1 = Date.now();

      // FINALIZE — runs AFTER t1, so anything it does on screen is outside the segment.
      // This is where a scrolled transcript is completed: the FOOTAGE shows what was on
      // screen (honest), and the MANIFEST records what the command actually printed
      // (also honest) — two different scopes, both true, neither guessed.
      const finFn = actions[`${step.action}Finalize`];
      if (finFn) Object.assign(res, (await finFn(page, step, res)) || {});

      const bbox = await bboxFor(page, step.focus ?? (step.action === 'run' ? 'terminal' : 'editor'));
      // Marks are measured AFTER the step settles, so they point at the finished state.
      const marks = await marksFor(page, step.marks);
      steps.push({
        marks,
        id: step.id ?? `step-${i + 1}`,
        index: i,
        action: step.action,
        label: step.label ?? null,
        tStart: t0,
        tEnd: t1,
        bbox,
        ...res,
      });
      console.log(`  [${i + 1}/${demo.steps.length}] ${step.id}  ${((t1 - t0) / 1000).toFixed(2)}s` +
                  `${res.exitCode != null ? `  exit=${res.exitCode}` : ''}`);
    }

    await capture.stop();
    console.log(`\ncaptured ${capture.frameCount()} screencast frames; cutting segments...`);

    // ── cut one CFR segment per step ─────────────────────────────────────────
    for (const [i, s] of steps.entries()) {
      const file = `seg-${String(i + 1).padStart(2, '0')}.mp4`;
      const step = (demo.steps ?? [])[i] ?? {};
      const info = capture.segment({t0: s.tStart, t1: s.tEnd, out: path.join(rec, file), fps,
        maxHoldMs: step.maxHoldMs ?? demo.maxHoldMs});
      s.trimmedFrames = info.trimmedFrames;
      s.segment = file;
      s.segmentFrames = info.frames;
      s.durationMs = s.tEnd - s.tStart;
      // wall-clock ms are an implementation detail; the manifest carries seconds relative
      // to the first step, which is what a human reads and what a spec author reasons about.
      console.log(`  ${file}  ${info.frames} frames @${fps}fps  (${(s.durationMs / 1000).toFixed(2)}s)` +
        (info.trimmedFrames ? `  [dead air trimmed: ${info.trimmedFrames}f]` : ''));
    }
    const base = steps.length ? steps[0].tStart : 0;
    for (const s of steps) {
      s.tStart = +((s.tStart - base) / 1000).toFixed(3);
      s.tEnd = +((s.tEnd - base) / 1000).toFixed(3);
      delete s.durationMs;
    }
  } finally {
    try { await capture?.stop(); } catch { /* already stopped */ }
    await ctx.close();
    await server.stop();
    if (!keepFrames) fs.rmSync(framesDir, {recursive: true, force: true, maxRetries: 20, retryDelay: 250});
  }

  const manifest = {
    slug,
    surface: demo.surface ?? 'vscode',
    schema: 1,
    recordedAt: new Date().toISOString(),
    env: {
      os: os.platform(),
      node: process.version,
      vscode: vscodeVersion(),
      playwright: JSON.parse(fs.readFileSync('node_modules/playwright/package.json', 'utf8')).version,
    },
    theme,
    viewport,
    fps,
    workspace: path.basename(ws),
    steps,
  };
  fs.writeFileSync(path.join(rec, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return {manifest, dir: rec};
};

// ── BROWSER SURFACE ──────────────────────────────────────────────────────────
// Same contract, same capture, same manifest — a different stage. Kept in one file with
// the VS Code path so the TAKE loop (mark, perform, hold, cut, measure) exists once and
// cannot drift between surfaces.
export const recordBrowserDemo = async (demo, {outDir, keepFrames = false, headless} = {}) => {
  const fps = demo.fps ?? 30;
  const slug = demo.slug;
  const viewport = demo.viewport ?? {width: 1600, height: 900};
  const rec = path.resolve(outDir || path.join('public/rec', slug));
  fs.rmSync(rec, {recursive: true, force: true, maxRetries: 20, retryDelay: 250});
  fs.mkdirSync(rec, {recursive: true});
  const framesDir = path.join(rec, '.frames');

  const {page, teardown} = await setupBrowser({...demo, headless: headless ?? demo.headless ?? true});
  const steps = [];
  let capture = null;
  try {
    console.log('  TAKE: capture started');
    capture = await startCapture(page, {dir: framesDir, quality: demo.quality ?? 92});
    await sleep(400);

    for (const [i, step] of (demo.steps ?? []).entries()) {
      const fn = browserActions[step.action];
      if (!fn) {
        throw new Error(`Step "${step.id}": unknown browser action ${JSON.stringify(step.action)}. ` +
          `Known: ${Object.keys(browserActions).join(', ')}`);
      }
      await painted(page);
      const t0 = Date.now();
      const res = await fn(page, step);
      await sleep(step.holdMs ?? 700);
      await painted(page);
      const t1 = Date.now();

      const bbox = await bboxFor(page, step.focus ?? 'page', BROWSER_FOCUS);
      const marks = await marksFor(page, step.marks);
      steps.push({id: step.id ?? `step-${i + 1}`, index: i, action: step.action,
                  label: step.label ?? null, tStart: t0, tEnd: t1, bbox, marks, ...res});
      console.log(`  [${i + 1}/${demo.steps.length}] ${step.id}  ${((t1 - t0) / 1000).toFixed(2)}s`);
    }

    await capture.stop();
    console.log(`\ncaptured ${capture.frameCount()} screencast frames; cutting segments...`);
    for (const [i, st] of steps.entries()) {
      const file = `seg-${String(i + 1).padStart(2, '0')}.mp4`;
      const step = (demo.steps ?? [])[i] ?? {};
      const info = capture.segment({t0: st.tStart, t1: st.tEnd, out: path.join(rec, file), fps,
        maxHoldMs: step.maxHoldMs ?? demo.maxHoldMs});
      st.trimmedFrames = info.trimmedFrames;
      st.segment = file;
      st.segmentFrames = info.frames;
      console.log(`  ${file}  ${info.frames} frames @${fps}fps` +
        (info.trimmedFrames ? `  [dead air trimmed: ${info.trimmedFrames}f]` : ''));
    }
    const base = steps.length ? steps[0].tStart : 0;
    for (const st of steps) {
      st.tStart = +((st.tStart - base) / 1000).toFixed(3);
      st.tEnd = +((st.tEnd - base) / 1000).toFixed(3);
    }
  } finally {
    try { await capture?.stop(); } catch { /* already stopped */ }
    await teardown();
    if (!keepFrames) fs.rmSync(framesDir, {recursive: true, force: true, maxRetries: 20, retryDelay: 250});
  }

  const manifest = {
    slug, surface: 'browser', schema: 1,
    recordedAt: new Date().toISOString(),
    env: {
      os: os.platform(), node: process.version,
      playwright: JSON.parse(fs.readFileSync('node_modules/playwright/package.json', 'utf8')).version,
    },
    theme: demo.theme ?? 'dark',
    viewport, fps, startUrl: demo.prep?.url ?? null,
    steps,
  };
  fs.writeFileSync(path.join(rec, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return {manifest, dir: rec};
};
