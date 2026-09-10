// Apple September 2026 — iPhone Duo, explained.  WIDE CUT.
//
// The Duo has no predecessor, so there is no diff to write from. The honest frame is
// "what is it, and what does folding actually buy you" — and where a claim is a comparison
// (thinnest iPhone, largest display) it names WHAT it is compared to. Every figure has a
// row in briefs/apple/00-event-dossier.md.
//
// Beat budget: 3 anchors earn 22s (~65 words), 4 anchors earn 26s (~78). Written to that.
import {cut} from '../../scripts/lib/apple-build.mjs';

const c = cut();
const S = (t, bg, n, mk, o) => c.stage(t, bg, n, mk, o);
const REC = 'Apple, iPhone Duo product page, captured 10 September 2026';

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
      ref: `rec:apple-duo-page#${step}`, label, focus: true, atWord: A(at),
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
  'The iPhone Duo folds, and its selfie camera hides underneath the screen. Really.',
  (A) => ({
    headline: 'iPhone Duo',
    subtext: "Apple's first foldable iPhone",
    kicker: 'September 2026',
    variant: 'plaque',
    atWord: A(0.5),
  }));

// 2 ─ Greeting, intent, loop.
c.add('TITLE_CARD', 'fade', 'zoneA',
  "Welcome back. Apple's finally made a folding iPhone, and it's called the Duo. Today we're " +
  "going through what actually unfolds, what it costs, and the one design decision nobody else " +
  'has managed. So is a two thousand dollar iPhone a real product, or a statement?',
  (A) => ({
    title: 'What folding actually buys you',
    subtitle: 'iPhone Duo, in numbers',
    atWord: A(0.4),
  }));

// 3 ─ The geometry.
S('wipe', 'zoneA',
  'Start with the geometry, because that decides whether a fold is useful or a gimmick. Closed, ' +
  "the Duo's eighty four millimetres across. Open it and the width doubles to one sixty five, " +
  "while the height never moves. So it doesn't become a taller phone. It becomes a wider one.",
  (A) => ({
    headline: 'The width [doubles]. The height does not.',
    kind: 'duo-pair',
    caption: '84.1 mm closed, 164.6 mm open',
    premise: 'Both states drawn to the same scale, from the published dimensions.',
    color: 'purple',
    cells: [
      {label: 'Closed', text: 'outer', sub: '84.1 mm across', atWord: A(0.22)},
      {label: 'Open', text: 'inner', sub: '164.6 mm across', atWord: A(0.40)},
      {label: 'The hinge', text: 'hinge', sub: 'down the centre', atWord: A(0.58)},
    ],
  }));

// 4 ─ Apple's own claim about the display.
rec('letterbox', 'zoneA',
  "Apple leads on exactly that. Its own page calls this the largest iPhone display ever, in a " +
  'thin foldable design, and those two halves are the whole product: a screen that would never ' +
  'fit a pocket, folded until it does.',
  'thin-fold', 'the display claim', 'Largest iPhone display ever',
  'disp', 'disp', "Apple's claim for the display");

// 5 ─ The thinness claim, said precisely.
S('push', 'zoneB',
  "That thinness claim needs care, because it's true in one state only. Open, the Duo is five " +
  'point two millimetres, beating the iPhone Air at five point six. Closed, you hold two of ' +
  "those plus a hinge, so it's eleven point three. Both numbers are honest; one gets advertised.",
  (A) => ({
    headline: 'Thinnest iPhone ever, [when open]',
    kind: 'compare-bars',
    caption: 'Depth, in millimetres',
    premise: 'The claim is true open and false closed, so both states belong on screen.',
    color: 'blue',
    cells: [
      {label: 'iPhone Duo, open', text: 'bar', sub: '5.2 mm', value: 5.2, atWord: A(0.22)},
      {label: 'iPhone Air', text: 'bar', sub: '5.6 mm', value: 5.6, atWord: A(0.42)},
      {label: 'iPhone Duo, closed', text: 'bar', sub: '11.3 mm', value: 11.3, atWord: A(0.60)},
    ],
  }));

