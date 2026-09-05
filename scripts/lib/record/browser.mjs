// BROWSER SURFACE — Playwright driving any real web page, on the same contract as the
// VS Code surface: intent in, segments + a measured manifest out.
//
// Owner's brief: *"Have pure control and understanding of playwright to work with
// browsers, to be able to browse, or show proofs, or show outputs."* That is what this
// is. It records a real page doing real things, so a proof beat can show the actual
// site rather than a drawing of it.
//
// The anti-hallucination rule applies unchanged. A `goto` reports the URL the browser
// ACTUALLY landed on (after redirects) and the page's real title. An `expect` step reads
// the live DOM. If something cannot be confirmed, the step THROWS — no step ever reports
// a state it did not observe.
import {chromium} from 'playwright';
import path from 'node:path';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── A SCROLL IS A TRAVEL, NOT A TELEPORT ─────────────────────────────────────────────
//
// Owner: *"the scroll you are doing is not smooth, why?"*
//
// Because it was not a scroll. `page.mouse.wheel(0, 1200)` delivers the whole distance in
// ONE event: the page is at the top on one captured frame and 1200px down on the next, then
// sits still for 900ms. On a 30fps screencast that is a hard cut with a pause after it —
// which is exactly what it looked like. Nothing was dropping frames; there were no
// intermediate frames to drop.
//
// A person flicks a trackpad and the page eases to a stop, so the wheel is delivered in
// ~16ms increments along an ease-in-out curve and the screencast picks up every step of it.
// Duration scales with distance the way a real flick does — a short nudge is quick, a long
// haul takes longer — and is clamped so neither extreme becomes a stunt.
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const smoothWheel = async (page, total, ms) => {
  const dist = Math.abs(total);
  if (dist < 2) return;
  // ~1.1s per 1000px, floored at 420ms so a small nudge still reads, capped at 1600ms so a
  // long page does not spend the beat travelling.
  const dur = ms ?? Math.max(420, Math.min(1600, Math.round(dist * 1.1)));
  const steps = Math.max(14, Math.round(dur / 16));
  let done = 0;
  for (let i = 1; i <= steps; i++) {
    const target = Math.round(total * easeInOutCubic(i / steps));
    const d = target - done;
    if (d !== 0) {
      await page.mouse.wheel(0, d);
      done = target;
    }
    await sleep(dur / steps);
  }
};

/** Where to look, for a browser demo. Any raw CSS selector also works. */
export const BROWSER_FOCUS = {
  page: 'body',
  window: 'body',
};

