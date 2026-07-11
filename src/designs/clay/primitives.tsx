import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {hexA, useScale, useSem} from '../../ui';

// Text color that reads on a candy-pastel clay fill.
export const onClay = '#241F2E';

// A puffy, bulging clay element (convex) with a multi-layer shadow stack.
export const ClayBlob: React.FC<{
  fill?: SemColor | null;
  circle?: boolean;
  radius?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({fill, circle = false, radius = 40, style, children}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const c = fill ? sem(fill) : t.colors.panel;
  return (
    <div
      style={{
        background: c,
        borderRadius: circle ? '50%' : radius * scale,
        boxShadow: `0 ${18 * scale}px ${36 * scale}px ${hexA(fill ? c : '#000000', fill ? 0.35 : 0.5)}, inset ${6 * scale}px ${6 * scale}px ${12 * scale}px rgba(255,255,255,0.35), inset -${6 * scale}px -${6 * scale}px ${12 * scale}px rgba(0,0,0,0.22)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Pressed (concave) clay pill — inner shadow.
export const ClayPress: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => {
  const t = useTheme();
  const {scale} = useScale();
  return (
    <div style={{background: t.colors.panel, borderRadius: 999, boxShadow: `inset ${4 * scale}px ${4 * scale}px ${10 * scale}px rgba(0,0,0,0.35), inset -${4 * scale}px -${4 * scale}px ${10 * scale}px rgba(255,255,255,0.06)`, ...style}}>
      {children}
    </div>
  );
};

// Rounded, friendly headline; the ONE accent phrase is a candy tone.
export const ClayHeadline: React.FC<{
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
        fontWeight: 800,
        fontSize: (vertical ? 60 : 68) * scale,
        letterSpacing: '-0.02em',
        color: t.colors.text,
        padding: `0 ${70 * scale}px`,
        lineHeight: 1.14,
      }}
    >
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} style={{color: sem(color)}}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </div>
  );
};

// Chrome: slow-drifting soft candy blobs floating in the background.
export const ClayChrome: React.FC = () => {
  const sem = useSem();
  const frame = useCurrentFrame();
  const {scale, vertical} = useScale();
  const drift = (p: number, amp: number) => Math.sin((frame / 60 + p) * Math.PI) * amp * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: (vertical ? 90 : 70) * scale + drift(0, 14), left: 60 * scale, width: 120 * scale, height: 120 * scale, borderRadius: '50%', background: hexA(sem('purple'), 0.2), filter: `blur(${18 * scale}px)`}} />
      <div style={{position: 'absolute', bottom: (vertical ? 150 : 90) * scale + drift(0.7, 18), right: 90 * scale, width: 150 * scale, height: 150 * scale, borderRadius: '50%', background: hexA(sem('green'), 0.16), filter: `blur(${20 * scale}px)`}} />
      <div style={{position: 'absolute', top: '46%', right: 40 * scale + drift(1.3, 12), width: 90 * scale, height: 90 * scale, borderRadius: '50%', background: hexA(sem('red'), 0.16), filter: `blur(${16 * scale}px)`}} />
    </div>
  );
};
