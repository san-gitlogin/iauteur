import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// HAND_STAMP — a repeated toll becoming a one-off, drawn as a door.
//   'everyone-pays': every test queues and does the whole expensive thing itself, a
//     running total climbing behind them, and the one marked `flaky` fails for a
//     reason that has nothing to do with what it was actually testing.
//   'stamped': the FIRST test does the real thing once, a stamp is saved, and everyone
//     after it just shows the stamp and walks straight through.
// Both modes draw the SAME door and the SAME tests, so the only visible difference is
// the rule — which is the argument the episode is making.
export const HandStamp: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.handStamp;
  if (!d) return <AbsoluteFill />;

  const tests = (d.tests ?? []).slice(0, 5);
  if (!tests.length) return <AbsoluteFill />;
  const stamped = d.mode === 'stamped';
  const accent = sem(d.color ?? (stamped ? 'green' : 'red'));
  const ok = sem('green');
  const bad = sem('red');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the door, the queue and every waiting test exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const startOf = (i: number) => (tests[i].atWord != null ? wordToFrame(tests[i].atWord!) : base + 32 + i * 26);
  const lastStart = Math.max(...tests.map((_, i) => startOf(i)));
  const settle = d.settleAtWord != null
    ? Math.max(wordToFrame(d.settleAtWord), lastStart + 22)
    : lastStart + 46;
  const settled = frame >= settle;

  // in 'stamped' mode only the FIRST test actually pays
  const paysFull = (i: number) => !stamped || i === 0;
  const isFlaky = (i: number) => !stamped && (tests[i].title ?? '').toLowerCase() === 'flaky';
  const doneP = (i: number) => interpolate(frame, [startOf(i), startOf(i) + 18], [0, 1], clamp);

  const rad = 14 * scale * t.style.cornerRadius;
  const boxW = (vertical ? 960 : 1120) * scale;

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'red'} /> : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 13 * scale, opacity: appear}}>
        {/* ── the door, and what it costs to get through ── */}
        <div
          style={{
            width: boxW,
            boxSizing: 'border-box',
            padding: `${12 * scale}px ${18 * scale}px`,
            borderRadius: rad,
            background: t.colors.bg,
            backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
            border: `${2 * scale}px solid ${hexA(accent, 0.6)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12 * scale,
          }}
        >
          <span
            style={{
              flexShrink: 0,
              fontFamily: t.fonts.mono,
              fontSize: 18 * scale,
              letterSpacing: 1.4 * scale,
              textTransform: 'uppercase',
              color: t.colors.muted,
            }}
          >
            {d.doorLabel ?? 'the login page'}
          </span>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: t.fonts.body,
              fontSize: (vertical ? 22 : 24) * scale,
              color: accent,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {d.toll}
          </span>
          {stamped && d.stampLabel ? (
            <span
              style={{
                flexShrink: 0,
                padding: `${4 * scale}px ${12 * scale}px`,
                borderRadius: 7 * scale * t.style.cornerRadius,
                background: hexA(ok, 0.2),
                border: `${1.5 * scale}px solid ${hexA(ok, 0.7)}`,
                fontFamily: t.fonts.mono,
                fontSize: 19 * scale,
                color: ok,
                whiteSpace: 'nowrap',
              }}
            >
              {'✓ '}
              {d.stampLabel}
            </span>
          ) : null}
        </div>

        {/* ── the queue: who pays, and who just shows the stamp ── */}
        <div style={{width: boxW, display: 'flex', flexDirection: 'column', gap: 9 * scale}}>
          {tests.map((tst, i) => {
            const p = doneP(i);
            const pays = paysFull(i);
            const flaky = isFlaky(i);
            const c = flaky ? bad : pays ? accent : ok;
            return (
              <div
                key={i}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  padding: `${10 * scale}px ${13 * scale}px`,
                  borderRadius: 9 * scale * t.style.cornerRadius,
                  background: hexA(c, 0.11 * p),
                  border: `${1.5 * scale}px solid ${hexA(p > 0.2 ? c : t.colors.muted, 0.25 + 0.45 * p)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12 * scale,
                }}
              >
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontFamily: t.fonts.mono,
                    fontSize: (vertical ? 21 : 22) * scale,
                    color: t.colors.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tst.label}
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    padding: `${4 * scale}px ${12 * scale}px`,
                    borderRadius: 7 * scale * t.style.cornerRadius,
                    background: hexA(c, 0.18 * p),
                    border: `${1.5 * scale}px solid ${hexA(c, 0.65 * p)}`,
                    fontFamily: t.fonts.body,
                    fontSize: 19 * scale,
                    color: c,
                    opacity: p,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {flaky
                    ? `✕ ${d.flakyNote ?? 'failed at the door'}`
                    : pays
                      ? `paid · ${d.toll}`
                      : `✓ shows the stamp`}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── the verdict ── */}
        {settled ? (
          <div
            style={{
              alignSelf: 'flex-start',
              padding: `${7 * scale}px ${15 * scale}px`,
              borderRadius: 8 * scale * t.style.cornerRadius,
              background: hexA(stamped ? ok : bad, 0.16),
              border: `${1.5 * scale}px solid ${hexA(stamped ? ok : bad, 0.6)}`,
              fontFamily: t.fonts.body,
              fontSize: 22 * scale,
              color: stamped ? ok : bad,
              opacity: interpolate(frame, [settle, settle + 14], [0, 1], clamp),
              whiteSpace: 'nowrap',
            }}
          >
            {d.totalLabel ?? (stamped ? 'one login, whole suite' : 'the same toll, every time')}
          </div>
        ) : null}
      </div>

      {d.caption ? (
        <div
          style={{
            marginTop: 22 * scale,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 26 : 28) * scale,
            color: t.colors.muted,
            opacity: appear,
            textAlign: 'center',
            maxWidth: (vertical ? 980 : 1500) * scale,
          }}
        >
          {d.caption}
        </div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
