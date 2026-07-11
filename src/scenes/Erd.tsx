import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {EdgeLabelChip} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// point on rectangle border in the direction of (tx,ty) from centre (cx,cy).
const rectEdge = (cx: number, cy: number, hw: number, hh: number, tx: number, ty: number) => {
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return {x: cx, y: cy};
  const sx = dx === 0 ? Infinity : hw / Math.abs(dx);
  const sy = dy === 0 ? Infinity : hh / Math.abs(dy);
  const s = Math.min(sx, sy);
  return {x: cx + dx * s, y: cy + dy * s};
};

// ERD — entity-relationship diagram. Table cards on a grid (header = table name,
// rows = column + muted type + PK/FK chip), relationships as edges with crow's-
// foot / bar ends via EdgeLabelChip. The narrated relationship is the single
// emphasis at its atWord. node-graph family.
export const Erd: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.erd;
  if (!d) return <AbsoluteFill />;

  const tables = (d.tables ?? []).slice(0, vertical ? 3 : 4);
  const cardW = (vertical ? 300 : 320) * scale;
  const headH = 52 * scale;
  const rowH = 40 * scale;
  const gapX = (vertical ? 120 : 220) * scale;
  const gapY = (vertical ? 80 : 120) * scale;

  // layout by col/row (fallback to a line)
  const laid = tables.map((tb, i) => ({tb, col: tb.col ?? (vertical ? 0 : i), row: tb.row ?? (vertical ? i : 0)}));
  const maxCol = Math.max(0, ...laid.map((l) => l.col));
  const maxRow = Math.max(0, ...laid.map((l) => l.row));
  const cardH = (tb: (typeof tables)[number]) => headH + Math.min(tb.columns.length, 6) * rowH;
  const maxH = Math.max(...tables.map(cardH));
  const cellW = cardW + gapX;
  const cellH = maxH + gapY;
  const totalW = (maxCol + 1) * cellW - gapX;
  const totalH = (maxRow + 1) * cellH - gapY;

  const rects: Record<string, {x: number; y: number; w: number; h: number}> = {};
  laid.forEach(({tb, col, row}) => {
    rects[tb.id] = {x: col * cellW, y: row * cellH, w: cardW, h: cardH(tb)};
  });

  // FIT-SCALE so a full row of 4 tables never overflows the frame width (at 4 tables
  // totalW ≈ 1940 > 1920). Shrink the whole diagram uniformly to the safe content
  // width — tables, edges and labels scale together and stay centred.
  const availW = (vertical ? 1080 : 1920) - 150 * scale;
  const fitScale = Math.min(1, availW / totalW);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 120 : 60) * scale : 0, position: 'relative', width: totalW, height: totalH, transform: `scale(${fitScale})`, transformOrigin: 'center center'}}>
        {/* edges */}
        <svg width={totalW} height={totalH} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {(d.relations ?? []).map((rel, i) => {
            const a = rects[rel.from];
            const b = rects[rel.to];
            if (!a || !b) return null;
            const ac = {x: a.x + a.w / 2, y: a.y + a.h / 2};
            const bc = {x: b.x + b.w / 2, y: b.y + b.h / 2};
            const pa = rectEdge(ac.x, ac.y, a.w / 2, a.h / 2, bc.x, bc.y);
            const pb = rectEdge(bc.x, bc.y, b.w / 2, b.h / 2, ac.x, ac.y);
            const st = wordToFrame(rel.atWord ?? d.atWord ?? 1) + 6;
            const draw = interpolate(frame, [st, st + 16], [0, 1], clamp);
            if (draw <= 0) return null;
            const emph = frame >= st && frame < st + 60;
            const c = emph ? sem('blue') : hexA(t.colors.text, 0.5);
            const x2 = pa.x + (pb.x - pa.x) * draw;
            const y2 = pa.y + (pb.y - pa.y) * draw;
            // crow's-foot / bar markers
            const ux = (pb.x - pa.x) / (Math.hypot(pb.x - pa.x, pb.y - pa.y) || 1);
            const uy = (pb.y - pa.y) / (Math.hypot(pb.x - pa.x, pb.y - pa.y) || 1);
            const nx = -uy;
            const ny = ux;
            const foot = (px: number, py: number, dirx: number, diry: number, card?: string) => {
              const m = 16 * scale;
              if (card === 'N') {
                return (
                  <g key={`${i}-${px}`}>
                    <line x1={px} y1={py} x2={px + dirx * m + nx * m} y2={py + diry * m + ny * m} stroke={c} strokeWidth={2 * scale} />
                    <line x1={px} y1={py} x2={px + dirx * m} y2={py + diry * m} stroke={c} strokeWidth={2 * scale} />
                    <line x1={px} y1={py} x2={px + dirx * m - nx * m} y2={py + diry * m - ny * m} stroke={c} strokeWidth={2 * scale} />
                  </g>
                );
              }
              return <line key={`${i}-${px}`} x1={px + nx * m} y1={py + ny * m} x2={px - nx * m} y2={py - ny * m} stroke={c} strokeWidth={2.5 * scale} />;
            };
            return (
              <g key={i}>
                <line x1={pa.x} y1={pa.y} x2={x2} y2={y2} stroke={c} strokeWidth={emph ? 3 * scale : 2 * scale} />
                {draw >= 1 ? foot(pa.x, pa.y, ux, uy, rel.fromCard) : null}
                {draw >= 1 ? foot(pb.x, pb.y, -ux, -uy, rel.toCard) : null}
                {draw >= 1 && rel.label ? <EdgeLabelChip x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} text={rel.label} color={emph ? 'blue' : undefined} scale={scale} /> : null}
              </g>
            );
          })}
        </svg>
        {/* table cards */}
        {laid.map(({tb}) => {
          const r = rects[tb.id];
          const st = wordToFrame(tb.atWord ?? d.atWord ?? 1) + 4;
          const show = interpolate(frame, [st, st + 12], [0, 1], clamp);
          const c = tb.color ? sem(tb.color) : sem('blue');
          return (
            <div key={tb.id} style={{position: 'absolute', left: r.x, top: r.y, width: r.w, opacity: show, transform: `translateY(${interpolate(show, [0, 1], [14 * scale, 0])}px)`, borderRadius: 12 * scale * t.style.cornerRadius, border: `${2 * scale}px solid ${t.colors.panelBorder}`, background: t.colors.panel, overflow: 'hidden', boxShadow: t.style.glow > 0 ? `0 ${8 * scale}px ${24 * scale}px ${hexA('#000', 0.3)}` : undefined}}>
              <div style={{height: headH, display: 'flex', alignItems: 'center', padding: `0 ${16 * scale}px`, background: hexA(c, 0.16), borderBottom: `${2 * scale}px solid ${hexA(c, 0.5)}`}}>
                <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 23 * scale, color: c, letterSpacing: '0.04em'}}>{tb.name}</span>
              </div>
              {tb.columns.slice(0, 6).map((col, j) => (
                <div key={j} style={{height: rowH, display: 'flex', alignItems: 'center', gap: 10 * scale, padding: `0 ${16 * scale}px`, borderBottom: j < Math.min(tb.columns.length, 6) - 1 ? `${1 * scale}px solid ${hexA(t.colors.panelBorder, 0.6)}` : undefined}}>
                  <span style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{col.name}</span>
                  {col.type ? <span style={{fontFamily: t.fonts.mono, fontSize: 17 * scale, color: t.colors.muted}}>{col.type}</span> : null}
                  {col.key ? <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 14 * scale, letterSpacing: '0.06em', color: col.key === 'pk' ? sem('yellow') : sem('purple'), background: hexA(col.key === 'pk' ? sem('yellow') : sem('purple'), 0.16), borderRadius: 5 * scale * t.style.cornerRadius, padding: `${2 * scale}px ${7 * scale}px`}}>{col.key.toUpperCase()}</span> : null}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
