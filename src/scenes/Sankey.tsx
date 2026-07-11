import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CYCLE = ['blue', 'purple', 'green', 'orange', 'red', 'yellow'] as const;

// SANKEY — weighted flow ribbons between columns of nodes. SELF-CONTAINED (does NOT
// touch the DIAGRAM engine per the scope wall): nodes are placed in explicit columns
// and sized by throughput; links are curved ribbons whose width ∝ flow value, packed
// along each node's edges. Ribbons fade in; node bars sit on top with side/above
// labels chosen by column so they never cross a ribbon. Theme + aspect aware.
export const Sankey: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.sankey;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const nodes = (d.nodes ?? []).slice(0, 10);
  const links = (d.links ?? []).slice(0, 16);
  if (nodes.length < 2 || links.length < 1) return <AbsoluteFill style={{background: t.colors.bg}} />;

  // narrow the node span on vertical so the left/right side labels (which sit OUTSIDE
  // the span) stay within the frame — same gutter logic as the funnel (SK-1)
  const W = (vertical ? 560 : 1520) * scale;
  const H = (vertical ? 820 : 600) * scale;
  const nodeW = 24 * scale;
  const nodeGap = 18 * scale;

  // group nodes by column
  const colMap = new Map<number, typeof nodes>();
  for (const n of nodes) {
    const c = n.col ?? 0;
    if (!colMap.has(c)) colMap.set(c, [] as typeof nodes);
    colMap.get(c)!.push(n);
  }
  const colKeys = [...colMap.keys()].sort((a, b) => a - b);
  const nCol = colKeys.length;
  const spacingX = nCol > 1 ? (W - nCol * nodeW) / (nCol - 1) : 0;

  // node throughput = max(in, out, explicit value)
  const val: Record<string, number> = {};
  for (const n of nodes) {
    const out = links.filter((l) => l.source === n.id).reduce((s, l) => s + Math.max(0, l.value), 0);
    const inn = links.filter((l) => l.target === n.id).reduce((s, l) => s + Math.max(0, l.value), 0);
    val[n.id] = Math.max(out, inn, n.value ?? 0) || 1;
  }
  const colTotals = colKeys.map((c) => colMap.get(c)!.reduce((s, n) => s + val[n.id], 0));
  const maxTotal = Math.max(1, ...colTotals);
  const maxNodesInCol = Math.max(...colKeys.map((c) => colMap.get(c)!.length));
  const vscale = (H - nodeGap * (maxNodesInCol - 1)) / maxTotal;

  // position each node (column centred vertically)
  type Pos = {x0: number; y0: number; h: number; col: number; node: (typeof nodes)[number]};
  const pos: Record<string, Pos> = {};
  colKeys.forEach((c, ci) => {
    const colNodes = colMap.get(c)!;
    const totalH = colNodes.reduce((s, n) => s + val[n.id] * vscale, 0) + nodeGap * (colNodes.length - 1);
    let y = (H - totalH) / 2;
    const x0 = ci * (nodeW + spacingX);
    for (const n of colNodes) {
      const h = val[n.id] * vscale;
      pos[n.id] = {x0, y0: y, h, col: c, node: n};
      y += h + nodeGap;
    }
  });

  // pack links along each node's edges
  const srcOff: Record<string, number> = {};
  const tgtOff: Record<string, number> = {};
  for (const n of nodes) {
    srcOff[n.id] = pos[n.id].y0;
    tgtOff[n.id] = pos[n.id].y0;
  }
  const ordered = [...links]
    .filter((l) => pos[l.source] && pos[l.target])
    .sort((a, b) => pos[a.source].y0 - pos[b.source].y0 || pos[a.target].y0 - pos[b.target].y0);

  const prog = spring({frame: frame - wordToFrame(1), fps, config: {damping: 200}});

  const ribbons = ordered.map((l, i) => {
    const s = pos[l.source];
    const tp = pos[l.target];
    const w = Math.max(1 * scale, l.value * vscale);
    const sy0 = srcOff[l.source];
    srcOff[l.source] += w;
    const ty0 = tgtOff[l.target];
    tgtOff[l.target] += w;
    // draw left→right regardless of column order
    const leftIsSource = s.x0 <= tp.x0;
    const ax = leftIsSource ? s.x0 + nodeW : tp.x0 + nodeW;
    const bx = leftIsSource ? tp.x0 : s.x0;
    const ay = leftIsSource ? sy0 : ty0;
    const by = leftIsSource ? ty0 : sy0;
    const mx = (ax + bx) / 2;
    const c = sem(l.color ?? s.node.color ?? CYCLE[i % CYCLE.length]);
    const path = `M ${ax} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by} L ${bx} ${by + w} C ${mx} ${by + w}, ${mx} ${ay + w}, ${ax} ${ay + w} Z`;
    return {path, c};
  });

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 150 : 90) * scale}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{overflow: 'visible'}}>
          {/* ribbons */}
          {ribbons.map((r, i) => (
            <path key={i} d={r.path} fill={hexA(r.c, 0.42)} opacity={prog} />
          ))}
          {/* node bars + labels */}
          {nodes.map((n, i) => {
            const p = pos[n.id];
            const c = sem(n.color ?? CYCLE[i % CYCLE.length]);
            const cx = p.x0 + nodeW / 2;
            const isFirst = p.col === colKeys[0];
            const isLast = p.col === colKeys[colKeys.length - 1];
            const midY = p.y0 + p.h / 2;
            const valTxt = (n.value ?? val[n.id]).toLocaleString() + (d.unit ?? '');
            return (
              <g key={n.id} opacity={prog}>
                <rect x={p.x0} y={p.y0} width={nodeW} height={p.h} fill={c} rx={4 * scale * t.style.cornerRadius}
                  style={t.style.glow > 0 ? {filter: `drop-shadow(0 0 ${6 * t.style.glow}px ${hexA(c, 0.5)})`} : undefined} />
                {isFirst ? (
                  <text x={p.x0 - 12 * scale} y={midY} textAnchor="end" dominantBaseline="middle" fontFamily={t.fonts.body} fontSize={23 * scale} fill={t.colors.text}>{n.label}<tspan fontFamily={t.fonts.mono} fill={t.colors.muted} dx={0} dy={26 * scale} x={p.x0 - 12 * scale} fontSize={19 * scale}>{valTxt}</tspan></text>
                ) : isLast ? (
                  <text x={p.x0 + nodeW + 12 * scale} y={midY} textAnchor="start" dominantBaseline="middle" fontFamily={t.fonts.body} fontSize={23 * scale} fill={t.colors.text}>{n.label}<tspan fontFamily={t.fonts.mono} fill={t.colors.muted} dy={26 * scale} x={p.x0 + nodeW + 12 * scale} fontSize={19 * scale}>{valTxt}</tspan></text>
                ) : (
                  <text x={cx} y={p.y0 - 12 * scale} textAnchor="middle" fontFamily={t.fonts.body} fontSize={22 * scale} fill={t.colors.text}>{n.label}</text>
                )}
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
