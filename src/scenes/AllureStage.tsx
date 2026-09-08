import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale} from '../ui';
import {CodeStage, CodeLine, StatePane} from '../dsaViz';
import {AllureViz, AllureItem} from '../allureViz';

// ALLURE_STAGE — one beat of the Allure + AI course.
//
// The scene type is a SHELL. The picture lives in src/allureViz.tsx and is chosen by
// `kind`, because the budget a course commits to is the number of distinct PICTURES, not
// the number of registered scene types (LAW 0n corollary).
//
// TWO SHAPES, decided by the data rather than by a flag:
//   · with `lines`  → the code on the left, taught line by line with its plain-English
//     note beneath, and the picture moving beside it on the same words (LAW 0e rule 2).
//   · without       → the picture alone, full width. An empty editor beside a diagram is
//     a pane pretending to be a lesson.
export const AllureStage: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const d = scene.data.allureStage;
  if (!d) return <AbsoluteFill />;

  const accent = (d.color ?? 'blue') as SemColor;
  // Every field is mapped EXPLICITLY, and every new field must be added here too — this
  // mapping is where `parent`/`links`, `out`/`series` and `icon` were each silently
  // dropped on three previous courses (LAW 0n corollary).
  const cells: AllureItem[] = (d.cells ?? []).map((c) => ({
    label: c.label, sub: c.sub, text: c.text, value: c.value,
    icon: c.icon, color: c.color, atWord: c.atWord,
  }));
  const vars = (d.vars ?? []).map((x) => ({label: x.label ?? '', sub: x.sub, atWord: x.atWord}));
  const lines: CodeLine[] = (d.lines ?? []).map((l) => ({
    text: l.text ?? '', note: l.detail, atWord: l.atWord,
  }));

  const picture = <AllureViz kind={d.kind ?? ''} items={cells} accent={accent} vars={cells} />;

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
        {lines.length ? (
          <CodeStage lines={lines} accent={accent} caption={d.caption} codeTitle={d.codeTitle}
                     vars={vars} premise={d.premise}>
            {picture}
          </CodeStage>
        ) : (
          <StatePane caption={d.caption} premise={d.premise} vars={vars} accent={accent}>
            {picture}
          </StatePane>
        )}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
