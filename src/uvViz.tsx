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
 * UNITS, and the bug they hid: `stackBudget()` returns DESIGN px, so a ceiling compared
 * against it must ALSO be design px, and the whole result is multiplied by `v.scale` once
 * at the end. Writing the ceiling as `N * v.scale` and the budget unscaled is a mismatch
 * that is completely invisible at 16:9, where scale is 1 — and at 9:16 scale is 0.5625, so
 * every ceiling shrank by 44% while the budget did not, and every picture in this file
 * rendered far smaller than the pane holding it. Found by looking at a vertical short.
 *
 * The vertical ceilings are also LARGER, not merely rescaled: a 9:16 effect pane is about
 * twice as tall as a 16:9 one, and a picture sized for the short pane floats in the tall one.
 *
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
  const h = Math.min(budget * 0.42, 150) * v.scale;
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
  const cellH = Math.min((budget * 0.66) / rows, v.vertical ? 190 : 150) * v.scale;
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
  const rootH = Math.min(budget * 0.26, v.vertical ? 130 : 96) * v.scale;
  // The note has a SPINE: one vertical line out of the parcel with a stub to each
  // dependency, so the deps visibly hang off the thing that named them. The first
  // version centred the root and left-aligned the deps with a stub pointing at
  // nothing, which read as two unrelated pictures stacked.
  const gap = 6 * v.scale;
  const rows = Math.max(deps.length, 1);
  const depH = Math.max(26, Math.min((budget * 0.52) / rows - 6, v.vertical ? 104 : 74)) * v.scale;
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
  const fH = Math.min(budget * 0.24, v.vertical ? 172 : 124) * v.scale;
  const fW = fH * 1.5;
  const pH = Math.min(budget * 0.2, v.vertical ? 136 : 98) * v.scale;
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
  const pH = Math.min(budget * 0.22, v.vertical ? 162 : 116) * v.scale;
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
  const fH = Math.min(budget * 0.2, v.vertical ? 156 : 112) * v.scale;
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
  const fH = Math.min(budget * 0.34, v.vertical ? 280 : 200) * v.scale;
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
  const ring = Math.min(budget * 0.80, v.vertical ? 620 : 400) * v.scale;
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

// ── 9 · bootstrap-paradox ────────────────────────────────────────────────────
// The spine of chapter 01: A TOOL THAT INSTALLS PYTHON CANNOT ITSELF REQUIRE PYTHON.
// pip is drawn INSIDE the Python it depends on, so when that Python goes, pip goes with
// it. uv is drawn BESIDE it, still standing. The nesting IS the argument, so the picture
// is two containers and what happens to each — never two labelled boxes.
// items[0] = the interpreter (label). items[1] = the tool inside it. items[2] = the tool
// beside it. `value: 0` on items[0] breaks the interpreter and takes the inner tool down.
const BootstrapParadox: React.FC<UvVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const [py, inside, beside] = items;
  const pyOn = liveAt(frame, py?.atWord);
  const inOn = liveAt(frame, inside?.atWord);
  const outOn = liveAt(frame, beside?.atWord);
  // the break: the interpreter's own second anchor, if the author gave it one
  const broke = liveAt(frame, py?.value === 0 ? py?.atWord : undefined, 18) * (py?.value === 0 ? 1 : 0);
  const boxH = Math.min(budget * 0.52, v.vertical ? 290 : 210) * v.scale;
  const boxW = boxH * 1.15;
  const red = v.sem('red');
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                 justifyContent: 'center', gap: 12 * v.scale, width: '100%', height: '100%',
                 minHeight: 0}}>
      <Row gap={22 * v.scale} center>
        {/* the interpreter, with the tool living INSIDE it */}
        <div style={{
          width: boxW, height: boxH, boxSizing: 'border-box', padding: 12 * v.scale,
          border: `${2 * v.scale}px solid ${hexA(broke > 0.4 ? red : v.a, 0.3 + pyOn * 0.6)}`,
          background: hexA(broke > 0.4 ? red : v.a, 0.05 + pyOn * 0.07),
          borderRadius: v.rad(9), opacity: 0.3 + pyOn * 0.7,
          display: 'flex', flexDirection: 'column', gap: 8 * v.scale,
          transform: `rotate(${broke * -3}deg) translateY(${broke * 10 * v.scale}px)`,
        }}>
          <div style={{...v.mono(Math.max(12, boxH * 0.11)), fontWeight: 800,
                       color: broke > 0.4 ? red : v.t.colors.text}}>{py?.label}</div>
          {py?.sub ? <div style={{...v.body(Math.max(10, boxH * 0.075)), color: v.dim}}>{py.sub}</div> : null}
          <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {inside ? (
              <div style={{
                padding: `${9 * v.scale}px ${14 * v.scale}px`, borderRadius: v.rad(7),
                border: `${1.8 * v.scale}px dashed ${hexA(broke > 0.4 ? red : v.a, 0.75)}`,
                background: hexA(broke > 0.4 ? red : v.a, 0.1),
                opacity: (0.25 + inOn * 0.75) * (1 - broke * 0.8),
                textAlign: 'center',
              }}>
                <div style={{...v.mono(Math.max(11, boxH * 0.1)), fontWeight: 800,
                             color: broke > 0.4 ? red : v.t.colors.text}}>{inside.label}</div>
                {inside.sub ? <div style={{...v.body(Math.max(9, boxH * 0.068)), color: v.dim,
                                           marginTop: 2 * v.scale}}>{inside.sub}</div> : null}
              </div>
            ) : null}
          </div>
        </div>
        {/* and the one that stands BESIDE it, on the same ground */}
        {beside ? (
          <div style={{
            width: boxW * 0.78, height: boxH * 0.66, boxSizing: 'border-box', padding: 12 * v.scale,
            border: `${2 * v.scale}px solid ${hexA(v.sem('green'), 0.35 + outOn * 0.6)}`,
            background: hexA(v.sem('green'), 0.06 + outOn * 0.1),
            borderRadius: v.rad(9), opacity: 0.3 + outOn * 0.7,
            alignSelf: 'flex-end',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 * v.scale,
            transform: `translateY(${(1 - outOn) * 12 * v.scale}px)`,
          }}>
            <div style={{...v.mono(Math.max(12, boxH * 0.11)), fontWeight: 800, color: v.t.colors.text}}>
              {beside.label}
            </div>
            {beside.sub ? <div style={{...v.body(Math.max(9, boxH * 0.07)), color: v.dim}}>{beside.sub}</div> : null}
          </div>
        ) : null}
      </Row>
      {/* the ground both of them stand on, so "inside" and "beside" are spatial facts */}
      <Plank w={boxW * 2.1} v={v} on={Math.max(pyOn, outOn)} />
      <Caption text={beside?.detail ?? py?.detail} v={v} on={Math.max(pyOn, outOn)} />
    </div>
  );
};

