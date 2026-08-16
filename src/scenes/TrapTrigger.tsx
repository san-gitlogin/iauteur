import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// TRAP_TRIGGER — ordering as correctness. Two events run in sequence and the ORDER
// decides whether the third thing exists at all. In 'trap' mode the listener arms
// first and the event lands in the catcher as a real object. In 'missed' mode the
// identical events run the other way round and the event flies past an unarmed
// catcher and is gone. Showing the failing order is not optional: without it the
// with-block reads as syntax trivia instead of as a race being closed.
export const TrapTrigger: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.trapTrigger;
  if (!d) return <AbsoluteFill />;

  const missed = d.mode === 'missed';
  const accent = sem(d.color ?? 'purple');
  const ok = sem('green');
  const bad = sem('red');
  const items = (d.caughtItems ?? []).slice(0, 3);
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — both lines, the bracket and the empty catcher exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const first = d.armAtWord != null ? Math.max(wordToFrame(d.armAtWord), base + 20) : base + 50;
  const second = d.fireAtWord != null ? Math.max(wordToFrame(d.fireAtWord), first + 26) : first + 60;
  const firstP = interpolate(frame, [first, first + 14], [0, 1], clamp);
  const secondP = interpolate(frame, [second, second + 14], [0, 1], clamp);

  // the event exists once the TRIGGER has run; whether it lands depends on the order
  const triggerP = missed ? firstP : secondP;
  const listenerP = missed ? secondP : firstP;
  const settled = interpolate(frame, [second + 16, second + 40], [0, 1], clamp);
  const held = !missed && settled > 0.5;
  const lost = missed && settled > 0.5;

  const rad = 14 * scale * t.style.cornerRadius;
  const colW = (vertical ? 960 : 720) * scale;
  const catchW = (vertical ? 960 : 520) * scale;

  // rows are drawn in EXECUTION order, so the mode is visible in the layout itself
  const rows = missed
    ? [{txt: d.trigger, kind: 'trigger' as const, p: firstP}, {txt: d.listener, kind: 'listener' as const, p: secondP}]
    : [{txt: d.listener, kind: 'listener' as const, p: firstP}, {txt: d.trigger, kind: 'trigger' as const, p: secondP}];

  const Steps = (
    <div style={{width: colW, display: 'flex', flexDirection: 'column', gap: 12 * scale}}>
      {rows.map((r, i) => {
        const c = r.kind === 'listener' ? accent : sem('blue');
        return (
          <div
            key={i}
            style={{
              boxSizing: 'border-box',
              width: '100%',
              padding: `${13 * scale}px ${16 * scale}px`,
              borderRadius: rad,
              background: t.colors.bg,
              backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
              border: `${2 * scale}px solid ${hexA(c, 0.25 + 0.55 * r.p)}`,
              boxShadow: r.p > 0.8 && t.style.glow > 0 ? `0 0 ${18 * scale * t.style.glow}px ${hexA(c, 0.28)}` : undefined,
              display: 'flex',
              alignItems: 'center',
              gap: 12 * scale,
              opacity: 0.5 + 0.5 * r.p,
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: 30 * scale,
                height: 30 * scale,
                borderRadius: 15 * scale,
                background: hexA(c, 0.2 + 0.4 * r.p),
                border: `${1.5 * scale}px solid ${hexA(c, 0.7)}`,
                fontFamily: t.fonts.mono,
                fontSize: 19 * scale,
                color: c,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 21 : 23) * scale,
                color: r.p > 0.4 ? c : hexA(t.colors.muted, 0.9),
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {r.txt}
            </span>
            {r.kind === 'listener' && r.p > 0.6 ? (
              <span
                style={{
                  flexShrink: 0,
                  padding: `${4 * scale}px ${11 * scale}px`,
                  borderRadius: 7 * scale * t.style.cornerRadius,
                  background: hexA(accent, 0.2),
                  fontFamily: t.fonts.body,
                  fontSize: 19 * scale,
                  color: accent,
                  whiteSpace: 'nowrap',
                }}
              >
                listening
              </span>
            ) : null}
          </div>
        );
      })}
      {d.catcher ? (
        <div
          style={{
            boxSizing: 'border-box',
            width: '100%',
            padding: `${11 * scale}px ${16 * scale}px`,
            borderRadius: rad,
            border: `${1.5 * scale}px dashed ${hexA(held ? ok : t.colors.muted, held ? 0.65 : 0.35)}`,
            fontFamily: t.fonts.mono,
            fontSize: (vertical ? 20 : 22) * scale,
            color: held ? ok : hexA(t.colors.muted, 0.85),
            opacity: 0.4 + 0.6 * settled,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {d.catcher}
        </div>
      ) : null}
    </div>
  );

  const Catcher = (
    <div style={{width: catchW, display: 'flex', flexDirection: 'column', gap: 12 * scale}}>
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          minHeight: (vertical ? 150 : 190) * scale,
          padding: `${14 * scale}px ${16 * scale}px`,
          borderRadius: rad,
          background: held ? hexA(ok, 0.1) : 'transparent',
          border: `${2 * scale}px ${held ? 'solid' : 'dashed'} ${
            held ? hexA(ok, 0.8) : lost ? hexA(bad, 0.6) : hexA(t.colors.muted, 0.4)
          }`,
          display: 'flex',
          flexDirection: 'column',
          gap: 9 * scale,
          justifyContent: held || lost ? 'flex-start' : 'center',
          alignItems: held || lost ? 'stretch' : 'center',
        }}
      >
        {held ? (
          <>
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: 18 * scale,
                letterSpacing: 1.5 * scale,
                textTransform: 'uppercase',
                color: ok,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {d.caught ?? 'caught'}
            </span>
            {items.map((it, i) => (
              <div
                key={i}
                style={{
                  boxSizing: 'border-box',
                  padding: `${7 * scale}px ${11 * scale}px`,
                  borderRadius: 8 * scale * t.style.cornerRadius,
                  background: hexA(ok, 0.14),
                  border: `${1.5 * scale}px solid ${hexA(ok, 0.4)}`,
                  fontFamily: t.fonts.body,
                  fontSize: (vertical ? 21 : 22) * scale,
                  color: t.colors.text,
                  opacity: interpolate(frame, [second + 18 + i * 8, second + 34 + i * 8], [0, 1], clamp),
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {it}
              </div>
            ))}
          </>
        ) : lost ? (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8 * scale}}>
            <span style={{fontFamily: t.fonts.mono, fontSize: 30 * scale, color: bad}}>✕</span>
            <span
              style={{
                fontFamily: t.fonts.body,
                fontSize: (vertical ? 22 : 23) * scale,
                color: bad,
                textAlign: 'center',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {d.missNote ?? 'nobody was listening'}
            </span>
          </div>
        ) : (
          <span style={{fontFamily: t.fonts.body, fontSize: 22 * scale, color: hexA(t.colors.muted, 0.8)}}>
            nothing caught yet
          </span>
        )}
      </div>

      {/* the event itself, leaving the trigger — it lands, or it flies past */}
      {triggerP > 0.3 && settled < 1 ? (
        <div
          style={{
            alignSelf: 'center',
            padding: `${5 * scale}px ${13 * scale}px`,
            borderRadius: 8 * scale * t.style.cornerRadius,
            background: t.colors.bg,
            backgroundImage: `linear-gradient(${hexA(missed ? bad : ok, 0.9)}, ${hexA(missed ? bad : ok, 0.9)})`,
            color: t.colors.onAccent,
            fontFamily: t.fonts.mono,
            fontSize: 20 * scale,
            whiteSpace: 'nowrap',
            // trap: settles INTO the catcher · missed: sails on past it
            transform: `translateY(${interpolate(settled, [0, 1], [0, missed ? -70 : -18], clamp)}px)`,
            opacity: missed ? 1 - settled : 1 - settled * 0.6,
          }}
        >
          {d.caught ?? 'the event'}
        </div>
      ) : null}

      {d.originLabel && held ? (
        <div
          style={{
            boxSizing: 'border-box',
            padding: `${9 * scale}px ${13 * scale}px`,
            borderRadius: 9 * scale * t.style.cornerRadius,
            border: `${1.5 * scale}px solid ${hexA(t.colors.muted, 0.4)}`,
            fontFamily: t.fonts.body,
            fontSize: 20 * scale,
            color: t.colors.muted,
            opacity: settled,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {d.originLabel}
          {' · still works'}
        </div>
      ) : null}
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'purple'} /> : null}

      <div
        style={{
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          alignItems: vertical ? 'center' : 'flex-start',
          justifyContent: 'center',
          gap: (vertical ? 16 : 30) * scale,
          opacity: appear,
        }}
      >
        {Steps}
        {Catcher}
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
