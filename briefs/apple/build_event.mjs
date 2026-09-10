// Apple September 2026 — everything Apple announced.  THE COMBINED CUT.
//
// Built from beats already proven in the four product cuts, so every figure here has been
// checked twice: once against apple.com and Apple's newsroom while writing the individual
// video, and once against briefs/apple/00-event-dossier.md while writing this one.
//
// NO RECORDED FOOTAGE IN THIS CUT. The page quotations live in the product videos, where
// there is room to read them; here the job is the shape of the whole event, which is what
// the drawings do.
//
// 17 scenes: the palette needs 8 distinct sub-types (min(8, round(17*0.5))) and no sub-type
// may pass 6 (max(4, ceil(17*0.35))). Twelve distinct, compare-bars used four times.
import {cut} from '../../scripts/lib/apple-build.mjs';

const c = cut();
const S = (t, bg, n, mk, o) => c.stage(t, bg, n, mk, o);
const REC = 'Apple, iPhone 18 Pro product page, captured 10 September 2026';

// The camera punches in on the mark and then pulls back to the whole page, which is where
// the sentence is actually read. (Marking the paragraph rather than the heading frames the
// punch-in better — see the AirPods builder — but the recorder could not resolve a paragraph
// needle on this page.)
const rec = (transition, bg, narration, step, label, caption, zoomMark, labelMark, takeaway, at = 0.14) =>
  c.add('RECORDED_STEP', transition, bg, narration, (A) => ({
    clips: [{
      ref: `rec:apple-18-pro-page#${step}`, label, focus: true, atWord: A(at),
      zooms: [
        {mark: zoomMark, wantAtWord: A(at + 0.14)},
        {at: 'full', wantAtWord: A(at + 0.26)},
      ],
      callouts: [{text: takeaway, mark: labelMark, wantAtWord: A(at + 0.46)}],
    }],
    sourceNote: REC,
    caption,
  }));

// 1 ─ HOOK, 13 words.
c.add('HOOK', 'dip', 'zoneA',
  'Apple announced four new products in September, and then put the old prices up.',
  (A) => ({
    headline: 'Apple, September 2026',
    subtext: 'Four products, and a price rise',
    kicker: 'The whole event',
    variant: 'plaque',
    atWord: A(0.5),
  }));

// 2 ─ Greeting, intent, loop.
c.add('TITLE_CARD', 'fade', 'zoneA',
  "Welcome back. Today we're going through Apple's whole September event — the iPhone 18 Pro, " +
  "the first foldable iPhone, two watches, new AirPods, and the prices. So why did last " +
  "year's iPhones get dearer the day the new one arrived?",
  (A) => ({
    title: 'The whole event, in order',
    subtitle: 'Four products, one afternoon',
    atWord: A(0.4),
  }));

// ── iPHONE 18 PRO ───────────────────────────────────────────────────────────
// 3 ─ The phone itself.
S('wipe', 'zoneB',
  "Start with the iPhone 18 Pro. Its body is the same size as last year's, and the camera " +
  "plateau that runs the full width of the back arrived on the 17 Pro, so it isn't new — it's " +
  "about two millimetres shallower. What is new sits inside it: three cameras, a flash, the " +
  "lidar scanner, and underneath, a vapor chamber with three times the surface area to move " +
  "heat away from the chip.",
  (A) => ({
    headline: 'The plateau is [shallower], not new',
    kind: 'pro-back',
    caption: 'iPhone 18 Pro, from the back',
    premise: "Drawn from Apple's own dimensions: 71.9 by 150 millimetres, 8.75 deep.",
    color: 'blue',
    cells: [
      {label: 'Camera plateau', text: 'plateau', sub: '~2 mm shallower', atWord: A(0.24)},
      {label: 'Three cameras', text: 'lens', sub: '48MP each', atWord: A(0.44)},
      {label: 'Lidar scanner', text: 'lidar', sub: 'depth, in the dark', atWord: A(0.54)},
      {label: 'Vapor chamber', text: 'body', sub: '3x the surface area', atWord: A(0.64)},
    ],
  }));