// ── 10 · install-routes ──────────────────────────────────────────────────────
// Several roads to one destination, one of them marked as the trap. Chapter 01 uses it
// for the install routes (curl / brew / winget / pip — the last being the one that puts
// uv inside the very thing uv exists to manage). Chapter 12 reuses it for the migration
// paths. Roads, drawn as roads: a lane per route that lights when its word lands.
// items[0..n-2] = the routes (label, sub = the command, `value: 0` marks the trap).
// items[n-1] = the destination.
const InstallRoutes: React.FC<UvVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const routes = items.slice(0, -1).slice(0, 5);
  const dest = items[items.length - 1];
  const destOn = liveAt(frame, dest?.atWord);
  const laneH = Math.max(24,
    Math.min((budget * 0.62) / Math.max(routes.length, 1) - 8, v.vertical ? 92 : 62)) * v.scale;
  const red = v.sem('red');
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                 justifyContent: 'center', gap: 10 * v.scale, width: '100%', height: '100%',
                 minHeight: 0}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8 * v.scale, minWidth: 0}}>
        {routes.map((r, i) => {
          const on = liveAt(frame, r.atWord);
          const trap = r.value === 0;
          const col = trap ? red : v.a;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10 * v.scale,
                                 height: laneH, minWidth: 0, opacity: 0.25 + on * 0.75}}>
              <div style={{
                flex: '0 0 auto', width: laneH * 2.6, height: laneH, boxSizing: 'border-box',
                padding: `0 ${10 * v.scale}px`,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                border: `${1.6 * v.scale}px solid ${hexA(col, 0.35 + on * 0.55)}`,
                background: hexA(col, 0.05 + on * 0.1), borderRadius: v.rad(6),
              }}>
                <div style={{...v.mono(Math.max(10, laneH * 0.26)), fontWeight: 800,
                             color: trap ? red : v.t.colors.text, whiteSpace: 'nowrap',
                             overflow: 'hidden', textOverflow: 'ellipsis'}}>{r.label}</div>
                {r.text ? <div style={{...v.mono(Math.max(9, laneH * 0.2)), color: hexA(col, 0.9)}}>{r.text}</div> : null}
              </div>
              {/* the road itself — dashed while dim, solid once the route is named */}
              <div style={{flex: '1 1 auto', height: 2 * v.scale, minWidth: 0,
                           background: trap ? 'transparent' : hexA(col, 0.25 + on * 0.6),
                           borderTop: trap ? `${2 * v.scale}px dashed ${hexA(red, 0.3 + on * 0.6)}` : 'none'}} />
              {r.sub ? (
                <div style={{flex: '0 0 auto', maxWidth: '38%', ...v.mono(Math.max(9, laneH * 0.2)),
                             color: trap ? red : v.dim, whiteSpace: 'nowrap',
                             overflow: 'hidden', textOverflow: 'ellipsis'}}>{r.sub}</div>
              ) : null}
            </div>
          );
        })}
      </div>
      {dest ? (
        <div style={{alignSelf: 'center', marginTop: 4 * v.scale,
                     padding: `${9 * v.scale}px ${18 * v.scale}px`,
                     border: `${2 * v.scale}px solid ${hexA(v.sem('green'), 0.4 + destOn * 0.55)}`,
                     background: hexA(v.sem('green'), 0.07 + destOn * 0.1),
                     borderRadius: v.rad(8), opacity: 0.3 + destOn * 0.7, textAlign: 'center',
                     transform: `scale(${0.95 + destOn * 0.05})`}}>
          <div style={{...v.mono(16), fontWeight: 800, color: v.t.colors.text}}>{dest.label}</div>
          {dest.sub ? <div style={{...v.body(12), color: v.dim, marginTop: 2 * v.scale}}>{dest.sub}</div> : null}
        </div>
      ) : null}
      {token ? <Caption text={token} v={v} on={destOn} /> : null}
    </div>
  );
};

