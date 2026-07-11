import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CYCLE = ['blue', 'purple', 'green', 'orange', 'red', 'yellow'] as const;

type Tile = {x: number; y: number; w: number; h: number; idx: number};

// squarified treemap (Bruls et al.) — lays weighted areas into a rect keeping
// tiles as square as possible. `vals` are areas already scaled to the rect area.
const squarify = (vals: {a: number; idx: number}[], X: number, Y: number, W: number, H: number): Tile[] => {
  const out: Tile[] = [];
  let x = X, y = Y, w = W, h = H;
  const worst = (row: {a: number}[], side: number) => {
    const s = row.reduce((p, r) => p + r.a, 0);
    const mx = Math.max(...row.map((r) => r.a));
    const mn = Math.min(...row.map((r) => r.a));
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
  };
  let i = 0;
  while (i < vals.length) {
    const side = Math.min(w, h);
    let row: {a: number; idx: number}[] = [];
    let j = i;
    while (j < vals.length) {
      const test = [...row, vals[j]];
      if (row.length === 0 || worst(test, side) <= worst(row, side)) {
        row = test;
        j++;
      } else break;
    }
    const rowArea = row.reduce((p, r) => p + r.a, 0);
    if (w >= h) {
      const dw = rowArea / h || 0;
      let yy = y;
      for (const r of row) {
        const rh = r.a / (dw || 1);
        out.push({x, y: yy, w: dw, h: rh, idx: r.idx});
        yy += rh;
      }
      x += dw;
      w -= dw;
    } else {
      const dh = rowArea / w || 0;
      let xx = x;
      for (const r of row) {
        const rw = r.a / (dh || 1);
        out.push({x: xx, y, w: rw, h: dh, idx: r.idx});
        xx += rw;
      }
      y += dh;
      h -= dh;
    }
    i = j;
  }
  return out;
};

// TREEMAP — nested weighted rectangles: 2–12 items sized by value via a squarified
// layout (tiles stay near-square). Label + value sit inside each tile with a
// fit-to-tile font (hidden when the tile is too small). Tiles pop in staggered.
export const TreeMap: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.treemap;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const items = (d.items ?? []).slice(0, 12);
  const n = items.length;
  if (n < 2) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const W = (vertical ? 940 : 1520) * scale;
  const H = (vertical ? 900 : 640) * scale;
  const total = items.reduce((p, it) => p + Math.max(0, it.value), 0) || 1;
  // sort by value desc for a clean squarify, remembering the original index for colour
  const ordered = items.map((it, idx) => ({a: (Math.max(0, it.value) / total) * (W * H), idx})).sort((p, q) => q.a - p.a);
  const tiles = squarify(ordered, 0, 0, W, H);
  const gap = 5 * scale;

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 150 : 90) * scale}}>
        <div style={{position: 'relative', width: W, height: H}}>
          {tiles.map((tl, k) => {
            const it = items[tl.idx];
            const c = sem(it.color ?? CYCLE[tl.idx % CYCLE.length]);
            const start = wordToFrame(it.atWord ?? 1) + tl.idx * 2;
            const rv = spring({frame: frame - start, fps, config: {damping: 200}});
            const iw = tl.w - gap;
            const ih = tl.h - gap;
            const showText = iw > 70 * scale && ih > 52 * scale;
            const pad = 14 * scale;
            // fit the label to the tile's INNER width (minus padding) so it never clips
            const labSize = Math.max(14 * scale, Math.min(30 * scale, (iw - 2 * pad) / Math.max(1, String(it.label).length * 0.6), ih * 0.3));
            const valTxt = it.value.toLocaleString() + (d.unit ?? '');
            return (
              <div key={k} style={{position: 'absolute', left: tl.x, top: tl.y, width: iw, height: ih,
                transform: `scale(${interpolate(rv, [0, 1], [0.86, 1], clamp)})`, opacity: rv,
                background: `linear-gradient(150deg, ${hexA(c, 0.95)}, ${hexA(c, 0.72)})`,
                borderRadius: 10 * scale * t.style.cornerRadius,
                boxShadow: t.style.glow > 0 ? `0 0 ${14 * t.style.glow}px ${hexA(c, 0.35)}` : `0 ${4 * scale}px ${12 * scale}px ${hexA('#000000', 0.28)}`,
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: 14 * scale, boxSizing: 'border-box', overflow: 'hidden'}}>
                {showText ? (
                  <>
                    <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: labSize, color: t.colors.onAccent, lineHeight: 1.08}}>{it.label}</div>
                    <div style={{fontFamily: t.fonts.mono, fontSize: labSize * 0.78, color: hexA(t.colors.onAccent, 0.85), marginTop: 4 * scale, fontVariantNumeric: 'tabular-nums'}}>{valTxt}</div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
