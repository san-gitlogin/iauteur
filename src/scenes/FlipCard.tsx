import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, Kicker, useScale, useSem, hexA} from '../ui';
import {easeInOutCubic} from '../motion';

// FLIP_CARD — a card that flips 180° at atWord to reveal its back face
// (myth→fact, before→after, claim→truth). Front + back share the frame.
const Face: React.FC<{
  label: string;
  text: string;
  color: string;
  rotate: number;
  scale: number;
  vertical: boolean;
}> = ({label, text, color, rotate, scale, vertical}) => {
  const t = useTheme();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 22 * scale,
        background: t.colors.panel,
        border: `2px solid ${hexA(color, 0.6)}`,
        borderRadius: 24 * scale * Math.max(0.4, t.style.cornerRadius),
        padding: `${50 * scale}px ${60 * scale}px`,
        transform: `rotateY(${rotate}deg)`,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        boxShadow: `0 ${24 * scale}px ${60 * scale}px ${hexA('#000000', 0.4)}`,
      }}
    >
      <Kicker text={label} color={undefined} />
      <div
        style={{
          fontFamily: t.fonts.display,
          fontWeight: t.style.displayWeight,
          fontSize: (vertical ? 58 : 66) * scale,
          color,
          textAlign: 'center',
          lineHeight: 1.15,
          letterSpacing: t.style.displayTracking,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const FlipCard: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.flip;
  if (!d) return <AbsoluteFill />;

  const start = wordToFrame(d.atWord);
  const p = easeInOutCubic(
    interpolate(frame - start, [0, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  );
  const rot = p * 180;
  const frontC = sem(d.front.color ?? 'red');
  const backC = sem(d.back.color ?? 'green');
  const w = (vertical ? 900 : 1080) * scale;
  const h = (vertical ? 620 : 520) * scale;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? 'orange'} /> : null}
      <div style={{perspective: 1600 * scale, marginTop: (vertical ? 60 : 40) * scale}}>
        <div style={{position: 'relative', width: w, height: h, transformStyle: 'preserve-3d'}}>
          <Face label={d.front.label} text={d.front.text} color={frontC} rotate={rot} scale={scale} vertical={vertical} />
          <Face label={d.back.label} text={d.back.text} color={backC} rotate={rot - 180} scale={scale} vertical={vertical} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
