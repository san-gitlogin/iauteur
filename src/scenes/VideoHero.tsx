import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {VideoBackdrop, NeonText, BackdropTreatment, duckedVolume} from '../video';

// VIDEO_HERO — full-bleed clip + headline band. The clip IS the frame; the
// headline sits in a legibility band (scrim), never floating over busy footage.
// Optional slow zoom (deterministic ken-burns push). Missing src → designed
// placeholder backdrop. All tokens × scale; NeonText glow gates to a plain drop
// shadow on flat themes. Both aspects: headline band anchors bottom on wide,
// lower-third on vertical (clear of Shorts UI + the pip slot).
export const VideoHero: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.videoHero;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const tint = d.color ?? 'orange';
  const start = wordToFrame(d.atWord ?? 3);

  // treatment → backdrop degradation (overlay density decides focus: §2b.2)
  const treatment: BackdropTreatment =
    d.treatment === 'focus'
      ? {blur: 'heavy', desaturate: true, scrim: 'full'}
      : d.treatment === 'clean'
        ? {scrim: 'none', dim: 0.12}
        : {scrim: 'bottom', dim: 0.08};

  // slow deterministic zoom push (ken-burns), clamps for any scene length
  const p = interpolate(frame, [0, 300], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const zoom = d.zoom ? 1 + 0.08 * p : 1;

  const reveal = spring({frame: frame - start, fps, config: {damping: 200}});
  const bandY = (1 - reveal) * 30 * scale;

  return (
    <AbsoluteFill style={{background: t.colors.bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: 'center'}}>
        <VideoBackdrop
          src={d.src}
          treatment={treatment}
          fit="cover"
          focal={d.focal}
          muted={d.muted ?? true}
          volume={d.muted === false ? duckedVolume({narrationFrames: scene.durationFrames, gaps: d.audioGaps}) : undefined}
          startFrom={d.startFrom}
          endAt={d.endAt}
          placeholderLabel="VIDEO HERO"
        />
      </AbsoluteFill>
      {(d.kicker || d.headline || d.sub) ? (
        <div
          style={{
            position: 'absolute',
            left: (vertical ? 60 : 96) * scale,
            right: (vertical ? 60 : 96) * scale,
            bottom: (vertical ? 300 : 120) * scale,
            opacity: reveal,
            transform: `translateY(${bandY}px)`,
          }}
        >
          {d.kicker ? (
            <div
              style={{
                display: 'inline-block',
                fontFamily: t.fonts.mono,
                fontSize: 22 * scale,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: t.colors.onAccent,
                background: sem(tint),
                padding: `${6 * scale}px ${16 * scale}px`,
                borderRadius: 6 * scale * t.style.cornerRadius,
                marginBottom: 18 * scale,
              }}
            >
              {d.kicker}
            </div>
          ) : null}
          {d.headline ? (
            <NeonText size={(vertical ? 62 : 74) * scale} style={{lineHeight: 1.04, maxWidth: vertical ? '100%' : '76%'}}>
              {d.headline}
            </NeonText>
          ) : null}
          {d.sub ? (
            <div
              style={{
                marginTop: 16 * scale,
                fontFamily: t.fonts.body,
                fontStyle: 'italic',
                fontSize: (vertical ? 30 : 30) * scale,
                color: hexA(t.colors.text, 0.86),
                textShadow: `0 2px 10px ${hexA('#000000', 0.6)}`,
                maxWidth: vertical ? '100%' : '68%',
              }}
            >
              {d.sub}
            </div>
          ) : null}
        </div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
