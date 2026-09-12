import React from 'react';
import {hexA} from './ui';
import {
  MemProps, useMem, Stage, Tx, fit, drawOn, PageTile, Head, Mark, Padlock, Stamp, IconAt,
  one, all, num, fmt, clamp01, lerp, startOf, rnd, wrap,
} from './memVizKit';
import {Tank} from './memVizA';

// MEM VIZ — part B: what we measured, what the kernel side doesn't handle yet, and what
// could genuinely work. Same contract as part A: design-px canvas, per-element anchors,
// an OBJECT per beat.

const uniq = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) === i);

// ── codec-bars ─────────────────────────────────────────────────────────────────────────
// Compression ratios on a doubling axis, every bar growing out of the 1× line. Right of
// it the codec saved memory; LEFT of it the "compressed" page cost MORE than the page.
// items: text = group (page class), label = codec, value = ratio. token = the 1× caption.
export const CodecBars: React.FC<MemProps> = ({items, accent, token}) => {
  const m = useMem(accent);
  const {W, H, c, f, v} = m;
  const groups = uniq(items.map((i) => i.text ?? ''));
  const codecs = uniq(items.map((i) => i.label ?? ''));
  const G = Math.max(1, groups.length), K = Math.max(1, codecs.length);
  const palette = [c.a, c.green, c.purple, c.orange, c.blue];
  const codecCol = (k: string) => {
    const it = items.find((i) => i.label === k && i.color);
    return it ? m.col(it) : palette[codecs.indexOf(k) % palette.length];
  };
  const vals = items.map((i) => num(i.value, 1));
  const lo = 0.25;
  const hi = Math.max(16, Math.pow(2, Math.ceil(Math.log2(Math.max(1, ...vals)))));
  const legendH = f(38, 54), tokH = token ? f(30, 36) : 0, axisH = f(40, 46);
  const labelW = v.vertical ? 0 : 250;
  const ax0 = labelW + 20, aw = W - ax0 - f(110, 120);
  const x = (r: number) => ax0 + ((Math.log2(Math.max(lo, r)) - Math.log2(lo)) / (Math.log2(hi) - Math.log2(lo))) * aw;
  const headerH = v.vertical ? 40 : 0;
  const gGap = f(16, 30);
  const plotY0 = legendH + tokH;
  const plotH = H - plotY0 - axisH;
  // A chart of two or three bars must not be two hairlines in a tall pane (the short's
  // "below 1x" beat proofed that way): with few bars the cap relaxes and they take the room.
  const few = G * K <= 3;
  const barH = Math.max(10, Math.min(few ? f(64, 110) : f(30, 46), (plotH - (G - 1) * gGap - G * headerH) / (G * K) - 6));
  const rowH = barH + 6;
  const groupH = headerH + K * rowH;
  const total = G * groupH + (G - 1) * gGap;
  const gy0 = plotY0 + Math.max(0, (plotH - total) / 2);
  const ticks: number[] = [];
  for (let t = lo; t <= hi + 1e-9; t *= 2) ticks.push(t);
  let lx = 0;
  return (
    <Stage m={m}>
      {codecs.map((k, i) => {
        const it0 = items.find((it) => it.label === k);
        const w = 30 + k.length * f(17, 22) * 0.56 + 30;
        const x0 = lx;
        lx += w;
        return (
          <g key={i} opacity={Math.max(0.35, m.inn(it0))}>
            <rect x={x0} y={legendH / 2 - 9} width={18} height={18} rx={4} fill={codecCol(k)} />
            <Tx m={m} x={x0 + 28} y={legendH / 2} size={f(17, 22)} weight={700}>{k}</Tx>
          </g>
        );
      })}
      <rect x={x(lo)} y={plotY0} width={x(1) - x(lo)} height={plotH} fill={hexA(c.red, 0.07)} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={plotY0} y2={plotY0 + plotH} stroke={hexA(c.text, t === 1 ? 0 : 0.07)} strokeWidth={1.2} />
          <Tx m={m} x={x(t)} y={plotY0 + plotH + 22} size={f(15, 17)} mono fill={t === 1 ? c.text : c.dim} weight={t === 1 ? 800 : 500}
            anchor={t === lo ? 'start' : t >= hi ? 'end' : 'middle'}>
            {`${t < 1 ? t : fmt(t)}×`}
          </Tx>
        </g>
      ))}
      <line x1={x(1)} x2={x(1)} y1={plotY0 - 6} y2={plotY0 + plotH} stroke={c.text} strokeWidth={3} />
      {token ? <Tx m={m} x={x(1)} y={legendH + tokH / 2} size={f(15, 18)} weight={700} anchor="middle">{token}</Tx> : null}
      {groups.map((g, gi) => {
        const gy = gy0 + gi * (groupH + gGap);
        return (
          <g key={gi}>
            {v.vertical
              ? <Tx m={m} x={ax0} y={gy + headerH / 2 - 2} size={fit(g, W - 40, 24)} weight={800} fill={c.text}>{g}</Tx>
              : <Tx m={m} x={0} y={gy + groupH / 2} size={fit(g, labelW - 12, 20)} weight={800}>{g}</Tx>}
            {codecs.map((k, ki) => {
              const it = items.find((i) => i.text === g && i.label === k);
              if (!it) return null;
              const val = num(it.value, 1);
              const p = m.go(it, 22);
              const y = gy + headerH + ki * rowH;
              const end = lerp(x(1), x(val), p);
              const col = codecCol(k);
              const x0 = Math.min(x(1), end), w = Math.abs(end - x(1));
              return (
                <g key={ki} opacity={m.inn(it)}>
                  <rect x={x0} y={y} width={Math.max(2, w)} height={barH} rx={Math.min(6, barH / 3)} fill={hexA(col, 0.78)} />
                  <Tx m={m} x={val >= 1 ? end + 10 : end - 10} y={y + barH / 2} size={f(16, 20)} mono weight={800}
                    fill={val < 1 ? c.red : col} anchor={val >= 1 ? 'start' : 'end'} opacity={clamp01((p - 0.6) / 0.4)}>
                    {`${val.toFixed(2)}×`}
                  </Tx>
                </g>
              );
            })}
          </g>
        );
      })}
    </Stage>
  );
};

// ── page-mix ───────────────────────────────────────────────────────────────────────────
// A hundred squares per program, each square one per cent of its pages, coloured by
// what FluidRAM's encoder did with it. The red squares were stored raw.
// items: sub = group (program), text = zero|uniform|sparse|dense|raw, label, value = %
export const PageMix: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v, frame} = m;
  const groups = uniq(items.map((i) => i.sub ?? ''));
  const segs = uniq(items.map((i) => i.text ?? ''));
  const G = Math.max(1, groups.length);
  const palette = [c.a, c.green, c.purple, c.orange];
  const fixed: Record<string, string> = {zero: hexA(c.muted, 0.6), uniform: c.blue, sparse: c.green, dense: c.yellow, raw: c.red};
  const segCol = (k: string, i: number) => {
    const it = items.find((x) => x.text === k && x.color);
    return it ? m.col(it) : fixed[k] ?? palette[i % palette.length];
  };
  const legendW = v.vertical ? W : 560;
  const regionW = v.vertical ? W : W - legendW - 40;
  const titleH = f(40, 52);
  const cell = v.vertical
    ? Math.min((W - (G - 1) * 50) / G / 10, (H * 0.56 - titleH) / 10)
    : Math.min((regionW - (G - 1) * 60) / G / 10, (H - titleH - 10) / 10);
  const ws = cell * 10;
  const blockW = G * ws + (G - 1) * f(60, 50);
  const wx0 = (regionW - blockW) / 2;
  // 9:16 stacks waffles over legend; centre that stack in the pane rather than pinning it
  // to the top, which left the bottom third of the pane empty on the first proof.
  const stackH = titleH + ws + 60 + (segs.length + 1) * f(46, 56);
  const wy0 = v.vertical ? Math.max(10, (H - stackH) / 2) + titleH : (H - ws - titleH) / 2 + titleH;
  const counts = (g: string) => {
    const rows = segs.map((k) => ({k, v: num(items.find((i) => i.sub === g && i.text === k)?.value, 0)}));
    const fl = rows.map((r) => ({...r, n: Math.floor(r.v), rem: r.v - Math.floor(r.v)}));
    let left = 100 - fl.reduce((s, r) => s + r.n, 0);
    [...fl].sort((a, b) => b.rem - a.rem).forEach((r) => { if (left > 0 && r.v > 0) { r.n += 1; left -= 1; } });
    return fl;
  };
  const lgx = v.vertical ? 20 : regionW + 40;
  const lgy = v.vertical ? wy0 + ws + 60 : (H - (segs.length + 1) * f(46, 56)) / 2 + f(20, 28);
  const rowL = f(46, 56);
  const colW = f(120, 130);
  const nameW = legendW - G * colW - 30;
  return (
    <Stage m={m}>
      {groups.map((g, gi) => {
        const gx = wx0 + gi * (ws + f(60, 50));
        const cs = counts(g);
        let idx = 0;
        const cells: React.ReactNode[] = [];
        cs.forEach((r, si) => {
          const it = items.find((i) => i.sub === g && i.text === r.k);
          const s0 = startOf(it);
          for (let j = 0; j < r.n && idx < 100; j++, idx++) {
            const p = s0 == null ? m.base : clamp01((frame - s0 - j * 0.35) / 6);
            const col = segCol(r.k, si);
            cells.push(
              <rect key={idx} x={gx + (idx % 10) * cell + cell * 0.08} y={wy0 + Math.floor(idx / 10) * cell + cell * 0.08}
                width={cell * 0.84} height={cell * 0.84} rx={cell * 0.14}
                fill={p > 0.01 ? hexA(col, 0.25 + 0.55 * p) : hexA(c.text, 0.04)} stroke={p > 0.01 ? col : hexA(c.text, 0.1)} strokeWidth={1.2} />,
            );
          }
        });
        return (
          <g key={gi}>
            <Tx m={m} x={gx} y={wy0 - titleH / 2 - 2} size={fit(g, ws + 40, f(20, 26))} weight={800}>{g}</Tx>
            {cells}
          </g>
        );
      })}
      {groups.map((g, gi) => (
        <Tx key={gi} m={m} x={lgx + nameW + gi * colW + colW - 10} y={lgy - rowL * 0.7} size={fit(g, colW, f(15, 19))} weight={700} fill={c.dim} anchor="end">{g}</Tx>
      ))}
      {segs.map((k, si) => {
        const its = items.filter((i) => i.text === k);
        const p = Math.max(...its.map((i) => m.inn(i)));
        const y = lgy + si * rowL;
        const col = segCol(k, si);
        return (
          <g key={k} opacity={0.3 + 0.7 * p}>
            <rect x={lgx} y={y - 11} width={22} height={22} rx={5} fill={hexA(col, 0.8)} />
            <Tx m={m} x={lgx + 34} y={y} size={fit(its[0]?.label, nameW - 40, f(18, 22))} weight={700}>{its[0]?.label}</Tx>
            {groups.map((g, gi) => {
              const it = items.find((i) => i.sub === g && i.text === k);
              return (
                <Tx key={gi} m={m} x={lgx + nameW + gi * colW + colW - 10} y={y} size={f(18, 22)} mono weight={800} fill={col} anchor="end">
                  {it ? `${num(it.value).toFixed(1)}%` : '—'}
                </Tx>
              );
            })}
          </g>
        );
      })}
    </Stage>
  );
};

