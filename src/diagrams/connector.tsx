import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {useTheme} from '../themes';
import {hexA} from '../ui';

// A professional diagram connector that lives in a SHARED SVG coordinate space,
// so it can route between ANY two node anchors — not just a flex row.
//   - kind 'curve'  : organic cubic bezier (default; extends out of each side)
//   - kind 'ortho'  : right-angle elbow (block / architecture diagrams)
//   - kind 'straight': direct line (sequence messages)
// It draws ON (mask reveal synced to narration), reads as DOTTED marching ants
// (implies flow direction), and pops a tapered arrowhead on the end tangent.
// Deterministic (pure function of frame), ×scale, theme + dark/light aware.

export type EdgeKind = 'curve' | 'ortho' | 'straight';
export type Side = 'top' | 'bottom' | 'left' | 'right';
export interface Anchor {
  x: number;
  y: number;
  side?: Side;
}

const outward: Record<Side, [number, number]> = {
  right: [1, 0], left: [-1, 0], top: [0, -1], bottom: [0, 1],
};

const inferSides = (a: Anchor, b: Anchor): [Side, Side] => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? ['right', 'left'] : ['left', 'right'];
  }
  return dy >= 0 ? ['bottom', 'top'] : ['top', 'bottom'];
};

// Returns the SVG path string, the end tangent (deg), and a pointAt(t) sampler
// (used to travel a glow pulse along the line, deterministically).
const lerp = (p: [number, number], q: [number, number], t: number): [number, number] => [
  p[0] + (q[0] - p[0]) * t,
  p[1] + (q[1] - p[1]) * t,
];
const cubicAt = (
  p0: [number, number], c1: [number, number], c2: [number, number], p1: [number, number], t: number,
): [number, number] => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0],
    u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1],
  ];
};
const polyAt = (pts: [number, number][], t: number): [number, number] => {
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = segs.reduce((s, v) => s + v, 0) || 1;
  let target = t * total;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i] || i === segs.length - 1) {
      const lt = segs[i] === 0 ? 0 : target / segs[i];
      return lerp(pts[i], pts[i + 1], Math.min(1, Math.max(0, lt)));
    }
    target -= segs[i];
  }
  return pts[pts.length - 1];
};

interface BuiltPath {
  d: string;
  endAngle: number;
  pointAt: (t: number) => [number, number];
}

const buildPath = (a: Anchor, b: Anchor, kind: EdgeKind, curvature: number): BuiltPath => {
  const [sa, sb] = [a.side, b.side].every(Boolean)
    ? [a.side as Side, b.side as Side]
    : inferSides(a, b);
  const A: [number, number] = [a.x, a.y];
  const B: [number, number] = [b.x, b.y];
  const dist = Math.hypot(b.x - a.x, b.y - a.y);

  if (kind === 'straight') {
    const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    return {d: `M ${a.x} ${a.y} L ${b.x} ${b.y}`, endAngle: ang, pointAt: (t) => lerp(A, B, t)};
  }

  if (kind === 'ortho') {
    const horizontal = sa === 'left' || sa === 'right';
    let pts: [number, number][];
    if (horizontal) {
      const mx = (a.x + b.x) / 2;
      pts = [A, [mx, a.y], [mx, b.y], B];
    } else {
      const my = (a.y + b.y) / 2;
      pts = [A, [a.x, my], [b.x, my], B];
    }
    const last = pts[pts.length - 2];
    const ang = (Math.atan2(b.y - last[1], b.x - last[0]) * 180) / Math.PI;
    const d = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
    return {d, endAngle: ang, pointAt: (t) => polyAt(pts, t)};
  }

  // curve
  const off = Math.max(40, curvature * dist);
  const c1: [number, number] = [a.x + outward[sa][0] * off, a.y + outward[sa][1] * off];
  const c2: [number, number] = [b.x + outward[sb][0] * off, b.y + outward[sb][1] * off];
  const ang = (Math.atan2(b.y - c2[1], b.x - c2[0]) * 180) / Math.PI;
  return {
    d: `M ${a.x} ${a.y} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${b.x} ${b.y}`,
    endAngle: ang,
    pointAt: (t) => cubicAt(A, c1, c2, B, t),
  };
};

