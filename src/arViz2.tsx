import React from 'react';
import {useCurrentFrame} from 'remotion';
import {hexA} from './ui';
import {AssetIcon} from './AssetIcon';
import {arriveAt, travelAt, landAt, stagger} from './motion/system';
import {F, BASE, useV, Cap, Chip, At, clamp01, lerp} from './tokVizKit';
import {ArVizProps, pick, one, stateColor, Medal, Svg} from './arViz1';

/*
 * AR depictions, batch 2 — what happened when it was run.
 *
 *   board     every channel as a socket in a grid; each one takes its colour on its own word and a
 *             counter under the grid counts the ones that came up
 *   crate     two crates on a belt to the same gate: the packaged release, stamped and dropped, and
 *             the one built from source, which goes through
 *   fuse      one pasted line at the top, a fuse running from it through each thing it sets off
 *   signpost  a post whose arms swing out one at a time: what you ask for, and the tool it points to
 *   ring      a key ring holding your logins, and the guards that land around it
 *   reel      a film strip winding on, and the lines of text that come out of it
 */

/* ── BOARD ──────────────────────────────────────────────────────────────────────────────── */
// items: ch (label, icon, sub = verdict words, text = ok | login | fail | off) xN · tally (label, sub)
export const Board: React.FC<ArVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const chs = pick(items, 'ch');
  const tally = one(items, 'tally');
  const n = Math.max(1, chs.length);
  const areaH = h * (tally ? 0.84 : 1);
  let cols = 1, best = 0;
  for (let c = 1; c <= n; c++) {
    const r = Math.ceil(n / c);
    const cell = Math.min(w / c, (areaH / r) * 0.92);
    if (cell > best) { best = cell; cols = c; }
  }
  const rows = Math.ceil(n / cols);
  const cw = w / cols, ch = areaH / rows;
  // The medal takes most of its cell: at 0.46 a 16-socket board drew 100px sockets in 300px rows.
  const d = Math.min(cw * 0.62, ch * 0.56);
  const fs = Math.max(v.s(v.vertical ? 24 : 26), d * 0.2);
  const up = chs.filter((c) => c.text === 'ok' && c.atWord != null && frame >= F(c.atWord)).length;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {chs.map((c, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const cx = cw * (col + 0.5), cy = ch * row + d / 2 + Math.max(ch * 0.06, (ch - d - fs * 3) / 2);
        const base = arriveAt(frame, BASE(chs[0]?.atWord) + stagger(i, 2));
        const on = c.atWord == null ? 0 : clamp01(landAt(frame, F(c.atWord)));
        const color = on > 0.5 ? stateColor(v, c.text === 'off' ? undefined : c.text) : v.t.colors.muted;
        return (
          <React.Fragment key={i}>
            <At x={cx} y={cy} center><Medal v={v} icon={c.icon} d={d} color={color} lit={on * (c.text === 'off' ? 0.2 : 1)} on={base} /></At>
            <At x={cx - cw * 0.48} y={cy + d / 2 + ch * 0.03} w={cw * 0.96} style={{opacity: base}}>
              <div style={{fontFamily: v.t.fonts.body, fontWeight: 600, fontSize: fs, textAlign: 'center', lineHeight: 1.15,
                color: hexA(v.t.colors.text, 0.55 + 0.45 * on)}}>{c.label}</div>
              <div style={{fontFamily: v.t.fonts.mono, fontSize: fs * 0.82, textAlign: 'center', lineHeight: 1.25, marginTop: fs * 0.14,
                color, opacity: on}}>{c.sub}</div>
            </At>
          </React.Fragment>
        );
      })}
      {tally ? (
        <At x={0} y={areaH + h * 0.03} w={w} style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: v.s(18),
          opacity: arriveAt(frame, BASE(chs[0]?.atWord))}}>
          <div style={{fontFamily: v.t.fonts.display, fontWeight: v.t.style.displayWeight as any, fontSize: h * 0.1, lineHeight: 1,
            color: v.sem('green')}}>{up}<span style={{color: v.t.colors.muted}}> / {n}</span></div>
          <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(v.vertical ? 28 : 26), color: v.t.colors.text}}>{tally.label}</div>
        </At>
      ) : null}
    </div>
  );
};

