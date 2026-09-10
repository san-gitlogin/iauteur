// Apple September 2026 — AirPods 5.  SHORT.
//
// One idea, shown and then stopped: noise cancelling with no seal to help it, what does the
// listening, and the twenty dollars between the two models. Every figure is in the wide cut
// and in briefs/apple/00-event-dossier.md.
//
// `stack` rather than `plaque` for the hook: the plaque frame is a lower-third shape and it
// strands the card at the bottom of a 9:16 frame.
import {short} from '../../scripts/lib/apple-build.mjs';

const c = short();
const S = (t, bg, n, mk, o) => c.stage(t, bg, n, mk, o);

c.add('HOOK', 'dip', 'zoneA',
  "AirPods 5 cancel noise without sealing your ear shut, which is the hard way.",
  (A) => ({
    headline: 'Noise cancelled, ear open',
    subtext: 'AirPods 5',
    kicker: 'September 2026',
    variant: 'stack',
    atWord: A(0.5),
  }));

S('fade', 'zoneA',
  "A sealed tip blocks sound with rubber. An open bud has no seal, so the chip has to cancel " +
  "all of it.",
  (A) => ({
    headline: 'No seal, [no head start]',
    kind: 'compare-bars',
    caption: "Apple's own figure",
    color: 'purple',
    cells: [
      {label: 'AirPods 5', text: 'bar', sub: 'up to 1.5x more ANC', value: 150, atWord: A(0.55)},
      {label: 'AirPods 4', text: 'bar', sub: 'the baseline', value: 100, atWord: A(0.20)},
    ],
  }));

S('wipe', 'zoneB',
  "Three microphones do the listening — two facing out, and one pointing into your ear to " +
  "check what got through.",
  (A) => ({
    headline: 'Three mics, [one ear]',
    kind: 'airpods',
    caption: 'What the H2 chip hears',
    color: 'green',
    cells: [
      {label: 'Two facing out', text: 'stem', sub: 'they hear direction', atWord: A(0.24)},
      {label: 'One facing in', text: 'bud', sub: 'checks what got through', atWord: A(0.52)},
    ],
  }));

S('zoom', 'zoneB',
  "On the higher-priced pair you swipe up or down the stem to change the volume, without " +
  "reaching for your phone.",
  (A) => ({
    headline: 'Swipe the [stem]',
    kind: 'airpods',
    caption: 'On the $149 model only',
    color: 'blue',
    cells: [
      {label: 'Swipe up or down', text: 'stem', sub: 'volume, on the bud', atWord: A(0.28)},
      {label: 'One model only', text: 'case', sub: 'the Wireless Charging Case', atWord: A(0.56)},
    ],
  }));

S('whippan', 'zoneC',
  "A hundred and twenty-nine dollars, or a hundred and forty-nine with the Wireless Charging " +
  "Case, which also buys that swipe.",
  (A) => ({
    headline: 'Twenty dollars [apart]',
    kind: 'price-ladder',
    caption: 'AirPods 5, US pricing',
    color: 'orange',
    cells: [
      {label: 'AirPods 5', text: 'tier', value: 129, atWord: A(0.22)},
      {label: 'With Wireless Charging Case', text: 'tier', value: 149, atWord: A(0.48)},
    ],
  }));

c.add('OUTRO_CTA', 'fade', 'zoneA',
  'Full AirPods 5 breakdown is on the channel.',
  (A) => ({
    headline: 'Worth twenty dollars?',
    subtext: 'Full breakdown on the channel',
    atWord: A(0.5),
  }));

const spec = {
  meta: {
    topic: 'Apple September 2026 — AirPods 5',
    format: 'shorts',
    fps: 30,
    subject: 'AirPods 5',
    topicAxes: ['entity-novelty', 'economic-pain'],
    screenplay: 'documentary',
    onePayoff: 'AirPods 5 cancel noise in an open-ear design, and the dearer model adds the stem swipe',
    openLoop: 'Can you cancel noise without plugging the hole?',
    seo: {
      title: 'Noise cancelling with your ear left open #apple #airpods5',
      description:
        'AirPods 5 bring Active Noise Cancellation to an open-ear design — up to 1.5x more than ' +
        'AirPods 4, per Apple. Three microphones do the work, and $20 separates the two models.',
      breakdown: 'open-ear noise cancellation, the microphones, and the two prices',
      pinned: 'Would you trade a sealed tip for an open ear if the noise cancelling kept up?',
      tags: ['AirPods 5', 'AirPods 5 price', 'open-ear ANC', 'Active Noise Cancellation',
        'Apple September 2026', 'AirPods 5 vs AirPods 4', 'shorts'],
      queries: ['AirPods 5 price', 'what is open-ear noise cancellation'],
      sources: ['apple.com/newsroom — Apple September 2026 event', 'apple.com/airpods-5/specs'],
    },
  },
  brand: c.brand(),
  thumbnail: {title: 'EVERYTHING YOU NEED TO KNOW', badge: 'AirPods 5',
    note: 'open-ear noise cancellation', asset: 'si:apple'},
  cover: {title: 'EVERYTHING YOU NEED TO KNOW', badge: 'AirPods 5', asset: 'si:apple', frames: 2},
  scenes: c.S,
};

c.emitShort('topics/apple-airpods/shorts.json', spec);
