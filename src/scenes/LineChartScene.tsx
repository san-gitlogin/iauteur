import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene} from '../types';
import {useTheme} from '../themes';
import {Headline, SourceFooter, useScale, useSem} from '../ui';
import {LineChart} from '../charts';

// LINE_CHART — trends over time (1-3 series), optional area fill + legend.
export const LineChartScene: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const w = (vertical ? 940 : 1440) * scale;
  const h = (vertical ? 820 : 600) * scale;
  const series = d.lineChart?.series ?? [];
  const CYCLE = ['blue', 'purple', 'green'] as const;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={d.headlineColor ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 * scale, paddingTop: (vertical ? 120 : 70) * scale}}>
        {d.lineChart ? <LineChart data={d.lineChart} w={w} h={h} /> : null}
        {series.length > 1 ? (
          <div style={{display: 'flex', gap: 36 * scale, flexWrap: 'wrap', justifyContent: 'center'}}>
            {series.map((s, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
                <div style={{width: 22 * scale, height: 6 * scale, borderRadius: 3, background: sem(s.color ?? CYCLE[i % 3])}} />
                <span style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: t.colors.muted}}>{s.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
