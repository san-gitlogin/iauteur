import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene, AirllmStageData} from '../types';
import {Headline, SourceFooter, useScale, hexA} from '../ui';
import {useTheme} from '../themes';
import {AirllmViz} from '../airllmViz';

// AIRLLM_STAGE — every drawn beat of the AirLLM video, on one scene type.
//
// ONE TYPE, MANY PICTURES (LAW 0n corollary: "count SCENE TYPES against PICTURES, and plan
// the smaller number"). Registering a type is plumbing; the six depictions live in
// `src/airllmViz.tsx`, and the linter's SAME PICTURE THRICE counts them per `kind`, so
// reusing one three times is caught exactly as if they were separate types.
//
// NO CARD AROUND THE PICTURE. Each depiction is an object — a doorway, a tower, a cable —
// and an object in a bordered pane is the "patty inside a burger" defect. This stage hands
// the depiction the whole frame below an optional headline, measured, and draws nothing
// around it.
export const AirllmStage: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const d = scene.data.airllmStage as AirllmStageData | undefined;
  if (!d) return <AbsoluteFill />;
  const accent = (d.color ?? 'blue') as any;
  const W = vertical ? 1080 : 1920, H = vertical ? 1920 : 1080;
  const padX = vertical ? 52 : 80;
  const top = d.headline ? (vertical ? 322 : 200) : (d.stageTitle ? 96 : 60);
  // Bottom clearance: the corner watermark and the source footer live there.
  const bottom = vertical ? 200 : 90;
  const w = (W - padX * 2) * scale, h = (H - top - bottom) * scale;
  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={accent} /> : null}
      {d.stageTitle ? (
        <div style={{position: 'absolute', top: (d.headline ? top - 44 : 40) * scale, left: padX * scale, right: padX * scale,
          fontFamily: t.fonts.mono, fontSize: (vertical ? 22 : 18) * scale, letterSpacing: 2.4 * scale,
          textTransform: 'uppercase', color: hexA(t.colors.muted, 0.85)}}>{d.stageTitle}</div>
      ) : null}
      <div style={{position: 'absolute', top: top * scale, left: padX * scale, width: w, height: h}}>
        <AirllmViz kind={d.kind ?? ''} items={(d.stage ?? []).slice(0, 12)} accent={accent} token={d.token} w={w} h={h} />
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
