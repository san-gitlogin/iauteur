// Apple September 2026 — Apple Watch, explained.  WIDE CUT.
//
// Covers BOTH watches, because Apple announced them together and they share the eight new
// health features and the three Audio Intelligence ones. Where a fact belongs to only one
// of them, the narration says which. Every figure has a row in the dossier.
//
// Scene budget: 14 scenes, so the palette needs 7 distinct sub-types (min(8, n*0.5)) and no
// sub-type past 5 uses (max(4, ceil(n*0.35))). Written to that.
import {cut} from '../../scripts/lib/apple-build.mjs';

const c = cut();
const S = (t, bg, n, mk, o) => c.stage(t, bg, n, mk, o);
const REC = 'Apple, Apple Watch Ultra 4 product page, captured 10 September 2026';

// CAMERA MOVES, AND WHY THEY ARE SHAPED LIKE THIS (paid for on 2026-09-10):
//
//  1. `RecordedStep` reads `zooms[].atWord`; the author writes `wantAtWord`, and ONLY
//     `anchor-spec.mjs` turns one into the other. Skip that pass and every move collapses
//     onto the clip's own anchor — the camera sits punched in for the whole beat, which is
//     the owner's "you are not showing the official website fully". Order is not optional:
//     build -> bake-rec -> anchor-spec -> voiceover -> sync -> lint.
//
//  2. THE PUNCH-IN IS BRIEF, AND THE BEAT LANDS ON `full`. `windowFor` frames a mark from
//     its LEADING EDGE — right for a terminal, wrong for a centred web page, where it puts
//     the window's left edge inside the paragraph. Marking the body text instead fixes the
//     framing (see the AirPods builder), but the recorder could not resolve a paragraph
//     needle on these three pages, so here the camera punches in on the heading and then
//     pulls back to the whole page, which is where the sentence is actually read.
//
//  3. ONE CALLOUT PER MARK (the linter rejects two), and it names what its rectangle covers.
const rec = (transition, bg, narration, step, label, caption, zoomMark, labelMark, takeaway, at = 0.14) =>
  c.add('RECORDED_STEP', transition, bg, narration, (A) => ({
    clips: [{
      ref: `rec:apple-watch-page#${step}`, label, focus: true, atWord: A(at),
      zooms: [
        {mark: zoomMark, wantAtWord: A(at + 0.14)},
        {at: 'full', wantAtWord: A(at + 0.26)},
      ],
      callouts: [{text: takeaway, mark: labelMark, wantAtWord: A(at + 0.46)}],
    }],
    sourceNote: REC,
    caption,
  }));

// 1 ─ HOOK, 14 words.
c.add('HOOK', 'dip', 'zoneA',
  'The new Apple Watch reads your heart more often than any wearable Apple has built.',
  (A) => ({
    headline: 'Apple Watch',
    subtext: 'Series 12 and Ultra 4',
    kicker: 'September 2026',
    variant: 'plaque',
    atWord: A(0.5),
  }));

// 2 ─ Greeting, intent, loop.
c.add('TITLE_CARD', 'fade', 'zoneA',
  "Welcome back. Apple announced two watches, and they share almost everything that matters. " +
  "Today we're going through what the new sensor does, what the Ultra 4 buys you, and which " +
  'one to get. So which watch is right for most people?',
  (A) => ({
    title: 'Two watches, one sensor',
    subtitle: 'Series 12 against Ultra 4',
    atWord: A(0.4),
  }));

// 3 ─ The Ultra 4 case.
S('wipe', 'zoneA',
  'Start with the big one. Apple Watch Ultra 4 is a forty nine by forty four millimetre case ' +
  'in grade five titanium, twelve millimetres deep, with a flat sapphire front. The Action ' +
  "button sits on the left, where a gloved hand finds it, and the Crown and side button share the right edge. The Ultra 4 is " +
  "built for people who'll actually go somewhere with it.",
  (A) => ({
    headline: 'Ultra 4: [49 by 44] millimetres',
    kind: 'watch-face',
    token: 'ultra',
    caption: 'Grade 5 titanium, 12 mm deep',
    premise: 'Case and display both to scale: 422 by 514 pixels at 326 ppi inside a 44 mm case.',
    color: 'orange',
    cells: [
      {label: 'Titanium case', text: 'case', sub: '49 x 44 x 12 mm', atWord: A(0.20)},
      {label: 'Action Button', text: 'action', sub: 'left edge, Ultra only', atWord: A(0.46)},
      {label: 'Digital Crown', text: 'crown', sub: 'and the side button', atWord: A(0.58)},
    ],
  }));

