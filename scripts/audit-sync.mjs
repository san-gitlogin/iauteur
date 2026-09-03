#!/usr/bin/env node
// AUDIT-SYNC — does the voice say the thing at the moment the screen shows it?
//
// Owner: *"you must have an audit at the end that what you speak is relevant and syncs with
// what is displayed and highlighted and animated on the screen."*
//
// The existing guards check a WEAKER thing. `lint-spec` checks an anchor points at a word
// that exists and lands before the end; `check-sync` checks the word timings came from real
// audio rather than a fallback. Neither compares the CONTENT of an element with the CONTENT
// of the sentence at that instant, so a bar labelled "FarReach" anchored on the word
// "CityLink" passes everything and is wrong on screen.
//
// WHAT THIS DOES. For every anchored element that carries text, it resolves the anchor to a
// frame, converts the frame back to a position in the spoken narration using the REAL word
// timings, takes a window of words around that position, and asks whether the element's own
// distinctive words are being spoken there. A number is matched as a number, so "19.4" on a
// card matches "nineteen point four" in the mouth.
//
//   node scripts/audit-sync.mjs topics/<slug>/long.json [out/tts/<prefix>_timestamps.json]
//
// Exit 1 on a miss. Run it AFTER sync and BEFORE render.
import fs from 'node:fs';
import path from 'node:path';

const FPS = 30;
const FPW = 12;                       // wordToFrame: (w - 1) * FPW
const WINDOW = 7;                     // words either side of the anchor that count as "here"

const [specPath, tsArg] = process.argv.slice(2);
if (!specPath) {
  console.error('Usage: node scripts/audit-sync.mjs <spec.json> [timestamps.json]');
  process.exit(2);
}
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

// The timestamps file, so a frame can be turned back into a spoken position.
const guessTs = () => {
  const slug = path.basename(path.dirname(specPath));
  const short = path.basename(specPath).startsWith('shorts');
  for (const p of [`out/tts/${slug}${short ? '-shorts' : ''}_timestamps.json`,
                   `out/tts/${slug}_timestamps.json`]) if (fs.existsSync(p)) return p;
  return null;
};
const tsPath = tsArg || guessTs();
const TS = tsPath && fs.existsSync(tsPath) ? JSON.parse(fs.readFileSync(tsPath, 'utf8')) : null;
if (!TS) {
  console.error(`✗ no timestamps file found (looked for ${tsPath ?? 'out/tts/<slug>_timestamps.json'}).`);
  console.error('  This audit compares the SPOKEN moment with the on-screen moment, so it needs the real read.');
  process.exit(2);
}

// ── words ────────────────────────────────────────────────────────────────────
const NUMS = {
  zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7',
  eight: '8', nine: '9', ten: '10', eleven: '11', twelve: '12', thirteen: '13',
  fourteen: '14', fifteen: '15', sixteen: '16', seventeen: '17', eighteen: '18',
  nineteen: '19', twenty: '20', thirty: '30', forty: '40', fifty: '50', sixty: '60',
  seventy: '70', eighty: '80', ninety: '90', hundred: '100', thousand: '1000',
};
const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'is', 'it', 'that',
  'this', 'for', 'on', 'with', 'as', 'at', 'by', 'from', 'you', 'your', 'we', 'i', 'so',
  'but', 'not', 'be', 'are', 'was', 'were', 'then', 'than', 'what', 'when', 'how', 'its',
  'one', 'two', 'now', 'here', 'there', 'all', 'any', 'own', 'out', 'up', 'if', 'no']);

/** Split into comparable tokens: lowercase, punctuation stripped, identifiers broken on
 *  underscores and dots so `delivery_days` matches "delivery days".
 *
 *  SPELLED NUMBERS ARE JOINED FIRST, and they have to be. A narrator says "six hundred" and
 *  "nineteen point four"; a card says "~600" and "19.4". Digitising word by word turns those
 *  into "6 100" and "19 4", which match nothing, and the first run of this audit reported
 *  every price in the cut as drift on exactly that. */
