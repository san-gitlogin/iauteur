import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {SceneStepRail} from './types';
import {useScale, useSem, hexA} from './ui';
import {useTheme, wordToFrame} from './themes';

// SCENE STEP RAIL — the app's progress chrome, mounted by the scene shell (like
// ScenePipLayer) so it composes with ANY component the beat casts.
//
// Why it exists: a workflow explained across nine different components reads as
// nine unrelated screens. The rail is the thread — every shot states which of the
// app's steps it belongs to, and the sub-state inside that step. Two components
// on one screen, without nesting one inside the other.
//
// BASE: the rail is on screen from frame 0 (it is context, never a payoff). Only
// the ACTIVE step's fill animates, on `atWord`.
export const SceneStepRailLayer: React.FC<{rail: SceneStepRail}> = ({rail}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();

  const steps = (rail.steps ?? []).slice(0, 6);
  if (!steps.length) return null;
  const active = Math.max(1, Math.min(steps.length, Math.round(rail.active ?? 1)));
  const accent = rail.color ? sem(rail.color) : t.colors.accent;

  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // The rail settles in immediately; the active step lights on its word.
  const railIn = ease(4, 12);
  const litAt = Math.min(wordToFrame(rail.atWord ?? 1), 38);
  const lit = ease(litAt, 12);

  // Sized FROM the budgets, at the NARROW aspect: 11 glyphs at 15px mono is ~93px,
  // plus an 18px badge, an 8px gap and 20px padding = 139px per chip. Six of those
  // plus gaps is 874px — inside the 1080 vertical frame with margin to spare.
  const font = (vertical ? 15 : 17) * scale;
  const labelW = 11 * font * 0.62;
  const badge = (vertical ? 18 : 20) * scale;
  const radius = 9 * scale * t.style.cornerRadius;
  const glow = t.style.glow;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        // Bottom edge on both aspects: it never collides with a headline, and the
        // wide watermark sits further right than the rail's centred max width.
        bottom: (vertical ? 46 : 34) * scale,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 8,
        opacity: railIn,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: (vertical ? 8 : 10) * scale,
          maxWidth: (vertical ? 1000 : 1520) * scale,
          padding: `${8 * scale}px ${14 * scale}px`,
          background: hexA(t.colors.panel, 0.82),
          border: `1.5px solid ${hexA(t.colors.panelBorder, 0.9)}`,
          borderRadius: 14 * scale * t.style.cornerRadius,
          boxShadow: glow > 0 ? `0 0 ${24 * scale * glow}px ${hexA(accent, 0.14 * glow)}` : undefined,
          transform: `translateY(${(1 - railIn) * 10 * scale}px)`,
        }}
      >
        {rail.app ? (
          <span
            style={{
              fontFamily: t.fonts.mono,
              fontSize: font,
              color: hexA(t.colors.text, 0.9),
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 10 * font * 0.62,
              flex: 'none',
              paddingRight: 4 * scale,
              borderRight: `1.5px solid ${hexA(t.colors.panelBorder, 0.9)}`,
            }}
          >
            {rail.app}
          </span>
        ) : null}

        {steps.map((s, i) => {
          const n = i + 1;
          const done = n < active;
          const on = n === active;
          // the active chip is the only thing on the rail that animates
          const fill = on ? lit : 0;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7 * scale,
                flex: 'none',
                padding: `${5 * scale}px ${10 * scale}px`,
                borderRadius: radius,
                background: on ? hexA(accent, 0.1 + 0.12 * fill) : 'transparent',
                border: `1.5px solid ${on ? hexA(accent, 0.3 + 0.4 * fill) : 'transparent'}`,
              }}
            >
              <span
                style={{
                  width: badge,
                  height: badge,
                  flex: 'none',
                  borderRadius: 999,
                  background: on ? hexA(accent, 0.5 + 0.5 * fill) : done ? hexA(sem('green'), 0.75) : hexA(t.colors.panelBorder, 0.9),
                  color: on || done ? t.colors.bg : hexA(t.colors.muted, 0.9),
                  fontFamily: t.fonts.mono,
                  fontSize: badge * 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {done ? '✓' : n}
              </span>
              <span
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: font,
                  color: on ? t.colors.text : hexA(t.colors.muted, done ? 0.85 : 0.6),
                  maxWidth: labelW,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {s}
              </span>
            </div>
          );
        })}

        {rail.note ? (
          <span
            style={{
              fontFamily: t.fonts.mono,
              fontSize: font * 0.94,
              color: hexA(accent, 0.55 + 0.4 * lit),
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              // 34 glyphs at the rail's own size — the sub-state inside the step
              maxWidth: 34 * font * 0.62,
              flex: '0 1 auto',
              minWidth: 0,
              paddingLeft: 6 * scale,
              borderLeft: `1.5px solid ${hexA(t.colors.panelBorder, 0.9)}`,
            }}
          >
            {rail.note}
          </span>
        ) : null}
      </div>
    </div>
  );
};
