import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {useTheme, wordToFrame} from './themes';
import {SemColor} from './types';
import {useScale, useSem, hexA} from './ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// STAGES — the animated right-hand pictures that Linux command components draw.
//
// EVERY renderer here takes its timing from an item's own `atWord` via
// `wordToFrame`. There is deliberately NO fixed interval in this file: a fixed
// interval is exactly what desynced the first six components from the voice
// (owner, 2026-08-17). If an item has no anchor it simply shows from the start
// rather than inventing a cadence that would drift.

/** 0→1 for an item, from its own anchored word. 1 (fully shown) when unanchored. */
export const useLive = (atWord?: number, ramp = 9) => {
  const frame = useCurrentFrame();
  if (atWord == null) return 1;
  const s = wordToFrame(atWord);
  return interpolate(frame, [s, s + ramp], [0, 1], clamp);
};

export interface StageItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  value?: number;
  color?: SemColor;
  atWord?: number;
}

const useBits = () => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  return {t, sem, scale, vertical, rad: (n: number) => n * scale * t.style.cornerRadius};
};

// ── ROWS: a list where each row lands on its own word. The workhorse picture.
export const StageRows: React.FC<{items: StageItem[]; accent: SemColor; mono?: boolean}> = ({items, accent, mono}) => {
  const {t, sem, scale, vertical, rad} = useBits();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10 * scale}}>
      {items.map((it, i) => (
        <Row key={i} it={it} accent={accent} mono={mono} t={t} sem={sem} scale={scale} vertical={vertical} rad={rad} />
      ))}
    </div>
  );
};

const Row: React.FC<any> = ({it, accent, mono, t, sem, scale, vertical, rad}) => {
  const live = useLive(it.atWord);
  const c = it.color ? sem(it.color) : sem(accent);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 12 * scale,
        padding: `${9 * scale}px ${12 * scale}px`,
        borderRadius: rad(9),
        background: hexA(t.colors.panel, 0.35 + 0.3 * live),
        border: `${1.5 * scale}px solid ${live > 0.5 ? hexA(c, 0.65) : hexA(t.colors.panelBorder, 0.6)}`,
        opacity: 0.28 + 0.72 * live,
        transform: `translateX(${(1 - live) * 10 * scale}px)`,
      }}
    >
      <span
        style={{
          fontFamily: mono ? t.fonts.mono : t.fonts.body,
          fontSize: (vertical ? 25 : 24) * scale,
          color: live > 0.5 ? t.colors.text : t.colors.muted,
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        {it.label ?? ''}
      </span>
      {it.sub ? (
        <span style={{fontFamily: t.fonts.body, fontSize: (vertical ? 20 : 19) * scale, color: hexA(t.colors.muted, 0.95)}}>
          {it.sub}
        </span>
      ) : null}
      {it.text ? (
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: t.fonts.mono,
            fontSize: (vertical ? 21 : 20) * scale,
            color: c,
            whiteSpace: 'nowrap',
            fontWeight: 700,
          }}
        >
          {it.text}
        </span>
      ) : null}
    </div>
  );
};

// ── TREE: a hierarchy where `value` is depth and one node can be the target.
export const StageTree: React.FC<{items: StageItem[]; accent: SemColor}> = ({items, accent}) => {
  const {t, sem, scale, vertical, rad} = useBits();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 6 * scale}}>
      {items.map((it, i) => (
        <TreeNode key={i} it={it} accent={accent} t={t} sem={sem} scale={scale} vertical={vertical} rad={rad} />
      ))}
    </div>
  );
};

const TreeNode: React.FC<any> = ({it, accent, t, sem, scale, vertical, rad}) => {
  const live = useLive(it.atWord);
  const depth = Math.max(0, Math.min(5, it.value ?? 0));
  const c = it.color ? sem(it.color) : sem(accent);
  const hot = live > 0.5 && !!it.color;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10 * scale,
        paddingLeft: depth * 26 * scale,
        opacity: 0.3 + 0.7 * live,
      }}
    >
      {depth > 0 ? (
        <span style={{color: hexA(t.colors.muted, 0.5), fontFamily: t.fonts.mono, fontSize: 20 * scale}}>└─</span>
      ) : null}
      <span
        style={{
          fontFamily: t.fonts.mono,
          fontSize: (vertical ? 25 : 24) * scale,
          color: hot ? c : t.colors.text,
          fontWeight: hot ? 700 : 500,
          background: hot ? hexA(c, 0.16) : 'transparent',
          border: `${1.5 * scale}px solid ${hot ? hexA(c, 0.6) : 'transparent'}`,
          borderRadius: rad(7),
          padding: `${3 * scale}px ${8 * scale}px`,
          whiteSpace: 'nowrap',
        }}
      >
        {it.label ?? ''}
      </span>
      {it.sub ? (
        <span style={{fontFamily: t.fonts.body, fontSize: 19 * scale, color: hexA(t.colors.muted, 0.9)}}>{it.sub}</span>
      ) : null}
    </div>
  );
};

