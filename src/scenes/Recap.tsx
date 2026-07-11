import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {fadeUp} from '../anim';
import {entranceStyle} from '../motion';
import {Check} from 'lucide-react';

export const Recap: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = useTheme();
  const vertical = height > width;
  const scale = vertical ? width / 1080 : width / 1920;
  const points = scene.data.points ?? [];

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 30 * scale,
        padding: 90 * scale,
      }}
    >
      <div
        style={{
          ...fadeUp(frame, 0, fps),
          fontFamily: t.fonts.display,
          fontWeight: 800,
          fontSize: 56 * scale,
          color: t.colors.text,
          marginBottom: 16 * scale,
          letterSpacing: t.style.displayTracking,
        }}
      >
        {scene.data.heading ?? 'What to remember'}
      </div>
      {points.map((p, i) => (
        <div
          key={i}
          style={{
            ...entranceStyle(scene.data.anim ?? 'stack', frame, wordToFrame(p.atWord), fps),
            display: 'flex',
            alignItems: 'center',
            gap: 26 * scale,
            width: vertical ? '92%' : '72%',
          }}
        >
          <div
            style={{
              width: 54 * scale,
              height: 54 * scale,
              minWidth: 54 * scale,
              borderRadius: '50%',
              background: t.colors.accent2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: t.style.glow > 0 ? `0 0 ${18 * t.style.glow}px ${t.colors.glowSoft}` : undefined,
            }}
          >
            <Check size={32 * scale} color={t.colors.onAccent} strokeWidth={3.5} />
          </div>
          <div
            style={{
              fontFamily: t.fonts.body,
              fontWeight: 600,
              fontSize: 40 * scale,
              color: t.colors.text,
              lineHeight: 1.3,
            }}
          >
            {p.text}
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
