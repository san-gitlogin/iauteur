import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useTheme, wordToFrame} from '../themes';
import {useScale, useSem, hexA} from '../ui';
import {drawProgress} from '../motion';
import {arriveAt, landAt} from '../motion/system';
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

  // ── VARIANT: savings — WHAT THE CUT IS WORTH, drawn as the gap it opens ───────
  //
  // Owner: *"I asked you to make this more modern. The component needs to be like a line
  // chart which shows the drastic reduction in cost with green lines. You know the drill.
  // Beautiful component with animation."*
  //
  // Two plain polylines are a chart you have to READ: the viewer measures the vertical
  // distance between them by eye, at every x, and only then gets the point. The saving is
  // not a line — it is the AREA BETWEEN the lines, so that is what is drawn: a green wedge
  // that opens as the hours pass, with the old cost as a dim dashed ceiling above it and the
  // new cost as a lit floor below. The wedge IS the argument, and it needs no reading.
  //
  // What moves, and in what order (motion guide: overlap, never queue):
  //   1. the OLD line sweeps in dashed and dim — the ceiling, established first
  //   2. the NEW line draws under it, lit and glowing, on its OWN word (LAW 0i.1)
  //   3. the wedge fills BEHIND the new line as it draws, so the gap opens rather than
  //      appearing — the growth is the animation, not a fade
  //   4. a running read-out rides the head of the sweep with the saving SO FAR, counting
  //      in real values rather than ticking to a final number nobody watched accumulate
  //   5. the total lands last, once both lines are home
  if (variant === 'savings' && data.series.length >= 2) {
    const [was, now] = data.series;
    const cOld = sem(was.color ?? 'orange');
    const cNew = sem(now.color ?? 'green');
    const pOld = was.atWord == null ? p : drawProgress(frame, wordToFrame(was.atWord), {dur: 46});
    const pNew = now.atWord == null ? p : drawProgress(frame, wordToFrame(now.atWord), {dur: 52});
    const m = Math.min(was.values.length, now.values.length);
    const last = m - 1;
    const saved = (was.values[last] ?? 0) - (now.values[last] ?? 0);
    const pct = was.values[last] ? Math.round((saved / was.values[last]) * 100) : 0;
    const unit = data.yUnit ?? '';

    // The head of the sweep, in chart space, so the read-out rides it.
    const headI = Math.min(last, Math.max(0, pNew * last));
    const headX = xAt(headI);
    const lerpAt = (vals: number[], t: number) => {
      const i = Math.floor(t), f = t - i;
      return (vals[i] ?? 0) + ((vals[Math.min(last, i + 1)] ?? 0) - (vals[i] ?? 0)) * f;
    };
    const headOld = lerpAt(was.values, headI);
    const headNew = lerpAt(now.values, headI);

    const oldPts = was.values.slice(0, m).map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ');
    const newPts = now.values.slice(0, m).map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ');
    // The wedge: along the old line out, back along the new line.
    const wedge =
      `M ${xAt(0)},${yAt(was.values[0])} ` +
      was.values.slice(0, m).map((v, i) => `L ${xAt(i)},${yAt(v)}`).join(' ') + ' ' +
      now.values.slice(0, m).map((v, i) => `L ${xAt(i)},${yAt(v)}`).reverse().join(' ') + ' Z';

    // THE TOTAL LANDS ON ITS OWN WORD. The fallback keeps old specs working, but a beat
    // that says "about thirty-seven dollars by the fifth hour" wants the number to arrive
    // exactly there, not 52 frames after a line finished drawing.
    const totalIn = landAt(
      frame,
      data.totalAtWord != null
        ? wordToFrame(data.totalAtWord)
        : wordToFrame(now.atWord ?? data.atWord ?? 1) + 52,
      22,
    );
    const gid = `${clipId}-sv`;
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
        <defs>
          <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hexA(cNew, 0.42)} />
            <stop offset="100%" stopColor={hexA(cNew, 0.04)} />
          </linearGradient>
          <clipPath id={`${gid}-old`}><rect x={0} y={0} width={pad.l + iw * pOld} height={h} /></clipPath>
          <clipPath id={`${gid}-new`}><rect x={0} y={0} width={pad.l + iw * pNew} height={h} /></clipPath>
        </defs>

        {/* gridlines + y axis, in the chart's own quiet register */}
        {Array.from({length: rows + 1}).map((_, r) => {
          const y = pad.t + (ih * r) / rows;
          return (
            <g key={r}>
              <line x1={pad.l} y1={y} x2={pad.l + iw} y2={y}
                stroke={t.colors.panelBorder} strokeWidth={1} opacity={0.5} />
              <text x={pad.l - 12 * scale} y={y + 5 * scale} textAnchor="end"
                fontFamily={t.fonts.mono} fontSize={17 * scale} fill={t.colors.muted}>
                {Math.round(yMax * (1 - r / rows))}{unit}
              </text>
            </g>
          );
        })}
        {xs.map((lab, i) => (
          <text key={i} x={xAt(i)} y={pad.t + ih + 30 * scale} textAnchor="middle"
            fontFamily={t.fonts.mono} fontSize={17 * scale} fill={t.colors.muted}>{lab}</text>
        ))}

        {/* THE SAVING — the whole point of the beat, opening as the new line draws */}
        <g clipPath={`url(#${gid}-new)`}>
          <path d={wedge} fill={`url(#${gid}-fill)`} />
        </g>

        {/* the old cost: a dim dashed ceiling, deliberately recessive */}
        <g clipPath={`url(#${gid}-old)`}>
          <polyline points={oldPts} fill="none" stroke={hexA(cOld, 0.75)}
            strokeWidth={3 * scale} strokeDasharray={`${9 * scale} ${7 * scale}`}
            strokeLinejoin="round" strokeLinecap="round" />
        </g>

        {/* the new cost: lit, solid, and the only glowing thing on the card */}
        <g clipPath={`url(#${gid}-new)`}>
          <polyline points={newPts} fill="none" stroke={cNew} strokeWidth={5 * scale}
            strokeLinejoin="round" strokeLinecap="round"
            style={t.style.glow > 0 ? {filter: `drop-shadow(0 0 ${9 * t.style.glow}px ${hexA(cNew, 0.65)})`} : undefined} />
        </g>

        {/* the head of the sweep: a tick on each line and the gap between them, live */}
        {pNew > 0.02 && pNew < 0.999 ? (
          <g>
            <line x1={headX} y1={yAt(headOld)} x2={headX} y2={yAt(headNew)}
              stroke={hexA(cNew, 0.55)} strokeWidth={2 * scale}
              strokeDasharray={`${3 * scale} ${4 * scale}`} />
            <circle cx={headX} cy={yAt(headNew)} r={7 * scale} fill={cNew}
              stroke={t.colors.bg} strokeWidth={2.5 * scale} />
            <text x={headX + 14 * scale} y={(yAt(headOld) + yAt(headNew)) / 2 + 6 * scale}
              textAnchor="start" fontFamily={t.fonts.mono} fontWeight={700}
              fontSize={26 * scale} fill={cNew} style={{fontVariantNumeric: 'tabular-nums'}}>
              {`\u2212${unit}${(headOld - headNew).toFixed(headOld - headNew < 10 ? 1 : 0)}`}
            </text>
          </g>
        ) : null}

        {/* endpoints, named — so the two ends are readable without the legend */}
        {pOld >= 0.999 ? (
          <text x={xAt(last) - 10 * scale} y={yAt(was.values[last]) - 16 * scale} textAnchor="end"
            fontFamily={t.fonts.mono} fontSize={24 * scale} fill={hexA(cOld, 0.95)}
            style={{fontVariantNumeric: 'tabular-nums'}}>
            {`${unit}${was.values[last]}`}
          </text>
        ) : null}
        {pNew >= 0.999 ? (
          <g>
            <circle cx={xAt(last)} cy={yAt(now.values[last])} r={7 * scale} fill={cNew}
              stroke={t.colors.bg} strokeWidth={2.5 * scale} />
            <text x={xAt(last) - 10 * scale} y={yAt(now.values[last]) + 34 * scale} textAnchor="end"
              fontFamily={t.fonts.mono} fontWeight={700} fontSize={26 * scale} fill={cNew}
              style={{fontVariantNumeric: 'tabular-nums'}}>
              {`${unit}${now.values[last]}`}
            </text>
          </g>
        ) : null}

        {/* the total, landing once both lines are home — a result, not a caption */}
        {totalIn > 0.01 ? (
          <g transform={`translate(${pad.l + iw * 0.5}, ${pad.t + ih * 0.28})`}
             opacity={totalIn} style={{transformOrigin: 'center'}}>
            <text textAnchor="middle" fontFamily={t.fonts.display} fontWeight={800}
              fontSize={(62 * scale) * (0.86 + 0.14 * totalIn)} fill={cNew}
              style={{fontVariantNumeric: 'tabular-nums',
                      filter: t.style.glow > 0 ? `drop-shadow(0 0 ${14 * t.style.glow}px ${hexA(cNew, 0.5)})` : undefined}}>
              {`\u2212${pct}%`}
            </text>
            <text y={34 * scale} textAnchor="middle" fontFamily={t.fonts.mono}
              fontSize={22 * scale} fill={t.colors.muted}>
              {`${unit}${saved.toFixed(saved < 10 ? 2 : 0)} saved over ${xs[last] ?? 'the run'}`}
            </text>
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
