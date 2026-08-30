import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {useScale, useSem, hexA} from './ui';
import {useTheme, wordToFrame} from './themes';
import {arriveAt, travelAt, stagger} from './motion/system';
import type {SemColor} from './types';
import {UnknownKind} from './unknownKind';

// STEP OVERLAY — an animated component that floats OVER the recording.
//
// Owner: *"we need to work on improving overlays over the recordings where its not just that
// steps, shortcuts, you must be able to display components and animations as well over the
// overlay, while preserving to not overlap with content and cause any unreadability."*
//
// Until now the floating layer could only carry furniture: a step rail, a keycap, a caption.
// This is the layer that can EXPLAIN — a small piece of motion that says what the command on
// screen is actually doing, riding in the same measured ink-free band the caption uses, so it
// still covers nothing.
//
// THE CONSTRAINT IS WHAT MAKES IT WORK (motion guide, 10): these are deliberately small. One
// band tall, one idea, one moving thing. A full-size diagram over a screen recording is just a
// diagram that has hidden the recording — the footage is the subject, and this annotates it.
//
// SEVEN KINDS, chosen because they are the shapes a terminal beat actually needs:
//
//   swap   one word becomes another          SCAN -> SEARCH
//   chain  a token travels a pipeline        connect -> cursor -> rows
//   split  one input, two different fates    the safe call vs the glued one
//   tally  a number counts up to its answer  4 rows came back
//   rows   the real table, row by row         which rows the WHERE kept and which it cut
//   seq    who talks to whom, in order        code -> sqlite3 -> file -> handle back
//   graph  the parts and what connects them   a declared topology, ranked from its edges
//
// Every moment resolves from `atWord` through the motion system's named roles, so nothing
// here contains a fixed interval (LAW 0i) and nothing moves linearly.

export type StepOverlayData = {
  kind?: string;
  atWord?: number;
  from?: string;
  to?: string;
  steps?: string[];
  left?: string;
  right?: string;
  leftNote?: string;
  rightNote?: string;
  value?: string;
  label?: string;
  /** `rows` — the table itself, and what this step does to it */
  columns?: string[];
  rows?: {cells?: string[]; state?: 'kept' | 'cut' | 'new' | 'plain'; atWord?: number}[];
  /** `seq` — who talks to whom, in order. Indices into `actors`. */
  actors?: string[];
  messages?: {from?: number; to?: number; text?: string; atWord?: number; ret?: boolean}[];
  /** `graph` — a DECLARED topology (LAW 0k): nodes, and the edges between them by id. */
  nodes?: {id?: string; label?: string; atWord?: number; tone?: SemColor}[];
  edges?: {from?: string; to?: string; atWord?: number}[];
  color?: SemColor;
};

/**
 * The narrowest card this depiction will accept, in unscaled px.
 *
 * Measured by rendering every kind into the 460px VS Code dock and looking at all seven, after
 * shipping a `split` that was chopped off at both edges because only `rows` had been checked.
 * A kind that would have to shrink its type below readability to fit says so here, and
 * RecordedStep places it in the centre band instead (LAW 0o.6 — breathing room is not smaller
 * type).
 */
export const minCardWidth = (o?: {kind?: string; actors?: unknown[]; nodes?: {id?: string}[];
  edges?: {from?: string; to?: string}[]}): number => {
  if (!o?.kind) return 0;
  switch (o.kind) {
    // Three lifelines plus labels spanning between them collided at 460px, and the labels are
    // the whole content — there is nothing to trim.
    case 'seq': return Math.max(560, 210 * Math.max(2, (o.actors ?? []).length));
    // Ranks are derived from the edges, so the widest layer is what actually needs the room.
    case 'graph': {
      const nodes = o.nodes ?? [];
      const edges = o.edges ?? [];
      const rank: Record<string, number> = {};
      for (const n of nodes) rank[String(n.id)] = 0;
      for (let i = 0; i < nodes.length; i++) {
        for (const e of edges) {
          const r = (rank[String(e.from)] ?? 0) + 1;
          if (r > (rank[String(e.to)] ?? 0)) rank[String(e.to)] = r;
        }
      }
      const per: Record<number, number> = {};
      for (const n of nodes) { const r = rank[String(n.id)] ?? 0; per[r] = (per[r] ?? 0) + 1; }
      const widest = Math.max(1, ...Object.values(per));
      return 260 * widest;
    }
    // The rest stack happily into a column once `narrow` kicks in.
    default: return 0;
  }
};

