// Apple September 2026 — AirPods 5, explained.  WIDE CUT.
//
// NARRATION IS IN DOUBLE-QUOTED STRINGS (harness rule): English narration is full of
// apostrophes and the voice guard requires them above 1.2%, so a single-quoted string
// breaks the moment the writing gets good.
//
// Every figure here comes from apple.com/airpods-5 and its specs page, read on
// 10 September 2026, or from briefs/apple/00-event-dossier.md. Nothing is remembered.
//   · bud 30.2 x 18.3 x 18.1 mm, 4.3 g · case 50.1 mm wide · IP57 · H2 chip
//   · "Up to 1.5x more Active Noise Cancellation than AirPods 4"  (apple.com/airpods)
//   · 4 h / 20 h with the standard case; 5 h / 22 h with the Wireless Charging Case;
//     5 minutes in the case is about an hour of listening
//   · $129 · $149 with the Wireless Charging Case, which is also the only model with the
//     stem swipe for volume
//
// 13 scenes: the palette needs 7 distinct sub-types (min(8, round(13*0.5))) and no
// sub-type may pass 5 (max(4, ceil(13*0.35))). airpods x5, compare-bars x2, and the
// four structural types make exactly 7.
import {cut} from '../../scripts/lib/apple-build.mjs';

const c = cut();
const S = (t, bg, n, mk, o) => c.stage(t, bg, n, mk, o);
const REC = "Apple, AirPods 5 product page, captured 10 September 2026";

