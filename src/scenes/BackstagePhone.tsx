import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// BACKSTAGE_PHONE — two routes to the same answer, raced. The top lane walks the long way
// through a queue of stage steps, a clock climbing beside each one. The bottom lane is a
// single hop that lands while the top lane is still mid-queue. The gap between the two
// clock readings IS the lesson — nobody has to be told the phone is faster, they watch it.
export const BackstagePhone: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.backstagePhone;
  if (!d) return <AbsoluteFill />;

  const steps = (d.steps ?? []).slice(0, 5);
  if (!steps.length || !d.question || !d.hop) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'green');
  const slow = sem('orange');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the question, both empty lanes and their labels are up within ~1.3s.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const stepStart = (i: number) =>
    steps[i].atWord != null ? wordToFrame(steps[i].atWord!) : base + 30 + i * 30;
  const hopStart = d.hopAtWord != null ? wordToFrame(d.hopAtWord) : base + 30 + steps.length * 30;
  const verdictStart = d.verdictAtWord != null ? wordToFrame(d.verdictAtWord) : hopStart + 40;

  const rad = 12 * scale * t.style.cornerRadius;
  const laneW = (vertical ? 940 : 1560) * scale;
  const pillH = (vertical ? 96 : 88) * scale;
  const gap = 10 * scale;

  // the running clock on the slow lane reads whatever the last lit step says
  const litCount = steps.filter((_, i) => frame >= stepStart(i)).length;
  const slowRead = litCount ? steps[litCount - 1].detail : undefined;
  const hopLanded = frame >= hopStart + 12;

  const laneHead = (text: string, read: string | undefined, c: string, on: boolean) => (
    <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', width: laneW}}>
      <span
        style={{
          fontFamily: t.fonts.mono,
          fontSize: 18 * scale,
          letterSpacing: 1.4 * scale,
          textTransform: 'uppercase',
          color: on ? c : t.colors.muted,
        }}
      >
        {text}
      </span>
      {read ? (
        <span
          style={{
            padding: `${3 * scale}px ${11 * scale}px`,
            borderRadius: 6 * scale * t.style.cornerRadius,
            background: hexA(c, 0.18),
            fontFamily: t.fonts.mono,
            fontSize: 20 * scale,
            color: c,
            whiteSpace: 'nowrap',
          }}
        >
          {read}
        </span>
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
      {hasHeadline ? (
        <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'green'} />
      ) : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 * scale, opacity: appear}}>
        {/* the one question both routes are answering */}
        <div
          style={{
            padding: `${7 * scale}px ${18 * scale}px`,
            borderRadius: rad,
            background: t.colors.bg,
            backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
            border: `${1.5 * scale}px solid ${hexA(t.colors.muted, 0.45)}`,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 25 : 26) * scale,
            color: t.colors.text,
            maxWidth: laneW,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {d.question}
        </div>

        {/* ── the long way round ── */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 7 * scale, marginTop: 6 * scale}}>
          {laneHead(d.stageLabel ?? 'the whole play', slowRead ?? d.stageTime, slow, litCount > 0)}
          {/* vertical is half the width — five steps on one row truncate every label to three
              words, so let the lane wrap instead of shrinking each pill into uselessness */}
          <div style={{display: 'flex', flexWrap: 'wrap', gap, width: laneW}}>
            {steps.map((st, i) => {
              const p = interpolate(frame, [stepStart(i), stepStart(i) + 14], [0, 1], clamp);
              return (
                <div
                  key={i}
                  style={{
                    flex: `1 1 ${(vertical ? 290 : 200) * scale}px`,
                    minWidth: 0,
                    height: pillH,
                    boxSizing: 'border-box',
                    padding: `${9 * scale}px ${12 * scale}px`,
                    borderRadius: rad,
                    background: hexA(slow, 0.1 * p),
                    border: `${1.5 * scale}px solid ${hexA(slow, 0.25 + 0.45 * p)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 4 * scale,
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      fontFamily: t.fonts.body,
                      fontSize: (vertical ? 21 : 22) * scale,
                      color: p > 0.4 ? t.colors.text : t.colors.muted,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {st.label}
                  </span>
                  {st.detail ? (
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontSize: 19 * scale,
                        color: slow,
                        opacity: p,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {st.detail}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── the backstage phone: one hop ── */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 7 * scale, marginTop: 10 * scale}}>
          {laneHead(d.hopLabel ?? 'the backstage phone', hopLanded ? d.hopTime : undefined, accent, hopLanded)}
          <div
            style={{
              position: 'relative',
              width: laneW,
              height: pillH,
              boxSizing: 'border-box',
              padding: `0 ${14 * scale}px`,
              borderRadius: rad,
              background: hexA(accent, 0.1 * interpolate(frame, [hopStart, hopStart + 14], [0, 1], clamp)),
              border: `${2 * scale}px solid ${hexA(accent, 0.3 + 0.5 * interpolate(frame, [hopStart, hopStart + 14], [0, 1], clamp))}`,
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 21 : 23) * scale,
                color: frame >= hopStart ? accent : t.colors.muted,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {d.hop}
            </span>
            {/* the call itself, crossing the whole lane in a blink */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: interpolate(frame, [hopStart, hopStart + 10], [2, 97], clamp) + '%',
                width: 13 * scale,
                height: 13 * scale,
                marginTop: -6.5 * scale,
                borderRadius: '50%',
                background: accent,
                boxShadow: `0 0 ${16 * scale}px ${hexA(accent, 0.85)}`,
                opacity: interpolate(frame, [hopStart, hopStart + 3, hopStart + 10, hopStart + 15], [0, 1, 1, 0], clamp),
              }}
            />
          </div>
        </div>

        {d.verdict ? (
          <div
            style={{
              marginTop: 12 * scale,
              padding: `${7 * scale}px ${20 * scale}px`,
              borderRadius: rad,
              background: hexA(accent, 0.2),
              border: `${1.5 * scale}px solid ${hexA(accent, 0.65)}`,
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 26 : 28) * scale,
              color: accent,
              whiteSpace: 'nowrap',
              opacity: interpolate(frame, [verdictStart, verdictStart + 12], [0, 1], clamp),
              transform: `scale(${interpolate(frame, [verdictStart, verdictStart + 12], [0.9, 1], clamp)})`,
            }}
          >
            {d.verdict}
          </div>
        ) : null}
      </div>

      {d.caption ? (
        <div
          style={{
            marginTop: 26 * scale,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 25 : 27) * scale,
            color: t.colors.muted,
            opacity: appear,
            textAlign: 'center',
            maxWidth: (vertical ? 960 : 1500) * scale,
          }}
        >
          {d.caption}
        </div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
