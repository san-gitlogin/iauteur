import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// ASPECT_TWIN — one source document fanning out into its deliverables. Not DEVICE_FRAME
// (a phone/laptop bezel): these are true-proportion OUTPUT frames, and the argument is
// the count and the shared origin, not the hardware.
//
// The dark/light pair is drawn with genuinely inverted surfaces so "each in dark and
// light" is shown rather than captioned.
//
// BASE ≤38f: source chip, connectors and all four frames are on screen immediately; the
// scene anchor times only the tally.
export const AspectTwin: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.aspectTwin;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'blue');
  const variants = (d.variantLabels ?? ['dark', 'light']).slice(0, 2);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const tally = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);
  const tallyIn = ease(tally, 16);

  const radius = 10 * scale * t.style.cornerRadius;
  const glow = t.style.glow;

  // true proportions: 16:9 and 9:16 from one shared area so neither looks favoured
  const wideW = (vertical ? 330 : 300) * scale;
  const wideH = wideW * (9 / 16);
  const tallH = (vertical ? 250 : 250) * scale;
  const tallW = tallH * (9 / 16);

  // a mini frame; `light` inverts the surface so the pair proves the twin, not labels it
  const miniFrame = (w: number, h: number, light: boolean, delay: number, key: string) => {
    const lit = ease(base + delay, 14);
    const surface = light ? t.colors.text : t.colors.bg;
    const ink = light ? t.colors.bg : t.colors.text;
    return (
      <div
        key={key}
        style={{
          width: w,
          height: h,
          background: surface,
          border: `2px solid ${hexA(accent, 0.3 + 0.5 * lit)}`,
          borderRadius: radius,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: h * 0.06,
          opacity: 0.45 + 0.55 * lit,
          flex: 'none',
          boxShadow: glow > 0 ? `0 0 ${22 * scale * glow}px ${hexA(accent, 0.2 * lit * glow)}` : undefined,
        }}
      >
        <div style={{width: w * 0.5, height: h * 0.07, background: hexA(ink, 0.85), borderRadius: 99}} />
        <div style={{width: w * 0.34, height: h * 0.05, background: hexA(ink, 0.45), borderRadius: 99}} />
        <div style={{display: 'flex', alignItems: 'flex-end', gap: w * 0.045, height: h * 0.2}}>
          {[0.95, 0.62, 0.4].map((bh, i) => (
            <div key={i} style={{width: w * 0.07, height: h * 0.2 * bh, background: hexA(accent, 0.85), borderRadius: 2 * scale}} />
          ))}
        </div>
      </div>
    );
  };

  // Both groups share one frame-row height so their captions land on a common
  // baseline; without it the shorter 16:9 pair floats its caption above the 9:16 one
  // and the row reads as ragged.
  const rowH = Math.max(wideH, tallH);
  const pair = (w: number, h: number, label: string, delayBase: number) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale}}>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 14 * scale, height: rowH}}>
        {miniFrame(w, h, false, delayBase, `${label}-d`)}
        {miniFrame(w, h, true, delayBase + 4, `${label}-l`)}
      </div>
      <div style={{display: 'flex', gap: 14 * scale}}>
        {variants.map((v, i) => (
          <span
            key={i}
            style={{
              fontFamily: t.fonts.mono,
              fontSize: 18 * scale,
              color: hexA(t.colors.muted, 0.9),
              width: w,
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {v}
          </span>
        ))}
      </div>
      <span
        style={{
          fontFamily: t.fonts.mono,
          fontSize: 22 * scale,
          letterSpacing: 0.03 * 22 * scale,
          color: accent,
          maxWidth: w * 2 + 20 * scale,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={(d.color as SemColor) ?? 'blue'} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: (vertical ? 150 : 100) * scale,
          paddingLeft: 50 * scale,
          paddingRight: 50 * scale,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 * scale, opacity: baseIn}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12 * scale,
              padding: `${10 * scale}px ${22 * scale}px`,
              background: t.colors.panel,
              border: `1.5px solid ${t.colors.panelBorder}`,
              borderRadius: 12 * scale * t.style.cornerRadius,
            }}
          >
            <span style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: t.colors.muted}}>{'{ }'}</span>
            <span style={{fontFamily: t.fonts.mono, fontSize: 24 * scale, color: t.colors.text, whiteSpace: 'nowrap'}}>
              {d.sourceLabel}
            </span>
          </div>

          {/* fan-out: one origin, two aspect groups */}
          <div
            style={{
              width: (vertical ? 520 : 700) * scale,
              height: 3 * scale,
              background: hexA(accent, 0.5),
              borderRadius: 3 * scale,
              transformOrigin: 'center',
              transform: `scaleX(${ease(base + 2, 14)})`,
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: vertical ? 'column' : 'row',
              alignItems: vertical ? 'center' : 'flex-end',
              justifyContent: 'center',
              gap: (vertical ? 34 : 90) * scale,
            }}
          >
            {pair(wideW, wideH, d.wideLabel ?? '16:9', 4)}
            {pair(tallW, tallH, d.tallLabel ?? '9:16', 10)}
          </div>

          {d.countLabel ? (
            <div
              style={{
                padding: `${10 * scale}px ${24 * scale}px`,
                border: `1.5px solid ${hexA(accent, 0.5)}`,
                borderRadius: 12 * scale * t.style.cornerRadius,
                fontFamily: t.fonts.mono,
                fontSize: 24 * scale,
                letterSpacing: 0.03 * 24 * scale,
                color: accent,
                opacity: tallyIn,
                transform: `translateY(${(1 - tallyIn) * 10 * scale}px)`,
                whiteSpace: 'nowrap',
              }}
            >
              {d.countLabel}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
