import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {useScale, useSem} from '../../ui';

// Pencil lead + paper palettes.
export const PENCIL = '#2D2D2D';
export const PAPERS = ['#FBF7EC', '#FCE88A', '#FAD4CF', '#CFE3F5', '#DCF0D2'];
// Subtle irregular "wobbly" border-radius presets.
export const WOBBLY = [
  '22px 34px 20px 30px / 30px 20px 34px 22px',
  '30px 20px 34px 18px / 18px 34px 20px 30px',
  '18px 32px 24px 34px / 34px 22px 30px 20px',
  '34px 18px 30px 22px / 22px 30px 18px 34px',
];

// A translucent tape strip.
export const Tape: React.FC<{rotate?: number; style?: React.CSSProperties}> = ({rotate = -4, style}) => {
  const {scale} = useScale();
  return <div style={{position: 'absolute', width: 96 * scale, height: 30 * scale, background: 'rgba(240,235,210,0.55)', border: '1px solid rgba(0,0,0,0.08)', transform: `rotate(${rotate}deg)`, boxShadow: '0 1px 2px rgba(0,0,0,0.15)', ...style}} />;
};

// A thumbtack pin.
export const Tack: React.FC<{color?: SemColor; style?: React.CSSProperties}> = ({color = 'red', style}) => {
  const sem = useSem();
  const {scale} = useScale();
  const s = 24 * scale;
  return <div style={{position: 'absolute', width: s, height: s, borderRadius: '50%', background: `radial-gradient(circle at 34% 30%, #fff8, ${sem(color)} 60%)`, boxShadow: `0 ${3 * scale}px ${4 * scale}px rgba(0,0,0,0.4)`, ...style}} />;
};

// A paper sticky note: wobbly border, pencil outline, hard offset shadow, tilt.
export const Note: React.FC<{paper?: number; rotate?: number; wobble?: number; tape?: boolean; tack?: SemColor; style?: React.CSSProperties; children: React.ReactNode}> = ({paper = 0, rotate = 0, wobble = 0, tape = false, tack, style, children}) => {
  const {scale} = useScale();
  return (
    <div style={{position: 'relative', background: PAPERS[paper % PAPERS.length], border: `${3 * scale}px solid ${PENCIL}`, borderRadius: WOBBLY[wobble % WOBBLY.length], boxShadow: `${6 * scale}px ${6 * scale}px 0 rgba(0,0,0,0.35)`, transform: `rotate(${rotate}deg)`, padding: `${26 * scale}px ${30 * scale}px`, ...style}}>
      {tape ? <Tape style={{top: -14 * scale, left: '50%', marginLeft: -48 * scale}} rotate={rotate < 0 ? 5 : -5} /> : null}
      {tack ? <Tack color={tack} style={{top: -10 * scale, left: '50%', marginLeft: -12 * scale}} /> : null}
      {children}
    </div>
  );
};

// A hand-drawn dashed arrow (SVG).
export const Doodle: React.FC<{kind: 'arrow' | 'star' | 'squiggle' | 'check'; color: string; size: number; rotate?: number; style?: React.CSSProperties}> = ({kind, color, size, rotate = 0, style}) => {
  const {scale} = useScale();
  const s = size * scale;
  const common: React.CSSProperties = {position: 'absolute', transform: `rotate(${rotate}deg)`, ...style};
  if (kind === 'arrow') return (
    <svg style={common} width={s} height={s * 0.5} viewBox="0 0 100 50" fill="none"><path d="M4 30 Q 40 8 78 26" stroke={color} strokeWidth={4} strokeDasharray="8 7" strokeLinecap="round" /><path d="M64 14 L82 26 L62 34" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
  );
  if (kind === 'check') return (
    <svg style={common} width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M4 13 L10 19 L21 5" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
  if (kind === 'star') return (
    <svg style={common} width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2 L14.5 9 L22 9.3 L16 14 L18.2 21.5 L12 17 L5.8 21.5 L8 14 L2 9.3 L9.5 9 Z" stroke={color} strokeWidth={2} strokeLinejoin="round" fill="none" /></svg>
  );
  return <svg style={common} width={s} height={s * 0.4} viewBox="0 0 100 40" fill="none"><path d="M2 20 Q 14 2 26 20 T 50 20 T 74 20 T 98 20" stroke={color} strokeWidth={4} strokeLinecap="round" fill="none" /></svg>;
};

// Handwritten headline on the wall; the ONE accent phrase is red marker.
export const SkHeadline: React.FC<{text: string; color?: SemColor; startFrame?: number; top?: number}> = ({text, color = 'red', startFrame = 0, top}) => {
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div style={{...fadeUp(frame, startFrame, fps), position: 'absolute', top: (top ?? (vertical ? 150 : 92)) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 78 : 90) * scale, color: t.colors.text, padding: `0 ${64 * scale}px`, lineHeight: 1.06}}>
      {parts.map((p, i) => (i % 2 === 1
        ? <span key={i} style={{color: sem(color), borderBottom: `${4 * scale}px solid ${sem(color)}`, borderRadius: '40% 60% 50% 45%', paddingBottom: 2 * scale}}>{p}</span>
        : <span key={i}>{p}</span>))}
    </div>
  );
};

// Chrome: dark corkboard texture + a few chalk-colored doodles at the edges.
export const SkChrome: React.FC = () => {
  const sem = useSem();
  const {scale, vertical} = useScale();
  const W = (vertical ? 1080 : 1920) * scale;
  const H = (vertical ? 1920 : 1080) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(rgba(255,255,255,0.05) ${1.4 * scale}px, transparent ${1.6 * scale}px)`, backgroundSize: `${18 * scale}px ${18 * scale}px`, opacity: 0.5}} />
      <Doodle kind="star" color={sem('yellow')} size={44} rotate={-10} style={{left: 60 * scale, top: 120 * scale, opacity: 0.7}} />
      <Doodle kind="squiggle" color={sem('blue')} size={120} rotate={6} style={{right: 70 * scale, top: 100 * scale, opacity: 0.6}} />
      <Doodle kind="arrow" color={sem('red')} size={130} rotate={-8} style={{left: 70 * scale, top: H - 190 * scale, opacity: 0.6}} />
      <Doodle kind="star" color={sem('green')} size={34} rotate={12} style={{right: 110 * scale, top: H - 170 * scale, opacity: 0.7}} />
    </div>
  );
};
