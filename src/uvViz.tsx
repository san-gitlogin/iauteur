import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useTheme} from './themes';
import {SemColor} from './types';
import {useScale, useSem, hexA} from './ui';
import {stackBudget, pulseAt} from './dsaViz';
import {liveAt, usePulse} from './linuxViz';
import {UnknownKind} from './unknownKind';
import {AssetIcon} from './AssetIcon';

/**
 * uv depictions — the pictures for the uv course.
 *
 * A separate registry from linuxViz on purpose: these draw Python packaging objects
 * (parcels, shelves, interpreter racks), not filesystem or process objects. Filing them
 * under `linuxViz` would have made that file the place where every future course dumps
 * its pictures, which is how a library of 341 types ends up routing through six archetypes
 * (LAW 0n).
 *
 * THE RULE THESE ARE BUILT AGAINST (PLAN.md, from watching the shipped Linux cut):
 * four frames sampled at arbitrary points were the same picture every time — a terminal
 * pane and a box of text rows lighting up in sequence. So: **no depiction here renders a
 * list of rows.** Every one names an object the viewer can see — a parcel, a shelf, a
 * wall going up — and the thing being taught is the thing that moves (LAW 0j).
 *
 * Timing: every element resolves from its OWN atWord through `liveAt`, which is pure, so
 * a whole list resolves inside a `.map()` without hooks in a loop. Nothing in this file
 * runs on a fixed frame interval (LAW 0i defect 1).
 *
 * Sizing: every depiction reads `stackBudget()` and divides the REAL measured pane height.
 * Nothing is sized to a constant (LAW 0o rule 1). The `Math.min(budget * f, CONST)` in
 * each one is a CEILING for the crowded case and must never be the binding term in the
 * ordinary one — the first pass got that wrong in five of eight kinds, drawing the
 * warehouse wall at 17% of the pane's height and floating it in the middle, which is
 * LAW 0o's "patty inside a burger" exactly. `scripts/pane-fill.mjs` measures the ink box
 * against the pane and reports the fraction; run it before accepting a new kind, because
 * a contact sheet makes an undersized picture look composed.
 */

/**
 * The uv depictions read `detail` (the real constraint pip printed beside a package) and
 * `out` (verbatim output lines). linuxViz's `VizItem` carries neither, so borrowing it
 * would have silently starved half of these pictures. Declared locally instead — the
 * field-dropping bug is three-for-three in this repo (LAW 0n corollary), and reusing a
 * near-miss interface is exactly how it happens a fourth time.
 */
export interface UvVizItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  value?: number;
  color?: SemColor;
  atWord?: number;
  out?: string[];
  /** `lucide:<name>` / `si:<brand>` — the station glyph in `env-ceremony`. LAW 0n:
   *  four things on screen must be four RECOGNISABLE objects, never four copies of
   *  one generic box with different words in it. */
  icon?: string;
}

export interface UvVizProps {
  items: UvVizItem[];
  accent: SemColor;
  token?: string;
}

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

// ── atoms ────────────────────────────────────────────────────────────────────
/**
 * A PARCEL. The object a package is in this course: a box with a printed label
 * carrying a name and a version, and a strip of tape across it.
 * `on` drives arrival; `evicted` drives the lift-out in shelf-evict.
 */
