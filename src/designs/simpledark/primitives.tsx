import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {hexA, useScale, useSem} from '../../ui';

// A soft ambient radial glow behind a focal element.
export const Glow: React.FC<{color?: string; size?: number; style?: React.CSSProperties}> = ({color, size = 460, style}) => {
  const t = useTheme();
  const {scale} = useScale();
  const c = color ?? t.colors.accent;
  const s = size * scale;
  return <div style={{position: 'absolute', width: s, height: s, borderRadius: '50%', background: `radial-gradient(circle, ${hexA(c, 0.20)} 0%, transparent 68%)`, filter: `blur(${20 * scale}px)`, pointerEvents: 'none', ...style}} />;
};

// A layered-slate card: subtle border, soft shadow, faint top inner highlight.
export const Card: React.FC<{elevated?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({elevated = false, style, children}) => {
  const t = useTheme();
  const {scale} = useScale();
  return (
    <div style={{position: 'relative', background: elevated ? '#1A1A24' : t.colors.panel, border: `${1 * scale}px solid ${t.colors.panelBorder}`, borderRadius: 20 * scale, boxShadow: `0 ${14 * scale}px ${40 * scale}px rgba(0,0,0,0.45), inset 0 ${1 * scale}px 0 rgba(255,255,255,0.04)`, padding: `${28 * scale}px ${32 * scale}px`, ...style}}>
      {children}
    </div>
  );
};

// A thin hairline divider.
export const Hairline: React.FC<{style?: React.CSSProperties}> = ({style}) => {
  const t = useTheme();
  const {scale} = useScale();
  return <div style={{height: 1 * scale, background: t.colors.panelBorder, width: '100%', ...style}} />;
};

// A small-caps mono kicker label.
export const Kicker: React.FC<{children: React.ReactNode; color?: SemColor}> = ({children, color}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  return <div style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, letterSpacing: '0.22em', textTransform: 'uppercase', color: color ? sem(color) : t.colors.muted}}>{children}</div>;
};

// Clean headline; the ONE accent phrase glows amber.
export const SdHeadline: React.FC<{text: string; color?: SemColor; startFrame?: number; top?: number}> = ({text, color = 'orange', startFrame = 0, top}) => {
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div style={{...fadeUp(frame, startFrame, fps), position: 'absolute', top: (top ?? (vertical ? 160 : 108)) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 58 : 64) * scale, letterSpacing: '-0.02em', color: t.colors.text, padding: `0 ${80 * scale}px`, lineHeight: 1.14}}>
      {parts.map((p, i) => (i % 2 === 1 ? <span key={i} style={{color: sem(color)}}>{p}</span> : <span key={i}>{p}</span>))}
    </div>
  );
};

// Chrome: one slow-drifting soft amber ambient glow + faint vignette. Calm.
export const SdChrome: React.FC = () => {
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 60 * scale;
  const W = (vertical ? 1080 : 1920) * scale;
  const H = (vertical ? 1920 : 1080) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: H * 0.1 + drift, left: W * 0.5, width: 520 * scale, height: 520 * scale, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 66%)', filter: `blur(${30 * scale}px)`}} />
      <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${200 * scale}px rgba(0,0,0,0.55)`}} />
    </div>
  );
};