// 4 ─ The Series 12, and the finish that is actually new.
S('push', 'zoneB',
  'Series 12 is the smaller pair: forty six millimetres or forty two, in aluminium or ' +
  "titanium — and this year, in ceramic. Ceramic's the genuinely new one, and it's a " +
  'millimetre taller and a fraction thicker than the metal cases because ceramic needs more ' +
  'material to survive a knock.',
  (A) => ({
    headline: 'Series 12, now in [ceramic]',
    kind: 'watch-face',
    caption: '46 mm or 42 mm',
    premise: 'Aluminium, titanium and — new this year — ceramic, which runs 1 mm taller.',
    color: 'blue',
    cells: [
      {label: '46 mm and 42 mm', text: 'case', sub: 'two sizes', atWord: A(0.16)},
      {label: 'Ceramic', text: 'screen', sub: 'new this year', atWord: A(0.40)},
      {label: 'A millimetre taller', text: 'band', sub: 'ceramic needs the material', atWord: A(0.62)},
    ],
  }));

// 5 ─ Apple's health section.
rec('letterbox', 'zoneB',
  "Both watches lead on health, and Apple puts that first on its own page. Eight new health " +
  "and fitness features across the pair, headed by a line about running with all your heart, " +
  "which is closer to literal than it sounds, because what changed this year is the sensor " +
  "itself rather than the software on top of it. Worth reading that section rather than the " +
  "headline, and Apple spells it out further down.",
  'health', 'the health section', 'Eight new health features',
  'healthhead', 'healthhead', "Apple's own health section");

// 6 ─ Apple's heart section, which carries the mechanism.
rec('letterbox', 'zoneC',
  "The detail sits further down, and that's the part worth reading. An all new " +
  'Health Sensing System, working with the S11 chip, taking higher frequency heart readings. ' +
  'Larger, more power efficient green LEDs, which means the watch can measure more often without ' +
  'spending the battery it used to. That trade is the whole story of this year: a sensor reading ' +
  'more often gives you a trend instead of a snapshot, and a trend is the thing you can act on. ' +
  'And it explains why the software arrived now rather than a year ago.',
  'heart', 'the heart sensor section', 'Higher-frequency heart monitoring',
  'hearthead', 'hearthead', 'Why heart data leads the page');

// 7 ─ What that sensor buys you: a score you act on.
S('iris', 'zoneC',
  "All that extra sampling pays off in one feature above the rest. Reading often enough gives you a " +
  "trend rather than a moment, and the Vitals app turns that into something you can act on: your " +
  "recent activity, your sleep and your heart rate variability become a single daily readiness " +
  "score, and the score sits on the watch face — pace yourself, ready, or go for it — so there is no app to " +
  "open. One number, answering the only question you have in the morning.",
  (A) => ({
    headline: 'One number: [Readiness]',
    kind: 'watch-face',
    caption: 'Pace Yourself · Ready · Go For It',
    premise: 'Activity, sleep and heart rate variability, resolved into one score on the face.',
    color: 'green',
    // In narration order: the trend comes first now, because it is the reason the score exists.
    cells: [
      {label: 'A trend, not a moment', text: 'band', sub: 'why the score works', atWord: A(0.16)},
      {label: 'Vitals app', text: 'screen', sub: 'sleep, activity, HRV', atWord: A(0.34)},
      {label: 'A daily score', text: 'case', sub: 'pace, ready, or go', atWord: A(0.52)},
      {label: 'On the face', text: 'crown', sub: 'no app to open', atWord: A(0.66)},
    ],
  }));

