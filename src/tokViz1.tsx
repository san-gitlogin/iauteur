import React from 'react';
import {useCurrentFrame} from 'remotion';
import {hexA} from './ui';
import {arriveAt, travelAt, landAt, stagger} from './motion/system';
import {F, BASE, useV, TokVizProps, pick, one, Cap, Chip, At, partColor, clamp01, lerp} from './tokVizKit';

/*
 * TOK depictions, batch 1 — the mechanism of the bill.
 *
 *   resend    one column per turn: the same base stack every time, history growing, your message a sliver
 *   grain     every token of one request as a dot; your prompt is the one dot that is lit
 *   prefix    the request as a bar: cached (dim, sealed) until a change, then everything after it re-billed
 *   price     price tags hanging from a rail, height = price, the one you should reach for lifted
 *   switch    a wall switch thrown OFF whose wire is cut; the thinking meter keeps running; the dial works
 *   jar       the context window as a jar, the used sliver magnified into its labelled layers
 *   shelf     tool names on a shelf as thin spines; only the one that is used is pulled out and opened
 *   backpack  a bag carried from task to task, filling; /clear tips it out
 */

/* ── RESEND ─────────────────────────────────────────────────────────────────────────────── */
// items: base (label, value k, text = part key) xN · turn (label, value = history k so far) xN · you (label) · total (label)
export const Resend: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const base = pick(items, 'base');
  const turns = pick(items, 'turn');
  const you = one(items, 'you');
  const total = one(items, 'total');
  const baseK = base.reduce((a, b) => a + (b.value ?? 0), 0);
  const maxK = Math.max(1, ...turns.map((t) => baseK + (t.value ?? 0) + 1));
  const n = Math.max(1, turns.length);
  const plotH = h * (v.vertical ? 0.62 : 0.7);
  const colW = Math.min((w * 0.78) / n * 0.62, v.s(150));
  const gap = (w * 0.78 - colW * n) / Math.max(1, n - 1);
  const x0 = w * 0.04;
  const floorY = h * 0.08 + plotH;
  const kPx = plotH / maxK;
  const legendOn = arriveAt(frame, BASE(base[0]?.atWord));
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* the floor */}
      <At x={x0} y={floorY} w={w * 0.8} h={Math.max(1, v.s(2))} style={{background: hexA(v.t.colors.muted, 0.35)}} />
      {turns.map((t, i) => {
        const on = arriveAt(frame, F(t.atWord));
        const send = travelAt(frame, F(t.atWord) + 6, 20);
        const x = x0 + i * (colW + gap);
        let y = floorY;
        const blocks = [
          ...base.map((b) => ({k: b.value ?? 0, c: partColor(v, b.text), key: b.label})),
          {k: t.value ?? 0, c: partColor(v, 'history'), key: 'history'},
        ];
        return (
          <React.Fragment key={i}>
            {blocks.map((b, j) => {
              const hh = b.k * kPx * on;
              y -= hh;
              // History is the part that GROWS, so it has to read at a glance: a hatched, bordered
              // block. At 35% of the muted grey it vanished on the dark ground and the red "you"
              // sliver floated in mid-air above an invisible stack (first proof sheet, 2026-09-30).
              const hist = b.key === 'history';
              return <At key={j} x={x} y={y} w={colW} h={hh} style={{
                background: hist
                  ? `repeating-linear-gradient(135deg, ${hexA(v.t.colors.text, 0.22)} 0 ${v.s(6)}px, ${hexA(v.t.colors.text, 0.1)} ${v.s(6)}px ${v.s(12)}px)`
                  : hexA(b.c, 0.55),
                border: hist ? `${Math.max(1, v.s(1.5))}px solid ${hexA(v.t.colors.text, 0.55)}` : undefined,
                borderTop: `${Math.max(1, v.s(1.5))}px solid ${hexA(hist ? v.t.colors.text : b.c, 0.9)}`}} />;
            })}
            {/* your message: a sliver on top, always the same thin size */}
            <At x={x} y={y - v.s(6) * on} w={colW} h={v.s(6) * on} style={{background: partColor(v, 'you'),
              boxShadow: v.glow(partColor(v, 'you'), 14)}} />
            {/* the whole column is sent: an arrow lifts off it */}
            <At x={x + colW / 2} y={y - v.s(30) - send * v.s(26)} center style={{opacity: on * (1 - send * 0.6),
              fontFamily: v.t.fonts.mono, fontSize: v.s(22), color: v.a}}>▲</At>
            <At x={x} y={floorY + v.s(12)} w={colW} style={{opacity: on}}>
              <Cap v={v} title={t.label} sub={t.sub} size={v.vertical ? 24 : 20} mono />
            </At>
          </React.Fragment>
        );
      })}
      {/* legend: what each colour is */}
      <At x={w * 0.84} y={h * 0.1} w={w * 0.16} style={{opacity: legendOn}}>
        {[...base.map((b) => ({l: b.label, s: b.sub, c: partColor(v, b.text)})),
          {l: 'earlier messages', s: 'grows every turn' as string | undefined, c: hexA(v.t.colors.text, 0.5)},
          {l: you?.label ?? 'your message', s: you?.sub, c: partColor(v, 'you')}].map((r, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: v.s(10), marginBottom: v.s(14),
            opacity: arriveAt(frame, BASE(base[0]?.atWord) + stagger(i, 4))}}>
            <div style={{width: v.s(18), height: v.s(18), borderRadius: v.rad(4), background: r.c, flex: 'none'}} />
            <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(v.vertical ? 26 : 24), color: v.t.colors.text, lineHeight: 1.2}}>
              {r.l}{r.s ? <div style={{color: v.t.colors.muted, fontSize: v.s(v.vertical ? 20 : 18)}}>{r.s}</div> : null}
            </div>
          </div>
        ))}
      </At>
      {total ? (
        <At x={w * 0.84} y={h * 0.72} w={w * 0.16} style={{}}>
          <Cap v={v} title={total.label} sub={total.sub} on={landAt(frame, F(total.atWord))} align="left" size={v.vertical ? 30 : 26} color={v.a} />
        </At>
      ) : null}
    </div>
  );
};

