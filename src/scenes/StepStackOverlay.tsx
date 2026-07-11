import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {VideoBackdrop, NeonText, NumberChip, LabelBar, duckedVolume} from '../video';

// STEP_STACK_OVERLAY — a title + 3–5 numbered rows (NumberChip filled|ring + a
// translucent LabelBar) docked to ONE side over untreated video, staggered in.
// Subject-avoidance: docked left/right leaves the other half for the speaker.
// Missing src → placeholder backdrop. Tokens × scale; chip glow gated.
export const StepStackOverlay: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.stepStack;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const steps = (d.steps ?? []).slice(0, 5);
  const accent = d.color ?? 'orange';
  const dock = d.dock ?? 'left';
  const chipVariant = d.chip ?? 'filled';
  const chipSize = (vertical ? 62 : 58) * scale;

  return (
    <AbsoluteFill style={{background: t.colors.bg, overflow: 'hidden'}}>
      <VideoBackdrop
        src={d.src}
        kind={d.kind}
        treatment={{dim: 0.26}}
        fit="cover"
        focal={d.focal}
        muted={d.muted ?? true}
        volume={d.muted === false ? duckedVolume({narrationFrames: scene.durationFrames, gaps: d.audioGaps}) : undefined}
        placeholderLabel="STEP STACK"
      />
      {/* dock scrim on the docked side to lift the panel off the footage */}
      <AbsoluteFill
        style={{
          background: vertical
            ? `linear-gradient(180deg, ${hexA(t.colors.bg, 0.55)} 0%, transparent 55%)`
            : `linear-gradient(${dock === 'left' ? '90deg' : '270deg'}, ${hexA(t.colors.bg, 0.6)} 0%, transparent 52%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: (vertical ? 110 : 90) * scale,
          bottom: (vertical ? 200 : 90) * scale,
          ...(vertical
            ? {left: 60 * scale, right: 60 * scale}
            : dock === 'left'
              ? {left: 90 * scale, width: '46%'}
              : {right: 90 * scale, width: '46%'}),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 16 * scale,
        }}
      >
        {d.headline ? (
          <div style={{marginBottom: 8 * scale}}>
            <NeonText size={(vertical ? 48 : 50) * scale} color={accent}>{d.headline}</NeonText>
          </div>
        ) : null}
        {steps.map((s, i) => {
          const start = wordToFrame(s.atWord ?? 1 + i);
          const rv = spring({frame: frame - start, fps, config: {damping: 200}});
          if (rv < 0.001) return null;
          const tint = s.color ?? accent;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16 * scale, opacity: rv, transform: `translateX(${(1 - rv) * (dock === 'left' ? -1 : 1) * 26 * scale}px)`}}>
              <NumberChip n={i + 1} variant={chipVariant} color={tint} size={chipSize} />
              <LabelBar color={tint}>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <span style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 30 : 28) * scale, color: t.colors.text}}>{s.label}</span>
                  {s.sub ? <span style={{fontFamily: t.fonts.mono, fontSize: 18 * scale, color: sem(tint)}}>{s.sub}</span> : null}
                </div>
              </LabelBar>
            </div>
          );
        })}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
