import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useTheme, wordToFrame} from './themes';
import {SemColor, AirllmStageItem} from './types';
import {useScale, useSem, hexA} from './ui';
import {UnknownKind} from './unknownKind';
import {arriveAt, travelAt, landAt, stagger} from './motion/system';

/**
 * AIRLLM depictions — the drawn beats of the AirLLM video.
 *
 * WHY A NEW FILE (LAW 0e.8, LAW 0n). Every beat in this cut is an ARGUMENT about size and
 * time: a model that will not fit, a stack of identical layers, a ceiling set by the largest
 * single piece rather than the total, a number of bytes divided by a read speed, and the
 * point at which streaming starts to be worth its price. Each of those has a card-shaped
 * answer that would be a caption, so each `kind` below names an OBJECT and moves it:
 *
 *   wall       a slab of weights travelling at a doorway sized to the machine's memory
 *   floors     a tower of identical floors with a lift that only ever carries one
 *   ceiling    file bars, and a ceiling line that settles on the TALLEST, not the sum
 *   pipe       bytes crossing a cable per word, and the clock that division implies
 *   crossover  model sizes along an axis, with this machine's memory drawn across it
 *   road       one function call forking into two code paths, and which one a Mac takes
 *
 * Swap every label for lorem and not one of these still reads as a card — which is the test
 * LAW 0n asks for before a component is written.
 *
 * EVERY MOMENT COMES FROM A WORD (LAW 0i.1). There is no fixed frame interval in this file:
 * each element resolves its own frame from its own `atWord` through `F()`. `stagger()` is
 * used only WITHIN one element that arrives as a single thing (the bricks of one slab).
 *
 * EVERY NUMBER IS AUTHORED (LAW 0m.2). Gigabytes, megabytes per second and seconds all
 * arrive on the items; `briefs/airllm/FACTS.md` records where each one was measured. This
 * file computes only geometry.
 *
 * BASE <= 38 FRAMES (component_authoring §2). The furniture of every picture — the doorway,
 * the tower, the axis, the cable — is on screen within 38 frames whatever the anchors say.
 * Only the payoff waits for its word.
 */

/**
 * SIZE TO THE PANE, NOT TO A CONSTANT (LAW 0n corollary, measured 2026-09-26).
 *
 * Every size below was first written as `Math.min(pane * f, CONST)`, where the constant was meant
 * as a CEILING for a crowded beat. On the real content the constant was the BINDING term in five
 * of six pictures: `ceiling` drew 120px bars into a 1760px pane, `wall` a 230px doorway into 930px
 * of height, `floors` a 300px tower against 1760px of width. The frames came back as small
 * diagrams floating in black — the "patty inside a burger" the owner has rejected before, and
 * invisible in code review because each line looks like a sensible clamp.
 *
 * So the rule here: the FIRST term is the pane share and it is what normally wins; the constant
 * only exists to stop a two-item beat becoming a billboard, and it is set well above the pane
 * share at 1920x1080 so it cannot bind in the ordinary case.
 */

const F = (w?: number) => (w == null ? 0 : wordToFrame(w));
/** The base furniture may never wait for a late anchor. */
const BASE = (w?: number) => Math.min(F(w ?? 1), 38);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const useV = (accent: SemColor) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  return {
    t, sem, scale, vertical,
    a: sem(accent),
    s: (n: number) => n * scale,
    rad: (n = 12) => n * scale * t.style.cornerRadius,
    glow: (c: string, n = 24) => (t.style.glow > 0 ? `0 0 ${n * scale * t.style.glow}px ${hexA(c, 0.55)}` : 'none'),
  };
};
type V = ReturnType<typeof useV>;

export interface AirllmVizProps {items: AirllmStageItem[]; accent: SemColor; token?: string; w: number; h: number}

const pick = (items: AirllmStageItem[], group: string) => items.filter((i) => i.group === group);
const one = (items: AirllmStageItem[], group: string) => items.find((i) => i.group === group);

