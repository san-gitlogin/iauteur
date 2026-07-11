import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useTheme, wordToFrame} from '../themes';
import {useScale, useSem} from '../ui';
import {drawProgress} from '../motion';
import {DonutData, SemColor} from '../types';

const CYCLE: SemColor[] = ['blue', 'purple', 'green', 'orange', 'yellow', 'red'];

// Animated donut. Each segment sweeps in clockwise from 12 o'clock in sequence.
export const Donut: React.FC<{data: DonutData; size: number}> = ({data, size}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();

  const isPie = data.variant === 'pie';
  const stroke = isPie ? size / 2 : 40 * scale;
  const r = isPie ? size / 4 : (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = Math.max(1, data.segments.reduce((s, seg) => s + seg.value, 0));

  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={t.colors.panelBorder} strokeWidth={stroke} opacity={0.4} />
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {data.segments.map((seg, i) => {
          const frac = seg.value / total;
          const startFrac = acc;
          acc += frac;
          const c = sem(seg.color ?? CYCLE[i % CYCLE.length]);
          const p = drawProgress(frame, wordToFrame(seg.atWord), {dur: 30});
          const shown = frac * p;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={c}
              strokeWidth={stroke}
              strokeDasharray={`${circ * shown} ${circ}`}
              strokeDashoffset={-circ * startFrac}
              strokeLinecap="butt"
            />
          );
        })}
      </g>
      {!isPie && data.centerValue ? (
        <text x={cx} y={cy - 2 * scale} textAnchor="middle" dominantBaseline="middle" fontFamily={t.fonts.mono} fontWeight={800} fontSize={64 * scale} fill={t.colors.text} style={{fontVariantNumeric: 'tabular-nums'}}>
          {data.centerValue}
        </text>
      ) : null}
      {!isPie && data.centerLabel ? (
        <text x={cx} y={cy + 42 * scale} textAnchor="middle" dominantBaseline="middle" fontFamily={t.fonts.mono} fontSize={22 * scale} letterSpacing={2} fill={t.colors.muted}>
          {data.centerLabel.toUpperCase()}
        </text>
      ) : null}
    </svg>
  );
};