// 6 ─ The screens.
S('fade', 'zoneB',
  "Two screens, doing different jobs. Outside there's a five point four inch panel carrying " +
  'ninety percent of an iPhone 18 Pro screen area, so the closed phone is a whole phone rather ' +
  'than a preview window. Open it and you get seven point six inches with a nano texture finish.',
  (A) => ({
    headline: 'A whole phone, [then] a small tablet',
    kind: 'duo-pair',
    token: 'open',
    caption: '5.4-inch outside, 7.6-inch inside',
    premise: 'The outer panel carries 90% of an iPhone 18 Pro screen area. The inner one is nano-texture.',
    color: 'green',
    cells: [
      {label: 'Outer display', text: 'outer', sub: '5.4-inch, 1398 x 2034', atWord: A(0.18)},
      {label: 'Inner display', text: 'inner', sub: '7.6-inch, nano-texture', atWord: A(0.56)},
      {label: 'Under the screen', text: 'selfie', sub: 'no notch, no cutout', atWord: A(0.68)},
    ],
  }));

// 7 ─ The design decision nobody else has managed. Pays off scene 1.
S('iris', 'zoneC',
  "Here's the part I opened with. On that inner screen the FaceTime camera sits underneath the " +
  'display, so there’s no notch, no punch hole and no island breaking the surface, because the ' +
  'camera only appears when it’s needed. Every rival foldable puts a hole in its big screen.',
  (A) => ({
    headline: 'The camera is [under] the screen',
    kind: 'duo-pair',
    token: 'open',
    caption: 'It appears only when needed',
    premise: 'No notch and no cutout in the inner display: the camera sits beneath the surface.',
    color: 'purple',
    cells: [
      {label: 'Under-display camera', text: 'selfie', sub: 'appears only when needed', atWord: A(0.24)},
      {label: 'No cutout', text: 'inner', sub: 'an uninterrupted panel', atWord: A(0.50)},
      {label: 'Outer Center Stage', text: 'outer', sub: '12MP, on the cover', atWord: A(0.66)},
    ],
  }));

// 8 ─ Multitasking: what the extra width is FOR.
S('slide', 'zoneA',
  "All that width has to earn itself, and iOS 27 is where it does. Unfold the Duo and the system " +
  'adapts as it opens, so you can run two apps side by side, or hold two home screen pages at ' +
  'once. Apps notice the fold happening, which is why the handoff feels continuous rather than ' +
  'like a relaunch.',
  (A) => ({
    headline: 'Two apps, [side by side]',
    kind: 'duo-pair',
    token: 'open',
    caption: 'iOS 27 adapts as it opens',
    premise: 'The inner panel is close to 4:3, which is what makes two full-height apps practical.',
    color: 'green',
    cells: [
      {label: 'Two apps at once', text: 'inner', sub: 'side by side', atWord: A(0.34)},
      {label: 'Two home pages', text: 'outer', sub: 'or one big grid', atWord: A(0.50)},
      {label: 'Apps see the fold', text: 'hinge', sub: 'continuous, not relaunched', atWord: A(0.66)},
    ],
  }));

// 9 ─ The cameras, and Apple's page.
rec('letterbox', 'zoneC',
  'Round the back, a pair rather than the Pro trio: a forty eight megapixel Fusion main and ' +
  'a forty eight megapixel ultra wide, in a pill shaped housing with the flash beside them. ' +
  'Two lenses rather than three is a choice the hinge forces, because a telephoto needs depth and ' +
  'depth is the one dimension a folding phone spends twice. What that costs you is optical reach, ' +
  'which is the next thing worth looking at.',
  'camera', 'the camera system', 'Dual 48MP, not the Pro trio',
  'camhead', 'camhead', 'The camera section, in full');

// 10 ─ What the fold buys the camera. A genuinely new capability.
S('zoom', 'zoneC',
  "Folding does buy the camera something real, though. Because the outer screen faces you while " +
  'the good rear lenses face out, you can frame a selfie on the cover display and shoot it on the ' +
  "main camera. Smart Take goes further and fires the shutter itself once everyone's ready.",
  (A) => ({
    headline: 'Selfies on the [rear] camera',
    kind: 'duo-pair',
    caption: 'Frame on the cover, shoot on the good lens',
    premise: 'The cover display is a viewfinder for the rear cameras. Smart Take releases the shutter.',
    color: 'blue',
    cells: [
      {label: 'Duo Preview', text: 'outer', sub: 'frame on the cover screen', atWord: A(0.34)},
      {label: 'The good lenses', text: 'lens', sub: 'dual 48MP Fusion', atWord: A(0.50)},
      {label: 'Smart Take', text: 'body', sub: 'fires when everyone is ready', atWord: A(0.68)},
    ],
  }));

