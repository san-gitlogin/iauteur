import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {useTheme, wordToFrame} from './themes';
import {SemColor, LayaStageItem} from './types';
import {useScale, useSem, hexA} from './ui';
import {UnknownKind} from './unknownKind';
import {arriveAt, travelAt, landAt, stagger} from './motion/system';

/**
 * LAYA depictions — the drawn beats of the Laya video.
 *
 * WHY A NEW FILE (LAW 0e.8, LAW 0n). Laya is an ARCHITECTURE subject: a single forward
 * pass, a slot per option, a calibrated probability, a routing decision taken before the
 * model runs. Every one of those is the kind of beat that quietly defaults to a labelled
 * card, because a card can hold the word "parallel" as easily as the word "sequential".
 * So each `kind` below names an OBJECT and makes that object MOVE:
 *
 *   one-pass     one clock, two lanes — one spreads along it, one is a single column
 *   mask-slots   a packed sequence with a socket per option, read back AT those sockets
 *   entropy-dial a distribution flattening and peaking, with a needle tied to its spread
 *   proper-score two reward curves, and where a ball rolls to on each
 *   router-gate  a gate BEFORE the model, and a meter reading 95% over a wrong answer
 *   budget-split one fixed bar cut into 4 pieces, then into 77
 *   free-swap    one string in a client changing, and the same envelope arriving elsewhere
 *
 * Swap every label for lorem and none of these still make sense as a card — which is the
 * test LAW 0n asks for before a component is written.
 *
 * EVERY MOMENT COMES FROM A WORD (LAW 0i.1). There is no fixed frame interval anywhere in
 * this file: each element resolves its own frame from its own `atWord` through `F()`, so
 * rewriting the narration re-times the picture with no code change. `stagger()` is used
 * only WITHIN an element that arrives as one thing (the cells of a single sequence).
 *
 * EVERY NUMBER IS AUTHORED, NEVER COMPUTED HERE (LAW 0m.2). Probabilities, confidences,
 * millisecond figures and token budgets all arrive on the items; `briefs/laya/build.py`
 * computes them from `briefs/laya/FACTS.md`, which is itself read off the frames.
 *
 * BASE <= 38 FRAMES (component_authoring §2). Every picture's furniture — the axis, the
 * sequence, the gate, the bar — is on screen within 38 frames whatever the anchors say;
 * only the PAYOFF waits for its word.
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

export interface LayaVizProps {items: LayaStageItem[]; accent: SemColor; token?: string; w: number; h: number}

/** A caption that belongs to an object — never a box around it. */
const Cap: React.FC<{v: V; title?: string; sub?: string; on?: number; align?: 'left' | 'center' | 'right'; size?: number; color?: string}> =
  ({v, title, sub, on = 1, align = 'center', size = 26, color}) => (
    <div style={{textAlign: align, opacity: on, transform: `translateY(${(1 - on) * v.s(8)}px)`}}>
      {title ? <div style={{fontFamily: v.t.fonts.display, fontWeight: v.t.style.displayWeight as any,
        letterSpacing: v.t.style.displayTracking, fontSize: v.s(size), lineHeight: 1.14,
        color: color ?? v.t.colors.text}}>{title}</div> : null}
      {sub ? <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(size * 0.62), lineHeight: 1.34,
        color: v.t.colors.muted, marginTop: v.s(4)}}>{sub}</div> : null}
    </div>
  );

