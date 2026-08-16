import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {useScale, useSem, hexA} from '../ui';

// QUIZ_CARD — a lettered multiple-choice question that HOLDS, then resolves.
// The hold is the whole value: it turns a passive watcher into someone who has
// already committed to an answer, which is what makes the correction stick.
//
// Owner's timing rule (2026-08-09): the thinking gap is ~5s and the beat is
// capped at ~12s total. NO countdown ring, NO ticking digits, NO drum roll —
// those turn a thinking gap into dead air you can feel. The only thing that
// moves during the hold is one quiet hairline draining left→right, which reads
// as "time is passing" without demanding attention.
//
// Token-driven + ×scale, both aspects (rows stack the same; the card narrows on
// vertical). BASE ≤38 frames: the question and every option are on screen almost
// immediately — only the ANSWER is anchored late, because withholding it IS the
// design.
export const QuizCard: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.quiz;
  if (!d) return <AbsoluteFill />;

  const options = (d.options ?? []).slice(0, 4);
  if (!options.length) return <AbsoluteFill />;

  const start = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const f = frame - start;

  // the answer lands on its own anchor; un-clamped, it is the payoff
  const revealAt = d.revealAtWord != null ? wordToFrame(d.revealAtWord) - start : 150;
  const r = f - revealAt;
  const revealed = interpolate(r, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const answer = Math.max(0, Math.min(options.length - 1, d.answerIndex ?? 0));
  const green = sem('green');
  const radius = 16 * scale * t.style.cornerRadius;
  const glow = t.style.glow;

  const cardW = vertical ? 900 : 1120;
  const rowH = vertical ? 104 : 92;
  const letters = ['A', 'B', 'C', 'D'];

  const appear = interpolate(f, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // the quiet hold: one hairline draining from full to empty across the think beat
  const holdFrom = 26;
  const hold = interpolate(f, [holdFrom, Math.max(holdFrom + 30, revealAt)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.bg}}>
      <div style={{width: cardW * scale, opacity: appear, display: 'flex', flexDirection: 'column', gap: 20 * scale}}>
        {/* the question */}
        <div
          style={{
            fontFamily: t.fonts.display,
            fontSize: (vertical ? 52 : 50) * scale,
            fontWeight: t.style.displayWeight,
            letterSpacing: t.style.displayTracking,
            lineHeight: 1.1,
            color: t.colors.text,
            textAlign: 'center',
            overflowWrap: 'break-word',
          }}
        >
          {d.question}
        </div>

        {/* the quiet hold — the only thing moving while the viewer thinks */}
        <div style={{height: 3 * scale, width: '100%', background: hexA(t.colors.muted, 0.18), borderRadius: 2 * scale}}>
          <div
            style={{
              height: '100%',
              width: `${hold * 100}%`,
              background: hexA(t.colors.accent, 0.55),
              borderRadius: 2 * scale,
            }}
          />
        </div>

        {/* the options */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 12 * scale}}>
          {options.map((o, i) => {
            const isAnswer = i === answer;
            const rowIn = interpolate(f, [6 + i * 4, 20 + i * 4], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            // on reveal: the right row lifts into green, the others recede
            const lift = isAnswer ? revealed : 0;
            const dim = isAnswer ? 1 : 1 - revealed * 0.62;
            return (
              <div
                key={i}
                style={{
                  minHeight: rowH * scale,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18 * scale,
                  padding: `${14 * scale}px ${22 * scale}px`,
                  boxSizing: 'border-box',
                  borderRadius: radius,
                  background: t.colors.panel,
                  border: `2px solid ${isAnswer ? hexA(green, 0.25 + 0.75 * lift) : t.colors.panelBorder}`,
                  opacity: rowIn * dim,
                  transform: `translateX(${(1 - rowIn) * 18 * scale}px)`,
                  boxShadow: lift > 0 && glow > 0 ? `0 0 ${26 * scale * glow * lift}px ${hexA(green, 0.32)}` : undefined,
                }}
              >
                <div
                  style={{
                    width: 46 * scale,
                    height: 46 * scale,
                    flex: '0 0 auto',
                    borderRadius: radius,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: t.fonts.mono,
                    fontSize: 24 * scale,
                    fontWeight: 700,
                    color: lift > 0.5 ? t.colors.onAccent : t.colors.muted,
                    background: lift > 0.5 ? green : hexA(t.colors.muted, 0.14),
                  }}
                >
                  {lift > 0.5 ? '✓' : letters[i]}
                </div>
                <div
                  style={{
                    fontFamily: t.fonts.body,
                    fontSize: (vertical ? 34 : 32) * scale,
                    color: t.colors.text,
                    overflowWrap: 'break-word',
                    minWidth: 0,
                  }}
                >
                  {o.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* the one-line reason, with the answer */}
        {d.why ? (
          <div
            style={{
              opacity: revealed,
              transform: `translateY(${(1 - revealed) * 10 * scale}px)`,
              fontFamily: t.fonts.body,
              fontSize: 27 * scale,
              color: t.colors.muted,
              textAlign: 'center',
              padding: `0 ${20 * scale}px`,
              overflowWrap: 'break-word',
            }}
          >
            {d.why}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