// ── 11 · ephemeral-bay ───────────────────────────────────────────────────────
// A machine wheeled into a bay, used, and wheeled out again — `uvx`. `token: "dock"`
// bolts it to the floor instead, which is `uv tool install`. The SAME picture in two
// modes, because the contrast between the two modes IS chapter 03's argument; that is a
// second mode, not a generic reuse.
// items[0] = the tool. items[1..] = what it left behind (dock mode) or what dissolved.
const EphemeralBay: React.FC<UvVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const docked = token === 'dock';
  const [tool, ...rest] = items;
  const toolOn = liveAt(frame, tool?.atWord);
  // in bay mode the LAST item's anchor is the moment it dissolves
  const gone = docked ? 0 : liveAt(frame, rest[rest.length - 1]?.atWord, 22);
  const bayH = Math.min(budget * 0.5, v.vertical ? 265 : 190) * v.scale;
  const bayW = bayH * 1.5;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                 justifyContent: 'center', gap: 12 * v.scale, width: '100%', height: '100%',
                 minHeight: 0}}>
      {/* THE BAY — an empty outline that exists whether or not anything is in it */}
      <div style={{position: 'relative', width: bayW, height: bayH,
                   border: `${2 * v.scale}px dashed ${hexA(v.t.colors.panelBorder, 0.9)}`,
                   borderRadius: v.rad(9), display: 'flex', alignItems: 'center',
                   justifyContent: 'center'}}>
        {tool ? (
          <div style={{
            width: bayW * 0.62, height: bayH * 0.6, boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 4 * v.scale, padding: 8 * v.scale,
            border: `${2 * v.scale}px solid ${hexA(v.a, 0.35 + toolOn * 0.6)}`,
            background: hexA(v.a, 0.08 + toolOn * 0.12), borderRadius: v.rad(8),
            opacity: (0.25 + toolOn * 0.75) * (1 - gone * 0.92),
            // wheeled IN from the side, and (bay mode) wheeled back out again
            transform: `translateX(${((1 - toolOn) * -40 + gone * 46) * v.scale}px)`
                     + ` scale(${1 - gone * 0.12})`,
          }}>
            {tool.icon ? <AssetIcon asset={tool.icon} size={bayH * 0.2} bare
                                    tint={hexA(v.a, 0.9)} on={v.t.colors.panel} /> : null}
            <div style={{...v.mono(Math.max(12, bayH * 0.12)), fontWeight: 800, color: v.t.colors.text}}>
              {tool.label}
            </div>
            {tool.text ? <div style={{...v.mono(Math.max(10, bayH * 0.09)), color: hexA(v.a, 0.95)}}>{tool.text}</div> : null}
          </div>
        ) : null}
        {/* BOLTS — dock mode only. Four of them, and they are why it is still here. */}
        {docked ? [0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            position: 'absolute', width: 9 * v.scale, height: 9 * v.scale, borderRadius: '50%',
            background: hexA(v.sem('green'), 0.35 + toolOn * 0.6),
            left: i % 2 ? undefined : bayW * 0.14, right: i % 2 ? bayW * 0.14 : undefined,
            top: i < 2 ? bayH * 0.16 : undefined, bottom: i < 2 ? undefined : bayH * 0.16,
            opacity: toolOn,
          }} />
        )) : null}
      </div>
      <Plank w={bayW * 1.1} v={v} on={1} />
      {/* what is left over afterwards — nothing, or a shim on the path */}
      <Row gap={10 * v.scale} center>
        {rest.slice(0, 3).map((r, i) => {
          const on = liveAt(frame, r.atWord);
          return (
            <div key={i} style={{
              padding: `${6 * v.scale}px ${11 * v.scale}px`, borderRadius: v.rad(6),
              border: `${1.5 * v.scale}px solid ${hexA(docked ? v.sem('green') : v.t.colors.panelBorder, 0.3 + on * 0.55)}`,
              background: hexA(docked ? v.sem('green') : v.t.colors.panel, 0.05 + on * 0.12),
              opacity: 0.25 + on * 0.75, textAlign: 'center', minWidth: 0,
            }}>
              <div style={{...v.mono(12), color: v.t.colors.text, fontWeight: 700,
                           whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{r.label}</div>
              {r.sub ? <div style={{...v.body(11), color: v.dim}}>{r.sub}</div> : null}
            </div>
          );
        })}
      </Row>
    </div>
  );
};

