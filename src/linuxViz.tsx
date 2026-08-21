import React from 'react';
import {UnknownKind} from './unknownKind';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme, wordToFrame} from './themes';
import {SemColor} from './types';
import {useScale, useSem, hexA} from './ui';
import {stackBudget} from './dsaViz';

// LINUX VIZ — the right-hand pictures for the 109-command masterclass.
//
// WHY THIS FILE EXISTS (owner, 2026-08-18): *"This is lazy ass animation work, just
// displaying components and highlighting them while speaking about it. Does it help?
// Just showing text and highlighting it DOES NOT WORK AT ALL."* Correct. The first
// cut routed all 110 commands through six generic archetypes — rows, tree, meters,
// flow, perms, hops — so every command was a labelled box that lit up. What a viewer
// needs to see is WHAT HAPPENS: the puck moving while the tree stays still, the link
// count going up, the signal being caught or not caught, the cache segment shrinking.
//
// So this file holds one depiction per idea, not one card per command. They share
// PLUMBING (the atoms below, theme tokens, the anchor rule) the way every component
// in this repo shares ui.tsx — never a shared card standing in for the idea.
//
// THE ONE RULE, unchanged: every moment resolves from an element's own `atWord` via
// wordToFrame. There is no fixed interval in this file. sync.mjs rewrites each anchor
// to the exact frame its word is spoken, so honouring the anchor is what keeps the
// picture on the voice.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export interface VizItem {
  label?: string;
  sub?: string;
  text?: string;
  value?: number;
  color?: SemColor;
  atWord?: number;
  /** Chart data. A real measured series, one number per sample, in order — the
   *  thing a chart component plots. Without it there is nothing to draw but a
   *  fake shape, which is exactly what the old sparkline did (LAW 0m). */
  series?: number[];
  /** Unit shown on the axis and beside the live read-out ("MB/s", "%", "req/s"). */
  unit?: string;
  /** A reference line worth naming: capacity, a limit, a saturation point. */
  threshold?: number;
  /** Three x-axis labels: first, middle, last sample ("14:00", "14:40", "15:10"). */
  xLabels?: string[];
  /** Verbatim lines of real output, for depictions that show text rather than shape
   *  (the journal, a listing). One string per line. */
  out?: string[];
}
export interface VizProps {
  items: VizItem[];
  accent: SemColor;
  perms?: string;
  permsAtWord?: number;
  token?: string;
}

/** 0 → 1 as the anchored word is spoken. The only clock in this file.
 *  Pure, not a hook, so a renderer can resolve a whole list of anchors inside a
 *  map without calling hooks in a loop. */
export const liveAt = (frame: number, atWord?: number, ramp = 9) => {
  if (atWord == null) return 1;
  const s = wordToFrame(atWord);
  return interpolate(frame, [s, s + ramp], [0, 1], clamp);
};
export const useLive = (atWord?: number, ramp = 9) => liveAt(useCurrentFrame(), atWord, ramp);
/** 0 → 1 → 0: a brief emphasis pulse when the word lands, for things that MOVE. */
export const usePulse = (atWord?: number, dur = 26) => {
  const frame = useCurrentFrame();
  if (atWord == null) return 0;
  const s = wordToFrame(atWord);
  return interpolate(frame, [s, s + dur * 0.35, s + dur], [0, 1, 0], clamp);
};

// ── atoms ────────────────────────────────────────────────────────────────────
const useViz = (accent: SemColor) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  return {
    t, sem, scale, vertical,
    a: sem(accent),
    rad: (n = 8) => n * scale * t.style.cornerRadius,
    mono: (n = 18) => ({fontFamily: t.fonts.mono, fontSize: n * scale}),
    body: (n = 17) => ({fontFamily: t.fonts.body, fontSize: n * scale}),
    line: hexA(t.colors.panelBorder, 0.9),
    dim: hexA(t.colors.muted, 0.9),
  };
};

/** A labelled slab that fades and lifts in on its own anchor. */
const Slab: React.FC<{
  item: VizItem; accent: string; scale: number; t: any; rad: number;
  strong?: boolean; children?: React.ReactNode;
}> = ({item, accent, scale, t, rad, strong, children}) => {
  const on = useLive(item.atWord);
  const c = item.color ? accent : accent;
  return (
    <div
      style={{
        opacity: 0.2 + on * 0.8,
        transform: `translateY(${(1 - on) * 7 * scale}px)`,
        border: `${1.6 * scale}px solid ${on > 0.5 ? hexA(c, 0.75) : hexA(t.colors.panelBorder, 0.7)}`,
        background: on > 0.5 ? hexA(c, strong ? 0.2 : 0.1) : hexA(t.colors.panel, 0.4),
        borderRadius: rad,
        padding: `${7 * scale}px ${11 * scale}px`,
        minWidth: 0,
      }}
    >
      {children}
    </div>
  );
};

const Label: React.FC<{v?: string; s: any; c?: string; w?: number}> = ({v, s, c, w}) =>
  v ? <div style={{...s, color: c, fontWeight: w ?? 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{v}</div> : null;

const Sub: React.FC<{v?: string; s: any; c: string}> = ({v, s, c}) =>
  v ? <div style={{...s, color: c, marginTop: 2, lineHeight: 1.35}}>{v}</div> : null;

/** Vertical stack that fills the pane without crushing rows. */
const Stack: React.FC<{gap: number; children: React.ReactNode}> = ({gap, children}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap, minHeight: 0, justifyContent: 'center', flex: 1}}>
    {children}
  </div>
);

// ══ FILESYSTEM ═══════════════════════════════════════════════════════════════

/** Nodes stay pinned; a YOU ARE HERE puck walks them. `value` is depth. */
export const FsTree: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const nodes = items.filter((i) => i.value != null);
  const notes = items.filter((i) => i.value == null);
  // A beat list with no depths is not a tree; render it as one honest column
  // rather than an empty pane beside a list.
  const noTree = nodes.length === 0;
  // the puck sits on the last node whose word has been spoken
  let here = -1;
  nodes.forEach((n, i) => { if (n.atWord != null && frame >= wordToFrame(n.atWord)) here = i; });
  return (
    <div style={{display: 'flex', gap: 14 * v.scale, flex: 1, minHeight: 0}}>
      {noTree ? null : (
      <div style={{flex: '1 1 62%', display: 'flex', flexDirection: 'column', gap: 6 * v.scale, justifyContent: 'center'}}>
        {nodes.map((n, i) => {
          const on = liveAt(frame, n.atWord);
          const isHere = i === here;
          const d = Math.min(n.value ?? 0, 5);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8 * v.scale, paddingLeft: d * 20 * v.scale}}>
              {d > 0 ? (
                <div style={{width: 12 * v.scale, height: 1.6 * v.scale, background: hexA(v.t.colors.panelBorder, 0.85)}} />
              ) : null}
              <div
                style={{
                  ...v.mono(19), fontWeight: 700,
                  color: isHere ? v.a : hexA(v.t.colors.text, 0.55 + on * 0.4),
                  border: `${1.6 * v.scale}px solid ${isHere ? hexA(v.a, 0.85) : hexA(v.t.colors.panelBorder, 0.6)}`,
                  background: isHere ? hexA(v.a, 0.18) : hexA(v.t.colors.panel, 0.35),
                  borderRadius: v.rad(7), padding: `${4 * v.scale}px ${10 * v.scale}px`, whiteSpace: 'nowrap',
                }}
              >
                {n.label}
              </div>
              {isHere ? (
                <div style={{...v.body(13), color: v.a, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700}}>
                  you are here
                </div>
              ) : n.sub ? (
                <div style={{...v.body(14), color: v.dim, opacity: on}}>{n.sub}</div>
              ) : null}
            </div>
          );
        })}
      </div>)}
      <div style={{flex: noTree ? 1 : '1 1 38%', display: 'flex', flexDirection: 'column', gap: 6 * v.scale, justifyContent: 'center', minWidth: 0}}>
        {notes.map((n, i) => (
          <Slab key={i} item={n} accent={v.a} scale={v.scale} t={v.t} rad={v.rad(7)}>
            <Label v={n.label} s={v.body(15)} c={v.t.colors.text} />
            <Sub v={n.sub} s={v.body(13)} c={v.dim} />
          </Slab>
        ))}
      </div>
    </div>
  );
};

/** One data block on the right; names point AT it. A symlink points at a NAME. */
export const FsInode: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <div style={{display: 'flex', gap: 16 * v.scale, alignItems: 'center', flex: 1, minHeight: 0}}>
      <Stack gap={7 * v.scale}>
        {items.map((it, i) => {
          const on = liveAt(frame, it.atWord);
          const broken = /dangl|snap|gone|unreach/i.test(`${it.label} ${it.sub}`);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8 * v.scale, opacity: 0.25 + on * 0.75}}>
              <div style={{flex: 1, minWidth: 0}}>
                <Slab item={it} accent={v.a} scale={v.scale} t={v.t} rad={v.rad(7)}>
                  <Label v={it.label} s={v.mono(15)} c={broken ? v.sem('red') : v.t.colors.text} />
                  <Sub v={it.sub} s={v.body(13)} c={v.dim} />
                </Slab>
              </div>
              <svg width={34 * v.scale} height={12 * v.scale} style={{flex: '0 0 auto'}}>
                <line
                  x1={0} y1={6 * v.scale} x2={34 * v.scale} y2={6 * v.scale}
                  stroke={broken ? v.sem('red') : v.a} strokeWidth={1.8 * v.scale}
                  strokeDasharray={broken ? `${4 * v.scale} ${4 * v.scale}` : undefined}
                  opacity={on * (broken ? 0.5 : 1)}
                />
              </svg>
            </div>
          );
        })}
      </Stack>
      <div
        style={{
          flex: '0 0 auto', border: `${2.2 * v.scale}px solid ${hexA(v.a, 0.85)}`, borderRadius: v.rad(9),
          background: hexA(v.a, 0.14), padding: `${16 * v.scale}px ${14 * v.scale}px`, textAlign: 'center',
        }}
      >
        <div style={{...v.mono(13), color: v.dim, letterSpacing: 1}}>INODE</div>
        <div style={{...v.mono(22), color: v.a, fontWeight: 700, marginTop: 4 * v.scale}}>4812</div>
        <div style={{...v.body(12), color: v.dim, marginTop: 6 * v.scale}}>the data<br />on disk</div>
      </div>
    </div>
  );
};

/** Directory rows growing metadata columns, each column on its own word. */
export const FsListing: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={7 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        return (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'baseline', gap: 10 * v.scale,
              borderLeft: `${3 * v.scale}px solid ${on > 0.5 ? v.a : hexA(v.t.colors.panelBorder, 0.6)}`,
              paddingLeft: 10 * v.scale, opacity: 0.28 + on * 0.72,
              transform: `translateX(${(1 - on) * -8 * v.scale}px)`,
            }}
          >
            <div style={{...v.mono(17), color: on > 0.5 ? v.a : v.t.colors.text, fontWeight: 700, flex: '0 0 auto'}}>
              {it.label}
            </div>
            <div style={{...v.body(14), color: v.dim, minWidth: 0}}>{it.sub}</div>
          </div>
        );
      })}
    </Stack>
  );
};

/** The tree is walked; each file is stamped kept or rejected as it is tested. */
export const FsWalk: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={6 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const rejected = /not a|too old|reject|is not/i.test(`${it.label} ${it.sub}`);
        const isFile = /\./.test(it.label ?? '');
        const c = !isFile ? v.t.colors.muted : rejected ? v.sem('red') : v.sem('green');
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 9 * v.scale, opacity: 0.25 + on * 0.75}}>
            {isFile ? (
              <div
                style={{
                  ...v.mono(12), flex: '0 0 auto', width: 22 * v.scale, height: 22 * v.scale,
                  borderRadius: 999, border: `${1.6 * v.scale}px solid ${hexA(c, 0.9)}`,
                  color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                }}
              >
                {rejected ? '✕' : '✓'}
              </div>
            ) : (
              <div style={{flex: '0 0 auto', width: 22 * v.scale, height: 2 * v.scale, background: hexA(v.a, 0.7)}} />
            )}
            <div style={{...v.mono(16), color: isFile ? c : v.t.colors.text, fontWeight: 600}}>{it.label}</div>
            <div style={{...v.body(13.5), color: v.dim, minWidth: 0}}>{it.sub}</div>
          </div>
        );
      })}
    </Stack>
  );
};

