import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {hexA, useScale, useSem} from '../../ui';

const LIGHT = 'rgba(255,255,255,0.06)';
const DARK = 'rgba(0,0,0,0.55)';

// Extruded (raised) surface — molded out of the background.
export const NeuRaised: React.FC<{
  radius?: number;
  circle?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({radius = 34, circle = false, style, children}) => {
  const t = useTheme();
  const {scale} = useScale();
  const d = 9 * scale;
  const b = 20 * scale;
  return (
    <div
      style={{
        background: t.colors.bg,
        borderRadius: circle ? '50%' : radius * scale,
        boxShadow: `-${d}px -${d}px ${b}px ${LIGHT}, ${d}px ${d}px ${b}px ${DARK}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Inset (pressed) well — for number readouts and icon holders.
export const NeuInset: React.FC<{
  radius?: number;
  circle?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({radius = 24, circle = false, style, children}) => {
  const t = useTheme();
  const {scale} = useScale();
  const d = 7 * scale;
  const b = 14 * scale;
  return (
    <div
      style={{
        background: t.colors.bg,
        borderRadius: circle ? '50%' : radius * scale,
        boxShadow: `inset -${d}px -${d}px ${b}px ${LIGHT}, inset ${d}px ${d}px ${b}px ${DARK}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Embossed headline; the ONE accent phrase glows in the accent tone.
export const NeuHeadline: React.FC<{
  text: string;
  color?: SemColor;
  startFrame?: number;
  top?: number;
}> = ({text, color = 'purple', startFrame = 0, top}) => {
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
        top: (top ?? (vertical ? 168 : 108)) * scale,
        width: '100%',
        textAlign: 'center',
        fontFamily: t.fonts.display,
        fontWeight: 700,
        fontSize: (vertical ? 60 : 68) * scale,
        letterSpacing: '-0.02em',
        color: t.colors.text,
        padding: `0 ${70 * scale}px`,
        lineHeight: 1.14,
        textShadow: `-${1 * scale}px -${1 * scale}px ${2 * scale}px ${LIGHT}, ${1 * scale}px ${1 * scale}px ${2 * scale}px ${DARK}`,
      }}
    >
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} style={{color: sem(color), textShadow: `0 0 ${14 * scale}px ${hexA(sem(color), 0.5)}`}}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </div>
  );
};

// Chrome: very faint ambient raised discs at the edges. Monochrome discipline.
export const NeuChrome: React.FC = () => {
  const {scale, vertical} = useScale();
  const u = (vertical ? 300 : 360) * scale;
  const d = 20 * scale;
  const b = 50 * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: -u * 0.4, left: -u * 0.35, width: u, height: u, borderRadius: '50%', boxShadow: `-${d}px -${d}px ${b}px ${LIGHT}, ${d}px ${d}px ${b}px ${DARK}`, opacity: 0.5}} />
      <div style={{position: 'absolute', bottom: -u * 0.45, right: -u * 0.35, width: u, height: u, borderRadius: '50%', boxShadow: `-${d}px -${d}px ${b}px ${LIGHT}, ${d}px ${d}px ${b}px ${DARK}`, opacity: 0.5}} />
    </div>
  );
};
