import React from 'react';
import {useCurrentFrame} from 'remotion';
import {hexA} from './ui';
import {AssetIcon} from './AssetIcon';
import {ArStageItem, SemColor} from './types';
import {arriveAt, travelAt, landAt, stagger} from './motion/system';
import {F, BASE, useV, V, Cap, Chip, At, clamp01, lerp} from './tokVizKit';

/*
 * AR depictions, batch 1 — what Agent Reach is for and how it is put together.
 *
 *   gates     an agent on the left, the platforms on the right, a wire reaching for each one and a
 *             barrier dropping across it, stamped with what stops you (a price, a 403, a login)
 *   layer     three tiers: the agent, a thin shelf that picks / installs / checks / routes, and the
 *             real tools underneath — then the agent's wires run straight THROUGH the shelf
 *   plugs     a switchboard: one platform, an ordered row of backends, one cable. A backend dies
 *             and the cable moves to the next jack
 *   lamps     the health check's legend as signal lamps: its own Chinese marker, then the English
 *   key       two lanes to the same door: a robot browser stopped by a challenge, and your own
 *             browser handing two cookie values to a small program that walks through
 */

export interface ArVizProps {items: ArStageItem[]; accent: SemColor; w: number; h: number}
export const pick = (items: ArStageItem[], g: string) => items.filter((i) => i.group === g);
export const one = (items: ArStageItem[], g: string) => items.find((i) => i.group === g);
export const stateColor = (v: V, s?: string) =>
  s === 'ok' ? v.sem('green') : s === 'warn' || s === 'login' ? v.sem('yellow')
    : s === 'dead' || s === 'fail' ? v.sem('red') : v.t.colors.muted;

/** An object: a brand mark or a glyph on a round plate. `lit` 0..1 takes it from dim to its colour. */
export const Medal: React.FC<{v: V; icon?: string; d: number; color: string; lit?: number; on?: number}> =
  ({v, icon, d, color, lit = 1, on = 1}) => (
    <div style={{width: d, height: d, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: on, transform: `scale(${0.86 + 0.14 * on})`,
      background: hexA(color, 0.06 + 0.16 * lit),
      border: `${Math.max(1.5, d * 0.035)}px solid ${hexA(color, 0.3 + 0.65 * lit)}`,
      boxShadow: lit > 0.5 ? v.glow(color, d * 0.22) : 'none'}}>
      <div style={{opacity: 0.45 + 0.55 * lit, display: 'flex'}}>
        <AssetIcon asset={icon ?? 'lucide:circle-help'} size={d * 0.5} bare tint={v.t.colors.text} />
      </div>
    </div>
  );

const Svg: React.FC<{w: number; h: number; children?: React.ReactNode}> = ({w, h, children}) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>{children}</svg>
);
export {Svg};

