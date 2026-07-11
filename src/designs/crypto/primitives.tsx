import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {useScale, useSem} from '../../ui';

export const ORANGE_GOLD = 'linear-gradient(90deg, #F7931A, #FFD600)';
export const ORANGE_DEEP = 'linear-gradient(120deg, #EA580C, #F7931A)';

// Style object for orange→gold gradient text.
export const gradText = (grad = ORANGE_GOLD): React.CSSProperties => ({
  backgroundImage: grad,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
});

// A glassmorphic panel: translucent surface, 1px light border, orange glow.
export const Glass: React.FC<{active?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({active = false, style, children}) => {
  const {scale} = useScale();
  return (
    <div style={{position: 'relative', background: 'rgba(20,22,28,0.55)', backdropFilter: `blur(${14 * scale}px)`, WebkitBackdropFilter: `blur(${14 * scale}px)`, border: `${1.5 * scale}px solid ${active ? 'rgba(247,147,26,0.55)' : 'rgba(255,255,255,0.10)'}`, borderRadius: 20 * scale, boxShadow: active ? `0 0 ${44 * scale}px rgba(247,147,26,0.30), inset 0 ${1 * scale}px 0 rgba(255,255,255,0.08)` : `0 ${16 * scale}px ${40 * scale}px rgba(0,0,0,0.5), inset 0 ${1 * scale}px 0 rgba(255,255,255,0.06)`, padding: `${26 * scale}px ${30 * scale}px`, ...style}}>
      {children}
    </div>
  );
};

// A small delta arrow chip (green ▲ / red ▼) inferred from a value string.
export const Delta: React.FC<{value: string}> = ({value}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const down = value.trim().startsWith('-');
  const c = down ? sem('red') : sem('green');
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 5 * scale, fontFamily: t.fonts.mono, fontSize: 22 * scale, fontWeight: 700, color: c, background: `${c}1F`, border: `${1 * scale}px solid ${c}55`, borderRadius: 8 * scale, padding: `${3 * scale}px ${10 * scale}px`}}>
      {down ? '▼' : '▲'}
    </span>
  );
};

// A circular orange gradient ring (coin/token glow).
export const CoinRing: React.FC<{size: number; children: React.ReactNode}> = ({size, children}) => {
  const {scale} = useScale();
  const s = size * scale;
  return (
    <div style={{position: 'relative', width: s, height: s, borderRadius: '50%', padding: 4 * scale, background: ORANGE_GOLD, boxShadow: `0 0 ${40 * scale}px rgba(247,147,26,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: '100%', height: '100%', borderRadius: '50%', background: '#0B0C10', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
    </div>
  );
};

// Space Grotesk headline; the ONE accent phrase is orange→gold gradient.
export const CrHeadline: React.FC<{text: string; startFrame?: number; top?: number}> = ({text, startFrame = 0, top}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div style={{...fadeUp(frame, startFrame, fps), position: 'absolute', top: (top ?? (vertical ? 158 : 104)) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 60 : 68) * scale, letterSpacing: '-0.01em', color: t.colors.text, padding: `0 ${74 * scale}px`, lineHeight: 1.1}}>
      {parts.map((p, i) => (i % 2 === 1 ? <span key={i} style={gradText()}>{p}</span> : <span key={i}>{p}</span>))}
    </div>
  );
};

// Chrome: blockchain grid + radial orange/gold energy blobs + a mono ticker.
export const CrChrome: React.FC = () => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const shift = -((frame * 0.3) % 50);
  const W = (vertical ? 1080 : 1920) * scale;
  const H = (vertical ? 1920 : 1080) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: -0.1 * W, bottom: -0.14 * H, width: 0.5 * W, height: 0.5 * W, borderRadius: '50%', background: 'radial-gradient(circle, rgba(247,147,26,0.14) 0%, transparent 66%)', filter: `blur(${40 * scale}px)`}} />
      <div style={{position: 'absolute', right: -0.1 * W, top: -0.12 * H, width: 0.42 * W, height: 0.42 * W, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,0,0.10) 0%, transparent 66%)', filter: `blur(${40 * scale}px)`}} />
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 34 * scale, overflow: 'hidden', display: 'flex', alignItems: 'center', borderBottom: `${1 * scale}px solid rgba(255,255,255,0.06)`, background: 'rgba(3,3,4,0.6)'}}>
        <div style={{display: 'flex', whiteSpace: 'nowrap', transform: `translateX(${shift}%)`, fontFamily: t.fonts.mono, fontSize: 16 * scale, letterSpacing: '0.12em', color: t.colors.muted}}>
          {[0, 1].map((k) => <span key={k}>{'  BTC ▲  ·  ETH ▲  ·  AI-SEARCH ▲  ·  ZERO-CLICK ▲  '.repeat(6)}</span>)}
        </div>
      </div>
    </div>
  );
};