/** System files as cards, each having a line physically written into it. */
export const FsWrites: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 * v.scale, flex: 1, alignContent: 'center', minHeight: 0}}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const absent = /not created|still|no -m|skips|without/i.test(`${it.label} ${it.sub}`);
        const c = absent ? v.sem('red') : v.a;
        return (
          <div
            key={i}
            style={{
              border: `${1.6 * v.scale}px solid ${on > 0.5 ? hexA(c, 0.8) : hexA(v.t.colors.panelBorder, 0.6)}`,
              borderRadius: v.rad(7), padding: `${8 * v.scale}px ${10 * v.scale}px`,
              background: hexA(v.t.colors.panel, 0.4), opacity: 0.28 + on * 0.72, minWidth: 0,
            }}
          >
            <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? c : v.t.colors.text} />
            <div style={{height: 3 * v.scale, marginTop: 6 * v.scale, background: hexA(v.t.colors.panelBorder, 0.5), borderRadius: 999}}>
              <div style={{height: '100%', width: `${on * 100}%`, background: hexA(c, 0.85), borderRadius: 999}} />
            </div>
            <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
          </div>
        );
      })}
    </div>
  );
};

/** A disk grafted onto a folder; what was there is pushed underneath, greyed. */
export const MountTree: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={7 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const hidden = /hidden|underneath|already/i.test(`${it.label} ${it.sub}`);
        const d = it.value ?? 0;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8 * v.scale, paddingLeft: d * 18 * v.scale, opacity: 0.25 + on * 0.75}}>
            <div
              style={{
                ...v.mono(16), fontWeight: 700, borderRadius: v.rad(6),
                padding: `${4 * v.scale}px ${9 * v.scale}px`, whiteSpace: 'nowrap',
                color: hidden ? v.dim : on > 0.5 ? v.a : v.t.colors.text,
                border: `${1.5 * v.scale}px ${hidden ? 'dashed' : 'solid'} ${hidden ? hexA(v.t.colors.panelBorder, 0.8) : hexA(v.a, 0.7)}`,
                background: hidden ? 'transparent' : hexA(v.a, 0.12),
                textDecoration: hidden ? 'line-through' : undefined,
              }}
            >
              {it.label}
            </div>
            <div style={{...v.body(13.5), color: v.dim, minWidth: 0}}>{it.sub}</div>
          </div>
        );
      })}
    </Stack>
  );
};

/** A file card whose byte counter freezes while two clock hands sweep. */
export const FileClocks: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const clocks = items.filter((i) => /time|clock/i.test(`${i.label}`));
  const rest = items.filter((i) => !/time|clock/i.test(`${i.label}`));
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12 * v.scale, flex: 1, justifyContent: 'center', minHeight: 0}}>
      <Stack gap={6 * v.scale}>
        {rest.map((it, i) => (
          <Slab key={i} item={it} accent={v.a} scale={v.scale} t={v.t} rad={v.rad(7)}>
            <Label v={it.label} s={v.mono(15)} c={v.t.colors.text} />
            <Sub v={it.sub} s={v.body(13)} c={v.dim} />
          </Slab>
        ))}
      </Stack>
      <div style={{display: 'flex', gap: 14 * v.scale, justifyContent: 'center'}}>
        {clocks.map((it, i) => {
          const on = liveAt(frame, it.atWord, 22);
          const ang = on * 300;
          const R = 26 * v.scale;
          return (
            <div key={i} style={{textAlign: 'center'}}>
              <svg width={R * 2} height={R * 2}>
                <circle cx={R} cy={R} r={R - 2 * v.scale} fill="none"
                  stroke={on > 0.1 ? hexA(v.a, 0.85) : hexA(v.t.colors.panelBorder, 0.7)} strokeWidth={2 * v.scale} />
                <line x1={R} y1={R} x2={R + (R - 9 * v.scale) * Math.sin((ang * Math.PI) / 180)}
                  y2={R - (R - 9 * v.scale) * Math.cos((ang * Math.PI) / 180)}
                  stroke={v.a} strokeWidth={2.4 * v.scale} strokeLinecap="round" />
              </svg>
              <div style={{...v.mono(12.5), color: on > 0.3 ? v.a : v.dim, fontWeight: 700}}>{it.label}</div>
              <div style={{...v.body(11.5), color: v.dim}}>{it.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Two file cards; bytes visibly duplicate across into the second. */
export const FileBytes: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={8 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const blocks = 8;
        return (
          <div key={i} style={{opacity: 0.28 + on * 0.72}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 8 * v.scale}}>
              <Label v={it.label} s={v.mono(15)} c={on > 0.5 ? v.a : v.t.colors.text} />
              <div style={{...v.body(13), color: v.dim, minWidth: 0}}>{it.sub}</div>
            </div>
            <div style={{display: 'flex', gap: 3 * v.scale, marginTop: 4 * v.scale}}>
              {Array.from({length: blocks}).map((_, b) => (
                <div key={b}
                  style={{
                    flex: 1, height: 9 * v.scale, borderRadius: 2 * v.scale,
                    background: b / blocks < on ? hexA(v.a, 0.75) : hexA(v.t.colors.panelBorder, 0.45),
                  }} />
              ))}
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

/** The file itself, as lines. Matching lines lift; the rest dim away. */
export const FileContent: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={5 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const bad = /no way|cannot|faster than|useless|scrolls/i.test(`${it.label} ${it.sub}`);
        return (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'baseline', gap: 10 * v.scale,
              padding: `${5 * v.scale}px ${9 * v.scale}px`, borderRadius: v.rad(5),
              background: on > 0.5 ? hexA(bad ? v.sem('red') : v.a, 0.13) : 'transparent',
              borderLeft: `${2.5 * v.scale}px solid ${on > 0.5 ? (bad ? v.sem('red') : v.a) : hexA(v.t.colors.panelBorder, 0.45)}`,
              opacity: 0.3 + on * 0.7,
              transform: `translateX(${on * 5 * v.scale}px)`,
            }}
          >
            <div style={{...v.mono(15.5), color: v.t.colors.text, fontWeight: 600, flex: '0 0 auto'}}>{it.label}</div>
            <div style={{...v.body(13.5), color: v.dim, minWidth: 0}}>{it.sub}</div>
          </div>
        );
      })}
    </Stack>
  );
};

/** A viewport frame over a long document, moving only where the tool allows. */
export const FileViewport: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  let pos = 0;
  items.forEach((it, i) => { if (it.atWord != null && frame >= wordToFrame(it.atWord)) pos = i; });
  const rows = 9;
  return (
    <div style={{display: 'flex', gap: 14 * v.scale, flex: 1, minHeight: 0, alignItems: 'stretch'}}>
      <div style={{flex: '0 0 34%', position: 'relative', border: `${1.5 * v.scale}px solid ${v.line}`, borderRadius: v.rad(6), overflow: 'hidden'}}>
        {Array.from({length: rows}).map((_, r) => (
          <div key={r} style={{height: `${100 / rows}%`, borderBottom: `${1 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.35)}`,
            background: hexA(v.t.colors.muted, 0.05 + (r % 3) * 0.02)}} />
        ))}
        <div
          style={{
            position: 'absolute', left: 0, right: 0,
            top: `${Math.min(pos, rows - 3) * (100 / rows)}%`, height: `${(100 / rows) * 3}%`,
            border: `${2.2 * v.scale}px solid ${v.a}`, background: hexA(v.a, 0.16), borderRadius: v.rad(4),
          }}
        />
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <Stack gap={6 * v.scale}>
          {items.map((it, i) => {
            const blocked = /cannot|not possible|no way back|quits/i.test(`${it.label} ${it.sub}`);
            return (
              <Slab key={i} item={it} accent={blocked ? v.sem('red') : v.a} scale={v.scale} t={v.t} rad={v.rad(6)}>
                <Label v={it.label} s={v.mono(14.5)} c={v.t.colors.text} />
                <Sub v={it.sub} s={v.body(13)} c={v.dim} />
              </Slab>
            );
          })}
        </Stack>
      </div>
    </div>
  );
};

/** The terminal as two regions: the visible screen, and the scrollback above it. */
export const TermBuffer: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={7 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const cleared = /empty|cleared|goes too|gone/i.test(`${it.label} ${it.sub}`);
        return (
          <div key={i} style={{opacity: 0.28 + on * 0.72}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 8 * v.scale}}>
              <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? v.a : v.t.colors.text} />
              <div style={{...v.body(12.5), color: v.dim, minWidth: 0}}>{it.sub}</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 2 * v.scale, marginTop: 4 * v.scale}}>
              {[0.92, 0.7, 0.84].map((w, k) => (
                <div key={k}
                  style={{
                    height: 5 * v.scale, width: `${w * 100}%`, borderRadius: 999,
                    background: cleared && on > 0.5 ? hexA(v.t.colors.panelBorder, 0.3) : hexA(v.a, 0.5),
                    opacity: cleared && on > 0.5 ? 0.35 : 1,
                  }} />
              ))}
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

// ══ PERMISSIONS AND IDENTITY ═════════════════════════════════════════════════

/** Nine physical switches in three banks, with the octal digit each bank makes. */
export const PermSwitches: React.FC<VizProps> = ({items, accent, perms = 'rwxr-xr-x', permsAtWord}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const banks = ['owner', 'group', 'other'];
  const start = permsAtWord != null ? wordToFrame(permsAtWord) : 0;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12 * v.scale, flex: 1, justifyContent: 'center', minHeight: 0}}>
      <div style={{display: 'flex', gap: 10 * v.scale, justifyContent: 'center'}}>
        {banks.map((b, bi) => {
          const bits = [0, 1, 2].map((k) => perms[bi * 3 + k] !== '-');
          const oct = (bits[0] ? 4 : 0) + (bits[1] ? 2 : 0) + (bits[2] ? 1 : 0);
          // each bank flips a beat after the previous one, off the SAME anchor
          const bankOn = interpolate(frame, [start + bi * 10, start + bi * 10 + 12], [0, 1], clamp);
          return (
            <div key={b} style={{textAlign: 'center', flex: 1, minWidth: 0}}>
              <div style={{...v.body(12.5), color: v.dim, letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 5 * v.scale}}>{b}</div>
              <div style={{display: 'flex', gap: 4 * v.scale, justifyContent: 'center'}}>
                {['r', 'w', 'x'].map((ch, k) => {
                  const lit = bits[k] && bankOn > 0.5;
                  return (
                    <div key={ch}
                      style={{
                        width: 30 * v.scale, height: 38 * v.scale, borderRadius: v.rad(6),
                        border: `${1.8 * v.scale}px solid ${lit ? hexA(v.a, 0.9) : hexA(v.t.colors.panelBorder, 0.7)}`,
                        background: lit ? hexA(v.a, 0.22) : hexA(v.t.colors.panel, 0.35),
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                        padding: `${4 * v.scale}px 0`,
                      }}>
                      {/* the throw of the switch, not a colour change */}
                      <div style={{
                        width: 14 * v.scale, height: 7 * v.scale, borderRadius: 999,
                        background: lit ? v.a : hexA(v.t.colors.panelBorder, 0.9),
                        transform: `translateY(${lit ? 0 : 14 * v.scale}px)`,
                      }} />
                      <div style={{...v.mono(14), color: lit ? v.a : v.dim, fontWeight: 700}}>{bits[k] ? ch : '–'}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{
                ...v.mono(24), fontWeight: 700, marginTop: 6 * v.scale,
                color: bankOn > 0.5 ? v.a : v.dim, opacity: 0.35 + bankOn * 0.65,
              }}>{oct}</div>
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 6 * v.scale, justifyContent: 'center'}}>
        {items.map((it, i) => (
          <div key={i} style={{flex: '1 1 46%', minWidth: 0}}>
            <Slab item={it} accent={v.a} scale={v.scale} t={v.t} rad={v.rad(6)}>
              <Label v={it.label} s={v.mono(13.5)} c={v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12)} c={v.dim} />
            </Slab>
          </div>
        ))}
      </div>
    </div>
  );
};

/** A gate: denied bounces off it, sudo opens it, and the badge is handed back. */
export const AuthGate: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={6 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const denied = /denied|not allowed/i.test(`${it.label} ${it.sub}`);
        const c = denied ? v.sem('red') : v.a;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 9 * v.scale, opacity: 0.26 + on * 0.74}}>
            <div style={{
              flex: '0 0 auto', width: 6 * v.scale, height: 30 * v.scale, borderRadius: 999,
              background: on > 0.5 ? hexA(c, 0.9) : hexA(v.t.colors.panelBorder, 0.5),
              transform: `scaleY(${0.5 + on * 0.5})`,
            }} />
            <div style={{minWidth: 0}}>
              <Label v={it.label} s={v.mono(15)} c={on > 0.5 ? c : v.t.colors.text} />
              <Sub v={it.sub} s={v.body(13)} c={v.dim} />
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

/** Group membership as chips that are added — or that fall away. */
export const GroupSets: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={9 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const lost = /gone|replace|locked out/i.test(`${it.label} ${it.sub}`);
        const chips = (it.label ?? '').split(/,\s*/);
        return (
          <div key={i} style={{opacity: 0.28 + on * 0.72}}>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 5 * v.scale}}>
              {chips.map((c, k) => (
                <div key={k} style={{
                  ...v.mono(14), padding: `${3 * v.scale}px ${8 * v.scale}px`, borderRadius: v.rad(5),
                  border: `${1.5 * v.scale}px solid ${lost ? hexA(v.sem('red'), 0.7) : hexA(v.a, 0.7)}`,
                  color: lost ? v.sem('red') : v.a,
                  background: hexA(lost ? v.sem('red') : v.a, 0.12),
                  textDecoration: lost ? 'line-through' : undefined,
                  opacity: lost ? 0.55 : 1,
                }}>{c}</div>
              ))}
            </div>
            <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
          </div>
        );
      })}
    </Stack>
  );
};

