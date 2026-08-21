import React from 'react';
import {UnknownKind} from './unknownKind';
import {interpolate, useCurrentFrame} from 'remotion';
import {useTheme, wordToFrame} from './themes';
import {SemColor} from './types';
import {useScale, useSem, hexA} from './ui';

// DSA VIZ — the pictures for the Pattern Dojo series.
//
// SHAPE (proven on the 109-command cut, and it satisfies LAW 0e rule 2): the CODE
// lives on the left and lights line by line as it is taught; the ALGORITHM'S STATE
// lives on the right and moves on the same words. The viewer reads a line and watches
// what that line did, in one glance.
//
// WHAT IS DIFFERENT FROM linuxViz: there, every command was independent, so every beat
// got its own picture. Here the picture must PERSIST across a pattern's steps — the
// array, the pointers and the variables are one continuous machine the viewer is
// tracking. Consistency inside a pattern is the teaching; variety lives BETWEEN
// patterns, where the ten algorithms genuinely need ten different geometries.
//
// THE ONE RULE, unchanged (LAW 0i): every moment resolves from an element's own
// `atWord` via wordToFrame. No fixed intervals anywhere in this file. Lists resolve
// with the PURE helper so no hook is ever called inside a map.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const liveAt = (frame: number, atWord?: number, ramp = 9) => {
  if (atWord == null) return 1;
  const s = wordToFrame(atWord);
  return interpolate(frame, [s, s + ramp], [0, 1], clamp);
};
export const pulseAt = (frame: number, atWord?: number, dur = 26) => {
  if (atWord == null) return 0;
  const s = wordToFrame(atWord);
  return interpolate(frame, [s, s + dur * 0.35, s + dur], [0, 1, 0], clamp);
};

export interface VizCell {
  label?: string;   // what is written in the cell / node / bucket
  sub?: string;     // the caption under it
  value?: number;   // magnitude: bar height, depth, index
  color?: SemColor;
  atWord?: number;
  state?: string;   // 'active' | 'done' | 'dropped' | 'target'
  /** Label printed UNDER the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast, MEET.
   *  Taken from the Pattern Dojo's own visualiser, where naming the role beneath the
   *  cell reads far faster than a floating flag the eye has to match up. */
  tag?: string;
  /** The label of this node's PARENT, for tree/graph shapes.
   *  Without it a topology has to be guessed, and the guess was wrong: the old graph
   *  drew an edge from every node in one level to every node in the next, which is a
   *  complete bipartite graph, not the graph being traced (owner, 2026-08-19:
   *  *"when you show a tree, there must be lines visible ... see if they are aligning
   *  properly as expected"*). Declared structure, drawn structure. */
  parent?: string;
  /** Extra non-tree neighbours, by label — a graph edge that is not parent→child. */
  links?: string[];
}
export interface DsaVizProps {
  cells: VizCell[];
  /** The SECOND column: the structure the input is building. */
  aux?: VizCell[];
  pointers?: {label: string; at: number; color?: SemColor; atWord?: number}[];
  vars?: {label: string; sub?: string; atWord?: number}[];
  accent: SemColor;
  caption?: string;
}

export const useViz = (accent: SemColor) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  return {
    t, sem, scale, vertical,
    a: sem(accent),
    rad: (n = 8) => n * scale * t.style.cornerRadius,
    mono: (n = 18) => ({fontFamily: t.fonts.mono, fontSize: n * scale}),
    body: (n = 17) => ({fontFamily: t.fonts.body, fontSize: n * scale}),
    dim: hexA(t.colors.muted, 0.9),
    line: hexA(t.colors.panelBorder, 0.9),
  };
};

/** Colour a cell by its role, not by decoration. */
export const cellColor = (v: ReturnType<typeof useViz>, c: VizCell) => {
  if (c.color) return v.sem(c.color);
  if (c.state === 'dropped') return hexA(v.t.colors.muted, 0.55);
  if (c.state === 'win') return v.sem('green');
  if (c.state === 'done') return v.sem('green');
  if (c.state === 'target') return v.sem('yellow');
  return v.a;
};

// ── the code pane ────────────────────────────────────────────────────────────
export interface CodeLine {
  text: string;
  /** Word this line lights on. Lines taught together share an anchor. */
  atWord?: number;
  /** Plain-English note shown beneath, required by LAW 0e for any taught line. */
  note?: string;
}

/**
 * The code, lit line by line. Lines already taught stay readable but recede;
 * the line being taught is the only thing at full contrast, with its plain-English
 * note directly under it — that adjacency is the point (LAW 0e rule 2).
 */
