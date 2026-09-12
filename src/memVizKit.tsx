import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {SemColor} from './types';
import {hexA} from './ui';
import {wordToFrame} from './themes';
import {useViz, stackBudget} from './dsaViz';
import {arriveAt, travelAt, landAt, leaveAt} from './motion/system';
import {seededRandom} from './motion/util';
import {AssetIcon} from './AssetIcon';

// MEM VIZ KIT — the shared drawing surface for the memory pictures (src/memVizA/B.tsx).
//
// EVERY PICTURE DRAWS IN DESIGN PIXELS. The SVG's viewBox is the pane's own inner box,
// measured the same way StatePane measures itself (stage width less the scene's side
// gutters, the pane border and the pane padding; height from `stackBudget`). So one user
// unit is one design pixel in both aspects, type set at 20 here is 20px × scale on screen,
// nothing is ever squashed (LAW 0o.7), and a layout that fits the viewBox fits the pane.
//
// Timing is resolved from each element's own anchor through the four motion roles
// (LAW 0i + src/motion/system.ts). An element with NO anchor is part of the base picture
// and arrives with it, inside the first 30 frames (LAW 8).

export interface MemItem {
  label?: string;
  sub?: string;
  /** Per-kind ROLE key: which part of the picture this item is. */
  text?: string;
  value?: number | string;
  icon?: string;
  color?: SemColor;
  atWord?: number;
}
export type MemProps = {items: MemItem[]; accent: SemColor; token?: string};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const num = (x: number | string | undefined, d = 0): number => {
  if (typeof x === 'number') return x;
  const n = parseFloat(String(x ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : d;
};
export const one = (items: MemItem[], key: string) => items.find((i) => i.text === key);
export const all = (items: MemItem[], key: string) => items.filter((i) => i.text === key);
export const startOf = (it?: MemItem): number | null =>
  (it?.atWord == null ? null : wordToFrame(it.atWord));
export const fmt = (n: number, dp = 0) =>
  n.toLocaleString('en-US', {minimumFractionDigits: dp, maximumFractionDigits: dp});
export const rnd = seededRandom;

/** Width of the pane's inner box in design px — the same arithmetic StatePane runs:
 *  frame width − the MEM_STAGE side gutters − the 2px pane border each side − padding. */
export const PANE_W = (vertical: boolean) =>
  (vertical ? 1080 - 2 * 52 - 4 - 2 * 22 : 1920 - 2 * 72 - 4 - 2 * 24);

const clampX = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const useMem = (accent: SemColor) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const W = PANE_W(v.vertical);
  const H = Math.max(220, stackBudget(v));
  const base = interpolate(frame, [0, 30], [0, 1], clampX);
  type Role = (f: number, s: number, d?: number) => number;
  const role = (fn: Role) => (it?: MemItem, dur?: number, delay = 0) => {
    const s = startOf(it);
    return s == null ? base : fn(frame, s + delay, dur);
  };
  const c = {
    a: v.a, text: v.t.colors.text, dim: v.dim, line: v.line, panel: v.t.colors.panel,
    muted: v.t.colors.muted, bg: v.t.colors.bg,
    red: v.sem('red'), green: v.sem('green'), yellow: v.sem('yellow'),
    orange: v.sem('orange'), blue: v.sem('blue'), purple: v.sem('purple'),
  };
  return {
    v, frame, W, H, base, c,
    /** ARRIVE on the item's anchor. */
    inn: role(arriveAt),
    /** TRAVEL on the item's anchor. */
    go: role(travelAt),
    /** LAND (with follow-through) on the item's anchor. */
    land: role(landAt),
    /** LEAVE from the item's anchor (0 until then). */
    out: (it?: MemItem, dur?: number, delay = 0) => {
      const s = startOf(it);
      return s == null ? 0 : leaveAt(frame, s + delay, dur);
    },
    /** Frames since the item's anchor (negative before it; base items count from 0). */
    since: (it?: MemItem) => {
      const s = startOf(it);
      return frame - (s ?? 0);
    },
    col: (it?: MemItem, fallback?: string) => (it?.color ? v.sem(it.color) : fallback ?? v.a),
    f: (wide: number, tall: number) => (v.vertical ? tall : wide),
    body: v.t.fonts.body,
    mono: v.t.fonts.mono,
  };
};
export type Mem = ReturnType<typeof useMem>;

/** The drawing surface: an SVG in design px, plus an optional HTML layer on top for the
 *  things SVG does badly (icon glyphs). Both share one coordinate space. */
export const Stage: React.FC<{m: Mem; children: React.ReactNode; html?: React.ReactNode}> =
({m, children, html}) => (
  <div style={{position: 'relative', width: m.W * m.v.scale, height: m.H * m.v.scale, margin: '0 auto', flex: '0 0 auto'}}>
    <svg width={m.W * m.v.scale} height={m.H * m.v.scale} viewBox={`0 0 ${m.W} ${m.H}`}
      style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      {children}
    </svg>
    {html}
  </div>
);

/** Text in design px. `dominantBaseline: central` so y is the visual middle of the line —
 *  every label below is placed by its centre, which is what makes rows align. */
export const Tx: React.FC<{
  m: Mem; x: number; y: number; size: number; fill?: string; mono?: boolean;
  weight?: number; anchor?: 'start' | 'middle' | 'end'; opacity?: number; children: React.ReactNode;
  spacing?: number;
}> = ({m, x, y, size, fill, mono, weight = 500, anchor = 'start', opacity = 1, children, spacing}) => (
  <text x={x} y={y} fontSize={size} fill={fill ?? m.c.text} fontFamily={mono ? m.mono : m.body}
    fontWeight={weight} textAnchor={anchor} dominantBaseline="central" opacity={opacity}
    letterSpacing={spacing}>
    {children}
  </text>
);

/** Largest type size ≤ `size` at which `text` fits in `maxW` (character-width estimate:
 *  deterministic, which a DOM measurement inside a still-by-still render is not). */
export const fit = (text: string | undefined, maxW: number, size: number, mono = false) => {
  const k = mono ? 0.61 : 0.54;
  const len = Math.max(1, (text ?? '').length);
  return Math.max(9, Math.min(size, maxW / (len * k)));
};

/** Stroke draw-on with the dash REMOVED at completion (see appleViz `draw`: a dash equal
 *  to the path length leaves a seam, and the finished state is what is on screen longest). */
export const drawOn = (p: number) => (p >= 0.999
  ? {}
  : {pathLength: 1, strokeDasharray: '1 1', strokeDashoffset: Math.max(0, 1 - p)});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ── shared objects ─────────────────────────────────────────────────────────────────────

/** A memory module: PCB, eight chips, gold contacts with the keying notch. Recognisable
 *  at any size, and it is literally the thing being talked about. */
export const Dimm: React.FC<{m: Mem; x: number; y: number; w: number; h: number; p?: number; glow?: number}> =
({m, x, y, w, h, p = 1, glow = 0}) => {
  const chips = 8;
  const cw = w * 0.085;
  const gap = (w - chips * cw) / (chips + 1);
  const pcbH = h * 0.8;
  const teeth = Math.max(12, Math.floor(w / 10));
  const tw = w / teeth;
  const notch = Math.floor(teeth * 0.42);
  return (
    <g opacity={p}>
      <rect x={x} y={y} width={w} height={pcbH} rx={4} fill={hexA(m.c.green, 0.16)}
        stroke={glow > 0.02 ? m.c.a : hexA(m.c.green, 0.7)} strokeWidth={2} />
      {Array.from({length: chips}).map((_, i) => (
        <rect key={i} x={x + gap + i * (cw + gap)} y={y + pcbH * 0.18} width={cw} height={pcbH * 0.5}
          rx={2} fill={hexA(m.c.text, 0.22)} />
      ))}
      {Array.from({length: teeth}).map((_, i) => (i === notch ? null : (
        <rect key={i} x={x + i * tw + tw * 0.2} y={y + pcbH} width={tw * 0.6} height={h - pcbH}
          fill={hexA(m.c.yellow, 0.75)} />
      )))}
    </g>
  );
};

/** A padlock. `closed` drops the shackle into the body. */
export const Padlock: React.FC<{m: Mem; cx: number; cy: number; s: number; color: string; closed?: number; opacity?: number}> =
({m, cx, cy, s, color, closed = 1, opacity = 1}) => {
  const bw = s, bh = s * 0.72;
  const r = bw * 0.3;
  const top = cy - bh / 2;
  // Open = the whole shackle lifted clear of the body; closed = seated in it.
  const lift = (1 - closed) * s * 0.2;
  return (
    <g opacity={opacity}>
      <path transform={`translate(0 ${-lift})`}
        d={`M ${cx - r} ${top + s * 0.04} V ${top - s * 0.12} A ${r} ${r} 0 0 1 ${cx + r} ${top - s * 0.12} V ${top + s * 0.04}`}
        fill="none" stroke={color} strokeWidth={s * 0.1} strokeLinecap="round" />
      <rect x={cx - bw / 2} y={top} width={bw} height={bh} rx={s * 0.12} fill={hexA(color, 0.22)}
        stroke={color} strokeWidth={s * 0.07} />
      <circle cx={cx} cy={cy - bh * 0.06} r={s * 0.08} fill={color} />
      <rect x={cx - s * 0.03} y={cy - bh * 0.02} width={s * 0.06} height={bh * 0.24} fill={color} />
    </g>
  );
};

/** Greedy word wrap by character budget (deterministic, like `fit`). */
export const wrap = (text: string | undefined, maxChars: number, maxLines = 2): string[] => {
  const words = (text ?? '').split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
};

/** An icon glyph (lucide:/si:) parked over the SVG at design coordinates. */
export const IconAt: React.FC<{m: Mem; cx: number; cy: number; s: number; icon?: string; tint?: string; opacity?: number}> =
({m, cx, cy, s, icon, tint, opacity = 1}) => (icon ? (
  <div style={{
    position: 'absolute', left: (cx - s / 2) * m.v.scale, top: (cy - s / 2) * m.v.scale,
    width: s * m.v.scale, height: s * m.v.scale, display: 'flex', alignItems: 'center',
    justifyContent: 'center', opacity,
  }}>
    <AssetIcon asset={icon} size={s * m.v.scale} bare tint={tint} />
  </div>
) : null);

/** A solid-state drive: the far, slow place a swapped page goes. */
export const Drive: React.FC<{m: Mem; x: number; y: number; w: number; h: number; p?: number; led?: number}> =
({m, x, y, w, h, p = 1, led = 0}) => (
  <g opacity={p}>
    <rect x={x} y={y} width={w} height={h} rx={10} fill={hexA(m.c.text, 0.05)} stroke={m.c.dim} strokeWidth={2} />
    <rect x={x + w * 0.08} y={y + h * 0.16} width={w * 0.5} height={h * 0.2} rx={4} fill={hexA(m.c.text, 0.1)} />
    {Array.from({length: 4}).map((_, i) => (
      <rect key={i} x={x + w * 0.08 + i * w * 0.2} y={y + h * 0.5} width={w * 0.16} height={h * 0.3} rx={3}
        fill={hexA(m.c.text, 0.18)} />
    ))}
    <circle cx={x + w * 0.88} cy={y + h * 0.26} r={Math.max(4, h * 0.06)}
      fill={led > 0.02 ? m.c.green : hexA(m.c.text, 0.2)} opacity={0.4 + led * 0.6} />
  </g>
);

/** A page tile: a 4 KB page drawn as a small sheet with its corner folded. */
export const PageTile: React.FC<{x: number; y: number; s: number; fill: string; stroke: string; opacity?: number; sw?: number}> =
({x, y, s, fill, stroke, opacity = 1, sw = 2}) => {
  const k = s * 0.26;
  return (
    <g opacity={opacity}>
      <path d={`M ${x} ${y} h ${s - k} l ${k} ${k} v ${s - k} h ${-s} z`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M ${x + s - k} ${y} v ${k} h ${k}`} fill="none" stroke={stroke} strokeWidth={sw * 0.8} strokeLinejoin="round" />
    </g>
  );
};

/** An arrowhead at (x, y) pointing along angle `ang` (radians). */
export const Head: React.FC<{x: number; y: number; ang: number; s: number; color: string; opacity?: number}> =
({x, y, ang, s, color, opacity = 1}) => {
  const a1 = ang + Math.PI * 0.82, a2 = ang - Math.PI * 0.82;
  return (
    <path d={`M ${x} ${y} L ${x + Math.cos(a1) * s} ${y + Math.sin(a1) * s} L ${x + Math.cos(a2) * s} ${y + Math.sin(a2) * s} Z`}
      fill={color} opacity={opacity} />
  );
};

/** A tick (✓) or a cross (✗) drawn as strokes, so it can draw itself on. */
export const Mark: React.FC<{cx: number; cy: number; s: number; ok: boolean; color: string; p: number}> =
({cx, cy, s, ok, color, p}) => (ok ? (
  <path d={`M ${cx - s * 0.45} ${cy} L ${cx - s * 0.12} ${cy + s * 0.34} L ${cx + s * 0.5} ${cy - s * 0.36}`}
    fill="none" stroke={color} strokeWidth={s * 0.16} strokeLinecap="round" strokeLinejoin="round" {...drawOn(p)} />
) : (
  <g>
    <path d={`M ${cx - s * 0.38} ${cy - s * 0.38} L ${cx + s * 0.38} ${cy + s * 0.38}`} stroke={color}
      strokeWidth={s * 0.16} strokeLinecap="round" {...drawOn(clamp01(p * 2))} />
    <path d={`M ${cx + s * 0.38} ${cy - s * 0.38} L ${cx - s * 0.38} ${cy + s * 0.38}`} stroke={color}
      strokeWidth={s * 0.16} strokeLinecap="round" {...drawOn(clamp01(p * 2 - 1))} />
  </g>
));

/** A rubber stamp that slams in: rotated, bordered, uppercase. */
export const Stamp: React.FC<{m: Mem; cx: number; cy: number; text: string; color: string; p: number; size: number; rot?: number}> =
({m, cx, cy, text, color, p, size, rot = -8}) => {
  if (p <= 0.001) return null;
  const w = text.length * size * 0.62 + size * 1.4;
  const h = size * 1.9;
  const sc = 1.6 - 0.6 * Math.min(1, p);
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${sc})`} opacity={Math.min(1, p * 1.4)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={size * 0.25} fill={hexA(color, 0.1)}
        stroke={color} strokeWidth={size * 0.14} />
      <text x={0} y={0} fontSize={size} fill={color} fontFamily={m.body} fontWeight={800}
        textAnchor="middle" dominantBaseline="central" letterSpacing={size * 0.08}>{text.toUpperCase()}</text>
    </g>
  );
};

/** A bit/byte cell: a rounded square with its value centred. */
export const Cell: React.FC<{m: Mem; x: number; y: number; w: number; h: number; text: string; lit: number; color: string; mono?: boolean; size?: number}> =
({m, x, y, w, h, text, lit, color, mono = true, size}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={Math.min(8, w * 0.16)}
      fill={lit > 0.02 ? hexA(color, 0.14 + 0.3 * lit) : hexA(m.c.text, 0.04)}
      stroke={lit > 0.02 ? color : m.c.line} strokeWidth={1.6} />
    <text x={x + w / 2} y={y + h / 2} fontSize={size ?? Math.min(h * 0.5, w * 0.5)}
      fill={lit > 0.5 ? m.c.text : m.c.dim} fontFamily={mono ? m.mono : m.body} fontWeight={700}
      textAnchor="middle" dominantBaseline="central">{text}</text>
  </g>
);
