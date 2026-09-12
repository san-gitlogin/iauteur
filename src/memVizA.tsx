import React from 'react';
import {hexA} from './ui';
import {travelAt} from './motion/system';
import {
  MemProps, useMem, Stage, Tx, fit, drawOn, Dimm, Drive, PageTile, Head, Mark, Padlock, IconAt,
  one, all, num, fmt, clamp01, lerp, startOf, rnd, wrap,
} from './memVizKit';

// MEM VIZ — part A: what the project is, memory from zero, what FluidRAM proposes, and
// where the published numbers come from. Every kind is an OBJECT (LAW 0n): nested
// machines, a wall of pages, a drive at the end of a long wire, tanks that lend room,
// bit cells that flip, a page whose zeros vanish, a meter that overflows, strings tied
// from a bar to the literal that drew it, a padlocked counter, a ghost block.

// ── host-guest ─────────────────────────────────────────────────────────────────────────
// A whole "operating system" running as ONE program inside your real one — and its
// "physical RAM" turning out to be a slice of the host's.
// roles: host · process · guest · ram · hostram · truth
export const HostGuest: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v} = m;
  const host = one(items, 'host'), proc = one(items, 'process'), guest = one(items, 'guest');
  const ram = one(items, 'ram'), truth = one(items, 'truth'), hostRam = one(items, 'hostram');
  const pH = m.inn(host), pP = m.go(proc, 24), pG = m.inn(guest), pR = m.inn(ram), pT = m.go(truth, 26);
  const pad = 4;
  const hx = pad, hy = pad, hw = W - 2 * pad, hh = H - 2 * pad;
  const bar = f(30, 42);
  const headH = f(60, 78);
  const win = v.vertical
    ? {x: hx + 24, y: hy + headH, w: hw - 48, h: (hh - headH - bar) * 0.58}
    : {x: hx + 26, y: hy + headH, w: hw * 0.57, h: hh - headH - bar - 18};
  const dimm = v.vertical
    ? {x: hx + 70, y: win.y + win.h + 110, w: hw - 140, h: 88}
    : (() => {
      const x = win.x + win.w + 90;
      return {x, y: win.y + win.h / 2 - 30, w: hx + hw - 40 - x, h: 74};
    })();
  // taskbar: the process's icon is where its window opens from
  const icS = bar - 12;
  const icons = Array.from({length: 5}).map((_, i) => ({x: hx + 22 + i * (icS + 12), y: hy + hh - bar + 6}));
  const origin = {x: icons[2].x + icS / 2, y: icons[2].y + icS / 2};
  const sc = 0.04 + 0.96 * pP;
  const th = f(38, 48);
  const g = {x: win.x + 14, y: win.y + th + 10, w: win.w - 28, h: win.h - th - 24};
  const rw = g.w * 0.36, rh = f(46, 60);
  const rx = g.x + g.w - rw - 20, ry = g.y + g.h * 0.6 - rh / 2;
  const ax0 = g.x + 18, ax1 = rx - 34;
  const aw = (ax1 - ax0 - 28) / 3;
  const ah = Math.min(g.h * 0.34, aw * 0.72);
  const ay = g.y + g.h * 0.62 - ah / 2;
  const seg = {x: dimm.x + dimm.w * 0.36, w: dimm.w * 0.2};
  const from = {x: rx + rw / 2, y: ry + rh};
  const to = {x: seg.x + seg.w / 2, y: dimm.y - 4};
  const curve = `M ${from.x} ${from.y} C ${from.x} ${from.y + f(90, 70)} ${to.x} ${to.y - f(90, 70)} ${to.x} ${to.y}`;
  return (
    <Stage m={m}>
      <rect x={hx} y={hy} width={hw} height={hh} rx={16} fill={hexA(c.text, 0.025)} stroke={c.dim}
        strokeWidth={2} {...drawOn(pH)} />
      <Tx m={m} x={hx + 22} y={hy + f(20, 26)} size={f(19, 26)} weight={700} opacity={pH}>{host?.label}</Tx>
      <Tx m={m} x={hx + 22} y={hy + f(44, 56)} size={f(15, 20)} fill={c.dim} opacity={pH}>{host?.sub}</Tx>
      <rect x={hx + 2} y={hy + hh - bar} width={hw - 4} height={bar - 2} rx={8} fill={hexA(c.text, 0.06)} opacity={pH} />
      {icons.map((ic, i) => (
        <rect key={i} x={ic.x} y={ic.y} width={icS} height={icS} rx={4}
          fill={i === 2 && pP > 0.02 ? hexA(c.a, 0.6) : hexA(c.text, 0.16)} opacity={pH} />
      ))}

      {/* the program's window, opening from its taskbar icon */}
      <g transform={`translate(${origin.x} ${origin.y}) scale(${sc}) translate(${-origin.x} ${-origin.y})`}
        opacity={clamp01(pP * 1.6)}>
        <rect x={win.x} y={win.y} width={win.w} height={win.h} rx={12} fill={hexA(c.panel, 0.92)} stroke={c.a} strokeWidth={2} />
        {[c.red, c.yellow, c.green].map((d, i) => (
          <circle key={i} cx={win.x + 20 + i * f(20, 24)} cy={win.y + th / 2} r={f(6, 8)} fill={d} />
        ))}
        <Tx m={m} x={win.x + f(90, 104)} y={win.y + th / 2} size={fit(proc?.label, win.w * 0.5, f(18, 22), true)} mono weight={600}>
          {proc?.label}
        </Tx>
        <Tx m={m} x={win.x + win.w - 16} y={win.y + th / 2} size={f(15, 19)} fill={c.dim} anchor="end">{proc?.sub}</Tx>
        <line x1={win.x} x2={win.x + win.w} y1={win.y + th} y2={win.y + th} stroke={c.line} strokeWidth={1.5} />
        {/* the guest desktop inside it */}
        <g opacity={pG}>
          <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={8} fill={hexA(c.a, 0.07)} stroke={hexA(c.a, 0.4)} strokeWidth={1.5} />
          <Tx m={m} x={g.x + 18} y={g.y + f(26, 34)} size={f(22, 30)} weight={800} fill={c.a}>{guest?.label}</Tx>
          <Tx m={m} x={g.x + 18} y={g.y + f(52, 68)} size={fit(guest?.sub, g.w * 0.9, f(15, 20))} fill={c.dim}>{guest?.sub}</Tx>
          <rect x={g.x} y={g.y + g.h - f(16, 22)} width={g.w} height={f(16, 22)} rx={4} fill={hexA(c.a, 0.14)} />
          {[0, 1, 2].map((i) => {
            const pa = m.inn(guest, undefined, 4 + i * 3);
            const x = ax0 + i * (aw + 14);
            return (
              <g key={i} opacity={pa}>
                <rect x={x} y={ay} width={aw} height={ah} rx={6} fill={hexA(c.text, 0.06)} stroke={hexA(c.a, 0.45)} strokeWidth={1.4} />
                <rect x={x} y={ay} width={aw} height={ah * 0.2} rx={6} fill={hexA(c.a, 0.22)} />
                <rect x={x + aw * 0.12} y={ay + ah * 0.42} width={aw * 0.62} height={ah * 0.1} rx={2} fill={hexA(c.text, 0.18)} />
                <rect x={x + aw * 0.12} y={ay + ah * 0.64} width={aw * 0.42} height={ah * 0.1} rx={2} fill={hexA(c.text, 0.12)} />
              </g>
            );
          })}
          <Tx m={m} x={rx} y={ry - f(20, 26)} size={fit(ram?.label, rw + 20, f(16, 21))} weight={700} opacity={pR}>{ram?.label}</Tx>
          <Dimm m={m} x={rx} y={ry} w={rw} h={rh} p={pR} glow={pT} />
        </g>
      </g>

      {/* the host's own memory, and where the guest's "RAM" really lives */}
      {hostRam ? (
        <Tx m={m} x={dimm.x} y={dimm.y - f(24, 30)} size={fit(hostRam.label, dimm.w, f(17, 22))} weight={700}
          fill={c.dim} opacity={m.inn(hostRam)}>{hostRam.label}</Tx>
      ) : null}
      <Dimm m={m} x={dimm.x} y={dimm.y} w={dimm.w} h={dimm.h} p={hostRam ? m.inn(hostRam) : pH} />
      {truth ? (
        <g>
          <rect x={seg.x} y={dimm.y - 3} width={seg.w} height={dimm.h * 0.8 + 6} rx={5}
            fill={hexA(c.a, 0.35 * pT)} stroke={c.a} strokeWidth={2.5} opacity={pT} />
          <path d={curve} fill="none" stroke={c.a} strokeWidth={2.5} strokeDasharray={pT >= 0.999 ? '8 7' : undefined}
            {...(pT < 0.999 ? drawOn(pT) : {})} />
          <Head x={to.x} y={to.y} ang={Math.PI / 2} s={12} color={c.a} opacity={pT > 0.9 ? 1 : 0} />
          <Tx m={m} x={dimm.x + dimm.w / 2} y={dimm.y + dimm.h + f(28, 36)} size={fit(truth.label, dimm.w + 60, f(20, 26))}
            weight={800} fill={c.a} anchor="middle" opacity={pT}>{truth.label}</Tx>
          <Tx m={m} x={dimm.x + dimm.w / 2} y={dimm.y + dimm.h + f(54, 68)} size={fit(truth.sub, dimm.w + 60, f(16, 20))}
            fill={c.dim} anchor="middle" opacity={pT}>{truth.sub}</Tx>
        </g>
      ) : null}
    </Stage>
  );
};

