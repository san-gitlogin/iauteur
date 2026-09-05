import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {useTheme} from './themes';
import {SemColor} from './types';
import {useScale, useSem, hexA} from './ui';
import {stackBudget} from './dsaViz';
import {liveAt} from './linuxViz';
import {UnknownKind} from './unknownKind';
import {AssetIcon} from './AssetIcon';

/**
 * astra depictions — the pictures for the GPT-6 Astra review.
 *
 * A REVIEW IS NOT A TUTORIAL, so this is its own registry. uvViz draws packaging objects
 * and linuxViz draws filesystem objects; neither has a shape for "the same model measured
 * two different ways", which is the argument this video is built on. Filing these there
 * would make those files the dumping ground every future topic reaches for, which is how a
 * library ends up with 362 types routing through six archetypes (LAW 0n).
 *
 * THE RULE THESE ARE BUILT AGAINST. A model review defaults to cards: a number, a label, a
 * bar. The owner has rejected exactly that twice — *"five of the same card is not a design"*
 * and *"I need variations"* — and the Fable 5.1 cut still leaned on STAT_PANELS three times
 * in twenty-one scenes. So no depiction here is a row of values that lights up. Each one
 * names an OBJECT and makes the thing being argued the thing that MOVES (LAW 0j):
 * a notebook that is sealed shut versus one left open, a ladder whose top rung lights,
 * a stack of pages taller than the reader.
 *
 * Timing: every element resolves from its OWN atWord through the pure `liveAt`, so a list
 * resolves inside `.map()` with no hooks in a loop. No fixed frame interval appears in this
 * file (LAW 0i defect 1) — if an element moves, a spoken word moved it.
 *
 * Sizing: every depiction divides the REAL measured pane via `stackBudget()`, in DESIGN px,
 * scaled once at the end. Each `Math.min(budget * f, CONST)` is a ceiling for the crowded
 * case and must never bind in the ordinary one (LAW 0o) — `scripts/pane-fill.mjs` measures
 * the ink box against the pane and is the check, because a contact sheet makes an undersized
 * picture look composed.
 *
 * Motion: the owner asked for no harsh or abrupt shifts, so every arrival is an ease over
 * its own ramp and nothing snaps. `soft()` is the house curve here.
 */

export interface AstraVizItem {
  label?: string;
  text?: string;
  sub?: string;
  detail?: string;
  value?: number;
  color?: SemColor;
  atWord?: number;
  icon?: string;
  /** Marks the element the beat is arguing FOR, so a picture can carry a verdict
   *  without a second component saying it in words. */
  win?: boolean;
}

export interface AstraVizProps {
  items: AstraVizItem[];
  accent: SemColor;
  token?: string;
}

const useViz = (accent: SemColor) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  return {
    t, sem, scale, vertical,
    a: sem(accent),
    rad: (n = 8) => n * scale * t.style.cornerRadius,
    mono: (n = 18) => ({fontFamily: t.fonts.mono, fontSize: n * scale}),
    body: (n = 17) => ({fontFamily: t.fonts.body, fontSize: n * scale}),
    line: hexA(t.colors.panelBorder, 0.9),
    dim: hexA(t.colors.muted, 0.9),
    text: t.colors.text,
  };
};
type V = ReturnType<typeof useViz>;

/** The house easing. Nothing in this file arrives linearly — a linear entrance reads as a
 *  slide, and the owner's note was explicit: no harsh abrupt shifts. */
const soft = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));

/** A shared frame for every depiction: fills its pane, centres safely, never overflows. */
const Field: React.FC<{v: V; children: React.ReactNode; gap?: number}> = ({v, children, gap = 0}) => (
  <div style={{
    width: '100%', height: '100%', minWidth: 0, minHeight: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'safe center',
    gap: gap * v.scale, boxSizing: 'border-box',
  }}>{children}</div>
);

/** A caption under an object. Kept here so every picture labels its parts the same way. */
const Cap: React.FC<{v: V; children: React.ReactNode; size?: number; tone?: string}> =
({v, children, size = 13, tone}) => (
  <div style={{...v.mono(size), color: tone ?? v.dim, letterSpacing: 0.6,
               textAlign: 'center', lineHeight: 1.35, maxWidth: '100%'}}>{children}</div>
);

/**
 * A COMPARISON IS A SET OF SERIES, NOT A WINNER AND SOME LEFTOVERS.
 *
 * PAID FOR (owner, on a SHIPPED cut): *"Every single data comparison component which you
 * created, only has the colour for the top one and rest all had no colour at all but simply
 * percentage text, then at places where you compare with something else I see red."*
 *
 * Two defects, and the first is why the bars were literally not there:
 *
 * 1. `hexA` PARSES A HEX STRING. Feed it something already alpha'd and it does
 *    `parseInt('rg', 16)` on `rgba(...)` and returns NaN — so `hexA(hexA(muted, .85), .5)`
 *    is `rgba(NaN,NaN,NaN,0.5)`, which paints NOTHING. Every non-winner row took that
 *    branch. It rendered, it passed tsc, it passed every gate, and the bar was invisible.
 *    **So a colour is kept RAW here and alpha is applied once, at the point of use.**
 *    Never build a colour with hexA and then pass it to hexA again.
 *
 * 2. Colour was carrying a VERDICT (green = good, red = bad) when the beat is a
 *    comparison. Four models on one benchmark are four series; painting one green, two
 *    nothing and one red tells the viewer a story the data does not.
 *
 * So: `win` keeps the emphasis colour, an explicitly authored `color` is always obeyed, and
 * everything else takes the next hue from a theme-derived categorical ramp. Red is NOT in
 * that ramp — it stays reserved for something that is actually wrong.
 */
const SERIES: SemColor[] = ['blue', 'purple', 'orange', 'yellow'];
const seriesColor = (v: V, it: AstraVizItem, i: number): string =>
  it.win ? v.sem('green') : it.color ? v.sem(it.color) : v.sem(SERIES[i % SERIES.length]);

// ── 1. HARNESS SPLIT ─────────────────────────────────────────────────────────
/**
 * ONE model, TWO harnesses, two different answers — the argument the whole video rests on.
 *
 * ARC Prize scored GPT-6 Astra at 99.9% and at 62.7% on the same benchmark on the same day.
 * Every outlet printed the first number alone. A bar chart of 62.7 and 99.9 would say the
 * models differ; they do not. What differs is what the harness lets the model CARRY between
 * turns, so that is what is drawn: one notebook left open for anyone to read, one sealed
 * shut. The scores hang off the notebooks, not off an axis.
 */