// ── sparsity-ruler ─────────────────────────────────────────────────────────────────────
// A ruler of "non-zero bytes in a page", 0 to 4,096. Sparse mode only works left of the
// 1,024 wall. Each population's median slides to where it really sits.
// roles: pop (value = median) · limit (value = the wall). token = axis caption.
export const SparsityRuler: React.FC<MemProps> = ({items, accent, token}) => {
  const m = useMem(accent);
  const {W, H, c, f} = m;
  const pops = all(items, 'pop'), limit = one(items, 'limit');
  const lim = num(limit?.value, 1024);
  const ax0 = f(40, 34), aw = W - 2 * ax0;
  const xOf = (b: number) => ax0 + clamp01(b / 4096) * aw;
  const axisY = H - f(66, 90);
  const laneTop = f(44, 70);
  const laneH = Math.min(f(96, 170), (axisY - laneTop - 16) / Math.max(1, pops.length));
  const palette = [c.a, c.orange, c.purple, c.green];
  const pL = m.inn(limit);
  return (
    <Stage m={m}>
      <rect x={xOf(0)} y={laneTop - 10} width={xOf(lim) - xOf(0)} height={axisY - laneTop + 10} fill={hexA(c.green, 0.08 * pL)} />
      <line x1={xOf(lim)} x2={xOf(lim)} y1={laneTop - 26} y2={axisY} stroke={c.red} strokeWidth={3} strokeDasharray="8 6" opacity={pL} />
      {limit ? (
        <Tx m={m} x={xOf(lim) + 12} y={laneTop - 22} size={fit(limit.label, W - xOf(lim) - 30, f(17, 21))} weight={800} fill={c.red} opacity={pL}>{limit.label}</Tx>
      ) : null}
      <line x1={ax0} x2={ax0 + aw} y1={axisY} y2={axisY} stroke={c.dim} strokeWidth={2.5} {...drawOn(m.base)} />
      {Array.from({length: 9}).map((_, i) => {
        const b = i * 512;
        return (
          <g key={i}>
            <line x1={xOf(b)} x2={xOf(b)} y1={axisY - 7} y2={axisY + 7} stroke={c.dim} strokeWidth={2} />
            <Tx m={m} x={xOf(b)} y={axisY + 24} size={f(15, 16)} mono fill={b === lim ? c.red : c.dim} anchor="middle" weight={b === lim ? 800 : 500}>
              {i % 2 === 0 || b === lim ? fmt(b) : ''}
            </Tx>
          </g>
        );
      })}
      {token ? <Tx m={m} x={ax0 + aw / 2} y={axisY + f(50, 60)} size={f(15, 18)} fill={c.dim} anchor="middle">{token}</Tx> : null}
      {pops.map((pp, i) => {
        const y = laneTop + (i + 0.5) * laneH;
        const col = m.col(pp, palette[i % palette.length]);
        const pg = m.go(pp, 24);
        const med = num(pp.value);
        const x = lerp(xOf(0), xOf(med), pg);
        const right = xOf(med) < W * 0.62;
        return (
          <g key={i} opacity={m.inn(pp)}>
            <line x1={ax0} x2={ax0 + aw} y1={y} y2={y} stroke={hexA(c.text, 0.08)} strokeWidth={2} />
            <line x1={x} x2={x} y1={y} y2={axisY} stroke={hexA(col, 0.5)} strokeWidth={2} strokeDasharray="4 5" />
            <circle cx={x} cy={y} r={f(12, 15)} fill={col} />
            <Tx m={m} x={right ? x + 24 : x - 24} y={y - f(13, 18)} size={f(19, 24)} weight={800} fill={col} anchor={right ? 'start' : 'end'}>
              {`${pp.label} · ${fmt(med)}`}
            </Tx>
            <Tx m={m} x={right ? x + 24 : x - 24} y={y + f(14, 20)} size={fit(pp.sub, right ? W - x - 40 : x - 40, f(15, 19))} fill={c.dim} anchor={right ? 'start' : 'end'}>
              {pp.sub}
            </Tx>
          </g>
        );
      })}
    </Stage>
  );
};