/** A monospace chip — a token, a slot, a label on a lane. */
const Chip: React.FC<{v: V; text: string; on: number; lit?: boolean; color?: string; size: number; wide?: number; dim?: number}> =
  ({v, text, on, lit, color, size, wide, dim = 1}) => {
    const c = color ?? (lit ? v.a : v.t.colors.muted);
    return (
      <div style={{
        opacity: on * dim, transform: `translateY(${(1 - on) * v.s(10)}px)`,
        padding: `${size * 0.3}px ${size * 0.5}px`, borderRadius: v.rad(8),
        background: lit ? hexA(c, 0.17) : hexA(v.t.colors.muted, 0.08),
        border: `${Math.max(1, v.s(lit ? 2 : 1))}px solid ${hexA(c, lit ? 0.92 : 0.36)}`,
        boxShadow: lit ? v.glow(c, 14) : 'none',
        fontFamily: v.t.fonts.mono, fontSize: size, lineHeight: 1.1,
        color: lit ? v.t.colors.text : v.t.colors.muted,
        maxWidth: wide, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{text}</div>
    );
  };

// ── 1. ONE-PASS — one clock, two lanes ────────────────────────────────────────────────
//
// The argument of the whole video is a SHAPE, not a word: a model that writes spreads its
// answer ALONG the clock, one token at a time, and then something has to parse the result;
// a decision engine puts every option in ONE column. Drawing it as two labelled rows
// ("sequential" / "parallel") would be the caption this component exists to avoid — so the
// tokens genuinely march left to right on their own anchors, and the slots genuinely land
// together on one.
//
// items: group 'gen' = a token on the writing lane (value = 0-1 along the clock)
//        group 'laya' = an option scored in the single pass (value = its probability)
//        group 'time' = the figure at a lane's end (text = lane 'gen'|'laya', sub = figure)
const OnePass: React.FC<LayaVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const gen = items.filter((i) => i.group === 'gen');
  const laya = items.filter((i) => i.group === 'laya');
  const times = items.filter((i) => i.group === 'time');
  const base = arriveAt(frame, BASE(items[0]?.atWord));

  // SIZED FROM THE PANE, NOT FROM A CONSTANT (LAW 0n): the lanes take the room they are
  // given, so the picture fills a 16:9 stage and a 9:16 one without a magic number.
  const laneH = h * 0.3;
  const gapY = h * 0.1;
  const axisY = h - v.s(34);
  // THE LANE NAME SITS ABOVE ITS TRACK, NOT IN A COLUMN BESIDE IT. A left-hand label column
  // was 120px wide and "a model that writes" wrapped onto THREE right-aligned lines — caught
  // in a still, invisible in the code. Above the track it has the whole pane to use.
  const trackL = 0;
  const trackW = w - v.s(v.vertical ? 20 : 40);
  const chip = v.s(v.vertical ? 17 : 19);
  const trackDY = laneH * 0.62;

  const Lane: React.FC<{y: number; name: string; note: string; on: number}> = ({y, name, note, on}) => (
    <>
      <div style={{position: 'absolute', left: 0, top: y, width: w, opacity: on}}>
        <Cap v={v} title={name} sub={note} align="left" size={v.vertical ? 19 : 21} />
      </div>
      <div style={{position: 'absolute', left: trackL, top: y + trackDY, width: trackW,
        height: Math.max(1, v.s(1)), background: hexA(v.t.colors.muted, 0.26), opacity: on}} />
    </>
  );

  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <Lane y={0} name="a model that writes" note="one token, then the next" on={base} />
      {gen.map((it, i) => {
        const on = arriveAt(frame, F(it.atWord));
        const x = trackL + trackW * Math.min(0.92, it.value ?? 0);
        return (
          <div key={`g${i}`} style={{position: 'absolute', left: x, top: trackDY - chip * 1.6,
            transform: 'translateX(-50%)'}}>
            <Chip v={v} text={it.label ?? ''} on={on} size={chip} />
          </div>
        );
      })}

      <Lane y={laneH + gapY} name="Laya" note="every option, one pass" on={base} />
      {/* The single column IS the point: every slot shares one x, and they arrive together
          on ONE anchor, so the eye reads "at the same moment" without being told. */}
      {laya.map((it, i) => {
        const on = arriveAt(frame, F(it.atWord) + stagger(i, 2));
        const colX = trackL + trackW * Math.min(0.92, laya[0]?.value ?? 0.16);
        const rowH = (laneH * 0.86) / Math.max(1, laya.length);
        return (
          <div key={`l${i}`} style={{position: 'absolute', left: colX, top: laneH + gapY + trackDY - chip * 1.6 + i * rowH,
            transform: 'translateX(-50%)'}}>
            <Chip v={v} text={it.label ?? ''} on={on} lit size={chip} />
          </div>
        );
      })}

      {times.map((it, i) => {
        const on = landAt(frame, F(it.atWord));
        const y = it.text === 'gen' ? trackDY : laneH + gapY + trackDY;
        return (
          <div key={`t${i}`} style={{position: 'absolute', right: 0, top: y - v.s(20), opacity: on,
            transform: `scale(${0.9 + on * 0.1})`}}>
            <Cap v={v} title={it.sub ?? ''} align="right" size={v.vertical ? 24 : 30}
              color={it.text === 'gen' ? v.t.colors.muted : v.a} />
          </div>
        );
      })}

      <div style={{position: 'absolute', left: trackL, top: axisY, width: trackW, opacity: base}}>
        <div style={{height: Math.max(1, v.s(1)), background: hexA(v.t.colors.muted, 0.4)}} />
        <div style={{marginTop: v.s(6), fontFamily: v.t.fonts.mono, fontSize: v.s(14),
          letterSpacing: v.s(1.2), color: hexA(v.t.colors.muted, 0.9)}}>time</div>
      </div>
    </div>
  );
};

