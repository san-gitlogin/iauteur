import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThemeProvider, useTheme} from './themes';
import {Background} from './Background';
import {AssetIcon} from './AssetIcon';

// Long-form thumbnail (1280x720). Rule: ≤4 words, one focal icon, readable at 120px.
// `logo` (brand.logo) stamps the channel mark bottom-right — every thumbnail carries it.
const ThumbInner: React.FC<{
  title: string; badge: string; asset: string; logo?: string;
  logos?: string[]; logoTint?: string; note?: string;
}> = ({title, badge, asset, logo, logos, logoTint, note}) => {
  const t = useTheme();

  // FIT THE TITLE. The size used to be a constant, so a longer title simply wrapped
  // to a third line and pushed the badge off the top edge of the frame — LAW 0o's
  // "never size to a constant", in the one place nobody thought to apply it.
  // Calibrated against real renders: at 132px the display face fits ~12 characters
  // per line in this column, which scales as 1584/size.
  const wrapAt = (perLine: number) => {
    let lines = 1, len = 0;
    for (const w of title.split(' ')) {
      if (len === 0) { len = w.length; continue; }
      if (len + 1 + w.length <= perLine) len += 1 + w.length;
      else { lines++; len = w.length; }
    }
    return lines;
  };
  // room above the logo wall, less the badge, the note, and the gaps between them
  const budget = (logos?.length ? 530 : 660) - 54 - 28 - (note ? 56 : 0);
  const base = logos?.length ? 132 : 108;
  const titleSize =
    [base, base - 10, base - 20, base - 28, base - 36, base - 44].find(
      (size) => wrapAt(Math.max(6, Math.floor(1584 / size))) * size * 1.02 <= budget,
    ) ?? base - 44;
  return (
    <AbsoluteFill>
      <Background zone="zoneA" />
      <AbsoluteFill
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: logos?.length ? '0 90px 190px' : '0 90px',
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: 28, maxWidth: logos?.length ? '88%' : '62%'}}>
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
          {/* Title and its note are ONE block with a tight gap of their own — the
              column's 28px gap is the space between badge and title, and reusing it
              here would leave the note floating between the two rather than reading
              as a sub-line of the title. */}
          <div style={{display: 'flex', flexDirection: 'column', gap: note ? 16 : 0}}>
            <div
              style={{
                fontFamily: t.fonts.display,
                fontWeight: t.style.displayWeight,
                fontSize: titleSize,
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
            {/* the sub-line: small, tracked, flush to the title's left edge, led by a
                short rule so it reads as attached rather than orphaned */}
            {note ? (
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <div style={{width: 34, height: 3, borderRadius: 2, background: t.colors.accent2}} />
                <div
                  style={{
                    fontFamily: t.fonts.mono,
                    fontWeight: 700,
                    fontSize: 30,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: t.colors.muted,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {note}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        {logos?.length ? null : <AssetIcon asset={asset} size={300} />}
      </AbsoluteFill>
      {/* THE LOGO WALL. Bare glyphs on the background itself — no chip, no card, no
          tinted container. Tinted uniformly: Anthropic (#191919), SpaceX (#000000)
          and OpenAI (#412991) are near-black official marks and would disappear
          entirely on a dark ground, so six clashing brand colours is not an option
          that survives contact with the background. */}
      {logos?.length ? (
        <div
          style={{
            position: 'absolute',
            left: 90,
            // clear of the channel mark in the bottom-right corner
            right: 210,
            bottom: 58,
            display: 'flex',
            alignItems: 'center',
            // space-between only reads as a wall when the row is full; two marks
            // flung to opposite edges reads as a mistake.
            justifyContent: (logos?.length ?? 0) > 3 ? 'space-between' : 'flex-start',
            gap: (logos?.length ?? 0) > 3 ? 0 : 64,
          }}
        >
          {logos.map((a) => (
            <AssetIcon key={a} asset={a} size={104} bare tint={logoTint ?? t.colors.text} />
          ))}
        </div>
      ) : null}
      {logo ? (
        <div style={{position: 'absolute', bottom: 26, right: 30, opacity: 0.9}}>
          <AssetIcon asset={logo} size={96} bare />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const Thumbnail: React.FC<{
  themeName: string;
  title: string;
  badge: string;
  asset: string;
  logo?: string;
  logos?: string[];
  logoTint?: string;
  note?: string;
}> = ({themeName, ...props}) => (
  <ThemeProvider themeName={themeName}>
    <ThumbInner {...props} />
  </ThemeProvider>
);
