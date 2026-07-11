import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {entranceStyle} from '../motion';
import {AssetIcon} from '../AssetIcon';

// PHOTO_STACK — overlapping cards that fan out as they drop in (a pile of
// screenshots, evidence, receipts). Each card rotates + pops at its atWord.
export const PhotoStack: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.photoStack;
  if (!d) return <AbsoluteFill />;
  const cards = d.cards;
  const mid = (cards.length - 1) / 2;
  const cw = (vertical ? 520 : 460) * scale;
  const ch = (vertical ? 620 : 540) * scale;

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? 'purple'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 100 : 40) * scale}}>
        <div style={{position: 'relative', width: cw, height: ch}}>
          {cards.map((card, i) => {
            const c = sem(card.color ?? 'blue');
            const rot = (i - mid) * 8;
            const dx = (i - mid) * 46 * scale;
            const dy = Math.abs(i - mid) * 14 * scale;
            const st = entranceStyle(scene.data.anim ?? 'pop', frame, wordToFrame(card.atWord), fps);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
                  zIndex: i,
                }}
              >
                <div
                  style={{
                    ...st,
                    width: cw,
                    height: ch,
                    background: t.colors.panel,
                    border: `2px solid ${hexA(c, 0.6)}`,
                    borderRadius: 20 * scale * Math.max(0.4, t.style.cornerRadius),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 22 * scale,
                    boxShadow: `0 ${20 * scale}px ${50 * scale}px ${hexA('#000000', 0.45)}`,
                  }}
                >
                  {card.asset ? <AssetIcon asset={card.asset} size={(vertical ? 180 : 170) * scale} /> : null}
                  {card.label ? (
                    <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 40 : 42) * scale, color: t.colors.text, textAlign: 'center', padding: `0 ${20 * scale}px`}}>{card.label}</div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
