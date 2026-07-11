import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, random} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

// SOUND_WAVE — an animated audio waveform (RVE sound-wave, made deterministic
// with remotion random). Great for audio / podcast / "listen" beats. Bars use
// the theme accent + glow; a staggered reveal grows the field in.
export const SoundWave: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.wave ?? {};
  const accent = sem(d.color ?? 'blue');
  const count = d.bars ?? (vertical ? 28 : 44);
  const start = wordToFrame(d.atWord ?? 1);
  const maxH = (vertical ? 460 : 340) * scale;
  const bw = 12 * scale;

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 5 * scale, boxShadow: `inset 0 0 ${140 * scale}px ${hexA(accent, 0.18)}`, paddingTop: scene.data.headline ? (vertical ? 120 : 60) * scale : 0}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 * scale, height: maxH}}>
          {Array.from({length: count}).map((_, i) => {
            const appear = interpolate(frame - start, [i * 0.6, i * 0.6 + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const h = (Math.abs(Math.sin(frame / 9 + i / 2)) * 0.62 + random(i * 1000) * 0.38) * maxH * appear;
            const edge = Math.abs(i - count / 2) / (count / 2); // taper toward edges
            const c = i % 5 === 0 ? sem('purple') : accent;
            return (
              <div key={i} style={{width: bw, height: Math.max(bw, h * (1 - edge * 0.35)), borderRadius: bw, background: c, boxShadow: `0 0 ${10 * scale}px ${hexA(c, 0.6)}`}} />
            );
          })}
        </div>
        {d.label ? <div style={{fontFamily: t.fonts.mono, fontSize: 26 * scale, letterSpacing: 2 * scale, textTransform: 'uppercase', color: t.colors.muted, marginTop: 30 * scale}}>{d.label}</div> : null}
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