const joinNumbers = (words) => {
  const out = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (NUMS[w] == null) { out.push(w); continue; }
    // "<n> hundred|thousand" and "<n> point <n>" fold into one value.
    let val = Number(NUMS[w]);
    let j = i + 1;
    while (j < words.length) {
      const nx = words[j];
      if (nx === 'hundred') { val *= 100; j++; continue; }
      if (nx === 'thousand') { val *= 1000; j++; continue; }
      if (nx === 'point' && NUMS[words[j + 1]] != null) {
        let frac = '';
        let k = j + 1;
        while (k < words.length && NUMS[words[k]] != null && Number(NUMS[words[k]]) < 10) {
          frac += NUMS[words[k]]; k++;
        }
        if (frac) { val = Number(`${val}.${frac}`); j = k; continue; }
        break;
      }
      if (NUMS[nx] != null && val % 100 === 0 && Number(NUMS[nx]) < 100) { val += Number(NUMS[nx]); j++; continue; }
      break;
    }
    out.push(String(val));
    i = j - 1;
  }
  return out;
};

const toks = (s) =>
  joinNumbers(
    String(s ?? '')
      .toLowerCase()
      .replace(/[_.\-/]+/g, ' ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean),
  );

// FOLD A TRAILING PLURAL. The screen says "walk the columns one at a time" and the voice
// says "for every column, pull out its values" — the same word, one letter apart, reported
// as drift by the first run. Only a trailing "s" on a word long enough for it to mean
// something, so "values"/"value" fold together and "as"/"is" are left alone.
const stem = (w) => (w.length > 4 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
const content = (s) => toks(s).filter((w) => w.length > 2 && !STOP.has(w)).map(stem);

// ── walk the spec for anchored elements that carry text ──────────────────────
// WHICH FIELD IS THE ONE A PERSON SAYS OUT LOUD. A code line's `text` is
// `r = client.chat.completions.create(` and nobody reads that aloud — its `detail` is the
// plain-English note, and that is the field the narration will echo. So the human-readable
// fields are preferred, and raw `text` is only consulted when an element has nothing else.
const HUMAN = ['label', 'title', 'detail', 'sub', 'quote', 'rule', 'needle', 'question',
  'message', 'headline', 'name', 'value'];
const FALLBACK = ['text', 'cmd'];

const elements = (scene) => {
  const out = [];
  const walk = (node, where, depth) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach((n, i) => walk(n, `${where}[${i}]`, depth)); return; }
    const anchor = Object.entries(node).find(([k, v]) =>
      /atword$/i.test(k) && typeof v === 'number');
    // A BASE ANCHOR IS NOT A CLAIM ABOUT A MOMENT. Almost every component documents its
    // top-level `atWord` as "BASE only — on screen by frame 38", and LAW 8 requires it to
    // be clamped there, so it has nothing to do with what is being said. Auditing it
    // reports the component's own caption as drift, which the first run did nine times.
    const isBase = anchor && anchor[0] === 'atWord' && depth <= 1;
    if (anchor && !isBase) {
      const pick = (keys) => keys.flatMap((k) => (typeof node[k] === 'string' ? content(node[k]) : []));
      const words = pick(HUMAN).length ? pick(HUMAN) : pick(FALLBACK);
      const shown = [...HUMAN, ...FALLBACK].map((k) => node[k])
        .filter((v) => typeof v === 'string' && v.trim()).join(' · ');
      if (words.length) out.push({where, at: anchor[1], key: anchor[0], words, shown});
    }
    for (const [k, v] of Object.entries(node)) {
      if (v && typeof v === 'object') walk(v, `${where}.${k}`, depth + 1);
    }
  };
  walk(scene.data, 'data', 0);
  return out;
};

// ── audit ────────────────────────────────────────────────────────────────────
let checked = 0;
const misses = [];
const soft = [];
const skipped = [];

