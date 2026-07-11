import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {useTheme} from './themes';

// A designed connector, not a paint arrow:
// - gentle S-curve bezier (organic, intentional)
// - draws itself on (stroke draw-on synced to the narration)
// - crisp tapered arrowhead that pops when the line arrives
// - optional neon glow layer (theme-controlled)
// - a pulse dot that travels the path after drawing — implies data flow

const bezierPoint = (
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
): [number, number] => {
  const u = 1 - t;
  const x =
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
  const y =
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
  return [x, y];
};

export const Connector: React.FC<{
  startFrame: number;
  vertical?: boolean;
  length: number;
  thickness?: number;
  color?: string;
}> = ({startFrame, vertical = false, length, thickness = 4, color}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const stroke = color ?? t.colors.accent;

  const W = vertical ? 60 : length;
  const H = vertical ? length : 60;

  // S-curve control points
  const p0: [number, number] = vertical ? [30, 4] : [4, 30];
  const p3: [number, number] = vertical ? [30, H - 14] : [W - 14, 30];
  const p1: [number, number] = vertical ? [44, H * 0.35] : [W * 0.35, 16];
  const p2: [number, number] = vertical ? [16, H * 0.65] : [W * 0.65, 44];

  const draw = interpolate(frame - startFrame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const headPop = interpolate(frame - startFrame, [14, 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Traveling pulse: starts after the line is drawn, loops every 50 frames
  const pulseActive = frame - startFrame > 24;
  const pulseT = ((frame - startFrame - 24) % 50) / 50;
  const [px, py] = bezierPoint(Math.max(0, Math.min(1, pulseT)), p0, p1, p2, p3);
  const pulseOpacity = pulseActive
    ? interpolate(pulseT, [0, 0.12, 0.85, 1], [0, 0.9, 0.9, 0])
    : 0;

  const d = `M ${p0[0]} ${p0[1]} C ${p1[0]} ${p1[1]}, ${p2[0]} ${p2[1]}, ${p3[0]} ${p3[1]}`;

  // Arrowhead: sleek tapered chevron aligned to path end direction
  const headAngle = vertical ? 90 : 0;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{overflow: 'visible', flexShrink: 0}}
    >
      {t.style.glow > 0 ? (
        <path
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={thickness * 3.4}
          strokeLinecap="round"
          opacity={0.22 * t.style.glow * draw}
          style={{filter: 'blur(6px)'}}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
      ) : null}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={thickness}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
      <g
        transform={`translate(${p3[0]}, ${p3[1]}) rotate(${headAngle}) scale(${headPop})`}
        opacity={headPop}
      >
        <path
          d="M -2 -9 L 12 0 L -2 9 L 2 0 Z"
          fill={stroke}
          style={
            t.style.glow > 0
              ? {filter: `drop-shadow(0 0 ${5 * t.style.glow}px ${t.colors.glowSoft})`}
              : undefined
          }
        />
      </g>
      {pulseActive ? (
        <circle
          cx={px}
          cy={py}
          r={thickness * 1.4}
          fill="#FFFFFF"
          opacity={pulseOpacity}
          style={
            t.style.glow > 0
              ? {filter: `drop-shadow(0 0 6px ${stroke})`}
              : undefined
          }
        />
      ) : null}
    </svg>
  );
};
