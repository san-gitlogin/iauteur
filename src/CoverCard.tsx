import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ThemeProvider, useTheme} from './themes';
import {Background} from './Background';
import {AssetIcon} from './AssetIcon';
import {CoverConfig} from './types';

// The Shorts cover: a designed frame placed at the very start of the video
// (2-3 frames = imperceptible) so it's selectable as the Shorts thumbnail
// in YouTube's frame picker. Also rendered standalone as a Still (PNG).

export const CoverCard: React.FC<{cover: CoverConfig}> = ({cover}) => {
  const {width, height} = useVideoConfig();
  const t = useTheme();
  const vertical = height > width;
  const scale = vertical ? width / 1080 : width / 1920;

  return (
    <AbsoluteFill>
      <Background zone="zoneA" />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 44 * scale,
          padding: 80 * scale,
        }}
      >
        {cover.badge ? (
          <div
            style={{
              background: t.colors.accent2,
              color: t.colors.onAccent,
              fontFamily: t.fonts.mono,
              fontWeight: 800,
              fontSize: 34 * scale,
              padding: `${12 * scale}px ${30 * scale}px`,
              borderRadius: 14 * scale * t.style.cornerRadius,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {cover.badge}
          </div>
        ) : null}
        {cover.asset ? <AssetIcon asset={cover.asset} size={(vertical ? 240 : 200) * scale} /> : null}
        <div
          style={{
            fontFamily: t.fonts.display,
            fontWeight: t.style.displayWeight,
            fontSize: (vertical ? 110 : 120) * scale,
            lineHeight: 1.04,
            color: t.colors.text,
            textAlign: 'center',
            letterSpacing: t.style.displayTracking,
            textShadow: t.style.glow > 0 ? `0 0 ${46 * t.style.glow}px ${t.colors.glowSoft}` : '0 8px 40px rgba(0,0,0,0.25)',
          }}
        >
          {cover.title}
        </div>
        <div
          style={{
            height: 8 * scale,
            width: 240 * scale,
            background: t.colors.accent,
            borderRadius: 4,
            boxShadow: t.style.glow > 0 ? `0 0 ${18 * t.style.glow}px ${t.colors.glowSoft}` : undefined,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Standalone Still wrapper (theme provided via props, since a Still has no spec).
// `logo` (brand.logo) stamps the channel mark top-left — Shorts UI owns bottom/right.
export const ThemedCover: React.FC<{
  themeName: string;
  title: string;
  badge: string;
  asset: string;
  logo?: string;
}> = ({themeName, title, badge, asset, logo}) => (
  <ThemeProvider themeName={themeName}>
    <CoverCard cover={{title, badge, asset}} />
    {logo ? (
      <div style={{position: 'absolute', top: 48, left: 44, opacity: 0.9}}>
        <AssetIcon asset={logo} size={104} bare />
      </div>
    ) : null}
  </ThemeProvider>
);