// 11 ─ The chip.
S('fade', 'zoneB',
  "Inside sits the same A20 Pro that runs the 18 Pro, with the same dual sixteen core Neural " +
  "Engine, so the folding phone isn't the slow one in the range. What differs is the plumbing: " +
  'an advanced thermal system, because a five millimetre body has nowhere to put heat.',
  (A) => ({
    headline: 'The [same] A20 Pro as the 18 Pro',
    kind: 'die-floorplan',
    token: 'neural',
    caption: 'Dual 16-core Neural Engine',
    premise: 'Thirty-two Neural Engine cells drawn, thirty-two on the chip. The same silicon as the Pro.',
    color: 'blue',
    cells: [
      {label: 'Neural Engine', text: 'neural', sub: '32 cores, as the Pro', atWord: A(0.26)},
      {label: 'Thermal system', text: 'io', sub: 'a 5.2 mm body traps heat', atWord: A(0.58)},
      {label: 'Same AI workloads', text: 'io', sub: 'no second-tier silicon', atWord: A(0.70)},
    ],
  }));

// 12 ─ Apple's chip section.
rec('letterbox', 'zoneB',
  "Apple's page says it in its own words: the A20 Pro with the dual sixteen core Neural Engine, " +
  'purpose built for intensive AI workloads. Same chip as the Pro, different body around it, and ' +
  "that matters more than it sounds. A first generation product usually ships with last year's " +
  'silicon, and you feel that every day for two years. This one gets the fastest chip Apple makes ' +
  'on the day it goes on sale.',
  'chip', 'the A20 Pro section', 'The same silicon as the Pro',
  'chiphead', 'chiphead', 'Dual 16-core Neural Engine');

// 13 ─ The battery design.
rec('letterbox', 'zoneA',
  'Battery gets its own passage, and it’s the more interesting one. An iPhone first dual ' +
  'battery system, paired with an internal eSIM design that reclaims the space a SIM tray used ' +
  'to take, so that room goes to the cells instead.',
  'battery', 'the dual-battery system', 'eSIM buys room for the cells',
  'batt', 'batt', 'Two cells, one phone');

// 14 ─ The camera trade-off, drawn on the phone that keeps the third lens.
S('slide', 'zoneB',
  "Worth being clear about what the fold costs you, though. An iPhone 18 Pro carries three rear " +
  "lenses; the Duo carries two, and the one it drops is the telephoto. So there's no optical " +
  "reach here — if you shoot a lot at distance, that's the compromise you're buying into.",
  (A) => ({
    headline: 'The [telephoto] is what you give up',
    kind: 'pro-back',
    caption: 'Three lenses on the Pro, two on the Duo',
    premise: "This is the 18 Pro's island. The Duo keeps the main and the ultra wide, and drops the third.",
    color: 'red',
    cells: [
      {label: 'Three on the Pro', text: 'lens', sub: 'main, ultra wide, telephoto', atWord: A(0.22)},
      {label: 'Two on the Duo', text: 'plateau', sub: 'no optical reach', atWord: A(0.42)},
      {label: 'The trade', text: 'flash', sub: 'reach, for a bigger screen', atWord: A(0.62)},
    ],
  }));

// 14b ─ Weight, which is the thing you actually feel.
S('fade', 'zoneA',
  "One number the keynote skipped past: weight. The Duo is two hundred and fifty four grams, " +
  "against two hundred and eleven for an iPhone 18 Pro. That's forty three grams, which sounds " +
  "trivial written down and is very much not trivial in a shirt pocket. Two halves and a hinge " +
  "have to weigh something.",
  (A) => ({
    headline: '[254 grams], and you notice',
    kind: 'compare-bars',
    caption: 'Against the Pro',
    premise: "Apple's published weights. Two halves and a hinge cost 43 grams over an 18 Pro.",
    color: 'red',
    cells: [
      {label: 'iPhone Duo', text: 'bar', sub: '254 g', value: 254, atWord: A(0.16)},
      {label: 'iPhone 18 Pro Max', text: 'bar', sub: '249 g', value: 249, atWord: A(0.52)},
      {label: 'iPhone 18 Pro', text: 'bar', sub: '211 g', value: 211, atWord: A(0.36)},
    ],
  }));

