import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {hexA, useScale, useSem} from '../../ui';

const BRASS_GRAD = 'linear-gradient(180deg, #D4B872 0%, #C9A962 50%, #B8953F 100%)';

// Aged-oak book-plate: wood-grain border + brass inner line + corner brackets.
export const LibPlate: React.FC<{color?: SemColor | null; style?: React.CSSProperties; children: React.ReactNode}> = ({
  color,
  style,
  children,
}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const brass = color ? sem(color) : t.colors.accent;
  const bracket = (pos: React.CSSProperties) => (
    <div style={{position: 'absolute', width: 22 * scale, height: 22 * scale, borderColor: brass, ...pos}} />
  );
  return (
    <div style={{position: 'relative', background: t.colors.panel, border: `${2 * scale}px solid ${t.colors.panelBorder}`, padding: 10 * scale, ...style}}>
      <div style={{border: `${1 * scale}px solid ${hexA(brass, 0.55)}`, padding: `${22 * scale}px ${28 * scale}px`, height: '100%', boxSizing: 'border-box'}}>{children}</div>
      {bracket({top: 6 * scale, left: 6 * scale, borderTop: `${2 * scale}px solid ${brass}`, borderLeft: `${2 * scale}px solid ${brass}`})}
      {bracket({top: 6 * scale, right: 6 * scale, borderTop: `${2 * scale}px solid ${brass}`, borderRight: `${2 * scale}px solid ${brass}`})}
      {bracket({bottom: 6 * scale, left: 6 * scale, borderBottom: `${2 * scale}px solid ${brass}`, borderLeft: `${2 * scale}px solid ${brass}`})}
      {bracket({bottom: 6 * scale, right: 6 * scale, borderBottom: `${2 * scale}px solid ${brass}`, borderRight: `${2 * scale}px solid ${brass}`})}
    </div>
  );
};

// A crimson wax seal ringed in brass.
export const WaxSeal: React.FC<{size: number; label?: string}> = ({size, label}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  return (
    <div style={{width: size, height: size, borderRadius: '50%', background: sem('red'), border: `${4 * scale}px solid ${t.colors.accent}`, boxShadow: `0 0 ${20 * scale}px ${hexA(t.colors.accent, 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {label ? <span style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: size * 0.3, color: '#E8DFD4'}}>{label}</span> : null}
    </div>
  );
};

// Brass rule with a central fleuron ornament.
export const LibRule: React.FC<{width?: number; delay?: number}> = ({width = 320, delay = 0}) => {
  const t = useTheme();
  const {scale} = useScale();
  const frame = useCurrentFrame();
  const op = Math.max(0, Math.min(1, (frame - delay) / 16));
  const bar = {height: 2 * scale, background: BRASS_GRAD, flex: 1};
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 14 * scale, width: width * scale, opacity: op}}>
      <div style={bar} />
      <span style={{fontFamily: t.fonts.display, fontSize: 30 * scale, color: t.colors.accent, lineHeight: 1}}>{'\u2766'}</span>
      <div style={bar} />
    </div>
  );
};

// Playfair serif headline; the ONE accent phrase is brass italic.
export const LibHeadline: React.FC<{
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
        top: (top ?? (vertical ? 162 : 104)) * scale,
        width: '100%',
        textAlign: 'center',
        fontFamily: t.fonts.display,
        fontWeight: 600,
        fontSize: (vertical ? 58 : 66) * scale,
        letterSpacing: '0.01em',
        color: t.colors.text,
        padding: `0 ${70 * scale}px`,
        lineHeight: 1.16,
      }}
    >
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} style={{color: sem(color), fontStyle: 'italic'}}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </div>
  );
};

// Chrome: brass double-frame + a top fleuron crown. Warm library.
export const LibChrome: React.FC = () => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  const m = (vertical ? 42 : 56) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: m, left: m, right: m, bottom: m, border: `${1.5 * scale}px solid ${hexA(t.colors.accent, 0.35)}`}} />
      <div style={{position: 'absolute', top: m + 7 * scale, left: m + 7 * scale, right: m + 7 * scale, bottom: m + 7 * scale, border: `1px solid ${hexA(t.colors.accent, 0.18)}`}} />
      <div style={{position: 'absolute', top: m - 20 * scale, left: '50%', transform: 'translateX(-50%)', fontFamily: t.fonts.display, fontSize: 40 * scale, color: hexA(t.colors.accent, 0.7), background: t.colors.bg, padding: `0 ${12 * scale}px`}}>{'\u2766'}</div>
    </div>
  );
};