// ── 12 · interpreter-rack ────────────────────────────────────────────────────
// A rack of engines, one of them tagged to the project. Chapter 05. The rack is drawn as
// a rack — engines of different sizes on rails — so "uv owns your Pythons" is a place you
// can point at, not a sentence. `value: 0` = not installed yet (an empty rail slot).
// items[] = the versions. The item carrying `detail` is the one pinned.
const InterpreterRack: React.FC<UvVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const rows = items.slice(0, 8);
  const rowH = Math.max(20,
    Math.min((budget * 0.72) / Math.max(rows.length, 1) - 5, v.vertical ? 76 : 52)) * v.scale;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                 justifyContent: 'center', gap: 5 * v.scale, width: '100%', height: '100%',
                 minHeight: 0}}>
      {token ? <Caption text={token} v={v} on={liveAt(frame, rows[0]?.atWord)} /> : null}
      {rows.map((r, i) => {
        const on = liveAt(frame, r.atWord);
        const empty = r.value === 0;
        const pinned = Boolean(r.detail);
        const col = pinned ? v.sem('green') : v.a;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8 * v.scale,
                               height: rowH, minWidth: 0, opacity: 0.25 + on * 0.75}}>
            {/* the rail this engine sits on — drawn even when the slot is empty */}
            <div style={{flex: '0 0 auto', width: 10 * v.scale, height: '70%',
                         background: hexA(v.t.colors.panelBorder, 0.8), borderRadius: 2}} />
            <div style={{
              flex: '0 0 auto', width: rowH * (empty ? 2.2 : 3.4), height: '78%',
              boxSizing: 'border-box', padding: `0 ${9 * v.scale}px`,
              display: 'flex', alignItems: 'center', gap: 7 * v.scale,
              border: `${1.6 * v.scale}px ${empty ? 'dashed' : 'solid'} ${hexA(col, 0.3 + on * 0.55)}`,
              background: empty ? 'transparent' : hexA(col, 0.06 + on * 0.11),
              borderRadius: v.rad(5),
              transform: `translateX(${(1 - on) * -14 * v.scale}px)`,
            }}>
              <div style={{...v.mono(Math.max(10, rowH * 0.34)), fontWeight: 800,
                           color: empty ? v.dim : v.t.colors.text, whiteSpace: 'nowrap'}}>{r.label}</div>
              {r.text ? <div style={{...v.mono(Math.max(9, rowH * 0.27)), color: hexA(col, 0.95)}}>{r.text}</div> : null}
            </div>
            {r.sub ? (
              <div style={{flex: '1 1 auto', minWidth: 0, ...v.mono(Math.max(9, rowH * 0.26)),
                           color: v.dim, whiteSpace: 'nowrap', overflow: 'hidden',
                           textOverflow: 'ellipsis'}}>{r.sub}</div>
            ) : null}
            {pinned ? (
              <div style={{flex: '0 0 auto', padding: `${3 * v.scale}px ${8 * v.scale}px`,
                           border: `${1.5 * v.scale}px solid ${hexA(v.sem('green'), 0.85)}`,
                           borderRadius: v.rad(4), background: hexA(v.sem('green'), 0.15),
                           ...v.mono(Math.max(9, rowH * 0.24)), color: v.sem('green'), fontWeight: 800}}>
                {r.detail}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// ── 13 · project-tree ────────────────────────────────────────────────────────
// The files `uv init` writes, appearing one at a time as each is named. A TREE, with the
// indent drawn as real guide rails, because chapter 06 teaches the tree line by line and
// a viewer must be able to see which file sits inside which folder.
// items[] = {label: filename, value: depth 0-2, sub: what it is for, detail: a badge}
const ProjectTree: React.FC<UvVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const rows = items.slice(0, 8);
  const rowH = Math.max(20,
    Math.min((budget * 0.78) / Math.max(rows.length, 1) - 4, v.vertical ? 74 : 50)) * v.scale;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                 justifyContent: 'center', gap: 4 * v.scale, width: '100%', height: '100%',
                 minHeight: 0}}>
      {rows.map((r, i) => {
        const on = liveAt(frame, r.atWord);
        const depth = Math.max(0, Math.min(2, r.value ?? 0));
        const isDir = (r.label ?? '').endsWith('/');
        const col = r.color ? v.sem(r.color) : v.a;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', height: rowH,
                               minWidth: 0, opacity: 0.2 + on * 0.8,
                               transform: `translateX(${(1 - on) * 10 * v.scale}px)`}}>
            {/* guide rails — one per level of indent, so the nesting is a drawn fact */}
            {Array.from({length: depth}).map((_, d) => (
              <div key={d} style={{flex: '0 0 auto', width: 22 * v.scale, height: '100%',
                                   borderLeft: `${1.4 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.7)}`,
                                   marginLeft: d === 0 ? 8 * v.scale : 0}} />
            ))}
            <div style={{flex: '0 0 auto', width: 16 * v.scale, height: 1.4 * v.scale,
                         background: hexA(v.t.colors.panelBorder, 0.7),
                         marginRight: 7 * v.scale, marginLeft: depth ? 0 : 8 * v.scale}} />
            <div style={{...v.mono(Math.max(11, rowH * 0.36)), fontWeight: isDir ? 800 : 700,
                         color: isDir ? hexA(col, 0.98) : v.t.colors.text, whiteSpace: 'nowrap',
                         flex: '0 0 auto'}}>{r.label}</div>
            {r.detail ? (
              <div style={{marginLeft: 8 * v.scale, flex: '0 0 auto',
                           padding: `${2 * v.scale}px ${6 * v.scale}px`, borderRadius: v.rad(4),
                           border: `${1.3 * v.scale}px solid ${hexA(col, 0.7)}`,
                           ...v.mono(Math.max(8, rowH * 0.24)), color: hexA(col, 0.95), fontWeight: 800}}>
                {r.detail}
              </div>
            ) : null}
            {r.sub ? (
              <div style={{marginLeft: 12 * v.scale, minWidth: 0, flex: '1 1 auto',
                           ...v.body(Math.max(9, rowH * 0.27)), color: v.dim,
                           whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                {r.sub}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// ── 14 · constraint-line ─────────────────────────────────────────────────────
// One version NUMBER LINE, with a bracketed range per package laid across it. Where the
// brackets overlap there is an answer; where they do not, there is the conflict uv
// narrates in plain English. Chapter 10's whole argument, and the animation is handed to
// us by the tool itself.
// items[0] = the axis (label = the package, sub = the tick labels, comma separated).
// items[1..] = the ranges: text = "lo..hi" as fractions 0-1, label = who is asking.
// `value: 0` marks a range that fails to overlap the others.
const ConstraintLine: React.FC<UvVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const [axis, ...ranges] = items;
  const axisOn = liveAt(frame, axis?.atWord);
  const ticks = (axis?.sub ?? '').split(',').map((x) => x.trim()).filter(Boolean);
  const barH = Math.max(18,
    Math.min((budget * 0.5) / Math.max(ranges.length, 1) - 8, v.vertical ? 66 : 44)) * v.scale;
  const red = v.sem('red');
  const parse = (t?: string) => {
    const m = /^([0-9.]+)\.\.([0-9.]+)$/.exec(t ?? '');
    return m ? [Math.max(0, Math.min(1, +m[1])), Math.max(0, Math.min(1, +m[2]))] : [0, 1];
  };
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                 justifyContent: 'center', gap: 10 * v.scale, width: '100%', height: '100%',
                 minHeight: 0}}>
      <div style={{...v.mono(14), color: v.dim, opacity: axisOn}}>{axis?.label}</div>
      {/* THE LINE, with real version numbers on it — the thing the ranges are measured against */}
      <div style={{position: 'relative', height: 26 * v.scale, opacity: 0.2 + axisOn * 0.8}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 6 * v.scale,
                     height: 2 * v.scale, background: hexA(v.t.colors.panelBorder, 0.95)}} />
        {ticks.map((t, i) => (
          <div key={i} style={{position: 'absolute', left: `${(i / Math.max(ticks.length - 1, 1)) * 100}%`,
                               transform: 'translateX(-50%)', top: 0, textAlign: 'center'}}>
            <div style={{width: 1.6 * v.scale, height: 12 * v.scale, margin: '0 auto',
                         background: hexA(v.t.colors.panelBorder, 0.95)}} />
            <div style={{...v.mono(11), color: v.dim, marginTop: 2 * v.scale, whiteSpace: 'nowrap'}}>{t}</div>
          </div>
        ))}
      </div>
      {/* one BRACKETED range per asker, laid across the same line */}
      <div style={{display: 'flex', flexDirection: 'column', gap: 6 * v.scale}}>
        {ranges.slice(0, 4).map((r, i) => {
          const on = liveAt(frame, r.atWord);
          const [lo, hi] = parse(r.text);
          const bad = r.value === 0;
          const col = bad ? red : v.a;
          return (
            <div key={i} style={{position: 'relative', height: barH, opacity: 0.2 + on * 0.8}}>
              <div style={{position: 'absolute', left: `${lo * 100}%`, width: `${(hi - lo) * 100}%`,
                           top: 0, bottom: 0,
                           borderLeft: `${3 * v.scale}px solid ${hexA(col, 0.95)}`,
                           borderRight: `${3 * v.scale}px solid ${hexA(col, 0.95)}`,
                           borderTop: `${1.6 * v.scale}px solid ${hexA(col, 0.6)}`,
                           borderBottom: `${1.6 * v.scale}px solid ${hexA(col, 0.6)}`,
                           background: hexA(col, 0.09 + on * 0.08), borderRadius: v.rad(3),
                           transform: `scaleX(${0.86 + on * 0.14})`, transformOrigin: 'left center',
                           display: 'flex', alignItems: 'center', justifyContent: 'center',
                           overflow: 'hidden'}}>
                <div style={{...v.mono(Math.max(9, barH * 0.34)), color: hexA(col, 0.98),
                             fontWeight: 800, whiteSpace: 'nowrap'}}>{r.detail}</div>
              </div>
              <div style={{position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                           ...v.mono(Math.max(9, barH * 0.3)), color: v.dim, whiteSpace: 'nowrap',
                           opacity: lo > 0.14 ? 1 : 0}}>{r.label}</div>
            </div>
          );
        })}
      </div>
      {token ? <Caption text={token} v={v} on={liveAt(frame, ranges[ranges.length - 1]?.atWord)} /> : null}
    </div>
  );
};

// ── 15 · packing-list ────────────────────────────────────────────────────────
// The lockfile as a PACKING LIST: a sheet with an exact identity per line and a wax seal
// against each one, because the sha256 answers "which exact bytes", not "which version".
// `token: "two-machines"` puts the same sheet in two hands and stamps both identical,
// which is chapter 09's actual promise.
// items[] = {label: package, text: version, detail: the first bytes of the hash}
const PackingList: React.FC<UvVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const two = token === 'two-machines';
  const rows = items.slice(0, two ? 4 : 6);
  const rowH = Math.max(18,
    Math.min((budget * (two ? 0.42 : 0.72)) / Math.max(rows.length, 1) - 4, v.vertical ? 66 : 44)) * v.scale;
  const green = v.sem('green');
  const sheet = (side: number) => (
    <div style={{
      flex: two ? '1 1 0' : '0 0 auto', minWidth: 0,
      border: `${1.8 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.95)}`,
      borderRadius: v.rad(7), padding: 10 * v.scale, background: hexA(v.t.colors.panel, 0.4),
      display: 'flex', flexDirection: 'column', gap: 4 * v.scale,
    }}>
      {rows.map((r, i) => {
        const on = liveAt(frame, r.atWord);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8 * v.scale,
                               height: rowH, minWidth: 0, opacity: 0.2 + on * 0.8}}>
            <div style={{...v.mono(Math.max(10, rowH * 0.34)), fontWeight: 700,
                         color: v.t.colors.text, whiteSpace: 'nowrap', flex: '0 0 auto'}}>{r.label}</div>
            <div style={{...v.mono(Math.max(10, rowH * 0.32)), color: hexA(v.a, 0.98),
                         fontWeight: 800, flex: '0 0 auto'}}>{r.text}</div>
            <div style={{flex: '1 1 auto', height: 1, minWidth: 6 * v.scale,
                         borderTop: `${1.2 * v.scale}px dotted ${hexA(v.t.colors.panelBorder, 0.8)}`}} />
            {/* the SEAL: a stamped disc carrying the start of the hash */}
            <div style={{flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 5 * v.scale,
                         transform: `scale(${0.8 + on * 0.2}) rotate(${(1 - on) * (side ? 8 : -8)}deg)`}}>
              <div style={{width: rowH * 0.5, height: rowH * 0.5, borderRadius: '50%',
                           border: `${1.6 * v.scale}px solid ${hexA(green, 0.35 + on * 0.6)}`,
                           background: hexA(green, 0.1 + on * 0.12)}} />
              <div style={{...v.mono(Math.max(8, rowH * 0.26)), color: v.dim, whiteSpace: 'nowrap',
                           overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: rowH * 3.4}}>
                {r.detail}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                 justifyContent: 'center', gap: 10 * v.scale, width: '100%', height: '100%',
                 minHeight: 0}}>
      {two ? (
        <>
          <Row gap={14 * v.scale} center>{sheet(0)}{sheet(1)}</Row>
          <Row gap={14 * v.scale} center>
            <div style={{flex: '1 1 0', textAlign: 'center', ...v.mono(12), color: v.dim}}>your laptop</div>
            <div style={{flex: '1 1 0', textAlign: 'center', ...v.mono(12), color: v.dim}}>their laptop</div>
          </Row>
        </>
      ) : sheet(0)}
      <Caption text={items[items.length - 1]?.sub} v={v}
               on={liveAt(frame, items[items.length - 1]?.atWord)} />
    </div>
  );
};

