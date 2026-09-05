import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThemeProvider, useTheme} from './themes';
import {Background} from './Background';
import {AssetIcon} from './AssetIcon';

// Long-form thumbnail (1280x720). Rule: ≤4 words, one focal icon, readable at 120px.
// `logo` (brand.logo) stamps the channel mark bottom-right — every thumbnail carries it.
type Replaces = {from?: string; to: string; fromAsset?: string; toAsset?: string};

const STRIKE = '#ff4d4d';

/** A word with a red bar drawn across it. A BAR, not a CSS line-through: at thumbnail
 *  scale a text decoration is a hairline nobody sees on a phone. The bar's weight and
 *  overhang scale with the type, so it reads the same struck at 96px and at 200px. */
const Struck: React.FC<{text: string; size: number; color: string; font: string}> =
  ({text, size, color, font}) => (
    <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center',
                 alignSelf: 'flex-start', padding: `0 ${size * 0.06}px`}}>
      <div style={{fontFamily: font, fontWeight: 800, fontSize: size, letterSpacing: '-0.03em',
                   color, lineHeight: 1, whiteSpace: 'nowrap', textTransform: 'none'}}>{text}</div>
      {/* 54%, not 50%: the box is the em box and capital letters sit BELOW its centre, so
          a bar at 50% crosses the upper third and reads as underlining the wrong thing. */}
      <div style={{position: 'absolute', left: -size * 0.05, right: -size * 0.05, top: '54%',
                   height: Math.max(9, size * 0.085), borderRadius: 999, background: STRIKE,
                   transform: 'translateY(-50%)', boxShadow: `0 0 ${size * 0.16}px ${STRIKE}`}} />
    </div>
  );

/**
 * THE SWAP — what the video argues, not what it mentions.
 *
 * Two shapes, and the second is the one the owner asked for after seeing the first:
 *
 *  · `from` set    → the rejected thing is struck in THIS block, above the lit one.
 *  · `from` absent → the rejected word lives in the TITLE instead (`titleStruck`), set
 *    large, and this block carries only the destination. That reads better, because the
 *    thing being rejected is the headline of the video, not a footnote beside it.
 *
 * `fromAsset` / `toAsset` are optional because not everything has a brand mark — pip has
 * no simple-icons glyph, and giving it one it does not own would be an invention (LAW 3).
 *
 * Deliberately NO third "context" mark above the block. It was tried — a dim Python glyph
 * over the uv panel — and it read as an orphan floating off the block's axis rather than
 * as context (owner, 2026-08-22). The ecosystem belongs in the words, not in a spare logo.
 */
const ReplacesBlock: React.FC<{r: Replaces}> = ({r}) => {
  const t = useTheme();
  const word = (text: string, size: number, color: string) => (
    <div style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: size,
                 letterSpacing: '-0.02em', color, lineHeight: 1, whiteSpace: 'nowrap',
                 // A wordmark keeps whatever casing it was given — `uv` is lowercase, and
                 // several packs uppercase text by default, which would quietly rebrand it.
                 textTransform: 'none'}}>{text}</div>
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                 gap: 20, flex: '0 0 auto'}}>
      {/* the rejected thing, when it is not already in the title */}
      {r.from || (r.fromAsset && !r.from) ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 14,
                     opacity: r.from ? 0.78 : 1, position: 'relative'}}>
          {r.fromAsset ? <AssetIcon asset={r.fromAsset} size={r.from ? 64 : 150} bare tint={t.colors.text} /> : null}
          {r.from ? <Struck text={r.from} size={96} color={t.colors.text} font={t.fonts.mono} /> : null}
          {/* MARK-ONLY REJECTION: the bar crosses the glyph itself. Overhung on both sides
              so it reads as struck THROUGH rather than as a rule sitting on top of it. */}
          {!r.from && r.fromAsset ? (
            <div style={{position: 'absolute', left: -22, right: -22, top: '50%', height: 17,
                         borderRadius: 999, background: STRIKE, transform: 'translateY(-50%)',
                         boxShadow: `0 0 30px ${STRIKE}`}} />
          ) : null}
        </div>
      ) : null}
      {/* the destination, lit */}
      <div style={{display: 'flex', alignItems: 'center', gap: 16,
                   padding: '14px 26px', borderRadius: 16 * t.style.cornerRadius,
                   background: `${t.colors.accent}22`,
                   border: `3px solid ${t.colors.accent}`,
                   boxShadow: t.style.glow > 0 ? `0 0 46px ${t.colors.glowSoft}` : 'none'}}>
        {r.toAsset ? <AssetIcon asset={r.toAsset} size={r.to ? 92 : 150} bare tint={t.colors.text} /> : null}
        {r.to ? word(r.to, 118, t.colors.text) : null}
      </div>
    </div>
  );
};