/* ── GRAIN ──────────────────────────────────────────────────────────────────────────────── */
// items: cache (value, label) · write (value, label) · fresh (value, label) · prompt (value, label) · per (value = tokens per dot)
export const Grain: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const cache = one(items, 'cache'), write = one(items, 'write'), prompt = one(items, 'prompt');
  const per = one(items, 'per')?.value ?? 100;
  const nCache = Math.round((cache?.value ?? 0) / per);
  const nWrite = Math.round((write?.value ?? 0) / per);
  const n = Math.max(1, nCache + nWrite);
  const areaW = w * (v.vertical ? 1 : 0.64), areaH = h * (v.vertical ? 0.62 : 0.9);
  // Pick the column count that makes the dots as large as possible in the area.
  let cols = 1, best = 0;
  for (let c = 4; c <= 80; c++) {
    const r = Math.ceil(n / c);
    const d = Math.min(areaW / c, areaH / r);
    if (d > best) { best = d; cols = c; }
  }
  const d = best;
  const dot = d * 0.72;
  const cacheOn = arriveAt(frame, BASE(cache?.atWord), 24);
  const writeOn = arriveAt(frame, F(write?.atWord), 24);
  const promptOn = landAt(frame, F(prompt?.atWord));
  const cb = partColor(v, 'cached'), cw = v.sem('purple'), cy = partColor(v, 'you');
  const promptIdx = n - 1;
  const px = (promptIdx % cols) * d + d / 2, py = Math.floor(promptIdx / cols) * d + d / 2;
  const sideX = v.vertical ? 0 : areaW + w * 0.05;
  const sideY = v.vertical ? areaH + v.s(40) : h * 0.1;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {Array.from({length: n}).map((_, i) => {
        const isCache = i < nCache;
        const on = isCache ? clamp01(cacheOn * 1.4 - (i / n) * 0.4) : clamp01(writeOn * 1.4 - ((i - nCache) / Math.max(1, nWrite)) * 0.4);
        const c = isCache ? cb : cw;
        return <div key={i} style={{position: 'absolute', left: (i % cols) * d + (d - dot) / 2, top: Math.floor(i / cols) * d + (d - dot) / 2,
          width: dot, height: dot, borderRadius: dot, background: hexA(c, 0.28 + 0.4 * on), opacity: on,
          transform: `scale(${0.4 + 0.6 * on})`}} />;
      })}
      {/* your prompt: one dot, lit, with a ring that finds it */}
      <div style={{position: 'absolute', left: px - dot / 2, top: py - dot / 2, width: dot, height: dot, borderRadius: dot,
        background: cy, opacity: promptOn, boxShadow: v.glow(cy, 22)}} />
      <div style={{position: 'absolute', left: px - dot * 2.2, top: py - dot * 2.2, width: dot * 4.4, height: dot * 4.4,
        borderRadius: dot * 4.4, border: `${v.s(3)}px solid ${cy}`, opacity: promptOn * (1.6 - promptOn * 0.6),
        transform: `scale(${2.4 - 1.4 * promptOn})`}} />
      <At x={sideX} y={sideY} w={v.vertical ? w : w * 0.3}>
        {[{it: cache, c: cb, on: cacheOn}, {it: write, c: cw, on: writeOn}, {it: prompt, c: cy, on: promptOn}].map((r, i) => r.it ? (
          <div key={i} style={{display: 'flex', gap: v.s(14), alignItems: 'flex-start', marginBottom: v.s(22), opacity: r.on}}>
            <div style={{width: v.s(20), height: v.s(20), borderRadius: v.s(20), background: r.c, marginTop: v.s(6), flex: 'none'}} />
            <Cap v={v} title={r.it.label} sub={r.it.sub} size={v.vertical ? 30 : 28} align="left" />
          </div>
        ) : null)}
        <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(v.vertical ? 20 : 16), color: v.t.colors.muted, opacity: cacheOn}}>
          one dot = {per} tokens
        </div>
      </At>
    </div>
  );
};

