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
  recordingSettings, vscodeVersion, palette, reapStaleServers, PRIMARY, maximizeTerminalPanel,
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

// ── WHERE THE INK ACTUALLY IS ────────────────────────────────────────────────────────
//
// Owner, on the glassmorphic card: *"I dont know how it will hold when you are explaining
// the code base, it will definitely overlap right."*
//
// He is describing a defect that had already shipped twice. The card's placement solver
// only knew about MARKS — the two or three rectangles a step happened to author a callout
// on — and treated everything else as empty. On a full IDE screen that is a fiction: the
// proof frame shows the card's top edge cutting through `ORDER BY revenue DESC;`, because
// nothing had told the solver line 7 was there. The three earlier attempts at this (a
// height estimate, then a "compact mode", then a scrim) all failed for the same reason —
// each was a guess standing in for a measurement.
//
// So MEASURE it. Every rendered text row in the editor and the terminal, read off the DOM
// at the moment the frame is captured, tightened onto its glyphs (a row's own rect is the
// width of its PANE in both renderers, which would make an empty screen look full), then
// merged with its neighbours so a 20-line listing costs one rectangle instead of twenty.
//
// Returned in the same capture-pixel space as marks, so RecordedStep can score a candidate
// card position against it without converting anything.
export const inkFor = async (page) => {
  const got = await page.evaluate(() => {
    const NBSP = String.fromCharCode(160);
    const flat = (v) => String(v || '').split(NBSP).join(' ');
    // The glyph extent of a row: from its first non-space character to its last.
    const glyphBox = (el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let first = null, last = null, firstOff = -1, lastOff = -1;
      while (walker.nextNode()) {
        const v = flat(walker.currentNode.nodeValue);
        for (let i = 0; i < v.length; i++) {
          if (v[i] === ' ') continue;
          if (!first) { first = walker.currentNode; firstOff = i; }
          last = walker.currentNode; lastOff = i + 1;
        }
      }
      if (!first) return null;
      try {
        const range = document.createRange();
        range.setStart(first, firstOff);
        range.setEnd(last, lastOff);
        const r = range.getBoundingClientRect();
        if (r.width > 2 && r.height > 2) return {x: r.x, y: r.y, w: r.width, h: r.height};
      } catch { /* fall through to the row rect */ }
      const r = el.getBoundingClientRect();
      return {x: r.x, y: r.y, w: r.width, h: r.height};
    };
    const out = [];
    // THE VIEWPORT IS MEASURED FOR BOTH SURFACES, not just the browser one. It used to be
    // declared below, after the VS Code early-return, and that early return handed back a
    // bare ARRAY while the browser path handed back `{rects, vp}`. The caller reads
    // `got.rects`, which is `undefined` on an array — so from the moment the browser branch
    // landed, EVERY VS Code recording measured its ink correctly and then threw it away,
    // and `ink: null` reads as "the screen is empty" to the overlay solver. Caught by
    // check-recordings, which exists for exactly this: a measurement that fails soft.
    const VP = {w: window.innerWidth, h: window.innerHeight};
    const rows = [
      ...document.querySelectorAll('.view-lines .view-line'),
      ...document.querySelectorAll('.xterm-rows > div'),
    ];
    for (const el of rows) {
      if (!flat(el.innerText).trim()) continue;   // an empty line is genuinely free space
      const b = glyphBox(el);
      if (b && b.w >= 6 && b.h >= 3) out.push(b);
    }
    if (out.length) return {rects: out, vp: VP};

    // ── A WEB PAGE HAS NO `.view-line`, AND SILENCE IS THE WRONG ANSWER ──────────────
    //
    // Both selectors above are VS Code's. On the BROWSER surface neither matches, so this
    // returned an empty list and every browser recording ever made told the overlay solver
    // the page was empty space. Measured on public/rec/fable-page: ink 0 on all four steps.
    // The visible cost, pulled from the Fable long cut at frame 2101: *"the one it
    // replaces"* placed itself directly on top of the `60.9% (Mythos 5.1)` sub-label — the
    // solver had nothing to charge it for, so a free lunch beat the free margin beside it.
    // Owner, twice: *"component overlay over the recording completely hides it."*
    //
    // A page's ink is its TEXT LINES, not its elements: a <p> rect spans the column even
    // where the last line stops halfway, and a <section> rect is the whole band. So walk
    // the text nodes and take Range.getClientRects(), which returns ONE RECT PER RENDERED
    // LINE — the web equivalent of `.view-line`, and the same shape the merge below wants.
    // Replaced content (images, canvases, video, svg) is ink too, and has no text node.
    const clip = (r) => {
      const x0 = Math.max(r.left, 0), y0 = Math.max(r.top, 0);
      const x1 = Math.min(r.right, VP.w), y1 = Math.min(r.bottom, VP.h);
      return x1 - x0 > 2 && y1 - y0 > 2 ? {x: x0, y: y0, w: x1 - x0, h: y1 - y0} : null;
    };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!flat(node.nodeValue).trim()) continue;
      const parent = node.parentElement;
      if (!parent) continue;
      // Text that is present in the DOM and not on the screen is not ink. `visibility`
      // and `opacity` matter as much as `display` — an off-screen menu is typically the
      // first, a fade-in the second.
      const cs = getComputedStyle(parent);
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.05) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) {
        const b = clip(r);
        if (b && b.w >= 6 && b.h >= 3) out.push(b);
      }
    }
    for (const el of document.querySelectorAll('img,svg,canvas,video,picture')) {
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.05) continue;
      const b = clip(el.getBoundingClientRect());
      if (!b || b.w < 12 || b.h < 12) continue;
      // A FULL-BLEED BACKDROP IS NOT AN OBSTACLE. A hero image behind the headline covers
      // the viewport, and a rectangle that covers everything scores every candidate the
      // same — which is the no-ink blindness again, wearing a number. What an overlay has
      // to stay off is the TEXT sitting on the backdrop, and that is already collected
      // above. Measured: the Anthropic hero returned exactly one 1600x900 rect.
      if (b.w >= 0.92 * VP.w && b.h >= 0.6 * VP.h) continue;
      out.push(b);
    }
    return {rects: out, vp: VP};
  }).catch(() => ({rects: [], vp: null}));

  const rows = got.rects || [];
  const vp = got.vp;

  const sorted = rows
    .map((r) => ({x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h)}))
    .sort((a, b) => a.y - b.y || a.x - b.x);

  // MERGE VERTICALLY, WITHIN A COLUMN. Two rows that are vertically adjacent AND share most
  // of their horizontal extent are one block of text as far as "is there room here" goes.
  //
  // ⚠ THE OVERLAP TEST HAS TO BE A RATIO, NOT A TOLERANCE. This used to merge whenever the
  // next row started within 24px of the running block's right edge, against the LAST block
  // only. In an editor pane that is correct — the lines are one narrow column and they are
  // genuinely one blob. On a web page it chains: each row touches the block the previous row
  // just widened, so the block grows until it spans the viewport and every later row lands
  // inside it. Measured on the first browser capture with ink: 4 steps, **1-2 blocks each**,
  // one of them the whole page. A single page-sized rectangle charges every candidate the
  // same amount, which leaves the solver exactly as blind as it was with no ink at all — the
  // failure looks fixed in the manifest and is not fixed on screen.
  //
  // Requiring the overlap to be most of the NARROWER row keeps table columns apart, and
  // column gutters are precisely the free space an overlay wants on a dense page. Scanning
  // every open block rather than only the last one matters for the same reason: rows of a
  // table arrive interleaved by y, so the column a row belongs to is usually not the block
  // that happens to be on the end.
  const OVERLAP = 0.6;
  const blocks = [];
  for (const r of sorted) {
    let host = null;
    for (let i = blocks.length - 1; i >= 0 && blocks.length - i <= 300; i--) {
      const b = blocks[i];
      const gap = r.y - (b.y + b.h);
      if (gap > Math.max(6, r.h * 0.6)) continue;          // too far below to be the same run
      const ov = Math.min(b.x + b.w, r.x + r.w) - Math.max(b.x, r.x);
      if (ov <= 0) continue;
      if (ov < OVERLAP * Math.min(b.w, r.w)) continue;     // a neighbouring column, not this one
      host = b;
      break;
    }
    if (host) {
      const x1 = Math.max(host.x + host.w, r.x + r.w);
      const y1 = Math.max(host.y + host.h, r.y + r.h);
      host.x = Math.min(host.x, r.x);
      host.y = Math.min(host.y, r.y);
      host.w = x1 - host.x;
      host.h = y1 - host.y;
    } else {
      blocks.push({...r});
    }
  }
  // A cap, because this rides in the spec JSON. The SQLite acts measure 4-9 blocks after the
  // merge, so 24 was slack for an EDITOR; a web page is denser and less regular — the
  // Anthropic benchmark table alone merges to 20-odd blocks — so the browser branch needs
  // more headroom. 48 rectangles is ~2KB per step, which the manifest can afford. The
  // biggest are the ones that matter, so drop the smallest rather than whatever happens
  // to be last.
  // The same argument, applied after the merge: a run of text rows can legitimately merge
  // into something viewport-sized, and it is no more useful as an obstacle than the
  // backdrop was. Drop it rather than let it flatten the scoring.
  const useful = vp
    ? blocks.filter((b) => !(b.w >= 0.92 * vp.w && b.h >= 0.6 * vp.h))
    : blocks;
  return useful.length
    ? useful.sort((a, b) => b.w * b.h - a.w * a.h).slice(0, 48).sort((a, b) => a.y - b.y)
    : null;
};