/* ── CRATE ──────────────────────────────────────────────────────────────────────────────── */
// items: gate (label, icon) · old (label, sub) · err (label = the stamp) · new (label, sub) · ok (label, sub)
export const Crate: React.FC<ArVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const gate = one(items, 'gate'), old = one(items, 'old'), err = one(items, 'err'), neu = one(items, 'new'), ok = one(items, 'ok');
  const S = Math.min(h * 0.4, w * 0.2);
  const beltY = h * 0.66;
  const gd = Math.min(h * 0.34, w * 0.16);
  const gx = w - gd / 2 - w * 0.02;
  const red = v.sem('red'), green = v.sem('green');
  const baseOn = arriveAt(frame, BASE(old?.atWord));
  const inOld = travelAt(frame, F(old?.atWord), 22);
  const stamp = clamp01(landAt(frame, F(err?.atWord)));
  const fall = travelAt(frame, F(err?.atWord) + 16, 20);
  const inNew = travelAt(frame, F(neu?.atWord), 22);
  const through = travelAt(frame, F(ok?.atWord), 24);
  const midX = w * 0.46;
  const crate = (label?: string, sub?: string, color = v.a) => (
    <div style={{width: S, height: S, borderRadius: v.rad(10), background: hexA(color, 0.14), boxSizing: 'border-box',
      border: `${Math.max(2, v.s(3))}px solid ${hexA(color, 0.9)}`, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: S * 0.05,
      backgroundImage: `linear-gradient(${hexA(color, 0.18)} ${Math.max(1, v.s(2))}px, transparent ${Math.max(1, v.s(2))}px)`,
      backgroundSize: `100% ${S / 4}px`}}>
      <div style={{fontFamily: v.t.fonts.display, fontWeight: v.t.style.displayWeight as any, fontSize: S * 0.2, color: v.t.colors.text, lineHeight: 1}}>{label}</div>
      <div style={{fontFamily: v.t.fonts.mono, fontSize: S * 0.15, color: v.t.colors.muted, lineHeight: 1}}>{sub}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* the belt */}
      <At x={0} y={beltY} w={gx - gd / 2} h={Math.max(3, v.s(6))} style={{opacity: baseOn, borderRadius: v.s(3),
        background: `repeating-linear-gradient(90deg, ${hexA(v.t.colors.muted, 0.6)} 0 ${v.s(18)}px, ${hexA(v.t.colors.muted, 0.2)} ${v.s(18)}px ${v.s(36)}px)`}} />
      <At x={gx} y={beltY - gd * 0.4} center><Medal v={v} icon={gate?.icon} d={gd} color={through > 0.9 ? green : v.t.colors.muted} lit={0.45 + 0.55 * through} on={baseOn} /></At>
      <At x={gx - gd * 0.7} y={beltY + v.s(18)} w={gd * 1.4} style={{opacity: baseOn}}><Cap v={v} title={gate?.label} size={v.vertical ? 30 : 32} /></At>
      {/* the packaged release: arrives, is stamped, falls off the belt */}
      <At x={lerp(-S, midX - S / 2, inOld)} y={beltY - S + fall * h * 0.3} style={{opacity: (inOld > 0 ? 1 : 0) * (1 - fall * 0.75),
        transform: `rotate(${fall * 16}deg)`}}>
        {crate(old?.label, old?.sub, stamp > 0.5 ? red : v.a)}
        <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) rotate(-12deg) scale(${1.6 - 0.6 * stamp})`,
          opacity: stamp, fontFamily: v.t.fonts.mono, fontWeight: 700, fontSize: S * 0.3, color: red, whiteSpace: 'nowrap',
          border: `${Math.max(2, v.s(4))}px solid ${red}`, borderRadius: v.rad(8), padding: `0 ${S * 0.08}px`,
          background: hexA(v.t.colors.bg, 0.82)}}>{err?.label}</div>
      </At>
      {/* built from source: arrives, then goes through */}
      <At x={lerp(-S, lerp(midX - S / 2, gx - gd / 2 - S * 0.9, through), inNew)} y={beltY - S} style={{opacity: inNew > 0 ? 1 : 0}}>
        {crate(neu?.label, neu?.sub, through > 0.5 ? green : v.a)}
      </At>
      {ok ? (
        <At x={w * 0.04} y={h * 0.04} w={w * 0.7}>
          <Cap v={v} title={ok.label} sub={ok.sub} align="left" size={v.vertical ? 32 : 32} color={green} on={clamp01(landAt(frame, F(ok.atWord) + 18))} />
        </At>
      ) : null}
    </div>
  );
};

/* ── FUSE ───────────────────────────────────────────────────────────────────────────────── */
// items: line (label = the pasted sentence, sub) · step (label, sub, icon) xN in the order they fire
export const Fuse: React.FC<ArVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const line = one(items, 'line');
  const steps = pick(items, 'step');
  const n = Math.max(1, steps.length);
  const col = v.vertical;
  const pillH = h * (col ? 0.13 : 0.2);
  const d = col ? Math.min(((h - pillH) / n) * 0.62, w * 0.2) : Math.min((w / n) * 0.42, (h - pillH) * 0.4);
  const start = {x: col ? w * 0.14 : w * 0.06, y: pillH};
  const pt = (i: number) => col
    ? {x: w * 0.14, y: lerp(pillH + d * 0.9, h - d * 0.6, n === 1 ? 0.5 : i / (n - 1))}
    : {x: lerp(w * 0.1, w * 0.9, n === 1 ? 0.5 : i / (n - 1)), y: pillH + (h - pillH) * 0.4};
  const pts = [start, ...steps.map((_, i) => pt(i))];
  // The spark has reached station i once that step's word has been spoken.
  let u = 0;
  steps.forEach((s) => { u += travelAt(frame, F(s.atWord) - 14, 14); });
  const seg = Math.min(n - 1, Math.floor(u)), f = Math.min(1, u - seg);
  const a = pts[Math.min(n, seg)], b = pts[Math.min(n, seg + 1)];
  const sx = lerp(a.x, b.x, u >= n ? 1 : f), sy = lerp(a.y, b.y, u >= n ? 1 : f);
  const baseOn = arriveAt(frame, BASE(line?.atWord));
  const len = Math.max(20, (line?.label ?? '').length);
  const fs = v.vertical ? 30 : 32;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <At x={0} y={0} w={w} h={pillH * 0.78} style={{opacity: baseOn, borderRadius: v.rad(14), boxSizing: 'border-box',
        background: hexA(v.a, 0.1), border: `${Math.max(1.5, v.s(2))}px solid ${hexA(v.a, 0.8)}`, display: 'flex',
        alignItems: 'center', padding: `0 ${w * 0.025}px`, fontFamily: v.t.fonts.mono, color: v.t.colors.text,
        fontSize: Math.min(pillH * 0.3, (w * 0.95 / len) * 1.62), lineHeight: 1.25}}>{line?.label}</At>
      <Svg w={w} h={h}>
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={v.t.colors.muted} strokeOpacity={0.35 * baseOn}
          strokeWidth={v.s(4)} strokeDasharray={`${v.s(6)} ${v.s(8)}`} />
        <polyline points={[...pts.slice(0, Math.min(n, seg) + 1), {x: sx, y: sy}].map((p) => `${p.x},${p.y}`).join(' ')} fill="none"
          stroke={v.a} strokeWidth={v.s(5)} strokeLinecap="round" strokeOpacity={u > 0 ? 1 : 0} />
        <circle cx={sx} cy={sy} r={v.s(10)} fill={v.sem('yellow')} fillOpacity={u > 0 && u < n ? 1 : 0} />
      </Svg>
      {steps.map((s, i) => {
        const p = pt(i);
        const on = clamp01(landAt(frame, F(s.atWord)));
        return (
          <React.Fragment key={i}>
            <At x={p.x} y={p.y} center><Medal v={v} icon={s.icon} d={d} color={on > 0.5 ? v.a : v.t.colors.muted} lit={on} on={baseOn} /></At>
            {col ? (
              <At x={p.x + d / 2 + v.s(22)} y={p.y - d * 0.36} w={w - p.x - d / 2 - v.s(22)} style={{opacity: 0.35 + 0.65 * on}}>
                <Cap v={v} title={s.label} sub={s.sub} align="left" size={fs + 2} />
              </At>
            ) : (
              <At x={p.x - (w / n) * 0.47} y={p.y + d / 2 + v.s(14)} w={(w / n) * 0.94} style={{opacity: 0.35 + 0.65 * on}}>
                <Cap v={v} title={s.label} sub={s.sub} size={fs} />
              </At>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ── SIGNPOST ───────────────────────────────────────────────────────────────────────────── */
// items: ask (label = heading over the question) · arm (label = the tool, sub = what you asked for, icon) xN
export const Signpost: React.FC<ArVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const ask = one(items, 'ask');
  const arms = pick(items, 'arm');
  const n = Math.max(1, arms.length);
  const col = v.vertical;
  const bubbleH = col ? h * 0.2 : h * 0.44;
  const postX = col ? w * 0.08 : w * 0.46;
  const top = col ? bubbleH + h * 0.04 : h * 0.02;
  const armH = Math.min(((h - top) / n) * 0.78, h * 0.2);
  const armW = w - postX - w * 0.02;
  const ay = (i: number) => top + ((h - top) / n) * (i + 0.5);
  // The bubble shows the question that belongs to the arm that swung out last.
  let cur = -1;
  arms.forEach((a, i) => { if (a.atWord != null && frame >= F(a.atWord) - 6) cur = i; });
  const baseOn = arriveAt(frame, BASE(ask?.atWord));
  const fs = Math.min(armH * 0.34, v.s(col ? 32 : 34));
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* the post */}
      <At x={postX - v.s(7)} y={top} w={v.s(14)} h={h - top} style={{background: hexA(v.t.colors.muted, 0.55), borderRadius: v.s(7), opacity: baseOn}} />
      {/* what you say */}
      <At x={0} y={col ? 0 : (h - bubbleH) / 2} w={col ? w : postX - w * 0.05} h={bubbleH} style={{opacity: baseOn, boxSizing: 'border-box',
        borderRadius: v.rad(22), background: hexA(v.a, 0.1), border: `${Math.max(1.5, v.s(2))}px solid ${hexA(v.a, 0.75)}`,
        padding: `${bubbleH * 0.12}px ${w * 0.03}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(col ? 22 : 20), letterSpacing: v.s(2), textTransform: 'uppercase',
          color: v.t.colors.muted, marginBottom: v.s(12)}}>{ask?.label}</div>
        <div style={{position: 'relative', flex: 1}}>
          {arms.map((a, i) => (
            <div key={i} style={{position: 'absolute', inset: 0, opacity: cur === i ? arriveAt(frame, F(a.atWord) - 6, 8) : 0,
              fontFamily: v.t.fonts.display, fontWeight: v.t.style.displayWeight as any, fontSize: v.s(col ? 40 : 44), lineHeight: 1.15,
              color: v.t.colors.text}}>{a.sub}</div>
          ))}
        </div>
      </At>
      {arms.map((a, i) => {
        const on = clamp01(landAt(frame, F(a.atWord)));
        const live = cur === i;
        const c = live ? v.a : v.t.colors.muted;
        return (
          <At key={i} x={postX} y={ay(i) - armH / 2} w={armW} h={armH} style={{transformOrigin: '0 50%',
            transform: `perspective(${w}px) rotateY(${(1 - on) * 82}deg)`, opacity: clamp01(on * 1.5)}}>
            <div style={{position: 'absolute', inset: 0, background: hexA(c, live ? 0.22 : 0.1), boxSizing: 'border-box',
              clipPath: `polygon(0 0, calc(100% - ${armH * 0.42}px) 0, 100% 50%, calc(100% - ${armH * 0.42}px) 100%, 0 100%)`,
              borderLeft: `${v.s(8)}px solid ${c}`}} />
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: armH * 0.2, paddingLeft: armH * 0.3}}>
              <AssetIcon asset={a.icon ?? 'lucide:terminal'} size={armH * 0.52} bare tint={v.t.colors.text} />
              <div style={{fontFamily: v.t.fonts.mono, fontSize: fs, color: v.t.colors.text, whiteSpace: 'nowrap'}}>{a.label}</div>
            </div>
          </At>
        );
      })}
    </div>
  );
};

