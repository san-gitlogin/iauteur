// Apple September 2026 — Apple Watch.  SHORT.
//
// One idea: the new sensor samples often enough to turn sleep, activity and heart rate
// variability into a single number you read on the face in the morning. Then the two figures
// that decide between the watches. Every figure is in the wide cut and in the dossier.
//
// `stack` rather than `plaque` for the hook: the plaque frame is a lower-third shape and it
// strands the card at the bottom of a 9:16 frame.
import {short} from '../../scripts/lib/apple-build.mjs';

const c = short();
const S = (t, bg, n, mk, o) => c.stage(t, bg, n, mk, o);

c.add('HOOK', 'dip', 'zoneA',
  'The new Apple Watch answers the only question you have in the morning. One number.',
  (A) => ({
    headline: 'One number, every morning',
    subtext: 'Apple Watch Series 12 and Ultra 4',
    kicker: 'September 2026',
    variant: 'stack',
    atWord: A(0.5),
  }));

S('fade', 'zoneA',
  'The Vitals app reads your sleep, your activity and your heart rate variability, and turns ' +
  'all three into one daily readiness score: pace yourself, ready, or go for it.',
  (A) => ({
    headline: 'One number: [Readiness]',
    kind: 'watch-face',
    caption: 'Vitals, on the face',
    color: 'green',
    cells: [
      {label: 'Sleep, activity, HRV', text: 'screen', sub: 'read overnight', atWord: A(0.20)},
      {label: 'A daily score', text: 'case', sub: 'pace, ready, or go', atWord: A(0.58)},
    ],
  }));

// THE ULTRA HAS TO BE ON SCREEN, NOT JUST IN THE SENTENCE (owner, 2026-09-10: *"that too is
// covering just the normal apple watch and not the ultra"*). The short named the Ultra 4 twice
// — in the battery beat and in the price ladder — and drew the standard case in both watch
// beats, because neither carried `token: 'ultra'`. Named is not shown: the viewer watches the
// small watch for forty seconds and concludes the Ultra is not in the video.
S('wipe', 'zoneB',
  "Why does that work? A trend, not a moment: both watches — Series 12 and the bigger Ultra 4 — " +
  'get a new Health Sensing System that reads your heart often enough to see one.',
  (A) => ({
    headline: 'Enough samples to [see a trend]',
    kind: 'watch-face',
    token: 'ultra',
    caption: 'The new Health Sensing System',
    color: 'blue',
    cells: [
      {label: 'A trend, not a moment', text: 'band', sub: 'why the score works', atWord: A(0.18)},
      {label: 'Ultra 4', text: 'case', sub: '49 mm, and the same sensor', atWord: A(0.52)},
    ],
  }));

S('zoom', 'zoneB',
  'Battery, meanwhile: fifty hours of everyday use on the Ultra 4, eighty four in low power, ' +
  'and ten hours of workout tracking with GPS running the whole way.',
  (A) => ({
    headline: 'Ultra 4: [50 hours] everyday',
    kind: 'compare-bars',
    caption: 'Battery, by mode',
    color: 'orange',
    cells: [
      {label: 'Everyday use', text: 'bar', sub: '50 hours', value: 50, atWord: A(0.24)},
      {label: 'Low Power Mode', text: 'bar', sub: '84 hours', value: 84, atWord: A(0.44)},
      {label: 'Outdoor workout', text: 'bar', sub: '10 hours', value: 10, atWord: A(0.62)},
    ],
  }));

S('whippan', 'zoneC',
  "Series 12 starts at three ninety nine, and the Ultra 4 held last year's seven ninety nine.",
  (A) => ({
    headline: 'The Ultra [held] its price',
    kind: 'price-ladder',
    caption: 'US pricing',
    color: 'orange',
    cells: [
      {label: 'Series 12', text: 'tier', value: 399, atWord: A(0.20)},
      {label: 'Ultra 4', text: 'tier', value: 799, atWord: A(0.52)},
    ],
  }));

c.add('OUTRO_CTA', 'fade', 'zoneA',
  'Full breakdown on the channel.',
  (A) => ({
    headline: 'Which one would you wear?',
    subtext: 'Full breakdown on the channel',
    atWord: A(0.5),
  }));

const spec = {
  meta: {
    topic: 'Apple September 2026 — Apple Watch',
    format: 'shorts',
    fps: 30,
    subject: 'Apple Watch',
    topicAxes: ['entity-novelty', 'economic-pain'],
    screenplay: 'documentary',
    onePayoff: 'the new sensor samples often enough to turn sleep, activity and HRV into one daily readiness score',
    openLoop: 'What can one number on your wrist actually tell you?',
    seo: {
      title: 'Your watch now answers the morning question #apple #applewatch',
      description:
        'Apple Watch Series 12 and Ultra 4: the new Health Sensing System samples often enough ' +
        'for a daily Readiness score. Plus 50-hour Ultra battery, and the prices.',
      breakdown: 'the Readiness score, the new sensor, Ultra battery, and the prices',
      pinned: 'Series 12 or Ultra 4 — which one would you actually wear every day?',
      tags: ['Apple Watch Series 12', 'Apple Watch Ultra 4', 'Apple Watch 2026', 'Readiness score',
        'Apple September 2026', 'Apple event 2026', 'shorts'],
      queries: ['Apple Watch readiness score', 'Apple Watch Ultra 4 battery life'],
      sources: ['apple.com/newsroom — Apple September 2026 event', 'apple.com/apple-watch-ultra-4'],
    },
  },
  brand: c.brand(),
  thumbnail: {title: 'EVERYTHING YOU NEED TO KNOW', badge: 'Apple Watch',
    note: 'Series 12 and Ultra 4', asset: 'si:apple'},
  cover: {title: 'EVERYTHING YOU NEED TO KNOW', badge: 'Apple Watch', asset: 'si:apple', frames: 2},
  scenes: c.S,
};

c.emitShort('topics/apple-watch/shorts.json', spec);
