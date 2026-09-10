// Apple September 2026 — iPhone 18 Pro, explained.  WIDE CUT.
//
// WRITTEN FROM THE 18-vs-17 DIFF, NOT FROM THE SPEC SHEET. The first cut called the
// full-width camera plateau and the 2.6mm bezel "changes"; the plateau arrived on the
// 17 Pro and the bezel is identical to it. Every claim of newness below has a row in the
// CHANGED table of briefs/apple/00-event-dossier.md, and the things that carried over are
// SAID to have carried over.
//
// Recorded beats are cast from scripts/page-map.mjs — each is aimed at the scroll position
// whose own words match the narration over it.
import {cut, FINISHES} from '../../scripts/lib/apple-build.mjs';

const c = cut();
const S = (t, bg, n, mk, o) => c.stage(t, bg, n, mk, o);
const REC = 'Apple, iPhone 18 Pro product page, captured 10 September 2026';

// A recorded beat. `ref` resolves in bake-rec. `sourceNote` is required whenever the
// footage came from a page we do not own: a recording of someone else's page is a
// quotation, and a quotation carries its credit on screen for the whole beat (LAW 0f).
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
const rec = (transition, bg, narration, step, label, caption, zoomMark, labelMark, takeaway, at = 0.16) =>
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

// 1 ─ HOOK. Names the subject in the first sentence and shares "iPhone 18 Pro" with the
// title. 14 words, under the ceiling the 8s cap really means.
c.add('HOOK', 'dip', 'zoneA',
  'The iPhone 18 Pro can prove that a photograph is a photograph. Start there.',
  (A) => ({
    headline: 'iPhone 18 Pro',
    subtext: 'A camera that signs its own work',
    kicker: 'September 2026',
    variant: 'plaque',
    atWord: A(0.45),
  }));

// 2 ─ Greeting, intent, and the loop this video pays off at the end.
c.add('TITLE_CARD', 'fade', 'zoneA',
  "Welcome back. Apple's September event ran long, and the iPhone 18 Pro took the front half of it. " +
  "Today we're going through what genuinely changed since the 17 Pro, and what only looks new. " +
  'So what are you actually paying a hundred dollars more for?',
  (A) => ({
    title: 'What changed, and what did not',
    subtitle: 'iPhone 18 Pro against iPhone 17 Pro',
    atWord: A(0.4),
  }));

// 3 ─ THE HONEST OPENING. The outside is a carry-over, and saying so buys the credit to be
// believed about the parts that did move.
S('wipe', 'zoneA',
  "Start with the outside, because that's where most write-ups go wrong. That full width camera " +
  "plateau isn't new. Apple introduced it on the 17 Pro, and the 18 Pro keeps it, along with the " +
  'same body size, the same six point three inch screen and the same borders. One thing did move: ' +
  'the plateau is about two millimetres deeper, and that room is there for the new camera module.',
  (A) => ({
    headline: 'The [shape] carried over',
    kind: 'pro-back',
    caption: '150.0 by 71.9 millimetres, unchanged',
    premise: 'Same body, same screen, same plateau as the iPhone 17 Pro. Only the depth changed.',
    color: 'blue',
    cells: [
      {label: 'Camera plateau', text: 'plateau', sub: 'introduced on the 17 Pro', atWord: A(0.16)},
      {label: 'Same body', text: 'body', sub: '150.0 x 71.9 mm', atWord: A(0.40)},
      {label: 'About 2 mm deeper', text: 'lens', sub: 'room for the new module', atWord: A(0.62)},
      {label: 'Same 6.3-inch screen', text: 'screen', sub: 'and the same borders', atWord: A(0.50)},
    ],
  }));

// 4 ─ A real design change, and one almost nobody mentions.
S('fade', 'zoneB',
  'Colour is where the outside did change. Four finishes, and Burgundy is the new one, a deep red ' +
  'reading almost brown indoors. Quieter, and easier to miss: that two tone back is gone, ' +
  'so the rear glass now blends into the frame instead of sitting in a panel. Ceramic Shield covers ' +
  'front and back, which decides whether a bad drop costs you a repair or a shrug.',
  (A) => ({
    headline: 'Four [finishes], and the two-tone back is gone',
    kind: 'finish-palette',
    caption: 'Burgundy, Glacier, Silver, Black',
    premise: 'The rear glass now blends into the frame. Ceramic Shield front and back.',
    color: 'purple',
    cells: FINISHES.map((f, i) => ({...f, text: 'finish', atWord: A([0.14, 0.08, 0.10, 0.12][i])})),
  }));

