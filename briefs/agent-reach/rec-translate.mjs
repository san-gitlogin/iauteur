#!/usr/bin/env node
// RECORD CHROME'S BUILT-IN TRANSLATOR, ON THE REAL WINDOW.
//   node briefs/agent-reach/rec-translate.mjs            -> public/rec/ar-translate/{manifest.json, seg-0N.mp4}
//
// Why this is not a normal browser demo: the translator is BROWSER UI — the right-click menu and the
// Google Translate panel under the address bar. A page capture never contains either, and Playwright's
// own launch switches the Translate feature off. So this starts the installed Chrome with a clean
// profile under the recording root, attaches over CDP only to scroll and to measure, and films the
// window itself with ffmpeg's gdigrab. The menu is native, so its keys come from the OS.
//
// The owner's rule for unwanted content: REMOVE the node before filming, never blur afterwards.
// The README's sponsor block (third-party adverts with referral links) is deleted from the DOM here.
//
// What is measured and what is not: marks on PAGE text are read from the DOM and mapped into capture
// pixels. The menu item and the translate panel are native UI with no DOM; their rectangles are
// measured from the take's own frame afterwards and written into NATIVE below.
import fs from 'node:fs';
import path from 'node:path';
import {spawn, execFileSync} from 'node:child_process';
import {chromium} from 'playwright';

const ROOT = process.env.IAUTEUR_REC_ROOT;
if (!ROOT) { console.error('set IAUTEUR_REC_ROOT'); process.exit(1); }
const CHROME = process.env.IAUTEUR_CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL_ = 'https://github.com/Panniantong/Agent-Reach';
const SLUG = 'ar-translate';
const OUT = path.join('public/rec', SLUG);
const PORT = 9334, FPS = 30;
// Native-UI rectangles in capture pixels, measured from this take's frames (see the header).
// Measured on the 3582x2016 take of 2026-10-03 (the menu opens at the same place every run, because the
// click point and the window are fixed). Re-measure if the window size or the click point changes.
const NATIVE = JSON.parse(process.env.AR_NATIVE ?? JSON.stringify({
  menu: {item: {x: 2373, y: 1666, w: 940, h: 96, covers: 'Translate to English'}},
  translated: {panel: {x: 2313, y: 254, w: 1015, h: 248, covers: 'Detected Language English Google Translate'}},
}));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// KEYS GO THROUGH keybd_event, NOT WScript SendKeys. SendKeys toggles NumLock on the way, and the laptop's
// lock-key overlay ('1 On') was drawn over the capture (second take, 2026-10-03). vk: 0 = focus only.
const key = (vk) => execFileSync('powershell', ['-NoProfile', '-Command',
  "\ = New-Object -ComObject WScript.Shell; \ = \.AppActivate('Agent-Reach'); Start-Sleep -Milliseconds 200; " +
  (vk ? "Add-Type -Namespace W -Name K -MemberDefinition '[DllImport(\"user32.dll\")] public static extern void keybd_event(byte v, byte s, uint f, System.UIntPtr e);'; " +
        "[W.K]::keybd_event(" + vk + ", 0, 0, [System.UIntPtr]::Zero); Start-Sleep -Milliseconds 60; [W.K]::keybd_event(" + vk + ", 0, 2, [System.UIntPtr]::Zero)" : '')],
  {stdio: 'ignore', windowsHide: true});

const profile = path.join(ROOT, '_ar-chrome');
fs.mkdirSync(path.join(profile, 'Default'), {recursive: true});
const prefFile = path.join(profile, 'Default', 'Preferences');
let prefs = {};
try { prefs = JSON.parse(fs.readFileSync(prefFile, 'utf8')); } catch { /* first run */ }
prefs.translate = {...(prefs.translate ?? {}), enabled: true};
prefs.profile = {...(prefs.profile ?? {}), exit_type: 'Normal', exited_cleanly: true};
fs.writeFileSync(prefFile, JSON.stringify(prefs));

