import React from 'react';
import {useCurrentFrame} from 'remotion';
import {hexA} from './ui';
import {arriveAt, travelAt, landAt, stagger} from './motion/system';
import {F, BASE, useV, TokVizProps, pick, one, Cap, Chip, At, partColor, clamp01, lerp} from './tokVizKit';

/*
 * TOK depictions, batch 2 — the twelve commands.
 *
 *   press    a long scroll of messages pressed down by a plate into one summary card; the keep-list survives
 *   rewind   two lanes: /rewind snips the timeline back to a turn that is already cached; /compact writes a new block
 *   window   two sawtooth curves of context size over a session; the shaded area is what gets re-sent
 *   fan      a vague question fans out into file reads; the @-mention is one straight line to one file
 *   twice    the same file pasted twice rides along twice on every later turn
 *   seal     a model badge wearing a cache seal: the effort dial turns and the seal holds; a model swap breaks it
 *   clock    a clock that fires on its interval, and every fire carries the whole stack
 *   trips    a courier: CLAUDE.md rides on every trip, a skill only on the trip that needs it
 */

/* ── PRESS ──────────────────────────────────────────────────────────────────────────────── */
// items: msg (label) xN · plate (label = the /compact command) · keep (label) xN · before (label) · after (label)
export const Press: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const msgs = pick(items, 'msg');
  const keeps = pick(items, 'keep');
  const plate = one(items, 'plate'), before = one(items, 'before'), after = one(items, 'after');
  const press = plate ? travelAt(frame, F(plate.atWord), 30) : 0;
  const colX = w * (v.vertical ? 0.08 : 0.08), colW = w * (v.vertical ? 0.84 : 0.4);
  const top = h * 0.1, fullH = h * 0.78;
  const rowH = Math.min(v.s(56), (fullH - v.s(10)) / Math.max(1, msgs.length));
  const stackH = lerp(rowH * msgs.length, rowH * 1.6, press);
  const cardX = w * (v.vertical ? 0.08 : 0.56), cardW = w * (v.vertical ? 0.84 : 0.38);
  const cardY = v.vertical ? h * 0.56 : top + fullH * 0.3;
  const cardOn = arriveAt(frame, F(plate?.atWord) + 26, 16);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* the plate coming down */}
      <At x={colX - v.s(10)} y={top - v.s(24) + (rowH * msgs.length - stackH)} w={colW + v.s(20)} h={v.s(16)}
        style={{background: v.a, borderRadius: v.s(6), opacity: arriveAt(frame, F(plate?.atWord) - 10), boxShadow: v.glow(v.a, 20)}}>
        <div style={{position: 'absolute', bottom: v.s(22), left: 0, right: 0}}><Chip v={v} text={plate?.label ?? '/compact'}
          on={arriveAt(frame, F(plate?.atWord) - 10)} color={v.a} size={v.s(v.vertical ? 24 : 22)} solid /></div>
      </At>
      {msgs.map((m, i) => {
        const on = arriveAt(frame, BASE(m.atWord) + stagger(i, 2));
        const y = top + (rowH * msgs.length - stackH) + i * (stackH / msgs.length);
        const kept = keeps.some((k) => k.text === m.label);
        return (
          <At key={i} x={colX} y={y} w={colW} h={Math.max(v.s(3), stackH / msgs.length - v.s(4))} style={{opacity: on * (1 - press * 0.5),
            borderRadius: v.rad(6), overflow: 'hidden', background: hexA(kept ? v.sem('green') : partColor(v, 'history'), 0.2),
            border: `${v.s(1.5)}px solid ${hexA(kept ? v.sem('green') : partColor(v, 'history'), 0.6)}`}}>
            <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(v.vertical ? 20 : 18), color: v.t.colors.text, padding: `0 ${v.s(12)}px`,
              lineHeight: `${rowH - v.s(4)}px`, whiteSpace: 'nowrap', opacity: 1 - press}}>{m.label}</div>
          </At>
        );
      })}
      {/* the summary card: what came out, and what was kept */}
      <At x={cardX} y={cardY} w={cardW} style={{opacity: cardOn}}>
        <div style={{borderRadius: v.rad(14), padding: v.s(22), border: `${v.s(2.5)}px solid ${hexA(v.sem('green'), 0.9)}`,
          background: hexA(v.sem('green'), 0.08)}}>
          <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(16), color: v.t.colors.muted, marginBottom: v.s(12)}}>SUMMARY · kept</div>
          {keeps.map((k, i) => (
            <div key={i} style={{display: 'flex', gap: v.s(10), marginBottom: v.s(10), opacity: arriveAt(frame, F(k.atWord))}}>
              <span style={{color: v.sem('green'), fontFamily: v.t.fonts.mono, fontSize: v.s(22)}}>✓</span>
              <span style={{fontFamily: v.t.fonts.body, fontSize: v.s(v.vertical ? 26 : 24), color: v.t.colors.text}}>{k.label}</span>
            </div>
          ))}
        </div>
      </At>
      <At x={cardX} y={v.vertical ? h * 0.9 : top + fullH * 0.82} w={cardW} style={{display: 'flex', gap: v.s(18), alignItems: 'center'}}>
        {before ? <Chip v={v} text={before.label ?? ''} on={arriveAt(frame, F(before.atWord))} color={v.sem('red')} size={v.s(26)} /> : null}
        {after ? <><span style={{fontFamily: v.t.fonts.mono, fontSize: v.s(28), color: v.t.colors.muted, opacity: arriveAt(frame, F(after.atWord))}}>→</span>
          <Chip v={v} text={after.label ?? ''} on={landAt(frame, F(after.atWord))} color={v.sem('green')} size={v.s(30)} solid /></> : null}
      </At>
    </div>
  );
};

