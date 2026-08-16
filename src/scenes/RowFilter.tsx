import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {ChromeFrame} from '../kit';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ROW_FILTER — narrow, then act INSIDE. Every row starts matched and carries the
// same child control, so the viewer can see there is no way to tell the controls
// apart. The condition lands, the failures drop away, and the ONE survivor keeps
// its control — which is then pressed while the identical buttons on the dropped
// rows stay untouched. The containment is the whole lesson (the table-row recipe),
// so it has to be one continuous picture rather than two scenes.
export const RowFilter: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.rowFilter;
  if (!d) return <AbsoluteFill />;

  const rows = (d.rows ?? []).slice(0, 6);
  if (!rows.length) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'orange');
  const ok = sem('green');
  const hasHeadline = Boolean(scene.data.headline);

  const keepIdx = Math.max(0, rows.findIndex((r) => (r.title ?? '').toLowerCase() === 'keep'));

  // BASE ≤38 — every row and every control exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const filterAt = d.filterAtWord != null ? Math.max(wordToFrame(d.filterAtWord), base + 24) : base + 90;
  const actAt = d.actAtWord != null ? Math.max(wordToFrame(d.actAtWord), filterAt + 30) : filterAt + 80;

  // rows drop one after another so the eye follows the narrowing rather than blinking
  const dropP = (i: number) => {
    if (i === keepIdx) return 0;
    const order = i < keepIdx ? i : i - 1;
    const st = filterAt + order * 8;
    return interpolate(frame, [st, st + 18], [0, 1], clamp);
  };
  const pressP = interpolate(frame, [actAt, actAt + 14], [0, 1], clamp);
  const pressed = pressP > 0.5;

  const rad = 14 * scale * t.style.cornerRadius;
  const paneW = (vertical ? 960 : 1120) * scale;

  const Chain = (
    <div
      style={{
        width: paneW,
        boxSizing: 'border-box',
        padding: `${13 * scale}px ${18 * scale}px`,
        borderRadius: rad,
        background: t.colors.bg,
        backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
        border: `${2 * scale}px solid ${pressed ? hexA(ok, 0.7) : t.colors.panelBorder}`,
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: 4 * scale,
        // MAX-fixture catch: three ceiling-length segments cannot share one line, and
        // this chain IS the payoff — `rows.filter(...).click()` read end to end. So it
        // WRAPS. Truncating the sentence the lesson is teaching is never acceptable.
        flexWrap: 'wrap',
      }}
    >
      {[
        {txt: d.baseLabel ?? 'rows', on: 1, c: t.colors.text},
        {txt: d.condition, on: interpolate(frame, [filterAt, filterAt + 12], [0, 1], clamp), c: accent},
        {txt: d.actLabel, on: pressP, c: ok},
      ]
        .filter((seg) => seg.txt)
        .map((seg, i) => (
          <span
            key={i}
            style={{
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 22 : 25) * scale,
              color: seg.c,
              opacity: 0.25 + 0.75 * seg.on,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxWidth: '100%',
            }}
          >
            {seg.txt}
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
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'orange'} /> : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * scale, opacity: appear}}>
        {Chain}

        <div style={{width: paneW}}>
          <ChromeFrame variant="browser" title={d.pageTitle ?? 'the page'}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 9 * scale, padding: `${4 * scale}px 0`}}>
              {rows.map((r, i) => {
                const drop = dropP(i);
                const survivor = i === keepIdx;
                const c = sem(r.color ?? d.color ?? 'orange');
                const ctrl = r.sub ?? d.control ?? 'Delete';
                const ctrlOn = survivor && pressed;
                return (
                  <div
                    key={i}
                    style={{
                      boxSizing: 'border-box',
                      padding: `${10 * scale}px ${13 * scale}px`,
                      borderRadius: 9 * scale * t.style.cornerRadius,
                      // the survivor GAINS emphasis as the others lose it, so the
                      // narrowing reads even on a still frame
                      background: hexA(survivor ? c : t.colors.panelBorder, survivor ? 0.1 + 0.12 * (1 - drop) + 0.1 * pressP : 0.3 * (1 - drop)),
                      border: `${(survivor && frame >= filterAt ? 2.5 : 1.5) * scale}px solid ${
                        survivor ? hexA(c, frame >= filterAt ? 0.8 : 0.4) : hexA(t.colors.muted, 0.35 * (1 - drop))
                      }`,
                      boxShadow: survivor && frame >= filterAt && t.style.glow > 0
                        ? `0 0 ${20 * scale * t.style.glow}px ${hexA(c, 0.35)}` : undefined,
                      opacity: 1 - 0.88 * drop,
                      // MAX-fixture catch: a full-width row translated -7% pushes its
                      // text past the frame's left edge and reads as clipped, not as
                      // dropped. Shrink from the left instead and pin the right edge —
                      // the row pulls AWAY without ever leaving its container.
                      width: `${100 - 9 * drop}%`,
                      marginLeft: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12 * scale,
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontFamily: t.fonts.body,
                        fontSize: (vertical ? 24 : 26) * scale,
                        color: survivor && frame >= filterAt ? c : t.colors.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.label}
                    </span>
                    {/* the identical child control on EVERY row — that is why you
                        cannot just target the button, and why filter exists */}
                    <span
                      style={{
                        flexShrink: 0,
                        padding: `${6 * scale}px ${14 * scale}px`,
                        borderRadius: 8 * scale * t.style.cornerRadius,
                        background: ctrlOn ? hexA(ok, 0.28) : hexA(t.colors.panelBorder, 0.55),
                        border: `${(ctrlOn ? 2.5 : 1.5) * scale}px solid ${ctrlOn ? ok : hexA(t.colors.muted, 0.45)}`,
                        boxShadow: ctrlOn && t.style.glow > 0 ? `0 0 ${18 * scale * t.style.glow}px ${hexA(ok, 0.5)}` : undefined,
                        transform: `scale(${ctrlOn ? interpolate(pressP, [0.5, 0.72, 1], [1, 0.9, 1], clamp) : 1})`,
                        fontFamily: t.fonts.body,
                        fontSize: (vertical ? 21 : 22) * scale,
                        color: ctrlOn ? ok : t.colors.muted,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ctrl}
                    </span>
                  </div>
                );
              })}
            </div>
          </ChromeFrame>
        </div>
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
