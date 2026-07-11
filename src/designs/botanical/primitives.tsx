import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {hexA, useScale, useSem} from '../../ui';

// An arch-framed container — top corners form a semicircle arch (the signature).
export const Arch: React.FC<{width: number; height?: number; fill?: string; border?: string; style?: React.CSSProperties; children?: React.ReactNode}> = ({width, height, fill, border, style, children}) => {
  const t = useTheme();
  const {scale} = useScale();
  const w = width * scale;
  const h = (height ?? width) * scale;
  return (
    <div style={{width: w, height: h, borderRadius: `${w / 2}px ${w / 2}px ${28 * scale}px ${28 * scale}px`, background: fill ?? t.colors.panel, border: border ? `${2 * scale}px solid ${border}` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...style}}>
      {children}
    </div>
  );
};

// A botanical line-art sprig (a stem with leaves), drawn as an outline.
export const Sprig: React.FC<{size: number; color?: string; rotate?: number; flip?: boolean; style?: React.CSSProperties}> = ({size, color, rotate = 0, flip = false, style}) => {
  const t = useTheme();
  const {scale} = useScale();
  const s = size * scale;
  const c = color ?? t.colors.accent;
  const leaf = (cx: number, cy: number, rot: number) => (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <path d="M0 0 Q 10 -8 20 0 Q 10 8 0 0 Z" stroke={c} strokeWidth={1.4} fill="none" />
    </g>
  );
  return (
    <svg style={{position: 'absolute', transform: `rotate(${rotate}deg) scaleX(${flip ? -1 : 1})`, ...style}} width={s} height={s} viewBox="0 0 100 100" fill="none">
      <path d="M50 96 C 50 70 46 50 50 24 C 52 14 50 8 50 4" stroke={c} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      {leaf(50, 74, -40)}{leaf(50, 74, 220)}
      {leaf(49, 54, -35)}{leaf(51, 54, 215)}
      {leaf(50, 34, -30)}{leaf(50, 34, 210)}
      {leaf(50, 18, -25)}
    </svg>
  );
};

// Playfair headline; the ONE accent phrase is sage/terracotta italic.
export const BotHeadline: React.FC<{text: string; color?: SemColor; startFrame?: number; top?: number}> = ({text, color = 'green', startFrame = 0, top}) => {
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div style={{...fadeUp(frame, startFrame, fps), position: 'absolute', top: (top ?? (vertical ? 168 : 112)) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 64 : 72) * scale, letterSpacing: '-0.01em', color: t.colors.text, padding: `0 ${86 * scale}px`, lineHeight: 1.12}}>
      {parts.map((p, i) => (i % 2 === 1 ? <span key={i} style={{color: sem(color), fontStyle: 'italic'}}>{p}</span> : <span key={i}>{p}</span>))}
    </div>
  );
};

// Chrome: paper grain + a few gently swaying botanical sprigs at the corners.
export const BotChrome: React.FC = () => {
  const {scale, vertical} = useScale();
  const sem = useSem();
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 60) * 3;
  const W = (vertical ? 1080 : 1920) * scale;
  const H = (vertical ? 1920 : 1080) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(rgba(0,0,0,0.5) ${1 * scale}px, transparent ${1.2 * scale}px)`, backgroundSize: `${3 * scale}px ${3 * scale}px`, mixBlendMode: 'multiply', opacity: 0.08}} />
      <Sprig size={vertical ? 150 : 170} color={hexA(sem('green'), 0.6)} rotate={-18 + sway} style={{left: 30 * scale, top: 40 * scale}} />
      <Sprig size={vertical ? 140 : 160} color={hexA(sem('green'), 0.55)} rotate={18 - sway} flip style={{right: 30 * scale, top: 50 * scale}} />
      <Sprig size={vertical ? 130 : 150} color={hexA(sem('red'), 0.45)} rotate={200 + sway} style={{left: 44 * scale, top: H - 200 * scale}} />
      <Sprig size={vertical ? 130 : 150} color={hexA(sem('green'), 0.5)} rotate={160 - sway} flip style={{right: 44 * scale, top: H - 200 * scale}} />
    </div>
  );
};
