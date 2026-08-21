import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene} from '../types';
import {Headline, SourceFooter, useScale, hexA} from '../ui';
import {SoloStage, AlgoViz, VizCell, useViz} from '../dsaViz';

// DSA_SIGNALS — the words lifted straight out of a problem statement, each one pointing at the pattern it gives away.
// No code pane: this beat has nothing to read line by line.
// Timing: every element resolves from its own atWord (LAW 0i). No fixed intervals.
export const DsaSignals: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const d = scene.data.dsaSignals;
  // hooks run before any early return, or the hook order changes between renders
  const accent = (d?.color ?? 'yellow') as any;
  const v = useViz(accent);
  if (!d) return <AbsoluteFill />;

  const cells: VizCell[] = (d.cells ?? []).map((c) => ({
    label: c.label, sub: c.sub, value: c.value, color: c.color, atWord: c.atWord, state: c.text,
    // topology + role label must survive the mapping, or a declared edge is
    // silently dropped and the shape falls back to a guess (LAW 0k)
    parent: c.parent, links: c.links, tag: c.tag,
  }));
  const vars = (d.vars ?? []).map((x) => ({label: x.label ?? '', sub: x.sub, atWord: x.atWord}));

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
          <div style={{display: 'flex', flexDirection: 'column', gap: 16 * scale, width: '100%'}}>
            {/* THE QUESTION, on screen the whole time the words are being circled.
                Not anchored: it is the source text, so it is there from frame one. */}
            {d.problem ? (
              <div
                style={{
                  borderLeft: `${4 * scale}px solid ${hexA(v.a, 0.85)}`,
                  background: hexA(v.a, 0.08),
                  borderRadius: 8 * scale,
                  padding: `${16 * scale}px ${20 * scale}px`,
                  // explicit family + colour: an unstyled block inherits the browser
                  // serif default and the muted panel colour, which is what shipped
                  ...v.body(vertical ? 25 : 23),
                  color: v.t.colors.text,
                  lineHeight: 1.5,
                  fontWeight: 500,
                }}
              >
                {d.problem}
              </div>
            ) : null}
            <AlgoViz kind="signal-match" cells={cells} accent={accent} />
          </div>
        </SoloStage>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
