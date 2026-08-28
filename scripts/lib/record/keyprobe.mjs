// WHAT THE WORKBENCH LOOKS LIKE RIGHT NOW — one snapshot, read straight off the DOM.
//
// Every shortcut assertion in `probe-keys.mjs --probe` is "take a snapshot, press the chord, take
// another, and require THIS field to have changed in THIS way". Reading one fat snapshot rather
// than a bespoke selector per shortcut means a chord that fires the wrong command is caught too:
// the field you expected stays put and some other field moves, and the diff says which.
//
// Monaco VIRTUALISES its lines, so `editorText` is only ever the visible window. Every probe file
// in the fixture workspace is under ten lines for exactly that reason — see probe-keys.mjs.
export const snapshot = async (page) => page.evaluate(async () => {
  const vis = (el) => {
    if (!el) return false;
    const s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && el.getBoundingClientRect().width > 1;
  };
  const txt = (sel) => document.querySelector(sel)?.innerText?.trim() ?? '';
  const q = document.querySelector('.quick-input-widget');

  return {
    // the status bar carries Ln/Col, indentation, encoding, EOL and language — five observables
    // in one string, and it updates synchronously with the editor
    status: txt('.part.statusbar'),
    editorText: Array.from(document.querySelectorAll('.part.editor .monaco-editor .view-line'))
      .map((l) => l.innerText.replace(/ /g, ' ')).join('\n'),
    tabs: Array.from(document.querySelectorAll('.part.editor .tab')).map((t) => t.innerText.trim()),
    activeTab: txt('.part.editor .tab.active'),
    // an editor GROUP per split; the count is how `ctrl+\` is verified
    groups: document.querySelectorAll('.part.editor .editor-group-container').length,
    sidebarVisible: vis(document.querySelector('.part.sidebar')),
    sidebarTitle: txt('.part.sidebar .composite.title'),
    panelVisible: vis(document.querySelector('.part.panel')),
    panelTitle: txt('.part.panel .composite.title'),
    auxVisible: vis(document.querySelector('.part.auxiliarybar')),
    quickOpen: vis(q),
    quickPlaceholder: q?.querySelector('input')?.getAttribute('placeholder') ?? '',
    quickValue: q?.querySelector('input')?.value ?? '',
    findWidget: vis(document.querySelector('.editor-widget.find-widget')),
    // THE REPLACE ROW IS A CLASS, NOT AN ELEMENT. `.replace-input` is present but zero-width even
    // when the replace row is showing, so requiring it to be visible reported Ctrl+H as dead while
    // the widget was on screen with `replaceToggled` set. Measured, not assumed.
    replaceToggled: !!document.querySelector('.editor-widget.find-widget.replaceToggled'),
    suggestWidget: vis(document.querySelector('.suggest-widget')),
    parameterHints: vis(document.querySelector('.parameter-hints-widget')),
    peekWidget: vis(document.querySelector('.monaco-editor .peekview-widget')),
    contextMenu: vis(document.querySelector('.monaco-menu-container')),
    // one `.cursor` per caret — the multi-cursor family is verified by counting them
    cursors: document.querySelectorAll('.part.editor .monaco-editor .cursors-layer .cursor').length,
    selections: document.querySelectorAll('.part.editor .monaco-editor .selected-text').length,
    foldedLines: document.querySelectorAll('.part.editor .monaco-editor .folded-background').length,
    // ZEN MODE, measured by its EFFECT rather than by a class name. The first version looked for
    // `.zen-mode` on the workbench and reported a failure while the sidebar, panel and activity
    // bar had all visibly gone — the class is not where this build records it. What zen mode IS,
    // is the chrome being hidden, so that is what gets measured.
    zen: !vis(document.querySelector('.part.activitybar')) &&
      !vis(document.querySelector('.part.statusbar')),
    activityBarVisible: vis(document.querySelector('.part.activitybar')),
    statusBarVisible: vis(document.querySelector('.part.statusbar')),
    // Are the editor groups side by side or stacked? `shift+alt+0` changes ONLY this, so a probe
    // that counts groups sees nothing happen.
    groupLayout: (() => {
      const g = Array.from(document.querySelectorAll('.part.editor .editor-group-container'));
      if (g.length < 2) return 'single';
      const [a, b] = [g[0].getBoundingClientRect(), g[1].getBoundingClientRect()];
      return Math.abs(a.top - b.top) > Math.abs(a.left - b.left) ? 'column' : 'row';
    })(),
    // The viewlet's own body: catches a change INSIDE a sidebar view - search details expanding,
    // a tree revealing - which every part-level flag misses.
    sidebarBodyLen: (document.querySelector('.part.sidebar .content')?.innerText ?? '').length,
    fullscreen: !!document.fullscreenElement,
    notification: txt('.notifications-toasts'),
    // markdown preview / image preview / any webview-backed editor
    // A webview-backed editor (markdown preview, image preview) mounts its iframe in a container
    // OUTSIDE `.part.editor` in this build, so scoping the query to the editor part counted zero
    // while a preview was plainly on screen. Count them document-wide.
    webviews: document.querySelectorAll('iframe.webview, webview, .webview-container iframe').length,
    breakpoints: document.querySelectorAll(
      '.codicon-debug-breakpoint, .debug-breakpoint, .breakpoint-widget, .codicon-debug-breakpoint-unverified').length,
    // WHICH group has focus. `ctrl+1`, `ctrl+2` and `ctrl+k ctrl+left/right` change ONLY this, so
    // a probe that counts groups reported "the workbench did not change at all" for all four while
    // the focus was visibly moving.
    focusedGroup: Array.from(document.querySelectorAll('.part.editor .editor-group-container'))
      .findIndex((el) => el.classList.contains('active')),
    // The unsaved dot. `ctrl+s` has no `when` clause and always fires; the only way to see that it
    // WORKED is the dot going away.
    dirtyTabs: document.querySelectorAll('.part.editor .tab.dirty').length,
    // Preview (italic) tabs — what `ctrl+k enter` promotes to a real one.
    previewTabs: document.querySelectorAll('.part.editor .tab.italic, .part.editor .tab.preview').length,
    renameBox: vis(document.querySelector('.monaco-editor .rename-box')),
    // Settings and Keyboard Shortcuts open WITHOUT adding a tab in this build, so tab counting
    // reported Ctrl+, as doing nothing while the settings editor was plainly open.
    settingsEditor: !!document.querySelector('.settings-editor'),
    keybindingsEditor: !!document.querySelector('.keybindings-editor'),
    actionWidget: vis(document.querySelector('.action-widget')),
    hover: vis(document.querySelector('.monaco-hover')),
    // `ctrl+k p` copies the file path and touches nothing on screen at all. Reading the clipboard
    // is the only honest way to verify it; guarded because permission can be refused and a throw
    // here would take down every unrelated probe with it.
    clipboard: await navigator.clipboard.readText().catch(() => ''),
  };
});

