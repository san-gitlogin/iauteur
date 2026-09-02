// VS CODE SURFACE — a real VS Code, served locally by `code serve-web`, driven by
// Playwright. The backend is THIS machine, so the integrated terminal is a real shell
// running real commands against real files. That is the whole reason this surface was
// chosen over vscode.dev, which has no terminal and no debugger at all.
//
// Everything here is measured, not assumed — see docs/SCREEN_RECORDING.md §3.
//
// THE PREP / TAKE SPLIT: prep() is never recorded. It closes the Welcome tab, hides the
// Chat panel, clears notification toasts and kills leftover terminals, so the TAKE frame
// contains only what the demo put there (invariant 3). Nothing is faked — it is the same
// tidying a person does before hitting record.
import {execFile, execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export const DEFAULT_PORT = 9911;

// ── THEME (owner decision D7: dark by default, light on request) ─────────────
export const THEME_IDS = {
  dark: 'Default Dark Modern',
  light: 'Default Light Modern',
};

// The settings recipe. Web user settings CANNOT be seeded from disk (neither the
// server data dir nor workspace .vscode/settings.json drives the web client) — they are
// written through the real settings editor in prep() and persist in the browser profile.
export const recordingSettings = ({theme = 'dark', fontSize = 18, terminalFontSize = 16} = {}) => ({
  // THE CRITICAL ONE. "off" switches xterm.js to the DOM renderer, which is what makes
  // `.xterm-rows` exist and the terminal buffer READABLE. Without it the terminal is a
  // canvas and there is no ground truth — the anti-hallucination rule cannot be met.
  'terminal.integrated.gpuAcceleration': 'off',
  'terminal.integrated.fontSize': terminalFontSize,
  'terminal.integrated.fontFamily': 'Consolas, "Cascadia Mono", monospace',
  // A blinking cursor makes frames non-deterministic and defeats frame comparison.
  'terminal.integrated.cursorBlinking': false,
  // Shell integration gives per-command exit codes for free. DO NOT override
  // `terminal.integrated.profiles.windows` with a custom `-Command` — VS Code injects
  // its own args to bootstrap shell integration, and a custom arg list displaces them,
  // which silently costs every exit code (measured: all null). The short prompt is set
  // by TYPING it during PREP instead, which is never recorded. See primeTerminal().
  // GIT MUST NOT REACT TO THE TAKE.
  //
  // A demo that scaffolds a project creates a repository ON CAMERA — `uv init` writes
  // .git/ — and VS Code's git extension then wakes up mid-take: it rescans, decorates the
  // Explorer, and can raise the "a git repository was found" prompt that gotcha 3 already
  // lists as prep pollution. Measured consequence: the step AFTER the one that created the
  // repo never returned a prompt, a SECOND xterm viewport appeared, and the run burned its
  // whole 120s timeout on a `cat` that had nothing wrong with it.
  //
  // Nothing in a recording needs source control, so it is switched off rather than fought.
  'git.enabled': false,
  'git.autoRepositoryDetection': false,
  'git.openRepositoryInParentFolders': 'never',
  'git.decorations.enabled': false,
  'scm.diffDecorations': 'none',
  'terminal.integrated.shellIntegration.enabled': true,
  'terminal.integrated.shellIntegration.decorationsEnabled': 'gutter',
  'editor.fontSize': fontSize,
  'editor.fontFamily': 'Consolas, "Cascadia Mono", monospace',
  'editor.cursorBlinking': 'solid',
  'editor.minimap.enabled': false,
  'editor.renderWhitespace': 'none',
  'editor.stickyScroll.enabled': false,
  // TYPING MUST PRODUCE EXACTLY WHAT WAS AUTHORED. Monaco's helpfulness is the enemy of
  // an honest capture: auto-closing inserts a second bracket the author never wrote,
  // auto-indent doubles the indentation of pasted-looking code, and a suggestion
  // accepted on Enter silently changes an identifier. All of it would be VISIBLE in the
  // recording and wrong. Turn the lot off for the take.
  'editor.autoClosingBrackets': 'never',
  'editor.autoClosingQuotes': 'never',
  'editor.autoSurround': 'never',
  'editor.autoIndent': 'none',
  'editor.formatOnType': false,
  'editor.formatOnPaste': false,
  'editor.quickSuggestions': false,
  'editor.suggestOnTriggerCharacters': false,
  'editor.acceptSuggestionOnEnter': 'off',
  'editor.tabCompletion': 'off',
  'editor.parameterHints.enabled': false,
  'editor.wordBasedSuggestions': 'off',
  'editor.inlineSuggest.enabled': false,
  'breadcrumbs.enabled': false,
  'workbench.colorTheme': THEME_IDS[theme] ?? THEME_IDS.dark,
  // AUTO-SAVE OFF. VS Code for the Web enables it, and the runner's `save` action proves a save
  // happened by asserting the tab is no longer dirty - which is vacuously true when the file was
  // never dirty in the first place. Found while probing shortcuts: a diagnostic printed the tab's
  // class list before typing, after typing and after Ctrl+S and it never once carried `dirty`.
  // A demo that shows Ctrl+S should also be the thing that actually writes the file.
  'files.autoSave': 'off',
  'workbench.startupEditor': 'none',
  'workbench.tips.enabled': false,
  'workbench.editor.showTabs': 'multiple',
  'window.commandCenter': false,
  'git.openRepositoryInParentFolders': 'never',
  'git.enabled': false,
  'update.showReleaseNotes': false,
  'telemetry.telemetryLevel': 'off',
  'chat.commandCenter.enabled': false,
  'workbench.activityBar.location': 'default',
  // The Chat / Copilot column lives in the secondary side bar. Closing it via the
  // palette alone is not enough: it came back after the settings reload, because the
  // workbench restores its own layout on boot. Hide it by DEFAULT as well.
  'workbench.secondarySideBar.defaultVisibility': 'hidden',
  'explorer.confirmDelete': false,
  // A "Do you want to install the recommended 'Python' extension?" toast appeared
  // MID-TAKE and landed in the footage — invariant 3 (the runner owns the whole
  // viewport). Recommendations are per-language and fire the first time a file type is
  // opened, so prep-time toast clearing does not catch them.
  'extensions.ignoreRecommendations': true,
  'workbench.enableExperiments': false,
  'workbench.welcomePage.walkthroughs.openOnInstall': false,
  // WORKSPACE TRUST. Once the folder is REALLY opened (which only happens with
  // --default-folder), VS Code refuses to start a terminal until the folder is trusted:
  // a modal saying "Creating a terminal process requires executing code" plus a
  // Restricted Mode banner across the top of the frame. The terminal then sits empty
  // forever, which looks exactly like a shell that failed to start.
  // This is a recording sandbox whose contents WE scaffold, so trust is not in question.
  'security.workspace.trust.enabled': false,
  'security.workspace.trust.startupPrompt': 'never',
  'security.workspace.trust.banner': 'never',
  'security.workspace.trust.untrustedFiles': 'open',
});

// ── SERVER LIFECYCLE ─────────────────────────────────────────────────────────
const httpStatus = async (url) => {
  try {
    const res = await fetch(url, {redirect: 'manual'});
    return res.status;
  } catch {
    return 0;
  }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * THE PRIMARY MODIFIER IS NOT ALWAYS Control.
 *
 * VS Code for the Web adapts its keybindings to the HOST OS, so on macOS the palette is
 * Cmd+Shift+P and select-all/paste/save are Cmd. Playwright's "Control+A" sends a real
 * Control, which on macOS is a different (mostly unbound) chord — so every one of these
 * presses did nothing, silently. Measured here: the settings paste no-oped and the run died
 * three steps later at "Theme did not apply: wanted dark, workbench isDark=false", which
 * names the symptom and not one word of the cause.
 *
 * `ControlOrMeta` is Playwright's own name for "the platform's primary modifier".
 * Use it for EDITOR/WORKBENCH commands. Do NOT use it for the terminal's Ctrl+C: that is
 * SIGINT, and it is Control on every platform including macOS.
 */
export const PRIMARY = 'ControlOrMeta';

// RESOLVE THE VS CODE CLI — AND PROVE IT IS VS CODE.
//
// `code` on PATH is not necessarily Visual Studio Code. On the macOS machine here it is a
// symlink into Cursor.app, and Cursor is a VS Code FORK: it answers `--version`, it answers
// `serve-web`, and its workbench carries `.monaco-workbench`, so every assertion the runner
// makes passes. The recording would have come out looking right and been footage of a
// different product — in a course about VS Code. Silent, plausible, and wrong, which is the
// exact defect class this subsystem was built to prevent.
//
// The discriminator is `serve-web --help`, whose first line NAMES the product it serves:
//   VS Code -> "Runs a local web version of Visual Studio Code"
//   Cursor  -> "Runs a local web version of Cursor"
// `--version` cannot do it (VS Code prints 1.109.1, Cursor prints 2.5.20 — a number, with
// nothing saying whose).
//
// Order: an explicit override, then PATH, then the platform's real install locations.
const CLI_CANDIDATES = () => {
  const home = os.homedir();
  if (os.platform() === 'darwin') return [
    '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code',
    `${home}/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code`,
  ];
  if (os.platform() === 'win32') return [
    'C:/Program Files/Microsoft VS Code/bin/code',
    `${home}/AppData/Local/Programs/Microsoft VS Code/bin/code`,
  ];
  return ['/usr/share/code/bin/code', '/snap/bin/code', '/usr/bin/code'];
};

/** The first line of `serve-web --help`, or null. This is the identity probe. */
// `shell: true` is for the Windows `code.cmd` shim ONLY. Elsewhere the CLI is a real
// executable with a shebang, and putting an absolute path through a shell re-splits it on
// spaces: "/Applications/Visual Studio Code.app/…" ran as "/Applications/Visual".
const viaShell = (cli) => os.platform() === 'win32' && !path.isAbsolute(cli);

const serveWebBanner = (cli) => {
  try {
    return execFileSync(cli, ['serve-web', '--help'],
      {encoding: 'utf8', shell: viaShell(cli), windowsHide: true, timeout: 20000})
      .split(/\r?\n/)[0].trim();
  } catch { return null; }
};

const isRealVsCode = (cli) => /version of Visual Studio Code/i.test(serveWebBanner(cli) ?? '');

/**
 * DOES THIS BUILD'S serve-web TAKE `--default-folder`?
 *
 * Gotcha 12 records that `?folder=` "DOES NOT WORK with code serve-web" and that binding the
 * folder with `--default-folder` is the fix. Both halves were measured on VS Code 1.134.0 and
 * neither is universal:
 *   1.134.0 — has --default-folder;   ?folder= leaves the Explorer an unreadable leaf
 *   1.109.1 — REJECTS --default-folder ("unexpected argument") and the server never starts,
 *             while ?folder= binds the folder correctly (Explorer lists the files at level 1)
 * So the runner asks the build what it supports instead of pinning one answer, and
 * `openWorkbench` asserts the folder actually bound either way.
 */
const serveWebHelp = (cli) => {
  try {
    return execFileSync(cli, ['serve-web', '--help'],
      {encoding: 'utf8', shell: viaShell(cli), windowsHide: true, timeout: 20000});
  } catch (e) { return String(e.stdout || '') + String(e.stderr || ''); }
};
let _hasDefaultFolder = null;
export const supportsDefaultFolder = (cli = vscodeCli()) => {
  if (_hasDefaultFolder === null) _hasDefaultFolder = /--default-folder/.test(serveWebHelp(cli));
  return _hasDefaultFolder;
};

let _cli = null;
export const vscodeCli = () => {
  if (_cli) return _cli;
  const override = process.env.IAUTEUR_VSCODE_CLI;
  if (override) {
    if (!isRealVsCode(override)) {
      throw new Error(`IAUTEUR_VSCODE_CLI="${override}" is not Visual Studio Code ` +
        `(serve-web says: ${serveWebBanner(override) ?? 'nothing'}).`);
    }
    return (_cli = override);
  }
  const tried = [];
  for (const c of ['code', ...CLI_CANDIDATES()]) {
    if (c !== 'code' && !fs.existsSync(c)) continue;
    const banner = serveWebBanner(c);
    if (banner && /version of Visual Studio Code/i.test(banner)) return (_cli = c);
    if (banner) tried.push(`  ${c}\n      -> ${banner}`);
  }
  throw new Error(
    'No Visual Studio Code CLI found. The recorder drives `code serve-web`, and a VS Code\n' +
    'FORK (Cursor, Windsurf, VSCodium…) answers every probe while serving a different\n' +
    'product — so the runner refuses rather than record the wrong workbench.\n' +
    (tried.length ? 'Rejected:\n' + tried.join('\n') + '\n' : '') +
    'Fix: install VS Code, or set IAUTEUR_VSCODE_CLI to its `bin/code`.');
};

/** The resolved CLI's version string (first line of `--version`). */
export const vscodeVersion = () => {
  try {
    const cli = vscodeCli();
    return execFileSync(cli, ['--version'], {encoding: 'utf8', shell: viaShell(cli)})
      .split(/\r?\n/)[0].trim();
  } catch {
    return null;
  }
};

/** Find a free TCP port so each recording gets its own server, bound to its own folder. */
const freePort = async () => {
  const net = await import('node:net');
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const p = srv.address().port;
      srv.close(() => resolve(p));
    });
  });
};

