import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene} from '../types';
import {Headline, SourceFooter, useScale} from '../ui';
import {CommandStage, CmdStep, useStageState} from '../CommandStage';
import {McpViz, McpItem} from '../mcpViz';

// MCP_TERMINAL — a real shell session — install, run, and the server actually starting — with verbatim output rather than an invented one-liner (LAW 0m).
// LEFT: a live shell that types each command on the word it is spoken and prints
// the REAL output line by line. RIGHT: what the run produced.
export const McpTerminal: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const d = scene.data.mcpTerm;
  if (!d) return <AbsoluteFill />;
  const raw = (d.steps ?? []).slice(0, 4);
  const steps: CmdStep[] = raw.map((s) => ({
    cmd: s.label ?? '',
    output: (s.out?.length ? s.out : [s.text, s.sub].filter(Boolean)) as string[],
    note: s.detail,
    atWord: s.atWord,
  }));
  const state = useStageState(steps);
  const cells: McpItem[] = (d.cells ?? []).map((c) => ({
    label: c.label, sub: c.sub, value: c.value, color: c.color, atWord: c.atWord,
    text: c.text, owner: c.owner, dir: c.dir, out: c.out,
  }));
  const accent = (d.color ?? "green") as any;
  if (!steps.length) return <AbsoluteFill />;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={accent} /> : null}
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
          stageTitle={d.stageTitle ?? 'what the run produced'}
        >
          <McpViz kind="control-board" items={cells} accent={accent} />
        </CommandStage>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
