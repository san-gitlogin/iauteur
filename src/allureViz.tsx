import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SemColor} from './types';
import {hexA} from './ui';
import {useViz, liveAt, pulseAt, stackBudget} from './dsaViz';
import {AssetIcon} from './AssetIcon';
import {UnknownKind} from './unknownKind';

// ALLURE VIZ — the pictures for the Allure + AI course.
//
// ONE registered scene type (ALLURE_STAGE), many PICTURES. The budget a plan commits to is
// the number of distinct pictures, never the number of scene types (LAW 0n corollary) — so
// the kinds live here and grow with the course.
//
// Every kind obeys the same three rules:
//   · the OBJECT moves, not a label describing it (LAW 0j)
//   · every element resolves from its OWN atWord via liveAt — no fixed frame intervals
//     anywhere in this file (LAW 0i.1)
//   · sizes come from stackBudget(v), never from a constant that would bind in the
//     ordinary case and leave the picture floating in its pane (LAW 0n corollary)

export interface AllureItem {
  label?: string;
  sub?: string;
  text?: string;
  value?: number | string;
  icon?: string;
  color?: SemColor;
  atWord?: number;
}

type Props = {items: AllureItem[]; accent: SemColor; vars?: AllureItem[]};
type V = ReturnType<typeof useViz>;

/** The four Allure outcomes, and the one colour each is allowed to be, anywhere. */
const OUTCOME: Record<string, {c: SemColor; icon: string; word: string}> = {
  passed:  {c: 'green',  icon: 'lucide:check',          word: 'passed'},
  failed:  {c: 'red',    icon: 'lucide:x',              word: 'failed'},
  broken:  {c: 'orange', icon: 'lucide:unplug',         word: 'broken'},
  skipped: {c: 'purple', icon: 'lucide:circle-slash',   word: 'skipped'},
};
const ORDER = ['passed', 'failed', 'broken', 'skipped'];