// ── 2. MASK-SLOTS — the sequence with a socket per option ─────────────────────────────
//
// THE picture of this video. Everyone writing about these models says "a single forward
// pass"; almost nobody shows WHY it is single. The answer is physical: each option is given
// its own marker inside the one sequence, the encoder reads the whole row in both
// directions, and the answer is GATHERED back out at exactly those marker positions. So the
// component draws a row of cells, sweeps a reading band across all of them (arrows both
// ways — bidirectional is the reason this works), then raises a riser from each socket cell
// only, and turns the risers into bars.
//
// items: group 'cell' = a sequence cell (label; text 'slot' marks a socket)
//        group 'read' = the bidirectional sweep (atWord)
//        group 'gather' = a socket's read-out (label = option, value = probability)
const MaskSlots: React.FC<LayaVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const cells = items.filter((i) => i.group === 'cell');
  const read = items.find((i) => i.group === 'read');
  const gather = items.filter((i) => i.group === 'gather');
  const base = arriveAt(frame, BASE(cells[0]?.atWord));

  const rowY = h * (v.vertical ? 0.1 : 0.14);
  const cellH = h * (v.vertical ? 0.13 : 0.17);
  const gap = v.s(v.vertical ? 4 : 6);
  const cw = (w - gap * Math.max(0, cells.length - 1)) / Math.max(1, cells.length);
  const font = Math.min(v.s(v.vertical ? 15 : 18), cw * 0.3);

  const sweep = read ? travelAt(frame, F(read.atWord), 34) : 0;
  const barTop = rowY + cellH + h * (v.vertical ? 0.16 : 0.2);
  const barMax = h - barTop - v.s(46);

  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {cells.map((c, i) => {
        const slot = c.text === 'slot';
        const on = arriveAt(frame, BASE(cells[0]?.atWord) + stagger(i, 2));
        // A socket LIGHTS when the reading band has passed over it — the gather is a
        // consequence of the read, so it may not precede it.
        const litBy = slot && sweep > (i + 0.5) / cells.length ? 1 : 0;
        return (
          <div key={`c${i}`} style={{
            position: 'absolute', left: i * (cw + gap), top: rowY, width: cw, height: cellH,
            display: 'flex', alignItems: 'center', justifyContent: 'safe center',
            opacity: on, transform: `translateY(${(1 - on) * v.s(12)}px)`,
            borderRadius: v.rad(8),
            background: slot ? hexA(v.a, 0.1 + litBy * 0.14) : hexA(v.t.colors.muted, 0.07),
            border: `${Math.max(1, v.s(slot ? 2 : 1))}px ${slot ? 'solid' : 'dashed'} ${hexA(slot ? v.a : v.t.colors.muted, slot ? 0.55 + litBy * 0.4 : 0.3)}`,
            boxShadow: litBy ? v.glow(v.a, 14) : 'none',
          }}>
            <span style={{fontFamily: v.t.fonts.mono, fontSize: font, lineHeight: 1.1,
              padding: `0 ${v.s(4)}px`, textAlign: 'center',
              color: slot ? v.t.colors.text : hexA(v.t.colors.muted, 0.95),
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: cw - v.s(8)}}>
              {c.label}
            </span>
          </div>
        );
      })}

      {/* THE READING BAND. It travels across every cell, and the arrowheads point BOTH ways
          because that is the mechanism — a bidirectional encoder, not a left-to-right one. */}
      {read ? (
        <div style={{position: 'absolute', left: 0, top: rowY - v.s(14), width: w * sweep,
          height: cellH + v.s(28), borderRadius: v.rad(10),
          background: `linear-gradient(90deg, ${hexA(v.a, 0)} 0%, ${hexA(v.a, 0.16)} 70%, ${hexA(v.a, 0.3)} 100%)`,
          borderRight: sweep > 0 && sweep < 1 ? `${Math.max(1, v.s(2))}px solid ${hexA(v.a, 0.8)}` : 'none'}} />
      ) : null}
      {read ? (
        <div style={{position: 'absolute', left: 0, top: rowY + cellH + v.s(18), width: w,
          textAlign: 'center', opacity: sweep > 0.05 ? 1 : 0}}>
          <Cap v={v} title={read.label} sub={read.sub} size={v.vertical ? 19 : 21} />
        </div>
      ) : null}

      {/* THE GATHER. A riser grows UP out of each socket, so the read-out visibly comes from
          the marker's own position rather than appearing beside it. */}
      {gather.map((g, i) => {
        const on = travelAt(frame, F(g.atWord));
        const idx = cells.findIndex((c) => c.text === 'slot' && c.label === g.text);
        const x = (idx >= 0 ? idx : i) * (cw + gap) + cw / 2;
        const bh = barMax * (g.value ?? 0) * on;
        const lit = (g.value ?? 0) >= Math.max(...gather.map((x2) => x2.value ?? 0));
        const c = lit ? v.a : v.t.colors.muted;
        return (
          <React.Fragment key={`g${i}`}>
            <div style={{position: 'absolute', left: x, top: rowY + cellH,
              width: Math.max(1, v.s(2)), height: (barTop - rowY - cellH) * on,
              background: hexA(c, 0.5), transform: 'translateX(-50%)'}} />
            <div style={{position: 'absolute', left: x, top: barTop + (barMax - bh),
              width: Math.min(cw * 1.5, v.s(86)), height: bh, transform: 'translateX(-50%)',
              borderRadius: v.rad(6), background: hexA(c, lit ? 0.32 : 0.16),
              border: `${Math.max(1, v.s(lit ? 2 : 1))}px solid ${hexA(c, lit ? 0.95 : 0.4)}`,
              boxShadow: lit ? v.glow(c, 16) : 'none'}} />
            <div style={{position: 'absolute', left: x, top: barTop + barMax + v.s(8),
              transform: 'translateX(-50%)', opacity: on, textAlign: 'center'}}>
              <Cap v={v} title={g.sub} sub={g.label} size={v.vertical ? 17 : 20}
                color={lit ? v.a : v.t.colors.muted} />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── 3. ENTROPY-DIAL — confidence is the SHAPE of the distribution ─────────────────────
//
// A model that writes can type the characters "confidence: 0.95" with nothing behind them.
// Here the number is not written by anything — it is the spread. So the bars and the needle
// are driven by the SAME authored distribution: when the bars flatten the needle falls, when
// one bar spikes the needle climbs, and the viewer sees a cause rather than a claim.
//
// items: group 'bar' = an option (value = probability, label = option)
//        group 'dial' = the read-out (value = confidence 0-1, sub = the printed figure)
const EntropyDial: React.FC<LayaVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const bars = items.filter((i) => i.group === 'bar');
  const dial = items.find((i) => i.group === 'dial');
  const base = arriveAt(frame, BASE(bars[0]?.atWord));

  const col = v.vertical;
  const plotW = col ? w : w * 0.56;
  const plotH = col ? h * 0.46 : h;
  const dialW = col ? w : w * 0.4;
  const dialY = col ? h * 0.54 : 0;

  const n = Math.max(1, bars.length);
  const bw = (plotW - v.s(20) * (n - 1)) / n;
  const maxH = plotH - v.s(64);

  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {bars.map((b, i) => {
        // EVERY BAR STARTS FLAT AND MOVES TO ITS AUTHORED VALUE. The flat state is 1/K —
        // the "completely unsure" case the formula names — so the animation IS the sentence.
        const on = travelAt(frame, F(b.atWord));
        const flat = 1 / n;
        const p = flat + ((b.value ?? flat) - flat) * on;
        const lit = (b.value ?? 0) >= Math.max(...bars.map((x) => x.value ?? 0));
        const c = lit ? v.a : v.t.colors.muted;
        const bh = maxH * p;
        return (
          <React.Fragment key={`b${i}`}>
            <div style={{position: 'absolute', left: i * (bw + v.s(20)), top: maxH - bh,
              width: bw, height: bh, borderRadius: v.rad(6), opacity: base,
              background: hexA(c, lit ? 0.3 : 0.14),
              border: `${Math.max(1, v.s(lit ? 2 : 1))}px solid ${hexA(c, lit ? 0.95 : 0.38)}`,
              boxShadow: lit ? v.glow(c, 14) : 'none'}} />
            <div style={{position: 'absolute', left: i * (bw + v.s(20)), top: maxH + v.s(10),
              width: bw, textAlign: 'center', opacity: base}}>
              <Cap v={v} title={p.toFixed(2)} sub={b.label} size={v.vertical ? 17 : 19}
                color={lit ? v.a : v.t.colors.muted} />
            </div>
          </React.Fragment>
        );
      })}

      {dial ? (() => {
        const on = travelAt(frame, F(dial.atWord));
        const conf = (dial.value ?? 0) * on;
        const R = Math.min(dialW * 0.42, (col ? h * 0.4 : h * 0.44));
        const cx = col ? w / 2 : plotW + dialW * 0.5;
        const cy = dialY + R + v.s(10);
        // A 200-degree arc, swept from the left. `stroke-dasharray` on a path keeps the
        // needle and the arc reading the same value — nothing here is positioned by eye.
        const a0 = Math.PI * 0.9, a1 = Math.PI * 2.1;
        const ang = a0 + (a1 - a0) * conf;
        const len = R * (a1 - a0);
        return (
          <>
            <svg width={R * 2.2} height={R * 1.5} viewBox={`0 0 ${R * 2.2} ${R * 1.5}`}
              style={{position: 'absolute', left: cx - R * 1.1, top: cy - R * 1.05, opacity: base}}>
              <path d={`M ${R * 1.1 + R * Math.cos(a0)} ${R * 1.05 + R * Math.sin(a0)}
                        A ${R} ${R} 0 1 1 ${R * 1.1 + R * Math.cos(a1)} ${R * 1.05 + R * Math.sin(a1)}`}
                fill="none" stroke={hexA(v.t.colors.muted, 0.28)} strokeWidth={v.s(14)} strokeLinecap="round" />
              <path d={`M ${R * 1.1 + R * Math.cos(a0)} ${R * 1.05 + R * Math.sin(a0)}
                        A ${R} ${R} 0 1 1 ${R * 1.1 + R * Math.cos(a1)} ${R * 1.05 + R * Math.sin(a1)}`}
                fill="none" stroke={v.a} strokeWidth={v.s(14)} strokeLinecap="round"
                strokeDasharray={`${len * conf} ${len * 2}`} />
              <line x1={R * 1.1} y1={R * 1.05}
                x2={R * 1.1 + R * 0.82 * Math.cos(ang)} y2={R * 1.05 + R * 0.82 * Math.sin(ang)}
                stroke={v.t.colors.text} strokeWidth={v.s(4)} strokeLinecap="round" />
              <circle cx={R * 1.1} cy={R * 1.05} r={v.s(8)} fill={v.t.colors.text} />
            </svg>
            <div style={{position: 'absolute', left: cx - R, top: cy + R * 0.2, width: R * 2,
              textAlign: 'center'}}>
              <Cap v={v} title={conf.toFixed(2)} sub={dial.label} size={v.vertical ? 40 : 52} color={v.a} />
            </div>
          </>
        );
      })() : null}
    </div>
  );
};

// ── 4. PROPER-SCORE — where the ball rolls ────────────────────────────────────────────
//
// The mathematics of RLCD is a sentence nobody can picture: "a strictly proper scoring rule
// is uniquely maximised when the reported distribution equals the true one." As a picture it
// is trivial and unforgettable — two reward curves over "what you claim", and a ball that
// rolls to the top of each. On the accuracy curve the top is at 100%, so the ball rolls off
// to overconfidence. On the proper curve the top sits exactly over the truth marker.
//
// items: group 'naive' | 'proper' = a curve (label = its name, sub = where the ball lands)
//        group 'truth' = the true value marker (value = 0-1)
const ProperScore: React.FC<LayaVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const curves = items.filter((i) => i.group === 'naive' || i.group === 'proper');
  const truth = items.find((i) => i.group === 'truth');
  const tv = truth?.value ?? 0.7;
  const base = arriveAt(frame, BASE(curves[0]?.atWord));

  const col = v.vertical;
  const cellW = col ? w : (w - v.s(40)) / 2;
  const cellH = col ? (h - v.s(40)) / 2 : h;

  const Curve: React.FC<{it: LayaStageItem; x: number; y: number}> = ({it, x, y}) => {
    const on = travelAt(frame, F(it.atWord), 40);
    const proper = it.group === 'proper';
    const pad = {l: v.s(16), r: v.s(16), t: v.s(46), b: v.s(58)};
    const pw = cellW - pad.l - pad.r, ph = cellH - pad.t - pad.b;
    // The two reward shapes, as functions of the CLAIM (0-1):
    //   naive  R = claim toward the right answer  -> monotonically rising, peak at 1.0
    //   proper R = a strictly proper score        -> single peak exactly at the truth
    const fy = (u: number) => (proper ? 1 - Math.pow((u - tv) / 1, 2) * 2.2 : 0.12 + u * 0.88);
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const u = i / 60;
      const yy = Math.max(0, Math.min(1, fy(u)));
      pts.push(`${pad.l + pw * u},${pad.t + ph * (1 - yy)}`);
    }
    const ballU = proper ? tv : 1;
    const bu = 0.5 + (ballU - 0.5) * on;
    const by = Math.max(0, Math.min(1, fy(bu)));
    const c = proper ? v.sem('green') : v.sem('red');
    return (
      <div style={{position: 'absolute', left: x, top: y, width: cellW, height: cellH, opacity: base}}>
        <div style={{position: 'absolute', left: pad.l, top: 0, right: pad.r}}>
          <Cap v={v} title={it.label} align="left" size={v.vertical ? 20 : 23} color={c} />
        </div>
        <svg width={cellW} height={cellH} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={pad.l} y1={pad.t + ph} x2={pad.l + pw} y2={pad.t + ph}
            stroke={hexA(v.t.colors.muted, 0.4)} strokeWidth={v.s(1.5)} />
          {/* the truth marker — the same value on both charts, so they can be compared */}
          <line x1={pad.l + pw * tv} y1={pad.t} x2={pad.l + pw * tv} y2={pad.t + ph}
            stroke={hexA(v.t.colors.muted, 0.55)} strokeWidth={v.s(1.5)} strokeDasharray={`${v.s(6)} ${v.s(6)}`} />
          <polyline points={pts.join(' ')} fill="none" stroke={c} strokeWidth={v.s(3.5)}
            strokeLinecap="round" strokeLinejoin="round"
            style={{filter: v.t.style.glow > 0 ? `drop-shadow(0 0 ${v.s(6)}px ${hexA(c, 0.5)})` : undefined}} />
          <circle cx={pad.l + pw * bu} cy={pad.t + ph * (1 - by)} r={v.s(10)} fill={c}
            stroke={v.t.colors.bg} strokeWidth={v.s(2)} />
        </svg>
        <div style={{position: 'absolute', left: pad.l + pw * tv, top: pad.t + ph + v.s(6),
          transform: 'translateX(-50%)'}}>
          <Cap v={v} sub={truth?.label} size={v.vertical ? 17 : 18} />
        </div>
        <div style={{position: 'absolute', left: pad.l, right: pad.r, bottom: v.s(4)}}>
          <Cap v={v} sub={it.sub} align="left" size={v.vertical ? 18 : 20} />
        </div>
      </div>
    );
  };

  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {curves.map((it, i) => (
        <Curve key={i} it={it}
          x={col ? 0 : i * (cellW + v.s(40))}
          y={col ? i * (cellH + v.s(40)) : 0} />
      ))}
    </div>
  );
};