// ── WHAT DOES THIS STEP ACTUALLY SHOW? ───────────────────────────────────────────────
//
// Owner, on a finished cut: *"you speak about comparison table, but you are showing this
// first, later you show the table — why so?"*
//
// The cause was not a timing bug. The beat was cast with the `bench` step because the demo
// labelled it "the benchmark they lead with" and its mark read "Terminal-Bench-Science 0.1",
// so I wrote `label: 'scrolling to the table'` and never opened the footage. `bench` lands on
// a SCATTER CHART headed "A new performance frontier". The narration described a table over a
// picture of something else, for nine seconds, and nothing in the spec could have told me:
// the clip carried an id, a frame count, a bbox and marks — nothing that says what is ON IT.
//
// So the capture now records the step's own heading, `bake-rec` bakes it into the clip as
// `shows`, and the spec reads:
//     {label: 'scrolling to the table', shows: 'A new performance frontier'}
// which is a contradiction you cannot skim past. LAW 0k's remedy is "audit by still, not by
// render"; this is the same argument made cheap enough to be automatic.
export const headingFor = async (page) => {
  const h = await page.evaluate(() => {
    const vis = (el) => {
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.05) return false;
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0 && r.width > 40 && r.height > 8;
    };
    const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    // ── VS CODE FIRST, BECAUSE ITS HEADINGS DESCRIBE THE FURNITURE ──────────────────
    //
    // The workbench has real <h2>-shaped headings and they all say things like EXPLORER,
    // OUTLINE and TIMELINE — the names of panels, not of what the step is showing. Every
    // clip in the first episode-3 preflight reported `EXPLORER`, which is worse than
    // useless: the report exists so a label and the screen can be caught disagreeing, and
    // a constant agrees with nothing. What a VS Code step actually shows is the last
    // command in the terminal, or the file open in the editor.
    const term = [...document.querySelectorAll('.xterm-rows > div')]
      .map((r) => clean(r.innerText)).filter(Boolean);
    if (term.length) {
      // the last line that looks like a prompt with a command on it
      for (let i = term.length - 1; i >= 0; i--) {
        const m = term[i].match(/[>$#]\s+(\S.*)$/);
        if (m && m[1].length > 1) return `$ ${m[1]}`;
      }
    }
    const tab = document.querySelector('.part.editor .tab.active');
    if (tab && vis(tab)) {
      const name = clean(tab.innerText);
      if (name) {
        const line = document.querySelector('.view-lines .view-line.current-line, .view-overlays .current-line');
        const at = line ? clean(line.innerText) : '';
        return at ? `${name} — ${at}` : name;
      }
    }
    // A real heading next — that is what a PAGE uses to say what you are looking at.
    for (const sel of ['h1', 'h2', 'h3']) {
      const hits = [...document.querySelectorAll(sel)].filter(vis);
      if (hits.length) {
        hits.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        const txt = clean(hits[0].innerText);
        if (txt) return txt;
      }
    }
    // No heading in view (a terminal, an editor, a table mid-scroll): fall back to the
    // largest type on screen, which is what a reader's eye lands on anyway.
    let best = null, bestSize = 0;
    for (const el of document.querySelectorAll('body *')) {
      if (el.children.length || !vis(el)) continue;
      const txt = clean(el.textContent);
      if (txt.length < 3) continue;
      const size = parseFloat(getComputedStyle(el).fontSize) || 0;
      if (size > bestSize) { bestSize = size; best = txt; }
    }
    return best;
  }).catch(() => null);
  return h || null;
};

// ── THE FRAME MAY NOT CARRY THE OPERATOR'S IDENTITY ─────────────────────────────────
//
// The `clear` after prep fixes the leak that shipped; this makes a new one impossible to
// ship quietly. `demos/` writes {{TOOLS}} and {{REPO}}, but expandTokens resolves those to
// real machine paths at run time, and anything TYPED with one in it lands in the footage —
// which then goes to YouTube. Grepping the demo JSON would not have caught it: the JSON was
// clean and the SCREEN was not.
//
// Reads what is actually rendered, per step, and throws rather than letting a take finish
// and be discovered later at render time (LAW 0m corollary 2, LAW 11).
export const assertNoIdentity = async (page, stepId) => {
  const home = (process.env.USERPROFILE || process.env.HOME || '').split(path.sep).join('/');
  const repo = path.resolve('.').split(path.sep).join('/');
  // A PATH IS NOT THE ONLY SHAPE IDENTITY TAKES.
  //
  // This guard checked two paths, and the leak it exists to stop showed up in neither. The
  // default shell prompt on macOS and Linux is `user@host dir %`, so the FIRST frame of the
  // first recording made on a Mac carried the operator's handle and machine name — and this
  // function passed it, because "<handle>@<machine>" contains no path.
  //
  // That is the same miss as the 2026-08-30 repo-wide incident, whose write-up says it
  // exactly: check-publish-safety's HOME_PATH rule "only recognises a username when a path
  // prefix precedes it. `<handle>@box` is not a path." The gate was fixed there and this
  // guard was not, so the identical hole stayed open one layer down.
  //
  // Matched forms are the ones identity actually takes on a terminal, not a bare username:
  // `user@` (prompt / git / ssh) and the machine hostname. A bare short username is
  // deliberately NOT a needle — it false-positives on ordinary words and an aborted take is
  // expensive.
  let user = '';
  try { user = String(os.userInfo().username || ''); } catch { /* container with no passwd entry */ }
  const host = String(os.hostname() || '').split('.')[0];
  const needles = [
    ...[home, repo].filter((n) => n && n.length > 8),
    ...(user.length >= 3 ? [`${user}@`] : []),
    ...(host.length >= 6 ? [host] : []),
  ];
  if (!needles.length) return;
  const text = await page.evaluate(() => {
    const rows = [
      ...document.querySelectorAll('.view-lines .view-line'),
      ...document.querySelectorAll('.xterm-rows > div'),
    ];
    // Joined with a newline so a path that wraps across two rows is still one string here.
    return rows.map((r) => String(r.innerText || '')).join('\n');
  }).catch(() => '');
  // Windows prints backslashes; the needles are built with forward ones.
  const flat = String(text).split('\\').join('/');
  for (const n of needles) {
    // Case-insensitive: Windows prints the same path with either casing.
    if (flat.toLowerCase().includes(n.toLowerCase())) {
      throw new Error(
        `Step "${stepId}": a MACHINE PATH is visible on screen (matched ${JSON.stringify(n)}). ` +
        `The footage is published; the operator's identity may not be in it. Clear the terminal ` +
        `before the take, or run the command from a directory that keeps the path short.`);
    }
  }
};

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
        // WHICH ELEMENTS CAN HOLD A MARK depends on the SURFACE.
        //
        // This used to look only at `.xterm-rows > div` and `.view-lines .view-line` — the
        // two containers VS Code renders text into. On the BROWSER surface an ordinary web
        // page has neither, so a text mark could never resolve and `marks` was effectively
        // selector-only there. That is the wrong half to lose: highlighting a phrase you
        // did not write (a number in someone else's benchmark table) is the whole point of
        // recording a page, and a CSS selector for it is brittle where the words are not.
        //
        // VS Code rows stay FIRST and keep "last match wins" — in a terminal the most
        // recent occurrence is the one meant. Only when there are no such rows does this
        // fall back to the document, where the FIRST match is the right one because a page
        // is read top to bottom. Smallest matching element, so the range is tight to the
        // phrase rather than to a section wrapper that happens to contain it.
        const rows = Array.from(document.querySelectorAll('.xterm-rows > div, .view-lines .view-line'));
        let hit = rows.filter((r) => flat(r.innerText).includes(needle)).pop();
        if (!hit && !rows.length) {
          const cands = Array.from(document.querySelectorAll('body *')).filter((el) => {
            if (!el.childNodes.length) return false;
            // only elements whose OWN text carries the needle, not every ancestor of one
            const own = Array.from(el.childNodes)
              .filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join('');
            if (!flat(own).includes(needle)) return false;
            const r = el.getBoundingClientRect();
            return r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < window.innerHeight;
          });
          hit = cands.sort((a, b) => {
            const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
            return (ra.width * ra.height) - (rb.width * rb.height);
          })[0] ?? null;
        }
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
    // Document start/end is not one chord across platforms: macOS VS Code binds
    // cursorBottom/cursorTop to Cmd+Down / Cmd+Up, and Ctrl+End is unbound there.
    const [toEnd, toStart] = os.platform() === 'darwin'
      ? ['Meta+ArrowDown', 'Meta+ArrowUp']
      : ['Control+End', 'Control+Home'];
    if (step.at === 'end') { await page.keyboard.press(toEnd); await sleep(250); }
    if (step.at === 'start') { await page.keyboard.press(toStart); await sleep(250); }
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
        // MONACO WRITES NON-BREAKING SPACES. A `.view-line` renders both its indentation
        // AND its interior spaces as U+00A0, so `"return sorted(odd)"` is on screen, is in
        // the DOM, and does not `.includes()` the string a human typed into the demo. The
        // first take of the episode-3 editor beat failed on exactly that, twice, with the
        // line plainly visible in a screenshot — so normalise before comparing, on BOTH
        // sides, for every surface. xterm's rows are unaffected; this costs them nothing.
        const flat = (s) => String(s || '').replace(/\u00a0/g, ' ');
        const want = flat(needle);
        const rows = Array.from(document.querySelectorAll('.xterm-rows > div, .view-lines .view-line'));
        const hit = rows.filter((r) => flat(r.innerText).includes(want)).pop();
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
        const flat = (s) => String(s || '').replace(/\u00a0/g, ' ');   // see the note above
        const want = flat(needle);
        const rows = Array.from(document.querySelectorAll('.xterm-rows > div, .view-lines .view-line'));
        const hit = rows.filter((r) => flat(r.innerText).includes(want)).pop();
        if (!hit) return null;
        const r = hit.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= window.innerHeight ? flat(hit.innerText).trim() : null;
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
    else if (step.focus === 'editor') {
      // CLICK THE EDITOR. DO NOT ASK THE PALETTE FOR IT.
      //
      // Driving `View: Focus Active Editor Group` through the palette types a sentence and presses
      // Enter, and both of those need the palette to have actually opened. When it had not — focus
      // sitting in a search box, a widget still closing — the sentence went into the FILE instead,
      // and the palette's Enter picked whatever was highlighted. Pulled from the finished render:
      // a settings.json open, dirty, with "View: Focus Active Editor Group" typed as line one, on
      // screen for a whole beat. The recording verified every step and still showed a mangled
      // artefact, because each step checked its own chord and nothing checked the workspace.
      //
      // A click cannot be swallowed and cannot type anything.
      await page.keyboard.press('Escape');
      await sleep(150);
      const box = await page.locator('.part.editor .monaco-editor .view-lines').first()
        .boundingBox().catch(() => null);
      if (box) { await page.mouse.click(box.x + 40, box.y + 10); }
      await sleep(400);
    }
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
    await page.keyboard.press(`${PRIMARY}+S`);
    await sleep(1400);
    const dirty = await page.locator('.part.editor .tab.active.dirty').count().catch(() => 0);
    if (dirty > 0) throw new Error(`Step "${step.id}": pressed save but the editor tab is still dirty`);
    const title = await page.locator('.part.editor .tab.active').first().innerText().catch(() => '');
    return {sent: '(save)', output: title.trim(), keys: ['Ctrl', 'S'],
            truth: 'read-back', verified: 'editor tab no longer dirty'};
  },
};

