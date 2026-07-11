import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {springPop, fadeUp, stackIn} from '../anim';
import {Headline, Kicker, Panel, Pill, SourceFooter, useScale, useSem} from '../ui';

// Reference frame 4: optional token-grid visual + stat cards + verdict pill.
const GRID_COLS = 11;
const GRID_ROWS = 7;
// deterministic "relevant cell" pattern
const isHighlight = (i: number) => (i * 7 + 3) % 13 < 3;

export const StatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={d.headlineColor ?? 'red'} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: vertical ? 'column' : 'row',
          gap: 70 * scale,
          padding: 70 * scale,
        }}
      >
        {d.gridVisual ? (
          <div style={{...springPop(frame, wordToFrame(d.gridVisual.atWord), fps)}}>
            <Panel color="yellow" style={{display: 'flex', flexDirection: 'column', gap: 18 * scale}}>
              <Kicker text={d.gridVisual.kicker} />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${GRID_COLS}, ${30 * scale}px)`,
                  gap: 8 * scale,
                }}
              >
                {Array.from({length: GRID_COLS * GRID_ROWS}).map((_, i) => {
                  const cellIn = interpolate(
                    frame - wordToFrame(d.gridVisual!.atWord) - i * 0.6,
                    [0, 8],
                    [0, 1],
                    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
                  );
                  return (
                    <div
                      key={i}
                      style={{
                        width: 30 * scale,
                        height: 16 * scale,
                        borderRadius: 4 * scale,
                        background: isHighlight(i) ? sem('blue') : sem('yellow'),
                        opacity: cellIn * (isHighlight(i) ? 1 : 0.55),
                      }}
                    />
                  );
                })}
              </div>
              <div style={{fontFamily: t.fonts.mono, fontSize: 24 * scale, color: t.colors.muted}}>
                <span style={{color: sem('yellow')}}>{d.gridVisual.legendA + ' ▮'}</span>
                {'  '}
                <span style={{color: sem('blue')}}>{d.gridVisual.legendB + ' ▮'}</span>
              </div>
            </Panel>
          </div>
        ) : null}
        <div style={{display: 'flex', flexDirection: 'column', gap: 30 * scale}}>
          {stats.map((stat, i) => {
            const start = wordToFrame(stat.atWord);
            const c = stat.color ?? 'red';
            return (
              <div key={i} style={{...stackIn(frame, start, fps)}}>
                <Panel color={c} style={{minWidth: (vertical ? 760 : 560) * scale, display: 'flex', flexDirection: 'column', gap: 10 * scale}}>
                  <Kicker text={stat.kicker} size={20} />
                  <div style={{display: 'flex', alignItems: 'baseline', gap: 18 * scale}}>
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontWeight: 800,
                        fontSize: 66 * scale,
                        color: sem(c),
                        letterSpacing: '-0.02em',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {stat.value}
                    </span>
                    {stat.note ? (
                      <span style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 32 * scale, color: t.colors.text}}>
                        {stat.note}
                      </span>
                    ) : null}
                  </div>
                </Panel>
              </div>
            );
          })}
          {d.verdict ? (
            <div style={{...fadeUp(frame, wordToFrame(d.verdict.atWord), fps)}}>
              <Pill text={d.verdict.text} color={d.verdict.color ?? 'green'} maxWidth={(vertical ? 760 : 560) * scale} />
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