// ── 16 · depot-cache ─────────────────────────────────────────────────────────
// The second delivery is instant because the parcel never left town. A local DEPOT sits
// between the warehouse and your shelf; the first run drives the long way, the second
// stops at the depot. Two journeys drawn as two journeys, with the real measured times
// on them — chapter 02 opens this loop and chapter 11 closes it.
// items[0] = the cold run (text = the time). items[1] = the warm run. items[2] = optional note.
const DepotCache: React.FC<UvVizProps> = ({items, accent, token}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const [cold, warm, note] = items;
  const coldOn = liveAt(frame, cold?.atWord);
  const warmOn = liveAt(frame, warm?.atWord);
  const noteOn = liveAt(frame, note?.atWord);
  const h = Math.min(budget * 0.2, v.vertical ? 104 : 74) * v.scale;
  const green = v.sem('green');
  const stop = (label: string, on: number, col: string, wide = false) => (
    <div style={{
      flex: '0 0 auto', padding: `${7 * v.scale}px ${(wide ? 14 : 10) * v.scale}px`,
      border: `${1.6 * v.scale}px solid ${hexA(col, 0.3 + on * 0.6)}`,
      background: hexA(col, 0.06 + on * 0.11), borderRadius: v.rad(6),
      ...v.mono(Math.max(10, h * 0.24)), color: v.t.colors.text, fontWeight: 700,
      whiteSpace: 'nowrap', opacity: 0.3 + on * 0.7,
    }}>{label}</div>
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                 justifyContent: 'center', gap: 14 * v.scale, width: '100%', height: '100%',
                 minHeight: 0}}>
      {/* the long way round — warehouse, then depot, then your shelf */}
      <div style={{opacity: 0.25 + coldOn * 0.75}}>
        <Row gap={7 * v.scale}>
          {stop(token ?? 'PyPI', coldOn, v.a, true)}
          <div style={{flex: '1 1 auto', height: 2 * v.scale, background: hexA(v.a, 0.2 + coldOn * 0.5)}} />
          {stop('depot', coldOn, v.a)}
          <div style={{flex: '1 1 auto', height: 2 * v.scale, background: hexA(v.a, 0.2 + coldOn * 0.5)}} />
          {stop('your shelf', coldOn, v.a)}
          <div style={{flex: '0 0 auto', ...v.mono(Math.max(12, h * 0.3)), fontWeight: 800,
                       color: hexA(v.a, 0.98), minWidth: 74 * v.scale, textAlign: 'right'}}>
            {cold?.text}
          </div>
        </Row>
        <div style={{...v.body(12), color: v.dim, marginTop: 3 * v.scale}}>{cold?.sub}</div>
      </div>
      {/* and the short way — the journey physically stops being long */}
      <div style={{opacity: 0.25 + warmOn * 0.75}}>
        <Row gap={7 * v.scale}>
          <div style={{flex: '0 0 auto', width: 0, overflow: 'hidden',
                       transition: 'none'}} />
          <div style={{flex: `0 0 ${(1 - warmOn) * 34}%`, height: 2 * v.scale,
                       background: hexA(v.t.colors.panelBorder, 0.4)}} />
          {stop('depot', warmOn, green)}
          <div style={{flex: '1 1 auto', height: 2 * v.scale, background: hexA(green, 0.2 + warmOn * 0.6)}} />
          {stop('your shelf', warmOn, green)}
          <div style={{flex: '0 0 auto', ...v.mono(Math.max(12, h * 0.3)), fontWeight: 800,
                       color: hexA(green, 0.98), minWidth: 74 * v.scale, textAlign: 'right'}}>
            {warm?.text}
          </div>
        </Row>
        <div style={{...v.body(12), color: v.dim, marginTop: 3 * v.scale}}>{warm?.sub}</div>
      </div>
      {note ? <Caption text={note.label} v={v} on={noteOn} /> : null}
    </div>
  );
};