// ─────────────────────────────────────────────────────────────────────────────
// 1 · OUTCOME BINS — four trays, and ten scenarios physically dropping into them.
//
// The argument of the chapter is that there are FOUR outcomes, not two. So the picture is
// four trays that fill up, and the count under each tray is derived from the chips that
// have actually landed — it cannot disagree with what is on screen.
// ─────────────────────────────────────────────────────────────────────────────
const OutcomeBins: React.FC<Props> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;

  const trayH = Math.max(84 * v.scale, budget * (v.vertical ? 0.17 : 0.30));
  const chip = Math.max(15 * v.scale, Math.min(26 * v.scale, budget * 0.035));
  const landed = (it: AllureItem) => liveAt(frame, it.atWord, 12);

  return (
    <div style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0,
                 justifyContent: 'safe center', gap: 18 * v.scale, padding: 10 * v.scale}}>
      {/* the rail the scenarios come from — one chip per scenario, dimming as it drops */}
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 7 * v.scale, justifyContent: 'center',
                   minHeight: chip * 1.7}}>
        {items.map((it, i) => {
          const gone = landed(it);
          return (
            <div key={`r${i}`} style={{
              width: chip * 1.5, height: chip * 0.62, borderRadius: 999,
              background: hexA(v.t.colors.text, 0.10 + (1 - gone) * 0.30),
              border: `${1.2 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.7)}`,
              opacity: 0.35 + (1 - gone) * 0.65,
            }} />
          );
        })}
      </div>

      <div style={{display: 'flex', gap: 12 * v.scale, alignItems: 'flex-end', justifyContent: 'center'}}>
        {ORDER.map((key) => {
          const meta = OUTCOME[key];
          const col = v.sem(meta.c);
          const mine = items.filter((it) => (it.text ?? '').toLowerCase() === key);
          // THE COUNT IS THE PICTURE'S OWN ARITHMETIC, not a number typed beside it.
          const count = mine.reduce((n, it) => n + (landed(it) > 0.6 ? 1 : 0), 0);
          const hot = mine.reduce((m, it) => Math.max(m, pulseAt(frame, it.atWord, 30)), 0);
          const any = count > 0;
          return (
            <div key={key} style={{flex: 1, maxWidth: 300 * v.scale, display: 'flex',
                                   flexDirection: 'column', alignItems: 'center', gap: 8 * v.scale}}>
              {/* the tray */}
              <div style={{
                width: '100%', height: trayH, borderRadius: v.rad(12),
                border: `${(any ? 2.2 : 1.4) * v.scale}px solid ${hexA(col, any ? 0.95 : 0.34)}`,
                background: hexA(col, any ? 0.13 : 0.04),
                boxShadow: hot > 0.05 && v.t.style.glow ? `0 0 ${26 * hot * v.scale}px ${hexA(col, 0.45 * hot)}` : 'none',
                display: 'flex', flexWrap: 'wrap', alignContent: 'flex-end', justifyContent: 'center',
                gap: 5 * v.scale, padding: 9 * v.scale, overflow: 'hidden',
              }}>
                {mine.map((it, i) => {
                  const on = landed(it);
                  if (on <= 0.02) return null;
                  return (
                    <div key={i} title={it.label} style={{
                      width: chip, height: chip, borderRadius: v.rad(5),
                      background: hexA(col, 0.55 + 0.4 * on), opacity: on,
                      transform: `translateY(${(1 - on) * -trayH * 0.55}px)`,
                    }} />
                  );
                })}
              </div>
              {/* the label and the derived count */}
              <div style={{display: 'flex', alignItems: 'center', gap: 6 * v.scale}}>
                <AssetIcon asset={meta.icon} size={16 * v.scale} tint={hexA(col, any ? 1 : 0.5)} />
                <div style={{...v.mono(15), fontWeight: 800, color: hexA(col, any ? 1 : 0.5)}}>{meta.word}</div>
              </div>
              <div style={{...v.mono(30), fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                           color: any ? col : hexA(v.t.colors.muted, 0.45)}}>{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2 · FAILED vs BROKEN — the distinction, drawn as WHETHER THE CHECK WAS REACHED.
//
// Two lanes. In both a test travels toward a check. On the left it arrives and the check
// refuses it. On the right it falls over first, so the check is never reached and stays
// grey. That single difference is the whole teaching point of the chapter.
// ─────────────────────────────────────────────────────────────────────────────
const FailVsBroken: React.FC<Props> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;
  const lane = (role: string) => items.find((i) => (i.text ?? '') === role);

  const L = lane('failed'), R = lane('broken');
  const laneH = Math.max(150 * v.scale, budget * (v.vertical ? 0.36 : 0.42));

  const Lane: React.FC<{it?: AllureItem; kind: 'failed' | 'broken'}> = ({it, kind}) => {
    const meta = OUTCOME[kind];
    const col = v.sem(meta.c);
    const on = it ? liveAt(frame, it.atWord, 14) : 0;
    const reaches = kind === 'failed';
    // the token's travel — it stops SHORT on the broken lane, which is the argument
    const travel = reaches ? on : Math.min(on, 1) * 0.46;
    return (
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 10 * v.scale}}>
        <div style={{...v.mono(14), fontWeight: 800, letterSpacing: 1.1, color: hexA(col, 0.95)}}>
          {meta.word.toUpperCase()}
        </div>
        <div style={{
          position: 'relative', height: laneH, borderRadius: v.rad(12),
          border: `${1.6 * v.scale}px solid ${hexA(col, on > 0.3 ? 0.85 : 0.3)}`,
          background: hexA(col, 0.05), overflow: 'hidden', padding: 12 * v.scale,
        }}>
          {/* the track */}
          <div style={{position: 'absolute', left: '9%', right: '9%', top: '38%', height: 3 * v.scale,
                       borderRadius: 999, background: hexA(v.t.colors.panelBorder, 0.7)}} />
          {/* the CHECK, at the far end — lit only when something actually arrives */}
          <div style={{
            position: 'absolute', right: '5%', top: '20%',
            padding: `${7 * v.scale}px ${11 * v.scale}px`, borderRadius: v.rad(8),
            border: `${1.8 * v.scale}px solid ${hexA(reaches ? col : v.t.colors.panelBorder, reaches && on > 0.7 ? 1 : 0.45)}`,
            background: reaches && on > 0.7 ? hexA(col, 0.18) : hexA(v.t.colors.panel, 0.5),
            ...v.mono(13), fontWeight: 800,
            color: reaches && on > 0.7 ? col : hexA(v.t.colors.muted, 0.6),
          }}>assert</div>
          {/* the test itself, travelling */}
          <div style={{
            position: 'absolute', top: '30%', left: `${9 + travel * 62}%`,
            width: 26 * v.scale, height: 26 * v.scale, borderRadius: v.rad(6),
            background: hexA(col, 0.9), opacity: on > 0.05 ? 1 : 0,
            transform: kind === 'broken' && on > 0.55 ? `rotate(${(on - 0.55) * 120}deg)` : 'none',
          }} />
          {/* what it ended up meaning */}
          <div style={{position: 'absolute', left: 12 * v.scale, right: 12 * v.scale, bottom: 12 * v.scale,
                       opacity: on > 0.75 ? 1 : 0}}>
            <div style={{...v.mono(13), color: hexA(col, 0.95), fontWeight: 700}}>{it?.label}</div>
            <div style={{...v.body(13), color: v.dim, marginTop: 3 * v.scale}}>{it?.sub}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{display: 'flex', flex: 1, minHeight: 0, gap: 16 * v.scale,
                 flexDirection: v.vertical ? 'column' : 'row', justifyContent: 'safe center'}}>
      <Lane it={L} kind="failed" />
      <Lane it={R} kind="broken" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3 · STEP BINDING — an English sentence and the Python that answers it, snapping together.
//
// A Gherkin line does nothing on its own; a decorator is the thing that joins it to a
// function. So the picture is a plug and a socket closing the gap, not two rows of text.
// ─────────────────────────────────────────────────────────────────────────────
const StepBinding: React.FC<Props> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;
  const rowH = Math.max(64 * v.scale, Math.min(150 * v.scale, budget / Math.max(items.length, 1) - 12 * v.scale));

  return (
    <div style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0,
                 justifyContent: 'safe center', gap: 12 * v.scale}}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord, 14);
        const col = it.color ? v.sem(it.color) : v.a;
        const gap = (1 - on) * 46 * v.scale;   // the two halves close as the beat lands
        return (
          <div key={i} style={{display: 'flex', alignItems: 'stretch', height: rowH,
                               opacity: 0.34 + on * 0.66}}>
            {/* the English half */}
            <div style={{
              flex: 1.25, display: 'flex', alignItems: 'center', padding: `0 ${14 * v.scale}px`,
              borderRadius: `${v.rad(10)}px 0 0 ${v.rad(10)}px`,
              border: `${1.6 * v.scale}px solid ${hexA(col, on > 0.5 ? 0.9 : 0.35)}`,
              borderRight: 'none', background: hexA(col, 0.07),
              transform: `translateX(${-gap}px)`,
            }}>
              <div style={{...v.body(15), color: v.t.colors.text, lineHeight: 1.35}}>{it.label}</div>
            </div>
            {/* the joint — the decorator IS the connector */}
            <div style={{
              width: 3.5 * v.scale, background: hexA(col, on > 0.6 ? 1 : 0.25),
              boxShadow: on > 0.6 && v.t.style.glow ? `0 0 ${16 * v.scale}px ${hexA(col, 0.55)}` : 'none',
            }} />
            {/* the Python half */}
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: `0 ${14 * v.scale}px`, borderRadius: `0 ${v.rad(10)}px ${v.rad(10)}px 0`,
              border: `${1.6 * v.scale}px solid ${hexA(col, on > 0.5 ? 0.9 : 0.35)}`,
              borderLeft: 'none', background: hexA(v.t.colors.panel, 0.55),
              transform: `translateX(${gap}px)`,
            }}>
              <div style={{...v.mono(13), color: hexA(col, 0.95), fontWeight: 700}}>{it.text}</div>
              <div style={{...v.mono(13), color: v.t.colors.text, marginTop: 2 * v.scale}}>{it.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4 · EVIDENCE SHELF — nine kinds of evidence, each a DIFFERENT recognisable object.
//
// "Allure takes many attachment types" is a sentence. A shelf filling with a photo, a
// table, a brace, an archive and a document is the same claim you can see. Every item
// carries its own glyph — when they all fall back to one box, that is the smell (LAW 0n).
// ─────────────────────────────────────────────────────────────────────────────
const EvidenceShelf: React.FC<Props> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;
  const per = v.vertical ? 3 : 5;
  const rows = Math.ceil(Math.max(items.length, 1) / per);
  const cellH = Math.max(74 * v.scale, Math.min(190 * v.scale, (budget - 46 * v.scale) / rows - 12 * v.scale));
  const landedCount = items.reduce((n, it) => n + (liveAt(frame, it.atWord, 12) > 0.6 ? 1 : 0), 0);

  return (
    <div style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0,
                 justifyContent: 'safe center', gap: 14 * v.scale}}>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${per}, 1fr)`, gap: 10 * v.scale}}>
        {items.map((it, i) => {
          const on = liveAt(frame, it.atWord, 12);
          const p = pulseAt(frame, it.atWord, 28);
          const col = it.color ? v.sem(it.color) : v.a;
          return (
            <div key={i} style={{
              height: cellH, borderRadius: v.rad(10),
              border: `${1.5 * v.scale}px solid ${hexA(col, on > 0.5 ? 0.9 : 0.28)}`,
              background: hexA(col, on > 0.5 ? 0.10 : 0.03),
              boxShadow: p > 0.05 && v.t.style.glow ? `0 0 ${22 * p * v.scale}px ${hexA(col, 0.4 * p)}` : 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'safe center', gap: 7 * v.scale, padding: 8 * v.scale,
              opacity: 0.3 + on * 0.7,
              transform: `translateY(${(1 - on) * 16 * v.scale}px)`,
            }}>
              <AssetIcon asset={it.icon ?? 'lucide:file'} size={Math.min(30, cellH / 3.2 / v.scale) * v.scale}
                         tint={hexA(col, on > 0.5 ? 1 : 0.5)} />
              <div style={{...v.mono(12), color: v.t.colors.text, textAlign: 'center',
                           wordBreak: 'break-all', lineHeight: 1.25}}>{it.label}</div>
              {it.sub ? <div style={{...v.mono(11), color: v.dim}}>{it.sub}</div> : null}
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 9 * v.scale, alignSelf: 'center'}}>
        <div style={{...v.mono(26), fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: v.a}}>
          {landedCount}
        </div>
        <div style={{...v.body(14), color: v.dim}}>kinds of evidence, one run</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5 · ATTACHMENT ROUTER — two honest questions, three fates.
//
// The report builder has no lookup table of twenty types. It asks "is this an image?" and
// then "is it text-shaped?", and anything left over gets a download link. So the picture is
// a token entering two gates and coming to rest in one of three bins — the shape of an
// if/elif/else, drawn.
// ─────────────────────────────────────────────────────────────────────────────
const AttachmentRouter: React.FC<Props> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;

  const BINS = [
    {id: 'image', label: 'shown as a picture', icon: 'lucide:image', c: 'green' as SemColor},
    {id: 'text', label: 'shown as readable text', icon: 'lucide:file-text', c: 'blue' as SemColor},
    {id: 'download', label: 'offered as a download', icon: 'lucide:download', c: 'orange' as SemColor},
  ];
  const binH = Math.max(70 * v.scale, budget * (v.vertical ? 0.13 : 0.2));

  return (
    <div style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0,
                 justifyContent: 'safe center', gap: 12 * v.scale}}>
      {/* the two questions, in the order the code asks them */}
      <div style={{display: 'flex', gap: 10 * v.scale, justifyContent: 'center'}}>
        {['starts with image/ ?', 'text-shaped ?'].map((q, i) => {
          const asked = items.reduce((m, it) => Math.max(m, liveAt(frame, it.atWord, 12)), 0);
          return (
            <div key={i} style={{
              padding: `${7 * v.scale}px ${13 * v.scale}px`, borderRadius: v.rad(999),
              border: `${1.5 * v.scale}px solid ${hexA(v.a, asked > 0.3 ? 0.85 : 0.3)}`,
              background: hexA(v.a, 0.07), ...v.mono(13), fontWeight: 700,
              color: hexA(v.t.colors.text, asked > 0.3 ? 0.95 : 0.5),
            }}>{q}</div>
          );
        })}
      </div>

      {/* the three fates, each holding whatever landed in it */}
      <div style={{display: 'flex', gap: 10 * v.scale, flexDirection: v.vertical ? 'column' : 'row'}}>
        {BINS.map((b) => {
          const col = v.sem(b.c);
          const mine = items.filter((it) => (it.text ?? '') === b.id);
          const anyOn = mine.reduce((m, it) => Math.max(m, liveAt(frame, it.atWord, 12)), 0);
          return (
            <div key={b.id} style={{
              flex: 1, minHeight: binH, borderRadius: v.rad(10),
              border: `${(anyOn > 0.4 ? 2 : 1.4) * v.scale}px solid ${hexA(col, anyOn > 0.4 ? 0.9 : 0.3)}`,
              background: hexA(col, anyOn > 0.4 ? 0.11 : 0.03),
              padding: 10 * v.scale, display: 'flex', flexDirection: 'column', gap: 7 * v.scale,
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: 7 * v.scale}}>
                <AssetIcon asset={b.icon} size={16 * v.scale} tint={hexA(col, anyOn > 0.4 ? 1 : 0.5)} />
                <div style={{...v.mono(12), fontWeight: 800, letterSpacing: 0.8,
                             color: hexA(col, anyOn > 0.4 ? 1 : 0.5)}}>{b.label}</div>
              </div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 5 * v.scale}}>
                {mine.map((it, i) => {
                  const on = liveAt(frame, it.atWord, 12);
                  if (on <= 0.03) return null;
                  return (
                    <div key={i} style={{
                      padding: `${4 * v.scale}px ${8 * v.scale}px`, borderRadius: v.rad(6),
                      background: hexA(col, 0.2), border: `${1 * v.scale}px solid ${hexA(col, 0.7)}`,
                      ...v.mono(12), color: v.t.colors.text, opacity: on,
                      transform: `translateY(${(1 - on) * -14 * v.scale}px)`,
                    }}>{it.label}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// 6 · TOOLBELT — four libraries as four tools on a belt, in two pouches.
//
// "Four libraries, four jobs" as a bulleted list is four sentences a viewer reads. The
// claim underneath it is that two of them RUN the tests and two of them MAKE the evidence,
// and a list cannot show a grouping. A belt with two pouches can: the tool swings into the
// pouch it belongs to, and the split is visible before a word of the label is read.
// ─────────────────────────────────────────────────────────────────────────────
const Toolbelt: React.FC<Props> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;

  const POUCH = [
    {id: 'run', label: 'runs the tests', icon: 'lucide:play', c: 'blue' as SemColor},
    {id: 'evidence', label: 'makes the evidence', icon: 'lucide:camera', c: 'green' as SemColor},
  ];
  const rowH = Math.max(96 * v.scale, (budget - 40 * v.scale) / 2 - 14 * v.scale);

  return (
    <div style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0,
                 gap: 16 * v.scale}}>
      {POUCH.map((pouch) => {
        const mine = items.filter((it) => (it.text ?? 'run') === pouch.id);
        const col = v.sem(pouch.c);
        const anyOn = mine.some((it) => liveAt(frame, it.atWord, 12) > 0.5);
        return (
          <div key={pouch.id} style={{
            display: 'flex', alignItems: 'stretch', gap: 14 * v.scale, flex: 1, minHeight: rowH,
            borderRadius: v.rad(12), padding: 14 * v.scale,
            border: `${1.5 * v.scale}px solid ${hexA(col, anyOn ? 0.8 : 0.22)}`,
            background: hexA(col, anyOn ? 0.08 : 0.02),
          }}>
            {/* the pouch itself — named once, on the left, so the group reads before the tools */}
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                         justifyContent: 'safe center', gap: 6 * v.scale,
                         width: 168 * v.scale, flexShrink: 0}}>
              <AssetIcon asset={pouch.icon} size={34 * v.scale} tint={hexA(col, anyOn ? 1 : 0.45)} />
              <div style={{...v.body(17), color: anyOn ? v.t.colors.text : v.dim, textAlign: 'center'}}>
                {pouch.label}
              </div>
            </div>
            <div style={{display: 'flex', flex: 1, gap: 10 * v.scale, minWidth: 0}}>
              {mine.map((it, i) => {
                const on = liveAt(frame, it.atWord, 14);
                const pl = pulseAt(frame, it.atWord, 30);
                const tc = it.color ? v.sem(it.color) : col;
                return (
                  <div key={i} style={{
                    flex: 1, minWidth: 0, borderRadius: v.rad(10), padding: 9 * v.scale,
                    border: `${1.5 * v.scale}px solid ${hexA(tc, on > 0.5 ? 0.95 : 0.25)}`,
                    background: hexA(tc, on > 0.5 ? 0.13 : 0.03),
                    boxShadow: pl > 0.05 && v.t.style.glow ? `0 0 ${20 * pl * v.scale}px ${hexA(tc, 0.4 * pl)}` : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'safe center', gap: 5 * v.scale,
                    // the tool SWINGS in and settles — the object moves, not a label about it
                    transform: `translateY(${(1 - on) * -22 * v.scale}px) rotate(${(1 - on) * -9}deg)`,
                    transformOrigin: 'top center', opacity: 0.28 + on * 0.72,
                  }}>
                    <AssetIcon asset={it.icon ?? 'lucide:wrench'} size={30 * v.scale}
                               tint={hexA(tc, on > 0.5 ? 1 : 0.5)} />
                    <div style={{...v.mono(19), color: v.t.colors.text, textAlign: 'center',
                                 wordBreak: 'break-word'}}>{it.label}</div>
                    {it.sub ? <div style={{...v.body(14), color: v.dim, textAlign: 'center'}}>{it.sub}</div> : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7 · IMPORT SHELF — seven imports, sorted into the three crates they come from.
//
// The teaching point is not the seven names; it is that four ship with Python, two were
// installed, and one is a different KIND of thing (decorators, not functions). Three crates
// with the imports dropping into them says that without a sentence.
// ─────────────────────────────────────────────────────────────────────────────
const ImportShelf: React.FC<Props> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;
  const crates = items.length;
  const crateH = Math.max(88 * v.scale, (budget - 30 * v.scale) / Math.max(crates, 1) - 12 * v.scale);

  return (
    <div style={{display: 'flex', flexDirection: v.vertical ? 'column' : 'row', flex: 1, minHeight: 0,
                 justifyContent: 'safe center', alignItems: 'stretch', gap: 12 * v.scale}}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord, 14);
        const pl = pulseAt(frame, it.atWord, 30);
        const col = it.color ? v.sem(it.color) : v.a;
        const names = (it.label ?? '').split(',').map((x) => x.trim()).filter(Boolean);
        return (
          <div key={i} style={{
            flex: 1, minHeight: v.vertical ? crateH : undefined, minWidth: 0,
            borderRadius: v.rad(12), padding: 16 * v.scale,
            border: `${1.5 * v.scale}px solid ${hexA(col, on > 0.5 ? 0.9 : 0.24)}`,
            background: hexA(col, on > 0.5 ? 0.09 : 0.025),
            boxShadow: pl > 0.05 && v.t.style.glow ? `0 0 ${22 * pl * v.scale}px ${hexA(col, 0.38 * pl)}` : 'none',
            display: 'flex', flexDirection: 'column', gap: 8 * v.scale,
            justifyContent: 'safe center', opacity: 0.32 + on * 0.68,
          }}>
            <div style={{...v.body(16), color: v.dim, textAlign: 'center'}}>{it.sub}</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 8 * v.scale, justifyContent: 'center'}}>
              {names.map((nm, j) => (
                <div key={j} style={{
                  ...v.mono(17), color: v.t.colors.text,
                  padding: `${6 * v.scale}px ${12 * v.scale}px`, borderRadius: 999,
                  border: `${1 * v.scale}px solid ${hexA(col, 0.55)}`,
                  background: hexA(col, 0.10),
                  // each name settles into the crate rather than appearing on it
                  transform: `translateY(${(1 - on) * (10 + j * 3) * v.scale}px)`,
                }}>{nm}</div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 8 · COMMAND ANATOMY — one command line, cut into the parts it is made of.
//
// A long command is the single most common place a beginner stops following, because it
// arrives as one undifferentiated string. Drawn as segments of the real line with a bracket
// under each, the sentence "these four parts do four things" becomes the picture itself.
// ─────────────────────────────────────────────────────────────────────────────
const CommandAnatomy: React.FC<Props> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;
  const barH = Math.max(56 * v.scale, Math.min(110 * v.scale, budget * 0.22));

  // ONE COLUMN PER PART, so the bracket is physically under the segment it names.
  // A separate row of evenly divided brackets drifts away from segments of unequal
  // width — the first draft did exactly that, and the "-o" label sat under the wrong flag.
  return (
    <div style={{display: 'flex', flex: 1, minHeight: 0, alignItems: 'stretch',
                 justifyContent: 'center', gap: 8 * v.scale, padding: 10 * v.scale}}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord, 14);
        const pl = pulseAt(frame, it.atWord, 30);
        const col = it.color ? v.sem(it.color) : v.a;
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                               justifyContent: 'safe center', gap: 12 * v.scale, minWidth: 0}}>
            {/* the segment of the real command */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: barH, padding: `${10 * v.scale}px ${14 * v.scale}px`,
              borderRadius: v.rad(9),
              border: `${1.5 * v.scale}px solid ${hexA(col, on > 0.5 ? 0.95 : 0.2)}`,
              background: hexA(col, on > 0.5 ? 0.16 : 0.03),
              boxShadow: pl > 0.05 && v.t.style.glow ? `0 0 ${22 * pl * v.scale}px ${hexA(col, 0.4 * pl)}` : 'none',
              ...v.mono(20), color: on > 0.5 ? v.t.colors.text : v.dim,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
            }}>{it.label}</div>
            {/* the bracket, growing under it as the voice explains this part */}
            <div style={{width: '78%', height: 2.5 * v.scale, background: hexA(col, 0.25 + on * 0.75),
                         transformOrigin: 'center', transform: `scaleX(${0.1 + on * 0.9})`}} />
            <div style={{...v.body(16), color: on > 0.5 ? v.t.colors.text : v.dim,
                         textAlign: 'center', opacity: 0.3 + on * 0.7,
                         transform: `translateY(${(1 - on) * 12 * v.scale}px)`}}>{it.sub}</div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 9 · RULE FIX — a stylesheet rule, and the specific ugly thing it prevents.
//
// "Three rules, three problems" is a list until you can SEE the problem. Each card holds
// the broken shape on the left, the rule in the middle, and the fixed shape on the right,
// so the rule reads as a repair rather than as a line of CSS.
// ─────────────────────────────────────────────────────────────────────────────
const RuleFix: React.FC<Props> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;
  const rowH = Math.max(76 * v.scale, (budget - 24 * v.scale) / Math.max(items.length, 1) - 12 * v.scale);

  return (
    <div style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0,
                 gap: 14 * v.scale}}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord, 16);
        const pl = pulseAt(frame, it.atWord, 30);
        const col = it.color ? v.sem(it.color) : v.a;
        const bad = v.sem('red');
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 18 * v.scale, flex: 1, minHeight: rowH,
            borderRadius: v.rad(11), padding: 16 * v.scale,
            border: `${1.5 * v.scale}px solid ${hexA(col, on > 0.5 ? 0.85 : 0.2)}`,
            background: hexA(col, on > 0.5 ? 0.08 : 0.02),
            boxShadow: pl > 0.05 && v.t.style.glow ? `0 0 ${20 * pl * v.scale}px ${hexA(col, 0.35 * pl)}` : 'none',
            opacity: 0.32 + on * 0.68,
          }}>
            {/* the problem, drawn as a shape that overflows its box until the rule lands */}
            <div style={{width: 190 * v.scale, height: rowH * 0.5, flexShrink: 0, position: 'relative',
                         borderRadius: v.rad(7), overflow: 'hidden',
                         border: `${1 * v.scale}px dashed ${hexA(bad, 0.5)}`}}>
              <div style={{position: 'absolute', left: 5 * v.scale, top: 5 * v.scale,
                           height: rowH * 0.26,
                           width: `${(1 - on) * 210 + 60}%`,
                           borderRadius: v.rad(4),
                           background: hexA(on > 0.5 ? col : bad, 0.45)}} />
            </div>
            <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 * v.scale}}>
              <div style={{...v.mono(21), color: v.t.colors.text}}>{it.label}</div>
              <div style={{...v.body(16), color: v.dim}}>{it.sub}</div>
            </div>
            <AssetIcon asset={on > 0.5 ? 'lucide:check' : 'lucide:alert-triangle'}
                       size={30 * v.scale} tint={hexA(on > 0.5 ? col : bad, 0.9)} />
          </div>
        );
      })}
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// 10 · FILES MERGE — twenty-two loose files sliding into one.
//
// "Why would anyone squash a folder into a single file?" is answered by watching it happen,
// not by hearing the reason. Each tile travels from its own place in the grid to the middle
// and disappears into one document; the count under the tray is derived from the tiles that
// have actually arrived, so the picture cannot claim a number the animation has not reached.
// ─────────────────────────────────────────────────────────────────────────────
const FilesMerge: React.FC<Props> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;
  const tile = Math.max(16 * v.scale, Math.min(34 * v.scale, budget * 0.055));
  const per = v.vertical ? 6 : 11;
  const arrived = items.reduce((n, it) => n + (liveAt(frame, it.atWord, 14) > 0.85 ? 1 : 0), 0);

  return (
    <div style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0,
                 justifyContent: 'safe center', gap: 20 * v.scale}}>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${per}, 1fr)`,
                   gap: 8 * v.scale, justifyItems: 'center'}}>
        {items.map((it, i) => {
          const on = liveAt(frame, it.atWord, 14);
          const col = it.color ? v.sem(it.color) : v.a;
          // the tile's own column decides which way it travels, so they converge
          const dx = ((i % per) - (per - 1) / 2) * -tile * 2.2 * on;
          const dy = 46 * v.scale * on;
          return (
            <div key={i} style={{
              width: tile, height: tile * 1.25, borderRadius: v.rad(4),
              border: `${1.2 * v.scale}px solid ${hexA(col, 0.75 - on * 0.6)}`,
              background: hexA(col, 0.12 - on * 0.1),
              transform: `translate(${dx}px, ${dy}px) scale(${1 - on * 0.65})`,
              opacity: 1 - on * 0.92,
            }} />
          );
        })}
      </div>
      {/* the one file everything lands in */}
      <div style={{alignSelf: 'center', display: 'flex', flexDirection: 'column',
                   alignItems: 'center', gap: 8 * v.scale,
                   padding: `${14 * v.scale}px ${26 * v.scale}px`, borderRadius: v.rad(12),
                   border: `${2 * v.scale}px solid ${hexA(v.a, 0.35 + (arrived / Math.max(items.length, 1)) * 0.6)}`,
                   background: hexA(v.a, 0.06)}}>
        <AssetIcon asset="lucide:file-code" size={40 * v.scale} tint={hexA(v.a, 0.95)} />
        <div style={{...v.mono(18), color: v.t.colors.text}}>bundle.html</div>
        <div style={{...v.body(14), color: v.dim, fontVariantNumeric: 'tabular-nums'}}>
          {arrived} of {items.length} files inside
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 11 · SIZE BAR — one quantity, measured three times, drawn to scale.
//
// The chapter's headline number is a shape, not a sentence: the JSON shrinks under gzip and
// then GROWS again under base64. A bar whose width is the real ratio makes the surprise
// land — most people expect base64 to shrink it too. Widths come from the values, so a
// mistyped number is visible rather than merely wrong.
// ─────────────────────────────────────────────────────────────────────────────
const SizeBar: React.FC<Props> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;
  const nums = items.map((it) => Number(it.value ?? 0));
  const max = Math.max(...nums, 1);
  const rowH = Math.max(52 * v.scale, Math.min(120 * v.scale,
                        (budget - 24 * v.scale) / Math.max(items.length, 1) - 14 * v.scale));

  return (
    <div style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0,
                 justifyContent: 'safe center', gap: 14 * v.scale, padding: 6 * v.scale}}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord, 18);
        const pl = pulseAt(frame, it.atWord, 30);
        const col = it.color ? v.sem(it.color) : v.a;
        const frac = nums[i] / max;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14 * v.scale,
                               minHeight: rowH}}>
            <div style={{width: 170 * v.scale, flexShrink: 0, textAlign: 'right',
                         ...v.body(15), color: on > 0.4 ? v.t.colors.text : v.dim}}>
              {it.label}
            </div>
            <div style={{flex: 1, minWidth: 0, height: rowH * 0.58, borderRadius: v.rad(7),
                         background: hexA(col, 0.06), position: 'relative', overflow: 'hidden'}}>
              <div style={{position: 'absolute', inset: 0, width: `${frac * 100 * on}%`,
                           borderRadius: v.rad(7), background: hexA(col, 0.42),
                           borderRight: `${2.5 * v.scale}px solid ${hexA(col, 0.95)}`,
                           boxShadow: pl > 0.05 && v.t.style.glow
                             ? `0 0 ${24 * pl * v.scale}px ${hexA(col, 0.45 * pl)}` : 'none'}} />
            </div>
            <div style={{width: 190 * v.scale, flexShrink: 0, ...v.mono(19),
                         color: on > 0.4 ? v.t.colors.text : v.dim,
                         fontVariantNumeric: 'tabular-nums', opacity: 0.25 + on * 0.75}}>
              {nums[i].toLocaleString('en-US')}
            </div>
            {it.sub ? (
              <div style={{width: 130 * v.scale, flexShrink: 0, ...v.body(13), color: v.dim,
                           opacity: on}}>{it.sub}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 12 · NESTED BOXES — a shape decided before the code that fills it.
//
// TestCase holds Steps, a Step holds Attachments. The decoder is boring to write precisely
// because this was settled first, and it is the shape every later chapter stores in SQLite
// and serves over HTTP. Drawn as boxes inside boxes, each arriving on its own word.
// ─────────────────────────────────────────────────────────────────────────────
const NestedBoxes: React.FC<Props> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;
  const pad = Math.max(14 * v.scale, budget * 0.035);

  const draw = (i: number): React.ReactNode => {
    if (i >= items.length) return null;
    const it = items[i];
    const on = liveAt(frame, it.atWord, 16);
    const col = it.color ? v.sem(it.color) : v.a;
    return (
      <div style={{
        flex: 1, minHeight: 0, borderRadius: v.rad(12), padding: pad,
        border: `${2 * v.scale}px solid ${hexA(col, on > 0.4 ? 0.9 : 0.18)}`,
        background: hexA(col, on > 0.4 ? 0.07 : 0.02),
        display: 'flex', flexDirection: 'column', gap: 8 * v.scale,
        opacity: 0.25 + on * 0.75,
        transform: `scale(${0.96 + on * 0.04})`,
      }}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 10 * v.scale}}>
          <div style={{...v.mono(20), color: v.t.colors.text}}>{it.label}</div>
          {it.sub ? <div style={{...v.body(14), color: v.dim}}>{it.sub}</div> : null}
        </div>
        {draw(i + 1)}
      </div>
    );
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0,
                 padding: 4 * v.scale}}>
      {draw(0)}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 13 · COMPRESSION RATIO — what gzip does to each kind of thing.
