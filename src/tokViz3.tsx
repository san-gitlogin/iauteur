import React from 'react';
import {useCurrentFrame, Img, staticFile} from 'remotion';
import {hexA} from './ui';
import {arriveAt, travelAt, landAt, stagger} from './motion/system';
import {F, BASE, useV, TokVizProps, pick, one, Cap, Chip, At, partColor, clamp01, lerp} from './tokVizKit';

/*
 * TOK depictions, batch 3 — the nine that need setting up, the source, and the verdict.
 *
 *   sheet    the infographic itself, read like a page: the camera travels to each level on its word, credit always on
 *   sieve    a pour of test-output lines into a funnel stamped with the quiet flag; two lines come out
 *   card     Claude hunting through files for how to run the tests, against one pinned line it simply reads
 *   room     a side room where the subagent reads the big log; only a slip of paper comes back through the door
 *   toll     a road of turns with a toll gate: switching fast mode on re-prices everything behind you, once
 *   ttl      two cache clocks against a coffee break: the 5-minute one runs out, the 1-hour one costs more to set
 *   board    the 21 moves sorted into what each one actually changes
 */

/* ── SHEET ──────────────────────────────────────────────────────────────────────────────── */
// token = image file in public/assets · items: focus (value = centre y as 0..1 of the image, text = zoom, label) xN ·
//        credit (label, sub) — the credit is ALWAYS on screen, unanchored (a quotation carries its source)
export const Sheet: React.FC<TokVizProps> = ({items, accent, token, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const focus = pick(items, 'focus');
  const credit = one(items, 'credit');
  const imgW = 1206, imgH = 1487;
  const fit = Math.min((w * (v.vertical ? 1 : 0.6)) / imgW, (h * 0.96) / imgH);
  // camera: zoom z centred on y (fraction of the image). Walk the focus list by their words.
  let z = 1, cy = 0.5;
  let label: string | undefined; let lOn = 0;
  focus.forEach((f) => {
    const u = travelAt(frame, F(f.atWord), 26);
    if (frame >= F(f.atWord)) { label = f.label; lOn = arriveAt(frame, F(f.atWord) + 10); }
    z = lerp(z, Number(f.text ?? 1), u);
    cy = lerp(cy, f.value ?? 0.5, u);
  });
  const dispW = imgW * fit * z, dispH = imgH * fit * z;
  const boxW = v.vertical ? w : w * 0.6, boxH = h;
  const left = (boxW - dispW) / 2;
  const top = Math.max(Math.min(0, boxH / 2 - cy * dispH), boxH - dispH);
  const on = arriveAt(frame, BASE(focus[0]?.atWord), 20);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: boxW, height: boxH, overflow: 'hidden', borderRadius: v.rad(14),
        opacity: on, boxShadow: `0 ${v.s(20)}px ${v.s(60)}px rgba(0,0,0,0.45)`}}>
        <Img src={staticFile(`assets/${token ?? 'tok-infographic.jpg'}`)} style={{position: 'absolute', left, top: dispH <= boxH ? (boxH - dispH) / 2 : top,
          width: dispW, height: dispH}} />
      </div>
      {!v.vertical && label ? <At x={w * 0.65} y={h * 0.18} w={w * 0.35}><Cap v={v} title={label} align="left" size={40} on={lOn} /></At> : null}
      {credit ? (
        <At x={v.vertical ? 0 : w * 0.65} y={v.vertical ? h - v.s(8) : h * 0.78} w={v.vertical ? w : w * 0.35}
          style={{transform: v.vertical ? 'translateY(-100%)' : undefined, background: v.vertical ? hexA(v.t.colors.bg, 0.86) : undefined,
            padding: v.vertical ? v.s(14) : 0, borderRadius: v.rad(10)}}>
          <Cap v={v} title={credit.label} sub={credit.sub} align={v.vertical ? 'center' : 'left'} size={v.vertical ? 24 : 24} color={v.t.colors.muted} />
        </At>
      ) : null}
    </div>
  );
};

