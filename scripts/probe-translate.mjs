#!/usr/bin/env node
// PROBE: does the installed Chrome translate a page by itself when it is driven over CDP?
//
//   node scripts/probe-translate.mjs <url> <profile-dir> [needle-in-original-language]
//
// Chrome's translator is BROWSER UI (the address-bar icon, the right-click menu), so a page capture
// never sees it, and Playwright's own launch disables the Translate feature outright. This starts
// the real Chrome ourselves with no Playwright flags, a profile whose preferences say "always
// translate Chinese to English", and attaches over CDP. It prints whether the page's own text
// changed, which is the only evidence that counts.
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const [url, profile, needle = ''] = process.argv.slice(2);
if (!url || !profile) { console.error('usage: probe-translate.mjs <url> <profile-dir> [needle]'); process.exit(2); }
const CHROME = process.env.IAUTEUR_CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9333;

const prefDir = path.join(profile, 'Default');
fs.mkdirSync(prefDir, {recursive: true});
const prefFile = path.join(prefDir, 'Preferences');
let prefs = {};
try { prefs = JSON.parse(fs.readFileSync(prefFile, 'utf8')); } catch { /* first run */ }
prefs.translate = {...(prefs.translate ?? {}), enabled: true};
prefs.translate_whitelists = {...(prefs.translate_whitelists ?? {}), 'zh-CN': 'en', 'zh-TW': 'en'};
prefs.intl = {...(prefs.intl ?? {}), accept_languages: 'en-US,en', selected_languages: 'en-US,en'};
fs.writeFileSync(prefFile, JSON.stringify(prefs));

const child = spawn(CHROME, [`--remote-debugging-port=${PORT}`, `--user-data-dir=${path.resolve(profile)}`,
  '--no-first-run', '--no-default-browser-check', '--lang=en-US', '--window-size=1600,1000', 'about:blank'],
  {stdio: 'ignore', windowsHide: false});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let browser;
try {
  for (let i = 0; i < 40 && !browser; i++) {
    try { browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`); } catch { await sleep(500); }
  }
  if (!browser) throw new Error('Chrome did not open its debugging port');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0] ?? await ctx.newPage();
  await page.goto(url, {waitUntil: 'domcontentloaded'});
  const read = () => page.evaluate((n) => ({
    cls: document.documentElement.className.split(/\s+/).filter((c) => /translat/i.test(c)).join(' '),
    lang: document.documentElement.lang,
    hasNeedle: n ? document.body.innerText.includes(n) : null,
    sample: (document.querySelector('article p, .markdown-body p')?.innerText ?? '').slice(0, 120),
  }), needle);
  console.log('at load  ', JSON.stringify(await read()));
  if (process.env.PROBE_MENU === '1') {
    // The manual route a viewer would take: right-click the page, then the menu's "Translate to
    // English" entry. The menu is native UI, so its key has to come from the OS, not from CDP.
    const {execFileSync} = await import('node:child_process');
    const box = await page.locator('article p, .markdown-body p').first().boundingBox();
    await page.locator('article p, .markdown-body p').first().scrollIntoViewIfNeeded();
    const b2 = await page.locator('article p, .markdown-body p').first().boundingBox();
    await page.bringToFront();
    await page.mouse.click((b2 ?? box).x + 400, (b2 ?? box).y + 60, {button: 'right'});
    await sleep(1200);
    if (process.env.PROBE_SHOT) execFileSync('ffmpeg', ['-v','error','-y','-f','gdigrab','-i','desktop','-frames:v','1','-vf','scale=1600:-1', process.env.PROBE_SHOT + '/menu.png'], {stdio:'ignore'});
    execFileSync('powershell', ['-NoProfile', '-Command',
      "$w = New-Object -ComObject WScript.Shell; $null = $w.AppActivate('Agent-Reach'); Start-Sleep -Milliseconds 400; $w.SendKeys('t')"],
      {stdio: 'ignore', windowsHide: true});
    await sleep(2500);
    if (process.env.PROBE_SHOT) execFileSync('ffmpeg', ['-v','error','-y','-f','gdigrab','-i','desktop','-frames:v','1','-vf','scale=1600:-1', process.env.PROBE_SHOT + '/after.png'], {stdio:'ignore'});
    console.log('sent: right-click, then T');
  }
  for (let t = 2; t <= 20; t += 3) { await sleep(3000); console.log(`after ${String(t + 1).padStart(2)}s`, JSON.stringify(await read())); }
  if (process.argv[5]) await page.screenshot({path: process.argv[5]});
} finally {
  try { await browser?.close(); } catch { /* gone */ }
  try { child.kill(); } catch { /* gone */ }
}