// ── 17 · script-header ───────────────────────────────────────────────────────
// The PEP 723 block lifting off the top of the file and becoming the environment that
// runs it. Chapter 04. The lift IS the idea: the comment at the top of a single file is
// not a comment, it is an instruction to build a shelf.
// items[0] = the file (label = filename). items[1..] = the header lines that lift.
const ScriptHeader: React.FC<UvVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const [file, ...lines] = items;
  const fileOn = liveAt(frame, file?.atWord);
  const lift = liveAt(frame, lines[lines.length - 1]?.atWord, 24);
  const lineH = Math.max(16, Math.min(budget * 0.09, v.vertical ? 44 : 30)) * v.scale;
  const green = v.sem('green');
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                 justifyContent: 'center', gap: 10 * v.scale, width: '100%', height: '100%',
                 minHeight: 0}}>
      {/* the header block, rising away from the file it was written in */}
      <div style={{
        width: '92%', boxSizing: 'border-box', padding: 9 * v.scale,
        border: `${1.8 * v.scale}px solid ${hexA(lift > 0.3 ? green : v.a, 0.35 + fileOn * 0.5)}`,
        background: hexA(lift > 0.3 ? green : v.a, 0.06 + lift * 0.12),
        borderRadius: v.rad(7),
        transform: `translateY(${-lift * 16 * v.scale}px) scale(${1 + lift * 0.03})`,
        boxShadow: lift > 0.1 ? `0 ${lift * 12 * v.scale}px ${lift * 22 * v.scale}px ${hexA('#000000', 0.35 * lift)}` : 'none',
      }}>
        {lines.slice(0, 5).map((l, i) => {
          const on = liveAt(frame, l.atWord);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8 * v.scale,
                                 height: lineH, opacity: 0.2 + on * 0.8, minWidth: 0}}>
              <div style={{...v.mono(Math.max(10, lineH * 0.5)), color: v.t.colors.text,
                           whiteSpace: 'pre', flex: '0 0 auto'}}>{l.label}</div>
              {l.sub ? <div style={{...v.body(Math.max(9, lineH * 0.42)), color: v.dim, minWidth: 0,
                                    whiteSpace: 'nowrap', overflow: 'hidden',
                                    textOverflow: 'ellipsis'}}>{l.sub}</div> : null}
            </div>
          );
        })}
      </div>
      {/* the file it came from — one name, and nothing else beside it */}
      <div style={{
        width: '62%', boxSizing: 'border-box', padding: `${10 * v.scale}px ${14 * v.scale}px`,
        border: `${1.8 * v.scale}px dashed ${hexA(v.t.colors.panelBorder, 0.9)}`,
        borderRadius: v.rad(7), textAlign: 'center', opacity: 0.3 + fileOn * 0.7,
      }}>
        <div style={{...v.mono(Math.max(12, 17 * v.scale)), fontWeight: 800, color: v.t.colors.text}}>
          {file?.label}
        </div>
        {file?.sub ? <div style={{...v.body(12), color: v.dim, marginTop: 2 * v.scale}}>{file.sub}</div> : null}
      </div>
      <Caption text={lift > 0.3 ? file?.detail : undefined} v={v} on={lift} />
    </div>
  );
};