// 5 ─ The front. The bezel is NOT the story; the island is.
S('push', 'zoneB',
  "The front looks identical, and mostly it is. Its screen is the same six point three inches at the " +
  'same resolution, so the borders measure exactly what they did last year. What changed sits in the ' +
  'middle of them. Dynamic Island got smaller, and it now carries three Live Activities at once, ' +
  "so a timer, a flight and a match can share it instead of taking turns. That's the one change on " +
  'this face you will actually notice.',
  (A) => ({
    headline: 'The [Dynamic Island] shrank',
    kind: 'pro-front',
    caption: 'Three Live Activities at once',
    premise: 'Same 6.3-inch panel as the 17 Pro, so the borders are unchanged. The island is not.',
    color: 'green',
    cells: [
      {label: 'Same panel', text: 'screen', sub: '2622 x 1206, unchanged', atWord: A(0.18)},
      {label: 'Same borders', text: 'body', sub: 'identical to the 17 Pro', atWord: A(0.36)},
      {label: 'Dynamic Island', text: 'island', sub: 'three Live Activities', atWord: A(0.58)},
      {label: 'A timer, a flight, a match', text: 'island', sub: 'sharing one space', atWord: A(0.70)},
    ],
  }));

// 6 ─ The aperture, open.
S('fade', 'zoneC',
  'Now the camera, and this is the real headline. Apple gave the main camera a variable aperture: six ' +
  'laser cut blades that open right up to f one point four eight. Wide open, the sensor drinks light, ' +
  "so a dim room stops looking like one. Close a stop to f one point eight and you've traded some of " +
  'that glow for a steadier edge.',
  (A) => ({
    headline: 'Six blades, [four] stops',
    kind: 'aperture-iris',
    caption: 'Wide open at f/1.48',
    premise: 'Six blades set the hole. Area follows one over N squared, so f/4 passes a fourteenth of the light f/1.48 does.',
    color: 'blue',
    cells: [
      {label: 'f/1.48', text: 'stop', value: 1.48, sub: 'widest', atWord: A(0.34)},
      {label: 'f/1.8', text: 'stop', value: 1.8, atWord: A(0.66)},
      {label: 'f/2.8', text: 'stop', value: 2.8, atWord: A(0.70)},
      {label: 'f/4', text: 'stop', value: 4, sub: 'deepest focus'},
    ],
  }));

// 7 ─ Apple's own page, on the section that says exactly this.
rec('letterbox', 'zoneC',
  "You don't have to take my word for the aperture. This is Apple's own iPhone 18 Pro page, and the " +
  'line under the lens says it outright: forty eight megapixel Fusion Main camera with variable ' +
  'aperture, improved low light photos and video, impressive depth of field.',
  'aperture-line', 'the variable aperture line', "Apple's own words for it",
  'aperture', 'aperture', 'The aperture line, in full');

// 8 ─ The aperture, shut.
S('zoom', 'zoneC',
  'Ask for f four instead and those blades close in. Less light reaches the sensor, so the exposure ' +
  'gets slower, and in exchange depth of field stretches. A landscape holds focus from the rocks ' +
  'at your feet to the hills behind, because depth of field is set by the hole and not by software.',
  (A) => ({
    headline: 'Stopped down to [f/4]',
    kind: 'aperture-iris',
    caption: 'The blades close in',
    premise: 'The same six blades, walked to the narrow end. All four stops are real positions.',
    color: 'green',
    cells: [
      {label: 'f/1.48', text: 'stop', value: 1.48, atWord: 1},
      {label: 'f/1.8', text: 'stop', value: 1.8, atWord: 2},
      {label: 'f/2.8', text: 'stop', value: 2.8, atWord: 3},
      {label: 'f/4', text: 'stop', value: 4, sub: 'deepest focus', atWord: A(0.22)},
    ],
  }));

// 9 ─ Reference Image, the loop opened in scene 1.
S('fade', 'zoneA',
  'And this is the one I did not see coming. Apple Reference Image signs a photo while the sensor is ' +
  'still reading it, and that signature binds to the pixels themselves rather than sitting in a file ' +
  'header. Copy the photo, then edit it — paint something out of the middle — and the copy stops ' +
  'matching its own signature when anything checks. So the original stays provable, and the version ' +
  'somebody altered cannot borrow that credibility.',
  (A) => ({
    headline: 'A photo that can [prove] it is a photo',
    kind: 'reference-image',
    caption: 'Signed at capture',
    premise: 'The signature is bound to the pixels, so changing them breaks it.',
    color: 'blue',
    cells: [
      {label: 'capture', text: 'capture', atWord: A(0.16)},
      {label: 'signed', text: 'sign', atWord: A(0.28)},
      {label: 'edited', text: 'edit', atWord: A(0.50)},
      {label: 'checked', text: 'check', atWord: A(0.64)},
    ],
  }));

