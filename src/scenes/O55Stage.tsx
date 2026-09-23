import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene, O55StageData} from '../types';
import {Headline, SourceFooter, useScale, hexA} from '../ui';
import {useTheme} from '../themes';
import {O55Viz} from '../o55Viz';

// O55_STAGE — the drawn beats of the Claude Opus 5.5 release video.
//
// ONE TYPE, SEVEN PICTURES (LAW 0n): registering a type is plumbing; the depictions live in
// `src/o55Viz.tsx` and SAME PICTURE THRICE counts them per `kind`.
//
// The stage measures the room it has and hands the whole of it to the picture — headline
// above, source footer below, nothing drawn around the object itself.
export const O55Stage: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const d = scene.data.o55Stage as O55StageData | undefined;
  if (!d) return <AbsoluteFill />;
  const accent = (d.color ?? 'blue') as any;
  const W = vertical ? 1080 : 1920, H = vertical ? 1920 : 1080;
  const padX = vertical ? 52 : 80;
  const top = d.headline ? (vertical ? 322 : 200) : (d.stageTitle ? (vertical ? 178 : 96) : 60);
  // Bottom clearance: the corner watermark and the source footer live there.
  const bottom = vertical ? 200 : 90;
  const w = (W - padX * 2) * scale, h = (H - top - bottom) * scale;
  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={accent} /> : null}
      {/* In 9:16 the channel watermark sits TOP-LEFT, which is exactly where a stage title
          wants to be — so the title drops below it rather than printing through it. */}
      {d.stageTitle ? (
        <div style={{position: 'absolute', top: (d.headline ? top - 44 : (vertical ? 118 : 40)) * scale,
          left: padX * scale, right: padX * scale,
          fontFamily: t.fonts.mono, fontSize: (vertical ? 22 : 18) * scale, letterSpacing: 2.4 * scale,
          textTransform: 'uppercase', color: hexA(t.colors.muted, 0.85)}}>{d.stageTitle}</div>
      ) : null}
      <div style={{position: 'absolute', top: top * scale, left: padX * scale, width: w, height: h}}>
        <O55Viz kind={d.kind ?? ''} items={(d.stage ?? []).slice(0, 12)} accent={accent} token={d.token} w={w} h={h} />
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
