import React from 'react';
import {Img, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {useTheme, wordToFrame} from './themes';
import {SemColor, O55StageItem} from './types';
import {useScale, useSem, hexA} from './ui';
import {AssetIcon} from './AssetIcon';
import {UnknownKind} from './unknownKind';
import {arriveAt, travelAt, landAt} from './motion/system';

/**
 * Claude Opus 5.5 depictions — the drawn beats of the release video.
 *
 * WHY A NEW FILE (LAW 0e.8, LAW 0n). Every beat here is an ARITHMETIC beat — a score, a
 * price, a percentage — and arithmetic beats are the ones that quietly default to a card,
 * because a card can hold any number. So each one names its object first: a board with
 * model pucks on it, a podium somebody else is standing on, a pair of callipers closing,
 * a rack of swinging price tags, a turnstile counting cached tokens, a thread on a phone,
 * three switches being thrown. If the labels could be swapped for lorem and the picture
 * still made sense, it would be a card — none of these survive that swap.
 *
 * EVERY MOMENT COMES FROM A WORD (LAW 0i). No fixed intervals: each element resolves its
 * own frame from its own `atWord` through `F()`, so rewriting the narration re-times the
 * picture with no code change.
 *
 * EVERY NUMBER IS AUTHORED, NEVER COMPUTED HERE (LAW 0m.2). The components draw what the
 * spec passes; the spec's figures come from anthropic.com/claude-opus-5-5 and from
 * artificialanalysis.ai, and the builder carries the source beside each one.
 */

const F = (w?: number) => (w == null ? 0 : wordToFrame(w));
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const useV = (accent: SemColor) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  return {
    t, sem, scale, vertical,
    a: sem(accent),
    s: (n: number) => n * scale,
    rad: (n = 12) => n * scale * t.style.cornerRadius,
    glow: (c: string, n = 24) => (t.style.glow > 0 ? `0 0 ${n * scale * t.style.glow}px ${hexA(c, 0.55)}` : 'none'),
  };
};
type V = ReturnType<typeof useV>;

export interface O55VizProps {items: O55StageItem[]; accent: SemColor; token?: string; w: number; h: number}

/** A caption that belongs to an object — never a box around it. */
const Cap: React.FC<{v: V; title?: string; sub?: string; on?: number; align?: 'left' | 'center' | 'right'; size?: number; color?: string}> =
  ({v, title, sub, on = 1, align = 'center', size = 28, color}) => (
    <div style={{textAlign: align, opacity: on, transform: `translateY(${(1 - on) * v.s(10)}px)`}}>
      {title ? <div style={{fontFamily: v.t.fonts.display, fontWeight: v.t.style.displayWeight as any,
        letterSpacing: v.t.style.displayTracking, fontSize: v.s(size), lineHeight: 1.12,
        color: color ?? v.t.colors.text}}>{title}</div> : null}
      {sub ? <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(size * 0.6), lineHeight: 1.35,
        color: v.t.colors.muted, marginTop: v.s(5)}}>{sub}</div> : null}
    </div>
  );

/** A model puck: the thing that moves on the board, the podium and the switchboard. */
const Puck: React.FC<{v: V; label?: string; sub?: string; size: number; lit?: boolean; color?: string}> =
  ({v, label, sub, size, lit, color}) => {
    const c = color ?? (lit ? v.a : v.t.colors.muted);
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: v.s(10),
        padding: `${size * 0.22}px ${size * 0.34}px`, borderRadius: v.rad(999),
        background: lit ? hexA(c, 0.16) : hexA(v.t.colors.muted, 0.09),
        border: `${Math.max(1, v.s(lit ? 2 : 1))}px solid ${hexA(c, lit ? 0.9 : 0.4)}`,
        boxShadow: lit ? v.glow(c, 18) : 'none', whiteSpace: 'nowrap'}}>
        <span style={{width: size * 0.3, height: size * 0.3, borderRadius: '50%', background: c,
          boxShadow: lit ? v.glow(c, 12) : 'none'}} />
        <span style={{fontFamily: v.t.fonts.display, fontWeight: v.t.style.displayWeight as any,
          fontSize: size * 0.56, color: lit ? v.t.colors.text : v.t.colors.muted}}>{label}</span>
        {sub ? <span style={{fontFamily: v.t.fonts.mono, fontSize: size * 0.44, color: hexA(c, 0.95)}}>{sub}</span> : null}
      </div>
    );
  };