/* ── PREFIX ─────────────────────────────────────────────────────────────────────────────── */
// items: seg (label, value = relative width, text = part key) xN · new (label) · break (text = seg label that changes, label = why)
//        · verdict (label) — the part after the break is re-billed
export const Prefix: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const segs = pick(items, 'seg');
  const neu = one(items, 'new');
  const brk = one(items, 'break');
  const verdict = one(items, 'verdict');
  const total = segs.reduce((a, s) => a + (s.value ?? 1), 0) + (neu ? 0.6 : 0);
  const barW = w * 0.92, x0 = w * 0.04, barH = Math.min(h * 0.2, v.s(150));
  const y = h * 0.36;
  const brkIdx = brk ? segs.findIndex((s) => s.label === brk.text) : -1;
  const brkOn = brk ? travelAt(frame, F(brk.atWord), 26) : 0;
  const sealOn = arriveAt(frame, BASE(segs[0]?.atWord) + 10);
  let x = x0;
  const red = v.sem('red');
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {segs.map((s, i) => {
        const sw = ((s.value ?? 1) / total) * barW;
        const on = arriveAt(frame, BASE(s.atWord) + stagger(i, 5));
        const hit = brkIdx >= 0 && i >= brkIdx;
        const flood = hit ? clamp01(brkOn * (segs.length - brkIdx + 1) - (i - brkIdx)) : 0;
        const c = partColor(v, s.text);
        const cx = x;
        x += sw;
        return (
          <React.Fragment key={i}>
            <At x={cx} y={y} w={sw - v.s(4)} h={barH} style={{opacity: on, borderRadius: v.rad(8),
              background: hexA(flood > 0 ? red : c, 0.18 + 0.3 * (flood > 0 ? flood : 1) * (hit ? 1 : 0.6)),
              border: `${v.s(2)}px solid ${hexA(flood > 0 ? red : c, 0.85)}`}}>
              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: v.s(8)}}>
                <Cap v={v} title={s.label} sub={flood > 0.5 ? 'billed again' : s.sub} size={v.vertical ? 22 : 22} />
              </div>
              {/* the cache seal: a small lock on every segment until the break reaches it */}
              <div style={{position: 'absolute', top: -v.s(34), left: '50%', transform: 'translateX(-50%)', opacity: sealOn * (1 - flood),
                fontFamily: v.t.fonts.mono, fontSize: v.s(16), color: partColor(v, 'cached'), whiteSpace: 'nowrap'}}>● cached</div>
            </At>
          </React.Fragment>
        );
      })}
      {neu ? (
        <At x={x} y={y} w={(0.6 / total) * barW} h={barH} style={{opacity: arriveAt(frame, F(neu.atWord)), borderRadius: v.rad(8),
          background: partColor(v, 'you'), boxShadow: v.glow(partColor(v, 'you'), 18)}}>
          <div style={{position: 'absolute', top: barH + v.s(12), left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
            <Cap v={v} title={neu.label} size={20} mono color={partColor(v, 'you')} />
          </div>
        </At>
      ) : null}
      {brk && brkIdx >= 0 ? (() => {
        const bx = x0 + segs.slice(0, brkIdx).reduce((a, s) => a + ((s.value ?? 1) / total) * barW, 0);
        const on = landAt(frame, F(brk.atWord));
        return (
          <>
            <At x={bx - v.s(3)} y={y - v.s(50)} w={v.s(6)} h={barH + v.s(100)} style={{background: red, opacity: on, boxShadow: v.glow(red, 18)}} />
            <At x={bx} y={y + barH + v.s(70)} w={w * 0.5} style={{opacity: on}}>
              <Cap v={v} title={brk.label} sub={brk.sub} align="left" size={v.vertical ? 30 : 30} color={red} />
            </At>
          </>
        );
      })() : null}
      {verdict ? <At x={x0} y={h * 0.86} w={w * 0.9}><Cap v={v} title={verdict.label} align="left" size={v.vertical ? 28 : 26}
        on={arriveAt(frame, F(verdict.atWord))} color={v.t.colors.text} /></At> : null}
    </div>
  );
};