export const CodePane: React.FC<{
  lines: CodeLine[];
  accent: SemColor;
  title?: string;
}> = ({lines, accent, title}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  // Font size FITS the listing rather than being fixed. A fixed 21px silently
  // overflowed an 18-line file: with the rows centred inside an overflow-hidden
  // pane, the first and last lines were sliced off by the top border and the note
  // bar (visible in EP06 BFS, where `import deque` and `return -1` were both cut).
  // Each row costs roughly fontSize * 1.5 plus its 4px of padding.
  // In VERTICAL the code pane is the lower ~46% of an 1180-tall stage, i.e. ~540 —
  // not the whole stage. Budgeting 1010 there meant `fit` never bound and the font
  // stayed at the small BASE while half the pane sat empty, which is why code was
  // unreadable at phone size. Correct budget, and a BASE that lets it grow.
  //
  // And it has to fit the WIDTH too. Height was the only constraint here, so in 9:16
  // the font grew to 34px, a 52-character line needed ~1060px of a 976px pane, and
  // every long line was sliced off at the right border mid-token — `call_tool("read_
  // note", .` with the rest of the call simply gone (owner, 2026-08-21). A listing you
  // cannot read the end of is not a listing. Both budgets bind now, and the smaller
  // one wins.
  const stageH = STAGE_H(v.vertical) * v.scale;
  const AVAIL = (v.vertical ? stageH * 0.46 - 28 * v.scale : stageH) - (v.vertical ? 96 : 96) * v.scale;
  const BASE = (v.vertical ? 34 : 21) * v.scale;
  const fitH = (AVAIL / Math.max(lines.length, 1) - 4 * v.scale) / 1.5;
  // pane width less the window padding and the line-number gutter; mono advance ≈ 0.6em
  const paneW = (v.vertical ? 976 : 1776 * 0.48 - 14) * v.scale - (28 + 34) * v.scale;
  const longest = Math.max(...lines.map((l) => (l.text ?? '').length), 1);
  const fitW = paneW / (longest * 0.605);
  const mono = Math.max(11 * v.scale, Math.min(BASE, fitH, fitW));

  // the line currently being taught = the last one whose word has been spoken
  let active = -1;
  lines.forEach((l, i) => { if (l.atWord != null && frame >= wordToFrame(l.atWord)) active = i; });
  const activeNote = active >= 0 ? lines[active]?.note : undefined;

  return (
    <div
      style={{
        flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
        background: hexA(v.t.colors.bg, 0.72),
        border: `${2 * v.scale}px solid ${v.t.colors.panelBorder}`,
        borderRadius: v.rad(12), overflow: 'hidden',
        boxShadow: v.t.style.glow > 0 ? `0 0 ${20 * v.scale * v.t.style.glow}px ${hexA(v.a, 0.14)}` : undefined,
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8 * v.scale,
          padding: `${10 * v.scale}px ${14 * v.scale}px`,
          borderBottom: `${1.5 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.85)}`,
          background: hexA(v.t.colors.panel, 0.7),
        }}
      >
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <div key={c} style={{width: 10 * v.scale, height: 10 * v.scale, borderRadius: 999, background: hexA(c, 0.85)}} />
        ))}
        <span style={{marginLeft: 6 * v.scale, ...v.mono(15), color: hexA(v.t.colors.muted, 0.95)}}>
          {title ?? 'solution.py'}
        </span>
      </div>

      <div style={{flex: 1, minHeight: 0, padding: `${14 * v.scale}px ${16 * v.scale}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        {lines.map((l, i) => {
          const lit = i === active;
          const taught = l.atWord != null && frame >= wordToFrame(l.atWord);
          const on = liveAt(frame, l.atWord, 7);
          const indent = (l.text.match(/^ */)?.[0].length ?? 0);
          return (
            <div
              key={i}
              style={{
                display: 'flex', gap: 10 * v.scale, alignItems: 'baseline',
                background: lit ? hexA(v.a, 0.16) : 'transparent',
                borderLeft: `${3 * v.scale}px solid ${lit ? v.a : 'transparent'}`,
                borderRadius: v.rad(4),
                padding: `${2 * v.scale}px ${8 * v.scale}px`,
                opacity: l.atWord == null ? 0.45 : taught ? 1 : 0.3,
                transition: undefined,
              }}
            >
              <span style={{...v.mono(mono / v.scale * 0.62), color: hexA(v.t.colors.muted, 0.6), minWidth: 18 * v.scale, textAlign: 'right'}}>
                {i + 1}
              </span>
              <span
                style={{
                  ...v.mono(mono / v.scale), color: lit ? v.t.colors.text : hexA(v.t.colors.text, 0.72),
                  whiteSpace: 'pre', fontWeight: lit ? 600 : 400,
                  // "==" must look like two equals signs, not one fused glyph.
                  fontVariantLigatures: 'none', fontFeatureSettings: '"liga" 0, "calt" 0',
                  transform: `translateX(${(1 - on) * 5 * v.scale}px)`,
                }}
              >
                {l.text || ' '}
              </span>
            </div>
          );
        })}
      </div>

      {/* The plain-English note sits UNDER the line it explains — LAW 0e rule 2. */}
      {activeNote ? (
        <div
          style={{
            borderTop: `${1.5 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.85)}`,
            background: hexA(v.a, 0.09),
            padding: `${10 * v.scale}px ${16 * v.scale}px`,
            ...v.body(v.vertical ? 17 : 16.5), color: hexA(v.t.colors.text, 0.95), lineHeight: 1.45,
          }}
        >
          {activeNote}
        </div>
      ) : null}
    </div>
  );
};

// ── the state pane ───────────────────────────────────────────────────────────
export const StatePane: React.FC<{
  caption?: string;
  accent: SemColor;
  vars?: DsaVizProps['vars'];
  /** THE STANDING SETUP — what the viewer is looking at, in one plain sentence,
   *  parked above the animation for the whole beat so it can be re-read at any
   *  moment. The caption above it is a title ("THE ONLY FULL COUNT"); this is the
   *  premise ("You are on a train. Each box is a house you pass. k = 3 in view").
   *  Owner, 2026-08-20: *"there is no text that displays like consider you are in a
   *  train and you are counting houses ... you are not displaying a text that user
   *  would often refer to and remember what we are speaking about."* Unanchored on
   *  purpose: it is the frame around the beat, not a step inside it. */
  premise?: string;
  /** Fraction of the scene's stage height this pane occupies — 1 when it is the whole
   *  stage, 0.54 when it sits above the code pane in 9:16. The pane needs it to know
   *  how much room it is really working with. */
  share?: number;
  children: React.ReactNode;
}> = ({caption, accent, vars, premise, share = 1, children}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();

  // What is left for the picture once every band of chrome has taken its cut.
  const paneH = STAGE_H(v.vertical) * share - (share < 1 ? (v.vertical ? 20 : 28) : 0);
  const capH = caption ? (v.vertical ? 18 : 17) * 1.4 + 20 + 1.5 : 0;
  const varH = vars?.length ? 14.5 * 1.5 + 18 + 1.5 : 0;
  const padH = (v.vertical ? 22 : 24) * 2;
  const budget = Math.max(140, paneH - capH - premiseH(premise, v.vertical) - varH - padH);

  return (
    <BudgetCtx.Provider value={budget}>
    <div
      style={{
        flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
        background: hexA(v.t.colors.panel, 0.55),
        border: `${2 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.95)}`,
        borderRadius: v.rad(12), overflow: 'hidden',
      }}
    >
      {caption ? (
        <div
          style={{
            padding: `${10 * v.scale}px ${16 * v.scale}px`,
            borderBottom: `${1.5 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.8)}`,
            ...v.body(v.vertical ? 18 : 17), letterSpacing: 1.3, textTransform: 'uppercase',
            color: hexA(v.a, 0.98), fontWeight: 700,
          }}
        >
          {caption}
        </div>
      ) : null}
      {premise ? (
        <div
          style={{
            margin: `${(v.vertical ? 16 : 18) * v.scale}px ${(v.vertical ? 20 : 24) * v.scale}px 0`,
            padding: `${12 * v.scale}px ${16 * v.scale}px`,
            borderLeft: `${4 * v.scale}px solid ${hexA(v.a, 0.9)}`,
            background: hexA(v.a, 0.09),
            borderRadius: v.rad(8),
            ...v.body(v.vertical ? 21 : 19.5),
            color: v.t.colors.text, lineHeight: 1.45, fontWeight: 500,
          }}
        >
          {premise}
        </div>
      ) : null}
      {/* `safe center`, not `center`. Centred flex content that outgrows its box
          overflows BOTH ways, so in 9:16 the picture pushed up under the premise and
          down through the bottom border — owner, 2026-08-21: *"the top and bottom are
          getting overlapped with the content inside, there is no room to breathe."*
          `safe` degrades to flex-start the moment it would overflow, so the top edge
          is never crossed, and the depictions below size themselves to this box so
          the bottom is not either. */}
      <div style={{flex: 1, minHeight: 0, padding: (v.vertical ? 22 : 24) * v.scale, display: 'flex', flexDirection: 'column', justifyContent: 'safe center', gap: 14 * v.scale}}>
        {children}
      </div>
      {vars?.length ? (
        <div
          style={{
            borderTop: `${1.5 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.8)}`,
            padding: `${9 * v.scale}px ${14 * v.scale}px`,
            display: 'flex', flexWrap: 'wrap', gap: 7 * v.scale,
          }}
        >
          {vars.map((x, i) => {
            const on = liveAt(frame, x.atWord);
            const p = pulseAt(frame, x.atWord);
            return (
              <div
                key={i}
                style={{
                  ...v.mono(14.5), opacity: 0.35 + on * 0.65,
                  border: `${1.4 * v.scale}px solid ${on > 0.5 ? hexA(v.a, 0.7) : hexA(v.t.colors.panelBorder, 0.6)}`,
                  background: on > 0.5 ? hexA(v.a, 0.14 + p * 0.2) : 'transparent',
                  borderRadius: v.rad(5), padding: `${3 * v.scale}px ${9 * v.scale}px`,
                  color: on > 0.5 ? v.a : v.dim, fontWeight: 600,
                  transform: `scale(${1 + p * 0.05})`,
                }}
              >
                {x.label}
                {x.sub ? <span style={{color: v.dim, fontWeight: 400}}> {x.sub}</span> : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
    </BudgetCtx.Provider>
  );
};

// ── the two-up rig ───────────────────────────────────────────────────────────
export const CodeStage: React.FC<{
  lines: CodeLine[];
  accent: SemColor;
  caption?: string;
  codeTitle?: string;
  vars?: DsaVizProps['vars'];
  premise?: string;
  children: React.ReactNode;
}> = ({lines, accent, caption, codeTitle, vars, premise, children}) => {
  const {scale, vertical} = useScale();
  // WIDE: code left, state right — you read the line, then see what it did.
  // VERTICAL: a re-arrangement, not a resize. The state takes the top (it is the
  // thing that moves) and the code sits beneath it, because a 9:16 frame cannot hold
  // a readable code column beside anything.
  return (
    <div
      style={{
        display: 'flex', flexDirection: vertical ? 'column-reverse' : 'row',
        gap: (vertical ? 20 : 28) * scale, width: '100%', height: '100%', alignItems: 'stretch',
      }}
    >
      <div style={{display: 'flex', flex: vertical ? '1 1 46%' : '1 1 48%', minHeight: 0}}>
        <CodePane lines={lines} accent={accent} title={codeTitle} />
      </div>
      <div style={{display: 'flex', flex: vertical ? '1 1 54%' : '1 1 52%', minHeight: 0}}>
        <StatePane caption={caption} accent={accent} vars={vars} premise={premise}
                   share={vertical ? 0.54 : 1}>{children}</StatePane>
      </div>
    </div>
  );
};

// ══ ARRAY FAMILY ═════════════════════════════════════════════════════════════

/** Shared cell row. The array is drawn ONCE and persists; only state moves. */
const CellRow: React.FC<{
  cells: VizCell[]; v: ReturnType<typeof useViz>; frame: number; big?: boolean;
  marked?: number[]; tags?: Record<number, {text: string; color?: string}>;
}> = ({cells, v, frame, big, marked = [], tags = {}}) => {
  const {cellH, cellFont, idxFont, tagFont} = cellMetrics(cells.length, big, v.vertical);
  return <CellRowInner {...{cells, v, frame, big, marked, tags, cellH, cellFont, idxFont, tagFont}} />;
};

/** Row geometry, in ONE place. Any overlay drawn on top of the row (the sliding
 *  window frame, a bracket, a highlight) must measure itself from here. It used to
 *  hard-code `height: 74` while the row sized itself responsively, so the window
 *  frame rendered SMALLER than the boxes it was supposed to contain. */
export const CELL_GAP = 6;
export const cellMetrics = (count: number, big?: boolean, vertical?: boolean) => {
  const n = Math.max(count, 1);
  // A vertical state pane is full-frame width and roughly 640 tall, so a row of six
  // can be half again as tall as it is in the wide cut and still fit comfortably.
  const cap = vertical ? (big ? 168 : 152) : (big ? 122 : 110);
  const cellH = Math.max(56, Math.min(cap, (vertical ? 900 : 660) / n));
  const cellFont = Math.max(19, Math.min(vertical ? 48 : (big ? 36 : 33), cellH * 0.34));
  return {cellH, cellFont, idxFont: Math.max(11.5, cellFont * 0.42), tagFont: Math.max(14, cellFont * 0.5)};
};

const CellRowInner: React.FC<{
  cells: VizCell[]; v: ReturnType<typeof useViz>; frame: number; big?: boolean;
  marked?: number[]; tags?: Record<number, {text: string; color?: string}>;
  cellH: number; cellFont: number; idxFont: number; tagFont: number;
}> = ({cells, v, frame, marked = [], tags = {}, cellH, cellFont, idxFont, tagFont}) => {
  // The row SIZES TO THE SPACE. A fixed 46px cell with 19px type left a six-cell DP
  // table as a thin ribbon of small numbers floating in a mostly empty panel
  // (owner: *"you are showing numbers at the very bottom very small"* / *"components
  // having room to breathe"*). The data is the thing being taught, so it gets the
  // room: fewer cells means bigger cells, down to a floor when the row gets long.
  return (
  <div style={{display: 'flex', gap: CELL_GAP * v.scale, justifyContent: 'center', alignItems: 'flex-start'}}>
    {cells.map((c, i) => {
      const on = liveAt(frame, c.atWord);
      const p = pulseAt(frame, c.atWord);
      const col = cellColor(v, c);
      const dropped = c.state === 'dropped';
      const held = marked.includes(i) && !dropped;
      const tag = tags[i] ?? (c.tag ? {text: c.tag} : undefined);
      const tagCol = tag?.color ?? col;
      return (
        <div key={i} style={{flex: 1, minWidth: 0, textAlign: 'center'}}>
          <div
            style={{
              height: cellH * v.scale, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: v.rad(8),
              border: `${(held ? 2.6 : 1.6) * v.scale}px ${dropped ? 'dashed' : 'solid'} ${
                on > 0.4 ? hexA(col, dropped ? 0.45 : held ? 1 : 0.5) : hexA(v.t.colors.panelBorder, 0.7)}`,
              background: dropped
                ? hexA(v.sem('red'), 0.07)
                : held
                ? `linear-gradient(135deg, ${hexA(col, 0.55)}, ${hexA(col, 0.22)})`
                : hexA(col, on > 0.4 ? 0.1 : 0.04),
              opacity: dropped ? 0.5 : 1,
              // the Dojo scales the active cell up; the anchor pulse rides on top
              transform: `scale(${held ? 1.1 : 1}) translateY(${-p * 4 * v.scale}px)`,
              boxShadow: held ? `0 0 ${18 * v.scale}px ${hexA(col, 0.45)}` : undefined,
              ...v.mono(cellFont),
              color: dropped ? v.dim : held ? '#fff' : on > 0.4 ? v.t.colors.text : hexA(v.t.colors.text, 0.55),
              fontWeight: 700,
            }}
          >
            {c.label}
          </div>
          <div style={{...v.mono(idxFont), color: hexA(v.t.colors.muted, 0.65), marginTop: 4 * v.scale}}>[{i}]</div>
          <div
            style={{
              ...v.mono(tagFont), fontWeight: 800, marginTop: 2 * v.scale, letterSpacing: 1.1,
              color: tag ? tagCol : 'transparent',
              textShadow: tag ? `0 0 ${10 * v.scale}px ${hexA(tagCol, 0.55)}` : undefined,
              transform: `translateY(${tag ? -p * 4 * v.scale : 0}px)`,
              whiteSpace: 'nowrap',
            }}
          >
            {tag?.text ?? '\u00b7'}
          </div>
        </div>
      );
    })}
  </div>
  );
};

/** Pointer flags that sit UNDER the array and actually travel to their index. */
const PointerRail: React.FC<{
  pointers: NonNullable<DsaVizProps['pointers']>; n: number; v: ReturnType<typeof useViz>; frame: number;
}> = ({pointers, n, v, frame}) => {
  // Same gap arithmetic as the window frame: the cells are flex:1 with CELL_GAP
  // between them, so a plain percentage lands BETWEEN cells as the row gets wider
  // and the arrow no longer points at the box it names.
  const gapsPx = (n - 1) * CELL_GAP * v.scale;
  const {cellFont} = cellMetrics(n, true, v.vertical);
  const font = Math.max(13.5, cellFont * 0.52);
  return (
  <div style={{position: 'relative', height: (font * 2.2) * v.scale}}>
    {pointers.map((p, i) => {
      const on = liveAt(frame, p.atWord, 12);
      const col = p.color ? v.sem(p.color) : v.a;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `calc((100% - ${gapsPx}px) / ${n} * ${p.at + 0.5} + ${p.at * CELL_GAP * v.scale}px)`,
            transform: `translateX(-50%) translateY(${(1 - on) * -6 * v.scale}px)`,
            opacity: on, textAlign: 'center',
          }}
        >
          <div style={{...v.mono(font), color: col, fontWeight: 700, lineHeight: 1}}>▲</div>
          <div style={{...v.mono(font), color: col, fontWeight: 700}}>{p.label}</div>
        </div>
      );
    })}
  </div>
  );
};

/** TWO POINTERS — LEFT and RIGHT named under the cells they stand on. */
export const ArrayPointers: React.FC<DsaVizProps> = ({cells, pointers = [], accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const live = pointers.filter((p) => liveAt(frame, p.atWord) > 0.5);
  const held = live.map((p) => p.at);
  const tags: Record<number, {text: string; color?: string}> = {};
  for (const p of live) {
    const c = p.color ? v.sem(p.color) : v.a;
    tags[p.at] = tags[p.at] ? {text: `${tags[p.at].text} · ${p.label}`, color: v.sem('purple')} : {text: p.label, color: c};
  }
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 6 * v.scale}}>
      <CellRow cells={cells} v={v} frame={frame} big marked={held} tags={tags} />
    </div>
  );
};

/** SLIDING WINDOW — the frame spans the cells IN the window; the cell leaving sits
 *  OUTSIDE it, which is the whole point and is why the span cannot be derived from
 *  the two moving pointers. Cells in the window carry state "win"; the pointers only
 *  name what is entering and what is leaving. */
export const ArrayWindow: React.FC<DsaVizProps> = ({cells, pointers = [], accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const live = pointers.filter((p) => liveAt(frame, p.atWord) > 0.5);
  const tags: Record<number, {text: string; color?: string}> = {};
  for (const p of live) {
    const leaving = /out/i.test(p.label);
    tags[p.at] = {text: leaving ? '-OUT' : '+IN', color: leaving ? v.sem('red') : v.sem('green')};
  }
  const inWin = cells.map((c, i) => (c.state === 'win' ? i : -1)).filter((i) => i >= 0);
  const a = inWin.length ? Math.min(...inWin) : 0;
  const b = inWin.length ? Math.max(...inWin) : -1;
  const on = inWin.length ? Math.max(...inWin.map((i) => liveAt(frame, cells[i].atWord, 10))) : 0;
  const {cellH} = cellMetrics(cells.length, true, v.vertical);
  const span = b - a + 1;
  const pad = 7;                                   // breathing room around the boxes
  const gapsPx = (cells.length - 1) * CELL_GAP * v.scale;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10 * v.scale}}>
      <div style={{position: 'relative'}}>
        <CellRow cells={cells} v={v} frame={frame} big marked={inWin} tags={tags} />
        {b >= a ? (
          <div
            style={{
              // Measured from the SAME metrics the row uses, and the cells are
              // flex:1 separated by CELL_GAP, so the frame has to step by
              // (cellWidth + gap) — a plain percentage ignores the gaps and the
              // frame drifts sideways as the window moves along the array.
              position: 'absolute',
              top: -pad * v.scale,
              height: (cellH + pad * 2) * v.scale,
              left: `calc((100% - ${gapsPx}px) / ${cells.length} * ${a} + ${a * CELL_GAP * v.scale}px - ${pad * v.scale}px)`,
              width: `calc((100% - ${gapsPx}px) / ${cells.length} * ${span} + ${(span - 1) * CELL_GAP * v.scale}px + ${pad * 2 * v.scale}px)`,
              border: `${2.8 * v.scale}px solid ${hexA(v.a, 0.95)}`,
              borderRadius: v.rad(13), opacity: on, pointerEvents: 'none',
              boxShadow: `0 0 ${18 * v.scale}px ${hexA(v.a, 0.35)}`,
            }}
          />
        ) : null}
      </div>
      <div style={{...v.body(13.5), color: v.dim, textAlign: 'center'}}>
        one in, one out — the total is repaired, never rebuilt
      </div>
    </div>
  );
};

/** BINARY SEARCH — LO, MID and HI named; the discarded half falls away. */
export const ArrayBSearch: React.FC<DsaVizProps> = ({cells, pointers = [], accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const live = pointers.filter((p) => liveAt(frame, p.atWord) > 0.5);
  const tags: Record<number, {text: string; color?: string}> = {};
  for (const p of live) {
    const isMid = /mid|m$/i.test(p.label);
    tags[p.at] = {text: p.label.toUpperCase(), color: isMid ? v.sem('purple') : p.color ? v.sem(p.color) : v.a};
  }
  const mid = live.find((p) => /mid|m$/i.test(p.label));
  const gone = cells.filter((c) => c.state === 'dropped').length;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8 * v.scale}}>
      <CellRow cells={cells} v={v} frame={frame} big marked={mid ? [mid.at] : []} tags={tags} />
      <div style={{display: 'flex', alignItems: 'center', gap: 10 * v.scale, justifyContent: 'center'}}>
        <div style={{flex: 1, maxWidth: '60%', height: 8 * v.scale, borderRadius: 999, background: hexA(v.t.colors.panelBorder, 0.35), overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${(gone / Math.max(cells.length, 1)) * 100}%`, background: hexA(v.sem('red'), 0.75), borderRadius: 999}} />
        </div>
        <div style={{...v.mono(14), color: gone ? v.sem('red') : v.dim, fontWeight: 700}}>
          {gone} of {cells.length} eliminated
        </div>
      </div>
    </div>
  );
};

