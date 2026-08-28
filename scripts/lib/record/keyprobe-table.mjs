// THE PROBE TABLE — one row per pressable chord on the Windows shortcut card, and the specific
// thing that has to move on screen before it counts as verified.
//
// The rule this table exists to enforce: **a dispatched key is not a working shortcut.** Playwright
// will happily press Ctrl+K Ctrl+S at a workbench that has focus somewhere else, report no error,
// and leave the screen exactly as it was. Almost every chord on the card carries a `when` clause
// (see out/probe/keys/crosscheck.json — `ctrl+c` alone has ten bindings), so "it is bound" and "it
// does the thing here, now, with this focus" are different claims. Only the second one is useful.
//
// `need` puts the workbench into the state the `when` clause requires. `expect` names the field of
// the snapshot that must change and how. Where a chord's effect is real but not legible in the DOM
// snapshot, the row is marked `manual` — it is reported as UNVERIFIED rather than given a green
// tick, because a check that cannot fail is worse than no check.

/** Assertions, by the field they watch. Each takes (before, after) and returns true/false. */
export const CHECKS = {
  quick: (re) => (b, a) => a.quickOpen && !b.quickOpen &&
    (re ? re.test(a.quickPlaceholder + ' ' + a.quickValue) : true),
  sidebar: (re) => (b, a) => a.sidebarVisible && re.test(a.sidebarTitle),
  sidebarToggled: () => (b, a) => a.sidebarVisible !== b.sidebarVisible,
  panel: (re) => (b, a) => a.panelVisible && re.test(a.panelTitle),
  panelToggled: () => (b, a) => a.panelVisible !== b.panelVisible,
  textChanged: () => (b, a) => a.editorText !== b.editorText,
  textIs: (re) => (b, a) => re.test(a.editorText),
  statusChanged: () => (b, a) => a.status !== b.status,
  cursorsAtLeast: (n) => (b, a) => a.cursors >= n,
  cursorsGrew: () => (b, a) => a.cursors > b.cursors,
  selectionsGrew: () => (b, a) => a.selections > b.selections,
  find: () => (b, a) => a.findWidget && !b.findWidget,
  replace: () => (b, a) => a.findWidget && a.replaceToggled,
  suggest: () => (b, a) => a.suggestWidget && !b.suggestWidget,
  hints: () => (b, a) => a.parameterHints && !b.parameterHints,
  peek: () => (b, a) => a.peekWidget && !b.peekWidget,
  groups: (n) => (b, a) => a.groups === n,
  groupsGrew: () => (b, a) => a.groups > b.groups,
  tabsGrew: () => (b, a) => a.tabs.length > b.tabs.length,
  tabsShrank: () => (b, a) => a.tabs.length < b.tabs.length,
  activeTabChanged: () => (b, a) => a.activeTab !== b.activeTab,
  zen: () => (b, a) => a.zen && !b.zen,
  layoutFlipped: () => (b, a) => a.groupLayout !== b.groupLayout,
  sidebarBodyChanged: () => (b, a) => a.sidebarBodyLen !== b.sidebarBodyLen,
  folded: () => (b, a) => a.foldedLines > b.foldedLines,
  unfolded: () => (b, a) => a.foldedLines < b.foldedLines,
  webviewsGrew: () => (b, a) => a.webviews > b.webviews,
  breakpointsGrew: () => (b, a) => a.breakpoints > b.breakpoints,
  anything: () => (b, a) => JSON.stringify(a) !== JSON.stringify(b),
  /** Either observable will do — used where one command has two legitimate outcomes. */
  either: (...fns) => (b, a) => fns.some((f) => f(b, a)),
  focusMoved: () => (b, a) => a.focusedGroup !== b.focusedGroup,
  dirtyCleared: () => (b, a) => a.dirtyTabs < b.dirtyTabs,
  previewPromoted: () => (b, a) => a.previewTabs < b.previewTabs,
  clipboardChanged: () => (b, a) => a.clipboard !== b.clipboard && a.clipboard.length > 0,
  tabsReordered: () => (b, a) => a.tabs.join('|') !== b.tabs.join('|'),
  panelChanged: () => (b, a) => a.panelVisible !== b.panelVisible || a.panelTitle !== b.panelTitle,
  renameBox: () => (b, a) => a.renameBox && !b.renameBox,
  actionWidget: () => (b, a) => a.actionWidget && !b.actionWidget,
  hover: () => (b, a) => a.hover && !b.hover,
  // A scroll shows two ways and only one is reliable: Monaco renders a few lines outside the
  // viewport, so the minimum line number can sit still while the view has plainly moved. The
  // rendered text changing is the fact.
  scrolled: () => (b, a) => a.firstVisibleLine !== b.firstVisibleLine || a.editorText !== b.editorText,
  // Compare the scrollbar's WIDTH, not a truthiness flip. On a 400-character line the slider does
  // not always fall to exactly zero when wrapping turns on, so `(a > 0) !== (b > 0)` reported no
  // change while the probe's own failure line was saying hScroll had moved.
  wrapToggled: () => (b, a) => a.hScroll !== b.hScroll,
  notified: () => (b, a) => a.notification !== b.notification,
  settingsOpened: () => (b, a) => a.settingsEditor && !b.settingsEditor,
  keybindingsOpened: () => (b, a) => a.keybindingsEditor && !b.keybindingsEditor,
};

