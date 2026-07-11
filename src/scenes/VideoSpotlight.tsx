import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, Kicker, useScale, useSem, hexA} from '../ui';
import {GlowFrame, NeonText, duckedVolume} from '../video';

// VIDEO_SPOTLIGHT — a framed clip (GlowFrame) centered on the THEME background
// (not full-bleed) with a name + italic-role lower third BELOW the frame. The
// creator-overlay "guest/host card". Composition of GlowFrame + lower-third
// grammar. Missing src → GlowFrame webcam placeholder (never black). All tokens ×
// scale; glow gates to a flat border + hard offset shadow on flat themes. Both
// aspects: the frame + caption stack centres and scales to the canvas.
export const VideoSpotlight: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.videoSpotlight;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const tint = d.color ?? 'orange';
  const start = wordToFrame(d.atWord ?? 1);

  // frame box = a fraction of the real canvas (16:9), leaving room for the caption
  const frameW = width * (vertical ? 0.84 : 0.56);
  const frameH = frameW * (9 / 16);

  const reveal = spring({frame: frame - start, fps, config: {damping: 200}});
  const capStart = start + 10;
  const cap = spring({frame: frame - capStart, fps, config: {damping: 200}});
  const frameScale = interpolate(reveal, [0, 1], [0.92, 1]);

  return (
    <AbsoluteFill
      style={{
        background: t.colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: (vertical ? 44 : 40) * scale,
        padding: (vertical ? 60 : 90) * scale,
      }}
    >
      <div style={{opacity: reveal, transform: `scale(${frameScale})`}}>
        <GlowFrame
          width={frameW}
          height={frameH}
          src={d.src}
          kind={d.kind ?? 'video'}
          focal={d.focal}
          color={tint}
          clip={{
            muted: d.muted ?? true,
            volume: d.muted === false ? duckedVolume({narrationFrames: scene.durationFrames, gaps: d.audioGaps}) : undefined,
            fit: 'cover',
          }}
          placeholderKind="webcam"
        />
      </div>
      <div
        style={{
          opacity: cap,
          transform: `translateY(${(1 - cap) * 20 * scale}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8 * scale,
          textAlign: 'center',
        }}
      >
        {d.kicker ? <Kicker text={d.kicker} color={tint} /> : null}
        {d.name ? (
          <NeonText size={(vertical ? 62 : 66) * scale} color={tint}>
            {d.name}
          </NeonText>
        ) : null}
        {d.role ? (
          <div
            style={{
              fontFamily: t.fonts.body,
              fontStyle: 'italic',
              fontSize: (vertical ? 32 : 30) * scale,
              color: hexA(t.colors.text, 0.82),
              letterSpacing: '0.01em',
            }}
          >
            {d.role}
          </div>
        ) : null}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
