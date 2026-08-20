import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene} from '../types';
import {Headline, SourceFooter, useScale} from '../ui';
import {CommandStage, CmdStep, useStageState} from '../CommandStage';
import {Depiction, VizVerdict} from '../linuxViz';

// CMD_UMOUNT — `umount` on the two-up command stage.
// LEFT: a live terminal types each step on the word it is spoken.
// RIGHT: handle-map — The mount point is drawn with real handle lines running to the processes holding it.
//
// Timing: every element resolves from its own atWord via wordToFrame. Nothing in
// this file or in linuxViz runs on a fixed interval, so the picture moves with the
// voice rather than beside it.
export const CmdUmount: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const d = scene.data.cmdUmount;
  if (!d) return <AbsoluteFill />;

  const raw = (d.steps ?? []).slice(0, 4);
  if (!raw.length) return <AbsoluteFill />;
  const steps: CmdStep[] = raw.map((s) => ({
    cmd: s.label ?? '',
    // Real multi-line output when the author supplied it; the old two-line
    // text/sub pair remains the fallback for un-migrated scenes.
    output: (s.out?.length ? s.out : [s.text, s.sub].filter(Boolean)) as string[],
    note: s.detail,
    atWord: s.atWord,
  }));
  const state = useStageState(steps);
  const accent = (d.color ?? "blue") as any;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={accent} /> : null}
      {/* Placed BELOW the headline band explicitly: the headline is absolutely
          positioned, so a margin on a flex child would not clear it. */}
      <div
        style={{
          position: 'absolute',
          top: (d.headline ? (vertical ? 340 : 212) : 90) * scale,
          left: (vertical ? 52 : 72) * scale,
          right: (vertical ? 52 : 72) * scale,
          height: (vertical ? 1180 : 620) * scale,
          display: 'flex',
          minHeight: 0,
        }}
      >
        <CommandStage
          steps={steps}
          state={state}
          promptLabel={d.promptLabel}
          cwd={d.cwd}
          color={accent}
          highlight={d.highlight}
          stageTitle={d.stageTitle ?? "what happens"}
        >
          <Depiction
            kind={"handle-map"}
            items={(d.stage ?? []).slice(0, 10)}
            accent={accent}
            perms={d.perms}
            permsAtWord={d.permsAtWord}
            token={d.token}
          />
          <VizVerdict text={d.verdict} sub={d.verdictSub} color={accent} atWord={d.verdictAtWord} />
        </CommandStage>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
