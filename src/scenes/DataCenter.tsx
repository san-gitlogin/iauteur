import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// DATACENTER — infrastructure topology.
//  • variant 'hall'  : a spine/core bar over a row of server racks (leaf-spine),
//    each rack a column of server slots; the highlighted rack + its uplink glow.
//  • variant 'rack'  : a single rack elevation with labelled U-bands, one active.
// Both aspects supported; racks are capped tighter on shorts so nothing crowds.
export const DataCenter: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.datacenter;
  if (!d) return <AbsoluteFill />;

  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const accent = sem(d.color ?? 'blue');
  const variant = d.variant ?? 'hall';

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0}}>
        {variant === 'rack' ? <RackElevation d={d} accent={accent} start={start} /> : <Hall d={d} accent={accent} start={start} />}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};

// ---- variant: hall (leaf-spine cluster) ----
const Hall: React.FC<{d: NonNullable<Scene['data']['datacenter']>; accent: string; start: number}> = ({d, accent, start}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();

  const racks = (d.racks ?? []).slice(0, vertical ? 4 : 6);
  const nr = racks.length;
  const highlight = d.highlight ?? -1;

  const clusterW = (vertical ? 940 : 1520) * scale;
  const colGap = (vertical ? 20 : 26) * scale;
  const colW = Math.min((vertical ? 200 : 224) * scale, (clusterW - (nr - 1) * colGap) / nr);
  const rackH = (vertical ? 660 : 480) * scale;
  const spineH = 56 * scale;
  const linkH = 44 * scale;
  const slots = 6;
  const innerPad = 12 * scale;
  const slotGap = 7 * scale;
  const slotH = (rackH - innerPad * 2 - (slots - 1) * slotGap) / slots;
  const rad = 14 * scale * t.style.cornerRadius;

  const spineReveal = interpolate(frame, [start, start + 14], [0, 1], clamp);

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {/* spine / core bar */}
      <div
        style={{
          width: clusterW,
          height: spineH,
          borderRadius: rad,
          background: hexA(accent, 0.14),
          border: `${2 * scale}px solid ${hexA(accent, 0.7)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: t.fonts.mono,
          fontWeight: 700,
          fontSize: 24 * scale,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: accent,
          opacity: spineReveal,
          transform: `scaleX(${0.9 + 0.1 * spineReveal})`,
          boxShadow: t.style.glow > 0 ? `0 0 ${22 * scale * t.style.glow}px ${hexA(accent, 0.25)}` : undefined,
        }}
      >
        {d.spineLabel ?? 'Spine · core switch'}
      </div>
      {/* racks row */}
      <div style={{display: 'flex', gap: colGap, alignItems: 'flex-start'}}>
        {racks.map((rk, i) => {
          const active = i === highlight;
          const c = rk.color ? sem(rk.color) : accent;
          const e = spring({frame: frame - (start + 10 + i * 5), fps, config: {damping: 15, mass: 0.7}});
          const linkReveal = interpolate(frame, [start + 8 + i * 4, start + 20 + i * 4], [0, 1], clamp);
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: colW}}>
              {/* uplink */}
              <div style={{width: 3 * scale, height: linkH * linkReveal, background: active ? c : t.colors.panelBorder, borderRadius: 999}} />
              {/* rack box */}
              <div
                style={{
                  width: colW,
                  height: rackH,
                  borderRadius: rad,
                  background: t.colors.panel,
                  border: `${2 * scale}px solid ${active ? c : t.colors.panelBorder}`,
                  boxShadow: active && t.style.glow > 0 ? `0 0 ${26 * scale * t.style.glow}px ${hexA(c, 0.4)}` : undefined,
                  padding: innerPad,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: slotGap,
                  opacity: interpolate(e, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(e, [0, 1], [26 * scale, 0])}px)`,
                  boxSizing: 'border-box',
                }}
              >
                {Array.from({length: slots}).map((_, s) => (
                  <div
                    key={s}
                    style={{
                      height: slotH,
                      borderRadius: 6 * scale,
                      background: active ? hexA(c, 0.85 - s * 0.06) : hexA(t.colors.panelBorder, 0.6),
                      border: `${1 * scale}px solid ${active ? hexA(c, 0.9) : t.colors.panelBorder}`,
                    }}
                  />
                ))}
              </div>
              {/* rack label */}
              <div
                style={{
                  marginTop: 14 * scale,
                  fontFamily: t.fonts.body,
                  fontWeight: 700,
                  fontSize: (vertical ? 24 : 23) * scale,
                  color: active ? t.colors.text : t.colors.muted,
                  textAlign: 'center',
                  lineHeight: 1.15,
                }}
              >
                {rk.label ?? `Rack ${i + 1}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- variant: rack (single elevation) ----
const RackElevation: React.FC<{d: NonNullable<Scene['data']['datacenter']>; accent: string; start: number}> = ({d, accent, start}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();

  const units = (d.units ?? []).slice(0, 7);
  const nu = units.length;
  const highlight = d.highlight ?? -1;
  const totalU = units.reduce((a, u) => a + (u.u ?? 1), 0) || 1;

  const frameW = (vertical ? 680 : 560) * scale;
  const availH = (vertical ? 1040 : 680) * scale;
  const gap = 10 * scale;
  const bandArea = availH - (nu - 1) * gap;
  const rad = 14 * scale * t.style.cornerRadius;

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div
        style={{
          width: frameW,
          borderRadius: rad + 6 * scale,
          background: hexA(t.colors.panelBorder, 0.16),
          border: `${2.5 * scale}px solid ${t.colors.panelBorder}`,
          padding: 14 * scale,
          display: 'flex',
          flexDirection: 'column',
          gap,
          boxSizing: 'border-box',
        }}
      >
        {units.map((u, i) => {
          const active = i === highlight;
          const c = u.color ? sem(u.color) : accent;
          const h = (bandArea * (u.u ?? 1)) / totalU;
          const e = spring({frame: frame - (start + i * 6), fps, config: {damping: 15, mass: 0.7}});
          return (
            <div
              key={i}
              style={{
                height: h,
                borderRadius: rad,
                background: hexA(c, active ? 0.22 : 0.1),
                border: `${2 * scale}px solid ${active ? c : hexA(c, 0.5)}`,
                boxShadow: active && t.style.glow > 0 ? `0 0 ${24 * scale * t.style.glow}px ${hexA(c, 0.45)}` : undefined,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `0 ${24 * scale}px`,
                opacity: interpolate(e, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(e, [0, 1], [-28 * scale, 0])}px)`,
                boxSizing: 'border-box',
              }}
            >
              <span style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: (vertical ? 30 : 28) * scale, color: active ? c : t.colors.text, whiteSpace: 'nowrap'}}>{u.label}</span>
              {u.sub ? <span style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.muted, whiteSpace: 'nowrap', marginLeft: 16 * scale}}>{u.sub}</span> : null}
            </div>
          );
        })}
      </div>
      {d.rackLabel ? (
        <div style={{marginTop: 16 * scale, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.colors.muted}}>{d.rackLabel}</div>
      ) : null}
    </div>
  );
};