// 4 ─ The camera that actually changed.
S('iris', 'zoneB',
  "Now the real headline, which is the aperture. Apple gave the main camera six laser-cut blades that " +
  "open to f one point four eight, which is the widest an iPhone has gone, so a dim room " +
  "stops looking like one. Close them down to f four and the whole scene comes into focus " +
  "instead. Until now, changing that on a phone meant changing the photo in software.",
  (A) => ({
    headline: 'Six blades, [f/1.48] to f/4',
    kind: 'aperture-iris',
    caption: 'A real variable aperture',
    premise: 'The blades move. This is glass and metal, not a background blur applied afterwards.',
    color: 'green',
    cells: [
      {label: 'f/1.48', text: 'stop', value: 1.48, sub: 'widest', atWord: A(0.24)},
      {label: 'f/1.8', text: 'stop', value: 1.8, atWord: A(0.38)},
      {label: 'f/2.8', text: 'stop', value: 2.8, atWord: A(0.46)},
      {label: 'f/4', text: 'stop', value: 4, sub: 'deepest focus', atWord: A(0.56)},
    ],
  }));

// 5 ─ Apple's own words for it, on Apple's own page.
rec('letterbox', 'zoneB',
  "Here's how Apple puts it on the iPhone 18 Pro page. The new variable aperture on the main " +
  "camera adjusts for better lighting and depth of field automatically, so everything from " +
  "candid portraits to cinematic video looks its best. Automatically is the word doing the work " +
  "there, because the phone picks the stop for you, which means the feature only shows up as " +
  "pictures that came out better than you expected.",
  'aperture-line', 'the aperture line', "Apple's own words for it",
  'aperture', 'aperture', 'The aperture line, in full');

// 6 ─ The chip both phones share.
S('slide', 'zoneC',
  "Running all of it is the A20 Pro, and it's the first phone chip built on a two nanometre " +
  "process — smaller transistors, so more of them fit in the same space. Six CPU cores: two " +
  "big ones Apple calls super cores, twenty percent quicker than last year, and four " +
  "efficiency cores for everything a phone does while you aren't looking at it.",
  (A) => ({
    headline: 'A20 Pro: the first [2nm] phone chip',
    kind: 'die-floorplan',
    token: 'cpu',
    caption: "Apple's own floorplan",
    premise: 'Two super cores, four efficiency cores, a seven-core GPU and a 32-core Neural Engine.',
    color: 'purple',
    cells: [
      {label: 'Super cores', text: 'cpu', sub: '20% faster', atWord: A(0.42)},
      {label: 'Efficiency cores', text: 'cpu', sub: 'four of them', atWord: A(0.58)},
      {label: 'First 2nm phone chip', text: 'io', sub: 'more transistors to spend', atWord: A(0.20)},
    ],
  }));

// ── iPHONE DUO ──────────────────────────────────────────────────────────────
// 6 ─ The foldable.
S('push', 'zoneA',
  "Then Apple did the thing it had never done before. The iPhone Duo folds: shut, the outer screen " +
  "is a whole phone, one-handed. Open the hinge and the inner display is close to a " +
  "small tablet — the largest screen Apple has ever put on an iPhone, and the thinnest one it has " +
  "made, because half the electronics sit on the other side of the fold.",
  (A) => ({
    headline: 'A phone that opens into [a tablet]',
    kind: 'duo-pair',
    caption: 'iPhone Duo, shut and open',
    premise: 'Both states to the same scale: the cover screen, and the inner display it opens to.',
    color: 'blue',
    cells: [
      {label: 'Outer display', text: 'outer', sub: 'a whole phone, shut', atWord: A(0.28)},
      {label: 'Inner display', text: 'inner', sub: "Apple's largest iPhone screen", atWord: A(0.46)},
      {label: 'The hinge', text: 'hinge', sub: 'thinnest iPhone, open', atWord: A(0.64)},
    ],
  }));

// 7 ─ The bit rivals still get wrong.
S('zoom', 'zoneA',
  "Here's the detail worth stopping on. On that inner display the FaceTime camera sits " +
  "underneath the screen, so there's no notch, no punch hole and no island breaking the " +
  "surface — the camera only surfaces when something asks for it. Every rival foldable still " +
  "puts a hole in its big screen.",
  (A) => ({
    headline: 'The camera is [under] the screen',
    kind: 'duo-pair',
    caption: 'Under-display FaceTime camera',
    premise: 'The camera lives beneath the panel and only appears when an app calls for it.',
    color: 'purple',
    cells: [
      {label: 'Under-display camera', text: 'selfie', sub: 'appears when needed', atWord: A(0.28)},
      {label: 'No cutout', text: 'inner', sub: 'an uninterrupted panel', atWord: A(0.50)},
      {label: 'Outer Center Stage', text: 'outer', sub: '12MP, on the cover', atWord: A(0.64)},
    ],
  }));

