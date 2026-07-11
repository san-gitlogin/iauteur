import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene, CloudArchData} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {BoundaryGroup, EdgeLabelChip, middleTruncate} from '../kit';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const rectEdge = (cx: number, cy: number, hw: number, hh: number, tx: number, ty: number) => {
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return {x: cx, y: cy};
  const s = Math.min(dx === 0 ? Infinity : hw / Math.abs(dx), dy === 0 ? Infinity : hh / Math.abs(dy));
  return {x: cx + dx * s, y: cy + dy * s};
};

// CLOUD_ARCH — a cloud architecture as nested boundaries (Region▸VPC▸Subnet)
// holding service nodes wired by edges. Provider sets ICONS + label dialect only;
// the palette stays semantic/token (no brand hex). Reveal groups→nodes→edges by
// atWord. ≤8 nodes wide / ≤6 vertical — beyond that it's a DRILL_IN. node-graph.
export const CloudArch: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d: CloudArchData | undefined = scene.data.cloud;
  if (!d) return <AbsoluteFill />;

  const NW = 208 * scale;
  const NH = 100 * scale;
  const PAD = 22 * scale;
  const LAB = 20 * scale;
  const GAP = 24 * scale;
  const horiz = !vertical; // inside a boundary: lay items along the long axis

  const nodes = (d.nodes ?? []).slice(0, vertical ? 6 : 8);
  const nodeSet = new Set(nodes.map((n) => n.id));
  const boundaries = d.boundaries ?? [];
  const childrenOf = (id: string | null) => boundaries.filter((b) => (b.parent ?? null) === id);
  const nodesOf = (id: string) => nodes.filter((n) => n.boundary === id);

  type Box = {w: number; h: number};
  const measure = (bid: string): Box => {
    const kids = childrenOf(bid);
    const dnodes = nodesOf(bid);
    const items: Box[] = [...kids.map((k) => measure(k.id)), ...dnodes.map(() => ({w: NW, h: NH}))];
    let cw = NW;
    let ch = NH;
    if (items.length) {
      if (horiz) {
        cw = items.reduce((a, b) => a + b.w, 0) + GAP * (items.length - 1);
        ch = Math.max(...items.map((b) => b.h));
      } else {
        cw = Math.max(...items.map((b) => b.w));
        ch = items.reduce((a, b) => a + b.h, 0) + GAP * (items.length - 1);
      }
    }
    return {w: cw + PAD * 2, h: ch + PAD * 2 + LAB};
  };

  const centers: Record<string, {x: number; y: number}> = {};
  const boundaryRects: {b: (typeof boundaries)[number]; x: number; y: number; w: number; h: number}[] = [];
  const nodePos: {n: (typeof nodes)[number]; x: number; y: number}[] = [];

  const place = (bid: string, x: number, y: number) => {
    const box = measure(bid);
    const b = boundaries.find((z) => z.id === bid)!;
    boundaryRects.push({b, x, y, w: box.w, h: box.h});
    const kids = childrenOf(bid);
    const dnodes = nodesOf(bid);
    const items: {type: 'b' | 'n'; id: string; w: number; h: number}[] = [
      ...kids.map((k) => ({type: 'b' as const, id: k.id, ...measure(k.id)})),
      ...dnodes.map((nn) => ({type: 'n' as const, id: nn.id, w: NW, h: NH})),
    ];
    const contentW = items.length ? (horiz ? items.reduce((a, i) => a + i.w, 0) + GAP * (items.length - 1) : Math.max(...items.map((i) => i.w))) : NW;
    const contentH = items.length ? (horiz ? Math.max(...items.map((i) => i.h)) : items.reduce((a, i) => a + i.h, 0) + GAP * (items.length - 1)) : NH;
    let cursor = horiz ? x + PAD : y + PAD + LAB;
    for (const it of items) {
      let ix: number;
      let iy: number;
      if (horiz) {
        ix = cursor;
        iy = y + PAD + LAB + (contentH - it.h) / 2;
        cursor += it.w + GAP;
      } else {
        iy = cursor;
        ix = x + PAD + (contentW - it.w) / 2;
        cursor += it.h + GAP;
      }
      if (it.type === 'b') place(it.id, ix, iy);
      else {
        nodePos.push({n: nodes.find((z) => z.id === it.id)!, x: ix, y: iy});
        centers[it.id] = {x: ix + NW / 2, y: iy + NH / 2};
      }
    }
  };

  // roots: top boundaries stacked vertically + loose nodes
  const roots = childrenOf(null);
  const rootBoxes = roots.map((r) => ({r, box: measure(r.id)}));
  const looseNodes = nodes.filter((n) => !n.boundary || !boundaries.some((b) => b.id === n.boundary));
  const totalW = Math.max(NW, ...rootBoxes.map((rb) => rb.box.w), looseNodes.length ? looseNodes.length * NW + GAP * (looseNodes.length - 1) : 0);
  let cy = 0;
  for (const rb of rootBoxes) {
    place(rb.r.id, (totalW - rb.box.w) / 2, cy);
    cy += rb.box.h + GAP;
  }
  if (looseNodes.length) {
    let lx = (totalW - (looseNodes.length * NW + GAP * (looseNodes.length - 1))) / 2;
    for (const n of looseNodes) {
      nodePos.push({n, x: lx, y: cy});
      centers[n.id] = {x: lx + NW / 2, y: cy + NH / 2};
      lx += NW + GAP;
    }
    cy += NH;
  }
  const totalH = cy - (rootBoxes.length || looseNodes.length ? GAP : 0);

  const fit = Math.min(1, (vertical ? 940 : 1640) * scale / totalW, (vertical ? 1180 : 720) * scale / totalH);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 60 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 110 : 50) * scale : 0, position: 'relative', width: totalW * fit, height: totalH * fit}}>
        <div style={{position: 'absolute', top: 0, left: 0, width: totalW, height: totalH, transform: `scale(${fit})`, transformOrigin: 'top left'}}>
          {/* boundaries (outer first) */}
          {boundaryRects.map(({b, x, y, w, h}, i) => {
            const st = wordToFrame(b.atWord ?? d.atWord ?? 1) + 2;
            const show = interpolate(frame, [st, st + 12], [0, 1], clamp);
            const depth = b.kind === 'subnet' ? 2 : b.kind === 'vpc' ? 1 : 0;
            return (
              <div key={b.id} style={{position: 'absolute', left: x, top: y, opacity: show}}>
                <BoundaryGroup label={b.label} color={b.color} depth={depth} style={{width: w, height: h}}>{null}</BoundaryGroup>
              </div>
            );
          })}
          {/* edges */}
          <svg width={totalW} height={totalH} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            {(d.edges ?? []).map((e, i) => {
              const a = centers[e.from];
              const b = centers[e.to];
              if (!a || !b) return null;
              const st = wordToFrame(e.atWord ?? d.atWord ?? 1) + 4;
              const draw = interpolate(frame, [st, st + 14], [0, 1], clamp);
              if (draw <= 0) return null;
              const pa = rectEdge(a.x, a.y, NW / 2, NH / 2, b.x, b.y);
              const pb = rectEdge(b.x, b.y, NW / 2, NH / 2, a.x, a.y);
              const c = e.color ? sem(e.color) : hexA(t.colors.text, 0.55);
              const x2 = pa.x + (pb.x - pa.x) * draw;
              const y2 = pa.y + (pb.y - pa.y) * draw;
              // only label an edge long enough to hold the chip (short adjacent-node
              // edges clip it — a label needs ~text*11+44 px of run to sit clear).
              const elen = Math.hypot(pb.x - pa.x, pb.y - pa.y);
              const labelFits = e.label && elen > (e.label.length * 11 + 60) * scale;
              return (
                <g key={i}>
                  <line x1={pa.x} y1={pa.y} x2={x2} y2={y2} stroke={c} strokeWidth={2.5 * scale} />
                  {draw >= 1 ? <circle cx={pb.x} cy={pb.y} r={4 * scale} fill={c} /> : null}
                  {draw >= 1 && labelFits ? <EdgeLabelChip x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} text={e.label!} color={e.color} scale={scale} /> : null}
                </g>
              );
            })}
          </svg>
          {/* nodes */}
          {nodePos.map(({n, x, y}) => {
            const st = wordToFrame(n.atWord ?? d.atWord ?? 1) + 3;
            const show = interpolate(frame, [st, st + 12], [0, 1], clamp);
            const c = n.color ? sem(n.color) : sem('blue');
            return (
              <div key={n.id} style={{position: 'absolute', left: x, top: y, width: NW, height: NH, opacity: show, transform: `translateY(${interpolate(show, [0, 1], [12 * scale, 0])}px)`, display: 'flex', alignItems: 'center', gap: 12 * scale, padding: `0 ${16 * scale}px`, boxSizing: 'border-box', overflow: 'hidden', borderRadius: 12 * scale * t.style.cornerRadius, border: `${2 * scale}px solid ${hexA(c, 0.55)}`, background: t.colors.panel, boxShadow: t.style.glow > 0 ? `0 ${6 * scale}px ${18 * scale}px ${hexA('#000', 0.28)}` : undefined}}>
                {n.asset ? <AssetIcon asset={n.asset} size={38 * scale} bare tint={c} on={t.colors.panel} /> : null}
                <div style={{display: 'flex', flexDirection: 'column', gap: 2 * scale, minWidth: 0, flex: 1}}>
                  <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 21 * scale, color: t.colors.text, lineHeight: 1.05, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{n.label}</span>
                  {n.sub ? <span style={{fontFamily: t.fonts.mono, fontSize: 16 * scale, color: t.colors.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}>{middleTruncate(n.sub, 18)}</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
