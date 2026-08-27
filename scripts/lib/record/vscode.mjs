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

// Resolve the VS Code CLI. `code` on PATH is a shell shim on Windows, so exec it
// through the shell rather than as a bare binary.
export const vscodeVersion = () => {
  try {
    return execFileSync('code', ['--version'], {encoding: 'utf8', shell: true}).split(/\r?\n/)[0].trim();
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
  const child = execFile('code', [
    'serve-web',
    '--port', String(chosen),
    '--without-connection-token',
    '--accept-server-license-terms',
    '--server-data-dir', data,
    '--default-folder', workspace,
  ], {shell: true, windowsHide: true});
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
    url, port: chosen, workspace,
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
export const workbenchUrl = (serverUrl) => serverUrl;

/** Run a command through the palette. Web keybindings differ from desktop, so the
 *  palette is the only reliable way to invoke anything (VS Code Web shows Ctrl+Shift+C
 *  for Create New Terminal, not the desktop backtick binding). */
export const palette = async (page, command, {settle = 1200} = {}) => {
  await page.keyboard.press('Control+Shift+P');
  await page.waitForTimeout(700);
  await page.keyboard.type(command, {delay: 18});
  await page.waitForTimeout(settle);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
};

export const openWorkbench = async (page, serverUrl, {timeout = 90000} = {}) => {
  await page.goto(workbenchUrl(serverUrl), {waitUntil: 'domcontentloaded', timeout});
  await page.waitForSelector('.monaco-workbench', {timeout});
  // The workbench mounts before the remote connection is up; the terminal will not
  // start until it is. Wait for the window to settle rather than racing it.
  await page.waitForTimeout(6000);
};

/**
 * Write user settings through the REAL settings editor, then reload.
 * PASTE, NEVER TYPE — Monaco auto-closes brackets and quotes, so typed JSON arrives
 * mangled. Requires clipboard permissions on the context.
 */
export const applySettings = async (page, serverUrl, settings) => {
  await palette(page, 'Preferences: Open User Settings (JSON)', {settle: 1800});
  await page.waitForTimeout(3500);
  await page.evaluate(async (t) => { await navigator.clipboard.writeText(t); }, JSON.stringify(settings, null, 2));
  await page.keyboard.press('Control+A');
  await page.waitForTimeout(250);
  await page.keyboard.press('Control+V');
  await page.waitForTimeout(900);
  await page.keyboard.press('Control+S');
  await page.waitForTimeout(2000);
  // Reload: the theme and the terminal renderer only take effect from a clean boot.
  await openWorkbench(page, serverUrl);
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
  return done;
};

/** Is the secondary side bar (Chat/Copilot column) actually taking up frame? */
export const auxBarOpen = async (page) =>
  page.evaluate(() => {
    const el = document.querySelector('.part.auxiliarybar');
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 20 && r.height > 20;
  });