// ── page-wall ──────────────────────────────────────────────────────────────────────────
// RAM as a wall of 4 KB squares, programs claiming them — and a row of promised pages
// hanging off the bottom of the wall with nothing behind them (overcommit).
// roles: program (value = squares) · tile · overcommit (value = squares)
export const PageWall: React.FC<MemProps> = ({items, accent, token}) => {
  const m = useMem(accent);
  const {W, H, c, f, v, frame} = m;
  const progs = all(items, 'program');
  const tile = one(items, 'tile'), over = one(items, 'overcommit');
  const palette = [c.a, c.green, c.purple, c.orange];
  const legendW = v.vertical ? 0 : 460;
  const gridW = W - legendW - (v.vertical ? 0 : 40);
  const cols = v.vertical ? 16 : 32;
  const headH = f(38, 50);
  const legendH = v.vertical ? 24 + progs.length * 62 + (tile ? 130 : 0) : 0;
  let cell = gridW / cols;
  const ghostH = (cl: number) => (over ? cl + f(30, 40) : 0);
  let rows = Math.floor((H - headH - legendH - ghostH(cell) - 16) / cell);
  rows = Math.min(rows, v.vertical ? 11 : 9);
  if (rows < 3) {
    rows = 3;
    cell = Math.min(cell, (H - headH - legendH - 16 - (over ? f(30, 40) : 0)) / (rows + (over ? 1 : 0)));
  }
  const gw = cols * cell;
  const contentH = headH + rows * cell + ghostH(cell) + legendH;
  const y0 = Math.max(0, (H - contentH) / 2);
  const gx = v.vertical ? (W - gw) / 2 : 12;
  const gy = y0 + headH;
  const ts = cell * 0.86;
  const T = cols * rows;
  // who owns which square
  const owner: {k: number; j: number}[] = [];
  progs.forEach((p, k) => {
    const n = Math.max(0, Math.round(num(p.value)));
    for (let j = 0; j < n && owner.length < T; j++) owner.push({k, j});
  });
  const tileP = (k: number, j: number, count: number) => {
    const s = startOf(progs[k]);
    if (s == null) return m.base;
    const step = Math.min(1.4, 34 / Math.max(1, count));
    return clamp01((frame - s - j * step) / 8);
  };
  const counts = progs.map((p) => Math.min(T, Math.round(num(p.value))));
  const magIdx = v.vertical ? (rows - 1) * cols : cols - 1;
  const magTile = {x: gx + (magIdx % cols) * cell, y: gy + Math.floor(magIdx / cols) * cell};
  const lx = v.vertical ? gx : gx + gw + 48;
  const ly0 = v.vertical ? gy + rows * cell + ghostH(cell) + 34 : gy + 16;
  const ms = f(104, 116);
  const magY = ly0 + progs.length * 62 + 8;
  const pTile = m.inn(tile);
  const ghostY = gy + rows * cell + f(18, 24);
  const gc = over ? Math.min(Math.round(num(over.value, 8)), Math.floor(cols * 0.55)) : 0;
  return (
    <Stage m={m}>
      <Tx m={m} x={gx - 4} y={y0 + headH / 2 - 6} size={f(17, 22)} weight={700} fill={c.dim} spacing={1}>{token}</Tx>
      <rect x={gx - 8} y={gy - 8} width={gw + 16 - (cell - ts)} height={rows * cell + 16 - (cell - ts)} rx={10}
        fill="none" stroke={c.dim} strokeWidth={2} {...drawOn(m.base)} />
      {Array.from({length: T}).map((_, i) => {
        const x = gx + (i % cols) * cell, y = gy + Math.floor(i / cols) * cell;
        const o = owner[i];
        const p = o ? tileP(o.k, o.j, counts[o.k]) : 0;
        const col = o ? m.col(progs[o.k], palette[o.k % palette.length]) : c.line;
        return (
          <rect key={i} x={x} y={y} width={ts} height={ts} rx={3}
            fill={p > 0.01 ? hexA(col, 0.16 + 0.44 * p) : hexA(c.text, 0.035)}
            stroke={p > 0.01 ? hexA(col, 0.4 + 0.6 * p) : hexA(c.text, 0.1)} strokeWidth={1.4} />
        );
      })}
      {/* promised squares, outside the wall: nothing physical behind them */}
      {over ? (
        <g>
          {Array.from({length: gc}).map((_, j) => {
            const s = startOf(over);
            const p = s == null ? m.base : clamp01((frame - s - j * 1.4) / 8);
            return (
              <rect key={j} x={gx + j * cell} y={ghostY + (1 - p) * 10} width={ts} height={ts} rx={3}
                fill={hexA(c.red, 0.07)} stroke={c.red} strokeWidth={1.6} strokeDasharray="5 4" opacity={p} />
            );
          })}
          <Tx m={m} x={gx + gc * cell + 16} y={ghostY + ts * 0.3} size={f(18, 22)} weight={800} fill={c.red} opacity={m.inn(over)}>
            {over.label}
          </Tx>
          <Tx m={m} x={gx + gc * cell + 16} y={ghostY + ts * 0.3 + f(22, 26)} size={f(15, 18)} fill={c.dim} opacity={m.inn(over)}>
            {over.sub}
          </Tx>
        </g>
      ) : null}
      {progs.map((p, k) => {
        const col = m.col(p, palette[k % palette.length]);
        const y = ly0 + k * 62;
        const pa = m.inn(p);
        return (
          <g key={k} opacity={0.3 + 0.7 * pa}>
            <rect x={lx} y={y - 12} width={24} height={24} rx={5} fill={hexA(col, 0.6)} stroke={col} strokeWidth={1.5} />
            <Tx m={m} x={lx + 38} y={y - 2} size={f(20, 26)} weight={700}>{p.label}</Tx>
            <Tx m={m} x={lx + 38} y={y + f(22, 26)} size={f(15, 19)} fill={c.dim}>{p.sub}</Tx>
          </g>
        );
      })}
      {tile ? (
        <g opacity={pTile}>
          <rect x={magTile.x - 3} y={magTile.y - 3} width={ts + 6} height={ts + 6} rx={5} fill="none" stroke={c.yellow} strokeWidth={2.5} />
          <line x1={v.vertical ? magTile.x + ts / 2 : magTile.x + ts + 3} y1={v.vertical ? magTile.y + ts + 3 : magTile.y + ts / 2}
            x2={lx + (v.vertical ? ms / 2 : 0)} y2={v.vertical ? magY : magY + ms / 2}
            stroke={c.yellow} strokeWidth={2} strokeDasharray="6 5" />
          <rect x={lx} y={magY} width={ms} height={ms} rx={8} fill={hexA(c.yellow, 0.06)} stroke={c.yellow} strokeWidth={2.5} />
          {Array.from({length: 64}).map((_, i) => (
            <rect key={i} x={lx + 8 + (i % 8) * ((ms - 16) / 8)} y={magY + 8 + Math.floor(i / 8) * ((ms - 16) / 8)}
              width={(ms - 16) / 8 - 2} height={(ms - 16) / 8 - 2} rx={1.5} fill={hexA(c.yellow, 0.1 + 0.25 * rnd(i + 5))} />
          ))}
          <Tx m={m} x={lx + ms + 20} y={magY + ms / 2 - 14} size={f(21, 26)} weight={800} fill={c.yellow}>{tile.label}</Tx>
          <Tx m={m} x={lx + ms + 20} y={magY + ms / 2 + 16} size={f(16, 20)} fill={c.dim}>{tile.sub}</Tx>
        </g>
      ) : null}
    </Stage>
  );
};

// ── evict-paths ────────────────────────────────────────────────────────────────────────
// When RAM is full, a page either takes the long wire to a drive, or gets squeezed and
// stays in RAM (zram). Under it, the latency ladder that makes the difference matter.
// roles: ram · disk · zram · rung (value = nanoseconds) · axis
export const EvictPaths: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v} = m;
  const ram = one(items, 'ram'), disk = one(items, 'disk'), zram = one(items, 'zram');
  const rungs = all(items, 'rung'), axis = one(items, 'axis');
  const topH = rungs.length ? H * f(0.6, 0.58) : H;
  const lab = f(56, 70);
  const rb = {x: 8, y: f(8, 12), w: W * f(0.46, 0.56), h: topH - f(8, 12) - lab};
  const dw = f(260, W * 0.3), dh = f(104, 110);
  const dv = {x: W - dw - 8, y: rb.y + rb.h / 2 - dh / 2, w: dw, h: dh};
  // inside the RAM block: a small grid of pages and the zram corner
  const inner = v.vertical
    ? {grid: {x: rb.x + 18, y: rb.y + 50, w: rb.w - 36, h: rb.h * 0.5 - 50}, z: {x: rb.x + 18, y: rb.y + rb.h * 0.56, w: rb.w - 36, h: rb.h * 0.4}}
    : {grid: {x: rb.x + 18, y: rb.y + 50, w: rb.w * 0.52 - 18, h: rb.h - 68}, z: {x: rb.x + rb.w * 0.56, y: rb.y + 50, w: rb.w * 0.42, h: rb.h - 68}};
  const gcols = 4, grows = 3;
  const ts = Math.min(inner.grid.w / gcols, inner.grid.h / grows) * 0.74;
  const cellW = inner.grid.w / gcols, cellH = inner.grid.h / grows;
  const tilePos = (i: number) => ({
    x: inner.grid.x + (i % gcols) * cellW + (cellW - ts) / 2,
    y: inner.grid.y + Math.floor(i / gcols) * cellH + (cellH - ts) / 2,
  });
  const pRam = m.inn(ram), pDiskIn = m.inn(disk), pDisk = m.go(disk, 40, 10);
  const pZ = m.go(zram, 16), pSq = m.go(zram, 14, 16);
  const tD = tilePos(gcols * grows - 1), tZ = tilePos(gcols * grows - 2);
  const zc = {x: inner.z.x + inner.z.w / 2 - ts / 2, y: inner.z.y + inner.z.h / 2 - ts / 2};
  const dc = {x: dv.x + dv.w / 2 - ts / 2, y: dv.y + dv.h / 2 - ts / 2};
  const wire = `M ${rb.x + rb.w} ${rb.y + rb.h / 2} C ${rb.x + rb.w + 80} ${rb.y + rb.h / 2 - 40} ${dv.x - 80} ${dv.y + dv.h / 2 + 40} ${dv.x} ${dv.y + dv.h / 2}`;
  // position of the travelling page along the wire: straight line is fine, the wire is gentle
  const dPos = pDisk < 0.02 ? tD : {
    x: lerp(tD.x, dc.x, pDisk), y: lerp(tD.y, dc.y, pDisk) - Math.sin(pDisk * Math.PI) * 40,
  };
  const zPos = {x: lerp(tZ.x, zc.x, pZ), y: lerp(tZ.y, zc.y, pZ)};
  const zS = 1 - 0.55 * pSq;
  const gapP = lerp(ts * 0.9, ts * zS * 0.5 + 4, pSq);
  // the ladder
  const L = f(70, 56), R = W - f(70, 56);
  const ly = topH + (H - topH) * 0.56;
  const xOf = (ns: number) => L + ((Math.log10(Math.max(10, ns)) - 1) / 6) * (R - L);
  const ticks = ['10 ns', '100 ns', '1 µs', '10 µs', '100 µs', '1 ms', '10 ms'];
  return (
    <Stage m={m}>
      <rect x={rb.x} y={rb.y} width={rb.w} height={rb.h} rx={14} fill={hexA(c.a, 0.05)} stroke={c.a} strokeWidth={2} {...drawOn(pRam)} />
      <Tx m={m} x={rb.x + 18} y={rb.y + 26} size={f(19, 24)} weight={800} fill={c.a} opacity={pRam}>{ram?.label}</Tx>
      <Tx m={m} x={rb.x} y={rb.y + rb.h + f(26, 32)} size={fit(ram?.sub, rb.w, f(15, 19))} fill={c.dim} opacity={pRam}>{ram?.sub}</Tx>
      {Array.from({length: gcols * grows}).map((_, i) => {
        if (i === gcols * grows - 1 || i === gcols * grows - 2) return null;
        const p = tilePos(i);
        return <PageTile key={i} x={p.x} y={p.y} s={ts} fill={hexA(c.text, 0.08)} stroke={hexA(c.text, 0.35)} opacity={pRam} />;
      })}
      {/* zram corner */}
      <rect x={inner.z.x} y={inner.z.y} width={inner.z.w} height={inner.z.h} rx={10} fill={hexA(c.green, 0.06)}
        stroke={c.green} strokeWidth={1.8} strokeDasharray="7 6" opacity={m.inn(zram)} />
      <Tx m={m} x={inner.z.x + inner.z.w / 2} y={inner.z.y + 20} size={fit(zram?.label, inner.z.w - 16, f(16, 20))} weight={800}
        fill={c.green} anchor="middle" opacity={m.inn(zram)}>{zram?.label}</Tx>
      {/* the press */}
      {zram ? (
        <g opacity={m.inn(zram)}>
          <rect x={zc.x - 10} y={zc.y + ts / 2 - gapP - 10} width={ts + 20} height={10} rx={3} fill={c.green} />
          <rect x={zc.x - 10} y={zc.y + ts / 2 + gapP} width={ts + 20} height={10} rx={3} fill={c.green} />
        </g>
      ) : null}
      <g transform={`translate(${zPos.x + ts / 2} ${zPos.y + ts / 2}) scale(${zS}) translate(${-ts / 2} ${-ts / 2})`}>
        <PageTile x={0} y={0} s={ts} fill={hexA(c.green, 0.3)} stroke={c.green} opacity={pRam} />
      </g>
      {zram?.sub ? (
        <Tx m={m} x={inner.z.x + inner.z.w / 2} y={inner.z.y + inner.z.h - 16} size={fit(zram.sub, inner.z.w - 16, f(14, 18))}
          fill={c.dim} anchor="middle" opacity={pSq}>{zram.sub}</Tx>
      ) : null}
      {/* the long wire to the drive */}
      <path d={wire} fill="none" stroke={c.orange} strokeWidth={3} {...drawOn(pDiskIn)} />
      <Drive m={m} x={dv.x} y={dv.y} w={dv.w} h={dv.h} p={pDiskIn} led={pDisk > 0.97 ? 1 : 0} />
      <PageTile x={dPos.x} y={dPos.y} s={ts} fill={hexA(c.orange, 0.3)} stroke={c.orange} opacity={pRam} />
      <Tx m={m} x={dv.x + dv.w / 2} y={dv.y + dv.h + f(26, 30)} size={fit(disk?.label, dv.w + 40, f(18, 22))} weight={800}
        fill={c.orange} anchor="middle" opacity={pDiskIn}>{disk?.label}</Tx>
      <Tx m={m} x={dv.x + dv.w / 2} y={dv.y + dv.h + f(50, 58)} size={fit(disk?.sub, dv.w + 40, f(15, 18))}
        fill={c.dim} anchor="middle" opacity={pDiskIn}>{disk?.sub}</Tx>
      {rungs.length ? (
        <g>
          <line x1={L} x2={R} y1={ly} y2={ly} stroke={c.dim} strokeWidth={2.5} {...drawOn(m.base)} />
          {ticks.map((t, i) => {
            const x = L + (i / 6) * (R - L);
            return (
              <g key={t}>
                <line x1={x} x2={x} y1={ly - 7} y2={ly + 7} stroke={c.dim} strokeWidth={2} />
                <Tx m={m} x={x} y={ly + f(24, 28)} size={f(15, 16)} fill={c.dim} anchor="middle" mono>{t}</Tx>
              </g>
            );
          })}
          {axis ? (
            <Tx m={m} x={(L + R) / 2} y={ly + f(52, 60)} size={f(15, 18)} fill={c.dim} anchor="middle" opacity={m.inn(axis)}>{axis.label}</Tx>
          ) : null}
          {rungs.map((r, i) => {
            const x = xOf(num(r.value, 100));
            const p = m.land(r);
            const pa = m.inn(r);
            const up = f(i % 2 === 0 ? 40 : 76, i % 2 === 0 ? 46 : 92);
            const col = m.col(r, c.a);
            const labW = Math.max((r.label ?? '').length, (r.sub ?? '').length) * f(17, 20) * 0.54;
            const tx = Math.max(labW / 2 + 4, Math.min(W - labW / 2 - 4, x));
            return (
              <g key={i} opacity={pa}>
                <line x1={x} x2={tx} y1={ly - 10} y2={ly - up + 16} stroke={hexA(col, 0.6)} strokeWidth={1.5} />
                <circle cx={x} cy={ly} r={9 * p} fill={col} />
                <Tx m={m} x={tx} y={ly - up} size={f(17, 20)} weight={800} fill={col} anchor="middle">{r.label}</Tx>
                <Tx m={m} x={tx} y={ly - up - f(22, 26)} size={f(14, 17)} fill={c.dim} anchor="middle">{r.sub}</Tx>
              </g>
            );
          })}
        </g>
      ) : null}
    </Stage>
  );
};

