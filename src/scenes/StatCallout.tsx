import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {fitText} from '@remotion/layout-utils';
import {counterValue, fadeUp, stackIn} from '../anim';
import {entranceStyle} from '../motion';
import {AssetIcon} from '../AssetIcon';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// Auto-compact for huge numbers: 15000000000 → {display: 15, unit: 'B'}
const compact = (n: number): {target: number; unit: string} => {
  if (n >= 1e9) return {target: Math.round(n / 1e8) / 10, unit: 'B'};
  if (n >= 1e6) return {target: Math.round(n / 1e5) / 10, unit: 'M'};
  return {target: n, unit: ''};
};

export const StatCallout: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = useTheme();
  const vertical = height > width;
  const scale = vertical ? width / 1080 : width / 1920;
  const d = scene.data;
  const start = wordToFrame(d.atWord);

  const base = (vertical ? 140 : 170) * scale;
  // Leave generous side room: packs wrap the hero number in decorations (e.g. neo's
  // padded, rotated highlight bar) that extend past the raw text — a tight fit to
  // (width − 140) then overflowed BOTH frame edges on vertical for billions (A-1).
  const avail = width - (vertical ? 260 : 200) * scale;
  const rawTarget = d.value ?? 0;
  const fullText = (d.prefix ?? '') + formatNumber(rawTarget) + (d.suffix ?? '');

  const fits = (text: string, size: number): number => {
    try {
      return Math.min(
        size,
        fitText({text, withinWidth: avail, fontFamily: t.fonts.mono, fontWeight: '800'})
          .fontSize * 0.92,
      );
    } catch {
      return size;
    }
  };

  // Prefer the full number; if it would shrink below 70% of base, compact it (so a
  // long number becomes "1.5B" rather than being squeezed tiny or overflowing).
  let target = rawTarget;
  let unit = '';
  let fontSize = fits(fullText, base);
  if (fontSize < base * 0.7 && rawTarget >= 1e6) {
    const cp = compact(rawTarget);
    target = cp.target;
    unit = cp.unit;
    fontSize = fits((d.prefix ?? '') + formatNumber(cp.target) + cp.unit + (d.suffix ?? ''), base);
  }

  // decimal-safe counting (e.g. 1.5B): animate ×10, divide back
  const decimals = Number.isInteger(target) ? 0 : 1;
  const animated =
    counterValue(frame, start, Math.round(target * 10 ** decimals)) / 10 ** decimals;
  const value = decimals ? animated.toFixed(1) : formatNumber(animated);

  return (
    <AbsoluteFill
      style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26 * scale}}
    >
      <div
        style={{
          ...entranceStyle(d.anim ?? 'pop', frame, start, fps),
          fontFamily: t.fonts.mono,
          fontWeight: 800,
          fontSize,
          color: t.colors.accent2,
          letterSpacing: '-0.03em',
          textShadow: t.style.glow > 0 ? `0 0 ${80 * t.style.glow}px ${t.colors.glowSoft}` : undefined,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {d.prefix ?? ''}
        {value}
        {unit}
        {d.suffix ?? ''}
      </div>
      <div
        style={{
          ...fadeUp(frame, start + 16, fps),
          fontFamily: t.fonts.body,
          fontWeight: 600,
          fontSize: 46 * scale,
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '80%',
        }}
      >
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 22 * scale, marginTop: 20 * scale, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '86%'}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <AssetIcon asset={lg} size={(vertical ? 92 : 84) * scale} />
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