/** A one-way funnel: the arrow back out is drawn broken. */
export const HashOneway: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={5 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const nope = /never|no way back|nobody|not/i.test(`${it.label} ${it.sub}`);
        const w = 100 - i * 7;
        return (
          <div key={i} style={{display: 'flex', justifyContent: 'center', opacity: 0.26 + on * 0.74}}>
            <div style={{
              width: `${Math.max(w, 52)}%`, textAlign: 'center',
              border: `${1.6 * v.scale}px ${nope ? 'dashed' : 'solid'} ${nope ? hexA(v.sem('red'), 0.8) : hexA(v.a, on > 0.5 ? 0.8 : 0.4)}`,
              background: nope ? hexA(v.sem('red'), 0.1) : hexA(v.a, on > 0.5 ? 0.13 : 0.05),
              borderRadius: v.rad(6), padding: `${6 * v.scale}px ${10 * v.scale}px`,
            }}>
              <Label v={it.label} s={v.mono(14)} c={nope ? v.sem('red') : v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12)} c={v.dim} />
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

/** Each login as its own terminal card — which is what makes "sessions" concrete. */
export const SessionList: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={7 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const isCard = /pts|tty|\d{2}:\d{2}|reboot/i.test(`${it.label} ${it.sub}`);
        if (!isCard) {
          return (
            <Slab key={i} item={it} accent={v.a} scale={v.scale} t={v.t} rad={v.rad(6)}>
              <Label v={it.label} s={v.body(14)} c={v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
            </Slab>
          );
        }
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 9 * v.scale, opacity: 0.28 + on * 0.72,
            border: `${1.5 * v.scale}px solid ${on > 0.5 ? hexA(v.a, 0.7) : hexA(v.t.colors.panelBorder, 0.6)}`,
            borderRadius: v.rad(6), padding: `${6 * v.scale}px ${10 * v.scale}px`,
            background: hexA(v.t.colors.bg, 0.5),
          }}>
            <div style={{display: 'flex', gap: 3 * v.scale}}>
              {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                <div key={c} style={{width: 6 * v.scale, height: 6 * v.scale, borderRadius: 999, background: hexA(c, 0.8)}} />
              ))}
            </div>
            <Label v={it.label} s={v.mono(15)} c={on > 0.5 ? v.a : v.t.colors.text} />
            <div style={{...v.body(13), color: v.dim, minWidth: 0}}>{it.sub}</div>
          </div>
        );
      })}
    </Stack>
  );
};

// ══ PROCESSES ════════════════════════════════════════════════════════════════

/** A process table where the PID column is what the eye is pulled to. */
export const ProcTable: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={5 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const m = (it.label ?? '').match(/(\d{2,5})/);
        const doomed = /colleague|all three|never asks/i.test(`${it.label} ${it.sub}`);
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'baseline', gap: 10 * v.scale,
            padding: `${5 * v.scale}px ${9 * v.scale}px`, borderRadius: v.rad(5),
            background: on > 0.5 ? hexA(doomed ? v.sem('red') : v.a, 0.12) : hexA(v.t.colors.panel, 0.3),
            opacity: 0.3 + on * 0.7,
          }}>
            {m ? (
              <div style={{
                ...v.mono(16), fontWeight: 700, color: doomed ? v.sem('red') : v.a,
                border: `${1.4 * v.scale}px solid ${hexA(doomed ? v.sem('red') : v.a, 0.6)}`,
                borderRadius: v.rad(4), padding: `${1 * v.scale}px ${6 * v.scale}px`, flex: '0 0 auto',
                transform: `scale(${1 + on * 0.04})`,
              }}>{m[1]}</div>
            ) : null}
            <div style={{...v.mono(14.5), color: v.t.colors.text, flex: '0 0 auto'}}>{(it.label ?? '').replace(/,?\s*(PID\s*)?\d{2,5}/, '')}</div>
            <div style={{...v.body(13), color: v.dim, minWidth: 0}}>{it.sub}</div>
          </div>
        );
      })}
    </Stack>
  );
};

/** Parent → child lines that are real, so reparenting can be watched. */
export const ProcTree: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={5 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const snap = /snap|kill/i.test(`${it.label} ${it.sub}`);
        const adopt = /adopt|survive|reparent/i.test(`${it.label} ${it.sub}`);
        const d = Math.min(it.value ?? Math.min(i, 3), 4);
        const c = snap ? v.sem('red') : adopt ? v.sem('green') : v.a;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 7 * v.scale, paddingLeft: d * 18 * v.scale, opacity: 0.28 + on * 0.72}}>
            <svg width={16 * v.scale} height={16 * v.scale} style={{flex: '0 0 auto'}}>
              <path d={`M2,0 L2,8 L${14 * v.scale},8`} fill="none"
                stroke={snap ? hexA(v.sem('red'), 0.9) : hexA(v.t.colors.panelBorder, 0.9)}
                strokeWidth={1.6 * v.scale} strokeDasharray={snap ? `${3 * v.scale} ${3 * v.scale}` : undefined} />
            </svg>
            <div style={{
              ...v.mono(15), fontWeight: 600, color: on > 0.5 ? c : v.t.colors.text,
              border: `${1.4 * v.scale}px solid ${on > 0.5 ? hexA(c, 0.7) : hexA(v.t.colors.panelBorder, 0.5)}`,
              background: on > 0.5 ? hexA(c, 0.12) : 'transparent',
              borderRadius: v.rad(5), padding: `${3 * v.scale}px ${8 * v.scale}px`, whiteSpace: 'nowrap',
            }}>{it.label}</div>
            <div style={{...v.body(13), color: v.dim, minWidth: 0}}>{it.sub}</div>
          </div>
        );
      })}
    </Stack>
  );
};

/** A live table: the bars move and the rows re-sort, which is why top exists. */
export const ProcLive: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={7 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const hot = /climb|saturat|eating|88|dominat|red/i.test(`${it.label} ${it.sub}`);
        const idle = /idle|nothing|quiet|fine|steady/i.test(`${it.sub ?? ''}`);
        const c = hot ? v.sem('red') : idle ? v.t.colors.muted : v.a;
        const w = hot ? 0.92 : idle ? 0.13 : 0.55;
        return (
          <div key={i} style={{opacity: 0.3 + on * 0.7}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 8 * v.scale}}>
              <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? c : v.t.colors.text} />
              <div style={{...v.body(12.5), color: v.dim, minWidth: 0}}>{it.sub}</div>
            </div>
            <div style={{height: 8 * v.scale, borderRadius: 999, marginTop: 4 * v.scale, background: hexA(v.t.colors.panelBorder, 0.4)}}>
              <div style={{height: '100%', borderRadius: 999, width: `${w * on * 100}%`, background: hexA(c, 0.85)}} />
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

/** A signal travelling: caught and handled, or delivered past the process. */
export const SignalPath: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={6 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const p = usePulseAt(frame, it.atWord);
        const fatal = /-9|SIGKILL|cannot be caught|lost|never/i.test(`${it.label} ${it.sub}`);
        const c = fatal ? v.sem('red') : v.a;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 9 * v.scale, opacity: 0.28 + on * 0.72}}>
            <div style={{
              flex: '0 0 auto', width: 11 * v.scale, height: 11 * v.scale, borderRadius: 2 * v.scale,
              background: hexA(c, 0.9), transform: `translateX(${p * 8 * v.scale}px) scale(${1 + p * 0.4})`,
              opacity: on,
            }} />
            <div style={{flex: 1, minWidth: 0,
              borderLeft: `${3 * v.scale}px solid ${on > 0.5 ? hexA(c, 0.85) : hexA(v.t.colors.panelBorder, 0.5)}`,
              background: on > 0.5 ? hexA(c, 0.09) : hexA(v.t.colors.panel, 0.28),
              borderRadius: `0 ${v.rad(6)}px ${v.rad(6)}px 0`,
              padding: `${6 * v.scale}px ${11 * v.scale}px`}}>
              <Label v={it.label} s={v.mono(15)} c={on > 0.5 ? c : v.t.colors.text} />
              <Sub v={it.sub} s={v.body(13)} c={v.dim} />
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

/** Pure pulse, for the same reason liveAt is pure. */
export const usePulseAt = (frame: number, atWord?: number, dur = 26) => {
  if (atWord == null) return 0;
  const s = wordToFrame(atWord);
  return interpolate(frame, [s, s + dur * 0.35, s + dur], [0, 1, 0], clamp);
};

/** A script as a timeline with an execution marker that stops, or races past. */
export const TimelineRun: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <div style={{display: 'flex', gap: 14 * v.scale, flex: 1, minHeight: 0}}>
      <div style={{flex: '0 0 12%', position: 'relative', display: 'flex', justifyContent: 'center'}}>
        <div style={{width: 3 * v.scale, background: hexA(v.t.colors.panelBorder, 0.6), borderRadius: 999}} />
        {items.map((it, i) => {
          const on = liveAt(frame, it.atWord);
          return (
            <div key={i} style={{
              position: 'absolute', top: `${(i / Math.max(items.length - 1, 1)) * 88 + 4}%`,
              width: 13 * v.scale, height: 13 * v.scale, borderRadius: 999,
              background: on > 0.5 ? v.a : hexA(v.t.colors.panelBorder, 0.8),
              transform: `scale(${0.7 + on * 0.5})`,
            }} />
          );
        })}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <Stack gap={6 * v.scale}>
          {items.map((it, i) => {
            const bad = /early|exits|without|lies|still running/i.test(`${it.label} ${it.sub}`);
            return (
              <Slab key={i} item={it} accent={bad ? v.sem('red') : v.a} scale={v.scale} t={v.t} rad={v.rad(6)}>
                <Label v={it.label} s={v.mono(14.5)} c={v.t.colors.text} />
                <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
              </Slab>
            );
          })}
        </Stack>
      </div>
    </div>
  );
};

/** Handles drawn as lines to a resource — the unmount is blocked while any remain. */
export const HandleMap: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={6 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const released = /closes|succeeds|works|kill it/i.test(`${it.label} ${it.sub}`);
        const c = released ? v.sem('green') : v.a;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8 * v.scale, opacity: 0.28 + on * 0.72}}>
            <div style={{minWidth: 0, flex: 1,
              background: on > 0.5 ? hexA(c, 0.09) : hexA(v.t.colors.panel, 0.28),
              borderRadius: v.rad(6), padding: `${6 * v.scale}px ${11 * v.scale}px`}}>
              <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? c : v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
            </div>
            <svg width={40 * v.scale} height={10 * v.scale} style={{flex: '0 0 auto'}}>
              <line x1={0} y1={5 * v.scale} x2={40 * v.scale} y2={5 * v.scale}
                stroke={hexA(c, released ? 0.35 : 0.95)} strokeWidth={2 * v.scale}
                strokeDasharray={released ? `${3 * v.scale} ${4 * v.scale}` : undefined} opacity={on} />
            </svg>
          </div>
        );
      })}
    </Stack>
  );
};