// ── 1. LADDER — the whole release as one move on a board ──────────────────────────────
//
// Two axes a viewer already understands: how much it can do (up) and what it costs to run
// (right). The models are pucks ON the board, and the new one does not appear where it
// belongs — it TRAVELS there, up from the old flagship and left past the expensive one, so
// the flip is a movement rather than a claim. `value` is the x fraction (cost), `detail` is
// parsed as the y fraction (capability); both are authored from published figures.
const Ladder: React.FC<O55VizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  // SIZED FROM THE PANE, NOT FROM A CONSTANT. The first draft set every dimension in
  // v.s() units, which is a guess at how much room there will be — and the still showed
  // a board of thumbnail pucks floating in a pane twice their height (LAW 0n: the CONST
  // must never be the binding term).
  const pad = {l: Math.max(v.s(84), w * 0.085), r: w * 0.05, t: h * 0.05, b: h * 0.14};
  const bw = w - pad.l - pad.r, bh = h - pad.t - pad.b;
  const board = arriveAt(frame, 8);
  const pucks = items.filter((i) => i.value != null);
  // `text` names a puck's ROLE on the board: 'from' is where the new model starts,
  // 'moves' is the new model itself. `detail` is always the figure it carries, so the
  // role never has to share a field with the number (the field-collision that made the
  // first draft of this picture need post-processing in the builder).
  const mover = items.find((i) => i.text === 'moves');
  const from = pucks.find((p) => p.text === 'from');
  const at = (x: number, y: number) => ({left: pad.l + x * bw, top: pad.t + (1 - y) * bh});
  const grid = [0.25, 0.5, 0.75];
  // The new model is drawn once, travelling from the old flagship's place to its own.
  const travel = mover ? travelAt(frame, F(mover.atWord), 46) : 0;
  const mx = mover && from ? (from.value ?? 0) + travel * ((mover.value ?? 0) - (from.value ?? 0)) : 0;
  const my = mover && from ? Number(from.sub ?? 0) + travel * (Number(mover.sub ?? 0) - Number(from.sub ?? 0)) : 0;
  return (
    <div style={{width: w, height: h, position: 'relative', opacity: board}}>
      {/* the board itself: two axes, named in words, not in units nobody reads */}
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={pad.t + (1 - g) * bh} x2={pad.l + bw} y2={pad.t + (1 - g) * bh}
              stroke={hexA(v.t.colors.panelBorder, 0.5)} strokeWidth={v.s(1)} />
            <line x1={pad.l + g * bw} y1={pad.t} x2={pad.l + g * bw} y2={pad.t + bh}
              stroke={hexA(v.t.colors.panelBorder, 0.5)} strokeWidth={v.s(1)} />
          </g>
        ))}
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + bh} stroke={hexA(v.t.colors.muted, 0.7)} strokeWidth={v.s(2)} />
        <line x1={pad.l} y1={pad.t + bh} x2={pad.l + bw} y2={pad.t + bh} stroke={hexA(v.t.colors.muted, 0.7)} strokeWidth={v.s(2)} />
      </svg>
      {/* the axis caption is rotated about its own centre and given the FULL height of the
          plot to run in, so it reads as one line instead of wrapping into the gutter */}
      <div style={{position: 'absolute', left: pad.l / 2 - bh / 2, top: pad.t + bh / 2 - v.s(14),
        width: bh, transform: 'rotate(-90deg)', transformOrigin: 'center', textAlign: 'center',
        fontFamily: v.t.fonts.mono, fontSize: v.s(19), letterSpacing: v.s(1.6), whiteSpace: 'nowrap',
        textTransform: 'uppercase', color: hexA(v.t.colors.muted, 0.9)}}>how much it can do ↑</div>
      <div style={{position: 'absolute', left: pad.l, top: pad.t + bh + v.s(34), width: bw, textAlign: 'center',
        fontFamily: v.t.fonts.mono, fontSize: v.s(19), letterSpacing: v.s(1.6), textTransform: 'uppercase',
        color: hexA(v.t.colors.muted, 0.9)}}>what it costs to run →</div>
      {/* the models already on the board */}
      {pucks.map((p, i) => {
        if (p === mover) return null;
        const on = arriveAt(frame, F(p.atWord));
        const pos = at(p.value ?? 0, Number(p.sub ?? 0));
        return (
          <div key={i} style={{position: 'absolute', left: pos.left, top: pos.top, transform: 'translate(-50%,-50%)',
            opacity: on * (p === from && travel > 0.15 ? 0.35 : 1)}}>
            <Puck v={v} label={p.label} sub={p.detail} size={Math.min(h * 0.075, v.s(44))} />
          </div>
        );
      })}
      {/* ...and the one that moves */}
      {mover && from ? (() => {
        const pos = at(mx, my);
        const lit = arriveAt(frame, F(mover.atWord) - 6);
        return (
          <>
            <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: travel > 0.02 ? 1 : 0}}>
              <line x1={at(from.value ?? 0, Number(from.sub ?? 0)).left} y1={at(from.value ?? 0, Number(from.sub ?? 0)).top}
                x2={pos.left} y2={pos.top} stroke={hexA(v.a, 0.5)} strokeWidth={v.s(2)} strokeDasharray={`${v.s(7)} ${v.s(7)}`} />
            </svg>
            <div style={{position: 'absolute', left: pos.left, top: pos.top, transform: 'translate(-50%,-50%)', opacity: lit}}>
              <Puck v={v} label={mover.label} sub={mover.detail} size={Math.min(h * 0.095, v.s(56))} lit />
            </div>
          </>
        );
      })() : null}
    </div>
  );
};

