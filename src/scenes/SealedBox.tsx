import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// SEALED_BOX — a shell that looks like it should block access, and mostly does not. Probes wait
// in a column on the left; each one travels toward the wall in turn. The ones that pierce cross
// the wall and land on the sealed contents, lighting them; the exception hits the wall and stops
// dead with a stamp. The lesson is the ONE that fails, so the rest have to visibly succeed first.
export const SealedBox: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.sealedBox;
  if (!d) return <AbsoluteFill />;

  const probes = (d.probes ?? []).slice(0, 5);
  if (!probes.length || !d.boxLabel || !d.contents) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'green');
  const bad = sem('red');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the box, its wall, the sealed contents and every waiting probe exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const startOf = (i: number) => (probes[i].atWord != null ? wordToFrame(probes[i].atWord!) : base + 30 + i * 30);
  const pierces = (i: number) => (probes[i].title ?? 'through').toLowerCase() === 'through';
  const verdictStart =
    d.verdictAtWord != null ? wordToFrame(d.verdictAtWord) : startOf(probes.length - 1) + 40;

  // the contents light once ANY piercing probe has landed
  const landed = probes.some((_, i) => pierces(i) && frame >= startOf(i) + 16);

  const rad = 13 * scale * t.style.cornerRadius;
  const probeW = (vertical ? 400 : 520) * scale;
  const boxW = (vertical ? 460 : 620) * scale;
  const rowH = (vertical ? 58 : 54) * scale;
  const gap = 8 * scale;
  const boxH = probes.length * (rowH + gap) - gap;

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

      <div style={{display: 'flex', gap: 20 * scale, alignItems: 'center', opacity: appear}}>
        {/* ── the probes, waiting their turn ── */}
        <div style={{width: probeW, display: 'flex', flexDirection: 'column', gap}}>
          {probes.map((pr, i) => {
            const p = interpolate(frame, [startOf(i), startOf(i) + 14], [0, 1], clamp);
            const ok = pierces(i);
            const c = ok ? accent : bad;
            return (
              <div
                key={i}
                style={{
                  position: 'relative',
                  height: rowH,
                  boxSizing: 'border-box',
                  padding: `0 ${13 * scale}px`,
                  borderRadius: rad,
                  background: hexA(c, 0.1 * p),
                  border: `${1.5 * scale}px solid ${hexA(ok ? c : bad, 0.22 + 0.55 * p)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  overflow: 'visible',
                  // a blocked probe recoils; a piercing one nudges forward
                  transform: `translateX(${(ok ? 8 : -7) * p * scale}px)`,
                }}
              >
                <span
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: (vertical ? 20 : 21) * scale,
                    color: p > 0.4 ? c : t.colors.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {pr.label}
                </span>
                {pr.sub ? (
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
                    {pr.sub}
                  </span>
                ) : null}

                {/* the probe itself, crossing the gap toward the wall — or stopping at it */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '100%',
                    marginTop: -5 * scale,
                    width: 11 * scale,
                    height: 11 * scale,
                    borderRadius: '50%',
                    background: c,
                    boxShadow: `0 0 ${13 * scale}px ${hexA(c, 0.85)}`,
                    transform: `translateX(${interpolate(frame, [startOf(i), startOf(i) + 12], [0, ok ? 20 * scale : 14 * scale], clamp)}px)`,
                    opacity: interpolate(
                      frame,
                      [startOf(i), startOf(i) + 3, startOf(i) + 12, startOf(i) + 18],
                      [0, 1, 1, ok ? 0 : 0.5],
                      clamp,
                    ),
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* ── the sealed box ── */}
        <div style={{position: 'relative', width: boxW, minHeight: boxH}}>
          <div
            style={{
              boxSizing: 'border-box',
              padding: `${16 * scale}px`,
              borderRadius: rad,
              // the wall is dashed on purpose — it LOOKS like a boundary, and mostly is not one
              border: `${2.5 * scale}px dashed ${hexA(t.colors.muted, 0.65)}`,
              background: hexA(t.colors.panelBorder, 0.2),
              display: 'flex',
              flexDirection: 'column',
              gap: 10 * scale,
            }}
          >
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: 20 * scale,
                color: t.colors.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {d.boxLabel}
            </span>
            {d.wallLabel ? (
              <span
                style={{
                  alignSelf: 'flex-start',
                  padding: `${3 * scale}px ${10 * scale}px`,
                  borderRadius: 6 * scale * t.style.cornerRadius,
                  background: hexA(t.colors.muted, 0.16),
                  fontFamily: t.fonts.mono,
                  fontSize: 18 * scale,
                  color: t.colors.muted,
                  whiteSpace: 'nowrap',
                }}
              >
                {d.wallLabel}
              </span>
            ) : null}

            {/* what is sealed inside */}
            <div
              style={{
                marginTop: 4 * scale,
                padding: `${13 * scale}px ${15 * scale}px`,
                borderRadius: rad,
                background: landed ? hexA(accent, 0.16) : hexA(t.colors.panelBorder, 0.3),
                border: `${2 * scale}px solid ${hexA(landed ? accent : t.colors.muted, landed ? 0.75 : 0.3)}`,
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 22 : 24) * scale,
                color: landed ? accent : t.colors.muted,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {d.contents}
            </div>

            {d.blockedNote ? (
              <span
                style={{
                  fontFamily: t.fonts.body,
                  fontSize: 18 * scale,
                  color: bad,
                  opacity: probes.some((_, i) => !pierces(i) && frame >= startOf(i) + 10) ? 1 : 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {d.blockedNote}
              </span>
            ) : null}
          </div>

          {d.verdict ? (
            <div
              style={{
                marginTop: 12 * scale,
                padding: `${7 * scale}px ${18 * scale}px`,
                borderRadius: rad,
                background: hexA(accent, 0.2),
                border: `${1.5 * scale}px solid ${hexA(accent, 0.65)}`,
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 22 : 24) * scale,
                color: accent,
                whiteSpace: 'nowrap',
                textAlign: 'center',
                opacity: interpolate(frame, [verdictStart, verdictStart + 12], [0, 1], clamp),
              }}
            >
              {d.verdict}
            </div>
          ) : null}
        </div>
      </div>

      {d.caption ? (
        <div
          style={{
            marginTop: 26 * scale,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 24 : 26) * scale,
            color: t.colors.muted,
            opacity: appear,
            textAlign: 'center',
            maxWidth: (vertical ? 940 : 1400) * scale,
          }}
        >
          {d.caption}
        </div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
