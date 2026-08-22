import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {SemColor} from '../../types';
import {hexA, useScale, useSem} from '../../ui';

/**
 * Blinking block cursor — the heartbeat of the shell.
 *
 * `fontSize` is the ALREADY-SCALED size of the text it sits beside, and every dimension
 * is derived from it. Two bugs this replaces, both visible in a shipped frame (owner,
 * 2026-08-22: *"the typing blink animation… shall adapt and be placed at right position
 * aligned with the text based on font, size etc"*):
 *
 *   · The old prop was a raw `size` that the component multiplied by `scale` AGAIN, while
 *     every caller had already scaled it. A block that is scaled twice tracks the type
 *     only by coincidence.
 *   · `verticalAlign: 'text-bottom'` aligns to the bottom of the line box — below the
 *     descender — so beside a line of capitals the cursor visibly hung under the baseline.
 *     `baseline` puts an inline-block's bottom edge ON the baseline, which is where a
 *     terminal cursor actually sits.
 *
 * The proportions are one monospace character cell: 0.55em wide, cap height tall, with a
 * cell's worth of gap in front. That holds at 28px and at 240px without a second number.
 */
export const TermCursor: React.FC<{fontSize: number; color?: SemColor}> = ({fontSize, color = 'green'}) => {
  const sem = useSem();
  const frame = useCurrentFrame();
  const on = frame % 30 < 16;
  return (
    <span
      style={{
        display: 'inline-block',
        width: fontSize * 0.55,
        height: fontSize * 0.72,
        background: sem(color),
        opacity: on ? 1 : 0,
        marginLeft: fontSize * 0.14,
        verticalAlign: 'baseline',
        boxShadow: `0 0 ${fontSize * 0.13}px ${hexA(sem(color), 0.7)}`,
      }}
    />
  );
};

// Green-glow monospace text.
export const glow = (scale: number, color: string): React.CSSProperties => ({
  textShadow: `0 0 ${6 * scale}px ${hexA(color, 0.5)}`,
});

// An ASCII shell window: title bar + 1px green-bordered body.
export const TermWindow: React.FC<{
  title: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({title, style, children}) => {
  const t = useTheme();
  const {scale} = useScale();
  return (
    <div style={{border: `${1.5 * scale}px solid ${t.colors.accent}`, background: 'rgba(0,0,0,0.55)', boxShadow: `0 0 ${20 * scale}px ${hexA(t.colors.accent, 0.15)}`, ...style}}>
      {/* title bar */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: t.colors.accent, color: t.colors.bg, padding: `${6 * scale}px ${16 * scale}px`, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, letterSpacing: '0.08em'}}>
        <span>{title}</span>
        <span style={{letterSpacing: '0.2em'}}>■ ■ ■</span>
      </div>
      <div style={{padding: `${26 * scale}px ${30 * scale}px`}}>{children}</div>
    </div>
  );
};

// Chrome: faint CRT scanlines + a top status line + bottom command hint.
export const TermChrome: React.FC = () => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const on = frame % 30 < 16;
  const m = (vertical ? 40 : 54) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(to bottom, ${hexA('#33ff00', 0.04)} 0 1px, transparent 1px ${3 * scale}px)`,
          mixBlendMode: 'screen',
          opacity: 0.5,
        }}
      />
      <div style={{position: 'absolute', top: m, left: m, fontFamily: t.fonts.mono, fontSize: 18 * scale, color: hexA(t.colors.accent, 0.6), letterSpacing: '0.1em'}}>
        you@studio:~$ ./play --topic
      </div>
      {/* BOTTOM-LEFT, not bottom-right: the channel watermark sits in the bottom-right
          corner of every frame, and the REC badge was landing on top of it (owner,
          2026-08-22). The prompt line above occupies top-left, so the diagonal reads
          as deliberate — a terminal with a status line at each end. */}
      <div style={{position: 'absolute', bottom: m, left: m, fontFamily: t.fonts.mono, fontSize: 18 * scale, color: hexA(t.colors.accent, 0.6)}}>
        [ REC{on ? ' \u25CF' : '  '} ]
      </div>
    </div>
  );
};