// 15 ─ What it costs.
S('fade', 'zoneC',
  'Now the number. The Duo starts at one thousand nine hundred and ninety nine dollars for two ' +
  'fifty six gigabytes, which is eight hundred more than an iPhone 18 Pro. Two colours, pre ' +
  'orders on the sixteenth of October, and it arrives on the twenty third.',
  (A) => ({
    headline: '[$1,999] to start',
    kind: 'compare-bars',
    caption: 'Against the rest of the lineup',
    premise: 'Entry price, 256GB, US. The Duo sits above every other iPhone on sale.',
    color: 'orange',
    cells: [
      {label: 'iPhone Duo', text: 'bar', sub: '$1,999', value: 1999, atWord: A(0.18)},
      {label: 'iPhone 18 Pro Max', text: 'bar', sub: '$1,299', value: 1299, atWord: A(0.44)},
      {label: 'iPhone 18 Pro', text: 'bar', sub: '$1,199', value: 1199, atWord: A(0.56)},
    ],
  }));

// 16 ─ The small print that changes who should buy it.
S('whippan', 'zoneC',
  "Then the practical stuff, which matters more on a phone that bends. Titanium frame, Ceramic " +
  "Shield front and back, and IP sixty eight — dust as well as water, which is the harder half " +
  "for a hinge. The seventy nine dollar USB C Apple Pencil works on it, though the Pencil Pro does " +
  "not, and Touch ID sits in the side button rather than under the glass, which is what you would " +
  "expect on a phone with nowhere convenient to hide a reader.",
  (A) => ({
    headline: '[IP68], Touch ID, and one Pencil',
    kind: 'duo-pair',
    caption: 'The practical small print',
    premise: 'Titanium frame, Ceramic Shield, IP68. Touch ID in the side button; USB-C Pencil only.',
    color: 'orange',
    cells: [
      {label: 'Titanium and IP68', text: 'body', sub: 'dust as well as water', atWord: A(0.24)},
      {label: 'Touch ID', text: 'outer', sub: 'in the side button', atWord: A(0.52)},
      {label: 'USB-C Apple Pencil', text: 'inner', sub: 'not the Pencil Pro', atWord: A(0.70)},
    ],
  }));

// 17 ─ Out.
c.add('OUTRO_CTA', 'fade', 'zoneA',
  "So the Duo's a real phone closed, a small tablet open, and the only one of these without a " +
  'hole in its big screen. Whether that’s worth two thousand dollars is genuinely your call. ' +
  'The watches and AirPods are next.',
  (A) => ({
    headline: 'The watches and AirPods next',
    subtext: 'Would you carry a folding iPhone?',
    atWord: A(0.5),
  }));

const spec = {
  meta: {
    topic: 'Apple September 2026 — iPhone Duo, explained',
    format: 'long',
    fps: 30,
    subject: 'iPhone Duo',
    topicAxes: ['entity-novelty', 'economic-pain'],
    screenplay: 'documentary',
    onePayoff: 'what folding actually buys you on the iPhone Duo, and what it costs',
    openLoop: 'Is a two thousand dollar iPhone a real product or a statement?',
    analogy: 'A phone closed, a small tablet open.',
    seo: {
      title: 'Apple September 2026 — iPhone Duo, explained',
      description:
        "Apple's first foldable iPhone: the width doubles and the height does not, the selfie " +
        'camera hides under the inner screen, and it starts at $1,999. Every figure from Apple.',
      breakdown: 'the fold, the under-display camera, the A20 Pro, and the $1,999 price',
      pinned: 'Would you carry a folding iPhone at $1,999, or wait for the second one?',
      tags: [
        'iPhone Duo', 'foldable iPhone', 'Apple September 2026', 'iPhone Duo price',
        'under-display camera', 'A20 Pro', 'Apple event', 'iPhone Duo specs',
      ],
      queries: [
        'iPhone Duo specs and price',
        'is the iPhone Duo worth it',
        'iPhone Duo under display camera',
        'how thin is the iPhone Duo',
      ],
      sources: [
        'apple.com/newsroom — Apple unveils iPhone Duo',
        'apple.com/iphone-duo and its specs page',
        'apple.com/iphone-duo product page, captured 10 September 2026',
      ],
    },
  },
  brand: c.brand(),
  thumbnail: {title: 'EVERYTHING YOU NEED TO KNOW', badge: 'iPhone Duo',
    note: 'the first foldable iPhone', asset: 'si:apple'},
  scenes: c.S,
};

c.emit('topics/apple-duo/long.json', spec);