// ── oom-kill ───────────────────────────────────────────────────────────────────────────
// More programs than RAM holds; pages shuttling to the drive and back faster and faster
// (thrashing); then the OOM killer's crosshair lands on the biggest and it collapses.
// roles: ram (value = capacity) · proc (value = size) · thrash · kill
export const OomKill: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, frame} = m;
  const cap = one(items, 'ram'), procs = all(items, 'proc'), thrash = one(items, 'thrash'), kill = one(items, 'kill');
  const capV = num(cap?.value, 8);
  const total = procs.reduce((s, p) => s + num(p.value), 0);
  const x0 = 16, avail = W - 32;
  const k = avail / Math.max(capV, total);
  const barW = capV * k;
  const barH = f(92, 118), barY = f(46, 84);
  const victim = procs.reduce((best, p, i) => (num(p.value) > num(procs[best]?.value) ? i : best), 0);
  const pk = m.go(kill, 22);
  const collapse = kill ? m.go(kill, 16, 24) : 0;
  const palette = [c.a, c.purple, c.green, c.orange, c.blue];
  let cur = x0;
  const blocks = procs.map((p, i) => {
    const w = num(p.value) * k * m.go(p, 18) * (i === victim ? 1 - collapse : 1);
    const b = {x: cur, w, i, p};
    cur += w;
    return b;
  });
  const vb = blocks[victim];
  const overflow = cur - (x0 + barW);
  const driveH = f(72, 108), driveW = f(200, 260);
  const driveY = barY + barH + (H - barY - barH) * f(0.46, 0.5);
  const cx = W / 2, cy = (barY + barH + driveY) / 2, rx = f(150, 150), ry = Math.max(24, (driveY - barY - barH) / 2 - 8);
  const pTh = thrash ? m.inn(thrash) * (1 - collapse) : 0;
  const since = m.since(thrash);
  const ch = {x: lerp(W - 50, vb ? vb.x + vb.w / 2 : W / 2, pk), y: lerp(barY - 20, barY + barH / 2, pk)};
  return (
    <Stage m={m}>
      <Tx m={m} x={x0} y={barY - f(22, 30)} size={f(19, 24)} weight={800} opacity={m.inn(cap)}>{cap?.label}</Tx>
      {blocks.map((b) => {
        const col = b.i === victim && pk > 0.98 ? c.red : m.col(b.p, palette[b.i % palette.length]);
        const flash = b.i === victim ? clamp01(collapse * 3) * (1 - collapse) : 0;
        return (
          <g key={b.i} opacity={m.inn(b.p)}>
            <rect x={b.x + 2} y={barY + 6} width={Math.max(0, b.w - 4)} height={barH - 12} rx={8}
              fill={hexA(col, 0.28 + flash * 0.5)} stroke={col} strokeWidth={2} />
            {b.w > 90 ? (
              <>
                <Tx m={m} x={b.x + b.w / 2} y={barY + barH / 2 - f(12, 16)} size={fit(b.p.label, b.w - 20, f(18, 22))} weight={700} anchor="middle">
                  {b.p.label}
                </Tx>
                <Tx m={m} x={b.x + b.w / 2} y={barY + barH / 2 + f(14, 20)} size={fit(b.p.sub, b.w - 20, f(15, 18))} fill={c.dim} anchor="middle">
                  {b.p.sub}
                </Tx>
              </>
            ) : null}
          </g>
        );
      })}
      <rect x={x0} y={barY} width={barW} height={barH} rx={12} fill="none" stroke={c.text} strokeWidth={3} opacity={m.inn(cap)} />
      {overflow > 2 ? (
        <g>
          <rect x={x0 + barW + 4} y={barY - 6} width={overflow - 2} height={barH + 12} rx={8} fill={hexA(c.red, 0.12)}
            stroke={c.red} strokeWidth={2} strokeDasharray="7 5" />
          {cap?.sub ? (
            <Tx m={m} x={x0 + barW + overflow / 2} y={barY + barH + f(22, 28)} size={fit(cap.sub, Math.max(overflow, 200), f(15, 19))}
              fill={c.red} weight={700} anchor="middle">{cap.sub}</Tx>
          ) : null}
        </g>
      ) : null}
      {thrash ? (
        <g opacity={pTh}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={hexA(c.orange, 0.5)} strokeWidth={2} strokeDasharray="8 7" />
          <Head x={cx + rx} y={cy} ang={Math.PI / 2} s={12} color={c.orange} />
          <Head x={cx - rx} y={cy} ang={-Math.PI / 2} s={12} color={c.orange} />
          {Array.from({length: 4}).map((_, i) => {
            // the shuttle speeds up as long as the pressure lasts — the motion IS the thrashing
            const t = Math.max(0, since);
            const phase = (t * (0.012 + Math.min(0.03, t * 0.0002)) + i / 4) % 1;
            const th2 = phase * Math.PI * 2;
            const s = f(22, 28);
            return (
              <PageTile key={i} x={cx + rx * Math.cos(th2) - s / 2} y={cy + ry * Math.sin(th2) - s / 2} s={s}
                fill={hexA(c.orange, 0.35)} stroke={c.orange} sw={1.6} />
            );
          })}
          <Tx m={m} x={cx - rx - 26} y={cy - 12} size={fit(thrash.label, cx - rx - 40, f(20, 24))} weight={800} fill={c.orange} anchor="end">
            {thrash.label}
          </Tx>
          {wrap(thrash.sub, f(34, 22)).map((ln, i) => (
            <Tx key={i} m={m} x={cx - rx - 26} y={cy + 16 + i * f(20, 24)} size={f(15, 18)} fill={c.dim} anchor="end">{ln}</Tx>
          ))}
        </g>
      ) : null}
      {thrash ? (
        <Drive m={m} x={cx - driveW / 2} y={driveY} w={driveW} h={driveH} p={m.inn(thrash)}
          led={pTh > 0.05 ? Math.floor(Math.max(0, since) / 4) % 2 : 0} />
      ) : null}
      {kill ? (
        <g opacity={m.inn(kill)}>
          {/* the crosshair leaves once its target has gone, so it never appears to aim at
              the block that slid into the victim's place */}
          <g opacity={1 - collapse}>
            <circle cx={ch.x} cy={ch.y} r={f(26, 32)} fill="none" stroke={c.red} strokeWidth={3} />
            <line x1={ch.x - f(38, 46)} x2={ch.x + f(38, 46)} y1={ch.y} y2={ch.y} stroke={c.red} strokeWidth={2.5} />
            <line x1={ch.x} x2={ch.x} y1={ch.y - f(38, 46)} y2={ch.y + f(38, 46)} stroke={c.red} strokeWidth={2.5} />
          </g>
          <Tx m={m} x={W - 16} y={driveY + driveH / 2 - 12} size={fit(kill.label, W - cx - rx - 40, f(20, 24))} weight={800} fill={c.red} anchor="end">
            {kill.label}
          </Tx>
          {wrap(kill.sub, f(34, 22)).map((ln, i) => (
            <Tx key={i} m={m} x={W - 16} y={driveY + driveH / 2 + 16 + i * f(20, 24)} size={f(15, 18)} fill={c.dim} anchor="end">{ln}</Tx>
          ))}
        </g>
      ) : null}
    </Stage>
  );
};

