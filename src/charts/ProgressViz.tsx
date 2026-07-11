import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useTheme, wordToFrame} from '../themes';
import {useScale, useSem, hexA} from '../ui';
import {drawProgress} from '../motion';
import {ProgressData, SemColor} from '../types';

const CYCLE: SemColor[] = ['green', 'blue', 'purple', 'orange'];

const Ring: React.FC<{value: number; max: number; display?: string; label: string; color: string; size: number; start: number}> = ({
  value,
  max,
  display,
  label,
  color,
  size,
  start,
}) => {
  const t = useTheme();
  const {scale} = useScale();
  const frame = useCurrentFrame();
  const stroke = 18 * scale;
  const c = size / 2;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const frac = Math.min(1, value / max);
  const p = drawProgress(frame, start, {dur: 40}) * frac;
  const gid = `rg-${color.replace('#', '')}-${Math.round(size)}`;
  const ang = (-90 + p * 360) * (Math.PI / 180);
  const dotX = c + r * Math.cos(ang);
  const dotY = c + r * Math.sin(ang);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={hexA(color, 0.5)} />
          </linearGradient>
        </defs>
        <circle cx={c} cy={c} r={r} fill="none" stroke={hexA(color, 0.15)} strokeWidth={stroke} />
        <g transform={`rotate(-90 ${c} ${c})`}>
          <circle cx={c} cy={c} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${circ * p} ${circ}`} />
        </g>
        {p > 0.01 ? (
          <circle cx={dotX} cy={dotY} r={stroke * 0.55} fill={color} stroke={t.colors.bg} strokeWidth={3 * scale} />
        ) : null}
        <text x={c} y={c} textAnchor="middle" dominantBaseline="middle" fontFamily={t.fonts.mono} fontWeight={800} fontSize={40 * scale} fill={t.colors.text} style={{fontVariantNumeric: 'tabular-nums'}}>
          {display ?? `${Math.round(p * max)}`}
        </text>
      </svg>
      <div style={{fontFamily: t.fonts.body, fontSize: 26 * scale, color: t.colors.muted, textAlign: 'center'}}>{label}</div>
    </div>
  );
};

const Bar: React.FC<{value: number; max: number; display?: string; label: string; color: string; w: number; start: number}> = ({
  value,
  max,
  display,
  label,
  color,
  w,
  start,
}) => {
  const t = useTheme();
  const {scale} = useScale();
  const frame = useCurrentFrame();
  const frac = Math.min(1, value / max);
  const p = drawProgress(frame, start, {dur: 36}) * frac;
  const h = 26 * scale;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8 * scale, width: w}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: t.fonts.body, fontSize: 26 * scale, color: t.colors.text}}>
        <span>{label}</span>
        <span style={{fontFamily: t.fonts.mono, color, fontVariantNumeric: 'tabular-nums'}}>{display ?? `${Math.round(p * max)}`}</span>
      </div>
      <div style={{width: '100%', height: h, borderRadius: h, background: hexA(color, 0.14), overflow: 'hidden'}}>
        <div style={{width: `${p * 100}%`, height: '100%', borderRadius: h, background: color}} />
      </div>
    </div>
  );
};

// PROGRESS — rings (default) or horizontal bars filling to targets. Each item's
// fill starts at its own atWord.
export const ProgressViz: React.FC<{data: ProgressData; w: number}> = ({data, w}) => {
  const sem = useSem();
  const {scale, vertical} = useScale();
  const variant = data.variant ?? 'ring';

  if (variant === 'bar') {
    const bw = Math.min(w, (vertical ? 820 : 900) * scale);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 30 * scale, alignItems: 'center'}}>
        {data.items.map((it, i) => (
          <Bar key={i} value={it.value} max={it.max ?? 100} display={it.display} label={it.label} color={sem(it.color ?? CYCLE[i % CYCLE.length])} w={bw} start={wordToFrame(it.atWord)} />
        ))}
      </div>
    );
  }

  const perRow = vertical ? 2 : Math.min(data.items.length, 4);
  const ringSize = Math.min((vertical ? 260 : 220) * scale, w / perRow - 24 * scale);
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 40 * scale, justifyContent: 'center', maxWidth: w}}>
      {data.items.map((it, i) => (
        <Ring key={i} value={it.value} max={it.max ?? 100} display={it.display} label={it.label} color={sem(it.color ?? CYCLE[i % CYCLE.length])} size={ringSize} start={wordToFrame(it.atWord)} />
      ))}
    </div>
  );
};