// ── 2. PODIUM — the two events it does NOT win ────────────────────────────────────────
//
// A win is easy to draw and a loss is the one nobody draws, so this is a real podium with
// somebody else on the top step. Bars grow from the floor on their own words; the taller
// one carries a small crown, and it is not ours.
const Podium: React.FC<O55VizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const events = items.filter((i) => i.detail === 'event');
  const cols = events.length || 1;
  // BOTH AXES BOUND A BAR, AND THE FLOOR FOLLOWS THE BARS. Capped against height alone a
  // one-event podium in 9:16 drew a 108px-wide column 880px tall — a sliver, not a podium —
  // and then stood it on a floor near the bottom with half the pane empty above it. The
  // tallest bar is bounded by the COLUMN's width, the bar's own width by that height, and
  // the floor rises so the group sits in the middle of the room it was given.
  const colW = w / Math.max(cols, 1);
  const maxH = Math.min(h - h * 0.26, colW * 0.62);
  const barW = Math.min(colW * 0.26, maxH * 0.38);
  const floorY = Math.min(h - h * 0.16, (h + maxH) / 2);
  const top = Math.max(1, ...items.filter((i) => i.value != null).map((i) => i.value!));
  return (
    <div style={{width: w, height: h, position: 'relative'}}>
      {events.map((ev, i) => {
        // A BAR JOINS ITS EVENT BY `group`, AND PRINTS `text`. The first draft used `text`
        // for both (so every bar rendered its event's NAME where its score belongs), and the
        // second used `sub` — which the gates read as words on screen. A join key is not text.
        const pair = items.filter((x) => x.group === ev.label);
        const cw = colW;
        const cx = i * cw + cw / 2;
        const on = arriveAt(frame, F(ev.atWord) - 8);
        return (
          <div key={i} style={{position: 'absolute', left: cx - cw / 2, top: 0, width: cw, height: h, opacity: on}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: floorY + v.s(22)}}>
              <Cap v={v} title={ev.label} sub={ev.text} size={26} />
            </div>
            <div style={{position: 'absolute', left: v.s(30), right: v.s(30), top: 0, height: floorY,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: v.s(26)}}>
              {pair.map((b, j) => {
                const grow = travelAt(frame, F(b.atWord), 34);
                const bh = maxH * ((b.value ?? 0) / top) * grow;
                const mine = b.detail !== 'rival';
                const c = mine ? v.a : v.sem('orange');
                const wins = pair.every((o) => (o.value ?? 0) <= (b.value ?? 0));
                return (
                  <div key={j} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: v.s(8)}}>
                    <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(26), color: hexA(c, 0.95),
                      opacity: grow > 0.6 ? 1 : 0}}>{b.text}</div>
                    <div style={{width: barW, height: bh, borderRadius: `${v.rad(8)}px ${v.rad(8)}px 0 0`,
                      background: `linear-gradient(180deg, ${hexA(c, 0.95)}, ${hexA(c, 0.35)})`,
                      boxShadow: wins ? v.glow(c, 22) : 'none',
                      border: `${Math.max(1, v.s(1))}px solid ${hexA(c, 0.85)}`, borderBottom: 'none'}} />
                    <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(20), color: v.t.colors.muted,
                      whiteSpace: 'nowrap'}}>{b.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: floorY, height: v.s(4),
        background: hexA(v.t.colors.muted, 0.55)}} />
    </div>
  );
};