// ── pool-borrow ────────────────────────────────────────────────────────────────────────
// Pools as tanks with a quota line; the full one opens the valve and its quota line
// rises while its neighbour's drops. Room is lent — not data.
// roles: pool (value = % of its quota in use) · borrow
export const Tank: React.FC<{m: ReturnType<typeof useMem>; x: number; y: number; w: number; h: number; level: number; color: string; stroke?: string; id: string; p?: number}> =
({m, x, y, w, h, level, color, stroke, id, p = 1}) => {
  const lv = Math.max(0, Math.min(1.02, level));
  const top = y + h - lv * h;
  const amp = 4;
  let wave = `M ${x} ${top}`;
  for (let i = 0; i <= 24; i++) wave += ` L ${x + (i / 24) * w} ${top + Math.sin(i * 0.9) * amp}`;
  return (
    <g opacity={p}>
      <defs>
        <clipPath id={id}><rect x={x} y={y} width={w} height={h} rx={16} /></clipPath>
      </defs>
      <rect x={x} y={y} width={w} height={h} rx={16} fill={hexA(m.c.text, 0.03)} />
      <g clipPath={`url(#${id})`}>
        <path d={`${wave} L ${x + w} ${y + h + 4} L ${x} ${y + h + 4} Z`} fill={hexA(color, 0.32)} />
        <path d={wave} fill="none" stroke={color} strokeWidth={2.2} />
      </g>
      <rect x={x} y={y} width={w} height={h} rx={16} fill="none" stroke={stroke ?? m.c.dim} strokeWidth={3} />
    </g>
  );
};

export const PoolBorrow: React.FC<MemProps> = ({items, accent, token}) => {
  const m = useMem(accent);
  const {W, H, c, f} = m;
  const pools = all(items, 'pool').slice(0, 4);
  const borrow = one(items, 'borrow');
  const n = Math.max(1, pools.length);
  const labelH = f(66, 90), topH = f(46, 80);
  const gap = f(170, 80);
  const tw = Math.min(f(260, 320), (W - 40 - (n - 1) * gap) / n);
  const th = Math.min(H - labelH - topH, f(9999, tw * 1.5));
  const total = n * tw + (n - 1) * gap;
  const x0 = (W - total) / 2;
  const y0 = topH + (H - topH - labelH - th) / 2;
  const q = 0.7;
  const borrower = pools.reduce((b, p, i) => (num(p.value) > num(pools[b]?.value) ? i : b), 0);
  const lender = borrower + 1 < n ? borrower + 1 : Math.max(0, borrower - 1);
  const pb = m.go(borrow, 26);
  const delta = 0.18 * pb;
  const flowT = m.since(borrow);
  const flowOn = borrow && pb > 0.01 ? 1 - clamp01((flowT - 44) / 14) : 0;
  const palette = [c.a, c.green, c.purple, c.orange];
  const pipeY = y0 + th * 0.74;
  const left = Math.min(borrower, lender), right = Math.max(borrower, lender);
  const pipeX0 = x0 + left * (tw + gap) + tw, pipeX1 = x0 + right * (tw + gap);
  const valve = {x: (pipeX0 + pipeX1) / 2, y: pipeY};
  return (
    <Stage m={m}>
      {n > 1 ? (
        <g opacity={m.inn(borrow)}>
          <rect x={pipeX0 - 2} y={pipeY - 9} width={pipeX1 - pipeX0 + 4} height={18} fill={hexA(c.text, 0.07)} stroke={c.dim} strokeWidth={2} />
          <line x1={borrower < lender ? pipeX1 : pipeX0} x2={borrower < lender ? pipeX0 : pipeX1} y1={pipeY} y2={pipeY}
            stroke={c.yellow} strokeWidth={4} strokeDasharray="10 10" strokeDashoffset={-flowT * 1.6} opacity={flowOn} />
          <circle cx={valve.x} cy={valve.y} r={f(18, 22)} fill={hexA(c.panel, 1)} stroke={c.yellow} strokeWidth={2.5} />
          <line x1={valve.x - f(12, 15)} x2={valve.x + f(12, 15)} y1={valve.y} y2={valve.y} stroke={c.yellow} strokeWidth={4}
            strokeLinecap="round" transform={`rotate(${90 - 90 * pb} ${valve.x} ${valve.y})`} />
          <Tx m={m} x={valve.x} y={y0 - topH / 2} size={fit(borrow?.label, Math.max(gap + tw, 360), f(19, 24))} weight={800} fill={c.yellow} anchor="middle">
            {borrow?.label}
          </Tx>
        </g>
      ) : null}
      {pools.map((p, i) => {
        const x = x0 + i * (tw + gap);
        const col = m.col(p, palette[i % palette.length]);
        const quota = q + (i === borrower ? delta : i === lender ? -delta : 0);
        const used = (num(p.value) / 100) * q * m.go(p, 26);
        const full = used >= quota - 0.005 && i === borrower;
        const qy = y0 + th - quota * th;
        return (
          <g key={i}>
            <Tank m={m} x={x} y={y0} w={tw} h={th} level={used} color={col} stroke={full ? c.red : undefined} id={`mem-pool-${i}`} p={m.inn(p)} />
            <line x1={x - 10} x2={x + tw + 10} y1={qy} y2={qy} stroke={c.yellow} strokeWidth={2.5} strokeDasharray="9 6" opacity={m.inn(p)} />
            {token ? (
              <Tx m={m} x={x + tw - 10} y={qy - 14} size={f(14, 17)} weight={700} fill={c.yellow} anchor="end" opacity={m.inn(p)}>{token}</Tx>
            ) : null}
            <Tx m={m} x={x + tw / 2} y={y0 + th + f(24, 32)} size={fit(p.label, tw + gap * 0.8, f(20, 26))} weight={800} anchor="middle" opacity={m.inn(p)}>
              {p.label}
            </Tx>
            <Tx m={m} x={x + tw / 2} y={y0 + th + f(48, 62)} size={fit(p.sub, tw + gap * 0.8, f(15, 19))} fill={full ? c.red : c.dim} anchor="middle" opacity={m.inn(p)}>
              {p.sub}
            </Tx>
          </g>
        );
      })}
    </Stage>
  );
};

// ── gf-xor ─────────────────────────────────────────────────────────────────────────────
// Bytes as eight bit cells. "Adding" in GF(2^8) is XOR: column by column, no carries.
// Do it again with the same byte and the original comes back. And the multiply the
// name promises: a function box with its plug hanging loose — defined, never called.
// roles: a · b · sum · undo · mul   (a/b value = the byte)
export const GfXor: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v, frame} = m;
  const A = one(items, 'a'), B = one(items, 'b'), S = one(items, 'sum'), U = one(items, 'undo'), MUL = one(items, 'mul');
  const a = Math.round(num(A?.value, 0x5a)) & 255, b = Math.round(num(B?.value, 0x3c)) & 255;
  const s = a ^ b, u = s ^ b;
  const rowsN = U ? 4 : 3;
  const areaW = v.vertical ? W : W * 0.64;
  const areaH = v.vertical ? H * 0.6 : H;
  const labelW = f(190, 170), hexW = f(150, 150);
  const rowH = Math.min(f(74, 104), (areaH - f(40, 60)) / rowsN);
  const cellS = Math.min(rowH * 0.78, (areaW - labelW - hexW - 20) / 8 * 0.86);
  const cg = cellS * 0.16;
  const bitsW = 8 * cellS + 7 * cg;
  const blockW = labelW + bitsW + 24 + hexW;
  const x0 = (areaW - blockW) / 2;
  const y0 = (areaH - rowsN * rowH - f(30, 44)) / 2;
  const bx = x0 + labelW;
  const bit = (val: number, i: number) => (val >> (7 - i)) & 1;
  const colP = (it: typeof S, i: number) => {
    const st = startOf(it);
    if (st == null) return m.base;
    return clamp01((frame - (st + i * 3)) / 6);
  };
  const hex = (x: number) => `0x${x.toString(16).toUpperCase().padStart(2, '0')}`;
  const rows = [
    {it: A, val: a, p: (_: number) => m.inn(A), col: c.a},
    {it: B, val: b, p: (_: number) => m.inn(B), col: c.purple},
    {it: S, val: s, p: (i: number) => colP(S, i), col: c.green},
    ...(U ? [{it: U, val: u, p: (i: number) => colP(U, i), col: c.a}] : []),
  ];
  const mb = v.vertical
    ? {x: W * 0.1, y: H * 0.68, w: W * 0.56, h: f(120, 150)}
    : {x: W * 0.69, y: H / 2 - f(64, 70), w: W * 0.2, h: f(128, 150)};
  const pM = m.inn(MUL);
  const plug = v.vertical
    ? {x0: mb.x + mb.w, y0: mb.y + mb.h / 2, x1: W - 70, y1: mb.y + mb.h / 2}
    : {x0: mb.x + mb.w / 2, y0: mb.y + mb.h, x1: mb.x + mb.w / 2 + 40, y1: H - 24};
  return (
    <Stage m={m}>
      {rows.map((r, ri) => {
        const y = y0 + ri * rowH;
        const done = r.p(7);
        return (
          <g key={ri}>
            {ri === 2 ? <line x1={bx - 8} x2={bx + bitsW + 8} y1={y - rowH * 0.06} y2={y - rowH * 0.06} stroke={c.dim} strokeWidth={2.5} /> : null}
            <Tx m={m} x={x0} y={y + rowH / 2} size={fit(r.it?.label, labelW - 16, f(19, 24))} weight={700}
              fill={ri >= 2 ? r.col : c.text} opacity={Math.max(0.35, r.p(0))}>{r.it?.label}</Tx>
            {Array.from({length: 8}).map((_, i) => {
              const p = r.p(i);
              // the column being computed glows, top to bottom
              const scan = ri >= 2 ? p * (1 - p) * 4 : 0;
              return (
                <g key={i}>
                  {scan > 0.02 ? (
                    <rect x={bx + i * (cellS + cg) - 3} y={y0 - 4} width={cellS + 6} height={(ri + 1) * rowH}
                      rx={6} fill={hexA(r.col, 0.12 * scan)} />
                  ) : null}
                  <rect x={bx + i * (cellS + cg)} y={y + (rowH - cellS) / 2} width={cellS} height={cellS} rx={6}
                    fill={p > 0.5 && bit(r.val, i) ? hexA(r.col, 0.45) : hexA(c.text, 0.04)}
                    stroke={p > 0.02 ? r.col : c.line} strokeWidth={1.8} />
                  <Tx m={m} x={bx + i * (cellS + cg) + cellS / 2} y={y + rowH / 2} size={cellS * 0.5} mono weight={800}
                    anchor="middle" fill={bit(r.val, i) ? c.text : c.dim} opacity={p > 0.5 ? 1 : 0}>{String(bit(r.val, i))}</Tx>
                </g>
              );
            })}
            <Tx m={m} x={bx + bitsW + 24} y={y + rowH / 2} size={f(24, 30)} mono weight={800} fill={r.col} opacity={done > 0.5 ? 1 : 0}>
              {hex(r.val)}
            </Tx>
            {ri === 3 ? (
              <Mark cx={bx + bitsW + 24 + hexW - 20} cy={y + rowH / 2} s={f(26, 32)} ok color={c.green} p={clamp01((r.p(7) - 0.5) * 2)} />
            ) : null}
          </g>
        );
      })}
      {S?.sub ? (
        <Tx m={m} x={bx} y={y0 + rowsN * rowH + f(18, 26)} size={fit(S.sub, bitsW + hexW, f(16, 20))} fill={c.dim} opacity={m.inn(S)}>{S.sub}</Tx>
      ) : null}
      {MUL ? (
        <g opacity={pM}>
          <rect x={mb.x} y={mb.y} width={mb.w} height={mb.h} rx={12} fill={hexA(c.text, 0.04)} stroke={c.dim} strokeWidth={2} strokeDasharray="8 6" />
          <Tx m={m} x={mb.x + mb.w / 2} y={mb.y + mb.h * 0.36} size={fit(MUL.label, mb.w - 24, f(24, 30), true)} mono weight={700} anchor="middle">
            {MUL.label}
          </Tx>
          <Tx m={m} x={mb.x + mb.w / 2} y={mb.y + mb.h * 0.7} size={fit(MUL.sub, mb.w - 20, f(16, 20))} weight={700} fill={c.red} anchor="middle">
            {MUL.sub}
          </Tx>
          {/* the plug, hanging free */}
          <path d={v.vertical
            ? `M ${plug.x0} ${plug.y0} C ${plug.x0 + 40} ${plug.y0} ${plug.x1 - 60} ${plug.y1 + 60} ${plug.x1 - 30} ${plug.y1 + 40}`
            : `M ${plug.x0} ${plug.y0} C ${plug.x0} ${plug.y0 + 30} ${plug.x1 - 20} ${plug.y1 - 40} ${plug.x1} ${plug.y1 - 18}`}
            fill="none" stroke={c.dim} strokeWidth={3} />
          {v.vertical ? (
            <g transform={`translate(${plug.x1 - 30} ${plug.y1 + 40}) rotate(-30)`}>
              <rect x={-12} y={-14} width={24} height={28} rx={4} fill={c.dim} />
              <rect x={12} y={-10} width={14} height={5} fill={c.dim} />
              <rect x={12} y={5} width={14} height={5} fill={c.dim} />
            </g>
          ) : (
            <g transform={`translate(${plug.x1} ${plug.y1 - 18})`}>
              <rect x={-12} y={-4} width={24} height={20} rx={4} fill={c.dim} />
              <rect x={-9} y={16} width={5} height={10} fill={c.dim} />
              <rect x={4} y={16} width={5} height={10} fill={c.dim} />
            </g>
          )}
        </g>
      ) : null}
    </Stage>
  );
};