fs.rmSync(OUT, {recursive: true, force: true});
fs.mkdirSync(OUT, {recursive: true});

const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT}`, `--user-data-dir=${path.resolve(profile)}`,
  '--no-first-run', '--no-default-browser-check', '--hide-crash-restore-bubble', '--lang=en-US', 'about:blank'],
  {stdio: 'ignore'});
let browser, ff;
try {
  for (let i = 0; i < 40 && !browser; i++) {
    try { browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`); } catch { await sleep(500); }
  }
  if (!browser) throw new Error('Chrome did not open its debugging port');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0] ?? await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);

  // A 16:9 window that fits above the taskbar. Windows keeps an invisible ~7px resize border on the
  // left, right and bottom of a normal window, so the window is placed 7px off-screen on those sides.
  const scr = await page.evaluate(() => ({aw: screen.availWidth, ah: screen.availHeight, dpr: devicePixelRatio}));
  const B = 7;
  const regH = Math.floor(scr.ah / 2) * 2, regW = Math.min(scr.aw, Math.floor((regH * 16 / 9) / 2) * 2);
  const {windowId} = await cdp.send('Browser.getWindowForTarget');
  await cdp.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'normal'}});
  await cdp.send('Browser.setWindowBounds', {windowId, bounds: {left: -B, top: 0, width: regW + 2 * B, height: regH + B}});
  // GitHub follows the browser's colour scheme, and a fresh profile came up LIGHT on the third take: a white
  // page inside a dark video, next to footage of the same repo recorded dark. Ask for dark explicitly.
  await cdp.send('Emulation.setEmulatedMedia', {features: [{name: 'prefers-color-scheme', value: 'dark'}]});
  await page.goto(URL_, {waitUntil: 'load'});
  await sleep(2500);
  await page.evaluate(() => {
    const md = document.querySelector('article.markdown-body');
    if (!md) return;
    let cutting = false;
    for (const el of [...md.children]) {
      if (!cutting && /赞助商/.test(el.textContent ?? '') && /H2|DIV/.test(el.tagName) && el.querySelector('h2, :scope')?.textContent?.length < 40) cutting = true;
      else if (cutting && (el.tagName === 'HR' || el.querySelector?.('h2'))) break;
      if (cutting) el.remove();
    }
  });
  const geo = await page.evaluate(() => ({sx: screenX, sy: screenY, ow: outerWidth, oh: outerHeight, iw: innerWidth, ih: innerHeight}));
  const side = (geo.ow - geo.iw) / 2;
  const cx = geo.sx + side, cy = geo.sy + (geo.oh - geo.ih) - side;   // page origin, in screen DIPs
  const capW = Math.floor((regW * scr.dpr) / 2) * 2, capH = Math.floor((regH * scr.dpr) / 2) * 2;
  const rectOf = async (sel, textRe) => page.evaluate(([s, re]) => {
    const els = [...document.querySelectorAll(s)].filter((e) => !re || new RegExp(re).test(e.innerText));
    const r = els[0]?.getBoundingClientRect();
    return r ? {x: r.x, y: r.y, w: r.width, h: r.height, covers: els[0].innerText.trim().slice(0, 160)} : null;
  }, [sel, textRe ?? '']);
  const toCap = (r) => r && ({x: Math.round((cx + r.x) * scr.dpr), y: Math.round((cy + r.y) * scr.dpr),
    w: Math.round(r.w * scr.dpr), h: Math.round(r.h * scr.dpr), covers: r.covers});
  const wheel = async (total, ms) => {
    const n = Math.max(1, Math.round(ms / 16));
    for (let i = 0; i < n; i++) {
      const a = i / n, b = (i + 1) / n, e = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
      await page.mouse.wheel(0, total * (e(b) - e(a)));
      await sleep(16);
    }
  };

  // ── film ──
  const raw = path.join(OUT, 'raw.mp4');
  let t0 = null;
  ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'gdigrab', '-framerate', String(FPS), '-draw_mouse', '0',
    '-offset_x', '0', '-offset_y', '0', '-video_size', `${capW}x${capH}`, '-i', 'desktop',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-pix_fmt', 'yuv420p', '-progress', 'pipe:1', raw],
    {stdio: ['pipe', 'pipe', 'inherit']});
  ff.stdout.on('data', (d) => {
    const m = /frame=(\d+)/.exec(String(d));
    if (m && t0 == null && Number(m[1]) > 0) t0 = Date.now() - (Number(m[1]) / FPS) * 1000;
  });
  for (let i = 0; i < 100 && t0 == null; i++) await sleep(100);
  if (t0 == null) throw new Error('ffmpeg never produced a frame');
  const now = () => (Date.now() - t0) / 1000;
  const steps = [];
  const step = async (id, label, fn) => {
    const tStart = now();
    const marks = (await fn()) ?? {};
    for (const k of Object.keys(marks)) if (!marks[k]) delete marks[k];
    steps.push({id, label, tStart, tEnd: now(), marks: {...marks, ...(NATIVE[id] ?? {})}});
    console.log(`  ${id}  ${(now() - tStart).toFixed(1)}s  marks: ${Object.keys(steps.at(-1).marks).join(', ') || '-'}`);
  };

  await page.bringToFront();
  // PARK THE POINTER INSIDE THE WINDOW. Left over the taskbar, it popped Windows' thumbnail previews of the
  // operator's other windows over the bottom of the capture (fourth take, 2026-10-03).
  execFileSync('powershell', ['-NoProfile', '-Command',
    "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(" + Math.round(regW * 0.985) + ', ' + Math.round(regH * 0.45) + ')'],
    {stdio: 'ignore', windowsHide: true});
  key(0);   // focus the window, send nothing
  await sleep(800);
  await step('zh', 'the README, in Chinese', async () => {
    await sleep(900);
    const y = (await rectOf('article.markdown-body p', '一键装上互联网能力')).y;
    await wheel(y - scr.ah * 0.1, 1700);
    await sleep(1800);
    return {tagline: toCap(await rectOf('article.markdown-body p', '一键装上互联网能力')),
      second: toCap(await rectOf('article.markdown-body p', '当下最稳的接入方式'))};
  });
  await step('menu', 'right-click, Translate to English', async () => {
    const r = await rectOf('article.markdown-body p', '当下最稳的接入方式');
    // On BLANK page space: the right-hand end of the centred paragraph's own box. A click on the badge
    // under it opens the image-link menu, which has no Translate entry (first take, 2026-10-03).
    await page.mouse.click(r.x + r.w - 26, r.y + r.h * 0.5, {button: 'right'});
    // The menu stays up long enough to be read; its Translate entry is chosen in the next step with the
    // entry's own access key (T). Walking the highlight up with arrow keys did not land on it reliably.
    await sleep(3400);
    return {tagline: toCap(await rectOf('article.markdown-body p', '一键装上互联网能力'))};
  });
  await step('translated', 'the same page, in English', async () => {
    key(0x54);   // T: the access key of "Translate to English"
    for (let i = 0; i < 40; i++) {
      if (await page.evaluate(() => /translated/.test(document.documentElement.className))) break;
      await sleep(300);
    }
    if (!(await page.evaluate(() => /translated/.test(document.documentElement.className)))) throw new Error('the page never translated');
    await sleep(3800);
    const ps = await page.evaluate(() => [...document.querySelectorAll('article.markdown-body p')].slice(0, 2).map((e) => {
      const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, covers: e.innerText.trim().slice(0, 160)};
    }));
    return {tagline: toCap(ps[0]), second: toCap(ps[1])};
  });
  await step('read', 'reading on, translated', async () => {
    key(0x1B);
    await sleep(700);
    const t = await page.evaluate(() => {
      const tb = document.querySelector('article.markdown-body table');
      return tb ? tb.getBoundingClientRect().y : 500;
    });
    await wheel(t - scr.ah * 0.3, 1900);
    await sleep(2600);
    const tb = await page.evaluate(() => {
      const e = document.querySelector('article.markdown-body table'); const r = e?.getBoundingClientRect();
      return r ? {x: r.x, y: r.y, w: r.width, h: r.height, covers: e.innerText.trim().replace(/\s+/g, ' ').slice(0, 200)} : null;
    });
    return {table: toCap(tb)};
  });
  const tEndAll = now();
  const tq = Date.now();
  ff.stdin.write('q');
  await new Promise((r) => ff.on('close', r));
  ff = null;
  // THE ENCODER RUNS BEHIND THE CAPTURE at this frame size, so the first progress line arrives late and
  // every step was cut seconds early (the menu segment showed no menu). The file's own length is the
  // truth: the capture ran until q, so its first frame is at (q - duration).
  const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', raw], {encoding: 'utf8'}));
  const shift = (t0 - (tq - dur * 1000)) / 1000;
  for (const st of steps) { st.tStart += shift; st.tEnd += shift; }
  console.log('  timeline shift ' + shift.toFixed(2) + 's (encoder lag)');

  // ── cut ──
  const out = [];
  steps.forEach((s, i) => {
    const seg = `seg-${String(i + 1).padStart(2, '0')}.mp4`;
    const dur = Math.max(0.5, s.tEnd - s.tStart);
    const frames = Math.round(dur * FPS);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', s.tStart.toFixed(3), '-i', raw, '-frames:v', String(frames), '-r', String(FPS),
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-an', path.join(OUT, seg)], {stdio: 'inherit'});
    out.push({id: s.id, index: i, action: 'screen', label: s.label, tStart: +s.tStart.toFixed(3), tEnd: +s.tEnd.toFixed(3),
      bbox: {x: 0, y: 0, w: capW, h: capH},
      marks: Object.fromEntries(Object.entries(s.marks).map(([k, v]) => [k, {...v, block: v.block ?? {x: v.x, y: v.y, w: v.w, h: v.h}}])),
      // INK: where the picture is busy, so overlays are placed beside it. A screen capture has no DOM for the
      // browser's own chrome, so this is the toolbar, the README column and the top of the sidebar, by proportion.
      ink: [{x: 0, y: 0, w: capW, h: Math.round(capH * 0.13)},
            {x: Math.round(capW * 0.03), y: Math.round(capH * 0.13), w: Math.round(capW * 0.67), h: Math.round(capH * 0.87)},
            {x: Math.round(capW * 0.72), y: Math.round(capH * 0.13), w: Math.round(capW * 0.25), h: Math.round(capH * 0.25)}], heading: s.label, sent: '(screen capture of the Chrome window)',
      output: '', truth: 'no-output', verified: 'page text read from the DOM; native UI measured from the frame',
      trimmedFrames: 0, changes: Array.from({length: Math.ceil(frames / 6)}, (_, k) => k * 6), segment: seg, segmentFrames: frames});
  });
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({slug: SLUG, surface: 'browser', schema: 1,
    recordedAt: new Date().toISOString(), env: {os: process.platform, node: process.version, capture: 'gdigrab of the Chrome window'},
    theme: 'dark', viewport: {width: capW, height: capH}, fps: FPS, startUrl: URL_, steps: out}, null, 2));
  console.log(`OK  ${OUT}  ${capW}x${capH}  ${tEndAll.toFixed(1)}s  ${out.map((s) => `${s.segment}:${s.segmentFrames}f`).join(' ')}`);
} finally {
  // Let ffmpeg write its index even when a step throws, or the footage that explains the failure is unreadable.
  if (ff) { try { ff.stdin.write('q'); await new Promise((r) => { ff.on('close', r); setTimeout(r, 8000); }); } catch { /* gone */ } }
  try { await browser?.close(); } catch { /* gone */ }
  try { chrome.kill(); } catch { /* gone */ }
}