// ── slab-buckets ───────────────────────────────────────────────────────────────────────
// kmalloc's fixed box sizes as a row of cups. A chunk drops into the smallest cup it
// fits; whatever it doesn't fill is still allocated. A raw 4,108-byte page needs the
// 8 KB cup. Under it, zram's allocator: a comb of 16-byte steps.
// roles: chunk (value = bytes) · zram
const BINS = [16, 32, 64, 96, 128, 192, 256, 512, 1024, 2048, 4096, 8192];
const binName = (b: number) => (b >= 1024 ? `${b / 1024}K` : String(b));
export const SlabBuckets: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f} = m;
  const chunks = all(items, 'chunk'), zr = one(items, 'zram');
  const n = BINS.length;
  const gap = f(12, 8);
  const bw = (W - 20 - (n - 1) * gap) / n;
  const labelsH = f(34, 40), zramH = zr ? f(84, 120) : 0, topH = f(96, 170);
  const cupBottom = H - zramH - labelsH;
  const hMax = cupBottom - topH, hMin = hMax * 0.3;
  const cupH = (b: number) => hMin + ((Math.log2(b) - 4) / (13 - 4)) * (hMax - hMin);
  const binOf = (bytes: number) => {
    const i = BINS.findIndex((b) => b >= bytes);
    return i < 0 ? n - 1 : i;
  };
  const bx = (i: number) => 10 + i * (bw + gap);
  const palette = [c.a, c.green, c.orange, c.purple];
  const used = new Map<number, number>();
  return (
    <Stage m={m}>
      {BINS.map((b, i) => {
        const x = bx(i), top = cupBottom - cupH(b);
        return (
          <g key={b} opacity={m.base}>
            <path d={`M ${x} ${top} V ${cupBottom - 8} Q ${x} ${cupBottom} ${x + 8} ${cupBottom} H ${x + bw - 8} Q ${x + bw} ${cupBottom} ${x + bw} ${cupBottom - 8} V ${top}`}
              fill={hexA(c.text, 0.03)} stroke={c.dim} strokeWidth={2.2} />
            <line x1={x - 3} x2={x + 6} y1={top} y2={top} stroke={c.dim} strokeWidth={2.2} />
            <line x1={x + bw - 6} x2={x + bw + 3} y1={top} y2={top} stroke={c.dim} strokeWidth={2.2} />
            <Tx m={m} x={x + bw / 2} y={cupBottom + labelsH / 2 + 2} size={Math.min(f(16, 16), bw * 0.34)} mono fill={c.dim} anchor="middle">{binName(b)}</Tx>
          </g>
        );
      })}
      {chunks.map((ck, ci) => {
        const bytes = num(ck.value, 100);
        const bi = binOf(bytes);
        const b = BINS[bi];
        const x = bx(bi), ch = cupH(b), top = cupBottom - ch;
        const col = m.col(ck, palette[ci % palette.length]);
        const pFall = m.land(ck, 20), pFill = m.go(ck, 14, 20);
        const blockH = f(30, 36), blockW = Math.max(bw * 1.4, f(96, 110));
        const blockY = lerp(8, top - blockH - 4, Math.min(1, pFall));
        const fillH = ch * clamp01(bytes / b) * pFill;
        const row = used.get(bi) ?? 0;
        used.set(bi, row + 1);
        const tier = ci % 2;
        const cx = Math.max(90, Math.min(W - 90, x + bw / 2));
        return (
          <g key={ci} opacity={m.inn(ck)}>
            <rect x={x + 3} y={cupBottom - fillH - 1} width={bw - 6} height={fillH} rx={4} fill={hexA(col, 0.55)} />
            {pFill > 0.5 ? (
              <rect x={x + 3} y={top + 2} width={bw - 6} height={Math.max(0, ch - fillH - 4)} fill="none" stroke={hexA(col, 0.6)} strokeWidth={1.5} strokeDasharray="4 4" />
            ) : null}
            <g opacity={1 - pFill}>
              <rect x={x + bw / 2 - blockW / 2} y={blockY} width={blockW} height={blockH} rx={6} fill={hexA(col, 0.6)} stroke={col} strokeWidth={2} />
              <Tx m={m} x={x + bw / 2} y={blockY + blockH / 2} size={f(15, 17)} mono weight={800} anchor="middle">{`${fmt(bytes)} B`}</Tx>
            </g>
            <g opacity={clamp01(pFill * 1.5)}>
              <Tx m={m} x={cx} y={topH * (tier ? 0.62 : 0.2)} size={fit(ck.label, 200, f(16, 19))} weight={800} fill={col} anchor="middle">{ck.label}</Tx>
              <Tx m={m} x={cx} y={topH * (tier ? 0.62 : 0.2) + f(22, 26)} size={f(16, 19)} mono weight={700} anchor="middle">{`${fmt(bytes)} → ${fmt(b)}`}</Tx>
              <line x1={x + bw / 2} x2={x + bw / 2} y1={topH * (tier ? 0.62 : 0.2) + f(36, 42)} y2={top - 6} stroke={hexA(col, 0.5)} strokeWidth={1.5} strokeDasharray="3 4" />
            </g>
          </g>
        );
      })}
      {zr ? (
        <g opacity={m.inn(zr)}>
          <Tx m={m} x={10} y={cupBottom + labelsH + f(22, 30)} size={fit(zr.label, W * 0.6, f(17, 21))} weight={800} fill={c.green}>{zr.label}</Tx>
          <Tx m={m} x={W - 10} y={cupBottom + labelsH + f(22, 30)} size={fit(zr.sub, W * 0.36, f(15, 18))} fill={c.dim} anchor="end">{zr.sub}</Tx>
          <rect x={10} y={cupBottom + labelsH + f(40, 54)} width={W - 20} height={f(24, 30)} rx={4} fill={hexA(c.green, 0.06)} stroke={hexA(c.green, 0.6)} strokeWidth={1.5} />
          {Array.from({length: 257}).map((_, i) => (
            <line key={i} x1={10 + (i / 256) * (W - 20)} x2={10 + (i / 256) * (W - 20)} y1={cupBottom + labelsH + f(40, 54)}
              y2={cupBottom + labelsH + f(40, 54) + (i % 16 === 0 ? f(24, 30) : f(9, 11))} stroke={hexA(c.green, i % 16 === 0 ? 0.9 : 0.45)} strokeWidth={1} />
          ))}
        </g>
      ) : null}
    </Stage>
  );
};

// ── decode-race ────────────────────────────────────────────────────────────────────────
// Time to read one page back, per path, to one linear scale. The scatter's sliver
// against the checksum's long bar — and the difference between them hatched and named.
// roles: lane (value = ns) · gap (value = index of the lane it is measured from)
export const DecodeRace: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v} = m;
  const lanes = all(items, 'lane'), gap = one(items, 'gap');
  const max = Math.max(1, ...lanes.map((l) => num(l.value, 1)));
  const labelW = v.vertical ? 0 : 380;
  const ax0 = labelW + 20, aw = W - ax0 - f(160, 150);
  const axisH = f(40, 44);
  const nL = Math.max(1, lanes.length);
  const laneH = Math.min(f(84, 170), (H - axisH - 16) / nL);
  const barH = Math.min(f(34, 46), laneH * 0.46);
  const xOf = (ns: number) => ax0 + (ns / max) * aw;
  const steps = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
  const step = steps.find((s) => max / s <= 6) ?? 100000;
  const tickN = Math.floor(max / step);
  const yTop = (H - axisH - nL * laneH) / 2;
  const laneY = (i: number) => yTop + i * laneH + laneH / 2 + (v.vertical ? laneH * 0.16 : 0);
  const palette = [c.green, c.a, c.orange, c.red];
  const base = gap ? Math.round(num(gap.value, 0)) : 0;
  const target = lanes.reduce((b, l, i) => (num(l.value) > num(lanes[b]?.value) ? i : b), 0);
  const pG = m.go(gap, 22);
  const nsLabel = (ns: number) => (ns >= 1000 ? `${fmt(ns / 1000, ns % 1000 ? 1 : 0)} µs` : `${fmt(ns)} ns`);
  return (
    <Stage m={m}>
      <defs>
        <pattern id="mem-race-hatch" width={10} height={10} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={10} stroke={c.yellow} strokeWidth={4} strokeOpacity={0.55} />
        </pattern>
      </defs>
      {Array.from({length: tickN + 1}).map((_, i) => (
        <g key={i}>
          <line x1={xOf(i * step)} x2={xOf(i * step)} y1={yTop} y2={H - axisH} stroke={hexA(c.text, i === 0 ? 0.4 : 0.07)} strokeWidth={1.2} />
          <Tx m={m} x={xOf(i * step)} y={H - axisH + 20} size={f(14, 16)} mono fill={c.dim} anchor="middle">{nsLabel(i * step)}</Tx>
        </g>
      ))}
      {lanes.map((l, i) => {
        const val = num(l.value, 1);
        const p = m.go(l, 26);
        const y = laneY(i);
        const col = m.col(l, palette[i % palette.length]);
        const w = Math.max(4, (xOf(val) - ax0) * p);
        return (
          <g key={i} opacity={m.inn(l)}>
            {v.vertical ? (
              <>
                <Tx m={m} x={ax0} y={y - barH / 2 - f(0, 50)} size={fit(l.label, W - 60, 24)} weight={800}>{l.label}</Tx>
                <Tx m={m} x={ax0} y={y - barH / 2 - f(0, 22)} size={fit(l.sub, W - 60, 18)} fill={c.dim}>{l.sub}</Tx>
              </>
            ) : (
              <>
                <Tx m={m} x={0} y={y - 12} size={fit(l.label, labelW - 10, 20)} weight={800}>{l.label}</Tx>
                <Tx m={m} x={0} y={y + 14} size={fit(l.sub, labelW - 10, 16)} fill={c.dim}>{l.sub}</Tx>
              </>
            )}
            <rect x={ax0} y={y - barH / 2} width={w} height={barH} rx={Math.min(6, barH / 3)} fill={hexA(col, 0.78)} />
            <Tx m={m} x={ax0 + w + 12} y={y} size={f(18, 22)} mono weight={800} fill={col} opacity={clamp01((p - 0.5) * 2)}>{`${fmt(val)} ns`}</Tx>
          </g>
        );
      })}
      {gap && lanes[base] && lanes[target] && target !== base ? (() => {
        const y = laneY(target);
        const xa = xOf(num(lanes[base].value)), xb = xOf(num(lanes[target].value));
        return (
          <g opacity={pG}>
            <rect x={xa} y={y - barH / 2} width={(xb - xa) * pG} height={barH} fill="url(#mem-race-hatch)" />
            <path d={`M ${xa} ${y - barH / 2 - 10} V ${y - barH / 2 - 20} H ${xb} V ${y - barH / 2 - 10}`} fill="none" stroke={c.yellow} strokeWidth={2.5} {...drawOn(pG)} />
            <Tx m={m} x={(xa + xb) / 2} y={y - barH / 2 - f(34, 38)} size={fit(gap.label, xb - xa, f(18, 22))} weight={800} fill={c.yellow} anchor="middle">{gap.label}</Tx>
          </g>
        );
      })() : null}
    </Stage>
  );
};

