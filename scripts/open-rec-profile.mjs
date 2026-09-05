#!/usr/bin/env node
// OPEN-REC-PROFILE — open the recording profile in a real window so a human can pass the
// checks a machine cannot.
//
// Some pages will not serve an automated context. openai.com sits behind Cloudflare and
// reddit.com behind its own "prove your humanity" interstitial; both answer a fresh headless
// context with a challenge page, so the recorder's read-back verification correctly refuses
// to write the take — there is genuinely nothing on screen to record.
//
// The answer is not to defeat the check. It is to pass it ONCE, by hand, in a profile the
// recorder then reuses: the clearance cookie lives in that directory, so the footage is of
// the real page in the owner's own browser.
//
//   node scripts/open-rec-profile.mjs [url ...] [--profile out/rec-profile-web]
//   node scripts/open-rec-profile.mjs --from briefs/<topic>/challenge-urls.txt
//
// PREFER `--from`. A long URL pasted at a terminal prompt WRAPS, and zsh then reads the
// second line as a separate command — which is exactly how this failed the first time it
// was handed over. A file has no line length.
//
// Clear each challenge, leave the page sitting on the real content, then close the window.
// Reference the profile from a demo with  "profile": "out/rec-profile-web".
import {chromium} from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const argv = process.argv.slice(2);
const pIdx = argv.indexOf('--profile');
const profile = pIdx >= 0 ? argv[pIdx + 1] : 'out/rec-profile-web';
const fIdx = argv.indexOf('--from');
const skip = new Set([pIdx + 1, fIdx + 1].filter((i) => i > 0));
let urls = argv.filter((a, i) => !a.startsWith('--') && !skip.has(i));
if (fIdx >= 0) {
  const file = argv[fIdx + 1];
  if (!file || !fs.existsSync(file)) {
    console.error(`--from: no such file: ${file}`);
    process.exit(2);
  }
  urls = urls.concat(
    fs.readFileSync(file, 'utf8').split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#')),
  );
}
if (!urls.length) {
  console.error('Nothing to open. Pass URLs, or --from <file> with one URL per line.');
  process.exit(2);
}

// Match the recorder's own geometry so what you clear is what it will later record.
const DSF = 4;
const ctx = await chromium.launchPersistentContext(path.resolve(profile), {
  headless: false,
  channel: 'chrome',
  viewport: {width: 1600, height: 900},
  deviceScaleFactor: DSF,
  args: ['--force-device-scale-factor=' + DSF, '--high-dpi-support=1'],
});

console.log(`profile: ${path.resolve(profile)}`);
console.log(`opening ${urls.length} page(s) at 1600x900 @dsf${DSF}\n`);

for (const [i, u] of urls.entries()) {
  const page = i === 0 ? (ctx.pages()[0] ?? await ctx.newPage()) : await ctx.newPage();
  await page.goto(u, {waitUntil: 'domcontentloaded', timeout: 120000}).catch((e) => {
    console.log(`  ! ${u}\n    ${e.message.split('\n')[0]}`);
  });
  console.log(`  ${i + 1}. ${u}`);
}

console.log(`
Clear any "just a moment" / "prove your humanity" check in each tab, and leave it on the
real page. Then CLOSE THE WINDOW — the cleared cookies stay in the profile and the recorder
picks them up on the next take.
`);

await ctx.waitForEvent('close', {timeout: 0}).catch(() => {});
console.log('window closed — profile saved.');