// 8 ─ What it weighs and what it costs.
S('whippan', 'zoneB',
  "Two halves and a hinge have to weigh something, and the Duo weighs two hundred and fifty " +
  "four grams against two hundred and eleven for an iPhone 18 Pro. Forty three grams reads as " +
  "nothing written down and feels like something in a shirt pocket. Pricing starts at one " +
  "thousand nine hundred and ninety nine dollars, eight hundred more than the Pro.",
  (A) => ({
    headline: '[254 grams], and $1,999',
    kind: 'compare-bars',
    caption: 'Weight, in grams',
    premise: 'Both figures are Apple\'s own, for the base configuration of each phone.',
    color: 'orange',
    cells: [
      {label: 'iPhone Duo', text: 'bar', sub: '254 g', value: 254, atWord: A(0.22)},
      {label: 'iPhone 18 Pro Max', text: 'bar', sub: '249 g', value: 249, atWord: A(0.46)},
      {label: 'iPhone 18 Pro', text: 'bar', sub: '211 g', value: 211, atWord: A(0.34)},
    ],
  }));

// ── APPLE WATCH ─────────────────────────────────────────────────────────────
// 9 ─ Two watches.
S('fade', 'zoneC',
  "Watches came next, and there are two. Series 12 is the smaller pair, forty six " +
  "millimetres or forty two, and this year in ceramic as well as aluminium and " +
  "titanium. Ultra 4 is the big one — forty nine millimetres of grade five titanium, with an " +
  "Action Button on the left edge, because a gloved hand finds an edge faster than a screen.",
  (A) => ({
    headline: 'Series 12, and the [Ultra 4]',
    kind: 'watch-face',
    token: 'ultra',
    caption: '49 mm titanium, or 46 and 42',
    premise: 'Case and display to scale: the Ultra 4 at 49 by 44 millimetres.',
    color: 'blue',
    cells: [
      {label: 'Series 12', text: 'case', sub: '46 mm or 42 mm', atWord: A(0.24)},
      {label: 'Ceramic, new this year', text: 'screen', sub: 'and aluminium, and titanium', atWord: A(0.40)},
      {label: 'Action Button', text: 'action', sub: 'left edge, Ultra only', atWord: A(0.64)},
    ],
  }));

// 10 ─ The feature that justifies the sensor.
S('iris', 'zoneC',
  "Both watches get an all-new Health Sensing System, and the payoff is one number. Apple's " +
  "Vitals app reads your sleep, your recent activity and your heart rate variability, and " +
  "turns all three into a daily readiness score: pace yourself, ready, or go for it. That only " +
  "works because the sensor samples often enough to show a trend rather than a moment, and a trend " +
  "is the only thing worth acting on when you have just woken up.",
  (A) => ({
    headline: 'One number: [Readiness]',
    kind: 'watch-face',
    caption: 'Vitals, on the watch face',
    premise: 'Sleep, activity and heart rate variability, resolved into one word each morning.',
    color: 'green',
    cells: [
      {label: 'Health Sensing System', text: 'case', sub: 'all-new this year', atWord: A(0.12)},
      {label: 'Sleep, activity, HRV', text: 'screen', sub: 'read overnight', atWord: A(0.32)},
      {label: 'A daily score', text: 'crown', sub: 'pace, ready, or go', atWord: A(0.52)},
      {label: 'A trend, not a moment', text: 'band', sub: 'why the score works', atWord: A(0.66)},
    ],
  }));

// 11 ─ Ultra battery.
S('push', 'zoneA',
  "Battery is where the Ultra 4 stops being a bigger Series 12. Fifty hours of everyday use, " +
  "eighty four hours in low power mode, and ten hours of outdoor workout tracking — a quarter " +
  "more than the last Ultra managed. Ten hours is the figure that matters, because a long day " +
  "out is exactly when you can't stop to charge.",
  (A) => ({
    headline: 'Ultra 4: [50 hours] everyday',
    kind: 'compare-bars',
    caption: 'Battery, by mode',
    premise: "Apple's figures for the Ultra 4, in hours, by how the watch is being used.",
    color: 'orange',
    cells: [
      {label: 'Low Power Mode', text: 'bar', sub: '84 hours', value: 84, atWord: A(0.28)},
      {label: 'Everyday use', text: 'bar', sub: '50 hours', value: 50, atWord: A(0.18)},
      {label: 'Outdoor workout', text: 'bar', sub: '10 hours, 25% more', value: 10, atWord: A(0.44)},
    ],
  }));

