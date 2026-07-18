import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {counterValue} from '../motion';
import {middleTruncate} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// BITS — the ground-zero idea: computers store everything as 0s and 1s. A row of
// bit cells sets one at a time (MSB→LSB) to spell a value; place-values sit above
// each cell and a decimal readout counts up. Deterministic, theme + aspect aware.
export const Bits: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.bits;
  if (!d) return <AbsoluteFill />;

  // PERMISSION_BITS variant — owner/group/other × rwx flip on at atWords, the
  // octal chip resolves digit-by-digit, path in mono middle-truncated.
  if (d.variant === 'permissions') {
    const perms = (d.perms ?? 'rwxr-xr--').padEnd(9, '-').slice(0, 9);
    const base = Math.min(wordToFrame(d.atWord ?? 1), 38) + 6;
    const groups = ['owner', 'group', 'other'];
    const rwx = ['r', 'w', 'x'];
    const cell = (vertical ? 96 : 90) * scale;
    const octalDigit = (g: number) => {
      let v = 0;
      for (let k = 0; k < 3; k++) if (perms[g * 3 + k] !== '-') v += k === 0 ? 4 : k === 1 ? 2 : 1;
      return v;
    };
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30 * scale, padding: 70 * scale}}>
        {d.path ? <div style={{fontFamily: t.fonts.mono, fontSize: 26 * scale, color: t.colors.muted}}>{middleTruncate(d.path, 40)}</div> : null}
        <div style={{display: 'flex', gap: (vertical ? 30 : 48) * scale}}>
          {groups.map((gname, g) => (
            <div key={g} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 * scale}}>
              <div style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.colors.muted}}>{gname}</div>
              <div style={{display: 'flex', gap: 8 * scale}}>
                {rwx.map((ch, k) => {
                  const idx = g * 3 + k;
                  const on = perms[idx] !== '-';
                  const appear = interpolate(frame - (base + idx * 4), [0, 7], [0, 1], clamp);
                  const c = on ? sem(d.color ?? 'green') : t.colors.muted;
                  return (
                    <div key={k} style={{width: cell, height: cell, borderRadius: 14 * scale * t.style.cornerRadius, background: hexA(c, on ? 0.16 : 0.06), border: `${2.5 * scale}px solid ${on ? c : hexA(t.colors.panelBorder, 0.8)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: appear, transform: `scale(${interpolate(appear, [0, 1], [0.8, 1])})`, boxShadow: on && t.style.glow > 0 ? `0 0 ${16 * scale}px ${hexA(c, 0.35)}` : undefined}}>
                      <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: cell * 0.42, color: on ? c : t.colors.muted}}>{on ? ch : '\u2013'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {/* octal chip resolving digit-by-digit */}
        <div style={{display: 'flex', alignItems: 'center', gap: 4 * scale}}>
          <span style={{fontFamily: t.fonts.mono, fontSize: 30 * scale, color: t.colors.muted, marginRight: 8 * scale}}>=</span>
          {[0, 1, 2].map((g) => {
            const done = frame >= base + (g * 3 + 3) * 4;
            return <span key={g} style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 56 * scale, color: done ? sem(d.color ?? 'green') : t.colors.muted, fontVariantNumeric: 'tabular-nums', width: 44 * scale, textAlign: 'center'}}>{done ? octalDigit(g) : '\u00B7'}</span>;
          })}
        </div>
        {d.label ? <div style={{fontFamily: t.fonts.mono, fontSize: 24 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.colors.muted}}>{d.label}</div> : null}
        {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
      </AbsoluteFill>
    );
  }

  const start = wordToFrame(d.atWord ?? 1);
  const n = Math.min(16, Math.max(4, d.bits ?? 8));
  const accent = sem(d.color ?? 'green');
  const value = ((Math.max(0, Math.floor(d.value)) % 2 ** n) + 2 ** n) % 2 ** n;
  const bitArr = Array.from({length: n}, (_, i) => (value >> (n - 1 - i)) & 1);
  const gap = 12 * scale;
  const avail = (vertical ? 960 : 1600) * scale;
  const cell = Math.min((vertical ? 104 : 96) * scale, (avail - (n - 1) * gap) / n);
  const perBit = 5;
  const decShown = counterValue(frame, start + n * perBit + 8, value);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 * scale, padding: 70 * scale}}>
      {d.label ? (
        <div style={{fontFamily: t.fonts.mono, fontSize: 26 * scale, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.colors.muted, textAlign: 'center'}}>{d.label}</div>
      ) : null}
      <div style={{display: 'flex', gap}}>
        {bitArr.map((b, i) => {
          const appear = interpolate(frame - start - i * perBit, [0, 7], [0, 1], clamp);
          const on = b === 1;
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 * scale, opacity: appear, transform: `translateY(${(1 - appear) * 12 * scale}px)`}}>
              {d.showPlaceValues !== false ? (
                <div style={{fontFamily: t.fonts.mono, fontSize: Math.min(18, cell * 0.18) * scale, color: on ? hexA(accent, 0.9) : t.colors.muted}}>{2 ** (n - 1 - i)}</div>
              ) : null}
              <div
                style={{
                  width: cell,
                  height: cell,
                  borderRadius: 12 * scale * t.style.cornerRadius,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: on ? accent : t.colors.panel,
                  border: `${2 * scale}px solid ${on ? accent : t.colors.panelBorder}`,
                  color: on ? t.colors.onAccent : t.colors.muted,
                  fontFamily: t.fonts.mono,
                  fontWeight: 800,
                  fontSize: cell * 0.5,
                  boxShadow: on && t.style.glow > 0 ? `0 0 ${18 * t.style.glow}px ${hexA(accent, 0.5)}` : undefined,
                }}
              >
                {b}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 18 * scale}}>
        <span style={{fontFamily: t.fonts.mono, fontSize: 30 * scale, color: t.colors.muted}}>=</span>
        <span style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 100 : 116) * scale, color: t.colors.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em'}}>{decShown}</span>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
