import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {EdgeLabelChip} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// hash a string → int (deterministic seed from node ids).
const hashStr = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

// KNOWLEDGE_GRAPH — entities/classes/literals wired by S-P-O edges on a
// DETERMINISTIC seeded ring layout (a shipped spec re-renders identically
// forever). Node kinds are visually typed: entity=pill, class=rect, literal=muted
// chip. The query path lights node→edge→node sequentially at atWords. node-graph.
export const KnowledgeGraph: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.kg;
  if (!d) return <AbsoluteFill />;

  const nodes = (d.nodes ?? []).slice(0, vertical ? 7 : 10);
  const edges = (d.edges ?? []).slice(0, vertical ? 8 : 12);
  const n = nodes.length;
  const box = (vertical ? 920 : 800) * scale;
  const cx = box / 2;
  const cy = box / 2;
  const R = box * 0.4;
  const seed = (d.seed ?? 0) + hashStr(nodes.map((x) => x.id).join(','));
  const start0 = (seed % 360) * (Math.PI / 180);
  const pos: Record<string, {x: number; y: number}> = {};
  nodes.forEach((nd, i) => {
    const a = start0 + (i * 2 * Math.PI) / n;
    pos[nd.id] = {x: cx + R * Math.cos(a), y: cy + R * Math.sin(a)};
  });
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38) + 6;

  // query path: node ids lit sequentially
  const qp = d.queryPath ?? [];
  const litNode = (id: string): number => {
    const idx = qp.indexOf(id);
    if (idx < 0) return 0;
    return interpolate(frame, [base + 30 + idx * 14, base + 30 + idx * 14 + 8], [0, 1], clamp);
  };
  const litEdge = (from: string, to: string): number => {
    for (let k = 0; k < qp.length - 1; k++) {
      if ((qp[k] === from && qp[k + 1] === to) || (qp[k] === to && qp[k + 1] === from)) return interpolate(frame, [base + 30 + k * 14 + 6, base + 30 + k * 14 + 14], [0, 1], clamp);
    }
    return 0;
  };

  const kindColor = (k?: string) => (k === 'class' ? sem('purple') : k === 'literal' ? t.colors.muted : sem('blue'));

  // EDGE-LABEL PLACEMENT PRE-PASS (deterministic). Dense graphs (up to 12 edges on
  // 10 ring nodes) drop labels on nodes AND on each other. For each edge in order we
  // pick the first candidate offset (varied anchor fraction + alternating normal
  // side) that clears BOTH every node box AND every already-placed label, then record
  // the chosen label rect so later edges avoid it. Pure geometry ⇒ byte-stable.
  const nodeRects = nodes.map((nd) => ({x: pos[nd.id].x, y: pos[nd.id].y, w: (nd.label.length * 7 + 44) * scale, h: 50 * scale}));
  const placedLabels: {x: number; y: number; w: number; h: number}[] = [];
  const edgePlan = edges.map((e, i) => {
    const a = pos[e.from];
    const b = pos[e.to];
    if (!a || !b || !e.label) return null;
    const fA = 0.5 + ((i % 3) - 1) * 0.16;
    const lx1 = a.x + (b.x - a.x) * (fA - 0.14);
    const ly1 = a.y + (b.y - a.y) * (fA - 0.14);
    const lx2 = a.x + (b.x - a.x) * (fA + 0.14);
    const ly2 = a.y + (b.y - a.y) * (fA + 0.14);
    const mdx = lx2 - lx1;
    const mdy = ly2 - ly1;
    const mlen = Math.hypot(mdx, mdy) || 1;
    const nnx = -mdy / mlen;
    const nny = mdx / mlen;
    const labW = (e.label.length * 10.5 + 24) * scale;
    const labH = 30 * scale;
    const clears = (o: number) => {
      const mx = (lx1 + lx2) / 2 + nnx * o * scale;
      const my = (ly1 + ly2) / 2 + nny * o * scale;
      const nodeClash = nodeRects.some((r) => Math.abs(r.x - mx) < (r.w + labW) / 2 * 0.7 && Math.abs(r.y - my) < (r.h + labH) / 2);
      const labelClash = placedLabels.some((r) => Math.abs(r.x - mx) < (r.w + labW) / 2 * 0.9 && Math.abs(r.y - my) < (r.h + labH) / 2 * 0.95);
      return !nodeClash && !labelClash;
    };
    const bs = i % 2 === 0 ? 20 : -20;
    const off = [bs, -bs, bs * 1.9, -bs * 1.9, bs * 2.8, -bs * 2.8, bs * 3.7, -bs * 3.7].find(clears) ?? bs;
    placedLabels.push({x: (lx1 + lx2) / 2 + nnx * off * scale, y: (ly1 + ly2) / 2 + nny * off * scale, w: labW, h: labH});
    return {lx1, ly1, lx2, ly2, off};
  });

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 50 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 50 : 20) * scale : 0, position: 'relative', width: box, height: box}}>
        <svg width={box} height={box} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {edges.map((e, i) => {
            const a = pos[e.from];
            const b = pos[e.to];
            if (!a || !b) return null;
            const st = wordToFrame(e.atWord ?? d.atWord ?? 1) + 4;
            const draw = interpolate(frame, [st, st + 12], [0, 1], clamp);
            if (draw <= 0) return null;
            const lit = litEdge(e.from, e.to);
            const c = lit > 0.1 ? sem('green') : hexA(t.colors.text, 0.4);
            const plan = edgePlan[i];
            return (
              <g key={i}>
                <line x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * draw} y2={a.y + (b.y - a.y) * draw} stroke={c} strokeWidth={(lit > 0.1 ? 3.5 : 2) * scale} />
                {draw >= 1 && e.label && plan ? <EdgeLabelChip x1={plan.lx1} y1={plan.ly1} x2={plan.lx2} y2={plan.ly2} text={e.label} color={lit > 0.1 ? 'green' : undefined} scale={scale} offset={plan.off} /> : null}
              </g>
            );
          })}
        </svg>
        {nodes.map((nd, i) => {
          const p = pos[nd.id];
          const st = wordToFrame(nd.atWord ?? d.atWord ?? 1) + 2;
          const show = interpolate(frame, [st, st + 10], [0, 1], clamp);
          const lit = litNode(nd.id);
          const c = kindColor(nd.kind);
          const hi = lit > 0.1;
          const isRect = nd.kind === 'class';
          const isLit = nd.kind === 'literal';
          return (
            <div key={i} style={{position: 'absolute', left: p.x, top: p.y, transform: `translate(-50%,-50%) scale(${interpolate(show, [0, 1], [0.7, 1])})`, opacity: show, fontFamily: isLit ? t.fonts.mono : t.fonts.body, fontWeight: isLit ? 500 : 700, fontSize: (isLit ? 18 : 21) * scale, color: hi ? t.colors.onAccent : isLit ? t.colors.muted : t.colors.text, background: hi ? sem('green') : isLit ? hexA(t.colors.panelBorder, 0.4) : t.colors.panel, border: `${2 * scale}px solid ${hi ? sem('green') : hexA(c, 0.7)}`, borderRadius: isRect ? 6 * scale * t.style.cornerRadius : 999, padding: `${8 * scale}px ${15 * scale}px`, whiteSpace: 'nowrap', boxShadow: hi && t.style.glow > 0 ? `0 0 ${18 * scale}px ${hexA(sem('green'), 0.5)}` : undefined}}>{nd.label}</div>
          );
        })}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