/* ── SIEVE ──────────────────────────────────────────────────────────────────────────────── */
// items: pour (label = the loud command, value = lines) · flag (label = the quiet flag) · out (label = what survives, value = lines) ·
//        line (label) xN (sample lines of the loud output)
export const Sieve: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const pour = one(items, 'pour'), flag = one(items, 'flag'), out = one(items, 'out');
  const lines = pick(items, 'line');
  const fx = w * 0.5, fTop = h * (v.vertical ? 0.42 : 0.44), fW = w * (v.vertical ? 0.7 : 0.42), fH = h * 0.2;
  const pourOn = arriveAt(frame, BASE(pour?.atWord));
  const flow = clamp01((frame - F(pour?.atWord)) / 90);
  const outOn = landAt(frame, F(out?.atWord));
  const red = v.sem('red'), green = v.sem('green');
  const rowH = v.s(v.vertical ? 30 : 28);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* the loud output, pouring down */}
      <At x={fx - fW * 0.45} y={0} w={fW * 0.9} h={fTop} style={{overflow: 'hidden', opacity: pourOn}}>
        {lines.map((l, i) => {
          const y = (i * rowH + flow * rowH * 6) % (fTop + rowH) - rowH;
          return <div key={i} style={{position: 'absolute', top: y, left: 0, right: 0, fontFamily: v.t.fonts.mono, fontSize: v.s(v.vertical ? 17 : 16),
            color: hexA(red, 0.75), whiteSpace: 'nowrap', overflow: 'hidden'}}>{l.label}</div>;
        })}
      </At>
      <At x={v.s(0)} y={h * 0.04} w={w * 0.28}><Cap v={v} title={pour?.label} sub={pour?.sub} align="left" size={v.vertical ? 24 : 26}
        on={pourOn} mono color={red} /></At>
      {/* the funnel */}
      <svg style={{position: 'absolute', inset: 0, overflow: 'visible'}} width={w} height={h}>
        <path d={`M${fx - fW / 2},${fTop} L${fx + fW / 2},${fTop} L${fx + fW * 0.08},${fTop + fH} L${fx - fW * 0.08},${fTop + fH} Z`}
          fill={hexA(v.a, 0.12)} stroke={v.a} strokeWidth={v.s(3)} opacity={arriveAt(frame, F(flag?.atWord))} />
      </svg>
      <At x={fx} y={fTop + fH * 0.4} center><Chip v={v} text={flag?.label ?? '-q'} on={landAt(frame, F(flag?.atWord))} color={v.a} size={v.s(v.vertical ? 34 : 36)} solid /></At>
      {/* what comes out */}
      <At x={fx} y={fTop + fH + v.s(40)} center style={{width: w * 0.8, opacity: outOn}}>
        <div style={{borderRadius: v.rad(12), padding: v.s(18), border: `${v.s(2.5)}px solid ${green}`, background: hexA(green, 0.1), textAlign: 'center',
          transform: 'translateY(50%)'}}>
          <Cap v={v} title={out?.label} sub={out?.sub} size={v.vertical ? 30 : 30} mono color={green} />
        </div>
      </At>
    </div>
  );
};

/* ── CARD ───────────────────────────────────────────────────────────────────────────────── */
// items: hunt (label = a place Claude looks) xN · found (label = what it had to work out) · pin (label = the line in CLAUDE.md) xN ·
//        note (label)
export const Card: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const hunts = pick(items, 'hunt');
  const pins = pick(items, 'pin');
  const found = one(items, 'found'), note = one(items, 'note');
  const left = {x: 0, w: v.vertical ? w : w * 0.5 - v.s(20)};
  const right = {x: v.vertical ? 0 : w * 0.5 + v.s(20), w: v.vertical ? w : w * 0.5 - v.s(20)};
  const topR = v.vertical ? h * 0.55 : 0;
  const red = v.sem('red'), green = v.sem('green');
  // the magnifier walks the hunt list
  let at = -1; hunts.forEach((hh, i) => { if (frame >= F(hh.atWord)) at = i; });
  const rowH = Math.min(v.s(70), (h * (v.vertical ? 0.4 : 0.66)) / Math.max(1, hunts.length));
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {hunts.map((hh, i) => {
        const on = arriveAt(frame, BASE(hh.atWord) + stagger(i, 2));
        const now = i === at;
        return (
          <At key={i} x={left.x} y={v.s(10) + i * rowH} w={left.w} h={rowH - v.s(10)} style={{opacity: 0.35 + 0.65 * on, borderRadius: v.rad(8),
            border: `${v.s(2)}px solid ${hexA(now ? red : v.t.colors.muted, now ? 0.9 : 0.3)}`, background: hexA(now ? red : v.t.colors.muted, now ? 0.12 : 0.03),
            display: 'flex', alignItems: 'center', gap: v.s(12), padding: `0 ${v.s(16)}px`}}>
            <span style={{fontSize: v.s(24), opacity: i <= at ? 1 : 0.2}}>🔍</span>
            <span style={{fontFamily: v.t.fonts.mono, fontSize: v.s(v.vertical ? 20 : 20), color: v.t.colors.text}}>{hh.label}</span>
          </At>
        );
      })}
      {found ? <At x={left.x} y={v.s(10) + hunts.length * rowH + v.s(10)} w={left.w}><Cap v={v} title={found.label} sub={found.sub} size={v.vertical ? 22 : 22}
        on={arriveAt(frame, F(found.atWord))} color={red} align="left" /></At> : null}
      {/* the pinned card */}
      <At x={right.x} y={topR + v.s(10)} w={right.w} style={{opacity: arriveAt(frame, F(pins[0]?.atWord)), transform: `rotate(${-1.5}deg)`}}>
        <div style={{borderRadius: v.rad(10), padding: v.s(24), background: hexA(green, 0.08), border: `${v.s(2.5)}px solid ${green}`, boxShadow: v.glow(green, 16)}}>
          <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(18), color: v.t.colors.muted, marginBottom: v.s(12)}}>CLAUDE.md</div>
          {pins.map((p, i) => (
            <div key={i} style={{fontFamily: v.t.fonts.mono, fontSize: v.s(v.vertical ? 24 : 24), color: v.t.colors.text, marginBottom: v.s(10),
              opacity: arriveAt(frame, F(p.atWord))}}>{p.label}</div>
          ))}
        </div>
      </At>
      {note ? <At x={right.x} y={v.vertical ? h * 0.9 : h * 0.72} w={right.w}><Cap v={v} title={note.label} sub={note.sub} size={v.vertical ? 24 : 24}
        on={arriveAt(frame, F(note.atWord))} color={green} align="left" /></At> : null}
    </div>
  );
};

