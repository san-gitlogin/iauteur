#!/usr/bin/env node
// CHECK-CORRECTIONS — the owner's corrections, as a test suite.
//
// WHY THIS EXISTS. Owner, 2026-09-03: *"Whatever corrections we did so far must be a
// permanent memory so that we don't end up correcting the same mistake again and again
// leading to lots of time waste."*
//
// Every entry below is a defect the OWNER found in a shipped cut, paired with the mechanism
// that now catches it. The mechanisms live in a dozen files and are easy to delete by
// accident during a refactor — a guard removed is silent, and the defect returns weeks later
// looking new. This file makes that impossible: remove a guard and the gate goes red with
// the owner's own complaint printed next to it.
//
// Two kinds of mechanism, and the distinction matters:
//   SEAL   — a script FAILS when the defect recurs (a linter rule, a gate check).
//   STRUCT — the wrong behaviour is no longer reachable in code; the marker is the comment
//            that records WHY, so deleting the reasoning is what trips this.
//
// This checks that the mechanism is PRESENT. Each one was separately break-tested by
// injecting the exact fault it was written for, on the day it was written.
//
// Usage: node scripts/check-corrections.mjs [--quiet]
import fs from 'node:fs';

const quiet = process.argv.includes('--quiet');
const has = (file, re) => fs.existsSync(file) && new RegExp(re).test(fs.readFileSync(file, 'utf8'));