/** The kernel boundary drawn as a real line each call has to cross. */
export const SyscallFlow: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0}}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const kernel = /kernel|answer|no such/i.test(`${it.label} ${it.sub}`);
        const fail = /no such|does not exist|unrelated/i.test(`${it.label} ${it.sub}`);
        const c = fail ? v.sem('red') : v.a;
        return (
          <div key={i} style={{
            display: 'flex', justifyContent: kernel ? 'flex-end' : 'flex-start',
            opacity: 0.28 + on * 0.72, padding: `${3 * v.scale}px 0`,
            borderTop: i > 0 ? `${1 * v.scale}px dashed ${hexA(v.t.colors.panelBorder, 0.5)}` : undefined,
          }}>
            <div style={{
              maxWidth: '74%',
              border: `${1.5 * v.scale}px solid ${on > 0.5 ? hexA(c, 0.75) : hexA(v.t.colors.panelBorder, 0.5)}`,
              background: on > 0.5 ? hexA(c, 0.12) : 'transparent',
              borderRadius: v.rad(6), padding: `${5 * v.scale}px ${10 * v.scale}px`,
            }}>
              <Label v={it.label} s={v.mono(14)} c={fail ? v.sem('red') : v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** A pipe as a real channel, with an adapter that converts stream to arguments. */
export const PipeFlow: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={6 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const stuck = /nothing|not the pipe|no error|cannot/i.test(`${it.label} ${it.sub}`);
        const c = stuck ? v.sem('red') : v.a;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8 * v.scale, opacity: 0.28 + on * 0.72}}>
            <div style={{
              flex: 1, minWidth: 0, borderRadius: v.rad(6),
              border: `${1.5 * v.scale}px solid ${on > 0.5 ? hexA(c, 0.75) : hexA(v.t.colors.panelBorder, 0.55)}`,
              background: on > 0.5 ? hexA(c, 0.1) : 'transparent',
              padding: `${6 * v.scale}px ${10 * v.scale}px`,
            }}>
              <Label v={it.label} s={v.mono(14.5)} c={v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
            </div>
            <div style={{
              flex: '0 0 auto', ...v.mono(15), color: stuck ? v.sem('red') : v.a,
              opacity: i < items.length - 1 ? on : 0,
            }}>{stuck ? '⊘' : '↓'}</div>
          </div>
        );
      })}
    </Stack>
  );
};

// ══ WATCHING THE MACHINE ═════════════════════════════════════════════════════

/** Sparklines over time, because a number describes now and a line describes where it is going. */
export const GaugeBoard: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const spark = (seed: number, rise: number, n = 26) =>
    Array.from({length: n}, (_, k) => {
      const base = 0.35 + 0.28 * Math.sin(seed + k * 0.7) * 0.5;
      return Math.max(0.05, Math.min(1, base + rise * (k / n)));
    });
  return (
    <Stack gap={8 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const hot = /climb|spike|saturat|red|leak|38|88/i.test(`${it.label} ${it.sub}`);
        const calm = /fine|quiet|normal|flat|steady|recovered|zero/i.test(`${it.sub ?? ''}`);
        const c = hot ? v.sem('red') : calm ? hexA(v.t.colors.muted, 0.9) : v.a;
        const pts = spark(i * 2.1, hot ? 0.55 : calm ? -0.05 : 0.12);
        const W = 100, H = 22;
        const d = pts.map((p, k) => `${k === 0 ? 'M' : 'L'}${(k / (pts.length - 1)) * W},${H - p * H}`).join(' ');
        return (
          <div key={i} style={{opacity: 0.3 + on * 0.7}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 8 * v.scale}}>
              <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? c : v.t.colors.text} />
              <div style={{...v.body(12.5), color: v.dim, minWidth: 0}}>{it.sub}</div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
              style={{width: '100%', height: 26 * v.scale, marginTop: 3 * v.scale, display: 'block'}}>
              <path d={`${d} L${W},${H} L0,${H} Z`} fill={hexA(c, 0.16 * on)} />
              <path d={d} fill="none" stroke={hexA(c, 0.95)} strokeWidth={1.6} vectorEffect="non-scaling-stroke"
                strokeDasharray={200} strokeDashoffset={200 * (1 - on)} />
            </svg>
          </div>
        );
      })}
    </Stack>
  );
};


/** A REAL chart, not a sparkline. Owner, 2026-08-20: *"you say spikes, chart,
 *  green, red — dude that doesn't even look like a chart, it just looks like a
 *  curvy line broken in middle ... where's the chart?"* He was right: the old
 *  GaugeBoard drew a 22px path from a synthetic sine wave, with no axes, no
 *  gridlines, no tick numbers and no title, so nothing on screen matched a
 *  narration talking about spikes and values.
 *
 *  This plots a DECLARED series inside a bordered card in the house style, with a
 *  titled header, a y-axis carrying real numbers and the unit, x-axis time ticks,
 *  gridlines, an optional threshold rule, and a live read-out of the current
 *  sample. The line draws in across the beat and the read-out counts with it. */
export const MetricChart: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const charts = items.filter((i) => (i.series?.length ?? 0) > 1);
  if (!charts.length) return <GaugeBoard items={items} accent={accent} />;

  const nice = (x: number) => {
    if (x >= 1000) return `${Math.round(x / 100) / 10}k`;
    if (x >= 100) return String(Math.round(x));
    if (x >= 10) return String(Math.round(x * 10) / 10);
    return String(Math.round(x * 100) / 100);
  };

  // The plot FILLS the card it is in. It used to be a fixed 168px band, so in a 9:16
  // pane with 700px to play with the chart sat as a thin strip with dead space above
  // and below it inside its own border — owner, 2026-08-21: *"the graph is kinda like
  // a patty inside a burger."* Height now comes from the pane budget, split between
  // however many charts the beat declares.
  const headH = (v.vertical ? 20 : 15.5) * 1.4 + 17;
  const footH = (v.vertical ? 22 : 17) * 1.5 + 6;
  const plotH = Math.max(v.vertical ? 190 : 120,
    stackBudget(v) / charts.length - headH - footH - 24 - (charts.length > 1 ? 12 : 0));

  return (
    <Stack gap={12 * v.scale}>
      {charts.map((it, i) => {
        const on = liveAt(frame, it.atWord, 14);
        const pts = it.series as number[];
        const thr = it.threshold;
        const peak = Math.max(...pts, thr ?? -Infinity);
        const top = peak <= 0 ? 1 : peak * 1.15;           // headroom above the peak
        const hot = thr != null && Math.max(...pts) > thr;
        const c = hot ? v.sem('red') : v.a;

        // plot geometry, in viewBox units
        const W = 100, H = 46, PL = 15, PR = 3, PT = 4, PB = 9;
        const x = (k: number) => PL + (k / (pts.length - 1)) * (W - PL - PR);
        const y = (val: number) => PT + (1 - val / top) * (H - PT - PB);
        const drawn = Math.max(2, Math.round(pts.length * on));
        const shown = pts.slice(0, drawn);
        const line = shown.map((p, k) => `${k === 0 ? 'M' : 'L'}${x(k)},${y(p)}`).join(' ');
        const area = `${line} L${x(drawn - 1)},${y(0)} L${x(0)},${y(0)} Z`;
        const ticks = [0, top / 2, top];
        const now = pts[Math.max(0, drawn - 1)];

        return (
          <div
            key={i}
            style={{
              // One chart in a titled effect pane needs no border of its own — the pane
              // IS its card. Drawing both put a box inside a box with a gutter of dead
              // space between them.
              border: charts.length > 1
                ? `${1.6 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.95)}` : 'none',
              borderRadius: v.rad(10),
              background: charts.length > 1 ? hexA(v.t.colors.panel, 0.45) : 'transparent',
              overflow: 'hidden',
              opacity: 0.35 + on * 0.65,
            }}
          >
            {/* titled header, with the live value on the right */}
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              gap: 10 * v.scale,
              padding: `${8 * v.scale}px ${12 * v.scale}px`,
              borderBottom: `${1.2 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.8)}`,
              background: hexA(v.t.colors.panel, 0.55),
            }}>
              <div style={{...v.mono(v.vertical ? 20 : 15.5), fontWeight: 700, color: on > 0.4 ? c : v.dim}}>
                {it.label}
              </div>
              <div style={{...v.body(v.vertical ? 16 : 12.5), color: v.dim, textAlign: 'right', minWidth: 0}}>
                {it.sub}
              </div>
            </div>

            <div style={{padding: `${8 * v.scale}px ${10 * v.scale}px ${4 * v.scale}px`}}>
             {/* The plot box is stretched to the card, so the viewBox is squashed on
                 one axis. Anything drawn INSIDE it inherits that squash — which is why
                 the axis numbers used to render wide and smeared. Strokes are pinned
                 with non-scaling-stroke and every label is HTML laid over the top, so
                 the type stays the type it was set in. */}
             <div style={{position: 'relative', height: plotH * v.scale}}>
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
                style={{position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block'}}>
                {/* gridlines + y ticks, with the actual numbers on them */}
                {ticks.map((tv, k) => (
                  <line key={k} x1={PL} y1={y(tv)} x2={W - PR} y2={y(tv)} vectorEffect="non-scaling-stroke"
                    stroke={hexA(v.t.colors.panelBorder, k === 0 ? 0.95 : 0.5)} strokeWidth={1} />
                ))}
                {/* the threshold worth naming — capacity, a limit, a saturation point */}
                {thr != null ? (
                  <line x1={PL} y1={y(thr)} x2={W - PR} y2={y(thr)} vectorEffect="non-scaling-stroke"
                    stroke={hexA(v.sem('red'), 0.85)} strokeWidth={1.4} strokeDasharray="6 5" />
                ) : null}
                <path d={area} fill={hexA(c, 0.18)} />
                <path d={line} fill="none" stroke={hexA(c, 0.98)} strokeWidth={2.6}
                  vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
              </svg>

              {/* axis type, laid over the plot in real pixels */}
              {ticks.map((tv, k) => (
                <div key={`y${k}`} style={{
                  position: 'absolute', left: 0, width: `${PL - 2}%`, textAlign: 'right',
                  top: `${(y(tv) / H) * 100}%`, transform: 'translateY(-50%)',
                  ...v.mono(v.vertical ? 15 : 11.5), color: hexA(v.t.colors.muted, 0.95),
                }}>{nice(tv)}</div>
              ))}
              {thr != null ? (
                <div style={{
                  position: 'absolute', right: `${PR}%`, top: `${(y(thr) / H) * 100}%`,
                  transform: 'translateY(-115%)', ...v.mono(v.vertical ? 14.5 : 11),
                  color: hexA(v.sem('red'), 0.98), fontWeight: 700,
                }}>{it.unit ? `${nice(thr)} ${it.unit}` : nice(thr)}</div>
              ) : null}
              {[0, Math.floor((pts.length - 1) / 2), pts.length - 1].map((k, j) => (
                <div key={`x${j}`} style={{
                  position: 'absolute', bottom: 0, left: `${x(k)}%`,
                  transform: `translateX(${j === 0 ? '0' : j === 2 ? '-100%' : '-50%'})`,
                  ...v.mono(v.vertical ? 14.5 : 11), color: hexA(v.t.colors.muted, 0.9),
                }}>{it.xLabels?.[j] ?? `t${k}`}</div>
              ))}
              {/* the head of the trace, as a real circle rather than a squashed one */}
              <div style={{
                position: 'absolute', left: `${x(drawn - 1)}%`, top: `${(y(now) / H) * 100}%`,
                transform: 'translate(-50%, -50%)', width: 9 * v.scale, height: 9 * v.scale,
                borderRadius: 999, background: c, boxShadow: `0 0 ${10 * v.scale}px ${hexA(c, 0.8)}`,
              }} />
             </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginTop: 2 * v.scale,
              }}>
                <div style={{...v.body(v.vertical ? 15 : 11.5), color: v.dim}}>
                  {it.unit ? `measured in ${it.unit}` : ''}
                </div>
                <div style={{...v.mono(v.vertical ? 22 : 17), fontWeight: 800, color: c}}>
                  {nice(now)}{it.unit ? ` ${it.unit}` : ''}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

/** Load against real core slots — the same 4 fills half of eight and overflows two. */
export const LoadCores: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const rigs = items.filter((i) => /core|cpu|machine/i.test(`${i.sub ?? ''}${i.label ?? ''}`) && /\d/.test(`${i.sub ?? ''}`));
  return (
    <Stack gap={7 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const m = (it.sub ?? '').match(/(\d+)\s*cores?/i);
        if (m) {
          const cores = Number(m[1]);
          const load = 4;
          const over = load > cores;
          return (
            <div key={i} style={{opacity: 0.3 + on * 0.7}}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 8 * v.scale}}>
                <Label v={it.label} s={v.mono(15)} c={over ? v.sem('red') : v.sem('green')} />
                <div style={{...v.body(12.5), color: v.dim}}>{it.sub}</div>
              </div>
              <div style={{display: 'flex', gap: 3 * v.scale, marginTop: 4 * v.scale}}>
                {Array.from({length: cores}).map((_, k) => (
                  <div key={k} style={{
                    flex: 1, height: 16 * v.scale, borderRadius: v.rad(4),
                    border: `${1.4 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.8)}`,
                    background: k < load * on ? hexA(v.sem('green'), 0.65) : 'transparent',
                  }} />
                ))}
                {over ? Array.from({length: load - cores}).map((_, k) => (
                  <div key={`q${k}`} style={{
                    flex: 1, height: 16 * v.scale, borderRadius: v.rad(4),
                    border: `${1.4 * v.scale}px dashed ${hexA(v.sem('red'), 0.9)}`,
                    background: hexA(v.sem('red'), 0.3 * on),
                  }} />
                )) : null}
              </div>
            </div>
          );
        }
        return (
          <Slab key={i} item={it} accent={v.a} scale={v.scale} t={v.t} rad={v.rad(6)}>
            <Label v={it.label} s={v.mono(14)} c={v.t.colors.text} />
            <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
          </Slab>
        );
      })}
    </Stack>
  );
};

