import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {hexA, useScale, useSem} from '../../ui';

export const toRoman = (n: number): string => ['I', 'II', 'III', 'IV', 'V'][n - 1] ?? String(n);

// A radiating sunburst (fan motif) — the signature deco ornament.
export const Sunburst: React.FC<{size: number; opacity?: number; style?: React.CSSProperties}> = ({
  size,
  opacity = 0.5,
  style,
}) => {
  const t = useTheme();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `repeating-conic-gradient(${hexA(t.colors.accent, 0.9)} 0deg 0.5deg, transparent 0.5deg 7deg)`,
        WebkitMaskImage: 'radial-gradient(circle, #000 0%, #000 34%, transparent 62%)',
        maskImage: 'radial-gradient(circle, #000 0%, #000 34%, transparent 62%)',
        opacity,
        ...style,
      }}
    />
  );
};

// Horizontal gold rule with a central rotated diamond — the deco divider.
export const DecoDivider: React.FC<{width?: number; delay?: number}> = ({width = 300, delay = 0}) => {
  const t = useTheme();
  const {scale} = useScale();
  const frame = useCurrentFrame();
  const op = Math.max(0, Math.min(1, (frame - delay) / 16));
  const w = width * scale;
  const bar = {height: 2 * scale, background: t.colors.accent, flex: 1};
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12 * scale, width: w, opacity: op}}>
      <div style={bar} />
      <div style={{width: 16 * scale, height: 16 * scale, background: t.colors.accent, transform: 'rotate(45deg)'}} />
      <div style={bar} />
    </div>
  );
};

// A gold double-frame with small diamond corner ornaments (ziggurat feel).
export const DecoFrame: React.FC<{color?: SemColor | null; style?: React.CSSProperties; children: React.ReactNode}> = ({
  color,
  style,
  children,
}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const c = color ? sem(color) : t.colors.accent;
  const dot = (pos: React.CSSProperties) => (
    <div style={{position: 'absolute', width: 12 * scale, height: 12 * scale, background: c, transform: 'rotate(45deg)', ...pos}} />
  );
  return (
    <div style={{position: 'relative', border: `${2 * scale}px solid ${c}`, padding: 8 * scale, background: 'rgba(0,0,0,0.35)', boxShadow: `0 0 ${24 * scale}px ${hexA(c, 0.18)}`, ...style}}>
      <div style={{border: `${1 * scale}px solid ${hexA(c, 0.6)}`, padding: `${22 * scale}px ${28 * scale}px`, height: '100%', boxSizing: 'border-box'}}>{children}</div>
      {dot({top: -6 * scale, left: -6 * scale})}
      {dot({top: -6 * scale, right: -6 * scale})}
      {dot({bottom: -6 * scale, left: -6 * scale})}
      {dot({bottom: -6 * scale, right: -6 * scale})}
    </div>
  );
};

// Cinzel all-caps headline, centered, gold accent phrase.
export const DecoHeadline: React.FC<{
  text: string;
  color?: SemColor;
  startFrame?: number;
  top?: number;
}> = ({text, color = 'orange', startFrame = 0, top}) => {
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div
      style={{
        ...fadeUp(frame, startFrame, fps),
        position: 'absolute',
        top: (top ?? (vertical ? 158 : 100)) * scale,
        width: '100%',
        textAlign: 'center',
        fontFamily: t.fonts.display,
        fontWeight: 600,
        fontSize: (vertical ? 52 : 60) * scale,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: t.colors.text,
        padding: `0 ${70 * scale}px`,
        lineHeight: 1.2,
      }}
    >
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} style={{color: sem(color), textShadow: `0 0 ${16 * scale}px ${hexA(sem(color), 0.6)}`}}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </div>
  );
};

// Chrome: an inset gold double-frame + top sunburst crown. Symmetric.
export const DecoChrome: React.FC = () => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  const m = (vertical ? 40 : 54) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: m, left: m, right: m, bottom: m, border: `${1.5 * scale}px solid ${hexA(t.colors.accent, 0.4)}`}} />
      <div style={{position: 'absolute', top: m + 8 * scale, left: m + 8 * scale, right: m + 8 * scale, bottom: m + 8 * scale, border: `${1 * scale}px solid ${hexA(t.colors.accent, 0.2)}`}} />
      <Sunburst size={(vertical ? 300 : 360) * scale} opacity={0.28} style={{position: 'absolute', top: -(vertical ? 150 : 180) * scale, left: '50%', transform: 'translateX(-50%)'}} />
    </div>
  );
};