// ── no-cap ─────────────────────────────────────────────────────────────────────────────
// Two tanks filling. FluidRAM's has no limit line: it rises past the rim and spills into
// the rest of RAM. zram's gets a red limit, and the next page bounces off it.
// roles: fr · zram · limit
export const NoCap: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, frame} = m;
  const fr = one(items, 'fr'), zr = one(items, 'zram'), limit = one(items, 'limit');
  const gap = f(260, 110);
  const tw = Math.min(f(300, 320), (W - gap - 120) / 2);
  const labH = f(64, 90), subH = f(56, 80);
  const th = Math.min(H - labH - subH, f(9999, 560));
  const x0 = (W - (2 * tw + gap)) / 2;
  const ty = labH + (H - labH - subH - th) / 2;
  const tanks = [{it: fr, x: x0, col: c.orange}, {it: zr, x: x0 + tw + gap, col: c.green}];
  const capL = 0.76;
  const frLevel = lerp(0.22, 1.12, m.go(fr, 84));
  const zrLevel = lerp(0.22, capL, m.go(zr, 60));
  const spill = clamp01((frLevel - 1) / 0.12);
  const pL = m.inn(limit), pB = m.go(limit, 26, 12);
  const drops = (it: typeof fr, x: number, level: number, stopAt?: number | null) => {
    const s0 = startOf(it);
    if (s0 == null && it?.atWord != null) return null;
    const s = s0 ?? 0;
    return Array.from({length: 8}).map((_, i) => {
      const st = s + i * 10;
      if (stopAt != null && st > stopAt) return null;
      const p = clamp01((frame - st) / 10);
      if (p <= 0 || p >= 1) return null;
      const surf = ty + th - Math.min(1, level) * th;
      const s2 = f(22, 26);
      return <PageTile key={i} x={x + tw / 2 - s2 / 2 + (i % 3 - 1) * 30} y={lerp(ty - 44, surf - s2, p)} s={s2} fill={hexA(c.text, 0.25)} stroke={c.text} sw={1.5} />;
    });
  };
  const limS = startOf(limit);
  const lineY = ty + th - capL * th;
  const bounceY = lineY - s2b() - Math.sin(pB * Math.PI) * 60;
  function s2b() { return f(26, 30); }
  return (
    <Stage m={m}>
      {tanks.map((tk, i) => (
        <g key={i} opacity={m.inn(tk.it)}>
          <Tx m={m} x={tk.x + tw / 2} y={ty - labH / 2} size={fit(tk.it?.label, tw + gap * 0.8, f(20, 26))} weight={800} anchor="middle">{tk.it?.label}</Tx>
          <Tank m={m} x={tk.x} y={ty} w={tw} h={th} level={i === 0 ? frLevel : zrLevel} color={tk.col} id={`mem-cap-${i}`} />
          <Tx m={m} x={tk.x + tw / 2} y={ty + th + subH / 2} size={fit(tk.it?.sub, tw + gap * 0.8, f(16, 20))} fill={i === 0 && spill > 0.3 ? c.orange : c.dim} weight={700} anchor="middle">
            {tk.it?.sub}
          </Tx>
        </g>
      ))}
      {drops(fr, x0, frLevel)}
      {drops(zr, x0 + tw + gap, zrLevel, limS)}
      {/* the spill over FluidRAM's rim */}
      {spill > 0.01 ? (
        <g>
          <path d={`M ${x0 + tw - 10} ${ty + 2} Q ${x0 + tw + 16} ${ty - 6} ${x0 + tw + 18} ${ty + 30} V ${ty + th - 4}`} fill="none"
            stroke={hexA(c.orange, 0.65)} strokeWidth={10} strokeLinecap="round" {...drawOn(spill)} />
          <ellipse cx={x0 + tw + 40} cy={ty + th + 4} rx={50 * spill} ry={8 * spill} fill={hexA(c.orange, 0.5)} />
        </g>
      ) : null}
      {limit ? (
        <g>
          <line x1={x0 + tw + gap - 12} x2={x0 + 2 * tw + gap + 12} y1={lineY} y2={lineY} stroke={c.red} strokeWidth={3.5} {...drawOn(pL)} />
          <Tx m={m} x={x0 + tw + gap + tw / 2} y={lineY - f(22, 28)} size={fit(limit.label, tw - 20, f(17, 21))} weight={800} fill={c.red} anchor="middle" opacity={pL}>{limit.label}</Tx>
          {pB > 0.01 && pB < 0.999 ? (
            <g>
              <PageTile x={x0 + tw + gap + tw / 2 - s2b() / 2} y={bounceY} s={s2b()} fill={hexA(c.red, 0.3)} stroke={c.red} opacity={1 - clamp01((pB - 0.7) / 0.3)} />
            </g>
          ) : null}
          <Mark cx={x0 + tw + gap + tw + f(40, 36)} cy={lineY} s={f(30, 34)} ok={false} color={c.red} p={clamp01((pB - 0.4) / 0.4)} />
        </g>
      ) : null}
    </Stage>
  );
};

// ── abba-lock ──────────────────────────────────────────────────────────────────────────
// Two CPUs, two locks. Each takes its own pool's lock, then reaches for its neighbour's:
// the arrows close into a loop and nothing can ever move again.
// roles: cpu0 · cpu1 · lockA · lockB · take · wait · cycle
export const AbbaLock: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v} = m;
  const c0 = one(items, 'cpu0'), c1 = one(items, 'cpu1'), la = one(items, 'lockA'), lb = one(items, 'lockB');
  const take = one(items, 'take'), wait = one(items, 'wait'), cycle = one(items, 'cycle');
  const bannerH = cycle ? f(50, 80) : 0;
  const HH = H - bannerH;
  const P = v.vertical
    ? {c0: {x: W / 2, y: HH * 0.15}, c1: {x: W / 2, y: HH * 0.85}, A: {x: W * 0.2, y: HH / 2}, B: {x: W * 0.8, y: HH / 2}}
    : {c0: {x: W * 0.15, y: HH / 2}, c1: {x: W * 0.85, y: HH / 2}, A: {x: W / 2, y: HH * 0.19}, B: {x: W / 2, y: HH * 0.77}};
  const cs = f(100, 130), ls = f(56, 78);
  const colA = m.col(c0, c.a), colB = m.col(c1, c.purple);
  const pT = m.go(take, 18), pW = m.go(wait, 20), pC = m.inn(cycle);
  const rot = cycle ? Math.max(0, m.since(cycle)) * 2.2 : 0;
  const trim = (a: {x: number; y: number}, b: {x: number; y: number}, ra: number, rb: number) => {
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
    return {x0: a.x + (dx / d) * ra, y0: a.y + (dy / d) * ra, x1: b.x - (dx / d) * rb, y1: b.y - (dy / d) * rb, ang: Math.atan2(dy, dx)};
  };
  const edge = (from: {x: number; y: number}, to: {x: number; y: number}, col: string, p: number, dashed: boolean, k: string) => {
    const e = trim(from, to, cs * 0.62, ls * 0.78);
    const colr = pC > 0.02 ? c.red : col;
    return (
      <g key={k} opacity={p > 0.01 ? 1 : 0}>
        <line x1={e.x0} y1={e.y0} x2={lerp(e.x0, e.x1, p)} y2={lerp(e.y0, e.y1, p)} stroke={colr} strokeWidth={dashed ? 3 : 4.5}
          strokeDasharray={dashed ? '10 8' : undefined} />
        {p > 0.97 ? <Head x={e.x1} y={e.y1} ang={e.ang} s={14} color={colr} /> : null}
      </g>
    );
  };
  const chip = (p: {x: number; y: number}, it: typeof c0, col: string) => (
    <g opacity={m.inn(it)}>
      {Array.from({length: 5}).map((_, i) => {
        const o = -cs * 0.32 + i * cs * 0.16;
        return (
          <g key={i} stroke={c.dim} strokeWidth={3}>
            <line x1={p.x + o} x2={p.x + o} y1={p.y - cs / 2 - 10} y2={p.y - cs / 2} />
            <line x1={p.x + o} x2={p.x + o} y1={p.y + cs / 2} y2={p.y + cs / 2 + 10} />
            <line x1={p.x - cs / 2 - 10} x2={p.x - cs / 2} y1={p.y + o} y2={p.y + o} />
            <line x1={p.x + cs / 2} x2={p.x + cs / 2 + 10} y1={p.y + o} y2={p.y + o} />
          </g>
        );
      })}
      <rect x={p.x - cs / 2} y={p.y - cs / 2} width={cs} height={cs} rx={12} fill={hexA(col, 0.14)} stroke={col} strokeWidth={3} />
      <Tx m={m} x={p.x} y={p.y} size={fit(it?.label, cs - 16, f(20, 26))} weight={800} anchor="middle">{it?.label}</Tx>
      {it?.sub ? (
        <Tx m={m} x={p.x} y={v.vertical ? p.y + (p.y < HH / 2 ? -cs / 2 - 34 : cs / 2 + 36) : p.y + cs / 2 + 34}
          size={fit(it.sub, v.vertical ? W - 40 : W * 0.28, f(15, 19))} fill={c.dim} anchor="middle">{it.sub}</Tx>
      ) : null}
    </g>
  );
  const lock = (p: {x: number; y: number}, it: typeof la, col: string) => (
    <g opacity={m.inn(it)}>
      <Padlock m={m} cx={p.x} cy={p.y} s={ls} color={pT > 0.5 ? (pC > 0.02 ? c.red : col) : c.dim} closed={pT} />
      <Tx m={m} x={p.x} y={v.vertical ? p.y + ls * 0.85 + 14 : (p.y < HH / 2 ? p.y - ls * 0.95 - 8 : p.y + ls * 0.7 + 22)}
        size={fit(it?.label, f(420, 260), f(16, 20))} weight={700} fill={c.dim} anchor="middle">{it?.label}</Tx>
    </g>
  );
  const ctr = {x: W / 2, y: HH / 2};
  const rr = f(34, 50);
  return (
    <Stage m={m}>
      {edge(P.c0, P.A, colA, pT, false, 'h0')}
      {edge(P.c1, P.B, colB, pT, false, 'h1')}
      {edge(P.c0, P.B, colA, pW, true, 'w0')}
      {edge(P.c1, P.A, colB, pW, true, 'w1')}
      {chip(P.c0, c0, colA)}
      {chip(P.c1, c1, colB)}
      {lock(P.A, la, colA)}
      {lock(P.B, lb, colB)}
      {cycle ? (
        <g opacity={pC}>
          <g transform={`rotate(${rot} ${ctr.x} ${ctr.y})`}>
            <path d={`M ${ctr.x + rr} ${ctr.y} A ${rr} ${rr} 0 0 1 ${ctr.x - rr} ${ctr.y}`} fill="none" stroke={c.red} strokeWidth={4} />
            <path d={`M ${ctr.x - rr} ${ctr.y} A ${rr} ${rr} 0 0 1 ${ctr.x + rr} ${ctr.y}`} fill="none" stroke={c.red} strokeWidth={4} />
            <Head x={ctr.x - rr} y={ctr.y} ang={-Math.PI / 2} s={13} color={c.red} />
            <Head x={ctr.x + rr} y={ctr.y} ang={Math.PI / 2} s={13} color={c.red} />
          </g>
          <Tx m={m} x={W / 2} y={H - bannerH / 2} size={fit(cycle.label, W - 40, f(20, 26))} weight={800} fill={c.red} anchor="middle">{cycle.label}</Tx>
        </g>
      ) : null}
    </Stage>
  );
};

