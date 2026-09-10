import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {SemColor} from './types';
import {hexA} from './ui';
import {useViz, liveAt, stackBudget} from './dsaViz';
import {AssetIcon} from './AssetIcon';
import {UnknownKind} from './unknownKind';

// APPLE VIZ — the pictures for the September 2026 Apple series.
//
// ONE registered scene type (APPLE_STAGE), many PICTURES (LAW 0n corollary: the budget a
// plan commits to is the number of distinct pictures, never the number of scene types).
//
// THE HOUSE STYLE HERE IS A SCHEMATIC, NOT A PHOTOGRAPH — owner, 2026-09-10:
//   "You need not picture the phone realistically. Since its modern dark, you can have a
//    kinda wireframe kinda design which will be beautiful and fits right. Even if you use
//    burgundy or something, it will not look nice in modern dark."
// Two reasons it is the right call, and the second is the one that matters for animation:
//   1. a filled body in a deep product colour is a dark shape on a near-black ground;
//   2. a FILL can only fade in. A STROKE CAN DRAW ITSELF, path by path, on the voice —
//      which is the difference between animation and a slide appearing.
// So colour does not live on the device. It lives in `finish-palette`, where a colour can
// be the subject rather than the backdrop.
//
// Every kind obeys the same three rules:
//   - the OBJECT moves, not a label describing it (LAW 0j)
//   - every explanatory moment resolves from its own atWord via liveAt (LAW 0i.1). The
//     only fixed interval in this file is the BASE draw-on, which LAW 8 REQUIRES to be
//     complete within ~38 frames regardless of where the first anchor lands.
//   - sizes come from stackBudget(v), never from a constant that would bind in the
//     ordinary case and leave the picture floating in its pane (LAW 0n corollary)

export interface AppleItem {
  label?: string;
  sub?: string;
  /** Per-kind role key: which PART this callout points at, which finish, which tier. */
  text?: string;
  value?: number | string;
  icon?: string;
  color?: SemColor;
  atWord?: number;
}

type Props = {items: AppleItem[]; accent: SemColor; vars?: AppleItem[]; token?: string};

/** Normalised stroke draw-on. pathLength="1" lets every shape share one progress number
 *  whatever its real perimeter is, so a circle and a rounded rect draw at the same rate
 *  without either being measured. */
const draw = (p: number) => ({
  pathLength: 1, strokeDasharray: 1, strokeDashoffset: Math.max(0, 1 - p),
});

/** THE BASE DIAGRAM IS ON SCREEN WITHIN ~1.3s (LAW 8), whatever the narration does.
 *  This is the one place a fixed interval is correct: it times the base, not a payoff. */
