import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem} from '../ui';
import {Donut} from '../charts';

const CYCLE = ['blue', 'purple', 'green', 'orange', 'yellow', 'red'] as const;

// DONUT — parts of a whole, with a legend that lists each segment + value.
export const DonutScene: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const segs = d.donut?.segments ?? [];
  const size = (vertical ? 560 : 520) * scale;

  const legend = (
    <div style={{display: 'flex', flexDirection: 'column', gap: 18 * scale}}>
      {segs.map((s, i) => {
        const c = sem(s.color ?? CYCLE[i % CYCLE.length]);
        const shown = frame >= wordToFrame(s.atWord);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14 * scale, opacity: shown ? 1 : 0.25}}>
            <div style={{width: 20 * scale, height: 20 * scale, borderRadius: 5 * scale, background: c}} />
            <span style={{fontFamily: t.fonts.body, fontSize: 30 * scale, color: t.colors.text}}>{s.label}</span>
            <span style={{fontFamily: t.fonts.mono, fontSize: 30 * scale, color: c, marginLeft: 'auto', fontVariantNumeric: 'tabular-nums'}}>{s.value}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={d.headlineColor ?? 'purple'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: (vertical ? 30 : 70) * scale, paddingTop: (vertical ? 120 : 60) * scale}}>
        {d.donut ? <Donut data={d.donut} size={size} /> : null}
        <div style={{minWidth: (vertical ? 500 : 380) * scale}}>{legend}</div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