// ── sparse-encode ──────────────────────────────────────────────────────────────────────
// The encoder that actually runs. A 4 KB page as 64 × 64 bytes; the zeros vanish; each
// surviving byte flies out as a three-byte tuple (two for where, one for what); the
// bytes it costs fill a bar measured against the page it came from.
// roles: page (value = non-zero bytes) · zeros · tuple · total · limit
export const SparseEncode: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v, frame} = m;
  const page = one(items, 'page'), zeros = one(items, 'zeros'), tuple = one(items, 'tuple');
  const total = one(items, 'total'), limit = one(items, 'limit');
  const N = Math.max(1, Math.round(num(page?.value, 40)));
  const pos: number[] = [];
  for (let k = 0; pos.length < Math.min(N, 600) && k < 20000; k++) {
    const p = Math.floor(rnd(k * 13 + 7) * 4096);
    if (!pos.includes(p)) pos.push(p);
  }
  pos.sort((x, y) => x - y);
  const vals = pos.map((_, i) => 1 + Math.floor(rnd(i * 31 + 3) * 254));
  const gs = v.vertical ? Math.min(W - 160, H * 0.4) : Math.min(H - 96, W * 0.28);
  const cs = gs / 64;
  const gx = v.vertical ? (W - gs) / 2 : 12;
  const gy = v.vertical ? 50 : 46;
  const pZ = m.go(zeros, 20);
  const cw = f(54, 66), chh = f(38, 48), cg = 6;
  const tuW = 3 * cw + 2 * cg;
  const tx = v.vertical ? 40 : gx + gs + 100;
  const ty = v.vertical ? gy + gs + 70 : gy;
  const cols2 = v.vertical ? 2 : 1;
  const availH = v.vertical ? H - ty - 170 : H - ty - 10;
  const perCol = Math.max(1, Math.floor((availH - 40) / (chh + 10)));
  const K = Math.min(pos.length, perCol * cols2, 6);
  const slot = (j: number) => ({
    x: tx + Math.floor(j / perCol) * (tuW + 70),
    y: ty + 40 + (j % perCol) * (chh + 10),
  });
  const h2 = (x: number) => x.toString(16).toUpperCase().padStart(2, '0');
  const ts = startOf(tuple);
  const bytes = 12 + 2 + 3 * N;
  const bar = v.vertical
    ? {x: 40, y: ty + 40 + Math.min(K, perCol) * (chh + 10) + 70, w: W - 80, h: f(34, 44)}
    : {x: tx + tuW + 110, y: H / 2 - 10, w: W - (tx + tuW + 110) - 16, h: f(40, 44)};
  const pT = m.go(total, 26);
  const xB = (b: number) => bar.x + (b / 4096) * bar.w;
  return (
    <Stage m={m}>
      <defs>
        <pattern id="mem-sparse-grid" width={cs} height={cs} patternUnits="userSpaceOnUse" x={gx} y={gy}>
          <rect x={cs * 0.08} y={cs * 0.08} width={cs * 0.84} height={cs * 0.84} fill={hexA(c.text, lerp(0.1, 0.02, pZ))} />
        </pattern>
      </defs>
      <Tx m={m} x={gx} y={gy - 24} size={fit(page?.label, gs + 60, f(18, 24))} weight={800} opacity={m.inn(page)}>{page?.label}</Tx>
      <rect x={gx} y={gy} width={gs} height={gs} fill="url(#mem-sparse-grid)" stroke={c.dim} strokeWidth={2} opacity={m.inn(page)} />
      {pos.map((p, i) => {
        const flown = i < K ? travelAt(frame, (ts ?? -99) + i * 6, 18) : 0;
        return (
          <rect key={i} x={gx + (p % 64) * cs - cs * 0.3} y={gy + Math.floor(p / 64) * cs - cs * 0.3} width={cs * 1.6} height={cs * 1.6}
            rx={cs * 0.3} fill={c.a} opacity={m.inn(page) * (1 - flown * 0.7)} />
        );
      })}
      {zeros ? (
        <Tx m={m} x={gx + gs / 2} y={gy + gs + f(24, 30)} size={fit(zeros.label, gs + 40, f(17, 22))} weight={700} fill={c.dim} anchor="middle" opacity={pZ}>
          {zeros.label}
        </Tx>
      ) : null}
      {tuple ? (
        <Tx m={m} x={tx} y={ty + 12} size={fit(tuple.label, v.vertical ? W - 80 : tuW + 260, f(18, 22))} weight={800} fill={c.a} opacity={m.inn(tuple)}>
          {tuple.label}
        </Tx>
      ) : null}
      {pos.slice(0, K).map((p, j) => {
        const st = ts ?? -99;
        const q = ts == null ? m.base : travelAt(frame, st + j * 6, 18);
        const from = {x: gx + (p % 64) * cs, y: gy + Math.floor(p / 64) * cs};
        const to = slot(j);
        const land = clamp01((q - 0.75) / 0.25);
        return (
          <g key={j}>
            {q > 0.01 && q < 0.999 ? (
              <rect x={lerp(from.x, to.x, q) - 5} y={lerp(from.y, to.y, q) - 5} width={12} height={12} rx={3} fill={c.a} />
            ) : null}
            <g opacity={land}>
              {[h2(p & 255), h2((p >> 8) & 255), h2(vals[j])].map((t, k) => (
                <g key={k}>
                  <rect x={to.x + k * (cw + cg)} y={to.y} width={cw} height={chh} rx={6}
                    fill={k === 2 ? hexA(c.a, 0.3) : hexA(c.yellow, 0.14)} stroke={k === 2 ? c.a : c.yellow} strokeWidth={1.6} />
                  <Tx m={m} x={to.x + k * (cw + cg) + cw / 2} y={to.y + chh / 2} size={chh * 0.46} mono weight={700} anchor="middle">{t}</Tx>
                </g>
              ))}
            </g>
          </g>
        );
      })}
      {tuple?.sub ? (
        <Tx m={m} x={slot(0).x} y={slot(Math.min(K, perCol) - 1).y + chh + f(24, 30)} size={f(15, 18)} fill={c.dim} opacity={m.inn(tuple)}>
          {N > K ? `+ ${fmt(N - K)} more · ` : ''}{tuple.sub}
        </Tx>
      ) : null}
      {total ? (
        <g opacity={m.inn(total)}>
          <Tx m={m} x={bar.x} y={bar.y - f(26, 30)} size={fit(total.label, bar.w, f(19, 24))} weight={800}>{total.label}</Tx>
          <rect x={bar.x} y={bar.y} width={bar.w} height={bar.h} rx={8} fill={hexA(c.text, 0.04)} stroke={c.dim} strokeWidth={2} />
          <rect x={bar.x} y={bar.y} width={Math.max(3, ((bytes / 4096) * bar.w) * pT)} height={bar.h} rx={8} fill={hexA(c.a, 0.55)} />
          <Tx m={m} x={bar.x + Math.max(3, (bytes / 4096) * bar.w) * pT + 12} y={bar.y + bar.h / 2} size={f(18, 22)} mono weight={800} fill={c.a}>
            {`${fmt(bytes)} B`}
          </Tx>
          <Tx m={m} x={bar.x + bar.w} y={bar.y + bar.h + f(22, 26)} size={f(15, 18)} mono fill={c.dim} anchor="end">4,096 B</Tx>
          {total.sub ? <Tx m={m} x={bar.x} y={bar.y + bar.h + f(22, 26)} size={fit(total.sub, bar.w * 0.7, f(15, 18))} fill={c.dim}>{total.sub}</Tx> : null}
        </g>
      ) : null}
      {limit ? (
        <g opacity={m.inn(limit)}>
          <line x1={xB(14 + 3 * 1024)} x2={xB(14 + 3 * 1024)} y1={bar.y - 12} y2={bar.y + bar.h + 12} stroke={c.red} strokeWidth={2.5} strokeDasharray="6 5" />
          <Tx m={m} x={xB(14 + 3 * 1024)} y={bar.y + bar.h + f(50, 58)} size={fit(limit.label, bar.w * 0.8, f(16, 19))} weight={700} fill={c.red} anchor="middle">
            {limit.label}
          </Tx>
        </g>
      ) : null}
    </Stage>
  );
};

