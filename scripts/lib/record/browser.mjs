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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Where to look, for a browser demo. Any raw CSS selector also works. */
export const BROWSER_FOCUS = {
  page: 'body',
  window: 'body',
};

export const setupBrowser = async (demo) => {
  const viewport = demo.viewport ?? {width: 1600, height: 900};
  const browser = await chromium.launch({
    headless: demo.headless ?? true,
    args: ['--force-device-scale-factor=1', '--hide-scrollbars'],
  });
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    // A recording is a performance, not a research session: block the noise that would
    // otherwise land in the frame or make two takes differ.
    reducedMotion: demo.reducedMotion === false ? 'no-preference' : 'reduce',
    colorScheme: (demo.theme ?? 'dark') === 'light' ? 'light' : 'dark',
  });
  const page = await ctx.newPage();
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
    teardown: async () => { await ctx.close().catch(() => {}); await browser.close().catch(() => {}); },
  };
};

export const browserActions = {
  /** Navigate, and report where the browser ACTUALLY ended up. */
  async goto(page, step) {
    const res = await page.goto(step.url, {waitUntil: step.waitUntil ?? 'load', timeout: step.timeout ?? 60000});
    await page.waitForTimeout(step.settleMs ?? 900);
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
      await page.locator(step.target).first().scrollIntoViewIfNeeded({timeout: step.timeout ?? 15000});
    } else {
      await page.mouse.wheel(0, step.by ?? 600);
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
