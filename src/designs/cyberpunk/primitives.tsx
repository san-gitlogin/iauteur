import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {hexA, useScale, useSem} from '../../ui';

// Chamfered (corner-cut) clip-path — the cyberpunk "tech panel" silhouette.
export const chamfer = (c: number): string =>
  `polygon(${c}px 0, calc(100% - ${c}px) 0, 100% ${c}px, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, ${c}px 100%, 0 calc(100% - ${c}px), 0 ${c}px)`;

// A neon-framed, corner-cut panel. The frame is a neon-colored outer layer
// showing through a slightly inset fill; glow via drop-shadow (respects clip-path).
export const CyberPanel: React.FC<{
  color?: SemColor | null;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({color, style, children}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const c = color ? sem(color) : t.colors.accent;
  const cut = 14 * scale;
  const border = 2 * scale;
  return (
    <div
      style={{
        clipPath: chamfer(cut),
        background: hexA(c, 0.55),
        padding: border,
        filter: `drop-shadow(0 0 ${6 * scale}px ${hexA(c, 0.5)}) drop-shadow(0 0 ${16 * scale}px ${hexA(c, 0.25)})`,
      }}
    >
      <div
        style={{
          clipPath: chamfer(cut - border),
          background: t.colors.panel,
          padding: `${26 * scale}px ${34 * scale}px`,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Headline with chromatic aberration (RGB split) + occasional glitch jitter.
// Keeps the ONE [accent] phrase rule; layout matches core Headline sizing.
export const GlitchHeadline: React.FC<{
  text: string;
  color?: SemColor;
  startFrame?: number;
  top?: number;
}> = ({text, color = 'green', startFrame = 0, top}) => {
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/); // odd indices accented

  // Deterministic pseudo-glitch: brief split bursts every ~55 frames.
  const local = frame - startFrame;
  const phase = local % 55;
  const glitching = phase < 4 && local > 6;
  const dx = (glitching ? 3 : 1) * scale;

  return (
    <div
      style={{
        ...fadeUp(frame, startFrame, fps),
        position: 'absolute',
        top: (top ?? (vertical ? 170 : 110)) * scale,
        width: '100%',
        textAlign: 'center',
        fontFamily: t.fonts.display,
        fontWeight: t.style.displayWeight,
        fontSize: (vertical ? 60 : 66) * scale,
        letterSpacing: t.style.displayTracking,
        color: t.colors.text,
        padding: `0 ${60 * scale}px`,
        lineHeight: 1.15,
        textShadow: `${dx}px 0 ${hexA('#ff0033', 0.75)}, ${-dx}px 0 ${hexA('#00d4ff', 0.75)}`,
        transform: glitching ? `translateX(${(phase - 2) * scale}px)` : undefined,
      }}
    >
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            style={{
              color: sem(color),
              textShadow: `0 0 ${10 * scale}px ${hexA(sem(color), 0.8)}`,
            }}
          >
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </div>
  );
};

// Full-frame CRT chrome: scanlines + vignette + a slow-sweeping glitch band +
// corner HUD ticks. Pure function of frame; pointer-none; sits above scenes.
export const CyberChrome: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const {scale} = useScale();
  const accent = '#00ff88';

  // Scanline band sweeps top→bottom on a long loop.
  const sweepY = interpolate(frame % 240, [0, 240], [-0.2, 1.2]) * height;
  const tick = 34 * scale;

  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      {/* scanlines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(to bottom, ${hexA(accent, 0.05)} 0px, ${hexA(accent, 0.05)} 1px, transparent 1px, transparent ${3 * scale}px)`,
          mixBlendMode: 'screen',
          opacity: 0.6,
        }}
      />
      {/* sweeping glitch band */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: '100%',
          top: sweepY,
          height: 3 * scale,
          background: hexA(accent, 0.18),
          boxShadow: `0 0 ${20 * scale}px ${hexA(accent, 0.3)}`,
        }}
      />
      {/* vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(120% 120% at 50% 50%, transparent 55%, ${hexA('#000008', 0.6)} 100%)`,
        }}
      />
      {/* corner HUD ticks */}
      {[
        {top: tick, left: tick, bt: true, bl: true},
        {top: tick, right: tick, bt: true, br: true},
        {bottom: tick, left: tick, bb: true, bl: true},
        {bottom: tick, right: tick, bb: true, br: true},
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: tick,
            height: tick,
            top: p.top,
            bottom: p.bottom,
            left: p.left,
            right: p.right,
            borderTop: p.bt ? `2px solid ${hexA(accent, 0.5)}` : undefined,
            borderBottom: p.bb ? `2px solid ${hexA(accent, 0.5)}` : undefined,
            borderLeft: p.bl ? `2px solid ${hexA(accent, 0.5)}` : undefined,
            borderRight: p.br ? `2px solid ${hexA(accent, 0.5)}` : undefined,
          }}
        />
      ))}
    </div>
  );
};
