import React from 'react';
import {useTheme, wordToFrame} from './themes';
import {SemColor, TokStageItem} from './types';
import {useScale, useSem, hexA} from './ui';

/**
 * Shared kit for the TOK_STAGE depictions ("21 ways to save Claude Code tokens").
 *
 * EVERY MOMENT COMES FROM A WORD (LAW 0i.1): `F(atWord)` is the only clock in these files.
 * `BASE()` caps furniture at 38 frames so the picture is on screen within ~1.3s whatever the
 * anchors say (component_authoring §2). Every number drawn is AUTHORED on an item (LAW 0m.2);
 * `briefs/tokens21/FACTS.md` records where each one came from. These files compute geometry only.
 */
export const F = (w?: number) => (w == null ? 0 : wordToFrame(w));
export const BASE = (w?: number) => Math.min(F(w ?? 1), 38);

export const useV = (accent: SemColor) => {
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
export type V = ReturnType<typeof useV>;

export interface TokVizProps {items: TokStageItem[]; accent: SemColor; token?: string; w: number; h: number}

export const pick = (items: TokStageItem[], group: string) => items.filter((i) => i.group === group);
export const one = (items: TokStageItem[], group: string) => items.find((i) => i.group === group);
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const clamp01 = (u: number) => Math.max(0, Math.min(1, u));

/** A caption that belongs to an object: never a box around it. */
export const Cap: React.FC<{v: V; title?: string; sub?: string; on?: number; align?: 'left' | 'center' | 'right';
  size?: number; color?: string; mono?: boolean; subColor?: string}> =
  ({v, title, sub, on = 1, align = 'center', size = 26, color, mono, subColor}) => (
    <div style={{textAlign: align, opacity: on, transform: `translateY(${(1 - on) * v.s(8)}px)`}}>
      {title ? <div style={{fontFamily: mono ? v.t.fonts.mono : v.t.fonts.display,
        fontWeight: mono ? 500 : (v.t.style.displayWeight as any),
        letterSpacing: mono ? 0 : v.t.style.displayTracking, fontSize: v.s(size), lineHeight: 1.14,
        color: color ?? v.t.colors.text}}>{title}</div> : null}
      {sub ? <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(size * 0.62), lineHeight: 1.34,
        color: subColor ?? v.t.colors.muted, marginTop: v.s(5)}}>{sub}</div> : null}
    </div>
  );

/** A value chip in the theme's mono face: a size, a price, a verdict. */
export const Chip: React.FC<{v: V; text: string; on: number; color: string; size: number; solid?: boolean}> =
  ({v, text, on, color, size, solid}) => (
    <div style={{
      opacity: on, transform: `translateY(${(1 - on) * v.s(10)}px) scale(${0.92 + 0.08 * on})`,
      padding: `${size * 0.32}px ${size * 0.62}px`, borderRadius: v.rad(8), display: 'inline-block',
      background: solid ? hexA(color, 0.2) : hexA(v.t.colors.muted, 0.08),
      border: `${Math.max(1, v.s(solid ? 2 : 1))}px solid ${hexA(color, solid ? 0.95 : 0.34)}`,
      boxShadow: solid ? v.glow(color, 16) : 'none',
      fontFamily: v.t.fonts.mono, fontSize: size, lineHeight: 1.1, whiteSpace: 'nowrap',
      color: solid ? v.t.colors.text : v.t.colors.muted,
    }}>{text}</div>
  );

/** Absolutely positioned child, in pane pixels. */
export const At: React.FC<{x: number; y: number; w?: number; h?: number; center?: boolean; children?: React.ReactNode;
  style?: React.CSSProperties}> = ({x, y, w, h, center, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h,
    transform: center ? 'translate(-50%, -50%)' : undefined, ...style}}>{children}</div>
);

/** Palette for the parts of a request, so every picture colours the same thing the same way. */
export const partColors = (v: V) => ({
  system: v.sem('blue'),
  tools: v.sem('purple'),
  memory: v.sem('orange'),
  skills: v.sem('yellow'),
  mcp: v.sem('green'),
  // The TEXT colour, not muted: muted at the fill alphas below vanished on a dark ground (toll, twice,
  // backpack and resend all drew invisible history on the first proof sheet, 2026-09-30).
  history: v.t.colors.text,
  you: v.sem('red'),
  cached: v.sem('blue'),
  fresh: v.sem('red'),
});
export const partColor = (v: V, key?: string) => {
  const c = partColors(v) as Record<string, string>;
  return (key && c[key]) || v.a;
};