/* ── GATES ──────────────────────────────────────────────────────────────────────────────── */
// items: agent (label, icon) · gate (label, icon, sub = what stops you) xN
export const Gates: React.FC<ArVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const agent = one(items, 'agent');
  const gates = pick(items, 'gate');
  const n = Math.max(1, gates.length);
  const ad = Math.min(h * 0.3, w * 0.17);
  const gd = Math.min((h / n) * 0.66, w * 0.1);
  const ax = w * 0.02 + ad / 2, ay = h / 2;
  const gx = w * (v.vertical ? 0.6 : 0.68);
  const red = v.sem('red');
  const fs = v.vertical ? 30 : 28;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <Svg w={w} h={h}>
        {gates.map((g, i) => {
          const gy = n === 1 ? h / 2 : lerp(gd * 0.6, h - gd * 0.6, i / (n - 1));
          const reach = travelAt(frame, F(g.atWord) - 16, 16);
          const stop = arriveAt(frame, F(g.atWord), 8);
          const ex = lerp(ax + ad / 2, lerp(ax + ad / 2, gx - gd / 2, 0.62), reach);
          const ey = lerp(ay, lerp(ay, gy, 0.62), reach);
          return <line key={i} x1={ax + ad / 2} y1={ay} x2={ex} y2={ey} strokeLinecap="round"
            stroke={stop > 0.5 ? red : v.a} strokeOpacity={0.25 + 0.6 * reach} strokeWidth={v.s(4)}
            strokeDasharray={`${v.s(10)} ${v.s(9)}`} />;
        })}
      </Svg>
      <At x={ax} y={ay} center>
        <Medal v={v} icon={agent?.icon ?? 'lucide:bot'} d={ad} color={v.a} on={arriveAt(frame, BASE(agent?.atWord))} />
      </At>
      <At x={ax - ad / 2} y={ay + ad / 2 + v.s(14)} w={ad}>
        <Cap v={v} title={agent?.label} sub={agent?.sub} size={fs} on={arriveAt(frame, BASE(agent?.atWord))} />
      </At>
      {gates.map((g, i) => {
        const gy = n === 1 ? h / 2 : lerp(gd * 0.6, h - gd * 0.6, i / (n - 1));
        const base = arriveAt(frame, BASE(agent?.atWord) + stagger(i, 4));
        const drop = landAt(frame, F(g.atWord));
        const bx = lerp(ax + ad / 2, gx - gd / 2, 0.62), by = lerp(ay, gy, 0.62);
        return (
          <React.Fragment key={i}>
            <At x={gx} y={gy} center><Medal v={v} icon={g.icon} d={gd} color={drop > 0.5 ? red : v.t.colors.muted} lit={0.5 + 0.5 * drop} on={base} /></At>
            <At x={gx + gd / 2 + v.s(16)} y={gy - v.s(fs * 0.62)} w={w - gx - gd / 2 - v.s(16)} style={{opacity: base}}>
              <Cap v={v} title={g.label} align="left" size={fs} />
            </At>
            {/* the barrier: a bar that drops across the wire, and the reason stamped beside it */}
            <At x={bx - v.s(5)} y={by - gd * 0.42 - (1 - drop) * gd * 0.6} w={v.s(10)} h={gd * 0.84}
              style={{background: red, borderRadius: v.rad(4), opacity: clamp01(drop * 2), boxShadow: v.glow(red, 14)}} />
            <At x={bx - v.s(18)} y={by} style={{transform: 'translate(-100%, -50%)'}}>
              <Chip v={v} text={g.sub ?? ''} on={clamp01(drop)} color={red} size={v.s(v.vertical ? 24 : 22)} solid />
            </At>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ── LAYER ──────────────────────────────────────────────────────────────────────────────── */
// items: agent (label, icon) · layer (label, sub) · job (label, icon) xN · tool (label, icon) xN · direct (label, sub)
export const Layer: React.FC<ArVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const agent = one(items, 'agent'), layer = one(items, 'layer'), direct = one(items, 'direct');
  const jobs = pick(items, 'job'), tools = pick(items, 'tool');
  const ad = Math.min(h * 0.17, w * 0.12);
  const td = Math.min(h * 0.15, (w / Math.max(1, tools.length)) * 0.5);
  const shelfY = h * 0.34, shelfH = h * 0.27;
  const jd = Math.min(shelfH * 0.5, (w * 0.6 / Math.max(1, jobs.length)) * 0.5);
  const toolY = h * 0.82;
  const tx = (i: number) => lerp(w * 0.1, w * 0.9, tools.length === 1 ? 0.5 : i / (tools.length - 1));
  const go = travelAt(frame, F(direct?.atWord), 26);
  const baseOn = arriveAt(frame, BASE(agent?.atWord));
  const fs = v.vertical ? 26 : 24;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* the shelf */}
      <At x={w * 0.03} y={shelfY} w={w * 0.94} h={shelfH} style={{borderRadius: v.rad(18), opacity: baseOn,
        background: hexA(v.a, 0.1), border: `${Math.max(1.5, v.s(2))}px solid ${hexA(v.a, 0.7)}`}} />
      <At x={w * 0.06} y={shelfY + shelfH / 2} w={w * 0.26} style={{transform: 'translateY(-50%)', opacity: baseOn}}>
        <Cap v={v} title={layer?.label} sub={layer?.sub} align="left" size={v.vertical ? 30 : 32} color={v.a} />
      </At>
      {jobs.map((j, i) => {
        const on = landAt(frame, F(j.atWord));
        const x = lerp(w * 0.4, w * 0.9, jobs.length === 1 ? 0.5 : i / (jobs.length - 1));
        return (
          <React.Fragment key={i}>
            <At x={x} y={shelfY + shelfH * 0.4} center><Medal v={v} icon={j.icon} d={jd} color={v.a} lit={clamp01(on)} on={0.35 + 0.65 * clamp01(on)} /></At>
            <At x={x - w * 0.08} y={shelfY + shelfH * 0.4 + jd / 2 + v.s(6)} w={w * 0.16} style={{opacity: clamp01(on)}}>
              <Cap v={v} title={j.label} size={fs * 0.82} mono />
            </At>
          </React.Fragment>
        );
      })}
      {/* the agent's wires go straight through the shelf to the tools */}
      <Svg w={w} h={h}>
        {tools.map((t, i) => {
          const x2 = lerp(w / 2, tx(i), go), y2 = lerp(h * 0.03 + ad, toolY - td / 2, go);
          return <line key={i} x1={w / 2} y1={h * 0.03 + ad} x2={x2} y2={y2} stroke={v.sem('green')} strokeWidth={v.s(4)}
            strokeLinecap="round" strokeOpacity={go > 0 ? 0.9 : 0} />;
        })}
      </Svg>
      <At x={w / 2} y={h * 0.03 + ad / 2} center><Medal v={v} icon={agent?.icon ?? 'lucide:bot'} d={ad} color={v.a} on={baseOn} /></At>
      <At x={w / 2 + ad / 2 + v.s(18)} y={h * 0.03 + ad * 0.18} w={w * 0.42} style={{opacity: baseOn}}>
        <Cap v={v} title={agent?.label} sub={agent?.sub} align="left" size={fs} />
      </At>
      {tools.map((t, i) => {
        const on = arriveAt(frame, BASE(agent?.atWord) + stagger(i, 4));
        return (
          <React.Fragment key={i}>
            <At x={tx(i)} y={toolY} center><Medal v={v} icon={t.icon} d={td} color={go > 0.9 ? v.sem('green') : v.t.colors.muted} lit={0.4 + 0.6 * go} on={on} /></At>
            <At x={tx(i) - w * 0.09} y={toolY + td / 2 + v.s(6)} w={w * 0.18} style={{opacity: on}}>
              <Cap v={v} title={t.label} size={fs * 0.8} mono />
            </At>
          </React.Fragment>
        );
      })}
      {direct ? (
        <At x={w * 0.03} y={h * 0.03} w={w * 0.34}>
          <Cap v={v} title={direct.label} sub={direct.sub} align="left" size={fs} color={v.sem('green')} on={landAt(frame, F(direct.atWord) + 14)} />
        </At>
      ) : null}
    </div>
  );
};

/* ── PLUGS ──────────────────────────────────────────────────────────────────────────────── */
// items: platform (label, icon) · back (label, sub, icon, text = 'dead' when it fails on its atWord) xN in order
export const Plugs: React.FC<ArVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const platform = one(items, 'platform');
  const backs = pick(items, 'back');
  const n = Math.max(1, backs.length);
  const pd = Math.min(h * 0.34, w * 0.18);
  const jd = Math.min((h / n) * 0.6, w * 0.11);
  const px = w * 0.03 + pd / 2, py = h / 2;
  const jx = w * (v.vertical ? 0.46 : 0.52);
  const jy = (i: number) => (n === 1 ? h / 2 : lerp(jd * 0.7, h - jd * 0.7, i / (n - 1)));
  // The cable sits on the first backend and moves down one jack each time the one it is on dies.
  let pos = 0;
  backs.forEach((b) => { if (b.text === 'dead') pos += travelAt(frame, F(b.atWord) + 10, 20); });
  const lo = Math.min(n - 1, Math.floor(pos)), hi = Math.min(n - 1, lo + 1);
  const cy = lerp(jy(lo), jy(hi), pos - lo);
  const baseOn = arriveAt(frame, BASE(platform?.atWord));
  const green = v.sem('green'), red = v.sem('red');
  const fs = v.vertical ? 28 : 28;
  const x1 = px + pd / 2, x2 = jx - jd / 2;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <Svg w={w} h={h}>
        <path d={`M ${x1} ${py} C ${lerp(x1, x2, 0.5)} ${py}, ${lerp(x1, x2, 0.5)} ${cy}, ${x2} ${cy}`} fill="none"
          stroke={green} strokeWidth={v.s(7)} strokeLinecap="round" strokeOpacity={baseOn} />
        <circle cx={x2} cy={cy} r={v.s(11)} fill={green} fillOpacity={baseOn} />
      </Svg>
      <At x={px} y={py} center><Medal v={v} icon={platform?.icon} d={pd} color={v.a} on={baseOn} /></At>
      <At x={px - pd / 2} y={py + pd / 2 + v.s(14)} w={pd}><Cap v={v} title={platform?.label} sub={platform?.sub} size={fs} on={baseOn} /></At>
      {backs.map((b, i) => {
        const dead = b.text === 'dead' ? clamp01(arriveAt(frame, F(b.atWord), 10)) : 0;
        const live = 1 - clamp01(Math.abs(pos - i) * 2.5);
        const on = arriveAt(frame, BASE(platform?.atWord) + stagger(i, 5));
        const c = dead > 0.5 ? red : live > 0.5 ? green : v.t.colors.muted;
        return (
          <React.Fragment key={i}>
            <At x={jx} y={jy(i)} center><Medal v={v} icon={b.icon ?? 'lucide:plug'} d={jd} color={c} lit={Math.max(dead, live)} on={on} /></At>
            <At x={jx + jd / 2 + v.s(18)} y={jy(i) - v.s(fs * 0.66)} w={w - jx - jd / 2 - v.s(18)} style={{opacity: on}}>
              <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(fs), color: dead > 0.5 ? hexA(v.t.colors.text, 0.5) : v.t.colors.text,
                textDecoration: dead > 0.5 ? 'line-through' : 'none', textDecorationColor: red, lineHeight: 1.15}}>
                <span style={{color: v.t.colors.muted}}>{i + 1}. </span>{b.label}</div>
              <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(fs * 0.68), color: dead > 0.5 ? red : v.t.colors.muted,
                marginTop: v.s(4), lineHeight: 1.3}}>{b.sub}</div>
            </At>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ── LAMPS ──────────────────────────────────────────────────────────────────────────────── */
// items: lamp (label = the tool's own marker text, sub = what it means in English, text = ok | warn | off, icon?) xN
export const Lamps: React.FC<ArVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const lamps = pick(items, 'lamp');
  const n = Math.max(1, lamps.length);
  const col = v.vertical;
  const cellW = col ? w : w / n, cellH = col ? h / n : h;
  const d = Math.min(cellW * (col ? 0.26 : 0.42), cellH * (col ? 0.62 : 0.44));
  const mark = (s?: string) => (s === 'ok' ? '✓' : s === 'warn' ? '!' : '✕');
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {lamps.map((l, i) => {
        const c = stateColor(v, l.text === 'off' ? 'dead' : l.text);
        const on = clamp01(landAt(frame, F(l.atWord)));
        const say = clamp01(arriveAt(frame, F(l.atWord) + 12, 14));
        const base = arriveAt(frame, BASE(lamps[0]?.atWord) + stagger(i, 5));
        const cx = col ? cellW * 0.2 : cellW * (i + 0.5), cy = col ? cellH * (i + 0.5) : cellH * 0.3;
        return (
          <React.Fragment key={i}>
            <At x={cx} y={cy} center>
              <div style={{width: d, height: d, borderRadius: '50%', opacity: base, display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: hexA(c, 0.1 + 0.5 * on), border: `${d * 0.045}px solid ${hexA(c, 0.35 + 0.65 * on)}`,
                boxShadow: on > 0.5 ? v.glow(c, d * 0.4) : 'none', fontFamily: v.t.fonts.mono, fontWeight: 700,
                fontSize: d * 0.5, color: hexA(v.t.colors.text, 0.35 + 0.65 * on)}}>{mark(l.text)}</div>
            </At>
            <At x={col ? cellW * 0.38 : cellW * i + cellW * 0.06} y={col ? cy - d * 0.42 : cy + d / 2 + cellH * 0.05}
              w={col ? cellW * 0.6 : cellW * 0.88} style={{opacity: base}}>
              {/* the tool's own words stay; the English arrives under them */}
              <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(col ? 34 : 32), color: hexA(v.t.colors.text, 0.82),
                textAlign: col ? 'left' : 'center', lineHeight: 1.2}}>{l.label}</div>
              <div style={{marginTop: v.s(14), opacity: say, transform: `translateY(${(1 - say) * v.s(10)}px)`,
                fontFamily: v.t.fonts.display, fontWeight: v.t.style.displayWeight as any, fontSize: v.s(col ? 40 : 42),
                color: c, textAlign: col ? 'left' : 'center', lineHeight: 1.12}}>{l.sub}</div>
            </At>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ── KEY ────────────────────────────────────────────────────────────────────────────────── */
// items: robot (label, sub = what the site answers, icon) · door (label, icon) · browser (label, sub, icon)
//        · key (label) xN · cli (label, icon) · pass (label, sub)
export const Key: React.FC<ArVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const robot = one(items, 'robot'), door = one(items, 'door'), browser = one(items, 'browser');
  const cli = one(items, 'cli'), pass = one(items, 'pass');
  const keys = pick(items, 'key');
  const d = Math.min(h * 0.24, w * 0.12);
  const y1 = h * 0.25, y2 = h * 0.74;
  const xL = d / 2 + w * 0.01, xD = w - d / 2 - w * 0.01, xC = w * 0.52;
  const red = v.sem('red'), green = v.sem('green');
  const baseOn = arriveAt(frame, BASE(robot?.atWord));
  const walk = travelAt(frame, F(robot?.atWord), 28);
  const stopX = lerp(xL, xD - d * 1.5, 1);
  const rx = lerp(xL, stopX, walk);
  const blocked = landAt(frame, F(robot?.atWord) + 26);
  const cliLit = keys.length ? clamp01(arriveAt(frame, F(keys[keys.length - 1].atWord) + 18, 10)) : 1;
  const go = travelAt(frame, F(pass?.atWord), 22);
  const fs = v.vertical ? 26 : 24;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <Svg w={w} h={h}>
        <line x1={xL} y1={y1} x2={xD} y2={y1} stroke={v.t.colors.muted} strokeOpacity={0.3 * baseOn} strokeWidth={v.s(3)} strokeDasharray={`${v.s(8)} ${v.s(10)}`} />
        <line x1={xL} y1={y2} x2={xD} y2={y2} stroke={v.t.colors.muted} strokeOpacity={0.3 * baseOn} strokeWidth={v.s(3)} strokeDasharray={`${v.s(8)} ${v.s(10)}`} />
        <line x1={xC + d / 2} y1={y2} x2={lerp(xC + d / 2, xD - d / 2, go)} y2={y2} stroke={green} strokeWidth={v.s(6)} strokeLinecap="round" strokeOpacity={go > 0 ? 1 : 0} />
      </Svg>
      {/* lane 1: the automated browser */}
      <At x={xD} y={y1} center><Medal v={v} icon={door?.icon} d={d} color={blocked > 0.5 ? red : v.t.colors.muted} lit={0.5} on={baseOn} /></At>
      <At x={rx} y={y1} center><Medal v={v} icon={robot?.icon ?? 'lucide:bot'} d={d} color={blocked > 0.5 ? red : v.a} on={baseOn} /></At>
      <At x={0} y={y1 + d / 2 + v.s(10)} w={w * 0.5} style={{opacity: baseOn}}><Cap v={v} title={robot?.label} align="left" size={fs} /></At>
      <At x={stopX + d * 0.62} y={y1 - d * 0.5 - v.s(8)} style={{transform: 'translate(-50%, -100%)'}}>
        <Chip v={v} text={robot?.sub ?? ''} on={clamp01(blocked)} color={red} size={v.s(fs)} solid />
      </At>
      {/* lane 2: your own browser, two values, a small program */}
      <At x={xD} y={y2} center><Medal v={v} icon={door?.icon} d={d} color={go > 0.9 ? green : v.t.colors.muted} lit={0.5 + 0.5 * go} on={baseOn} /></At>
      <At x={xL} y={y2} center><Medal v={v} icon={browser?.icon ?? 'lucide:globe'} d={d} color={v.a} on={arriveAt(frame, F(browser?.atWord))} /></At>
      <At x={0} y={y2 + d / 2 + v.s(10)} w={w * 0.36} style={{opacity: arriveAt(frame, F(browser?.atWord))}}>
        <Cap v={v} title={browser?.label} sub={browser?.sub} align="left" size={fs} />
      </At>
      <At x={xC} y={y2} center><Medal v={v} icon={cli?.icon ?? 'lucide:terminal'} d={d} color={cliLit > 0.5 ? green : v.t.colors.muted} lit={0.4 + 0.6 * cliLit} on={baseOn} /></At>
      <At x={xC - w * 0.14} y={y2 + d / 2 + v.s(10)} w={w * 0.28} style={{opacity: baseOn}}><Cap v={v} title={cli?.label} sub={cli?.sub} size={fs} mono /></At>
      {keys.map((k, i) => {
        const t = travelAt(frame, F(k.atWord), 20);
        const shown = clamp01(arriveAt(frame, F(k.atWord), 6));
        const yy = y2 - d * 0.5 - v.s(18) - i * v.s(fs * 2.1);
        return (
          <At key={i} x={lerp(xL + d * 0.3, xC - d * 0.2, t)} y={yy} style={{transform: 'translate(-50%, -100%)'}}>
            <Chip v={v} text={k.label ?? ''} on={shown} color={v.sem('yellow')} size={v.s(fs)} solid />
          </At>
        );
      })}
      {pass ? (
        <At x={xC + d * 0.7} y={y2 - d * 0.5 - v.s(10)} w={xD - xC - d * 1.2} style={{transform: 'translateY(-100%)'}}>
          <Cap v={v} title={pass.label} sub={pass.sub} size={fs} color={green} on={clamp01(landAt(frame, F(pass.atWord) + 14))} />
        </At>
      ) : null}
    </div>
  );
};
