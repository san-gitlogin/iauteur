import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// WORKER_SPREAD — one queue dealt out across parallel lanes. Items leave the queue as each lane
// opens, the lanes fill at their own rate and finish ragged (real workers do), and the sequential
// total sits beside the parallel one so the collapse in wall time is a comparison, not a claim.
// The work never got faster. It got spread. That distinction is the beat.
export const WorkerSpread: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.workerSpread;
  if (!d) return <AbsoluteFill />;

  const lanes = (d.lanes ?? []).slice(0, 4);
  if (!lanes.length) return <AbsoluteFill />;
  const items = (d.items ?? []).slice(0, 6);
  const accent = sem(d.color ?? 'green');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the queue, every empty lane and the sequential total exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const laneStart = (i: number) => (lanes[i].atWord != null ? wordToFrame(lanes[i].atWord!) : base + 30 + i * 24);
  const afterStart = d.afterAtWord != null ? wordToFrame(d.afterAtWord) : laneStart(lanes.length - 1) + 40;

  // an item is dealt once its lane has opened — they leave the queue in order, round-robin
  const dealtAt = (idx: number) => laneStart(idx % lanes.length) + Math.floor(idx / lanes.length) * 10;
  const dealt = (idx: number) => frame >= dealtAt(idx) + 10;
  const queueLeft = items.filter((_, i) => !dealt(i)).length;

  const rad = 12 * scale * t.style.cornerRadius;
  const bodyW = (vertical ? 920 : 1420) * scale;
  const laneW = (bodyW - (lanes.length - 1) * 10 * scale) / lanes.length;
  const laneH = (vertical ? 210 : 190) * scale;

  const pill = (text: string, c: string, on: boolean, key?: React.Key) => (
    <div
      key={key}
      style={{
        padding: `${5 * scale}px ${10 * scale}px`,
        borderRadius: 8 * scale * t.style.cornerRadius,
        background: hexA(c, on ? 0.16 : 0.08),
        border: `${1.5 * scale}px solid ${hexA(c, on ? 0.6 : 0.25)}`,
        fontFamily: t.fonts.mono,
        fontSize: (vertical ? 17 : 18) * scale,
        color: on ? c : t.colors.muted,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {text}
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

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale, opacity: appear}}>
        {/* ── the queue, draining ── */}
        <div
          style={{
            width: bodyW,
            boxSizing: 'border-box',
            padding: `${10 * scale}px ${14 * scale}px`,
            borderRadius: rad,
            background: hexA(t.colors.panelBorder, 0.24),
            border: `${1.5 * scale}px solid ${hexA(t.colors.muted, 0.3)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10 * scale,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: t.fonts.mono,
              fontSize: 18 * scale,
              letterSpacing: 1.3 * scale,
              textTransform: 'uppercase',
              color: t.colors.muted,
              whiteSpace: 'nowrap',
            }}
          >
            {d.queueLabel ?? 'the queue'}
          </span>
          {items.map((it, i) =>
            dealt(i) ? null : pill(it, t.colors.muted === accent ? accent : accent, false, i),
          )}
          {items.length && !queueLeft ? (
            <span style={{fontFamily: t.fonts.body, fontSize: 19 * scale, color: accent}}>all dealt out</span>
          ) : null}
        </div>

        {/* ── the lanes ── */}
        <div style={{display: 'flex', gap: 10 * scale, width: bodyW}}>
          {lanes.map((ln, i) => {
            const p = interpolate(frame, [laneStart(i), laneStart(i) + 14], [0, 1], clamp);
            const mine = items.filter((_, k) => k % lanes.length === i && dealt(k));
            return (
              <div
                key={i}
                style={{
                  width: laneW,
                  height: laneH,
                  boxSizing: 'border-box',
                  padding: `${10 * scale}px`,
                  borderRadius: rad,
                  background: hexA(accent, 0.07 * p),
                  border: `${1.5 * scale + 0.5 * scale * p}px solid ${hexA(accent, 0.2 + 0.5 * p)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6 * scale,
                  overflow: 'hidden',
                }}
              >
                <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 * scale}}>
                  <span
                    style={{
                      fontFamily: t.fonts.mono,
                      fontSize: 20 * scale,
                      color: p > 0.4 ? accent : t.colors.muted,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ln.label}
                  </span>
                  {ln.detail ? (
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontSize: 18 * scale,
                        color: t.colors.muted,
                        opacity: p,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ln.detail}
                    </span>
                  ) : null}
                </div>
                {ln.sub ? (
                  <span
                    style={{
                      fontFamily: t.fonts.body,
                      fontSize: 18 * scale,
                      color: t.colors.muted,
                      opacity: p,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ln.sub}
                  </span>
                ) : null}
                {/* what actually landed here */}
                <div style={{display: 'flex', flexDirection: 'column', gap: 5 * scale, overflow: 'hidden'}}>
                  {mine.map((it, k) => pill(it, accent, true, k))}
                </div>
                {/* the lane's own progress bar — they finish ragged, on purpose */}
                <div
                  style={{
                    marginTop: 'auto',
                    height: 6 * scale,
                    borderRadius: 999,
                    background: hexA(t.colors.muted, 0.18),
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${100 * interpolate(frame, [laneStart(i), laneStart(i) + 60 + i * 9], [0, 1], clamp)}%`,
                      background: accent,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── the wall clock, before and after ── */}
        <div style={{display: 'flex', alignItems: 'center', gap: 12 * scale, flexWrap: 'wrap', justifyContent: 'center'}}>
          {d.beforeLabel ? (
            <span
              style={{
                padding: `${6 * scale}px ${14 * scale}px`,
                borderRadius: rad,
                background: hexA(t.colors.panelBorder, 0.3),
                border: `${1.5 * scale}px solid ${hexA(t.colors.muted, 0.35)}`,
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 21 : 23) * scale,
                color: t.colors.muted,
                textDecoration: frame >= afterStart ? 'line-through' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {d.beforeLabel}
            </span>
          ) : null}
          {d.afterLabel ? (
            <span
              style={{
                padding: `${6 * scale}px ${16 * scale}px`,
                borderRadius: rad,
                background: hexA(accent, 0.2),
                border: `${2 * scale}px solid ${hexA(accent, 0.7)}`,
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 23 : 26) * scale,
                color: accent,
                whiteSpace: 'nowrap',
                opacity: interpolate(frame, [afterStart, afterStart + 12], [0, 1], clamp),
                transform: `scale(${interpolate(frame, [afterStart, afterStart + 12], [0.9, 1], clamp)})`,
              }}
            >
              {d.afterLabel}
            </span>
          ) : null}
        </div>

        {d.note ? (
          <span
            style={{
              fontFamily: t.fonts.body,
              fontSize: 20 * scale,
              color: sem('orange'),
              opacity: interpolate(frame, [afterStart + 8, afterStart + 22], [0, 1], clamp),
              whiteSpace: 'nowrap',
            }}
          >
            {d.note}
          </span>
        ) : null}
      </div>

      {d.caption ? (
        <div
          style={{
            marginTop: 22 * scale,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 24 : 26) * scale,
            color: t.colors.muted,
            opacity: appear,
            textAlign: 'center',
            maxWidth: (vertical ? 940 : 1440) * scale,
          }}
        >
          {d.caption}
        </div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