/* ── PRICE ──────────────────────────────────────────────────────────────────────────────── */
// items: tag (label = model, value = $ per M input, sub = "$X out") xN · pick (text = label of the lifted tag, label = why)
export const Price: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const tags = pick(items, 'tag');
  const chosen = one(items, 'pick');
  const maxP = Math.max(1, ...tags.map((t) => t.value ?? 1));
  const n = Math.max(1, tags.length);
  const railY = h * 0.08;
  const slotW = (w * 0.9) / n, x0 = w * 0.05;
  const tagW = Math.min(slotW * 0.7, v.s(250));
  const maxString = h * 0.42;
  const railOn = arriveAt(frame, BASE(tags[0]?.atWord));
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <At x={x0} y={railY} w={w * 0.9 * railOn} h={v.s(6)} style={{background: hexA(v.t.colors.muted, 0.6), borderRadius: v.s(6)}} />
      {tags.map((t, i) => {
        const on = landAt(frame, F(t.atWord));
        const lift = chosen && chosen.text === t.label ? travelAt(frame, F(chosen.atWord), 24) : 0;
        const dim = chosen && chosen.text !== t.label ? arriveAt(frame, F(chosen.atWord)) * 0.5 : 0;
        const stringH = v.s(40) + ((t.value ?? 1) / maxP) * maxString - lift * v.s(40);
        const cx = x0 + slotW * (i + 0.5);
        const c = t.color ? v.sem(t.color as any) : v.a;
        return (
          <React.Fragment key={i}>
            <At x={cx - v.s(1)} y={railY} w={v.s(2)} h={stringH * on} style={{background: hexA(v.t.colors.muted, 0.7), opacity: 1 - dim}} />
            <At x={cx - tagW / 2} y={railY + stringH * on} w={tagW} style={{opacity: on * (1 - dim), transform: `rotate(${(1 - on) * -8}deg)`,
              transformOrigin: 'top center'}}>
              <div style={{borderRadius: v.rad(14), padding: `${v.s(18)}px ${v.s(14)}px`, textAlign: 'center',
                background: hexA(c, 0.14 + lift * 0.12), border: `${v.s(2.5)}px solid ${hexA(c, 0.9)}`, boxShadow: lift ? v.glow(c, 24) : 'none',
                position: 'relative'}}>
                <div style={{position: 'absolute', top: v.s(10), left: '50%', width: v.s(14), height: v.s(14), borderRadius: v.s(14),
                  transform: 'translateX(-50%)', border: `${v.s(2)}px solid ${hexA(c, 0.9)}`}} />
                <div style={{height: v.s(14)}} />
                <Cap v={v} title={t.label} size={v.vertical ? 30 : 30} />
                <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(v.vertical ? 38 : 40), color: c, marginTop: v.s(10)}}>
                  ${t.value}<span style={{fontSize: v.s(18), color: v.t.colors.muted}}> in</span>
                </div>
                {t.sub ? <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(v.vertical ? 22 : 20), color: v.t.colors.muted, marginTop: v.s(4)}}>{t.sub}</div> : null}
              </div>
            </At>
          </React.Fragment>
        );
      })}
      {chosen?.label ? <At x={x0} y={h * 0.9} w={w * 0.9}><Cap v={v} title={chosen.label} sub={chosen.sub} size={v.vertical ? 28 : 26}
        on={arriveAt(frame, F(chosen.atWord) + 10)} /></At> : null}
      <At x={x0} y={railY - v.s(34)} w={w * 0.9} style={{opacity: railOn, fontFamily: v.t.fonts.mono, fontSize: v.s(16),
        color: v.t.colors.muted, textAlign: 'right'}}>per million tokens</At>
    </div>
  );
};

