import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene} from '../types';
import {Headline, SourceFooter, useScale} from '../ui';
import {CodeStage, AlgoViz, CodeLine, VizCell} from '../dsaViz';

// DSA_TRACE_GRID — a grid where distance from the start IS the colour, so the frontier spreads a ring at a time and walls stay solid.
// LEFT: the code, lit line by line with its plain-English note beneath (LAW 0e rule 2).
// RIGHT: the live state, moving on the same words.
// Timing: every element resolves from its own atWord (LAW 0i). No fixed intervals.
export const DsaTraceGrid: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const d = scene.data.dsaGrid;
  if (!d) return <AbsoluteFill />;

  const lines: CodeLine[] = (d.lines ?? []).map((l) => ({text: l.text ?? '', note: l.detail, atWord: l.atWord}));
  if (!lines.length) return <AbsoluteFill />;
  const cells: VizCell[] = (d.cells ?? []).map((c) => ({
    label: c.label, sub: c.sub, value: c.value, color: c.color, atWord: c.atWord, state: c.text,
    // topology + role label must survive the mapping, or a declared edge is
    // silently dropped and the shape falls back to a guess (LAW 0k)
    parent: c.parent, links: c.links, tag: c.tag,
  }));
  // the second column: the structure the input is building
  const aux: VizCell[] = (d.aux ?? []).map((c) => ({
    label: c.label, sub: c.sub, value: c.value, color: c.color, atWord: c.atWord, state: c.text,
    // topology + role label must survive the mapping, or a declared edge is
    // silently dropped and the shape falls back to a guess (LAW 0k)
    parent: c.parent, links: c.links, tag: c.tag,
  }));
  const pointers = (d.pointers ?? []).map((p) => ({label: p.label ?? '', at: p.value ?? 0, color: p.color, atWord: p.atWord}));
  const vars = (d.vars ?? []).map((x) => ({label: x.label ?? '', sub: x.sub, atWord: x.atWord}));
  const accent = (d.color ?? "blue") as any;

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
          <AlgoViz kind="grid" cells={cells} aux={aux} pointers={pointers} accent={accent} />
        </CodeStage>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