// ── 3. CALLIPERS — Anthropic's own caveat, measured ───────────────────────────────────
//
// The company says the gap is narrower than the scores suggest, and a sentence cannot show
// a gap. Two rules stand at the two scores; a pair of callipers opens to the scoreboard
// distance, the quote lands, and then the jaws CLOSE to the smaller distance while the
// bracket's own read-out counts down. The measurement is the argument.
const Callipers: React.FC<O55VizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const [a, b, close] = [0, 1, 2].map((i) => items[i] ?? {});
  const quote = items[3] ?? {};
  const midY = h * 0.42;
  const shut = close.atWord ? travelAt(frame, F(close.atWord), 44) : 0;
  const wide = 0.72, narrow = Number(close.sub ?? 0.26);
  const span = (wide + (narrow - wide) * shut) * w;
  const left = w / 2 - span / 2, right = w / 2 + span / 2;
  const rule = (it: O55StageItem, x: number, lit: boolean) => {
    const on = arriveAt(frame, F(it.atWord));
    return (
      <div style={{position: 'absolute', left: x, top: midY - h * 0.22, transform: 'translateX(-50%)',
        opacity: on, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: v.s(10)}}>
        <div style={{fontFamily: v.t.fonts.display, fontWeight: v.t.style.displayWeight as any,
          fontSize: v.s(52), color: lit ? v.a : v.t.colors.text}}>{it.text}</div>
        <div style={{width: v.s(3), height: h * 0.2, background: hexA(lit ? v.a : v.t.colors.muted, 0.8)}} />
        <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(23), color: v.t.colors.muted,
          whiteSpace: 'nowrap'}}>{it.label}</div>
      </div>
    );
  };
  const bOn = arriveAt(frame, F(b.atWord) + 8);
  const qOn = quote.label ? arriveAt(frame, F(quote.atWord)) : 0;
  const shown = (wide + (narrow - wide) * shut) / wide;
  return (
    <div style={{width: w, height: h, position: 'relative'}}>
      {rule(a, left, true)}
      {rule(b, right, false)}
      {/* the callipers: two jaws and a beam, with the distance written on it */}
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: bOn}}>
        <line x1={left} y1={midY} x2={right} y2={midY} stroke={hexA(v.a, 0.95)} strokeWidth={v.s(3)} />
        {[left, right].map((x, i) => (
          <line key={i} x1={x} y1={midY - v.s(26)} x2={x} y2={midY + v.s(26)}
            stroke={hexA(v.a, 0.95)} strokeWidth={v.s(4)} strokeLinecap="round" />
        ))}
      </svg>
      <div style={{position: 'absolute', left: w / 2, top: midY + v.s(34), transform: 'translateX(-50%)',
        fontFamily: v.t.fonts.mono, fontSize: v.s(30), color: v.a, opacity: bOn, whiteSpace: 'nowrap'}}>
        {(Number(a.text ?? 0) - Number(b.text ?? 0) > 0
          ? (Number(a.text ?? 0) - Number(b.text ?? 0)) * shown
          : 0).toFixed(1)}{close.text ?? ' points apart'}
      </div>
      {quote.label ? (
        <div style={{position: 'absolute', left: w * 0.08, right: w * 0.08, top: h * 0.74, opacity: qOn,
          transform: `translateY(${(1 - qOn) * v.s(14)}px)`, textAlign: 'center'}}>
          <div style={{fontFamily: v.t.fonts.body, fontStyle: 'italic', fontSize: v.s(29), lineHeight: 1.4,
            color: v.t.colors.text}}>&ldquo;{quote.label}&rdquo;</div>
          <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(20), letterSpacing: v.s(1.4),
            textTransform: 'uppercase', color: v.t.colors.muted, marginTop: v.s(10)}}>{quote.sub}</div>
        </div>
      ) : null}
    </div>
  );
};

