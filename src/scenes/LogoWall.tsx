import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale} from '../ui';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// LOGO_WALL — a grid of brand logos ("trusted by" / the ecosystem). Logos come
// ONLY from simple-icons via AssetIcon (si:slug) — the HARD IP rule; never redrawn.
// Boxed AssetIcon gives each logo its reference-grade branded tile (white card +
// brand-hex glyph; logoMono packs render white-on-panel). Tiles pop in staggered.
// Tile size fits BOTH a width budget AND a height band (headline→footer) so a tall
// wall clears the headline (top) and the source footer (bottom) — the ICON_GRID lesson.
export const LogoWall: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data.logoWall;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const logos = (d.logos ?? []).slice(0, 15);
  const n = logos.length;
  const hasLabels = logos.some((l) => l.label);
  const cols = Math.max(1, Math.min(d.cols ?? (vertical ? (n <= 4 ? 2 : 3) : n <= 4 ? n : n <= 9 ? 3 : Math.ceil(n / 3)), vertical ? 3 : 5));
  const rows = Math.ceil(n / cols);
  const gridW = (vertical ? 940 : 1480) * scale;
  const gap = (vertical ? 28 : 36) * scale;
  const labelH = hasLabels ? 34 * scale : 0;
  const availH = (vertical ? 1300 : 720) * scale;
  const tileByW = (gridW - gap * (cols - 1)) / cols;
  const tileByH = (availH - (labelH + gap) * rows) / rows;
  const tile = Math.min((vertical ? 230 : 220) * scale, tileByW, tileByH);

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 150 : 90) * scale}}>
        <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${tile}px)`, gap, justifyContent: 'center'}}>
          {logos.map((l, i) => {
            const start = wordToFrame(l.atWord ?? Math.floor(i / cols) + 1);
            const rv = spring({frame: frame - start - (i % cols) * 3, fps, config: {damping: 200}});
            return (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 * scale, opacity: rv, transform: `scale(${interpolate(rv, [0, 1], [0.8, 1], clamp)})`}}>
                <AssetIcon asset={l.icon} size={tile} />
                {l.label ? <div style={{fontFamily: t.fonts.body, fontSize: 22 * scale, color: t.colors.muted, textAlign: 'center', maxWidth: tile, lineHeight: 1.1}}>{l.label}</div> : null}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
