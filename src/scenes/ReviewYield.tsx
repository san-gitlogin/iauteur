import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// REVIEW_YIELD — everything a checker reported, and the few that were real.
//
// A percentage hides the shape of the problem; the COUNT is the argument. One
// mark per N findings, laid out as a wall, with the genuinely correct ones lit.
// Sixty marks with four lit, beside nine marks with three lit, teaches the whole
// precision trade without the word ever being spoken. The marks fill in from each
// column's own atWord (LAW 0i.1), so the wall grows while the voice counts it.
export const ReviewYield: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.reviewYield;
  if (!d) return <AbsoluteFill />;

  const cols = (d.columns ?? []).slice(0, 3);
  if (!cols.length) return <AbsoluteFill />;

  const per = Math.max(1, d.perMark ?? 100);
  const litC = sem(d.color ?? 'yellow');
  const hasHeadline = Boolean(scene.data.headline);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const rad = 14 * scale * t.style.cornerRadius;
  // the widest wall decides the mark size, so both columns use one grid unit
  const maxMarks = Math.max(...cols.map((c) => Math.round((c.value ?? 0) / per)), 1);
  const dot = (maxMarks > 48 ? (vertical ? 15 : 19) : vertical ? 20 : 26) * scale;
  const gap = Math.max(3 * scale, dot * 0.22);
  const perRow = maxMarks > 48 ? 10 : 6;

  const Wall: React.FC<{i: number}> = ({i}) => {
    const c = cols[i];
    const total = Math.max(0, Math.round((c.value ?? 0) / per));
    const hits = Math.max(0, Math.round(Number(c.detail ?? 0) / per));
    const start = c.atWord != null ? wordToFrame(c.atWord) : base + 30 + i * 60;
    // the wall FILLS: every mark lands on its own fraction of the beat
    const grown = interpolate(frame, [start, start + Math.max(26, total * 1.6)], [0, total], clamp);
    const tint = sem(c.color ?? 'blue');

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10 * scale,
          flex: 1,
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontFamily: t.fonts.display,
            fontWeight: t.style.displayWeight,
            fontSize: (vertical ? 28 : 33) * scale,
            color: tint,
            textAlign: 'center',
          }}
        >
          {c.label}
        </span>
        {c.sub ? (
          <span
            style={{
              fontFamily: t.fonts.body,
              fontSize: (vertical ? 19 : 21) * scale,
              color: t.colors.muted,
            }}
          >
            {c.sub}
          </span>
        ) : null}

        <div
          style={{
            boxSizing: 'border-box',
            padding: `${14 * scale}px ${14 * scale}px`,
            borderRadius: rad,
            border: `${2 * scale}px solid ${hexA(tint, 0.3)}`,
            background: hexA(tint, 0.05),
            display: 'grid',
            gridTemplateColumns: `repeat(${perRow}, ${dot}px)`,
            gap,
            justifyContent: 'center',
          }}
        >
          {Array.from({length: total}).map((_, k) => {
            const live = Math.min(1, Math.max(0, grown - k));
            const isHit = k < hits;
            return (
              <div
                key={k}
                style={{
                  width: dot,
                  height: dot,
                  borderRadius: 3 * scale * t.style.cornerRadius,
                  opacity: live,
                  transform: `scale(${0.6 + 0.4 * live})`,
                  background: isHit ? hexA(litC, 0.92) : hexA(t.colors.muted, 0.24),
                  border: isHit ? `${1.5 * scale}px solid ${litC}` : `${1 * scale}px solid ${hexA(t.colors.muted, 0.3)}`,
                  boxShadow:
                    isHit && t.style.glow > 0 && live > 0.6
                      ? `0 0 ${10 * scale * t.style.glow}px ${hexA(litC, 0.55)}`
                      : undefined,
                }}
              />
            );
          })}
        </div>

        {c.tag ? (
          <span
            style={{
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 20 : 23) * scale,
              color: t.colors.text,
              opacity: interpolate(frame, [start + 18, start + 34], [0, 1], clamp),
              textAlign: 'center',
            }}
          >
            {c.tag}
          </span>
        ) : null}
      </div>
    );
  };

  const Key: React.FC = () => (
    <div style={{display: 'flex', gap: 22 * scale, alignItems: 'center', opacity: appear}}>
      {[
        {c: litC, label: d.hitLabel ?? 'real', solid: true},
        {c: t.colors.muted, label: d.missLabel ?? 'false alarm', solid: false},
      ].map((k) => (
        <span
          key={k.label}
          style={{display: 'flex', alignItems: 'center', gap: 8 * scale}}
        >
          <span
            style={{
              width: 14 * scale,
              height: 14 * scale,
              borderRadius: 3 * scale * t.style.cornerRadius,
              background: k.solid ? hexA(litC, 0.92) : hexA(t.colors.muted, 0.24),
              border: `${1.5 * scale}px solid ${k.solid ? litC : hexA(t.colors.muted, 0.3)}`,
            }}
          />
          <span
            style={{
              fontFamily: t.fonts.body,
              fontSize: (vertical ? 20 : 22) * scale,
              color: t.colors.muted,
            }}
          >
            {k.label}
          </span>
        </span>
      ))}
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
        <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'yellow'} />
      ) : null}

      {d.unitLabel ? (
        <div
          style={{
            opacity: appear,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 22 : 24) * scale,
            color: t.colors.muted,
            marginBottom: 16 * scale,
          }}
        >
          {d.unitLabel}
        </div>
      ) : null}

      <div
        style={{
          opacity: appear,
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          alignItems: vertical ? 'center' : 'flex-start',
          justifyContent: 'center',
          gap: (vertical ? 26 : 56) * scale,
          width: (vertical ? 980 : 1520) * scale,
        }}
      >
        {cols.map((_, i) => (
          <Wall key={i} i={i} />
        ))}
      </div>

      <div style={{marginTop: 22 * scale}}>
        <Key />
      </div>

      {d.caption ? (
        <div
          style={{
            marginTop: 14 * scale,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 24 : 27) * scale,
            color: t.colors.text,
            opacity: appear,
            textAlign: 'center',
            maxWidth: (vertical ? 960 : 1420) * scale,
          }}
        >
          {d.caption}
        </div>
      ) : null}

      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
