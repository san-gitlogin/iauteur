import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {fitText} from '@remotion/layout-utils';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {typewriter, caretVisible, charSpin, highlightAt, bounceIn, glitchText, outlineText} from '../motion';

// KINETIC_TEXT — a single line delivered as a dynamic MOMENT. One data shape,
// eight faithful text animations (ported from the RVE Text set). A breather /
// statement / punch scene so headlines stop being static. Theme + aspect aware,
// ×scale, deterministic.
type Fx = 'typewriter' | 'glitch' | 'split' | 'char-spin' | 'highlight' | 'bounce' | 'wave' | 'outline' | 'pop' | 'pulse' | 'slide';

export const KineticText: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.kinetic;
  if (!d) return <AbsoluteFill />;

  const fx: Fx = (d.fx as Fx) ?? 'char-spin';
  const text = d.text;
  const start = wordToFrame(d.atWord ?? 1);
  const accent = sem(d.color ?? 'blue');
  const avail = width - (vertical ? 120 : 220) * scale;
  const base = (vertical ? 96 : 128) * scale;

  const fit = (s: string, cap: number): number => {
    try {
      return Math.min(cap, fitText({text: s || 'M', withinWidth: avail, fontFamily: t.fonts.display, fontWeight: '800'}).fontSize * 0.94);
    } catch {
      return cap;
    }
  };

  const font = t.fonts.display;
  const wrap: React.CSSProperties = {
    fontFamily: font, fontWeight: 800, letterSpacing: t.style.displayTracking,
    color: t.colors.text, textAlign: 'center', lineHeight: 1.05, maxWidth: avail,
  };

  let body: React.ReactNode = null;

  if (fx === 'typewriter') {
    const fsz = fit(text, base * 0.82);
    const {shown} = typewriter(text, frame, start, {cps: 22, fps});
    body = (
      <div style={{...wrap, fontFamily: t.fonts.mono, fontSize: fsz}}>
        {shown}
        <span style={{color: accent, opacity: caretVisible(frame) ? 1 : 0}}>▍</span>
      </div>
    );
  } else if (fx === 'glitch') {
    const fsz = fit(text, base);
    const settle = interpolate(frame - start, [0, 26], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const off = Math.sin((frame - start) / 5) * 6 * settle * scale;
    const jy = Math.sin((frame - start) / 9) * 5 * settle * scale;
    const op = interpolate(frame - start, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'relative', opacity: op}}>
          <div style={{...wrap, fontFamily: t.fonts.mono, fontSize: fsz, position: 'absolute', inset: 0, color: sem('blue'), transform: `translate(${off}px, ${jy}px)`, mixBlendMode: 'screen'}}>{text}</div>
          <div style={{...wrap, fontFamily: t.fonts.mono, fontSize: fsz, position: 'absolute', inset: 0, color: sem('red'), transform: `translate(${-off}px, ${-jy}px)`, mixBlendMode: 'screen'}}>{text}</div>
          <div style={{...wrap, fontFamily: t.fonts.mono, fontSize: fsz, position: 'relative'}}>{text}</div>
        </div>
        {d.sub ? <Sub text={d.sub} start={start} accent={accent} /> : null}
        {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
      </AbsoluteFill>
    );
  } else if (fx === 'split') {
    const parts = text.includes('|') ? text.split('|') : (() => {
      const w = text.split(' ');
      const mid = Math.ceil(w.length / 2);
      return [w.slice(0, mid).join(' '), w.slice(mid).join(' ')];
    })();
    const fsz = fit(parts.reduce((a, b) => (a.length > b.length ? a : b), ''), base);
    const topY = spring({frame: frame - start, fps, config: {damping: 14, stiffness: 80}, from: -140, to: 0});
    const botY = spring({frame: frame - start, fps, config: {damping: 14, stiffness: 80}, from: 140, to: 0});
    const meet = interpolate(frame - start, [0, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const glow = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.3, 0.9]) * meet;
    body = (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 * scale}}>
        <div style={{...wrap, fontSize: fsz, color: 'transparent', WebkitTextStroke: `${2 * scale}px ${t.colors.text}`, transform: `translateY(${topY * scale}px)`, textShadow: `0 0 ${24 * glow * scale}px ${hexA(accent, glow)}`}}>{parts[0]}</div>
        <div style={{...wrap, fontSize: fsz, color: t.colors.text, transform: `translateY(${botY * scale}px)`, textShadow: `0 0 ${24 * glow * scale}px ${hexA(accent, glow)}`}}>{parts[1]}</div>
      </div>
    );
  } else if (fx === 'highlight') {
    const fsz = fit(text, base * 0.9);
    const words = text.split(' ');
    body = (
      <div style={{...wrap, fontSize: fsz, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${fsz * 0.28}px`}}>
        {words.map((w, i) => {
          const lit = highlightAt(frame, start, i, {step: 7, dur: 10});
          return <span key={i} style={{color: `rgba(${hexToRgb(accent)}, ${0.35 + 0.65 * lit})`, transform: `translateY(${(1 - lit) * -6 * scale}px)`, display: 'inline-block'}}>{w}</span>;
        })}
      </div>
    );
  } else if (fx === 'bounce') {
    const fsz = fit(text, base);
    body = <div style={{...wrap, fontSize: fsz, ...bounceIn(frame, start, fps, {distance: 60})}}>{highlightBrackets(text, accent)}</div>;
  } else if (fx === 'outline') {
    const fsz = fit(text, base);
    const op = interpolate(frame - start, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const s = spring({frame: frame - start, fps, config: {damping: 10, mass: 0.6}});
    body = <div style={{...wrap, fontSize: fsz, opacity: op, transform: `scale(${0.7 + 0.3 * s})`, color: accent, ...outlineText(t.colors.text, 3 * scale)}}>{text}</div>;
  } else if (fx === 'wave') {
    const fsz = fit(text, base);
    body = (
      <div style={{...wrap, fontSize: fsz}}>
        {text.split('').map((ch, i) => {
          const op = interpolate(frame - start - i * 2, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const y = Math.sin((frame - start) / 12 + i * 0.5) * 10 * scale * op;
          return <span key={i} style={{display: 'inline-block', opacity: op, transform: `translateY(${y}px)`, whiteSpace: 'pre'}}>{ch}</span>;
        })}
      </div>
    );
  } else if (fx === 'pop') {
    // per-char spring pop-in (from popping-text.tsx)
    const fsz = fit(text, base);
    body = (
      <div style={{...wrap, fontSize: fsz}}>
        {text.split('').map((ch, i) => {
          const s = spring({frame: frame - start - i * 3, fps, config: {mass: 0.4, damping: 8, stiffness: 100}});
          return <span key={i} style={{display: 'inline-block', transform: `scale(${s})`, opacity: s, whiteSpace: 'pre'}}>{ch}</span>;
        })}
      </div>
    );
  } else if (fx === 'pulse') {
    // rhythmic per-char pulse (from pulsing-text.tsx)
    const fsz = fit(text, base);
    const appear = interpolate(frame - start, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    body = (
      <div style={{...wrap, fontSize: fsz}}>
        {text.split('').map((ch, i) => {
          const ph = ((((frame - start - i * 4) % 30) + 30) % 30) / 30;
          const pulse = interpolate(ph, [0, 0.5, 1], [1, 1.18, 1], {extrapolateRight: 'clamp'});
          const op = interpolate(ph, [0, 0.5, 1], [0.55, 1, 0.55], {extrapolateRight: 'clamp'});
          return <span key={i} style={{display: 'inline-block', transform: `scale(${pulse})`, opacity: appear * op, whiteSpace: 'pre'}}>{ch}</span>;
        })}
      </div>
    );
  } else if (fx === 'slide') {
    // whole line slides in from the side with a spring (from slide-text.tsx)
    const fsz = fit(text, base);
    const sx = spring({frame: frame - start, fps, from: 220, to: 0, config: {damping: 12, mass: 0.5}});
    const op = interpolate(frame - start, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    body = <div style={{...wrap, fontSize: fsz, opacity: op, transform: `translateX(${sx * scale}px)`}}>{highlightBrackets(text, accent)}</div>;
  } else {
    // char-spin (default)
    const fsz = fit(text, base);
    body = (
      <div style={{...wrap, fontSize: fsz}}>
        {text.split('').map((ch, i) => (
          <span key={i} style={{...charSpin(frame, start, i, fps, {step: 4}), whiteSpace: 'pre'}}>{ch}</span>
        ))}
      </div>
    );
  }

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 * scale, padding: 40 * scale}}>
      {body}
      {d.sub ? <Sub text={d.sub} start={start} accent={accent} /> : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};

const Sub: React.FC<{text: string; start: number; accent: string}> = ({text, start, accent}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const {scale} = useScale();
  const op = interpolate(frame - start - 18, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const y = interpolate(frame - start - 18, [0, 14], [16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{opacity: op, transform: `translateY(${y * scale}px)`, fontFamily: t.fonts.mono, fontSize: 28 * scale, letterSpacing: 2 * scale, color: hexA(accent, 0.9), textTransform: 'uppercase'}}>{text}</div>
  );
};

// tiny helpers
const hexToRgb = (hex: string): string => {
  const m = hex.replace('#', '');
  const v = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const n = parseInt(v.slice(0, 6), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};
const highlightBrackets = (text: string, accent: string): React.ReactNode => {
  const parts = text.split(/[[\]]/);
  return parts.map((p, i) => (i % 2 === 1 ? <span key={i} style={{color: accent}}>{p}</span> : <React.Fragment key={i}>{p}</React.Fragment>));
};