// ── 18 · strict-gate ─────────────────────────────────────────────────────────
// One parcel, two gates. pip waves it through; uv stops it and stamps the reason on it.
// Chapter 12. Deliberately NOT a two-column ledger of the eighteen documented
// divergences — that is LAW 0n's "rows of text that light up". Two gates, one parcel,
// and what each gate does to it.
// items[0] = the parcel. items[1] = the lenient gate. items[2] = the strict gate.
const StrictGate: React.FC<UvVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const [pkg, lenient, strict] = items;
  const pOn = liveAt(frame, pkg?.atWord);
  const lOn = liveAt(frame, lenient?.atWord);
  const sOn = liveAt(frame, strict?.atWord);
  const h = Math.min(budget * 0.3, v.vertical ? 182 : 130) * v.scale;
  const green = v.sem('green');
  const red = v.sem('red');
  const gate = (item: UvVizItem | undefined, on: number, pass: boolean) => (
    <div style={{flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column',
                 alignItems: 'center', gap: 7 * v.scale, opacity: 0.25 + on * 0.75}}>
      <div style={{...v.mono(Math.max(11, h * 0.16)), color: v.dim, fontWeight: 700}}>{item?.label}</div>
      {/* the barrier: lifted when it passes, down and solid when it does not */}
      <div style={{position: 'relative', width: '100%', height: h * 0.5}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: h * 0.24,
                     height: 3 * v.scale, borderRadius: 2,
                     background: hexA(pass ? green : red, 0.35 + on * 0.6),
                     transform: `rotate(${pass ? -on * 34 : 0}deg)`,
                     transformOrigin: 'left center'}} />
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 * v.scale,
                     background: hexA(v.t.colors.panelBorder, 0.95)}} />
        <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: 3 * v.scale,
                     background: hexA(v.t.colors.panelBorder, 0.95)}} />
        {/* the parcel, through the gate or stopped at it */}
        <div style={{position: 'absolute', top: h * 0.06, left: pass ? `${on * 62}%` : '14%',
                     opacity: pOn}}>
          <Parcel name={pkg?.label ?? ''} version={pkg?.text} on={pOn} v={v}
                  w={h * 0.9} h={h * 0.34} tone={pass ? 'accent' : 'bad'} />
        </div>
      </div>
      {/* the STAMP — the reason, printed on the refusal rather than said beside it */}
      {item?.sub ? (
        <div style={{
          padding: `${5 * v.scale}px ${10 * v.scale}px`, borderRadius: v.rad(5),
          border: `${1.6 * v.scale}px solid ${hexA(pass ? green : red, 0.3 + on * 0.6)}`,
          background: hexA(pass ? green : red, 0.07 + on * 0.1),
          ...v.mono(Math.max(9, h * 0.13)), color: pass ? green : red, fontWeight: 800,
          textAlign: 'center', maxWidth: '100%', whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
          transform: `scale(${0.9 + on * 0.1}) rotate(${(1 - on) * -6}deg)`,
        }}>{item.sub}</div>
      ) : null}
      {item?.detail ? <Caption text={item.detail} v={v} on={on} /> : null}
    </div>
  );
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center',
                 gap: 20 * v.scale, width: '100%', height: '100%', minHeight: 0}}>
      {gate(lenient, lOn, true)}
      {gate(strict, sOn, false)}
    </div>
  );
};