// ── the run ──────────────────────────────────────────────────────────────────

/**
 * WHERE A RECORDING WORKSPACE LIVES — and why it is not under the repo.
 *
 * It used to be `out/rec-ws/<name>`, i.e. under the repo, i.e. under the operator's home
 * directory. That is fine for a tool that prints nothing about where it is, and fatal for
 * one that does. Measured with uv 0.12.9: a plain `uv add rich` prints
 *
 *     Building demo @ file:///Users/<operator>/iauteur/out/rec-ws/uv-tour
 *
 * on every dependency change. `assertNoIdentity()` catches it and aborts the take — which
 * is the guard doing its job, and it makes the take IMPOSSIBLE rather than safe: there is
 * no way to run a path-printing tool from inside the repo without the home path on camera.
 *
 * So the workspace moves somewhere short and identity-free. Everything the recording needs
 * is scaffolded per run, so nothing is lost by leaving the repo.
 *
 * `IAUTEUR_REC_WS` overrides. On Windows `os.tmpdir()` is NOT a candidate: it resolves to
 * C:\Users\<name>\AppData\Local\Temp, which is the very thing being avoided.
 */
export const recWsRoot = () => {
  const override = process.env.IAUTEUR_REC_WS;
  if (override) return path.resolve(override);
  if (os.platform() === 'win32') {
    const drive = path.parse(path.resolve('.')).root; // e.g. "D:\\"
    const candidate = path.join(drive, 'iauteur-rec');
    try { fs.mkdirSync(candidate, {recursive: true}); return candidate; } catch { /* fall through */ }
    // A managed machine may refuse the drive root. Keep the old location rather than fail,
    // and let assertNoIdentity be the backstop it already is.
    return path.resolve('out/rec-ws');
  }
  return path.join('/tmp', 'iauteur-rec');
};

