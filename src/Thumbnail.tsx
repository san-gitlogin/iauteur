import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThemeProvider, useTheme} from './themes';
import {Background} from './Background';
import {AssetIcon} from './AssetIcon';

// Long-form thumbnail (1280x720). Rule: ≤4 words, one focal icon, readable at 120px.
const ThumbInner: React.FC<{title: string; badge: string; asset: string}> = ({
  title,
  badge,
  asset,
}) => {
  const t = useTheme();
  return (
    <AbsoluteFill>
      <Background zone="zoneA" />
      <AbsoluteFill
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 90px',
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: 28, maxWidth: '62%'}}>
          <div
            style={{
              alignSelf: 'flex-start',
              background: t.colors.accent2,
              color: t.colors.onAccent,
              fontFamily: t.fonts.mono,
              fontWeight: 800,
              fontSize: 34,
              padding: '10px 26px',
              borderRadius: 14 * t.style.cornerRadius,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {badge}
          </div>
          <div
            style={{
              fontFamily: t.fonts.display,
              fontWeight: t.style.displayWeight,
              fontSize: 108,
              lineHeight: 1.02,
              color: t.colors.text,
              letterSpacing: t.style.displayTracking,
              textShadow:
                t.style.glow > 0
                  ? `0 8px 40px rgba(0,0,0,0.6), 0 0 40px ${t.colors.glowSoft}`
                  : '0 6px 28px rgba(0,0,0,0.25)',
            }}
          >
            {title}
          </div>
        </div>
        <AssetIcon asset={asset} size={300} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Thumbnail: React.FC<{
  themeName: string;
  title: string;
  badge: string;
  asset: string;
}> = ({themeName, ...props}) => (
  <ThemeProvider themeName={themeName}>
    <ThumbInner {...props} />
  </ThemeProvider>
);
