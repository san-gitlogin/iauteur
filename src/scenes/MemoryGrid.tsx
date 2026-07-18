import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// MEMORY — computer memory is a row of numbered boxes (addresses) each holding a
// value. Cells fade in, the highlighted one (a read/write) pulses, and a pointer
// chip slides beneath it. Teaches RAM / arrays / pointers. Theme + aspect aware.
export const MemoryGrid: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.memory;
  if (!d) return <AbsoluteFill />;

  const start = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const cells = (d.cells ?? []).slice(0, 12);
  const cols = d.columns ?? (vertical ? Math.min(3, cells.length) : Math.min(4, cells.length));
  const accent = sem(d.color ?? 'blue');
  const cellW = (vertical ? 296 : 232) * scale;
  const cellH = (vertical ? 148 : 132) * scale;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30 * scale, padding: 70 * scale}}>
      {d.label ? (
        <div style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: (vertical ? 48 : 54) * scale, color: t.colors.text, letterSpacing: t.style.displayTracking, textAlign: 'center', maxWidth: '90%'}}>{d.label}</div>
      ) : null}
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellW}px)`, gap: 18 * scale, justifyContent: 'center'}}>
        {cells.map((c, i) => {
          const appear = interpolate(frame - start - i * 3, [0, 8], [0, 1], clamp);
          const hot = d.highlight === i;
          const pulse = hot ? interpolate(Math.sin((frame - start) / 8), [-1, 1], [0.35, 1]) : 0;
          const cc = c.color ? sem(c.color) : accent;
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                width: cellW,
                height: cellH,
                borderRadius: 14 * scale * t.style.cornerRadius,
                background: hot ? hexA(cc, 0.12) : t.colors.panel,
                border: `${(hot ? 2.5 : 1.5) * scale}px solid ${hot ? cc : t.colors.panelBorder}`,
                boxShadow: hot && t.style.glow > 0 ? `0 0 ${28 * pulse * t.style.glow}px ${hexA(cc, 0.5)}` : undefined,
                opacity: appear,
                transform: `translateY(${(1 - appear) * 12 * scale}px)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: `${14 * scale}px`,
              }}
            >
              {c.addr ? (
                <div style={{position: 'absolute', top: 10 * scale, left: 14 * scale, fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.muted}}>{c.addr}</div>
              ) : null}
              <div style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 46 * scale, color: hot ? cc : t.colors.text, fontVariantNumeric: 'tabular-nums'}}>{c.value}</div>
              {hot && d.pointerLabel ? (
                <div style={{position: 'absolute', bottom: -18 * scale, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <div style={{width: 0, height: 0, borderLeft: `${8 * scale}px solid transparent`, borderRight: `${8 * scale}px solid transparent`, borderBottom: `${10 * scale}px solid ${cc}`}} />
                  <div style={{marginTop: 4 * scale, fontFamily: t.fonts.mono, fontSize: 20 * scale, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.colors.onAccent, background: cc, borderRadius: 8 * scale, padding: `${5 * scale}px ${12 * scale}px`}}>{d.pointerLabel}</div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