const CORRECTIONS = [
  // ── the voice ──────────────────────────────────────────────────────────────
  ['the voice speed used as a pacing knob', 'SEAL',
   '"why does ava sound slow!!! it was perfect before" / "never adjust the pace of the voice to match"',
   () => has('scripts/voiceover.py', 'RATE = "\\+8%"') &&
         has('scripts/voiceover.py', 'NOT A TUNING KNOB|wrong lever|pacing is a scripting problem') &&
         fs.existsSync('scripts/check-holds.mjs')],
  ['a clip gone before it can be read', 'SEAL',
   '"the on screen typing and highlighting just flashes only for a few seconds"',
   () => has('scripts/check-holds.mjs', 'hold = \\(next anchor') &&
         has('scripts/check-holds.mjs', 'TOO FAST TO READ')],
  ['a library installed on camera and never credited', 'SEAL',
   '"you must also credit the library. If they have official git make sure to address in our video"',
   () => has('scripts/lint-spec.mjs', 'INSTALLED BUT NOT CREDITED')],
  ['a code line explained with a text label instead of a depiction', 'SEAL',
   '"the overlay component is meant to have components animated and display what the line does graphically instead of just showing text"',
   () => has('scripts/lint-spec.mjs', 'NO ANIMATED OVERLAYS')],
  ['every word timing was an evenly-spaced estimate', 'SEAL',
   '"your sync of voice narration with highlight is somewhat lacking"',
   () => has('scripts/voiceover.py', 'boundary="WordBoundary"') &&
         has('scripts/check-sync.mjs', 'Set\\(gaps\\)\\.size')],
  ['narrating that your own work is REAL', 'SEAL',
   '"Did anyone ask that you are doing all real? ... indirectly stating you are AI"',
   () => has('scripts/lint-spec.mjs', 'never narrate that your own work is REAL')],
  ['a narration truncated mid-sentence by a dropped +', 'SEAL',
   'found while writing the Fable cut; ASI makes it silent',
   () => has('scripts/lint-spec.mjs', 'sentence punctuation')],

  // ── naming the thing ───────────────────────────────────────────────────────
  ['the thumbnail never says what it is about', 'SEAL',
   '"The thumb too is horrible ... IT DOUBLED? The HOT TOPIC must be the bolder one"',
   () => has('scripts/lint-spec.mjs', 'the thumbnail never says')],
  ['the HOOK card never says what it is about', 'SEAL',
   '"this issue of this title card is persisting please correct"',
   () => has('scripts/lint-spec.mjs', 'the HOOK card never says')],
  ['a hook silhouette the copy cannot support, discarded in silence', 'SEAL',
   'hookVariant "figure" with no digit in the copy renders a different design',
   () => has('scripts/lint-spec.mjs', 'hookVariant "figure" draws a number')],

  // ── the footage ────────────────────────────────────────────────────────────
  ['footage of someone else\'s page with no source on screen', 'SEAL',
   '"at the bottom there must be a text stating the source which is very very important"',
   () => has('scripts/lint-spec.mjs', 'sourceNote so the credit is ON SCREEN')],
  ['a recording whose ink was never measured', 'SEAL',
   'overlays then land on the content, because the solver thinks the screen is empty',
   () => has('scripts/check-recordings.mjs', 'NO STEP has measured ink')],
  ['a clip cast from its LABEL instead of its footage', 'STRUCT',
   '"you speak about comparison table, but you are showing this first"',
   () => has('scripts/bake-rec.mjs', 'clip\\.shows') &&
         has('scripts/check-recordings.mjs', 'WHAT EACH CLIP SHOWS')],
  ['browser captures measured no ink at all', 'STRUCT',
   'both row selectors were VS Code\'s, so every web capture reported an empty screen',
   () => has('scripts/lib/record/runner.mjs', 'A WEB PAGE HAS NO')],
  ['a scroll delivered in one event', 'STRUCT',
   '"the scroll you are doing is not smooth, why?"',
   () => has('scripts/lib/record/browser.mjs', 'A SCROLL IS A TRAVEL')],
  ['the capture upscaled into the frame', 'STRUCT',
   '"why do I see the browser window cut?"',
   () => has('scripts/lib/record/browser.mjs', 'LAY OUT AT 1600, RENDER AT 1920')],

  // ── overlays ───────────────────────────────────────────────────────────────
  ['an overlay parked across the work instead of beside it', 'STRUCT',
   '"component overlay over the recording completely hides it ... it can be on the sides"',
   () => has('src/scenes/RecordedStep.tsx', 'A BARE SIDE PLACEMENT IS A DOCK')],
  ['a pinned card aspect around two lines of text', 'SEAL',
   'a 500x660 slab holding eleven words, over the table it annotated',
   () => has('scripts/lint-spec.mjs', 'card\\.aspect is')],
  ['a label graze priced like a collision', 'STRUCT',
   'a 3% corner touch outbid covering 30% of a column header',
   () => has('src/scenes/RecordedStep.tsx', 'clash \\* clash \\* 100')],
  ['a punch-in pulled back to a web page\'s empty margin', 'STRUCT',
   'keepLeft is a terminal rule; a page\'s left edge is margin, not the start of a line',
   () => has('src/scenes/RecordedStep.tsx', 'WHERE A LINE STARTS IS WHERE THE INK STARTS')],
  ['the hook mark clipped by its own card', 'STRUCT',
   'overflow:hidden four lines above a mark positioned to overhang',
   () => has('src/hookStage.tsx', 'THE MARK LIVES OUTSIDE THE CLIPPED CARD')],

  // ── fields nothing reads ───────────────────────────────────────────────────
  ['authored camera moves discarded on every wide cut', 'STRUCT',
   '"the screen recording is just displaying the part" — 32 of 32 zooms dropped',
   () => has('src/scenes/RecordedStep.tsx', 'AN AUTHORED MOVE IS AN INSTRUCTION')],
  ['an authored clip anchor overwritten by the solver', 'STRUCT',
   'the scroll landed three words into the next sentence',
   () => has('scripts/lib/record/anchors.mjs', 'wantAtWord')],
  ['chart series all drawing at once', 'STRUCT',
   'a two-line comparison appeared whole while the voice introduced the first line',
   () => has('src/charts/LineChart.tsx', 'ONE SWEEP PER SERIES')],
  ['a design pack silently dropping a declared field', 'SEAL',
   'moderndark drew kicker+value and never `note`; 62 such fields across 28 packs',
   () => fs.existsSync('scripts/check-field-use.mjs') &&
         has('src/designs/moderndark/scenes.tsx', 'THE NOTE IS WHAT MAKES THE NUMBER')],

  // ── the gate itself ────────────────────────────────────────────────────────
  ['a spec that the linter REJECTED rendering anyway', 'SEAL',
   '"NOTHING renders until it passes" was a written law with nothing enforcing it',
   () => has('scripts/render-topic.mjs', 'pre-render checks|does not pass the linter')],

  // ── truth and variety ──────────────────────────────────────────────────────
  ['figures on screen with no declared source', 'SEAL',
   'a PICTOGRAM row at 12 and a whole fabricated cost curve, both lint-clean',
   () => has('scripts/lint-spec.mjs', 'figures on screen and declares no')],
  ['one generic card carrying every explanatory beat', 'SEAL',
   '"Not a graph but something different. I need variations."',
   () => has('scripts/lint-spec.mjs', 'beats that explain something')],

  // ── the solver's cushion, sized for the wrong thing ────────────────────────
  // The anchor solver runs PRE-VOICE at 12 frames/word; the house voice delivers
  // 9.65. Its inter-clip cushion was 1.25 — almost exactly that 1.243 ratio — so
  // the whole cushion was spent on the systematic slip and nothing was left for
  // local word speed. Eleven clips passed the solve and were cut off mid-action
  // after sync, nine of them by under twelve frames. The cushion is the PRODUCT
  // of the two factors, and writing it as a product is what stops it being
  // re-tuned back to a single number that looks big enough.
  // ── the script described a run the viewer never sees ───────────────────────
  // The narration was written from a VERIFICATION run and the video was a separate
  // recording of the same project — same code, different dice. "Checkout failed five
  // times" over a terminal reading 7; "it chose recent_errors AND slowest_routes" over
  // footage where it chose one. Every gate passed, because `heading` captured the last
  // COMMAND and nothing had ever captured the OUTPUT.
  // ── a callout pointing at the wrong words ─────────────────────────────────
  ['a mark that resolved to the wrong rectangle', 'STRUCT',
   '"highlighting shit and explaining something that doesnt relate to whats highlighted"',
   () => has('scripts/lib/record/runner.mjs', 'covers ') &&
         has('scripts/lib/record/runner.mjs', "via \\${box.via}")],
  ['two callouts sharing one mark, one landing in empty frame', 'SEAL',
   '11 clips did it; the second label had nothing to point at',
   () => has('scripts/lint-spec.mjs', 'callouts on the single mark')],

  // ── a cached segment from a DIFFERENT spec, adopted as this one's ─────────
  // The skip test was "the file exists and is non-empty", which is true of a leftover from
  // any previous run. A 75-scene cut's segments are 6304 frames; the 76-scene cut's are
  // 6421. An orphaned remotion child (killing the wrapper does not stop it) rewrote seg-01
  // one second after `rm -rf`, and the skip adopted 6304 frames of the OLD script into the
  // middle of the new video. The frame verifier would have caught it forty minutes later
  // with no indication of the cause.
  ['a stale render segment adopted from another spec', 'STRUCT',
   'seg-01 was 6304 frames where the new cut needed 6421, and the cache said "skipping"',
   () => has('scripts/render-long.mjs', 'cached segment is') &&
         has('scripts/render-long.mjs', 'nb_read_frames')],

  // ── 2026-09-05: three complaints about the same 21-minute cut ─────────────
  ['an overlay gone before it can be read', 'STRUCT',
   '"displayed just for a second which is hard for viewer to catch" — ~1.1s legible after the fades',
   () => has('src/scenes/RecordedStep.tsx', 'TAIL_AFTER_LAST') &&
         has('src/scenes/RecordedStep.tsx', 'MIN_WINDOW')],
  ['an overlay sitting flush on the frame edge', 'STRUCT',
   '"positioning it at the very bottom without any gap from bottom" — the floor was 20*scale',
   () => has('src/scenes/RecordedStep.tsx', 'EDGE_MIN')],
  ['a label wider than its own pill, and arrows inside the node', 'STRUCT',
   '"proper padding with the content… arrows must not go inside the container"',
   () => has('src/mcpViz.tsx', 'PAD_X') && has('src/mcpViz.tsx', 'STANDOFF') &&
         has('src/mcpViz.tsx', 'edgePath')],

  // ── a whole cut shipped silent, and every number was perfect ───────────────
  // render-long guesses the voice prefix from the slug's FIRST hyphen-segment;
  // `code-an-ai-agent-with-mcp` gave `code_long`, the files were `mcpagent_long_*`,
  // so all fifty scenes fell through to anullsrc. build-audio-track printed
  // "50 silent" and then reported ✓ — because the only thing it checked was
  // DURATION, and a silent track is exactly as long as a spoken one.
  ['a video that renders and verifies perfectly with no voice in it', 'SEAL',
   'frames EXACT, drift 0ms, and 21 minutes of digital silence',
   () => has('scripts/build-audio-track.mjs', 'silentButSpoken') &&
         has('scripts/render-long.mjs', 'SILENT_DB')],

  ['a spoken figure that the footage never showed', 'SEAL',
   'the payoff beat described a different run of the same project, and nothing could see it',
   () => has('scripts/lib/record/runner.mjs', 'screenTextFor') &&
         has('scripts/bake-rec.mjs', 'clip.said') &&
         has('scripts/check-recordings.mjs', 'FIGURES SPOKEN THAT THE FOOTAGE')],

  ['a clip cut off because the cushion covered only half its job', 'STRUCT',
   'eleven clips solved clean and failed the linter after sync, nine by <12 frames',
   () => has('scripts/lib/record/anchors.mjs', 'RATE_SLIP') &&
         has('scripts/lib/record/anchors.mjs', 'LOCAL_CUSHION')],
];

let missing = [];
for (const [name, kind, quote, test] of CORRECTIONS) {
  let ok = false;
  try { ok = !!test(); } catch { ok = false; }
  if (!ok) missing.push({name, kind, quote});
  if (!quiet) console.log(`  ${ok ? '✓' : '✗'} ${kind.padEnd(6)} ${name}`);
}

if (!quiet) console.log(`CORRECTIONS CHECK: ${CORRECTIONS.length - missing.length}/${CORRECTIONS.length} owner corrections still have a live mechanism.`);

if (missing.length) {
  console.error('\n✗ CORRECTIONS CHECK FAILED — a guard the owner paid for is gone:');
  for (const m of missing) {
    console.error(`  • ${m.name}`);
    console.error(`      ${m.quote}`);
  }
  console.error('\nEach of these was a defect found in a SHIPPED video. Removing the mechanism');
  console.error('does not remove the defect — it removes the warning, and the defect comes back');
  console.error('weeks later looking new. Restore it, or if it genuinely moved, update this file');
  console.error('to point at wherever it lives now.');
  process.exit(1);
}
if (!quiet) console.log('✓ CORRECTIONS CHECK PASSED');