const ThumbInner: React.FC<{
  title: string; badge: string; asset: string; logo?: string;
  logos?: string[]; logoTint?: string; note?: string; replaces?: Replaces;
  titleStruck?: string;
}> = ({title, badge, asset, logo, logos, logoTint, note, replaces, titleStruck}) => {
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
  // room above the logo wall, less the badge, the note, and the gaps between them.
  // A struck word takes its own big line, so the title above it has to give that room up.
  const budget = (logos?.length ? 530 : 660) - 54 - 28 - (note ? 56 : 0) - (titleStruck ? 210 : 0);
  const base = titleStruck ? 92 : logos?.length ? 132 : 108;
  // 1584 is calibrated against the 88%-wide column a logo-wall thumbnail gets. A swap
  // block is a second COLUMN and takes real width away, so the same constant let the
  // title wrap to a line more than the fitter predicted and pushed the badge off the top
  // edge — LAW 0o's "never size to a constant", one layer further in. Scale, do not guess.
  const fitWidth = replaces ? 1584 * (0.56 / 0.88) : 1584;
  const titleSize =
    [base, base - 10, base - 20, base - 28, base - 36, base - 44].find(
      (size) => wrapAt(Math.max(6, Math.floor(fitWidth / size))) * size * 1.02 <= budget,
    ) ?? base - 44;
  // THE STRUCK WORD IS THE HEADLINE. It is set roughly twice the lead-in above it, so
  // "STOP USING" reads as the setup and the crossed-out word reads as the subject.
  const struckSize = Math.min(210, Math.round(titleSize * 2.15));
  return (
    <AbsoluteFill>
      <Background zone="zoneA" />
      <AbsoluteFill
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          // A logo wall reserves the bottom band, so the row is lifted to clear it.
          // With no wall the row centres on the frame itself, which is what a short
          // stack wants (owner, 2026-08-22: *"vertically align to the center of the
          // thumb overall"*) — the lifted version left the badge against the top edge.
          padding: logos?.length ? '0 90px 190px' : '0 90px',
        }}
      >
        {/* The swap block is a second column, not an icon, so the text column has to
            yield real width to it. Without this the left column kept the 88% it takes
            when a logo wall is present and the swap ran straight off the right edge. */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 28,
                     maxWidth: replaces ? '56%' : logos?.length ? '88%' : '62%'}}>
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
            {/* The rejected word, set large and crossed out. It sits INSIDE the title
                group rather than beside it, because it is the subject of the sentence
                the title starts — "STOP USING" is only a lead-in to it. */}
            {titleStruck ? (
              <Struck text={titleStruck} size={struckSize} color={t.colors.text} font={t.fonts.display} />
            ) : null}
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
                    color: t.colors.accent2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {note}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        {replaces ? <ReplacesBlock r={replaces} /> : logos?.length ? null : <AssetIcon asset={asset} size={300} />}
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
  replaces?: Replaces;
  titleStruck?: string;
}> = ({themeName, ...props}) => (
  <ThemeProvider themeName={themeName}>
    <ThumbInner {...props} />
  </ThemeProvider>
);
