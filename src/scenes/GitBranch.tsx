import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {SemColor} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const LANE_COLORS: SemColor[] = ['blue', 'purple', 'green'];

// GIT_BRANCH — a commit graph. Commits sit on lanes (branches) in time order;
// same-lane commits connect along the lane, and links[] draw branch/merge curves
// between commit indices. Reveals in commit order; the newest commit pulses.
// Wide: time flows left→right; short: top→bottom. Lanes get a colour legend.
export const GitBranch: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.git;
  if (!d) return <AbsoluteFill />;

  const lanes = (d.lanes ?? []).slice(0, 3);
  const nl = lanes.length;
  const commits = (d.commits ?? []).slice(0, 8);
  const nc = commits.length;
  const links = d.links ?? [];
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;

  const graphW = (vertical ? 780 : 1480) * scale;
  const graphH = (vertical ? 1000 : 520) * scale;
  const pad = (vertical ? 90 : 110) * scale;
  const laneGap = (vertical ? 200 : 150) * scale;
  const r = (vertical ? 20 : 17) * scale;
  const laneColor = (L: number) => sem(LANE_COLORS[L % LANE_COLORS.length]);

  const along = (i: number) => {
    const span = vertical ? graphH : graphW;
    return nc > 1 ? pad + i * ((span - 2 * pad) / (nc - 1)) : span / 2;
  };
  const cross = (L: number) => {
    const mid = (vertical ? graphW : graphH) / 2;
    return mid + (L - (nl - 1) / 2) * laneGap;
  };
  const pt = (i: number): [number, number] => {
    const a = along(i);
    const c = cross(commits[i].lane);
    return vertical ? [c, a] : [a, c];
  };

  const revealF = interpolate(frame, [start, start + 14 * nc], [0, nc], clamp);

  // per-lane commit index range
  const laneRange: Record<number, [number, number]> = {};
  commits.forEach((cm, i) => {
    const L = cm.lane;
    if (!laneRange[L]) laneRange[L] = [i, i];
    else laneRange[L][1] = i;
  });

  const curve = (a: [number, number], b: [number, number]) => {
    if (vertical) {
      const my = (a[1] + b[1]) / 2;
      return `M ${a[0]} ${a[1]} C ${a[0]} ${my}, ${b[0]} ${my}, ${b[0]} ${b[1]}`;
    }
    const mx = (a[0] + b[0]) / 2;
    return `M ${a[0]} ${a[1]} C ${mx} ${a[1]}, ${mx} ${b[1]}, ${b[0]} ${b[1]}`;
  };

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 * scale, marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0}}>
        {/* lane legend */}
        <div style={{display: 'flex', gap: 26 * scale, flexWrap: 'wrap', justifyContent: 'center'}}>
          {lanes.map((ln, L) => (
            <div key={L} style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
              <div style={{width: 16 * scale, height: 16 * scale, borderRadius: 999, background: laneColor(L)}} />
              <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, color: t.colors.text, letterSpacing: '0.04em'}}>{ln}</span>
            </div>
          ))}
        </div>
        <svg width={graphW} height={graphH} viewBox={`0 0 ${graphW} ${graphH}`} style={{overflow: 'visible', display: 'block'}}>
          {/* lane lines (grow with reveal) */}
          {Object.entries(laneRange).map(([Ls, [mn, mx]]) => {
            const L = Number(Ls);
            if (revealF < mn) return null;
            const end = Math.min(mx, revealF);
            const a = pt(mn);
            const bEndAlong = along(end);
            const b: [number, number] = vertical ? [cross(L), bEndAlong] : [bEndAlong, cross(L)];
            return <line key={L} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={hexA(laneColor(L), 0.55)} strokeWidth={4 * scale} strokeLinecap="round" />;
          })}
          {/* branch / merge links */}
          {links.map((lk, k) => {
            if (lk.from >= nc || lk.to >= nc) return null;
            const vis = interpolate(revealF, [Math.max(lk.from, lk.to) - 0.5, Math.max(lk.from, lk.to)], [0, 1], clamp);
            if (vis <= 0) return null;
            const cFrom = laneColor(commits[lk.to].lane);
            return <path key={k} d={curve(pt(lk.from), pt(lk.to))} fill="none" stroke={hexA(cFrom, 0.55)} strokeWidth={4 * scale} strokeLinecap="round" opacity={vis} />;
          })}
          {/* commit dots */}
          {commits.map((cm, i) => {
            const on = revealF >= i;
            const e = spring({frame: frame - (start + i * 14), fps, config: {damping: 14, mass: 0.6}});
            const [x, y] = pt(i);
            const c = cm.color ? sem(cm.color) : laneColor(cm.lane);
            const isLatest = i === Math.min(nc - 1, Math.floor(revealF));
            return (
              <g key={i} opacity={on ? 1 : 0}>
                {isLatest && t.style.glow > 0 ? <circle cx={x} cy={y} r={r * 1.8} fill={hexA(c, 0.2)} /> : null}
                <circle cx={x} cy={y} r={r * (on ? interpolate(e, [0, 1], [0.3, 1]) : 0.3)} fill={t.colors.bg} stroke={c} strokeWidth={4 * scale} />
                <circle cx={x} cy={y} r={r * 0.42 * (on ? 1 : 0)} fill={c} />
              </g>
            );
          })}
          {/* commit labels — SVG text anchored to each dot (perfectly aligned) */}
          {commits.map((cm, i) => {
            if (!cm.label || revealF < i) return null;
            const [x, y] = pt(i);
            return (
              <text
                key={`lb-${i}`}
                x={vertical ? x + r + 16 * scale : x}
                y={vertical ? y : y - r - 14 * scale}
                textAnchor={vertical ? 'start' : 'middle'}
                dominantBaseline={vertical ? 'middle' : 'auto'}
                style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: `${20 * scale}px`, fill: t.colors.muted}}
              >
                {cm.label}
              </text>
            );
          })}
        </svg>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
