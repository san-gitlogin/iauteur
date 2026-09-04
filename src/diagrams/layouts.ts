import {DiagramData, DiagramSpecNode as DiagramNode, SemColor} from '../types';
import {Anchor, EdgeKind, Side} from './connector';

// Coordinate engine: turns a DiagramData spec into placed node rects + edges
// with EXPLICIT anchor points, in a virtual canvas of CW x CH pixels. The
// renderer stays dumb — all the "how would an architect lay this out" logic
// lives here. Every layout is aspect-aware (vertical vs horizontal).

export interface Placed {
  id: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  node: DiagramNode;
}
export interface PlacedEdge {
  fromA: Anchor;
  toA: Anchor;
  kind: EdgeKind;
  atWord: number;
  label?: string;
  color?: SemColor;
  dashed: boolean;
}
export interface Lifeline {
  id: string;
  x: number;
  y0: number;
  y1: number;
  color?: SemColor;
}
export interface DiagramPlan {
  nodes: Placed[];
  edges: PlacedEdge[];
  lifelines: Lifeline[];
  sequence: boolean;
  msgLabels: {x: number; y: number; text: string; atWord: number; color?: SemColor}[];
}

const sideAnchor = (p: Placed, side: Side): Anchor => {
  switch (side) {
    case 'right': return {x: p.cx + p.w / 2, y: p.cy, side};
    case 'left': return {x: p.cx - p.w / 2, y: p.cy, side};
    case 'top': return {x: p.cx, y: p.cy - p.h / 2, side};
    case 'bottom': return {x: p.cx, y: p.cy + p.h / 2, side};
  }
};

// pick the two facing sides between two rects
const facing = (a: Placed, b: Placed): [Side, Side] => {
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? ['right', 'left'] : ['left', 'right'];
  return dy >= 0 ? ['bottom', 'top'] : ['top', 'bottom'];
};