export const setupBrowser = async (demo) => {
  // LAY OUT AT 1600, RENDER AT 1920. Owner: *"why aren't you using the browser on full
  // screen or whatever, why do I see the browser window cut?"*
  //
  // Two knobs, and they pull in opposite directions. A 1600x900 capture dropped into a
  // 1920x1080 frame is a 1.2x UPSCALE — every glyph resampled, which is the softness that
  // reads as a low-quality window. But simply widening the CSS viewport to 1920 makes it
  // WORSE for the viewer: a site with a max-width content column just gains empty margin,
  // so the words get smaller relative to the frame.
  //
  // `deviceScaleFactor` separates them. The page lays out at 1600 CSS px — the width the
  // site was designed around, so nothing reflows or clips — and renders at 1.2x device
  // pixels, so the screencast comes out at a native 1920x1080 with no resampling at all.
  // Sharp AND full-frame, instead of choosing.
  //
  // AMENDED 2026-09-05 — 1.2 WAS ONLY EVER RIGHT FOR A CAMERA THAT NEVER MOVES.
  // Owner: *"even zooming in, panning in does not degrade the quality of my video."*
  // dsf 1.2 lands the capture at exactly 1920x1080, so a beat framed on the whole page is
  // pixel-perfect — and that is the only beat it is right for. `RecordedStep` frames a mark
  // with `winW = max(bw*1.08, capW/3.2)`, so the tightest window the pipeline can ask for is
  // capW/3.2 and the camera stretches the master to `capW * (stageW / view.w)`. At 1600 CSS
  // wide that is a 3.2x blow-up of a 1920 master — 6144 delivered pixels drawn from 1920.
  // No encoder setting recovers that; the pixels were never captured.
  //
  // So the factor is DERIVED from the deepest zoom, not chosen:
  //     dsf = (deepest zoom) x (delivery width) / (CSS viewport width)
  //         = 3.2 x 1920 / 1600 = 3.84  ->  4
  // Measured cost on a dense page (artificialanalysis.ai, 1.6s take): 108KB at 1920,
  // 204KB at native 3200. Bytes were never the constraint; the downscale was.
  const viewport = demo.viewport ?? {width: 1600, height: 900};
  const dsf = demo.deviceScaleFactor ?? 4;
  // WITHOUT THESE, CHROME SILENTLY CAPS THE FACTOR AT 2. Measured: a context asking for
  // dsf 4 produced 3200x1800 frames (i.e. dsf 2) until the flags were passed, so the
  // capture quietly ignored the setting and nothing reported it. The VS Code surface has
  // passed them since it was fixed; this surface never did.
  const args = ['--hide-scrollbars', `--force-device-scale-factor=${dsf}`, '--high-dpi-support=1'];
  const ctxOpts = {
    viewport,
    deviceScaleFactor: dsf,
    // A recording is a performance, not a research session: block the noise that would
    // otherwise land in the frame or make two takes differ.
    reducedMotion: demo.reducedMotion === false ? 'no-preference' : 'reduce',
    colorScheme: (demo.theme ?? 'dark') === 'light' ? 'light' : 'dark',
  };

  // SOME PAGES ARE BEHIND A HUMAN CHECK, AND A HUMAN HAS TO PASS IT ONCE.
  //
  // openai.com sits behind Cloudflare and reddit.com behind its own "prove your humanity"
  // interstitial. Both answer a fresh automated context with a challenge page, so the
  // recorder's read-back verification correctly refuses to write the take — there is
  // genuinely nothing on screen to record. Neither is a bug to code around.
  //
  // `profile` points the take at a PERSISTENT Chrome profile the owner has already opened
  // and cleared by hand. The clearance cookie lives in that directory, so the recording is
  // still of the real page, in the owner's own logged-in browser. This surface used to call
  // `chromium.launch()`, which keeps nothing, so a cleared challenge was thrown away the
  // moment the take ended and the page could never be recorded at all.
  //
  // Prefer no profile. Reach for one only when a site will not serve a clean context.
  let browser = null;
  let ctx;
  if (demo.profile) {
    ctx = await chromium.launchPersistentContext(path.resolve(demo.profile), {
      headless: demo.headless ?? false,   // a challenge cannot be cleared headless
      // Playwright's own Chromium by default — the installed Chrome cannot be driven with a
      // custom --user-data-dir while it is already running (it hands off to the open session
      // and exits). Opt in with demo.channel only when a site genuinely needs branded Chrome,
      // and only with Chrome fully quit.
      ...(demo.channel ? {channel: demo.channel} : {}),
      args,
      ...ctxOpts,
    });
  } else {
    browser = await chromium.launch({headless: demo.headless ?? true, args});
    ctx = await browser.newContext(ctxOpts);
  }
  const page = ctx.pages()[0] ?? await ctx.newPage();
  if (demo.blockAnalytics !== false) {
    await page.route('**/*', (route) => {
      const u = route.request().url();
      const noisy = /googletagmanager|google-analytics|doubleclick|hotjar|segment\.io|facebook\.net|clarity\.ms/i;
      return noisy.test(u) ? route.abort() : route.continue();
    });
  }
  // PREP (never recorded): land on the start URL so the take opens on a settled page.
  if (demo.prep?.url) {
    await page.goto(demo.prep.url, {waitUntil: 'load', timeout: 60000});
    await page.waitForTimeout(demo.prep?.settleMs ?? 1500);
  }
  return {
    page,
    teardown: async () => { await ctx.close().catch(() => {}); await browser?.close().catch(() => {}); },
  };
};

