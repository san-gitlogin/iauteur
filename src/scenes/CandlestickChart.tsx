import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// CANDLESTICK — an OHLC financial chart: 5–30 candles (body open→close, green up /
// red down; high-low wick), an optional moving-average overlay line, a left price
// axis with gridlines and a sparse bottom label row. Candles reveal left→right.
// Candle spacing fits a width budget so 30 columns never overflow (fit-row-to-budget).
export const CandlestickChart: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.candlestick;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const candles = (d.candles ?? []).slice(0, 30);
  const n = candles.length;
  if (n < 2) return <AbsoluteFill style={{background: t.colors.bg}} />;
  const ma = d.ma ?? [];

  // price range with a little headroom
  const rawLo = Math.min(...candles.map((c) => c.low));
  const rawHi = Math.max(...candles.map((c) => c.high));
  const pad = (rawHi - rawLo) * 0.08 || 1;
  const lo = rawLo - pad;
  const hi = rawHi + pad;

  const marginLeft = (vertical ? 96 : 108) * scale;
  const marginBottom = 40 * scale;
  const marginTop = 18 * scale; // headroom so the top price-axis label isn't clipped (C-1)
  const plotW = (vertical ? 860 : 1480) * scale;
  const plotH = (vertical ? 860 : 600) * scale;
  const svgW = marginLeft + plotW;
  const svgH = marginTop + plotH + marginBottom;

  const gap = Math.max(2 * scale, ((vertical ? 12 : 16) * scale));
  const step = plotW / n;
  const candleW = Math.min((vertical ? 34 : 40) * scale, step - gap);
  const bodyW = candleW;
  const xc = (i: number) => marginLeft + i * step + step / 2;
  const y = (p: number) => marginTop + plotH * (1 - (p - lo) / (hi - lo));

  const fmt = (p: number) => (d.prefix ?? '') + (Math.round(p * 100) / 100).toLocaleString() + (d.unit ?? '');
  const grid = 4;
  const accent = sem(d.color ?? 'blue');
  const up = sem(d.upColor ?? 'green');
  const down = sem(d.downColor ?? 'red');

  // overall progress (drives MA draw); candles stagger by index
  const prog = spring({frame: frame - wordToFrame(1), fps, config: {damping: 200}});
  const maPts = ma
    .map((v, i) => (typeof v === 'number' ? `${xc(i)},${y(v)}` : null))
    .filter(Boolean)
    .join(' ');

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 150 : 90) * scale}}>
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} xmlns="http://www.w3.org/2000/svg">
          {/* price gridlines + axis labels */}
          {Array.from({length: grid + 1}).map((_, k) => {
            const p = lo + (k * (hi - lo)) / grid;
            const yy = y(p);
            return (
              <g key={k}>
                <line x1={marginLeft} y1={yy} x2={svgW} y2={yy} stroke={hexA(t.colors.muted, 0.22)} strokeWidth={1.5 * scale} />
                <text x={marginLeft - 12 * scale} y={yy + 8 * scale} textAnchor="end" fontFamily={t.fonts.mono} fontSize={20 * scale} fill={t.colors.muted}>{fmt(p)}</text>
              </g>
            );
          })}
          {/* candles */}
          {candles.map((c, i) => {
            const rise = c.close >= c.open;
            const col = rise ? up : down;
            const start = 3 + i * Math.max(1, Math.round(24 / n));
            const rv = spring({frame: frame - wordToFrame(1) - start, fps, config: {damping: 200}});
            const bodyTop = Math.min(y(c.open), y(c.close));
            const bodyH = Math.max(2 * scale, Math.abs(y(c.open) - y(c.close)));
            return (
              <g key={i} opacity={rv}>
                <line x1={xc(i)} y1={y(c.high)} x2={xc(i)} y2={y(c.low)} stroke={col} strokeWidth={2 * scale} />
                <rect x={xc(i) - bodyW / 2} y={bodyTop} width={bodyW} height={bodyH} fill={hexA(col, 0.95)} rx={2 * scale * t.style.cornerRadius}
                  style={t.style.glow > 0 ? {filter: `drop-shadow(0 0 ${5 * t.style.glow}px ${hexA(col, 0.5)})`} : undefined} />
                {c.label ? <text x={xc(i)} y={marginTop + plotH + 28 * scale} textAnchor="middle" fontFamily={t.fonts.mono} fontSize={18 * scale} fill={t.colors.muted}>{c.label}</text> : null}
              </g>
            );
          })}
          {/* moving-average overlay */}
          {maPts ? <polyline points={maPts} fill="none" stroke={accent} strokeWidth={3 * scale} strokeLinejoin="round" strokeLinecap="round" opacity={prog}
            style={t.style.glow > 0 ? {filter: `drop-shadow(0 0 ${6 * t.style.glow}px ${hexA(accent, 0.5)})`} : undefined} /> : null}
        </svg>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