/* ── ROOM ───────────────────────────────────────────────────────────────────────────────── */
// items: main (label, sub) · side (label, sub = model) · load (label = what the side room reads) · slip (label = what comes back) ·
//        note (label)
export const Room: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const main = one(items, 'main'), side = one(items, 'side'), load = one(items, 'load'), slip = one(items, 'slip'), note = one(items, 'note');
  const mX = 0, mW = w * (v.vertical ? 1 : 0.46), mY = v.vertical ? 0 : h * 0.08, mH = h * (v.vertical ? 0.4 : 0.66);
  const sX = v.vertical ? 0 : w * 0.54, sW = w * (v.vertical ? 1 : 0.46), sY = v.vertical ? h * 0.5 : h * 0.08, sH = mH;
  const mainOn = arriveAt(frame, BASE(main?.atWord)), sideOn = arriveAt(frame, F(side?.atWord));
  const loadOn = clamp01((frame - F(load?.atWord)) / 60);
  const slipT = travelAt(frame, F(slip?.atWord), 34);
  const doorX = v.vertical ? w * 0.5 : w * 0.5, doorY = v.vertical ? h * 0.45 : h * 0.41;
  const green = v.sem('green'), orange = v.sem('orange');
  const roomStyle = (c: string, o: number): React.CSSProperties => ({opacity: o, borderRadius: v.rad(18), border: `${v.s(3)}px solid ${hexA(c, 0.85)}`,
    background: hexA(c, 0.06), overflow: 'hidden'});
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <At x={mX} y={mY} w={mW} h={mH} style={roomStyle(v.a, mainOn)}>
        <div style={{padding: v.s(22)}}><Cap v={v} title={main?.label} sub={main?.sub} align="left" size={v.vertical ? 30 : 30} /></div>
      </At>
      <At x={sX} y={sY} w={sW} h={sH} style={roomStyle(orange, sideOn)}>
        <div style={{padding: v.s(22)}}><Cap v={v} title={side?.label} sub={side?.sub} align="left" size={v.vertical ? 30 : 30} color={orange} /></div>
        {/* the log, piling up inside the side room only */}
        <div style={{position: 'absolute', left: v.s(22), right: v.s(22), bottom: v.s(20), height: sH * 0.55 * loadOn, overflow: 'hidden',
          background: `repeating-linear-gradient(0deg, ${hexA(orange, 0.35)} 0 ${v.s(3)}px, transparent ${v.s(3)}px ${v.s(9)}px)`, borderRadius: v.rad(6)}}>
          <div style={{position: 'absolute', bottom: v.s(8), left: 0, right: 0, textAlign: 'center', fontFamily: v.t.fonts.mono, fontSize: v.s(22),
            color: v.t.colors.text}}>{load?.label}</div>
        </div>
      </At>
      {/* the slip coming back through the door */}
      {slip ? (
        <At x={lerp(sX + sW * 0.5, mX + mW * 0.5, slipT)} y={lerp(sY + sH * 0.4, mY + mH * 0.6, slipT)} center style={{opacity: arriveAt(frame, F(slip.atWord)),
          width: v.vertical ? w * 0.7 : w * 0.32}}>
          <div style={{borderRadius: v.rad(8), padding: v.s(14), background: hexA(green, 0.14), border: `${v.s(2.5)}px solid ${green}`, boxShadow: v.glow(green, 16),
            transform: `rotate(${(1 - slipT) * 6}deg)`}}>
            <Cap v={v} title={slip.label} sub={slip.sub} size={v.vertical ? 22 : 22} mono color={green} />
          </div>
        </At>
      ) : null}
      <At x={doorX} y={doorY} center style={{opacity: sideOn, fontFamily: v.t.fonts.mono, fontSize: v.s(28), color: v.t.colors.muted}}>{v.vertical ? '⇅' : '⇄'}</At>
      {note ? <At x={0} y={h * 0.88} w={w}><Cap v={v} title={note.label} sub={note.sub} size={v.vertical ? 26 : 26} on={arriveAt(frame, F(note.atWord))} /></At> : null}
    </div>
  );
};

