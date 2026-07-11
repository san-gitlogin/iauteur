import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {hexA, useScale, useSem} from '../../ui';

// Dark colors that need dark (not white) text on them.
const DARK_TEXT: SemColor[] = ['yellow', 'orange'];
export const onColor = (c: SemColor | undefined): string => (c && DARK_TEXT.includes(c) ? '#0F172A' : '#FFFFFF');

// A solid flat block — no shadow, moderate radius. `fill` = a solid accent or neutral panel.
export const Block: React.FC<{color?: SemColor; index?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({color, index = 0, style, children}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const bg = color ? sem(color) : t.colors.panel;
  return (
    <div style={{position: 'relative', background: bg, borderRadius: 12 * scale, padding: `${26 * scale}px ${30 * scale}px`, ...style}}>
      {children}
    </div>
  );
};

// A solid uppercase tag/label chip.
export const Tag: React.FC<{color?: SemColor; children: React.ReactNode}> = ({color = 'blue', children}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  return <span style={{background: sem(color), color: onColor(color), fontFamily: t.fonts.mono, fontWeight: 600, fontSize: 22 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', padding: `${6 * scale}px ${16 * scale}px`, borderRadius: 8 * scale}}>{children}</span>;
};

// Outfit headline; the ONE accent phrase sits in a solid color block (inline).
export const FdHeadline: React.FC<{text: string; color?: SemColor; startFrame?: number; top?: number}> = ({text, color = 'blue', startFrame = 0, top}) => {
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div style={{...fadeUp(frame, startFrame, fps), position: 'absolute', top: (top ?? (vertical ? 150 : 96)) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 60 : 68) * scale, letterSpacing: '-0.02em', color: t.colors.text, padding: `0 ${72 * scale}px`, lineHeight: 1.1}}>
      {parts.map((p, i) => (i % 2 === 1
        ? <span key={i} style={{background: sem(color), color: onColor(color), padding: `${1 * scale}px ${12 * scale}px`, borderRadius: 8 * scale}}>{p}</span>
        : <span key={i}>{p}</span>))}
    </div>
  );
};

// Chrome: large flat poster geometric shapes at the edges (sharp, no blur).
export const FdChrome: React.FC = () => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 80) * 10 * scale;
  const W = (vertical ? 1080 : 1920) * scale;
  const H = (vertical ? 1920 : 1080) * scale;
  const S = (vertical ? 1080 : 1920) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden'}}>
      {/* big circle top-right */}
      <div style={{position: 'absolute', top: -0.16 * S + drift, right: -0.12 * S, width: 0.42 * S, height: 0.42 * S, borderRadius: '50%', background: hexA(sem('blue'), 0.12)}} />
      {/* rectangle bottom-left */}
      <div style={{position: 'absolute', bottom: -0.08 * S, left: -0.06 * S, width: 0.34 * S, height: 0.24 * S, borderRadius: 20 * scale, background: hexA(sem('green'), 0.10), transform: 'rotate(-8deg)'}} />
      {/* small circle mid-left */}
      <div style={{position: 'absolute', top: H * 0.62, left: W * 0.08, width: 0.1 * S, height: 0.1 * S, borderRadius: '50%', background: hexA(sem('orange'), 0.14)}} />
      {/* half pill top-left */}
      <div style={{position: 'absolute', top: H * 0.12, left: -0.05 * S, width: 0.16 * S, height: 0.08 * S, borderRadius: 999, background: hexA(sem('purple'), 0.10)}} />
    </div>
  );
};