/** A caption that belongs to an object — never a box around it. */
const Cap: React.FC<{v: V; title?: string; sub?: string; on?: number; align?: 'left' | 'center' | 'right';
  size?: number; color?: string; mono?: boolean}> =
  ({v, title, sub, on = 1, align = 'center', size = 26, color, mono}) => (
    <div style={{textAlign: align, opacity: on, transform: `translateY(${(1 - on) * v.s(8)}px)`}}>
      {title ? <div style={{fontFamily: mono ? v.t.fonts.mono : v.t.fonts.display,
        fontWeight: mono ? 400 : (v.t.style.displayWeight as any),
        letterSpacing: mono ? 0 : v.t.style.displayTracking, fontSize: v.s(size), lineHeight: 1.14,
        color: color ?? v.t.colors.text}}>{title}</div> : null}
      {sub ? <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(size * 0.6), lineHeight: 1.34,
        color: v.t.colors.muted, marginTop: v.s(5)}}>{sub}</div> : null}
    </div>
  );

/** A value chip in the theme's mono face — a size, a rate, a verdict. */
const Chip: React.FC<{v: V; text: string; on: number; color: string; size: number; solid?: boolean}> =
  ({v, text, on, color, size, solid}) => (
    <div style={{
      opacity: on, transform: `translateY(${(1 - on) * v.s(10)}px)`,
      padding: `${size * 0.32}px ${size * 0.62}px`, borderRadius: v.rad(8),
      background: solid ? hexA(color, 0.2) : hexA(v.t.colors.muted, 0.08),
      border: `${Math.max(1, v.s(solid ? 2 : 1))}px solid ${hexA(color, solid ? 0.95 : 0.34)}`,
      boxShadow: solid ? v.glow(color, 16) : 'none',
      fontFamily: v.t.fonts.mono, fontSize: size, lineHeight: 1.1, whiteSpace: 'nowrap',
      color: solid ? v.t.colors.text : v.t.colors.muted,
    }}>{text}</div>
  );

/* ────────────────────────────────────────────────────────────────────────────
   WALL — a slab of weights travels at a doorway cut to the machine's memory.
   The doorway is the argument: it is a WIDTH, and the slab either passes or does not.
   ──────────────────────────────────────────────────────────────────────────── */
