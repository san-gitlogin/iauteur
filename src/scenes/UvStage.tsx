import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene} from '../types';
import {Headline, SourceFooter, useScale, hexA} from '../ui';
import {useTheme} from '../themes';
import {CommandStage, CmdStep, useStageState} from '../CommandStage';
import {VizVerdict} from '../linuxViz';
import {UvViz} from '../uvViz';

// UV_STAGE — every beat of the uv course, on one scene type.
//
// WHY ONE TYPE AND NOT TWENTY-TWO. The Linux course registered 116 CMD_* scene types
// that were all thin wrappers choosing a depiction kind, and its own component register
// records the correction: 98 new components planned, 6 shipped. LAW 0n puts it plainly —
// registering a scene type and wiring eight touchpoints is plumbing, not a depiction. So
// the uv course adds ONE type and grows `src/uvViz.tsx` instead, where the pictures are.
//
// LAYOUT IS AUTHORED PER BEAT, not assumed. `data.layout: "terminal"` drops the effect
// pane entirely. That exists because four frames sampled from the shipped Linux cut were
// all the same split, and in two of them the left pane was empty — a beat whose whole
// content is one screen failing has no second pane to draw, and forcing one produces
// either dead space or a list invented to fill it.
//
// PREMISE (LAW 0l) is a separate field from the stage title. The title names this beat;
// the premise says what the viewer is looking at and what stands for what, stays on
// screen unanchored for the whole scene, and is re-readable by someone who looked away.
export const UvStage: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const d = scene.data.uvStage;
  if (!d) return <AbsoluteFill />;

  const raw = (d.steps ?? []).slice(0, 5);
  const steps: CmdStep[] = raw.map((s) => ({
    cmd: s.label ?? '',
    // Real multi-line output when authored; the text/sub pair is the fallback.
    output: (s.out?.length ? s.out : [s.text, s.sub].filter(Boolean)) as string[],
    note: s.detail,
    atWord: s.atWord,
  }));
  const state = useStageState(steps);
  const accent = (d.color ?? 'blue') as any;
  const terminalOnly = d.layout === 'terminal';

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={accent} /> : null}
      <div
        style={{
          position: 'absolute',
          top: (d.headline ? (vertical ? 322 : 212) : 90) * scale,
          left: (vertical ? 52 : 72) * scale,
          right: (vertical ? 52 : 72) * scale,
          // The house floor: 212 + 620 = 832 wide, 322 + 1364 = 1686 vertical. 141
          // scenes hard-code the height and duplicate the arithmetic; stating the
          // FLOOR instead means a headline that pushes `top` down cannot push the
          // stage through the bottom of the frame.
          height: ((vertical ? 1686 : 832) - (d.headline ? (vertical ? 322 : 212) : 90)) * scale,
          display: 'flex',
          flexDirection: 'column',
          gap: d.premise ? (vertical ? 14 : 12) * scale : 0,
          minHeight: 0,
        }}
      >
        {/* The premise sits ABOVE the stage and outside it, so the stage's own budget is
            measured after this has taken its height rather than before (LAW 0o rule 1). */}
        {d.premise ? (
          <div
            style={{
              flex: '0 0 auto',
              fontFamily: t.fonts.body,
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
        <div style={{flex: '1 1 auto', display: 'flex', minHeight: 0}}>
          <CommandStage
            steps={steps}
            state={state}
            promptLabel={d.promptLabel}
            cwd={d.cwd}
            color={accent}
            highlight={d.highlight}
            layout={terminalOnly ? 'terminal' : 'split'}
            // Per-beat caption. A single generic title repeated on every scene is LAW 0j's
            // defect in miniature — it tells the viewer nothing and makes the set look
            // templated. Authored per beat, from that beat's subject.
            stageTitle={d.stageTitle}
          >
            {terminalOnly ? null : (
              <>
                {/* The depiction is a FLEX CHILD, not a 100%-height block. Every uv
                    depiction sets height:100% on its own root, and inside the effect
                    pane's flex column that made it claim the whole pane and push the
                    verdict out under `overflow:hidden` — the verdict rendered on every
                    beat and was visible on none of them. Caught by proofing stills, not
                    by reading the code. The pane's budget already reserves the strip. */}
                <div style={{flex: '1 1 auto', minHeight: 0, display: 'flex', minWidth: 0}}>
                  <UvViz
                    kind={d.kind ?? ''}
                    items={(d.stage ?? []).slice(0, 10)}
                    accent={accent}
                    token={d.token}
                  />
                </div>
                <div style={{flex: '0 0 auto'}}>
                  <VizVerdict text={d.verdict} sub={d.verdictSub} color={accent} atWord={d.verdictAtWord} />
                </div>
              </>
            )}
          </CommandStage>
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