/* ── REWIND ─────────────────────────────────────────────────────────────────────────────── */
// items: turn (label) xN · cut (text = index of the last turn kept, label = the rewind lane's verdict) ·
//        rebuild (label = the compact lane's verdict) · lane (label) x2
export const Rewind: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const turns = pick(items, 'turn');
  const lanes = pick(items, 'lane');
  const cut = one(items, 'cut'), rebuild = one(items, 'rebuild');
  const n = Math.max(1, turns.length);
  const keep = Number(cut?.text ?? n);
  const x0 = w * (v.vertical ? 0.04 : 0.2), lw = w * (v.vertical ? 0.92 : 0.76);
  const tw = lw / n;
  const laneY = [h * (v.vertical ? 0.14 : 0.16), h * (v.vertical ? 0.56 : 0.58)];
  const cutOn = cut ? travelAt(frame, F(cut.atWord), 24) : 0;
  const rbOn = rebuild ? travelAt(frame, F(rebuild.atWord), 28) : 0;
  const blue = partColor(v, 'cached'), red = v.sem('red');
  const bh = v.s(v.vertical ? 80 : 84);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {laneY.map((ly, L) => (
        <React.Fragment key={L}>
          <At x={v.vertical ? x0 : w * 0.02} y={v.vertical ? ly - v.s(56) : ly + bh / 2} w={v.vertical ? lw : w * 0.16}
            style={{transform: v.vertical ? undefined : 'translateY(-50%)'}}>
            <Cap v={v} title={lanes[L]?.label} sub={lanes[L]?.sub} align="left" size={v.vertical ? 30 : 30} mono
              on={arriveAt(frame, BASE(lanes[L]?.atWord))} color={L === 0 ? blue : v.sem('orange')} />
          </At>
          {turns.map((t, i) => {
            const on = arriveAt(frame, BASE(t.atWord) + stagger(i, 3));
            const dropped = L === 0 && i >= keep ? cutOn : 0;
            const squash = L === 1 ? rbOn : 0;
            const x = L === 1 ? lerp(x0 + i * tw, x0 + (i / n) * tw * 1.4, squash) : x0 + i * tw;
            const ww = L === 1 ? lerp(tw - v.s(6), tw * 1.4 / n, squash) : tw - v.s(6);
            return (
              <At key={i} x={x} y={ly + dropped * v.s(120)} w={ww} h={bh} style={{opacity: on * (1 - dropped),
                borderRadius: v.rad(8), background: hexA(L === 0 && i < keep && cutOn > 0.3 ? blue : partColor(v, 'history'), 0.3),
                border: `${v.s(2)}px solid ${hexA(L === 0 && i < keep && cutOn > 0.3 ? blue : partColor(v, 'history'), 0.8)}`,
                transform: `rotate(${dropped * (i % 2 ? 12 : -10)}deg)`}}>
                <div style={{textAlign: 'center', lineHeight: `${bh}px`, fontFamily: v.t.fonts.mono, fontSize: v.s(18), color: v.t.colors.text,
                  opacity: 1 - squash, whiteSpace: 'nowrap', overflow: 'hidden'}}>{t.label}</div>
              </At>
            );
          })}
        </React.Fragment>
      ))}
      {/* rewind: the snip, and the kept part turning blue (still cached) */}
      {cut ? <>
        <At x={x0 + keep * tw - v.s(3)} y={laneY[0] - v.s(24)} w={v.s(6)} h={bh + v.s(48)} style={{background: blue, opacity: cutOn, boxShadow: v.glow(blue, 16)}} />
        <At x={x0} y={laneY[0] + bh + v.s(22)} w={lw}><Cap v={v} title={cut.label} sub={cut.sub} align="left" size={v.vertical ? 26 : 26}
          on={arriveAt(frame, F(cut.atWord) + 14)} color={blue} /></At>
      </> : null}
      {/* compact: the whole history squashed into a block that has to be written fresh */}
      {rebuild ? <>
        <At x={x0 + tw * 1.6} y={laneY[1]} w={tw * 1.6} h={bh} style={{opacity: rbOn, borderRadius: v.rad(8), background: hexA(red, 0.25),
          border: `${v.s(2.5)}px solid ${red}`, boxShadow: v.glow(red, 14)}}>
          <div style={{textAlign: 'center', lineHeight: `${bh}px`, fontFamily: v.t.fonts.mono, fontSize: v.s(18), color: v.t.colors.text}}>summary</div>
        </At>
        <At x={x0} y={laneY[1] + bh + v.s(22)} w={lw}><Cap v={v} title={rebuild.label} sub={rebuild.sub} align="left" size={v.vertical ? 26 : 26}
          on={arriveAt(frame, F(rebuild.atWord) + 14)} color={red} /></At>
      </> : null}
    </div>
  );
};