// 10 ─ The chip: CPU.
S('slide', 'zoneB',
  'None of that runs on hope, so open the A20 Pro. Six CPU cores: two large ones Apple calls super ' +
  'cores, twenty percent faster than last year, and four efficiency cores handling the rest, because ' +
  "most of what a phone does all day is waiting. It's the first two nanometre chip in a phone, which " +
  'is how Apple could spend transistors this freely.',
  (A) => ({
    headline: 'A20 Pro: [six] CPU cores',
    kind: 'die-floorplan',
    token: 'cpu',
    caption: 'Two super cores, four efficiency',
    premise: "Apple's own floorplan. Count the blocks — the drawing has exactly as many as the chip does.",
    color: 'blue',
    cells: [
      {label: 'Super cores', text: 'cpu', sub: '20% faster', atWord: A(0.22)},
      {label: 'Efficiency cores', text: 'cpu', sub: 'four of them', atWord: A(0.42)},
      {label: 'First 2nm phone chip', text: 'io', sub: 'more transistors to spend', atWord: A(0.62)},
    ],
  }));

// 11 ─ The chip: GPU.
S('fade', 'zoneB',
  'Beside the CPU sit seven GPU cores, forty percent quicker at graphics than the A19 Pro. Each of ' +
  'those seven carries a Neural Accelerator, and together they double FP8 throughput, which is the low ' +
  'precision maths generative models lean on, so the gain lands in photo editing and in games rather ' +
  "than in a benchmark you'll never open.",
  (A) => ({
    headline: 'Seven [GPU] cores, one per column',
    kind: 'die-floorplan',
    token: 'gpu',
    caption: '40% faster graphics',
    premise: 'Seven columns on the die, seven GPU cores, each with its own Neural Accelerator.',
    color: 'green',
    cells: [
      {label: 'GPU cores', text: 'gpu', sub: '40% faster than A19 Pro', atWord: A(0.12)},
      {label: 'Neural Accelerators', text: 'gpu', sub: '2x FP8 throughput', atWord: A(0.36)},
      {label: 'Where it lands', text: 'io', sub: 'editing and games', atWord: A(0.62)},
    ],
  }));

// 12 ─ The chip: the number that actually moved.
S('iris', 'zoneC',
  "Here's the figure that actually moved. The Neural Engine went from sixteen cores to thirty two. " +
  'Both the A19 Pro and the A18 Pro carried sixteen, so this is the first real doubling in three ' +
  'years. Memory bandwidth rose fifty percent alongside it, and that pair is what lets Siri answer ' +
  'from your own mail on the phone itself. It matters because a starved core is an idle core, so ' +
  'doubling the engine without feeding it would have bought nothing at all.',
  (A) => ({
    headline: 'The Neural Engine [doubled]',
    kind: 'die-floorplan',
    token: 'neural',
    caption: '16 cores to 32',
    premise: 'Thirty-two cells drawn, thirty-two cores on the chip. A19 Pro and A18 Pro both had sixteen.',
    color: 'purple',
    cells: [
      {label: 'Neural Engine', text: 'neural', sub: '32 total cores', atWord: A(0.16)},
      {label: 'A19 Pro and A18 Pro', text: 'io', sub: 'sixteen apiece', atWord: A(0.36)},
      {label: '50% more bandwidth', text: 'io', sub: 'a starved core is idle', atWord: A(0.56)},
      {label: 'Siri, on the phone', text: 'io', sub: 'your mail stays yours', atWord: A(0.70)},
    ],
  }));

// 13 ─ Apple's page, on the chip section.
rec('letterbox', 'zoneB',
  "Apple's page puts the same numbers on the record. Scroll to the performance section and the copy " +
  'names a dual sixteen core Neural Engine and fifty percent higher memory bandwidth, right under the ' +
  'chip itself. Bandwidth is the quiet half of that pair, and it decides how fast data reaches the ' +
  'cores. A core waiting on memory is a core doing nothing, which is why Apple lists the two figures ' +
  'together rather than leading with the core count on its own.',
  'performance', 'the A20 Pro section', 'Dual 16-core, 50% more bandwidth',
  'perfhead', 'perfhead', "Apple's own claim for the A20 Pro");

