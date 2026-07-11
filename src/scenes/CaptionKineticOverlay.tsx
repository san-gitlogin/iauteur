import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame, FRAMES_PER_WORD} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {VideoBackdrop, duckedVolume} from '../video';

// CAPTION_KINETIC_OVERLAY — a full-bleed VideoBackdrop + a big per-word staggered
// caption in the lower band (or center), white-on-video with a hard drop shadow;
// ONE accent phrase (bracketed [like this]) in the accent colour, glow-gated.
// Self-contained (renders in ALL themes, not pack-delegated like KINETIC_TEXT).
// Pair with a scene `pip`. Missing src → placeholder backdrop.
export const CaptionKineticOverlay: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.captionKinetic;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const accent = sem(d.color ?? 'orange');
  const start = wordToFrame(d.atWord ?? 1);
  const pos = d.position ?? 'bottom';
  const glow = t.style.glow;

  // split caption into words, marking [bracketed] words as the accent phrase.
  const words = d.caption.split(/\s+/).map((w) => {
    const isAccent = /^\[.*\]$/.test(w) || /^\[/.test(w) || /\]$/.test(w);
    return {text: w.replace(/[[\]]/g, ''), accent: isAccent};
  });

  return (
    <AbsoluteFill style={{background: t.colors.bg, overflow: 'hidden'}}>
      <VideoBackdrop
        src={d.src}
        kind={d.kind}
        treatment={{scrim: pos === 'bottom' ? 'bottom' : 'full', dim: 0.12}}
        fit="cover"
        focal={d.focal}
        muted={d.muted ?? true}
        volume={d.muted === false ? duckedVolume({narrationFrames: scene.durationFrames, gaps: d.audioGaps}) : undefined}
        placeholderLabel="CAPTION"
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: pos === 'center' ? 'center' : 'flex-end', padding: `${(vertical ? 280 : 130) * scale}px ${(vertical ? 60 : 140) * scale}px`}}>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `${6 * scale}px ${18 * scale}px`, maxWidth: '100%'}}>
          {words.map((w, i) => {
            const wStart = start + i * Math.max(2, FRAMES_PER_WORD / 3);
            const rv = spring({frame: frame - wStart, fps, config: {damping: 200}});
            if (rv < 0.001) return null;
            const tint = w.accent ? accent : '#FFFFFF';
            const neon = w.accent && glow > 0 ? `, 0 0 ${18 * glow}px ${hexA(accent, 0.55 * glow)}` : '';
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  opacity: rv,
                  transform: `translateY(${(1 - rv) * 22 * scale}px)`,
                  fontFamily: t.fonts.display,
                  fontWeight: 900,
                  fontSize: (vertical ? 64 : 76) * scale,
                  letterSpacing: t.style.displayTracking,
                  color: tint,
                  textShadow: `0 3px 14px ${hexA('#000000', 0.7)}${neon}`,
                  lineHeight: 1.08,
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
