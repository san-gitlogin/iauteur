import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene, AstraStageData} from '../types';
import {Headline, SourceFooter, useScale, hexA} from '../ui';
import {useTheme} from '../themes';
import {PaneBudget} from '../dsaViz';
import {VizVerdict} from '../linuxViz';
import {AstraViz} from '../astraViz';

// ASTRA_STAGE — every drawn beat of the GPT-6 Astra review, on one scene type.
//
// ONE TYPE, MANY PICTURES (LAW 0n). The Linux course registered 116 CMD_* types that were
// all thin wrappers picking a depiction, and its own register admits the gap: 98 components
// specified, 6 built. Registering a type and wiring eight touchpoints is plumbing. So this
// adds ONE type and grows `src/astraViz.tsx`, where the fifteen pictures actually live.
//
// NO TERMINAL PANE. UV_STAGE is a two-up rig because a packaging tutorial always has a
// command to show. A model review does not: its evidence is a published table, a benchmark
// harness, a price list. Forcing a terminal beside those would draw an empty pane, which is
// the exact defect UV_STAGE's `layout:'terminal'` exists to avoid, in mirror image. The
// picture gets the whole stage.
//
// THE BUDGET IS MEASURED AND PUBLISHED (LAW 0o rule 1). The stage subtracts the headline,
// the premise as WRAPPED, the stage title and its own padding, then hands what is left to
// the depictions through PaneBudget. A depiction that sized itself to a constant would
// overflow the moment a premise ran to two lines.
export const AstraStage: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const d = scene.data.astraStage as AstraStageData | undefined;
  if (!d) return <AbsoluteFill />;

  const accent = (d.color ?? 'blue') as any;
  const headTop = (d.headline ? (vertical ? 322 : 212) : 90) * scale;
  const floor = (vertical ? 1686 : 832) * scale;

  // Rows the stage owns before the picture gets anything. The premise is measured as
  // WRAPPED — a 120-character premise is two lines at 16:9 and three at 9:16, and assuming
  // one is how a picture ends up pushed through the bottom border.
  const premiseLines = d.premise
    ? Math.ceil(String(d.premise).length / (vertical ? 44 : 82))
    : 0;
  const premiseH = premiseLines * (vertical ? 30 : 24) * scale;
  const titleH = d.stageTitle ? (vertical ? 34 : 28) * scale : 0;
  const verdictH = d.verdict ? (vertical ? 92 : 68) * scale : 0;
  const padY = 26 * scale;
  const innerH = floor - headTop - premiseH - titleH - verdictH - padY;
  // PaneBudget speaks DESIGN px, and everything above is already scaled. Divide it back out
  // once, here, rather than in fifteen depictions.
  const budget = Math.max(120, innerH / scale);

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={accent} /> : null}
      <div
        style={{
          position: 'absolute',
          top: headTop,
          left: (vertical ? 52 : 72) * scale,
          right: (vertical ? 52 : 72) * scale,
          height: floor - headTop,
          display: 'flex',
          flexDirection: 'column',
          gap: 10 * scale,
          minHeight: 0,
        }}
      >
        {/* LAW 0l: the premise is the frame, not the title. It says what the viewer is
            looking at and what stands for what, stays unanchored for the whole scene, and
            is re-readable by somebody who looked away. */}
        {d.premise ? (
          <div
            style={{
              flex: '0 0 auto',
              fontFamily: t.fonts.mono, letterSpacing: 0.9,
              fontSize: (vertical ? 21 : 17) * scale,
              lineHeight: 1.4,
              color: hexA(t.colors.muted, 0.95),
              borderLeft: `${3 * scale}px solid ${hexA(t.colors.panelBorder, 0.9)}`,
              paddingLeft: 12 * scale,
            }}
          >
            {d.premise}
          </div>
        ) : null}

        {/* Per-beat caption. One generic title repeated across a cut is LAW 0j's defect in
            miniature — it tells the viewer nothing and makes the set look templated. */}
        {d.stageTitle ? (
          <div style={{
            flex: '0 0 auto',
            fontFamily: t.fonts.mono, fontSize: (vertical ? 19 : 15) * scale,
            letterSpacing: 1.4, textTransform: 'uppercase',
            color: hexA(t.colors.muted, 0.8),
          }}>{d.stageTitle}</div>
        ) : null}

        <div style={{flex: '1 1 auto', minHeight: 0, display: 'flex', minWidth: 0}}>
          <PaneBudget value={budget}>
            <AstraViz
              kind={d.kind ?? ''}
              items={(d.stage ?? []).slice(0, 8)}
              accent={accent}
              token={d.token}
            />
          </PaneBudget>
        </div>

        {/* The verdict is a FLEX CHILD with its own reserved strip. UvStage paid for this:
            a depiction with height:100% claimed the whole pane and pushed the verdict out
            under overflow:hidden, so it rendered on every beat and was visible on none. */}
        {d.verdict ? (
          <div style={{flex: '0 0 auto'}}>
            <VizVerdict text={d.verdict} sub={d.verdictSub} color={accent} atWord={d.verdictAtWord} />
          </div>
        ) : null}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
