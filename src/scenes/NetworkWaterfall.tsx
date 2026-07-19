import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA, Kicker} from '../ui';
import {WaterfallRow, LegendRow, phaseColor} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const PHASES = ['blocked', 'dns', 'connect', 'ttfb', 'download'] as const;

// NETWORK_WATERFALL — devtools-style request timing. Time flows left→right in BOTH
// aspects (never rotate the axis; vertical just shows fewer requests). Phase
// segments use the shared NETWORK PHASE MAP; the slowest request is the emphasis
// focus; ms tabular right-aligned; status via StatusBadge; total-time chip top-right.
export const NetworkWaterfall: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.waterfall;
  if (!d) return <AbsoluteFill />;

  const reqs = (d.requests ?? []).slice(0, vertical ? 4 : 6);
  const n = reqs.length;
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const totals = reqs.map((r) => (r.phases ?? []).reduce((a, p) => a + p.ms, 0));
  const maxMs = Math.max(1, ...totals);
  const slowest = totals.indexOf(Math.max(...totals, 0));

  const cardW = (vertical ? 980 : 1360) * scale;
  const pad = 26 * scale;
  const nameW = (vertical ? 200 : 250) * scale;
  const barW = cardW - pad * 2 - nameW - 90 * scale - 120 * scale - 3 * 16 * scale;
  const rowH = (vertical ? 62 : 56) * scale;
  const per = 8;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0, width: cardW, borderRadius: 16 * scale * t.style.cornerRadius, border: `${2 * scale}px solid ${t.colors.panelBorder}`, background: t.colors.panel, overflow: 'hidden'}}>
        {/* header */}
        <div style={{height: 56 * scale, display: 'flex', alignItems: 'center', gap: 12 * scale, padding: `0 ${pad}px`, borderBottom: `${1.5 * scale}px solid ${t.colors.panelBorder}`, background: hexA(t.colors.panelBorder, 0.16)}}>
          <Kicker text="Network" />
          {d.totalMs != null ? <span style={{marginLeft: 'auto', fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 21 * scale, color: t.colors.text, fontVariantNumeric: 'tabular-nums'}}>{Math.round(d.totalMs)} ms total</span> : null}
        </div>
        {/* rows with gridlines behind the bars */}
        <div style={{position: 'relative', padding: `${16 * scale}px ${pad}px`}}>
          <div style={{position: 'absolute', left: pad + nameW + 16 * scale, top: 16 * scale, bottom: 16 * scale, width: barW}}>
            {[0.25, 0.5, 0.75, 1].map((g) => (
              <div key={g} style={{position: 'absolute', left: g * barW, top: 0, bottom: 0, width: 1, background: hexA(t.colors.panelBorder, 0.5)}} />
            ))}
          </div>
          {reqs.map((r, i) => {
            const shown = interpolate(frame, [start + i * per, start + i * per + 3], [0, 1], clamp);
            if (shown <= 0) return null;
            const prog = interpolate(frame, [start + i * per, start + i * per + 18], [0, 1], clamp);
            const emph = i === slowest && frame > start + n * per;
            return (
              <div key={i} style={{height: rowH, display: 'flex', alignItems: 'center', opacity: shown, position: 'relative'}}>
                <WaterfallRow req={r} maxMs={maxMs} barW={barW} nameW={nameW} emphasized={emph} progress={prog} />
              </div>
            );
          })}
        </div>
        {/* phase legend */}
        <div style={{padding: `0 ${pad}px ${18 * scale}px`}}>
          <LegendRow items={PHASES.map((p) => ({label: p, color: phaseColor(t, sem, p)}))} hideOnVertical={false} />
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