const HarnessSplit: React.FC<AstraVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const [left, right] = [items[0], items[1]];
  const colW = Math.min(budget * 0.72, v.vertical ? 470 : 440);
  const bookH = Math.min(budget * 0.38, v.vertical ? 250 : 208);

  const Lane: React.FC<{it?: AstraVizItem; sealed: boolean}> = ({it, sealed}) => {
    if (!it) return null;
    const on = soft(liveAt(frame, it.atWord, 14));
    const col = sealed ? v.sem('purple') : v.a;
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 * v.scale,
        width: colW, opacity: 0.22 + on * 0.78,
        transform: `translateY(${(1 - on) * 14 * v.scale}px)`,
      }}>
        <Cap v={v} size={12} tone={hexA(col, 0.95)}>{it.label}</Cap>
        {/* THE NOTEBOOK. Open = ruled lines you can read. Sealed = a lid across it and a
            lock, because "opaque reasoning state between requests" is not a bar height. */}
        <div style={{
          width: colW, height: bookH, position: 'relative', boxSizing: 'border-box',
          border: `${2 * v.scale}px solid ${hexA(col, 0.75)}`,
          background: hexA(col, 0.08), borderRadius: v.rad(9), overflow: 'hidden',
        }}>
          {/* spine */}
          <div style={{position: 'absolute', left: bookH * 0.10, top: 0, bottom: 0,
                       width: 2 * v.scale, background: hexA(col, 0.45)}} />
          {[0, 1, 2, 3].map((i) => {
            const ruled = soft(liveAt(frame, it.atWord == null ? undefined : it.atWord + 1 + i * 0.6, 10));
            return (
              <div key={i} style={{
                position: 'absolute', left: bookH * 0.22, right: bookH * 0.14,
                top: bookH * (0.20 + i * 0.17), height: 3 * v.scale, borderRadius: 999,
                background: hexA(col, 0.55),
                transform: `scaleX(${sealed ? 0 : ruled})`, transformOrigin: 'left center',
              }} />
            );
          })}
          {sealed ? (
            <>
              {/* the lid slides across and stops — the gesture IS the opacity */}
              <div style={{
                position: 'absolute', inset: 0, background: hexA(col, 0.30),
                backdropFilter: 'blur(2px)',
                transform: `translateX(${(1 - on) * -100}%)`,
              }} />
              <div style={{position: 'absolute', inset: 0, display: 'flex',
                           alignItems: 'center', justifyContent: 'center', opacity: on}}>
                <AssetIcon bare asset="lucide:lock" size={bookH * 0.30} tint={hexA(col, 0.95)} />
              </div>
            </>
          ) : null}
        </div>
        {it.sub ? <Cap v={v} size={11}>{it.sub}</Cap> : null}
        {/* the score plate hangs off the notebook it came from */}
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8 * v.scale,
          padding: `${5 * v.scale}px ${12 * v.scale}px`,
          border: `${1.6 * v.scale}px solid ${hexA(col, 0.6)}`,
          background: hexA(col, 0.12), borderRadius: v.rad(7),
        }}>
          <div style={{...v.mono(Math.max(20, bookH * 0.21)), fontWeight: 800, color: v.text}}>{it.text}</div>
          {it.detail ? (
            <div style={{...v.mono(Math.max(12, bookH * 0.12)), color: v.sem('red'), fontWeight: 700}}>
              {it.detail}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <Field v={v} gap={10}>
      {/* the one model both lanes come from — drawn once, so "same model" is literal */}
      <div style={{
        padding: `${6 * v.scale}px ${16 * v.scale}px`, borderRadius: v.rad(999),
        border: `${2 * v.scale}px solid ${hexA(v.a, 0.8)}`, background: hexA(v.a, 0.12),
        ...v.mono(15), fontWeight: 800, color: v.text, letterSpacing: 0.8,
      }}>{token ?? 'one model'}</div>
      {/* the fork: two legs from one trunk, drawn not implied */}
      <svg width={colW * 2 + 46 * v.scale} height={34 * v.scale} style={{display: 'block'}}>
        <path
          d={`M ${colW + 23 * v.scale} 0 V ${14 * v.scale}
              M ${colW * 0.5} ${34 * v.scale} V ${14 * v.scale} H ${colW * 1.5 + 46 * v.scale} V ${34 * v.scale}`}
          fill="none" stroke={hexA(v.a, 0.55)} strokeWidth={2 * v.scale} />
      </svg>
      <div style={{display: 'flex', gap: 46 * v.scale, alignItems: 'flex-start'}}>
        <Lane it={left} sealed={false} />
        <Lane it={right} sealed />
      </div>
    </Field>
  );
};

// ── 2. COST PLANE ────────────────────────────────────────────────────────────
/**
 * Score against cost, with a person plotted on it.
 *
 * The headline "99.9% on a test of general intelligence" only means something next to what
 * a person scores and what each attempt costs. ARC Prize publishes both: humans solve 100%
 * of these environments at about $12.78 a game. Put on one plane, the argument draws itself
 * — the human sits top-left where cheap and perfect meet, and every Astra run is somewhere
 * off to the right for thousands of dollars.
 *
 * LAW 0m.2: real axes, real ticks, a unit on each, and the numbers ON the dots. A cost axis
 * spanning $12 to $26,000 is logarithmic or it is a single dot and a wall.
 */