const baseDraw = (frame: number, from = 0, span = 30) =>
  interpolate(frame, [from, from + span], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

// ---------------------------------------------------------------------------
// 1 - PRO OUTLINE - the device as a schematic that draws itself, and lights the
//     PART being named rather than a row of text about it.
//
// Geometry lives in one place and in its own units; the viewBox scales it. The
// proportions are the real ones - 150.0 x 71.5 mm is 2.098:1 - because the silhouette is
// the only thing that has to be accurate for this to read as an iPhone.
// ---------------------------------------------------------------------------
const PHONE = {
  w: 143, h: 300, r: 26,
  plateau: {x: 7, y: 14, w: 129, h: 60, r: 18},
  // The triangle is the thing everyone recognises, so the lenses must READ AS THREE.
  // At r=15 on this spacing the top and bottom circles intersected (their spans were
  // 16-46 and 44-74) and the cluster rendered as one blob — visible immediately in a
  // still, invisible in the numbers.
  lenses: [{cx: 34, cy: 31, r: 12.5}, {cx: 34, cy: 58, r: 12.5}, {cx: 62, cy: 44.5, r: 12.5}],
  flash: {cx: 110, cy: 32, r: 8},
  sensor: {cx: 110, cy: 58, r: 5},
  logo: {cx: 71.5, cy: 168, r: 15},
  // Left edge: Action Button above the volume pair. Right edge: power, then Camera Control.
  buttons: [
    {id: 'action', side: 'l', y: 96, h: 17},
    {id: 'vol', side: 'l', y: 124, h: 24},
    {id: 'vol2', side: 'l', y: 154, h: 24},
    {id: 'power', side: 'r', y: 118, h: 34},
    {id: 'control', side: 'r', y: 164, h: 26},
  ],
};

/** Which PART each callout lights. Anything unrecognised lights NOTHING rather than
 *  lighting the wrong thing - the same argument as an unregistered kind being loud. */
const PARTS = ['plateau', 'lens', 'flash', 'logo', 'control', 'action', 'body'];

const ProOutline: React.FC<Props> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;

  // The drawing is HEIGHT-bound at both aspects, because the phone is 2.1:1 tall. A wide
  // pane is far wider than it is tall, so the drawing can never fill it on its own — and
  // the answer is to CENTRE the group, not to stretch anything. The first version gave the
  // callout column `flex: 1 1 auto`, which ate every spare pixel and shoved the drawing
  // against the left edge with two thirds of the pane empty beside it.
  const svgH = budget * (v.vertical ? 0.62 : 1);
  const svgW = (svgH * PHONE.w) / PHONE.h;
  const base = baseDraw(frame);
  const lit = (part: string) => {
    const ps = items.filter((i) => i.text === part).map((i) => liveAt(frame, i.atWord, 10));
    return ps.length ? Math.max(...ps) : 0;
  };

  const sw = PHONE.w / 92;                 // stroke in USER units, so it scales with the drawing
  const idle = hexA(v.t.colors.muted, 0.5);
  const on = (p: number) => (p > 0.02 ? v.a : idle);
  const glow = (p: number) => (p > 0.02 ? `drop-shadow(0 0 ${2.4 * p}px ${hexA(v.a, 0.85)})` : 'none');

  const named = items.filter((i) => i.label && PARTS.includes(i.text ?? ''));

  return (
    <div style={{
      display: 'flex', flexDirection: v.vertical ? 'column' : 'row',
      gap: (v.vertical ? 18 : 44) * v.scale,
      alignItems: 'center', justifyContent: 'safe center', width: '100%', height: '100%', minHeight: 0,
    }}>
      <svg width={svgW} height={svgH} viewBox={`0 0 ${PHONE.w} ${PHONE.h}`}
        style={{flex: '0 0 auto', overflow: 'visible'}}>
        <rect x={sw} y={sw} width={PHONE.w - sw * 2} height={PHONE.h - sw * 2}
          rx={PHONE.r} ry={PHONE.r} fill="none"
          stroke={on(lit('body'))} strokeWidth={sw * (lit('body') > 0.02 ? 1.7 : 1)}
          style={{filter: glow(lit('body'))}} {...draw(base)} />

        {/* the camera plateau - the one silhouette change everybody recognises */}
        <rect x={PHONE.plateau.x} y={PHONE.plateau.y} width={PHONE.plateau.w} height={PHONE.plateau.h}
          rx={PHONE.plateau.r} ry={PHONE.plateau.r} fill="none"
          stroke={on(lit('plateau'))} strokeWidth={sw * (lit('plateau') > 0.02 ? 1.6 : 0.9)}
          style={{filter: glow(lit('plateau'))}} {...draw(baseDraw(frame, 6))} />

        {PHONE.lenses.map((l, i) => (
          <g key={i}>
            <circle cx={l.cx} cy={l.cy} r={l.r} fill="none" stroke={on(lit('lens'))}
              strokeWidth={sw * (lit('lens') > 0.02 ? 1.5 : 0.9)}
              style={{filter: glow(lit('lens'))}} {...draw(baseDraw(frame, 10 + i * 3))} />
            <circle cx={l.cx} cy={l.cy} r={l.r * 0.46} fill="none" stroke={on(lit('lens'))}
              strokeWidth={sw * 0.7} opacity={0.75} {...draw(baseDraw(frame, 14 + i * 3))} />
          </g>
        ))}

        <circle cx={PHONE.flash.cx} cy={PHONE.flash.cy} r={PHONE.flash.r} fill="none"
          stroke={on(lit('flash'))} strokeWidth={sw * 0.9}
          style={{filter: glow(lit('flash'))}} {...draw(baseDraw(frame, 16))} />
        <circle cx={PHONE.sensor.cx} cy={PHONE.sensor.cy} r={PHONE.sensor.r} fill="none"
          stroke={idle} strokeWidth={sw * 0.8} {...draw(baseDraw(frame, 18))} />

        {/* the mark, as the real glyph rather than a drawn approximation of it */}
        <g opacity={base} style={{filter: glow(lit('logo'))}}>
          <foreignObject x={PHONE.logo.cx - PHONE.logo.r} y={PHONE.logo.cy - PHONE.logo.r}
            width={PHONE.logo.r * 2} height={PHONE.logo.r * 2}>
            <div style={{width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center'}}>
              <AssetIcon asset="si:apple" size={PHONE.logo.r * 1.7} bare tint={on(lit('logo'))} />
            </div>
          </foreignObject>
        </g>

        {PHONE.buttons.map((b) => {
          const p = b.id === 'control' ? lit('control') : b.id === 'action' ? lit('action') : 0;
          const x = b.side === 'l' ? -sw * 0.6 : PHONE.w - sw * 1.4;
          return (
            <rect key={b.id} x={x} y={b.y} width={sw * 2} height={b.h} rx={sw}
              fill={p > 0.02 ? v.a : 'none'} stroke={on(p)} strokeWidth={sw * 0.85}
              style={{filter: glow(p)}} {...draw(baseDraw(frame, 20))} />
          );
        })}
      </svg>

      {/* The callouts. These are CAPTIONS for a part that is itself lighting up on the
          drawing - the picture is the phone, never this column (LAW 0n). */}
      {named.length > 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: (v.vertical ? 10 : 14) * v.scale,
          flex: '0 1 auto', minWidth: 0, maxWidth: (v.vertical ? 620 : 560) * v.scale,
          justifyContent: 'safe center',
        }}>
          {named.map((it, i) => {
            const p = liveAt(frame, it.atWord, 10);
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10 * v.scale,
                opacity: 0.4 + p * 0.6, transform: `translateX(${(1 - p) * 10 * v.scale}px)`,
              }}>
                <div style={{
                  width: (v.vertical ? 26 : 34) * v.scale, height: 2 * v.scale, flex: '0 0 auto',
                  background: p > 0.02 ? v.a : idle, borderRadius: 999,
                  boxShadow: p > 0.02 ? `0 0 ${8 * v.scale}px ${hexA(v.a, 0.8)}` : 'none',
                }} />
                <div style={{minWidth: 0}}>
                  <div style={{
                    ...v.body(v.vertical ? 23 : 20), color: p > 0.02 ? v.t.colors.text : v.dim,
                    fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{it.label}</div>
                  {it.sub && (
                    <div style={{
                      ...v.body(v.vertical ? 18 : 15.5), color: v.dim, marginTop: 2 * v.scale,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{it.sub}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const KINDS: Record<string, React.FC<Props>> = {
  'pro-outline': ProOutline,
};

export const AppleViz: React.FC<Props & {kind: string}> = ({kind, ...rest}) => {
  const Picture = KINDS[kind];
  if (!Picture) return <UnknownKind kind={kind} registry="AppleViz" />;
  return <Picture {...rest} />;
};
