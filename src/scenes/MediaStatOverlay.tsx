import React from 'react';
import {AbsoluteFill, useCurrentFrame, spring, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, Kicker, useScale, useSem, hexA} from '../ui';
import {VideoBackdrop, NeonText, GlassPanel, BackdropTreatment, duckedVolume} from '../video';
import {counterValue, compactNumber} from '../motion/numbers';

// MEDIA_STAT_OVERLAY — a media backdrop (clip OR image, src-agnostic) with a
// disciplined stat band composited over it: 1–3 counting numbers + labels in a
// GlassPanel row (wide) or stack (vertical). Reuses counterValue + compactNumber.
// Missing src → placeholder backdrop. Tokens × scale; NeonText numbers glow-gated.
export const MediaStatOverlay: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.mediaStat;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const accent = d.color ?? 'orange';
  const stats = (d.stats ?? []).slice(0, 3);
  const treatment: BackdropTreatment = d.treatment === 'clean' ? {dim: 0.22} : {scrim: 'full', dim: 0.14};

  return (
    <AbsoluteFill style={{background: t.colors.bg, overflow: 'hidden'}}>
      <VideoBackdrop
        src={d.src}
        kind={d.kind}
        treatment={treatment}
        fit="cover"
        focal={d.focal}
        muted={d.muted ?? true}
        volume={d.muted === false ? duckedVolume({narrationFrames: scene.durationFrames, gaps: d.audioGaps}) : undefined}
        placeholderLabel="MEDIA STAT"
      />

      {d.headline ? (
        <div style={{position: 'absolute', top: (vertical ? 100 : 76) * scale, left: (vertical ? 60 : 90) * scale, right: (vertical ? 60 : 90) * scale}}>
          <NeonText size={(vertical ? 50 : 56) * scale} color={accent} style={{lineHeight: 1.05}}>{d.headline}</NeonText>
        </div>
      ) : null}

      <div
        style={{
          position: 'absolute',
          left: (vertical ? 50 : 90) * scale,
          right: (vertical ? 50 : 90) * scale,
          bottom: (vertical ? 220 : 110) * scale,
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          gap: (vertical ? 20 : 28) * scale,
          justifyContent: 'center',
        }}
      >
        {stats.map((s, i) => {
          const start = wordToFrame(s.atWord ?? 1 + i * 2);
          const rv = spring({frame: frame - start, fps, config: {damping: 200}});
          if (rv < 0.001) return null;
          const val = counterValue(frame, start, s.value, 34);
          const tint = s.color ?? accent;
          return (
            <div key={i} style={{flex: 1, opacity: rv, transform: `translateY(${(1 - rv) * 18 * scale}px)`}}>
              <GlassPanel color={tint} corner={i % 2 === 0 ? 'tl' : 'br'} style={{display: 'flex', flexDirection: 'column', gap: 6 * scale}}>
                <NeonText size={(vertical ? 64 : 72) * scale} color={tint} weight={900}>
                  {s.prefix ?? ''}{compactNumber(val)}{s.suffix ?? ''}
                </NeonText>
                <Kicker text={s.label} color={tint} />
              </GlassPanel>
            </div>
          );
        })}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