const CostPlane: React.FC<AstraVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const H = Math.min(budget * 0.96, v.vertical ? 640 : 540);
  const W = Math.min(budget * 3.0, v.vertical ? 720 : 1560);
  const padL = 64 * v.scale, padB = 52 * v.scale, padT = 18 * v.scale, padR = 150 * v.scale;
  const plotW = W - padL - padR, plotH = H - padT - padB;

  const cost = (it: AstraVizItem) => Number(String(it.text ?? '0').replace(/[^0-9.]/g, '')) || 0.01;
  const lg = (n: number) => Math.log10(Math.max(n, 1));
  const TICKS = [10, 100, 1000, 10000, 100000];
  const x = (c: number) => (lg(c) - lg(10)) / (lg(100000) - lg(10)) * plotW;
  const y = (s: number) => plotH - (s / 100) * plotH;

  return (
    <Field v={v}>
      <div style={{width: W, height: H, position: 'relative'}}>
        <svg width={W} height={H} style={{display: 'block', overflow: 'visible'}}>
          {/* gridlines + score axis, with units named */}
          {[0, 25, 50, 75, 100].map((s) => (
            <g key={s}>
              <line x1={padL} x2={padL + plotW} y1={padT + y(s)} y2={padT + y(s)}
                    stroke={hexA(v.t.colors.panelBorder, s === 100 ? 1 : 0.55)}
                    strokeWidth={1 * v.scale} strokeDasharray={s === 100 ? undefined : `${3 * v.scale} ${5 * v.scale}`} />
              <text x={padL - 9 * v.scale} y={padT + y(s) + 4 * v.scale} textAnchor="end"
                    fontFamily={v.t.fonts.mono} fontSize={13 * v.scale} fill={v.dim}>{s}%</text>
            </g>
          ))}
          {TICKS.map((c) => (
            <g key={c}>
              <line x1={padL + x(c)} x2={padL + x(c)} y1={padT} y2={padT + plotH}
                    stroke={hexA(v.t.colors.panelBorder, 0.4)} strokeWidth={1 * v.scale} />
              <text x={padL + x(c)} y={H - padB + 22 * v.scale} textAnchor="middle"
                    fontFamily={v.t.fonts.mono} fontSize={13 * v.scale} fill={v.dim}>
                {c >= 1000 ? `$${c / 1000}k` : `$${c}`}
              </text>
            </g>
          ))}
          <text x={padL + plotW / 2} y={H - 6 * v.scale} textAnchor="middle"
                fontFamily={v.t.fonts.mono} fontSize={12 * v.scale} fill={v.dim}
                letterSpacing={1.2}>cost per attempt, log scale →</text>
        </svg>
        {/* the dots are HTML over the plot: a circle in a stretched viewBox is an ellipse */}
        {items.map((it, i) => {
          const on = soft(liveAt(frame, it.atWord, 16));
          const col = it.win ? v.sem('green') : it.color ? v.sem(it.color) : v.a;
          const px = padL + x(cost(it)), py = padT + y(it.value ?? 0);
          const r = (it.win ? 15 : 12) * v.scale;
          return (
            <div key={i} style={{position: 'absolute', left: px, top: py, opacity: on}}>
              <div style={{
                position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2,
                borderRadius: 999, background: hexA(col, 0.9),
                boxShadow: it.win ? `0 0 ${16 * v.scale}px ${hexA(col, 0.55)}` : undefined,
                transform: `scale(${0.4 + on * 0.6})`,
              }} />
              <div style={{
                position: 'absolute', left: r + 7 * v.scale, top: -9 * v.scale,
                whiteSpace: 'nowrap',
              }}>
                <div style={{...v.mono(14), fontWeight: 800, color: v.text}}>{it.label}</div>
                <div style={{...v.mono(13), color: hexA(col, 0.95)}}>
                  {it.value}% · {it.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Field>
  );
};

// ── 3. OPERATOR DESK ─────────────────────────────────────────────────────────
/**
 * The reframe the whole review turns on: a chatbot ANSWERS, an operator ACTS.
 *
 * Saying "it is a computer operator, not a chatbot" over a styled sentence is LAW 0d's
 * defect — the viewer builds the picture, from their own life, not ours. So it is drawn:
 * on the left a chat bubble that fills with a reply and then just sits there; on the right
 * a desk of real application windows with a cursor travelling between them, each one
 * ticking off as it is dealt with. The difference the beat claims is the difference that
 * MOVES on screen.
 */
const OperatorDesk: React.FC<AstraVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const winH = Math.min(budget * 0.34, v.vertical ? 210 : 172);
  const winW = Math.min(budget * 0.64, v.vertical ? 420 : 330);
  const apps = items.slice(0, 4);

  // The cursor sits on whichever window has most recently come alive, and travels there.
  // Its position is derived from anchors only — no interval anywhere.
  const liveIdx = apps.reduce((acc, it, i) => (soft(liveAt(frame, it.atWord, 12)) > 0.5 ? i : acc), -1);
  const prevIdx = Math.max(0, liveIdx - 1);
  const travel = liveIdx < 0 ? 0
    : soft(liveAt(frame, apps[liveIdx]?.atWord, 18));
  const row = (i: number) => Math.floor(i / 2), col = (i: number) => i % 2;
  const cx = (i: number) => col(i) * (winW + 14 * v.scale) + winW * 0.5;
  const cy = (i: number) => row(i) * (winH + 14 * v.scale) + winH * 0.5;
  const curX = liveIdx < 0 ? cx(0) : cx(prevIdx) + (cx(liveIdx) - cx(prevIdx)) * travel;
  const curY = liveIdx < 0 ? cy(0) : cy(prevIdx) + (cy(liveIdx) - cy(prevIdx)) * travel;

  const bubbleOn = soft(liveAt(frame, items[0]?.atWord, 14));

  return (
    <Field v={v} gap={0}>
      <div style={{display: 'flex', alignItems: 'center', gap: 26 * v.scale, maxWidth: '100%'}}>
        {/* LEFT — the chatbot. It answers, and then nothing else happens. */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 8 * v.scale, alignItems: 'center'}}>
          <div style={{
            width: winW * 0.72, minHeight: winH * 0.92, boxSizing: 'border-box',
            padding: `${9 * v.scale}px ${11 * v.scale}px`,
            border: `${1.8 * v.scale}px solid ${hexA(v.t.colors.muted, 0.5)}`,
            background: hexA(v.t.colors.muted, 0.07),
            borderRadius: `${v.rad(10)}px ${v.rad(10)}px ${v.rad(10)}px ${v.rad(2)}px`,
            display: 'flex', flexDirection: 'column', gap: 5 * v.scale, justifyContent: 'center',
          }}>
            {[0.95, 0.8, 0.55].map((w, i) => (
              <div key={i} style={{
                height: 5 * v.scale, borderRadius: 999, width: `${w * 100}%`,
                background: hexA(v.t.colors.muted, 0.55),
                transform: `scaleX(${soft(interpolate(bubbleOn, [i * 0.22, i * 0.22 + 0.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}))})`,
                transformOrigin: 'left center',
              }} />
            ))}
          </div>
          <Cap v={v} size={11}>{token ?? 'answers you'}</Cap>
        </div>

        <div style={{...v.mono(20), color: hexA(v.a, 0.7), fontWeight: 800}}>vs</div>

        {/* RIGHT — the desk. Windows, and a cursor that actually goes to them. */}
        <div style={{position: 'relative'}}>
          <div style={{
            display: 'grid', gridTemplateColumns: `repeat(2, ${winW}px)`,
            gap: 14 * v.scale,
          }}>
            {apps.map((it, i) => {
              const on = soft(liveAt(frame, it.atWord, 14));
              const done = soft(liveAt(frame, it.atWord == null ? undefined : it.atWord + 3, 12));
              return (
                <div key={i} style={{
                  width: winW, height: winH, boxSizing: 'border-box',
                  border: `${1.8 * v.scale}px solid ${hexA(v.a, 0.25 + on * 0.55)}`,
                  background: hexA(v.a, 0.05 + on * 0.09),
                  borderRadius: v.rad(8), overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  opacity: 0.35 + on * 0.65,
                }}>
                  {/* title bar — three dots, so it reads as a window not a card */}
                  <div style={{
                    height: winH * 0.20, display: 'flex', alignItems: 'center',
                    gap: 4 * v.scale, padding: `0 ${8 * v.scale}px`,
                    background: hexA(v.a, 0.12), borderBottom: `${1 * v.scale}px solid ${hexA(v.a, 0.3)}`,
                  }}>
                    {[0, 1, 2].map((k) => (
                      <div key={k} style={{width: 4 * v.scale, height: 4 * v.scale, borderRadius: 999,
                                           background: hexA(v.t.colors.muted, 0.6)}} />
                    ))}
                    <div style={{...v.mono(Math.max(9, winH * 0.11)), color: v.dim,
                                 marginLeft: 4 * v.scale, whiteSpace: 'nowrap',
                                 overflow: 'hidden', textOverflow: 'ellipsis'}}>{it.label}</div>
                  </div>
                  <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 8 * v.scale,
                               padding: `0 ${9 * v.scale}px`, minWidth: 0}}>
                    {it.icon ? <AssetIcon bare asset={it.icon} size={winH * 0.30} tint={hexA(v.a, 0.9)} /> : null}
                    <div style={{...v.mono(Math.max(10, winH * 0.13)), color: v.text, minWidth: 0,
                                 whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {it.sub}
                    </div>
                    {/* the tick lands after the cursor arrives, so the order reads as cause */}
                    <div style={{marginLeft: 'auto', opacity: done, transform: `scale(${0.5 + done * 0.5})`}}>
                      <AssetIcon bare asset="lucide:check" size={winH * 0.22} tint={v.sem('green')} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* the cursor */}
          <div style={{
            position: 'absolute', left: curX, top: curY, pointerEvents: 'none',
            opacity: liveIdx < 0 ? 0 : 1,
            transform: 'translate(-10%, -10%)',
          }}>
            <AssetIcon bare asset="lucide:mouse-pointer-2" size={22 * v.scale} tint={v.sem('green')} />
          </div>
        </div>
      </div>
    </Field>
  );
};

// ── 4. BENCH ROW ─────────────────────────────────────────────────────────────
/**
 * One benchmark row from a published table, drawn as a race rather than a list.
 *
 * The table on OpenAI's page is six columns of percentages; read aloud it is noise (LAW 0f
 * corollary 5). Here each model is a lane, the bar grows on the word that names the model,
 * and the LEADER takes the marker — so when Astra is not the leader, the picture says so
 * before the narration does. `win` is authored, not computed from the maximum, because the
 * beat sometimes argues about second place.
 */
const BenchRow: React.FC<AstraVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const rows = items.slice(0, 6);
  const gap = 9 * v.scale;
  const barH = Math.min((budget * 0.88 - gap * (rows.length - 1)) / Math.max(1, rows.length),
                        v.vertical ? 132 : 104);
  const labW = Math.min(budget * 0.44, v.vertical ? 300 : 280);
  const trackW = Math.min(budget * 1.32, v.vertical ? 560 : 640);
  const max = Math.max(100, ...rows.map((r) => r.value ?? 0));

  return (
    <Field v={v}>
      {token ? <Cap v={v} size={12} tone={hexA(v.a, 0.95)}>{token}</Cap> : null}
      <div style={{display: 'flex', flexDirection: 'column', gap, marginTop: token ? 10 * v.scale : 0}}>
        {rows.map((it, i) => {
          const on = soft(liveAt(frame, it.atWord, 16));
          const col = seriesColor(v, it, i);
          const w = ((it.value ?? 0) / max) * trackW * on;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 11 * v.scale}}>
              <div style={{
                width: labW, textAlign: 'right', ...v.mono(Math.max(11, barH * 0.24)),
                color: it.win ? v.text : hexA(col, 0.95), fontWeight: it.win ? 800 : 700,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{it.label}</div>
              <div style={{width: trackW, height: barH, position: 'relative',
                           background: hexA(v.t.colors.panelBorder, 0.18), borderRadius: v.rad(5)}}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: w,
                  background: hexA(col, it.win ? 0.9 : 0.72), borderRadius: v.rad(5),
                  boxShadow: it.win ? `0 0 ${12 * v.scale}px ${hexA(col, 0.4)}` : undefined,
                }} />
                <div style={{
                  position: 'absolute', left: w + 9 * v.scale, top: '50%',
                  transform: 'translateY(-50%)', opacity: on,
                  ...v.mono(Math.max(12, barH * 0.30)), fontWeight: 800,
                  color: hexA(col, 0.98), whiteSpace: 'nowrap',
                }}>
                  {it.text}
                </div>
                {/* the leader's marker rides ON the bar, where the eye already is */}
                {it.win ? (
                  <div style={{position: 'absolute', left: 8 * v.scale, top: '50%',
                               transform: 'translateY(-50%)', opacity: on}}>
                    <AssetIcon bare asset="lucide:crown" size={barH * 0.40} tint={col} />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Field>
  );
};

// ── 5. PAGE STACK ────────────────────────────────────────────────────────────
/**
 * A million tokens, as a height rather than a number.
 *
 * "1,050,000 tokens" means nothing to someone who has not called an API, and Artificial
 * Analysis itself translates it — about 1500 A4 pages. So the picture is the paper: a stack
 * that keeps growing past a human silhouette while the count runs up beside it. The number
 * is on screen because the voice says it (the narration/visual gate requires that), but the
 * HEIGHT is what does the teaching.
 */
const PageStack: React.FC<AstraVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const H = Math.min(budget * 0.94, v.vertical ? 660 : 520);
  const it = items[0] ?? {};
  const on = soft(liveAt(frame, it.atWord, 34));
  // "1,050,000 tokens" and "about 1500 A4 pages" are two sentences, so the caption above
  // the stack lands on its own word rather than riding in with the count.
  const capOn = soft(liveAt(frame, (it as {detailAtWord?: number}).detailAtWord ?? it.atWord, 18));
  const sheets = 26;
  const sheetW = Math.min(budget * 0.36, v.vertical ? 240 : 196);
  const sheetH = H / sheets;
  const shown = Math.round(sheets * on);
  const count = Math.round((it.value ?? 0) * on);

  return (
    <Field v={v}>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 26 * v.scale, height: H}}>
        {/* the reader, for scale — a person is the unit that makes a height mean something */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                     justifyContent: 'flex-end', height: '100%', gap: 6 * v.scale}}>
          <AssetIcon bare asset="lucide:user-round" size={H * 0.22} tint={hexA(v.t.colors.muted, 0.8)} />
          <Cap v={v} size={11}>one reader</Cap>
        </div>
        <div style={{position: 'relative', width: sheetW, height: H,
                     display: 'flex', flexDirection: 'column-reverse'}}>
          {Array.from({length: sheets}).map((_, i) => {
            const live = i < shown;
            const settle = soft(interpolate(on, [i / sheets, i / sheets + 0.08], [0, 1],
              {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
            return (
              <div key={i} style={{
                width: sheetW, height: sheetH,
                borderTop: `${1.1 * v.scale}px solid ${hexA(v.a, live ? 0.55 : 0.12)}`,
                background: hexA(v.a, live ? 0.10 + (i / sheets) * 0.10 : 0.02),
                opacity: live ? 1 : 0.18,
                transform: `translateX(${(1 - settle) * 22 * v.scale}px)`,
                boxSizing: 'border-box',
              }} />
            );
          })}
          <div style={{position: 'absolute', left: '50%', top: -26 * v.scale,
                       transform: 'translateX(-50%)', whiteSpace: 'nowrap', opacity: capOn}}>
            <Cap v={v} size={12} tone={hexA(v.a, 0.95)}>{token ?? 'about 1500 A4 pages'}</Cap>
          </div>
        </div>
        {/* the count, running up as the paper piles */}
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center',
                     height: '100%', gap: 4 * v.scale}}>
          <div style={{...v.mono(Math.max(24, H * 0.11)), fontWeight: 800, color: v.text,
                       fontVariantNumeric: 'tabular-nums'}}>
            {count.toLocaleString('en-US')}
          </div>
          <Cap v={v} size={12}>{it.label ?? 'tokens it can hold at once'}</Cap>
          {it.sub ? <Cap v={v} size={11}>{it.sub}</Cap> : null}
        </div>
      </div>
    </Field>
  );
};

// ── 6. THRESHOLD LADDER ──────────────────────────────────────────────────────
/**
 * A safety classification, as rungs with one of them lit.
 *
 * OpenAI's Preparedness Framework grades a capability Low / Medium / High / Critical, and
 * Astra is the first model to reach the top rung for cybersecurity. A row of labelled chips
 * would be a caption list (LAW 0n). A LADDER carries the fact that the rungs are ordered and
 * that this one is the last one — the climb is the argument.
 */
const ThresholdLadder: React.FC<AstraVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const rungs = items.slice(0, 5);
  const gap = 8 * v.scale;
  const rungH = Math.min((budget * 0.86 - gap * (rungs.length - 1)) / Math.max(1, rungs.length),
                         v.vertical ? 126 : 98);
  const W = Math.min(budget * 1.12, v.vertical ? 500 : 560);

  return (
    <Field v={v}>
      {token ? <Cap v={v} size={12} tone={hexA(v.a, 0.9)}>{token}</Cap> : null}
      <div style={{position: 'relative', display: 'flex', flexDirection: 'column-reverse',
                   gap, marginTop: token ? 12 * v.scale : 0}}>
        {/* the two rails, so it reads as a ladder and not a stack of pills */}
        {[0, 1].map((s) => (
          <div key={s} style={{
            position: 'absolute', top: -6 * v.scale, bottom: -6 * v.scale, width: 3 * v.scale,
            left: s === 0 ? -10 * v.scale : undefined, right: s === 1 ? -10 * v.scale : undefined,
            background: hexA(v.t.colors.panelBorder, 0.6), borderRadius: 999,
          }} />
        ))}
        {rungs.map((it, i) => {
          const on = soft(liveAt(frame, it.atWord, 14));
          const top = !!it.win;
          const col = top ? v.sem('red') : v.a;
          return (
            <div key={i} style={{
              width: W, height: rungH, boxSizing: 'border-box',
              display: 'flex', alignItems: 'center', gap: 10 * v.scale,
              padding: `0 ${13 * v.scale}px`,
              border: `${(top ? 2.4 : 1.6) * v.scale}px solid ${hexA(col, 0.2 + on * 0.6)}`,
              background: hexA(col, (top ? 0.14 : 0.05) * (0.3 + on * 0.7)),
              borderRadius: v.rad(6),
              boxShadow: top && on > 0.5 ? `0 0 ${18 * v.scale}px ${hexA(col, 0.35 * on)}` : undefined,
              opacity: 0.3 + on * 0.7,
            }}>
              <div style={{...v.mono(Math.max(11, rungH * 0.26)), fontWeight: 800,
                           color: top ? col : v.dim, letterSpacing: 0.8, minWidth: 0}}>
                {it.label}
              </div>
              {it.sub ? (
                <div style={{...v.mono(Math.max(10, rungH * 0.19)), color: v.dim,
                             marginLeft: 'auto', textAlign: 'right', minWidth: 0,
                             whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {it.sub}
                </div>
              ) : null}
              {top ? (
                <div style={{opacity: on}}>
                  <AssetIcon bare asset="lucide:shield-alert" size={rungH * 0.42} tint={col} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Field>
  );
};

// ── 7. SEALED TRACE ──────────────────────────────────────────────────────────
/**
 * Recurrent depth, and why researchers call it a monitorability problem.
 *
 * This is the architectural change almost none of the coverage touched, and it is invisible
 * by nature — which is exactly the point, so the picture has to make the absence visible.
 * Left: reasoning that emits steps you can read. Right: the same work happening inside a
 * closed drum that turns, emitting only an answer. The drum's rotation is driven by the
 * anchor, so the loop is running while the voice describes it and nothing leaks out.
 */
const SealedTrace: React.FC<AstraVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const boxH = Math.min(budget * 0.72, v.vertical ? 420 : 344);
  const boxW = Math.min(budget * 0.76, v.vertical ? 420 : 396);
  const openIt = items[0], sealedIt = items[1];
  const openOn = soft(liveAt(frame, openIt?.atWord, 16));
  const sealOn = soft(liveAt(frame, sealedIt?.atWord, 16));

  return (
    <Field v={v} gap={12}>
      <div style={{display: 'flex', gap: 34 * v.scale, alignItems: 'flex-start'}}>
        {/* OPEN — every step legible */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 * v.scale}}>
          <Cap v={v} size={12} tone={hexA(v.a, 0.95)}>{openIt?.label}</Cap>
          <div style={{
            width: boxW, height: boxH, boxSizing: 'border-box', padding: 12 * v.scale,
            border: `${1.8 * v.scale}px solid ${hexA(v.a, 0.6)}`, background: hexA(v.a, 0.06),
            borderRadius: v.rad(9), display: 'flex', flexDirection: 'column',
            gap: 7 * v.scale, justifyContent: 'safe center',
          }}>
            {[0, 1, 2, 3].map((i) => {
              const st = soft(interpolate(openOn, [i * 0.18, i * 0.18 + 0.35], [0, 1],
                {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
              return (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 7 * v.scale, opacity: st}}>
                  <div style={{width: 5 * v.scale, height: 5 * v.scale, borderRadius: 999,
                               background: hexA(v.a, 0.9), flex: '0 0 auto'}} />
                  <div style={{height: 5 * v.scale, borderRadius: 999,
                               width: `${[86, 70, 92, 58][i]}%`,
                               background: hexA(v.a, 0.5),
                               transform: `scaleX(${st})`, transformOrigin: 'left center'}} />
                </div>
              );
            })}
          </div>
          {openIt?.sub ? <Cap v={v} size={11}>{openIt.sub}</Cap> : null}
        </div>

        {/* SEALED — a drum that turns, and one answer out of the bottom */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 * v.scale}}>
          <Cap v={v} size={12} tone={hexA(v.sem('purple'), 0.95)}>{sealedIt?.label}</Cap>
          <div style={{
            width: boxW, height: boxH, boxSizing: 'border-box', position: 'relative',
            border: `${1.8 * v.scale}px solid ${hexA(v.sem('purple'), 0.7)}`,
            background: hexA(v.sem('purple'), 0.08), borderRadius: v.rad(9), overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* the loop: a ring whose sweep is tied to the anchor, so it turns as it is described */}
            <svg width={boxH * 0.60} height={boxH * 0.60} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none"
                      stroke={hexA(v.sem('purple'), 0.28)} strokeWidth={7} />
              <circle cx="50" cy="50" r="38" fill="none"
                      stroke={hexA(v.sem('purple'), 0.95)} strokeWidth={7} strokeLinecap="round"
                      strokeDasharray={`${sealOn * 150} 400`}
                      transform={`rotate(${-90 + sealOn * 300} 50 50)`} />
            </svg>
            <div style={{position: 'absolute', inset: 0, display: 'flex',
                         alignItems: 'center', justifyContent: 'center'}}>
              <div style={{...v.mono(Math.max(11, boxH * 0.06)), color: hexA(v.sem('purple'), 0.95),
                           fontWeight: 800, letterSpacing: 1}}>{token ?? 'no trace'}</div>
            </div>
          </div>
          {sealedIt?.sub ? <Cap v={v} size={11}>{sealedIt.sub}</Cap> : null}
        </div>
      </div>
    </Field>
  );
};

// ── 8. TASK CLOCK ────────────────────────────────────────────────────────────
/**
 * More finished, in less time — the OSWorld claim, as two runs racing.
 *
 * Astra scores 72.6% at about 40 minutes a task; the model it replaces scores 65.7% at about
 * 75. Read aloud that is four numbers and the shape is lost (LAW 0f corollary 3). Drawn as
 * two lanes filling left to right against a shared time ruler, the two facts land as one:
 * the shorter lane also gets further.
 */
const TaskClock: React.FC<AstraVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const lanes = items.slice(0, 2);
  const trackW = Math.min(budget * 1.62, v.vertical ? 600 : 800);
  const laneH = Math.min(budget * 0.30, v.vertical ? 160 : 132);
  const maxMin = Math.max(...lanes.map((l) => Number(String(l.detail ?? '0').replace(/[^0-9.]/g, '')) || 0), 80);

  return (
    <Field v={v} gap={14}>
      {token ? <Cap v={v} size={12} tone={hexA(v.a, 0.95)}>{token}</Cap> : null}
      <div style={{display: 'flex', flexDirection: 'column', gap: 16 * v.scale}}>
        {lanes.map((it, i) => {
          const on = soft(liveAt(frame, it.atWord, 22));
          // THE TIME IS ITS OWN MOMENT. "finishes 65.7% of them, at roughly 75 minutes a
          // task" is two facts in two clauses, so the bar and the flag get their own
          // anchors — `detailAtWord` falls back to the bar's when a beat says both at once.
          const clockOn = soft(liveAt(frame, (it as {detailAtWord?: number}).detailAtWord ?? it.atWord, 16));
          const mins = Number(String(it.detail ?? '0').replace(/[^0-9.]/g, '')) || 0;
          const col = seriesColor(v, it, i);
          const timeFrac = mins / maxMin;
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 5 * v.scale}}>
              <div style={{display: 'flex', justifyContent: 'space-between', width: trackW}}>
                <div style={{...v.mono(12), fontWeight: 800, color: hexA(col, 0.98)}}>{it.label}</div>
                <div style={{...v.mono(12), color: hexA(col, 0.95), fontWeight: 700}}>
                  <span style={{opacity: on}}>{it.text}</span>
                  <span style={{opacity: clockOn}}> · {it.detail}</span>
                </div>
              </div>
              {/* the lane: fills to the SCORE, and stops at the TIME it took */}
              <div style={{width: trackW, height: laneH, position: 'relative',
                           background: hexA(v.t.colors.panelBorder, 0.16), borderRadius: v.rad(5)}}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: trackW * ((it.value ?? 0) / 100) * on,
                  background: hexA(col, it.win ? 0.88 : 0.7), borderRadius: v.rad(5),
                }} />
                {/* the finish flag sits where the clock stopped */}
                <div style={{
                  position: 'absolute', left: trackW * timeFrac, top: -7 * v.scale, bottom: -7 * v.scale,
                  width: 2 * v.scale, background: hexA(col, 0.9), opacity: clockOn,
                }} />
                <div style={{position: 'absolute', left: trackW * timeFrac, top: -22 * v.scale,
                             transform: 'translateX(-50%)', opacity: clockOn}}>
                  <AssetIcon bare asset="lucide:flag" size={14 * v.scale} tint={hexA(col, 0.95)} />
                </div>
              </div>
            </div>
          );
        })}
        {/* the shared ruler, so "faster" is measured against something */}
        <div style={{width: trackW, position: 'relative', height: 20 * v.scale}}>
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <div key={f} style={{position: 'absolute', left: `${f * 100}%`, top: 0,
                                 transform: 'translateX(-50%)', ...v.mono(10), color: v.dim}}>
              {Math.round(f * maxMin)}m
            </div>
          ))}
        </div>
      </div>
    </Field>
  );
};

// ── 9. RATE PLATE ────────────────────────────────────────────────────────────
/**
 * What a million tokens costs, as tags on a plate rather than four numbers in a row.
 *
 * The owner rejected a bar chart for exactly this shape once already — four similar bars
 * bury the only fact worth having. Here each rate is a hanging price tag, and the cached
 * rate is drawn STRUCK THROUGH against the full one, because the whole point of caching is
 * that it replaces the price above it.
 */
const RatePlate: React.FC<AstraVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const tags = items.slice(0, 4);
  const tagW = Math.min(budget * 0.46, v.vertical ? 300 : 262);
  const tagH = Math.min(budget * 0.44, v.vertical ? 240 : 218);

  return (
    <Field v={v} gap={12}>
      {token ? <Cap v={v} size={12} tone={hexA(v.a, 0.95)}>{token}</Cap> : null}
      <div style={{display: 'flex', gap: 14 * v.scale, flexWrap: 'wrap', justifyContent: 'center'}}>
        {tags.map((it, i) => {
          const on = soft(liveAt(frame, it.atWord, 15));
          const col = it.win ? v.sem('green') : it.color ? v.sem(it.color) : v.a;
          return (
            <div key={i} style={{
              width: tagW, height: tagH, position: 'relative', boxSizing: 'border-box',
              opacity: 0.25 + on * 0.75,
              transform: `translateY(${(1 - on) * 12 * v.scale}px) rotate(${(1 - on) * -2}deg)`,
              transformOrigin: 'top center',
            }}>
              {/* the string and the hole — what makes it a tag and not a card */}
              <div style={{position: 'absolute', left: '50%', top: 0, width: 1.6 * v.scale,
                           height: 12 * v.scale, background: hexA(col, 0.6),
                           transform: 'translateX(-50%)'}} />
              <div style={{
                position: 'absolute', left: 0, right: 0, top: 12 * v.scale, bottom: 0,
                border: `${1.8 * v.scale}px solid ${hexA(col, 0.7)}`,
                background: hexA(col, 0.09), borderRadius: v.rad(9),
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'safe center', gap: 3 * v.scale, padding: 8 * v.scale,
                boxSizing: 'border-box',
              }}>
                <div style={{width: 7 * v.scale, height: 7 * v.scale, borderRadius: 999,
                             border: `${1.4 * v.scale}px solid ${hexA(col, 0.7)}`,
                             marginBottom: 2 * v.scale}} />
                <div style={{...v.mono(Math.max(20, tagH * 0.26)), fontWeight: 800, color: v.text}}>
                  {it.text}
                </div>
                <Cap v={v} size={Math.max(10, tagH * 0.10)}>{it.label}</Cap>
                {/* the price this one replaces, struck through — the strike IS the saving */}
                {it.detail ? (
                  <div style={{position: 'relative', marginTop: 2 * v.scale}}>
                    <div style={{...v.mono(Math.max(10, tagH * 0.11)), color: v.dim}}>{it.detail}</div>
                    <div style={{
                      position: 'absolute', left: 0, top: '52%', height: 1.6 * v.scale,
                      background: v.sem('red'), width: `${on * 100}%`,
                    }} />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Field>
  );
};

// ── 10. THREAD VOTES ─────────────────────────────────────────────────────────
/**
 * What the room actually thinks, measured by the votes rather than by the loudest post.
 *
 * On r/developersIndia the post claiming Astra makes most engineers unnecessary drew 651
 * upvotes; the reply saying "here we go again" drew 1.1K. Quoting the post alone would
 * misrepresent the thread. Drawn as stacked vote bars in reply order, the shape of the
 * disagreement is visible: the pushback is bigger than the claim.
 */
const ThreadVotes: React.FC<AstraVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const rows = items.slice(0, 5);
  const gap = 10 * v.scale;
  const rowH = Math.min((budget * 0.90 - gap * (rows.length - 1)) / Math.max(1, rows.length),
                        v.vertical ? 150 : 122);
  const W = Math.min(budget * 1.66, v.vertical ? 640 : 880);
  const max = Math.max(...rows.map((r) => r.value ?? 0), 1);

  return (
    <Field v={v} gap={10}>
      {token ? <Cap v={v} size={12} tone={hexA(v.a, 0.95)}>{token}</Cap> : null}
      <div style={{display: 'flex', flexDirection: 'column', gap}}>
        {rows.map((it, i) => {
          const on = soft(liveAt(frame, it.atWord, 16));
          const col = it.win ? v.sem('orange') : v.sem(SERIES[i % SERIES.length]);
          return (
            <div key={i} style={{
              width: W, minHeight: rowH, boxSizing: 'border-box', position: 'relative',
              display: 'flex', alignItems: 'center', gap: 12 * v.scale,
              padding: `${7 * v.scale}px ${12 * v.scale}px`,
              borderLeft: `${3 * v.scale}px solid ${hexA(col, 0.3 + on * 0.6)}`,
              background: hexA(col, 0.04),
              borderRadius: `0 ${v.rad(7)}px ${v.rad(7)}px 0`,
              opacity: 0.3 + on * 0.7, overflow: 'hidden',
              marginLeft: (it.value != null && i > 0 ? 26 : 0) * v.scale,
            }}>
              {/* THE COUNT IS A LENGTH. The row fills to its share of the biggest vote, so
                  "the reply outscored the post" is visible before anybody reads a digit. */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${((it.value ?? 0) / max) * 100 * on}%`,
                background: hexA(col, 0.16 + on * 0.1), pointerEvents: 'none',
              }} />
              {/* the arrow and the count — the unit of agreement on that site */}
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                           gap: 1 * v.scale, minWidth: 46 * v.scale}}>
                <AssetIcon bare asset="lucide:arrow-big-up" size={rowH * 0.26} tint={hexA(col, 0.95)} />
                <div style={{...v.mono(Math.max(12, rowH * 0.22)), fontWeight: 800,
                             color: hexA(col, 0.98)}}>{it.text}</div>
              </div>
              <div style={{minWidth: 0, flex: 1}}>
                <div style={{...v.mono(Math.max(10, rowH * 0.15)), color: v.dim,
                             marginBottom: 2 * v.scale}}>{it.label}</div>
                <div style={{...v.body(Math.max(11, rowH * 0.19)), color: v.text, lineHeight: 1.3}}>
                  {it.sub}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </Field>
  );
};

// ── 11. WORLD MODEL ──────────────────────────────────────────────────────────
/**
 * The finding under the score, and the most interesting thing ARC Prize reported.
 *
 * Astra turned unfamiliar environments into "compact symbolic world models" — it worked out
 * the rules of a game nobody explained and invented its own shorthand to track them. That is
 * a process, so it is drawn as one: an opaque grid on the left, rules being lifted out of it
 * in the middle, and a private notation forming on the right. Three stages, each on its own
 * spoken word.
 */
const WorldModel: React.FC<AstraVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const cell = Math.min(budget * 0.098, v.vertical ? 60 : 48);
  const gridOn = soft(liveAt(frame, items[0]?.atWord, 18));
  const rules = items.slice(1, 4);
  const symOn = soft(liveAt(frame, items[items.length - 1]?.atWord, 18));
  const GLYPHS = ['◐', '△', '⊘', '↻', '◧', '⇥'];

  return (
    <Field v={v} gap={0}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20 * v.scale, maxWidth: '100%'}}>
        {/* 1. the environment: no instructions, just cells */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 * v.scale}}>
          <div style={{display: 'grid', gridTemplateColumns: `repeat(5, ${cell}px)`, gap: 3 * v.scale}}>
            {Array.from({length: 25}).map((_, i) => {
              const lit = soft(interpolate(gridOn, [(i % 7) * 0.06, (i % 7) * 0.06 + 0.4], [0, 1],
                {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
              const filled = [6, 7, 12, 13, 18].includes(i);
              return (
                <div key={i} style={{
                  width: cell, height: cell, borderRadius: v.rad(3),
                  border: `${1 * v.scale}px solid ${hexA(v.a, 0.25 + lit * 0.3)}`,
                  background: filled ? hexA(v.a, 0.18 + lit * 0.4) : hexA(v.a, 0.04),
                }} />
              );
            })}
          </div>
          <Cap v={v} size={11}>{items[0]?.label ?? 'no instructions'}</Cap>
        </div>

        <AssetIcon bare asset="lucide:arrow-right" size={20 * v.scale} tint={hexA(v.a, 0.6)} />

        {/* 2. the rules it inferred, arriving one at a time */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 6 * v.scale}}>
          {rules.map((it, i) => {
            const on = soft(liveAt(frame, it.atWord, 14));
            return (
              <div key={i} style={{
                padding: `${5 * v.scale}px ${10 * v.scale}px`,
                border: `${1.4 * v.scale}px solid ${hexA(v.a, 0.25 + on * 0.5)}`,
                background: hexA(v.a, 0.06 + on * 0.06), borderRadius: v.rad(5),
                ...v.mono(Math.max(10, cell * 0.36)), color: v.text,
                opacity: 0.2 + on * 0.8,
                transform: `translateX(${(1 - on) * -14 * v.scale}px)`,
                whiteSpace: 'nowrap',
              }}>{it.label}</div>
            );
          })}
          <Cap v={v} size={11}>{token ?? 'rules it worked out'}</Cap>
        </div>

        <AssetIcon bare asset="lucide:arrow-right" size={20 * v.scale} tint={hexA(v.a, 0.6)} />

        {/* 3. its own notation — glyphs, because the point is that WE did not choose them */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 * v.scale}}>
          <div style={{display: 'grid', gridTemplateColumns: `repeat(3, ${cell * 1.15}px)`, gap: 5 * v.scale}}>
            {GLYPHS.map((g, i) => {
              const on = soft(interpolate(symOn, [i * 0.10, i * 0.10 + 0.4], [0, 1],
                {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
              return (
                <div key={i} style={{
                  width: cell * 1.15, height: cell * 1.15, borderRadius: v.rad(4),
                  border: `${1.2 * v.scale}px solid ${hexA(v.sem('purple'), 0.3 + on * 0.5)}`,
                  background: hexA(v.sem('purple'), 0.07 + on * 0.1),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: cell * 0.6, color: hexA(v.sem('purple'), 0.35 + on * 0.6),
                  opacity: 0.25 + on * 0.75,
                  transform: `scale(${0.7 + on * 0.3})`,
                }}>{g}</div>
              );
            })}
          </div>
          <Cap v={v} size={11}>{items[items.length - 1]?.label ?? 'shorthand it invented'}</Cap>
        </div>
      </div>
    </Field>
  );
};

// ── 12. PROOF SCALES ─────────────────────────────────────────────────────────
/**
 * Official claim on one side, creator demo on the other — weighted, not listed.
 *
 * Launch week produced dozens of impressive clips, and the review this leans on is careful
 * to separate what OpenAI published from what somebody posted. A two-column list would flatten
 * that back out. A balance does not: each item is a weight, the beam tilts, and evidence you
 * can open and run outweighs a video of one.
 */
const ProofScales: React.FC<AstraVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const left = items.filter((i) => !i.win).slice(0, 4);
  const right = items.filter((i) => i.win).slice(0, 4);
  const panW = Math.min(budget * 0.70, v.vertical ? 400 : 380);
  const chipH = Math.min(budget * 0.145, v.vertical ? 84 : 68);
  const lw = left.reduce((a, it) => a + soft(liveAt(frame, it.atWord, 14)), 0);
  const rw = right.reduce((a, it) => a + soft(liveAt(frame, it.atWord, 14)), 0);
  const tilt = Math.max(-7, Math.min(7, (rw - lw) * 2.6));

  const Pan: React.FC<{list: AstraVizItem[]; heavy: boolean}> = ({list, heavy}) => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 6 * v.scale, width: panW}}>
      {list.map((it, i) => {
        const on = soft(liveAt(frame, it.atWord, 14));
        const col = heavy ? v.sem('green') : v.sem(SERIES[i % SERIES.length]);
        return (
          <div key={i} style={{
            minHeight: chipH, boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', gap: 8 * v.scale,
            padding: `${5 * v.scale}px ${10 * v.scale}px`,
            border: `${1.4 * v.scale}px solid ${hexA(col, 0.25 + on * 0.5)}`,
            background: hexA(col, 0.05 + on * 0.07), borderRadius: v.rad(6),
            opacity: 0.25 + on * 0.75,
            transform: `translateY(${(1 - on) * -10 * v.scale}px)`,
          }}>
            <AssetIcon bare asset={it.icon ?? (heavy ? 'lucide:file-code-2' : 'lucide:play')}
                       size={chipH * 0.42} tint={hexA(col, 0.95)} />
            <div style={{minWidth: 0}}>
              <div style={{...v.mono(Math.max(10, chipH * 0.28)), color: v.text,
                           whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                {it.label}
              </div>
              {it.sub ? <Cap v={v} size={Math.max(9, chipH * 0.20)}>{it.sub}</Cap> : null}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Field v={v} gap={10}>
      {token ? <Cap v={v} size={12} tone={hexA(v.a, 0.95)}>{token}</Cap> : null}
      {/* the beam tilts toward whichever side has more weight ON it right now */}
      <div style={{position: 'relative', width: panW * 2 + 60 * v.scale, height: 22 * v.scale}}>
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '50%', height: 4 * v.scale,
          background: hexA(v.a, 0.7), borderRadius: 999,
          transform: `translateY(-50%) rotate(${tilt}deg)`, transformOrigin: 'center',
          transition: 'none',
        }} />
        <div style={{
          position: 'absolute', left: '50%', top: '50%', width: 12 * v.scale, height: 12 * v.scale,
          transform: 'translate(-50%,-50%) rotate(45deg)', background: hexA(v.a, 0.9),
        }} />
      </div>
      <div style={{display: 'flex', gap: 60 * v.scale, alignItems: 'flex-start'}}>
        <Pan list={left} heavy={false} />
        <Pan list={right} heavy />
      </div>
    </Field>
  );
};

// ── 13. VERDICT BALANCE ──────────────────────────────────────────────────────
/**
 * Which model to reach for, decided per job instead of in the abstract.
 *
 * "Astra is an operator, Fable is a craftsperson" is a good line and, on its own, a caption.
 * The useful version is the sorting: each job slides to the side it belongs on as it is
 * named. By the end the two piles ARE the recommendation, and nobody had to be told a winner.
 */
const VerdictBalance: React.FC<AstraVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const colW = Math.min(budget * 0.72, v.vertical ? 410 : 400);
  const chipH = Math.min(budget * 0.148, v.vertical ? 88 : 70);
  const sides = [items.filter((i) => !i.win), items.filter((i) => i.win)];
  const heads = [token?.split('|')[0]?.trim() ?? 'reach for this', token?.split('|')[1]?.trim() ?? 'or this'];

  return (
    <Field v={v} gap={12}>
      <div style={{display: 'flex', gap: 34 * v.scale, alignItems: 'flex-start'}}>
        {sides.map((list, s) => {
          const col = s === 1 ? v.sem('purple') : v.a;
          return (
            <div key={s} style={{width: colW, display: 'flex', flexDirection: 'column', gap: 7 * v.scale}}>
              <div style={{
                padding: `${5 * v.scale}px ${11 * v.scale}px`, borderRadius: v.rad(999),
                border: `${1.8 * v.scale}px solid ${hexA(col, 0.75)}`, background: hexA(col, 0.13),
                ...v.mono(13), fontWeight: 800, color: v.text, textAlign: 'center',
                letterSpacing: 0.7,
              }}>{heads[s]}</div>
              {list.slice(0, 5).map((it, i) => {
                const on = soft(liveAt(frame, it.atWord, 15));
                return (
                  <div key={i} style={{
                    minHeight: chipH, boxSizing: 'border-box',
                    display: 'flex', alignItems: 'center', gap: 8 * v.scale,
                    padding: `${5 * v.scale}px ${10 * v.scale}px`,
                    border: `${1.4 * v.scale}px solid ${hexA(col, 0.22 + on * 0.45)}`,
                    background: hexA(col, 0.05 + on * 0.07), borderRadius: v.rad(6),
                    opacity: 0.2 + on * 0.8,
                    // slides IN from the middle, so the sorting gesture is visible
                    transform: `translateX(${(1 - on) * (s === 0 ? 26 : -26) * v.scale}px)`,
                  }}>
                    {it.icon ? <AssetIcon bare asset={it.icon} size={chipH * 0.44} tint={hexA(col, 0.95)} /> : null}
                    <div style={{...v.mono(Math.max(10, chipH * 0.27)), color: v.text, minWidth: 0,
                                 whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {it.label}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </Field>
  );
};

// ── 14. ROLLOUT QUEUE ────────────────────────────────────────────────────────
/**
 * Who can actually run this today — the question 227 people upvoted on Reddit.
 *
 * A staged rollout is a QUEUE, and most of the audience for this video is standing in it.
 * Drawn as a line of gates that open in order, with a "you are probably here" marker, so the
 * beat answers the viewer's real question instead of listing tiers.
 */
const RolloutQueue: React.FC<AstraVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const stops = items.slice(0, 4);
  const stopW = Math.min(budget * 0.47, v.vertical ? 270 : 244);
  const stopH = Math.min(budget * 0.40, v.vertical ? 230 : 196);

  return (
    <Field v={v} gap={12}>
      {token ? <Cap v={v} size={12} tone={hexA(v.a, 0.95)}>{token}</Cap> : null}
      <div style={{display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap',
                   justifyContent: 'center'}}>
        {stops.map((it, i) => {
          const on = soft(liveAt(frame, it.atWord, 15));
          const here = !!it.win;
          const col = here ? v.sem('orange') : v.a;
          return (
            <React.Fragment key={i}>
              {i > 0 ? (
                <div style={{width: 26 * v.scale, height: 2 * v.scale,
                             background: hexA(v.a, 0.25 + on * 0.45)}} />
              ) : null}
              <div style={{
                width: stopW, height: stopH, boxSizing: 'border-box',
                border: `${(here ? 2.4 : 1.6) * v.scale}px solid ${hexA(col, 0.25 + on * 0.55)}`,
                background: hexA(col, 0.05 + on * 0.08), borderRadius: v.rad(8),
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'safe center', gap: 5 * v.scale, padding: 9 * v.scale,
                opacity: 0.3 + on * 0.7, position: 'relative',
                transform: `translateY(${(1 - on) * 10 * v.scale}px)`,
              }}>
                <AssetIcon bare asset={it.icon ?? 'lucide:users'} size={stopH * 0.26} tint={hexA(col, 0.95)} />
                <div style={{...v.mono(Math.max(10, stopH * 0.13)), fontWeight: 800, color: v.text,
                             textAlign: 'center', lineHeight: 1.25}}>{it.label}</div>
                {it.sub ? <Cap v={v} size={Math.max(9, stopH * 0.10)}>{it.sub}</Cap> : null}
                {here ? (
                  <div style={{position: 'absolute', top: -13 * v.scale, left: '50%',
                               transform: 'translateX(-50%)', whiteSpace: 'nowrap',
                               padding: `${2 * v.scale}px ${8 * v.scale}px`, borderRadius: 999,
                               background: v.sem('orange'), ...v.mono(10), fontWeight: 800,
                               color: v.t.colors.bg, opacity: on}}>
                    most of us
                  </div>
                ) : null}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </Field>
  );
};

// ── 15. AXIOM STACK ──────────────────────────────────────────────────────────
/**
 * A result that rests on assumptions, drawn resting on them.
 *
 * OpenAI published a Lean formalisation for a prime-gaps bound, and the repository itself
 * says the proof is conditional on three explicit input axioms. "Astra solved prime gaps" is
 * therefore wrong, and a card saying "conditional" is easy to skim past. A slab standing on
 * three labelled blocks cannot be misread: take a block away and the thing on top has nowhere
 * to sit.
 */
const AxiomStack: React.FC<AstraVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const result = items[0];
  const axioms = items.slice(1, 4);
  const W = Math.min(budget * 1.30, v.vertical ? 540 : 640);
  const slabH = Math.min(budget * 0.30, v.vertical ? 160 : 138);
  const blockH = Math.min(budget * 0.28, v.vertical ? 150 : 128);
  const resOn = soft(liveAt(frame, result?.atWord, 16));

  return (
    <Field v={v} gap={0}>
      {/* the claim */}
      <div style={{
        width: W, minHeight: slabH, boxSizing: 'border-box',
        border: `${2.2 * v.scale}px solid ${hexA(v.a, 0.3 + resOn * 0.55)}`,
        background: hexA(v.a, 0.08 + resOn * 0.08), borderRadius: v.rad(8),
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'safe center', gap: 3 * v.scale, padding: 10 * v.scale,
        opacity: 0.3 + resOn * 0.7,
      }}>
        <div style={{...v.mono(Math.max(15, slabH * 0.28)), fontWeight: 800, color: v.text,
                     textAlign: 'center'}}>{result?.label}</div>
        {result?.sub ? <Cap v={v} size={Math.max(10, slabH * 0.15)}>{result.sub}</Cap> : null}
      </div>
      {/* the legs it stands on */}
      <div style={{display: 'flex', gap: 10 * v.scale, marginTop: 8 * v.scale}}>
        {axioms.map((it, i) => {
          const on = soft(liveAt(frame, it.atWord, 14));
          return (
            <div key={i} style={{
              width: (W - 20 * v.scale) / Math.max(1, axioms.length), minHeight: blockH,
              boxSizing: 'border-box',
              border: `${1.6 * v.scale}px dashed ${hexA(v.sem('orange'), 0.3 + on * 0.5)}`,
              background: hexA(v.sem('orange'), 0.05 + on * 0.07), borderRadius: v.rad(6),
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'safe center', padding: 8 * v.scale, gap: 3 * v.scale,
              opacity: 0.25 + on * 0.75,
              transform: `translateY(${(1 - on) * 12 * v.scale}px)`,
            }}>
              <div style={{...v.mono(Math.max(10, blockH * 0.20)), fontWeight: 700,
                           color: hexA(v.sem('orange'), 0.95), textAlign: 'center', lineHeight: 1.25}}>
                {it.label}
              </div>
            </div>
          );
        })}
      </div>
      {token ? <div style={{marginTop: 9 * v.scale}}><Cap v={v} size={11}>{token}</Cap></div> : null}
    </Field>
  );
};

// ── 16. TOKEN SPLIT ──────────────────────────────────────────────────────────
/**
 * What a token is, shown on a real sentence instead of defined at the viewer.
 *
 * Every price and every context figure in this video is quoted per token, so the word has to
 * mean something before any of them are spoken. A definition on a card is the LAW 0d defect:
 * the viewer builds the picture and builds it wrong. Here an ordinary sentence comes apart
 * into the chunks a tokeniser would actually produce — some whole words, some fragments, the
 * spaces carried along — and the count runs up underneath. The fragments are the teaching:
 * they are why a token is not a word.
 */
const TokenSplit: React.FC<AstraVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const chips = items.slice(0, 8);
  const chipH = Math.min(budget * 0.26, v.vertical ? 140 : 118);
  const split = soft(liveAt(frame, chips[0]?.atWord, 18));

  return (
    <Field v={v} gap={16}>
      {/* the sentence, whole, before anything happens to it */}
      <div style={{
        ...v.body(Math.max(15, chipH * 0.30)), color: hexA(v.t.colors.text, 1 - split * 0.72),
        letterSpacing: 0.4, textAlign: 'center', maxWidth: '92%',
      }}>{token ?? ''}</div>

      {/* and the same sentence in pieces, each arriving on its own word */}
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 6 * v.scale, justifyContent: 'center',
                   maxWidth: '96%'}}>
        {chips.map((it, i) => {
          const on = soft(liveAt(frame, it.atWord, 12));
          // a fragment is the point, so it is coloured differently from a whole word
          const frag = !!it.win;
          const col = frag ? v.sem('orange') : v.a;
          return (
            <div key={i} style={{
              minHeight: chipH, boxSizing: 'border-box',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'safe center', gap: 2 * v.scale,
              padding: `${5 * v.scale}px ${11 * v.scale}px`,
              border: `${1.6 * v.scale}px solid ${hexA(col, 0.25 + on * 0.6)}`,
              background: hexA(col, 0.06 + on * 0.1), borderRadius: v.rad(6),
              opacity: 0.2 + on * 0.8,
              transform: `translateY(${(1 - on) * 12 * v.scale}px) scale(${0.9 + on * 0.1})`,
            }}>
              <div style={{...v.mono(Math.max(13, chipH * 0.30)), fontWeight: 700,
                           color: v.t.colors.text, whiteSpace: 'pre'}}>{it.label}</div>
              {it.sub ? <Cap v={v} size={Math.max(9, chipH * 0.15)}>{it.sub}</Cap> : null}
            </div>
          );
        })}
      </div>

      {/* the running count, so "how many tokens" is a number you watched arrive */}
      <div style={{display: 'flex', alignItems: 'baseline', gap: 9 * v.scale}}>
        <div style={{...v.mono(Math.max(22, chipH * 0.42)), fontWeight: 800, color: v.text,
                     fontVariantNumeric: 'tabular-nums'}}>
          {chips.filter((c) => soft(liveAt(frame, c.atWord, 12)) > 0.5).length}
        </div>
        <Cap v={v} size={12}>tokens, from those few words</Cap>
      </div>
    </Field>
  );
};

// ── dispatcher ───────────────────────────────────────────────────────────────
const ASTRA_VIZ: Record<string, React.FC<AstraVizProps>> = {
  'harness-split': HarnessSplit,
  'cost-plane': CostPlane,
  'operator-desk': OperatorDesk,
  'bench-row': BenchRow,
  'page-stack': PageStack,
  'threshold-ladder': ThresholdLadder,
  'sealed-trace': SealedTrace,
  'task-clock': TaskClock,
  'rate-plate': RatePlate,
  'thread-votes': ThreadVotes,
  'world-model': WorldModel,
  'proof-scales': ProofScales,
  'verdict-balance': VerdictBalance,
  'rollout-queue': RolloutQueue,
  'axiom-stack': AxiomStack,
  'token-split': TokenSplit,
};

/** An unregistered kind renders LOUDLY (LAW 0n corollary) — never a plausible substitute. */
export const AstraViz: React.FC<AstraVizProps & {kind: string}> = ({kind, ...p}) => {
  const R = ASTRA_VIZ[kind];
  if (!R) return <UnknownKind kind={kind} registry="astraViz" />;
  return <R {...p} />;
};

export const ASTRA_VIZ_KINDS = Object.keys(ASTRA_VIZ);