export const StepOverlay: React.FC<{
  data: StepOverlayData;
  /** the clip's own anchor, so an overlay with no atWord still lands with its step */
  fallbackAtWord?: number;
  maxWidth: number;
}> = ({data, fallbackAtWord, maxWidth}) => {
  const {scale} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();

  const start = wordToFrame(data.atWord ?? fallbackAtWord ?? 1);
  if (frame < start) return null;

  const accent = sem(data.color ?? 'blue');
  const radius = 10 * scale * t.style.cornerRadius;
  const inMs = arriveAt(frame, start);
  const mono = 25 * scale;

  // One shared chip so every kind looks like the same family (motion guide, 9: consistency).
  //
  // AND IT SIZES ITSELF TO THE ROOM IT HAS. `whiteSpace: nowrap` at a fixed 25px mono means a
  // long label is simply wider than a docked card, and the card clips it — which is exactly
  // what the owner photographed: `Ctrl+Shift+P` cut to `rl+Shift+P` on one edge and the note
  // cut to `wa a FI na` on the other. A chip is the smallest primitive here and it was the one
  // ignoring LAW 0k.4. `share` is how much of the card's width this chip may claim, so a kind
  // placing two chips side by side says 0.5 and each shrinks honestly instead of overflowing.
  const chipFont = (text: string, share = 1) => {
    const room = maxWidth * share - 34 * scale;         // less the chip's own padding + border
    const advance = 0.6;                                 // measured em-width of the mono faces
    return Math.max(mono * 0.5, Math.min(mono, room / Math.max(1, text.length * advance)));
  };
  const Chip: React.FC<{
    text: string; on?: number; tone?: string; dim?: boolean; big?: boolean; share?: number;
  }> = ({text, on = 1, tone = accent, dim = false, big = false, share = 1}) => (
    <span style={{
      fontFamily: t.fonts.mono,
      fontSize: chipFont(text, share) * (big ? 1.15 : 1),
      color: dim ? t.colors.muted : tone,
      background: hexA(tone, dim ? 0.05 : 0.14 * on),
      border: `${1.5 * scale}px solid ${hexA(dim ? t.colors.panelBorder : tone, dim ? 0.3 : 0.55 * on)}`,
      borderRadius: radius,
      padding: `${5 * scale}px ${13 * scale}px`,
      whiteSpace: 'nowrap',
      maxWidth: '100%',
      opacity: on,
    }}>{text}</span>
  );

  // NARROW IS THE COMMON CASE NOW, NOT THE EXCEPTION.
  //
  // The card docks into the free right-hand column on most VS Code footage, which is ~460px —
  // and every kind below was written for a full-width strip. `rows` was fixed for it and the
  // other six were shipped unlooked-at: the owner's frame shows `split` with "Ctrl+Shift+P"
  // chopped off on the left and "wants a FILE name" chopped off on the right, because the card
  // clips what overflows. One kind measured, six assumed, is not a fix.
  //
  // Every kind consults this. Below the threshold the layout goes VERTICAL — which is what a
  // tall narrow column wants anyway — and nothing is allowed to exceed the width it was given.
  const narrow = maxWidth < 520 * scale;

  const wrap: React.CSSProperties = {
    position: 'relative', zIndex: 2,
    display: 'flex',
    // `minWidth: 0` is what actually stops a flex child pushing past its parent: without it a
    // flex item's automatic minimum size is its CONTENT, so `maxWidth` on the parent is advice
    // rather than a constraint, and the overflow is simply clipped by the card.
    minWidth: 0,
    alignItems: 'center', justifyContent: 'center',
    ...(narrow ? {flexDirection: 'column' as const, gap: 8 * scale} : {gap: 12 * scale}),
    width: '100%',
    maxWidth,
    opacity: inMs,
  };

  // ── SWAP — one word becomes another. The old one rises and fades as the new one
  //    comes up from below, so the eye reads a REPLACEMENT rather than two labels.
  if (data.kind === 'swap') {
    const go = travelAt(frame, start + 6, 20);
    const rise = 16 * scale;
    return (
      <div style={{...wrap, position: 'relative'}}>
        <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center'}}>
          <span style={{
            transform: `translateY(${-rise * go}px)`,
            opacity: 1 - go,
            display: 'inline-block',
          }}>
            <Chip text={String(data.from ?? '')} tone={sem('orange')} />
          </span>
          <span style={{
            position: 'absolute', left: 0, top: 0,
            transform: `translateY(${rise * (1 - go)}px)`,
            opacity: go,
            display: 'inline-block',
          }}>
            <Chip text={String(data.to ?? '')} tone={sem('green')} big />
          </span>
        </div>
      </div>
    );
  }

  // ── CHAIN — a token travels a pipeline and lights each stop as it passes. This is the
  //    shape for "connect, then cursor, then rows": three named things and one journey.
  if (data.kind === 'chain') {
    const steps = (data.steps ?? []).slice(0, 4);
    const per = 14;
    // Four stops side by side need width a dock does not have, so the pipeline stands up: the
    // same journey, read top to bottom, with the connectors becoming rungs. The MOTION is
    // unchanged — each stop still lights from its own moment, travelling the same direction.
    return (
      <div style={wrap}>
        {steps.map((s, i) => {
          const lit = arriveAt(frame, start + 6 + i * per, 12);
          return (
            <React.Fragment key={i}>
              {i > 0 ? (
                <span style={{
                  ...(narrow
                    ? {height: 14 * scale, width: 2 * scale}
                    : {width: 26 * scale, height: 2 * scale}),
                  background: hexA(accent, 0.25 + 0.6 * lit),
                  // the connector draws toward the next stop rather than blinking on
                  transform: narrow ? `scaleY(${0.2 + 0.8 * lit})` : `scaleX(${0.2 + 0.8 * lit})`,
                  transformOrigin: narrow ? 'top center' : 'left center',
                }} />
              ) : null}
              <span style={{
                transform: `translateY(${(1 - lit) * 6 * scale}px)`,
                display: 'inline-block', maxWidth: '100%',
              }}>
                <Chip text={s} on={0.35 + 0.65 * lit} dim={lit < 0.15}
                      share={narrow ? 0.9 : 1 / Math.max(1, steps.length)} />
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // ── SPLIT — one input, two fates. The two results DO NOT arrive together (motion guide,
  //    7): the safe one lands first, and the bad one a beat later, which is the order the
  //    narration says them in and the order that makes the contrast land.
  if (data.kind === 'split') {
    const a = arriveAt(frame, start + stagger(0, 8), 12);
    const b = arriveAt(frame, start + stagger(2, 8), 12);
    // In a dock, each fate becomes its own stacked block — chip over note — and the divider
    // turns from a vertical rule into a horizontal one, because that is the axis the two
    // things are now separated along.
    const side = (label: string, note: string | undefined, on: number, tone: string) => (
      <span style={{
        display: 'flex', minWidth: 0, maxWidth: '100%',
        ...(narrow
          ? {flexDirection: 'column' as const, alignItems: 'center' as const, gap: 4 * scale}
          : {alignItems: 'center' as const, gap: 8 * scale}),
        transform: `translateY(${(1 - on) * 8 * scale}px)`,
      }}>
        <Chip text={label} on={on} tone={tone} share={narrow ? 0.9 : 0.4} />
        {note ? (
          <span style={{
            fontFamily: t.fonts.body, fontSize: mono * (narrow ? 0.72 : 0.8),
            color: t.colors.muted, opacity: on,
            textAlign: narrow ? 'center' : 'left', maxWidth: '100%',
          }}>{note}</span>
        ) : null}
      </span>
    );
    return (
      <div style={wrap}>
        {side(String(data.left ?? ''), data.leftNote, a, sem('green'))}
        <span style={{
          background: hexA(t.colors.muted, 0.3),
          ...(narrow
            ? {height: 1.5 * scale, width: '55%'}
            : {width: 1.5 * scale, height: 30 * scale}),
        }} />
        {side(String(data.right ?? ''), data.rightNote, b, sem('red'))}
      </div>
    );
  }

  // ── ROWS — THE TABLE, AND WHAT THIS STEP DID TO IT.
  //
  //    Owner: *"the text you put there is certainly very much AI-ish, I would like it to have
  //    meaningful animation components and data rather than just showing texts and moving the
  //    animation within them. Maybe you can display what happens in the table."*
  //
  //    He is right that a caption plus a moving chip is still a caption. This is the actual data:
  //    the rows the query touched, arriving one at a time at their own anchors, each one KEPT,
  //    CUT or NEW. A viewer can read the result of a WHERE off this without hearing a word, which
  //    is the test LAW 0d sets — would it still teach with the sound off?
  if (data.kind === 'rows') {
    const cols = (data.columns ?? []).slice(0, 3);
    const rows = (data.rows ?? []).slice(0, 5);
    // Measured on the VS Code dock at 460px: `copied below itself` rendered as `copied b…`,
    // which teaches nothing and looks broken. Side-by-side columns need width the dock does
    // not have, so below the threshold each row becomes TWO LINES — the chord, then what it
    // does — which is the shape a narrow column actually wants (LAW 0k.4).
    const cut = sem('red'), kept = sem('green'), fresh = sem('purple');
    const toneOf = (st?: string) => st === 'cut' ? cut : st === 'new' ? fresh : st === 'kept' ? kept : accent;
    return (
      <div style={{...wrap, flexDirection: 'column', gap: 5 * scale, width: '100%'}}>
        {cols.length && !narrow ? (
          <div style={{display: 'flex', width: '100%', gap: 10 * scale, padding: `0 ${11 * scale}px`}}>
            {cols.map((c, i) => (
              <span key={i} style={{
                flex: i === 0 ? 2 : 1, minWidth: 0,
                fontFamily: t.fonts.mono, fontSize: mono * 0.62,
                letterSpacing: 1.2, textTransform: 'uppercase',
                color: hexA(t.colors.muted, 0.9),
                textAlign: i === 0 ? 'left' : 'right',
              }}>{c}</span>
            ))}
          </div>
        ) : null}
        {rows.map((r, i) => {
          const at = wordToFrame(r.atWord ?? data.atWord ?? 1);
          const on = arriveAt(frame, at, 14);
          const tone = toneOf(r.state);
          const gone = r.state === 'cut' ? travelAt(frame, at + 8, 16) : 0;
          return (
            <div key={i} style={{
              display: 'flex', width: '100%',
              ...(narrow
                ? {flexDirection: 'column' as const, alignItems: 'flex-start' as const, gap: 2 * scale}
                : {alignItems: 'center' as const, gap: 10 * scale}),
              padding: `${(narrow ? 8 : 6) * scale}px ${11 * scale}px`,
              borderRadius: radius,
              border: `${1.2 * scale}px solid ${hexA(tone, 0.15 + 0.45 * on)}`,
              background: hexA(tone, 0.06 + 0.07 * on),
              opacity: (0.25 + 0.75 * on) * (1 - 0.55 * gone),
              // a row that is CUT slides out of the result rather than merely dimming
              transform: `translateX(${gone * 14 * scale}px)`,
            }}>
              {(r.cells ?? []).slice(0, 3).map((cell, j) => (
                <span key={j} style={{
                  ...(narrow
                    ? {width: '100%', fontSize: mono * (j === 0 ? 0.8 : 0.68)}
                    : {flex: j === 0 ? 2 : 1, fontSize: mono * 0.86}),
                  minWidth: 0,
                  fontFamily: t.fonts.mono,
                  color: j === 0 ? t.colors.text : tone,
                  textAlign: narrow ? 'left' : (j === 0 ? 'left' : 'right'),
                  textDecoration: r.state === 'cut' && gone > 0.4 ? 'line-through' : 'none',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{cell}</span>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  // ── SEQ — WHO TALKS TO WHOM, AND IN WHAT ORDER.
  //
  //    Owner: *"maybe you can display an component graph, a sequence diagram so on and so
  //    forth."* A sequence diagram is the right picture for a beat where the interesting
  //    thing is not a value but an EXCHANGE — your code asks sqlite3 for a connection,
  //    sqlite3 opens the file, the file hands back a handle. Three named parties and an
  //    order.
  //
  //    Actors are columns with lifelines hanging off them; each message is an arrow that
  //    TRAVELS from its sender to its receiver at its own spoken word (LAW 0i — no fixed
  //    intervals, every moment resolves from an anchor). A return hop is dashed and runs
  //    the other way, which is the convention every engineer already reads.
  //
  //    Laid out in real pixels — no squashed viewBox, no scale compensation (LAW 0o.7).
  if (data.kind === 'seq') {
    const actors = (data.actors ?? []).slice(0, 4);
    const msgs = (data.messages ?? []).slice(0, 5);
    if (actors.length < 2) return null;
    const W = maxWidth;
    const colX = (i: number) => (W * (i + 0.5)) / actors.length;
    const headH = 34 * scale;
    const rowH = 34 * scale;
    const top = headH + 20 * scale;
    const H = top + msgs.length * rowH + 8 * scale;
    const line = hexA(t.colors.text, 0.18);
    return (
      <div style={{...wrap, width: '100%'}}>
        <div style={{position: 'relative', width: W, height: H}}>
          {/* the parties, and the lifeline each one owns for the whole exchange */}
          {actors.map((name, i) => (
            <React.Fragment key={i}>
              <div style={{
                position: 'absolute', left: colX(i), top: 0,
                transform: 'translateX(-50%)',
                fontFamily: t.fonts.mono,
                // Three actor labels across a 460px dock is ~150px each; at a fixed 18px mono
                // "sqlite3 shell" is 130px of glyphs plus padding and it runs into its
                // neighbour. The label sizes to its own column, exactly as the chip does.
                fontSize: Math.max(mono * 0.42, Math.min(mono * 0.72,
                  (W / actors.length - 16 * scale) / Math.max(1, name.length * 0.62))),
                color: t.colors.text, whiteSpace: 'nowrap',
                background: hexA(t.colors.panel, 0.85),
                border: `${1.2 * scale}px solid ${hexA(t.colors.text, 0.2)}`,
                borderRadius: radius,
                padding: `${5 * scale}px ${11 * scale}px`,
              }}>{name}</div>
              <div style={{
                position: 'absolute', left: colX(i), top: headH, width: 0, height: H - headH,
                borderLeft: `${1.2 * scale}px dashed ${line}`,
              }} />
            </React.Fragment>
          ))}

          {msgs.map((m, i) => {
            const at = wordToFrame(m.atWord ?? data.atWord ?? 1);
            // The arrow does not appear — it CROSSES, from sender to receiver.
            const go = travelAt(frame, at, 18);
            if (go <= 0.001) return null;
            const fi = Math.min(actors.length - 1, Math.max(0, Number(m.from ?? 0)));
            const ti = Math.min(actors.length - 1, Math.max(0, Number(m.to ?? 1)));
            const x0 = colX(fi), x1 = colX(ti);
            const rightward = x1 >= x0;
            const span = Math.abs(x1 - x0);
            const y = top + i * rowH;
            const tone = m.ret ? sem('purple') : accent;
            const head = 7 * scale;
            return (
              <React.Fragment key={i}>
                <div style={{
                  position: 'absolute',
                  left: Math.min(x0, x1), top: y,
                  width: span * go, height: 2 * scale,
                  background: m.ret ? 'none' : tone,
                  borderTop: m.ret ? `${2 * scale}px dashed ${tone}` : undefined,
                  // grows FROM the sender, whichever side that is
                  transformOrigin: rightward ? 'left center' : 'right center',
                  marginLeft: rightward ? 0 : span * (1 - go),
                }} />
                {/* the head lands only once the arrow has arrived */}
                <div style={{
                  position: 'absolute',
                  left: x1 - (rightward ? head : 0), top: y + scale - head + scale,
                  width: 0, height: 0,
                  opacity: interpolate(go, [0.82, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
                  borderTop: `${head}px solid transparent`,
                  borderBottom: `${head}px solid transparent`,
                  ...(rightward
                    ? {borderLeft: `${head}px solid ${tone}`}
                    : {borderRight: `${head}px solid ${tone}`}),
                }} />
                {m.text ? (
                  <div style={{
                    position: 'absolute',
                    left: (x0 + x1) / 2, top: y - 17 * scale,
                    transform: 'translateX(-50%)',
                    fontFamily: t.fonts.mono,
                    // A message label may not be wider than the hop it describes, or it runs
                    // off the card at either end.
                    fontSize: Math.max(mono * 0.4, Math.min(mono * 0.62,
                      Math.max(span, W * 0.5) / Math.max(1, String(m.text).length * 0.62))),
                    color: tone, whiteSpace: 'nowrap', opacity: go,
                  }}>{m.text}</div>
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // ── GRAPH — THE PARTS, AND WHAT ACTUALLY CONNECTS THEM.
  //
  //    LAW 0k.1: the topology is DECLARED (`edges` name their endpoints by id) and never
  //    inferred from position — the DSA cut shipped a renderer that drew every node in one
  //    row to every node in the next, which happened to look right on the example it was
  //    written against. Ranks are derived from the declared edges, so a node's row is a
  //    consequence of what points at it.
  //
  //    LAW 0k.2: an edge has to be VISIBLE to be an edge. Strokes are in real pixels and an
  //    edge the voice is on takes the accent colour, not the panel-border grey.
  if (data.kind === 'graph') {
    const nodes = (data.nodes ?? []).slice(0, 6).filter((n) => n.id);
    const edges = (data.edges ?? []).slice(0, 8)
      .filter((e) => nodes.some((n) => n.id === e.from) && nodes.some((n) => n.id === e.to));
    if (!nodes.length) return null;

    // RANK = longest path from a root, so a node always sits below everything that feeds it.
    const rank: Record<string, number> = {};
    for (const n of nodes) rank[String(n.id)] = 0;
    for (let pass = 0; pass < nodes.length; pass++) {
      for (const e of edges) {
        const r = rank[String(e.from)] + 1;
        if (r > rank[String(e.to)]) rank[String(e.to)] = r;
      }
    }
    const layers: string[][] = [];
    for (const n of nodes) {
      const r = rank[String(n.id)];
      (layers[r] ??= []).push(String(n.id));
    }
    const rows: string[][] = layers.filter(Boolean);   // reordered in place by the sweep below

    // ORDER EACH LAYER SO THE EDGES DO NOT CROSS.
    //
    // Measured in the shorts proof: `your query text` and `"USB-C hub"` sat in row 0 in the
    // order they were authored, so the edge from the hub down to `? placeholder` crossed the
    // edge from the query text down to `glued into the string` — a clean X in the middle of
    // the card. Two paths that cross read as one confusion.
    //
    // A barycentre sweep fixes it: a node moves next to the average position of the nodes it
    // connects to, downward then upward, twice. It is the standard layered-graph pass and
    // three passes is more than enough for six nodes.
    const order = (ids: string[], key: (id: string) => number) =>
      ids.map((id, i) => ({id, k: key(id), i}))
        .sort((x, y) => (Number.isFinite(x.k) ? x.k : x.i) - (Number.isFinite(y.k) ? y.k : y.i))
        .map((e) => e.id);
    const indexIn = (layer: string[], id: string) => layer.indexOf(id);
    const mean = (xs: number[]) => xs.length ? xs.reduce((a2, b2) => a2 + b2, 0) / xs.length : NaN;
    for (let pass = 0; pass < 3; pass++) {
      // DOWN — a child sits under the mean of its parents.
      for (let r = 1; r < rows.length; r++) {
        rows[r] = order(rows[r], (id) =>
          mean(edges.filter((e) => e.to === id)
            .map((e) => indexIn(rows[r - 1], String(e.from)))
            .filter((i) => i >= 0)));
      }
      // UP — a parent sits over the mean of its children.
      for (let r = rows.length - 2; r >= 0; r--) {
        rows[r] = order(rows[r], (id) =>
          mean(edges.filter((e) => e.from === id)
            .map((e) => indexIn(rows[r + 1], String(e.to)))
            .filter((i) => i >= 0)));
      }
    }

    const W = maxWidth;
    const nodeH = 32 * scale;
    const rowGap = 30 * scale;
    const H = rows.length * nodeH + (rows.length - 1) * rowGap;
    // A LABEL THAT IS ELLIPSED IS A LABEL THAT WAS NOT SHOWN. The proof frame rendered
    // `glued into the string` as `ued into the strir`, which is worse than not drawing it —
    // LAW 0k.4: a component sizes to the space it is given rather than clipping. The type
    // steps down until the WIDEST label in the graph fits the NARROWEST node, so the whole
    // graph stays one size and nothing is cut.
    const widest = Math.max(1, ...nodes.map((n) => String(n.label ?? n.id ?? '').length));
    // `Math.min(..., 190)` was a CEILING for a wide card and became the binding term in a dock,
    // where W / ids.length is already smaller than 190 — the LAW 0n corollary about a constant
    // binding in the ordinary case, one layer down. Take the real share of the real width.
    const narrowest = Math.min(...rows.map((ids) => W / ids.length - 12 * scale));
    // 0.58em per character is the measured advance width of the mono faces this repo ships.
    const nodeFont = Math.max(
      mono * 0.42,
      Math.min(mono * 0.7, (narrowest - 18 * scale) / (widest * 0.58)),
    );
    const pos: Record<string, {x: number; y: number; w: number}> = {};
    rows.forEach((ids, r) => {
      const w = Math.min(W / ids.length - 12 * scale, 190 * scale);
      ids.forEach((id, i) => {
        pos[id] = {x: (W * (i + 0.5)) / ids.length, y: r * (nodeH + rowGap), w};
      });
    });

    return (
      <div style={{...wrap, width: '100%'}}>
        <div style={{position: 'relative', width: W, height: H}}>
          <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            {edges.map((e, i) => {
              const a = pos[String(e.from)], b2 = pos[String(e.to)];
              if (!a || !b2) return null;
              const at = wordToFrame(e.atWord ?? data.atWord ?? 1);
              const draw = travelAt(frame, at, 16);
              if (draw <= 0.001) return null;
              const x0 = a.x, y0 = a.y + nodeH;
              const x1 = b2.x, y1 = b2.y;
              const len = Math.hypot(x1 - x0, y1 - y0);
              return (
                <line key={i}
                  x1={x0} y1={y0}
                  x2={x0 + (x1 - x0) * draw} y2={y0 + (y1 - y0) * draw}
                  stroke={hexA(accent, 0.75)}
                  strokeWidth={2.2 * scale}
                  strokeLinecap="round"
                  strokeDasharray={len}
                  strokeDashoffset={len * (1 - draw)}
                />
              );
            })}
          </svg>
          {nodes.map((n, i) => {
            const pt = pos[String(n.id)];
            if (!pt) return null;
            const on = arriveAt(frame, wordToFrame(n.atWord ?? data.atWord ?? 1), 14);
            const tone = n.tone ? sem(n.tone) : accent;
            return (
              <div key={i} style={{
                position: 'absolute',
                left: pt.x, top: pt.y, width: pt.w, height: nodeH,
                transform: `translateX(-50%) translateY(${(1 - on) * 7 * scale}px)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: t.fonts.mono, fontSize: nodeFont,
                color: t.colors.text,
                background: hexA(t.colors.panel, 0.92),
                border: `${1.6 * scale}px solid ${hexA(tone, 0.2 + 0.55 * on)}`,
                borderRadius: radius,
                opacity: 0.3 + 0.7 * on,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                padding: `0 ${9 * scale}px`,
              }}>{n.label ?? n.id}</div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── TALLY — a number counts up to its answer. A figure that ticks is read; a figure that
  //    appears is skipped.
  if (data.kind === 'tally') {
    const target = Number(String(data.value ?? '0').replace(/[^0-9.]/g, '')) || 0;
    const go = travelAt(frame, start + 4, 20);
    const shown = Math.round(target * go);
    return (
      <div style={wrap}>
        <span style={{
          fontFamily: t.fonts.mono, fontSize: mono * 1.7, fontWeight: 700,
          color: accent, fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        }}>{shown}</span>
        {data.label ? (
          <span style={{fontFamily: t.fonts.body, fontSize: mono * 0.86, color: t.colors.text}}>
            {data.label}
          </span>
        ) : null}
      </div>
    );
  }

  // AN UNREGISTERED KIND MUST BE LOUD (LAW 0n corollary). This used to `return null`, so a
  // typo'd kind rendered the card with its caption and an empty body — a defect that looks
  // exactly like "this beat has no overlay" and survives every contact sheet. The linter
  // rejects it before a render; this is the belt for the braces.
  if (data.kind) {
    return (
      <div style={{...wrap, height: 52 * scale}}>
        <UnknownKind kind={String(data.kind)} registry="recordedOverlay StepOverlay" />
      </div>
    );
  }
  return null;
};
