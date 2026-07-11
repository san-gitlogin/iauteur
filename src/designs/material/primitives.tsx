import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {hexA, useScale, useSem} from '../../ui';

// A rounded tonal surface card with soft MD3 elevation.
export const MatCard: React.FC<{
  tint?: SemColor | null;
  elevated?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({tint, elevated = true, style, children}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const bg = tint ? hexA(sem(tint), 0.16) : '#211F26';
  return (
    <div
      style={{
        background: bg,
        borderRadius: 30 * scale,
        padding: `${26 * scale}px ${32 * scale}px`,
        boxShadow: elevated ? `0 ${2 * scale}px ${6 * scale}px rgba(0,0,0,0.35), 0 ${10 * scale}px ${26 * scale}px rgba(0,0,0,0.28)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Pill-shaped tonal chip.
export const MatChip: React.FC<{text: string; color?: SemColor; filled?: boolean}> = ({
  text,
  color = 'purple',
  filled = false,
}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const c = sem(color);
  return (
    <div
      style={{
        display: 'inline-block',
        fontFamily: t.fonts.body,
        fontWeight: 600,
        fontSize: 26 * scale,
        color: filled ? t.colors.onAccent : c,
        background: filled ? c : hexA(c, 0.16),
        borderRadius: 999,
        padding: `${9 * scale}px ${24 * scale}px`,
      }}
    >
      {text}
    </div>
  );
};

// Rounded headline; the ONE accent phrase is the primary tone.
export const MatHeadline: React.FC<{
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
        fontWeight: 500,
        fontSize: (vertical ? 60 : 68) * scale,
        letterSpacing: '0em',
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

// Chrome: atmospheric tonal blur blobs + a floating action button (FAB).
export const MatChrome: React.FC = () => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const fab = (vertical ? 96 : 104) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: '-10%', left: '-6%', width: 460 * scale, height: 460 * scale, borderRadius: '50%', background: hexA(sem('purple'), 0.12), filter: `blur(${80 * scale}px)`}} />
      <div style={{position: 'absolute', bottom: '-12%', right: '-8%', width: 520 * scale, height: 520 * scale, borderRadius: '50%', background: hexA(sem('red'), 0.08), filter: `blur(${90 * scale}px)`}} />
      {/* FAB */}
      <div
        style={{
          position: 'absolute',
          bottom: (vertical ? 120 : 60) * scale,
          right: (vertical ? 46 : 70) * scale,
          width: fab,
          height: fab,
          borderRadius: 26 * scale,
          background: sem('purple'),
          boxShadow: `0 ${4 * scale}px ${12 * scale}px rgba(0,0,0,0.4)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: t.fonts.display,
          fontWeight: 500,
          fontSize: 52 * scale,
          color: t.colors.onAccent,
        }}
      >
        +
      </div>
    </div>
  );
};
