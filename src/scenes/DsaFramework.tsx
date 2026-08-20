import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene} from '../types';
import {Headline, SourceFooter, useScale} from '../ui';
import {SoloStage, AlgoViz, VizCell} from '../dsaViz';

// DSA_FRAMEWORK — the six-step method as a ladder, one rung lit at a time, each rung stepping further right than the last.
// No code pane: this beat has nothing to read line by line.
// Timing: every element resolves from its own atWord (LAW 0i). No fixed intervals.
export const DsaFramework: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const d = scene.data.dsaFramework;
  if (!d) return <AbsoluteFill />;

  const cells: VizCell[] = (d.cells ?? []).map((c) => ({
    label: c.label, sub: c.sub, value: c.value, color: c.color, atWord: c.atWord, state: c.text,
    // topology + role label must survive the mapping, or a declared edge is
    // silently dropped and the shape falls back to a guess (LAW 0k)
    parent: c.parent, links: c.links, tag: c.tag,
  }));
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
        <SoloStage accent={accent} caption={d.caption} vars={vars} premise={d.premise}>
          <AlgoViz kind="framework" cells={cells} accent={accent} />
        </SoloStage>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