/**
 * Press one chord. `ctrl+k ctrl+s` is two presses with a real gap — VS Code holds a chord for a
 * moment and a same-tick second press is dropped, which reads as "the shortcut did nothing".
 */
export const pressChord = async (page, chord, {gap = 260} = {}) => {
  const parts = String(chord).trim().split(/\s+/);
  for (let i = 0; i < parts.length; i++) {
    await page.keyboard.press(toPlaywright(parts[i]));
    if (i < parts.length - 1) await page.waitForTimeout(gap);
  }
};

/** `ctrl+shift+p` -> `Control+Shift+P`; VS Code's key names are not Playwright's. */
export const toPlaywright = (chord) => {
  const MOD = {ctrl: 'Control', shift: 'Shift', alt: 'Alt', meta: 'Meta', cmd: 'Meta', win: 'Meta'};
  const KEY = {
    up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight',
    pageup: 'PageUp', pagedown: 'PageDown', esc: 'Escape', escape: 'Escape',
    enter: 'Enter', tab: 'Tab', space: 'Space', backspace: 'Backspace', delete: 'Delete',
    home: 'Home', end: 'End', insert: 'Insert',
  };
  // split on `+` but NOT the literal `+` key itself, and not the `-` in `ctrl+-`
  const bits = String(chord).split('+');
  const out = [];
  for (let i = 0; i < bits.length; i++) {
    let b = bits[i];
    if (b === '' && i > 0) b = '+'; // `ctrl++`
    const low = b.toLowerCase();
    if (MOD[low] && i < bits.length - 1) { out.push(MOD[low]); continue; }
    if (KEY[low]) { out.push(KEY[low]); continue; }
    if (/^f\d{1,2}$/.test(low)) { out.push(low.toUpperCase()); continue; }
    out.push(b.length === 1 ? b.toUpperCase() : b);
  }
  return out.join('+');
};
