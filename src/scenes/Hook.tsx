import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {fadeUp, springPop} from '../anim';
import {entranceStyle} from '../motion';
import {AssetIcon} from '../AssetIcon';

export const Hook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = useTheme();
  const vertical = height > width;
  const scale = vertical ? width / 1080 : width / 1920;
  const d = scene.data;

  const headlineStart = wordToFrame(d.headlineAtWord ?? 1);
  const heroStart = wordToFrame(d.heroAtWord ?? 3);

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 48 * scale,
        padding: 80 * scale,
      }}
    >
      {d.heroAsset ? (
        <div style={{...springPop(frame, heroStart, fps)}}>
          <AssetIcon asset={d.heroAsset} size={(vertical ? 200 : 160) * scale} />
        </div>
      ) : null}
      <div
        style={{
          ...entranceStyle(d.anim ?? 'pop', frame, headlineStart, fps),
          fontFamily: t.fonts.display,
          fontWeight: t.style.displayWeight,
          fontSize: (vertical ? 96 : 110) * scale,
          lineHeight: 1.05,
          color: t.colors.text,
          textAlign: 'center',
          letterSpacing: t.style.displayTracking,
          maxWidth: '90%',
          textShadow: t.style.glow > 0 ? `0 0 ${40 * t.style.glow}px ${t.colors.glowSoft}` : undefined,
        }}
      >
        {d.headline}
      </div>
      {d.subtext ? (
        <div
          style={{
            ...fadeUp(frame, headlineStart + 12, fps),
            fontFamily: t.fonts.accent,
            fontWeight: 700,
            fontSize: (vertical ? 58 : 54) * scale,
            color: t.colors.accent3,
            textAlign: 'center',
            transform: 'rotate(-1.5deg)',
          }}
        >
          {d.subtext}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