/* ── WINDOW ─────────────────────────────────────────────────────────────────────────────── */
// items: limit (value = the window in k, label) x2 · axis (value = the chart's top in k) · note (label)
// The work is the same in both rows: context grows by the same step each turn. The only difference is where
// it compacts back down, and the shaded area under each curve is what gets re-sent.
export const Window: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const limits = pick(items, 'limit');
  const axis = one(items, 'axis')?.value ?? 1000;
  const note = one(items, 'note');
  const rows = limits.length || 1;
  const x0 = w * 0.16, pw = w * 0.8;
  const rowH = (h * 0.8) / rows;
  const turns = 60, grow = axis / 42, floorK = axis * 0.06;
  const series = (limitK: number) => {
    const out: number[] = []; let c = floorK;
    for (let i = 0; i < turns; i++) { out.push(c); c += grow; if (c > limitK) c = floorK + grow * 2; }
    return out;
  };
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {limits.map((L, r) => {
        const y0 = h * 0.04 + r * rowH, ph = rowH * 0.72;
        const s = series(L.value ?? axis);
        const draw = travelAt(frame, F(L.atWord), 60);
        const shown = Math.max(2, Math.round(turns * draw));
        const pts = s.slice(0, shown).map((k, i) => [x0 + (i / (turns - 1)) * pw, y0 + ph - (k / axis) * ph]);
        const area = `M${x0},${y0 + ph} ` + pts.map((p) => `L${p[0]},${p[1]}`).join(' ') + ` L${pts[pts.length - 1][0]},${y0 + ph} Z`;
        const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
        const c = r === 0 ? v.sem('red') : v.sem('green');
        const limY = y0 + ph - ((L.value ?? axis) / axis) * ph;
        const on = arriveAt(frame, BASE(L.atWord));
        return (
          <React.Fragment key={r}>
            <svg style={{position: 'absolute', inset: 0, overflow: 'visible'}} width={w} height={h}>
              <line x1={x0} y1={y0 + ph} x2={x0 + pw} y2={y0 + ph} stroke={hexA(v.t.colors.muted, 0.5)} strokeWidth={v.s(2)} opacity={on} />
              <line x1={x0} y1={limY} x2={x0 + pw} y2={limY} stroke={c} strokeWidth={v.s(2)} strokeDasharray={`${v.s(8)} ${v.s(6)}`} opacity={on} />
              <path d={area} fill={hexA(c, 0.22)} />
              <path d={line} fill="none" stroke={c} strokeWidth={v.s(3)} />
            </svg>
            <At x={0} y={limY} w={x0 - v.s(14)} style={{transform: 'translateY(-50%)', opacity: on}}>
              <Cap v={v} title={L.label} sub={L.sub} align="right" size={v.vertical ? 24 : 22} mono color={c} />
            </At>
          </React.Fragment>
        );
      })}
      {note ? <At x={x0} y={h * 0.9} w={pw}><Cap v={v} title={note.label} sub={note.sub} size={v.vertical ? 26 : 24}
        on={arriveAt(frame, F(note.atWord))} /></At> : null}
    </div>
  );
};