/**
 * Start `code serve-web` BOUND TO A WORKSPACE FOLDER.
 *
 * ⚠ THE BIG ONE (measured 2026-08-26). **`?folder=<path>` DOES NOT WORK for serve-web.**
 * The workbench resolves that path in the BROWSER's context, where there is no file
 * system, so the Explorer shows the folder as an unreadable leaf (`aria-expanded=null`,
 * zero children) and Quick Open finds nothing — while the integrated terminal, which
 * runs server-side, sits in the folder perfectly and runs its files. That split is what
 * makes the bug so confusing: the shell can see files the editor cannot.
 * The supported route is the CLI flag `--default-folder`, then navigate to the bare
 * server URL with NO query string. Verified: Explorer then lists `hello.py`, `notes.txt`.
 *
 * Because the folder is fixed at SERVER START, each recording gets its own server on its
 * own free port, and stops it when done. No cross-recording reuse, no stale workspace.
 *
 * Also: the first launch DOWNLOADS the server and answers HTTP 202 with a self-reloading
 * page until ready. Polling for the port to open is not enough — poll for 200.
 */
export const startServer = async ({workspace, port, dataDir, timeoutMs = 180000} = {}) => {
  if (!workspace) throw new Error('startServer needs a workspace folder (serve-web binds it at start)');
  const chosen = port || (await freePort());
  const url = `http://127.0.0.1:${chosen}`;

  const data = dataDir || path.join(os.tmpdir(), 'iauteur-rec-vscode');
  fs.mkdirSync(data, {recursive: true});
  fs.mkdirSync(workspace, {recursive: true});
  const cliPath = vscodeCli();
  const canBind = supportsDefaultFolder(cliPath);
  const child = execFile(cliPath, [
    'serve-web',
    '--port', String(chosen),
    '--without-connection-token',
    '--accept-server-license-terms',
    '--server-data-dir', data,
    // Passing an unsupported flag is not a warning here — the CLI exits with
    // "unexpected argument" and the server never listens, which surfaces 180s later as a
    // bare "did not become ready" with no cause in it.
    ...(canBind ? ['--default-folder', workspace] : []),
  ], {shell: viaShell(cliPath), windowsHide: true});
  child.unref?.();

  const started = Date.now();
  for (;;) {
    const st = await httpStatus(url);
    if (st === 200) break;
    if (Date.now() - started > timeoutMs) {
      throw new Error(`code serve-web did not become ready on ${url} within ${timeoutMs}ms (last status ${st}). ` +
        `First run downloads the server — try again, or run it by hand to see its output.`);
    }
    await sleep(st === 202 ? 2000 : 700); // 202 = still downloading
  }
  return {
    url, port: chosen, workspace, boundByFlag: canBind,
    stop: async () => {
      // REAP THE WHOLE TREE. `code` is a shell shim, so killing the child we spawned
      // leaves the actual server process alive and still holding the port.
      // PAID FOR: every failed run leaked one, and after 26 of them the machine could no
      // longer start a terminal at all — recordings failed for a reason that had nothing
      // to do with the code being debugged.
      try { child.kill(); } catch { /* already gone */ }
      try {
        reapPort(chosen);
      } catch { /* best effort — never let teardown fail a recording */ }
    },
  };
};

