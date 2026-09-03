import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useTheme, wordToFrame} from '../themes';
import {useScale, useSem, hexA} from '../ui';
import {drawProgress} from '../motion';
import {LineChartData, SemColor} from '../types';

const CYCLE: SemColor[] = ['blue', 'purple', 'green'];

// Animated line / area chart. Draws 1-3 series over a shared x-axis; the line
// "draws in" left-to-right via a growing clip, points pop as the sweep passes.
export const LineChart: React.FC<{data: LineChartData; w: number; h: number}> = ({data, w, h}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const start = wordToFrame(data.atWord);
  const p = drawProgress(frame, start, {dur: 46});

  const pad = {l: 56 * scale, r: 26 * scale, t: 22 * scale, b: 48 * scale};
  const iw = Math.max(1, w - pad.l - pad.r);
  const ih = Math.max(1, h - pad.t - pad.b);
  const xs = data.xAxis ?? [];
  const n = Math.max(...data.series.map((s) => s.values.length), 1);
  const allVals = data.series.flatMap((s) => s.values);
  const yMax = data.yMax ?? Math.max(1, ...allVals) * 1.12;

  const xAt = (i: number) => pad.l + (n <= 1 ? iw / 2 : iw * (i / (n - 1)));
  const yAt = (v: number) => pad.t + ih * (1 - v / yMax);

  const rows = 4;
  const clipId = `lc-${Math.round(w)}-${Math.round(h)}`;
  const variant = data.variant;

  // ── VARIANT: sparkline — compact trend, no axes/gridlines/labels, subtle area,
  // a single end dot + end value. Uses the FIRST series only. ──────────────────
  if (variant === 'sparkline') {
    const s0 = data.series[0] ?? {values: [], color: 'blue' as SemColor, label: ''};
    const c = sem(s0.color ?? 'blue');
    const vmax = Math.max(1, ...s0.values) * 1.08;
    const vmin = Math.min(0, ...s0.values);
    const rng = vmax - vmin || 1;
    const sp = {l: 24 * scale, r: 120 * scale, t: 26 * scale, b: 26 * scale};
    const siw = Math.max(1, w - sp.l - sp.r);
    const sih = Math.max(1, h - sp.t - sp.b);
    const m = Math.max(1, s0.values.length - 1);
    const sx = (i: number) => sp.l + (s0.values.length <= 1 ? siw / 2 : siw * (i / m));
    const sy = (v: number) => sp.t + sih * (1 - (v - vmin) / rng);
    const pts = s0.values.map((v, i) => `${sx(i)},${sy(v)}`).join(' ');
    const area = `M ${sx(0)},${sp.t + sih} ` + s0.values.map((v, i) => `L ${sx(i)},${sy(v)}`).join(' ') + ` L ${sx(s0.values.length - 1)},${sp.t + sih} Z`;
    const li = s0.values.length - 1;
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
        <defs>
          <clipPath id={clipId}><rect x={0} y={0} width={sp.l + siw * p} height={h} /></clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <path d={area} fill={hexA(c, 0.16)} />
          <polyline points={pts} fill="none" stroke={c} strokeWidth={4 * scale} strokeLinejoin="round" strokeLinecap="round"
            style={t.style.glow > 0 ? {filter: `drop-shadow(0 0 ${6 * t.style.glow}px ${hexA(c, 0.5)})`} : undefined} />
        </g>
        {p >= 0.999 && li >= 0 ? (
          <g>
            <circle cx={sx(li)} cy={sy(s0.values[li])} r={7 * scale} fill={c} stroke={t.colors.bg} strokeWidth={2 * scale} />
            <text x={sx(li) + 16 * scale} y={sy(s0.values[li]) + 8 * scale} textAnchor="start" fontFamily={t.fonts.display} fontWeight={800} fontSize={34 * scale} fill={c} style={{fontVariantNumeric: 'tabular-nums'}}>{Math.round(s0.values[li])}{data.yUnit ?? ''}</text>
          </g>
        ) : null}
      </svg>
    );
  }

  // ── VARIANT: dualaxis — two series on independent y-scales; left axis + labels
  // in series[0]'s colour, right axis + labels in series[1]'s (dashed line). ────
  if (variant === 'dualaxis') {
    const s0 = data.series[0];
    const s1 = data.series[1] ?? data.series[0];
    const c0 = sem(s0.color ?? 'blue');
    const c1 = sem(s1.color ?? 'orange');
    const max0 = data.yMax ?? Math.max(1, ...s0.values) * 1.12;
    const max1 = Math.max(1, ...s1.values) * 1.12;
    const dp = {l: 64 * scale, r: 70 * scale, t: 22 * scale, b: 48 * scale};
    const diw = Math.max(1, w - dp.l - dp.r);
    const dih = Math.max(1, h - dp.t - dp.b);
    const nn = Math.max(s0.values.length, s1.values.length, 2);
    const dx = (i: number) => dp.l + diw * (i / (nn - 1));
    const y0 = (v: number) => dp.t + dih * (1 - v / max0);
    const y1 = (v: number) => dp.t + dih * (1 - v / max1);
    const pts0 = s0.values.map((v, i) => `${dx(i)},${y0(v)}`).join(' ');
    const pts1 = s1.values.map((v, i) => `${dx(i)},${y1(v)}`).join(' ');
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
        <defs>
          <clipPath id={clipId}><rect x={0} y={0} width={dp.l + diw * p} height={h} /></clipPath>
        </defs>
        {Array.from({length: rows + 1}).map((_, r) => {
          const yy = dp.t + (dih * r) / rows;
          return (
            <g key={r}>
              <line x1={dp.l} y1={yy} x2={dp.l + diw} y2={yy} stroke={t.colors.panelBorder} strokeWidth={1} opacity={0.6} />
              <text x={dp.l - 12 * scale} y={yy + 5 * scale} textAnchor="end" fontFamily={t.fonts.mono} fontSize={18 * scale} fill={c0}>{Math.round(max0 * (1 - r / rows))}{data.yUnit ?? ''}</text>
              <text x={dp.l + diw + 12 * scale} y={yy + 5 * scale} textAnchor="start" fontFamily={t.fonts.mono} fontSize={18 * scale} fill={c1}>{Math.round(max1 * (1 - r / rows))}{data.y2Unit ?? ''}</text>
            </g>
          );
        })}
        {(data.xAxis ?? []).map((lab, i) => (
          <text key={i} x={dx(i)} y={dp.t + dih + 30 * scale} textAnchor="middle" fontFamily={t.fonts.mono} fontSize={18 * scale} fill={t.colors.muted}>{lab}</text>
        ))}
        <g clipPath={`url(#${clipId})`}>
          <polyline points={pts0} fill="none" stroke={c0} strokeWidth={3.5 * scale} strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={pts1} fill="none" stroke={c1} strokeWidth={3.5 * scale} strokeDasharray={`${8 * scale} ${6 * scale}`} strokeLinejoin="round" strokeLinecap="round" />
        </g>
        {[{s: s0, yf: y0, c: c0}, {s: s1, yf: y1, c: c1}].map(({s, yf, c}, si) =>
          s.values.map((v, i) => {
            const xf = i / (nn - 1);
            return p >= xf - 0.001 ? <circle key={`${si}-${i}`} cx={dx(i)} cy={yf(v)} r={5 * scale} fill={c} stroke={t.colors.bg} strokeWidth={2 * scale} /> : null;
          }),
        )}
      </svg>
    );
  }

  const forceArea = variant === 'compound' || data.area;
  // compound growth badge: how many × the first value the last value is (series[0]).
  const g0 = data.series[0]?.values ?? [];
  const compMult = variant === 'compound' && g0.length >= 2 && g0[0] > 0 ? g0[g0.length - 1] / g0[0] : null;

  // ── ONE SWEEP PER SERIES, EACH ON ITS OWN SPOKEN WORD ────────────────────────
  //
  // Every series used to share the chart's single `p`, so a two-line comparison drew both
  // lines at the same instant while the narration was still introducing the first one.
  // That is the fixed-interval failure LAW 0i.1 names: the picture has to move with the
  // voice, and "the voice" means the word for THIS line, not for the chart.
  //
  // A series with no `atWord` falls back to the chart's, so every existing spec draws
  // exactly as it did. The clip rect is per-series, so the sweeps are independent.
  const progressFor = (si: number) => {
    const own = data.series[si]?.atWord;
    if (own == null) return p;
    return drawProgress(frame, wordToFrame(own), {dur: 46});
  };

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={pad.l + iw * p} height={h} />
        </clipPath>
        {data.series.map((_, si) => (
          <clipPath key={si} id={`${clipId}-s${si}`}>
            <rect x={0} y={0} width={pad.l + iw * progressFor(si)} height={h} />
          </clipPath>
        ))}
      </defs>
      {/* gridlines + y labels */}
      {Array.from({length: rows + 1}).map((_, r) => {
        const y = pad.t + (ih * r) / rows;
        const val = yMax * (1 - r / rows);
        return (
          <g key={r}>
            <line
              x1={pad.l}
              y1={y}
              x2={pad.l + iw}
              y2={y}
              stroke={t.colors.panelBorder}
              strokeWidth={1}
              opacity={0.6}
            />
            <text
              x={pad.l - 12 * scale}
              y={y + 5 * scale}
              textAnchor="end"
              fontFamily={t.fonts.mono}
              fontSize={18 * scale}
              fill={t.colors.muted}
            >
              {Math.round(val)}
              {data.yUnit ?? ''}
            </text>
          </g>
        );
      })}
      {/* x labels */}
      {xs.map((lab, i) => (
        <text
          key={i}
          x={xAt(i)}
          y={pad.t + ih + 30 * scale}
          textAnchor="middle"
          fontFamily={t.fonts.mono}
          fontSize={18 * scale}
          fill={t.colors.muted}
        >
          {lab}
        </text>
      ))}
      {/* series — each inside ITS OWN clip, so each draws on its own word */}
      <g>
        {data.series.map((s, si) => {
          const c = sem(s.color ?? CYCLE[si % CYCLE.length]);
          const ff = data.forecastFrom;
          // FORECAST_BAND: split into solid history + dashed forecast with a band.
          if (ff != null && ff >= 0 && ff < s.values.length - 1) {
            const bandPct = data.bandPct ?? 0.18;
            const histPts = s.values.slice(0, ff + 1).map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ');
            const fcPts = s.values.slice(ff).map((v, i) => `${xAt(ff + i)},${yAt(v)}`).join(' ');
            const span = Math.max(1, s.values.length - 1 - ff);
            const upper = s.values.slice(ff).map((v, i) => {
              const grow = (i / span) * bandPct * yMax;
              return `${xAt(ff + i)},${yAt(Math.min(yMax, v + grow))}`;
            });
            const lower = s.values.slice(ff).map((v, i) => {
              const grow = (i / span) * bandPct * yMax;
              return `${xAt(ff + i)},${yAt(Math.max(0, v - grow))}`;
            }).reverse();
            return (
              <g key={si} clipPath={`url(#${clipId}-s${si})`}>
                <polygon points={[...upper, ...lower].join(' ')} fill={hexA(c, 0.14)} />
                <polyline points={histPts} fill="none" stroke={c} strokeWidth={3.5 * scale} strokeLinejoin="round" strokeLinecap="round" />
                <polyline points={fcPts} fill="none" stroke={c} strokeWidth={3.5 * scale} strokeDasharray={`${8 * scale} ${7 * scale}`} strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
              </g>
            );
          }
          const pts = s.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ');
          const areaPath =
            `M ${xAt(0)},${pad.t + ih} ` +
            s.values.map((v, i) => `L ${xAt(i)},${yAt(v)}`).join(' ') +
            ` L ${xAt(s.values.length - 1)},${pad.t + ih} Z`;
          return (
            <g key={si} clipPath={`url(#${clipId}-s${si})`}>
              {forceArea ? <path d={areaPath} fill={hexA(c, 0.16)} /> : null}
              <polyline
                points={pts}
                fill="none"
                stroke={c}
                strokeWidth={3.5 * scale}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </g>
      {/* FORECAST_BAND "now" hairline */}
      {data.forecastFrom != null && data.forecastFrom < n ? (
        <g>
          <line x1={xAt(data.forecastFrom)} y1={pad.t} x2={xAt(data.forecastFrom)} y2={pad.t + ih} stroke={t.colors.text} strokeWidth={2 * scale} strokeDasharray={`${3 * scale} ${5 * scale}`} opacity={0.7} />
          <text x={xAt(data.forecastFrom)} y={pad.t - 6 * scale} textAnchor="middle" fontFamily={t.fonts.mono} fontSize={17 * scale} fill={t.colors.muted}>{data.nowLabel ?? 'now'}</text>
        </g>
      ) : null}
      {/* points that reveal as the sweep passes their x */}
      {data.series.map((s, si) => {
        const c = sem(s.color ?? CYCLE[si % CYCLE.length]);
        const ps = progressFor(si);
        return s.values.map((v, i) => {
          const xf = n <= 1 ? 0 : i / (n - 1);
          const shown = ps >= xf - 0.001;
          return shown ? (
            <circle key={`${si}-${i}`} cx={xAt(i)} cy={yAt(v)} r={5 * scale} fill={c} stroke={t.colors.bg} strokeWidth={2 * scale} />
          ) : null;
        });
      })}
      {/* compound-growth badge: last is ×N the first (series[0]) */}
      {compMult != null && p >= 0.999 ? (
        <g>
          <text x={xAt(g0.length - 1)} y={yAt(g0[g0.length - 1]) - 18 * scale} textAnchor="end" fontFamily={t.fonts.display} fontWeight={800} fontSize={40 * scale} fill={sem(data.series[0]?.color ?? 'green')} style={{fontVariantNumeric: 'tabular-nums'}}>×{compMult.toFixed(1)}
          </text>
        </g>
      ) : null}
    </svg>
  );
};
