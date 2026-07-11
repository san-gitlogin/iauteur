import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// WATERFALL — a cumulative bridge chart: a start total, then signed deltas that
// float at the running total (green up / red down), optionally a subtotal/final
// total column. Dashed connectors bridge each bar to the next. Bars grow in on
// atWord. Bars fit a width budget so 7 columns never overflow (fit-row-to-budget).
export const WaterfallChart: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.waterfallChart;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const bars = (d.bars ?? []).slice(0, 7);
  const n = bars.length;

  // running totals + per-bar [yLow, yHigh] in value space
  let run = 0;
  const segs = bars.map((b, i) => {
    if (b.isTotal) {
      const abs = i === 0 ? b.value : run; // first total = start value; later total = running sum
      run = abs;
      return {lo: 0, hi: abs, delta: abs, total: true, up: true};
    }
    const before = run;
    run = run + b.value;
    return {lo: Math.min(before, run), hi: Math.max(before, run), delta: b.value, total: false, up: b.value >= 0};
  });
  const maxV = Math.max(1, ...segs.map((s) => s.hi));

  // geometry (fit to a width budget)
  const chartW = (vertical ? 940 : 1560) * scale;
  const chartH = (vertical ? 900 : 620) * scale;
  const gap = (vertical ? 16 : 22) * scale;
  const barW = Math.min((vertical ? 120 : 150) * scale, (chartW - gap * (n - 1)) / n);
  const stepX = barW + gap;
  const groupW = n * barW + gap * (n - 1);
  // reserve headroom at the top of the plot for the tallest bar's value label so it
  // never pokes above the chart into the headline band (tall-headline class; the neo
  // headline is taller — W-1). Bars + y-scale use plotH, not the full chartH.
  const plotH = chartH - 48 * scale;
  const y = (v: number) => chartH - (v / maxV) * plotH;

  const accent = d.color ?? 'blue';

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? accent} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 150 : 80) * scale}}>
        <div style={{position: 'relative', width: groupW, height: chartH + 90 * scale}}>
          {/* baseline */}
          <div style={{position: 'absolute', left: 0, right: 0, top: chartH, height: 2 * scale, background: hexA(t.colors.muted, 0.5)}} />
          <svg width={groupW} height={chartH + 90 * scale} viewBox={`0 0 ${groupW} ${chartH + 90 * scale}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            {segs.map((s, i) => {
              if (i === n - 1) return null;
              const rv = interpolate(frame - wordToFrame(bars[i].atWord ?? i + 1), [8, 20], [0, 1], clamp);
              if (rv < 0.01) return null;
              const x2 = (i + 1) * stepX;
              const yb = y(s.total ? s.hi : (bars[i].value >= 0 ? s.hi : s.lo));
              return <line key={i} x1={i * stepX + barW} y1={yb} x2={x2} y2={yb} stroke={hexA(t.colors.muted, 0.7)} strokeWidth={2 * scale} strokeDasharray={`${5 * scale} ${5 * scale}`} opacity={rv} />;
            })}
          </svg>
          {segs.map((s, i) => {
            const b = bars[i];
            const start = wordToFrame(b.atWord ?? i + 1);
            const rv = spring({frame: frame - start, fps, config: {damping: 200}});
            const grow = interpolate(rv, [0, 1], [0, 1], {...clamp, easing: Easing.bezier(0.4, 0, 0.2, 1)});
            const c = sem(b.color ?? (s.total ? accent : s.up ? 'green' : 'red'));
            const top = y(s.hi);
            const h = Math.max(3 * scale, ((s.hi - s.lo) / maxV) * plotH) * grow;
            const x = i * stepX;
            const valTxt = (s.total ? '' : s.up ? '+' : '\u2212') + Math.abs(s.total ? s.hi : s.delta).toLocaleString() + (d.unit ?? '');
            return (
              <div key={i}>
                {/* bar */}
                <div style={{position: 'absolute', left: x, top: top + (((s.hi - s.lo) / maxV) * plotH) * (1 - grow), width: barW, height: h, background: `linear-gradient(180deg, ${hexA(c, 0.96)}, ${hexA(c, 0.7)})`, borderRadius: 6 * scale * t.style.cornerRadius, boxShadow: t.style.glow > 0 ? `0 0 ${14 * t.style.glow}px ${hexA(c, 0.4)}` : undefined, opacity: rv}} />
                {/* value label above bar */}
                <div style={{position: 'absolute', left: x, top: top - 34 * scale, width: barW, textAlign: 'center', fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 20 * scale, color: c, fontVariantNumeric: 'tabular-nums', opacity: rv, whiteSpace: 'nowrap'}}>{valTxt}</div>
                {/* x label below baseline */}
                <div style={{position: 'absolute', left: x - gap / 2, top: chartH + 14 * scale, width: barW + gap, textAlign: 'center', fontFamily: t.fonts.body, fontSize: 19 * scale, color: t.colors.text, opacity: rv, lineHeight: 1.1}}>{b.label}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