// ── fault-path ─────────────────────────────────────────────────────────────────────────
// The route a page fault takes, down through user space, the kernel and the device —
// and the -ENOMEM travelling back up it, stopping in reclaim. The program never sees it.
// roles: band (label) · stage (value = band index) · error · lands (value = stage index) · oom
export const FaultPath: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v} = m;
  const bands = all(items, 'band'), stages = all(items, 'stage');
  const err = one(items, 'error'), lands = one(items, 'lands'), oom = one(items, 'oom');
  const n = Math.max(1, stages.length), nb = Math.max(1, bands.length);
  const L = Math.max(0, Math.min(n - 1, Math.round(num(lands?.value, n - 2))));
  const bandOf = (s: typeof stages[number]) => Math.max(0, Math.min(nb - 1, Math.round(num(s.value, 0))));
  // 9:16: the band names move to each band's top-right corner, so the nodes can sit in a
  // left column and the error, its landing note and the OOM line get a right column of
  // their own. The first layout gave them ~120px beside the nodes and they ran off-pane.
  const bl = v.vertical ? 0 : 150;
  const nodeW = v.vertical ? W * 0.56 : Math.min(290, (W - bl - 40) / n - 26);
  const sideX = 24 + nodeW + 26;
  const nodeH = f(74, 88);
  const slot = v.vertical ? (H - 20) / n : 0;
  const bandH = v.vertical ? 0 : H / nb;
  const pos = stages.map((s, i) => (v.vertical
    ? {x: 24 + nodeW / 2, y: 10 + slot * (i + 0.5)}
    : {x: bl + 20 + nodeW / 2 + (i * (W - bl - 40 - nodeW)) / Math.max(1, n - 1), y: bandH * (bandOf(s) + 0.5)}));
  const bandRange = (b: number) => {
    if (!v.vertical) return {y0: b * bandH, y1: (b + 1) * bandH};
    const ys = stages.map((s, i) => (bandOf(s) === b ? i : -1)).filter((i) => i >= 0);
    if (!ys.length) return null;
    return {y0: 10 + slot * Math.min(...ys), y1: 10 + slot * (Math.max(...ys) + 1)};
  };
  const bandTint = [c.a, c.purple, c.orange, c.green];
  const trimRect = (a: {x: number; y: number}, b: {x: number; y: number}) => {
    const dx = b.x - a.x, dy = b.y - a.y;
    const t = Math.min(Math.abs(dx) > 0.01 ? (nodeW / 2 + 4) / Math.abs(dx) : 1e9, Math.abs(dy) > 0.01 ? (nodeH / 2 + 4) / Math.abs(dy) : 1e9);
    return {x0: a.x + dx * t, y0: a.y + dy * t, x1: b.x - dx * t, y1: b.y - dy * t, ang: Math.atan2(dy, dx)};
  };
  const pE = m.go(err, 34);
  const along = () => {
    const segs = n - 1 - L;
    if (segs <= 0 || !pos.length) return pos[L] ?? {x: 0, y: 0};
    const t = pE * segs;
    const k = Math.min(segs - 1, Math.floor(t));
    const a = pos[n - 1 - k], b = pos[n - 2 - k];
    const u = t - k;
    return {x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u)};
  };
  const ebW = fit(err?.label, 400, f(20, 24), true) * (err?.label?.length ?? 6) * 0.61 + 26;
  // The error travels back up the path, then COMES TO REST BESIDE the reclaim node rather
  // than on it — parked on the node it hid the node's own label.
  const onPath = along();
  const rest = pos[L] ? (v.vertical
    ? {x: sideX + ebW / 2, y: pos[L].y - 24}
    : {x: pos[L].x, y: pos[L].y - nodeH / 2 - 26}) : onPath;
  const tail = clamp01((pE - 0.82) / 0.18);
  const eb = {x: lerp(onPath.x, rest.x, tail), y: lerp(onPath.y, rest.y, tail)};
  const pLand = m.inn(lands), pO = m.land(oom, 18);
  return (
    <Stage m={m}>
      {bands.map((b, i) => {
        const r = bandRange(i);
        if (!r) return null;
        const col = bandTint[i % bandTint.length];
        return (
          <g key={i} opacity={m.inn(b)}>
            <rect x={0} y={r.y0 + 2} width={W} height={r.y1 - r.y0 - 4} rx={10} fill={hexA(col, 0.06)} stroke={hexA(col, 0.25)} strokeWidth={1.5} />
            {wrap(b.label, v.vertical ? 18 : 14, 2).map((ln, j, arr) => (v.vertical
              ? <Tx key={j} m={m} x={W - 14} y={r.y0 + 24 + j * 24} size={19} weight={800} fill={col} anchor="end">{ln}</Tx>
              : <Tx key={j} m={m} x={14} y={(r.y0 + r.y1) / 2 + (j - (arr.length - 1) / 2) * 22} size={17} weight={800} fill={col}>{ln}</Tx>))}
          </g>
        );
      })}
      {stages.map((s, i) => {
        if (i === 0) return null;
        const e = trimRect(pos[i - 1], pos[i]);
        const p = m.go(s, 16);
        return (
          <g key={`e${i}`}>
            <line x1={e.x0} y1={e.y0} x2={lerp(e.x0, e.x1, p)} y2={lerp(e.y0, e.y1, p)} stroke={c.dim} strokeWidth={3} />
            {p > 0.97 ? <Head x={e.x1} y={e.y1} ang={e.ang} s={12} color={c.dim} /> : null}
          </g>
        );
      })}
      {stages.map((s, i) => {
        const p = pos[i];
        const lit = m.inn(s);
        const hot = lands && i === L && pLand > 0.02;
        return (
          <g key={i} opacity={0.25 + 0.75 * lit}>
            <rect x={p.x - nodeW / 2} y={p.y - nodeH / 2} width={nodeW} height={nodeH} rx={12} fill={hexA(c.panel, 0.95)}
              stroke={hot ? c.red : hexA(c.text, 0.4)} strokeWidth={hot ? 3 : 2} />
            <Tx m={m} x={p.x} y={p.y - (s.sub ? f(13, 16) : 0)} size={fit(s.label, nodeW - 20, f(17, 22))} weight={800} anchor="middle">{s.label}</Tx>
            {s.sub ? <Tx m={m} x={p.x} y={p.y + f(15, 20)} size={fit(s.sub, nodeW - 20, f(14, 17))} fill={c.dim} anchor="middle">{s.sub}</Tx> : null}
          </g>
        );
      })}
      {err && pE > 0.001 ? (
        <g>
          <rect x={eb.x - ebW / 2} y={eb.y - f(20, 24)} width={ebW} height={f(40, 48)} rx={f(20, 24)} fill={hexA(c.red, 0.9)} />
          <Tx m={m} x={eb.x} y={eb.y} size={f(20, 24)} mono weight={800} fill={c.bg} anchor="middle">{err.label}</Tx>
        </g>
      ) : null}
      {lands && pos[L] ? (() => {
        const p = pos[L];
        const prev = pos[Math.max(0, L - 1)];
        const e = trimRect(prev, p);
        const mx = (e.x0 + e.x1) / 2, my = (e.y0 + e.y1) / 2;
        const nx = -Math.sin(e.ang), ny = Math.cos(e.ang);
        const lx = v.vertical ? p.x : p.x;
        const ly = v.vertical ? p.y + nodeH / 2 + 26 : p.y + nodeH / 2 + 24;
        return (
          <g opacity={pLand}>
            <line x1={mx - nx * 26} y1={my - ny * 26} x2={mx + nx * 26} y2={my + ny * 26} stroke={c.red} strokeWidth={6} strokeLinecap="round" />
            {!v.vertical ? (
              <Tx m={m} x={lx} y={ly} size={fit(lands.label, nodeW + 80, f(16, 20))} weight={800} fill={c.red} anchor="middle">{lands.label}</Tx>
            ) : (
              <>{wrap(lands.label, 18, 2).map((ln, j) => (
                <Tx key={j} m={m} x={sideX} y={p.y + 18 + j * 24} size={19} weight={800} fill={c.red}>{ln}</Tx>
              ))}</>
            )}
          </g>
        );
      })() : null}
      {oom && pos[L] ? (() => {
        const p = pos[L];
        const ox = v.vertical ? sideX + 16 : p.x - nodeW / 2 - 34;
        const oy = v.vertical ? p.y + 96 : p.y + nodeH / 2 + f(56, 60);
        return (
          <g opacity={clamp01(pO * 1.3)}>
            <circle cx={ox} cy={oy} r={14} fill="none" stroke={c.red} strokeWidth={3} />
            <line x1={ox - 22} x2={ox + 22} y1={oy} y2={oy} stroke={c.red} strokeWidth={2.5} />
            <line x1={ox} x2={ox} y1={oy - 22} y2={oy + 22} stroke={c.red} strokeWidth={2.5} />
            <Tx m={m} x={ox + 34} y={oy} size={fit(oom.label, v.vertical ? W - ox - 50 : nodeW + 180, f(16, 19))} weight={700}>{oom.label}</Tx>
          </g>
        );
      })() : null}
    </Stage>
  );
};

