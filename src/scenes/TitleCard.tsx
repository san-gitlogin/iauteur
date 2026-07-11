import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme} from '../themes';
import {fadeUp} from '../anim';
import {entranceStyle} from '../motion';

export const TitleCard: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = useTheme();
  const vertical = height > width;
  const scale = vertical ? width / 1080 : width / 1920;
  const d = scene.data;
  const lineW = interpolate(frame, [8, 26], [0, 220 * scale], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30 * scale}}
    >
      <div
        style={{
          ...entranceStyle(d.anim ?? 'pop', frame, 0, fps),
          fontFamily: t.fonts.display,
          fontWeight: t.style.displayWeight,
          fontSize: (vertical ? 84 : 96) * scale,
          color: t.colors.text,
          textAlign: 'center',
          letterSpacing: t.style.displayTracking,
          maxWidth: '88%',
        }}
      >
        {d.title}
      </div>
      <div
        style={{
          height: 6 * scale,
          width: lineW,
          background: t.colors.accent,
          borderRadius: 3,
          boxShadow: t.style.glow > 0 ? `0 0 ${16 * t.style.glow}px ${t.colors.glowSoft}` : undefined,
        }}
      />
      {d.subtitle ? (
        <div
          style={{
            ...fadeUp(frame, 14, fps),
            fontFamily: t.fonts.mono,
            fontWeight: 500,
            fontSize: 34 * scale,
            color: t.colors.muted,
            textAlign: 'center',
            letterSpacing: '0.02em',
          }}
        >
          {d.subtitle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