const Parcel: React.FC<{
  name: string; version?: string; on: number; v: ReturnType<typeof useViz>;
  w: number; h: number; tone?: 'accent' | 'muted' | 'bad'; pulse?: number; evicted?: number;
}> = ({name, version, on, v, w, h, tone = 'accent', pulse = 0, evicted = 0}) => {
  const col = tone === 'bad' ? v.sem('red') : tone === 'muted' ? v.t.colors.muted : v.a;
  return (
    <div
      style={{
        width: w, height: h,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        gap: 3 * v.scale,
        padding: `${6 * v.scale}px ${9 * v.scale}px`,
        border: `${1.8 * v.scale}px solid ${hexA(col, 0.3 + on * 0.55)}`,
        background: hexA(col, 0.06 + on * 0.14),
        borderRadius: v.rad(7),
        opacity: (0.25 + on * 0.75) * (1 - evicted * 0.85),
        transform: `translateY(${(1 - on) * 10 * v.scale - evicted * 26 * v.scale}px) `
                 + `scale(${1 + pulse * 0.05}) rotate(${evicted * -7}deg)`,
        boxSizing: 'border-box', minWidth: 0, position: 'relative', overflow: 'hidden',
      }}
    >
      {/* the tape strip — what makes it read as a sealed box rather than a card */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: '50%', height: 2 * v.scale,
        background: hexA(col, 0.22 + on * 0.2),
      }} />
      <div style={{...v.mono(Math.max(10, h * 0.20)), color: v.t.colors.text, fontWeight: 700,
                   whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', zIndex: 1}}>
        {name}
      </div>
      {version ? (
        <div style={{...v.mono(Math.max(9, h * 0.16)), color: hexA(col, 0.95), fontWeight: 700, zIndex: 1}}>
          {version}
        </div>
      ) : null}
    </div>
  );
};

/** A SHELF: a plank with slots. The plank is drawn, so "one shelf" is literal. */
const Plank: React.FC<{w: number; v: ReturnType<typeof useViz>; on?: number}> = ({w, v, on = 1}) => (
  <div style={{
    width: w, height: 4 * v.scale, borderRadius: 999,
    background: hexA(v.t.colors.panelBorder, 0.5 + on * 0.5),
  }} />
);

/** A FOLDER: the object a project is. Tab plus body, so it is not a rectangle. */
const Folder: React.FC<{
  name: string; on: number; dark?: number; v: ReturnType<typeof useViz>; w: number; h: number;
  tone?: 'accent' | 'bad';
}> = ({name, on, dark = 0, v, w, h, tone = 'accent'}) => {
  const col = tone === 'bad' ? v.sem('red') : v.a;
  return (
    <div style={{width: w, opacity: 0.25 + on * 0.75, transform: `translateY(${(1 - on) * 8 * v.scale}px)`}}>
      <div style={{
        width: w * 0.42, height: h * 0.16,
        background: hexA(col, (0.3 - dark * 0.22)), borderRadius: `${v.rad(5)}px ${v.rad(5)}px 0 0`,
        borderBottom: 'none',
      }} />
      <div style={{
        width: w, height: h * 0.84,
        border: `${1.8 * v.scale}px solid ${hexA(col, 0.7 - dark * 0.5)}`,
        background: hexA(col, 0.1 - dark * 0.08),
        borderRadius: `0 ${v.rad(7)}px ${v.rad(7)}px ${v.rad(7)}px`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxSizing: 'border-box', padding: 4 * v.scale,
      }}>
        <div style={{...v.mono(Math.max(11, h * 0.17)), fontWeight: 700,
                     color: dark > 0.4 ? v.dim : v.t.colors.text,
                     whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {name}
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{children: React.ReactNode; gap: number; center?: boolean}> = ({children, gap, center}) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: center ? 'center' : 'flex-start',
               gap, width: '100%', minWidth: 0}}>{children}</div>
);

const Caption: React.FC<{text?: string; v: ReturnType<typeof useViz>; on?: number}> = ({text, v, on = 1}) =>
  text ? (
    <div style={{...v.body(Math.max(12, 15 * (v.vertical ? 1.05 : 1))), color: v.dim,
                 opacity: on, textAlign: 'center', maxWidth: '100%'}}>{text}</div>
  ) : null;

// ── 1 · pkg-parcel ───────────────────────────────────────────────────────────
// items[0] = {label: name, text: version, sub: caption}
// Extra items = later versions of the SAME parcel; the version chip is what changes,
// which is the whole point — a package is a name AND a number.
const PkgParcel: React.FC<UvVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const h = Math.min(budget * 0.42, 150 * v.scale);
  const w = h * 1.5;
  const [first, ...rest] = items;
  if (!first) return null;
  const shown = [first, ...rest].filter((it) => liveAt(frame, it.atWord) > 0.05);
  const active = shown[shown.length - 1] ?? first;
  const on = liveAt(frame, active.atWord);
  const pulse = usePulse(active.atWord);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                 justifyContent: 'center', gap: 14 * v.scale, width: '100%', height: '100%'}}>
      <Parcel name={active.label ?? ''} version={active.text} on={on} v={v} w={w} h={h} pulse={pulse} />
      <Caption text={active.sub} v={v} on={on} />
    </div>
  );
};