// ── METERS: gauges/bars where `value` is 0-100 and each fills on its word.
export const StageMeters: React.FC<{items: StageItem[]; accent: SemColor}> = ({items, accent}) => {
  const {scale} = useBits();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 15 * scale}}>
      {items.map((it, i) => (
        <Meter key={i} it={it} accent={accent} />
      ))}
    </div>
  );
};

const Meter: React.FC<any> = ({it, accent}) => {
  const {t, sem, scale, vertical, rad} = useBits();
  const live = useLive(it.atWord, 14);
  const c = it.color ? sem(it.color) : sem(accent);
  const pct = Math.max(0, Math.min(100, it.value ?? 0));
  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 * scale}}>
        <span style={{fontFamily: t.fonts.body, fontSize: (vertical ? 22 : 21) * scale, color: t.colors.text}}>
          {it.label ?? ''}
        </span>
        <span style={{fontFamily: t.fonts.mono, fontSize: (vertical ? 22 : 21) * scale, color: c, fontWeight: 700}}>
          {it.text ?? `${Math.round(pct * live)}%`}
        </span>
      </div>
      <div style={{height: 14 * scale, borderRadius: 999, background: hexA(t.colors.panelBorder, 0.6), overflow: 'hidden'}}>
        <div style={{width: `${pct * live}%`, height: '100%', background: c, borderRadius: 999}} />
      </div>
      {it.sub ? (
        <div style={{marginTop: 4 * scale, fontFamily: t.fonts.body, fontSize: 18 * scale, color: hexA(t.colors.muted, 0.9)}}>
          {it.sub}
        </div>
      ) : null}
    </div>
  );
};

// ── FLOW: stages a token travels through; each stage lights on its word.
export const StageFlow: React.FC<{items: StageItem[]; accent: SemColor}> = ({items, accent}) => {
  const {t, sem, scale, vertical, rad} = useBits();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8 * scale}}>
      {items.map((it, i) => {
        return <FlowStage key={i} it={it} accent={accent} last={i === items.length - 1} />;
      })}
    </div>
  );
};

const FlowStage: React.FC<any> = ({it, accent, last}) => {
  const {t, sem, scale, vertical, rad} = useBits();
  const live = useLive(it.atWord);
  const c = it.color ? sem(it.color) : sem(accent);
  return (
    <>
      <div
        style={{
          padding: `${10 * scale}px ${14 * scale}px`,
          borderRadius: rad(9),
          border: `${2 * scale}px solid ${live > 0.5 ? hexA(c, 0.75) : hexA(t.colors.panelBorder, 0.6)}`,
          background: hexA(c, 0.1 * live),
          opacity: 0.3 + 0.7 * live,
        }}
      >
        <div style={{fontFamily: t.fonts.mono, fontSize: (vertical ? 24 : 23) * scale, color: live > 0.5 ? c : t.colors.muted, fontWeight: 700}}>
          {it.label ?? ''}
        </div>
        {it.sub ? (
          <div style={{fontFamily: t.fonts.body, fontSize: 19 * scale, color: hexA(t.colors.muted, 0.95), marginTop: 2 * scale}}>
            {it.sub}
          </div>
        ) : null}
      </div>
      {!last ? (
        <div style={{textAlign: 'center', color: hexA(t.colors.muted, 0.55), fontSize: 18 * scale, lineHeight: 1}}>▼</div>
      ) : null}
    </>
  );
};

