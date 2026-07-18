import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, Kicker, useScale, useSem, hexA} from '../ui';
import {VideoBackdrop, GlassPanel, NeonText, duckedVolume} from '../video';

// TITLE_BANNER_FOCUS — a glass-gradient banner headline over a HEAVILY blurred +
// desaturated video backdrop (a title moment with total focus while keeping the
// footage continuity). Pair with a scene `pip` for the speaker. Kept OFF the
// pack-native TITLE_CARD to avoid entangling 30 packs with video props. Missing
// src → placeholder backdrop. Tokens × scale; GlassPanel + NeonText glow-gated.
export const TitleBannerFocus: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.titleBanner;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const accent = d.color ?? 'orange';
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const rv = spring({frame: frame - start, fps, config: {damping: 200}});
  const enterY = (1 - rv) * 26 * scale;

  return (
    <AbsoluteFill style={{background: t.colors.bg, overflow: 'hidden'}}>
      <VideoBackdrop
        src={d.src}
        kind={d.kind}
        treatment={{blur: 'heavy', desaturate: true, dim: 0.28, scrim: 'full'}}
        fit="cover"
        focal={d.focal}
        muted={d.muted ?? true}
        volume={d.muted === false ? duckedVolume({narrationFrames: scene.durationFrames, gaps: d.audioGaps}) : undefined}
        placeholderLabel="TITLE"
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: (vertical ? 60 : 120) * scale}}>
        <div style={{opacity: rv, transform: `translateY(${enterY}px) scale(${0.96 + rv * 0.04})`, width: vertical ? '92%' : '76%'}}>
          <GlassPanel color={accent} corner="tl" style={{textAlign: 'center', padding: `${(vertical ? 40 : 46) * scale}px ${(vertical ? 40 : 56) * scale}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 * scale}}>
            {d.kicker ? <Kicker text={d.kicker} color={accent} /> : null}
            <NeonText size={(vertical ? 68 : 82) * scale} color={accent} weight={t.style.displayWeight} style={{lineHeight: 1.04}}>
              {d.title}
            </NeonText>
            {d.subtitle ? (
              <div style={{fontFamily: t.fonts.body, fontSize: (vertical ? 30 : 32) * scale, color: hexA(t.colors.text, 0.86), maxWidth: '90%'}}>{d.subtitle}</div>
            ) : null}
          </GlassPanel>
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