// A recorded beat earns its runtime through CAMERA MOVES: in on the claim, back out to
// read the section around it, back in as the sentence lands (LAW 0f — a static frame held
// for twenty seconds is not footage).
// PAID FOR ON THIS CUT (2026-09-10). Two things, both found in stills rather than in code:
//
//  1. A ZOOM NEEDS `atWord`, AND ONLY `anchor-spec.mjs` PUTS IT THERE. `RecordedStep` reads
//     `z.atWord`; the author writes `wantAtWord`. Skip the anchor pass and every move falls
//     back to the clip's own anchor, so all three targets collapse onto one frame and the
//     camera sits PUNCHED IN on the mark for the whole beat — which is exactly the owner's
//     "I see you are not showing the official website fully". Order is not optional:
//     build -> bake-rec -> anchor-spec -> voiceover -> sync -> lint.
//
//  2. THE BEAT ENDS ON `full`, NOT ON THE MARK. A mark on a short heading is framed at the
//     deepest zoom the pipeline allows (~3.2x), which crops the PARAGRAPH under it — the
//     frame read "Noise out / Powered by advanced co" with the rest outside the frame. The
//     punch-in names the thing; the pull-back is where the sentence is actually read, so
//     that is where the beat lands. The takeaway rides in ONE callout on the beat's own
//     mark — one callout per mark is the limit (two labels cannot share one rectangle), and
//     `mark: null` is not the escape hatch CLAUDE.md describes: this component falls back to
//     the clip's whole bounding box, so an unmarked callout ends up jammed in the frame
//     corner with a leader line running to the middle of nothing. Verified in a still.
//  3. ZOOM TO A WIDE MARK ON A CENTRED PAGE. `windowFor` frames a mark from its LEADING
//     EDGE — written for terminals and code, where text starts at the left. Apple's
//     paragraphs are CENTRED, so punching into a 102px heading put the window's left edge
//     at x=600 on a paragraph that spans 478 to 1122, and the frame read "Noise out /
//     Powered by advanced co" with the rest outside it. The fix is not in the component:
//     mark the PARAGRAPH (463px wide, centred) and the window contains the whole block.
//     The heading keeps its own mark for the callout to point at.
const rec = (transition, bg, narration, step, label, caption, zoomMark, labelMark, takeaway, at = 0.14) =>
  c.add('RECORDED_STEP', transition, bg, narration, (A) => ({
    clips: [{
      ref: `rec:apple-airpods-page#${step}`, label, focus: true, atWord: A(at),
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
  "AirPods 5 cancel noise without sealing your ear shut. That's the part worth explaining.",
  (A) => ({
    headline: 'AirPods 5',
    subtext: 'Noise cancelling, open ear',
    kicker: 'September 2026',
    variant: 'plaque',
    atWord: A(0.5),
  }));

// 2 ─ Greeting, intent, loop.
c.add('TITLE_CARD', 'fade', 'zoneA',
  "Welcome back. AirPods 5 landed alongside the new iPhones, and the interesting part " +
  "isn't the sound — it's where the quiet comes from. Today we're going through the noise " +
  "cancelling, the features underneath it, and the two prices. So can you cancel noise " +
  "without plugging the hole?",
  (A) => ({
    title: 'Open ear, and still quiet',
    subtitle: 'AirPods 5, in numbers',
    atWord: A(0.4),
  }));

// 3 ─ The objects, to scale. Five parts, five anchors.
S('wipe', 'zoneA',
  "Start with the objects, because the size explains a lot of the engineering. Each bud " +
  "weighs four point three grams and stands thirty millimetres tall. The case is fifty " +
  "millimetres across, which is small enough to forget in a pocket. The lid closes over the " +
  "pair and " +
  "charges them, one light on the front is the whole readout you get, and the stem hanging " +
  "below the bud is where the microphones live — which turns out to matter more than " +
  "anything else here. All of it is rated I P fifty-seven, so dust and a sweaty run are not " +
  "a problem.",
  (A) => ({
    headline: 'A bud that weighs [4.3 grams]',
    kind: 'airpods',
    caption: 'Case 50.1 mm, bud 30.2 mm',
    premise: "Case and bud drawn to the same scale, from Apple's published dimensions.",
    color: 'blue',
    cells: [
      {label: 'The bud', text: 'bud', sub: '30.2 x 18.3 mm, 4.3 g', atWord: A(0.14)},
      {label: 'Charging case', text: 'case', sub: '50.1 mm across', atWord: A(0.26)},
      {label: 'The lid', text: 'hinge', sub: 'closes and charges', atWord: A(0.38)},
      {label: 'Status light', text: 'light', sub: 'the whole readout', atWord: A(0.46)},
      {label: 'The stem', text: 'stem', sub: 'where the mics live', atWord: A(0.56)},
    ],
  }));

// 4 ─ Apple's own claim, on Apple's own page.
rec('letterbox', 'zoneB',
  "Here's the claim, in Apple's words, on Apple's own product page. Noise out, magic in. Up " +
  "to one and a half times more active noise cancellation than AirPods 4 — and Apple calls " +
  "it the industry's best noise cancellation in an open-ear design. Read that last phrase " +
  "twice, because open-ear means there is no rubber tip sealing your ear canal, which is " +
  "the whole story of this product, and the reason it is a chip problem rather than a " +
  "foam one.",
  'noise-out', "Apple's own ANC claim", 'Noise out. Magic in.', 'noisebody', 'noisehead',
  "Apple's claim, in Apple's words");

// 5 ─ Why open-ear is the hard version of the problem.
S('push', 'zoneB',
  "So why is open ear the hard version? A sealed tip blocks sound with rubber, physically, " +
  "before any chip is involved. An open bud has no seal at all, which means every decibel " +
  "you don't hear was cancelled by computation instead.",
  (A) => ({
    headline: 'No seal means [no head start]',
    kind: 'compare-bars',
    caption: 'Where the quiet comes from',
    premise: "Apple's own relative figure: AirPods 4 as the baseline, AirPods 5 against it.",
    color: 'purple',
    cells: [
      {label: 'AirPods 5', text: 'bar', sub: 'up to 1.5x more ANC', value: 150, atWord: A(0.30)},
      {label: 'AirPods 4', text: 'bar', sub: 'the baseline', value: 100, atWord: A(0.16)},
    ],
  }));

// 6 ─ What does the cancelling: the sensors, named and explained.
S('iris', 'zoneC',
  "What does the listening, though? Two beamforming microphones face outwards — beamforming just " +
  "means the pair work out which direction a sound came from. A third microphone points " +
  "inwards, into your ear, checking what actually got through. An optical sensor knows when " +
  "the bud is in. And a second accelerometer feels your jaw move as you talk, so the H2 chip " +
  "can tell your voice from everybody else's in a noisy room.",
  (A) => ({
    headline: 'Five sensors, [one H2 chip]',
    kind: 'airpods',
    caption: 'What the H2 chip hears',
    premise: 'Dual beamforming mics, an inward mic, an optical sensor and two accelerometers.',
    color: 'green',
    cells: [
      {label: 'Two beamforming mics', text: 'stem', sub: 'they hear direction', atWord: A(0.20)},
      {label: 'Inward-facing mic', text: 'bud', sub: 'checks what got through', atWord: A(0.38)},
      {label: 'Optical in-ear sensor', text: 'bud', sub: 'knows when you wear it', atWord: A(0.50)},
      {label: 'Speech accelerometer', text: 'stem', sub: 'feels your jaw move', atWord: A(0.60)},
    ],
  }));

// 7 ─ The four things you actually use.
S('slide', 'zoneC',
  "All of that feeds four things you'll use without thinking about them. Transparency lets " +
  "the room back in, which means you still hear a platform announcement. Adaptive Audio " +
  "blends the two as your surroundings change, because a train is not a library. " +
  "Conversation Awareness drops the volume the moment you start talking. And Live " +
  "Translation runs hands-free, so a language you don't speak arrives in your ear while the " +
  "other person is still saying it, without you touching anything at all.",
  (A) => ({
    headline: 'Four modes, [no menu]',
    kind: 'airpods',
    caption: 'Transparency, Adaptive, Awareness, Translation',
    premise: 'Four listening behaviours on one pair of buds, switched by the chip, not by you.',
    color: 'blue',
    cells: [
      {label: 'Transparency', text: 'bud', sub: 'the room comes back', atWord: A(0.16)},
      {label: 'Adaptive Audio', text: 'stem', sub: 'blends the two, live', atWord: A(0.28)},
      {label: 'Conversation Awareness', text: 'stem', sub: 'drops when you speak', atWord: A(0.48)},
      {label: 'Live Translation', text: 'bud', sub: 'hands-free', atWord: A(0.64)},
    ],
  }));

// 8 ─ Apple's audio section, further down the same page.
rec('letterbox', 'zoneA',
  "Further down the same page, Apple lists what changed underneath. A redesigned multiport " +
  "acoustic architecture, a next-generation Adaptive EQ, Personalized Spatial Audio with " +
  "dynamic head tracking, and Voice Isolation, which is the one that helps the person on the " +
  "other end of a call rather than you. Four names for four separate jobs, and the section " +
  "is worth pausing on if you're deciding between these and the Pro.",
  'spatial', 'the audio section', 'What changed underneath', 'spathead', 'spathead',
  'Sound placed in the room');

// 9 ─ Two of those names, in plain English.
S('zoom', 'zoneB',
  "Two of those deserve plain English. Adaptive EQ measures what's actually reaching your " +
  "eardrum and corrects the low end for the shape of your ear, which is why a loosely " +
  "fitting bud still sounds full. And spatial audio with head tracking places the sound in " +
  "the room instead of inside your skull, so when you turn to look at something, the " +
  "dialogue stays on the screen.",
  (A) => ({
    headline: 'Sound placed in [the room]',
    kind: 'airpods',
    caption: 'Adaptive EQ and head tracking',
    premise: 'Both run inside the bud: the inward mic corrects the sound, the motion sensor anchors it.',
    color: 'purple',
    cells: [
      {label: 'Adaptive EQ', text: 'bud', sub: 'tuned to your ear', atWord: A(0.20)},
      {label: 'Personalized Spatial Audio', text: 'bud', sub: 'placed in the room', atWord: A(0.48)},
      {label: 'Dynamic head tracking', text: 'bud', sub: 'the sound stays put', atWord: A(0.62)},
    ],
  }));

// 10 ─ Battery: the first place the two models differ.
S('push', 'zoneB',
  "Battery is where the two models separate for the first time, and the gap is narrower " +
  "than the price makes it sound. With noise cancellation running, the Wireless Charging " +
  "Case pair buys you about an extra hour in the ear and two more from the case. Both do the " +
  "same trick when you're late out of the door: five minutes sitting in the case is worth " +
  "roughly an hour of listening, which in practice is the number that matters most.",
  (A) => ({
    headline: 'An hour apart, [not a day]',
    kind: 'compare-bars',
    caption: 'Hours with noise cancellation on',
    premise: "Apple's figures, ANC enabled: time in the ear, and total time with the case.",
    color: 'orange',
    cells: [
      {label: 'With the case, $149', text: 'bar', sub: '22 hours', value: 22, atWord: A(0.30)},
      {label: 'With the case, $129', text: 'bar', sub: '20 hours', value: 20, atWord: A(0.18)},
      {label: 'In the ear, $149', text: 'bar', sub: '5 hours', value: 5, atWord: A(0.44)},
      {label: 'In the ear, $129', text: 'bar', sub: '4 hours', value: 4, atWord: A(0.38)},
    ],
  }));

// 11 ─ The controls, and the one that is gated.
S('whippan', 'zoneC',
  "The controls all sit on the stem, and they're worth learning, because the alternative is " +
  "digging your phone out. Press once to play or pause, twice to skip forward, three times " +
  "to go back, and press and hold to switch listening modes. Then there's the one that isn't " +
  "on both models: on the higher-priced pair you swipe up or down the stem to change the " +
  "volume, which sounds minor until you've spent a month reaching into a pocket to turn " +
  "something down.",
  (A) => ({
    headline: 'Swipe the [stem] for volume',
    kind: 'airpods',
    caption: 'Press, hold, swipe',
    premise: 'Every control is a force sensor in the stem. The swipe ships on one model only.',
    color: 'green',
    cells: [
      {label: 'Press once, twice, three times', text: 'stem', sub: 'play, skip, back', atWord: A(0.26)},
      {label: 'Press and hold', text: 'stem', sub: 'switch listening mode', atWord: A(0.40)},
      {label: 'Swipe up or down', text: 'stem', sub: 'volume, without your phone', atWord: A(0.56)},
      {label: 'On one model only', text: 'case', sub: 'the Wireless Charging Case pair', atWord: A(0.64)},
    ],
  }));

// 12 ─ The money.
S('fade', 'zoneA',
  "Now, the money. AirPods 5 start at a hundred and twenty-nine dollars, and the Wireless " +
  "Charging Case model is a hundred and forty-nine. Twenty dollars buys wireless charging, " +
  "an extra hour of battery, and that swipe.",
  (A) => ({
    headline: 'Twenty dollars [apart]',
    kind: 'price-ladder',
    caption: 'AirPods 5, US pricing',
    premise: 'The step beside the row is the difference between the two models.',
    color: 'orange',
    cells: [
      {label: 'AirPods 5', text: 'tier', value: 129, atWord: A(0.20)},
      {label: 'With Wireless Charging Case', text: 'tier', value: 149, atWord: A(0.40)},
    ],
  }));

// 13 ─ Out.
c.add('OUTRO_CTA', 'fade', 'zoneA',
  "That's the pair: noise cancelling that works without a seal, four listening modes you " +
  "never have to switch by hand, and twenty dollars between the two models. The whole event, " +
  "in one video, is next.",
  (A) => ({
    headline: 'The whole event, next',
    subtext: 'Would you give up the seal?',
    atWord: A(0.5),
  }));

const spec = {
  meta: {
    topic: 'Apple September 2026 — AirPods 5, explained',
    format: 'long',
    fps: 30,
    subject: 'AirPods 5',
    topicAxes: ['entity-novelty', 'economic-pain'],
    screenplay: 'documentary',
    onePayoff: 'what open-ear noise cancellation means on AirPods 5, and which of the two models to buy',
    openLoop: 'Can you cancel noise without plugging the hole?',
    analogy: 'Cancelling noise with no seal to help you.',
    seo: {
      title: 'Apple September 2026 — AirPods 5, explained',
      description:
        'AirPods 5 bring Active Noise Cancellation to an open-ear design — up to 1.5x more ' +
        'than AirPods 4, per Apple. The sensors doing it, the four listening modes, the ' +
        'battery figures, and what separates the $129 and $149 models.',
      breakdown: 'open-ear noise cancellation, the sensors, spatial audio, battery, and the two prices',
      pinned: 'Would you trade a sealed tip for an open ear if the noise cancelling kept up?',
      tags: [
        'AirPods 5', 'AirPods 5 review', 'AirPods 5 price', 'AirPods 5 vs AirPods 4',
        'Apple September 2026', 'Apple event 2026', 'open-ear ANC',
        'Active Noise Cancellation', 'Personalized Spatial Audio', 'Adaptive Audio',
        'Conversation Awareness', 'Live Translation AirPods', 'AirPods stem volume',
        'AirPods 5 battery life', 'AirPods 5 specs', 'H2 chip', 'Adaptive EQ',
        'Voice Isolation', 'best earbuds 2026', 'should I buy AirPods 5',
        'AirPods 5 wireless charging case', 'Apple keynote 2026',
      ],
      queries: [
        'AirPods 5 price and features',
        'what is open-ear noise cancellation',
        'AirPods 5 vs AirPods 4',
        'AirPods 5 battery life with ANC',
      ],
      sources: [
        'apple.com/newsroom — Apple September 2026 event',
        'apple.com/airpods-5 and apple.com/airpods-5/specs',
        'apple.com/airpods-5 product page, captured 10 September 2026',
      ],
    },
  },
  brand: c.brand(),
  thumbnail: {
    title: 'EVERYTHING YOU NEED TO KNOW', badge: 'AirPods 5',
    note: 'open-ear noise cancellation', asset: 'si:apple',
  },
  scenes: c.S,
};

c.emit('topics/apple-airpods/long.json', spec);