// ── PERMS: owner/group/other × rwx, the octal digit resolving underneath.
export const StagePerms: React.FC<{perms: string; accent: SemColor; atWord?: number}> = ({perms, accent, atWord}) => {
  const {t, sem, scale, vertical, rad} = useBits();
  const frame = useCurrentFrame();
  const p = (perms || 'rwxr-xr-x').padEnd(9, '-').slice(0, 9);
  const base = atWord != null ? wordToFrame(atWord) : 0;
  const c = sem(accent);
  const groups = ['owner', 'group', 'other'];
  const digit = (g: number) => {
    let v = 0;
    for (let k = 0; k < 3; k++) if (p[g * 3 + k] !== '-') v += k === 0 ? 4 : k === 1 ? 2 : 1;
    return v;
  };
  return (
    <div style={{display: 'flex', gap: (vertical ? 20 : 26) * scale, justifyContent: 'center'}}>
      {groups.map((gname, g) => (
        <div key={g} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 * scale}}>
          <div style={{fontFamily: t.fonts.body, fontSize: 17 * scale, letterSpacing: 1.4, textTransform: 'uppercase', color: t.colors.muted}}>
            {gname}
          </div>
          <div style={{display: 'flex', gap: 5 * scale}}>
            {['r', 'w', 'x'].map((ch, k) => {
              const idx = g * 3 + k;
              const on = p[idx] !== '-';
              const io = interpolate(frame, [base + idx * 3, base + idx * 3 + 7], [0, 1], clamp);
              const cell = (vertical ? 56 : 52) * scale;
              return (
                <div
                  key={k}
                  style={{
                    width: cell,
                    height: cell,
                    borderRadius: rad(10),
                    background: hexA(on ? c : t.colors.muted, on ? 0.16 : 0.05),
                    border: `${2 * scale}px solid ${on ? hexA(c, 0.85) : hexA(t.colors.panelBorder, 0.7)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: io,
                  }}
                >
                  <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: cell * 0.44, color: on ? c : t.colors.muted}}>
                    {on ? ch : '–'}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{fontFamily: t.fonts.mono, fontSize: (vertical ? 34 : 32) * scale, color: c, fontWeight: 800}}>
            {digit(g)}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── HOPS: a packet travelling a chain; each hop answers on its own word.
export const StageHops: React.FC<{items: StageItem[]; accent: SemColor; token?: string}> = ({items, accent, token}) => {
  const {t, sem, scale, vertical, rad} = useBits();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 7 * scale}}>
      {token ? (
        <div style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: hexA(t.colors.muted, 0.95), marginBottom: 2 * scale}}>
          {token}
        </div>
      ) : null}
      {items.map((it, i) => (
        <Hop key={i} it={it} accent={accent} n={i + 1} />
      ))}
    </div>
  );
};

const Hop: React.FC<any> = ({it, accent, n}) => {
  const {t, sem, scale, vertical, rad} = useBits();
  const live = useLive(it.atWord);
  const c = it.color ? sem(it.color) : sem(accent);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 11 * scale, opacity: 0.3 + 0.7 * live}}>
      <span
        style={{
          width: 26 * scale,
          height: 26 * scale,
          borderRadius: 999,
          background: hexA(c, 0.2 + 0.5 * live),
          border: `${1.5 * scale}px solid ${hexA(c, 0.8)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: t.fonts.mono,
          fontSize: 15 * scale,
          color: c,
          flexShrink: 0,
        }}
      >
        {n}
      </span>
      <span style={{fontFamily: t.fonts.mono, fontSize: (vertical ? 23 : 22) * scale, color: t.colors.text, whiteSpace: 'nowrap'}}>
        {it.label ?? ''}
      </span>
      {it.text ? (
        <span style={{marginLeft: 'auto', fontFamily: t.fonts.mono, fontSize: 20 * scale, color: c, fontWeight: 700}}>
          {it.text}
        </span>
      ) : null}
    </div>
  );
};

// ── VERDICT: a single conclusion chip that lands on its word. Ends a stage.
export const StageVerdict: React.FC<{text?: string; sub?: string; color: SemColor; atWord?: number}> = ({
  text,
  sub,
  color,
  atWord,
}) => {
  const {t, sem, scale, vertical, rad} = useBits();
  const live = useLive(atWord, 11);
  if (!text) return null;
  const c = sem(color);
  return (
    <div
      style={{
        marginTop: 6 * scale,
        padding: `${11 * scale}px ${15 * scale}px`,
        borderRadius: rad(10),
        border: `${2 * scale}px solid ${hexA(c, 0.8)}`,
        background: hexA(c, 0.12),
        opacity: live,
        transform: `translateY(${(1 - live) * 8 * scale}px)`,
      }}
    >
      <div style={{fontFamily: t.fonts.display, fontSize: (vertical ? 27 : 26) * scale, color: c, fontWeight: t.style.displayWeight}}>
        {text}
      </div>
      {sub ? (
        <div style={{fontFamily: t.fonts.body, fontSize: 19 * scale, color: hexA(t.colors.muted, 0.95), marginTop: 3 * scale}}>
          {sub}
        </div>
      ) : null}
    </div>
  );
};

export type StageKind = 'rows' | 'tree' | 'meters' | 'flow' | 'perms' | 'hops';

/** Dispatch to the right picture for this command. */
export const Stage: React.FC<{
  kind: StageKind;
  items: StageItem[];
  accent: SemColor;
  perms?: string;
  token?: string;
  permsAtWord?: number;
}> = ({kind, items, accent, perms, token, permsAtWord}) => {
  if (kind === 'tree') return <StageTree items={items} accent={accent} />;
  if (kind === 'meters') return <StageMeters items={items} accent={accent} />;
  if (kind === 'flow') return <StageFlow items={items} accent={accent} />;
  if (kind === 'perms') return <StagePerms perms={perms ?? 'rwxr-xr-x'} accent={accent} atWord={permsAtWord} />;
  if (kind === 'hops') return <StageHops items={items} accent={accent} token={token} />;
  return <StageRows items={items} accent={accent} mono />;
};