/* ── TOLL ───────────────────────────────────────────────────────────────────────────────── */
// items: turn (label, value = context k at that turn) xN · gate (text = index of the turn where fast mode goes on, label, sub) x2 ·
//        rate (label) — two gates: one early, one late, each re-prices everything behind it once
export const Toll: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const turns = pick(items, 'turn');
  const gates = pick(items, 'gate');
  const rate = one(items, 'rate');
  const n = Math.max(1, turns.length);
  const x0 = w * 0.04, rw = w * 0.92, cw = rw / n;
  const floorY = h * 0.72;
  const maxK = Math.max(1, ...turns.map((t) => t.value ?? 1));
  const colH = h * 0.5;
  const red = v.sem('red');
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <At x={x0} y={floorY} w={rw} h={v.s(3)} style={{background: hexA(v.t.colors.muted, 0.5)}} />
      {turns.map((t, i) => {
        const on = arriveAt(frame, BASE(t.atWord) + stagger(i, 2));
        const hh = ((t.value ?? 0) / maxK) * colH * on;
        const gate = gates.find((g) => Number(g.text) === i);
        const gOn = gate ? landAt(frame, F(gate.atWord)) : 0;
        return (
          <React.Fragment key={i}>
            <At x={x0 + i * cw + cw * 0.15} y={floorY - hh} w={cw * 0.7} h={hh} style={{background: hexA(gOn ? red : partColor(v, 'history'), 0.25 + 0.4 * gOn),
              border: `${v.s(1.5)}px solid ${hexA(gOn ? red : partColor(v, 'history'), 0.8)}`, borderRadius: v.rad(4), boxShadow: gOn ? v.glow(red, 16) : 'none'}} />
            <At x={x0 + i * cw} y={floorY + v.s(10)} w={cw}><Cap v={v} title={t.label} size={v.vertical ? 16 : 16} mono on={on} /></At>
            {gate ? (
              <>
                <At x={x0 + i * cw + cw / 2 - v.s(3)} y={floorY - colH - v.s(60)} w={v.s(6)} h={colH + v.s(60)} style={{background: red, opacity: gOn}} />
                <At x={x0 + i * cw + cw / 2} y={floorY - colH - v.s(80)} center style={{width: w * 0.3}}>
                  <Cap v={v} title={gate.label} sub={gate.sub} size={v.vertical ? 22 : 24} on={gOn} color={red} />
                </At>
              </>
            ) : null}
          </React.Fragment>
        );
      })}
      {rate ? <At x={x0} y={h * 0.88} w={rw}><Cap v={v} title={rate.label} sub={rate.sub} size={v.vertical ? 24 : 24} on={arriveAt(frame, F(rate.atWord))} /></At> : null}
    </div>
  );
};