/** Kill whatever still holds `port`, on either platform. Best effort by design: this is
 *  teardown, and a stubborn orphan must never fail an otherwise-good recording. */
/**
 * START FROM A CLEAN MACHINE.
 *
 * `stop()` reaps the LISTENER, but `code serve-web` spawns a whole tree of server processes under
 * `~/.vscode/cli/serve-web/` and those are orphaned rather than killed — the shim exits first, so
 * there is no parent left to recurse from. They accumulate silently.
 *
 * Measured on 2026-08-28 after ten shortcut-probe runs: **87 stray node processes**, and the next
 * recording died with `x264 [error]: malloc of size 5074176 failed` — ffmpeg could not get five
 * megabytes. Killing them returned 12.8 GB. The existing note in `startServer` says 26 of these
 * once left the machine unable to start a terminal at all; this is the same failure, three times
 * bigger, and it had been quietly getting worse every run.
 *
 * Reaping at STARTUP rather than at teardown is deliberate: teardown cannot tell an orphan from a
 * concurrently running server, and startup does not need to — nothing else is meant to be running.
 */
export const reapStaleServers = () => {
  if (os.platform() !== 'win32') {
    try {
      execFileSync('sh', ['-c', 'pkill -f "\\.vscode/cli/serve-web/" 2>/dev/null || true'], {stdio: 'ignore'});
    } catch { /* best effort */ }
    return 0;
  }
  try {
    const out = execFileSync('powershell', ['-NoProfile', '-Command',
      `$p = Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ` +
      // NO TRAILING BACKSLASH. PowerShell's -match takes a REGEX, and a pattern ending in a lone
      // backslash is "Illegal \\ at end of pattern" — the whole call throws and the reaper silently
      // kills nothing, which is exactly the leak it exists to stop. Caught by running the same
      // command by hand and reading the error.
      `Where-Object { $_.CommandLine -match 'cli.serve-web' -and $_.CommandLine -notmatch 'claude' }; ` +
      `$p | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; ` +
      `($p | Measure-Object).Count`],
      {encoding: 'utf8', windowsHide: true});
    return Number(String(out).trim()) || 0;
  } catch {
    return 0; // never let housekeeping fail a run
  }
};

