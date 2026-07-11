import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {VideoBackdrop, GlassPanel, duckedVolume} from '../video';

// FLOATING_QUOTE_PILL — one glass-gradient panel, lower-center over (largely
// untreated) video, carrying a question / quote / key line + optional attribution.
// Missing src → placeholder backdrop. Tokens × scale; GlassPanel shadow glow-gated.
export const FloatingQuotePill: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.floatingQuote;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const accent = d.color ?? 'orange';
  const start = wordToFrame(d.atWord ?? 1);
  const rv = spring({frame: frame - start, fps, config: {damping: 200}});

  return (
    <AbsoluteFill style={{background: t.colors.bg, overflow: 'hidden'}}>
      <VideoBackdrop
        src={d.src}
        kind={d.kind}
        treatment={{dim: 0.14}}
        fit="cover"
        focal={d.focal}
        muted={d.muted ?? true}
        volume={d.muted === false ? duckedVolume({narrationFrames: scene.durationFrames, gaps: d.audioGaps}) : undefined}
        placeholderLabel="FLOATING QUOTE"
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', padding: (vertical ? 60 : 96) * scale, paddingBottom: (vertical ? 280 : 150) * scale}}>
        <div style={{opacity: rv, transform: `translateY(${(1 - rv) * 24 * scale}px)`, width: vertical ? '94%' : '76%'}}>
          <GlassPanel color={accent} corner="tl" style={{textAlign: 'center'}}>
            <div
              style={{
                fontFamily: t.fonts.display,
                fontWeight: t.style.displayWeight,
                fontSize: (vertical ? 46 : 50) * scale,
                lineHeight: 1.16,
                color: t.colors.text,
                letterSpacing: t.style.displayTracking,
              }}
            >
              {d.quote}
            </div>
            {d.attribution ? (
              <div style={{marginTop: 16 * scale, fontFamily: t.fonts.body, fontStyle: 'italic', fontSize: (vertical ? 28 : 28) * scale, color: sem(accent)}}>
                {d.attribution}
              </div>
            ) : null}
          </GlassPanel>
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
