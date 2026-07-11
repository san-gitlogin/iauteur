import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {useScale} from '../../ui';

// The five clashing electric accents (rotate by index % 5).
export const ACC = ['#FF3AF2', '#00F5D4', '#FFE600', '#FF6B35', '#7B2FFF'];
export const clash = (i: number) => ACC[(i + 2) % ACC.length];

// A 4-point sparkle star.
export const Star: React.FC<{color: string; size: number; rotate?: number; style?: React.CSSProperties}> = ({color, size, rotate = 0, style}) => {
  const {scale} = useScale();
  const s = size * scale;
  return (
    <svg style={{position: 'absolute', transform: `rotate(${rotate}deg)`, filter: `drop-shadow(0 0 ${6 * scale}px ${color})`, ...style}} width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill={color} />
    </svg>
  );
};

// A radiating burst (many rays).
export const Burst: React.FC<{color: string; size: number; rays?: number; style?: React.CSSProperties}> = ({color, size, rays = 12, style}) => {
  const {scale} = useScale();
  const s = size * scale;
  return (
    <svg style={{position: 'absolute', ...style}} width={s} height={s} viewBox="0 0 100 100" fill="none">
      {Array.from({length: rays}).map((_, i) => {
        const a = (i / rays) * Math.PI * 2;
        return <line key={i} x1={50} y1={50} x2={50 + Math.cos(a) * 48} y2={50 + Math.sin(a) * 48} stroke={color} strokeWidth={4} strokeLinecap="round" opacity={0.9} />;
      })}
    </svg>
  );
};

// A loud card: tinted dark fill, thick CLASHING border, accent glow, tilt,
// plus an overlapping star badge in a third accent.
export const Loud: React.FC<{index?: number; rotate?: number; badge?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({index = 0, rotate = 0, badge = true, style, children}) => {
  const t = useTheme();
  const {scale} = useScale();
  const fill = ACC[index % ACC.length];
  const border = clash(index);
  return (
    <div style={{position: 'relative', transform: `rotate(${rotate}deg)`, background: `linear-gradient(150deg, ${t.colors.panel}, ${fill}22)`, border: `${4 * scale}px solid ${border}`, borderRadius: 22 * scale, boxShadow: `0 0 ${26 * scale}px ${fill}66, inset 0 0 ${20 * scale}px ${fill}22`, padding: `${26 * scale}px ${30 * scale}px`, ...style}}>
      {children}
      {badge ? <Star color={ACC[(index + 4) % ACC.length]} size={38} rotate={index * 20} style={{top: -18 * scale, right: -14 * scale}} /> : null}
    </div>
  );
};

// Multi-accent gradient headline; the ONE [accent] phrase glows brighter.
export const MaxHeadline: React.FC<{text: string; startFrame?: number; top?: number}> = ({text, startFrame = 0, top}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div style={{...fadeUp(frame, startFrame, fps), position: 'absolute', top: (top ?? (vertical ? 150 : 92)) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 62 : 72) * scale, letterSpacing: '-0.01em', textTransform: 'uppercase', color: t.colors.text, padding: `0 ${64 * scale}px`, lineHeight: 1.08}}>
      {parts.map((p, i) => (i % 2 === 1
        ? <span key={i} style={{backgroundImage: 'linear-gradient(90deg, #FF3AF2, #FFE600, #00F5D4)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 0 ${10 * scale}px rgba(255,58,242,0.5))`}}>{p}</span>
        : <span key={i}>{p}</span>))}
    </div>
  );
};

// Chrome: dense sparkles + stars + bursts at the edges, faint checker wash.
export const MaxChrome: React.FC = () => {
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const twinkle = (i: number) => 0.5 + 0.5 * Math.abs(Math.sin((frame + i * 17) / 14));
  const W = vertical ? 1080 : 1920;
  const H = vertical ? 1920 : 1080;
  const stars: Array<{c: string; s: number; x: number; y: number; r: number}> = [
    {c: ACC[0], s: 40, x: 60, y: 110, r: 0},
    {c: ACC[2], s: 30, x: W - 110, y: 70, r: 20},
    {c: ACC[1], s: 46, x: W - 130, y: H - 150, r: 10},
    {c: ACC[4], s: 34, x: 80, y: H - 160, r: 0},
    {c: ACC[3], s: 26, x: 150, y: H * 0.5, r: 0},
    {c: ACC[1], s: 24, x: W - 150, y: H * 0.46, r: 0},
    {c: ACC[2], s: 22, x: W * 0.5, y: H - 60, r: 0},
  ];
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: `repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, transparent 0% 50%)`, backgroundSize: `${44 * scale}px ${44 * scale}px`, opacity: 0.5}} />
      <Burst color={ACC[0]} size={120} style={{left: -30 * scale, top: -30 * scale, opacity: 0.35}} />
      <Burst color={ACC[1]} size={120} style={{right: -30 * scale, bottom: -30 * scale, opacity: 0.35}} />
      {stars.map((st, i) => (
        <Star key={i} color={st.c} size={st.s} rotate={st.r} style={{left: st.x * scale, top: st.y * scale, opacity: twinkle(i)}} />
      ))}
    </div>
  );
};