/* ── SWITCH ─────────────────────────────────────────────────────────────────────────────── */
// items: switch (label = the flag) · cut (label = why the wire is dead) · reading (text = effort level, value = thinking tokens,
//        label) x2 · dial (label)
export const Switch: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const sw = one(items, 'switch'), cut = one(items, 'cut'), dial = one(items, 'dial');
  const reads = pick(items, 'reading');
  const red = v.sem('red'), green = v.sem('green');
  const swOn = arriveAt(frame, BASE(sw?.atWord));
  const thrown = travelAt(frame, F(sw?.atWord) + 10, 14);
  const cutOn = landAt(frame, F(cut?.atWord));
  const r0 = reads[0], r1 = reads[1];
  const turn = r1 ? travelAt(frame, F(r1.atWord), 26) : 0;
  const meterMax = Math.max(1, ...reads.map((r) => r.value ?? 0));
  const val = r0 ? lerp(r0.value ?? 0, r1?.value ?? r0.value ?? 0, turn) * arriveAt(frame, F(r0.atWord), 40) : 0;
  const sX = w * (v.vertical ? 0.1 : 0.08), sY = h * 0.18, sW = v.s(v.vertical ? 170 : 150), sH = v.s(v.vertical ? 250 : 230);
  const mX = w * (v.vertical ? 0.55 : 0.62), mW = w * (v.vertical ? 0.38 : 0.3);
  const wireY = sY + sH / 2;
  const meterH = h * 0.6;
  const levels = ['low', 'medium', 'high', 'xhigh', 'max'];
  const angle = (lvl?: string) => -120 + (Math.max(0, levels.indexOf(lvl ?? 'high')) / (levels.length - 1)) * 240;
  const dAng = lerp(angle(r0?.text), angle(r1?.text ?? r0?.text), turn);
  const dX = w * (v.vertical ? 0.3 : 0.4), dY = h * (v.vertical ? 0.74 : 0.72), dR = v.s(v.vertical ? 90 : 80);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* the wall switch */}
      <At x={sX} y={sY} w={sW} h={sH} style={{opacity: swOn, borderRadius: v.rad(18), background: hexA(v.t.colors.muted, 0.1),
        border: `${v.s(2)}px solid ${hexA(v.t.colors.muted, 0.5)}`}}>
        <div style={{position: 'absolute', left: '50%', top: '50%', width: sW * 0.36, height: sH * 0.5, marginLeft: -sW * 0.18,
          marginTop: -sH * 0.25, borderRadius: v.rad(10), background: hexA(v.t.colors.muted, 0.2)}}>
          <div style={{position: 'absolute', left: 0, right: 0, height: '50%', top: `${thrown * 50}%`, borderRadius: v.rad(10),
            background: lerp(0, 1, thrown) > 0.5 ? hexA(red, 0.85) : hexA(green, 0.85), transition: 'none'}} />
        </div>
        <div style={{position: 'absolute', top: sH + v.s(14), left: -v.s(40), right: -v.s(40)}}>
          <Cap v={v} title={sw?.label} sub={thrown > 0.5 ? 'switched off' : undefined} size={v.vertical ? 22 : 20} mono />
        </div>
      </At>
      {/* the wire, and the gap where it is cut */}
      <At x={sX + sW} y={wireY} w={(mX - sX - sW) * 0.4} h={v.s(4)} style={{background: hexA(v.t.colors.muted, 0.7), opacity: swOn}} />
      <At x={sX + sW + (mX - sX - sW) * 0.6} y={wireY} w={(mX - sX - sW) * 0.4} h={v.s(4)} style={{background: hexA(v.t.colors.muted, 0.7), opacity: swOn}} />
      <At x={sX + sW + (mX - sX - sW) * 0.5} y={wireY + v.s(2)} center style={{opacity: cutOn, fontFamily: v.t.fonts.mono,
        fontSize: v.s(44), color: red}}>✕</At>
      {cut ? <At x={sX + sW + (mX - sX - sW) * 0.1} y={wireY + v.s(40)} w={(mX - sX - sW) * 0.8} style={{}}>
        <Cap v={v} title={cut.label} sub={cut.sub} on={cutOn} size={v.vertical ? 22 : 22} color={red} />
      </At> : null}
      {/* the thinking meter: it keeps running */}
      <At x={mX} y={h * 0.08} w={mW} h={meterH} style={{opacity: swOn, borderRadius: v.rad(14),
        border: `${v.s(2)}px solid ${hexA(v.a, 0.5)}`, overflow: 'hidden', background: hexA(v.a, 0.05)}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${(val / meterMax) * 92}%`, background: hexA(v.a, 0.55),
          boxShadow: v.glow(v.a, 18)}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: v.s(16), textAlign: 'center', fontFamily: v.t.fonts.mono,
          fontSize: v.s(v.vertical ? 44 : 48), color: v.t.colors.text}}>{Math.round(val).toLocaleString('en-US')}</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: v.s(76), textAlign: 'center', fontFamily: v.t.fonts.body,
          fontSize: v.s(18), color: v.t.colors.muted}}>thinking tokens</div>
      </At>
      {/* the effort dial: the control that is actually wired */}
      <At x={dX - dR} y={dY - dR} w={dR * 2} h={dR * 2} style={{opacity: arriveAt(frame, F(dial?.atWord ?? r0?.atWord)),
        borderRadius: dR * 2, border: `${v.s(3)}px solid ${hexA(green, 0.9)}`, background: hexA(green, 0.08)}}>
        <div style={{position: 'absolute', left: '50%', top: '50%', width: v.s(5), height: dR * 0.8, marginLeft: -v.s(2.5),
          transformOrigin: '50% 100%', transform: `translateY(-100%) rotate(${dAng}deg)`, background: green, borderRadius: v.s(4)}} />
        <div style={{position: 'absolute', top: dR * 2 + v.s(10), left: -v.s(80), right: -v.s(80)}}>
          <Cap v={v} title={dial?.label ?? '/effort'} sub={turn > 0.5 ? r1?.label : r0?.label} size={v.vertical ? 24 : 22} mono color={green} />
        </div>
      </At>
    </div>
  );
};

/* ── JAR ────────────────────────────────────────────────────────────────────────────────── */
// items: window (value = k, label) · layer (label, value = k, text = part key) xN · free (label) · buffer (value k, label)
export const Jar: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const win = one(items, 'window'), free = one(items, 'free'), buf = one(items, 'buffer');
  const layers = pick(items, 'layer');
  const winK = win?.value ?? 1000;
  const usedK = layers.reduce((a, l) => a + (l.value ?? 0), 0);
  const jX = w * (v.vertical ? 0.06 : 0.06), jW = w * (v.vertical ? 0.3 : 0.18), jY = h * 0.06, jH = h * 0.84;
  const on = arriveAt(frame, BASE(win?.atWord));
  const usedH = Math.max(v.s(10), (usedK / winK) * jH);
  const bufH = ((buf?.value ?? 0) / winK) * jH;
  // the magnified inset: the used sliver blown up into its layers
  const mX = w * (v.vertical ? 0.46 : 0.36), mW = w * (v.vertical ? 0.5 : 0.36), mY = h * 0.1, mH = h * 0.74;
  const zoom = travelAt(frame, F(layers[0]?.atWord) - 6, 24);
  let yy = mY + mH;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <At x={jX} y={jY} w={jW} h={jH} style={{opacity: on, borderRadius: `${v.rad(10)}px ${v.rad(10)}px ${v.rad(26)}px ${v.rad(26)}px`,
        border: `${v.s(3)}px solid ${hexA(v.t.colors.muted, 0.7)}`, background: hexA(v.t.colors.muted, 0.04), overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: usedH * on, background: hexA(v.a, 0.8), boxShadow: v.glow(v.a, 16)}} />
        {buf ? <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bufH, background: `repeating-linear-gradient(45deg, ${hexA(v.sem('orange'), 0.35)} 0 ${v.s(6)}px, transparent ${v.s(6)}px ${v.s(12)}px)`,
          opacity: arriveAt(frame, F(buf.atWord))}} /> : null}
      </At>
      <At x={jX} y={jY + jH + v.s(10)} w={jW}><Cap v={v} title={win?.label} sub={win?.sub} on={on} size={v.vertical ? 24 : 22} /></At>
      {free ? <At x={jX + jW / 2} y={jY + jH * 0.45} center style={{width: jW * 0.9}}><Cap v={v} title={free.label} sub={free.sub}
        on={arriveAt(frame, F(free.atWord))} size={v.vertical ? 22 : 20} color={v.t.colors.muted} /></At> : null}
      {buf ? <At x={jX + jW + v.s(14)} y={jY} w={w * 0.2}><Cap v={v} title={buf.label} sub={buf.sub} align="left"
        on={arriveAt(frame, F(buf.atWord))} size={v.vertical ? 20 : 18} color={v.sem('orange')} /></At> : null}
      {/* the leader from the sliver to the magnifier */}
      <svg style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: zoom}} width={w} height={h}>
        <line x1={jX + jW} y1={jY + jH - usedH} x2={mX} y2={mY} stroke={hexA(v.a, 0.6)} strokeWidth={v.s(2)} strokeDasharray={`${v.s(6)} ${v.s(6)}`} />
        <line x1={jX + jW} y1={jY + jH} x2={mX} y2={mY + mH} stroke={hexA(v.a, 0.6)} strokeWidth={v.s(2)} strokeDasharray={`${v.s(6)} ${v.s(6)}`} />
      </svg>
      <At x={mX} y={mY} w={mW} h={mH} style={{opacity: zoom, borderRadius: v.rad(12), border: `${v.s(2)}px solid ${hexA(v.a, 0.6)}`}} />
      {layers.map((l, i) => {
        const lh = ((l.value ?? 0) / Math.max(1, usedK)) * mH;
        const lo = arriveAt(frame, F(l.atWord));
        yy -= lh;
        const c = partColor(v, l.text);
        return (
          <React.Fragment key={i}>
            <At x={mX} y={yy} w={mW} h={lh} style={{background: hexA(c, 0.22 + 0.35 * lo), borderTop: `${v.s(2)}px solid ${hexA(c, 0.9)}`, opacity: zoom}} />
            <At x={mX + mW + v.s(18)} y={yy + lh / 2} style={{transform: 'translateY(-50%)', opacity: lo, width: w - mX - mW - v.s(24)}}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: v.s(12)}}>
                <span style={{fontFamily: v.t.fonts.mono, fontSize: v.s(v.vertical ? 26 : 26), color: c}}>{l.value}k</span>
                <span style={{fontFamily: v.t.fonts.body, fontSize: v.s(v.vertical ? 24 : 22), color: v.t.colors.text}}>{l.label}</span>
              </div>
            </At>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ── SHELF ──────────────────────────────────────────────────────────────────────────────── */
// items: spine (label = tool name) xN · open (text = spine label pulled out, label = what loads, sub) · note (label)
export const Shelf: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const spines = pick(items, 'spine');
  const open = one(items, 'open');
  const note = one(items, 'note');
  const n = Math.max(1, spines.length);
  const shelfY = h * (v.vertical ? 0.4 : 0.5), sx = w * 0.04, sw = w * 0.92;
  const spW = Math.min((sw / n) * 0.8, v.s(80)), spH = h * (v.vertical ? 0.28 : 0.4);
  const gap = (sw - spW * n) / Math.max(1, n - 1);
  const idx = open ? spines.findIndex((s) => s.label === open.text) : -1;
  const pull = open ? travelAt(frame, F(open.atWord), 28) : 0;
  const card = open ? arriveAt(frame, F(open.atWord) + 18, 20) : 0;
  const shelfOn = arriveAt(frame, BASE(spines[0]?.atWord));
  const palette = ['blue', 'purple', 'green', 'orange', 'yellow'] as const;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <At x={sx} y={shelfY} w={sw * shelfOn} h={v.s(10)} style={{background: hexA(v.t.colors.muted, 0.5), borderRadius: v.s(4)}} />
      {spines.map((s, i) => {
        const on = arriveAt(frame, BASE(s.atWord) + stagger(i, 2));
        const c = v.sem(palette[i % palette.length]);
        const up = i === idx ? pull : 0;
        return (
          <At key={i} x={sx + i * (spW + gap)} y={shelfY - spH - up * spH * 0.28} w={spW} h={spH} style={{opacity: on * (i === idx ? 1 : 1 - card * 0.5),
            borderRadius: v.rad(6), background: hexA(c, 0.22), border: `${v.s(2)}px solid ${hexA(c, 0.8)}`, overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%) rotate(-90deg)', whiteSpace: 'nowrap',
              fontFamily: v.t.fonts.mono, fontSize: Math.min(v.s(v.vertical ? 20 : 18), spW * 0.42), color: v.t.colors.text}}>{s.label}</div>
          </At>
        );
      })}
      {open ? (
        <At x={w * 0.5} y={shelfY + v.s(40) + (h - shelfY) * 0.34} center style={{width: w * (v.vertical ? 0.86 : 0.5), opacity: card}}>
          <div style={{borderRadius: v.rad(14), padding: v.s(22), background: hexA(v.a, 0.12), border: `${v.s(2.5)}px solid ${hexA(v.a, 0.9)}`,
            boxShadow: v.glow(v.a, 20)}}>
            <Cap v={v} title={open.label} sub={open.sub} size={v.vertical ? 30 : 30} />
          </div>
        </At>
      ) : null}
      {note ? <At x={sx} y={h - v.s(40)} w={sw}><Cap v={v} title={note.label} sub={note.sub} align="center" size={v.vertical ? 26 : 24}
        on={arriveAt(frame, F(note.atWord))} /></At> : null}
    </div>
  );
};

/* ── BACKPACK ───────────────────────────────────────────────────────────────────────────── */
// items: task (label, value = k it leaves behind) xN · clear (text = index of task it comes before, label) · note (label)
export const Backpack: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const tasks = pick(items, 'task');
  const clear = one(items, 'clear');
  const note = one(items, 'note');
  const n = Math.max(1, tasks.length);
  const clearAt = clear ? Number(clear.text ?? n) : n + 1;
  const clearOn = clear ? travelAt(frame, F(clear.atWord), 24) : 0;
  const stX = w * 0.06, stW = w * 0.88;
  const stationY = h * (v.vertical ? 0.2 : 0.16);
  const step = stW / n;
  // where the bag is: at the last task whose word has arrived
  let at = 0;
  tasks.forEach((t, i) => { if (frame >= F(t.atWord)) at = i; });
  const move = tasks[at] ? travelAt(frame, F(tasks[at].atWord), 22) : 0;
  const bagX = stX + step * (Math.max(0, at - 1) + 0.5) + step * (at === 0 ? 0 : move);
  const bagY = h * (v.vertical ? 0.66 : 0.72);
  const bagW = Math.min(step * 0.8, v.s(340));
  const slabH = v.s(v.vertical ? 40 : 38);
  const maxK = Math.max(1, ...tasks.map((t) => t.value ?? 1));
  const green = v.sem('green');
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {tasks.map((t, i) => {
        const on = arriveAt(frame, BASE(t.atWord) + stagger(i, 3));
        const cx = stX + step * (i + 0.5);
        return (
          <At key={i} x={cx} y={stationY} center style={{opacity: 0.4 + 0.6 * on, width: step * 0.9}}>
            <div style={{borderRadius: v.rad(12), padding: v.s(12), border: `${v.s(2)}px solid ${hexA(v.a, i === at ? 0.9 : 0.35)}`,
              background: hexA(v.a, i === at ? 0.12 : 0.04)}}>
              <Cap v={v} title={t.label} sub={t.sub} size={v.vertical ? 26 : 28} />
            </div>
          </At>
        );
      })}
      {clear ? (
        <At x={stX + step * (clearAt - 0.02)} y={stationY - v.s(60)} w={v.s(4)} h={bagY + v.s(40) - stationY} style={{
          background: green, opacity: arriveAt(frame, F(clear.atWord)), boxShadow: v.glow(green, 16)}}>
          <div style={{position: 'absolute', top: -v.s(46), left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
            <Chip v={v} text={clear.label ?? '/clear'} on={arriveAt(frame, F(clear.atWord))} color={green} size={v.s(24)} solid />
          </div>
        </At>
      ) : null}
      {/* the bag and what it carries */}
      <At x={bagX - bagW / 2} y={bagY} w={bagW} h={v.s(v.vertical ? 150 : 130)} style={{borderRadius: `${v.rad(20)}px ${v.rad(20)}px ${v.rad(30)}px ${v.rad(30)}px`,
        border: `${v.s(3)}px solid ${hexA(v.t.colors.muted, 0.8)}`, background: hexA(v.t.colors.muted, 0.08)}} />
      {tasks.slice(0, at + 1).map((t, i) => {
        const gone = clear && i < clearAt && at >= clearAt ? clearOn : 0;
        const inOn = i === at ? move : 1;
        const hgt = slabH * (0.6 + 0.8 * ((t.value ?? 1) / maxK));
        // Stack only what is still in the bag: after /clear the next task starts from the bottom again.
        const base = clear && at >= clearAt && i >= clearAt ? clearAt : 0;
        const y = bagY - v.s(8) - tasks.slice(base, i + 1).reduce((a, tt) => a + slabH * (0.6 + 0.8 * ((tt.value ?? 1) / maxK)) + v.s(4), 0);
        return (
          <At key={i} x={bagX - bagW * 0.42} y={y - gone * v.s(260)} w={bagW * 0.84} h={hgt} style={{opacity: inOn * (1 - gone),
            borderRadius: v.rad(6), background: hexA(partColor(v, 'history'), 0.45), border: `${v.s(1.5)}px solid ${hexA(partColor(v, 'history'), 0.9)}`,
            transform: `rotate(${gone * (i % 2 ? 18 : -14)}deg)`}}>
            <div style={{fontFamily: v.t.fonts.mono, fontSize: Math.min(v.s(20), hgt * 0.6), color: v.t.colors.text, textAlign: 'center', lineHeight: `${hgt}px`,
              whiteSpace: 'nowrap', overflow: 'hidden'}}>{t.label}{t.value ? ` · ${t.value}k` : ''}</div>
          </At>
        );
      })}
      {note ? <At x={stX} y={h * 0.93} w={stW}><Cap v={v} title={note.label} sub={note.sub} size={v.vertical ? 26 : 24}
        on={arriveAt(frame, F(note.atWord))} /></At> : null}
    </div>
  );
};