export const reapPort = (port) => {
  if (os.platform() === 'win32') {
    execFileSync('powershell', ['-NoProfile', '-Command',
      `Get-CimInstance Win32_Process -Filter "Name='node.exe' OR Name='code-tunnel.exe'" | ` +
      `Where-Object { $_.CommandLine -like '*serve-web*--port*${port}*' } | ` +
      `ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; ` +
      `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | ` +
      `Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }`],
      {stdio: 'ignore', windowsHide: true});
    return;
  }
  // POSIX: match the command line first (the shim problem is the same), then fall back to
  // whoever is listening on the port. `|| true` so neither miss aborts teardown.
  execFileSync('sh', ['-c',
    `pkill -f "serve-web.*--port[ =]${port}" 2>/dev/null || true; ` +
    `(command -v lsof >/dev/null && lsof -ti tcp:${port} | xargs -r kill -9 2>/dev/null) || true`],
    {stdio: 'ignore'});
};

// ── PAGE HELPERS ─────────────────────────────────────────────────────────────
// NO query string. The folder is bound at server start via --default-folder; passing
// `?folder=` instead makes the workbench resolve the path in the BROWSER, where there is
// no file system — the Explorer then shows an unreadable leaf and Quick Open finds
// nothing, while the server-side terminal works fine. See startServer.
export const workbenchUrl = (serverUrl, {workspace = null, boundByFlag = true} = {}) =>
  boundByFlag || !workspace
    ? serverUrl
    : `${serverUrl.replace(/\/$/, '')}/?folder=${encodeURIComponent(workspace)}`;

