import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme, wordToFrame} from '../themes';
import {useScale, useSem, hexA} from '../ui';
import {springPop} from '../motion';
import {TimelineData, SemColor} from '../types';

const CYCLE: SemColor[] = ['blue', 'purple', 'green', 'orange'];

// TIMELINE — a spine with dated milestone nodes. Horizontal on wide, vertical
// on shorts. Nodes pop in at their atWord; the spine draws to each node.
export const Timeline: React.FC<{data: TimelineData; w: number; h: number}> = ({data, w, h}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const ms = data.milestones;
  const n = ms.length;

  if (vertical) {
    const spineX = 60 * scale;
    const stepY = h / n;
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
        <line x1={spineX} y1={stepY * 0.4} x2={spineX} y2={stepY * (n - 0.6)} stroke={t.colors.panelBorder} strokeWidth={3 * scale} />
        {ms.map((m, i) => {
          const cy = stepY * (i + 0.4);
          const c = sem(m.color ?? CYCLE[i % CYCLE.length]);
          const st = springPop(frame, wordToFrame(m.atWord), fps);
          return (
            <g key={i}>
              <circle cx={spineX} cy={cy} r={11 * scale} fill={c} opacity={st.opacity as number} />
              <text x={spineX + 34 * scale} y={cy - 6 * scale} fontFamily={t.fonts.mono} fontSize={20 * scale} fill={c} opacity={st.opacity as number}>{m.date}</text>
              <text x={spineX + 34 * scale} y={cy + 26 * scale} fontFamily={t.fonts.display} fontWeight={700} fontSize={32 * scale} fill={t.colors.text} opacity={st.opacity as number}>{m.title}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  const spineY = h / 2;
  const stepX = w / n;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
      <line x1={stepX * 0.5} y1={spineY} x2={stepX * (n - 0.5)} y2={spineY} stroke={t.colors.panelBorder} strokeWidth={3 * scale} />
      {ms.map((m, i) => {
        const cx = stepX * (i + 0.5);
        const c = sem(m.color ?? CYCLE[i % CYCLE.length]);
        const st = springPop(frame, wordToFrame(m.atWord), fps);
        const above = i % 2 === 0;
        const ty = above ? spineY - 90 * scale : spineY + 70 * scale;
        return (
          <g key={i} opacity={st.opacity as number}>
            <line x1={cx} y1={spineY} x2={cx} y2={above ? ty + 30 * scale : ty - 26 * scale} stroke={hexA(c, 0.5)} strokeWidth={2 * scale} />
            <circle cx={cx} cy={spineY} r={11 * scale} fill={c} />
            <text x={cx} y={above ? ty : ty} textAnchor="middle" fontFamily={t.fonts.mono} fontSize={19 * scale} fill={c}>{m.date}</text>
            <text x={cx} y={(above ? ty : ty) + 30 * scale} textAnchor="middle" fontFamily={t.fonts.display} fontWeight={700} fontSize={28 * scale} fill={t.colors.text}>{m.title}</text>
          </g>
        );
      })}
    </svg>
  );
};