// ── 5. ROUTER-GATE — a decision taken BEFORE the model ────────────────────────────────
//
// The routing argument only lands if the viewer sees WHERE the decision happens. A gate
// standing in front of two model boxes says it in one look: the text never reaches the
// wrong model, because something cheap read its script first. And the reason it must sit
// there — rather than being cleaned up afterwards by a confidence threshold — is the
// failure panel: an answer that is wrong every time, under a meter reading 95%.
//
// items: group 'in'   = an arriving state (label = the text, sub = its script)
//        group 'lane' = a checkpoint (label, sub, value = which lane 0|1)
//        group 'gate' = the detector (label, sub = its cost)
//        group 'fail' = the confident-and-wrong panel (label, sub, value = the meter 0-1)
const RouterGate: React.FC<LayaVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const ins = items.filter((i) => i.group === 'in');
  const lanes = items.filter((i) => i.group === 'lane');
  const gate = items.find((i) => i.group === 'gate');
  const fail = items.find((i) => i.group === 'fail');
  const base = arriveAt(frame, BASE(gate?.atWord ?? ins[0]?.atWord));

  const topH = fail ? h * 0.58 : h;
  const gateX = w * (v.vertical ? 0.5 : 0.46);
  const laneW = w * (v.vertical ? 0.42 : 0.3);

  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {/* the states queueing up on the left */}
      {ins.map((it, i) => {
        const on = arriveAt(frame, F(it.atWord));
        const y = topH * (0.2 + i * 0.3);
        const travel = travelAt(frame, F(it.atWord) + 6, 30);
        return (
          <div key={`i${i}`} style={{position: 'absolute', left: v.s(4) + (gateX - v.s(120)) * travel * 0.55,
            top: y, opacity: on, maxWidth: w * 0.3}}>
            <Chip v={v} text={it.label ?? ''} on={on} lit={i === 0} size={v.s(v.vertical ? 16 : 18)}
              wide={w * 0.28} />
            <div style={{marginTop: v.s(4)}}><Cap v={v} sub={it.sub} align="left" size={v.vertical ? 15 : 16} /></div>
          </div>
        );
      })}

      {/* THE GATE — drawn as a real gate: a post, a reader, and a cost written on it. */}
      {gate ? (() => {
        const on = arriveAt(frame, BASE(gate.atWord));
        return (
          <>
            <div style={{position: 'absolute', left: gateX, top: topH * 0.08, width: Math.max(2, v.s(3)),
              height: topH * 0.8, background: hexA(v.a, 0.75), transform: 'translateX(-50%)',
              opacity: on, boxShadow: v.glow(v.a, 16)}} />
            <div style={{position: 'absolute', left: gateX, top: topH * 0.88,
              transform: 'translateX(-50%)', textAlign: 'center', opacity: on, width: w * 0.36}}>
              <Cap v={v} title={gate.label} sub={gate.sub} size={v.vertical ? 19 : 22} color={v.a} />
            </div>
          </>
        );
      })() : null}

      {/* the two checkpoints on the right, one lit per arriving state */}
      {lanes.map((it, i) => {
        const on = arriveAt(frame, F(it.atWord));
        const lit = travelAt(frame, F(it.atWord) + 4) > 0.5;
        const y = topH * (0.14 + i * 0.42);
        const c = lit ? v.a : v.t.colors.muted;
        return (
          <div key={`l${i}`} style={{position: 'absolute', left: w - laneW, top: y, width: laneW,
            opacity: on, transform: `translateX(${(1 - on) * v.s(14)}px)`,
            padding: v.s(12), borderRadius: v.rad(10),
            background: hexA(c, lit ? 0.14 : 0.06),
            border: `${Math.max(1, v.s(lit ? 2 : 1))}px solid ${hexA(c, lit ? 0.9 : 0.34)}`,
            boxShadow: lit ? v.glow(c, 14) : 'none'}}>
            <Cap v={v} title={it.label} sub={it.sub} align="left" size={v.vertical ? 19 : 21}
              color={lit ? v.t.colors.text : v.t.colors.muted} />
          </div>
        );
      })}

      {/* THE FAILURE PANEL — why the gate cannot be replaced by a threshold afterwards. */}
      {fail ? (() => {
        const on = arriveAt(frame, F(fail.atWord));
        const meter = travelAt(frame, F(fail.atWord) + 4) * (fail.value ?? 0);
        const red = v.sem('red');
        return (
          <div style={{position: 'absolute', left: 0, top: h * 0.64, width: w, height: h * 0.34,
            opacity: on, transform: `translateY(${(1 - on) * v.s(16)}px)`,
            borderRadius: v.rad(12), border: `${Math.max(1, v.s(2))}px solid ${hexA(red, 0.6)}`,
            background: hexA(red, 0.08), padding: v.s(14),
            display: 'flex', alignItems: 'center', gap: v.s(18)}}>
            <div style={{flex: '1 1 auto', minWidth: 0}}>
              <Cap v={v} title={fail.label} sub={fail.sub} align="left" size={v.vertical ? 20 : 23} color={red} />
            </div>
            <div style={{flex: '0 0 auto', width: w * (v.vertical ? 0.34 : 0.26)}}>
              <div style={{height: v.s(14), borderRadius: v.rad(999),
                background: hexA(v.t.colors.muted, 0.18), overflow: 'hidden'}}>
                <div style={{width: `${meter * 100}%`, height: '100%', background: red,
                  boxShadow: v.glow(red, 12)}} />
              </div>
              <div style={{marginTop: v.s(6), textAlign: 'right'}}>
                <Cap v={v} title={`${(meter * 100).toFixed(1)}%`} sub="confidence" align="right"
                  size={v.vertical ? 24 : 28} color={red} />
              </div>
            </div>
          </div>
        );
      })() : null}
    </div>
  );
};

