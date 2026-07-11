import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {hexA, useScale, useSem} from '../../ui';

export const CREAM = '#FFFDF5';
export const INK = '#000000';

// A sticker cutout: thick black border + hard offset shadow (zero blur) + tilt.
export const NeoBox: React.FC<{
  fill?: string;
  shadow?: string;
  rotate?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({fill = CREAM, shadow = '#FF5A5F', rotate = 0, style, children}) => {
  const {scale} = useScale();
  const off = 10 * scale;
  return (
    <div
      style={{
        background: fill,
        border: `${4 * scale}px solid ${INK}`,
        boxShadow: `${off}px ${off}px 0 0 ${shadow}, ${off}px ${off}px 0 ${2 * scale}px ${INK}`,
        transform: `rotate(${rotate}deg)`,
        padding: `${24 * scale}px ${30 * scale}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Massive uppercase headline; the ONE accent phrase sits in a tilted pop box.
export const NeoHeadline: React.FC<{
  text: string;
  color?: SemColor;
  startFrame?: number;
  top?: number;
}> = ({text, color = 'yellow', startFrame = 0, top}) => {
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
        top: (top ?? (vertical ? 160 : 108)) * scale,
        width: '100%',
        textAlign: 'center',
        fontFamily: t.fonts.display,
        fontWeight: 900,
        fontSize: (vertical ? 62 : 70) * scale,
        letterSpacing: '-0.03em',
        textTransform: 'uppercase',
        color: t.colors.text,
        padding: `0 ${60 * scale}px`,
        lineHeight: 1.28,
      }}
    >
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            style={{
              display: 'inline-block',
              background: sem(color),
              color: INK,
              border: `${3 * scale}px solid ${INK}`,
              boxShadow: `${5 * scale}px ${5 * scale}px 0 0 ${INK}`,
              padding: `${2 * scale}px ${14 * scale}px`,
              transform: 'rotate(-1.5deg)',
              margin: `0 ${4 * scale}px`,
            }}
          >
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </div>
  );
};

// Small tilted pop tag (kickers, verdicts, subtext).
export const NeoTag: React.FC<{text: string; color?: SemColor; rotate?: number}> = ({
  text,
  color = 'yellow',
  rotate = -2,
}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  return (
    <div
      style={{
        display: 'inline-block',
        fontFamily: t.fonts.mono,
        fontWeight: 700,
        fontSize: 24 * scale,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        background: sem(color),
        color: INK,
        border: `${3 * scale}px solid ${INK}`,
        boxShadow: `${5 * scale}px ${5 * scale}px 0 0 ${INK}`,
        padding: `${6 * scale}px ${16 * scale}px`,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {text}
    </div>
  );
};

// Chrome: halftone dot texture + floating tilted pop squares in the corners.
export const NeoChrome: React.FC = () => {
  const sem = useSem();
  const {scale, vertical} = useScale();
  const dot = 26 * scale;
  const chip = (vertical ? 70 : 84) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${hexA('#FFFFFF', 0.06)} ${2 * scale}px, transparent ${2 * scale}px)`,
          backgroundSize: `${dot}px ${dot}px`,
        }}
      />
      {/* pop squares hug the EXTREME corners, bleeding off-frame so they read as
         bold corner accents in the outer margin and NEVER cover the content band. */}
      <div style={{position: 'absolute', top: -chip * 0.4, right: -chip * 0.4, width: chip, height: chip, background: sem('yellow'), border: `${4 * scale}px solid ${INK}`, transform: 'rotate(12deg)'}} />
      <div style={{position: 'absolute', bottom: -chip * 0.4, left: -chip * 0.35, width: chip * 0.7, height: chip * 0.7, background: sem('purple'), border: `${4 * scale}px solid ${INK}`, transform: 'rotate(-10deg)'}} />
    </div>
  );
};