/* ── TTL ────────────────────────────────────────────────────────────────────────────────── */
// items: clock (label, value = minutes the cache lives, sub = write price) x2 · pause (value = minutes away, label) · verdict (label) x2
//        (verdict text = which clock it belongs to: '0' or '1')
export const Ttl: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const clocks = pick(items, 'clock');
  const pause = one(items, 'pause');
  const verdicts = pick(items, 'verdict');
  const away = pause?.value ?? 20;
  const run = pause ? travelAt(frame, F(pause.atWord), 60) : 0;
  const R = Math.min(w * (v.vertical ? 0.24 : 0.14), h * (v.vertical ? 0.13 : 0.24));
  const red = v.sem('red'), green = v.sem('green');
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {clocks.map((c, i) => {
        const cx = v.vertical ? w * 0.5 : w * (0.25 + i * 0.5), cy = v.vertical ? h * (0.2 + i * 0.4) : h * 0.36;
        const life = c.value ?? 5;
        const left = clamp01(1 - (run * away) / life);
        const dead = left <= 0;
        const on = arriveAt(frame, BASE(c.atWord));
        const col = dead ? red : green;
        const verdict = verdicts.find((vv) => vv.text === String(i));
        return (
          <React.Fragment key={i}>
            <svg style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: on}} width={w} height={h}>
              <circle cx={cx} cy={cy} r={R} fill={hexA(col, 0.08)} stroke={hexA(v.t.colors.muted, 0.4)} strokeWidth={v.s(10)} />
              <circle cx={cx} cy={cy} r={R} fill="none" stroke={col} strokeWidth={v.s(10)} strokeDasharray={`${2 * Math.PI * R * left} ${2 * Math.PI * R}`}
                transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
            </svg>
            <At x={cx} y={cy} center style={{opacity: on, textAlign: 'center'}}>
              <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(v.vertical ? 40 : 44), color: v.t.colors.text}}>{c.label}</div>
              <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(18), color: v.t.colors.muted}}>{dead ? 'expired' : 'still warm'}</div>
            </At>
            <At x={cx} y={cy + R + v.s(34)} center style={{width: R * 3.2}}>
              <Chip v={v} text={c.sub ?? ''} on={on} color={v.a} size={v.s(v.vertical ? 24 : 24)} />
            </At>
            {verdict ? <At x={cx} y={cy + R + v.s(100)} center style={{width: v.vertical ? w * 0.9 : w * 0.44}}>
              <Cap v={v} title={verdict.label} sub={verdict.sub} size={v.vertical ? 24 : 24} on={arriveAt(frame, F(verdict.atWord))} color={col} />
            </At> : null}
          </React.Fragment>
        );
      })}
      {pause ? <At x={0} y={v.vertical ? h * 0.9 : h * 0.86} w={w}><Cap v={v} title={pause.label} sub={pause.sub} size={v.vertical ? 26 : 28}
        on={arriveAt(frame, F(pause.atWord))} /></At> : null}
    </div>
  );
};

/* ── BOARD ──────────────────────────────────────────────────────────────────────────────── */
// items: bin (label, text = bin id, color) xN · move (label, text = bin id) xN
export const Board: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const bins = pick(items, 'bin');
  const moves = pick(items, 'move');
  const nb = Math.max(1, bins.length);
  const bw = v.vertical ? w : (w - v.s(16) * (nb - 1)) / nb;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {bins.map((b, i) => {
        const c = b.color ? v.sem(b.color as any) : v.a;
        const on = arriveAt(frame, BASE(b.atWord) + stagger(i, 4));
        const mine = moves.filter((m) => m.text === b.text);
        const bx = v.vertical ? 0 : i * (bw + v.s(16));
        const by = v.vertical ? (h / nb) * i : 0;
        const bh = v.vertical ? h / nb - v.s(12) : h;
        return (
          <At key={i} x={bx} y={by} w={bw} h={bh} style={{opacity: on, borderRadius: v.rad(14), border: `${v.s(2)}px solid ${hexA(c, 0.7)}`,
            background: hexA(c, 0.05), padding: v.s(14), boxSizing: 'border-box'}}>
            <div style={{fontFamily: v.t.fonts.display, fontWeight: v.t.style.displayWeight as any, fontSize: v.s(v.vertical ? 24 : 22), color: c,
              marginBottom: v.s(12), lineHeight: 1.15}}>{b.label}</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: v.s(8), flexDirection: v.vertical ? 'row' : 'column'}}>
              {mine.map((m, j) => (
                <div key={j} style={{opacity: landAt(frame, F(m.atWord)), transform: `translateY(${(1 - arriveAt(frame, F(m.atWord))) * v.s(20)}px)`,
                  borderRadius: v.rad(6), padding: `${v.s(6)}px ${v.s(10)}px`, background: hexA(c, 0.16), border: `${v.s(1.5)}px solid ${hexA(c, 0.8)}`,
                  fontFamily: v.t.fonts.mono, fontSize: v.s(v.vertical ? 19 : 17), color: v.t.colors.text, whiteSpace: 'nowrap'}}>{m.label}</div>
              ))}
            </div>
          </At>
        );
      })}
    </div>
  );
};
