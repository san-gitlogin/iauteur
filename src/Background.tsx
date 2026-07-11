import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Zone} from './types';
import {useTheme} from './themes';
import {seededRandom} from './motion';

const hexA = (hex: string, a: number): string => {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(f.slice(0, 2), 16), g = parseInt(f.slice(2, 4), 16), b = parseInt(f.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const MATRIX_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&';

// Subtle motion reads as expensive; loud motion reads as cheap.
export const Background: React.FC<{zone: Zone}> = ({zone}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = useTheme();
  const drift = Math.sin(frame / 90) * 40;
  const z = t.zones[zone];
  const blobs = t.bgStyle.aurora;
  const effect = t.bgStyle.effect;
  return (
    <AbsoluteFill style={{background: z.gradient}}>
      {t.bgStyle.topGlow ? (
        <div
          style={{
            position: 'absolute',
            top: '-28%',
            left: '15%',
            width: '70%',
            height: '55%',
            background: `radial-gradient(ellipse at center, ${t.bgStyle.topGlow}55 0%, ${t.bgStyle.topGlow}18 38%, transparent 70%)`,
            filter: 'blur(30px)',
          }}
        />
      ) : null}
      {t.bgStyle.grid ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${t.bgStyle.gridColor ?? 'rgba(255,255,255,0.028)'} 1px, transparent 1px), linear-gradient(90deg, ${t.bgStyle.gridColor ?? 'rgba(255,255,255,0.028)'} 1px, transparent 1px)`,
            backgroundSize: '72px 72px',
          }}
        />
      ) : null}
      {blobs ? (
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          filter: 'blur(120px)',
          background: z.blobs[0],
          top: -300 + drift,
          left: -200,
        }}
      />
      ) : null}
      {blobs ? (
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          filter: 'blur(120px)',
          background: z.blobs[1],
          bottom: -250 - drift,
          right: -150,
        }}
      />
      ) : null}
      {effect === 'bokeh'
        ? Array.from({length: 14}).map((_, i) => {
            const sz = 130 + seededRandom(i * 3.1) * 260;
            const dx = Math.sin(frame / (60 + i * 7) + i) * 34;
            const dy = Math.cos(frame / (70 + i * 5) + i) * 26;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${seededRandom(i * 1.3) * 100}%`,
                  top: `${seededRandom(i * 2.7) * 100}%`,
                  width: sz,
                  height: sz,
                  borderRadius: '50%',
                  background: i % 2 ? z.blobs[0] : z.blobs[1],
                  filter: 'blur(46px)',
                  transform: `translate(${dx}px, ${dy}px)`,
                  opacity: 0.55,
                }}
              />
            );
          })
        : null}
      {effect === 'starfield' ? (
        <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
          {/* golden-angle distribution + fly-through (ported from RVE starfield) */}
          {Array.from({length: 110}).map((_, i) => {
            const ang = i * 137.508 * (Math.PI / 180);
            const speed = 0.4 + (i % 10) / 10 * 0.7;
            const phase = (((frame * speed) + i * 15) % 260) / 260;
            const rad = phase * 62;
            const x = 50 + Math.cos(ang) * rad;
            const y = 50 + Math.sin(ang) * rad;
            const r = 0.3 + phase * 2.2;
            const op = (phase < 0.1 ? phase * 10 : 1 - phase) * 0.85;
            return <circle key={i} cx={`${x}%`} cy={`${y}%`} r={r} fill={t.colors.text} opacity={op} />;
          })}
        </svg>
      ) : null}
      {effect === 'gridpulse'
        ? Array.from({length: 2}).map((_, i) => {
            const ph = (((frame + i * 60) % 120) / 120);
            const size = ph * Math.max(width, height) * 1.5;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '46%',
                  width: size,
                  height: size,
                  marginLeft: -size / 2,
                  marginTop: -size / 2,
                  borderRadius: '50%',
                  border: `2px solid ${hexA(t.colors.accent, 1)}`,
                  opacity: (1 - ph) * 0.22,
                }}
              />
            );
          })
        : null}
      {effect === 'wave' ? (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', inset: 0}}>
          {[0, 1, 2].map((k) => {
            const amp = 3 - k * 0.7;
            const yBase = 74 + k * 8;
            const phase = frame / (40 - k * 6);
            let d = `M 0 ${yBase}`;
            for (let x = 0; x <= 100; x += 4) d += ` L ${x} ${yBase + Math.sin(x / 8 + phase + k) * amp}`;
            d += ' L 100 100 L 0 100 Z';
            return <path key={k} d={d} fill={k % 2 ? z.blobs[0] : z.blobs[1]} opacity={0.5 - k * 0.12} />;
          })}
        </svg>
      ) : null}
      {effect === 'ripple' ? (
        <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
          {/* dot-matrix radial ripple (ported from RVE grid-pulse) */}
          {Array.from({length: 14 * 8}).map((_, i) => {
            const col = i % 14;
            const row = Math.floor(i / 14);
            const cx = ((col + 0.5) / 14) * 100;
            const cy = ((row + 0.5) / 8) * 100;
            const dist = Math.hypot(col - 6.5, row - 3.5);
            const wave = Math.sin(frame / 12 - dist * 0.5);
            const on = (wave + 1) / 2;
            return <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r={2.4 + on * 3.2} fill={t.colors.accent} opacity={0.08 + on * 0.22} />;
          })}
        </svg>
      ) : null}
      {effect === 'gradient' ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(${(frame * 0.4) % 360}deg, ${hexA(t.colors.accent, 0.16)} 0%, ${hexA(t.colors.accent2, 0.1)} 50%, ${hexA(t.colors.accent3, 0.16)} 100%)`,
          }}
        />
      ) : null}
      {effect === 'geo' ? (
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {/* nested rotating shapes morphing square→circle (ported from RVE geometric-patterns) */}
          {Array.from({length: 8}).map((_, i) => {
            const size = 150 + i * 95;
            const rot = (frame * (0.15 + i * 0.04)) % 360;
            const rad = (i / 7) * 50;
            const col = [t.colors.accent, t.colors.accent2, t.colors.accent3][i % 3];
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: size,
                  height: size,
                  borderRadius: `${rad}%`,
                  border: `2px solid ${hexA(col, 0.14)}`,
                  transform: `rotate(${rot}deg)`,
                }}
              />
            );
          })}
        </div>
      ) : null}
      {effect === 'matrix' ? (
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden', fontFamily: t.fonts.mono}}>
          {/* falling code columns (ported from RVE matrix-rain, deterministic) */}
          {Array.from({length: 46}).map((_, i) => {
            const speed = seededRandom(i + 1) * 4 + 3;
            const y = ((seededRandom(i + 200) * height + frame * speed) % (height + 30)) - 15;
            const ch = MATRIX_CHARS[Math.floor(frame / 4 + i * 3) % MATRIX_CHARS.length];
            const op = 0.08 + seededRandom(i + 99) * 0.14;
            return (
              <div key={i} style={{position: 'absolute', left: `${(i / 46) * 100}%`, top: y, fontSize: 22, fontWeight: 700, color: t.colors.accent, opacity: op, textShadow: `0 0 8px ${hexA(t.colors.accent, op)}`}}>{ch}</div>
            );
          })}
        </div>
      ) : null}
      {effect === 'noise' ? (
        <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay'}}>
          {/* animated film grain (ported from RVE noise-grain) */}
          <filter id="ngrain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={Math.floor(frame / 2) % 16} /></filter>
          <rect width="100%" height="100%" filter="url(#ngrain)" />
        </svg>
      ) : null}
      {effect === 'ember' ? (
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
          {/* creator-overlay corner glow: warm radial blobs bleeding from two
              opposite corners, deterministic positions, slow breathing drift. */}
          {([
            {cx: -12, cy: -14, col: t.colors.accent, base: 0.20},
            {cx: 108, cy: 112, col: t.colors.accent2, base: 0.15},
          ] as const).map((b, i) => {
            const breathe = 0.85 + Math.sin(frame / (110 + i * 40) + i * 1.7) * 0.15;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${b.cx}%`,
                  top: `${b.cy}%`,
                  width: '62%',
                  height: '62%',
                  borderRadius: '50%',
                  transform: 'translate(-50%,-50%)',
                  background: `radial-gradient(circle at center, ${hexA(b.col, b.base * breathe)} 0%, ${hexA(b.col, b.base * breathe * 0.4)} 40%, transparent 72%)`,
                  filter: 'blur(60px)',
                }}
              />
            );
          })}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