// ── dense-fallback ─────────────────────────────────────────────────────────────────────
// A page with real content: the dense attempt's output runs straight past the 3,072-byte
// line it has to beat, so the page is stored raw — 4,096 bytes plus a 12-byte header.
// roles: page (value = non-zero bytes) · dense · fail · raw
export const DenseFallback: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v} = m;
  const page = one(items, 'page'), dense = one(items, 'dense'), fail = one(items, 'fail'), raw = one(items, 'raw');
  const share = clamp01(num(page?.value, 2300) / 4096);
  const gs = v.vertical ? Math.min(W * 0.52, H * 0.34) : Math.min(H - 96, W * 0.24);
  const gx = v.vertical ? (W - gs) / 2 : 12, gy = v.vertical ? 48 : 46;
  const n = 32, cs = gs / n;
  const mx = v.vertical ? 40 : gx + gs + 110;
  const mw = W - mx - f(40, 40);
  const my1 = v.vertical ? gy + gs + 130 : H * 0.3;
  const my2 = v.vertical ? my1 + 250 : H * 0.72;
  const mh = f(40, 48);
  const MAX = 4608;
  const xB = (b: number) => mx + (b / MAX) * mw;
  const pD = m.go(dense, 30), pF = m.inn(fail), pR = m.go(raw, 26);
  return (
    <Stage m={m}>
      <defs>
        <linearGradient id="mem-dense-tail" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={c.orange} stopOpacity={0.6} />
          <stop offset="1" stopColor={c.orange} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Tx m={m} x={gx} y={gy - 24} size={fit(page?.label, gs + 80, f(18, 24))} weight={800} opacity={m.inn(page)}>{page?.label}</Tx>
      <rect x={gx} y={gy} width={gs} height={gs} fill={hexA(c.text, 0.03)} stroke={c.dim} strokeWidth={2} opacity={m.inn(page)} />
      {Array.from({length: n * n}).map((_, i) => (rnd(i * 3 + 11) < share ? (
        <rect key={i} x={gx + (i % n) * cs + cs * 0.1} y={gy + Math.floor(i / n) * cs + cs * 0.1} width={cs * 0.8} height={cs * 0.8}
          rx={1} fill={hexA(c.a, 0.25 + 0.5 * rnd(i + 99))} opacity={m.inn(page)} />
      ) : null))}
      {page?.sub ? (
        <Tx m={m} x={gx + gs / 2} y={gy + gs + f(24, 30)} size={fit(page.sub, gs + 60, f(15, 19))} fill={c.dim} anchor="middle" opacity={m.inn(page)}>{page.sub}</Tx>
      ) : null}
      {[{y: my1, it: dense, p: pD}, {y: my2, it: raw, p: pR}].map((row, ri) => (
        <g key={ri} opacity={m.inn(row.it)}>
          <Tx m={m} x={mx} y={row.y - f(30, 36)} size={fit(row.it?.label, mw, f(19, 24))} weight={800}>{row.it?.label}</Tx>
          <rect x={mx} y={row.y} width={mw} height={mh} rx={8} fill={hexA(c.text, 0.03)} stroke={c.line} strokeWidth={1.5} />
          {ri === 0 ? <rect x={mx} y={row.y} width={xB(3072) - mx} height={mh} rx={8} fill={hexA(c.green, 0.1)} /> : null}
          {[1024, 2048, 3072, 4096].map((b) => (
            <g key={b}>
              <line x1={xB(b)} x2={xB(b)} y1={row.y - 4} y2={row.y + mh + 4} stroke={b === 3072 && ri === 0 ? c.green : b === 4096 ? c.text : c.line}
                strokeWidth={b === 4096 || (b === 3072 && ri === 0) ? 2.5 : 1.2} />
              <Tx m={m} x={xB(b)} y={row.y + mh + f(20, 24)} size={f(14, 16)} mono fill={c.dim} anchor="middle">{fmt(b)}</Tx>
            </g>
          ))}
          {ri === 0 ? (
            <g>
              <rect x={mx} y={row.y + 6} width={(xB(3072) - mx) * clamp01(pD / 0.8)} height={mh - 12} rx={5} fill={hexA(c.orange, 0.6)} />
              <rect x={xB(3072)} y={row.y + 6} width={(xB(3600) - xB(3072)) * clamp01((pD - 0.8) / 0.2)} height={mh - 12} fill="url(#mem-dense-tail)" />
              {dense?.sub ? <Tx m={m} x={mx + 10} y={row.y + mh + f(46, 54)} size={fit(dense.sub, mw * 0.62, f(15, 18))} fill={c.green}>{dense.sub}</Tx> : null}
              <Mark cx={xB(3072)} cy={row.y - f(26, 30)} s={f(30, 36)} ok={false} color={c.red} p={pF} />
              {fail ? (
                <Tx m={m} x={xB(3072) + 30} y={row.y - f(28, 34)} size={fit(fail.label, mx + mw - xB(3072) - 40, f(17, 21))} weight={800} fill={c.red} opacity={pF}>
                  {fail.label}
                </Tx>
              ) : null}
            </g>
          ) : (
            <g>
              <rect x={mx} y={row.y + 6} width={(xB(4096) - mx) * pR} height={mh - 12} rx={5} fill={hexA(c.text, 0.35)} />
              <rect x={xB(4096)} y={row.y + 6} width={Math.max(4, xB(4108) - xB(4096)) * clamp01((pR - 0.9) * 10)} height={mh - 12} fill={c.yellow} />
              {raw?.sub ? (
                <Tx m={m} x={xB(4108) + 14} y={row.y + mh / 2} size={f(17, 20)} mono weight={800} fill={c.yellow} opacity={clamp01((pR - 0.9) * 10)}>{raw.sub}</Tx>
              ) : null}
            </g>
          )}
        </g>
      ))}
    </Stage>
  );
};

// ── chart-literals ─────────────────────────────────────────────────────────────────────
// The dashboard's bars, with a string tied from the top of each bar to the number typed
// into the plotting script — and the results file on its own, its cable cut.
// roles: bar (value) · code (label = the source line, sub = file · line) · json
export const ChartLiterals: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v} = m;
  const bars = all(items, 'bar'), code = one(items, 'code'), json = one(items, 'json');
  const card = v.vertical ? {x: 10, y: 10, w: W - 20, h: H * 0.42} : {x: 10, y: 10, w: W * 0.34, h: H - 20};
  const pl = {x: card.x + 64, y: card.y + 30, w: card.w - 100, h: card.h - 84};
  const vmax = Math.max(1, ...bars.map((b) => num(b.value)));
  const ymax = Math.ceil(vmax + 0.5);
  const nb = Math.max(1, bars.length);
  const bw = Math.min(f(110, 150), pl.w / (nb * 1.8));
  const bxOf = (i: number) => pl.x + (pl.w / nb) * (i + 0.5) - bw / 2;
  const cb = v.vertical ? {x: 56, y: H * 0.5, w: W - 66, h: f(96, 120)} : {x: W * 0.42, y: H * 0.1, w: W * 0.58 - 12, h: f(104, 120)};
  const fsz = fit(code?.label, cb.w - 40, f(30, 30), true);
  const textX = cb.x + 20;
  const chW = fsz * 0.6;
  const jb = v.vertical ? {x: 70, y: H * 0.78} : {x: W * 0.42 + 10, y: H * 0.62};
  const js = f(70, 84);
  const pJ = m.inn(json), cut = m.go(json, 16, 12);
  const palette = [c.dim, c.a, c.green, c.purple];
  return (
    <Stage m={m}>
      <rect x={card.x} y={card.y} width={card.w} height={card.h} rx={12} fill={hexA(c.text, 0.03)} stroke={c.line} strokeWidth={1.5} />
      {Array.from({length: ymax + 1}).map((_, i) => {
        const y = pl.y + pl.h - (i / ymax) * pl.h;
        return (
          <g key={i}>
            <line x1={pl.x} x2={pl.x + pl.w} y1={y} y2={y} stroke={hexA(c.text, i === 0 ? 0.35 : 0.08)} strokeWidth={1.2} />
            <Tx m={m} x={pl.x - 12} y={y} size={f(14, 17)} mono fill={c.dim} anchor="end">{`${i}×`}</Tx>
          </g>
        );
      })}
      {bars.map((b, i) => {
        const val = num(b.value);
        const p = m.go(b, 20);
        const h = (val / ymax) * pl.h * p;
        const col = m.col(b, palette[i % palette.length]);
        return (
          <g key={i} opacity={m.inn(b)}>
            <rect x={bxOf(i)} y={pl.y + pl.h - h} width={bw} height={h} rx={5} fill={hexA(col, 0.55)} stroke={col} strokeWidth={2} />
            <Tx m={m} x={bxOf(i) + bw / 2} y={pl.y + pl.h - h - 18} size={f(20, 26)} mono weight={800} anchor="middle">{`${val}×`}</Tx>
            <Tx m={m} x={bxOf(i) + bw / 2} y={pl.y + pl.h + 24} size={fit(b.label, pl.w / nb, f(16, 20))} weight={700} fill={c.dim} anchor="middle">{b.label}</Tx>
          </g>
        );
      })}
      {code ? (
        <g opacity={m.inn(code)}>
          <Tx m={m} x={cb.x} y={cb.y + cb.h + 22} size={f(15, 18)} mono fill={c.dim}>{code.sub}</Tx>
          <rect x={cb.x} y={cb.y} width={cb.w} height={cb.h} rx={10} fill={hexA(c.text, 0.05)} stroke={c.line} strokeWidth={1.5} />
          {bars.map((b, i) => {
            const needle = String(b.value);
            const idx = (code.label ?? '').indexOf(needle);
            if (idx < 0) return null;
            const nx = textX + idx * chW, nw = needle.length * chW;
            const p = m.go(code, 22, i * 10);
            const col = m.col(b, palette[i % palette.length]);
            const top = cb.y + cb.h / 2 - fsz * 0.72;
            const bt = {x: bxOf(i) + bw / 2, y: pl.y + pl.h - (num(b.value) / ymax) * pl.h - 38};
            const d = v.vertical
              ? `M ${bt.x} ${bt.y} C ${bt.x} ${bt.y - 40} ${nx + nw / 2} ${top - 180} ${nx + nw / 2} ${top}`
              : `M ${bt.x} ${bt.y} C ${bt.x + 120} ${bt.y - 70} ${nx + nw / 2 - 60} ${top - 70} ${nx + nw / 2} ${top}`;
            return (
              <g key={i}>
                <rect x={nx - 4} y={cb.y + cb.h / 2 - fsz * 0.7} width={nw + 8} height={fsz * 1.4} rx={5} fill={hexA(col, 0.3 * p)} stroke={col} strokeWidth={2} opacity={p} />
                <path d={d} fill="none" stroke={col} strokeWidth={2.5} {...drawOn(p)} />
                <circle cx={nx + nw / 2} cy={top} r={4.5} fill={col} opacity={p > 0.97 ? 1 : 0} />
              </g>
            );
          })}
          <Tx m={m} x={textX} y={cb.y + cb.h / 2} size={fsz} mono weight={600}>{code.label}</Tx>
        </g>
      ) : null}
      {json ? (
        <g opacity={pJ}>
          <PageTile x={jb.x} y={jb.y} s={js} fill={hexA(c.text, 0.06)} stroke={c.dim} />
          <Tx m={m} x={jb.x + js / 2} y={jb.y + js * 0.58} size={js * 0.3} mono weight={800} fill={c.dim} anchor="middle">{'{ }'}</Tx>
          <Tx m={m} x={jb.x + js + 20} y={jb.y + js * 0.3} size={fit(json.label, W - jb.x - js - 40, f(19, 22), true)} mono weight={700}>{json.label}</Tx>
          {wrap(json.sub, v.vertical ? 38 : 60).map((ln, i) => (
            <Tx key={i} m={m} x={jb.x + js + 20} y={jb.y + js * 0.3 + f(28, 32) * (i + 1)} size={f(16, 19)} fill={c.dim}>{ln}</Tx>
          ))}
          {/* the cable from the results file to the chart — cut */}
          {v.vertical ? (() => {
            // 9:16: the code box sits between the file and the chart, so the cable runs up
            // the left gutter beside it rather than through it.
            const x = 24, yTop = card.y + card.h + 6, yBot = jb.y + js / 2;
            const mid = (yTop + yBot) / 2, g2 = 18;
            return (
              <g>
                <path d={`M ${jb.x - 6} ${yBot} H ${x} V ${mid + g2}`} fill="none" stroke={c.dim} strokeWidth={3} strokeDasharray="8 6" />
                <path d={`M ${x} ${mid - g2} V ${yTop}`} fill="none" stroke={c.dim} strokeWidth={3} strokeDasharray="8 6" />
                <Mark cx={x} cy={mid} s={f(30, 34)} ok={false} color={c.red} p={cut} />
              </g>
            );
          })() : (() => {
            const a0 = v.vertical ? {x: jb.x + js / 2, y: jb.y - 6} : {x: jb.x - 6, y: jb.y + js / 2};
            const a1 = v.vertical ? {x: jb.x + js / 2, y: card.y + card.h + 6} : {x: card.x + card.w + 6, y: jb.y + js / 2};
            const mid = {x: (a0.x + a1.x) / 2, y: (a0.y + a1.y) / 2};
            const g2 = 16;
            const dx = v.vertical ? 0 : g2, dy = v.vertical ? g2 : 0;
            return (
              <g>
                <line x1={a0.x} y1={a0.y} x2={mid.x + dx} y2={mid.y + dy} stroke={c.dim} strokeWidth={3} strokeDasharray="8 6" />
                <line x1={mid.x - dx} y1={mid.y - dy} x2={a1.x} y2={a1.y} stroke={c.dim} strokeWidth={3} strokeDasharray="8 6" />
                <Mark cx={mid.x} cy={mid.y} s={f(30, 36)} ok={false} color={c.red} p={cut} />
              </g>
            );
          })()}
        </g>
      ) : null}
    </Stage>
  );
};