// ── xbzrle-delta ───────────────────────────────────────────────────────────────────────
// A genuinely differential page: last version and this version, XOR'd byte by byte —
// zero wherever nothing changed — and the result sent as skips and the few bytes that did.
// roles: old · new · xor · runs
export const XbzrleDelta: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v, frame} = m;
  const OLD = one(items, 'old'), NEW = one(items, 'new'), X = one(items, 'xor'), RUNS = one(items, 'runs');
  const N = v.vertical ? 12 : 22;
  const changed = v.vertical ? [3, 4, 9] : [5, 6, 15];
  const old = Array.from({length: N}, (_, i) => Math.floor(rnd(i * 17 + 5) * 256));
  const nw = old.map((b, i) => (changed.includes(i) ? b ^ (1 + Math.floor(rnd(i * 7 + 1) * 254)) : b));
  const xr = old.map((b, i) => b ^ nw[i]);
  const labelW = v.vertical ? 0 : 230;
  const labelAbove = v.vertical ? 34 : 0;
  const cg = 5;
  const cw = (W - labelW - 10 - (N - 1) * cg) / N;
  const rowH = Math.min(f(66, 96) + labelAbove, (H - f(40, 70)) / 4);
  const chh = Math.min(cw * 0.9, rowH - labelAbove - 14);
  const y0 = (H - 4 * rowH - f(20, 40)) / 2;
  const cx = (i: number) => labelW + i * (cw + cg);
  const h2 = (x: number) => x.toString(16).toUpperCase().padStart(2, '0');
  const rows = [{it: OLD, vals: old}, {it: NEW, vals: nw}, {it: X, vals: xr}];
  const xs = startOf(X);
  const runs: {zero: boolean; a: number; b: number}[] = [];
  xr.forEach((b, i) => {
    const z = b === 0;
    const last = runs[runs.length - 1];
    if (last && last.zero === z) last.b = i; else runs.push({zero: z, a: i, b: i});
  });
  const rs = startOf(RUNS);
  return (
    <Stage m={m}>
      {rows.map((r, ri) => {
        const y = y0 + ri * rowH + labelAbove;
        return (
          <g key={ri} opacity={Math.max(0.25, m.inn(r.it))}>
            <Tx m={m} x={0} y={v.vertical ? y - labelAbove / 2 - 4 : y + chh / 2} size={fit(r.it?.label, v.vertical ? W : labelW - 14, f(18, 22))}
              weight={800} fill={ri === 2 ? c.a : c.text}>{r.it?.label}</Tx>
            {r.vals.map((b, i) => {
              const p = ri < 2 ? m.inn(r.it) : xs == null ? m.base : clamp01((frame - xs - i * 2) / 6);
              const isChanged = changed.includes(i);
              const lit = ri === 2 ? (b !== 0 ? 1 : 0) : ri === 1 && isChanged ? 1 : 0;
              const col = ri === 2 ? c.a : c.yellow;
              return (
                <g key={i} opacity={p}>
                  <rect x={cx(i)} y={y} width={cw} height={chh} rx={5}
                    fill={lit ? hexA(col, 0.3) : hexA(c.text, 0.04)} stroke={lit ? col : c.line} strokeWidth={1.5} />
                  <Tx m={m} x={cx(i) + cw / 2} y={y + chh / 2} size={Math.min(chh * 0.44, cw * 0.4)} mono weight={700} anchor="middle"
                    fill={ri === 2 && b === 0 ? c.dim : c.text}>{h2(b)}</Tx>
                </g>
              );
            })}
          </g>
        );
      })}
      {RUNS ? (() => {
        const y = y0 + 3 * rowH + labelAbove;
        return (
          <g opacity={m.inn(RUNS)}>
            <Tx m={m} x={0} y={v.vertical ? y - labelAbove / 2 - 4 : y + chh / 2} size={fit(RUNS.label, v.vertical ? W : labelW - 14, f(18, 22))} weight={800} fill={c.green}>{RUNS.label}</Tx>
            {runs.map((r, k) => {
              const p = rs == null ? m.base : m.land(RUNS, 16, k * 5);
              const x0 = cx(r.a), x1 = cx(r.b) + cw;
              const len = r.b - r.a + 1;
              const text = r.zero ? `skip ${len}` : xr.slice(r.a, r.b + 1).map(h2).join(' ');
              return (
                <g key={k} opacity={clamp01(p * 1.4)} transform={`translate(0 ${(1 - Math.min(1, p)) * 16})`}>
                  <rect x={x0 + 1} y={y} width={x1 - x0 - 2} height={chh} rx={chh / 2}
                    fill={r.zero ? hexA(c.text, 0.07) : hexA(c.green, 0.35)} stroke={r.zero ? c.line : c.green} strokeWidth={1.5} />
                  <Tx m={m} x={(x0 + x1) / 2} y={y + chh / 2} size={fit(text, x1 - x0 - 12, Math.min(chh * 0.42, 20), true)} mono weight={700}
                    fill={r.zero ? c.dim : c.text} anchor="middle">{text}</Tx>
                </g>
              );
            })}
            {RUNS.sub ? <Tx m={m} x={labelW} y={y + chh + f(26, 34)} size={fit(RUNS.sub, W - labelW, f(16, 20))} fill={c.dim}>{RUNS.sub}</Tx> : null}
          </g>
        );
      })() : null}
    </Stage>
  );
};

