import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene, LayaStageData} from '../types';
import {Headline, SourceFooter, useScale, hexA} from '../ui';
import {useTheme} from '../themes';
import {LayaViz} from '../layaViz';

// LAYA_STAGE — the drawn beats of the Laya video.
//
// ONE TYPE, SEVEN PICTURES (LAW 0n): registering a type is plumbing; the depictions live
// in `src/layaViz.tsx` and SAME PICTURE THRICE counts them per `kind`, so reusing this
// type across the cut is not the monotony the guard is looking for — reusing one KIND is.
//
// The stage measures the room it has and hands the whole of it to the picture: headline
// above, source footer below, and nothing drawn around the object itself.
export const LayaStage: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const d = scene.data.layaStage as LayaStageData | undefined;
  if (!d) return <AbsoluteFill />;
  const accent = (d.color ?? 'blue') as any;
  const W = vertical ? 1080 : 1920, H = vertical ? 1920 : 1080;
  const padX = vertical ? 52 : 80;
  // THE PACK ALREADY OWNS THE TOP-LEFT. terminalcli prints a shell prompt line there, and a
  // stage title at y=40 lands straight through it — the same collision O55_STAGE hit against
  // the 9:16 watermark, in a different pack. The title sits BELOW the prompt, and the pane
  // starts below the title. Measured against a still, not guessed.
  const top = d.headline ? (vertical ? 322 : 200) : (d.stageTitle ? (vertical ? 250 : 156) : 60);
  // Bottom clearance: the corner watermark and the source footer live there.
  const bottom = vertical ? 200 : 90;
  const w = (W - padX * 2) * scale, h = (H - top - bottom) * scale;
  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={accent} /> : null}
      {/* In 9:16 the channel watermark sits TOP-LEFT, which is exactly where a stage title
          wants to be — so the title drops below it rather than printing through it. */}
      {d.stageTitle ? (
        <div style={{position: 'absolute', top: (d.headline ? top - 44 : (vertical ? 190 : 104)) * scale,
          left: padX * scale, right: padX * scale,
          fontFamily: t.fonts.mono, fontSize: (vertical ? 22 : 18) * scale, letterSpacing: 2.4 * scale,
          textTransform: 'uppercase', color: hexA(t.colors.muted, 0.85)}}>{d.stageTitle}</div>
      ) : null}
      <div style={{position: 'absolute', top: top * scale, left: padX * scale, width: w, height: h}}>
        <LayaViz kind={d.kind ?? ''} items={(d.stage ?? []).slice(0, 14)} accent={accent}
          token={d.token} w={w} h={h} />
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
