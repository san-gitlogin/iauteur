import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// MAIL_ROOM — interception with a choice. Browser on the left, real server on the
// right, and a desk in the middle where every MATCHING request stops. Each request
// then takes one of three visibly different exits: answered here (fulfill), torn up
// (abort), or waved through (continue_). A request that does not match the pattern
// sails straight past the desk — which is the only way to SHOW that the pattern is
// doing work rather than just being printed above the picture.
export const MailRoom: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.mailRoom;
  if (!d) return <AbsoluteFill />;

  const reqs = (d.requests ?? []).slice(0, 4);
  if (!reqs.length) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'green');
  const bad = sem('red');
  const ok = sem('green');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — browser, desk, server and every waiting request exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const startOf = (i: number) => (reqs[i].atWord != null ? wordToFrame(reqs[i].atWord!) : base + 34 + i * 30);
  const fateOf = (i: number) => (reqs[i].title ?? 'continue').toLowerCase();
  // 0 → sitting at the browser · 1 → at the desk · 2 → resolved
  const phase = (i: number) => interpolate(frame, [startOf(i), startOf(i) + 18, startOf(i) + 34], [0, 1, 2], clamp);

  const fateColor = (f: string) => (f === 'fulfill' ? accent : f === 'abort' ? bad : f === 'pass' ? t.colors.muted : sem('blue'));
  const fateWord = (f: string) =>
    f === 'fulfill' ? 'answered here' : f === 'abort' ? 'torn up' : f === 'pass' ? 'no match' : 'waved through';

  const rad = 14 * scale * t.style.cornerRadius;
  const colW = (vertical ? 300 : 340) * scale;
  const rowH = (vertical ? 62 : 58) * scale;
  const gap = 10 * scale;

  const Post: React.FC<{label: string; sub?: string; c: string; dim?: boolean}> = ({label, sub, c, dim}) => (
    <div
      style={{
        boxSizing: 'border-box',
        width: '100%',
        padding: `${11 * scale}px ${14 * scale}px`,
        borderRadius: rad,
        background: hexA(c, dim ? 0.06 : 0.13),
        border: `${(dim ? 1.5 : 2) * scale}px solid ${hexA(c, dim ? 0.3 : 0.65)}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 3 * scale,
        minHeight: rowH,
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          fontFamily: t.fonts.mono,
          fontSize: (vertical ? 20 : 21) * scale,
          color: dim ? t.colors.muted : c,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      {sub ? (
        <span
          style={{
            fontFamily: t.fonts.body,
            fontSize: 18 * scale,
            color: t.colors.muted,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {sub}
        </span>
      ) : null}
    </div>
  );

  const Pillar: React.FC<{label: string; strong?: boolean}> = ({label, strong}) => (
    <div
      style={{
        boxSizing: 'border-box',
        width: '100%',
        padding: `${10 * scale}px ${12 * scale}px`,
        borderRadius: rad,
        background: strong ? hexA(accent, 0.14) : hexA(t.colors.panelBorder, 0.3),
        border: `${(strong ? 2.5 : 1.5) * scale}px solid ${strong ? hexA(accent, 0.7) : hexA(t.colors.muted, 0.32)}`,
        textAlign: 'center',
        fontFamily: t.fonts.mono,
        fontSize: 19 * scale,
        letterSpacing: 1.2 * scale,
        textTransform: 'uppercase',
        color: strong ? accent : t.colors.muted,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
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
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'green'} /> : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 * scale, opacity: appear}}>
        {/* the pattern the desk is watching for */}
        <div
          style={{
            padding: `${8 * scale}px ${16 * scale}px`,
            borderRadius: rad,
            background: t.colors.bg,
            backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
            border: `${2 * scale}px solid ${hexA(accent, 0.6)}`,
            display: 'flex',
            alignItems: 'baseline',
            gap: 8 * scale,
            maxWidth: (vertical ? 980 : 1180) * scale,
          }}
        >
          {/* MAX-fixture catch: `pattern` is REQUIRED but used to render only when
              deskLabel was absent, so the one string the desk is matching on could
              vanish entirely. Both always show now — the desk, and what it watches. */}
          <span
            style={{
              flexShrink: 0,
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 20 : 22) * scale,
              color: t.colors.muted,
            }}
          >
            {d.deskLabel ?? 'page.route'}
          </span>
          <span
            style={{
              minWidth: 0,
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 21 : 23) * scale,
              color: accent,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {`"${d.pattern}"`}
          </span>
        </div>

        <div style={{display: 'flex', gap: gap * 1.4, alignItems: 'flex-start'}}>
          {/* ── BROWSER: where letters start ── */}
          <div style={{width: colW, display: 'flex', flexDirection: 'column', gap: gap}}>
            <Pillar label={d.browserLabel ?? 'your page'} />
            {reqs.map((r, i) => {
              const p = phase(i);
              return (
                <div key={i} style={{opacity: p < 0.5 ? 1 : 0.18, transition: undefined}}>
                  <Post label={r.label ?? ''} c={sem(r.color ?? d.color ?? 'green')} dim={p >= 0.5} />
                </div>
              );
            })}
          </div>

          {/* ── THE DESK: everything matching stops here ── */}
          <div style={{width: colW, display: 'flex', flexDirection: 'column', gap: gap}}>
            <Pillar label="your desk" strong />
            {reqs.map((r, i) => {
              const p = phase(i);
              const f = fateOf(i);
              const atDesk = p >= 0.5 && p < 1.5 && f !== 'pass';
              const c = fateColor(f);
              return (
                <div key={i} style={{minHeight: rowH, display: 'flex', alignItems: 'center'}}>
                  {atDesk ? (
                    <div style={{width: '100%'}}>
                      <Post label={r.label ?? ''} sub={fateWord(f)} c={c} />
                    </div>
                  ) : p >= 1.5 && f !== 'pass' ? (
                    <div
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: `${9 * scale}px ${13 * scale}px`,
                        borderRadius: rad,
                        border: `${1.5 * scale}px ${f === 'abort' ? 'dashed' : 'solid'} ${hexA(c, 0.6)}`,
                        background: hexA(c, f === 'abort' ? 0.06 : 0.16),
                        fontFamily: t.fonts.body,
                        fontSize: 19 * scale,
                        color: c,
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {f === 'fulfill' ? `↩ ${r.sub ?? 'your reply'}` : f === 'abort' ? `✕ ${r.sub ?? 'never sent'}` : '→ passed on'}
                    </div>
                  ) : (
                    <span style={{width: '100%', textAlign: 'center', fontFamily: t.fonts.mono, fontSize: 18 * scale, color: hexA(t.colors.muted, 0.35)}}>
                      {f === 'pass' && p >= 0.5 ? '· sails past ·' : '·'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── THE REAL SERVER: only what you let through ever arrives ── */}
          <div style={{width: colW, display: 'flex', flexDirection: 'column', gap: gap}}>
            <Pillar label={d.serverLabel ?? 'the real server'} />
            {reqs.map((r, i) => {
              const p = phase(i);
              const f = fateOf(i);
              const arrived = p >= 1.5 && (f === 'continue' || f === 'pass');
              return (
                <div key={i} style={{minHeight: rowH, display: 'flex', alignItems: 'center'}}>
                  {arrived ? (
                    <div style={{width: '100%'}}>
                      <Post label={r.label ?? ''} sub={r.sub ?? 'arrived'} c={sem('blue')} />
                    </div>
                  ) : (
                    <span style={{width: '100%', textAlign: 'center', fontFamily: t.fonts.mono, fontSize: 18 * scale, color: hexA(t.colors.muted, 0.3)}}>
                      {p >= 1.5 ? '— never arrived —' : '·'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
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