// ── memory-contract ────────────────────────────────────────────────────────────────────
// A shelf of pages, each carrying a tag: must keep, may drop (MADV_FREE), can be rebuilt.
// When memory gets tight a sweep crosses the shelf: dropped pages vanish with no trip to
// disk, rebuildable ones fold down to their recipe, the rest still have to go somewhere.
// roles: keep · drop · rebuild (value = how many tiles each) · sweep
export const MemoryContract: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v} = m;
  const keep = one(items, 'keep'), drop = one(items, 'drop'), rebuild = one(items, 'rebuild'), sweep = one(items, 'sweep');
  const kinds = [{it: keep, col: c.a, k: 0}, {it: drop, col: c.orange, k: 1}, {it: rebuild, col: c.green, k: 2}].filter((x) => x.it);
  const counts = kinds.map((k) => Math.max(0, Math.round(num(k.it?.value, 10))));
  const list: number[] = [];
  kinds.forEach((k, i) => { for (let j = 0; j < counts[i]; j++) list.push(i); });
  const order = list.map((kk, i) => ({kk, r: rnd(i * 11 + 3)})).sort((a, b) => a.r - b.r).map((x) => x.kk);
  const cols = v.vertical ? 6 : 12;
  const rowsN = Math.ceil(order.length / cols);
  const legendW = v.vertical ? 0 : W * 0.34;
  const gridW = (v.vertical ? W : W - legendW - 40);
  const gridHmax = v.vertical ? H * 0.52 : H - 40;
  const cell = Math.min(gridW / cols, gridHmax / Math.max(1, rowsN));
  const ts = cell * 0.72;
  const gx = v.vertical ? (W - cols * cell) / 2 : 0;
  const gy = v.vertical ? 30 : (H - rowsN * cell) / 2;
  const pS = m.go(sweep, 44);
  const scan = v.vertical ? lerp(gy - 10, gy + rowsN * cell + 10, pS) : lerp(gx - 10, gx + cols * cell + 10, pS);
  const lx = v.vertical ? 30 : W - legendW;
  const ly0 = v.vertical ? gy + rowsN * cell + 80 : (H - kinds.length * f(90, 0)) / 2 + 30;
  const lrow = f(90, 120);
  const glyph = (kk: number, x: number, y: number, s: number, col: string, fold = 0) => {
    if (kk === 0) {
      return (
        <g>
          <PageTile x={x} y={y} s={s} fill={hexA(col, 0.22)} stroke={col} sw={1.6} />
          <Padlock m={m} cx={x + s * 0.5} cy={y + s * 0.6} s={s * 0.36} color={col} />
        </g>
      );
    }
    if (kk === 1) {
      return <path d={`M ${x} ${y} h ${s * 0.74} l ${s * 0.26} ${s * 0.26} v ${s * 0.74} h ${-s} z`} fill={hexA(col, 0.08)} stroke={col} strokeWidth={1.8} strokeDasharray="5 4" />;
    }
    const sc = 1 - 0.55 * fold;
    return (
      <g transform={`translate(${x + s / 2} ${y + s / 2}) scale(${sc}) translate(${-s / 2} ${-s / 2})`}>
        <PageTile x={0} y={0} s={s} fill={hexA(col, 0.22)} stroke={col} sw={1.6} />
        {[0.38, 0.56, 0.74].map((t, i) => <line key={i} x1={s * 0.18} x2={s * (i === 2 ? 0.55 : 0.78)} y1={s * t} y2={s * t} stroke={col} strokeWidth={2} />)}
      </g>
    );
  };
  return (
    <Stage m={m}>
      {order.map((kk, i) => {
        const x = gx + (i % cols) * cell + (cell - ts) / 2, y = gy + Math.floor(i / cols) * cell + (cell - ts) / 2;
        const kd = kinds[kk];
        const centre = v.vertical ? y + ts / 2 : x + ts / 2;
        const passed = sweep ? clamp01((scan - centre) / 30) : 0;
        const pk = m.inn(kd.it);
        const vanish = kd.k === 1 ? passed : 0;
        return (
          <g key={i} opacity={(0.35 + 0.65 * pk) * (1 - vanish)}>
            {glyph(kd.k, x, y, ts, kd.col, kd.k === 2 ? passed : 0)}
          </g>
        );
      })}
      {sweep && pS > 0.001 && pS < 0.999 ? (
        v.vertical
          ? <line x1={gx - 20} x2={gx + cols * cell + 20} y1={scan} y2={scan} stroke={c.yellow} strokeWidth={4} />
          : <line x1={scan} x2={scan} y1={gy - 20} y2={gy + rowsN * cell + 20} stroke={c.yellow} strokeWidth={4} />
      ) : null}
      {sweep ? (
        <Tx m={m} x={v.vertical ? W / 2 : gx + (cols * cell) / 2} y={v.vertical ? gy + rowsN * cell + 34 : Math.max(16, gy - 20)}
          size={fit(sweep.label, cols * cell, f(17, 22))} weight={800} fill={c.yellow} anchor="middle" opacity={m.inn(sweep)}>{sweep.label}</Tx>
      ) : null}
      {kinds.map((kd, i) => {
        const y = ly0 + i * lrow;
        const s = f(44, 54);
        return (
          <g key={i} opacity={0.3 + 0.7 * m.inn(kd.it)}>
            {glyph(kd.k, lx, y - s / 2, s, kd.col)}
            <Tx m={m} x={lx + s + 22} y={y - f(12, 16)} size={fit(kd.it?.label, (v.vertical ? W : legendW) - s - 50, f(19, 24))} weight={800} fill={kd.col}>{kd.it?.label}</Tx>
            {wrap(kd.it?.sub, v.vertical ? 46 : 40, 2).map((ln, j) => (
              <Tx key={j} m={m} x={lx + s + 22} y={y + f(14, 18) + j * f(20, 24)} size={f(15, 18)} fill={c.dim}>{ln}</Tx>
            ))}
          </g>
        );
      })}
    </Stage>
  );
};

// ── fast-path ──────────────────────────────────────────────────────────────────────────
// A sorting line in front of a real compressor: pages that are all zeros drop out first
// and cost nothing; pages with a handful of bytes drop into the scatter bin; everything
// else rides on to LZ4 or zstd. The cheap trick used where it wins.
// roles: gate (label = the question, sub = what that bin costs) · rest
export const FastPath: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v} = m;
  const gates = all(items, 'gate').slice(0, 3), rest = one(items, 'rest');
  const ng = gates.length;
  const press = v.vertical ? {x: W * 0.12, y: H - 190, w: W * 0.76, h: 110} : {x: W - 290, y: H * 0.3 - 55, w: 280, h: 110};
  const main = v.vertical ? {x: W * 0.28, y0: 30, y1: press.y} : {y: H * 0.3, x0: 30, x1: press.x};
  const gPos = (i: number) => (v.vertical
    ? {x: main.x as number, y: 30 + ((i + 1) * (press.y - 30)) / (ng + 1)}
    : {x: 30 + ((i + 1) * (press.x - 30)) / (ng + 1), y: main.y as number});
  const bin = (i: number) => {
    const g = gPos(i);
    return v.vertical ? {x: W * 0.5, y: g.y - 46, w: W * 0.46, h: 92} : {x: g.x - 130, y: H * 0.64, w: 260, h: 96};
  };
  const ts = f(34, 40);
  const pageArt = (kind: number, x: number, y: number, s: number, col: string) => (
    <g>
      <PageTile x={x} y={y} s={s} fill={hexA(col, 0.15)} stroke={col} sw={1.6} />
      {kind === 1 ? [0.3, 0.62].map((t, i) => <circle key={i} cx={x + s * (0.3 + i * 0.35)} cy={y + s * t + s * 0.1} r={s * 0.07} fill={col} />) : null}
      {kind === 2 ? Array.from({length: 9}).map((_, i) => (
        <rect key={i} x={x + s * 0.14 + (i % 3) * s * 0.24} y={y + s * 0.3 + Math.floor(i / 3) * s * 0.2} width={s * 0.16} height={s * 0.1} fill={col} />
      )) : null}
    </g>
  );
  const start = v.vertical ? {x: main.x as number, y: 30} : {x: 30, y: main.y as number};
  const palette = [c.dim, c.green, c.a];
  return (
    <Stage m={m}>
      {v.vertical
        ? <line x1={main.x as number} x2={main.x as number} y1={30} y2={press.y} stroke={c.dim} strokeWidth={4} {...drawOn(m.base)} />
        : <line x1={30} x2={press.x} y1={main.y as number} y2={main.y as number} stroke={c.dim} strokeWidth={4} {...drawOn(m.base)} />}
      {gates.map((g, i) => {
        const p = gPos(i), b = bin(i);
        const col = m.col(g, palette[i % palette.length]);
        const pA = m.go(g, 16), pB = m.go(g, 14, 16);
        const bc = {x: b.x + b.w / 2, y: b.y + b.h / 2};
        const tile = pB > 0.001 ? {x: lerp(p.x, bc.x, pB), y: lerp(p.y, bc.y, pB)} : {x: lerp(start.x, p.x, pA), y: lerp(start.y, p.y, pA)};
        const d = f(26, 30);
        return (
          <g key={i} opacity={m.inn(g)}>
            {v.vertical
              ? <path d={`M ${p.x} ${p.y} H ${b.x}`} stroke={col} strokeWidth={3} fill="none" {...drawOn(m.inn(g))} />
              : <path d={`M ${p.x} ${p.y} V ${b.y}`} stroke={col} strokeWidth={3} fill="none" {...drawOn(m.inn(g))} />}
            <rect x={p.x - d} y={p.y - d} width={d * 2} height={d * 2} transform={`rotate(45 ${p.x} ${p.y})`} fill={hexA(c.panel, 1)} stroke={col} strokeWidth={3} />
            <Tx m={m} x={p.x} y={p.y} size={f(22, 26)} weight={800} fill={col} anchor="middle">?</Tx>
            <Tx m={m} x={v.vertical ? p.x - d - 20 : p.x} y={v.vertical ? p.y : p.y - d - 26} size={fit(g.label, v.vertical ? p.x - d - 30 : 300, f(18, 22))} weight={800}
              anchor={v.vertical ? 'end' : 'middle'}>{g.label}</Tx>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={12} fill={hexA(col, 0.08)} stroke={col} strokeWidth={2} />
            {wrap(g.sub, Math.floor(b.w / 9.5), 2).map((ln, j, arr) => (
              <Tx key={j} m={m} x={bc.x} y={bc.y + (j - (arr.length - 1) / 2) * f(22, 26)} size={f(16, 19)} weight={j === 0 ? 800 : 500} fill={j === 0 ? col : c.dim} anchor="middle">{ln}</Tx>
            ))}
            {pA > 0.001 ? <g opacity={pB > 0.95 ? 0 : 1}>{pageArt(i, tile.x - ts / 2, tile.y - ts / 2, ts, col)}</g> : null}
          </g>
        );
      })}
      {rest ? (() => {
        const pR = m.go(rest, 30);
        const end = v.vertical ? {x: main.x as number, y: press.y + press.h / 2} : {x: press.x + press.w / 2, y: main.y as number};
        const t = {x: lerp(start.x, v.vertical ? press.x + press.w / 2 : end.x, pR), y: lerp(start.y, v.vertical ? press.y + press.h / 2 : end.y, pR)};
        return (
          <g opacity={m.inn(rest)}>
            <rect x={press.x} y={press.y} width={press.w} height={press.h} rx={14} fill={hexA(c.purple, 0.1)} stroke={c.purple} strokeWidth={2.5} />
            <Tx m={m} x={press.x + press.w / 2} y={press.y + press.h / 2 - (rest.sub ? 14 : 0)} size={fit(rest.label, press.w - 20, f(20, 24))} weight={800} fill={c.purple} anchor="middle">{rest.label}</Tx>
            {rest.sub ? <Tx m={m} x={press.x + press.w / 2} y={press.y + press.h / 2 + 18} size={fit(rest.sub, press.w - 20, f(15, 18))} fill={c.dim} anchor="middle">{rest.sub}</Tx> : null}
            {pR > 0.001 && pR < 0.98 ? pageArt(2, t.x - ts / 2, t.y - ts / 2, ts, c.purple) : null}
          </g>
        );
      })() : null}
    </Stage>
  );
};