/** Memory as one physical bar; the cache segment hands its space back on demand. */
export const MemoryBar: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const segs = items.filter((i) => /^(used|cache|free|available)/i.test(i.label ?? ''));
  const shrink = liveAt(frame, items.find((i) => /shrink/i.test(`${i.label}`))?.atWord, 22);
  const widths: Record<string, number> = {used: 34, cache: 48 - shrink * 22, free: 4 + shrink * 22, available: 0};
  const cols: Record<string, string> = {used: v.a, cache: v.sem('yellow'), free: hexA(v.t.colors.muted, 0.6), available: v.sem('green')};
  return (
    <Stack gap={9 * v.scale}>
      <div style={{display: 'flex', height: 34 * v.scale, borderRadius: v.rad(6), overflow: 'hidden',
        border: `${1.6 * v.scale}px solid ${v.line}`}}>
        {['used', 'cache', 'free'].map((k) => {
          const it = segs.find((s) => (s.label ?? '').toLowerCase().startsWith(k));
          const on = liveAt(frame, it?.atWord);
          return (
            <div key={k} style={{
              width: `${widths[k]}%`, background: hexA(cols[k], 0.25 + on * 0.5),
              borderRight: `${1.4 * v.scale}px solid ${hexA(v.t.colors.bg, 0.7)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...v.mono(12.5), color: on > 0.4 ? cols[k] : v.dim, fontWeight: 700,
            }}>{widths[k] > 9 ? k : ''}</div>
          );
        })}
      </div>
      {items.map((it, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'baseline', gap: 8 * v.scale, opacity: 0.3 + liveAt(frame, it.atWord) * 0.7}}>
          <div style={{width: 8 * v.scale, height: 8 * v.scale, borderRadius: 2 * v.scale, flex: '0 0 auto',
            background: hexA(cols[(it.label ?? '').split(':')[0].toLowerCase()] ?? v.a, 0.9)}} />
          <Label v={it.label} s={v.mono(14)} c={v.t.colors.text} />
          <div style={{...v.body(12.5), color: v.dim, minWidth: 0}}>{it.sub}</div>
        </div>
      ))}
    </Stack>
  );
};

/** Throughput fills the pipe; await is the length of the queue in front of it. */
export const QueueMeter: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={7 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const isQueue = /await|queu|wait/i.test(`${it.label} ${it.sub}`);
        const c = isQueue ? v.sem('red') : v.a;
        return (
          <div key={i} style={{opacity: 0.3 + on * 0.7}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 8 * v.scale}}>
              <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? c : v.t.colors.text} />
              <div style={{...v.body(12.5), color: v.dim, minWidth: 0}}>{it.sub}</div>
            </div>
            {isQueue ? (
              <div style={{display: 'flex', gap: 3 * v.scale, marginTop: 4 * v.scale}}>
                {Array.from({length: 12}).map((_, k) => (
                  <div key={k} style={{
                    width: 9 * v.scale, height: 12 * v.scale, borderRadius: 2 * v.scale,
                    background: k < 12 * on ? hexA(v.sem('red'), 0.8) : hexA(v.t.colors.panelBorder, 0.4),
                  }} />
                ))}
              </div>
            ) : (
              <div style={{height: 8 * v.scale, borderRadius: 999, marginTop: 4 * v.scale, background: hexA(v.t.colors.panelBorder, 0.4)}}>
                <div style={{height: '100%', width: `${on * 62}%`, borderRadius: 999, background: hexA(v.a, 0.8)}} />
              </div>
            )}
          </div>
        );
      })}
    </Stack>
  );
};

/** A real loop: run, show, diff, wait, run again. */
export const RepeatLoop: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={5 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const grow = /creep|leak|obvious|changed/i.test(`${it.label} ${it.sub}`);
        const c = grow ? v.sem('orange') : v.a;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8 * v.scale, opacity: 0.28 + on * 0.72}}>
            <div style={{
              flex: '0 0 auto', width: 20 * v.scale, height: 20 * v.scale, borderRadius: 999,
              border: `${1.6 * v.scale}px solid ${on > 0.5 ? hexA(c, 0.85) : hexA(v.t.colors.panelBorder, 0.6)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...v.mono(10.5), color: on > 0.5 ? c : v.dim, fontWeight: 700,
            }}>{i + 1}</div>
            <div style={{minWidth: 0, flex: 1}}>
              <Label v={it.label} s={v.mono(14.5)} c={v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
            </div>
            {grow ? (
              <div style={{...v.mono(13), color: v.sem('orange'), opacity: on}}>▲</div>
            ) : null}
          </div>
        );
      })}
    </Stack>
  );
};

// ══ DISKS ════════════════════════════════════════════════════════════════════

/** A disk as a real block grid: space and inodes are two different exhaustions. */
export const DiskMap: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const COLS = 16, ROWS = 4;
  const full = items.findIndex((i) => /100|full|inodes used|exhaust/i.test(`${i.label} ${i.sub}`));
  const fullOn = full >= 0 ? liveAt(frame, items[full].atWord, 20) : 0;
  const fill = 0.62 + fullOn * 0.38;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10 * v.scale, flex: 1, justifyContent: 'center', minHeight: 0}}>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: 2.5 * v.scale}}>
        {Array.from({length: COLS * ROWS}).map((_, k) => {
          const used = k / (COLS * ROWS) < fill;
          return (
            <div key={k} style={{
              paddingTop: '82%', borderRadius: 2 * v.scale,
              background: used ? hexA(fullOn > 0.5 ? v.sem('red') : v.a, 0.7) : hexA(v.t.colors.panelBorder, 0.35),
            }} />
          );
        })}
      </div>
      <Stack gap={5 * v.scale}>
        {items.map((it, i) => {
          const on = liveAt(frame, it.atWord);
          const bad = /100|full|gone|no undo|culprit|failing/i.test(`${it.label} ${it.sub}`);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'baseline', gap: 8 * v.scale, opacity: 0.3 + on * 0.7}}>
              <div style={{width: 6 * v.scale, height: 6 * v.scale, borderRadius: 999, flex: '0 0 auto',
                background: on > 0.5 ? (bad ? v.sem('red') : v.a) : hexA(v.t.colors.panelBorder, 0.7)}} />
              <Label v={it.label} s={v.mono(14)} c={on > 0.5 && bad ? v.sem('red') : v.t.colors.text} />
              <div style={{...v.body(12.5), color: v.dim, minWidth: 0}}>{it.sub}</div>
            </div>
          );
        })}
      </Stack>
    </div>
  );
};

