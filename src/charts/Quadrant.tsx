import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme, wordToFrame} from '../themes';
import {useScale, useSem, hexA} from '../ui';
import {springPop} from '../motion';
import {QuadrantData, SemColor} from '../types';

const CYCLE: SemColor[] = ['blue', 'purple', 'green', 'orange', 'red'];

// QUADRANT — a 2x2 positioning map. Points sit at (x,y) in 0..1 space and pop
// in at their atWord. Axis captions label the four directions.
export const Quadrant: React.FC<{data: QuadrantData; size: number}> = ({data, size}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();

  const pad = 44 * scale;
  const box = size - pad * 2;
  const px = (x: number) => pad + x * box;
  const py = (y: number) => pad + (1 - y) * box;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{overflow: 'visible'}}>
      {/* frame */}
      <rect x={pad} y={pad} width={box} height={box} fill={hexA(t.colors.text, 0.02)} stroke={t.colors.panelBorder} strokeWidth={1.5} />
      {/* axes */}
      <line x1={pad + box / 2} y1={pad} x2={pad + box / 2} y2={pad + box} stroke={t.colors.panelBorder} strokeWidth={1.5} strokeDasharray="4 6" />
      <line x1={pad} y1={pad + box / 2} x2={pad + box} y2={pad + box / 2} stroke={t.colors.panelBorder} strokeWidth={1.5} strokeDasharray="4 6" />
      {/* axis captions */}
      <text x={pad + box / 2} y={pad - 16 * scale} textAnchor="middle" fontFamily={t.fonts.mono} fontSize={19 * scale} letterSpacing={2} fill={t.colors.muted}>{data.yAxis.top.toUpperCase()}</text>
      <text x={pad + box / 2} y={pad + box + 30 * scale} textAnchor="middle" fontFamily={t.fonts.mono} fontSize={19 * scale} letterSpacing={2} fill={t.colors.muted}>{data.yAxis.bottom.toUpperCase()}</text>
      <text x={pad - 16 * scale} y={pad + box / 2} textAnchor="middle" fontFamily={t.fonts.mono} fontSize={19 * scale} letterSpacing={2} fill={t.colors.muted} transform={`rotate(-90 ${pad - 16 * scale} ${pad + box / 2})`}>{data.xAxis.left.toUpperCase()}</text>
      <text x={pad + box + 18 * scale} y={pad + box / 2} textAnchor="middle" fontFamily={t.fonts.mono} fontSize={19 * scale} letterSpacing={2} fill={t.colors.muted} transform={`rotate(90 ${pad + box + 18 * scale} ${pad + box / 2})`}>{data.xAxis.right.toUpperCase()}</text>
      {/* points */}
      {data.points.map((pt, i) => {
        const c = sem(pt.color ?? CYCLE[i % CYCLE.length]);
        const st = springPop(frame, wordToFrame(pt.atWord), fps);
        return (
          <g key={i} opacity={st.opacity as number} transform={st.transform as string} style={{transformOrigin: `${px(pt.x)}px ${py(pt.y)}px`}}>
            <circle cx={px(pt.x)} cy={py(pt.y)} r={10 * scale} fill={c} stroke={t.colors.bg} strokeWidth={2 * scale} />
            <text x={px(pt.x)} y={py(pt.y) - 20 * scale} textAnchor="middle" fontFamily={t.fonts.body} fontWeight={700} fontSize={24 * scale} fill={t.colors.text}>{pt.label}</text>
          </g>
        );
      })}
    </svg>
  );
};