// 8 ─ The other health headline, and it uses your phone.
S('slide', 'zoneA',
  "There's a second one that surprised me. You can run a proper mobility assessment by " +
  'stepping in place in front of your iPhone camera, while the watch tracks your pace and ' +
  'form in real time. Two devices, one measurement — the kind of thing a lab used to charge ' +
  'you for.',
  (A) => ({
    headline: 'A [VO2 max] test on your floor',
    kind: 'watch-face',
    caption: 'Watch and iPhone, together',
    premise: 'The watch measures pace and form; the iPhone camera watches you step in place.',
    color: 'purple',
    cells: [
      {label: 'Step in place', text: 'screen', sub: 'in front of the camera', atWord: A(0.28)},
      {label: 'The watch tracks', text: 'case', sub: 'pace and form, live', atWord: A(0.50)},
      {label: 'Two devices, one test', text: 'crown', sub: 'a lab used to charge for this', atWord: A(0.68)},
    ],
  }));

// 9 ─ Battery, which is the Ultra's real argument.
S('fade', 'zoneB',
  "Battery's where the Ultra 4 stops being a bigger Series 12. Fifty hours of everyday use, " +
  'eighty four in low power, and ten hours of outdoor workout tracking, which is a quarter ' +
  'more than the last Ultra managed. That gap matters because a long workout is exactly when ' +
  "you can't stop to charge. Then there is the mode nobody else offers.",
  (A) => ({
    headline: 'Ultra 4: [50 hours] everyday',
    kind: 'compare-bars',
    caption: "Apple's stated figures",
    premise: 'Everyday use, low power mode, and a tracked outdoor workout — three different numbers.',
    color: 'orange',
    cells: [
      {label: 'Low Power Mode', text: 'bar', sub: '84 hours', value: 84, atWord: A(0.36)},
      {label: 'Everyday use', text: 'bar', sub: '50 hours', value: 50, atWord: A(0.20)},
      {label: 'Outdoor workout', text: 'bar', sub: '10 hours, 25% more', value: 10, atWord: A(0.52)},
    ],
  }));

// 10 ─ The endurance mode, and the number that gets misquoted.
S('zoom', 'zoneB',
  'Max Extended Workout mode tracks an outdoor run, walk or hike for forty five hours, still ' +
  'taking a GPS reading every second, which Apple frames as enough to finish a hundred mile ' +
  "race. And to be clear, that forty five is the Ultra's tracking figure — the other forty " +
  "five you'll read about this month is the iPhone 18 Pro Max's video playback. Different " +
  'products, one number.',
  (A) => ({
    headline: '[45 hours] of tracking, not playback',
    kind: 'compare-bars',
    caption: 'Max Extended Workout',
    premise: "Two different 45-hour claims landed this month. This one is the Ultra 4's GPS tracking.",
    color: 'red',
    cells: [
      {label: 'Ultra 4 tracking', text: 'bar', sub: '45 h, GPS every second', value: 45, atWord: A(0.16)},
      {label: 'A hundred-mile race', text: 'bar', sub: "Apple's own framing", value: 45, atWord: A(0.34)},
      {label: 'iPhone 18 Pro Max', text: 'bar', sub: '45 h, video playback', value: 45, atWord: A(0.58)},
    ],
  }));

// 11 ─ Apple's AI section.
rec('letterbox', 'zoneC',
  "Both watches also get Siri AI on the wrist, and Apple gives it a section of its own. Audio " +
  "Intelligence uses the built-in microphone and the S11 chip to make sense of what you hear " +
  "around you, and the page is careful to say that happens privately, on the watch, because " +
  "that's the obvious objection to a wearable that listens. Live Rewind catches the last thing " +
  "somebody said, and Siri Recaps summarises a conversation you half missed, without keeping " +
  "the raw audio.",
  'ai', 'the Siri AI section', 'Audio Intelligence, on the watch',
  'aihead', 'aihead', 'Siri AI, on the wrist');

// 12 ─ What they cost.
S('whippan', 'zoneA',
  'Now the prices, and they matter more than usual this year. Series 12 starts at three ' +
  'ninety nine for the forty two millimetre aluminium, four forty nine for the forty six. ' +
  'Cellular adds a hundred, and titanium takes you to six ninety nine. Both go on sale on ' +
  'the eighteenth of September.',
  (A) => ({
    headline: 'Series 12 from [$399]',
    kind: 'price-ladder',
    caption: 'US pricing',
    premise: "Apple's own tiers. The chip beside each row is its difference from the row above.",
    color: 'blue',
    cells: [
      {label: '42 mm aluminium', text: 'tier', value: 399, atWord: A(0.20)},
      {label: '46 mm aluminium', text: 'tier', value: 449, atWord: A(0.34)},
      {label: '42 mm cellular', text: 'tier', value: 499, atWord: A(0.48)},
      {label: '42 mm titanium', text: 'tier', value: 699, atWord: A(0.60)},
    ],
  }));