/** One continuous disk bar carved into partitions; edits hover until written. */
export const PartitionMap: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const parts = items.filter((i) => /^sda\d|^s?d[a-z]\d|GPT|MBR/i.test(i.label ?? ''));
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10 * v.scale, flex: 1, justifyContent: 'center', minHeight: 0}}>
      <div style={{display: 'flex', height: 40 * v.scale, borderRadius: v.rad(6), overflow: 'hidden',
        border: `${1.8 * v.scale}px solid ${v.line}`}}>
        {(parts.length ? parts : items.slice(0, 3)).map((p, i) => {
          const on = liveAt(frame, p.atWord);
          return (
            <div key={i} style={{
              flex: i === 1 ? 3 : 1, background: hexA(v.a, 0.12 + on * 0.3),
              borderRight: `${1.4 * v.scale}px solid ${hexA(v.t.colors.bg, 0.8)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...v.mono(13), color: on > 0.4 ? v.a : v.dim, fontWeight: 700,
            }}>{p.label}</div>
          );
        })}
      </div>
      <Stack gap={5 * v.scale}>
        {items.map((it, i) => {
          const on = liveAt(frame, it.atWord);
          const real = /press w|written for real|needs GPT/i.test(`${it.label} ${it.sub}`);
          const safe = /only looks|press q|memory|nothing happened/i.test(`${it.label} ${it.sub}`);
          const c = real ? v.sem('orange') : safe ? v.sem('green') : v.a;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'baseline', gap: 8 * v.scale, opacity: 0.3 + on * 0.7}}>
              <Label v={it.label} s={v.mono(14)} c={on > 0.5 ? c : v.t.colors.text} />
              <div style={{...v.body(12.5), color: v.dim, minWidth: 0}}>{it.sub}</div>
            </div>
          );
        })}
      </Stack>
    </div>
  );
};

/** Names on the left, identities on the right — and the names shuffle. */
export const DeviceIds: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={6 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const stable = /UUID|never changes|written into|own link/i.test(`${it.label} ${it.sub}`);
        const unstable = /shuffle|position|not an identity|reboot|no driver|useless|slowed/i.test(`${it.label} ${it.sub}`);
        const c = stable ? v.sem('green') : unstable ? v.sem('red') : v.a;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'baseline', gap: 9 * v.scale, opacity: 0.28 + on * 0.72,
            borderLeft: `${3 * v.scale}px solid ${on > 0.5 ? hexA(c, 0.85) : hexA(v.t.colors.panelBorder, 0.5)}`,
            background: on > 0.5 ? hexA(c, 0.09) : hexA(v.t.colors.panel, 0.28),
            borderRadius: `0 ${v.rad(6)}px ${v.rad(6)}px 0`,
            padding: `${6 * v.scale}px ${11 * v.scale}px`,
          }}>
            <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? c : v.t.colors.text} />
            <div style={{...v.body(13), color: v.dim, minWidth: 0}}>{it.sub}</div>
          </div>
        );
      })}
    </Stack>
  );
};

// ══ NETWORK ══════════════════════════════════════════════════════════════════

/** Hops laid out as a real path; a packet travels it and some hops stay silent. */
export const NetPath: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={4 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const p = usePulseAt(frame, it.atWord);
        const silent = /never|nothing|no reply|loss|38/i.test(`${it.label} ${it.sub}`);
        const arrived = /repl|destination|forward|answers/i.test(`${it.label} ${it.sub}`);
        const c = silent ? v.sem('red') : arrived ? v.sem('green') : v.a;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 9 * v.scale, opacity: 0.28 + on * 0.72}}>
            <div style={{flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{
                width: 15 * v.scale, height: 15 * v.scale, borderRadius: 999,
                border: `${1.8 * v.scale}px ${silent ? 'dashed' : 'solid'} ${on > 0.5 ? hexA(c, 0.9) : hexA(v.t.colors.panelBorder, 0.6)}`,
                background: silent ? 'transparent' : hexA(c, 0.25 + p * 0.5),
                transform: `scale(${1 + p * 0.35})`,
              }} />
              {i < items.length - 1 ? (
                <div style={{width: 2 * v.scale, height: 13 * v.scale, background: hexA(v.t.colors.panelBorder, 0.7)}} />
              ) : null}
            </div>
            <div style={{minWidth: 0, flex: 1,
              background: on > 0.5 ? hexA(c, 0.09) : hexA(v.t.colors.panel, 0.28),
              borderRadius: v.rad(6), padding: `${6 * v.scale}px ${11 * v.scale}px`}}>
              <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? c : v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

/** The three layers of networking on one machine, stacked as layers. */
export const NetStack: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={4 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        return (
          <div key={i} style={{
            border: `${1.6 * v.scale}px solid ${on > 0.5 ? hexA(v.a, 0.8) : hexA(v.t.colors.panelBorder, 0.55)}`,
            background: hexA(v.a, 0.04 + on * 0.12),
            borderRadius: v.rad(5), padding: `${6 * v.scale}px ${11 * v.scale}px`,
            marginLeft: `${Math.min(i, 4) * 4}%`, marginRight: `${Math.min(items.length - 1 - i, 4) * 2}%`,
            opacity: 0.3 + on * 0.7,
          }}>
            <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? v.a : v.t.colors.text} />
            <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
          </div>
        );
      })}
    </Stack>
  );
};

/** Sockets in their real states: a door that is open, or a live pipe. */
export const NetSockets: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={6 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const listen = /LISTEN|listening|waiting/i.test(`${it.label} ${it.sub}`);
        const estab = /ESTABLISHED|conversation|peer/i.test(`${it.label} ${it.sub}`);
        const c = estab ? v.sem('green') : listen ? v.a : v.t.colors.muted;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 9 * v.scale, opacity: 0.28 + on * 0.72}}>
            <div style={{flex: '0 0 auto', width: 26 * v.scale, height: 18 * v.scale, position: 'relative'}}>
              {estab ? (
                <div style={{position: 'absolute', top: 7 * v.scale, left: 0, right: 0, height: 5 * v.scale,
                  borderRadius: 999, background: hexA(c, on)}} />
              ) : (
                <div style={{position: 'absolute', inset: 0, borderRadius: v.rad(4),
                  border: `${1.6 * v.scale}px solid ${hexA(c, on > 0.4 ? 0.9 : 0.4)}`,
                  borderLeftWidth: 0, background: 'transparent'}} />
              )}
            </div>
            <div style={{minWidth: 0, flex: 1}}>
              <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? c : v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

/** Flows whose width is the throughput — one pair dominating is a shape. */
export const BandwidthFlow: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const num = (s?: string) => {
    const m = (s ?? '').match(/(\d+(?:\.\d+)?)\s*(mega|M)/i);
    return m ? Number(m[1]) : /nothing|essentially|quiet|0\./i.test(s ?? '') ? 1 : 12;
  };
  const vals = items.map((i) => num(`${i.label} ${i.sub}`));
  const max = Math.max(...vals, 1);
  return (
    <Stack gap={8 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const share = vals[i] / max;
        const hot = share > 0.6;
        const c = hot ? v.sem('orange') : v.a;
        return (
          <div key={i} style={{opacity: 0.3 + on * 0.7}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 8 * v.scale}}>
              <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? c : v.t.colors.text} />
              <div style={{...v.body(12.5), color: v.dim, minWidth: 0}}>{it.sub}</div>
            </div>
            <div style={{
              height: Math.max(5, share * 15) * v.scale, marginTop: 4 * v.scale, borderRadius: 999,
              width: `${Math.max(share * 100 * on, 3)}%`, background: hexA(c, 0.75),
            }} />
          </div>
        );
      })}
    </Stack>
  );
};

/** A query, an answer card, and a TTL that is a countdown rather than a word. */
export const DnsResolve: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={6 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const ttl = /TTL|cache|300|five minutes/i.test(`${it.label} ${it.sub}`);
        const wrong = /wrong|error|misleads|not an error|confusion/i.test(`${it.label} ${it.sub}`);
        const c = wrong ? v.sem('orange') : ttl ? v.sem('yellow') : v.a;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 9 * v.scale, opacity: 0.28 + on * 0.72,
            border: `${1.5 * v.scale}px solid ${on > 0.5 ? hexA(c, 0.7) : hexA(v.t.colors.panelBorder, 0.5)}`,
            background: on > 0.5 ? hexA(c, 0.1) : 'transparent',
            borderRadius: v.rad(6), padding: `${6 * v.scale}px ${10 * v.scale}px`,
          }}>
            <div style={{minWidth: 0, flex: 1}}>
              <Label v={it.label} s={v.mono(14.5)} c={v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
            </div>
            {ttl ? (
              <svg width={22 * v.scale} height={22 * v.scale} style={{flex: '0 0 auto'}}>
                <circle cx={11 * v.scale} cy={11 * v.scale} r={9 * v.scale} fill="none"
                  stroke={hexA(v.t.colors.panelBorder, 0.7)} strokeWidth={2 * v.scale} />
                <circle cx={11 * v.scale} cy={11 * v.scale} r={9 * v.scale} fill="none"
                  stroke={hexA(c, 0.95)} strokeWidth={2 * v.scale}
                  strokeDasharray={2 * Math.PI * 9 * v.scale}
                  strokeDashoffset={2 * Math.PI * 9 * v.scale * on}
                  transform={`rotate(-90 ${11 * v.scale} ${11 * v.scale})`} />
              </svg>
            ) : null}
          </div>
        );
      })}
    </Stack>
  );
};

/** Three genuinely different outcomes: answered, actively refused, silently dropped. */
export const PortProbe: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={7 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const open = /answers|open|postgres/i.test(`${it.label} ${it.sub}`);
        const refused = /refus/i.test(`${it.label} ${it.sub}`);
        const dropped = /nothing|silence|timeout|firewall|no answer/i.test(`${it.label} ${it.sub}`);
        const c = open ? v.sem('green') : refused ? v.sem('orange') : dropped ? v.sem('red') : v.a;
        const glyph = open ? '⇄' : refused ? '⇤' : dropped ? '⋯' : '·';
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10 * v.scale, opacity: 0.28 + on * 0.72}}>
            <div style={{
              flex: '0 0 auto', width: 30 * v.scale, height: 30 * v.scale, borderRadius: v.rad(6),
              border: `${1.6 * v.scale}px ${dropped ? 'dashed' : 'solid'} ${on > 0.5 ? hexA(c, 0.85) : hexA(v.t.colors.panelBorder, 0.6)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...v.mono(15), color: on > 0.5 ? c : v.dim,
            }}>{glyph}</div>
            <div style={{minWidth: 0, flex: 1}}>
              <Label v={it.label} s={v.mono(14.5)} c={v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

/** Two halves of a key pair; only one of them is ever allowed to travel. */
export const KeyExchange: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={6 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const priv = /private|never leaves|other half/i.test(`${it.label} ${it.sub}`);
        const pub = /\.pub|public|travel/i.test(`${it.label} ${it.sub}`);
        const c = priv ? v.sem('red') : pub ? v.sem('green') : v.a;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 9 * v.scale, opacity: 0.28 + on * 0.72,
            marginLeft: pub ? `${on * 8}%` : 0,
            borderLeft: `${3 * v.scale}px solid ${on > 0.5 ? hexA(c, 0.85) : hexA(v.t.colors.panelBorder, 0.5)}`,
            background: on > 0.5 ? hexA(c, 0.09) : hexA(v.t.colors.panel, 0.28),
            borderRadius: `0 ${v.rad(6)}px ${v.rad(6)}px 0`,
            padding: `${6 * v.scale}px ${11 * v.scale}px`,
          }}>
            <div style={{minWidth: 0, flex: 1}}>
              <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? c : v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
            </div>
            {pub ? <div style={{...v.mono(14), color: v.sem('green'), opacity: on}}>→</div> : null}
            {priv ? <div style={{...v.mono(14), color: v.sem('red'), opacity: on}}>⊘</div> : null}
          </div>
        );
      })}
    </Stack>
  );
};

/** A transfer that genuinely breaks, and resumes from where it broke. */
export const TransferBar: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const broke = liveAt(frame, items.find((i) => /drops|61/i.test(`${i.label}`))?.atWord, 16);
  const resumed = liveAt(frame, items.find((i) => /resume|continue/i.test(`${i.label} ${i.sub}`))?.atWord, 22);
  const pct = 61 + resumed * 39;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10 * v.scale, flex: 1, justifyContent: 'center', minHeight: 0}}>
      <div>
        <div style={{height: 16 * v.scale, borderRadius: 999, background: hexA(v.t.colors.panelBorder, 0.4), overflow: 'hidden'}}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 999,
            background: hexA(broke > 0.5 && resumed < 0.1 ? v.sem('red') : v.a, 0.85),
          }} />
        </div>
        <div style={{...v.mono(13), color: v.dim, marginTop: 4 * v.scale, textAlign: 'right'}}>{Math.round(pct)}%</div>
      </div>
      <Stack gap={5 * v.scale}>
        {items.map((it, i) => {
          const on = liveAt(frame, it.atWord);
          const bad = /drops|infuriating/i.test(`${it.label} ${it.sub}`);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'baseline', gap: 8 * v.scale, opacity: 0.3 + on * 0.7}}>
              <Label v={it.label} s={v.mono(14)} c={on > 0.5 ? (bad ? v.sem('red') : v.a) : v.t.colors.text} />
              <div style={{...v.body(12.5), color: v.dim, minWidth: 0}}>{it.sub}</div>
            </div>
          );
        })}
      </Stack>
    </div>
  );
};

/** An HTTP request assembled part by part, and a real status line coming back. */
export const HttpExchange: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={5 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const resp = /^\d{3}|Created|response/i.test(`${it.label}`);
        const c = resp ? v.sem('green') : v.a;
        return (
          <div key={i} style={{
            display: 'flex', justifyContent: resp ? 'flex-end' : 'flex-start',
            opacity: 0.28 + on * 0.72,
          }}>
            <div style={{
              maxWidth: '82%', minWidth: 0,
              border: `${1.5 * v.scale}px solid ${on > 0.5 ? hexA(c, 0.75) : hexA(v.t.colors.panelBorder, 0.5)}`,
              background: on > 0.5 ? hexA(c, 0.12) : 'transparent',
              borderRadius: v.rad(6), padding: `${5 * v.scale}px ${10 * v.scale}px`,
              borderLeftWidth: resp ? 1.5 * v.scale : 3 * v.scale,
            }}>
              <Label v={it.label} s={v.mono(14)} c={on > 0.5 ? c : v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

/** Both sides compared before anything moves; only the differences travel. */
export const SyncDiff: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={6 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const skipped = /identical|skipped|unchanged/i.test(`${it.label} ${it.sub}`);
        const moves = /modified|new|goes|wire/i.test(`${it.label} ${it.sub}`);
        const c = skipped ? hexA(v.t.colors.muted, 0.85) : moves ? v.sem('green') : v.a;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 9 * v.scale,
            opacity: skipped && on > 0.5 ? 0.42 : 0.28 + on * 0.72,
            transform: `translateX(${moves ? on * 10 * v.scale : 0}px)`,
          }}>
            <div style={{
              flex: '0 0 auto', width: 8 * v.scale, height: 8 * v.scale, borderRadius: 2 * v.scale,
              background: on > 0.4 ? c : hexA(v.t.colors.panelBorder, 0.7),
            }} />
            <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? c : v.t.colors.text} />
            <div style={{...v.body(12.5), color: v.dim, minWidth: 0}}>{it.sub}</div>
          </div>
        );
      })}
    </Stack>
  );
};

/** A registry record with the expiry sitting on a real countdown. */
export const RecordCard: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <div style={{
      flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center',
      border: `${1.8 * v.scale}px solid ${v.line}`, borderRadius: v.rad(8), padding: `${12 * v.scale}px ${14 * v.scale}px`,
      background: hexA(v.t.colors.panel, 0.35), gap: 6 * v.scale,
    }}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const urgent = /expir|28|days|stops|vanish|will not catch/i.test(`${it.label} ${it.sub}`);
        const c = urgent ? v.sem('orange') : v.a;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'baseline', gap: 9 * v.scale, opacity: 0.3 + on * 0.7,
            borderBottom: i < items.length - 1 ? `${1 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.4)}` : undefined,
            paddingBottom: 5 * v.scale,
          }}>
            <Label v={it.label} s={v.mono(14)} c={on > 0.5 ? c : v.t.colors.text} />
            <div style={{...v.body(12.5), color: v.dim, minWidth: 0, textAlign: 'right', flex: 1}}>{it.sub}</div>
          </div>
        );
      })}
    </div>
  );
};

// ══ TEXT MACHINERY ═══════════════════════════════════════════════════════════