// ── 2 · pkg-index ────────────────────────────────────────────────────────────
// A warehouse wall of parcels; the one you asked for is pulled forward.
// items = the parcels; the item whose color is set (or the last anchored) is the chosen one.
const PkgIndex: React.FC<UvVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const cols = v.vertical ? 4 : 6;
  const rows = 3;
  const cellH = Math.min((budget * 0.66) / rows, 150 * v.scale);
  const cellW = cellH * 1.35;
  const chosen = items.find((i) => i.color) ?? items[0];
  const chosenOn = liveAt(frame, chosen?.atWord);
  const wallOn = liveAt(frame, items[0]?.atWord);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                 justifyContent: 'center', gap: 16 * v.scale, width: '100%', height: '100%'}}>
      {/* the wall — anonymous stock, deliberately unlabelled so it reads as scale */}
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellW}px)`,
                   gap: 6 * v.scale, opacity: 0.18 + wallOn * 0.3}}>
        {Array.from({length: cols * rows}).map((_, i) => (
          <div key={i} style={{
            width: cellW, height: cellH, borderRadius: v.rad(5),
            border: `${1.3 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.85)}`,
            background: hexA(v.t.colors.panel, 0.5),
          }} />
        ))}
      </div>
      {token ? (
        <div style={{...v.mono(Math.max(11, 14 * v.scale / v.scale)), color: v.dim, opacity: 0.25 + wallOn * 0.6}}>
          {token}
        </div>
      ) : null}
      {chosen ? (
        <Parcel name={chosen.label ?? ''} version={chosen.text} on={chosenOn} v={v}
                w={cellW * 2.1} h={cellH * 1.5} pulse={usePulse(chosen.atWord)} />
      ) : null}
      <Caption text={chosen?.sub} v={v} on={chosenOn} />
    </div>
  );
};

// ── 3 · dep-unfold ───────────────────────────────────────────────────────────
// The parcel you asked for opens; a note extends listing what it needs; those parcels
// arrive beneath it. items[0] = the requested package. items[1..] = what came with it,
// each `detail` carrying the REAL constraint pip printed (e.g. "pygments<3.0.0,>=2.13.0").
const DepUnfold: React.FC<UvVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const [root, ...deps] = items;
  if (!root) return null;
  const rootOn = liveAt(frame, root.atWord);
  const rootH = Math.min(budget * 0.26, 96 * v.scale);
  // The note has a SPINE: one vertical line out of the parcel with a stub to each
  // dependency, so the deps visibly hang off the thing that named them. The first
  // version centred the root and left-aligned the deps with a stub pointing at
  // nothing, which read as two unrelated pictures stacked.
  const gap = 6 * v.scale;
  const rows = Math.max(deps.length, 1);
  const depH = Math.max(26 * v.scale,
    Math.min((budget * 0.52 - gap * (rows - 1)) / rows, 74 * v.scale));
  const depW = depH * 2.4;
  const rootW = rootH * 2.2;
  const spineX = rootW * 0.16;     // under the root's left third, so it reads as hanging
  const stub = 22 * v.scale;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                 justifyContent: 'center', width: '100%', height: '100%', minHeight: 0}}>
      {/* ONE relative group: the root, the spine that leaves its underside, and the
          dependencies hanging off it. Rendered as three separate centred blocks it read
          as two unrelated pictures with a stub pointing at nothing. */}
      <div style={{position: 'relative', display: 'flex', flexDirection: 'column',
                   alignItems: 'flex-start', minWidth: 0}}>
        <Parcel name={root.label ?? ''} version={root.text} on={rootOn} v={v}
                w={rootW} h={rootH} pulse={usePulse(root.atWord)} />
        <div style={{position: 'relative', display: 'flex', flexDirection: 'column', gap,
                     alignItems: 'flex-start', minWidth: 0,
                     paddingLeft: spineX + stub, paddingTop: 10 * v.scale}}>
          {/* the spine — it grows out of the parcel as the root lands */}
          <div style={{position: 'absolute', left: spineX, top: 0,
                       width: 2 * v.scale,
                       height: (10 * v.scale + (depH + gap) * (rows - 1) + depH / 2) * rootOn,
                       background: hexA(v.a, 0.5)}} />
        {deps.map((d, i) => {
          const on = liveAt(frame, d.atWord);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 9 * v.scale,
                                 height: depH, opacity: 0.2 + on * 0.8,
                                 transform: `translateX(${(1 - on) * 16 * v.scale}px)`,
                                 minWidth: 0}}>
              {/* the stub from the spine to this parcel */}
              <div style={{position: 'absolute', left: spineX, width: stub * on,
                           height: 2 * v.scale, background: hexA(v.a, 0.4),
                           top: 10 * v.scale + (depH + gap) * i + depH / 2}} />
              <Parcel name={d.label ?? ''} version={d.text} on={on} v={v}
                      w={depW} h={depH} tone={d.value === 0 ? 'muted' : 'accent'} />
              {d.detail ? (
                <div style={{...v.mono(Math.max(9, depH * 0.22)), color: v.dim, minWidth: 0,
                             whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {d.detail}
                </div>
              ) : null}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

// ── 4 · shelf-share ──────────────────────────────────────────────────────────
// Two projects, one shelf between them, both reaching for the same slot.
// items[0], items[1] = the two projects (label = folder name, text = the version each wants).
// items[2] = what is actually in the slot right now.
// token = 'wrong-shelf' switches to the second mode: the parcel sits on the OTHER shelf.
const ShelfShare: React.FC<UvVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const wrongShelf = token === 'wrong-shelf';
  const [a, b, slot] = items;
  const fH = Math.min(budget * 0.24, 124 * v.scale);
  const fW = fH * 1.5;
  const pH = Math.min(budget * 0.2, 98 * v.scale);
  const aOn = liveAt(frame, a?.atWord);
  const bOn = liveAt(frame, b?.atWord);
  const sOn = liveAt(frame, slot?.atWord);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                 justifyContent: 'center', gap: 10 * v.scale, width: '100%', height: '100%'}}>
      <Row gap={26 * v.scale} center>
        {a ? <Folder name={a.label ?? ''} on={aOn} v={v} w={fW} h={fH} /> : null}
        {b ? <Folder name={b.label ?? ''} on={bOn} v={v} w={fW} h={fH}
                     dark={wrongShelf ? 0 : 0} /> : null}
      </Row>
      {/* the demands — each project's wanted version, travelling down toward the slot */}
      <Row gap={26 * v.scale} center>
        {[a, b].map((p, i) => {
          const on = i === 0 ? aOn : bOn;
          return (
            <div key={i} style={{width: fW, textAlign: 'center', opacity: on,
                                 ...v.mono(Math.max(11, fH * 0.19)),
                                 color: p?.text ? v.a : 'transparent', fontWeight: 700}}>
              {p?.text ? `wants ${p.text}` : ' '}
            </div>
          );
        })}
      </Row>
      {/* the arrows converging on ONE slot */}
      <div style={{display: 'flex', gap: 26 * v.scale, justifyContent: 'center'}}>
        {[aOn, bOn].map((on, i) => (
          <div key={i} style={{width: fW, display: 'flex', justifyContent: 'center'}}>
            <div style={{width: 2 * v.scale, height: 18 * v.scale * on, background: hexA(v.a, 0.55)}} />
          </div>
        ))}
      </div>
      <Plank w={fW * 2 + 26 * v.scale} v={v} on={sOn} />
      <div style={{marginTop: 6 * v.scale, display: 'flex', gap: 26 * v.scale, justifyContent: 'center'}}>
        {slot ? (
          <Parcel name={slot.label ?? ''} version={slot.text} on={sOn} v={v}
                  w={pH * 2.2} h={pH} pulse={usePulse(slot.atWord)}
                  tone={wrongShelf ? 'muted' : 'accent'} />
        ) : null}
      </div>
      <Caption text={slot?.sub} v={v} on={sOn} />
    </div>
  );
};

// ── 5 · shelf-evict ──────────────────────────────────────────────────────────
// The overwrite. The incumbent parcel is physically lifted out and the newcomer drops
// into the same slot. items[0] = the incumbent (text = its version), items[1] = the
// newcomer, items[2] = optional health row (label = the package left broken).
const ShelfEvict: React.FC<UvVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const [old, next, broken] = items;
  const pH = Math.min(budget * 0.22, 116 * v.scale);
  const pW = pH * 2.3;
  const oldOn = liveAt(frame, old?.atWord);
  const evict = liveAt(frame, next?.atWord, 16);   // the newcomer's arrival IS the eviction
  const nextOn = evict;
  const brokenOn = liveAt(frame, broken?.atWord);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                 justifyContent: 'center', gap: 12 * v.scale, width: '100%', height: '100%'}}>
      {/* the slot, with the outgoing parcel lifting away and the incoming one settling */}
      <div style={{position: 'relative', width: pW, height: pH * 2.1}}>
        {old ? (
          <div style={{position: 'absolute', inset: 0}}>
            <Parcel name={old.label ?? ''} version={old.text} on={oldOn} v={v}
                    w={pW} h={pH} evicted={evict} tone="muted" />
          </div>
        ) : null}
        {next ? (
          <div style={{position: 'absolute', left: 0, top: pH * 1.05}}>
            <Parcel name={next.label ?? ''} version={next.text} on={nextOn} v={v}
                    w={pW} h={pH} pulse={usePulse(next.atWord)} />
          </div>
        ) : null}
      </div>
      <Plank w={pW * 1.15} v={v} on={1} />
      {/* the consequence: something else on this shelf now has an unmet requirement */}
      {broken ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8 * v.scale,
          opacity: 0.15 + brokenOn * 0.85,
          transform: `translateY(${(1 - brokenOn) * 8 * v.scale}px)`,
          border: `${1.6 * v.scale}px solid ${hexA(v.sem('red'), 0.15 + brokenOn * 0.6)}`,
          background: hexA(v.sem('red'), 0.05 + brokenOn * 0.09),
          borderRadius: v.rad(7), padding: `${6 * v.scale}px ${11 * v.scale}px`, maxWidth: '100%',
        }}>
          <div style={{...v.mono(Math.max(11, pH * 0.2)), color: v.sem('red'), fontWeight: 800}}>
            {broken.label}
          </div>
          {broken.detail ? (
            <div style={{...v.mono(Math.max(10, pH * 0.17)), color: v.dim, minWidth: 0,
                         whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
              {broken.detail}
            </div>
          ) : null}
        </div>
      ) : null}
      <Caption text={next?.sub} v={v} on={nextOn} />
    </div>
  );
};

// ── 6 · shelf-split ──────────────────────────────────────────────────────────
// The fix, drawn: one shelf divides into two walled shelves and both versions coexist.
// items[0], items[1] = the two projects and the version each now holds.
// items[2] = optional label for the wall itself.
const ShelfSplit: React.FC<UvVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const [a, b, wall] = items;
  const wallOn = liveAt(frame, wall?.atWord ?? b?.atWord, 18);
  const fH = Math.min(budget * 0.2, 112 * v.scale);
  const fW = fH * 1.6;
  const pH = fH * 0.85;
  const gap = 18 * v.scale + wallOn * 34 * v.scale; // the shelves physically separate
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                 justifyContent: 'center', gap: 12 * v.scale, width: '100%', height: '100%'}}>
      <div style={{position: 'relative', display: 'flex', gap, alignItems: 'flex-start'}}>
        {[a, b].map((p, i) => {
          const on = liveAt(frame, p?.atWord);
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                                 gap: 8 * v.scale}}>
              {p ? <Folder name={p.label ?? ''} on={on} v={v} w={fW} h={fH} /> : null}
              <Plank w={fW} v={v} on={on} />
              {p ? <Parcel name={p.detail ?? p.label ?? ''} version={p.text} on={on} v={v}
                           w={fW * 0.9} h={pH} pulse={usePulse(p.atWord)} /> : null}
            </div>
          );
        })}
        {/* THE WALL. Going up is the idea, so it grows rather than fading in. */}
        <div style={{
          position: 'absolute', left: '50%', top: -6 * v.scale,
          transform: `translateX(-50%)`,
          width: 3 * v.scale,
          height: (fH + pH + 30 * v.scale) * wallOn,
          background: hexA(v.a, 0.75), borderRadius: 999,
        }} />
      </div>
      <Caption text={wall?.sub} v={v} on={wallOn} />
    </div>
  );
};

// ── 7 · two-projects ─────────────────────────────────────────────────────────
// The blast radius. You touch one project; the other goes dark without being opened.
// items[0] = the one you touched, items[1] = the one that broke.
const TwoProjects: React.FC<UvVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const [touched, victim] = items;
  const tOn = liveAt(frame, touched?.atWord);
  const dark = liveAt(frame, victim?.atWord, 20);
  const fH = Math.min(budget * 0.34, 200 * v.scale);
  const fW = fH * 1.45;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                 justifyContent: 'center', gap: 16 * v.scale, width: '100%', height: '100%'}}>
      <Row gap={34 * v.scale} center>
        {touched ? <Folder name={touched.label ?? ''} on={tOn} v={v} w={fW} h={fH} /> : null}
        {victim ? <Folder name={victim.label ?? ''} on={1} dark={dark} v={v} w={fW} h={fH}
                          tone={dark > 0.5 ? 'bad' : 'accent'} /> : null}
      </Row>
      <Row gap={34 * v.scale} center>
        <div style={{width: fW, textAlign: 'center', ...v.body(Math.max(11, fH * 0.13)),
                     color: v.dim, opacity: tOn}}>{touched?.sub ?? ' '}</div>
        <div style={{width: fW, textAlign: 'center', ...v.body(Math.max(11, fH * 0.13)),
                     color: dark > 0.5 ? v.sem('red') : v.dim, opacity: Math.max(0.25, dark)}}>
          {victim?.sub ?? ' '}
        </div>
      </Row>
    </div>
  );
};

// ── 8 · env-ceremony ─────────────────────────────────────────────────────────
// A RING, not a list.
//
// The first version of this drew the steps as numbered rows that lit up in order, and
// the MAX fixture rendered nine identical text rows in the right-hand pane — which is
// precisely the defect this whole course was designed around ("the right pane is not a
// list"; four sampled frames of the shipped Linux cut were the same lit-rows template).
// Found by proofing a still, not by reading the code.
//
// The idea being taught is that this is a LOOP: you make the environment, switch it on,
// carry the memory of which one you are in, switch it off — and then you are back at the
// start, every single time, for every project, forever. A loop is a shape. So the
// stations sit around a ring with a marker travelling it, each station a recognisable
// object rather than a sentence. On the final anchor the ring contracts and one command
// takes its place, which is the payoff drawn rather than captioned.
//
// items[0..n-2] = the stations (label = the short name, icon = the object).
// items[n-1]    = the collapse (label = the single command that replaces the ring).
const EnvCeremony: React.FC<UvVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  // `token: "no-collapse"` — the ring WITHOUT its payoff. The chapter that teaches the
  // ritual has to show the ring turning and stop there, because naming the thing that
  // removes it is the next beat's job. Without this mode the last station was silently
  // eaten as a collapse that never fired, so the ring drew one station short.
  const noCollapse = token === 'no-collapse';
  const stations = (noCollapse ? items : items.slice(0, -1)).slice(0, 6);
  const collapse = noCollapse ? undefined : items[items.length - 1];
  const cOn = !noCollapse && items.length > 1 ? liveAt(frame, collapse?.atWord, 20) : 0;

  // The ring is sized from the MEASURED pane, never a constant (LAW 0o rule 1).
  // Sized from the MEASURED pane. The first pass capped the ring at 340 design px and it
  // floated in the middle of a pane twice its height — the "patty inside a burger" LAW 0o
  // was written about. The label sits OUTSIDE its circle, so the ring must leave a node's
  // width of margin all round rather than filling the budget outright.
  const ring = Math.min(budget * 0.80, (v.vertical ? 470 : 400) * v.scale);
  const R = ring / 2;
  const node = Math.min(ring * 0.24, 92 * v.scale);
  // The marker's position IS the last station that has fired — the loop advances on the
  // voice, not on a timer (LAW 0i).
  const lastLive = stations.reduce((acc, st, i) => (liveAt(frame, st.atWord) > 0.5 ? i : acc), -1);
  const markerAngle = ((lastLive < 0 ? 0 : lastLive + 1) / stations.length) * Math.PI * 2 - Math.PI / 2;

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                 justifyContent: 'center', gap: 10 * v.scale, width: '100%', height: '100%',
                 minHeight: 0}}>
      <div style={{
        position: 'relative', width: ring, height: ring,
        // the collapse: the ring shrinks out of existence rather than fading, because
        // the point is that the work GOES AWAY, not that it becomes faint
        transform: `scale(${1 - cOn * 0.82})`, opacity: 1 - cOn,
        flex: '0 0 auto',
      }}>
        {/* THE LOOP ITSELF — one drawn circle, so "again" is visible without a caption */}
        <svg width={ring} height={ring} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <circle cx={R} cy={R} r={R - node * 0.55} fill="none"
                  stroke={hexA(v.a, 0.32)} strokeWidth={2 * v.scale}
                  strokeDasharray={`${7 * v.scale} ${7 * v.scale}`} />
        </svg>
        {stations.map((st, i) => {
          const a = (i / stations.length) * Math.PI * 2 - Math.PI / 2;
          const on = liveAt(frame, st.atWord);
          // pulseAt, not usePulse: a hook inside a .map() is a hook in a loop. Every
          // other depiction in this file resolves through the pure `liveAt` for exactly
          // this reason, and the ring is the first one with a real list to walk.
          const pulse = pulseAt(frame, st.atWord);
          const cx = R + Math.cos(a) * (R - node * 0.55) - node / 2;
          const cy = R + Math.sin(a) * (R - node * 0.55) - node / 2;
          return (
            <div key={i} style={{
              position: 'absolute', left: cx, top: cy, width: node, height: node,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3 * v.scale,
              border: `${1.8 * v.scale}px solid ${hexA(v.a, 0.25 + on * 0.6)}`,
              background: hexA(v.t.colors.panel, 0.5 + on * 0.25),
              borderRadius: '50%',
              opacity: 0.3 + on * 0.7,
              transform: `scale(${(0.9 + on * 0.1) * (1 + pulse * 0.08)})`,
              boxSizing: 'border-box', padding: 4 * v.scale,
            }}>
              {st.icon ? (
                <AssetIcon asset={st.icon} size={node * 0.5} bare
                           tint={hexA(v.a, 0.5 + on * 0.5)} on={v.t.colors.panel} />
              ) : (
                <div style={{...v.mono(node * 0.34), color: hexA(v.a, 0.9), fontWeight: 800}}>{i + 1}</div>
              )}
              {/* the name sits OUTSIDE the circle. Inside, "switch it on" wrapped and
                  spilled over its own border and over the ring behind it. */}
              <div style={{
                position: 'absolute', top: '100%', left: '50%',
                transform: `translate(-50%, ${3 * v.scale}px)`,
                width: node * 2.05, textAlign: 'center',
                ...v.mono(Math.max(10, node * 0.19)), color: v.t.colors.text,
                lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {st.label}
              </div>
            </div>
          );
        })}
        {/* the marker going round — the thing that makes it read as "again, and again" */}
        <div style={{
          position: 'absolute',
          left: R + Math.cos(markerAngle) * (R - node * 0.55) - 5 * v.scale,
          top: R + Math.sin(markerAngle) * (R - node * 0.55) - 5 * v.scale,
          width: 10 * v.scale, height: 10 * v.scale, borderRadius: '50%',
          background: v.a, opacity: lastLive < 0 ? 0 : 1,
        }} />
      </div>
      {collapse && cOn > 0.02 ? (
        <div style={{
          opacity: cOn, transform: `scale(${0.94 + cOn * 0.06})`,
          border: `${2 * v.scale}px solid ${hexA(v.a, 0.8)}`,
          background: hexA(v.a, 0.14), borderRadius: v.rad(8),
          padding: `${10 * v.scale}px ${18 * v.scale}px`, maxWidth: '100%', flex: '0 0 auto',
        }}>
          <div style={{...v.mono(Math.max(14, 22 * v.scale)), color: v.t.colors.text,
                       fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden',
                       textOverflow: 'ellipsis'}}>
            {collapse.label}
          </div>
          {collapse.sub ? (
            <div style={{...v.body(13), color: v.dim, marginTop: 3 * v.scale, textAlign: 'center'}}>
              {collapse.sub}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

// ── dispatcher ───────────────────────────────────────────────────────────────
const UV_VIZ: Record<string, React.FC<UvVizProps>> = {
  'pkg-parcel': PkgParcel,
  'pkg-index': PkgIndex,
  'dep-unfold': DepUnfold,
  'shelf-share': ShelfShare,
  'shelf-evict': ShelfEvict,
  'shelf-split': ShelfSplit,
  'two-projects': TwoProjects,
  'env-ceremony': EnvCeremony,
};

export const UvViz: React.FC<UvVizProps & {kind: string}> = ({kind, ...p}) => {
  // No silent fallback here — see src/unknownKind.tsx. The other three registries each
  // substituted a real picture for an unknown kind, which is how a typo ships a
  // confidently-drawn wrong beat.
  const R = UV_VIZ[kind];
  if (!R) return <UnknownKind kind={kind} registry="uvViz UV_VIZ" />;
  return <R {...p} />;
};

export const UV_VIZ_KINDS = Object.keys(UV_VIZ);
