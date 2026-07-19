import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {useScale, useSem} from '../../ui';

// A glass surface with multi-layer shadows (highlight + diffuse + accent glow).
export const Glass: React.FC<{glow?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({glow = false, style, children}) => {
  const {scale} = useScale();
  const shadow = `inset 0 ${1 * scale}px 0 rgba(255,255,255,0.08), 0 ${20 * scale}px ${50 * scale}px rgba(0,0,0,0.55)` + (glow ? `, 0 0 ${44 * scale}px rgba(94,106,210,0.28)` : `, 0 0 ${24 * scale}px rgba(94,106,210,0.08)`);
  return (
    <div style={{position: 'relative', background: 'rgba(255,255,255,0.05)', backdropFilter: `blur(${16 * scale}px)`, WebkitBackdropFilter: `blur(${16 * scale}px)`, border: `${1 * scale}px solid ${glow ? 'rgba(94,106,210,0.45)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 20 * scale, boxShadow: shadow, padding: `${26 * scale}px ${30 * scale}px`, ...style}}>
      {children}
    </div>
  );
};

// Mock window traffic-light dots (the "software feel" cue).
export const WindowDots: React.FC<{style?: React.CSSProperties}> = ({style}) => {
  const {scale} = useScale();
  const dot = (c: string) => <span style={{width: 12 * scale, height: 12 * scale, borderRadius: '50%', background: c}} />;
  return <div style={{display: 'flex', gap: 8 * scale, ...style}}>{dot('rgba(255,255,255,0.18)')}{dot('rgba(255,255,255,0.18)')}{dot('rgba(94,106,210,0.7)')}</div>;
};

// A small indigo accent chip / badge.
export const Chip: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => {
  const t = useTheme();
  const {scale} = useScale();
  return <span style={{display: 'inline-flex', alignItems: 'center', gap: 10 * scale, background: 'rgba(94,106,210,0.12)', border: `${1 * scale}px solid rgba(94,106,210,0.4)`, borderRadius: 999, padding: `${9 * scale}px ${20 * scale}px`, fontFamily: t.fonts.mono, fontWeight: 500, fontSize: 22 * scale, letterSpacing: '0.04em', color: t.colors.text, ...style}}>
    <span style={{width: 10 * scale, height: 10 * scale, borderRadius: '50%', background: t.colors.accent, boxShadow: `0 0 ${8 * scale}px ${t.colors.accent}`}} />
    {children}
  </span>;
};

// An indigo gradient icon/number tile.
export const IndigoTile: React.FC<{size: number; radius?: number; children: React.ReactNode}> = ({size, radius = 16, children}) => {
  const {scale} = useScale();
  const s = size * scale;
  return <div style={{width: s, height: s, borderRadius: radius * scale, background: 'linear-gradient(150deg, #5E6AD2, #9C87E0)', boxShadow: `0 ${8 * scale}px ${20 * scale}px rgba(94,106,210,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>;
};

// Grotesk headline; the ONE accent phrase is indigo.
export const MdHeadline: React.FC<{text: string; color?: SemColor; startFrame?: number; top?: number}> = ({text, color = 'blue', startFrame = 0, top}) => {
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div style={{...fadeUp(frame, startFrame, fps), position: 'absolute', top: (top ?? (vertical ? 158 : 104)) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 60 : 68) * scale, letterSpacing: '-0.02em', color: t.colors.text, padding: `0 ${76 * scale}px`, lineHeight: 1.1}}>
      {parts.map((p, i) => (i % 2 === 1 ? <span key={i} style={{color: sem(color)}}>{p}</span> : <span key={i}>{p}</span>))}
    </div>
  );
};

// Chrome: cinematic blurred indigo/violet light blobs + fine noise + vignette.
export const MdChrome: React.FC = () => {
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 110) * 30 * scale;
  const d2 = Math.cos(frame / 130) * 26 * scale;
  const W = (vertical ? 1080 : 1920) * scale;
  const H = (vertical ? 1920 : 1080) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: -0.12 * W + d1, top: -0.12 * H, width: 0.74 * W, height: 0.74 * W, borderRadius: '50%', background: 'radial-gradient(circle, rgba(94,106,210,0.34) 0%, rgba(94,106,210,0.12) 40%, transparent 70%)', filter: `blur(${64 * scale}px)`}} />
      <div style={{position: 'absolute', right: -0.12 * W - d2, bottom: -0.13 * H, width: 0.68 * W, height: 0.68 * W, borderRadius: '50%', background: 'radial-gradient(circle, rgba(156,135,224,0.26) 0%, rgba(156,135,224,0.09) 40%, transparent 70%)', filter: `blur(${64 * scale}px)`}} />
      <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(rgba(255,255,255,0.5) ${1 * scale}px, transparent ${1.1 * scale}px)`, backgroundSize: `${3 * scale}px ${3 * scale}px`, mixBlendMode: 'overlay', opacity: 0.035}} />
      <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${200 * scale}px rgba(0,0,0,0.42)`}} />
    </div>
  );
};