// 13 ─ The quiet good news.
S('fade', 'zoneC',
  "And here's the part that got no headline. Apple Watch Ultra 4 costs seven ninety nine, " +
  'which is exactly what the Ultra 3 cost. In a month where every older iPhone went up a ' +
  'hundred dollars, the Ultra held its price. So the honest advice is simple: buy the Series ' +
  '12 unless you genuinely need the battery, because the sensor is the same in both.',
  (A) => ({
    headline: 'The Ultra [held] its price',
    kind: 'compare-bars',
    caption: 'Against the rest of the launch',
    premise: 'Ultra 4 is $799, the same as Ultra 3, in a month when every older iPhone rose $100.',
    color: 'green',
    cells: [
      {label: 'Ultra 4', text: 'bar', sub: '$799, unchanged', value: 799, atWord: A(0.16)},
      {label: 'Ultra 3, last year', text: 'bar', sub: '$799, the same', value: 799, atWord: A(0.34)},
      {label: 'Series 12', text: 'bar', sub: 'from $399', value: 399, atWord: A(0.60)},
    ],
  }));

// 14 ─ Out.
c.add('OUTRO_CTA', 'fade', 'zoneA',
  'So: one sensor, two bodies, and a readiness score that is the reason to upgrade. AirPods ' +
  'are next, and after that the whole event in one go.',
  (A) => ({
    headline: 'AirPods next, then the whole event',
    subtext: 'Series 12 or Ultra 4?',
    atWord: A(0.5),
  }));

const spec = {
  meta: {
    topic: 'Apple September 2026 — Apple Watch, explained',
    format: 'long',
    fps: 30,
    subject: 'Apple Watch',
    topicAxes: ['entity-novelty', 'economic-pain'],
    screenplay: 'documentary',
    onePayoff: 'the new heart sensor and the readiness score it enables, and which watch to buy',
    openLoop: 'Which watch is the right one for most people?',
    analogy: 'One number in the morning, instead of a chart.',
    seo: {
      title: 'Apple September 2026 — Apple Watch, explained',
      description:
        'Apple Watch Series 12 and Ultra 4: the all-new Health Sensing System on the S11 chip, ' +
        'the daily Readiness score, 50-hour battery on the Ultra, and why the Ultra held its price.',
      breakdown: 'the new heart sensor, the Readiness score, Ultra 4 battery, and the prices',
      pinned: 'Series 12 or Ultra 4 — which one would you actually wear every day?',
      tags: [
        'Apple Watch Series 12', 'Apple Watch Ultra 4', 'Apple Watch 2026',
        'Apple September 2026', 'Apple event 2026', 'Apple Watch review',
        'Series 12 vs Ultra 4', 'Apple Watch price', 'S11 chip', 'Readiness score',
        'Apple Watch battery life', 'Vitals app', 'Audio Intelligence', 'Siri AI',
        'Apple Watch health features', 'VO2 max', 'best smartwatch 2026',
        'Apple Watch ceramic', 'Apple keynote', 'should I upgrade Apple Watch',
      ],
      queries: [
        'Apple Watch Series 12 vs Ultra 4',
        'what is new in Apple Watch Series 12',
        'Apple Watch Ultra 4 battery life',
        'Apple Watch readiness score',
      ],
      sources: [
        'apple.com/newsroom — Apple unveils Apple Watch Ultra 4',
        'apple.com/apple-watch-ultra-4 and apple.com/apple-watch-series-12',
        'apple.com/apple-watch-ultra-4 product page, captured 10 September 2026',
      ],
    },
  },
  brand: c.brand(),
  thumbnail: {
    title: 'EVERYTHING YOU NEED TO KNOW', badge: 'Apple Watch',
    note: 'Series 12 and Ultra 4', asset: 'si:apple',
  },
  scenes: c.S,
};

c.emit('topics/apple-watch/long.json', spec);
