import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// FLAG_HARVEST — evidence that collects itself, and only where it matters. A command
// line carries the flag; the run's verdicts land one at a time; then artifacts drop in
// UNDER the failing rows while the passing rows visibly produce nothing. The asymmetry
// is the whole lesson, so the quiet rows must stay on screen saying "nothing kept" —
// a component that only showed the artifacts would argue that everything gets saved.
export const FlagHarvest: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.flagHarvest;
  if (!d) return <AbsoluteFill />;

  const tests = (d.tests ?? []).slice(0, 5);
  const artifacts = (d.artifacts ?? []).slice(0, 3);
  if (!tests.length || !artifacts.length) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'orange');
  const ok = sem('green');
  const bad = sem('red');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the command with its flag and every test row exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const verdictAt = (i: number) => (tests[i].atWord != null ? wordToFrame(tests[i].atWord!) : base + 30 + i * 20);
  const lastVerdict = Math.max(...tests.map((_, i) => verdictAt(i)));
  const harvest = d.harvestAtWord != null
    ? Math.max(wordToFrame(d.harvestAtWord), lastVerdict + 24)
    : lastVerdict + 50;

  const rad = 14 * scale * t.style.cornerRadius;
  const boxW = (vertical ? 980 : 1180) * scale;
  const failed = (i: number) => (tests[i].title ?? 'pass').toLowerCase() === 'fail';

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'orange'} /> : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 * scale, opacity: appear}}>
        {/* ── the command line, with the flag doing all the work ── */}
        <div
          style={{
            width: boxW,
            boxSizing: 'border-box',
            padding: `${13 * scale}px ${18 * scale}px`,
            borderRadius: rad,
            background: t.colors.bg,
            backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
            border: `${2 * scale}px solid ${hexA(accent, 0.6)}`,
            display: 'flex',
            alignItems: 'baseline',
            gap: 10 * scale,
            flexWrap: 'wrap',
          }}
        >
          <span style={{fontFamily: t.fonts.mono, fontSize: (vertical ? 22 : 25) * scale, color: t.colors.muted}}>
            {'$ '}
            {d.command ?? 'pytest'}
          </span>
          <span
            style={{
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 22 : 25) * scale,
              color: accent,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {d.flag}
          </span>
          <span
            style={{
              marginLeft: 'auto',
              flexShrink: 0,
              padding: `${4 * scale}px ${11 * scale}px`,
              borderRadius: 7 * scale * t.style.cornerRadius,
              background: hexA(accent, 0.18),
              fontFamily: t.fonts.body,
              fontSize: 19 * scale,
              color: accent,
              whiteSpace: 'nowrap',
            }}
          >
            zero code changed
          </span>
        </div>

        {/* ── the run: verdicts, and what each one leaves behind ── */}
        <div
          style={{
            width: boxW,
            boxSizing: 'border-box',
            padding: `${14 * scale}px ${16 * scale}px`,
            borderRadius: rad,
            background: hexA(t.colors.panelBorder, 0.2),
            border: `${1.5 * scale}px dashed ${hexA(t.colors.muted, 0.45)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 7 * scale,
          }}
        >
          {d.folder ? (
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: 18 * scale,
                letterSpacing: 1.5 * scale,
                textTransform: 'uppercase',
                color: t.colors.muted,
              }}
            >
              {d.folder}
            </span>
          ) : null}

          {tests.map((tst, i) => {
            const vp = interpolate(frame, [verdictAt(i), verdictAt(i) + 14], [0, 1], clamp);
            const isFail = failed(i);
            const c = isFail ? bad : ok;
            const hp = interpolate(frame, [harvest + i * 6, harvest + 18 + i * 6], [0, 1], clamp);
            return (
              <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 4 * scale}}>
                <div
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    padding: `${8 * scale}px ${13 * scale}px`,
                    borderRadius: 9 * scale * t.style.cornerRadius,
                    background: hexA(c, 0.12 * vp),
                    border: `${1.5 * scale}px solid ${hexA(vp > 0.2 ? c : t.colors.muted, 0.25 + 0.45 * vp)}`,
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
                      fontSize: (vertical ? 22 : 23) * scale,
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
                      padding: `${3 * scale}px ${11 * scale}px`,
                      borderRadius: 6 * scale * t.style.cornerRadius,
                      background: hexA(c, 0.2 * vp),
                      border: `${1.5 * scale}px solid ${hexA(c, 0.7 * vp)}`,
                      fontFamily: t.fonts.mono,
                      fontSize: 19 * scale,
                      color: c,
                      opacity: vp,
                    }}
                  >
                    {isFail ? 'FAILED' : 'PASSED'}
                  </span>
                </div>

                {/* the artifacts drop in UNDER the failures only */}
                {isFail
                  ? artifacts.map((a, j) => (
                      <div
                        key={j}
                        style={{
                          marginLeft: 26 * scale,
                          boxSizing: 'border-box',
                          padding: `${5 * scale}px ${12 * scale}px`,
                          borderRadius: 8 * scale * t.style.cornerRadius,
                          background: hexA(accent, 0.14),
                          border: `${1.5 * scale}px solid ${hexA(accent, 0.55)}`,
                          fontFamily: t.fonts.mono,
                          fontSize: (vertical ? 19 : 20) * scale,
                          color: accent,
                          opacity: interpolate(frame, [harvest + i * 6 + j * 7, harvest + 18 + i * 6 + j * 7], [0, 1], clamp),
                          transform: `translateY(${interpolate(hp, [0, 1], [-6, 0], clamp) * scale}px)`,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {'↳ '}
                        {a}
                      </div>
                    ))
                  : hp > 0.2 ? (
                      <span
                        style={{
                          marginLeft: 26 * scale,
                          fontFamily: t.fonts.body,
                          fontSize: 19 * scale,
                          color: hexA(t.colors.muted, 0.75),
                          opacity: hp,
                        }}
                      >
                        {'↳ '}
                        {d.quietNote ?? 'nothing kept'}
                      </span>
                    ) : null}
              </div>
            );
          })}
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