/** DP TABLE — cells fill in order, and the cell being computed shows what it read. */
export const DpTable: React.FC<DsaVizProps> = ({cells, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  // The table is the ANSWER being built, so it gets the panel rather than sitting in
  // it as a thin ribbon of small numbers. Same responsive rule as CellRow.
  const n = Math.max(Math.min(cells.length, 8), 1);
  const cellH = Math.max(58, Math.min(v.vertical ? 168 : 132, (v.vertical ? 900 : 720) / n));
  const cellFont = Math.max(20, Math.min(v.vertical ? 50 : 40, cellH * 0.36));
  const capFont = Math.max(12.5, cellFont * 0.42);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8 * v.scale, justifyContent: 'center'}}>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${Math.min(cells.length, 8)}, 1fr)`, gap: 4 * v.scale}}>
        {cells.map((c, i) => {
          const on = liveAt(frame, c.atWord);
          const p = pulseAt(frame, c.atWord);
          const col = cellColor(v, c);
          return (
            <div key={i} style={{textAlign: 'center'}}>
              <div style={{...v.mono(capFont), color: hexA(v.t.colors.muted, 0.8), marginBottom: 4 * v.scale}}>{c.sub ?? i}</div>
              <div
                style={{
                  height: cellH * v.scale, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: v.rad(5),
                  border: `${1.8 * v.scale}px solid ${on > 0.4 ? hexA(col, 0.9) : hexA(v.t.colors.panelBorder, 0.65)}`,
                  background: hexA(col, on > 0.4 ? 0.18 + p * 0.3 : 0.04),
                  ...v.mono(cellFont), fontWeight: 700,
                  color: on > 0.4 ? v.t.colors.text : hexA(v.t.colors.muted, 0.6),
                  transform: `scale(${1 + p * 0.08})`,
                }}
              >
                {on > 0.4 ? c.label : '·'}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{...v.body(Math.max(13.5, capFont)), color: v.dim, textAlign: 'center', marginTop: 6 * v.scale}}>each cell is solved once, then only read</div>
    </div>
  );
};

/** GREEDY — intervals on a real timeline, sorted then taken or skipped. */
export const IntervalBars: React.FC<DsaVizProps> = ({cells, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const max = Math.max(...cells.map((c) => (c.value ?? 0) + 2), 10);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 6 * v.scale}}>
      {cells.map((c, i) => {
        const on = liveAt(frame, c.atWord);
        const [s, e] = (c.label ?? '0-0').split(/[-–]/).map(Number);
        const col = cellColor(v, c);
        const skipped = c.state === 'dropped';
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8 * v.scale, opacity: 0.3 + on * 0.7}}>
            <div style={{position: 'relative', flex: 1, height: 22 * v.scale, background: hexA(v.t.colors.panelBorder, 0.22), borderRadius: v.rad(4)}}>
              <div
                style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `${(s / max) * 100}%`, width: `${((e - s) / max) * 100}%`,
                  background: hexA(col, skipped ? 0.18 : 0.75),
                  border: `${1.5 * v.scale}px ${skipped ? 'dashed' : 'solid'} ${hexA(col, 0.9)}`,
                  borderRadius: v.rad(4),
                  ...v.mono(12), color: v.t.colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {c.label}
              </div>
            </div>
            <div style={{...v.body(12.5), color: v.dim, flex: '0 0 auto', minWidth: 72 * v.scale}}>{c.sub}</div>
          </div>
        );
      })}
    </div>
  );
};

// ══ STRUCTURE FAMILY ═════════════════════════════════════════════════════════

/**
 * Two labelled columns: what you are reading, and what you are building. Taken from
 * the Pattern Dojo's own `dual-viz` — seeing the input beside the structure is what
 * makes "the hash map remembers what the array already showed you" a picture rather
 * than a sentence.
 */
const DualViz: React.FC<{
  v: ReturnType<typeof useViz>; leftLabel: string; rightLabel: string;
  left: React.ReactNode; right: React.ReactNode;
}> = ({v, leftLabel, rightLabel, left, right}) => (
  <div style={{display: 'flex', gap: 16 * v.scale, alignItems: 'stretch', flex: 1, minHeight: 0}}>
    {[[leftLabel, left], [rightLabel, right]].map(([label, node], i) => (
      <div key={i} style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 * v.scale}}>
        <div style={{
          ...v.body(12.5), letterSpacing: 1.6, textTransform: 'uppercase', fontWeight: 700,
          color: hexA(v.t.colors.muted, 0.85), textAlign: 'center',
          borderBottom: `${1.4 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.7)}`,
          paddingBottom: 5 * v.scale,
        }}>{label as string}</div>
        <div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          {node as React.ReactNode}
        </div>
      </div>
    ))}
  </div>
);

/** HASHMAP — the array you are walking, and the map that remembers it. */
export const HashBuckets: React.FC<DsaVizProps> = ({cells, aux = [], accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const seen = cells.map((c, i) => (liveAt(frame, c.atWord) > 0.5 ? i : -1)).filter((i) => i >= 0);
  return (
    <DualViz
      v={v} leftLabel="the array" rightLabel="the hash map"
      left={<CellRow cells={cells} v={v} frame={frame} marked={seen.slice(-1)} />}
      right={
        <div style={{display: 'flex', flexDirection: 'column', gap: 6 * v.scale}}>
          {aux.map((e, i) => {
            const on = liveAt(frame, e.atWord, 8);
            const p = pulseAt(frame, e.atWord);
            const col = cellColor(v, e);
            return (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8 * v.scale,
                  opacity: 0.15 + on * 0.85,
                  transform: `translateY(${(1 - on) * -8 * v.scale}px) scale(${1 + p * 0.05})`,
                  border: `${1.5 * v.scale}px solid ${on > 0.4 ? hexA(col, 0.75) : hexA(v.t.colors.panelBorder, 0.5)}`,
                  background: hexA(col, on > 0.4 ? 0.14 : 0.03),
                  borderRadius: v.rad(7), padding: `${6 * v.scale}px ${11 * v.scale}px`,
                }}
              >
                <span style={{...v.mono(16), fontWeight: 700, color: on > 0.4 ? col : v.dim}}>{e.label}</span>
                <span style={{...v.mono(14), color: v.dim}}>:</span>
                <span style={{...v.mono(16), fontWeight: 700, color: v.t.colors.text}}>{e.sub}</span>
              </div>
            );
          })}
          {aux.length === 0 ? <div style={{...v.body(13.5), color: v.dim, textAlign: 'center'}}>still empty</div> : null}
        </div>
      }
    />
  );
};

/** STACK — the input being read, and the stack it is pushing onto. */
export const StackPlates: React.FC<DsaVizProps> = ({cells, aux = [], accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const cur = cells.map((c, i) => (liveAt(frame, c.atWord) > 0.5 ? i : -1)).filter((i) => i >= 0).slice(-1);
  const live = aux.filter((x) => x.state !== 'dropped');
  return (
    <DualViz
      v={v} leftLabel="the input" rightLabel="the stack"
      left={<CellRow cells={cells} v={v} frame={frame} marked={cur} />}
      right={
        <div style={{display: 'flex', flexDirection: 'column-reverse', gap: 4 * v.scale, alignItems: 'center'}}>
          {aux.map((e, i) => {
            const on = liveAt(frame, e.atWord, 9);
            const popped = e.state === 'dropped';
            const col = cellColor(v, e);
            const isTop = live.length > 0 && e === live[live.length - 1];
            return (
              <div
                key={i}
                style={{
                  width: '78%', height: 38 * v.scale, borderRadius: v.rad(7),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 * v.scale,
                  border: `${1.8 * v.scale}px ${popped ? 'dashed' : 'solid'} ${hexA(col, popped ? 0.35 : 0.9)}`,
                  background: popped ? 'transparent' : `linear-gradient(135deg, ${hexA(col, 0.4)}, ${hexA(col, 0.16)})`,
                  ...v.mono(18), fontWeight: 700, color: popped ? v.dim : v.t.colors.text,
                  opacity: popped ? 0.35 : 0.2 + on * 0.8,
                  transform: `translateY(${(1 - on) * -20 * v.scale}px)`,
                  boxShadow: isTop && !popped ? `0 0 ${14 * v.scale}px ${hexA(col, 0.4)}` : undefined,
                }}
              >
                {e.label}
                {isTop && !popped ? <span style={{...v.body(12), color: col}}>← top</span> : null}
              </div>
            );
          })}
          {live.length === 0 ? <div style={{...v.body(13.5), color: v.dim}}>empty</div> : null}
        </div>
      }
    />
  );
};

/** BFS — a node-link graph laid out by LEVEL, because the level is the lesson. */
// ── shared topology layout ───────────────────────────────────────────────────
// Both the tree and the graph are rooted shapes, so they share one tidy layout:
// depth sets the row (or column), leaves get equal slots, and a parent sits
// CENTRED over its children. The old code indented rows by depth and drew a 14px
// elbow, which reads as a bulleted list, not a tree.
interface TNode {x: number; y: number; cell: VizCell; parentKey: string | null; depth: number}
const layoutTree = (cells: VizCell[]) => {
  const key = (c: VizCell, i: number) => c.label ?? `#${i}`;
  const byKey = new Map<string, VizCell>();
  cells.forEach((c, i) => byKey.set(key(c, i), c));
  const parentOf = new Map<string, string | null>();
  const kids = new Map<string, string[]>();
  const depth = new Map<string, number>();
  // Depth is authored as `value` (the briefs write an indented outline), and an
  // outline already states its own parentage: a node's parent is the nearest
  // PRECEDING node one level shallower. So the topology is recovered rather than
  // demanded, and every existing brief draws a real tree without being rewritten.
  // An explicit `parent` always wins over the inference.
  cells.forEach((c, i) => {
    const k = key(c, i);
    const d = Math.max(0, Math.round(c.value ?? 0));
    depth.set(k, d);
    let p: string | null = null;
    if (c.parent && byKey.has(c.parent) && c.parent !== k) p = c.parent;
    else if (d > 0) {
      for (let j = i - 1; j >= 0; j--) {
        if (Math.max(0, Math.round(cells[j].value ?? 0)) === d - 1) { p = key(cells[j], j); break; }
      }
    }
    parentOf.set(k, p);
    if (p) kids.set(p, [...(kids.get(p) ?? []), k]);
  });
  const roots = [...parentOf.entries()].filter(([, p]) => p == null).map(([k]) => k);

  // leaves take sequential slots; an internal node is the mean of its children
  let slot = 0;
  const xOf = new Map<string, number>();
  const assign = (k: string): number => {
    const ch = kids.get(k) ?? [];
    if (!ch.length) { const x = slot++; xOf.set(k, x); return x; }
    const xs = ch.map(assign);
    const x = (Math.min(...xs) + Math.max(...xs)) / 2;
    xOf.set(k, x);
    return x;
  };
  roots.forEach(assign);
  cells.forEach((c, i) => { const k = key(c, i); if (!xOf.has(k)) xOf.set(k, slot++); });

  const maxX = Math.max(...[...xOf.values()], 0);
  const maxD = Math.max(...[...depth.values()], 0);
  const nodes: TNode[] = cells.map((c, i) => {
    const k = key(c, i);
    return {cell: c, parentKey: parentOf.get(k) ?? null, depth: depth.get(k)!, x: xOf.get(k)!, y: depth.get(k)!};
  });
  return {nodes, maxX, maxD, key, xOf, depth};
};