// 14 ─ Sustained performance.
S('push', 'zoneA',
  'Apple showed sustained performance rather than peak, and sustained is the honest measure, because ' +
  'hitting a number for one second is easy and holding it through a long export is not. Against the ' +
  'iPhone 17 Pro, the 18 Pro holds forty percent more. Against the 16 Pro, double. A second generation ' +
  'vapor chamber underneath is what pays for that.',
  (A) => ({
    headline: 'Sustained, across [three] generations',
    kind: 'compare-bars',
    caption: "Apple's own comparison",
    premise: "Bar lengths derive from Apple's claims: 40% more than A19 Pro, twice the A18 Pro.",
    color: 'blue',
    cells: [
      {label: 'iPhone 18 Pro', text: 'bar', sub: 'A20 Pro', value: 100, atWord: A(0.30)},
      {label: 'iPhone 17 Pro', text: 'bar', sub: 'A19 Pro — 40% more', value: 71, atWord: A(0.46)},
      {label: 'iPhone 16 Pro', text: 'bar', sub: 'A18 Pro — 2x more', value: 50, atWord: A(0.60)},
    ],
  }));

// 15 ─ The vapor chamber, in Apple's own words.
rec('letterbox', 'zoneA',
  'Apple gives that its own headline further down the page: bigger vapor chamber, let the heat drop. ' +
  'The copy beside it says the packaging improves heat flow for better thermal performance, which is ' +
  'the unglamorous half of every speed claim.',
  'vapor', 'the vapor chamber section', 'The unglamorous half of speed',
  'vaporhead', 'vaporhead', 'Three times the surface area');

// 16 ─ Battery, and the two changes that ride with it.
S('slide', 'zoneA',
  "Battery moved on both models. The Pro reaches thirty six hours of video playback, up from thirty " +
  "three, and the Pro Max forty five, up from thirty nine. Charging's quicker too: fifty percent in " +
  "fifteen minutes. And the modem's Apple's own C2 now rather than a Qualcomm part, drawing about " +
  'fifteen percent less energy, so that is battery you gain without a bigger cell.',
  (A) => ({
    headline: 'Both models gained [hours]',
    kind: 'compare-bars',
    caption: 'Video playback, generation on generation',
    premise: "Apple's stated video playback figures. The Pro gains three hours, the Pro Max six.",
    color: 'green',
    cells: [
      {label: 'iPhone 18 Pro Max', text: 'bar', sub: '45 hours, was 39', value: 45, atWord: A(0.30)},
      {label: 'iPhone 18 Pro', text: 'bar', sub: '36 hours, was 33', value: 36, atWord: A(0.14)},
      {label: 'C2 modem', text: 'bar', sub: '~15% less energy', value: 15, atWord: A(0.62)},
    ],
  }));

// 17 ─ Apple's battery section.
rec('letterbox', 'zoneC',
  "Apple isn't shy about it either. Scroll to the battery section on that same page and the heading " +
  'reads, simply, best iPhone battery life. That claim is doing a lot of work for the Pro Max in ' +
  'particular, because the Max is where the six extra hours landed and the smaller Pro only gained ' +
  'three. Worth knowing which of the two that headline is really describing.',
  'battery', 'the battery section', 'Best iPhone battery life',
  'batthead', 'batthead', 'The battery figure, on the page', 0.08);

// 18 ─ The ladder.
S('fade', 'zoneB',
  'So what does the iPhone 18 Pro cost? Two hundred and fifty six gigabytes starts at eleven ninety ' +
  'nine. Then the rungs get steep. Two hundred dollars takes you to five twelve, four hundred more ' +
  'buys a terabyte, and two terabytes costs six hundred on top of that. Every step up that ladder ' +
  'costs two hundred more than the step below it.',
  (A) => ({
    headline: 'Each step costs [more] than the last',
    kind: 'price-ladder',
    caption: 'iPhone 18 Pro, US pricing',
    premise: "Read off Apple's own buy page. The chip beside each row is its difference from the row above.",
    color: 'orange',
    cells: [
      {label: '256GB', text: 'tier', value: 1199, atWord: A(0.16)},
      {label: '512GB', text: 'tier', value: 1399, atWord: A(0.40)},
      {label: '1TB', text: 'tier', value: 1799, atWord: A(0.52)},
      {label: '2TB', text: 'tier', value: 2399, atWord: A(0.64)},
    ],
  }));

