import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CYCLE = ['blue', 'purple', 'green', 'orange', 'red', 'yellow'] as const;

// ICON_GRID — a grid of labelled icons (a tech stack / "what's included" / a
// feature matrix). Each cell is a themed tile holding a bare AssetIcon (lucide/si
// ONLY, per the IP rule) + a label beneath. Cells pop in staggered. The tile size
// and icon fit a width budget so a full 12-item grid never overflows; glow is gated
// on the theme (flat tiles in neo). Theme + aspect aware.
export const IconGrid: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.iconGrid;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const items = (d.items ?? []).slice(0, 12);
  const n = items.length;
  const cols = Math.max(1, Math.min(d.cols ?? (vertical ? (n <= 4 ? 2 : 3) : n <= 4 ? n : n <= 8 ? 4 : Math.ceil(n / 2)), vertical ? 3 : 5));
  const rows = Math.ceil(n / cols);
  const gridW = (vertical ? 960 : 1500) * scale;
  const gap = (vertical ? 26 : 34) * scale;
  const labelH = 42 * scale;
  // fit the tile to BOTH a width budget AND a height budget (the band between the
  // headline and the source footer) so a tall 3-row grid never collides with either
  // (tall-headline + footer-clearance owned classes; IG-1 / IG-2).
  const availH = (vertical ? 1320 : 720) * scale;
  const tileByW = (gridW - gap * (cols - 1)) / cols;
  const tileByH = (availH - (labelH + gap) * rows) / rows;
  const tile = Math.min((vertical ? 250 : 240) * scale, tileByW, tileByH);
  const iconSize = tile * 0.42;

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 150 : 90) * scale}}>
        <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${tile}px)`, gap, justifyContent: 'center'}}>
          {items.map((it, i) => {
            const start = wordToFrame(it.atWord ?? Math.floor(i / cols) + 1);
            const rv = spring({frame: frame - start - (i % cols) * 3, fps, config: {damping: 200}});
            const c = sem(it.color ?? CYCLE[i % CYCLE.length]);
            return (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale, opacity: rv, transform: `scale(${interpolate(rv, [0, 1], [0.78, 1], clamp)})`}}>
                <div style={{
                  width: tile,
                  height: tile,
                  borderRadius: 22 * scale * t.style.cornerRadius,
                  background: hexA(c, 0.12),
                  border: `${2 * scale}px solid ${hexA(c, 0.5)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: t.style.glow > 0 ? `0 0 ${18 * t.style.glow}px ${hexA(c, 0.35)}` : `0 ${6 * scale}px ${16 * scale}px ${hexA('#000000', 0.28)}`,
                }}>
                  <AssetIcon asset={it.icon} size={iconSize} bare tint={c} on={t.colors.bg} />
                </div>
                <div style={{fontFamily: t.fonts.body, fontSize: 24 * scale, color: t.colors.text, textAlign: 'center', lineHeight: 1.12, maxWidth: tile}}>{it.label}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
