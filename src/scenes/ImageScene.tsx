import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {springPop, bounceIn} from '../motion';
import {AssetIcon} from '../AssetIcon';

// IMAGE_SCENE — a single framed image. 'polaroid' = tilted paper frame with a
// handwritten caption; 'pip' = a large panel with a small inset (screen + cam).
export const ImageScene: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.image;
  if (!d) return <AbsoluteFill />;
  const start = Math.min(wordToFrame(d.atWord), 38);
  const c = sem(d.color ?? 'blue');
  const variant = d.variant ?? 'polaroid';

  if (variant === 'polaroid') {
    const w = (vertical ? 560 : 520) * scale;
    return (
      <AbsoluteFill>
        {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? 'blue'} /> : null}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 80 : 30) * scale}}>
          <div
            style={{
              ...bounceIn(frame, start, fps, {distance: 60}),
              transform: `${(bounceIn(frame, start, fps, {distance: 60}).transform as string)} rotate(-2.5deg)`,
              background: '#FAF8F2',
              padding: `${22 * scale}px ${22 * scale}px ${18 * scale}px`,
              borderRadius: 4 * scale,
              boxShadow: `0 ${26 * scale}px ${60 * scale}px ${hexA('#000000', 0.5)}`,
            }}
          >
            <div style={{width: w, height: w * 0.82, background: '#0d0d10', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
              <AssetIcon asset={d.asset} size={w * 0.5} />
            </div>
            {d.caption ? (
              <div style={{fontFamily: t.fonts.accent, fontWeight: 700, fontSize: 44 * scale, color: '#1a1a1e', textAlign: 'center', marginTop: 14 * scale}}>{d.caption}</div>
            ) : null}
          </div>
        </AbsoluteFill>
        {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
      </AbsoluteFill>
    );
  }

  // pip
  const w = (vertical ? 940 : 1240) * scale;
  const h = (vertical ? 700 : 640) * scale;
  const pipW = (vertical ? 300 : 320) * scale;
  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 100 : 50) * scale}}>
        <div style={{...springPop(frame, start, fps), position: 'relative', width: w, height: h}}>
          <div style={{width: w, height: h, background: t.colors.panel, border: `1.5px solid ${hexA(c, 0.5)}`, borderRadius: 18 * scale * t.style.cornerRadius, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
            <AssetIcon asset={d.asset} size={(vertical ? 220 : 240) * scale} />
          </div>
          {d.caption ? (
            <div style={{position: 'absolute', top: 20 * scale, left: 24 * scale, fontFamily: t.fonts.mono, fontSize: 24 * scale, color: t.colors.muted, background: hexA(t.colors.bg, 0.6), padding: `${6 * scale}px ${14 * scale}px`, borderRadius: 8 * scale}}>{d.caption}</div>
          ) : null}
          {d.pip ? (
            <div
              style={{
                ...springPop(frame, start + 10, fps),
                position: 'absolute',
                bottom: 22 * scale,
                right: 22 * scale,
                width: pipW,
                height: pipW * 0.72,
                background: t.colors.panel,
                border: `2px solid ${sem('green')}`,
                borderRadius: 14 * scale * t.style.cornerRadius,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8 * scale,
                boxShadow: `0 ${14 * scale}px ${34 * scale}px ${hexA('#000000', 0.5)}`,
              }}
            >
              <AssetIcon asset={d.pip.asset} size={pipW * 0.4} />
              {d.pip.label ? <div style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.text}}>{d.pip.label}</div> : null}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