const Wall: React.FC<AirllmVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const door = one(items, 'door');
  const slab = one(items, 'slab');
  const verdict = one(items, 'verdict');
  if (!door || !slab) return null;

  const doorGB = door.value ?? 18;
  const slabGB = slab.value ?? 141;
  const fits = slabGB <= doorGB;

  const wallOn = arriveAt(frame, BASE(door.atWord));
  const slabOn = arriveAt(frame, F(slab.atWord));
  const push = travelAt(frame, F(slab.atWord) + 8, 30);
  const vOn = verdict ? landAt(frame, F(verdict.atWord)) : 0;

  // Geometry: the wall stands in the right third; the slab starts off the left edge and
  // travels until its leading face meets the frame — or passes through, when it fits.
  const wallX = w * 0.62;
  const doorH = Math.max(h * 0.5, Math.min(h * 0.62, v.s(560)));
  // The doorway's height IS the machine's memory; the slab's height IS the model.
  const slabH = Math.min(h * 0.72, doorH * (slabGB / Math.max(doorGB, 1)));
  const slabW = Math.min(w * 0.26, v.s(620));
  const travel = fits ? wallX + slabW * 0.4 : wallX - slabW - v.s(10);
  const x = -slabW * 0.9 + (travel + slabW * 0.9) * push;
  const cy = h * 0.5;
  const red = v.sem('red'), green = v.sem('green');

  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {/* the wall, with a doorway cut out of it */}
      <div style={{position: 'absolute', left: wallX, top: 0, width: v.s(18), height: h, opacity: wallOn}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: cy - doorH / 2,
          background: hexA(v.t.colors.muted, 0.3), borderRadius: v.rad(4)}} />
        <div style={{position: 'absolute', left: 0, top: cy + doorH / 2, width: '100%', height: h - (cy + doorH / 2),
          background: hexA(v.t.colors.muted, 0.3), borderRadius: v.rad(4)}} />
        {/* the lintel and sill of the doorway, lit — this is the number that matters */}
        <div style={{position: 'absolute', left: v.s(-14), top: cy - doorH / 2 - v.s(3), width: v.s(46), height: v.s(6),
          background: v.a, borderRadius: v.rad(3), boxShadow: v.glow(v.a, 14)}} />
        <div style={{position: 'absolute', left: v.s(-14), top: cy + doorH / 2 - v.s(3), width: v.s(46), height: v.s(6),
          background: v.a, borderRadius: v.rad(3), boxShadow: v.glow(v.a, 14)}} />
      </div>
      <div style={{position: 'absolute', left: wallX + v.s(44), top: cy - v.s(18), opacity: wallOn}}>
        <Cap v={v} title={door.label} sub={door.sub} align="left" size={v.s(26) / v.scale} />
      </div>

      {/* the slab of weights — bricks, so its SIZE is countable, not just stated */}
      <div style={{position: 'absolute', left: x, top: cy - slabH / 2, width: slabW, height: slabH,
        opacity: slabOn, borderRadius: v.rad(10),
        border: `${Math.max(1, v.s(2))}px solid ${hexA(fits ? green : red, 0.9)}`,
        background: hexA(fits ? green : red, 0.14), boxShadow: v.glow(fits ? green : red, 18),
        display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: v.s(4), padding: v.s(8),
        overflow: 'hidden'}}>
        {Array.from({length: 24}).map((_, i) => (
          <div key={i} style={{width: v.s(26), height: v.s(12), borderRadius: v.rad(3),
            background: hexA(fits ? green : red, 0.42),
            opacity: arriveAt(frame, F(slab.atWord) + stagger(i, 1), 10)}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: x, top: cy - slabH / 2 - v.s(52), width: slabW, opacity: slabOn}}>
        <Cap v={v} title={slab.label} sub={slab.sub} size={v.s(24) / v.scale} />
      </div>

      {verdict ? (
        <div style={{position: 'absolute', left: wallX - v.s(150), top: cy + doorH / 2 + v.s(46),
          transform: `scale(${0.9 + 0.1 * vOn})`, transformOrigin: 'left top'}}>
          <Chip v={v} text={verdict.label ?? ''} on={vOn} color={fits ? green : red} size={v.s(24)} solid />
        </div>
      ) : null}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────────
   FLOORS — a tower of identical layers, and a lift that only ever carries one.
   The lift is the mechanism: it rises floor by floor, lighting exactly one at a time.
   ──────────────────────────────────────────────────────────────────────────── */
const Floors: React.FC<AirllmVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const tower = one(items, 'tower');
  const lift = one(items, 'lift');
  const note = one(items, 'note');
  const peak = one(items, 'peak');
  if (!tower) return null;

  const n = Math.max(3, Math.min(40, Math.round(tower.value ?? 32)));
  const towerOn = arriveAt(frame, BASE(tower.atWord));
  const liftStart = F(lift?.atWord);
  // The lift walks the tower once, at one floor per `per` frames, and holds at the top.
  const per = 7;
  const walked = lift ? travelAt(frame, liftStart, per * n) : 0;
  const at = Math.min(n - 1, Math.floor(walked * n));
  const running = lift != null && frame >= liftStart;

  const colW = Math.min(w * 0.3, v.s(640));
  const gap = v.s(3);
  const floorH = Math.max(v.s(9), (h * 0.9 - gap * (n - 1)) / n);
  const towerH = floorH * n + gap * (n - 1);
  const left = w * 0.08;
  const top = (h - towerH) / 2;
  const green = v.sem('green');

  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {Array.from({length: n}).map((_, i) => {
        const idx = n - 1 - i; // draw from the top down so floor 0 sits at the bottom
        const lit = running && idx === at;
        const done = running && idx < at;
        return (
          <div key={i} style={{
            position: 'absolute', left, top: top + i * (floorH + gap), width: colW, height: floorH,
            borderRadius: v.rad(4),
            background: lit ? hexA(green, 0.5) : hexA(v.t.colors.muted, done ? 0.06 : 0.13),
            border: `${Math.max(1, v.s(lit ? 2 : 1))}px solid ${hexA(lit ? green : v.t.colors.muted, lit ? 0.95 : 0.3)}`,
            boxShadow: lit ? v.glow(green, 18) : 'none',
            opacity: towerOn * arriveAt(frame, BASE(tower.atWord) + stagger(i, 1), 10),
          }} />
        );
      })}
      <div style={{position: 'absolute', left, top: top - v.s(52), width: colW, opacity: towerOn}}>
        <Cap v={v} title={tower.label} sub={tower.sub} size={v.s(26) / v.scale} />
      </div>

      {/* the lift: one carriage, holding exactly one floor, on the right of the tower */}
      {lift ? (
        <>
          <div style={{position: 'absolute', left: left + colW + v.s(26), top, width: v.s(3), height: towerH,
            background: hexA(v.t.colors.muted, 0.28), opacity: towerOn}} />
          <div style={{
            position: 'absolute', left: left + colW + v.s(8), width: v.s(40),
            height: floorH + v.s(14),
            top: top + (n - 1 - at) * (floorH + gap) - v.s(7),
            borderRadius: v.rad(6), border: `${Math.max(1, v.s(2))}px solid ${hexA(v.a, 0.95)}`,
            background: hexA(v.a, 0.2), boxShadow: v.glow(v.a, 20),
            opacity: arriveAt(frame, liftStart),
          }} />
          <div style={{position: 'absolute', left: left + colW + v.s(60),
            top: top + (n - 1 - at) * (floorH + gap) - v.s(14), opacity: arriveAt(frame, liftStart)}}>
            <Cap v={v} title={lift.label} sub={lift.sub} align="left" size={v.s(23) / v.scale} />
          </div>
        </>
      ) : null}

      {/* the two facts that belong beside the tower, each on its own word */}
      <div style={{position: 'absolute', left: w * 0.58, top: h * 0.3, display: 'flex',
        flexDirection: 'column', gap: v.s(20), alignItems: 'flex-start'}}>
        {note ? <Chip v={v} text={note.label ?? ''} on={arriveAt(frame, F(note.atWord))} color={v.a} size={v.s(26)} /> : null}
        {peak ? <Chip v={v} text={peak.label ?? ''} on={landAt(frame, F(peak.atWord))} color={green} size={v.s(30)} solid /> : null}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────────
   CEILING — file bars, and a ceiling line that settles on the TALLEST, not the sum.
   The whole argument is that a total and a maximum are different numbers.
   ──────────────────────────────────────────────────────────────────────────── */
const Ceiling: React.FC<AirllmVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const files = pick(items, 'file');
  const total = one(items, 'total');
  const peak = one(items, 'peak');
  if (!files.length) return null;

  const maxV = Math.max(...files.map((f) => f.value ?? 0), 0.001);
  const plotH = h * 0.66;
  const plotTop = h * 0.16;
  const colW = Math.min((w * 0.86) / files.length - v.s(28), v.s(340));
  const gap = v.s(16);
  const rowW = files.length * colW + (files.length - 1) * gap;
  const left = (w - rowW) / 2;
  const green = v.sem('green');
  const peakOn = peak ? travelAt(frame, F(peak.atWord), 26) : 0;

  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {/* baseline */}
      <div style={{position: 'absolute', left: left - v.s(20), top: plotTop + plotH, width: rowW + v.s(40),
        height: Math.max(1, v.s(2)), background: hexA(v.t.colors.muted, 0.35),
        opacity: arriveAt(frame, BASE(files[0]?.atWord))}} />

      {files.map((f, i) => {
        const on = arriveAt(frame, F(f.atWord));
        const grow = travelAt(frame, F(f.atWord), 22);
        const bh = plotH * ((f.value ?? 0) / maxV) * grow;
        const isMax = (f.value ?? 0) >= maxV - 1e-9;
        const c = isMax ? green : v.a;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: left + i * (colW + gap), top: plotTop + plotH - bh,
              width: colW, height: bh, borderRadius: `${v.rad(8)}px ${v.rad(8)}px 0 0`,
              background: hexA(c, 0.22), border: `${Math.max(1, v.s(isMax ? 2 : 1))}px solid ${hexA(c, isMax ? 0.95 : 0.5)}`,
              boxShadow: isMax ? v.glow(c, 16) : 'none', opacity: on}} />
            <div style={{position: 'absolute', left: left + i * (colW + gap), top: plotTop + plotH - bh - v.s(38),
              width: colW, opacity: on}}>
              <Cap v={v} title={f.sub} size={v.s(24) / v.scale} mono color={isMax ? green : v.t.colors.text} />
            </div>
            <div style={{position: 'absolute', left: left + i * (colW + gap), top: plotTop + plotH + v.s(12),
              width: colW, opacity: on}}>
              <Cap v={v} title={f.label} size={v.s(20) / v.scale} color={v.t.colors.muted} />
            </div>
          </React.Fragment>
        );
      })}

      {/* the ceiling line: it sweeps in from the right and stops on the tallest bar */}
      {peak ? (
        <>
          <div style={{position: 'absolute', left: left - v.s(20) + (rowW + v.s(40)) * (1 - peakOn),
            top: plotTop, width: (rowW + v.s(40)) * peakOn, height: Math.max(1, v.s(3)),
            background: green, boxShadow: v.glow(green, 14), opacity: peakOn}} />
          <div style={{position: 'absolute', right: v.s(4), top: plotTop - v.s(44), opacity: peakOn}}>
            <Chip v={v} text={peak.label ?? ''} on={peakOn} color={green} size={v.s(26)} solid />
          </div>
        </>
      ) : null}

      {total ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: plotTop + plotH + v.s(66),
          display: 'flex', justifyContent: 'center'}}>
          <Chip v={v} text={total.label ?? ''} on={arriveAt(frame, F(total.atWord))} color={v.t.colors.muted} size={v.s(24)} />
        </div>
      ) : null}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────────
   PIPE — bytes crossing a cable, and the clock that one division implies.
   ──────────────────────────────────────────────────────────────────────────── */