// ── 4. PRICE RACK — tags on a rail, and only one of them moves ────────────────────────
//
// A bar chart of four prices draws four similar bars and buries the only fact there is, so
// this is a rack of physical tags hanging off a rail. The tags that held stay still; the
// one that changed has its old figure STRUCK THROUGH — the strike draws, because a strike
// is a gesture — and the new figure swings in beside it under a percentage chip.
const PriceRack: React.FC<O55VizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const tags = items.filter((i) => i.detail !== 'note');
  const note = items.find((i) => i.detail === 'note');
  // The rack hangs from a rail near the top and the tags fall from it, so the whole
  // assembly is centred in the pane rather than pinned to its first 40% (the still showed
  // three small tags with two thirds of the frame empty under them).
  const railY = Math.max(v.s(30), h * 0.16);
  const tagW = Math.min(w / Math.max(tags.length, 1) * 0.82, v.s(340));
  // VERTICAL IS A REFRAME, NOT A CROP. Three tags abreast in a 9:16 pane are three slivers,
  // so the rail turns on its side and the tags hang off it down the frame at full width —
  // same object, same gesture, laid out for the room it actually has.
  const vRail = v.vertical;
  // ...and only reserve room under it when there is actually a note to put there.
  const noteGap = note ? h * 0.16 : h * 0.03;
  return (
    <div style={{width: w, height: h, position: 'relative'}}>
      <div style={vRail
        ? {position: 'absolute', top: 0, bottom: noteGap, left: v.s(26), width: v.s(5), borderRadius: v.s(3),
           background: `linear-gradient(180deg, ${hexA(v.t.colors.muted, 0.25)}, ${hexA(v.t.colors.muted, 0.7)}, ${hexA(v.t.colors.muted, 0.25)})`}
        : {position: 'absolute', left: 0, right: 0, top: railY, height: v.s(5), borderRadius: v.s(3),
           background: `linear-gradient(90deg, ${hexA(v.t.colors.muted, 0.25)}, ${hexA(v.t.colors.muted, 0.7)}, ${hexA(v.t.colors.muted, 0.25)})`}} />
      <div style={vRail
        ? {position: 'absolute', left: v.s(26), right: 0, top: 0, bottom: noteGap, display: 'flex',
           flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'flex-start'}
        : {position: 'absolute', left: 0, right: 0, top: railY, display: 'flex',
           justifyContent: 'space-evenly', alignItems: 'flex-start'}}>
        {tags.map((tg, i) => {
          const drop = landAt(frame, F(tg.atWord), 40);
          const swap = tg.detailAtWord ? travelAt(frame, F(tg.detailAtWord), 30) : 0;
          const moved = Boolean(tg.sub);
          const c = moved ? v.a : v.t.colors.muted;
          return (
            <div key={i} style={{display: 'flex', flexDirection: vRail ? 'row' : 'column',
              alignItems: 'center', opacity: drop,
              transform: vRail ? `translateX(${(drop - 1) * v.s(40)}px)` : `translateY(${(drop - 1) * v.s(40)}px)`}}>
              {/* the string and the hole punched through the tag */}
              <div style={vRail
                ? {height: v.s(2), width: w * 0.08, background: hexA(v.t.colors.muted, 0.7)}
                : {width: v.s(2), height: h * 0.1, background: hexA(v.t.colors.muted, 0.7)}} />
              <div style={{position: 'relative', padding: `${v.s(22)}px ${v.s(30)}px ${v.s(26)}px`,
                borderRadius: v.rad(14), width: vRail ? w * 0.78 : tagW,
                background: moved ? hexA(v.a, 0.1) : hexA(v.t.colors.muted, 0.07),
                border: `${Math.max(1, v.s(moved ? 2 : 1))}px solid ${hexA(c, moved ? 0.85 : 0.35)}`,
                boxShadow: moved ? v.glow(v.a, 20) : 'none', textAlign: 'center'}}>
                <div style={vRail
                  ? {position: 'absolute', top: '50%', left: v.s(9), width: v.s(11), height: v.s(11),
                     marginTop: -v.s(5.5), borderRadius: '50%', background: v.t.colors.bg,
                     border: `${Math.max(1, v.s(1))}px solid ${hexA(v.t.colors.muted, 0.7)}`}
                  : {position: 'absolute', left: '50%', top: v.s(9), width: v.s(11), height: v.s(11),
                  marginLeft: -v.s(5.5), borderRadius: '50%', background: v.t.colors.bg,
                  border: `${Math.max(1, v.s(1))}px solid ${hexA(v.t.colors.muted, 0.7)}`}} />
                <div style={{fontFamily: v.t.fonts.display, fontWeight: v.t.style.displayWeight as any,
                  fontSize: v.s(31), color: v.t.colors.text, marginTop: v.s(6)}}>{tg.label}</div>
                {/* OLD ABOVE, NEW BELOW — never side by side. Two prices on one line wrap
                    inside a tag sized to the pane, and a wrapped price reads as a bug. */}
                {tg.sub ? (
                  <div style={{position: 'relative', display: 'inline-block', marginTop: v.s(12),
                    fontFamily: v.t.fonts.mono, fontSize: v.s(28), color: hexA(v.t.colors.muted, 0.8),
                    whiteSpace: 'nowrap'}}>
                    {tg.sub}
                    <span style={{position: 'absolute', left: -v.s(4), top: '52%', height: v.s(2.5),
                      width: `${swap * (100 + 8)}%`, background: v.sem('red')}} />
                  </div>
                ) : null}
                <div style={{marginTop: v.s(tg.sub ? 6 : 14), fontFamily: v.t.fonts.mono,
                  fontSize: v.s(moved ? 46 : 40), whiteSpace: 'nowrap',
                  color: moved ? v.a : v.t.colors.text,
                  opacity: moved ? swap : 1, transform: `translateY(${(1 - (moved ? swap : 1)) * v.s(10)}px)`}}>
                  {tg.text}
                </div>
                <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(19), color: v.t.colors.muted,
                  marginTop: v.s(8)}}>{tg.value != null ? `${tg.value}` : 'per million tokens'}</div>
              </div>
              {moved ? (
                <div style={{marginTop: vRail ? 0 : v.s(14), marginLeft: vRail ? v.s(16) : 0, opacity: swap, padding: `${v.s(6)}px ${v.s(14)}px`,
                  borderRadius: v.rad(999), background: hexA(v.sem('green'), 0.16),
                  border: `${Math.max(1, v.s(1))}px solid ${hexA(v.sem('green'), 0.7)}`,
                  fontFamily: v.t.fonts.mono, fontSize: v.s(22), color: v.sem('green')}}>{tg.icon}</div>
              ) : null}
            </div>
          );
        })}
      </div>
      {note ? (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: v.s(6), textAlign: 'center',
          opacity: arriveAt(frame, F(note.atWord))}}>
          <Cap v={v} title={note.label} sub={note.sub} size={30} />
        </div>
      ) : null}
    </div>
  );
};