/** Run a command through the palette. Web keybindings differ from desktop, so the
 *  palette is the only reliable way to invoke anything (VS Code Web shows Ctrl+Shift+C
 *  for Create New Terminal, not the desktop backtick binding). */
export const palette = async (page, command, {settle = 1200} = {}) => {
  await page.keyboard.press(`${PRIMARY}+Shift+P`);
  await page.waitForTimeout(700);
  await page.keyboard.type(command, {delay: 18});
  await page.waitForTimeout(settle);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
};

export const openWorkbench = async (page, serverUrl, {timeout = 90000, workspace = null, boundByFlag = true} = {}) => {
  await page.goto(workbenchUrl(serverUrl, {workspace, boundByFlag}), {waitUntil: 'domcontentloaded', timeout});
  await page.waitForSelector('.monaco-workbench', {timeout});
  // The workbench mounts before the remote connection is up; the terminal will not
  // start until it is. Wait for the window to settle rather than racing it.
  await page.waitForTimeout(6000);

  // ASSERT THE FOLDER ACTUALLY BOUND — do not trust either route.
  //
  // This is the failure that cost a full diagnostic cycle in gotcha 12, and it is
  // deceptive in a specific way: the integrated terminal runs SERVER-side, so it sits in
  // the folder and runs its files happily while the EDITOR cannot see them. Every
  // terminal-driven step therefore passes and the recording looks fine until a step opens
  // a file. Checking the Explorer costs one evaluate and names the problem at second 15
  // instead of at minute 4.
  if (workspace) {
    // The signal is the FOLDER NAME IN THE WINDOW TITLE, not the file list. An empty
    // Explorer proves nothing: a demo whose whole point is to create the files (uv init,
    // git init, a scaffolder) starts from an empty directory, and the first version of
    // this check called that a bind failure. VS Code titles a bound window
    // "<file> — <folder> — Visual Studio Code" and an unbound one has no folder segment.
    const leaf = path.basename(workspace);
    const bound = await page.waitForFunction(
      (name) => document.title.split('\u2014').some((p) => p.trim() === name),
      leaf, {timeout: 30000},
    ).then(() => true).catch(() => false);
    if (!bound) {
      throw new Error(
        `The workspace ${workspace} did not bind — "${leaf}" never appeared in the window title ` +
        `(saw ${JSON.stringify(await page.title())}).\n` +
        `  route used: ${boundByFlag ? '--default-folder' : '?folder='}\n` +
        `  The terminal runs SERVER-side and would still work, so terminal-only steps would ` +
        `pass while the editor saw nothing — which is why this is checked here.`);
    }
  }
};

