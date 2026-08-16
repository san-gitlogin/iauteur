import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// RESPONSIBILITY_SPLIT — a boundary learned by watching real lines get filed.
// Two labelled bins, a neutral pile between them, and each line SLIDES to its
// side at its own word while that bin's tally climbs. The pile is what you wrote;
// the bins are who owns it. Two static cards can only assert the boundary — this
// makes the viewer watch it being drawn, line by line.
export const ResponsibilitySplit: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.respSplit;
  if (!d) return <AbsoluteFill />;

  const lines = (d.lines ?? []).slice(0, 6);
  if (!lines.length) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'purple');
  const rightC = sem('green');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — both bins and every unsorted line exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const startOf = (i: number) => (lines[i].atWord != null ? wordToFrame(lines[i].atWord!) : base + 40 + i * 30);
  const isRight = (i: number) => (lines[i].title ?? 'left').toLowerCase() === 'right';
  const progress = (i: number) => interpolate(frame, [startOf(i), startOf(i) + 20], [0, 1], clamp);

  const tally = (right: boolean) => lines.filter((_, i) => isRight(i) === right && progress(i) > 0.9).length;

  const rad = 14 * scale * t.style.cornerRadius;
  const boxW = (vertical ? 1000 : 1560) * scale;
  const binW = (vertical ? 250 : 330) * scale;
  // MAX-fixture catch: a filed row used to travel 42% of the PILE's width toward its
  // bin — which is far wider than the gap between them, so at 6 lines the rows slid
  // clean over both bins and buried their labels. The travel is now a short nudge and
  // the FILING is carried by the row narrowing, docking to its own edge, and growing a
  // thick accent bar on that side. Motion that cannot leave its container cannot collide.
  const NUDGE = 4;          // % of the row's own width — a lean, not a journey
  const DOCK = 86;          // % width once filed, so the empty side is visible

  const Bin: React.FC<{right: boolean}> = ({right}) => {
    const c = right ? rightC : accent;
    const n = tally(right);
    return (
      <div
        style={{
          width: binW,
          flexShrink: 0,
          boxSizing: 'border-box',
          padding: `${16 * scale}px ${18 * scale}px`,
          borderRadius: rad,
          background: hexA(c, 0.1 + Math.min(0.12, n * 0.035)),
          border: `${2 * scale}px solid ${hexA(c, 0.45 + Math.min(0.35, n * 0.1))}`,
          boxShadow: n > 0 && t.style.glow > 0 ? `0 0 ${20 * scale * t.style.glow}px ${hexA(c, 0.22)}` : undefined,
          display: 'flex',
          flexDirection: 'column',
          gap: 4 * scale,
          alignItems: right ? 'flex-end' : 'flex-start',
        }}
      >
        <span
          style={{
            fontFamily: t.fonts.display,
            fontWeight: t.style.displayWeight,
            fontSize: (vertical ? 28 : 31) * scale,
            color: c,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {right ? d.rightLabel : d.leftLabel}
        </span>
        {(right ? d.rightSub : d.leftSub) ? (
          <span
            style={{
              fontFamily: t.fonts.mono,
              fontSize: 20 * scale,
              letterSpacing: 2 * scale,
              textTransform: 'uppercase',
              color: t.colors.muted,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {right ? d.rightSub : d.leftSub}
          </span>
        ) : null}
        <span style={{marginTop: 6 * scale, fontFamily: t.fonts.mono, fontSize: 22 * scale, color: n > 0 ? c : hexA(t.colors.muted, 0.5)}}>
          {n} line{n === 1 ? '' : 's'}
        </span>
      </div>
    );
  };

  const Pile = (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        width: vertical ? '100%' : undefined,
        boxSizing: 'border-box',
        padding: `${14 * scale}px ${16 * scale}px ${18 * scale}px`,
        borderRadius: rad,
        border: `${1.5 * scale}px dashed ${hexA(t.colors.muted, 0.4)}`,
        background: hexA(t.colors.panelBorder, 0.18),
        display: 'flex',
        flexDirection: 'column',
        gap: 10 * scale,
      }}
    >
      {d.pileLabel ? (
        <span
          style={{
            fontFamily: t.fonts.mono,
            fontSize: 19 * scale,
            letterSpacing: 2 * scale,
            textTransform: 'uppercase',
            color: t.colors.muted,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {d.pileLabel}
        </span>
      ) : null}
      {lines.map((l, i) => {
        const p = progress(i);
        const right = isRight(i);
        const c = sem(l.color ?? (right ? 'green' : d.color ?? 'purple'));
        const filed = p > 0.9;
        return (
          <div
            key={i}
            style={{
              boxSizing: 'border-box',
              width: `${interpolate(p, [0, 1], [100, DOCK], clamp)}%`,
              alignSelf: p > 0.5 ? (right ? 'flex-end' : 'flex-start') : 'stretch',
              padding: `${10 * scale}px ${13 * scale}px`,
              borderRadius: 9 * scale * t.style.cornerRadius,
              background: p > 0 ? hexA(c, 0.14 * p) : hexA(t.colors.panel, 0.6),
              border: `${1.5 * scale}px solid ${p > 0 ? hexA(c, 0.3 + 0.45 * p) : hexA(t.colors.muted, 0.3)}`,
              [right ? 'borderRightWidth' : 'borderLeftWidth']: `${(1.5 + 4.5 * p) * scale}px`,
              [right ? 'borderRightColor' : 'borderLeftColor']: hexA(c, 0.35 + 0.6 * p),
              transform: `translateX(${interpolate(p, [0, 1], [0, right ? NUDGE : -NUDGE], clamp)}%)`,
              display: 'flex',
              alignItems: 'center',
              gap: 10 * scale,
              opacity: interpolate(frame, [base + 8 + i * 5, base + 22 + i * 5], [0, 1], clamp),
            }}
          >
            {right ? null : (
              <span style={{flexShrink: 0, fontFamily: t.fonts.mono, fontSize: 20 * scale, color: c, opacity: p}}>←</span>
            )}
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 22 : 24) * scale,
                color: filed ? c : hexA(t.colors.text, 0.8),
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                // only lean right once it is ACTUALLY filed — right-aligning an
                // unsorted line pre-announces its answer and kills the sort
                textAlign: p > 0.2 && right ? 'right' : 'left',
              }}
            >
              {l.text}
            </span>
            {l.sub ? (
              <span
                style={{
                  flexShrink: 0,
                  maxWidth: '34%',
                  fontFamily: t.fonts.body,
                  fontSize: 20 * scale,
                  color: t.colors.muted,
                  opacity: p,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {l.sub}
              </span>
            ) : null}
            {right ? (
              <span style={{flexShrink: 0, fontFamily: t.fonts.mono, fontSize: 20 * scale, color: c, opacity: p}}>→</span>
            ) : null}
          </div>
        );
      })}
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

      {vertical ? (
        // vertical: the two bins share one row above the pile, so the sideways
        // travel still points at the right owner without a 3-column squeeze
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * scale, opacity: appear, width: boxW}}>
          <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', gap: 14 * scale}}>
            <Bin right={false} />
            <Bin right />
          </div>
          {Pile}
        </div>
      ) : (
        <div style={{display: 'flex', alignItems: 'center', gap: 22 * scale, opacity: appear, width: boxW}}>
          <Bin right={false} />
          {Pile}
          <Bin right />
        </div>
      )}

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
