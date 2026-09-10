import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale} from '../ui';
import {StatePane} from '../dsaViz';
import {AppleViz, AppleItem} from '../appleViz';

// APPLE_STAGE — one beat of the September 2026 Apple series.
//
// The scene type is a SHELL. The picture lives in src/appleViz.tsx and is chosen by
// `kind`, because the budget a series commits to is the number of distinct PICTURES, not
// the number of registered scene types (LAW 0n corollary).
//
// No code-pane shape here, deliberately. The Allure and uv stages carry one because those
// courses teach code; a product beat does not, and an empty editor beside a diagram is a
// pane pretending to be a lesson.
export const AppleStage: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const d = scene.data.appleStage;
  if (!d) return <AbsoluteFill />;

  const accent = (d.color ?? 'blue') as SemColor;
  // Every field is mapped EXPLICITLY, and every new field must be added here too — this
  // mapping is where `parent`/`links`, `out`/`series` and `icon` were each silently
  // dropped on three previous courses (LAW 0n corollary).
  const cells: AppleItem[] = (d.cells ?? []).map((c) => ({
    label: c.label, sub: c.sub, text: c.text, value: c.value,
    icon: c.icon, color: c.color, atWord: c.atWord,
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
        <StatePane caption={d.caption} premise={d.premise} vars={vars} accent={accent}>
          <AppleViz kind={d.kind ?? ''} items={cells} accent={accent} token={d.token} />
        </StatePane>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
