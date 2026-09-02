import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene, VideoSpec} from '../types';
import {useTheme} from '../themes';
import {fadeUp, springPop} from '../anim';
import {entranceStyle} from '../motion';
import {AssetIcon} from '../AssetIcon';
import {Bell} from 'lucide-react';
import {ActionRow} from './ActionRow';

// Long-form: keep key content CENTERED — YouTube end screens own the corners.
// When brand.logo is set, the subscribe circle shows the CHANNEL LOGO (Bell is the fallback).
export const OutroCta: React.FC<{scene: Scene; brand?: VideoSpec['brand']}> = ({scene, brand}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = useTheme();
  const vertical = height > width;
  const scale = vertical ? width / 1080 : width / 1920;
  const d = scene.data;

  return (
    <AbsoluteFill
      style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 * scale}}
    >
      <div style={{...springPop(frame, 0, fps)}}>
        {brand?.logo ? (
          // The channel logo IS the end-card hero — large, uncropped, natural.
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: t.style.glow > 0 ? `drop-shadow(0 0 ${40 * t.style.glow}px ${t.colors.glowSoft})` : 'drop-shadow(0 12px 30px rgba(0,0,0,0.35))',
            }}
          >
            <AssetIcon asset={brand.logo} size={280 * scale} bare />
          </div>
        ) : (
          <div
            style={{
              width: 110 * scale,
              height: 110 * scale,
              borderRadius: '50%',
              background: t.colors.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: t.style.glow > 0 ? `0 0 ${70 * t.style.glow}px ${t.colors.glowSoft}` : '0 12px 30px rgba(0,0,0,0.2)',
            }}
          >
            <Bell size={56 * scale} color={t.colors.onAccent} strokeWidth={2.4} />
          </div>
        )}
      </div>
      <div
        style={{
          ...entranceStyle(d.anim ?? 'fadeUp', frame, 10, fps),
          fontFamily: t.fonts.display,
          fontWeight: 800,
          fontSize: 62 * scale,
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '84%',
          letterSpacing: t.style.displayTracking,
        }}
      >
        {d.message}
      </div>
      {/* LIKE · SUBSCRIBE · SHARE. The owner asked for these under the channel logo, and they
          arrive AFTER the message has been read rather than competing with it. */}
      <ActionRow start={30} />
      {d.sub ? (
        <div
          style={{
            ...fadeUp(frame, 20, fps),
            fontFamily: t.fonts.accent,
            fontWeight: 700,
            fontSize: 46 * scale,
            color: t.colors.muted,
            textAlign: 'center',
            transform: 'rotate(-1deg)',
          }}
        >
          {d.sub}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
