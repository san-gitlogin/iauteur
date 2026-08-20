import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene} from '../types';
import {Headline, SourceFooter, useScale} from '../ui';
import {CodeStage, CodeLine} from '../dsaViz';
import {McpViz, McpItem} from '../mcpViz';

// MCP_ROOTS — allowed folders as keycards and a requested path checked against them, where a refusal is something you watch happen.
// LEFT: the code, lit line by line with its plain-English note beneath (LAW 0e rule 2).
// RIGHT: the protocol moving, on the same words.
// Timing: every element resolves from its own atWord (LAW 0i). No fixed intervals.
export const McpRoots: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const d = scene.data.mcpRoots;
  if (!d) return <AbsoluteFill />;

  const lines: CodeLine[] = (d.lines ?? []).map((l) => ({text: l.text ?? '', note: l.detail, atWord: l.atWord}));
  if (!lines.length) return <AbsoluteFill />;
  const cells: McpItem[] = (d.cells ?? []).map((c) => ({
    label: c.label, sub: c.sub, value: c.value, color: c.color, atWord: c.atWord,
    text: c.text, owner: c.owner, dir: c.dir, out: c.out,
  }));
  const ends = (d.ends ?? []).map((e) => e.label ?? '');
  const vars = (d.vars ?? []).map((x) => ({label: x.label ?? '', sub: x.sub, atWord: x.atWord}));
  const accent = (d.color ?? "red") as any;

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
        <CodeStage lines={lines} accent={accent} caption={d.caption} codeTitle={d.codeTitle} vars={vars} premise={d.premise}>
          <McpViz kind="root-gate" items={cells} ends={ends} accent={accent} />
        </CodeStage>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
