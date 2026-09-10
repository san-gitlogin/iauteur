import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {SemColor} from './types';
import {hexA} from './ui';
import {useViz, liveAt, stackBudget} from './dsaViz';
import {AssetIcon} from './AssetIcon';
import {UnknownKind} from './unknownKind';
import {
  IPHONE_18_PRO, IPHONE_DUO_OPEN, IPHONE_DUO_FOLDED, WATCH_S12_46, WATCH_ULTRA_4,
  AIRPODS_5, CAM, BUTTONS, ISLAND, lensCentres, plateau, Device,
} from './appleGeom';

// APPLE VIZ — the pictures for the September 2026 Apple series.
//
// ONE registered scene type (APPLE_STAGE), many PICTURES (LAW 0n corollary).
//
// THE HOUSE STYLE IS A SCHEMATIC, NOT A PHOTOGRAPH — owner, 2026-09-10: "you can have a
// kinda wireframe kinda design which will be beautiful and fits right. Even if you use
// burgundy or something, it will not look nice in modern dark." Two reasons, and the
// second is the one that matters for animation: a deep product colour is a dark shape on
// a near-black ground, and a FILL can only fade in where a STROKE CAN DRAW ITSELF.
//
// EVERY DIMENSION COMES FROM src/appleGeom.ts, IN MILLIMETRES. The viewBox is millimetres,
// so a watch and a phone drawn side by side are to scale with each other, and nothing here
// is a guess that can drift. Owner: "Make sure the wireframes align perfectly to the
// product. Not even a single mistake I should see."

export interface AppleItem {
  label?: string;
  sub?: string;
  /** Per-kind role key: which PART this callout lights. */
  text?: string;
  value?: number | string;
  icon?: string;
  color?: SemColor;
  atWord?: number;
}

type Props = {items: AppleItem[]; accent: SemColor; vars?: AppleItem[]; token?: string};

/** Normalised stroke draw-on. `pathLength=1` lets every shape share one progress number
 *  whatever its real perimeter is, so a circle and a rounded rect draw at the same rate
 *  without either being measured.
 *
 *  THE DASH IS REMOVED ONCE THE DRAW COMPLETES, and that is not a tidy-up — it is a fix.
 *  A dash array exactly equal to the path length still renders a seam where the dash meets
 *  its own tail: on the small circles it opened a visible gap (the flash and the lidar drew
 *  as "C" shapes) and on every circle it left a tick at the 3 o'clock start point. The
 *  finished state is what is on screen for most of a beat, so it must carry no artefact. */
const draw = (p: number) => (p >= 0.999
  ? {}
  : {pathLength: 1, strokeDasharray: 1, strokeDashoffset: Math.max(0, 1 - p)});

/** THE BASE DIAGRAM IS ON SCREEN WITHIN ~1.3s (LAW 8), whatever the narration does. This
 *  is the one place a fixed interval is correct: it times the base, not a payoff. */
const baseDraw = (frame: number, from = 0, span = 30) =>
  interpolate(frame, [from, from + span], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Shared per-kind chrome: how a part is coloured and lit when its callout is live. */
const useSkin = (accent: SemColor, items: AppleItem[]) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const lit = (part: string) => {
    const ps = items.filter((i) => i.text === part).map((i) => liveAt(frame, i.atWord, 10));
    return ps.length ? Math.max(...ps) : 0;
  };
  const idle = hexA(v.t.colors.muted, 0.55);
  const on = (p: number) => (p > 0.02 ? v.a : idle);
  const glow = (p: number) => (p > 0.02 ? `drop-shadow(0 0 ${0.9 * p}px ${hexA(v.a, 0.9)})` : 'none');
  return {v, frame, lit, idle, on, glow};
};

/** The callout column. These are CAPTIONS for a part that is itself lighting up on the
 *  drawing — the picture is the device, never this column (LAW 0n). */