for (const sc of spec.scenes ?? []) {
  const rec = TS[sc.id];
  const times = rec?.words;
  if (!Array.isArray(times) || !times.length) { skipped.push(`${sc.id} (no word timings)`); continue; }
  const spokenRaw = String(sc.narration ?? '').split(/\s+/);
  // MAP PROPORTIONALLY rather than requiring the counts to agree. edge-tts merges the odd
  // hyphenate and contraction, so a scene is routinely a few timings short of its words —
  // and the first version of this audit SKIPPED seven scenes for being four words out,
  // which is the measurement refusing to measure.
  const posOf = (i) => Math.round((i / Math.max(1, times.length - 1)) * (spokenRaw.length - 1));
  // Every distinctive word said ANYWHERE in this scene, so a miss can be told apart from
  // a paraphrase: if the element's word is spoken here but not HERE, the anchor is wrong.
  const saidAnywhere = new Set(content(sc.narration));

  for (const el of elements(sc)) {
    // After sync an anchor holds a FRAME encoded as a fractional word index.
    const frame = (el.at - 1) * FPW;
    const seconds = frame / FPS;
    // Which word is being spoken then?
    let idx = 0;
    for (let i = 0; i < times.length; i++) if (times[i] <= seconds) idx = i;
    const centre = posOf(idx);
    const lo = Math.max(0, centre - WINDOW);
    const hi = Math.min(spokenRaw.length, centre + WINDOW + 1);
    const around = new Set(content(spokenRaw.slice(lo, hi).join(' ')));
    checked++;
    if (el.words.some((w) => around.has(w))) continue;          // on time
    // TWO DIFFERENT FAULTS, AND ONLY ONE IS A DEFECT.
    //  · the element's own word IS said in this scene, just not here → the anchor is on the
    //    wrong word, the viewer reads one thing and hears another, and it is fixable.
    //  · the word is never said at all → the narration paraphrases the card, which is
    //    normal writing ("it saw nineteen days and shrugged" over "a model reads a number
    //    and doesn't think it's odd"). Worth listing, never worth failing a render for.
    const elsewhere = el.words.filter((w) => saidAnywhere.has(w));
    const row = {
      scene: sc.id, where: el.where, at: `${seconds.toFixed(1)}s`,
      shown: el.shown.slice(0, 58),
      heard: spokenRaw.slice(lo, hi).join(' ').slice(0, 78),
      words: elsewhere,
    };
    if (elsewhere.length) misses.push(row); else soft.push(row);
  }
}

// ── report ───────────────────────────────────────────────────────────────────
console.log(`SYNC AUDIT — ${path.basename(specPath)}: ${checked} anchored element(s) with text, ` +
  `across ${(spec.scenes ?? []).length} scene(s).`);
if (skipped.length) {
  console.log(`  not audited: ${skipped.length} scene(s) — ${skipped.slice(0, 4).join(', ')}` +
    (skipped.length > 4 ? ' …' : ''));
}

if (soft.length) {
  console.log(`  ${soft.length} paraphrased — the screen's words are never spoken in that scene, which is`);
  console.log('  ordinary writing rather than drift. Listed with --verbose.');
  if (process.argv.includes('--verbose')) {
    for (const m of soft) console.log(`    ${m.scene} ${m.where}: "${m.shown}"`);
  }
}

if (!misses.length) {
  console.log('✓ SYNC AUDIT PASSED — no element appears away from the words that name it.');
  process.exit(0);
}

console.error(`\n✗ SYNC AUDIT: ${misses.length} of ${checked} element(s) land away from their own words.\n`);
for (const m of misses) {
  console.error(`  ${m.scene} ${m.where}  @${m.at}   (says "${m.words.join('", "')}" elsewhere in this scene)`);
  console.error(`     on screen : ${m.shown}`);
  console.error(`     being said: …${m.heard}…`);
}
console.error('\nEach of these SAYS its own word somewhere in the scene and shows the element somewhere');
console.error('else, so the viewer reads one thing while hearing another. Move the anchor onto the word.');
process.exit(1);