/* ── RING ───────────────────────────────────────────────────────────────────────────────── */
// items: ring (label, sub) · key (label, sub, icon) xN · guard (label, sub, icon) xN
export const Ring: React.FC<ArVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const ring = one(items, 'ring');
  const keys = pick(items, 'key'), guards = pick(items, 'guard');
  const col = v.vertical;
  const zoneW = col ? w : w * 0.42, zoneH = col ? h * 0.42 : h;
  const R = Math.min(zoneW * 0.2, zoneH * 0.17);
  const cx = zoneW / 2, cy = R + zoneH * 0.04;
  const kd = Math.min(zoneW / Math.max(2, keys.length) * 0.62, zoneH * 0.24);
  const baseOn = arriveAt(frame, BASE(ring?.atWord));
  const yellow = v.sem('yellow');
  const gx0 = col ? 0 : w * 0.48, gy0 = col ? zoneH + h * 0.03 : 0;
  const gW = col ? w : w * 0.52, gH = col ? h - gy0 : h;
  const ng = Math.max(1, guards.length);
  const gd = Math.min((gH / ng) * 0.62, gW * 0.2);
  const fs = col ? 32 : 34;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <Svg w={w} h={h}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={yellow} strokeWidth={v.s(7)} strokeOpacity={baseOn} />
        {keys.map((k, i) => {
          const kx = lerp(kd * 0.6, zoneW - kd * 0.6, keys.length === 1 ? 0.5 : i / (keys.length - 1));
          const on = arriveAt(frame, F(k.atWord));
          return <line key={i} x1={cx} y1={cy + R} x2={lerp(cx, kx, on)} y2={lerp(cy + R, cy + R + zoneH * 0.22, on)} stroke={yellow}
            strokeWidth={v.s(4)} strokeOpacity={on} />;
        })}
        {guards.map((g, i) => {
          const gy = gy0 + (gH / ng) * (i + 0.5);
          const on = clamp01(arriveAt(frame, F(g.atWord)));
          return <line key={i} x1={col ? cx : cx + R} y1={col ? cy + R : cy} x2={gx0 + gd / 2} y2={gy}
            stroke={v.sem('green')} strokeWidth={v.s(3)} strokeOpacity={0.5 * on} strokeDasharray={`${v.s(6)} ${v.s(8)}`} />;
        })}
      </Svg>
      {/* a key on the ring, so the ring reads as a key ring and not as an empty circle */}
      <At x={cx} y={cy} center style={{opacity: baseOn}}><AssetIcon asset="lucide:key-round" size={R * 0.9} bare tint={yellow} /></At>
      {/* the caption sits on the far side from the guards, so their connectors never run through it */}
      <At x={col ? cx + R + v.s(18) : 0} y={cy - R * 0.6} w={col ? zoneW - cx - R - v.s(18) : cx - R - v.s(18)} style={{opacity: baseOn}}>
        <Cap v={v} title={ring?.label} sub={ring?.sub} align={col ? "left" : "right"} size={fs} color={yellow} />
      </At>
      {keys.map((k, i) => {
        const kx = lerp(kd * 0.6, zoneW - kd * 0.6, keys.length === 1 ? 0.5 : i / (keys.length - 1));
        const ky = cy + R + zoneH * 0.22 + kd / 2;
        const on = clamp01(landAt(frame, F(k.atWord)));
        return (
          <React.Fragment key={i}>
            <At x={kx} y={ky} center><Medal v={v} icon={k.icon ?? 'lucide:key-round'} d={kd} color={yellow} lit={on} on={on} /></At>
            <At x={kx - zoneW * 0.24} y={ky + kd / 2 + v.s(10)} w={zoneW * 0.48} style={{opacity: on}}>
              <Cap v={v} title={k.label} sub={k.sub} size={fs * 0.9} />
            </At>
          </React.Fragment>
        );
      })}
      {guards.map((g, i) => {
        const gy = gy0 + (gH / ng) * (i + 0.5);
        const on = clamp01(landAt(frame, F(g.atWord)));
        return (
          <React.Fragment key={i}>
            <At x={gx0 + gd / 2} y={gy} center><Medal v={v} icon={g.icon ?? 'lucide:shield-check'} d={gd} color={v.sem('green')} lit={on} on={0.3 + 0.7 * on} /></At>
            <At x={gx0 + gd + v.s(22)} y={gy - gd * 0.36} w={gW - gd - v.s(22)} style={{opacity: 0.3 + 0.7 * on}}>
              <Cap v={v} title={g.label} sub={g.sub} align="left" size={fs + 2} />
            </At>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ── REEL ───────────────────────────────────────────────────────────────────────────────── */
// items: video (label, sub, icon) · line (label = a subtitle line) xN · read (label, sub)
export const Reel: React.FC<ArVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const video = one(items, 'video'), read = one(items, 'read');
  const lines = pick(items, 'line');
  const n = Math.max(1, lines.length);
  const col = v.vertical;
  const stripW = col ? w : w * 0.34, stripH = col ? h * 0.3 : h * 0.62;
  const sx = 0, sy = col ? 0 : h * 0.08;
  const cells = col ? 4 : 3;
  const baseOn = arriveAt(frame, BASE(video?.atWord));
  // The strip winds on by one frame each time a line of text comes out of it.
  let wound = 0;
  lines.forEach((l) => { wound += travelAt(frame, F(l.atWord) - 10, 14); });
  const tx0 = col ? 0 : stripW + w * 0.07, ty0 = col ? stripH + h * 0.2 : h * 0.06;
  const tW = w - tx0, tH = (col ? h - ty0 - h * 0.14 : h * 0.72);
  const rowH = tH / n;
  const fs = Math.min(rowH * 0.42, v.s(col ? 32 : 34));
  const hole = stripW * 0.035;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* the film strip */}
      <At x={sx} y={sy} w={stripW} h={stripH} style={{opacity: baseOn, overflow: 'hidden', borderRadius: v.rad(12), boxSizing: 'border-box',
        background: hexA(v.t.colors.muted, 0.12), border: `${Math.max(1.5, v.s(2))}px solid ${hexA(v.t.colors.muted, 0.6)}`}}>
        {Array.from({length: cells + n + 1}).map((_, i) => {
          const along = (i - wound) / cells;
          const cw = col ? stripW / cells : stripW * 0.7, chh = col ? stripH * 0.62 : stripH / cells;
          const left = col ? along * stripW + stripW * 0.02 : stripW * 0.15;
          const topp = col ? stripH * 0.19 : along * stripH + stripH * 0.02;
          return <div key={i} style={{position: 'absolute', left, top: topp, width: cw * 0.92, height: chh * 0.9, borderRadius: v.rad(6),
            background: hexA(v.a, 0.16), border: `${Math.max(1, v.s(1.5))}px solid ${hexA(v.a, 0.55)}`, display: 'flex',
            alignItems: 'center', justifyContent: 'center'}}>
            <AssetIcon asset="lucide:play" size={Math.min(cw, chh) * 0.3} bare tint={hexA(v.t.colors.text, 0.6)} /></div>;
        })}
        {Array.from({length: 14}).map((_, i) => (col
          ? <React.Fragment key={i}>
              <div style={{position: 'absolute', left: (i + 0.5) * (stripW / 14) - hole / 2, top: stripH * 0.05, width: hole, height: hole, background: v.t.colors.bg, borderRadius: hole * 0.2}} />
              <div style={{position: 'absolute', left: (i + 0.5) * (stripW / 14) - hole / 2, bottom: stripH * 0.05, width: hole, height: hole, background: v.t.colors.bg, borderRadius: hole * 0.2}} />
            </React.Fragment>
          : <React.Fragment key={i}>
              <div style={{position: 'absolute', top: (i + 0.5) * (stripH / 14) - hole / 2, left: stripW * 0.045, width: hole, height: hole, background: v.t.colors.bg, borderRadius: hole * 0.2}} />
              <div style={{position: 'absolute', top: (i + 0.5) * (stripH / 14) - hole / 2, right: stripW * 0.045, width: hole, height: hole, background: v.t.colors.bg, borderRadius: hole * 0.2}} />
            </React.Fragment>))}
      </At>
      <At x={sx} y={sy + stripH + v.s(14)} w={col ? w : stripW} style={{opacity: baseOn}}>
        <Cap v={v} title={video?.label} sub={video?.sub} align={col ? 'left' : 'center'} size={col ? 28 : 26} />
      </At>
      {/* the words coming out of it */}
      {lines.map((l, i) => {
        const on = clamp01(arriveAt(frame, F(l.atWord), 12));
        return (
          <At key={i} x={tx0 - (1 - on) * w * 0.05} y={ty0 + rowH * i} w={tW} h={rowH} style={{opacity: on, display: 'flex', alignItems: 'center',
            gap: fs * 0.6, fontFamily: v.t.fonts.mono, fontSize: fs, color: v.t.colors.text, lineHeight: 1.2}}>
            <span style={{color: v.a, flex: 'none'}}>›</span><span>{l.label}</span>
          </At>
        );
      })}
      {read ? (
        <At x={tx0} y={ty0 + tH + h * 0.03} w={tW}>
          <Cap v={v} title={read.label} sub={read.sub} align="left" size={col ? 32 : 32} color={v.sem('green')} on={clamp01(landAt(frame, F(read.atWord)))} />
        </At>
      ) : null}
    </div>
  );
};