// ── 5. TURNSTILE — what a re-read of the same context costs now ───────────────────────
//
// Cache reads are invisible, so this draws the thing they are: tokens you already sent,
// going past a meter a second time. A reel of tokens travels through the gate, the meter
// counts real money, and a second needle sweeps to the speed figure beside it.
const Turnstile: React.FC<O55VizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const flow = items[0] ?? {}, meter = items[1] ?? {}, speed = items[2] ?? {};
  const run = travelAt(frame, F(flow.atWord), 60);
  const count = meter.atWord ? travelAt(frame, F(meter.atWord), 44) : 0;
  // The saving is a SECOND fact about the same meter — "twenty cents instead of fifty" and
  // "sixty percent off" are two clauses, so the chip lands on its own word rather than
  // riding the counter (LAW 0i: one moment, one anchor).
  const chipOn = arriveAt(frame, F(meter.detailAtWord ?? meter.atWord));
  const from = Number(meter.sub ?? 0), to = Number(meter.text ?? 0);
  const now = from + (to - from) * count;
  const gateX = w * 0.42;
  const dots = 14;
  const leftW = gateX - v.s(20);
  const sweep = speed.atWord ? travelAt(frame, F(speed.atWord), 40) : 0;
  // EVERY ROW IS A FRACTION OF THE PANE. Written in v.s() units the reel, the gate and the
  // meter all sat in the top third and the bottom 60% was empty — a picture that reads as
  // an unfinished slide however correct its numbers are.
  const reelY = h * 0.30, reelH = h * 0.14;
  const dotW = Math.min(leftW / dots * 0.62, v.s(46));
  return (
    <div style={{width: w, height: h, position: 'relative'}}>
      {/* the reel of tokens already sent, arriving at the gate a second time */}
      <div style={{position: 'absolute', left: 0, top: reelY, width: leftW, height: reelH,
        opacity: arriveAt(frame, F(flow.atWord) - 10)}}>
        {Array.from({length: dots}).map((_, i) => {
          const pr = ((i / dots) + run * 0.9) % 1;
          return (
            <div key={i} style={{position: 'absolute', left: pr * (leftW - dotW), top: 0, width: dotW,
              height: reelH, borderRadius: v.rad(8), background: hexA(v.a, 0.2),
              border: `${Math.max(1, v.s(1))}px solid ${hexA(v.a, 0.6)}`, opacity: 0.35 + 0.65 * pr}} />
          );
        })}
        <div style={{position: 'absolute', left: 0, top: reelH + v.s(18), fontFamily: v.t.fonts.body,
          fontSize: v.s(26), color: v.t.colors.muted}}>{flow.label}</div>
      </div>
      {/* the gate */}
      <div style={{position: 'absolute', left: gateX, top: reelY - h * 0.1, width: v.s(10),
        height: h * 0.34, background: hexA(v.t.colors.muted, 0.8), borderRadius: v.s(5)}} />
      <div style={{position: 'absolute', left: gateX - v.s(5), top: reelY + reelH / 2,
        width: w * 0.1, height: v.s(8), background: v.a, borderRadius: v.s(4),
        transformOrigin: 'left center', transform: `rotate(${-70 + 70 * run}deg)`, boxShadow: v.glow(v.a, 14)}} />
      {/* the meter: real money, counting */}
      <div style={{position: 'absolute', left: gateX + w * 0.14, top: h * 0.14,
        opacity: arriveAt(frame, F(meter.atWord) - 10)}}>
        <div style={{fontFamily: v.t.fonts.mono, fontSize: Math.min(h * 0.19, v.s(108)), color: v.a, lineHeight: 1}}>
          ${now.toFixed(2)}
        </div>
        <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(27), color: v.t.colors.muted, marginTop: v.s(12)}}>
          {meter.label}
        </div>
        {meter.icon ? (
          <div style={{marginTop: v.s(18), display: 'inline-block', padding: `${v.s(8)}px ${v.s(18)}px`,
            borderRadius: v.rad(999), background: hexA(v.sem('green'), 0.16), opacity: chipOn,
            border: `${Math.max(1, v.s(1))}px solid ${hexA(v.sem('green'), 0.7)}`,
            fontFamily: v.t.fonts.mono, fontSize: v.s(28), color: v.sem('green')}}>{meter.icon}</div>
        ) : null}
      </div>
      {/* and the needle, for the other half of the sentence */}
      {speed.label ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: h * 0.68,
          opacity: arriveAt(frame, F(speed.atWord) - 8), display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: v.s(30)}}>
          <svg width={h * 0.24} height={h * 0.15} viewBox="0 0 120 72" style={{overflow: 'visible'}}>
            <path d="M 8 66 A 52 52 0 0 1 112 66" fill="none" stroke={hexA(v.t.colors.muted, 0.5)}
              strokeWidth={7} strokeLinecap="round" />
            <path d="M 8 66 A 52 52 0 0 1 112 66" fill="none" stroke={v.a} strokeWidth={7}
              strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - sweep * 0.78} />
            <line x1={60} y1={66} x2={60 + Math.cos(Math.PI * (1 - sweep * 0.78)) * 44}
              y2={66 - Math.sin(Math.PI * (1 - sweep * 0.78)) * 44}
              stroke={v.t.colors.text} strokeWidth={3} strokeLinecap="round" />
          </svg>
          <Cap v={v} title={speed.text} sub={speed.label} size={42} align="left" />
        </div>
      ) : null}
    </div>
  );
};