/**
 * Write user settings through the REAL settings editor, then reload.
 * PASTE, NEVER TYPE — Monaco auto-closes brackets and quotes, so typed JSON arrives
 * mangled. Requires clipboard permissions on the context.
 */
export const applySettings = async (page, serverUrl, settings, {workspace = null, boundByFlag = true} = {}) => {
  await palette(page, 'Preferences: Open User Settings (JSON)', {settle: 1800});
  await page.waitForTimeout(3500);
  await page.evaluate(async (t) => { await navigator.clipboard.writeText(t); }, JSON.stringify(settings, null, 2));
  await page.keyboard.press(`${PRIMARY}+A`);
  await page.waitForTimeout(250);
  await page.keyboard.press(`${PRIMARY}+V`);
  await page.waitForTimeout(900);
  await page.keyboard.press(`${PRIMARY}+S`);
  await page.waitForTimeout(2000);
  // Reload: the theme and the terminal renderer only take effect from a clean boot.
  // The workspace has to be carried through the reload — on the ?folder= route the bare
  // URL comes back with NO folder bound, and every later step then runs against an empty
  // window that still looks like a working workbench.
  await openWorkbench(page, serverUrl, {workspace, boundByFlag});
};

/** Did the settings actually land? Assert on the EFFECT, never by reading the settings
 *  editor's text — Monaco virtualises its lines, so that check reports false negatives. */