let _uid = 0;

export const DiagramEdge: React.FC<{
  from: Anchor;
  to: Anchor;
  startFrame: number;
  color: string;
  scale: number;
  kind?: EdgeKind;
  dotted?: boolean;
  arrow?: boolean;
  curvature?: number;
  glow?: number;
}> = ({from, to, startFrame, color, scale, kind = 'curve', dotted = true, arrow = true, curvature = 0.4, glow = 0}) => {
  const frame = useCurrentFrame();
  const id = React.useMemo(() => `edge${_uid++}`, []);

  // Stop the line + arrowhead in a clean gap OUTSIDE the target box — never
  // poking into it. Pull the endpoint back along the box's entry side.
  const sb: Side = to.side ?? inferSides(from, to)[1];
  const nrm = outward[sb];
  const HEAD = 11; // arrowhead length (pre-scale)
  const GAP = 8; // clear space between the arrow tip and the box edge
  const inset = (arrow ? HEAD + GAP : GAP) * scale;
  const toTrim: Anchor = {x: to.x + nrm[0] * inset, y: to.y + nrm[1] * inset, side: sb};

  const {d, endAngle, pointAt} = buildPath(from, toTrim, kind, curvature);

  const reveal = interpolate(frame - startFrame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  if (reveal <= 0) return null;
  const headPop = interpolate(frame - startFrame, [16, 26], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // A single glow pulse travels the line to imply flow direction — the same
  // refined cue the studio's DottedConnector uses (replaces busy marching ants).
  const pulseActive = frame - startFrame > 18;
  const pt = ((frame - startFrame - 18) % 48) / 48;
  const pulseOpacity = pulseActive ? interpolate(pt, [0, 0.12, 0.88, 1], [0, 1, 1, 0]) : 0;
  const pulse = pointAt(Math.min(pt, reveal));
  const w = 2.5 * scale;

  return (
    <g>
      <defs>
        {/* mask reveals the first `reveal` fraction of the path length */}
        <mask id={id} maskUnits="userSpaceOnUse">
          <path d={d} fill="none" stroke="#fff" strokeWidth={w * 5}
                strokeLinecap="round" pathLength={1}
                strokeDasharray={1} strokeDashoffset={1 - reveal} />
        </mask>
      </defs>
      {glow > 0 ? (
        <path d={d} fill="none" stroke={color} strokeWidth={w * 3}
              strokeLinecap="round" opacity={0.22 * glow} mask={`url(#${id})`}
              style={{filter: `blur(${6 * scale}px)`}} />
      ) : null}
      <path
        d={d} fill="none" stroke={dotted ? hexA(color, 0.7) : color}
        strokeWidth={w} strokeLinecap="round"
        strokeDasharray={dotted ? `${2 * scale} ${8 * scale}` : undefined}
        mask={`url(#${id})`}
      />
      {dotted && pulseActive ? (
        <circle cx={pulse[0]} cy={pulse[1]} r={4 * scale} fill={color} opacity={pulseOpacity}
                style={{filter: `drop-shadow(0 0 ${5 * scale}px ${hexA(color, 0.9)})`}} />
      ) : null}
      {arrow ? (
        <g transform={`translate(${toTrim.x} ${toTrim.y}) rotate(${endAngle}) scale(${headPop * scale})`}
           opacity={headPop}>
          <path d="M 0 -6 L 11 0 L 0 6 L 3.5 0 Z" fill={dotted ? hexA(color, 0.92) : color}
                style={glow > 0 ? {filter: `drop-shadow(0 0 ${5 * glow}px ${color})`} : undefined} />
        </g>
      ) : null}
    </g>
  );
};