const Pipe: React.FC<AirllmVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const from = one(items, 'from');
  const to = one(items, 'to');
  const bytes = one(items, 'bytes');
  const rate = one(items, 'rate');
  const result = one(items, 'result');
  if (!from || !to) return null;

  const boxW = Math.min(w * 0.24, v.s(520));
  const boxH = Math.min(h * 0.34, v.s(340));
  const cy = h * 0.42;
  const lx = w * 0.06, rx = w - w * 0.06 - boxW;
  const cableL = lx + boxW, cableR = rx, cableW = cableR - cableL;
  const on = arriveAt(frame, BASE(from.atWord));
  const orange = v.sem('orange');
  const flowStart = F(bytes?.atWord);
  const flowing = bytes != null && frame >= flowStart;

  const Box = (it: AirllmStageItem, x: number) => (
    <div style={{position: 'absolute', left: x, top: cy - boxH / 2, width: boxW, height: boxH,
      borderRadius: v.rad(12), border: `${Math.max(1, v.s(2))}px solid ${hexA(v.a, 0.7)}`,
      background: hexA(v.a, 0.1), opacity: on, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: v.s(6), padding: v.s(10)}}>
      <Cap v={v} title={it.label} sub={it.sub} size={v.s(24) / v.scale} />
    </div>
  );

  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {Box(from, lx)}
      {Box(to, rx)}
      {/* the cable */}
      <div style={{position: 'absolute', left: cableL, top: cy - v.s(14), width: cableW, height: v.s(28),
        borderRadius: v.rad(14), border: `${Math.max(1, v.s(1))}px solid ${hexA(v.t.colors.muted, 0.35)}`,
        background: hexA(v.t.colors.muted, 0.07), opacity: on, overflow: 'hidden'}}>
        {/* packets crossing it — each is one slice of the read, all on the same word */}
        {flowing ? Array.from({length: 14}).map((_, i) => {
          const p = ((frame - flowStart) / 34 + i / 14) % 1;
          return <div key={i} style={{position: 'absolute', left: `${p * 100}%`, top: v.s(6),
            width: v.s(22), height: v.s(14), borderRadius: v.rad(3),
            background: hexA(orange, 0.75), boxShadow: v.glow(orange, 8)}} />;
        }) : null}
      </div>

      {bytes ? (
        <div style={{position: 'absolute', left: cableL, width: cableW, top: cy - v.s(70),
          display: 'flex', justifyContent: 'center'}}>
          <Chip v={v} text={bytes.label ?? ''} on={arriveAt(frame, flowStart)} color={orange} size={v.s(28)} solid />
        </div>
      ) : null}

      {/* the division, written out: bytes / rate = seconds */}
      <div style={{position: 'absolute', left: 0, right: 0, top: cy + boxH / 2 + v.s(54),
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: v.s(18), flexWrap: 'wrap'}}>
        {rate ? <Chip v={v} text={rate.label ?? ''} on={arriveAt(frame, F(rate.atWord))} color={v.a} size={v.s(26)} /> : null}
        {result ? <div style={{opacity: arriveAt(frame, F(result.atWord)), fontFamily: v.t.fonts.mono,
          fontSize: v.s(30), color: v.t.colors.muted}}>=</div> : null}
        {result ? <Chip v={v} text={result.label ?? ''} on={landAt(frame, F(result.atWord))} color={v.sem('red')} size={v.s(34)} solid /> : null}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────────
   CROSSOVER — model sizes along an axis, with this machine's memory drawn across it.
   Left of the line you can simply load the model; right of it you have no choice.
   ──────────────────────────────────────────────────────────────────────────── */
