#!/usr/bin/env node
// TEST-CAPTURE-RATE — how many frames per second can THIS machine actually capture?
//
//   node scripts/test-capture-rate.mjs [--url <url>] [--scroll 1200] [--only 4]
//
// WHY. Owner, 2026-09-11: *"why are the screen recordings laggy… is it because I am
// connected to a 4K TV and the size is huge?"* Measured on a shipped take before writing
// this: `public/rec/apple-airpods-page/seg-01.mp4` is 269 output frames long and contains
// **70 distinct pictures** — the scroll plays at about 8 real frames a second inside a
// 30fps file. That is the judder, and no encoder setting can fix it, because the frames
// were never captured.
//
// THE PIPELINE THIS MEASURES. `Page.startScreencast` is a REQUEST/ACK loop, not a stream:
// Chrome encodes a JPEG, base64s it over CDP, we write it to disk, we ack, and only then
// does Chrome send the next one. So the capture rate is bounded by the slowest link in
//
//     rasterise -> JPEG encode -> base64 -> CDP -> fs.write -> ack
//
// and every one of those scales with the PIXEL COUNT. At deviceScaleFactor 4 on a
// 1600x900 viewport that is 6400x3600 — 23 megapixels a frame, 8x the pixels of dsf 1.4.
// A five-year-old laptop cannot do that thirty times a second; a current M-series Mac can,
// which is exactly why the same script looks smooth there and juddery here.
//
// WHAT IT DOES NOT MEASURE, and does not need to: the physical display. These takes run
// HEADLESS (`browser.mjs` defaults `headless: true` with no profile), so the page is
// rasterised into an offscreen surface at the size `deviceScaleFactor` asks for. A 4K TV
// changes nothing about that — it only competes for the same GPU and CPU while the desktop
// is composited. Unplugging the TV will not make a dsf-4 capture keep up; halving the
// pixels will.
//
// Each configuration runs the same fixed scroll and reports:
//   captured   frames Chrome actually delivered during the travel
//   fps        that count over the travel's own duration — the real motion rate
//   p50 / p95  the gap between consecutive frames, in ms (jitter, not just the mean)
//   KB/frame   what each frame cost to move
// A configuration is smooth when fps is at or near the 30 the timeline wants.
import {chromium} from 'playwright';

const args = process.argv.slice(2);
const argOf = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const URL = argOf('--url', 'https://www.apple.com/airpods-5/');
const SCROLL = Number(argOf('--scroll', 1200));
const ONLY = argOf('--only', null);

// The configurations worth knowing about, cheapest first. `maxWidth` is the interesting
// one: the screencast can downscale INSIDE the browser before the JPEG is encoded, so the
// page still rasterises at the high factor (real supersampled text) while the bytes that
// cross CDP are the delivery size, not the raster size.
const GPU = ['--enable-gpu-rasterization', '--enable-zero-copy', '--ignore-gpu-blocklist',
  '--use-angle=d3d11', '--enable-features=Vulkan,CanvasOopRasterization'];

const CONFIGS = [
  {name: 'dsf 1.2  (1920 native)', dsf: 1.2},
  {name: 'dsf 2    (3200 native)', dsf: 2},
  {name: 'dsf 2.4  (3840 native)', dsf: 2.4},
  {name: 'dsf 4    (6400 native)', dsf: 4},
  {name: 'dsf 4 -> maxWidth 3840', dsf: 4, maxWidth: 3840},
  {name: 'dsf 4 -> maxWidth 1920', dsf: 4, maxWidth: 1920},
  {name: 'dsf 2 q75 (3200 native)', dsf: 2, quality: 75},
  // Is the raster on the GPU at all? Headless Chrome falls back to SwiftShader (CPU) on
  // plenty of machines, which would explain why the same script flies on a Mac.
  {name: 'dsf 4 + gpu flags', dsf: 4, extra: GPU},
  {name: 'dsf 2 + gpu flags', dsf: 2, extra: GPU},
  {name: 'dsf 4 headful', dsf: 4, headless: false},
  {name: 'dsf 2 headful', dsf: 2, headless: false},
  {name: 'dsf 2.4 headful (3840)', dsf: 2.4, headless: false},
  {name: 'dsf 1.5 headful (2400)', dsf: 1.5, headless: false},
  {name: 'dsf 2.4 headful q80', dsf: 2.4, headless: false, quality: 80},
];

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const pct = (xs, p) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((s.length - 1) * p))];
};