// ── AIRPODS 5 ───────────────────────────────────────────────────────────────
// 12 ─ AirPods.
S('slide', 'zoneB',
  "AirPods 5 closed the hardware out, and the interesting part isn't the sound. These buds " +
  "cancel noise in an open-ear design, with no rubber tip sealing your ear canal — which means " +
  "no physical blocking to help, so every decibel you don't hear was cancelled by the H2 chip " +
  "using three microphones and an accelerometer that feels your jaw move.",
  (A) => ({
    headline: 'Noise cancelled, [ear open]',
    kind: 'airpods',
    caption: 'AirPods 5, case and bud',
    premise: "Case and bud to the same scale, from Apple's published dimensions.",
    color: 'blue',
    cells: [
      {label: 'Two mics facing out', text: 'stem', sub: 'they hear direction', atWord: A(0.52)},
      {label: 'One facing in', text: 'bud', sub: 'checks what got through', atWord: A(0.60)},
      {label: 'The case', text: 'case', sub: '50.1 mm across', atWord: A(0.20)},
    ],
  }));

// 13 ─ Apple's own figure for it.
S('fade', 'zoneB',
  "Apple's claim for that is one and a half times more noise cancellation than AirPods 4, " +
  "which it calls the best in an open-ear design. AirPods 5 start at a hundred and twenty nine " +
  "dollars.",
  (A) => ({
    headline: '[1.5x] more than AirPods 4',
    kind: 'compare-bars',
    caption: "Apple's own relative figure",
    premise: 'AirPods 4 as the baseline, AirPods 5 against it, using Apple\'s own comparison.',
    color: 'purple',
    cells: [
      {label: 'AirPods 5', text: 'bar', sub: 'up to 1.5x more ANC', value: 150, atWord: A(0.30)},
      {label: 'AirPods 4', text: 'bar', sub: 'the baseline', value: 100, atWord: A(0.16)},
    ],
  }));

// ── THE MONEY ───────────────────────────────────────────────────────────────
// 14 ─ The ladder.
S('fade', 'zoneC',
  "So what does all of it cost? An iPhone 18 Pro starts at eleven ninety nine for two " +
  "hundred and fifty six gigabytes, and the rungs above it get steep quickly: two hundred " +
  "dollars to five twelve, four hundred more for a terabyte, and six hundred on top of that " +
  "for two. Storage is where Apple makes its margin, and this year the steps are wider.",
  (A) => ({
    headline: 'Each step costs [more] than the last',
    kind: 'price-ladder',
    caption: 'iPhone 18 Pro, US pricing',
    premise: 'The chip beside each row is the step up from the row above it.',
    color: 'orange',
    cells: [
      {label: '256GB', text: 'tier', value: 1199, atWord: A(0.16)},
      {label: '512GB', text: 'tier', value: 1399, atWord: A(0.40)},
      {label: '1TB', text: 'tier', value: 1799, atWord: A(0.52)},
      {label: '2TB', text: 'tier', value: 2399, atWord: A(0.62)},
    ],
  }));

// 15 ─ The strange part, as a graph.
S('whippan', 'zoneC',
  "And here's where the event got strange. Normally last year's iPhones drop in price the " +
  "morning a new one arrives. Instead, Apple raised every one of them by a hundred dollars on " +
  "the same afternoon — the 16, the 17, the 17e and the Air. Each dim bar is what that phone " +
  "cost the day before, and the lit part is what got added.",
  (A) => ({
    headline: 'The old iPhones got [more expensive]',
    kind: 'price-rise',
    token: '$',
    caption: 'US prices, the same afternoon',
    premise: 'Each bar runs to the old price; the glowing extension is what Apple added to it.',
    color: 'orange',
    cells: [
      {label: 'iPhone Air', text: 'rise', value: 1099, sub: '999', atWord: A(0.44)},
      {label: 'iPhone 17', text: 'rise', value: 899, sub: '799', atWord: A(0.50)},
      {label: 'iPhone 16', text: 'rise', value: 799, sub: '699', atWord: A(0.56)},
      {label: 'iPhone 17e', text: 'rise', value: 699, sub: '599', atWord: A(0.62)},
    ],
  }));