const Crossover: React.FC<AirllmVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const points = pick(items, 'point');
  const line = one(items, 'line');
  const leftLbl = one(items, 'left');
  const rightLbl = one(items, 'right');
  if (!points.length || !line) return null;

  const maxV = Math.max(...points.map((p) => p.value ?? 0), line.value ?? 0) * 1.12;
  const axisY = h * 0.56;
  const x0 = w * 0.08, x1 = w * 0.94;
  const at = (val: number) => x0 + (x1 - x0) * Math.min(1, (val ?? 0) / maxV);
  const on = arriveAt(frame, BASE(points[0]?.atWord));
  const lineOn = travelAt(frame, F(line.atWord), 24);
  const green = v.sem('green'), red = v.sem('red');
  const lx = at(line.value ?? 0);

  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {/* the axis */}
      <div style={{position: 'absolute', left: x0, top: axisY, width: x1 - x0, height: Math.max(1, v.s(2)),
        background: hexA(v.t.colors.muted, 0.4), opacity: on}} />

      {/* the two regions, tinted only once the line exists */}
      <div style={{position: 'absolute', left: x0, top: axisY - v.s(62), width: (lx - x0) * lineOn, height: v.s(62),
        background: hexA(green, 0.1), borderTop: `${Math.max(1, v.s(1))}px solid ${hexA(green, 0.3)}`}} />
      <div style={{position: 'absolute', left: lx, top: axisY - v.s(62), width: (x1 - lx) * lineOn, height: v.s(62),
        background: hexA(red, 0.1), borderTop: `${Math.max(1, v.s(1))}px solid ${hexA(red, 0.3)}`}} />

      {/* this machine's memory, as a wall standing on the axis */}
      <div style={{position: 'absolute', left: lx - v.s(2), top: axisY - h * 0.3 * lineOn, width: v.s(5),
        height: h * 0.3 * lineOn, background: v.a, boxShadow: v.glow(v.a, 16)}} />
      <div style={{position: 'absolute', left: lx - v.s(120), top: axisY - v.s(196), width: v.s(240),
        opacity: lineOn}}>
        <Cap v={v} title={line.label} sub={line.sub} size={v.s(25) / v.scale} color={v.a} />
      </div>

      {/* each model, a pin on the axis at its own size */}
      {points.map((p, i) => {
        const pon = landAt(frame, F(p.atWord));
        const px = at(p.value ?? 0);
        const over = (p.value ?? 0) > (line.value ?? 0);
        const c = over ? red : green;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: px - v.s(9), top: axisY - v.s(9), width: v.s(18), height: v.s(18),
              borderRadius: '50%', background: c, boxShadow: v.glow(c, 14),
              transform: `scale(${pon})`, opacity: Math.min(1, pon)}} />
            <div style={{position: 'absolute', left: px - v.s(115), top: axisY + v.s(22) + (i % 2) * v.s(74),
              width: v.s(230), opacity: Math.min(1, pon)}}>
              <Cap v={v} title={p.label} sub={p.sub} size={v.s(23) / v.scale} />
            </div>
          </React.Fragment>
        );
      })}

      {/* what each side of the line MEANS — the point of the whole picture */}
      {leftLbl ? (
        <div style={{position: 'absolute', left: x0, top: axisY - v.s(112), width: Math.max(v.s(10), lx - x0 - v.s(20)),
          opacity: arriveAt(frame, F(leftLbl.atWord))}}>
          <Cap v={v} title={leftLbl.label} sub={leftLbl.sub} size={v.s(23) / v.scale} color={green} />
        </div>
      ) : null}
      {rightLbl ? (
        <div style={{position: 'absolute', left: lx + v.s(20), top: axisY - v.s(112), width: Math.max(v.s(10), x1 - lx - v.s(20)),
          opacity: arriveAt(frame, F(rightLbl.atWord))}}>
          <Cap v={v} title={rightLbl.label} sub={rightLbl.sub} size={v.s(23) / v.scale} color={red} />
        </div>
      ) : null}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────────
   ROAD — one function call, two code paths, and the one a Mac is sent down.
   The fork is drawn; the road not taken stays dim and is still labelled.
   ──────────────────────────────────────────────────────────────────────────── */