/** Two files aligned line for line; matching lines dim right down. */
export const TextCompare: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={5 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const removed = /removed|old/i.test(`${it.sub ?? ''}`);
        const added = /added|new/i.test(`${it.sub ?? ''}`);
        const same = /matching|identical|dimmed|nothing else/i.test(`${it.label} ${it.sub}`);
        const c = removed ? v.sem('red') : added ? v.sem('green') : hexA(v.t.colors.muted, 0.9);
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'baseline', gap: 9 * v.scale,
            opacity: same && on > 0.5 ? 0.35 : 0.3 + on * 0.7,
            background: !same && on > 0.5 ? hexA(c, 0.12) : 'transparent',
            borderLeft: `${2.5 * v.scale}px solid ${!same && on > 0.4 ? hexA(c, 0.9) : 'transparent'}`,
            padding: `${4 * v.scale}px ${8 * v.scale}px`, borderRadius: v.rad(4),
          }}>
            <div style={{...v.mono(13), color: c, flex: '0 0 auto', fontWeight: 700}}>
              {removed ? '−' : added ? '+' : ' '}
            </div>
            <Label v={it.label} s={v.mono(14.5)} c={v.t.colors.text} />
            <div style={{...v.body(12.5), color: v.dim, minWidth: 0}}>{it.sub}</div>
          </div>
        );
      })}
    </Stack>
  );
};

/** Lines flowing through a transform: in on the left, changed on the right. */
export const TextTransform: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={5 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const warn = /nothing was saved|untouched|only the first/i.test(`${it.label} ${it.sub}`);
        const c = warn ? v.sem('orange') : v.a;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8 * v.scale, opacity: 0.28 + on * 0.72,
            transform: `translateX(${on * (i % 2 === 0 ? 0 : 8) * v.scale}px)`,
          }}>
            <div style={{
              flex: 1, minWidth: 0, borderRadius: v.rad(5),
              border: `${1.4 * v.scale}px solid ${on > 0.5 ? hexA(c, 0.7) : hexA(v.t.colors.panelBorder, 0.5)}`,
              background: on > 0.5 ? hexA(c, 0.1) : 'transparent',
              padding: `${5 * v.scale}px ${9 * v.scale}px`,
            }}>
              <Label v={it.label} s={v.mono(14)} c={v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12)} c={v.dim} />
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

/** One line cut into numbered fields — $1 $2 $3 as something you watch happen. */
export const FieldSplit: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const fields = items.filter((i) => /^\$\d/.test(i.label ?? ''));
  const rest = items.filter((i) => !/^\$\d/.test(i.label ?? ''));
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10 * v.scale, flex: 1, justifyContent: 'center', minHeight: 0}}>
      <div style={{display: 'flex', gap: 4 * v.scale}}>
        {fields.map((f, i) => {
          const on = liveAt(frame, f.atWord);
          return (
            <div key={i} style={{
              flex: 1, minWidth: 0, textAlign: 'center', borderRadius: v.rad(5),
              border: `${1.6 * v.scale}px solid ${on > 0.5 ? hexA(v.a, 0.85) : hexA(v.t.colors.panelBorder, 0.6)}`,
              background: on > 0.5 ? hexA(v.a, 0.16) : 'transparent',
              padding: `${7 * v.scale}px ${5 * v.scale}px`,
              transform: `translateY(${(1 - on) * 6 * v.scale}px)`,
            }}>
              <div style={{...v.mono(15), color: on > 0.5 ? v.a : v.dim, fontWeight: 700}}>{f.label}</div>
              <div style={{...v.body(11.5), color: v.dim, marginTop: 2 * v.scale}}>{f.sub}</div>
            </div>
          );
        })}
      </div>
      <Stack gap={5 * v.scale}>
        {rest.map((it, i) => (
          <Slab key={i} item={it} accent={v.a} scale={v.scale} t={v.t} rad={v.rad(5)}>
            <Label v={it.label} s={v.mono(14)} c={v.t.colors.text} />
            <Sub v={it.sub} s={v.body(12)} c={v.dim} />
          </Slab>
        ))}
      </Stack>
    </div>
  );
};

/** A snapshot database beside the live disk — and a file present in only one. */
export const IndexVsDisk: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={6 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const missing = /not in|cannot see|missing|nothing/i.test(`${it.label} ${it.sub}`);
        const c = missing ? v.sem('red') : v.a;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 9 * v.scale, opacity: 0.28 + on * 0.72,
            border: `${1.4 * v.scale}px ${missing ? 'dashed' : 'solid'} ${on > 0.5 ? hexA(c, 0.7) : hexA(v.t.colors.panelBorder, 0.5)}`,
            background: on > 0.5 && !missing ? hexA(c, 0.1) : 'transparent',
            borderRadius: v.rad(6), padding: `${6 * v.scale}px ${10 * v.scale}px`,
          }}>
            <div style={{minWidth: 0, flex: 1}}>
              <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? c : v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
            </div>
            {missing ? <div style={{...v.mono(14), color: v.sem('red'), opacity: on}}>✕</div> : null}
          </div>
        );
      })}
    </Stack>
  );
};

/** A two-state machine: the same keys relabel when the mode changes. */
export const ModeMachine: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const insert = liveAt(frame, items.find((i) => /insert|keys are text|now keys/i.test(`${i.label} ${i.sub}`))?.atWord, 14);
  const back = liveAt(frame, items.find((i) => /escape/i.test(`${i.label}`))?.atWord, 14);
  const mode = insert > 0.5 && back < 0.5 ? 'INSERT' : 'COMMAND';
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10 * v.scale, flex: 1, justifyContent: 'center', minHeight: 0}}>
      <div style={{
        alignSelf: 'flex-start', ...v.mono(15), fontWeight: 700, letterSpacing: 2,
        color: mode === 'INSERT' ? v.sem('green') : v.a,
        border: `${1.8 * v.scale}px solid ${hexA(mode === 'INSERT' ? v.sem('green') : v.a, 0.85)}`,
        background: hexA(mode === 'INSERT' ? v.sem('green') : v.a, 0.16),
        borderRadius: v.rad(5), padding: `${4 * v.scale}px ${12 * v.scale}px`,
      }}>-- {mode} --</div>
      <div style={{display: 'flex', gap: 5 * v.scale}}>
        {['j', 'k', 'd', 'w'].map((k) => (
          <div key={k} style={{
            flex: 1, textAlign: 'center', borderRadius: v.rad(5),
            border: `${1.5 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.8)}`,
            background: hexA(v.t.colors.panel, 0.5), padding: `${6 * v.scale}px 0`,
          }}>
            <div style={{...v.mono(16), color: v.t.colors.text, fontWeight: 700}}>{k}</div>
            <div style={{...v.body(11), color: v.dim, marginTop: 2 * v.scale}}>
              {mode === 'INSERT' ? `types "${k}"` : {j: 'down', k: 'up', d: 'delete', w: 'word'}[k]}
            </div>
          </div>
        ))}
      </div>
      <Stack gap={4 * v.scale}>
        {items.map((it, i) => (
          <Slab key={i} item={it} accent={v.a} scale={v.scale} t={v.t} rad={v.rad(5)}>
            <Label v={it.label} s={v.mono(13.5)} c={v.t.colors.text} />
            <Sub v={it.sub} s={v.body(11.5)} c={v.dim} />
          </Slab>
        ))}
      </Stack>
    </div>
  );
};

// ══ JOBS, SESSIONS AND HELP ══════════════════════════════════════════════════

/** Flags as separate mechanical actions on one pipeline, not four letters. */
export const ArchiveBox: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={5 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const isFlag = /^-?[czvfxk]\b|^-[a-z]/i.test((it.label ?? '').trim()) && (it.label ?? '').length <= 14;
        const c = isFlag ? v.a : hexA(v.t.colors.muted, 0.95);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 9 * v.scale, opacity: 0.28 + on * 0.72}}>
            <div style={{
              flex: '0 0 auto', minWidth: 34 * v.scale, textAlign: 'center', borderRadius: v.rad(5),
              border: `${1.6 * v.scale}px solid ${on > 0.5 && isFlag ? hexA(v.a, 0.85) : hexA(v.t.colors.panelBorder, 0.6)}`,
              background: on > 0.5 && isFlag ? hexA(v.a, 0.18) : 'transparent',
              padding: `${4 * v.scale}px ${7 * v.scale}px`,
              ...v.mono(15), color: on > 0.5 ? c : v.dim, fontWeight: 700,
            }}>{isFlag ? it.label : '·'}</div>
            <div style={{minWidth: 0, flex: 1}}>
              {!isFlag ? <Label v={it.label} s={v.mono(14)} c={v.t.colors.text} /> : null}
              <Sub v={it.sub} s={v.body(13)} c={on > 0.5 ? hexA(v.t.colors.text, 0.9) : v.dim} />
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

/** Five fields above a clock, each governing the part of time it actually names. */
export const SchedClock: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const fields = items.filter((i) => /^field \d/i.test(i.label ?? ''));
  const rest = items.filter((i) => !/^field \d/i.test(i.label ?? ''));
  const vals = ['30', '2', '*', '*', '1'];
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10 * v.scale, flex: 1, justifyContent: 'center', minHeight: 0}}>
      <div style={{display: 'flex', gap: 5 * v.scale}}>
        {fields.map((f, i) => {
          const on = liveAt(frame, f.atWord);
          return (
            <div key={i} style={{flex: 1, minWidth: 0, textAlign: 'center'}}>
              <div style={{
                ...v.mono(22), fontWeight: 700, borderRadius: v.rad(5),
                color: on > 0.5 ? v.a : v.dim,
                border: `${1.8 * v.scale}px solid ${on > 0.5 ? hexA(v.a, 0.85) : hexA(v.t.colors.panelBorder, 0.6)}`,
                background: on > 0.5 ? hexA(v.a, 0.16) : 'transparent',
                padding: `${5 * v.scale}px 0`,
                transform: `translateY(${(1 - on) * 5 * v.scale}px)`,
              }}>{vals[i] ?? '*'}</div>
              <div style={{...v.body(11), color: v.dim, marginTop: 3 * v.scale, lineHeight: 1.25}}>{f.sub}</div>
            </div>
          );
        })}
      </div>
      <Stack gap={5 * v.scale}>
        {rest.map((it, i) => (
          <Slab key={i} item={it} accent={v.a} scale={v.scale} t={v.t} rad={v.rad(5)}>
            <Label v={it.label} s={v.mono(14)} c={v.t.colors.text} />
            <Sub v={it.sub} s={v.body(12)} c={v.dim} />
          </Slab>
        ))}
      </Stack>
    </div>
  );
};

/** Nested scopes as real boundaries — a variable that never leaves its box. */
export const EnvScope: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={5 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const outside = /never|nothing else|cannot see|gone|next command|non-interactive/i.test(`${it.label} ${it.sub}`);
        const c = outside ? v.sem('red') : v.a;
        const inset = outside ? 0 : Math.min(i, 3) * 6;
        return (
          <div key={i} style={{
            marginLeft: `${inset}%`, marginRight: `${inset}%`, opacity: 0.28 + on * 0.72,
            border: `${1.5 * v.scale}px ${outside ? 'dashed' : 'solid'} ${on > 0.5 ? hexA(c, 0.75) : hexA(v.t.colors.panelBorder, 0.5)}`,
            background: on > 0.5 && !outside ? hexA(c, 0.1) : 'transparent',
            borderRadius: v.rad(6), padding: `${5 * v.scale}px ${10 * v.scale}px`,
          }}>
            <Label v={it.label} s={v.mono(14)} c={on > 0.5 ? c : v.t.colors.text} />
            <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
          </div>
        );
      })}
    </Stack>
  );
};

/** A session box that belongs to the server; the connection line is cut and it lives. */
export const SessionBox: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={6 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const dies = /dies|goes with it|belongs to the connection/i.test(`${it.label} ${it.sub}`);
        const lives = /carries on|survives|keeps going|reattach|back/i.test(`${it.label} ${it.sub}`);
        const c = dies ? v.sem('red') : lives ? v.sem('green') : v.a;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 9 * v.scale, opacity: 0.28 + on * 0.72}}>
            <div style={{
              flex: '0 0 auto', width: 26 * v.scale, height: 20 * v.scale, borderRadius: v.rad(4),
              border: `${1.6 * v.scale}px ${dies ? 'dashed' : 'solid'} ${on > 0.5 ? hexA(c, 0.85) : hexA(v.t.colors.panelBorder, 0.6)}`,
              background: dies ? 'transparent' : hexA(c, 0.15 * (on > 0.5 ? 1 : 0)),
              opacity: dies && on > 0.5 ? 0.4 : 1,
            }} />
            <div style={{minWidth: 0, flex: 1}}>
              <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? c : v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

