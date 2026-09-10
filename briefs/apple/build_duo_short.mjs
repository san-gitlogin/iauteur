// Apple September 2026 — iPhone Duo.  SHORT.
//
// One idea: the selfie camera lives UNDER the inner display, so the big screen has nothing
// punched through it — the thing every rival foldable still gets wrong. Then the two numbers
// that decide it for most people: the weight and the price. Every figure is in the wide cut
// and in briefs/apple/00-event-dossier.md.
//
// `stack` rather than `plaque` for the hook: the plaque frame is a lower-third shape and it
// strands the card at the bottom of a 9:16 frame.
import {short} from '../../scripts/lib/apple-build.mjs';

const c = short();
const S = (t, bg, n, mk, o) => c.stage(t, bg, n, mk, o);

c.add('HOOK', 'dip', 'zoneA',
  'The iPhone Duo hides its selfie camera under the screen. No notch, no hole.',
  (A) => ({
    headline: 'The camera is under it',
    subtext: 'iPhone Duo',
    kicker: 'September 2026',
    variant: 'stack',
    atWord: A(0.5),
  }));

S('fade', 'zoneA',
  "On the inner display the FaceTime camera sits beneath the panel, so nothing breaks the " +
  "surface. Every rival foldable still punches a hole in its big screen.",
  (A) => ({
    headline: 'Nothing breaks [the surface]',
    kind: 'duo-pair',
    caption: 'Under-display FaceTime camera',
    color: 'blue',
    cells: [
      {label: 'Under-display camera', text: 'selfie', sub: 'appears when needed', atWord: A(0.22)},
      {label: 'No cutout', text: 'inner', sub: 'an uninterrupted panel', atWord: A(0.46)},
    ],
  }));

S('wipe', 'zoneB',
  "Open the Duo and you get a small tablet with two apps side by side. Shut it, and the outer " +
  "screen is a whole phone.",
  (A) => ({
    headline: 'A phone, then [a tablet]',
    kind: 'duo-pair',
    caption: 'Two screens, one device',
    color: 'purple',
    cells: [
      {label: 'Inner display', text: 'inner', sub: 'two apps at once', atWord: A(0.20)},
      {label: 'Outer display', text: 'outer', sub: 'a whole phone, shut', atWord: A(0.56)},
    ],
  }));

S('zoom', 'zoneB',
  "Two halves and a hinge weigh something: two hundred and fifty four grams, against two " +
  "hundred and eleven for an iPhone 18 Pro.",
  (A) => ({
    headline: '[254 grams], and you feel it',
    kind: 'compare-bars',
    caption: 'Weight, in grams',
    color: 'orange',
    cells: [
      {label: 'iPhone Duo', text: 'bar', sub: '254 g', value: 254, atWord: A(0.34)},
      {label: 'iPhone 18 Pro', text: 'bar', sub: '211 g', value: 211, atWord: A(0.60)},
    ],
  }));

S('whippan', 'zoneC',
  'The Duo starts at one thousand nine hundred and ninety nine dollars, which is eight hundred ' +
  'more than an iPhone 18 Pro.',
  (A) => ({
    headline: '[$1,999] to start',
    kind: 'compare-bars',
    caption: '$800 more than the 18 Pro',
    color: 'orange',
    cells: [
      {label: 'iPhone Duo', text: 'bar', sub: '$1,999', value: 1999, atWord: A(0.26)},
      {label: 'iPhone 18 Pro', text: 'bar', sub: '$1,199', value: 1199, atWord: A(0.62)},
    ],
  }));

c.add('OUTRO_CTA', 'fade', 'zoneA',
  'The full iPhone Duo breakdown is on the channel.',
  (A) => ({
    headline: 'Worth two thousand?',
    subtext: 'Full breakdown on the channel',
    atWord: A(0.5),
  }));

const spec = {
  meta: {
    topic: 'Apple September 2026 — iPhone Duo',
    format: 'shorts',
    fps: 30,
    subject: 'iPhone Duo',
    topicAxes: ['entity-novelty', 'economic-pain'],
    screenplay: 'documentary',
    onePayoff: 'the iPhone Duo puts its selfie camera under the inner display, so the big screen has no cutout',
    openLoop: 'Where did the selfie camera go?',
    seo: {
      title: 'The foldable iPhone hides its camera under the screen #apple #iphoneduo',
      description:
        'iPhone Duo puts the FaceTime camera under the inner display — no notch, no punch hole. ' +
        'Plus the two numbers that decide it: 254 grams, and $1,999 to start.',
      breakdown: 'the under-display camera, the two screens, the weight and the price',
      pinned: 'Would you carry 254 grams for a screen that folds?',
      tags: ['iPhone Duo', 'foldable iPhone', 'iPhone Duo price', 'Apple September 2026',
        'under-display camera', 'Apple event 2026', 'shorts'],
      queries: ['iPhone Duo price', 'iPhone Duo under display camera'],
      sources: ['apple.com/newsroom — Apple September 2026 event', 'apple.com/iphone-duo'],
    },
  },
  brand: c.brand(),
  thumbnail: {title: 'EVERYTHING YOU NEED TO KNOW', badge: 'iPhone Duo',
    note: 'the first foldable iPhone', asset: 'si:apple'},
  cover: {title: 'EVERYTHING YOU NEED TO KNOW', badge: 'iPhone Duo', asset: 'si:apple', frames: 2},
  scenes: c.S,
};

c.emitShort('topics/apple-duo/shorts.json', spec);