const Road: React.FC<AirllmVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const call = one(items, 'call');
  const roads = pick(items, 'road');
  const taken = one(items, 'taken');
  if (!call || roads.length < 2) return null;

  const on = arriveAt(frame, BASE(call.atWord));
  const takenId = taken?.text;
  const forkX = w * 0.38;
  const cy = h * 0.5;
  const laneH = Math.min(h * 0.34, v.s(340));
  const green = v.sem('green');

  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {/* the call itself, in mono, because it is a line of code */}
      <div style={{position: 'absolute', left: w * 0.02, top: cy - v.s(34), width: forkX - w * 0.04,
        opacity: on}}>
        <Cap v={v} title={call.label} sub={call.sub} align="left" size={v.s(25) / v.scale} mono />
      </div>
      <div style={{position: 'absolute', left: w * 0.02, top: cy + v.s(16), width: (forkX - w * 0.06) * on,
        height: Math.max(1, v.s(3)), background: hexA(v.a, 0.8), boxShadow: v.glow(v.a, 10)}} />

      {roads.map((r, i) => {
        const isTaken = r.text != null && r.text === takenId;
        const rOn = arriveAt(frame, F(r.atWord));
        const lit = isTaken ? travelAt(frame, F(taken?.atWord), 26) : 0;
        const y = cy - laneH * 0.62 + i * laneH * 1.24;
        const c = isTaken ? green : v.t.colors.muted;
        return (
          <React.Fragment key={i}>
            {/* the branch, drawn from the fork out to its lane */}
            <div style={{position: 'absolute', left: forkX - v.s(2), top: Math.min(cy + v.s(17), y + laneH / 2),
              width: Math.max(1, v.s(3)), height: Math.abs(y + laneH / 2 - (cy + v.s(17))),
              background: hexA(c, isTaken ? 0.9 : 0.3), opacity: rOn}} />
            <div style={{position: 'absolute', left: forkX, top: y + laneH / 2 - v.s(1),
              width: (w * 0.14) * rOn, height: Math.max(1, v.s(3)), background: hexA(c, isTaken ? 0.9 : 0.3)}} />
            <div style={{position: 'absolute', left: forkX + w * 0.15, top: y, width: w * 0.44, height: laneH,
              borderRadius: v.rad(12), padding: v.s(16), boxSizing: 'border-box',
              border: `${Math.max(1, v.s(isTaken ? 2 : 1))}px solid ${hexA(c, isTaken ? 0.95 : 0.3)}`,
              background: hexA(c, isTaken ? 0.14 : 0.05),
              boxShadow: isTaken && lit > 0.2 ? v.glow(green, 20) : 'none',
              opacity: rOn * (isTaken ? 1 : 0.62),
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: v.s(6)}}>
              <Cap v={v} title={r.label} sub={r.sub} align="left" size={v.s(25) / v.scale}
                color={isTaken ? v.t.colors.text : v.t.colors.muted} />
            </div>
            {isTaken && taken?.label ? (
              <div style={{position: 'absolute', left: forkX + w * 0.15, top: y + laneH + v.s(12),
                transform: `translateX(${(1 - lit) * v.s(-20)}px)`}}>
                <Chip v={v} text={taken.label} on={lit} color={green} size={v.s(24)} solid />
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const AIRLLM_VIZ: Record<string, React.FC<AirllmVizProps>> = {
  wall: Wall,
  floors: Floors,
  ceiling: Ceiling,
  pipe: Pipe,
  crossover: Crossover,
  road: Road,
};

export const AirllmViz: React.FC<AirllmVizProps & {kind: string}> = ({kind, ...rest}) => {
  const R = AIRLLM_VIZ[kind];
  // NEVER substitute a plausible picture for an unknown kind (LAW 0n corollary).
  if (!R) return <UnknownKind kind={kind} registry="airllmViz" />;
  return <R {...rest} />;
};