/** Two independent switches for one service; a reboot kills only one of them. */
export const ServiceState: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const running = liveAt(frame, items.find((i) => /^start|running/i.test(`${i.label}`))?.atWord, 14);
  const enabled = liveAt(frame, items.find((i) => /^enable|at boot/i.test(`${i.label}`))?.atWord, 14);
  const rebooted = liveAt(frame, items.find((i) => /reboot/i.test(`${i.label}`))?.atWord, 14);
  const Sw = ({on, label}: {on: number; label: string}) => (
    <div style={{flex: 1, textAlign: 'center'}}>
      <div style={{
        height: 22 * v.scale, borderRadius: 999, background: hexA(v.t.colors.panelBorder, 0.5),
        display: 'flex', alignItems: 'center', padding: 2 * v.scale,
        border: `${1.5 * v.scale}px solid ${on > 0.5 ? hexA(v.sem('green'), 0.8) : hexA(v.t.colors.panelBorder, 0.8)}`,
      }}>
        <div style={{
          width: 16 * v.scale, height: 16 * v.scale, borderRadius: 999,
          background: on > 0.5 ? v.sem('green') : hexA(v.t.colors.muted, 0.8),
          transform: `translateX(${on * (100 - 22)}%)`, marginLeft: on > 0 ? `${on * 55}%` : 0,
        }} />
      </div>
      <div style={{...v.body(12), color: on > 0.5 ? v.sem('green') : v.dim, marginTop: 4 * v.scale, fontWeight: 600}}>{label}</div>
    </div>
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10 * v.scale, flex: 1, justifyContent: 'center', minHeight: 0}}>
      <div style={{display: 'flex', gap: 14 * v.scale}}>
        <Sw on={rebooted > 0.5 ? 0 : running} label="running now" />
        <Sw on={enabled} label="starts at boot" />
      </div>
      <Stack gap={4 * v.scale}>
        {items.map((it, i) => (
          <Slab key={i} item={it} accent={v.a} scale={v.scale} t={v.t} rad={v.rad(5)}>
            <Label v={it.label} s={v.mono(13.5)} c={v.t.colors.text} />
            <Sub v={it.sub} s={v.body(12)} c={v.dim} />
          </Slab>
        ))}
      </Stack>
    </div>
  );
};

/** Filters that physically narrow a result set, rather than a list you scroll. */
export const LogFilter: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  // Owner, 2026-08-20: *"journalctl animation is shitty and not relevant and not
  // understandable."* It was twelve grey bars of random width standing in for log
  // lines, shrinking as filters landed — nothing on screen read as a log, and
  // nothing showed WHICH lines a filter removed.
  //
  // Now it shows the journal as journald actually prints it. Each filter chip
  // carries the number of lines that survive it (`value`); as a chip lights, the
  // lines it excludes strike through and fade, the survivors stay lit, and the
  // running count is stated. The narrowing is the animation, on real text.
  const lines = items.find((i) => (i.out?.length ?? 0) > 0)?.out ?? [];
  const filters = items.filter((i) => i.out == null || i.out.length === 0);
  const live = filters.filter((f) => f.atWord != null && frame >= wordToFrame(f.atWord));
  const kept = live.reduce<number | null>((n, f) => (typeof f.value === 'number' ? f.value : n), null);
  const keep = kept == null ? lines.length : Math.max(1, Math.min(lines.length, kept));

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10 * v.scale, flex: 1, minHeight: 0}}>
      {/* the journal itself */}
      {lines.length ? (
        <div style={{
          border: `${1.4 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.9)}`,
          borderRadius: v.rad(8), background: hexA(v.t.colors.bg, 0.55),
          padding: `${8 * v.scale}px ${10 * v.scale}px`,
        }}>
          {lines.map((ln, k) => {
            const survives = k < keep;
            return (
              <div key={k} style={{
                ...v.mono(v.vertical ? 17 : 12.5),
                whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis',
                lineHeight: 1.55,
                color: survives ? v.t.colors.text : hexA(v.t.colors.muted, 0.45),
                textDecoration: survives ? undefined : 'line-through',
                opacity: survives ? 1 : 0.5,
              }}>{ln}</div>
            );
          })}
        </div>
      ) : null}

      {/* the filters, each with what it leaves behind */}
      <Stack gap={5 * v.scale}>
        {filters.map((it, i) => {
          const on = liveAt(frame, it.atWord);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'baseline', gap: 8 * v.scale, opacity: 0.3 + on * 0.7}}>
              <div style={{
                ...v.mono(v.vertical ? 19 : 13.5), fontWeight: 700, flex: '0 0 auto',
                color: on > 0.5 ? v.a : v.dim,
                border: `${1.3 * v.scale}px solid ${on > 0.5 ? hexA(v.a, 0.7) : hexA(v.t.colors.panelBorder, 0.5)}`,
                borderRadius: v.rad(4), padding: `${2 * v.scale}px ${6 * v.scale}px`,
              }}>{it.label}</div>
              <div style={{...v.body(v.vertical ? 16 : 12.5), color: v.dim, minWidth: 0, flex: 1}}>{it.sub}</div>
              {typeof it.value === 'number' ? (
                <div style={{...v.mono(v.vertical ? 18 : 13), fontWeight: 800,
                             color: on > 0.5 ? v.a : v.dim, flex: '0 0 auto'}}>
                  {it.value.toLocaleString()} left
                </div>
              ) : null}
            </div>
          );
        })}
      </Stack>
    </div>
  );
};

/** The manual as numbered shelves — the same word living on two of them. */
export const ManualSections: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  return (
    <Stack gap={5 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord);
        const m = (it.label ?? '').match(/section (\d)/i);
        const big = /1,?\d{3}|1,241/.test(`${it.label} ${it.sub}`);
        const small = /eight lines|one readable|8 lines/i.test(`${it.label} ${it.sub}`);
        const c = big ? hexA(v.t.colors.muted, 0.95) : small ? v.sem('green') : v.a;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 9 * v.scale, opacity: 0.28 + on * 0.72}}>
            {m ? (
              <div style={{
                flex: '0 0 auto', width: 26 * v.scale, height: 26 * v.scale, borderRadius: v.rad(4),
                border: `${1.6 * v.scale}px solid ${on > 0.5 ? hexA(v.a, 0.85) : hexA(v.t.colors.panelBorder, 0.6)}`,
                background: on > 0.5 ? hexA(v.a, 0.16) : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...v.mono(14), color: on > 0.5 ? v.a : v.dim, fontWeight: 700,
              }}>{m[1]}</div>
            ) : (
              <div style={{
                flex: '0 0 auto', width: 26 * v.scale, height: Math.max(6, big ? 24 : small ? 6 : 12) * v.scale,
                borderRadius: 2 * v.scale, background: hexA(c, on > 0.4 ? 0.75 : 0.3),
              }} />
            )}
            <div style={{minWidth: 0, flex: 1}}>
              <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? c : v.t.colors.text} />
              <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

/** A delete gate in front of the tree: refused, prompting, or wide open. */
export const DeleteGate: React.FC<VizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const wipe = liveAt(frame, items.find((i) => /412|gone|no question|asks nothing/i.test(`${i.label} ${i.sub}`))?.atWord, 30);
  const count = Math.round(wipe * 412);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10 * v.scale, flex: 1, justifyContent: 'center', minHeight: 0}}>
      <div style={{display: 'flex', gap: 3 * v.scale}}>
        {Array.from({length: 24}).map((_, k) => (
          <div key={k} style={{
            flex: 1, height: 20 * v.scale, borderRadius: 2 * v.scale,
            background: k / 24 < wipe ? 'transparent' : hexA(v.a, 0.55),
            border: k / 24 < wipe ? `${1 * v.scale}px dashed ${hexA(v.sem('red'), 0.5)}` : 'none',
          }} />
        ))}
      </div>
      <div style={{...v.mono(20), color: wipe > 0.05 ? v.sem('red') : v.dim, fontWeight: 700, textAlign: 'right'}}>
        {count} files gone
      </div>
      <Stack gap={5 * v.scale}>
        {items.map((it, i) => {
          const on = liveAt(frame, it.atWord);
          const guard = /refus|asks|confirm|interactive/i.test(`${it.label} ${it.sub}`);
          const open = /force|no question|asks nothing|-rf|no undo/i.test(`${it.label} ${it.sub}`);
          const c = open ? v.sem('red') : guard ? v.sem('green') : v.a;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 9 * v.scale, opacity: 0.28 + on * 0.72}}>
              <div style={{
                flex: '0 0 auto', width: 5 * v.scale, height: 22 * v.scale, borderRadius: 999,
                background: on > 0.5 ? hexA(c, 0.9) : hexA(v.t.colors.panelBorder, 0.5),
                transform: `rotate(${open && on > 0.5 ? 62 : 0}deg)`,
              }} />
              <div style={{minWidth: 0, flex: 1}}>
                <Label v={it.label} s={v.mono(14.5)} c={on > 0.5 ? c : v.t.colors.text} />
                <Sub v={it.sub} s={v.body(12.5)} c={v.dim} />
              </div>
            </div>
          );
        })}
      </Stack>
    </div>
  );
};

// ══ THE DISPATCHER ═══════════════════════════════════════════════════════════
const REGISTRY: Record<string, React.FC<VizProps>> = {
  'fs-tree': FsTree, 'fs-inode': FsInode, 'fs-listing': FsListing, 'fs-walk': FsWalk,
  'fs-writes': FsWrites, 'mount-tree': MountTree, 'file-clocks': FileClocks, 'file-bytes': FileBytes,
  'file-content': FileContent, 'file-viewport': FileViewport, 'term-buffer': TermBuffer,
  'perm-switches': PermSwitches, 'auth-gate': AuthGate, 'group-sets': GroupSets,
  'hash-oneway': HashOneway, 'session-list': SessionList,
  'proc-table': ProcTable, 'proc-tree': ProcTree, 'proc-live': ProcLive, 'signal-path': SignalPath,
  'timeline-run': TimelineRun, 'handle-map': HandleMap, 'syscall-flow': SyscallFlow, 'pipe-flow': PipeFlow,
  'gauge-board': GaugeBoard, 'metric-chart': MetricChart, 'load-cores': LoadCores, 'memory-bar': MemoryBar,
  'queue-meter': QueueMeter, 'repeat-loop': RepeatLoop,
  'disk-map': DiskMap, 'partition-map': PartitionMap, 'device-ids': DeviceIds,
  'net-path': NetPath, 'net-stack': NetStack, 'net-sockets': NetSockets,
  'bandwidth-flow': BandwidthFlow, 'dns-resolve': DnsResolve, 'port-probe': PortProbe,
  'key-exchange': KeyExchange, 'transfer-bar': TransferBar, 'http-exchange': HttpExchange,
  'sync-diff': SyncDiff, 'record-card': RecordCard,
  'text-compare': TextCompare, 'text-transform': TextTransform, 'field-split': FieldSplit,
  'index-vs-disk': IndexVsDisk, 'mode-machine': ModeMachine,
  'archive-box': ArchiveBox, 'sched-clock': SchedClock, 'env-scope': EnvScope,
  'session-box': SessionBox, 'service-state': ServiceState, 'log-filter': LogFilter,
  'manual-sections': ManualSections, 'delete-gate': DeleteGate,
};

export const Depiction: React.FC<VizProps & {kind: string}> = ({kind, ...props}) => {
  // An unknown kind used to fall back to FileContent — a real picture, confidently drawn,
  // for a beat that asked for something else. See src/unknownKind.tsx for why that is now
  // a visible failure instead of a silent substitution.
  const R = REGISTRY[kind];
  if (!R) return <UnknownKind kind={kind} registry="linuxViz REGISTRY" />;
  return <R {...props} />;
};

/** The closing chip. Lands on its own anchor like everything else. */
export const VizVerdict: React.FC<{text?: string; sub?: string; color: SemColor; atWord?: number}> = ({
  text, sub, color, atWord,
}) => {
  const v = useViz(color);
  const on = useLive(atWord, 12);
  if (!text) return null;
  return (
    <div
      style={{
        marginTop: 10 * v.scale, paddingTop: 9 * v.scale,
        borderTop: `${1.5 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.8)}`,
        opacity: on, transform: `translateY(${(1 - on) * 6 * v.scale}px)`,
      }}
    >
      <div style={{...v.mono(15.5), color: v.a, fontWeight: 700}}>{text}</div>
      {sub ? <div style={{...v.body(13), color: v.dim, marginTop: 2 * v.scale}}>{sub}</div> : null}
    </div>
  );
};
