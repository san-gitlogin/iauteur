// KEYBOARD SHORTCUT PROBE — what VS Code for the Web ACTUALLY does when a key is pressed.
//
// Owner: *"check out the keybindings docs and the Windows shortcuts PDF thoroughly and in depth,
// have every shortcut verified using VS Code web which you use. You don't wanna always use the
// search thing you do and execute, some places shortcuts might help you work even faster ... we
// should also test and review and do a feedback loop testing of the same not settling on any
// assumptions."*
//
// LAW 0m is the governing rule here and it is unusually literal: **capture the artefact by running
// the tool; documentation is a SECONDARY source.** The Windows shortcut PDF is a printed card. It
// is written for the DESKTOP app, it is not versioned against the build we drive, and VS Code for
// the Web runs inside Chromium — which eats a whole class of chords before the page ever sees them
// when a HUMAN presses them. A pipeline that "uses shortcuts" copied off that card would silently
// do nothing, or worse, do something to the browser.
//
// So nothing here is believed. Two passes:
//
//   --dump    Ask the running editor for its OWN keybinding table via
//             `Preferences: Open Default Keybindings (JSON)` and read the editor buffer back.
//             Ground truth for this exact build: every command id, key and `when` clause.
//             Cross-check it against the printed card with scripts/keys-crosscheck.mjs.
//
//   --probe   Press each candidate FOR REAL and require an observable change in the DOM. A
//             shortcut counts as verified only when the workbench visibly moved — never because
//             the key was dispatched without throwing.
//
// Results land in out/probe/keys/, which later phases read rather than re-deriving.
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {
  startServer, openWorkbench, applySettings, palette, recordingSettings, vscodeVersion,
  reapStaleServers,
} from './lib/record/vscode.mjs';
import {snapshot, pressChord} from './lib/record/keyprobe.mjs';
import {PROBES} from './lib/record/keyprobe-table.mjs';

const OUT = 'out/probe/keys';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mode = process.argv.includes('--probe') ? 'probe' : 'dump';
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1];

fs.mkdirSync(OUT, {recursive: true});
const workspace = path.resolve('out/probe/keys-ws');
fs.mkdirSync(workspace, {recursive: true});

// A workspace with something of every kind in it, because the owner asked for exactly that:
// *"different types of projects containing different files, executing different coding languages,
// viewing images / viewing different types of text files."*
const FILES = {
  'hello.py': 'def greet(name):\n    return f"hello {name}"\n\n\nprint(greet("world"))\n',
  'app.js': 'const add = (a, b) => a + b;\n\nconsole.log(add(2, 3));\n',
  'main.ts': 'export const twice = (n: number): number => n * 2;\n\nconsole.log(twice(21));\n',
  'notes.md': '# Notes\n\nA markdown file, for the preview shortcuts.\n\n- one\n- two\n',
  'data.json': '{\n  "name": "probe",\n  "count": 3\n}\n',
  'plain.txt': 'line one\nline two\nline three\nline four\nline five\n',
  'style.css': '.card {\n  color: #fff;\n  padding: 12px;\n}\n',
  // long enough to scroll, and wide enough to need a horizontal scrollbar - the two fixtures the
  // scroll and word-wrap probes were missing
  'long.txt': Array.from({length: 200}, (_, i) => `row ${i + 1}`).join('\n') + '\n',
  'wide.txt': 'x'.repeat(400) + '\nshort line\n',
};
for (const f of fs.readdirSync(workspace)) {
  if (f.startsWith('probe_')) fs.rmSync(path.join(workspace, f), {force: true});
}
for (const [name, body] of Object.entries(FILES)) {
  fs.writeFileSync(path.join(workspace, name), body);
}

console.log(`VS Code: ${vscodeVersion()}`);
console.log(`workspace: ${workspace}`);

// NO FIXED PORT. A pinned port turns the recorded serve-web leak into a hard stop: the
// listener outlives the run by a few seconds even after the process is gone, so the next
// invocation waited the full three minutes and failed. startServer picks a free one.
// Ten runs of this script left 87 orphaned serve-web processes and starved the machine; clear
// them before adding another. See reapStaleServers.
const reaped = reapStaleServers();
if (reaped) console.log(`reaped ${reaped} stale serve-web process(es) from earlier runs`);
const server = await startServer({workspace});
console.log(`serve-web ready on ${server.url}`);