// 19 ─ The turn.
S('whippan', 'zoneC',
  "And here the event got strange. Normally last year's iPhones drop in price the morning a new one " +
  'arrives. This time Apple raised every one of them by a hundred dollars on the same afternoon: the ' +
  '16, the 17, the 17e and the Air. Apple discontinued the 17 Pro and the 17 Pro Max outright, which ' +
  'means the cheapest Pro on sale is now the new one.',
  (A) => ({
    headline: 'The old iPhones got [more expensive]',
    kind: 'price-rise',
    token: '$',
    caption: 'Same day as the 18 Pro launch',
    premise: 'The grey bar is what each one used to cost. The red is the rise, on the day the new one landed.',
    color: 'orange',
    cells: [
      {label: 'iPhone Air', text: 'rise', value: 1099, sub: '999', atWord: A(0.46)},
      {label: 'iPhone 17', text: 'rise', value: 899, sub: '799', atWord: A(0.52)},
      {label: 'iPhone 16', text: 'rise', value: 799, sub: '699', atWord: A(0.58)},
      {label: 'iPhone 17e', text: 'rise', value: 699, sub: '599', atWord: A(0.64)},
    ],
  }));

// 20 ─ Why. The loop from scene 2 closes here.
S('fade', 'zoneC',
  'Memory is the reason, and the scale of it is worth seeing. A two hundred and fifty six gigabyte ' +
  'memory chip costs close to four hundred percent more than a year ago, because AI data centres are ' +
  'buying the same parts. The bill of materials rose about thirty eight percent. Your price went up ' +
  'nine, so Apple carried the rest.',
  (A) => ({
    headline: 'You pay [9%] more. Memory costs 400% more.',
    kind: 'compare-bars',
    caption: 'What actually moved',
    premise: 'Year on year. The price you pay and the cost Apple pays are not on the same scale.',
    color: 'red',
    cells: [
      {label: 'Memory chip cost', text: 'bar', sub: 'up ~400% year on year', value: 400, atWord: A(0.22)},
      {label: 'Bill of materials', text: 'bar', sub: 'up ~38% on a Pro', value: 38, atWord: A(0.44)},
      {label: 'What you pay', text: 'bar', sub: '$1,099 to $1,199', value: 9, atWord: A(0.56)},
    ],
  }));

// 21 ─ Out. Names what is next rather than repeating the subject, so the outro does not
// duplicate the opening chapter in the description (harness rule 10).
c.add('OUTRO_CTA', 'fade', 'zoneA',
  'So: the shell carried over, the camera and the chip did the work, and a hundred dollars went on ' +
  'the price because memory did. The Duo, the watches and AirPods each get their own video.',
  (A) => ({
    headline: 'Duo, the watches and AirPods next',
    subtext: 'Which one do you want first?',
    atWord: A(0.5),
  }));

const spec = {
  meta: {
    topic: 'Apple September 2026 — iPhone 18 Pro, explained',
    format: 'long',
    fps: 30,
    subject: 'iPhone 18 Pro',
    topicAxes: ['entity-novelty', 'economic-pain'],
    screenplay: 'documentary',
    onePayoff: 'what genuinely changed on the iPhone 18 Pro versus the 17 Pro, and why it costs $100 more',
    openLoop: 'What are you actually paying a hundred dollars more for?',
    analogy: 'A camera that signs its own work.',
    seo: {
      title: 'Apple September 2026 — iPhone 18 Pro, explained',
      description:
        'What actually changed on the iPhone 18 Pro versus the 17 Pro: the variable aperture, Apple ' +
        'Reference Image, the A20 Pro and the C2 modem — and what only looks new.',
      breakdown: 'the variable aperture, Apple Reference Image, the A20 Pro, and the price rise',
      pinned: 'Is a camera that can prove a photo is real worth $100 more to you?',
      tags: [
        'iPhone 18 Pro', 'iPhone 18 Pro vs 17 Pro', 'Apple September 2026', 'A20 Pro',
        'Apple Reference Image', 'variable aperture', 'iPhone 18 Pro price', 'Apple event',
      ],
      queries: [
        'what is new in iPhone 18 Pro',
        'iPhone 18 Pro vs iPhone 17 Pro',
        'what is Apple Reference Image',
        'why did iPhone prices go up',
      ],
      sources: [
        'apple.com/newsroom — iPhone 18 Pro and iPhone 18 Pro Max',
        'apple.com/iphone-18-pro and its specs page',
        'apple.com/shop/buy-iphone/iphone-18-pro',
        'Apple Accessory Design Guidelines, sheet 62.1',
      ],
    },
  },
  brand: c.brand(),
  thumbnail: {title: 'EVERYTHING THAT ACTUALLY CHANGED', badge: 'iPhone 18 Pro',
    note: 'and what only looks new', asset: 'si:apple'},
  scenes: c.S,
};

c.emit('topics/apple-18-pro/long.json', spec);
