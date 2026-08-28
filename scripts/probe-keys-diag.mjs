// DIAGNOSTIC — answer the four questions left open by probe run 2, with facts rather than theories.
//
// Run 2 left sixteen chords failing. Four distinct explanations were PLAUSIBLE for them and I am
// not willing to write any of them into the docs on a hunch:
//
//   1. Ctrl+H does nothing. Is the key reaching the page at all, or is Chromium eating it as its
//      History accelerator before the renderer sees it? A keydown listener settles it, and the
//      answer changes what the runner is allowed to press.
//   2. F12 / F2 / Alt+F12 / Shift+F12 do nothing even on a .ts file. Their `when` clauses need
//      `editorHasDefinitionProvider` / `editorHasRenameProvider`. Is the TypeScript language
//      service actually running in this `serve-web` workspace?
//   3. Ctrl+S "changed nothing". Was the buffer ever dirty? Print the tab's real class list.
//   4. Ctrl+, opens Settings but neither the tab count nor the active tab moved. What element IS
//      the settings editor here?
import path from 'node:path';
import {chromium} from 'playwright';
import {
  startServer, openWorkbench, applySettings, palette, recordingSettings,
} from './lib/record/vscode.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const workspace = path.resolve('out/probe/keys-ws');

const server = await startServer({workspace});
const ctx = await chromium.launchPersistentContext(path.join(workspace, '.chrome-profile'), {
  headless: false, viewport: {width: 1600, height: 900},
  args: ['--no-default-browser-check'],
});
ctx.grantPermissions(['clipboard-read', 'clipboard-write'], {origin: server.url}).catch(() => {});
const page = ctx.pages()[0] || (await ctx.newPage());

const openFile = async (name) => {
  await page.keyboard.press('Escape');
  await palette(page, 'Go to File', {settle: 700});
  await page.keyboard.type(name, {delay: 30});
  await sleep(1100);
  await page.keyboard.press('Enter');
  await sleep(1400);
  const box = await page.locator('.part.editor .monaco-editor .view-lines').first()
    .boundingBox().catch(() => null);
  if (box) { await page.mouse.click(box.x + 40, box.y + 12); await sleep(400); }
};

try {
  await openWorkbench(page, server.url);
  await applySettings(page, server.url, recordingSettings({theme: 'dark'}));
  await openWorkbench(page, server.url);

  // ── 1. Does Ctrl+H reach the page? ──────────────────────────────────────────────────────────
  await openFile('plain.txt');
  await page.evaluate(() => {
    window.__seen = [];
    window.addEventListener('keydown', (e) => {
      window.__seen.push(`${e.ctrlKey ? 'ctrl+' : ''}${e.shiftKey ? 'shift+' : ''}${e.altKey ? 'alt+' : ''}${e.key}`);
    }, true);
  });
  for (const chord of ['Control+H', 'Control+F', 'Control+N', 'Control+W', 'Control+T']) {
    await page.keyboard.press(chord);
    await sleep(400);
    await page.keyboard.press('Escape');
    await sleep(200);
  }
  const seen = await page.evaluate(() => window.__seen);
  console.log('\n1. KEYDOWNS THE PAGE ACTUALLY RECEIVED');
  console.log('   pressed: Control+H, Control+F, Control+N, Control+W, Control+T');
  console.log('   page saw:', JSON.stringify(seen));

  // Now: with the page definitely receiving it, does the find widget open on Ctrl+H?
  await openFile('plain.txt');
  await page.keyboard.press('Control+H');
  await sleep(1200);
  const findState = await page.evaluate(() => {
    const w = document.querySelector('.editor-widget.find-widget');
    return {
      exists: !!w,
      classes: w ? w.className : '(none)',
      replaceVisible: !!document.querySelector('.editor-widget.find-widget .replace-input'),
      replacePartClasses: document.querySelector('.find-widget .replace-part')?.className ?? '(none)',
    };
  });
  console.log('   after Ctrl+H, find widget:', JSON.stringify(findState));
  await page.keyboard.press('Escape');

  // ── 2. Is there a TypeScript language service in this workspace? ────────────────────────────
  await openFile('main.ts');
  await page.keyboard.press('Control+Shift+P');
  await sleep(800);
  await page.keyboard.type('TypeScript:', {delay: 25});
  await sleep(1500);
  const tsCommands = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.quick-input-list .monaco-list-row'))
      .map((r) => r.innerText.trim().split('\n')[0]).slice(0, 6));
  await page.keyboard.press('Escape');
  await sleep(400);
  console.log('\n2. TYPESCRIPT COMMANDS OFFERED BY THE PALETTE');
  console.log('   ', tsCommands.length ? JSON.stringify(tsCommands) : '(none — no TS language service)');

  const langStatus = await page.evaluate(() =>
    (document.querySelector('.part.statusbar')?.innerText ?? '').replace(/\s+/g, ' ').slice(0, 160));
  console.log('    status bar on main.ts:', langStatus);

  // ── 3. Is the buffer ever dirty? ────────────────────────────────────────────────────────────
  await openFile('plain.txt');
  const beforeType = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.part.editor .tab')).map((t) => t.className));
  await page.keyboard.type('   ');
  await sleep(1200);
  const afterType = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.part.editor .tab')).map((t) => t.className));
  console.log('\n3. TAB CLASSES, BEFORE AND AFTER TYPING');
  console.log('   before:', JSON.stringify(beforeType));
  console.log('   after :', JSON.stringify(afterType));
  await page.keyboard.press('Control+S');
  await sleep(1500);
  const afterSave = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.part.editor .tab')).map((t) => t.className));
  console.log('   saved :', JSON.stringify(afterSave));

  // ── 4. What is the Settings editor? ─────────────────────────────────────────────────────────
  await page.keyboard.press('Control+,');
  await sleep(2000);
  const settingsState = await page.evaluate(() => ({
    tabs: Array.from(document.querySelectorAll('.part.editor .tab')).map((t) => t.innerText.trim()),
    settingsEditor: !!document.querySelector('.settings-editor'),
    keybindingsEditor: !!document.querySelector('.keybindings-editor'),
    editorPaneClasses: document.querySelector('.part.editor .editor-instance')?.className ?? '(none)',
  }));
  console.log('\n4. AFTER Ctrl+, :', JSON.stringify(settingsState));
} finally {
  await ctx.close().catch(() => {});
  await server.stop();
}
