import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {GlowFrame, NeonText, duckedVolume} from '../video';

// TALKING_POINTS — a GlowFrame media (clip OR image) on one side + an italic lead
// line + accent-led bullets with per-bullet reveal, on the theme background.
// Self-contained (renders over the theme in ALL packs, not pack-delegated like
// LIST_BUILD). Missing src → GlowFrame placeholder. Tokens × scale; glow-gated.
export const TalkingPoints: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.talkingPoints;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const accent = d.color ?? 'orange';
  const points = (d.points ?? []).slice(0, 5);
  const mediaSide = d.media ?? 'left';
  const start = wordToFrame(d.atWord ?? 1);
  const mediaRv = spring({frame: frame - start, fps, config: {damping: 200}});

  const frameW = vertical ? width * 0.8 : width * 0.4;
  const frameH = frameW * (9 / 16);

  const Media = (
    <div style={{opacity: mediaRv, transform: `scale(${0.94 + mediaRv * 0.06})`, flex: `0 0 ${frameW}px`}}>
      <GlowFrame width={frameW} height={frameH} src={d.src} kind={d.kind ?? 'video'} focal={d.focal} color={accent}
        clip={{muted: d.muted ?? true, volume: d.muted === false ? duckedVolume({narrationFrames: scene.durationFrames, gaps: d.audioGaps}) : undefined, fit: 'cover'}}
        placeholderKind="image" />
    </div>
  );

  const Text = (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 16 * scale, minWidth: 0}}>
      {d.headline ? <NeonText size={(vertical ? 46 : 52) * scale} color={accent} style={{lineHeight: 1.05}}>{d.headline}</NeonText> : null}
      {d.lead ? (
        <div style={{fontFamily: t.fonts.body, fontStyle: 'italic', fontSize: (vertical ? 30 : 30) * scale, color: hexA(t.colors.text, 0.82), marginBottom: 6 * scale}}>{d.lead}</div>
      ) : null}
      {points.map((p, i) => {
        const st = wordToFrame(p.atWord ?? 2 + i);
        const rv = spring({frame: frame - st, fps, config: {damping: 200}});
        if (rv < 0.001) return null;
        const tint = sem(p.color ?? accent);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 16 * scale, opacity: rv, transform: `translateX(${(1 - rv) * 20 * scale}px)`}}>
            <div style={{width: 10 * scale, height: 10 * scale, borderRadius: '50%', background: tint, marginTop: 16 * scale, flex: `0 0 ${10 * scale}px`, boxShadow: t.style.glow > 0 ? `0 0 ${10 * t.style.glow}px ${hexA(tint, 0.7)}` : undefined}} />
            <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: (vertical ? 32 : 34) * scale, color: t.colors.text, lineHeight: 1.28}}>{p.text}</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <AbsoluteFill style={{background: t.colors.bg, alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: (vertical ? 40 : 60) * scale, padding: (vertical ? 70 : 110) * scale}}>
      {vertical || mediaSide === 'left' ? Media : Text}
      {vertical || mediaSide === 'left' ? Text : Media}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