export const browserActions = {
  /** Navigate, and report where the browser ACTUALLY ended up. */
  async goto(page, step) {
    const res = await page.goto(step.url, {waitUntil: step.waitUntil ?? 'load', timeout: step.timeout ?? 60000});
    await page.waitForTimeout(step.settleMs ?? 900);
    // A CONSENT BANNER ONLY GETS DISMISSED ONCE, AND A DEMO VISITS SEVERAL SITES.
    // `prep.dismiss` runs before the take, so every site navigated to AFTER it kept its
    // own cookie wall — sitting over exactly the paragraph the narration is about. Each
    // label is optional by design: a banner that did not appear is not an error.
    for (const label of step.dismiss ?? []) {
      const btn = page.getByRole('button', {name: label, exact: false}).first();
      if (!(await btn.count().catch(() => 0))) continue;
      await btn.click({timeout: 4000}).catch(() => {});
      await page.waitForTimeout(500);
    }
    if ((step.dismiss ?? []).length) await page.waitForTimeout(400);
    const landed = page.url();
    const title = await page.title().catch(() => '');
    const status = res ? res.status() : null;
    if (status != null && status >= 400) {
      throw new Error(`Step "${step.id}": ${step.url} returned HTTP ${status}. A recording does not narrate over a broken page.`);
    }
    return {
      sent: step.url,
      output: `${landed}\n${title}`,
      truth: 'read-back',
      verified: 'final URL + document title',
      httpStatus: status,
    };
  },

  /** Click a real element, then confirm something actually changed. */
  async click(page, step) {
    const before = page.url();
    const el = page.locator(step.target).first();
    await el.waitFor({state: 'visible', timeout: step.timeout ?? 15000});
    const label = (await el.innerText().catch(() => '')).trim().slice(0, 80);
    await el.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(250);
    await el.click({timeout: step.timeout ?? 15000});
    await page.waitForTimeout(step.settleMs ?? 1200);
    const after = page.url();
    if (step.expect?.url && !after.includes(step.expect.url)) {
      throw new Error(`Step "${step.id}": expected the URL to contain ${JSON.stringify(step.expect.url)}, but it is ${after}`);
    }
    if (step.expect?.text) {
      const found = await page.getByText(step.expect.text, {exact: false}).count().catch(() => 0);
      if (!found) throw new Error(`Step "${step.id}": clicked ${step.target}, but ${JSON.stringify(step.expect.text)} is not on the page`);
    }
    return {
      sent: step.target,
      output: `clicked "${label}"` + (after !== before ? `\n-> ${after}` : ''),
      truth: 'read-back',
      verified: after !== before ? 'navigation observed' : 'element text read from the live DOM',
    };
  },

  /** Type into a real field, then read the field back. */
  async fill(page, step) {
    const el = page.locator(step.target).first();
    await el.waitFor({state: 'visible', timeout: step.timeout ?? 15000});
    await el.click();
    await page.waitForTimeout(200);
    for (const ch of String(step.value ?? '')) {
      await page.keyboard.type(ch);
      await sleep(Math.max(12, (step.typeDelay ?? 55) + (Math.random() * 2 - 1) * 30));
    }
    await page.waitForTimeout(step.settleMs ?? 600);
    const got = await el.inputValue().catch(async () => (await el.innerText().catch(() => '')));
    if (String(step.value ?? '') !== got) {
      throw new Error(`Step "${step.id}": typed ${JSON.stringify(step.value)} but the field reads ${JSON.stringify(got)}`);
    }
    return {sent: String(step.value ?? ''), output: got, truth: 'read-back', verified: 'field value read back'};
  },

  /** Assert something is really on the page, and record the text that proved it. */
  async expect(page, step) {
    const el = step.target ? page.locator(step.target).first() : page.getByText(step.text, {exact: false}).first();
    await el.waitFor({state: 'visible', timeout: step.timeout ?? 15000}).catch(() => {});
    const count = await el.count().catch(() => 0);
    if (!count) {
      throw new Error(`Step "${step.id}": nothing on the page matches ${JSON.stringify(step.target ?? step.text)}. The proof is not there — the recording will not claim it is.`);
    }
    const text = (await el.innerText().catch(() => '')).trim().slice(0, 400);
    await page.waitForTimeout(step.settleMs ?? 600);
    return {sent: step.target ?? step.text, output: text, truth: 'read-back', verified: 'element text read from the live DOM'};
  },

  /** Scroll a real element into view — the honest way to move down a page. */
  async scroll(page, step) {
    if (step.target) {
      // Where is it now, and how far do we have to travel? `scrollIntoViewIfNeeded` would
      // TELEPORT there; we want the same destination, arrived at.
      const dy = await page.locator(step.target).first().evaluate((el) => {
        const r = el.getBoundingClientRect();
        return Math.round(r.top - window.innerHeight * 0.28);
      }).catch(() => null);
      if (dy == null) {
        await page.locator(step.target).first().scrollIntoViewIfNeeded({timeout: step.timeout ?? 15000});
      } else {
        await smoothWheel(page, dy, step.scrollMs);
      }
    } else {
      await smoothWheel(page, step.by ?? 600, step.scrollMs);
    }
    await page.waitForTimeout(step.settleMs ?? 900);
    return {sent: step.target ?? `wheel ${step.by ?? 600}`, output: '', truth: 'no-output', verified: 'nothing to verify'};
  },

  /** A deliberate look-at-it beat (LAW 0e rule 4). */
  async pause(page, step) {
    await sleep(step.ms ?? 1500);
    return {sent: `(pause ${step.ms ?? 1500}ms)`, output: '', truth: 'no-output', verified: 'nothing to verify'};
  },
};
