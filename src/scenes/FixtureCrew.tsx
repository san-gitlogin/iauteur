import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// FIXTURE_CREW — dependency injection, drawn. A test function sits on top with an
// EMPTY argument slot. A crew rail below builds its stages in order; at the handoff a
// chip travels UP the connector and fills the slot; the body runs; at teardown the
// stages clear in REVERSE and the slot empties. Same vertical structure in both
// aspects (function above, rail below) so nothing has to re-derive coordinates.
export const FixtureCrew: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.fixtureCrew;
  if (!d) return <AbsoluteFill />;

  const stages = (d.stages ?? []).slice(0, 4);
  if (!stages.length) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'green');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — function box, empty slot and the whole rail exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const stageStart = stages.map((s, i) => (s.atWord != null ? wordToFrame(s.atWord) : base + 20 + i * 26));
  const handoff = d.handoffAtWord != null ? wordToFrame(d.handoffAtWord) : stageStart[stages.length - 1] + 34;
  const teardown = d.teardownAtWord != null ? wordToFrame(d.teardownAtWord) : handoff + 90;

  const handP = interpolate(frame, [handoff, handoff + 22], [0, 1], clamp);
  const filled = handP > 0.85;
  const tearing = frame >= teardown;
  // teardown runs in REVERSE: the LAST stage clears first
  const clearedCount = tearing ? Math.min(stages.length, Math.floor((frame - teardown) / 12) + 1) : 0;
  const isCleared = (i: number) => tearing && i >= stages.length - clearedCount;

  const rad = 14 * scale * t.style.cornerRadius;
  const boxW = (vertical ? 980 : 1120) * scale;
  const cardW = (vertical ? 220 : 250) * scale;

  const slotFill = filled && !tearing;

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'green'} /> : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: appear}}>
        {/* ── the test function, with the slot it asks for ── */}
        <div
          style={{
            width: boxW,
            boxSizing: 'border-box',
            padding: `${20 * scale}px ${26 * scale}px`,
            borderRadius: rad,
            background: t.colors.panel,
            border: `${2 * scale}px solid ${slotFill ? accent : t.colors.panelBorder}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10 * scale,
            flexWrap: 'nowrap',
            boxShadow: slotFill && t.style.glow > 0 ? `0 0 ${22 * scale}px ${hexA(accent, 0.35)}` : undefined,
          }}
        >
          <span style={{fontFamily: t.fonts.mono, fontSize: (vertical ? 25 : 29) * scale, color: sem('purple'), flexShrink: 0}}>def</span>
          <span
            style={{
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 25 : 29) * scale,
              color: sem('blue'),
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            {d.testName}
          </span>
          <span style={{fontFamily: t.fonts.mono, fontSize: (vertical ? 25 : 29) * scale, color: t.colors.text, flexShrink: 0}}>(</span>
          {/* THE SLOT — empty until the crew hands something up */}
          <span
            style={{
              flexShrink: 0,
              padding: `${5 * scale}px ${14 * scale}px`,
              borderRadius: 8 * scale * t.style.cornerRadius,
              border: `${2 * scale}px ${slotFill ? 'solid' : 'dashed'} ${slotFill ? accent : hexA(t.colors.muted, 0.7)}`,
              background: slotFill ? hexA(accent, 0.18) : 'transparent',
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 24 : 27) * scale,
              color: slotFill ? accent : hexA(t.colors.muted, 0.85),
            }}
          >
            {d.askFor}
          </span>
          <span style={{fontFamily: t.fonts.mono, fontSize: (vertical ? 25 : 29) * scale, color: t.colors.text, flexShrink: 0}}>):</span>
          {d.bodyLabel && slotFill ? (
            <span
              style={{
                marginLeft: 'auto',
                flexShrink: 0,
                fontFamily: t.fonts.body,
                fontSize: 22 * scale,
                color: accent,
                whiteSpace: 'nowrap',
              }}
            >
              {d.bodyLabel}
            </span>
          ) : null}
        </div>

        {/* ── the connector, with the chip that travels UP into the slot ── */}
        <div style={{position: 'relative', width: 4 * scale, height: (vertical ? 96 : 110) * scale}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: hexA(tearing ? sem('orange') : accent, tearing || handP > 0 ? 0.75 : 0.28),
            }}
          />
          {handP > 0 && handP < 1 && !tearing ? (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                // travels bottom → top: the crew hands the built thing UP
                bottom: `${handP * 100}%`,
                transform: 'translate(-50%, 50%)',
                padding: `${4 * scale}px ${12 * scale}px`,
                borderRadius: 8 * scale * t.style.cornerRadius,
                background: t.colors.bg,
                backgroundImage: `linear-gradient(${hexA(accent, 0.9)}, ${hexA(accent, 0.9)})`,
                color: t.colors.onAccent,
                fontFamily: t.fonts.mono,
                fontSize: 21 * scale,
                whiteSpace: 'nowrap',
              }}
            >
              {d.askFor}
            </div>
          ) : null}
        </div>

        {/* ── the crew rail ── */}
        <div
          style={{
            width: boxW,
            boxSizing: 'border-box',
            padding: `${16 * scale}px ${20 * scale}px ${20 * scale}px`,
            borderRadius: rad,
            background: hexA(t.colors.panelBorder, 0.22),
            border: `${1.5 * scale}px dashed ${hexA(t.colors.muted, 0.5)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 14 * scale,
          }}
        >
          <div
            style={{
              fontFamily: t.fonts.mono,
              fontSize: 19 * scale,
              letterSpacing: 2 * scale,
              textTransform: 'uppercase',
              color: t.colors.muted,
            }}
          >
            {d.crewLabel ?? 'the crew'}
          </div>
          <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 12 * scale, alignItems: 'stretch'}}>
            {stages.map((st, i) => {
              const on = interpolate(frame, [stageStart[i], stageStart[i] + 14], [0, 1], clamp);
              const cleared = isCleared(i);
              const c = sem(st.color ?? d.color ?? 'green');
              return (
                <React.Fragment key={i}>
                  <div
                    style={{
                      flex: vertical ? undefined : 1,
                      minWidth: 0,
                      width: vertical ? '100%' : undefined,
                      maxWidth: vertical ? undefined : cardW,
                      boxSizing: 'border-box',
                      padding: `${12 * scale}px ${14 * scale}px`,
                      borderRadius: 10 * scale * t.style.cornerRadius,
                      background: cleared ? 'transparent' : hexA(c, 0.14 * on),
                      border: `${1.5 * scale}px ${cleared ? 'dashed' : 'solid'} ${cleared ? hexA(t.colors.muted, 0.4) : hexA(c, 0.55 * on + 0.15)}`,
                      opacity: cleared ? 0.3 : 0.35 + 0.65 * on,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3 * scale,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontSize: (vertical ? 23 : 25) * scale,
                        color: cleared ? t.colors.muted : c,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {st.label}
                    </span>
                    {st.sub ? (
                      <span
                        style={{
                          fontFamily: t.fonts.body,
                          fontSize: (vertical ? 21 : 22) * scale,
                          color: t.colors.muted,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {st.sub}
                      </span>
                    ) : null}
                  </div>
                  {i < stages.length - 1 ? (
                    <span
                      style={{
                        alignSelf: 'center',
                        flexShrink: 0,
                        fontFamily: t.fonts.mono,
                        fontSize: 22 * scale,
                        color: hexA(t.colors.muted, 0.8),
                      }}
                    >
                      {vertical ? '↓' : '→'}
                    </span>
                  ) : null}
                </React.Fragment>
              );
            })}
          </div>
          {tearing && d.teardownLabel ? (
            <div
              style={{
                alignSelf: 'flex-start',
                marginTop: 2 * scale,
                padding: `${6 * scale}px ${14 * scale}px`,
                borderRadius: 8 * scale * t.style.cornerRadius,
                background: hexA(sem('orange'), 0.15),
                border: `${1.5 * scale}px solid ${hexA(sem('orange'), 0.55)}`,
                fontFamily: t.fonts.body,
                fontSize: 22 * scale,
                color: sem('orange'),
                whiteSpace: 'nowrap',
              }}
            >
              {d.teardownLabel}
            </div>
          ) : null}
        </div>
      </div>

      {d.caption ? (
        <div
          style={{
            marginTop: 24 * scale,
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