/** How much vertical room a depiction actually has inside its StatePane.
 *
 *  This used to be the constant `vertical ? 960 : 430` — a guess at the pane's inner
 *  height that took no account of what was ABOVE the picture. So a three-line premise
 *  ate 120px of the pane and every depiction still sized itself to the full 960, and
 *  the surplus went straight out through the bottom border. That is one bug wearing
 *  four faces, and the owner sent all four on 2026-08-21: a premise sitting on top of
 *  the machines in the relay short, a payload overrunning the vars strip, three cards
 *  ballooning until the last one was cut off by the frame, and an elicitation pane
 *  spilling over the code window beneath it.
 *
 *  The pane now MEASURES itself — stage height, less the caption bar, less the wrapped
 *  premise, less the vars strip, less its own padding — and publishes the remainder
 *  here. Every depiction that lays out by `stackBudget` gets the truth instead of a
 *  guess, in both aspects, and the surplus stops existing. Design px, not device px:
 *  callers scale it themselves. */
const BudgetCtx = React.createContext<number | null>(null);
export const stackBudget = (v: ReturnType<typeof useViz>) => {
  const measured = React.useContext(BudgetCtx);
  return measured ?? (v.vertical ? 960 : 430);
};

/** Publish a measured budget to the depictions inside a pane that is not a StatePane
 *  — the Linux effect pane, for one. Same contract: design px. */
