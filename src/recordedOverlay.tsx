import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {useScale, useSem, hexA} from './ui';
import {useTheme, wordToFrame} from './themes';
import {arriveAt, travelAt, stagger} from './motion/system';
import type {SemColor} from './types';

// STEP OVERLAY — an animated component that floats OVER the recording.
//
// Owner: *"we need to work on improving overlays over the recordings where its not just that
// steps, shortcuts, you must be able to display components and animations as well over the
// overlay, while preserving to not overlap with content and cause any unreadability."*
//
// Until now the floating layer could only carry furniture: a step rail, a keycap, a caption.
// This is the layer that can EXPLAIN — a small piece of motion that says what the command on
// screen is actually doing, riding in the same measured ink-free band the caption uses, so it
// still covers nothing.
//
// THE CONSTRAINT IS WHAT MAKES IT WORK (motion guide, 10): these are deliberately small. One
// band tall, one idea, one moving thing. A full-size diagram over a screen recording is just a
// diagram that has hidden the recording — the footage is the subject, and this annotates it.
//
// FOUR KINDS, chosen because they are the four shapes a terminal beat actually needs:
//
//   swap   one word becomes another          SCAN -> SEARCH
//   chain  a token travels a pipeline        connect -> cursor -> rows
//   split  one input, two different fates    the safe call vs the glued one
//   tally  a number counts up to its answer  4 rows came back
//
// Every moment resolves from `atWord` through the motion system's named roles, so nothing
// here contains a fixed interval (LAW 0i) and nothing moves linearly.

export type StepOverlayData = {
  kind?: string;
  atWord?: number;
  from?: string;
  to?: string;
  steps?: string[];
  left?: string;
  right?: string;
  leftNote?: string;
  rightNote?: string;
  value?: string;
  label?: string;
  /** `rows` — the table itself, and what this step does to it */
  columns?: string[];
  rows?: {cells?: string[]; state?: 'kept' | 'cut' | 'new' | 'plain'; atWord?: number}[];
  color?: SemColor;
};

