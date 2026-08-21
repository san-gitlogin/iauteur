import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene} from '../types';
import {Headline, SourceFooter, useScale} from '../ui';
import {CodeStage, CodeLine} from '../dsaViz';
import {McpViz, McpItem} from '../mcpViz';

// MCP_WIRE — a JSON-RPC message physically crossing between two named endpoints, with the real envelope readable and the direction of travel unmistakable.
// LEFT: the code, lit line by line with its plain-English note beneath (LAW 0e rule 2).
// RIGHT: the protocol moving, on the same words.
// Timing: every element resolves from its own atWord (LAW 0i). No fixed intervals.
export const McpWire: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const d = scene.data.mcpWire;
  if (!d) return <AbsoluteFill />;

  const lines: CodeLine[] = (d.lines ?? []).map((l) => ({text: l.text ?? '', note: l.detail, atWord: l.atWord}));
  if (!lines.length) return <AbsoluteFill />;
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
        <CodeStage lines={lines} accent={accent} caption={d.caption} codeTitle={d.codeTitle} vars={vars} premise={d.premise}>
          <McpViz kind="wire" items={cells} ends={ends} accent={accent} />
        </CodeStage>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
