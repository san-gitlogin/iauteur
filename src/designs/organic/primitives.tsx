import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {hexA, useScale, useSem} from '../../ui';

// Varied organic border-radii — "no straight lines in nature".
export const BLOB_RADII = [
  '63% 37% 54% 46% / 55% 48% 52% 45%',
  '40% 60% 65% 35% / 47% 62% 38% 53%',
  '58% 42% 38% 62% / 63% 45% 55% 37%',
  '46% 54% 60% 40% / 52% 40% 60% 48%',
];

// A soft amorphous blob with an earthy tinted shadow + slight tilt.
export const Blob: React.FC<{
  fill?: SemColor | null;
  index?: number;
  rotate?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({fill, index = 0, rotate = 0, style, children}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const c = fill ? sem(fill) : t.colors.panel;
  return (
    <div
      style={{
        background: c,
        borderRadius: BLOB_RADII[index % BLOB_RADII.length],
        boxShadow: `0 ${16 * scale}px ${34 * scale}px ${hexA(fill ? c : '#000000', fill ? 0.28 : 0.4)}`,
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Fraunces serif headline; the ONE accent phrase is moss/terracotta italic.
export const OrgHeadline: React.FC<{
  text: string;
  color?: SemColor;
  startFrame?: number;
  top?: number;
}> = ({text, color = 'green', startFrame = 0, top}) => {
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
        top: (top ?? (vertical ? 166 : 106)) * scale,
        width: '100%',
        textAlign: 'center',
        fontFamily: t.fonts.display,
        fontWeight: 600,
        fontSize: (vertical ? 60 : 68) * scale,
        letterSpacing: '-0.01em',
        color: t.colors.text,
        padding: `0 ${70 * scale}px`,
        lineHeight: 1.14,
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

// Chrome: paper grain (multiply) + a couple of drifting earthy blobs.
export const OrgChrome: React.FC = () => {
  const sem = useSem();
  const frame = useCurrentFrame();
  const {scale, vertical} = useScale();
  const drift = (p: number, amp: number) => Math.sin((frame / 70 + p) * Math.PI) * amp * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(rgba(0,0,0,0.5) ${1 * scale}px, transparent ${1 * scale}px)`, backgroundSize: `${3 * scale}px ${3 * scale}px`, mixBlendMode: 'multiply', opacity: 0.06}} />
      <div style={{position: 'absolute', top: -60 * scale + drift(0, 16), left: -50 * scale, width: 300 * scale, height: 300 * scale, borderRadius: BLOB_RADII[0], background: hexA(sem('green'), 0.1), filter: `blur(${40 * scale}px)`}} />
      <div style={{position: 'absolute', bottom: -70 * scale + drift(0.8, 20), right: -40 * scale, width: 340 * scale, height: 340 * scale, borderRadius: BLOB_RADII[1], background: hexA(sem('orange'), 0.08), filter: `blur(${44 * scale}px)`}} />
    </div>
  );
};
