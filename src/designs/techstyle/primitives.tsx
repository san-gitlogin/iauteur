import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {useScale, useSem} from '../../ui';

export const GRAD_BLUE = 'linear-gradient(135deg, #2F6BFF, #5E8CFF)';

// Style object for electric-blue gradient text.
export const gradText = (): React.CSSProperties => ({
  backgroundImage: GRAD_BLUE,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
});

// An elevated card with an electric-blue-tinted shadow.
export const Card: React.FC<{inverted?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({inverted = false, style, children}) => {
  const t = useTheme();
  const {scale} = useScale();
  if (inverted) {
    return <div style={{position: 'relative', background: '#F3F6FF', border: `${1 * scale}px solid #E2E8F5`, borderRadius: 24 * scale, boxShadow: `0 ${20 * scale}px ${50 * scale}px rgba(61,110,255,0.28)`, padding: `${28 * scale}px ${32 * scale}px`, color: '#0A0E1A', ...style}}>{children}</div>;
  }
  return (
    <div style={{position: 'relative', background: t.colors.panel, border: `${1 * scale}px solid ${t.colors.panelBorder}`, borderRadius: 24 * scale, boxShadow: `0 ${20 * scale}px ${50 * scale}px rgba(61,110,255,0.18), inset 0 ${1 * scale}px 0 rgba(255,255,255,0.05)`, padding: `${28 * scale}px ${32 * scale}px`, ...style}}>
      {children}
    </div>
  );
};

// A gradient rounded-square icon/number tile.
export const GradTile: React.FC<{size: number; radius?: number; children: React.ReactNode}> = ({size, radius = 18, children}) => {
  const {scale} = useScale();
  const s = size * scale;
  return <div style={{width: s, height: s, borderRadius: radius * scale, background: GRAD_BLUE, boxShadow: `0 ${8 * scale}px ${20 * scale}px rgba(61,110,255,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>;
};

// A "LIVE" badge with a gently pulsing dot.
export const LiveBadge: React.FC<{label: string; dark?: boolean}> = ({label, dark = false}) => {
  const t = useTheme();
  const {scale} = useScale();
  const frame = useCurrentFrame();
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin(frame / 12));
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 12 * scale, background: dark ? 'rgba(10,14,26,0.06)' : 'rgba(61,110,255,0.12)', border: `${1 * scale}px solid rgba(61,110,255,0.4)`, borderRadius: 999, padding: `${9 * scale}px ${20 * scale}px`, fontFamily: t.fonts.mono, fontWeight: 600, fontSize: 22 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: dark ? '#0A0E1A' : t.colors.text}}>
      <span style={{width: 12 * scale, height: 12 * scale, borderRadius: '50%', background: '#3D6EFF', boxShadow: `0 0 ${10 * scale}px #3D6EFF`, opacity: pulse}} />
      {label}
    </span>
  );
};

// A slow-rotating dashed decorative ring.
export const Ring: React.FC<{size: number; speed?: number; color?: string; style?: React.CSSProperties}> = ({size, speed = 0.14, color = 'rgba(61,110,255,0.35)', style}) => {
  const {scale} = useScale();
  const frame = useCurrentFrame();
  const s = size * scale;
  return (
    <svg style={{position: 'absolute', transform: `rotate(${frame * speed}deg)`, ...style}} width={s} height={s} viewBox="0 0 100 100" fill="none">
      <circle cx={50} cy={50} r={47} stroke={color} strokeWidth={0.8} strokeDasharray="3 4" />
    </svg>
  );
};

// Fraunces serif headline; the ONE accent phrase is electric-blue gradient.
export const TsHeadline: React.FC<{text: string; startFrame?: number; top?: number}> = ({text, startFrame = 0, top}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div style={{...fadeUp(frame, startFrame, fps), position: 'absolute', top: (top ?? (vertical ? 158 : 104)) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 62 : 70) * scale, letterSpacing: '-0.01em', color: t.colors.text, padding: `0 ${76 * scale}px`, lineHeight: 1.08}}>
      {parts.map((p, i) => (i % 2 === 1 ? <span key={i} style={gradText()}>{p}</span> : <span key={i}>{p}</span>))}
    </div>
  );
};

// Chrome: two glacial rotating dashed rings + faint electric-blue glow at edges.
export const TsChrome: React.FC = () => {
  const {scale, vertical} = useScale();
  const W = (vertical ? 1080 : 1920) * scale;
  const H = (vertical ? 1920 : 1080) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: -0.14 * W, top: -0.1 * H, width: 0.42 * W, height: 0.42 * W, borderRadius: '50%', background: 'radial-gradient(circle, rgba(61,110,255,0.12) 0%, transparent 64%)', filter: `blur(${44 * scale}px)`}} />
      <div style={{position: 'absolute', right: -0.14 * W, bottom: -0.12 * H, width: 0.4 * W, height: 0.4 * W, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,211,167,0.08) 0%, transparent 64%)', filter: `blur(${44 * scale}px)`}} />
      <Ring size={vertical ? 340 : 320} speed={0.1} style={{left: -140 * scale, bottom: -120 * scale}} />
      <Ring size={vertical ? 300 : 280} speed={-0.08} color="rgba(46,211,167,0.3)" style={{right: -120 * scale, top: -110 * scale}} />
    </div>
  );
};
