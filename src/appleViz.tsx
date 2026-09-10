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
  // A near-square drawing (the die) wastes far less vertical room than a 2.1:1 phone, so
  // it gets a bigger share of the budget even with callouts under it. Sizing every kind by
  // one constant left the die floating in the middle of a tall pane.
  const squarish = vh / vw < 1.35;
  const svgH = budget * (v.vertical
    ? (hasCallouts ? (squarish ? 0.74 : 0.62) : 0.9)
    : fill);
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

        {/* Right of the cluster, top to bottom: flash, microphone, lidar — the column and
            the order are both off Apple's drawing (flash Ø6.80, sensor Ø6.65, mic Ø1.15). */}
        {(() => {
          const cx = dev.w - CAM.inset - 9.5;
          return (
            <>
              <circle cx={cx} cy={pl.y + 10} r={CAM.flashR} fill="none"
                stroke={on(lit('flash'))} strokeWidth={sw * 0.9}
                style={{filter: glow(lit('flash'))}} {...draw(baseDraw(frame, 16))} />
              <circle cx={cx} cy={pl.y + pl.h / 2} r={CAM.micR} fill={idle}
                opacity={baseDraw(frame, 18)} />
              <circle cx={cx} cy={pl.y + pl.h - 10} r={CAM.lidarR} fill="none"
                stroke={on(lit('lidar'))} strokeWidth={sw * 0.9}
                style={{filter: glow(lit('lidar'))}} {...draw(baseDraw(frame, 20))} />
            </>
          );
        })()}

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
const DUO_PARTS = ['outer', 'inner', 'hinge', 'body', 'lens', 'selfie'];