export const StepOverlay: React.FC<{
  data: StepOverlayData;
  /** the clip's own anchor, so an overlay with no atWord still lands with its step */
  fallbackAtWord?: number;
  maxWidth: number;
}> = ({data, fallbackAtWord, maxWidth}) => {
  const {scale} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();

  const start = wordToFrame(data.atWord ?? fallbackAtWord ?? 1);
  if (frame < start) return null;

  const accent = sem(data.color ?? 'blue');
  const radius = 10 * scale * t.style.cornerRadius;
  const inMs = arriveAt(frame, start);
  const mono = 25 * scale;

  // One shared chip so every kind looks like the same family (motion guide, 9: consistency).
  const Chip: React.FC<{
    text: string; on?: number; tone?: string; dim?: boolean; big?: boolean;
  }> = ({text, on = 1, tone = accent, dim = false, big = false}) => (
    <span style={{
      fontFamily: t.fonts.mono,
      fontSize: (big ? mono * 1.15 : mono) * 1,
      color: dim ? t.colors.muted : tone,
      background: hexA(tone, dim ? 0.05 : 0.14 * on),
      border: `${1.5 * scale}px solid ${hexA(dim ? t.colors.panelBorder : tone, dim ? 0.3 : 0.55 * on)}`,
      borderRadius: radius,
      padding: `${5 * scale}px ${13 * scale}px`,
      whiteSpace: 'nowrap',
      opacity: on,
    }}>{text}</span>
  );

  const wrap: React.CSSProperties = {
    position: 'relative', zIndex: 2,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 12 * scale,
    maxWidth,
    opacity: inMs,
  };

  // ── SWAP — one word becomes another. The old one rises and fades as the new one
  //    comes up from below, so the eye reads a REPLACEMENT rather than two labels.
  if (data.kind === 'swap') {
    const go = travelAt(frame, start + 6, 20);
    const rise = 16 * scale;
    return (
      <div style={{...wrap, position: 'relative'}}>
        <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center'}}>
          <span style={{
            transform: `translateY(${-rise * go}px)`,
            opacity: 1 - go,
            display: 'inline-block',
          }}>
            <Chip text={String(data.from ?? '')} tone={sem('orange')} />
          </span>
          <span style={{
            position: 'absolute', left: 0, top: 0,
            transform: `translateY(${rise * (1 - go)}px)`,
            opacity: go,
            display: 'inline-block',
          }}>
            <Chip text={String(data.to ?? '')} tone={sem('green')} big />
          </span>
        </div>
      </div>
    );
  }

  // ── CHAIN — a token travels a pipeline and lights each stop as it passes. This is the
  //    shape for "connect, then cursor, then rows": three named things and one journey.
  if (data.kind === 'chain') {
    const steps = (data.steps ?? []).slice(0, 4);
    const per = 14;
    return (
      <div style={wrap}>
        {steps.map((s, i) => {
          const lit = arriveAt(frame, start + 6 + i * per, 12);
          return (
            <React.Fragment key={i}>
              {i > 0 ? (
                <span style={{
                  width: 26 * scale, height: 2 * scale,
                  background: hexA(accent, 0.25 + 0.6 * lit),
                  // the connector draws toward the next stop rather than blinking on
                  transform: `scaleX(${0.2 + 0.8 * lit})`, transformOrigin: 'left center',
                }} />
              ) : null}
              <span style={{transform: `translateY(${(1 - lit) * 6 * scale}px)`, display: 'inline-block'}}>
                <Chip text={s} on={0.35 + 0.65 * lit} dim={lit < 0.15} />
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // ── SPLIT — one input, two fates. The two results DO NOT arrive together (motion guide,
  //    7): the safe one lands first, and the bad one a beat later, which is the order the
  //    narration says them in and the order that makes the contrast land.
  if (data.kind === 'split') {
    const a = arriveAt(frame, start + stagger(0, 8), 12);
    const b = arriveAt(frame, start + stagger(2, 8), 12);
    return (
      <div style={wrap}>
        <span style={{transform: `translateY(${(1 - a) * 8 * scale}px)`, display: 'inline-flex', alignItems: 'center', gap: 8 * scale}}>
          <Chip text={String(data.left ?? '')} on={a} tone={sem('green')} />
          {data.leftNote ? (
            <span style={{fontFamily: t.fonts.body, fontSize: mono * 0.8, color: t.colors.muted, opacity: a}}>
              {data.leftNote}
            </span>
          ) : null}
        </span>
        <span style={{width: 1.5 * scale, height: 30 * scale, background: hexA(t.colors.muted, 0.3)}} />
        <span style={{transform: `translateY(${(1 - b) * 8 * scale}px)`, display: 'inline-flex', alignItems: 'center', gap: 8 * scale}}>
          <Chip text={String(data.right ?? '')} on={b} tone={sem('red')} />
          {data.rightNote ? (
            <span style={{fontFamily: t.fonts.body, fontSize: mono * 0.8, color: t.colors.muted, opacity: b}}>
              {data.rightNote}
            </span>
          ) : null}
        </span>
      </div>
    );
  }

  // ── ROWS — THE TABLE, AND WHAT THIS STEP DID TO IT.
  //
  //    Owner: *"the text you put there is certainly very much AI-ish, I would like it to have
  //    meaningful animation components and data rather than just showing texts and moving the
  //    animation within them. Maybe you can display what happens in the table."*
  //
  //    He is right that a caption plus a moving chip is still a caption. This is the actual data:
  //    the rows the query touched, arriving one at a time at their own anchors, each one KEPT,
  //    CUT or NEW. A viewer can read the result of a WHERE off this without hearing a word, which
  //    is the test LAW 0d sets — would it still teach with the sound off?
  if (data.kind === 'rows') {
    const cols = (data.columns ?? []).slice(0, 3);
    const rows = (data.rows ?? []).slice(0, 5);
    const cut = sem('red'), kept = sem('green'), fresh = sem('purple');
    const toneOf = (st?: string) => st === 'cut' ? cut : st === 'new' ? fresh : st === 'kept' ? kept : accent;
    return (
      <div style={{...wrap, flexDirection: 'column', gap: 5 * scale, width: '100%'}}>
        {cols.length ? (
          <div style={{display: 'flex', width: '100%', gap: 10 * scale, padding: `0 ${11 * scale}px`}}>
            {cols.map((c, i) => (
              <span key={i} style={{
                flex: i === 0 ? 2 : 1, minWidth: 0,
                fontFamily: t.fonts.mono, fontSize: mono * 0.62,
                letterSpacing: 1.2, textTransform: 'uppercase',
                color: hexA(t.colors.muted, 0.9),
                textAlign: i === 0 ? 'left' : 'right',
              }}>{c}</span>
            ))}
          </div>
        ) : null}
        {rows.map((r, i) => {
          const at = wordToFrame(r.atWord ?? data.atWord ?? 1);
          const on = arriveAt(frame, at, 14);
          const tone = toneOf(r.state);
          const gone = r.state === 'cut' ? travelAt(frame, at + 8, 16) : 0;
          return (
            <div key={i} style={{
              display: 'flex', width: '100%', alignItems: 'center', gap: 10 * scale,
              padding: `${6 * scale}px ${11 * scale}px`,
              borderRadius: radius,
              border: `${1.2 * scale}px solid ${hexA(tone, 0.15 + 0.45 * on)}`,
              background: hexA(tone, 0.06 + 0.07 * on),
              opacity: (0.25 + 0.75 * on) * (1 - 0.55 * gone),
              // a row that is CUT slides out of the result rather than merely dimming
              transform: `translateX(${gone * 14 * scale}px)`,
            }}>
              {(r.cells ?? []).slice(0, 3).map((cell, j) => (
                <span key={j} style={{
                  flex: j === 0 ? 2 : 1, minWidth: 0,
                  fontFamily: t.fonts.mono, fontSize: mono * 0.86,
                  color: j === 0 ? t.colors.text : tone,
                  textAlign: j === 0 ? 'left' : 'right',
                  textDecoration: r.state === 'cut' && gone > 0.4 ? 'line-through' : 'none',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{cell}</span>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  // ── TALLY — a number counts up to its answer. A figure that ticks is read; a figure that
  //    appears is skipped.
  if (data.kind === 'tally') {
    const target = Number(String(data.value ?? '0').replace(/[^0-9.]/g, '')) || 0;
    const go = travelAt(frame, start + 4, 20);
    const shown = Math.round(target * go);
    return (
      <div style={wrap}>
        <span style={{
          fontFamily: t.fonts.mono, fontSize: mono * 1.7, fontWeight: 700,
          color: accent, fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        }}>{shown}</span>
        {data.label ? (
          <span style={{fontFamily: t.fonts.body, fontSize: mono * 0.86, color: t.colors.text}}>
            {data.label}
          </span>
        ) : null}
      </div>
    );
  }

  return null;
};