/* ── FAN ────────────────────────────────────────────────────────────────────────────────── */
// items: ask (label, text = 'vague' | 'mention') x2 · file (label) xN · read (text = file label, sub = 'vague') xN ·
//        hit (text = file label) · tally (text = 'vague'|'mention', label) x2
export const Fan: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const asks = pick(items, 'ask');
  const files = pick(items, 'file');
  const reads = pick(items, 'read');
  const hit = one(items, 'hit');
  const tallies = pick(items, 'tally');
  const half = v.vertical ? 0 : w / 2;
  const panes = [{x: 0, y: 0, w: v.vertical ? w : w / 2 - v.s(20), h: v.vertical ? h / 2 : h},
                 {x: v.vertical ? 0 : half + v.s(20), y: v.vertical ? h / 2 : 0, w: v.vertical ? w : w / 2 - v.s(20), h: v.vertical ? h / 2 : h}];
  const red = v.sem('red'), green = v.sem('green');
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {panes.map((p, k) => {
        const ask = asks[k];
        const isMention = ask?.text === 'mention';
        const on = arriveAt(frame, BASE(ask?.atWord));
        const qx = p.x + p.w * 0.5, qy = p.y + p.h * 0.12;
        const fy = p.y + p.h * 0.62;
        const n = Math.max(1, files.length);
        const fx = (i: number) => p.x + p.w * (0.08 + (0.84 * (i + 0.5)) / n);
        const c = isMention ? green : red;
        const tally = tallies.find((t) => t.text === ask?.text);
        return (
          <React.Fragment key={k}>
            <svg style={{position: 'absolute', inset: 0, overflow: 'visible'}} width={w} height={h}>
              {files.map((f, i) => {
                const r = isMention ? (hit?.text === f.label ? hit : undefined) : reads.find((rr) => rr.text === f.label);
                if (!r) return null;
                const d = travelAt(frame, F(r.atWord), 16);
                const x2 = lerp(qx, fx(i), d), y2 = lerp(qy + v.s(40), fy - v.s(30), d);
                return <line key={i} x1={qx} y1={qy + v.s(40)} x2={x2} y2={y2} stroke={c} strokeWidth={v.s(isMention ? 5 : 3)} opacity={0.85} />;
              })}
            </svg>
            <At x={qx} y={qy} center style={{width: p.w * 0.9, opacity: on}}>
              <div style={{borderRadius: v.rad(12), padding: v.s(14), border: `${v.s(2)}px solid ${hexA(c, 0.8)}`, background: hexA(c, 0.08)}}>
                <Cap v={v} title={ask?.label} sub={ask?.sub} size={v.vertical ? 24 : 24} mono={isMention} />
              </div>
            </At>
            {files.map((f, i) => {
              const touched = isMention ? hit?.text === f.label && frame >= F(hit?.atWord) + 10
                : reads.some((rr) => rr.text === f.label && frame >= F(rr.atWord) + 10);
              return (
                <At key={i} x={fx(i)} y={fy} center style={{opacity: arriveAt(frame, BASE(f.atWord)), width: p.w / n * 0.92}}>
                  <div style={{borderRadius: v.rad(8), padding: `${v.s(12)}px ${v.s(4)}px`, textAlign: 'center',
                    border: `${v.s(2)}px solid ${hexA(touched ? c : v.t.colors.muted, touched ? 0.9 : 0.35)}`,
                    background: hexA(touched ? c : v.t.colors.muted, touched ? 0.16 : 0.04)}}>
                    <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(v.vertical ? 16 : 15), color: v.t.colors.text, wordBreak: 'break-all'}}>{f.label}</div>
                  </div>
                </At>
              );
            })}
            {tally ? <At x={p.x} y={p.y + p.h * 0.8} w={p.w}><Cap v={v} title={tally.label} sub={tally.sub} size={v.vertical ? 30 : 30}
              on={landAt(frame, F(tally.atWord))} color={c} /></At> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ── TWICE ──────────────────────────────────────────────────────────────────────────────── */
// items: turn (label) xN · paste (text = turn index where the file is pasted, label = file name) x2 · note (label)
export const Twice: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const turns = pick(items, 'turn');
  const pastes = pick(items, 'paste');
  const note = one(items, 'note');
  const n = Math.max(1, turns.length);
  const x0 = w * 0.04, cw = (w * 0.92) / n;
  const floorY = h * 0.78;
  const unit = Math.min(v.s(56), (h * 0.62) / (n + 2));
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {turns.map((t, i) => {
        const on = arriveAt(frame, BASE(t.atWord) + stagger(i, 4));
        const x = x0 + i * cw + cw * 0.1;
        const bw = cw * 0.8;
        // history blocks: one per earlier turn, plus a file block for every paste at or before this turn
        const blocks: {label: string; file: boolean; dup: boolean}[] = [];
        for (let j = 0; j <= i; j++) {
          blocks.push({label: '', file: false, dup: false});
          pastes.forEach((p, k) => { if (Number(p.text) === j) blocks.push({label: p.label ?? 'file', file: true, dup: k > 0}); });
        }
        let y = floorY;
        return (
          <React.Fragment key={i}>
            {blocks.map((b, j) => {
              const bh = b.file ? unit * 1.6 : unit * 0.55;
              y -= bh + v.s(3);
              const c = b.file ? (b.dup ? v.sem('red') : v.sem('orange')) : partColor(v, 'history');
              const pOn = b.file ? arriveAt(frame, F(pastes[b.dup ? 1 : 0]?.atWord)) : 1;
              return (
                <At key={j} x={x} y={y} w={bw} h={bh} style={{opacity: on * pOn, borderRadius: v.rad(6), background: hexA(c, b.file ? 0.28 : 0.2),
                  border: `${v.s(b.dup ? 2.5 : 1.5)}px solid ${hexA(c, 0.85)}`}}>
                  {b.file ? <div style={{textAlign: 'center', lineHeight: `${bh}px`, fontFamily: v.t.fonts.mono, fontSize: Math.min(v.s(16), bw / 10),
                    color: v.t.colors.text, whiteSpace: 'nowrap', overflow: 'hidden'}}>{b.label}{b.dup ? ' ×2' : ''}</div> : null}
                </At>
              );
            })}
            <At x={x} y={floorY + v.s(12)} w={bw}><Cap v={v} title={t.label} size={v.vertical ? 20 : 20} mono on={on} /></At>
          </React.Fragment>
        );
      })}
      {note ? <At x={x0} y={h * 0.9} w={w * 0.92}><Cap v={v} title={note.label} sub={note.sub} size={v.vertical ? 26 : 26}
        on={arriveAt(frame, F(note.atWord))} /></At> : null}
    </div>
  );
};

/* ── SEAL ───────────────────────────────────────────────────────────────────────────────── */
// items: model (label = current model) · level (label) xN (effort levels) · set (text = level label, label = note) ·
//        swap (label = new model, sub) · kept (label) · broken (label)
export const Seal: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const model = one(items, 'model'), set = one(items, 'set'), swap = one(items, 'swap');
  const kept = one(items, 'kept'), broken = one(items, 'broken');
  const levels = pick(items, 'level');
  const blue = partColor(v, 'cached'), red = v.sem('red');
  const on = arriveAt(frame, BASE(model?.atWord));
  const swapOn = swap ? travelAt(frame, F(swap.atWord), 24) : 0;
  const idxSet = set ? Math.max(0, levels.findIndex((l) => l.label === set.text)) : 0;
  const turn = set ? travelAt(frame, F(set.atWord), 26) : 0;
  const from = Math.max(0, levels.findIndex((l) => l.text === 'default'));
  const ang = (i: number) => -120 + (i / Math.max(1, levels.length - 1)) * 240;
  const a = lerp(ang(from), ang(idxSet), turn);
  const bx = w * (v.vertical ? 0.5 : 0.3), by = h * (v.vertical ? 0.24 : 0.42);
  const dx = w * (v.vertical ? 0.5 : 0.72), dy = h * (v.vertical ? 0.66 : 0.44), dR = v.s(v.vertical ? 150 : 150);
  const badgeW = v.s(v.vertical ? 380 : 360);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* the model badge, with its cache seal */}
      <At x={bx} y={by} center style={{width: badgeW, opacity: on}}>
        <div style={{position: 'relative', borderRadius: v.rad(18), padding: v.s(28), textAlign: 'center',
          border: `${v.s(3)}px solid ${hexA(v.a, 0.9)}`, background: hexA(v.a, 0.1)}}>
          <div style={{opacity: 1 - swapOn, position: swapOn > 0.5 ? 'absolute' : 'relative', left: 0, right: 0}}>
            <Cap v={v} title={model?.label} sub={model?.sub} size={v.vertical ? 40 : 40} /></div>
          {swap ? <div style={{opacity: swapOn, position: swapOn > 0.5 ? 'relative' : 'absolute', left: 0, right: 0, top: v.s(28)}}>
            <Cap v={v} title={swap.label} sub={swap.sub} size={v.vertical ? 40 : 40} color={red} /></div> : null}
          {/* the seal */}
          <div style={{position: 'absolute', right: -v.s(34), top: -v.s(34), width: v.s(92), height: v.s(92), borderRadius: v.s(92),
            border: `${v.s(4)}px solid ${swapOn > 0.4 ? red : blue}`, background: hexA(swapOn > 0.4 ? red : blue, 0.18),
            display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${swapOn * 30}deg) scale(${1 + swapOn * 0.1})`,
            fontFamily: v.t.fonts.mono, fontSize: v.s(16), color: v.t.colors.text, textAlign: 'center', lineHeight: 1.05}}>
            {swapOn > 0.4 ? 'cache\nbroken' : 'cache\nkept'}
          </div>
        </div>
      </At>
      {/* the effort dial */}
      <At x={dx - dR} y={dy - dR} w={dR * 2} h={dR * 2} style={{opacity: arriveAt(frame, BASE(levels[0]?.atWord)),
        borderRadius: dR * 2, border: `${v.s(3)}px solid ${hexA(v.sem('green'), 0.8)}`, background: hexA(v.sem('green'), 0.05)}}>
        {levels.map((l, i) => {
          const rad = (ang(i) - 90) * Math.PI / 180;
          return <div key={i} style={{position: 'absolute', left: dR + Math.cos(rad) * dR * 1.26, top: dR + Math.sin(rad) * dR * 1.26,
            transform: 'translate(-50%,-50%)', fontFamily: v.t.fonts.mono, fontSize: v.s(v.vertical ? 22 : 20),
            color: i === idxSet && turn > 0.5 ? v.sem('green') : v.t.colors.muted, whiteSpace: 'nowrap'}}>{l.label}</div>;
        })}
        <div style={{position: 'absolute', left: '50%', top: '50%', width: v.s(6), height: dR * 0.82, marginLeft: -v.s(3),
          transformOrigin: '50% 100%', transform: `translateY(-100%) rotate(${a}deg)`, background: v.sem('green'), borderRadius: v.s(4),
          boxShadow: v.glow(v.sem('green'), 12)}} />
        <div style={{position: 'absolute', left: '50%', top: '50%', width: v.s(24), height: v.s(24), margin: -v.s(12), borderRadius: v.s(24), background: v.sem('green')}} />
        <div style={{position: 'absolute', top: dR * 2 + v.s(34), left: -v.s(120), right: -v.s(120)}}>
          <Cap v={v} title="/effort" sub={set?.label} size={v.vertical ? 26 : 24} mono color={v.sem('green')} on={1} />
        </div>
      </At>
      {kept ? <At x={bx} y={by + v.s(140)} center style={{width: w * (v.vertical ? 0.9 : 0.46)}}><Cap v={v} title={kept.label} sub={kept.sub}
        on={arriveAt(frame, F(kept.atWord)) * (1 - swapOn)} size={v.vertical ? 26 : 24} color={blue} /></At> : null}
      {broken ? <At x={bx} y={by + v.s(140)} center style={{width: w * (v.vertical ? 0.9 : 0.46)}}><Cap v={v} title={broken.label} sub={broken.sub}
        on={arriveAt(frame, F(broken.atWord))} size={v.vertical ? 26 : 24} color={red} /></At> : null}
    </div>
  );
};

/* ── CLOCK ──────────────────────────────────────────────────────────────────────────────── */
// items: interval (value = minutes, label) · stack (label = what each fire carries) · fire (label) xN · result (label)
export const Clock: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const interval = one(items, 'interval'), stack = one(items, 'stack'), result = one(items, 'result');
  const fires = pick(items, 'fire');
  const cx = w * (v.vertical ? 0.5 : 0.24), cy = h * (v.vertical ? 0.26 : 0.46), R = Math.min(w, h) * (v.vertical ? 0.2 : 0.3);
  const on = arriveAt(frame, BASE(interval?.atWord));
  const spin = fires.length ? clamp01((frame - F(fires[0].atWord)) / Math.max(1, F(fires[fires.length - 1].atWord) + 30 - F(fires[0].atWord))) : 0;
  const hand = spin * 360 * Math.max(1, fires.length);
  const laneX = w * (v.vertical ? 0.06 : 0.5), laneW = w * (v.vertical ? 0.88 : 0.46);
  const laneY = h * (v.vertical ? 0.54 : 0.1);
  const rowH = Math.min(v.s(78), (h * (v.vertical ? 0.36 : 0.66)) / Math.max(1, fires.length));
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <At x={cx - R} y={cy - R} w={R * 2} h={R * 2} style={{opacity: on, borderRadius: R * 2, border: `${v.s(4)}px solid ${hexA(v.a, 0.9)}`,
        background: hexA(v.a, 0.06)}}>
        {Array.from({length: 12}).map((_, i) => (
          <div key={i} style={{position: 'absolute', left: R - v.s(2), top: v.s(8), width: v.s(4), height: v.s(i % 3 ? 12 : 22),
            background: hexA(v.t.colors.muted, 0.8), transformOrigin: `${v.s(2)}px ${R - v.s(8)}px`, transform: `rotate(${i * 30}deg)`}} />
        ))}
        <div style={{position: 'absolute', left: R - v.s(3), top: R * 0.2, width: v.s(6), height: R * 0.8, background: v.a, borderRadius: v.s(4),
          transformOrigin: `${v.s(3)}px ${R * 0.8}px`, transform: `rotate(${hand}deg)`, boxShadow: v.glow(v.a, 12)}} />
        <div style={{position: 'absolute', left: R - v.s(12), top: R - v.s(12), width: v.s(24), height: v.s(24), borderRadius: v.s(24), background: v.a}} />
      </At>
      <At x={cx} y={cy + R + v.s(20)} center style={{width: R * 3}}><Cap v={v} title={interval?.label} sub={interval?.sub} size={v.vertical ? 30 : 28}
        on={on} mono /></At>
      {fires.map((f, i) => {
        const fo = travelAt(frame, F(f.atWord), 18);
        return (
          <At key={i} x={laneX} y={laneY + i * rowH} w={laneW} h={rowH - v.s(8)} style={{opacity: fo, display: 'flex', alignItems: 'center', gap: v.s(14)}}>
            <span style={{fontFamily: v.t.fonts.mono, fontSize: v.s(20), color: v.t.colors.muted, width: v.s(130), flex: 'none'}}>{f.label}</span>
            <div style={{flex: 1, height: '70%', borderRadius: v.rad(6), background: hexA(v.a, 0.25), border: `${v.s(1.5)}px solid ${hexA(v.a, 0.8)}`,
              transform: `translateX(${(1 - fo) * -v.s(60)}px)`, display: 'flex', alignItems: 'center', paddingLeft: v.s(12),
              fontFamily: v.t.fonts.mono, fontSize: v.s(17), color: v.t.colors.text, whiteSpace: 'nowrap', overflow: 'hidden'}}>{stack?.label}</div>
          </At>
        );
      })}
      {result ? <At x={laneX} y={v.vertical ? h * 0.93 : h * 0.84} w={laneW}><Cap v={v} title={result.label} sub={result.sub} align="left"
        size={v.vertical ? 26 : 26} on={landAt(frame, F(result.atWord))} color={v.sem('orange')} /></At> : null}
    </div>
  );
};

/* ── TRIPS ──────────────────────────────────────────────────────────────────────────────── */
// items: trip (label = what the session was for) xN · md (label, value k) · skill (label, value k, text = trip label that loads it) ·
//        stub (label = the one-line description that is always present) · note (label)
export const Trips: React.FC<TokVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const trips = pick(items, 'trip');
  const md = one(items, 'md'), skill = one(items, 'skill'), note = one(items, 'note'), stub = one(items, 'stub');
  const n = Math.max(1, trips.length);
  const x0 = w * 0.04, cw = (w * 0.92) / n;
  const maxK = Math.max(1, (md?.value ?? 0) + (skill?.value ?? 0));
  const floorY = h * 0.72, top = h * 0.12;
  const kPx = (floorY - top) / maxK * 0.9;
  const mdOn = arriveAt(frame, F(md?.atWord));
  const skOn = arriveAt(frame, F(skill?.atWord));
  const orange = partColor(v, 'memory'), yellow = partColor(v, 'skills');
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <At x={x0} y={floorY} w={w * 0.92} h={v.s(3)} style={{background: hexA(v.t.colors.muted, 0.5)}} />
      {trips.map((t, i) => {
        const on = arriveAt(frame, BASE(t.atWord) + stagger(i, 4));
        const x = x0 + i * cw + cw * 0.14, bw = cw * 0.72;
        const needs = skill?.text === t.label;
        const mdH = (md?.value ?? 0) * kPx * mdOn;
        const skH = needs ? (skill?.value ?? 0) * kPx * skOn : v.s(8) * skOn;
        return (
          <React.Fragment key={i}>
            <At x={x} y={floorY - mdH} w={bw} h={mdH} style={{opacity: on, background: hexA(orange, 0.35), borderTop: `${v.s(2)}px solid ${orange}`}}>
              {i === 0 ? <div style={{position: 'absolute', top: v.s(8), left: 0, right: 0, textAlign: 'center', fontFamily: v.t.fonts.mono,
                fontSize: v.s(16), color: v.t.colors.text, opacity: mdOn}}>{md?.label}</div> : null}
            </At>
            <At x={x} y={floorY - mdH - skH - v.s(4)} w={bw} h={skH} style={{opacity: on, background: hexA(yellow, needs ? 0.45 : 0.3),
              borderTop: `${v.s(2)}px solid ${yellow}`}}>
              {needs ? <div style={{position: 'absolute', top: v.s(6), left: 0, right: 0, textAlign: 'center', fontFamily: v.t.fonts.mono,
                fontSize: v.s(15), color: v.t.colors.text}}>{skill?.label}</div> : null}
            </At>
            <At x={x - cw * 0.05} y={floorY + v.s(14)} w={bw + cw * 0.1}><Cap v={v} title={t.label} size={v.vertical ? 20 : 19} on={on} /></At>
          </React.Fragment>
        );
      })}
      {stub ? <At x={x0} y={top - v.s(70)} w={w * 0.92}><Cap v={v} title={stub.label} sub={stub.sub} align="left" size={v.vertical ? 22 : 20}
        on={arriveAt(frame, F(stub.atWord))} color={yellow} /></At> : null}
      {note ? <At x={x0} y={h * 0.88} w={w * 0.92}><Cap v={v} title={note.label} sub={note.sub} size={v.vertical ? 26 : 24}
        on={arriveAt(frame, F(note.atWord))} /></At> : null}
    </div>
  );
};