// ── sim-constants ──────────────────────────────────────────────────────────────────────
// Left: the simulated Linux, charged by fixed stamps on a stopwatch (+1.5 ms a write,
// +2.5 ms a read). Right: the simulated FluidRAM, its fault counter padlocked at zero and
// its write call wired to always say yes.
// roles: linux · write (value = ms) · read (value = ms) · fr · faults · oom · always
export const SimConstants: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v} = m;
  const linux = one(items, 'linux'), wr = one(items, 'write'), rd = one(items, 'read');
  const fr = one(items, 'fr'), faults = one(items, 'faults'), oom = one(items, 'oom'), always = one(items, 'always');
  const L = v.vertical ? {x: 0, y: 0, w: W, h: H / 2 - 16} : {x: 0, y: 0, w: W / 2 - 24, h: H};
  const R = v.vertical ? {x: 0, y: H / 2 + 16, w: W, h: H / 2 - 16} : {x: W / 2 + 24, y: 0, w: W / 2 - 24, h: H};
  const r = Math.min(L.w * 0.2, (L.h - 90) * 0.42);
  const sw = {x: L.x + r + 30, y: L.y + 70 + (L.h - 70) / 2};
  const ang = -90 + 36 * (num(wr?.value, 1.5) * m.land(wr, 16, 6) + num(rd?.value, 2.5) * m.land(rd, 16, 6)) * (wr || rd ? 1 : 0);
  const chipX = sw.x + r + 50, chipW = L.x + L.w - chipX - 10;
  const chips = [wr, rd].filter(Boolean) as NonNullable<typeof wr>[];
  const digW = f(48, 58), digH = f(72, 86);
  const od = {x: R.x + 20, y: R.y + f(96, 120)};
  const lockP = m.land(faults, 18, 4);
  const div = v.vertical
    ? <line x1={20} x2={W - 20} y1={H / 2} y2={H / 2} stroke={c.line} strokeWidth={2} strokeDasharray="6 8" />
    : <line x1={W / 2} x2={W / 2} y1={10} y2={H - 10} stroke={c.line} strokeWidth={2} strokeDasharray="6 8" />;
  return (
    <Stage m={m}>
      {div}
      {/* LEFT — fixed charges */}
      <g opacity={m.inn(linux)}>
        <Tx m={m} x={L.x + 10} y={L.y + 22} size={fit(linux?.label, L.w - 20, f(20, 26))} weight={800}>{linux?.label}</Tx>
        <Tx m={m} x={L.x + 10} y={L.y + f(48, 56)} size={fit(linux?.sub, L.w - 20, f(15, 19))} fill={c.dim}>{linux?.sub}</Tx>
        <circle cx={sw.x} cy={sw.y} r={r} fill={hexA(c.text, 0.04)} stroke={c.dim} strokeWidth={3} />
        <rect x={sw.x - 10} y={sw.y - r - 18} width={20} height={14} rx={3} fill={c.dim} />
        {Array.from({length: 10}).map((_, i) => {
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
          return <line key={i} x1={sw.x + Math.cos(a) * r * 0.82} y1={sw.y + Math.sin(a) * r * 0.82}
            x2={sw.x + Math.cos(a) * r * 0.94} y2={sw.y + Math.sin(a) * r * 0.94} stroke={c.dim} strokeWidth={2.5} />;
        })}
        <line x1={sw.x} y1={sw.y} x2={sw.x + Math.cos((ang * Math.PI) / 180) * r * 0.78} y2={sw.y + Math.sin((ang * Math.PI) / 180) * r * 0.78}
          stroke={c.orange} strokeWidth={4} strokeLinecap="round" />
        <circle cx={sw.x} cy={sw.y} r={6} fill={c.orange} />
      </g>
      {chips.map((ch, i) => {
        const p = m.land(ch, 16);
        const y = sw.y - (chips.length - 1) * f(44, 52) + i * f(88, 104) - f(34, 40);
        return (
          <g key={i} opacity={clamp01(p * 1.3)} transform={`translate(0 ${(1 - Math.min(1, p)) * -30})`}>
            <rect x={chipX} y={y} width={chipW} height={f(68, 80)} rx={10} fill={hexA(c.orange, 0.1)} stroke={c.orange} strokeWidth={2} />
            <Tx m={m} x={chipX + 18} y={y + f(24, 28)} size={f(24, 30)} mono weight={800} fill={c.orange}>{ch.label}</Tx>
            <Tx m={m} x={chipX + 18} y={y + f(50, 58)} size={fit(ch.sub, chipW - 30, f(15, 18))} fill={c.dim}>{ch.sub}</Tx>
          </g>
        );
      })}
      {/* RIGHT — constants that cannot move */}
      <g opacity={m.inn(fr)}>
        <Tx m={m} x={R.x + 10} y={R.y + 22} size={fit(fr?.label, R.w - 20, f(20, 26))} weight={800}>{fr?.label}</Tx>
        <Tx m={m} x={R.x + 10} y={R.y + f(48, 56)} size={fit(fr?.sub, R.w - 20, f(15, 19))} fill={c.dim}>{fr?.sub}</Tx>
      </g>
      {faults ? (
        <g opacity={m.inn(faults)}>
          {Array.from({length: 4}).map((_, i) => (
            <g key={i}>
              <rect x={od.x + i * (digW + 8)} y={od.y} width={digW} height={digH} rx={8} fill={hexA(c.text, 0.06)} stroke={c.dim} strokeWidth={2} />
              <line x1={od.x + i * (digW + 8)} x2={od.x + i * (digW + 8) + digW} y1={od.y + digH / 2} y2={od.y + digH / 2} stroke={hexA(c.text, 0.12)} />
              <Tx m={m} x={od.x + i * (digW + 8) + digW / 2} y={od.y + digH / 2} size={digH * 0.56} mono weight={800} anchor="middle">0</Tx>
            </g>
          ))}
          <Padlock m={m} cx={od.x + 4 * (digW + 8) + f(34, 40)} cy={od.y + digH / 2 + 6} s={f(52, 62)} color={c.red} closed={lockP} opacity={clamp01(lockP * 1.4)} />
          <Tx m={m} x={od.x + 4 * (digW + 8) + f(80, 94)} y={od.y + digH / 2 - 14} size={fit(faults.label, R.x + R.w - od.x - 4 * (digW + 8) - f(90, 104), f(18, 22), true)} mono weight={700}>
            {faults.label}
          </Tx>
          <Tx m={m} x={od.x + 4 * (digW + 8) + f(80, 94)} y={od.y + digH / 2 + 16} size={f(15, 18)} weight={700} fill={c.red}>{faults.sub}</Tx>
        </g>
      ) : null}
      {oom ? (
        <g opacity={m.inn(oom)}>
          <Padlock m={m} cx={od.x + 20} cy={od.y + digH + f(56, 70)} s={f(34, 40)} color={c.red} closed={m.land(oom, 16)} />
          <Tx m={m} x={od.x + 52} y={od.y + digH + f(54, 68)} size={fit(oom.label, R.w - 80, f(18, 22), true)} mono weight={700}>{oom.label}</Tx>
        </g>
      ) : null}
      {always ? (
        <g opacity={m.inn(always)}>
          <rect x={od.x} y={od.y + digH + f(96, 120)} width={Math.min(R.w - 40, f(470, 600))} height={f(52, 62)} rx={26} fill={hexA(c.green, 0.1)} stroke={c.green} strokeWidth={2} />
          <Tx m={m} x={od.x + 22} y={od.y + digH + f(96, 120) + f(26, 31)} size={fit(always.label, f(380, 500), f(18, 22), true)} mono weight={700}>{always.label}</Tx>
          <Mark cx={od.x + Math.min(R.w - 40, f(470, 600)) - 30} cy={od.y + digH + f(96, 120) + f(26, 31)} s={f(24, 28)} ok color={c.green} p={m.go(always, 14, 6)} />
          {always.sub ? (
            <Tx m={m} x={od.x} y={od.y + digH + f(96, 120) + f(78, 92)} size={fit(always.sub, R.w - 40, f(15, 18))} fill={c.dim}>{always.sub}</Tx>
          ) : null}
        </g>
      ) : null}
    </Stage>
  );
};

// ── declared-vs-real ───────────────────────────────────────────────────────────────────
// A dashed ghost the size of the declared workload beside the small solid block that
// was actually resident — areas to scale — and the division that makes the headline.
// roles: declared (value MB) · resident (value MB) · ratio (label = the result)
export const DeclaredVsReal: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v} = m;
  const decl = one(items, 'declared'), res = one(items, 'resident'), ratio = one(items, 'ratio');
  const dv = num(decl?.value, 1024), rv = num(res?.value, 29.2);
  const gS = v.vertical ? Math.min(W - 280, H * 0.46) : H - 70;
  const gx = v.vertical ? 30 : 24, gy = v.vertical ? 60 : (H - gS) / 2 + 8;
  const sS = gS * Math.sqrt(rv / dv);
  const sx = gx + gS + f(50, 36), sy = gy + gS - sS;
  const pD = m.inn(decl), pR = m.land(res, 18), pQ = m.land(ratio, 18);
  const eqX = v.vertical ? 40 : sx + Math.max(sS, 240) + 70;
  const eqY = v.vertical ? gy + gS + 150 : H / 2;
  return (
    <Stage m={m}>
      <defs>
        <pattern id="mem-ghost-hatch" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={14} stroke={hexA(c.text, 0.07)} strokeWidth={3} />
        </pattern>
      </defs>
      <g opacity={pD}>
        <rect x={gx} y={gy} width={gS} height={gS} rx={10} fill="url(#mem-ghost-hatch)" stroke={c.dim} strokeWidth={2.5} strokeDasharray="12 9" />
        <Tx m={m} x={gx + gS / 2} y={gy + gS / 2 - f(44, 56)} size={fit(decl?.label, gS - 30, f(18, 22))} weight={700} fill={c.dim} anchor="middle">{decl?.label}</Tx>
        <Tx m={m} x={gx + gS / 2} y={gy + gS / 2} size={f(44, 56)} weight={800} fill={c.dim} anchor="middle">{`${fmt(dv)} MB`}</Tx>
        <Tx m={m} x={gx + gS / 2} y={gy + gS / 2 + f(44, 56)} size={fit(decl?.sub, gS - 30, f(16, 20))} weight={700} fill={c.red} anchor="middle">{decl?.sub}</Tx>
      </g>
      <g opacity={clamp01(pR * 1.3)}>
        <rect x={sx} y={sy + (1 - Math.min(1, pR)) * 20} width={sS} height={sS} rx={4} fill={hexA(c.a, 0.6)} stroke={c.a} strokeWidth={2} />
        <Tx m={m} x={sx} y={sy - f(28, 34)} size={f(26, 32)} mono weight={800} fill={c.a}>{`${fmt(rv, 1)} MB`}</Tx>
        <Tx m={m} x={sx} y={sy - f(60, 72)} size={fit(res?.label, v.vertical ? W - sx - 10 : 300, f(17, 21))} weight={700}>{res?.label}</Tx>
        {res?.sub ? wrap(res.sub, v.vertical ? 16 : 24, 3).map((ln, i) => (
          <Tx key={i} m={m} x={sx} y={sy - f(92, 108) - (wrap(res.sub, v.vertical ? 16 : 24, 3).length - 1 - i) * f(20, 24)} size={f(14, 17)} fill={c.dim}>{ln}</Tx>
        )) : null}
      </g>
      {ratio ? (
        <g>
          <Tx m={m} x={eqX} y={eqY - f(48, 56)} size={f(40, 46)} mono weight={700} opacity={m.inn(ratio)}>{`${fmt(dv)} ÷ ${fmt(rv, 1)}`}</Tx>
          <g transform={`translate(${eqX} ${eqY + f(34, 44)}) scale(${0.6 + 0.4 * Math.min(1.1, pQ)})`} opacity={clamp01(pQ * 1.4)}>
            <Tx m={m} x={0} y={0} size={f(66, 80)} weight={900} fill={c.a}>{`= ${ratio.label}`}</Tx>
          </g>
          {ratio.sub ? (
            <Tx m={m} x={eqX} y={eqY + f(96, 116)} size={fit(ratio.sub, W - eqX - 20, f(17, 21))} fill={c.dim} opacity={clamp01(pQ)}>{ratio.sub}</Tx>
          ) : null}
        </g>
      ) : null}
    </Stage>
  );
};