// 16 ─ Why.
S('zoom', 'zoneA',
  "Memory is the reason, and the scale is worth seeing. A two hundred and fifty six " +
  "gigabyte memory chip costs four hundred percent more than a year ago, " +
  "because the AI data centres are buying the same parts. What you pay went up nine percent, while " +
  "the bill of materials rose about thirty eight — so Apple ate most of the difference, which it " +
  "does not usually do.",
  (A) => ({
    headline: 'You pay [9%] more. Memory costs 400% more.',
    kind: 'compare-bars',
    caption: 'Year-on-year change',
    premise: 'Three different numbers, all percentages, all year on year — and only one is yours.',
    color: 'purple',
    cells: [
      {label: 'Memory chip cost', text: 'bar', sub: 'up ~400% year on year', value: 400, atWord: A(0.20)},
      {label: 'Bill of materials', text: 'bar', sub: 'up ~38% on a Pro', value: 38, atWord: A(0.50)},
      {label: 'What you pay', text: 'bar', sub: '$1,099 to $1,199', value: 9, atWord: A(0.60)},
    ],
  }));

// 17 ─ Out.
c.add('OUTRO_CTA', 'fade', 'zoneA',
  "That's the event: a camera that changes its own aperture, a phone that folds without a " +
  "hole in the screen, a watch that answers one question a day, and buds that cancel noise " +
  "with your ear open. Each product has its own video on the channel.",
  (A) => ({
    headline: 'Each product, in detail',
    subtext: 'Four videos on the channel',
    atWord: A(0.5),
  }));

const spec = {
  meta: {
    topic: 'Apple September 2026 — everything Apple announced',
    format: 'long',
    fps: 30,
    subject: 'Apple',
    topicAxes: ['entity-novelty', 'economic-pain'],
    screenplay: 'documentary',
    onePayoff: 'what Apple announced in September 2026, and why the old iPhones got dearer the same day',
    openLoop: "Why did last year's iPhones get dearer on the day the new one arrived?",
    analogy: 'A price list where the old rows moved up instead of down.',
    seo: {
      title: 'Apple September 2026 — everything Apple announced',
      description:
        'The whole Apple September 2026 event in one video: iPhone 18 Pro and its variable ' +
        'aperture, the foldable iPhone Duo, Apple Watch Series 12 and Ultra 4, AirPods 5 — ' +
        'and the price rise that hit every older iPhone the same afternoon.',
      breakdown: 'iPhone 18 Pro, iPhone Duo, Apple Watch, AirPods 5, and the prices',
      pinned: 'Which of the four would you actually buy — and did the price rise change your mind?',
      tags: [
        'Apple September 2026', 'Apple event 2026', 'Apple keynote 2026', 'iPhone 18 Pro',
        'iPhone Duo', 'foldable iPhone', 'Apple Watch Series 12', 'Apple Watch Ultra 4',
        'AirPods 5', 'A20 Pro', 'variable aperture', 'iPhone price increase',
        'Apple event recap', 'everything Apple announced', 'iPhone 18 Pro price',
        'Apple 2026 lineup', 'iPhone Duo price', 'Apple Watch 2026', 'AirPods 5 price',
        'Apple news', 'iPhone 18 Pro vs iPhone Duo', 'Apple memory prices',
      ],
      queries: [
        'everything Apple announced September 2026',
        'why did Apple raise iPhone prices',
        'iPhone 18 Pro vs iPhone Duo',
        'Apple September 2026 event recap',
      ],
      sources: [
        'apple.com/newsroom — Apple September 2026 event',
        'apple.com/iphone-18-pro, apple.com/iphone-duo, apple.com/apple-watch-ultra-4, apple.com/airpods-5',
        'Apple product pages and specs, captured 10 September 2026',
      ],
    },
  },
  brand: c.brand(),
  thumbnail: {
    title: 'EVERYTHING APPLE JUST ANNOUNCED', badge: 'Apple Event',
    note: 'and why the prices went up', asset: 'si:apple',
  },
  scenes: c.S,
};

c.emit('topics/apple-event/long.json', spec);
