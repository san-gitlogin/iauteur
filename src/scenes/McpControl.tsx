import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene} from '../types';
import {Headline, SourceFooter, useScale} from '../ui';
import {SoloStage} from '../dsaViz';
import {McpViz, McpItem} from '../mcpViz';

// MCP_CONTROL — the three primitives as three lanes, each stamped with WHO pulls the trigger — the AI, your code, or the user — because "who is in control" is the entire distinction.
// No code pane: this beat has nothing to read line by line.
// Timing: every element resolves from its own atWord (LAW 0i). No fixed intervals.
export const McpControl: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const d = scene.data.mcpControl;
  if (!d) return <AbsoluteFill />;

  const cells: McpItem[] = (d.cells ?? []).map((c) => ({
    label: c.label, sub: c.sub, value: c.value, color: c.color, atWord: c.atWord,
    text: c.text, owner: c.owner, dir: c.dir, out: c.out,
    // icon MUST survive this mapping — dropping a new field here is the same defect
    // that silently discarded parent/links on the DSA cut (LAW 0k corollary).
    icon: c.icon,
  }));
  const ends = (d.ends ?? []).map((e) => e.label ?? '');
  const vars = (d.vars ?? []).map((x) => ({label: x.label ?? '', sub: x.sub, atWord: x.atWord}));
  const accent = (d.color ?? "blue") as any;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={accent} /> : null}
      <div
        style={{
          position: 'absolute',
          top: (d.headline ? (vertical ? 322 : 212) : 90) * scale,
          left: (vertical ? 52 : 72) * scale,
          right: (vertical ? 52 : 72) * scale,
          height: (vertical ? 1364 : 620) * scale,
          display: 'flex',
          minHeight: 0,
        }}
      >
        <SoloStage accent={accent} caption={d.caption} vars={vars} premise={d.premise}>
          <McpViz kind="control-board" items={cells} ends={ends} accent={accent} />
        </SoloStage>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