// ── roadmap ────────────────────────────────────────────────────────────────────────────
// A circuit from the driver to the chart, one instrument per step; the current reaches
// each as it is named, and only at the end does the chart draw from what was measured.
// roles: step (icon, label, sub)
export const Roadmap: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v} = m;
  const steps = all(items, 'step').slice(0, 6);
  const n = Math.max(1, steps.length);
  const r = f(42, 46);
  // Wide: the end stops are inset by half a label column, so a label centred under the
  // first or last node never runs past the pane edge (both were clipped on the first proof).
  const edge = v.vertical ? 0 : Math.min(200, W / Math.max(1, n) / 2);
  const pos = steps.map((_, i) => (v.vertical
    ? {x: 80, y: 60 + (i * (H - 120)) / Math.max(1, n - 1)}
    : {x: edge + (i * (W - 2 * edge)) / Math.max(1, n - 1), y: H * 0.34}));
  const spacing = v.vertical ? W - 170 : Math.min((W - 2 * edge) / Math.max(1, n - 1), 2 * edge) - 20;
  const lblSize = f(19, 24);
  const chars = Math.floor(spacing / (lblSize * 0.54));
  return (
    <Stage m={m} html={steps.map((s, i) => (
      <IconAt key={i} m={m} cx={pos[i].x} cy={pos[i].y} s={r * 1.05} icon={s.icon} tint={m.inn(s) > 0.5 ? m.col(s, c.a) : c.dim} />
    ))}>
      {steps.map((s, i) => {
        if (i === 0) return null;
        const a = pos[i - 1], b = pos[i];
        const p = m.go(s, 20);
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
        const x0 = a.x + (dx / d) * (r + 6), y0 = a.y + (dy / d) * (r + 6), x1 = b.x - (dx / d) * (r + 6), y1 = b.y - (dy / d) * (r + 6);
        return (
          <g key={`t${i}`}>
            <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={hexA(c.text, 0.12)} strokeWidth={4} />
            <line x1={x0} y1={y0} x2={lerp(x0, x1, p)} y2={lerp(y0, y1, p)} stroke={m.col(s, c.a)} strokeWidth={4} />
            {p > 0.01 && p < 0.99 ? <circle cx={lerp(x0, x1, p)} cy={lerp(y0, y1, p)} r={7} fill={c.yellow} /> : null}
          </g>
        );
      })}
      {steps.map((s, i) => {
        const p = pos[i];
        const lit = m.inn(s);
        const col = m.col(s, c.a);
        const lbl = wrap(s.label, v.vertical ? 34 : chars, 2);
        const sub = wrap(s.sub, v.vertical ? 46 : Math.floor(spacing / 8.6), 2);
        const tx = v.vertical ? p.x + r + 26 : p.x;
        const ty = v.vertical ? p.y - (lbl.length + sub.length - 1) * 12 : p.y + r + 30;
        return (
          <g key={i} opacity={0.3 + 0.7 * lit}>
            <circle cx={p.x} cy={p.y} r={r} fill={hexA(col, 0.08 + 0.12 * lit)} stroke={lit > 0.5 ? col : c.dim} strokeWidth={3} />
            <circle cx={p.x + r * 0.78} cy={p.y - r * 0.78} r={f(14, 16)} fill={lit > 0.5 ? col : c.dim} />
            <Tx m={m} x={p.x + r * 0.78} y={p.y - r * 0.78} size={f(15, 17)} weight={800} fill={c.bg} anchor="middle">{String(i + 1)}</Tx>
            {lbl.map((ln, j) => (
              <Tx key={j} m={m} x={tx} y={ty + j * f(24, 30)} size={lblSize} weight={800} anchor={v.vertical ? 'start' : 'middle'}>{ln}</Tx>
            ))}
            {sub.map((ln, j) => (
              <Tx key={`s${j}`} m={m} x={tx} y={ty + lbl.length * f(24, 30) + j * f(20, 24) + 4} size={f(15, 18)} fill={c.dim} anchor={v.vertical ? 'start' : 'middle'}>{ln}</Tx>
            ))}
          </g>
        );
      })}
    </Stage>
  );
};

// ── verdict ────────────────────────────────────────────────────────────────────────────
// Three objects — the idea, the code, the numbers — each with its stamp slammed on.
// roles: item (icon, label, sub, value = the stamp)
export const Verdict: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v} = m;
  const its = all(items, 'item').slice(0, 3);
  const n = Math.max(1, its.length);
  const palette = [c.green, c.yellow, c.red];
  const r = v.vertical ? Math.min(62, H / n * 0.22) : Math.min(62, H * 0.16);
  return (
    <Stage m={m} html={its.map((it, i) => {
      const cx = v.vertical ? 30 + r : (W / n) * (i + 0.5);
      const cy = v.vertical ? (H / n) * (i + 0.5) - 20 : H * 0.24;
      return <IconAt key={i} m={m} cx={cx} cy={cy} s={r * 1.05} icon={it.icon} tint={m.col(it, palette[i % 3])} opacity={m.inn(it)} />;
    })}>
      {its.map((it, i) => {
        const col = m.col(it, palette[i % 3]);
        const cx = v.vertical ? 30 + r : (W / n) * (i + 0.5);
        const cy = v.vertical ? (H / n) * (i + 0.5) - 20 : H * 0.24;
        const tx = v.vertical ? cx + r + 30 : cx;
        const colW = v.vertical ? W - tx - 10 : W / n - 40;
        const lblY = v.vertical ? cy - 30 : cy + r + f(34, 0);
        const sub = wrap(it.sub, Math.floor(colW / 9.2), 2);
        const pS = m.land(it, 16, 10);
        return (
          <g key={i} opacity={m.inn(it)}>
            <circle cx={cx} cy={cy} r={r} fill={hexA(col, 0.12)} stroke={col} strokeWidth={3} />
            <Tx m={m} x={tx} y={lblY} size={fit(it.label, colW, f(24, 28))} weight={800} anchor={v.vertical ? 'start' : 'middle'}>{it.label}</Tx>
            {sub.map((ln, j) => (
              <Tx key={j} m={m} x={tx} y={lblY + f(30, 34) + j * f(22, 26)} size={f(16, 19)} fill={c.dim} anchor={v.vertical ? 'start' : 'middle'}>{ln}</Tx>
            ))}
            {it.value != null ? (
              <Stamp m={m} cx={v.vertical ? tx + Math.min(colW / 2, 170) : cx} cy={v.vertical ? cy + 76 : H * 0.83} text={String(it.value)}
                color={col} p={pS} size={f(22, 24)} rot={i % 2 ? 6 : -7} />
            ) : null}
          </g>
        );
      })}
    </Stage>
  );
};