// ONE PROFILE PER RUN. Chromium refuses to start on a user-data-dir another instance still holds,
// so a focused re-probe launched while the previous run's browser was still closing died with
// "Opening in existing browser session". Same shape as the pinned-port failure: a shared, fixed
// resource turns an ordinary overlap into a hard stop.
const profile = path.join(workspace, `.chrome-profile-${process.pid}`);
const ctx = await chromium.launchPersistentContext(profile, {
  headless: false,
  viewport: {width: 1600, height: 900},
  args: ['--no-default-browser-check', '--disable-features=Translate'],
});
ctx.grantPermissions(['clipboard-read', 'clipboard-write'], {origin: server.url}).catch(() => {});
const page = ctx.pages()[0] || (await ctx.newPage());

try {
  await openWorkbench(page, server.url, {workspace: server.workspace, boundByFlag: server.boundByFlag});
  // AUTO-SAVE OFF, EXPLICITLY. The diagnostic printed the tab's class list before typing, after
  // typing and after Ctrl+S: identical all three times, never once `dirty`. VS Code for the Web
  // turns auto-save on, so the buffer saved itself before anything could observe it and Ctrl+S had
  // nothing left to do. Without this the save probe passes or fails for the wrong reason.
  await applySettings(page, server.url, {...recordingSettings({theme: 'dark'}), 'files.autoSave': 'off'},
    {workspace: server.workspace, boundByFlag: server.boundByFlag});
  await openWorkbench(page, server.url, {workspace: server.workspace, boundByFlag: server.boundByFlag});
  console.log('workbench up');

  if (mode === 'dump') {
    await palette(page, 'Preferences: Open Default Keybindings (JSON)', {settle: 2200});
    await sleep(4000);

    // Read the buffer via select-all + clipboard rather than scraping Monaco's DOM: Monaco
    // VIRTUALISES its lines, so `.view-line` only ever holds the visible window and scraping it
    // would silently truncate a 4000-line document to whatever fits the viewport.
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await sleep(900);
    const text = await page.evaluate(() => navigator.clipboard.readText());

    fs.writeFileSync(path.join(OUT, 'default-keybindings.jsonc'), text);
    const entries = (text.match(/"key":/g) || []).length;
    console.log(`\ndumped ${entries} default keybinding(s) -> ${OUT}/default-keybindings.jsonc`);
    if (entries < 200) {
      console.error('✗ far too few — the buffer probably had not loaded before the copy.');
      process.exitCode = 1;
    }
  }

  if (mode === 'probe') {
    // SETUPS. Almost every chord on the card carries a `when` clause, so a probe that presses
    // without first putting the workbench into the required state measures nothing. `need` is a
    // tiny language: `editor:<file>@<state>` opens a file and leaves the caret or selection where
    // the clause wants it; bare words are whole-workbench states.
    const esc = async (n = 2) => {
      for (let i = 0; i < n; i++) { await page.keyboard.press('Escape'); await sleep(120); }
    };

    // A NEUTRAL WORKBENCH, not just an empty editor.
    //
    // The sidebar and the panel carry state between probes, and that made results depend on the
    // order rows happen to sit in the table: `f5` opens the Run and Debug view, and it reported
    // "nothing changed" because `ctrl+shift+d` three rows earlier had already opened it. Resetting
    // the viewlet and closing the panel makes every row independent of every other row.
    const closeAll = async () => {
      await esc();
      await palette(page, 'View: Close All Editors', {settle: 900});
      await sleep(600);
      await palette(page, 'View: Show Explorer', {settle: 700});
      await sleep(400);
      const panelUp = await page.locator('.part.panel').isVisible().catch(() => false);
      if (panelUp) { await palette(page, 'View: Close Panel', {settle: 700}); await sleep(400); }
    };

    const openFile = async (name) => {
      // Through the PALETTE, not Ctrl+P — Ctrl+P is itself under test, and a setup that leans on
      // the thing being measured cannot report its failure honestly.
      await esc();
      await palette(page, 'Go to File', {settle: 700});
      await page.keyboard.type(name, {delay: 30});
      await sleep(1100);
      await page.keyboard.press('Enter');
      await sleep(1200);
      // FOCUS THE EDITOR EXPLICITLY. `ctrl+down` has ELEVEN bindings in this build and VS Code
      // resolves them bottom-to-top, so `list.scrollDown` (Explorer tree focused) beats
      // `scrollLineDown` (text input focused). After the neutral reset parks focus in the
      // Explorer, clicking the text is not reliably enough on its own.
      await palette(page, 'View: Focus Active Editor Group', {settle: 700});
      await sleep(400);
      // REVERT TO WHAT IS ON DISK, EVERY TIME.
      //
      // The table declared `mutates: true` on the editing probes and nothing ever acted on it, so
      // each mutation survived into the next test. The evidence, once the failure reason started
      // printing the buffer: by the time `alt+up` ran, plain.txt read "line two / line three /
      // line four / line five" - the very first probe, `ctrl+x`, had cut "line one" and it never
      // came back. Five commands were reported broken across three runs for that reason alone.
      //
      // Undo would need a different number of presses per probe. Reverting is one command and it
      // is exact, because with files.autoSave off the file on disk is still the fixture.
      const box = await page.locator('.part.editor .monaco-editor .view-lines').first()
        .boundingBox().catch(() => null);
      if (box) { await page.mouse.click(box.x + 40, box.y + 12); await sleep(300); }
    };

    const caret = async (line) => {
      await page.keyboard.press('Control+Home');
      await sleep(150);
      for (let i = 0; i < line; i++) { await page.keyboard.press('ArrowDown'); await sleep(60); }
    };

    const setup = async (need) => {
      if (!need) { await esc(); return; }
      if (need === 'terminal') {
        await esc(); await palette(page, 'Terminal: Focus Terminal', {settle: 900}); await sleep(900); return;
      }
      if (need === 'searchview') {
        await esc(); await palette(page, 'Search: Find in Files', {settle: 900}); await sleep(900); return;
      }
      // `split`, `split@1`, `split@2` — two groups, with the focus parked in a KNOWN one, so a
      // focus-only command has somewhere to move the focus FROM. Without that, `ctrl+1` pressed
      // while group 1 already has focus is indistinguishable from `ctrl+1` doing nothing.
      if (need.startsWith('split')) {
        await closeAll(); await openFile('plain.txt');
        await palette(page, 'View: Split Editor', {settle: 900}); await sleep(1000);
        if (need === 'split@1') {
          await palette(page, 'View: Focus First Editor Group', {settle: 800}); await sleep(600);
        }
        if (need === 'split@2') {
          await palette(page, 'View: Focus Second Editor Group', {settle: 800}); await sleep(600);
        }
        return;
      }
      if (need.startsWith('twofiles')) {
        await closeAll(); await openFile('plain.txt'); await openFile('app.js');
        // `twofiles@first` makes the LEFT tab active, so a "move editor right" has somewhere to go
        if (need === 'twofiles@first') {
          await palette(page, 'View: Open Previous Editor', {settle: 800}); await sleep(700);
        }
        return;
      }
      if (need === 'wentback') {
        await closeAll(); await openFile('plain.txt'); await openFile('app.js');
        await page.keyboard.press('Alt+ArrowLeft'); await sleep(900); return;
      }
      if (need === 'closedone') {
        await closeAll(); await openFile('plain.txt');
        await palette(page, 'View: Close Editor', {settle: 900}); await sleep(900); return;
      }
      const m = /^editor:([^@]+)(?:@(.*))?$/.exec(need);
      if (!m) { await esc(); return; }
      await closeAll();
      await openFile(m[1]);
      const st = m[2] ?? '0';
      const lineMatch = /^(\d+)/.exec(st);
      await caret(lineMatch ? Number(lineMatch[1]) : 0);
      if (st.includes('end')) { await page.keyboard.press('End'); await sleep(150); }
      if (st.includes('word')) {
        await page.keyboard.press('Control+ArrowRight');
        await page.keyboard.press('Shift+Control+ArrowLeft');
        await sleep(200);
      }
      if (st.includes('messy')) { await page.keyboard.press('End'); await page.keyboard.type('   '); await sleep(300); }
      if (st.includes('selectall')) { await page.keyboard.press('Control+a'); await sleep(200); }
      if (st.includes('scrolled')) {
        await page.keyboard.press('Control+End'); await sleep(500);
      }
      if (st.includes('multi')) { await page.keyboard.press('Control+Alt+ArrowDown'); await sleep(250); }
      if (st.includes('folded')) {
        await page.keyboard.press('Control+K'); await sleep(220);
        await page.keyboard.press('Control+0'); await sleep(500);
      }
      if (st.includes('commented')) { await page.keyboard.press('Control+/'); await sleep(350); }
      if (st.includes('expanded')) { await page.keyboard.press('Shift+Alt+ArrowRight'); await sleep(250); }
      // `symbol:<name>` — park the caret ON an identifier. `@0word` selected whatever token
      // happened to start the file, which for main.ts is the keyword `export`: no definition, no
      // references, nothing to rename. Every provider-gated chord failed on that, not on itself.
      if (st.includes('symbol:')) {
        const name = st.split('symbol:')[1];
        await page.keyboard.press('Control+f'); await sleep(500);
        await page.keyboard.type(name, {delay: 40}); await sleep(700);
        await page.keyboard.press('Enter'); await sleep(400);
        await page.keyboard.press('Escape'); await sleep(400);
      }
      if (st.includes('find:')) {
        const term = st.split('find:')[1];
        await page.keyboard.press('Control+f'); await sleep(500);
        await page.keyboard.type(term, {delay: 40}); await sleep(500);
      }
      if (st.includes('dirty') || st.includes('trailing')) {
        // TRAILING means at the END of the line. Typing at column 1 makes LEADING whitespace,
        // which "Trim Trailing Whitespace" correctly ignores — so this probe was asking the
        // command to remove something that was not there, then reporting it as broken.
        if (st.includes('trailing')) { await page.keyboard.press('End'); await sleep(150); }
        await page.keyboard.type('   '); await sleep(300);
      }
    };

    // BOOTSTRAP. Every setup drives the command palette, so if Ctrl+Shift+P does not open the
    // palette on this surface, nothing below could be reported as verified and the run stops.
    await setup('editor:plain.txt@0');
    await pressChord(page, 'ctrl+shift+p');
    await sleep(1000);
    const boot = await snapshot(page);
    if (!boot.quickOpen) {
      throw new Error('BOOTSTRAP FAILED — Ctrl+Shift+P did not open the command palette. ' +
        'Every setup below drives the palette, so no result from this run would mean anything.');
    }
    await esc();
    console.log('bootstrap ok — the palette answers Ctrl+Shift+P\n');

    const list = only ? PROBES.filter((p) => p.cat === only || p.id === only) : PROBES;
    const results = [];
    for (const p of list) {
      if (p.manual) {
        results.push({id: p.id, cat: p.cat, keys: p.keys, label: p.label, status: 'unverified', why: p.manual});
        console.log(`  ~  ${p.keys.padEnd(24)} ${p.label.padEnd(44)} UNVERIFIED — ${p.manual}`);
        continue;
      }
      let status = 'fail'; let why = '';
      // A PER-ROW DEADLINE. Run 8 stalled forever on `ctrl+shift+h` because the row before it had
      // opened the Extensions view, which sits waiting on a marketplace this workspace cannot
      // reach; the palette command never returned and the whole 112-row suite was dead. One row
      // that cannot answer must cost one row, not the run.
      const deadline = (promise, ms, label) => Promise.race([
        promise,
        new Promise((_, rej) => setTimeout(() => rej(new Error(`timed out after ${ms}ms in ${label}`)), ms)),
      ]);
      try {
        // The save probes genuinely WRITE, so "revert to disk" stops meaning "revert to the
        // fixture" the moment one of them has run. Rewriting is cheap and makes probe order
        // irrelevant, which is the only way a 112-row table stays trustworthy.
        for (const [name, body] of Object.entries(FILES)) {
          fs.writeFileSync(path.join(workspace, name), body);
        }
        // A FRESH FILE PER PROBE, rather than a shared one that has to be cleaned up afterwards.
        //
        // Resetting a shared buffer was tried twice and failed twice: the first probe cut a line
        // out of plain.txt and five later probes inherited the damage (two of them "passed" on the
        // damage), and reverting through the palette left residue of its own. Giving each editing
        // probe its own copy makes the order of the table irrelevant, which is the only property
        // that makes a 112-row suite worth trusting.
        let need = p.need;
        const fresh = /^editor:([^@]+)(?:@(.*))?$/.exec(need ?? '');
        if (fresh && FILES[fresh[1]]) {
          const copy = `probe_${p.id}_${fresh[1]}`;
          fs.writeFileSync(path.join(workspace, copy), FILES[fresh[1]]);
          need = `editor:${copy}${fresh[2] ? '@' + fresh[2] : ''}`;
        }
        try {
          await deadline(setup(need), 45000, `setup "${need}"`);
        } catch {
          // RECOVER, DO NOT GIVE UP. Opening the Extensions view in a workspace with no reachable
          // marketplace leaves the renderer unable to answer, and every row after it timed out —
          // seven in a row, all of them working shortcuts. Reloading the workbench costs a few
          // seconds and puts the suite back on its feet; only a second failure is a real error.
          console.log(`     (setup stalled — reloading the workbench and retrying)`);
          await openWorkbench(page, server.url, {workspace: server.workspace, boundByFlag: server.boundByFlag});
          await deadline(setup(need), 45000, `setup "${need}" after reload`);
        }
        const before = await deadline(snapshot(page), 15000, 'snapshot');
        await pressChord(page, p.keys);
        await sleep(p.settle ?? 900);
        const after = await deadline(snapshot(page), 15000, 'snapshot');
        status = p.expect(before, after) ? 'pass' : 'fail';
        if (status === 'fail') {
          // WHAT DID MOVE is the useful half. A chord that fires the WRONG command looks identical
          // to one that fires nothing until you list the fields that changed.
          const moved = Object.keys(after)
            .filter((k) => JSON.stringify(after[k]) !== JSON.stringify(before[k]));
          why = moved.length
            ? `expected field unchanged; what moved: ${moved.join(', ')}`
            : 'the workbench did not change at all';
          // WHEN THE TEXT MOVED, SHOW THE TEXT. Five line-editing chords were reported as failures
          // across three runs purely because the assertion described the wrong resulting order,
          // and "editorText moved" could not tell me that. A failure that does not carry the
          // evidence costs a whole probe run to diagnose.
          if (moved.includes('editorText')) {
            const flat = (t) => t.replace(/\n/g, ' / ').slice(0, 110);
            why += `\n        before: ${flat(before.editorText)}\n        after : ${flat(after.editorText)}`;
          }
        }
        await esc(3);
      } catch (e) {
        status = 'error'; why = String(e.message).split('\n')[0];
      }
      results.push({id: p.id, cat: p.cat, keys: p.keys, label: p.label, status, why});
      const tick = status === 'pass' ? 'ok' : status === 'error' ? '!!' : ' x';
      console.log(`  ${tick} ${p.keys.padEnd(24)} ${p.label.padEnd(44)} ${status.toUpperCase()}${why ? ' — ' + why : ''}`);
    }

    const count = (s) => results.filter((r) => r.status === s).length;
    const report = {
      build: vscodeVersion(), surface: 'code serve-web + Chromium (Playwright)',
      measured: new Date().toISOString().slice(0, 10),
      pass: count('pass'), fail: count('fail'), error: count('error'), unverified: count('unverified'),
      results,
    };
    fs.writeFileSync(path.join(OUT, 'verified.json'), JSON.stringify(report, null, 2));
    // ALSO into briefs/, which is TRACKED. `out/` is gitignored, so a result that only lived there
    // would vanish on the next clone and the next session would re-derive it from scratch — and
    // this table is the thing the runner and the course are both built on. Same reason
    // briefs/sqlite/TRANSCRIPTS.md is tracked.
    // ONLY A FULL RUN MAY WRITE THE TRACKED TABLE. A `--only=Debug` pass overwrote it with three
    // rows, which would have shipped as "the verified shortcut list" — a partial measurement
    // presented as a complete one is worse than no measurement.
    if (!only) {
      fs.mkdirSync('briefs/vscode-shortcuts', {recursive: true});
      fs.writeFileSync('briefs/vscode-shortcuts/verified.json', JSON.stringify(report, null, 2));
    } else {
      console.log('  (--only run: briefs/vscode-shortcuts/verified.json left alone)');
    }
    console.log(`\n${count('pass')} pass · ${count('fail')} fail · ${count('error')} error · ${count('unverified')} unverified (of ${results.length})`);
    console.log(`written: ${OUT}/verified.json and briefs/vscode-shortcuts/verified.json`);
  }
} finally {
  await ctx.close().catch(() => {});
  await server.stop();
  fs.rmSync(profile, {recursive: true, force: true});
  console.log('server stopped');
}
