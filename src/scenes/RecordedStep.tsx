import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {ClipVideo} from '../video';
import {easeInOutCubic} from '../motion/util';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// RECORDED_STEP — REAL captured footage, made to obey the VOICE.
//
// This is the component the whole recording subsystem exists for. A demo is captured
// once as N segments (one per authored step) plus a manifest; this plays segment k
// starting at ITS OWN narration word and then FREEZES on its last frame until the
// voice reaches the next word. That is the entire mechanism:
//
//     footage is captured on the machine's clock, and replayed on the narrator's.
//
// Consequences, all deliberate:
//  · Rewrite the narration and the demo re-paces itself. Nothing is re-captured.
//  · A segment that finishes early HOLDS instead of running dry — no dead frame,
//    and no "animation still going while the voice moved on" (LAW 0i, the 2026-08-17
//    owner verdict). The freeze is the fix for the opposite failure too: the voice
//    can never arrive before the picture, because the picture waits for it.
//  · There is NO fixed frame interval in this file. Every moment resolves from an
//    element's own `atWord` through `wordToFrame` (LAW 0i.1). The only constants are
//    cosmetic fades measured from an anchor, never step timing.
//
// Authoring is `rec:<slug>#<step>`; `scripts/bake-rec.mjs` resolves that against the
// capture manifest into `src` + `frames` + `bbox` before render. An unbaked `rec:`
// reference is a hard lint failure — it must never reach the renderer.
export const RecordedStep: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.recordedStep;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const clips = (d.clips ?? []).slice(0, 8);
  if (!clips.length) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const accent = sem(d.color ?? 'blue');
  const rad = 14 * scale * t.style.cornerRadius;

  // BASE ≤38 — the frame (chrome, headline, premise) exists from here, so nothing
  // pops in later. Matches the convention every stepping component uses.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  // Each segment starts at its OWN spoken word. No intervals, no fallback spacing
  // that could drift: an unanchored clip inherits the base so it is visible rather
  // than invisible, and the linter is what refuses to ship it.
  const starts = clips.map((c) => (c.atWord != null ? wordToFrame(c.atWord) : base));

  // The active segment is the last one whose word has been spoken.
  let active = 0;
  for (let i = 0; i < clips.length; i++) if (frame >= starts[i]) active = i;

  const cur = clips[active];
  const curStart = starts[active];
  const curFrames = Math.max(1, Number(cur.frames ?? 1));
  // How far into its own footage this segment is, and whether it has run out and is
  // now HOLDING for the voice. `held` drives the honest on-screen "holding" state.
  const into = frame - curStart;
  const held = into >= curFrames;

  const capW = Number(d.capture?.width ?? 960);
  const capH = Number(d.capture?.height ?? 540);

  // ── THE VIEW WINDOW ────────────────────────────────────────────────────────
  // A rectangle in CAPTURE space that the stage shows. Everything — the wide cut, the
  // vertical cut, and the focus punch-in — is one calculation over this window, which
  // replaced three separate transform hacks that each had their own bug.
  //
  // PAID FOR (LAW 0o, "the CONST must never be the binding term"): the stage used to be
  // `vertical ? 980 : 1180` wide with its height derived from the capture aspect. In 9:16
  // that drew a 16:9 strip ~608px tall inside a 1920px frame — the picture floating in a
  // pane three times its height, the exact "patty inside a burger" defect. A vertical cut
  // must CROP the capture to a portrait window, not letterbox it.
  // The headline sits HIGHER and taller in 9:16, so a single constant put the premise
  // straight on top of it (LAW 0o: "the top and bottom are getting overlapped with the
  // content inside"). Measured from a vertical still, not guessed.
  const headH = (scene.data.headline ? (vertical ? 300 : 150) : 40) * scale;
  // Reserve for EVERYTHING the column carries, including the keycap row — LAW 0o: a
  // pane measures itself. Adding the keycaps without counting them shrank the budget's
  // denominator and pushed the premise up into the headline.
  // Reserved if ANY clip has keys, so the stage does not resize between steps.
  const anyKeys = clips.some((c) => (c.keys ?? []).length > 0);
  // SPLIT puts the demo's own steps beside the footage instead of under it. Only in
  // WIDE: in 9:16 there is no width to give away, and the legibility fight is already
  // the hard one there.
  const split = d.layout === 'split' && !vertical;
  const sideW = split ? 430 * scale : 0;
  // When the rail moves into the side panel it stops costing vertical space, so the
  // footage gets that height back.
  const chromeH = (d.premise ? 96 : 0) + (d.caption ? 52 : 0) + (anyKeys ? 62 : 0) + (split ? 0 : 66) + 80;
  const availW = ((vertical ? 1010 : 1220) * scale) - sideW;
  const availH = ((vertical ? 1920 : 1080) * scale) - headH - chromeH * scale;

  // The stage fills the space it is given, capped by the capture's own aspect in wide
  // (never upscale a 16:9 capture past its width) and free to go portrait in vertical.
  const stageW = Math.min(availW, vertical ? availW : (availH * capW) / capH);
  // In 9:16, do NOT let the stage take the whole column. A 16:9 capture has no portrait
  // region that holds a terminal at readable size AND fills a 0.65 aspect, so the surplus
  // comes back as a dead band of empty editor above the content. Capping the stage at a
  // squarish 0.8 gives the window a shape the capture can actually satisfy, and hands the
  // reclaimed height to the rail and caption.
  const MIN_ASPECT = 0.8;
  const stageH = Math.min(availH, vertical ? Math.min(availH, stageW / MIN_ASPECT) : (stageW * capH) / capW);
  const stageAspect = stageW / stageH;

  const bb = cur.bbox;
  // Punching in is not optional in either NARROW case, and for the same reason: the
  // footage no longer has the width to carry a whole 16:9 screen legibly.
  //  · VERTICAL — a 16:9 capture on a phone is unreadable whole.
  //  · SPLIT    — giving a third of the frame to the side panel shrinks the footage by the
  //    same third. Measured on the first split render: the terminal became unreadable, which
  //    would have made `split` a downgrade rather than a tool. Focusing is what pays for the
  //    width the panel takes.
  // A clip with a bbox therefore focuses by default in both; `focus: false` opts out.
  const autoFocus = vertical || split;
  const wantFocus = Boolean(bb) && (cur.focus === true || (autoFocus && cur.focus !== false));

  // The window we would show with no focus at all: the whole capture, cropped to the
  // stage's aspect so nothing is letterboxed.
  const fullW = Math.min(capW, capH * stageAspect);
  const fullH = Math.min(capH, capW / stageAspect);
  const wide = {x: (capW - fullW) / 2, y: (capH - fullH) / 2, w: fullW, h: fullH};

  // Turn ANY rectangle in capture space into the view window that frames it.
  // COVER, not contain: take the SMALLER of the two candidate windows, so the region
  // FILLS the stage in one axis and is cropped in the other.
  // PAID FOR TWICE. Taking the larger window (contain) means a wide, short target — a
  // terminal panel, the shape that matters most — produces a window nearly as big as the
  // whole capture, i.e. no punch-in and unreadable type. Measured: a 1252x300 bbox in a
  // 1600x900 capture asked for a 1477px window, 92% of the frame.
  // The floor stops the opposite failure: a one-line target blowing up into mush
  // (LAW 0o rule 6 — space comes from carrying less, never from unreadable scale), and it
  // is tighter in 9:16/split because those hold LESS CONTENT, not smaller type.
  const windowFor = (r?: {x: number; y: number; w: number; h: number}) => {
    if (!r) return wide;
    const bw = Math.max(1, Number(r.w));
    const bh = Math.max(1, Number(r.h));
    let winW = Math.max(Math.min(bw * 1.18, bh * stageAspect * 1.18), capW / (vertical || split ? 4.2 : 3.2));
    let winH = winW / stageAspect;
    if (winH > capH) { winH = capH; winW = winH * stageAspect; }
    if (winW > capW) { winW = capW; winH = winW / stageAspect; }
    // FRAME FROM THE LEADING EDGE, not the centre. Text reads left-to-right, so a narrow
    // target that is CENTRED splits the empty space evenly either side — measured on the
    // first zoom-to-a-line render: a third of the stage was blank editor to the left of the
    // words. Sitting the target near the left with room after it shows the line AND what
    // follows it, which is what a viewer is actually reading.
    // A target WIDER than the window still anchors its own left edge (same reason).
    const LEAD_MARGIN = 0.12;
    let cx = bw > winW
      ? Number(r.x) + winW / 2
      : Number(r.x) - winW * LEAD_MARGIN + winW / 2;
    let cy = bh > winH ? Number(r.y) + winH / 2 : Number(r.y) + bh / 2;
    cx = Math.min(Math.max(cx, winW / 2), capW - winW / 2);
    cy = Math.min(Math.max(cy, winH / 2), capH - winH / 2);
    return {x: cx - winW / 2, y: cy - winH / 2, w: winW, h: winH};
  };

  // ── THE ZOOM TIMELINE ───────────────────────────────────────────────────────
  // A clip used to get ONE focus for its whole duration, which cannot teach a step that
  // has two things worth looking at: the line you typed AND the output it produced. A clip
  // now carries a SEQUENCE of zoom moves, each on its OWN spoken word (LAW 0i.1), so the
  // camera can go to the code, then the output, then back out — while the footage under it
  // is the same frozen frame.
  //
  //   "zooms": [{"mark": "greeting", "atWord": 14}, {"at": "full", "atWord": 22}]
  //
  // Entry 0 is always the clip's own default, so a clip with no `zooms` behaves exactly as
  // before. `mark` points at a rectangle the RUNNER measured; `at: "full"` pulls back out.
  const targets = [{at: curStart, win: wantFocus ? windowFor(bb) : wide}];
  for (const z of cur.zooms ?? []) {
    const at = wordToFrame(z.atWord ?? cur.atWord ?? 1);
    const r = z.at === 'full' ? undefined : (z.mark ? cur.marks?.[z.mark] : bb);
    targets.push({at, win: z.at === 'full' ? wide : windowFor(r)});
  }
  targets.sort((a, b) => a.at - b.at);

  let zi = 0;
  for (let i = 0; i < targets.length; i++) if (frame >= targets[i].at) zi = i;
  const from = targets[Math.max(0, zi - 1)].win;
  const to = targets[zi].win;
  // Ease into each move so it reads as a camera, not a cut. The 18-frame ramp is a
  // COSMETIC constant measured from the move's own anchor — never step timing.
  // EASED, not linear. A linear camera move starts and stops abruptly and reads as a
  // slide; easeInOutCubic (the repo's own curve, src/motion/util) accelerates and settles,
  // which is what makes a push feel like a camera rather than a transform. The 18-frame
  // ramp is COSMETIC and measured from the move's own anchor — never step timing.
  const fzRaw = interpolate(frame, [targets[zi].at, targets[zi].at + 18], [0, 1], clamp);
  const fz = easeInOutCubic(fzRaw);
  const lerp = (a: number, b: number) => a + (b - a) * fz;
  const view = {
    x: lerp(from.x, to.x),
    y: lerp(from.y, to.y),
    w: lerp(from.w, to.w),
    h: lerp(from.h, to.h),
  };

  // How much the capture is scaled to make `view` fill the stage, and where that puts
  // the capture's top-left. Overlays live in the same scaled box, so a bbox in capture
  // space maps to the right pixels with no extra maths.
  const k = stageW / view.w;
  const innerW = capW * k;
  const innerH = capH * k;
  const innerX = -view.x * k;
  const innerY = -view.y * k;

  const mono = t.fonts.mono;

  return (
    <AbsoluteFill style={{background: t.colors.bg}}>
      {scene.data.headline ? <Headline text={String(scene.data.headline)} color={d.color ?? 'blue'} startFrame={base} /> : null}

      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16 * scale,
          paddingTop: headH,
          paddingBottom: 40 * scale,
          opacity: appear,
        }}
      >
        {/* THE STANDING SETUP (LAW 0l) — what the viewer is looking at, on screen
            for the whole beat, unanchored. */}
        {d.premise ? (
          <div
            style={{
              maxWidth: stageW,
              fontFamily: t.fonts.body,
              fontSize: 21 * scale,
              lineHeight: 1.42,
              color: hexA(t.colors.text, 0.82),
              textAlign: 'center',
            }}
          >
            {d.premise}
          </div>
        ) : null}

        {/* footage, and — when split — the demo's own steps beside it */}
        <div style={{display: 'flex', gap: split ? 22 * scale : 0, alignItems: 'stretch'}}>
        <div
          style={{
            width: stageW,
            height: stageH,
            borderRadius: rad,
            overflow: 'hidden',
            position: 'relative',
            border: `${2 * scale}px solid ${hexA(accent, held ? 0.5 : 0.8)}`,
            boxShadow: `0 ${18 * scale}px ${46 * scale}px ${hexA('#000000', 0.45)}`,
            background: t.colors.panel,
          }}
        >
          {/* THE SCALED CAPTURE BOX. Absolute size and offset rather than a transform:
              the whole capture is laid out at scale `k` and slid so `view` sits in the
              stage. Overlays are children of this box, so a rectangle in capture space
              maps to the right pixels by percentage alone — which removed three separate
              transform bugs (origin, centring and stroke compensation). */}
          <div
            style={{
              position: 'absolute',
              left: innerX,
              top: innerY,
              width: innerW,
              height: innerH,
            }}
          >
            {/* Sequence.from = this segment's OWN anchor, so the clip's internal
                time starts at 0 exactly when its word is spoken. endBehavior
                'freeze' holds the last decoded frame once the footage runs out. */}
            <Sequence from={curStart} layout="none">
              <ClipVideo
                src={cur.src}
                fit="cover"
                muted
                endBehavior="freeze"
                placeholderLabel={cur.src ? 'CLIP MISSING' : 'NOT BAKED'}
                style={{background: t.colors.panel}}
              />
            </Sequence>
          {/* CALLOUTS — a label and a leader line pointing at a rectangle the RUNNER
              MEASURED, never a hand-placed pixel. Each appears at its OWN spoken word, so
              a single held frame can be annotated three times as the voice works through
              it. Drawn in capture space and scaled with the stage, so the arrow still
              lands if the capture size or the stage size changes.
              They ride INSIDE the zoom container so a punch-in carries them along. */}
          {(cur.callouts ?? []).slice(0, 4).map((co, i) => {
            const start = wordToFrame(co.atWord ?? cur.atWord ?? 1);
            if (frame < start) return null;
            const t0 = interpolate(frame, [start, start + 12], [0, 1], clamp);
            const target = (co.mark && cur.marks?.[co.mark]) || bb;
            if (!target) return null;
            const tx = Number(target.x) + Number(target.w) / 2;
            const ty = Number(target.y) + Number(target.h) / 2;
            // Default side: prefer the SIDE, not above/below. The things worth pointing
            // at are lines of text in a stacked pane — terminal rows, editor lines — so a
            // label placed above lands squarely on the previous line and hides it
            // (measured: "this line is new" covered "Hello, iAuteur!"). There is almost
            // always empty space to the right of a line of text; use it. Fall back to
            // above/below only when the target really is near the right edge.
            const rightEdge = Number(target.x) + Number(target.w);
            const side = co.side ?? (
              rightEdge < capW * 0.62 ? 'right'
                : Number(target.x) > capW * 0.38 ? 'left'
                  : ty > capH * 0.55 ? 'top' : 'bottom');
            const gap = 34 / k * (stageW / 1000); // keep the leader a constant on-screen length
            const lx = side === 'left' ? Number(target.x) - gap : side === 'right' ? Number(target.x) + Number(target.w) + gap : tx;
            const ly = side === 'top' ? Number(target.y) - gap : side === 'bottom' ? Number(target.y) + Number(target.h) + gap : ty;
            const c = sem(co.color ?? d.color ?? 'blue');
            const glow = t.style.glow;
            // Stroke the outline on over ~14 frames from this callout's OWN anchor.
            const draw = easeInOutCubic(interpolate(frame, [start, start + 14], [0, 1], clamp));
            const perim = 2 * (Number(target.w) + Number(target.h)) + 40;
            return (
              <AbsoluteFill key={`co-${active}-${i}`} style={{pointerEvents: 'none', opacity: t0}}>
                <svg width="100%" height="100%" viewBox={`0 0 ${capW} ${capH}`} preserveAspectRatio="none">
                  {/* NEON HIGHLIGHT. The glow amount is a THEME TOKEN (t.style.glow), the
                      same one NeonText uses, so a flat design pack degrades to a clean
                      outline instead of shipping a glow that fights its grammar.
                      The box DRAWS ON rather than appearing: a dash offset that retracts
                      over ~14 frames from the callout's own anchor. A pulse would keep
                      moving after the point is made (LAW 0h is about exactly that kind of
                      standing distraction); a draw-on lands once and then holds. */}
                  <rect
                    x={Number(target.x) - 4}
                    y={Number(target.y) - 4}
                    width={Number(target.w) + 8}
                    height={Number(target.h) + 8}
                    rx={6}
                    fill={glow > 0 ? hexA(c, 0.1 * t0) : 'none'}
                    stroke={c}
                    strokeWidth={3 / k}
                    strokeDasharray={perim}
                    strokeDashoffset={perim * (1 - draw)}
                    style={glow > 0
                      ? {filter: `drop-shadow(0 0 ${6 * glow}px ${hexA(c, 0.9)}) drop-shadow(0 0 ${16 * glow}px ${hexA(c, 0.5)})`}
                      : undefined}
                  />
                  <line
                    x1={tx} y1={ty}
                    x2={tx + (lx - tx) * draw} y2={ty + (ly - ty) * draw}
                    stroke={c} strokeWidth={3 / k} strokeLinecap="round"
                    style={glow > 0 ? {filter: `drop-shadow(0 0 ${5 * glow}px ${hexA(c, 0.8)})`} : undefined}
                  />
                  <circle cx={tx} cy={ty} r={(5 / k) * draw} fill={c} />
                </svg>
                {co.text ? (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(lx / capW) * 100}%`,
                      top: `${(ly / capH) * 100}%`,
                      // Anchor the label by the edge that faces the target, so it never
                      // sits on top of what it is pointing at.
                      // NO scale compensation. The label is HTML inside the scaled BOX,
                      // not inside the SVG's user-unit space, so its font-size is already
                      // in real pixels. The old `1/zoom` factor was correct when the
                      // container was transform-scaled; carried over to the view-window
                      // model it shrank the label to unreadable at high punch-in.
                      // (SVG strokes DO still divide by k — those are in user units.)
                      transform:
                        side === 'right' ? 'translate(0, -50%)'
                          : side === 'left' ? 'translate(-100%, -50%)'
                            : side === 'top' ? 'translate(-50%, -100%)'
                              : 'translate(-50%, 0)',
                      transformOrigin:
                        side === 'right' ? 'left center'
                          : side === 'left' ? 'right center'
                            : side === 'top' ? 'bottom center' : 'top center',
                      background: c,
                      color: t.colors.bg,
                      fontFamily: t.fonts.mono,
                      fontSize: 17 * scale,
                      fontWeight: 700,
                      padding: `${5 * scale}px ${11 * scale}px`,
                      borderRadius: 6 * scale,
                      whiteSpace: 'nowrap',
                      boxShadow: `0 ${4 * scale}px ${14 * scale}px ${hexA('#000000', 0.5)}`,
                    }}
                  >
                    {String(co.text).slice(0, 64)}
                  </div>
                ) : null}
              </AbsoluteFill>
            );
          })}

          </div>

          {/* SPOTLIGHT — dim everything except the bbox the runner reported. Only
              when the step asks for it and is not already punched in. */}
          {bb && cur.spotlight && !wantFocus ? (
            <AbsoluteFill style={{pointerEvents: 'none'}}>
              <svg width="100%" height="100%" viewBox={`0 0 ${capW} ${capH}`} preserveAspectRatio="none">
                <defs>
                  <mask id={`sp-${active}`}>
                    <rect x="0" y="0" width={capW} height={capH} fill="white" />
                    <rect
                      x={Number(bb.x)}
                      y={Number(bb.y)}
                      width={Number(bb.w)}
                      height={Number(bb.h)}
                      rx={10}
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width={capW}
                  height={capH}
                  fill={hexA('#000000', 0.62 * fz)}
                  mask={`url(#sp-${active})`}
                />
                <rect
                  x={Number(bb.x)}
                  y={Number(bb.y)}
                  width={Number(bb.w)}
                  height={Number(bb.h)}
                  rx={10}
                  fill="none"
                  stroke={accent}
                  strokeWidth={3}
                  opacity={fz}
                />
              </svg>
            </AbsoluteFill>
          ) : null}
        </div>

        {/* THE SIDE PANEL — the demo's OWN steps, read down the side. It is built from the
            same clip list the rail uses, so it can never disagree with what was recorded:
            each row is a step, ticked once its word has been spoken, and the ACTIVE row
            carries that step's callout text at readable size. This is the "side by side"
            case: a wide capture with a small region of interest and a lot to say.
            Every row resolves from its own `atWord` — no fixed interval (LAW 0i.1). */}
        {split ? (
          <div
            style={{
              width: sideW - 22 * scale,
              display: 'flex',
              flexDirection: 'column',
              gap: 10 * scale,
              justifyContent: 'safe center',
            }}
          >
            {clips.map((c, i) => {
              const on = i === active;
              const done = frame >= starts[i];
              const note = on ? (c.callouts ?? []).find((co) => frame >= wordToFrame(co.atWord ?? c.atWord ?? 1)) : null;
              return (
                <div
                  key={i}
                  style={{
                    padding: `${10 * scale}px ${13 * scale}px`,
                    borderRadius: 10 * scale * t.style.cornerRadius,
                    background: on ? hexA(accent, 0.16) : hexA(t.colors.text, done ? 0.05 : 0.02),
                    borderLeft: `${3 * scale}px solid ${on ? accent : hexA(t.colors.text, done ? 0.22 : 0.08)}`,
                    opacity: done ? 1 : 0.45,
                  }}
                >
                  <div style={{display: 'flex', gap: 8 * scale, alignItems: 'baseline'}}>
                    <span style={{fontFamily: mono, fontSize: 14 * scale, color: done ? accent : hexA(t.colors.text, 0.4)}}>
                      {done ? '✓' : String(i + 1)}
                    </span>
                    <span style={{fontFamily: t.fonts.body, fontSize: 19 * scale, color: t.colors.text, fontWeight: on ? 700 : 400}}>
                      {String(c.label ?? c.id ?? 'step')}
                    </span>
                  </div>
                  {note?.text ? (
                    <div style={{marginTop: 6 * scale, fontFamily: t.fonts.body, fontSize: 16 * scale,
                                 lineHeight: 1.35, color: hexA(t.colors.text, 0.85)}}>
                      {String(note.text)}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
        </div>

        {/* KEYCAPS — the chord the RUNNER ACTUALLY PRESSED for this step, drawn as keys.
            Recorded at capture time (`keys` in the manifest), never hand-authored, so it
            cannot drift from the take: if the demo stops pressing Ctrl+S, the keycaps stop
            saying Ctrl+S. This is the one overlay that answers "what did you just DO",
            which a screen recording otherwise leaves invisible. */}
        {anyKeys ? (() => {
          if (!(cur.keys ?? []).length) return <div style={{height: 44 * scale}} />;
          const kStart = wordToFrame(cur.keysAtWord ?? cur.atWord ?? 1);
          if (frame < kStart) return null;
          const kp = interpolate(frame, [kStart, kStart + 10], [0, 1], clamp);
          return (
            <div style={{display: 'flex', gap: 8 * scale, alignItems: 'center', opacity: kp}}>
              {(cur.keys ?? []).map((key, i) => (
                <React.Fragment key={i}>
                  {i > 0 ? (
                    <span style={{fontFamily: mono, fontSize: 20 * scale, color: hexA(t.colors.text, 0.5)}}>+</span>
                  ) : null}
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 20 * scale,
                      fontWeight: 700,
                      color: t.colors.text,
                      background: hexA(t.colors.text, 0.09),
                      border: `${1.5 * scale}px solid ${hexA(t.colors.text, 0.28)}`,
                      // a key has a bottom edge — that is what makes it read as a KEY
                      borderBottomWidth: `${4 * scale}px`,
                      borderRadius: 7 * scale,
                      padding: `${5 * scale}px ${13 * scale}px`,
                      // spring in: the cap "presses" as it appears
                      transform: `translateY(${(1 - kp) * -6 * scale}px)`,
                    }}
                  >
                    {String(key)}
                  </span>
                </React.Fragment>
              ))}
            </div>
          );
        })() : null}

        {/* step rail — which step of the demo this is, and its plain-English note.
            Hidden when split, because the side panel already carries the steps. */}
        {split ? null : <div style={{display: 'flex', gap: 8 * scale, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', maxWidth: stageW}}>
          {clips.map((c, i) => {
            const on = i === active;
            const done = frame >= starts[i];
            return (
              <div
                key={i}
                style={{
                  fontFamily: mono,
                  fontSize: 15 * scale,
                  padding: `${5 * scale}px ${11 * scale}px`,
                  borderRadius: 999,
                  color: on ? t.colors.bg : hexA(t.colors.text, done ? 0.75 : 0.34),
                  background: on ? accent : hexA(t.colors.text, done ? 0.1 : 0.04),
                  border: `${1 * scale}px solid ${on ? accent : hexA(t.colors.text, 0.12)}`,
                }}
              >
                {i + 1}. {String(c.label ?? c.id ?? 'step')}
              </div>
            );
          })}
        </div>}

        {d.caption ? (
          <div
            style={{
              fontFamily: t.fonts.body,
              fontSize: 22 * scale,
              color: hexA(t.colors.text, 0.9),
              textAlign: 'center',
              maxWidth: stageW,
            }}
          >
            {d.caption}
          </div>
        ) : null}
      </AbsoluteFill>

      {scene.data.source ? <SourceFooter text={String(scene.data.source)} /> : null}
    </AbsoluteFill>
  );
};