const run = async (cfg) => {
  const viewport = {width: 1600, height: 900};
  const browser = await chromium.launch({
    headless: cfg.headless ?? true,
    args: ['--hide-scrollbars', `--force-device-scale-factor=${cfg.dsf}`, '--high-dpi-support=1',
      ...(cfg.extra ?? [])],
  });
  const ctx = await browser.newContext({viewport, deviceScaleFactor: cfg.dsf, colorScheme: 'dark', reducedMotion: 'reduce'});
  const page = await ctx.newPage();
  await page.goto(URL, {waitUntil: 'load', timeout: 60000});
  await page.waitForTimeout(2500);

  const client = await ctx.newCDPSession(page);
  const got = [];
  let dims = null;
  client.on('Page.screencastFrame', async (ev) => {
    const t = (ev.metadata?.timestamp ?? 0) * 1000 || Date.now();
    got.push({t, bytes: ev.data.length * 0.75});
    if (!dims) dims = {w: ev.metadata?.deviceWidth, h: ev.metadata?.deviceHeight};
    try { await client.send('Page.screencastFrameAck', {sessionId: ev.sessionId}); } catch {}
  });
  const params = {format: 'jpeg', quality: cfg.quality ?? 92, everyNthFrame: 1};
  if (cfg.maxWidth) params.maxWidth = cfg.maxWidth;
  await client.send('Page.startScreencast', params);
  await sleep(700);                       // let the first frame land before timing starts

  // THE SAME TRAVEL EVERY TIME, so the only variable is the capture cost.
  const t0 = Date.now();
  const dur = Math.max(420, Math.min(1600, Math.round(Math.abs(SCROLL) * 1.1)));
  const steps = Math.max(14, Math.round(dur / 16));
  let done = 0;
  for (let i = 1; i <= steps; i++) {
    const target = Math.round(SCROLL * easeInOutCubic(i / steps));
    if (target !== done) { await page.mouse.wheel(0, target - done); done = target; }
    await sleep(dur / steps);
  }
  const t1 = Date.now();
  await sleep(600);                        // catch frames still in flight from the travel
  await client.send('Page.stopScreencast').catch(() => {});
  await ctx.close(); await browser.close();

  const during = got.filter((f) => f.t >= t0 - 50 && f.t <= t1 + 550);
  const gaps = during.slice(1).map((f, i) => f.t - during[i].t);
  const secs = (t1 - t0) / 1000;
  return {
    name: cfg.name,
    size: dims ? `${Math.round(dims.w * cfg.dsf)}x${Math.round(dims.h * cfg.dsf)}` : '?',
    travel: secs,
    captured: during.length,
    fps: during.length / secs,
    p50: pct(gaps, 0.5),
    p95: pct(gaps, 0.95),
    kb: during.length ? during.reduce((a, f) => a + f.bytes, 0) / during.length / 1024 : 0,
  };
};

const rows = [];
for (const cfg of CONFIGS) {
  if (ONLY && !cfg.name.includes(ONLY)) continue;
  process.stdout.write(`  measuring ${cfg.name} …`);
  try {
    const r = await run(cfg);
    rows.push(r);
    process.stdout.write(` ${r.fps.toFixed(1)} fps\n`);
  } catch (e) {
    process.stdout.write(` FAILED: ${e.message}\n`);
  }
}

console.log(`\nCAPTURE RATE — ${URL}, ${SCROLL}px smooth scroll, headless, 1600x900 CSS viewport`);
console.log('  the timeline wants 30fps; anything below it is judder the encoder cannot fix\n');
console.log('  config                    raster     travel   captured   fps    p50 gap  p95 gap  KB/frame');
for (const r of rows) {
  console.log(`  ${r.name.padEnd(24)}  ${String(r.size).padEnd(9)}  ${r.travel.toFixed(1).padStart(5)}s  ${String(r.captured).padStart(7)}  ${r.fps.toFixed(1).padStart(5)}  ${String(Math.round(r.p50)).padStart(6)}ms  ${String(Math.round(r.p95)).padStart(6)}ms  ${r.kb.toFixed(0).padStart(7)}`);
}
console.log('');
console.log('  TRAVEL is wall-clock for a scroll the script asked to take ~1.3s. When it runs long,');
console.log('  the wheel loop is being held up by the capture, so the take itself is slowed down.');