export const verifySurface = async (page, {theme = 'dark'} = {}) => {
  const cls = (await page.locator('.monaco-workbench').getAttribute('class')) || '';
  const isDark = /vs-dark|hc-black/.test(cls);
  const themeOk = theme === 'dark' ? isDark : !isDark;
  const renderer = await page.evaluate(() => ({
    rows: document.querySelectorAll('.xterm-rows').length,
    canvas: document.querySelectorAll('.xterm canvas').length,
  }));
  return {themeOk, isDark, ...renderer};
};

/** PREP — tidy the frame. Never recorded. */
export const prep = async (page) => {
  const done = [];
  const step = async (cmd, label) => {
    await palette(page, cmd);
    done.push(label);
    await page.waitForTimeout(400);
  };
  await step('Notifications: Clear All Notifications', 'cleared toasts');
  await step('View: Close All Editors', 'closed editors');
  await step('Terminal: Kill All Terminals', 'killed stray terminals');
  // The Chat/Copilot panel lives in the secondary side bar. Closing that removes the
  // whole "Build with Agent" column from the frame.
  // If a trust modal is on screen (e.g. settings had not applied yet), accept it —
  // otherwise no terminal will ever start.
  const trust = page.locator('.monaco-dialog-box button', {hasText: 'Trust Folder'});
  if (await trust.count().catch(() => 0)) {
    await trust.first().click().catch(() => {});
    done.push('trusted the workspace');
    await page.waitForTimeout(1200);
  }
  await step('View: Close Secondary Side Bar', 'hid chat panel');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);

  // VERIFY, then retry. The palette command is not idempotent-by-observation: the
  // workbench restores the secondary side bar on boot, so a single blind invocation
  // silently left the Chat column in frame. Close it until it is measurably gone.
  for (let i = 0; i < 3; i++) {
    if (!(await auxBarOpen(page))) break;
    await palette(page, 'View: Close Secondary Side Bar');
    await page.waitForTimeout(500);
  }
  if (await auxBarOpen(page)) done.push('WARNING: secondary side bar still open');

  // GIVE A TERMINAL DEMO THE WHOLE FRAME.
  //
  // The default panel is ~13 rows. `cat pyproject.toml` prints 18 lines, so a third of the
  // file scrolled away before anything could be measured and the take died on
  // "Mark could not be measured" — the runner correctly refusing to invent a rectangle for
  // text that was genuinely not on screen.
  //
  // It is also just the wrong picture: on a terminal-driven demo the editor half is empty
  // (the VS Code watermark logo, and nothing else), so more than half the captured frame
  // carries no information and the part that does is squeezed into 13 rows. Maximising the
  // panel roughly triples the visible rows AND fills the frame with the thing being taught.
  // Verified by effect, not by firing the command and hoping (gotcha 8).
  return done;
};

/** Row count of the active terminal — the observable the maximise step asserts on. */
const terminalRows = (page) => page.evaluate(() =>
  document.querySelectorAll('.terminal-wrapper.active .xterm-rows > div').length);

/**
 * Maximise the panel. MUST run AFTER openTerminal — prep kills every terminal, so at prep
 * time there is nothing to measure and the toggle would fire blind.
 * Returns a note for the run log.
 */
export const maximizeTerminalPanel = async (page, {want = 24} = {}) => {
  for (let i = 0; i < 3; i++) {
    if (await terminalRows(page) >= want) break;
    await palette(page, 'View: Toggle Maximized Panel');
    await page.waitForTimeout(800);
  }
  const rows = await terminalRows(page);
  return rows >= want ? `maximized panel (${rows} rows)` : `WARNING: panel is only ${rows} rows`;
};

/** Is the secondary side bar (Chat/Copilot column) actually taking up frame? */
export const auxBarOpen = async (page) =>
  page.evaluate(() => {
    const el = document.querySelector('.part.auxiliarybar');
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 20 && r.height > 20;
  });