const C = CHECKS;

export const PROBES = [
  // ── General ───────────────────────────────────────────────────────────────────────────────
  // ctrl+shift+p is the BOOTSTRAP: the probe run uses the palette to set up other rows, so if
  // this one fails nothing downstream can be trusted and the run aborts.
  {id: 'palette', cat: 'General', keys: 'ctrl+shift+p', label: 'Show Command Palette',
   need: 'editor:plain.txt', expect: C.quick(/./), bootstrap: true},
  {id: 'palette-f1', cat: 'General', keys: 'f1', label: 'Show Command Palette (F1)',
   need: 'editor:plain.txt', expect: C.quick(/./)},
  {id: 'quickopen', cat: 'General', keys: 'ctrl+p', label: 'Quick Open, Go to File',
   need: 'editor:plain.txt', expect: C.quick(/./)},
  {id: 'settings', cat: 'General', keys: 'ctrl+,', label: 'User Settings',
   need: 'editor:plain.txt', expect: C.settingsOpened()},
  {id: 'kbshortcuts', cat: 'General', keys: 'ctrl+k ctrl+s', label: 'Keyboard Shortcuts',
   need: 'editor:plain.txt', expect: C.either(C.keybindingsOpened(), C.tabsGrew())},
  {id: 'newwindow', cat: 'General', keys: 'ctrl+shift+n', label: 'New window/instance',
   need: 'editor:plain.txt', manual: 'opens a second browser window; a new page, not a DOM change'},

  // ── Basic editing ─────────────────────────────────────────────────────────────────────────
  {id: 'cutline', cat: 'Basic editing', keys: 'ctrl+x', label: 'Cut line (empty selection)',
   need: 'editor:plain.txt', expect: C.textChanged(), mutates: true},
  // plain.txt is "line one".."line five" and caret(n) is Ctrl+Home then n downs, so @1 is
  // "line two" and @2 is "line three". The first pass asserted the wrong resulting order and
  // reported four working commands as failures — the editorText field HAD moved every time.
  {id: 'moveup', cat: 'Basic editing', keys: 'alt+up', label: 'Move line up',
   need: 'editor:plain.txt@2', expect: C.textIs(/line one[\s\S]*line three[\s\S]*line two/), mutates: true},
  {id: 'movedown', cat: 'Basic editing', keys: 'alt+down', label: 'Move line down',
   need: 'editor:plain.txt@1', expect: C.textIs(/line one[\s\S]*line three[\s\S]*line two/), mutates: true},
  {id: 'copydown', cat: 'Basic editing', keys: 'shift+alt+down', label: 'Copy line down',
   need: 'editor:plain.txt@1', expect: C.textIs(/line two[\s\S]*line two/), mutates: true},
  {id: 'copyup', cat: 'Basic editing', keys: 'shift+alt+up', label: 'Copy line up',
   need: 'editor:plain.txt@1', expect: C.textIs(/line two[\s\S]*line two/), mutates: true},
  {id: 'deleteline', cat: 'Basic editing', keys: 'ctrl+shift+k', label: 'Delete line',
   need: 'editor:plain.txt@1', expect: (b, a) => !/line two/.test(a.editorText), mutates: true},
  {id: 'insertbelow', cat: 'Basic editing', keys: 'ctrl+enter', label: 'Insert line below',
   need: 'editor:plain.txt@1', expect: C.textChanged(), mutates: true},
  {id: 'insertabove', cat: 'Basic editing', keys: 'ctrl+shift+enter', label: 'Insert line above',
   need: 'editor:plain.txt@1', expect: C.textChanged(), mutates: true},
  {id: 'matchbracket', cat: 'Basic editing', keys: 'ctrl+shift+\\', label: 'Jump to matching bracket',
   need: 'editor:style.css@1', expect: C.statusChanged()},
  {id: 'indent', cat: 'Basic editing', keys: 'ctrl+]', label: 'Indent line',
   need: 'editor:plain.txt@1', expect: C.textChanged(), mutates: true},
  {id: 'outdent', cat: 'Basic editing', keys: 'ctrl+[', label: 'Outdent line',
   // line index 2 of hello.py is BLANK, so there was nothing to outdent and the probe blamed
   // the shortcut. The indented body is line 1.
   need: 'editor:hello.py@1', expect: C.textChanged(), mutates: true},
  {id: 'end', cat: 'Basic editing', keys: 'end', label: 'Go to end of line',
   need: 'editor:plain.txt@1', expect: C.statusChanged()},
  {id: 'home', cat: 'Basic editing', keys: 'home', label: 'Go to beginning of line',
   need: 'editor:plain.txt@1end', expect: C.statusChanged()},
  {id: 'ctrlend', cat: 'Basic editing', keys: 'ctrl+end', label: 'Go to end of file',
   need: 'editor:plain.txt@1', expect: C.statusChanged()},
  {id: 'ctrlhome', cat: 'Basic editing', keys: 'ctrl+home', label: 'Go to beginning of file',
   need: 'editor:plain.txt@4', expect: C.statusChanged()},
  // These three were "unverifiable" only because the fixture was too small to show the effect.
  // long.txt is 200 lines so it can scroll; wide.txt has a 400-character line so it can wrap.
  // "The file could not demonstrate it" is a fixture bug, not a property of the shortcut.
  {id: 'scrollup', cat: 'Basic editing', keys: 'ctrl+up', label: 'Scroll line up',
   need: 'editor:long.txt@scrolled', expect: C.scrolled()},
  {id: 'scrolldown', cat: 'Basic editing', keys: 'ctrl+down', label: 'Scroll line down',
   need: 'editor:long.txt@0', expect: C.scrolled()},
  {id: 'fold', cat: 'Basic editing', keys: 'ctrl+shift+[', label: 'Fold region',
   need: 'editor:style.css@0', expect: C.folded(), mutates: false},
  {id: 'unfold', cat: 'Basic editing', keys: 'ctrl+shift+]', label: 'Unfold region',
   need: 'editor:style.css@0folded', expect: C.unfolded()},
  {id: 'foldall', cat: 'Basic editing', keys: 'ctrl+k ctrl+0', label: 'Fold all regions',
   need: 'editor:style.css@0', expect: C.folded()},
  {id: 'unfoldall', cat: 'Basic editing', keys: 'ctrl+k ctrl+j', label: 'Unfold all regions',
   need: 'editor:style.css@0folded', expect: C.unfolded()},
  {id: 'foldsub', cat: 'Basic editing', keys: 'ctrl+k ctrl+[', label: 'Fold all subregions',
   need: 'editor:data.json@0', expect: C.anything()},
  // you cannot unfold what was never folded — the JSON opens fully expanded
  {id: 'unfoldsub', cat: 'Basic editing', keys: 'ctrl+k ctrl+]', label: 'Unfold all subregions',
   need: 'editor:data.json@0folded', expect: C.unfolded()},
  {id: 'addcomment', cat: 'Basic editing', keys: 'ctrl+k ctrl+c', label: 'Add line comment',
   need: 'editor:app.js@0', expect: C.textIs(/\/\/\s*const add/), mutates: true},
  {id: 'removecomment', cat: 'Basic editing', keys: 'ctrl+k ctrl+u', label: 'Remove line comment',
   need: 'editor:app.js@0commented', expect: (b, a) => !/\/\/\s*const add/.test(a.editorText), mutates: true},
  {id: 'togglecomment', cat: 'Basic editing', keys: 'ctrl+/', label: 'Toggle line comment',
   need: 'editor:app.js@0', expect: C.textIs(/\/\/\s*const add/), mutates: true},
  {id: 'blockcomment', cat: 'Basic editing', keys: 'shift+alt+a', label: 'Toggle block comment',
   need: 'editor:app.js@0', expect: C.textChanged(), mutates: true},
  {id: 'wordwrap', cat: 'Basic editing', keys: 'alt+z', label: 'Toggle word wrap',
   need: 'editor:wide.txt@0', expect: C.wrapToggled()},

  // ── Navigation ────────────────────────────────────────────────────────────────────────────
  {id: 'allsymbols', cat: 'Navigation', keys: 'ctrl+t', label: 'Show all Symbols',
   need: 'editor:hello.py@0', expect: C.quick(/./)},
  {id: 'gotoline', cat: 'Navigation', keys: 'ctrl+g', label: 'Go to Line',
   need: 'editor:plain.txt@0', expect: C.quick(/./)},
  {id: 'gotosymbol', cat: 'Navigation', keys: 'ctrl+shift+o', label: 'Go to Symbol',
   need: 'editor:hello.py@0', expect: C.quick(/./)},
  {id: 'problems', cat: 'Navigation', keys: 'ctrl+shift+m', label: 'Show Problems panel',
   need: 'editor:main.ts@0', expect: C.panel(/problem/i)},
  {id: 'nexterror', cat: 'Navigation', keys: 'f8', label: 'Go to next error or warning',
   need: 'editor:main.ts@0', manual: 'needs a file with a real diagnostic; no language server in web by default'},
  {id: 'preverror', cat: 'Navigation', keys: 'shift+f8', label: 'Go to previous error or warning',
   need: 'editor:main.ts@0', manual: 'needs a file with a real diagnostic'},
  // The Ctrl+Tab PICKER only stays up while Ctrl is physically held. A synthetic press releases
  // immediately, so what is observable is the editor actually switching, not a widget.
  {id: 'grouphistory', cat: 'Navigation', keys: 'ctrl+shift+tab', label: 'Navigate editor group history',
   need: 'twofiles', expect: C.activeTabChanged()},
  {id: 'goback', cat: 'Navigation', keys: 'alt+left', label: 'Go back',
   need: 'twofiles', expect: C.anything()},
  // you cannot go forward without having gone back first
  {id: 'goforward', cat: 'Navigation', keys: 'alt+right', label: 'Go forward',
   need: 'wentback', expect: C.anything()},
  {id: 'tabmovesfocus', cat: 'Navigation', keys: 'ctrl+m', label: 'Toggle Tab moves focus',
   need: 'editor:plain.txt@0', manual: 'state lives in a context key, not the DOM'},

  // ── Search and replace ────────────────────────────────────────────────────────────────────
  {id: 'find', cat: 'Search and replace', keys: 'ctrl+f', label: 'Find',
   need: 'editor:plain.txt@0', expect: C.find()},
  {id: 'replace', cat: 'Search and replace', keys: 'ctrl+h', label: 'Replace',
   need: 'editor:plain.txt@0', expect: C.replace()},
  {id: 'findnext', cat: 'Search and replace', keys: 'f3', label: 'Find next',
   need: 'editor:plain.txt@0find:line', expect: C.statusChanged()},
  {id: 'findprev', cat: 'Search and replace', keys: 'shift+f3', label: 'Find previous',
   need: 'editor:plain.txt@0find:line', expect: C.statusChanged()},
  {id: 'selectallfind', cat: 'Search and replace', keys: 'alt+enter', label: 'Select all occurrences of Find match',
   need: 'editor:plain.txt@0find:line', expect: C.cursorsAtLeast(2)},
  {id: 'addselection', cat: 'Search and replace', keys: 'ctrl+d', label: 'Add selection to next Find match',
   need: 'editor:plain.txt@0word', expect: C.cursorsGrew()},
  {id: 'movelastselection', cat: 'Search and replace', keys: 'ctrl+k ctrl+d', label: 'Move last selection to next Find match',
   need: 'editor:plain.txt@0word', expect: C.anything()},

  // ── Multi-cursor and selection ────────────────────────────────────────────────────────────
  {id: 'cursorabove', cat: 'Multi-cursor', keys: 'ctrl+alt+up', label: 'Insert cursor above',
   need: 'editor:plain.txt@2', expect: C.cursorsGrew()},
  {id: 'cursorbelow', cat: 'Multi-cursor', keys: 'ctrl+alt+down', label: 'Insert cursor below',
   need: 'editor:plain.txt@1', expect: C.cursorsGrew()},
  {id: 'undocursor', cat: 'Multi-cursor', keys: 'ctrl+u', label: 'Undo last cursor operation',
   need: 'editor:plain.txt@1multi', expect: (b, a) => a.cursors < b.cursors},
  {id: 'cursorendofline', cat: 'Multi-cursor', keys: 'shift+alt+i', label: 'Insert cursor at end of each line selected',
   need: 'editor:plain.txt@selectall', expect: C.cursorsAtLeast(3)},
  {id: 'selectline', cat: 'Multi-cursor', keys: 'ctrl+l', label: 'Select current line',
   need: 'editor:plain.txt@1', expect: C.selectionsGrew()},
  {id: 'selectalloccurrences', cat: 'Multi-cursor', keys: 'ctrl+shift+l', label: 'Select all occurrences of current selection',
   need: 'editor:plain.txt@0word', expect: C.cursorsAtLeast(2)},
  {id: 'selectallword', cat: 'Multi-cursor', keys: 'ctrl+f2', label: 'Select all occurrences of current word',
   need: 'editor:plain.txt@0word', expect: C.cursorsAtLeast(2)},
  {id: 'expandselection', cat: 'Multi-cursor', keys: 'shift+alt+right', label: 'Expand selection',
   need: 'editor:app.js@0', expect: C.selectionsGrew()},
  {id: 'shrinkselection', cat: 'Multi-cursor', keys: 'shift+alt+left', label: 'Shrink selection',
   need: 'editor:app.js@0expanded', expect: C.anything()},
  {id: 'boxdown', cat: 'Multi-cursor', keys: 'ctrl+shift+alt+down', label: 'Column (box) selection down',
   need: 'editor:plain.txt@1', expect: C.cursorsGrew()},
  {id: 'boxup', cat: 'Multi-cursor', keys: 'ctrl+shift+alt+up', label: 'Column (box) selection up',
   need: 'editor:plain.txt@2', expect: C.cursorsGrew()},
  {id: 'boxright', cat: 'Multi-cursor', keys: 'ctrl+shift+alt+right', label: 'Column (box) selection right',
   need: 'editor:plain.txt@1', expect: C.anything()},

  // ── Rich languages editing ────────────────────────────────────────────────────────────────
  {id: 'suggest', cat: 'Languages', keys: 'ctrl+space', label: 'Trigger suggestion',
   need: 'editor:app.js@endofline', expect: C.suggest()},
  {id: 'suggest-i', cat: 'Languages', keys: 'ctrl+i', label: 'Trigger suggestion (Ctrl+I)',
   need: 'editor:app.js@endofline', manual: 'Ctrl+I is Copilot/chat in current builds, not suggest'},
  {id: 'paramhints', cat: 'Languages', keys: 'ctrl+shift+space', label: 'Trigger parameter hints',
   need: 'editor:app.js@endofline', manual: 'needs a signature-aware language service'},
  {id: 'formatdoc', cat: 'Languages', keys: 'shift+alt+f', label: 'Format document',
   need: 'editor:data.json@messy', expect: C.anything()},
  {id: 'formatselection', cat: 'Languages', keys: 'ctrl+k ctrl+f', label: 'Format selection',
   need: 'editor:data.json@messyselectall', expect: C.anything()},
  // EVERY provider-gated chord below was measured on app.js and reported "nothing changed".
  // Their `when` clauses say why: f12 needs `editorHasDefinitionProvider`, f2 needs
  // `editorHasRenameProvider`. The web build ships a TypeScript language service and no plain-JS
  // one, so the file was the variable, not the shortcut.
  {id: 'gotodef', cat: 'Languages', keys: 'f12', label: 'Go to Definition',
   need: 'editor:main.ts@symbol:twice', expect: C.anything()},
  {id: 'peekdef', cat: 'Languages', keys: 'alt+f12', label: 'Peek Definition',
   need: 'editor:main.ts@symbol:twice', expect: C.peek()},
  {id: 'quickfix', cat: 'Languages', keys: 'ctrl+.', label: 'Quick Fix',
   need: 'editor:main.ts@symbol:twice', expect: C.actionWidget()},
  {id: 'references', cat: 'Languages', keys: 'shift+f12', label: 'Show References',
   need: 'editor:main.ts@symbol:twice', expect: C.anything()},
  {id: 'rename', cat: 'Languages', keys: 'f2', label: 'Rename Symbol',
   need: 'editor:main.ts@symbol:twice', expect: C.renameBox()},
  {id: 'trimwhitespace', cat: 'Languages', keys: 'ctrl+k ctrl+x', label: 'Trim trailing whitespace',
   need: 'editor:plain.txt@trailing', expect: C.textChanged(), mutates: true},
  {id: 'changelang', cat: 'Languages', keys: 'ctrl+k m', label: 'Change file language',
   need: 'editor:plain.txt@0', expect: C.quick(/./)},

  // ── Editor management ─────────────────────────────────────────────────────────────────────
  {id: 'splitedit', cat: 'Editor management', keys: 'ctrl+\\', label: 'Split editor',
   need: 'editor:plain.txt@0', expect: C.groupsGrew()},
  // FOCUS-ONLY commands. Nothing on screen moves except which group is active, which is why all
  // four of these reported "the workbench did not change at all" until `focusedGroup` existed.
  {id: 'focusgroup1', cat: 'Editor management', keys: 'ctrl+1', label: 'Focus 1st editor group',
   need: 'split@2', expect: C.focusMoved()},
  {id: 'focusgroup2', cat: 'Editor management', keys: 'ctrl+2', label: 'Focus 2nd editor group',
   need: 'split@1', expect: C.focusMoved()},
  // `twofiles` leaves the SECOND file active, and the second of two cannot move right. The probe
  // was asking a command to do something impossible and then blaming the command.
  {id: 'moveeditorright', cat: 'Editor management', keys: 'ctrl+shift+pagedown', label: 'Move editor right',
   need: 'twofiles@first', expect: C.tabsReordered()},
  {id: 'moveeditorleft', cat: 'Editor management', keys: 'ctrl+shift+pageup', label: 'Move editor left',
   need: 'twofiles', expect: C.tabsReordered()},
  {id: 'focusprevgroup', cat: 'Editor management', keys: 'ctrl+k ctrl+left', label: 'Focus previous editor group',
   need: 'split@2', expect: C.focusMoved()},
  {id: 'focusnextgroup', cat: 'Editor management', keys: 'ctrl+k ctrl+right', label: 'Focus next editor group',
   need: 'split@1', expect: C.focusMoved()},

  // ── File management ───────────────────────────────────────────────────────────────────────
  {id: 'newfile', cat: 'File management', keys: 'ctrl+n', label: 'New File',
   need: 'editor:plain.txt@0', expect: C.tabsGrew()},
  // Save has NO `when` clause, so it always fires; the only evidence that it worked is the
  // unsaved dot going away. Same shape as the runner's existing save action.
  {id: 'save', cat: 'File management', keys: 'ctrl+s', label: 'Save',
   need: 'editor:plain.txt@dirty', expect: C.dirtyCleared(), mutates: true},
  {id: 'saveas', cat: 'File management', keys: 'ctrl+shift+s', label: 'Save As',
   need: 'editor:plain.txt@0', expect: C.anything()},
  {id: 'saveall', cat: 'File management', keys: 'ctrl+k s', label: 'Save All',
   need: 'editor:plain.txt@dirty', expect: C.dirtyCleared(), mutates: true},
  {id: 'closeeditor', cat: 'File management', keys: 'ctrl+w', label: 'Close editor',
   need: 'twofiles', expect: C.tabsShrank()},
  {id: 'closeeditor-f4', cat: 'File management', keys: 'ctrl+f4', label: 'Close editor (Ctrl+F4)',
   need: 'twofiles', expect: C.tabsShrank()},
  {id: 'closeall', cat: 'File management', keys: 'ctrl+k ctrl+w', label: 'Close All',
   need: 'twofiles', expect: (b, a) => a.tabs.length === 0},
  {id: 'reopenclosed', cat: 'File management', keys: 'ctrl+shift+t', label: 'Reopen closed editor',
   need: 'closedone', expect: C.tabsGrew()},
  // MEASURED, not assumed: the diagnostic printed every tab's class list and no tab in this
  // workspace ever carries a preview/italic class, so there is never anything for `ctrl+k enter`
  // to promote. Reported UNVERIFIED rather than passed on a check that cannot fail.
  {id: 'keepeditor', cat: 'File management', keys: 'ctrl+k enter', label: 'Keep preview mode editor open',
   need: 'editor:plain.txt@0', manual: 'no preview (italic) tab is ever created here, so nothing can be promoted'},
  {id: 'nexteditor', cat: 'File management', keys: 'ctrl+tab', label: 'Open next editor',
   need: 'twofiles', expect: C.activeTabChanged()},
  // touches NOTHING on screen; the clipboard is the only honest observable
  {id: 'copypath', cat: 'File management', keys: 'ctrl+k p', label: 'Copy path of active file',
   need: 'editor:plain.txt@0', expect: C.clipboardChanged()},

  // ── Display ───────────────────────────────────────────────────────────────────────────────
  {id: 'sidebar', cat: 'Display', keys: 'ctrl+b', label: 'Toggle Sidebar visibility',
   need: 'editor:plain.txt@0', expect: C.sidebarToggled()},
  {id: 'explorer', cat: 'Display', keys: 'ctrl+shift+e', label: 'Show Explorer',
   need: 'editor:plain.txt@0', expect: C.sidebar(/explorer/i)},
  {id: 'search', cat: 'Display', keys: 'ctrl+shift+f', label: 'Show Search',
   need: 'editor:plain.txt@0', expect: C.sidebar(/search/i)},
  {id: 'scm', cat: 'Display', keys: 'ctrl+shift+g', label: 'Show Source Control',
   need: 'editor:plain.txt@0', expect: C.sidebar(/source control/i)},
  {id: 'debugview', cat: 'Display', keys: 'ctrl+shift+d', label: 'Show Debug',
   need: 'editor:plain.txt@0', expect: C.sidebar(/run|debug/i)},
  {id: 'extensions', cat: 'Display', keys: 'ctrl+shift+x', label: 'Show Extensions',
   need: 'editor:plain.txt@0', expect: C.sidebar(/extension/i)},
  {id: 'replaceinfiles', cat: 'Display', keys: 'ctrl+shift+h', label: 'Replace in files',
   need: 'editor:plain.txt@0', expect: C.sidebar(/search/i)},
  // the panel may already be OPEN on another view, in which case this switches views rather
  // than toggling visibility — both are the command working
  {id: 'output', cat: 'Display', keys: 'ctrl+shift+u', label: 'Show Output panel',
   need: 'editor:plain.txt@0', expect: C.panelChanged()},
  {id: 'mdpreview', cat: 'Display', keys: 'ctrl+shift+v', label: 'Open Markdown preview',
   need: 'editor:notes.md@0', expect: C.webviewsGrew()},
  // "to the side" splits when there is nothing to the side yet and REUSES the neighbouring group
  // when there already is one, so pinning this to `groupsGrew` made it fail purely on test order.
  {id: 'mdpreviewside', cat: 'Display', keys: 'ctrl+k v', label: 'Open Markdown preview to the side',
   need: 'editor:notes.md@0', expect: C.either(C.groupsGrew(), C.webviewsGrew(), C.activeTabChanged())},
  {id: 'zen', cat: 'Display', keys: 'ctrl+k z', label: 'Zen Mode',
   need: 'editor:plain.txt@0', expect: C.zen()},
  {id: 'editorlayout', cat: 'Display', keys: 'shift+alt+0', label: 'Toggle editor layout',
   need: 'split', expect: C.layoutFlipped()},
  {id: 'fullscreen', cat: 'Display', keys: 'f11', label: 'Toggle full screen',
   need: 'editor:plain.txt@0', manual: 'browser fullscreen needs a user gesture; a synthetic key is refused'},
  {id: 'searchdetails', cat: 'Display', keys: 'ctrl+shift+j', label: 'Toggle Search details',
   need: 'searchview', expect: C.sidebarBodyChanged()},

  // ── Debug ─────────────────────────────────────────────────────────────────────────────────
  {id: 'breakpoint', cat: 'Debug', keys: 'f9', label: 'Toggle breakpoint',
   need: 'editor:main.ts@1', expect: C.breakpointsGrew()},
  // MEASURED ACROSS FOUR RUNS: with no debug extension installed, F5 sometimes raises a
  // notification and sometimes does nothing observable at all. It is bound (`debug.openView` when
  // `!debuggersAvailable`), it simply has nothing to open. Reported honestly as unverified rather
  // than given a check loose enough to always pass — this is the one chord on the card that a bare
  // `code serve-web` workspace genuinely cannot demonstrate.
  {id: 'startdebug', cat: 'Debug', keys: 'f5', label: 'Start/Continue',
   need: 'editor:hello.py@0', manual: 'bound, but a bare serve-web workspace has no debug extension, so there is nothing to start'},
  {id: 'showhover', cat: 'Debug', keys: 'ctrl+k ctrl+i', label: 'Show hover',
   need: 'editor:main.ts@symbol:twice', expect: C.hover()},

  // ── Integrated terminal ───────────────────────────────────────────────────────────────────
  {id: 'terminal', cat: 'Terminal', keys: 'ctrl+`', label: 'Show integrated terminal',
   need: 'editor:plain.txt@0', expect: C.panelChanged()},
  {id: 'newterminal', cat: 'Terminal', keys: 'ctrl+shift+`', label: 'Create new terminal',
   need: 'terminal', expect: C.anything()},
];
