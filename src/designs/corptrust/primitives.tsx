import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {useScale, useSem} from '../../ui';

export const GRAD = 'linear-gradient(135deg, #6366F1, #8B5CF6)';

// Style object for indigo→violet gradient text.
export const gradText = (): React.CSSProperties => ({
  backgroundImage: GRAD,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
});

// An elevated card with a soft indigo/violet-tinted colored shadow.
export const Card: React.FC<{tint?: 'indigo' | 'violet'; style?: React.CSSProperties; children: React.ReactNode}> = ({tint = 'indigo', style, children}) => {
  const t = useTheme();
  const {scale} = useScale();
  const shadow = tint === 'violet' ? 'rgba(139,92,246,0.24)' : 'rgba(99,102,241,0.24)';
  return (
    <div style={{position: 'relative', background: t.colors.panel, border: `${1 * scale}px solid ${t.colors.panelBorder}`, borderRadius: 24 * scale, boxShadow: `0 ${22 * scale}px ${54 * scale}px ${shadow}, inset 0 ${1 * scale}px 0 rgba(255,255,255,0.06)`, padding: `${28 * scale}px ${32 * scale}px`, ...style}}>
      {children}
    </div>
  );
};

// A gradient rounded-square icon/number holder.
export const GradTile: React.FC<{size: number; radius?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size, radius = 18, children, style}) => {
  const {scale} = useScale();
  const s = size * scale;
  return <div style={{width: s, height: s, borderRadius: radius * scale, background: GRAD, boxShadow: `0 ${8 * scale}px ${20 * scale}px rgba(99,102,241,0.35)`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style}}>{children}</div>;
};

// A gradient pill / badge.
export const Pill: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => {
  const t = useTheme();
  const {scale} = useScale();
  return <span style={{background: GRAD, color: '#fff', fontFamily: t.fonts.body, fontWeight: 600, fontSize: 26 * scale, padding: `${10 * scale}px ${24 * scale}px`, borderRadius: 999, boxShadow: `0 ${8 * scale}px ${22 * scale}px rgba(99,102,241,0.35)`, ...style}}>{children}</span>;
};

// A small emerald success check chip.
export const Check: React.FC = () => {
  const sem = useSem();
  const {scale} = useScale();
  const s = 34 * scale;
  return (
    <div style={{width: s, height: s, borderRadius: '50%', background: `${sem('green')}22`, border: `${1.5 * scale}px solid ${sem('green')}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width={s * 0.6} height={s * 0.6} viewBox="0 0 24 24" fill="none"><path d="M5 13 L10 18 L20 6" stroke={sem('green')} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  );
};

// Outfit headline; the ONE accent phrase is indigo→violet gradient.
export const CtHeadline: React.FC<{text: string; startFrame?: number; top?: number}> = ({text, startFrame = 0, top}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div style={{...fadeUp(frame, startFrame, fps), position: 'absolute', top: (top ?? (vertical ? 156 : 102)) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 60 : 68) * scale, letterSpacing: '-0.02em', color: t.colors.text, padding: `0 ${76 * scale}px`, lineHeight: 1.1}}>
      {parts.map((p, i) => (i % 2 === 1 ? <span key={i} style={gradText()}>{p}</span> : <span key={i}>{p}</span>))}
    </div>
  );
};

// Chrome: two large blurred indigo/violet gradient orbs for atmospheric depth.
export const CtChrome: React.FC = () => {
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 100) * 20 * scale;
  const W = (vertical ? 1080 : 1920) * scale;
  const H = (vertical ? 1920 : 1080) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: -0.12 * W, top: -0.1 * H + drift, width: 0.5 * W, height: 0.5 * W, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 64%)', filter: `blur(${50 * scale}px)`}} />
      <div style={{position: 'absolute', right: -0.12 * W, bottom: -0.12 * H - drift, width: 0.46 * W, height: 0.46 * W, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 64%)', filter: `blur(${50 * scale}px)`}} />
    </div>
  );
};