// ── test-rig ───────────────────────────────────────────────────────────────────────────
// Real pages leave real programs, split three ways into three encoders side by side,
// every page decoded back and compared, then the bytes actually allocated are counted.
// roles: source (icon) · codec · check · count
export const TestRig: React.FC<MemProps> = ({items, accent}) => {
  const m = useMem(accent);
  const {W, H, c, f, v} = m;
  const srcs = all(items, 'source'), codecs = all(items, 'codec');
  const check = one(items, 'check'), count = one(items, 'count');
  const nL = Math.max(1, codecs.length);
  const palette = [c.a, c.green, c.purple, c.orange];
  // one layout in flow coordinates; wide flows left→right, vertical top→bottom
  const P = (u: number, w: number) => (v.vertical ? {x: w, y: u} : {x: u, y: w});
  const cross = v.vertical ? W : H;
  const top = f(56, 0);
  const laneW = (cross - top - 20) / nL;
  const laneC = (k: number) => top + 10 + laneW * (k + 0.5);
  const U = v.vertical
    ? {src: 70, split: 250, press0: 330, press1: 470, gate: 590, count: 730}
    : {src: 140, split: 330, press0: 430, press1: 760, gate: 900, count: 1080};
  const scaleU = v.vertical ? Math.min(1, (H - 60) / 860) : 1;
  const u = (x: number) => x * scaleU;
  const ts = f(26, 30);
  const srcCross = (i: number) => (cross / (srcs.length + 1)) * (i + 1);
  const splitP = P(u(U.split), cross / 2 + (v.vertical ? 0 : top / 2));
  const pressLen = u(U.press1) - u(U.press0);
  const pressCross = Math.min(f(78, 150), laneW * 0.72);
  const pCheck = m.inn(check);
  return (
    <Stage m={m} html={srcs.map((s, i) => {
      const cc = P(u(U.src), srcCross(i) + (v.vertical ? 0 : top / 2));
      const ic = v.vertical ? {x: cc.x, y: cc.y - 20} : {x: cc.x - 90, y: cc.y};
      return <IconAt key={i} m={m} cx={ic.x} cy={ic.y} s={f(40, 48)} icon={s.icon} tint={c.text} opacity={m.inn(s)} />;
    })}>
      {check ? (
        <Tx m={m} x={v.vertical ? 20 : P(u(U.gate), 0).x} y={v.vertical ? P(u(U.gate), 0).y - 58 : 24} size={fit(check.label, v.vertical ? W - 40 : 400, f(18, 22))}
          weight={800} fill={c.green} anchor={v.vertical ? 'start' : 'middle'} opacity={pCheck}>{check.label}</Tx>
      ) : null}
      {srcs.map((s, i) => {
        const cc = P(u(U.src), srcCross(i) + (v.vertical ? 0 : top / 2));
        const bw = f(260, Math.min(360, W / srcs.length - 40)), bh = f(96, 120);
        const pS = m.go(s, 18);
        const from = v.vertical ? {x: cc.x, y: cc.y + bh / 2} : {x: cc.x + bw / 2, y: cc.y};
        return (
          <g key={i} opacity={m.inn(s)}>
            <rect x={cc.x - bw / 2} y={cc.y - bh / 2} width={bw} height={bh} rx={12} fill={hexA(c.text, 0.04)} stroke={c.line} strokeWidth={1.5} />
            <Tx m={m} x={v.vertical ? cc.x : cc.x - 54} y={v.vertical ? cc.y + 18 : cc.y - 14} size={fit(s.label, v.vertical ? bw - 20 : bw - 80, f(17, 20))} weight={800} anchor={v.vertical ? 'middle' : 'start'}>{s.label}</Tx>
            <Tx m={m} x={v.vertical ? cc.x : cc.x - 54} y={v.vertical ? cc.y + 42 : cc.y + 14} size={fit(s.sub, v.vertical ? bw - 20 : bw - 80, f(14, 17))} fill={c.dim} anchor={v.vertical ? 'middle' : 'start'}>{s.sub}</Tx>
            <line x1={from.x} y1={from.y} x2={splitP.x} y2={splitP.y} stroke={c.line} strokeWidth={2} {...drawOn(m.inn(s))} />
            <PageTile x={lerp(from.x, splitP.x, pS) - ts / 2} y={lerp(from.y, splitP.y, pS) - ts / 2} s={ts} fill={hexA(c.text, 0.25)} stroke={c.text} opacity={pS > 0.02 && pS < 0.98 ? 1 : 0} />
          </g>
        );
      })}
      <circle cx={splitP.x} cy={splitP.y} r={10} fill={c.dim} opacity={m.base} />
      {codecs.map((cd, k) => {
        const col = m.col(cd, palette[k % palette.length]);
        const lc = laneC(k);
        const p0 = P(u(U.press0), lc), p1 = P(u(U.press1), lc), g = P(u(U.gate), lc), ct = P(u(U.count), v.vertical ? W / 2 : H / 2 + top / 2);
        const pIn = m.go(cd, 18), pSq = m.go(cd, 14, 18);
        const pOut = check ? m.go(check, 18, k * 4) : 0;
        const pressBox = v.vertical
          ? {x: lc - pressCross / 2, y: u(U.press0), w: pressCross, h: pressLen}
          : {x: u(U.press0), y: lc - pressCross / 2, w: pressLen, h: pressCross};
        const inPos = {x: lerp(splitP.x, (p0.x + p1.x) / 2, pIn), y: lerp(splitP.y, (p0.y + p1.y) / 2, pIn)};
        const outPos = {x: lerp((p0.x + p1.x) / 2, g.x, pOut), y: lerp((p0.y + p1.y) / 2, g.y, pOut)};
        const tile = pOut > 0.01 ? outPos : inPos;
        const tsz = ts * (1 - 0.4 * pSq);
        return (
          <g key={k} opacity={m.inn(cd)}>
            <path d={`M ${splitP.x} ${splitP.y} L ${p0.x} ${p0.y}`} stroke={hexA(col, 0.6)} strokeWidth={2} fill="none" {...drawOn(m.inn(cd))} />
            <line x1={p1.x} y1={p1.y} x2={g.x} y2={g.y} stroke={hexA(col, 0.6)} strokeWidth={2} />
            <line x1={g.x} y1={g.y} x2={ct.x} y2={ct.y} stroke={hexA(c.text, 0.12)} strokeWidth={2} />
            <rect x={pressBox.x} y={pressBox.y} width={pressBox.w} height={pressBox.h} rx={10} fill={hexA(col, 0.1)} stroke={col} strokeWidth={2} />
            <Tx m={m} x={pressBox.x + pressBox.w / 2} y={pressBox.y + pressBox.h / 2 - (cd.sub ? f(12, 16) : 0)} size={fit(cd.label, (v.vertical ? pressBox.w : pressBox.w) - 20, f(18, 21))} weight={800} fill={col} anchor="middle">{cd.label}</Tx>
            {cd.sub ? <Tx m={m} x={pressBox.x + pressBox.w / 2} y={pressBox.y + pressBox.h / 2 + f(14, 20)} size={fit(cd.sub, pressBox.w - 16, f(14, 16))} fill={c.dim} anchor="middle">{cd.sub}</Tx> : null}
            <PageTile x={tile.x - tsz / 2} y={tile.y - tsz / 2} s={tsz} fill={hexA(col, 0.4)} stroke={col} opacity={pIn > 0.02 ? 1 : 0} />
            <circle cx={g.x} cy={g.y} r={f(22, 26)} fill={hexA(c.panel, 1)} stroke={pCheck > 0.02 ? c.green : c.dim} strokeWidth={2.5} />
            {pCheck > 0.02 ? <Mark cx={g.x} cy={g.y} s={f(24, 28)} ok color={c.green} p={m.go(check, 12, 16 + k * 4)} /> : (
              <Tx m={m} x={g.x} y={g.y} size={f(22, 26)} weight={800} fill={c.dim} anchor="middle">=</Tx>
            )}
          </g>
        );
      })}
      {count ? (() => {
        const ct = P(u(U.count), v.vertical ? W / 2 : H / 2 + top / 2);
        const rw = v.vertical ? W - 120 : W - u(U.count) - 20;
        const rx = v.vertical ? 60 : ct.x;
        return (
          <g opacity={m.inn(count)}>
            <rect x={rx} y={ct.y - 30} width={rw} height={60} rx={8} fill={hexA(c.yellow, 0.06)} stroke={c.yellow} strokeWidth={2} />
            {Array.from({length: 17}).map((_, i) => (
              <line key={i} x1={rx + 10 + (i / 16) * (rw - 20)} x2={rx + 10 + (i / 16) * (rw - 20)} y1={ct.y - 30} y2={ct.y - 30 + (i % 4 === 0 ? 22 : 12)} stroke={c.yellow} strokeWidth={2} />
            ))}
            <Tx m={m} x={rx + rw / 2} y={ct.y + 12} size={fit(count.label, rw - 20, f(17, 21))} weight={800} fill={c.yellow} anchor="middle">{count.label}</Tx>
            {count.sub ? wrap(count.sub, v.vertical ? 50 : Math.floor(rw / 9), 2).map((ln, i) => (
              <Tx key={i} m={m} x={rx + rw / 2} y={ct.y + 56 + i * f(20, 24)} size={f(14, 17)} fill={c.dim} anchor="middle">{ln}</Tx>
            )) : null}
          </g>
        );
      })() : null}
    </Stage>
  );
};