// ── 6. BUDGET-SPLIT — one fixed bar, cut into more and more pieces ────────────────────
//
// The one place Jev clearly wins, drawn honestly. The options in a question share a FIXED
// token budget, so the picture is a single bar of constant width being divided: at four
// options each slice is wide enough to hold a readable word; at seventy-seven the slices
// are slivers and the labels physically stop fitting. Nobody has to be told the labels
// "become indistinguishable" — they watch it happen at constant total width.
//
// items: group 'row' = one case (value = option count, label = the case, sub = the score)
const BudgetSplit: React.FC<LayaVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const rows = items.filter((i) => i.group === 'row');
  const note = items.find((i) => i.group === 'note');
  const base = arriveAt(frame, BASE(rows[0]?.atWord));

  const rowH = (h - (note ? v.s(72) : 0)) / Math.max(1, rows.length);
  const barH = rowH * 0.38;

  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {rows.map((r, i) => {
        const on = travelAt(frame, F(r.atWord), 38);
        const n = Math.max(1, Math.round(r.value ?? 1));
        // The SLICE COUNT grows on the anchor, so the division is an event.
        const shown = Math.max(1, Math.round(1 + (n - 1) * on));
        const gap = Math.max(v.s(0.5), Math.min(v.s(3), w / (shown * 14)));
        const sw = (w - gap * (shown - 1)) / shown;
        const lit = i === 0;
        const c = lit ? v.a : v.sem('red');
        const y = i * rowH;
        const font = Math.min(v.s(v.vertical ? 15 : 17), sw * 0.42);
        const words = String(r.text ?? 'label').split(',').map((x) => x.trim()).filter(Boolean);
        return (
          <React.Fragment key={`r${i}`}>
            <div style={{position: 'absolute', left: 0, top: y, width: w, opacity: base}}>
              <Cap v={v} title={r.label} sub={r.sub} align="left" size={v.vertical ? 19 : 22} color={c} />
            </div>
            {Array.from({length: shown}).map((_, k) => (
              <div key={k} style={{position: 'absolute', left: k * (sw + gap), top: y + rowH * 0.46,
                width: sw, height: barH, borderRadius: v.rad(4), opacity: base,
                background: hexA(c, 0.2), border: `${Math.max(0.5, v.s(1))}px solid ${hexA(c, 0.75)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'safe center', overflow: 'hidden'}}>
                {/* The label is drawn at the size the slice allows. When it no longer fits it
                    is CLIPPED rather than shrunk — that is the defect being taught. */}
                {/* `text` is a comma-separated label SET, cycled across the slices: four
                    identical words read as a rendering bug, and the beat is about whether a
                    label still fits, so the labels have to look like a real option list. */}
                <span style={{fontFamily: v.t.fonts.mono, fontSize: font, color: v.t.colors.text,
                  whiteSpace: 'nowrap', opacity: sw > v.s(26) ? 1 : 0.5}}>
                  {sw > v.s(26) ? words[k % words.length] : '·'}
                </span>
              </div>
            ))}
            <div style={{position: 'absolute', left: 0, top: y + rowH * 0.46 + barH + v.s(6),
              width: w, opacity: base}}>
              <Cap v={v} sub={`${shown} option${shown === 1 ? '' : 's'} sharing one fixed budget`} align="left"
                size={v.vertical ? 15 : 17} />
            </div>
          </React.Fragment>
        );
      })}
      {note ? (
        <div style={{position: 'absolute', left: 0, bottom: 0, width: w,
          opacity: arriveAt(frame, F(note.atWord))}}>
          <Cap v={v} title={note.label} sub={note.sub} align="left" size={v.vertical ? 19 : 22} />
        </div>
      ) : null}
    </div>
  );
};

// ── 7. FREE-SWAP — one string changes, and the envelope arrives somewhere else ────────
//
// "Drop-in replacement" is a phrase, and phrases are what LAW 0d exists to stop. The object
// here is a client with one string in it: the string is struck through and rewritten, and
// the same envelope — the same shape, the same fields — travels to a different building.
// Nothing about the client moves except that one line, which is the entire claim.
//
// items: group 'line' = the client line (label = code, sub = note, text 'from'|'to')
//        group 'server' = an endpoint (label, sub, text 'from'|'to')
//        group 'wire' = the envelope (label = the payload shape, sub = note)
const FreeSwap: React.FC<LayaVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const from = items.find((i) => i.group === 'line' && i.text === 'from');
  const to = items.find((i) => i.group === 'line' && i.text === 'to');
  const servers = items.filter((i) => i.group === 'server');
  const wire = items.find((i) => i.group === 'wire');
  const base = arriveAt(frame, BASE(from?.atWord));
  const swap = to ? travelAt(frame, F(to.atWord), 30) : 0;

  const boxW = v.vertical ? w : w * 0.44;
  const boxH = v.vertical ? h * 0.3 : h * 0.44;

  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {/* THE CLIENT — one code line, struck through and rewritten in place. */}
      <div style={{position: 'absolute', left: 0, top: 0, width: boxW, padding: v.s(16),
        borderRadius: v.rad(12), opacity: base,
        border: `${Math.max(1, v.s(1))}px solid ${hexA(v.t.colors.muted, 0.34)}`,
        background: hexA(v.t.colors.muted, 0.06)}}>
        <Cap v={v} sub="your client" align="left" size={v.vertical ? 16 : 18} />
        <div style={{marginTop: v.s(8), position: 'relative'}}>
          <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(v.vertical ? 17 : 19),
            color: hexA(v.t.colors.muted, 1 - swap * 0.55), whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {from?.label}
            {/* the strike DRAWS across, because a strike is a gesture, not a fade */}
            <span style={{position: 'absolute', left: 0, top: '52%', height: Math.max(1, v.s(2)),
              width: `${swap * 100}%`, background: v.sem('red'), display: 'block'}} />
          </div>
          <div style={{marginTop: v.s(8), fontFamily: v.t.fonts.mono, fontSize: v.s(v.vertical ? 17 : 19),
            color: v.a, opacity: swap, transform: `translateY(${(1 - swap) * v.s(8)}px)`,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {to?.label}
          </div>
        </div>
        <div style={{marginTop: v.s(10)}}>
          <Cap v={v} sub={swap > 0.5 ? to?.sub : from?.sub} align="left" size={v.vertical ? 15 : 17} />
        </div>
      </div>

      {/* THE ENVELOPE — identical shape whichever way it goes. */}
      {wire ? (() => {
        const on = arriveAt(frame, F(wire.atWord));
        const y = v.vertical ? h * 0.36 : boxH * 0.5;
        const x = v.vertical ? w * 0.5 : boxW + (w - boxW) * 0.12;
        return (
          <div style={{position: 'absolute', left: x, top: y, opacity: on,
            transform: `translate(${v.vertical ? '-50%' : '0'}, -50%)`}}>
            <Chip v={v} text={wire.label ?? ''} on={on} lit size={v.s(v.vertical ? 15 : 17)}
              wide={v.vertical ? w * 0.8 : (w - boxW) * 0.8} />
            <div style={{marginTop: v.s(5)}}>
              <Cap v={v} sub={wire.sub} align="left" size={v.vertical ? 14 : 16} />
            </div>
          </div>
        );
      })() : null}

      {/* THE TWO BUILDINGS — the old one dims, the new one lights, on the same swap. */}
      {servers.map((s, i) => {
        const isTo = s.text === 'to';
        const lit = isTo ? swap : 1 - swap;
        const on = arriveAt(frame, F(s.atWord));
        const c = isTo ? v.a : v.t.colors.muted;
        const y = v.vertical ? h * 0.52 + i * (boxH * 0.86) : i * (boxH + h * 0.12);
        return (
          <div key={`s${i}`} style={{position: 'absolute', right: 0, top: y,
            width: v.vertical ? w : w * 0.42, padding: v.s(14), borderRadius: v.rad(12),
            opacity: on * (0.35 + lit * 0.65),
            border: `${Math.max(1, v.s(lit > 0.5 ? 2 : 1))}px solid ${hexA(c, 0.3 + lit * 0.6)}`,
            background: hexA(c, 0.05 + lit * 0.12),
            boxShadow: lit > 0.5 ? v.glow(c, 16) : 'none'}}>
            <Cap v={v} title={s.label} sub={s.sub} align="left" size={v.vertical ? 19 : 22}
              color={lit > 0.5 ? v.t.colors.text : v.t.colors.muted} />
          </div>
        );
      })}
    </div>
  );
};

// ── registry ──────────────────────────────────────────────────────────────────────────
// An unregistered kind renders LOUDLY (LAW 0n): a typo must never resolve to a real but
// wrong picture. `scripts/check-viz-kinds.mjs` reads this object by name.
const LAYA_VIZ: Record<string, React.FC<LayaVizProps>> = {
  'one-pass': OnePass,
  'mask-slots': MaskSlots,
  'entropy-dial': EntropyDial,
  'proper-score': ProperScore,
  'router-gate': RouterGate,
  'budget-split': BudgetSplit,
  'free-swap': FreeSwap,
};

export const LayaViz: React.FC<LayaVizProps & {kind: string}> = ({kind, ...rest}) => {
  const R = LAYA_VIZ[kind];
  if (!R) return <UnknownKind kind={kind} registry="layaViz LAYA_VIZ" />;
  return <R {...rest} />;
};
