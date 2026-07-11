import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {VideoBackdrop, NeonText, duckedVolume} from '../video';

// OVERLAY_SPLIT_DEFINITIONS — two BOXLESS scrim-text columns flanking the subject:
// NeonText headers + short body, anchored left/right (wide) or top/bottom (vertical)
// so the CENTRE (where the speaker sits) stays clear — the subject-avoidance class.
// Text sits directly over video with a hard drop shadow + a subtle edge scrim (no
// box). Missing src → placeholder backdrop. Pair with a scene `pip` for the subject.
export const OverlaySplitDefinitions: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.splitDefs;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const Col: React.FC<{def: typeof d.left; side: 'left' | 'right'}> = ({def, side}) => {
    const start = wordToFrame(def.atWord ?? (side === 'left' ? 1 : 3));
    const rv = spring({frame: frame - start, fps, config: {damping: 200}});
    if (rv < 0.001) return null;
    const tint = def.color ?? d.color ?? 'orange';
    const dir = side === 'left' ? -1 : 1;
    // vertical: the top definition must clear the scene pip, which auto-relocates
    // to a TOP corner on Shorts (br/bl/tr/tl → top). A long (MAX) definition line
    // otherwise runs UNDER the pip and is occluded (defect L-2). Drop the top band
    // below the pip zone: pip top (150) + pip height (w×9/16) + label + gap.
    const pipPos = scene.pip?.position ?? 'br';
    const pipAtTop = !!scene.pip && ['br', 'bl', 'tr', 'tl'].includes(pipPos);
    const topBandTop = pipAtTop
      ? 150 + (scene.pip!.size === 'sm' ? 220 : 300) * scale * (9 / 16) + 100 * scale
      : 120 * scale;
    return (
      <div
        style={{
          position: 'absolute',
          // wide: hug left/right edges, center clear. vertical: top/bottom bands.
          ...(vertical
            ? side === 'left'
              ? {top: topBandTop, left: 60 * scale, right: 60 * scale}
              : {bottom: 260 * scale, left: 60 * scale, right: 60 * scale}
            : side === 'left'
              ? {left: 70 * scale, top: '50%', width: '30%', transform: 'translateY(-50%)'}
              : {right: 70 * scale, top: '50%', width: '30%', transform: 'translateY(-50%)'}),
          opacity: rv,
          textAlign: vertical ? 'center' : side === 'left' ? 'left' : 'right',
        }}
      >
        <div style={{transform: `translateX(${(1 - rv) * 24 * scale * dir}px)`}}>
          <NeonText size={(vertical ? 44 : 46) * scale} color={tint}>{def.header}</NeonText>
          <div
            style={{
              marginTop: 12 * scale,
              fontFamily: t.fonts.body,
              fontSize: (vertical ? 28 : 27) * scale,
              lineHeight: 1.3,
              color: hexA(t.colors.text, 0.9),
              textShadow: `0 2px 10px ${hexA('#000000', 0.75)}`,
            }}
          >
            {def.body}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{background: t.colors.bg, overflow: 'hidden'}}>
      <VideoBackdrop
        src={d.src}
        kind={d.kind}
        treatment={{dim: 0.24}}
        fit="cover"
        focal={d.focal}
        muted={d.muted ?? true}
        volume={d.muted === false ? duckedVolume({narrationFrames: scene.durationFrames, gaps: d.audioGaps}) : undefined}
        placeholderLabel="SPLIT DEFINITIONS"
      />
      {/* subtle edge scrims to lift the boxless text off the footage */}
      {!vertical ? (
        <>
          <AbsoluteFill style={{background: `linear-gradient(90deg, ${hexA(t.colors.bg, 0.6)} 0%, transparent 34%)`}} />
          <AbsoluteFill style={{background: `linear-gradient(270deg, ${hexA(t.colors.bg, 0.6)} 0%, transparent 34%)`}} />
        </>
      ) : (
        <>
          <AbsoluteFill style={{background: `linear-gradient(180deg, ${hexA(t.colors.bg, 0.62)} 0%, transparent 26%)`}} />
          <AbsoluteFill style={{background: `linear-gradient(0deg, ${hexA(t.colors.bg, 0.62)} 0%, transparent 26%)`}} />
        </>
      )}
      <Col def={d.left} side="left" />
      <Col def={d.right} side="right" />
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
