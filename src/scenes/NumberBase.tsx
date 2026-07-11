import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// NUMBER_BASE — the same value in decimal, hex and binary, aligned in three rows.
// The binary row renders as grouped nibble bit-cells so the correspondence is
// obvious. Rows reveal top-down. Same stacked layout on both aspects.
export const NumberBase: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.numberBase;
  if (!d) return <AbsoluteFill />;

  const value = Math.max(0, Math.min(65535, Math.round(d.value ?? 0)));
  const start = wordToFrame(d.atWord ?? 1) + 8;
  const accent = sem(d.color ?? 'blue');

  const bitsNeeded = Math.max(8, Math.ceil((value.toString(2).length) / 4) * 4);
  const bin = value.toString(2).padStart(bitsNeeded, '0');
  const hex = value.toString(16).toUpperCase();
  // Fit the binary row to a width budget (like BITS) instead of a fixed cell — a
  // fixed 52px cell made the 16-bit row edge-to-edge and it overflowed the frame
  // in wider-content packs (neo) on vertical (defect G-2). Cells auto-shrink past
  // 8 bits so 16 nibble-grouped cells keep a margin in EVERY pack + aspect.
  const nCells = bin.length;
  const binGaps = 3 * 5 * (nCells / 4) + (nCells / 4 - 1) * 12; // within-group + between-group, scale units
  const cell = Math.min(vertical ? 52 : 46, ((vertical ? 720 : 1400) - binGaps) / nCells) * scale;
  const rad = 8 * scale * t.style.cornerRadius;

  const Row = ({idx, chip, chipColor, children}: {idx: number; chip: string; chipColor: string; children: React.ReactNode}) => {
    const e = spring({frame: frame - (start + idx * 8), fps, config: {damping: 15, mass: 0.7}});
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: 22 * scale, opacity: interpolate(e, [0, 1], [0, 1]), transform: `translateX(${interpolate(e, [0, 1], [-24 * scale, 0])}px)`}}>
        <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, letterSpacing: '0.1em', color: t.colors.onAccent, background: chipColor, borderRadius: 999, padding: `${6 * scale}px ${16 * scale}px`, width: 92 * scale, textAlign: 'center'}}>{chip}</span>
        <div style={{display: 'flex', alignItems: 'center', minWidth: (vertical ? 620 : 760) * scale}}>{children}</div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 28 * scale, marginTop: d.headline ? (vertical ? 150 : 74) * scale : 0}}>
        <Row idx={0} chip="DEC" chipColor={sem('blue')}>
          <span style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: (vertical ? 60 : 58) * scale, color: t.colors.text}}>{value.toLocaleString()}</span>
        </Row>
        <Row idx={1} chip="HEX" chipColor={sem('orange')}>
          <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: (vertical ? 52 : 50) * scale, color: t.colors.text}}>
            <span style={{color: t.colors.muted}}>0x</span>{hex}
          </span>
        </Row>
        <Row idx={2} chip="BIN" chipColor={sem('green')}>
          <div style={{display: 'flex', gap: 12 * scale}}>
            {Array.from({length: bin.length / 4}).map((_, grp) => (
              <div key={grp} style={{display: 'flex', gap: 5 * scale}}>
                {bin.slice(grp * 4, grp * 4 + 4).split('').map((b, k) => {
                  const on = b === '1';
                  return (
                    <div key={k} style={{width: cell, height: cell, borderRadius: rad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fonts.mono, fontWeight: 700, fontSize: cell * 0.5, background: on ? hexA(accent, 0.9) : t.colors.panel, border: `${1.5 * scale}px solid ${on ? accent : t.colors.panelBorder}`, color: on ? t.colors.onAccent : t.colors.muted}}>
                      {b}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Row>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
