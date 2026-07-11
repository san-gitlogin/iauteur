import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale} from '../ui';
import {entranceStyle} from '../motion';
import {AssetIcon} from '../AssetIcon';
import {GlowFrame} from '../video';

// GALLERY — a grid of image/logo tiles revealing in a stagger (tools we support,
// logos, screenshots). Tiles use img:/si:/lucide: via AssetIcon. variant:'clips'
// (CLIP_GRID) → tiles carry a media `src` (clip OR image) framed in a GlowFrame.
export const Gallery: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data.gallery;
  if (!d) return <AbsoluteFill />;
  const tiles = d.tiles;
  const isClips = d.variant === 'clips' || tiles.some((tl) => tl.src);
  const size = (vertical ? 220 : 200) * scale;
  const clipW = (vertical ? 440 : 460) * scale;
  const clipH = clipW * (9 / 16);

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 120 : 70) * scale}}>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 30 * scale, justifyContent: 'center', maxWidth: vertical ? '94%' : '86%'}}>
          {tiles.map((tile, i) => {
            const start = tile.atWord != null ? wordToFrame(tile.atWord) : i * 6;
            return (
              <div key={i} style={{...entranceStyle(scene.data.anim ?? 'pop', frame, start, fps), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale, width: isClips ? clipW : size}}>
                {tile.src ? (
                  <GlowFrame width={clipW} height={clipH} src={tile.src} kind={tile.kind ?? 'video'} color={tile.color ?? 'blue'} placeholderKind="clip" />
                ) : (
                  <AssetIcon asset={tile.asset} size={size} />
                )}
                {tile.label ? (
                  <div style={{fontFamily: t.fonts.mono, fontSize: 24 * scale, color: t.colors.muted, textAlign: 'center'}}>{tile.label}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
