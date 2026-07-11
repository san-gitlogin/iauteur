import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {fadeUp} from '../anim';
import {entranceStyle} from '../motion';
import {AssetIcon} from '../AssetIcon';

export const ListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = useTheme();
  const vertical = height > width;
  const scale = vertical ? width / 1080 : width / 1920;
  const items = scene.data.items ?? [];

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 34 * scale,
        padding: 90 * scale,
      }}
    >
      {scene.data.heading ? (
        <div
          style={{
            ...fadeUp(frame, 0, fps),
            fontFamily: t.fonts.display,
            fontWeight: 800,
            fontSize: 58 * scale,
            color: t.colors.text,
            marginBottom: 20 * scale,
            textAlign: 'center',
            letterSpacing: t.style.displayTracking,
          }}
        >
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            ...entranceStyle(scene.data.anim ?? 'stack', frame, wordToFrame(item.atWord), fps),
            display: 'flex',
            alignItems: 'center',
            gap: 30 * scale,
            background: t.colors.panel,
            border: `2px solid ${t.colors.panelBorder}`,
            borderRadius: 22 * scale * t.style.cornerRadius,
            padding: `${26 * scale}px ${38 * scale}px`,
            width: vertical ? '92%' : '70%',
          }}
        >
          <AssetIcon asset={item.icon} size={72 * scale} bare on={t.colors.panel} />
          <div style={{display: 'flex', flexDirection: 'column', gap: 4 * scale}}>
            <div style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 38 * scale, color: t.colors.text, lineHeight: 1.25}}>
              {item.text}
            </div>
            {item.detail ? (
              <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 28 * scale, color: t.colors.muted, lineHeight: 1.3}}>
                {item.detail}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