const Callouts: React.FC<{items: AppleItem[]; accent: SemColor; parts: string[]}> =
({items, accent, parts}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const named = items.filter((i) => i.label && parts.includes(i.text ?? ''));
  if (!named.length) return null;
  const idle = hexA(v.t.colors.muted, 0.55);
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: (v.vertical ? 10 : 14) * v.scale,
      flex: '0 1 auto', minWidth: 0, maxWidth: (v.vertical ? 640 : 560) * v.scale,
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
  );
};

/** The frame every device picture sits in. The drawing is height-bound (every one of these
 *  products is taller than it is wide, or close to square), so a wide pane can never be
 *  filled by the drawing alone — the group CENTRES rather than anything being stretched. */
const Rig: React.FC<{
  vw: number; vh: number; accent: SemColor; items: AppleItem[]; parts: string[];
  children: React.ReactNode; fill?: number;
}> = ({vw, vh, accent, items, parts, children, fill = 1}) => {
  const v = useViz(accent);
  const budget = stackBudget(v) * v.scale;
  const hasCallouts = items.some((i) => i.label && parts.includes(i.text ?? ''));
  const svgH = budget * (v.vertical ? (hasCallouts ? 0.62 : 0.9) : fill);
  const svgW = (svgH * vw) / vh;
  return (
    <div style={{
      display: 'flex', flexDirection: v.vertical ? 'column' : 'row',
      gap: (v.vertical ? 18 : 44) * v.scale,
      alignItems: 'center', justifyContent: 'safe center',
      width: '100%', height: '100%', minHeight: 0,
    }}>
      <svg width={svgW} height={svgH} viewBox={`0 0 ${vw} ${vh}`}
        style={{flex: '0 0 auto', overflow: 'visible'}}>
        {children}
      </svg>
      <Callouts items={items} accent={accent} parts={parts} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// iPHONE 18 PRO — the back. Plateau, the three-lens triangle, flash, lidar, buttons.
// ---------------------------------------------------------------------------
const PHONE_PARTS = ['plateau', 'lens', 'flash', 'lidar', 'logo', 'control', 'action', 'volume', 'body'];

const ProBack: React.FC<Props> = ({items, accent}) => {
  const {v, frame, lit, idle, on, glow} = useSkin(accent, items);
  const dev = IPHONE_18_PRO;
  const pl = plateau(dev);
  const lenses = lensCentres(dev);
  const sw = 0.62;                       // mm — stroke in USER units, so it scales with the drawing
  const base = baseDraw(frame);
  const pad = 3;                         // mm of bleed so buttons and glow are not clipped

  return (
    <Rig vw={dev.w + pad * 2} vh={dev.h + pad * 2} accent={accent} items={items} parts={PHONE_PARTS}>
      <g transform={`translate(${pad} ${pad})`}>
        <rect x={sw / 2} y={sw / 2} width={dev.w - sw} height={dev.h - sw} rx={dev.r} ry={dev.r}
          fill="none" stroke={on(lit('body'))} strokeWidth={sw * (lit('body') > 0.02 ? 1.8 : 1)}
          style={{filter: glow(lit('body'))}} {...draw(base)} />

        <rect x={pl.x} y={pl.y} width={pl.w} height={pl.h} rx={pl.r} ry={pl.r} fill="none"
          stroke={on(lit('plateau'))} strokeWidth={sw * (lit('plateau') > 0.02 ? 1.7 : 0.95)}
          style={{filter: glow(lit('plateau'))}} {...draw(baseDraw(frame, 6))} />

        {/* A lens is a THICK outer ring, a THIN ring just inside its border, and a small
            bright core. Not a bullseye - the inner ring sits at 0.80 of the outer radius. */}
        {lenses.map((l, i) => (
          <g key={i}>
            <circle cx={l.cx} cy={l.cy} r={l.r} fill="none" stroke={on(lit('lens'))}
              strokeWidth={sw * (lit('lens') > 0.02 ? 1.7 : 1.1)}
              style={{filter: glow(lit('lens'))}} {...draw(baseDraw(frame, 10 + i * 3))} />
            <circle cx={l.cx} cy={l.cy} r={l.r * CAM.innerRing} fill="none" stroke={on(lit('lens'))}
              strokeWidth={sw * 0.5} opacity={0.72} {...draw(baseDraw(frame, 13 + i * 3))} />
            <circle cx={l.cx} cy={l.cy} r={l.r * CAM.core} fill={on(lit('lens'))}
              opacity={0.55 * baseDraw(frame, 16 + i * 3)} />
          </g>
        ))}

        {/* right of the cluster, top to bottom: flash, microphone, lidar */}
        <circle cx={dev.w - CAM.inset - 7.5} cy={pl.y + 8.5} r={CAM.flashR} fill="none"
          stroke={on(lit('flash'))} strokeWidth={sw * 0.9}
          style={{filter: glow(lit('flash'))}} {...draw(baseDraw(frame, 16))} />
        <circle cx={dev.w - CAM.inset - 7.5} cy={pl.y + pl.h / 2} r={CAM.micR} fill={idle}
          opacity={baseDraw(frame, 18)} />
        <circle cx={dev.w - CAM.inset - 7.5} cy={pl.y + pl.h - 8.5} r={CAM.lidarR} fill="none"
          stroke={on(lit('lidar'))} strokeWidth={sw * 0.9}
          style={{filter: glow(lit('lidar'))}} {...draw(baseDraw(frame, 20))} />

        <g opacity={base} style={{filter: glow(lit('logo'))}}>
          <foreignObject x={dev.w / 2 - 5} y={dev.h * 0.52 - 5} width={10} height={10}>
            <div style={{width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center'}}>
              <AssetIcon asset="si:apple" size={9} bare tint={on(lit('logo'))} />
            </div>
          </foreignObject>
        </g>

        {BUTTONS.map((b) => {
          const p = b.id === 'control' ? lit('control')
            : b.id === 'action' ? lit('action')
            : b.id.startsWith('vol') ? lit('volume') : 0;
          const x = b.side === 'l' ? -sw * 0.9 : dev.w - sw * 1.1;
          return (
            <rect key={b.id} x={x} y={b.y} width={sw * 2} height={b.h} rx={sw}
              fill={p > 0.02 ? v.a : 'none'} stroke={on(p)} strokeWidth={sw * 0.85}
              style={{filter: glow(p)}} {...draw(baseDraw(frame, 22))} />
          );
        })}
      </g>
    </Rig>
  );
};

// ---------------------------------------------------------------------------
// iPHONE 18 PRO — the front. The bezel is COMPUTED (2.6mm), never drawn to taste.
// ---------------------------------------------------------------------------
const ProFront: React.FC<Props> = ({items, accent}) => {
  const {v, frame, lit, idle, on, glow} = useSkin(accent, items);
  const dev = IPHONE_18_PRO;
  const s = dev.screen;
  const sw = 0.62, pad = 3;
  const base = baseDraw(frame);

  return (
    <Rig vw={dev.w + pad * 2} vh={dev.h + pad * 2} accent={accent} items={items} parts={PHONE_PARTS}>
      <g transform={`translate(${pad} ${pad})`}>
        <rect x={sw / 2} y={sw / 2} width={dev.w - sw} height={dev.h - sw} rx={dev.r} ry={dev.r}
          fill="none" stroke={on(lit('body'))} strokeWidth={sw * (lit('body') > 0.02 ? 1.8 : 1)}
          style={{filter: glow(lit('body'))}} {...draw(base)} />

        <rect x={s.bezel} y={s.bezel} width={s.w} height={s.h} rx={s.r} ry={s.r} fill="none"
          stroke={on(lit('screen'))} strokeWidth={sw * (lit('screen') > 0.02 ? 1.5 : 0.85)}
          style={{filter: glow(lit('screen'))}} {...draw(baseDraw(frame, 8))} />

        {/* Dynamic Island — a pill, centred, and SMALLER on the 18 Pro than before */}
        <rect x={dev.w / 2 - ISLAND.w / 2} y={ISLAND.topFromBody} width={ISLAND.w} height={ISLAND.h}
          rx={ISLAND.h / 2} ry={ISLAND.h / 2}
          fill={lit('island') > 0.02 ? hexA(v.a, 0.22) : 'none'}
          stroke={on(lit('island'))} strokeWidth={sw * (lit('island') > 0.02 ? 1.5 : 0.9)}
          style={{filter: glow(lit('island'))}} {...draw(baseDraw(frame, 12))} />

        {BUTTONS.map((b) => {
          const p = b.id === 'control' ? lit('control')
            : b.id === 'action' ? lit('action')
            : b.id.startsWith('vol') ? lit('volume') : 0;
          // mirrored: on the FRONT the Action Button is on the viewer's left as drawn
          const x = b.side === 'l' ? -sw * 0.9 : dev.w - sw * 1.1;
          return (
            <rect key={b.id} x={x} y={b.y} width={sw * 2} height={b.h} rx={sw}
              fill={p > 0.02 ? v.a : 'none'} stroke={on(p)} strokeWidth={sw * 0.85}
              style={{filter: glow(p)}} {...draw(baseDraw(frame, 22))} />
          );
        })}
      </g>
    </Rig>
  );
};

// ---------------------------------------------------------------------------
// iPHONE DUO — folded beside open, to scale with each other, because the whole
// point of the product is the relationship between those two states.
// ---------------------------------------------------------------------------
const DUO_PARTS = ['outer', 'inner', 'hinge', 'body', 'lens', 'island'];

const DuoPair: React.FC<Props> = ({items, accent, token}) => {
  const {v, frame, lit, idle, on, glow} = useSkin(accent, items);
  const open = IPHONE_DUO_OPEN, fold = IPHONE_DUO_FOLDED;
  const sw = 0.62, pad = 3, gap = 10;
  const base = baseDraw(frame);
  const onlyOpen = token === 'open';
  const vw = onlyOpen ? open.w + pad * 2 : fold.w + gap + open.w + pad * 2;
  const vh = open.h + pad * 2;
  const openX = onlyOpen ? pad : pad + fold.w + gap;

  return (
    <Rig vw={vw} vh={vh} accent={accent} items={items} parts={DUO_PARTS} fill={0.85}>
      {!onlyOpen && (
        <g transform={`translate(${pad} ${pad})`}>
          <rect x={sw / 2} y={sw / 2} width={fold.w - sw} height={fold.h - sw} rx={fold.r} ry={fold.r}
            fill="none" stroke={on(lit('body'))} strokeWidth={sw * (lit('body') > 0.02 ? 1.8 : 1)}
            style={{filter: glow(lit('body'))}} {...draw(base)} />
          <rect x={fold.screen.bezel} y={fold.screen.bezel} width={fold.screen.w} height={fold.screen.h}
            rx={fold.screen.r} ry={fold.screen.r} fill="none"
            stroke={on(lit('outer'))} strokeWidth={sw * (lit('outer') > 0.02 ? 1.5 : 0.85)}
            style={{filter: glow(lit('outer'))}} {...draw(baseDraw(frame, 8))} />
          {/* dual 48MP Fusion, stacked, upper left */}
          {[0, 1].map((i) => (
            <circle key={i} cx={fold.screen.bezel + 7} cy={12 + i * 13} r={4.2} fill="none"
              stroke={on(lit('lens'))} strokeWidth={sw * 1.1}
              style={{filter: glow(lit('lens'))}} {...draw(baseDraw(frame, 12 + i * 3))} />
          ))}
        </g>
      )}

      <g transform={`translate(${openX} ${pad})`}>
        <rect x={sw / 2} y={sw / 2} width={open.w - sw} height={open.h - sw} rx={open.r} ry={open.r}
          fill="none" stroke={on(lit('body'))} strokeWidth={sw * (lit('body') > 0.02 ? 1.8 : 1)}
          style={{filter: glow(lit('body'))}} {...draw(baseDraw(frame, 4))} />
        <rect x={open.screen.bezel} y={open.screen.bezel} width={open.screen.w} height={open.screen.h}
          rx={open.screen.r} ry={open.screen.r} fill="none"
          stroke={on(lit('inner'))} strokeWidth={sw * (lit('inner') > 0.02 ? 1.5 : 0.85)}
          style={{filter: glow(lit('inner'))}} {...draw(baseDraw(frame, 10))} />
        {/* the hinge, down the centre of the open panel */}
        <line x1={open.w / 2} y1={open.screen.bezel + 2} x2={open.w / 2} y2={open.h - open.screen.bezel - 2}
          stroke={on(lit('hinge'))} strokeWidth={sw * (lit('hinge') > 0.02 ? 1.4 : 0.7)}
          strokeDasharray={lit('hinge') > 0.02 ? undefined : '2 2'}
          style={{filter: glow(lit('hinge'))}} opacity={baseDraw(frame, 14)} />
      </g>
    </Rig>
  );
};

// ---------------------------------------------------------------------------
// APPLE WATCH — Series 12 and Ultra 4 share a picture and differ by token, because
// the interesting thing about them IS the comparison (49x44 against 46x40).
// ---------------------------------------------------------------------------
const WATCH_PARTS = ['screen', 'crown', 'side', 'case', 'band', 'action'];

const WatchFace: React.FC<Props> = ({items, accent, token}) => {
  const {v, frame, lit, idle, on, glow} = useSkin(accent, items);
  const ultra = token === 'ultra';
  const dev: Device = ultra ? WATCH_ULTRA_4 : WATCH_S12_46;
  const s = dev.screen;
  const sw = 0.42, pad = 6;
  const base = baseDraw(frame);
  const lugW = dev.w * 0.52, lugH = 7;

  return (
    <Rig vw={dev.w + pad * 2} vh={dev.h + pad * 2 + lugH * 2} accent={accent}
      items={items} parts={WATCH_PARTS} fill={0.92}>
      <g transform={`translate(${pad} ${pad + lugH})`}>
        {/* band lugs, top and bottom */}
        {[-1, 1].map((k) => (
          <rect key={k} x={dev.w / 2 - lugW / 2}
            y={k < 0 ? -lugH : dev.h} width={lugW} height={lugH} rx={1.5}
            fill="none" stroke={on(lit('band'))} strokeWidth={sw * 0.8}
            style={{filter: glow(lit('band'))}} opacity={baseDraw(frame, 18)} />
        ))}
        <rect x={sw / 2} y={sw / 2} width={dev.w - sw} height={dev.h - sw} rx={dev.r} ry={dev.r}
          fill="none" stroke={on(lit('case'))} strokeWidth={sw * (lit('case') > 0.02 ? 1.9 : 1.1)}
          style={{filter: glow(lit('case'))}} {...draw(base)} />
        <rect x={s.bezel} y={s.bezel} width={s.w} height={s.h} rx={s.r} ry={s.r} fill="none"
          stroke={on(lit('screen'))} strokeWidth={sw * (lit('screen') > 0.02 ? 1.6 : 0.9)}
          style={{filter: glow(lit('screen'))}} {...draw(baseDraw(frame, 8))} />

        {/* Digital Crown and side button, right edge; Ultra adds the Action Button left */}
        <rect x={dev.w - sw * 0.6} y={dev.h * 0.30} width={2.6} height={5.2} rx={1.1}
          fill={lit('crown') > 0.02 ? v.a : 'none'} stroke={on(lit('crown'))} strokeWidth={sw * 0.8}
          style={{filter: glow(lit('crown'))}} {...draw(baseDraw(frame, 12))} />
        <rect x={dev.w - sw * 0.6} y={dev.h * 0.52} width={1.8} height={6.5} rx={0.9}
          fill={lit('side') > 0.02 ? v.a : 'none'} stroke={on(lit('side'))} strokeWidth={sw * 0.8}
          style={{filter: glow(lit('side'))}} {...draw(baseDraw(frame, 14))} />
        {ultra && (
          <rect x={-1.8 - sw * 0.4} y={dev.h * 0.40} width={1.8} height={6.5} rx={0.9}
            fill={lit('action') > 0.02 ? v.a : 'none'} stroke={on(lit('action'))} strokeWidth={sw * 0.8}
            style={{filter: glow(lit('action'))}} {...draw(baseDraw(frame, 16))} />
        )}
      </g>
    </Rig>
  );
};

// ---------------------------------------------------------------------------
// AIRPODS 5 — the case and one bud, to scale with each other (46.2x50.1 case,
// 30.2x18.3 bud), because "does it fit in the case" is the whole silhouette.
// ---------------------------------------------------------------------------
const POD_PARTS = ['case', 'bud', 'stem', 'hinge', 'light'];

const AirPods: React.FC<Props> = ({items, accent}) => {
  const {v, frame, lit, idle, on, glow} = useSkin(accent, items);
  const c = AIRPODS_5.case, b = AIRPODS_5.bud;
  const sw = 0.42, pad = 4, gap = 8;
  const base = baseDraw(frame);
  const vw = c.w + gap + b.w * 1.6 + pad * 2;
  const vh = Math.max(c.h, b.h * 1.25) + pad * 2;
  const bx = pad + c.w + gap;

  return (
    <Rig vw={vw} vh={vh} accent={accent} items={items} parts={POD_PARTS} fill={0.8}>
      <g transform={`translate(${pad} ${pad + (vh - pad * 2 - c.h) / 2})`}>
        <rect x={sw / 2} y={sw / 2} width={c.w - sw} height={c.h - sw} rx={c.h * 0.34} ry={c.h * 0.34}
          fill="none" stroke={on(lit('case'))} strokeWidth={sw * (lit('case') > 0.02 ? 1.9 : 1.15)}
          style={{filter: glow(lit('case'))}} {...draw(base)} />
        <line x1={sw} y1={c.h * 0.30} x2={c.w - sw} y2={c.h * 0.30}
          stroke={on(lit('hinge'))} strokeWidth={sw * (lit('hinge') > 0.02 ? 1.3 : 0.7)}
          strokeDasharray={lit('hinge') > 0.02 ? undefined : '1.6 1.6'}
          style={{filter: glow(lit('hinge'))}} opacity={baseDraw(frame, 10)} />
        <circle cx={c.w / 2} cy={c.h * 0.66} r={1.5} fill="none"
          stroke={on(lit('light'))} strokeWidth={sw * 0.8}
          style={{filter: glow(lit('light'))}} {...draw(baseDraw(frame, 14))} />
      </g>

      {/* the bud: the housing, and the stem the volume swipe lives on */}
      <g transform={`translate(${bx} ${pad + (vh - pad * 2 - b.h * 1.25) / 2})`}>
        <ellipse cx={b.w / 2} cy={b.w / 2 + 1} rx={b.w / 2 - sw / 2} ry={b.w / 2 + 1}
          fill="none" stroke={on(lit('bud'))} strokeWidth={sw * (lit('bud') > 0.02 ? 1.8 : 1.1)}
          style={{filter: glow(lit('bud'))}} {...draw(base)} />
        <rect x={b.w / 2 - 2.6} y={b.w / 2 + 4} width={5.2} height={b.h - b.w / 2 - 2} rx={2.6}
          fill="none" stroke={on(lit('stem'))} strokeWidth={sw * (lit('stem') > 0.02 ? 1.7 : 1.05)}
          style={{filter: glow(lit('stem'))}} {...draw(baseDraw(frame, 10))} />
        {/* the swipe: two ticks on the stem, drawn only when the stem is named */}
        {[0, 1].map((i) => (
          <line key={i} x1={b.w / 2 - 1.5} y1={b.h * 0.66 + i * 3} x2={b.w / 2 + 1.5} y2={b.h * 0.66 + i * 3}
            stroke={on(lit('stem'))} strokeWidth={sw * 0.7} opacity={lit('stem') * 0.9} />
        ))}
      </g>
    </Rig>
  );
};

const KINDS: Record<string, React.FC<Props>> = {
  'pro-back': ProBack,
  'pro-front': ProFront,
  'duo-pair': DuoPair,
  'watch-face': WatchFace,
  'airpods': AirPods,
};

export const AppleViz: React.FC<Props & {kind: string}> = ({kind, ...rest}) => {
  const Picture = KINDS[kind];
  if (!Picture) return <UnknownKind kind={kind} registry="AppleViz" />;
  return <Picture {...rest} />;
};