// ── 19 · dist-output ─────────────────────────────────────────────────────────
// What `uv build` puts in dist/, and the fact the output itself states: the WHEEL is
// built FROM the sdist, not beside it. Chapter 13. Drawn as one crate producing another,
// because "built from" is a relationship and a relationship needs an arrow you can see.
// items[0] = the source tree. items[1] = the sdist. items[2] = the wheel.
const DistOutput: React.FC<UvVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v);
  const [src, sdist, wheel] = items;
  const h = Math.min(budget * 0.26, v.vertical ? 146 : 104) * v.scale;
  const green = v.sem('green');
  const crate = (item: UvVizItem | undefined, on: number, col: string) => (
    <div style={{
      flex: '0 0 auto', width: h * 2.3, boxSizing: 'border-box', padding: 9 * v.scale,
      border: `${1.8 * v.scale}px solid ${hexA(col, 0.3 + on * 0.6)}`,
      background: hexA(col, 0.06 + on * 0.1), borderRadius: v.rad(7),
      opacity: 0.25 + on * 0.75, transform: `translateY(${(1 - on) * 12 * v.scale}px)`,
      minWidth: 0,
    }}>
      <div style={{...v.mono(Math.max(10, h * 0.16)), fontWeight: 800, color: v.t.colors.text,
                   whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item?.label}</div>
      {item?.text ? <div style={{...v.mono(Math.max(9, h * 0.13)), color: hexA(col, 0.95),
                                 marginTop: 2 * v.scale}}>{item.text}</div> : null}
      {item?.sub ? <div style={{...v.body(Math.max(9, h * 0.12)), color: v.dim,
                                marginTop: 3 * v.scale, whiteSpace: 'nowrap',
                                overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.sub}</div> : null}
    </div>
  );
  const arrow = (on: number, label?: string) => (
    <div style={{flex: '1 1 auto', minWidth: 24 * v.scale, display: 'flex',
                 flexDirection: 'column', alignItems: 'center', gap: 3 * v.scale, opacity: on}}>
      <div style={{width: '100%', height: 2 * v.scale, background: hexA(v.a, 0.6),
                   transform: `scaleX(${on})`, transformOrigin: 'left center'}} />
      {label ? <div style={{...v.mono(10), color: v.dim, whiteSpace: 'nowrap'}}>{label}</div> : null}
    </div>
  );
  const sOn = liveAt(frame, src?.atWord);
  const dOn = liveAt(frame, sdist?.atWord);
  const wOn = liveAt(frame, wheel?.atWord);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                 justifyContent: 'center', gap: 12 * v.scale, width: '100%', height: '100%',
                 minHeight: 0}}>
      <Row gap={8 * v.scale} center>
        {crate(src, sOn, v.a)}
        {arrow(dOn, src?.detail)}
        {crate(sdist, dOn, v.a)}
      </Row>
      {/* the second arrow points from the SDIST, which is the fact worth drawing */}
      <div style={{width: 2 * v.scale, height: 18 * v.scale * wOn, background: hexA(green, 0.7)}} />
      <Row gap={8 * v.scale} center>{crate(wheel, wOn, green)}</Row>
      <Caption text={wheel?.detail} v={v} on={wOn} />
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
  'bootstrap-paradox': BootstrapParadox,
  'install-routes': InstallRoutes,
  'ephemeral-bay': EphemeralBay,
  'interpreter-rack': InterpreterRack,
  'project-tree': ProjectTree,
  'constraint-line': ConstraintLine,
  'packing-list': PackingList,
  'depot-cache': DepotCache,
  'script-header': ScriptHeader,
  'strict-gate': StrictGate,
  'dist-output': DistOutput,
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