const DuoPair: React.FC<Props> = ({items, accent, token}) => {
  const {v, frame, lit, idle, on, glow} = useSkin(accent, items);
  const open = IPHONE_DUO_OPEN, fold = IPHONE_DUO_FOLDED;
  const sw = 0.62, pad = 3, gap = 10;
  const base = baseDraw(frame);
  const onlyOpen = token === 'open';
  const {vertical} = v;

  // SIDE BY SIDE IS A WIDE-ONLY COMPOSITION. Closed plus open is 259mm across and 118 tall
  // — a 2.2:1 landscape block, which in a 9:16 pane is height-bound to almost nothing and
  // the labels collide with it. Owner: "The vert duo in shorts screen is not aligned
  // properly and gets hidden." In vertical the two states STACK instead, which is also the
  // more honest reading of a fold: one thing becoming taller, not two things in a row.
  const stack = vertical && !onlyOpen;
  const vw = onlyOpen ? open.w + pad * 2
    : stack ? open.w + pad * 2
    : fold.w + gap + open.w + pad * 2;
  const vh = stack ? fold.h + gap + open.h + pad * 2 : open.h + pad * 2;
  const openX = onlyOpen || stack ? pad : pad + fold.w + gap;
  const openY = stack ? pad + fold.h + gap : pad;
  const foldX = stack ? pad + (open.w - fold.w) / 2 : pad;

  return (
    <Rig vw={vw} vh={vh} accent={accent} items={items} parts={DUO_PARTS} fill={0.85}>
      {!onlyOpen && (
        <g transform={`translate(${foldX} ${pad})`}>
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

      <g transform={`translate(${openX} ${openY})`}>
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

        {/* THE INNER SELFIE CAMERA IS UNDER THE DISPLAY — it has no cutout and no island,
            which is the whole point of it, so it is drawn as a dashed ring BENEATH the
            screen surface rather than as a hole punched through it. Apple: "under-display
            inner camera". Owner: "we must also be highlighting the selfie camera in duo
            when opened, which is underneath the screen." */}
        {(() => {
          const p = lit('selfie');
          const cx = open.w * 0.74, cy = open.screen.bezel + 11;
          return (
            <g style={{filter: glow(p)}} opacity={baseDraw(frame, 16)}>
              <circle cx={cx} cy={cy} r={3.2} fill="none"
                stroke={p > 0.02 ? v.a : hexA(v.t.colors.muted, 0.42)}
                strokeWidth={sw * (p > 0.02 ? 1.2 : 0.6)} strokeDasharray="1.4 1.4" />
              <circle cx={cx} cy={cy} r={1.2} fill={p > 0.02 ? v.a : hexA(v.t.colors.muted, 0.42)}
                opacity={0.5 + p * 0.5} />
            </g>
          );
        })()}
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

      {/* The bud, drawn from Apple's own product shot: a rounded HOUSING that is wider than
          it is tall, an oval speaker grille facing into the ear, the small oval sensor on
          the outer face, a second grille at the top, and a short stem with a rounded foot.
          The first pass was a plain ellipse on a rectangle, which is a lollipop, not an
          AirPod — the grille and the sensor are what make the silhouette recognisable. */}
      <g transform={`translate(${bx} ${pad + (vh - pad * 2 - b.h * 1.25) / 2})`}>
        {(() => {
          const hw = b.w * 0.62, cx = b.w / 2, cy = hw * 0.92;
          const pb = lit('bud'), ps = lit('stem');
          const col = (p: number) => on(p);
          return (
            <>
              <ellipse cx={cx} cy={cy} rx={hw} ry={hw * 0.94} fill="none"
                stroke={col(pb)} strokeWidth={sw * (pb > 0.02 ? 1.8 : 1.15)}
                style={{filter: glow(pb)}} {...draw(base)} />
              {/* speaker grille, angled into the ear */}
              <ellipse cx={cx - hw * 0.42} cy={cy + hw * 0.05} rx={hw * 0.33} ry={hw * 0.46}
                transform={`rotate(-16 ${cx - hw * 0.42} ${cy + hw * 0.05})`}
                fill={pb > 0.02 ? hexA(v.a, 0.18) : 'none'}
                stroke={col(pb)} strokeWidth={sw * 0.7} opacity={0.9}
                {...draw(baseDraw(frame, 8))} />
              {/* the small oval sensor on the outer face */}
              <ellipse cx={cx + hw * 0.36} cy={cy - hw * 0.06} rx={hw * 0.13} ry={hw * 0.19}
                fill={col(pb)} opacity={0.55 * baseDraw(frame, 12)} />
              {/* top grille */}
              <ellipse cx={cx + hw * 0.30} cy={cy - hw * 0.76} rx={hw * 0.22} ry={hw * 0.11}
                transform={`rotate(-24 ${cx + hw * 0.30} ${cy - hw * 0.76})`}
                fill="none" stroke={col(pb)} strokeWidth={sw * 0.55} opacity={0.75}
                {...draw(baseDraw(frame, 14))} />
              {/* the stem, and the swipe that changes volume on the higher model */}
              <rect x={cx - 2.5} y={cy + hw * 0.68} width={5} height={b.h - cy - hw * 0.68 - 0.5}
                rx={2.5} fill="none" stroke={col(ps)}
                strokeWidth={sw * (ps > 0.02 ? 1.7 : 1.05)}
                style={{filter: glow(ps)}} {...draw(baseDraw(frame, 10))} />
              {[0, 1].map((i) => (
                <line key={i} x1={cx - 1.4} y1={b.h * 0.74 + i * 2.6}
                  x2={cx + 1.4} y2={b.h * 0.74 + i * 2.6}
                  stroke={col(ps)} strokeWidth={sw * 0.7} opacity={ps * 0.95} />
              ))}
            </>
          );
        })()}
      </g>
    </Rig>
  );
};

// ---------------------------------------------------------------------------
// A20 PRO DIE — Apple's own keynote floorplan, which is ALREADY a wireframe, so it
// belongs in this style natively. `token` lights one block group at a time.
//
// THE COUNTS ARE THE POINT, so the picture counts correctly: two super cores and four
// efficiency cores, seven GPU columns, thirty-two Neural Engine cells. A viewer can pause
// and count them and the drawing will not be lying (LAW 0k.3 — the answer goes ON the
// object). Apple's figures: 6-core CPU with 2 new super cores and 4 new efficiency cores,
// 20% faster; 7-core GPU, 40% faster graphics, Neural Accelerators at 2x FP8; 32-core
// Neural Engine.
// ---------------------------------------------------------------------------
const DIE_PARTS = ['cpu', 'gpu', 'neural', 'io'];

const DieFloorplan: React.FC<Props> = ({items, accent, token}) => {
  const {v, frame, lit, idle, on, glow} = useSkin(accent, items);
  const base = baseDraw(frame);
  const D = 100, pad = 4;
  // A group is lit either by its callout or by the scene's token, whichever is stronger.
  const grp = (k: string) => Math.max(lit(k), token === k ? base : 0);
  // A block on Apple's slide is not an empty box — it carries fine internal structure, and
  // that sub-detail is most of what makes the drawing read as SILICON rather than as a
  // wireframe of some boxes. The pattern is deterministic from the block's own position, so
  // it is stable across frames (a random one would crawl from still to still).
  const cell = (x: number, y: number, w: number, h: number, k: string, i = 0) => {
    const p = grp(k);
    const col = p > 0.02 ? v.a : idle;
    const o = baseDraw(frame, 4 + i);
    const cols = w > 12 ? 3 : w > 7 ? 2 : 1;
    const rows = h > 18 ? 4 : h > 10 ? 3 : 2;
    return (
      <g key={`${k}${i}`} opacity={o} style={{filter: glow(p)}}>
        <rect x={x} y={y} width={w} height={h} rx={0.8}
          fill={p > 0.02 ? hexA(v.a, 0.14) : 'none'}
          stroke={col} strokeWidth={p > 0.02 ? 0.7 : 0.35} />
        <g opacity={p > 0.02 ? 0.55 : 0.32}>
          {Array.from({length: cols - 1}).map((_, c) => (
            <line key={`c${c}`} x1={x + (w * (c + 1)) / cols} y1={y + h * 0.16}
              x2={x + (w * (c + 1)) / cols} y2={y + h * 0.84}
              stroke={col} strokeWidth={0.18} />
          ))}
          {Array.from({length: rows - 1}).map((_, r) => (
            <line key={`r${r}`} x1={x + w * 0.14} y1={y + (h * (r + 1)) / rows}
              x2={x + w * 0.86} y2={y + (h * (r + 1)) / rows}
              stroke={col} strokeWidth={0.18} />
          ))}
        </g>
      </g>
    );
  };

  return (
    <Rig vw={D + pad * 2} vh={D + pad * 2} accent={accent} items={items} parts={DIE_PARTS} fill={0.98}>
      <g transform={`translate(${pad} ${pad})`}>
        <rect x={0.6} y={0.6} width={D - 1.2} height={D - 1.2} rx={2}
          fill="none" stroke={on(0)} strokeWidth={1.6} {...draw(base)} />

        {/* the name plate, top left, exactly where Apple puts it */}
        <rect x={4} y={4} width={40} height={12} rx={1} fill="none" stroke={idle} strokeWidth={0.4}
          opacity={base} />
        <foreignObject x={4} y={4} width={40} height={12}>
          <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 1.6}}>
            <AssetIcon asset="si:apple" size={6.5} bare tint={v.dim} />
            <span style={{fontFamily: v.t.fonts.mono, fontSize: 7, color: v.dim,
              letterSpacing: '0.02em', fontWeight: 700}}>A20 PRO</span>
          </div>
        </foreignObject>

        {/* CPU: two super cores over four efficiency cores */}
        {[0, 1].map((i) => cell(4 + i * 20.5, 19, 19, 20, 'cpu', i))}
        {[0, 1, 2, 3].map((i) => cell(4 + i * 10.25, 41.5, 9, 13, 'cpu', 2 + i))}

        {/* GPU: seven columns */}
        {Array.from({length: 7}).map((_, i) => cell(48 + i * 7.2, 19, 6, 35, 'gpu', i))}

        {/* Neural Engine: 32 cells, 8 across and 4 down */}
        {Array.from({length: 32}).map((_, i) =>
          cell(4 + (i % 8) * 5.3, 57 + Math.floor(i / 8) * 6.1, 4.4, 5, 'neural', i))}

        {/* memory and IO, bottom right — unlabelled furniture, dim by design */}
        {[[48, 57, 22, 12], [72, 57, 24, 12], [48, 72, 20, 24], [70, 72, 26, 11], [70, 85, 26, 11]]
          .map(([x, y, w, h], i) => cell(x, y, w, h, 'io', i))}
      </g>
    </Rig>
  );
};

