import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {useScale, useSem} from '../../ui';

// Mixed "leaf" corner-radius presets — playful asymmetric cards.
export const LEAF_RADII = [
  '38px 38px 38px 8px',
  '8px 38px 38px 38px',
  '38px 8px 38px 38px',
  '38px 38px 8px 38px',
  '30px',
];

type ShapeKind = 'circle' | 'ring' | 'triangle' | 'square' | 'pill' | 'squiggle' | 'zigzag' | 'plus';

// A decorative Memphis primitive with a hard offset shadow.
export const Shape: React.FC<{kind: ShapeKind; color: string; size: number; rotate?: number; style?: React.CSSProperties}> = ({kind, color, size, rotate = 0, style}) => {
  const {scale} = useScale();
  const s = size * scale;
  const sh = 5 * scale;
  const common: React.CSSProperties = {position: 'absolute', transform: `rotate(${rotate}deg)`, ...style};
  if (kind === 'circle') return <div style={{...common, width: s, height: s, borderRadius: '50%', background: color, boxShadow: `${sh}px ${sh}px 0 rgba(0,0,0,0.25)`}} />;
  if (kind === 'ring') return <div style={{...common, width: s, height: s, borderRadius: '50%', border: `${s * 0.18}px solid ${color}`}} />;
  if (kind === 'square') return <div style={{...common, width: s, height: s, borderRadius: s * 0.16, background: color, boxShadow: `${sh}px ${sh}px 0 rgba(0,0,0,0.25)`}} />;
  if (kind === 'pill') return <div style={{...common, width: s * 1.7, height: s * 0.7, borderRadius: 999, background: color, boxShadow: `${sh}px ${sh}px 0 rgba(0,0,0,0.25)`}} />;
  if (kind === 'triangle') return <div style={{...common, width: 0, height: 0, borderLeft: `${s * 0.55}px solid transparent`, borderRight: `${s * 0.55}px solid transparent`, borderBottom: `${s}px solid ${color}`, filter: `drop-shadow(${sh}px ${sh}px 0 rgba(0,0,0,0.22))`}} />;
  if (kind === 'plus') return (
    <div style={{...common, width: s, height: s}}>
      <div style={{position: 'absolute', top: '38%', left: 0, width: '100%', height: '24%', background: color, borderRadius: 999}} />
      <div style={{position: 'absolute', left: '38%', top: 0, height: '100%', width: '24%', background: color, borderRadius: 999}} />
    </div>
  );
  const path = kind === 'squiggle'
    ? `M2 ${s * 0.5} Q ${s * 0.25} 2 ${s * 0.5} ${s * 0.5} T ${s - 2} ${s * 0.5}`
    : `M2 ${s - 4} L ${s * 0.33} 4 L ${s * 0.66} ${s - 4} L ${s - 2} 4`;
  return (
    <svg style={common} width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      <path d={path} stroke={color} strokeWidth={s * 0.14} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// A playful sticker card: dark panel, colored border + hard colored shadow, leaf radii.
export const Sticker: React.FC<{color: SemColor; index?: number; rotate?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({color, index = 0, rotate = 0, style, children}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const c = sem(color);
  const off = 11 * scale;
  return (
    <div style={{position: 'relative', background: t.colors.panel, border: `${3 * scale}px solid ${c}`, borderRadius: LEAF_RADII[index % LEAF_RADII.length], boxShadow: `${off}px ${off}px 0 ${c}`, transform: `rotate(${rotate}deg)`, padding: `${26 * scale}px ${30 * scale}px`, ...style}}>
      {children}
    </div>
  );
};

// A small badge with a pattern fill (polka dots) in an accent color.
export const dotPattern = (color: string, scale: number) => ({
  backgroundImage: `radial-gradient(${color} ${2.4 * scale}px, transparent ${2.6 * scale}px)`,
  backgroundSize: `${12 * scale}px ${12 * scale}px`,
});

// Outfit headline; the ONE accent phrase gets a highlighter pill.
export const PgHeadline: React.FC<{text: string; color?: SemColor; startFrame?: number; top?: number}> = ({text, color = 'purple', startFrame = 0, top}) => {
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div style={{...fadeUp(frame, startFrame, fps), position: 'absolute', top: (top ?? (vertical ? 150 : 96)) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 62 : 70) * scale, letterSpacing: '-0.01em', color: t.colors.text, padding: `0 ${70 * scale}px`, lineHeight: 1.1}}>
      {parts.map((p, i) => (i % 2 === 1
        ? <span key={i} style={{color: t.colors.onAccent, background: sem(color), borderRadius: 12 * scale, padding: `${2 * scale}px ${14 * scale}px`, boxShadow: `${4 * scale}px ${4 * scale}px 0 rgba(0,0,0,0.25)`}}>{p}</span>
        : <span key={i}>{p}</span>))}
    </div>
  );
};

// Chrome: scattered floating primitive shapes at the edges with a gentle bob.
export const PgChrome: React.FC = () => {
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const bob = (i: number) => Math.sin((frame + i * 22) / 26) * 8 * scale;
  const W = vertical ? 1080 : 1920;
  const H = vertical ? 1920 : 1080;
  // Shapes hug the OUTER margin/corners only — never the middle content band.
  const decor: Array<{k: ShapeKind; c: string; s: number; r: number; x: number; y: number}> = [
    {k: 'triangle', c: '#FBBF24', s: 70, r: -14, x: 30, y: 70},
    {k: 'ring', c: '#F472B6', s: 90, r: 0, x: W - 110, y: 50},
    {k: 'squiggle', c: '#34D399', s: 110, r: 8, x: W - 130, y: H - 150},
    {k: 'plus', c: '#8B5CF6', s: 62, r: 12, x: 50, y: H - 170},
    {k: 'zigzag', c: '#38BDF8', s: 90, r: -6, x: W - 110, y: H * 0.62},
    {k: 'circle', c: '#FB7185', s: 40, r: 0, x: 60, y: H * 0.5},
  ];
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      {decor.map((d, i) => (
        <Shape key={i} kind={d.k} color={d.c} size={d.s} rotate={d.r} style={{left: d.x * scale, top: d.y * scale + bob(i), opacity: 0.85}} />
      ))}
    </div>
  );
};