//
// "gzip shrinks repetitive text and does nothing for already-compressed bytes" is a claim
// until you see a zip bar sitting at 99% next to JSON at 19%. Each row is a measured pair,
// and the remaining-size bar is drawn from the ratio rather than from a hand-set width.
// ─────────────────────────────────────────────────────────────────────────────
const CompressionRatio: React.FC<Props> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const budget = stackBudget(v) * v.scale;
  const rowH = Math.max(50 * v.scale, (budget - 20 * v.scale) / Math.max(items.length, 1) - 12 * v.scale);

  return (
    <div style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0,
                 justifyContent: 'safe center', gap: 12 * v.scale}}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord, 16);
        const pct = Math.max(0, Math.min(100, Number(it.value ?? 100)));
        // green when gzip earned its keep, red when it found nothing to do
        const col = it.color ? v.sem(it.color) : (pct <= 40 ? v.sem('green') : pct >= 85 ? v.sem('red') : v.sem('orange'));
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14 * v.scale,
                               minHeight: rowH}}>
            <div style={{width: 150 * v.scale, flexShrink: 0, ...v.mono(17),
                         color: on > 0.4 ? v.t.colors.text : v.dim}}>{it.label}</div>
            <div style={{flex: 1, minWidth: 0, height: rowH * 0.5, borderRadius: v.rad(6),
                         background: hexA(col, 0.07), position: 'relative', overflow: 'hidden',
                         border: `${1 * v.scale}px solid ${hexA(col, 0.25)}`}}>
              <div style={{position: 'absolute', inset: 0, width: `${pct * on}%`,
                           background: hexA(col, 0.45),
                           borderRight: `${2.5 * v.scale}px solid ${hexA(col, 0.95)}`}} />
            </div>
            <div style={{width: 90 * v.scale, flexShrink: 0, ...v.mono(19), color: hexA(col, 0.95),
                         fontVariantNumeric: 'tabular-nums', opacity: 0.25 + on * 0.75}}>
              {pct}%
            </div>
            {it.sub ? (
              <div style={{width: 200 * v.scale, flexShrink: 0, ...v.body(13.5), color: v.dim,
                           opacity: on}}>{it.sub}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// An unregistered kind must be LOUD (LAW 0n corollary) — never a plausible substitute.
// ─────────────────────────────────────────────────────────────────────────────
const KINDS: Record<string, React.FC<Props>> = {
  'outcome-bins': OutcomeBins,
  'fail-vs-broken': FailVsBroken,
  'step-binding': StepBinding,
  'evidence-shelf': EvidenceShelf,
  'attachment-router': AttachmentRouter,
  'toolbelt': Toolbelt,
  'import-shelf': ImportShelf,
  'command-anatomy': CommandAnatomy,
  'rule-fix': RuleFix,
  'files-merge': FilesMerge,
  'size-bar': SizeBar,
  'nested-boxes': NestedBoxes,
  'compression-ratio': CompressionRatio,
};

export const AllureViz: React.FC<Props & {kind: string}> = ({kind, ...rest}) => {
  const Picture = KINDS[kind];
  if (!Picture) return <UnknownKind kind={kind} registry="AllureViz" />;
  return <Picture {...rest} />;
};