// ---------------------------------------------------------------------------
// COMPARISON BARS — one labelled track per thing, drawn from a DECLARED value.
// Used for Apple's sustained-performance chart and for the cost-versus-price beat,
// where the whole argument is that the two bars are on wildly different scales.
// ---------------------------------------------------------------------------
const BAR_PARTS = ['bar'];

const CompareBars: React.FC<Props> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;
  const rows = items.filter((i) => i.text === 'bar');
  if (!rows.length) return null;
  const max = Math.max(...rows.map((r) => Number(r.value) || 0), 1);
  // Take the real share of the real budget. Capped at 132 in vertical, three bars drew a
  // 400px cluster in a 1300px pane and the beat read as unfinished (LAW 0o rule 2 — a cap
  // is not a layout; the ceiling exists only to stop a two-row beat becoming two billboards).
  const rowH = Math.max(38 * v.scale,
    Math.min(budget / Math.max(rows.length, 1) - 8 * v.scale, (v.vertical ? 260 : 150) * v.scale));

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8 * v.scale, width: '100%',
      height: '100%', minHeight: 0, justifyContent: 'safe center',
    }}>
      {rows.map((r, i) => {
        const p = liveAt(frame, r.atWord, 14);
        const frac = ((Number(r.value) || 0) / max) * p;
        const hero = i === 0;
        return (
          <div key={i} style={{height: rowH, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', gap: 6 * v.scale}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 8 * v.scale, minWidth: 0}}>
              <span style={{...v.body(v.vertical ? 25 : 21), fontWeight: 700,
                color: p > 0.02 ? v.t.colors.text : v.dim, whiteSpace: 'nowrap'}}>{r.label}</span>
              {r.sub && <span style={{...v.body(v.vertical ? 19 : 16), color: v.dim,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{r.sub}</span>}
            </div>
            <div style={{position: 'relative', height: Math.max(7 * v.scale, rowH * 0.16),
              borderRadius: 999, background: hexA(v.t.colors.muted, 0.22), overflow: 'hidden'}}>
              {/* A value that is tiny against the biggest one must still read as A SLIVER,
                  not as a missing bar. On the cost beat the point IS that 9% next to 400%
                  is almost nothing — but "almost nothing" and "broken" look identical at
                  zero width, so the floor is 1.5% once the bar is live at all. */}
              <div style={{
                position: 'absolute', inset: 0,
                width: `${Math.max(frac > 0.001 ? 1.5 : 0, Math.min(1, frac) * 100)}%`,
                borderRadius: 999,
                background: hero ? v.a : hexA(v.t.colors.muted, 0.85),
                boxShadow: hero && p > 0.02 ? `0 0 ${14 * v.scale}px ${hexA(v.a, 0.75)}` : 'none',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// PRICE LADDER — the storage tiers, and the STEP between them, which is the fact.
// Each step up costs $200 more than the step before it, so the last one is three
// times the first. The steps are DERIVED from the prices, never restated, so the
// picture cannot disagree with itself.
// ---------------------------------------------------------------------------
const LADDER_PARTS = ['tier'];

const PriceLadder: React.FC<Props> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;
  const tiers = items.filter((i) => i.text === 'tier');
  if (!tiers.length) return null;
  const rowH = Math.max(40 * v.scale,
    Math.min(budget / Math.max(tiers.length, 1) - 6 * v.scale, (v.vertical ? 150 : 104) * v.scale));
  const money = (n: number) => `$${n.toLocaleString('en-US')}`;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6 * v.scale, width: '100%',
      height: '100%', minHeight: 0, justifyContent: 'safe center',
    }}>
      {tiers.map((t, i) => {
        const p = liveAt(frame, t.atWord, 12);
        const price = Number(t.value) || 0;
        const prev = i > 0 ? Number(tiers[i - 1].value) || 0 : 0;
        const step = i > 0 ? price - prev : 0;
        return (
          <div key={i} style={{
            height: rowH, display: 'flex', alignItems: 'center', gap: 12 * v.scale,
            opacity: 0.38 + p * 0.62,
            borderTop: i ? `1px solid ${hexA(v.t.colors.panelBorder, 0.55)}` : 'none',
          }}>
            <span style={{...v.mono(v.vertical ? 27 : 22), fontWeight: 700, minWidth: 0,
              color: p > 0.02 ? v.t.colors.text : v.dim, whiteSpace: 'nowrap'}}>{t.label}</span>
            <span style={{flex: '1 1 auto'}} />
            {step > 0 && (
              <span style={{
                ...v.mono(v.vertical ? 20 : 16.5), fontWeight: 700,
                color: p > 0.02 ? v.a : v.dim, whiteSpace: 'nowrap',
                padding: `${3 * v.scale}px ${9 * v.scale}px`, borderRadius: 999,
                border: `1px solid ${hexA(p > 0.02 ? v.a : v.t.colors.muted, 0.55)}`,
                opacity: p,
              }}>{`+${money(step)}`}</span>
            )}
            <span style={{...v.mono(v.vertical ? 30 : 25), fontWeight: 800,
              color: p > 0.02 ? v.t.colors.text : v.dim, whiteSpace: 'nowrap',
              textShadow: p > 0.02 ? `0 0 ${12 * v.scale}px ${hexA(v.a, 0.6)}` : 'none'}}>
              {money(price)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// PRICE RISE — the old price struck through, the new one beside it, and the delta.
//
// This is the beat where the ending actually lives, and it is the opposite of what
// everyone expects: when a new iPhone lands the previous ones normally get CHEAPER.
// This year Apple RAISED them. So the picture is not a ladder, it is a set of befores
// and afters, and the strike is drawn as a gesture rather than faded in, because a
// strike is something that HAPPENS to a price.
//
// `value` is the new price, `sub` is the old one. The delta is derived from the pair,
// so the chip beside a row can never disagree with the two numbers next to it.
// ---------------------------------------------------------------------------
const RISE_PARTS = ['rise'];

const PriceRise: React.FC<Props> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;
  const rows = items.filter((i) => i.text === 'rise');
  if (!rows.length) return null;
  const cur = token || '';                       // currency prefix, e.g. "₹" or "$"
  const rowH = Math.max(46 * v.scale,
    Math.min(budget / Math.max(rows.length, 1) - 6 * v.scale, (v.vertical ? 190 : 120) * v.scale));
  const fmt = (n: number) => `${cur}${n.toLocaleString('en-IN')}`;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6 * v.scale, width: '100%',
      height: '100%', minHeight: 0, justifyContent: 'safe center',
    }}>
      {rows.map((r, i) => {
        const p = liveAt(frame, r.atWord, 12);
        const now = Number(r.value) || 0;
        const was = Number(r.sub) || 0;
        const up = now - was;
        return (
          <div key={i} style={{
            height: rowH, display: 'flex', alignItems: 'center', gap: 10 * v.scale,
            opacity: 0.36 + p * 0.64,
            borderTop: i ? `1px solid ${hexA(v.t.colors.panelBorder, 0.5)}` : 'none',
          }}>
            <div style={{minWidth: 0, flex: '1 1 auto'}}>
              <div style={{...v.body(v.vertical ? 24 : 19.5), fontWeight: 700,
                color: p > 0.02 ? v.t.colors.text : v.dim,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{r.label}</div>
              {/* the old price, with the strike DRAWN across it */}
              <div style={{position: 'relative', display: 'inline-block', marginTop: 3 * v.scale}}>
                <span style={{...v.mono(v.vertical ? 20 : 16.5), color: v.dim,
                  whiteSpace: 'nowrap'}}>{fmt(was)}</span>
                <span style={{
                  position: 'absolute', left: 0, top: '52%', height: Math.max(1.6, 2 * v.scale),
                  width: `${Math.min(1, p * 1.6) * 100}%`, background: v.sem('red'),
                  borderRadius: 999, transform: 'translateY(-50%)',
                }} />
              </div>
            </div>
            <span style={{
              ...v.mono(v.vertical ? 19 : 16), fontWeight: 700, whiteSpace: 'nowrap',
              color: p > 0.02 ? v.sem('red') : v.dim, opacity: p,
              padding: `${3 * v.scale}px ${9 * v.scale}px`, borderRadius: 999,
              border: `1px solid ${hexA(v.sem('red'), 0.5)}`,
            }}>{`+${fmt(up)}`}</span>
            <span style={{...v.mono(v.vertical ? 28 : 23), fontWeight: 800, whiteSpace: 'nowrap',
              color: p > 0.02 ? v.t.colors.text : v.dim,
              textShadow: p > 0.02 ? `0 0 ${12 * v.scale}px ${hexA(v.a, 0.55)}` : 'none'}}>
              {fmt(now)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const KINDS: Record<string, React.FC<Props>> = {
  'price-rise': PriceRise,
  'die-floorplan': DieFloorplan,
  'compare-bars': CompareBars,
  'price-ladder': PriceLadder,
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
