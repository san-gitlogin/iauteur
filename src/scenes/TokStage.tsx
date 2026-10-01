import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene, TokStageData} from '../types';
import {Headline, SourceFooter, useScale, hexA} from '../ui';
import {useTheme} from '../themes';
import {TokViz} from '../tokViz';

// TOK_STAGE — every drawn beat of the "21 ways to save Claude Code tokens" video, on one scene type.
//
// Same shape as AIRLLM_STAGE: no card around the picture (the "patty inside a burger" defect), the
// depiction gets the whole frame below an optional headline, measured. Two captions: `stageTitle`
// is the per-beat title (LAW 0j corollary), `premise` is the standing sentence saying what the
// viewer is looking at (LAW 0l) and sits along the bottom, unanchored, for the whole beat.
export const TokStage: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const d = scene.data.tokStage as TokStageData | undefined;
  if (!d) return <AbsoluteFill />;
  const accent = (d.color ?? 'blue') as any;
  const W = vertical ? 1080 : 1920, H = vertical ? 1920 : 1080;
  const padX = vertical ? 52 : 80;
  const top = d.headline ? (vertical ? 322 : 200) : (d.stageTitle ? 104 : 60);
  const premiseH = d.premise ? (vertical ? 120 : 64) : 0;
  const bottom = (vertical ? 200 : 96) + premiseH;
  const w = (W - padX * 2) * scale, h = (H - top - bottom) * scale;
  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={accent} /> : null}
      {d.stageTitle ? (
        <div style={{position: 'absolute', top: (d.headline ? top - 44 : 44) * scale, left: padX * scale, right: padX * scale,
          fontFamily: t.fonts.mono, fontSize: (vertical ? 24 : 20) * scale, letterSpacing: 2.4 * scale,
          textTransform: 'uppercase', color: hexA(t.colors.muted, 0.9)}}>{d.stageTitle}</div>
      ) : null}
      <div style={{position: 'absolute', top: top * scale, left: padX * scale, width: w, height: h}}>
        <TokViz kind={d.kind ?? ''} items={(d.stage ?? []).slice(0, 30)} accent={accent} token={d.token} w={w} h={h} />
      </div>
      {d.premise ? (
        <div style={{position: 'absolute', left: padX * scale, right: padX * scale, bottom: (vertical ? 200 : 96) * scale,
          height: premiseH * scale, display: 'flex', alignItems: 'flex-end', fontFamily: t.fonts.body,
          fontSize: (vertical ? 26 : 22) * scale, lineHeight: 1.35, color: hexA(t.colors.muted, 0.95)}}>{d.premise}</div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