export const recordDemo = async (demo, {outDir, keepFrames = false, headless = false} = {}) => {
  const fps = demo.fps ?? 30;
  const theme = demo.theme ?? 'dark'; // owner D7: dark unless asked otherwise
  const viewport = demo.viewport ?? {width: 1600, height: 900};
  const slug = demo.slug;
  if (!slug) throw new Error('demo.json needs a slug');

  const surface = demo.surface ?? 'vscode';
  if (surface === 'browser') return recordBrowserDemo(demo, {outDir, keepFrames, headless});

  const ws = path.join(recWsRoot(), demo.workspace || slug);
  fs.mkdirSync(ws, {recursive: true});
  // PREP: scaffold files. Written directly to disk — the workspace is real, and this is
  // setup, not performance. Nothing here is recorded.
  for (const [rel, content] of Object.entries(demo.prep?.files ?? {})) {
    const p = path.join(ws, rel);
    fs.mkdirSync(path.dirname(p), {recursive: true});
    fs.writeFileSync(p, content);
  }
  // BINARY FIXTURES. `prep.files` writes strings, which cannot express a PNG — and the owner
  // asked for the pipeline to be proved against "viewing images / viewing different types of text
  // files". `prep.copy` brings a REAL file in from the repo, so an image beat shows an actual
  // image rather than something drawn to look like one (LAW 0m).
  for (const [rel, src] of Object.entries(demo.prep?.copy ?? {})) {
    const from = path.resolve(src);
    if (!fs.existsSync(from)) {
      throw new Error(`prep.copy: "${src}" does not exist. A demo may not reference a fixture ` +
        `that is not in the repo — the recording would silently open an empty editor.`);
    }
    const p = path.join(ws, rel);
    fs.mkdirSync(path.dirname(p), {recursive: true});
    fs.copyFileSync(from, p);
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
    await openWorkbench(page, server.url, {workspace: ws, boundByFlag: server.boundByFlag});
    console.log('  applying settings...');
    await applySettings(page, server.url, recordingSettings({theme, ...(demo.settings ?? {})}),
      {workspace: ws, boundByFlag: server.boundByFlag});
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
    if (demo.maximizePanel === true) {
      console.log('  ' + await maximizeTerminalPanel(page));
    }
    await primeTerminal(page);
    for (const cmd of demo.prep?.commands ?? []) {
      await runCommand(page, expandTokens(cmd), {typeDelay: 6, jitter: 0, timeout: 300000});
    }
    // WIPE THE PREP SCROLLBACK BEFORE THE CAMERA ROLLS.
    //
    // PAID FOR, and it reached a finished cut: the shorts proof frame shows
    // `Set-Alias sq 'C:/Users/<name>/projects/iauteur/tools/sqlite/sqlite3.exe'` sitting in
    // the terminal for the whole beat. The DEMO is clean — it writes {{TOOLS}} — but
    // expandTokens resolves that to a real machine path at run time and prep TYPES it, so
    // the operator's username was on screen in footage headed for YouTube (LAW 0m
    // corollary 2 / LAW 11). primeTerminal already clears after installing its hook; prep
    // then wrote three more lines and nothing cleared them.
    //
    // It is also just better production. Prep is setup, not performance: the take should
    // open on a clean prompt, not on somebody's rummaging.
    if ((demo.prep?.commands ?? []).length) {
      await runCommand(page, 'clear', {typeDelay: 4, jitter: 0});
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

      // START THIS BEAT ON A CLEAN SCREEN.
      //
      // A terminal ACCUMULATES. By the sixth step the frame held every command from the
      // first five, the beat's own output was somewhere in the middle of a wall of text,
      // and — because the panel is maximised — the ink reached the bottom edge. That left
      // the overlay solver no ink-free band, so the caption card was placed ON the live
      // output and the bottom scrim dimmed the lines being explained. Measured on the
      // shipped cut: terminal ink to y=846 with the card starting at y=800.
      //
      // Clearing before the mark fixes all three at once and is what a person
      // demonstrating something actually does. It runs BEFORE t0, so the clear itself is
      // outside the segment and never appears in the footage.
      if (step.clearFirst) {
        // Only clear when there is something to clear. `runCommand` completes on "the
        // buffer CHANGED and now ends at a prompt", and clearing an already-empty screen
        // changes nothing — so the very first beat, which follows prep's own clear, sat
        // through the full 120s timeout on a command that had worked. Gotcha 9 records the
        // same shape for the "must have GROWN" version of this check.
        const rows = String(await readBuffer(page) ?? '').split('\n').filter((l) => l.trim());
        if (rows.length > 1) {
          await runCommand(page, 'clear', {typeDelay: 4, jitter: 0});
          await painted(page);
          await sleep(200);
        }
      }

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
      // EVERY COMMAND MARKS ITSELF.
      //
      // Owner: *"I would like you to highlight the queries each and every time you are executing,
      // just helps users to focus on where. you just highlight once and leave!"*
      //
      // He is right that a one-off callout is not the same as knowing, at every moment, which line
      // is the one that ran. The runner already TYPED the command, and the shell echoes it at the
      // prompt, so it is on screen and measurable — there is no reason to make an author remember
      // to mark it. `__cmd` is added implicitly to every run step, and RecordedStep draws a
      // standing highlight on it for the whole clip.
      //
      // It is added LAST so an author's own mark of the same text still wins the id it asked for,
      // and it is skipped when the author already marked the command themselves.
      // ALWAYS measure the command's own rectangle. The first version skipped it when an
      // authored mark already sat inside the command — but an authored mark is only DRAWN
      // when a callout points at it, and a callout lands on its own spoken word. Measured on
      // the finished cut: the `where` mark suppressed `__cmd`, and its callout arrives eleven
      // seconds later, so the running command carried no highlight for eleven seconds. The
      // runner never sees the spec and cannot know that; RecordedStep does, and decides there.
      const implicit = [...(step.marks ?? [])];
      if (step.action === 'run' && step.cmd) implicit.push({id: '__cmd', text: String(step.cmd)});
      // Marks are measured AFTER the step settles, so they point at the finished state.
      await assertNoIdentity(page, step.id ?? `step-${i + 1}`);
      const marks = await marksFor(page, implicit);
      // Measured at the same instant as the marks, so the card knows what the frame holds.
      const ink = await inkFor(page);
      const heading = await headingFor(page);
      steps.push({
        marks,
        ink,
        heading,
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
    // DISMISS THE PAGE'S OWN FURNITURE BEFORE THE CAMERA ROLLS.
    //
    // The VS Code surface has had a prep phase since day one — toasts, the welcome tab, the
    // chat panel (gotcha 3). The browser surface had none, and a real third-party page is
    // worse: the first capture of the Anthropic announcement came back with a COOKIE BANNER
    // sitting over the last column of the benchmark table, hiding the competitor scores in
    // the one shot the whole beat exists for.
    //
    // `prep.dismiss` is a list of button labels to click if present. Each is optional by
    // design — a consent banner that did not appear is not an error — but anything that DID
    // match is logged, so a run says what it cleared rather than clearing silently.
    const dismissed = [];
    for (const label of demo.prep?.dismiss ?? []) {
      const btn = page.getByRole('button', {name: label, exact: false}).first();
      const n = await btn.count().catch(() => 0);
      if (!n) continue;
      await btn.click({timeout: 5000}).catch(() => {});
      dismissed.push(label);
      await sleep(600);
    }
    if (dismissed.length) console.log(`  prep: dismissed ${dismissed.map((d) => JSON.stringify(d)).join(', ')}`);
    await sleep(400);

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
      await assertNoIdentity(page, step.id ?? `step-${i + 1}`);
      const marks = await marksFor(page, step.marks);
      const ink = await inkFor(page);
      const heading = await headingFor(page);
      steps.push({id: step.id ?? `step-${i + 1}`, index: i, action: step.action,
                  label: step.label ?? null, tStart: t0, tEnd: t1, bbox, marks, ink, heading, ...res});
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