export const PaneBudget: React.FC<{value: number; children: React.ReactNode}> = ({value, children}) => (
  <BudgetCtx.Provider value={value}>{children}</BudgetCtx.Provider>
);

/** The stage every MCP and DSA scene declares for its two-up rig, in design px. If a
 *  scene ever departs from it, it must pass its own height to the stage instead. */
export const STAGE_H = (vertical: boolean) => (vertical ? 1364 : 620);

/** Height of the premise block once it has wrapped, in design px. Estimated from the
 *  character count against the pane's width — deterministic, which a DOM measurement
 *  inside Remotion's still-by-still capture is not. */
const premiseH = (text: string | undefined, vertical: boolean) => {
  if (!text) return 0;
  const perLine = vertical ? 44 : 60;
  const lines = Math.max(1, Math.ceil(text.length / perLine));
  const font = vertical ? 21 : 19.5;
  return lines * font * 1.45 + (vertical ? 24 : 24) + (vertical ? 16 : 18);
};

/** BFS — the graph as rings around the start, with each node's DISTANCE on the node. */
export const GridBFS: React.FC<DsaVizProps> = ({cells, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  // Columns by distance. Distance is the ANSWER this pattern computes, so it is
  // written on the node itself — it used to live in a row of tiny pills along the
  // bottom edge, which forced the viewer to match node to legend while being
  // talked over (owner: *"you are showing numbers at the very bottom very small"*).
  const levels: VizCell[][] = [];
  cells.forEach((c) => { const d = Math.max(0, Math.min(c.value ?? 0, 6)); (levels[d] ??= []).push(c); });
  levels.forEach((l, i) => { if (!l) levels[i] = []; });
  const nCols = levels.length, maxRow = Math.max(...levels.map((l) => l.length), 1);

  // generous inset so a node never sits on the panel border
  const PAD_X = 13, PAD_Y = 13, R = 7.2;
  const W = 100, H = Math.max(46, Math.min(66, 20 + maxRow * 15));
  const colX = (d: number) => (nCols === 1 ? W / 2 : PAD_X + (d / (nCols - 1)) * (W - PAD_X * 2));
  const rowY = (i: number, n: number) => (n === 1 ? H / 2 : PAD_Y + (i / (n - 1)) * (H - PAD_Y * 2));
  const pos = new Map<VizCell, {x: number; y: number}>();
  levels.forEach((col, d) => col.forEach((c, i) => pos.set(c, {x: colX(d), y: rowY(i, col.length)})));
  const at = (label?: string) => cells.find((c) => c.label === label);

  // Declared edges only. A `parent` is the BFS tree edge; `links` are the extra ones.
  const edges: {a: VizCell; b: VizCell; tree: boolean}[] = [];
  for (const c of cells) {
    const p = at(c.parent);
    if (p && p !== c) edges.push({a: p, b: c, tree: true});
    for (const l of c.links ?? []) { const o = at(l); if (o && o !== c) edges.push({a: c, b: o, tree: false}); }
  }
  // Fall back to chaining consecutive levels ONLY if nothing was declared, so an
  // un-migrated scene still draws something rather than nothing.
  if (!edges.length) {
    levels.slice(0, -1).forEach((col, d) =>
      col.forEach((from) => (levels[d + 1] ?? []).forEach((to) => edges.push({a: from, b: to, tree: true})))
    );
  }

  return (
    <div style={{display: 'flex', flex: 1, minHeight: 0, padding: `${6 * v.scale}px ${2 * v.scale}px`}}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{width: '100%', flex: 1, minHeight: 0}}>
        {edges.map((e, i) => {
          const a = pos.get(e.a), b = pos.get(e.b);
          if (!a || !b) return null;
          // strokeWidth in USER units (no non-scaling-stroke) so the line scales with
          // the drawing. The old 0.5 device-pixel hairline in panelBorder grey was
          // effectively invisible on a dark panel.
          const on = Math.min(liveAt(frame, e.a.atWord, 8), liveAt(frame, e.b.atWord, 8));
          return (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={on > 0.5 ? hexA(v.a, 0.85) : hexA(v.t.colors.text, 0.3)}
              strokeWidth={on > 0.5 ? 0.85 : 0.5}
              strokeDasharray={e.tree ? undefined : '2 1.6'}
              strokeLinecap="round" />
          );
        })}
        {cells.map((c, i) => {
          const pt = pos.get(c); if (!pt) return null;
          const {x, y} = pt;
          const on = liveAt(frame, c.atWord, 8);
          const p = pulseAt(frame, c.atWord);
          const col = cellColor(v, c);
          const dist = c.value ?? 0;
          return (
            <g key={i} opacity={0.3 + on * 0.7}>
              <circle cx={x} cy={y} r={R + p * 1.2} fill={hexA(col, on > 0.4 ? 0.42 : 0.08)}
                stroke={hexA(col, on > 0.4 ? 1 : 0.45)} strokeWidth={on > 0.4 ? 0.75 : 0.5} />
              <text x={x} y={y + 2.1} textAnchor="middle" fontSize={6.2} fontWeight={800}
                fill={on > 0.4 ? '#fff' : hexA(v.t.colors.muted, 0.85)} fontFamily={v.t.fonts.mono}>{c.label}</text>
              {/* the distance, ON the node */}
              <circle cx={x + R * 0.82} cy={y - R * 0.82} r={3.5}
                fill={on > 0.5 ? v.a : hexA(v.t.colors.panelBorder, 0.9)}
                stroke={hexA(v.t.colors.bg ?? '#000', 0.9)} strokeWidth={0.5} />
              <text x={x + R * 0.82} y={y - R * 0.82 + 1.5} textAnchor="middle" fontSize={4.2} fontWeight={800}
                fill={on > 0.5 ? '#0b0b12' : hexA(v.t.colors.muted, 0.9)} fontFamily={v.t.fonts.mono}>{dist}</text>
              {c.sub ? (
                <text x={x} y={y + R + 5.4} textAnchor="middle" fontSize={4} fontWeight={600}
                  fill={hexA(col, on > 0.5 ? 0.95 : 0.35)} fontFamily={v.t.fonts.mono}>{c.sub}</text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/** DFS — the tree drawn as a tree: real edges, parents centred over their children. */
export const TreeDFS: React.FC<DsaVizProps> = ({cells, aux = [], accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const {nodes, maxX, maxD, key} = layoutTree(cells);

  // The viewBox tracks the tree's ACTUAL extent instead of being a fixed 100-wide
  // box. A single branch is a vertical chain, and stretching that across a fixed
  // wide box made `meet` scale it down to a cluster of small pills in a mostly
  // empty panel. Sized to content, the same chain fills the column.
  const PAD = 11, R = 6.6, GAP = 21, GAP_X = 30;
  // The deepest row carries a caption UNDER it ("↩ back", a role name), so the box
  // needs room below the last node or that caption is sliced off by the viewBox.
  const hasSub = cells.some((c) => c.sub || c.state === 'dropped');
  // A node is as wide as its label, so the BOX has to know the widest one. Sizing
  // the viewBox on node centres alone pushed the outermost pill past the panel edge
  // and it was sliced in half ("[] plain" in EP07 s04).
  const halfWOf = (label: string) => Math.max(R, label.length * 1.85 + 3.2);
  const maxHW = Math.max(...cells.map((c) => halfWOf(c.label ?? '')), R);
  const gapX = Math.max(GAP_X, 2 * maxHW + 7);
  const W = 2 * PAD + 2 * maxHW + maxX * gapX;
  const H = Math.max(2 * PAD + 2 * R, 2 * PAD + maxD * GAP) + (hasSub ? 8 : 0);
  const px = (x: number) => (maxX === 0 ? W / 2 : PAD + maxHW + (x / maxX) * (W - 2 * PAD - 2 * maxHW));
  const py = (d: number) => (maxD === 0 ? H / 2 : PAD + (d / maxD) * (H - PAD * 2 - (hasSub ? 8 : 0)));
  const byKey = new Map(nodes.map((n) => [key(n.cell, cells.indexOf(n.cell)), n]));

  const tree = (
    <div style={{display: 'flex', flex: 1, minHeight: 0, padding: `${6 * v.scale}px ${2 * v.scale}px`}}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{width: '100%', flex: 1, minHeight: 0}}>
        {nodes.map((n, i) => {
          if (!n.parentKey) return null;
          const p = byKey.get(n.parentKey);
          if (!p) return null;
          const on = Math.min(liveAt(frame, n.cell.atWord, 8), liveAt(frame, p.cell.atWord, 8));
          const back = n.cell.state === 'dropped';
          return (
            <line key={`e${i}`} x1={px(p.x)} y1={py(p.depth) + R} x2={px(n.x)} y2={py(n.depth) - R}
              stroke={back ? hexA(v.sem('orange'), 0.75) : on > 0.5 ? hexA(v.a, 0.9) : hexA(v.t.colors.text, 0.32)}
              strokeWidth={on > 0.5 ? 0.9 : 0.55}
              strokeDasharray={back ? '2 1.6' : undefined}
              strokeLinecap="round" />
          );
        })}
        {nodes.map((n, i) => {
          const on = liveAt(frame, n.cell.atWord, 8);
          const p = pulseAt(frame, n.cell.atWord);
          const back = n.cell.state === 'dropped';
          const done = n.cell.state === 'done';
          const col = back ? v.sem('orange') : done ? v.sem('green') : cellColor(v, n.cell);
          return (
            <g key={i} opacity={0.3 + on * 0.7}>
              {/* The node SIZES TO ITS LABEL. A subset node reads "[1,2]" — five mono
                  glyphs — and a fixed circle let the text spill straight over its own
                  border. Anything longer than two characters becomes a pill. */}
              {(() => {
                const label = n.cell.label ?? '';
                const halfW = halfWOf(label) + p * 1.2;
                const halfH = R + p * 1.2;
                const common = {
                  fill: hexA(col, on > 0.4 ? 0.4 : 0.07),
                  stroke: hexA(col, on > 0.4 ? 1 : 0.45),
                  strokeWidth: on > 0.4 ? 0.75 : 0.5,
                  strokeDasharray: back ? '1.6 1.2' : undefined,
                };
                return label.length > 2 ? (
                  <rect x={px(n.x) - halfW} y={py(n.depth) - halfH} width={halfW * 2} height={halfH * 2}
                    rx={halfH} {...common} />
                ) : (
                  <circle cx={px(n.x)} cy={py(n.depth)} r={halfH} {...common} />
                );
              })()}
              <text x={px(n.x)} y={py(n.depth) + 2} textAnchor="middle" fontSize={5.8} fontWeight={800}
                fill={on > 0.4 ? '#fff' : hexA(v.t.colors.muted, 0.85)} fontFamily={v.t.fonts.mono}>{n.cell.label}</text>
              {n.cell.sub || back ? (
                <text x={px(n.x)} y={py(n.depth) + R + 5} textAnchor="middle" fontSize={4} fontWeight={700}
                  fill={back ? v.sem('orange') : hexA(col, on > 0.5 ? 0.95 : 0.35)} fontFamily={v.t.fonts.mono}>
                  {back ? '↩ back' : n.cell.sub}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
  if (!aux.length) return tree;
  return (
    <DualViz
      v={v} leftLabel="the tree" rightLabel="the path so far"
      left={tree}
      right={
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 5 * v.scale, alignContent: 'center', justifyContent: 'center'}}>
          {aux.map((e, i) => {
            const on = liveAt(frame, e.atWord, 8);
            const undone = e.state === 'dropped';
            const col = undone ? v.sem('orange') : cellColor(v, e);
            return (
              <div key={i} style={{
                ...v.mono(16), fontWeight: 700, borderRadius: v.rad(6),
                padding: `${6 * v.scale}px ${12 * v.scale}px`,
                border: `${1.6 * v.scale}px ${undone ? 'dashed' : 'solid'} ${hexA(col, undone ? 0.4 : 0.85)}`,
                background: undone ? 'transparent' : hexA(col, 0.18),
                color: undone ? v.dim : v.t.colors.text,
                opacity: 0.2 + on * 0.8,
                textDecoration: undone ? 'line-through' : undefined,
                transform: `translateY(${(1 - on) * -7 * v.scale}px)`,
              }}>{e.label}</div>
            );
          })}
        </div>
      }
    />
  );
};

/** FAST AND SLOW — the runners named under the nodes, and MEET when they collide. */
export const LinkedRunners: React.FC<DsaVizProps> = ({cells, pointers = [], accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const live = pointers.filter((p) => liveAt(frame, p.atWord) > 0.5);
  const slow = live.find((p) => /slow|s$/i.test(p.label));
  const fast = live.find((p) => /fast|f$/i.test(p.label));
  const meet = slow && fast && slow.at === fast.at;

  // Drawn as a real diagram, not a row of fixed 44px chips. Two faults were fixed
  // here: the nodes never scaled with the panel (a four-node track was a cluster of
  // small circles in a mostly empty pane), and the LOOP-BACK EDGE was never drawn at
  // all — the narration says "four points back to two" while the picture showed a
  // straight line, so the cycle the whole pattern is about was invisible (LAW 0k).
  const n = Math.max(cells.length, 1);
  const GAP = 26, PAD = 12;
  const R = Math.max(7, Math.min(11, 46 / n));
  const W = 2 * PAD + (n - 1) * GAP + 2 * R;
  const idx = new Map(cells.map((c, i) => [c.label ?? String(i), i]));
  const back = cells.flatMap((c, i) =>
    (c.links ?? []).map((l) => ({from: i, to: idx.get(l)})).filter((e) => e.to != null && e.to !== i)
  ) as {from: number; to: number}[];
  const arcDepth = back.length ? R * 2.4 : 0;
  const H = 2 * PAD + 2 * R + arcDepth + 13;
  const cx = (i: number) => PAD + R + i * GAP;
  const cy = PAD + R;

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10 * v.scale, flex: 1, minHeight: 0}}>
      <div style={{display: 'flex', flex: 1, minHeight: 0}}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{width: '100%', flex: 1, minHeight: 0}}>
          <defs>
            <marker id="lr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9 z" fill={hexA(v.t.colors.text, 0.5)} />
            </marker>
            <marker id="lr-arrow-hot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9 z" fill={hexA(v.sem('orange'), 0.95)} />
            </marker>
          </defs>
          {/* next pointers */}
          {cells.slice(0, -1).map((c, i) => (
            <line key={`n${i}`} x1={cx(i) + R} y1={cy} x2={cx(i + 1) - R - 1.6} y2={cy}
              stroke={hexA(v.t.colors.text, 0.5)} strokeWidth={0.9} markerEnd="url(#lr-arrow)" />
          ))}
          {/* the edge that closes the loop, arced UNDER the track so it cannot be mistaken for a next pointer */}
          {back.map((e, i) => {
            const x1 = cx(e.from), x2 = cx(e.to), yb = cy + R + arcDepth;
            return (
              <path key={`b${i}`} d={`M ${x1} ${cy + R} C ${x1} ${yb}, ${x2} ${yb}, ${x2} ${cy + R + 1.6}`}
                fill="none" stroke={hexA(v.sem('orange'), 0.9)} strokeWidth={1.1} markerEnd="url(#lr-arrow-hot)" />
            );
          })}
          {cells.map((c, i) => {
            const on = liveAt(frame, c.atWord);
            const p = pulseAt(frame, c.atWord);
            const col = cellColor(v, c);
            const isS = slow?.at === i, isF = fast?.at === i;
            const held = isS || isF;
            const tagText = isS && isF ? 'MEET' : isS ? 'slow' : isF ? 'fast' : null;
            const tagCol = isS && isF ? v.sem('purple') : isS ? v.sem('blue') : v.sem('red');
            return (
              <g key={i} opacity={0.35 + Math.max(on, held ? 1 : 0) * 0.65}>
                <circle cx={cx(i)} cy={cy} r={R + p * 1.2}
                  fill={held ? hexA(tagCol, 0.45) : hexA(col, on > 0.4 ? 0.12 : 0.05)}
                  stroke={hexA(held ? tagCol : col, held ? 1 : on > 0.4 ? 0.6 : 0.35)}
                  strokeWidth={held ? 1.1 : 0.7} />
                <text x={cx(i)} y={cy + R * 0.34} textAnchor="middle" fontSize={R * 0.95} fontWeight={800}
                  fill={held ? '#fff' : on > 0.4 ? v.t.colors.text : hexA(v.t.colors.muted, 0.8)}
                  fontFamily={v.t.fonts.mono}>{c.label}</text>
                {tagText ? (
                  <text x={cx(i)} y={cy + R + arcDepth + 9} textAnchor="middle" fontSize={R * 0.72} fontWeight={800}
                    fill={tagCol} fontFamily={v.t.fonts.mono}>{tagText}</text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{...v.body(15.5), color: meet ? v.sem('purple') : v.dim, textAlign: 'center', fontWeight: meet ? 700 : 400}}>
        {meet
          ? 'they landed on the same node — that only happens inside a loop'
          : 'one step versus two: in a loop the gap closes by one every turn'}
      </div>
    </div>
  );
};

/** SIGNAL MATCH — the words in the question that give the pattern away. */
export const SignalMatch: React.FC<DsaVizProps> = ({cells, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  // Same budget rule as the cost chart — a seven-signal card must not push its
  // last row off the panel, and must not ride up over the problem statement.
  const rows = Math.max(cells.length, 1);
  const budget = stackBudget(v);
  const rowH = Math.max(34, Math.min(v.vertical ? 150 : 62, budget / rows - 8));
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: Math.max(5, rowH * 0.14) * v.scale, width: '100%'}}>
      {cells.map((c, i) => {
        const on = liveAt(frame, c.atWord);
        const p = pulseAt(frame, c.atWord);
        const col = cellColor(v, c);
        return (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 14 * v.scale, opacity: 0.3 + on * 0.7,
              // a full-width block, so the row occupies the pane it was given instead
              // of a short line of text floating against a large empty panel
              background: on > 0.5 ? hexA(col, 0.09) : hexA(v.t.colors.panel, 0.3),
              border: `${1.4 * v.scale}px solid ${on > 0.5 ? hexA(col, 0.5) : hexA(v.t.colors.panelBorder, 0.45)}`,
              borderRadius: v.rad(8), padding: `${Math.max(6, rowH * 0.17) * v.scale}px ${14 * v.scale}px`, minHeight: rowH * v.scale, boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                ...v.mono(16.5), fontWeight: 700, flex: '0 0 auto',
                border: `${1.6 * v.scale}px solid ${on > 0.4 ? hexA(col, 0.85) : hexA(v.t.colors.panelBorder, 0.6)}`,
                background: hexA(col, on > 0.4 ? 0.18 + p * 0.25 : 0.04),
                borderRadius: v.rad(999), padding: `${5 * v.scale}px ${15 * v.scale}px`,
                color: on > 0.4 ? col : v.dim,
                transform: `scale(${1 + p * 0.05})`,
              }}
            >
              “{c.label}”
            </div>
            <div style={{...v.mono(15), color: v.dim, flex: '0 0 auto'}}>→</div>
            <div style={{...v.body(16.5), color: on > 0.5 ? v.t.colors.text : v.dim, flex: 1, minWidth: 0, fontWeight: 600}}>{c.sub}</div>
          </div>
        );
      })}
    </div>
  );
};

/** BRUTE VS OPTIMAL — the same input, two operation counts, drawn to scale. */
export const BruteVsOpt: React.FC<DsaVizProps> = ({cells, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const max = Math.max(...cells.map((c) => c.value ?? 1), 1);
  // Bars fill the panel instead of stacking as thin slivers against the top edge,
  // and every bar keeps a visible minimum: the whole point of this beat is a
  // comparison, and a bar rendered as a 1px stub cannot be compared to anything.
  // Budget the ACTUAL panel. A flex column that is centred and taller than its box
  // overflows in BOTH directions, so an over-tall chart rode up over the premise
  // line and lost its last bar off the bottom (EP04, six bars). Each row costs the
  // bar, its gap, and the label line above it.
  const n = Math.max(cells.length, 1);
  const AVAIL = stackBudget(v);                   // panel height less premise + chrome
  const LABEL = v.vertical ? 44 : 30;
  const barH = Math.max(18, Math.min(v.vertical ? 84 : 52, (AVAIL / n - LABEL) / 1.42));
  const labFont = Math.max(15, Math.min(v.vertical ? 34 : 26, barH * 0.52));
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: Math.max(12, barH * 0.42) * v.scale, justifyContent: 'center', width: '100%'}}>
      {cells.map((c, i) => {
        const on = liveAt(frame, c.atWord, 14);
        const slow = c.state === 'dropped';
        const col = slow ? v.sem('red') : v.sem('green');
        const pct = Math.max(2.5, ((c.value ?? 1) / max) * 100);
        return (
          <div key={i}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 * v.scale}}>
              <div style={{...v.mono(labFont), fontWeight: 700, color: on > 0.4 ? col : v.dim}}>{c.label}</div>
              <div style={{...v.mono(labFont * 0.86), color: on > 0.4 ? hexA(v.t.colors.text, 0.9) : v.dim, fontWeight: 700, whiteSpace: 'nowrap'}}>{c.sub}</div>
            </div>
            <div style={{height: barH * v.scale, background: hexA(v.t.colors.panelBorder, 0.25), borderRadius: 999, marginTop: 6 * v.scale, overflow: 'hidden'}}>
              <div style={{height: '100%', width: `${pct * on}%`, background: hexA(col, 0.8), borderRadius: 999}} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** THE SIX-STEP METHOD — a numbered ladder you climb, one rung lit at a time. */
export const FrameworkLadder: React.FC<DsaVizProps> = ({cells, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  // The rungs fill the pane they are given. Fixed 28px badges and 16px labels made
  // a six-step ladder unreadable at phone size in a 1180px-tall Shorts pane.
  const n = Math.max(cells.length, 1);
  const rowH = Math.max(46, Math.min(v.vertical ? 150 : 74, stackBudget(v) / n - 6));
  const labFont = Math.max(16, Math.min(v.vertical ? 34 : 21, rowH * 0.26));
  const subFont = Math.max(13, labFont * 0.62);
  const badge = Math.max(28, rowH * 0.42);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: Math.max(5, rowH * 0.09) * v.scale, width: '100%'}}>
      {cells.map((c, i) => {
        const on = liveAt(frame, c.atWord);
        const col = cellColor(v, c);
        return (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: Math.max(11, badge * 0.4) * v.scale,
              opacity: 0.28 + on * 0.72, minHeight: rowH * v.scale, boxSizing: 'border-box',
              border: `${1.5 * v.scale}px solid ${on > 0.5 ? hexA(col, 0.75) : hexA(v.t.colors.panelBorder, 0.5)}`,
              background: on > 0.5 ? hexA(col, 0.1) : 'transparent',
              borderRadius: v.rad(7),
              padding: `${Math.max(7, rowH * 0.14) * v.scale}px ${Math.max(11, rowH * 0.2) * v.scale}px`,
              marginLeft: `${i * 3}%`,
            }}
          >
            <div
              style={{
                flex: '0 0 auto', width: badge * v.scale, height: badge * v.scale, borderRadius: 999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: on > 0.5 ? hexA(col, 0.85) : hexA(v.t.colors.panelBorder, 0.5),
                ...v.mono(badge * 0.5), fontWeight: 800, color: on > 0.5 ? v.t.colors.bg : v.dim,
              }}
            >
              {i + 1}
            </div>
            <div style={{minWidth: 0}}>
              <div style={{...v.body(labFont), fontWeight: 700, color: on > 0.5 ? v.t.colors.text : v.dim}}>{c.label}</div>
              <div style={{...v.body(subFont), color: v.dim, marginTop: 2 * v.scale}}>{c.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Full-width stage for the beats that have no code to read — the six-step method,
 * the signal words, the cost comparison. Forcing an empty editor beside them would
 * be a card pretending to be a trace.
 */
export const SoloStage: React.FC<{
  accent: SemColor; caption?: string; vars?: DsaVizProps['vars']; premise?: string; children: React.ReactNode;
}> = ({accent, caption, vars, premise, children}) => (
  <div style={{display: 'flex', width: '100%', height: '100%'}}>
    <StatePane caption={caption} accent={accent} vars={vars} premise={premise}>{children}</StatePane>
  </div>
);

// ── dispatcher ───────────────────────────────────────────────────────────────
const VIZ: Record<string, React.FC<DsaVizProps>> = {
  'array-ptrs': ArrayPointers, 'array-window': ArrayWindow, 'array-bsearch': ArrayBSearch,
  'dp-table': DpTable, 'intervals': IntervalBars, 'hashmap': HashBuckets, 'stack': StackPlates,
  'grid': GridBFS, 'tree': TreeDFS, 'linkedlist': LinkedRunners,
  'signal-match': SignalMatch, 'brute-vs-opt': BruteVsOpt, 'framework': FrameworkLadder,
};
export const AlgoViz: React.FC<DsaVizProps & {kind: string}> = ({kind, ...p}) => {
  // Was `?? SignalMatch` — a typo drew a real, wrong picture. See src/unknownKind.tsx.
  const R = VIZ[kind];
  if (!R) return <UnknownKind kind={kind} registry="dsaViz VIZ" />;
  return <R {...p} />;
};