export const computeDiagram = (
  data: DiagramData,
  CW: number,
  CH: number,
  scale: number,
  vertical: boolean,
): DiagramPlan => {
  const layout = data.layout;
  const nodes = data.nodes ?? [];
  const edges = data.edges ?? [];
  const placed: Placed[] = [];
  const out: PlacedEdge[] = [];
  const lifelines: Lifeline[] = [];
  const msgLabels: DiagramPlan['msgLabels'] = [];
  const byId = (id: string) => placed.find((p) => p.id === id);

  // A NODE BOX SIZES TO ITS OWN TEXT (owner, 2026-09-04: *"there are padding and
  // scaffolding issues with text and the box"*, over a sequence node whose sub read
  // "builds the list" with the word `list` sitting ON the border).
  //
  // The height was a flat 88 for `sequence`. A label of "Your program" wraps to two
  // lines inside a 210-wide box, the mono sub wraps to two more, and four lines of
  // type do not fit in 88px — so the box clipped its own contents. Both numbers are
  // now derived: the box is wide enough that ordinary labels do not wrap, and its
  // height counts the lines that will actually be drawn.
  const NW = (layout === 'sequence' ? 272 : vertical ? 250 : 230) * scale;
  // Mirrors the type in Diagram.tsx: label 26/30px at line-height 1.1, mono sub 19px,
  // role pill ~21px, plus the 14px padding top and bottom and the 2px gap between.
  const linesFor = (text: string | undefined, px: number) => {
    if (!text) return 0;
    // ~0.55em per character for the body face, ~0.60em for mono.
    const per = Math.max(1, Math.floor((NW / scale - 36) / (px * 0.56)));
    return Math.max(1, Math.ceil(text.length / per));
  };
  const nodeH = (node: {label?: string; sub?: string; role?: string}) => {
    const seq = layout === 'sequence';
    const lab = linesFor(node.label, seq ? 26 : 30) * (seq ? 26 : 30) * 1.1;
    const sub = linesFor(node.sub, 19) * 19 * 1.25;
    const role = node.role ? 24 : 0;
    const gaps = (node.sub ? 2 : 0) + (node.role ? 3 : 0);
    return Math.max(seq ? 88 : 132, lab + sub + role + gaps + 28) * scale;
  };
  const NH = (layout === 'sequence' ? 88 : 132) * scale;

  const resolveKind = (fallback: EdgeKind, e?: {kind?: EdgeKind}): EdgeKind => e?.kind ?? fallback;

  if (layout === 'sequence') {
    // Actors across the top, lifelines down, messages at increasing y (time).
    const n = nodes.length;
    const laneGap = CW / n;
    const heights = nodes.map(nodeH);
    const headH = Math.max(...heights, NH);
    const headY = headH / 2 + 10 * scale;
    nodes.forEach((node, i) => {
      const cx = laneGap * (i + 0.5);
      placed.push({id: node.id, cx, cy: headY, w: NW, h: heights[i], node});
      lifelines.push({id: node.id, x: cx, y0: headY + heights[i] / 2, y1: CH - 20 * scale, color: node.color});
    });
    const msgs = [...edges].sort((a, b) => (a.atWord ?? 0) - (b.atWord ?? 0));
    const top = headY + headH / 2 + 60 * scale;
    // LAW 0n: `Math.min(budget * f, CONST)` — the CONST must never be the binding term.
    // At 140 it bound for every diagram with three or fewer messages, so a two-message
    // beat drew its actors at the top and left two thirds of the pane black. The cap
    // exists for the CROWDED case only, so it sits above any ordinary spacing.
    const step = msgs.length > 0 ? Math.min(300 * scale, (CH - top - 40 * scale) / msgs.length) : 0;
    msgs.forEach((e, k) => {
      const a = byId(e.from);
      const b = byId(e.to);
      if (!a || !b) return;
      const y = top + step * (k + 0.5);
      const dir = b.cx >= a.cx ? 1 : -1;
      out.push({
        fromA: {x: a.cx + dir * 6 * scale, y, side: dir > 0 ? 'right' : 'left'},
        toA: {x: b.cx - dir * 6 * scale, y, side: dir > 0 ? 'left' : 'right'},
        kind: 'straight', atWord: e.atWord ?? 0, color: e.color ?? a.node.color,
        dashed: e.dashed ?? true,
      });
      if (e.label) msgLabels.push({x: (a.cx + b.cx) / 2, y: y - 20 * scale, text: e.label, atWord: e.atWord ?? 0, color: e.color ?? a.node.color});
    });
    return {nodes: placed, edges: out, lifelines, sequence: true, msgLabels};
  }

  if (layout === 'block') {
    // grid: explicit row/col, else auto sqrt grid
    const hasRC = nodes.every((n) => n.col != null && n.row != null);
    const cols = hasRC
      ? Math.max(...nodes.map((n) => (n.col ?? 0))) + 1
      : Math.ceil(Math.sqrt(nodes.length));
    const rows = hasRC
      ? Math.max(...nodes.map((n) => (n.row ?? 0))) + 1
      : Math.ceil(nodes.length / cols);
    const gx = CW / cols;
    const gy = CH / rows;
    nodes.forEach((node, i) => {
      const col = hasRC ? node.col! : i % cols;
      const row = hasRC ? node.row! : Math.floor(i / cols);
      placed.push({id: node.id, cx: gx * (col + 0.5), cy: gy * (row + 0.5), w: Math.min(NW, gx - 30 * scale), h: NH, node});
    });
    edges.forEach((e) => {
      const a = byId(e.from); const b = byId(e.to);
      if (!a || !b) return;
      const [sa, sb] = facing(a, b);
      out.push({fromA: sideAnchor(a, sa), toA: sideAnchor(b, sb), kind: resolveKind('ortho', e), atWord: e.atWord ?? 0, color: e.color, dashed: e.dashed ?? true});
    });
    return {nodes: placed, edges: out, lifelines, sequence: false, msgLabels};
  }

  if (layout === 'tree') {
    // top-down hierarchy by parent (horizontal video) / same but tighter vertical
    const roots = nodes.filter((n) => !n.parent);
    const depthOf = (n: DiagramNode): number => {
      let d = 0; let cur: DiagramNode | undefined = n;
      const seen = new Set<string>();
      while (cur?.parent && !seen.has(cur.id)) { seen.add(cur.id); d++; cur = nodes.find((x) => x.id === cur!.parent); }
      return d;
    };
    const maxDepth = Math.max(0, ...nodes.map(depthOf));
    const levels: DiagramNode[][] = Array.from({length: maxDepth + 1}, () => []);
    nodes.forEach((n) => levels[depthOf(n)].push(n));
    const stepY = CH / (maxDepth + 1);
    levels.forEach((lvl, d) => {
      const stepX = CW / lvl.length;
      lvl.forEach((node, i) => {
        placed.push({id: node.id, cx: stepX * (i + 0.5), cy: stepY * (d + 0.5), w: NW, h: NH, node});
      });
    });
    // edges: explicit, else parent->child
    const treeEdges = edges.length ? edges : nodes.filter((n) => n.parent).map((n) => ({from: n.parent!, to: n.id, atWord: n.atWord}));
    treeEdges.forEach((e) => {
      const a = byId(e.from); const b = byId(e.to);
      if (!a || !b) return;
      out.push({fromA: sideAnchor(a, 'bottom'), toA: sideAnchor(b, 'top'), kind: (e as {kind?: EdgeKind}).kind ?? 'curve', atWord: e.atWord ?? b.node.atWord, color: (e as {color?: SemColor}).color, dashed: (e as {dashed?: boolean}).dashed ?? true});
    });
    return {nodes: placed, edges: out, lifelines, sequence: false, msgLabels};
  }

  if (layout === 'hub') {
    // first node = center, rest on a ring
    const center = nodes[0];
    const sats = nodes.slice(1);
    const cx0 = CW / 2; const cy0 = CH / 2;
    const R = Math.min(CW, CH) * 0.36;
    if (center) placed.push({id: center.id, cx: cx0, cy: cy0, w: NW, h: NH, node: center});
    sats.forEach((node, i) => {
      const ang = (-Math.PI / 2) + (i / sats.length) * Math.PI * 2;
      placed.push({id: node.id, cx: cx0 + R * Math.cos(ang), cy: cy0 + R * Math.sin(ang), w: NW * 0.9, h: NH * 0.9, node});
    });
    const hubEdges = edges.length ? edges : sats.map((n) => ({from: center?.id ?? '', to: n.id, atWord: n.atWord}));
    hubEdges.forEach((e) => {
      const a = byId(e.from); const b = byId(e.to);
      if (!a || !b) return;
      const [sa, sb] = facing(a, b);
      out.push({fromA: sideAnchor(a, sa), toA: sideAnchor(b, sb), kind: (e as {kind?: EdgeKind}).kind ?? 'straight', atWord: e.atWord ?? b.node.atWord, color: (e as {color?: SemColor}).color ?? b.node.color, dashed: (e as {dashed?: boolean}).dashed ?? true});
    });
    return {nodes: placed, edges: out, lifelines, sequence: false, msgLabels};
  }

  // flow (default): chain along the long axis, aspect-aware
  let dir = data.direction === 'horizontal' ? false : data.direction === 'vertical' ? true : vertical;
  const n = nodes.length;
  // Never cram a long horizontal row into a phone frame — stack it instead.
  if (vertical && !dir && n > 3) dir = true;
  if (dir) {
    const stepY = CH / n;
    const nh = Math.min(NH, stepY - 30 * scale);
    nodes.forEach((node, i) => placed.push({id: node.id, cx: CW / 2, cy: stepY * (i + 0.5), w: NW, h: nh, node}));
  } else {
    const stepX = CW / n;
    const nw = Math.min(NW, stepX - 36 * scale); // guarantee a gap for the connector
    nodes.forEach((node, i) => placed.push({id: node.id, cx: stepX * (i + 0.5), cy: CH / 2, w: nw, h: NH, node}));
  }
  const flowEdges = edges.length ? edges : nodes.slice(1).map((n2, i) => ({from: nodes[i].id, to: n2.id, atWord: n2.atWord}));
  flowEdges.forEach((e) => {
    const a = byId(e.from); const b = byId(e.to);
    if (!a || !b) return;
    const [sa, sb] = facing(a, b);
    out.push({fromA: sideAnchor(a, sa), toA: sideAnchor(b, sb), kind: (e as {kind?: EdgeKind}).kind ?? 'curve', atWord: e.atWord ?? b.node.atWord, color: (e as {color?: SemColor}).color, dashed: (e as {dashed?: boolean}).dashed ?? true});
  });
  return {nodes: placed, edges: out, lifelines, sequence: false, msgLabels};
};