// ── 6. THREAD — what people said, on the phone they said it on ────────────────────────
//
// The screenshots are somebody else's words, so they are shown as a quotation: the real
// capture inside a phone-shaped frame, credited, with one line pulled out beside it on its
// own word. Nothing is retyped, because retyping a quote is how a quote becomes a claim.
const Thread: React.FC<O55VizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const shots = items.filter((i) => i.icon);
  const quotes = items.filter((i) => !i.icon && i.label);
  const colW = Math.min(w * 0.46, v.s(620));
  // A SUPPLIED IMAGE HAS ITS OWN ASPECT AND WILL HAPPILY RUN OFF THE PANE. The still showed
  // the second screenshot sliced by the frame edge and sitting under the source footer.
  // Cap each one so the stack fits the height it was given, and crop from the top — which
  // is where a thread's first words are.
  const shotH = shots.length ? (h - v.s(20) * (shots.length - 1)) / shots.length : h;
  return (
    <div style={{width: w, height: h, display: 'flex', alignItems: 'flex-start', gap: v.s(48)}}>
      <div style={{width: colW, height: h, display: 'flex', flexDirection: 'column', gap: v.s(20)}}>
        {shots.map((s, i) => {
          const on = arriveAt(frame, F(s.atWord));
          return (
            <div key={i} style={{opacity: on, transform: `translateY(${(1 - on) * v.s(18)}px)`,
              borderRadius: v.rad(16), overflow: 'hidden', height: shotH,
              border: `${Math.max(1, v.s(1))}px solid ${hexA(v.t.colors.panelBorder, 0.9)}`,
              boxShadow: `0 ${v.s(18)}px ${v.s(44)}px ${hexA('#000000', 0.45)}`}}>
              <Img src={staticFile(`assets/${String(s.icon).replace(/^img:/, '')}`)}
                style={{display: 'block', width: '100%', height: '100%', objectFit: 'cover',
                  objectPosition: 'top center'}} />
            </div>
          );
        })}
      </div>
      <div style={{flex: 1, height: h, display: 'flex', flexDirection: 'column',
        justifyContent: 'safe center', gap: v.s(34)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: v.s(14)}}>
          <AssetIcon asset="si:reddit" size={v.s(42)} bare tint={v.sem('orange')} />
          <span style={{fontFamily: v.t.fonts.mono, fontSize: v.s(22), letterSpacing: v.s(1.4),
            textTransform: 'uppercase', color: v.t.colors.muted}}>r/ClaudeAI</span>
        </div>
        {quotes.map((q, i) => {
          const on = arriveAt(frame, F(q.atWord));
          return (
            <div key={i} style={{opacity: on, transform: `translateX(${(1 - on) * v.s(22)}px)`,
              borderLeft: `${v.s(4)}px solid ${hexA(v.a, 0.9)}`, paddingLeft: v.s(22)}}>
              <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(31), lineHeight: 1.36,
                color: v.t.colors.text}}>{q.label}</div>
              {q.sub ? <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(20), color: v.t.colors.muted,
                marginTop: v.s(8)}}>{q.sub}</div> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── 7. SWITCHBOARD — the recommendation, thrown rather than listed ────────────────────
//
// "Who should switch" is a decision, and a decision is a switch being thrown. Three real
// toggles, each labelled with a kind of work; on its own word the handle travels and the
// lamp above it lights — or stays where it is, which is the honest answer for the work
// where another model still leads.
const Switchboard: React.FC<O55VizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const rows = items.filter((i) => i.detail !== 'note');
  const note = items.find((i) => i.detail === 'note');
  const sw = Math.min(w / Math.max(rows.length, 1), v.s(400));
  // Derived from the pane: a 96x168 switch is a thumbnail in a 700px-high frame.
  const bodyH = Math.min(h * 0.4, v.s(320)), bodyW = bodyH * 0.58;
  const handleH = bodyH * 0.38, lamp = bodyH * 0.17;
  return (
    <div style={{width: w, height: h, display: 'flex', flexDirection: 'column',
      justifyContent: 'safe center', gap: v.s(46)}}>
      <div style={{display: 'flex', justifyContent: 'center', gap: v.s(40)}}>
        {rows.map((r, i) => {
          const on = arriveAt(frame, F(r.atWord) - 10);
          const thrown = travelAt(frame, F(r.atWord), 26);
          const yes = r.value === 1;
          const p = yes ? thrown : 0;
          const c = yes ? v.sem('green') : v.sem('orange');
          return (
            <div key={i} style={{width: sw, opacity: on, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: v.s(16)}}>
              {/* the lamp */}
              <div style={{width: lamp, height: lamp, borderRadius: '50%',
                background: hexA(c, 0.18 + 0.72 * (yes ? thrown : 0.25)),
                border: `${Math.max(1, v.s(2))}px solid ${hexA(c, 0.9)}`,
                boxShadow: yes && thrown > 0.5 ? v.glow(c, 22) : 'none'}} />
              {/* the switch body */}
              <div style={{width: bodyW, height: bodyH, borderRadius: v.rad(20),
                background: hexA(v.t.colors.muted, 0.08),
                border: `${Math.max(1, v.s(1))}px solid ${hexA(v.t.colors.panelBorder, 0.95)}`,
                position: 'relative', overflow: 'hidden'}}>
                <div style={{position: 'absolute', left: '50%',
                  top: bodyH * 0.17 + (1 - p) * (bodyH * 0.76 - handleH),
                  marginLeft: -bodyW * 0.36, width: bodyW * 0.72, height: handleH, borderRadius: v.rad(12),
                  background: `linear-gradient(180deg, ${hexA(c, 0.95)}, ${hexA(c, 0.45)})`,
                  boxShadow: `0 ${v.s(5)}px ${v.s(14)}px ${hexA('#000000', 0.5)}`}} />
                <div style={{position: 'absolute', left: 0, right: 0, top: v.s(6), textAlign: 'center',
                  fontFamily: v.t.fonts.mono, fontSize: v.s(19), letterSpacing: v.s(1.4),
                  color: hexA(v.t.colors.muted, 0.9)}}>{yes ? 'SWITCH' : 'STAY'}</div>
              </div>
              <Cap v={v} title={r.label} sub={r.sub} size={32} />
            </div>
          );
        })}
      </div>
      {note ? (
        <div style={{textAlign: 'center', opacity: arriveAt(frame, F(note.atWord))}}>
          <Cap v={v} title={note.label} sub={note.sub} size={30} />
        </div>
      ) : null}
    </div>
  );
};

export const O55_VIZ: Record<string, React.FC<O55VizProps>> = {
  'ladder': Ladder,
  'podium': Podium,
  'callipers': Callipers,
  'price-rack': PriceRack,
  'turnstile': Turnstile,
  'thread': Thread,
  'switchboard': Switchboard,
};

export const O55Viz: React.FC<O55VizProps & {kind: string}> = ({kind, ...p}) => {
  const C = O55_VIZ[kind];
  if (!C) return <UnknownKind kind={kind} registry="o55Viz" />;
  return <C {...p} />;
};
