import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {ChromeFrame} from '../kit';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// CROWD_MATCH — one query, MANY matches. The plural cousin of SAVED_SEARCH: where
// that one lights a single element, this lights the whole set at once and puts a
// live count on it. Group readouts (count(), all_inner_texts(), all()) then land
// one at a time beside the crowd, each carrying the value it actually returns.
// `pickIndex` singles one member out afterwards (first/last/nth) and `strict`
// stamps the set as illegal to ACT on — which is episode 4's error, drawn.
export const CrowdMatch: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.crowdMatch;
  if (!d) return <AbsoluteFill />;

  const members = (d.members ?? []).slice(0, 6);
  if (!members.length) return <AbsoluteFill />;
  const readouts = (d.readouts ?? []).slice(0, 3);
  const accent = sem(d.color ?? 'orange');
  const bad = sem('red');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the query, every list row and the count badge exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  // the whole set lights TOGETHER — that is the difference from a single search
  const resolve = interpolate(frame, [base + 10, base + 30], [0, 1], clamp);

  const pick = d.pickIndex != null && d.pickIndex >= 0 && d.pickIndex < members.length
    ? Math.round(d.pickIndex) : -1;
  const pickAt = d.pickAtWord != null ? wordToFrame(d.pickAtWord) : Number.POSITIVE_INFINITY;
  const picked = pick >= 0 && frame >= pickAt;

  const rad = 14 * scale * t.style.cornerRadius;
  const paneW = (vertical ? 940 : 760) * scale;

  const QueryBar = (
    <div
      style={{
        width: paneW,
        boxSizing: 'border-box',
        padding: `${14 * scale}px ${18 * scale}px`,
        borderRadius: rad,
        background: t.colors.bg,
        backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
        border: `${2 * scale}px solid ${hexA(accent, 0.3 + 0.45 * resolve)}`,
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
          fontSize: (vertical ? 23 : 24) * scale,
          color: accent,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {d.query}
      </span>
      <span
        style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 7 * scale,
          padding: `${5 * scale}px ${13 * scale}px`,
          borderRadius: 8 * scale * t.style.cornerRadius,
          background: hexA(accent, 0.18 * resolve),
          border: `${1.5 * scale}px solid ${hexA(accent, 0.65 * resolve)}`,
          opacity: resolve,
        }}
      >
        <span style={{fontFamily: t.fonts.mono, fontSize: 26 * scale, color: accent, fontWeight: 700}}>
          {members.length}
        </span>
        <span style={{fontFamily: t.fonts.body, fontSize: 19 * scale, color: t.colors.muted}}>
          {d.countLabel ?? 'matches'}
        </span>
      </span>
    </div>
  );

  const List = (
    <div style={{width: paneW}}>
      <ChromeFrame variant="browser" title={d.pageTitle ?? 'the page'}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8 * scale, padding: `${4 * scale}px 0`}}>
          {members.map((m, i) => {
            // every member lights at the same moment; the stagger is tiny and only
            // exists so the eye reads "a set arriving", not "a queue"
            const on = interpolate(frame, [base + 10 + i * 2, base + 30 + i * 2], [0, 1], clamp);
            const dimmed = picked && i !== pick;
            const c = sem(m.color ?? d.color ?? 'orange');
            return (
              <div
                key={i}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  padding: `${9 * scale}px ${13 * scale}px`,
                  borderRadius: 8 * scale * t.style.cornerRadius,
                  background: hexA(c, (dimmed ? 0.05 : 0.16) * on),
                  border: `${(picked && i === pick ? 2.5 : 1.5) * scale}px solid ${hexA(c, (dimmed ? 0.2 : 0.7) * on)}`,
                  boxShadow: picked && i === pick && t.style.glow > 0
                    ? `0 0 ${20 * scale * t.style.glow}px ${hexA(c, 0.45)}` : undefined,
                  opacity: dimmed ? 0.45 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10 * scale,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 26 * scale,
                    fontFamily: t.fonts.mono,
                    fontSize: 19 * scale,
                    color: hexA(t.colors.muted, 0.85),
                    textAlign: 'right',
                  }}
                >
                  {i}
                </span>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontFamily: t.fonts.body,
                    fontSize: (vertical ? 24 : 25) * scale,
                    color: dimmed ? t.colors.muted : t.colors.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {m.label}
                </span>
                {picked && i === pick && d.pickLabel ? (
                  <span
                    style={{
                      flexShrink: 0,
                      padding: `${3 * scale}px ${10 * scale}px`,
                      borderRadius: 7 * scale * t.style.cornerRadius,
                      background: hexA(c, 0.22),
                      fontFamily: t.fonts.mono,
                      fontSize: 20 * scale,
                      color: c,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {d.pickLabel}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </ChromeFrame>
      {d.strict ? (
        <div
          style={{
            marginTop: 10 * scale,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9 * scale,
            padding: `${6 * scale}px ${14 * scale}px`,
            borderRadius: 8 * scale * t.style.cornerRadius,
            background: hexA(bad, 0.14),
            border: `${1.5 * scale}px solid ${hexA(bad, 0.6)}`,
            opacity: resolve,
          }}
        >
          <span style={{fontFamily: t.fonts.mono, fontSize: 21 * scale, color: bad}}>✕</span>
          <span style={{fontFamily: t.fonts.body, fontSize: 21 * scale, color: bad, whiteSpace: 'nowrap'}}>
            {d.strictNote ?? 'cannot act on a set'}
          </span>
        </div>
      ) : null}
    </div>
  );

  const Readouts = !readouts.length ? null : (
    <div
      style={{
        width: (vertical ? 940 : 620) * scale,
        alignSelf: vertical ? 'center' : 'flex-start',
        boxSizing: 'border-box',
        padding: `${16 * scale}px ${18 * scale}px`,
        borderRadius: rad,
        background: t.colors.panel,
        border: `${1.5 * scale}px solid ${t.colors.panelBorder}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12 * scale,
      }}
    >
      {readouts.map((r, i) => {
        const st = r.atWord != null ? wordToFrame(r.atWord) : base + 50 + i * 34;
        const p = interpolate(frame, [st, st + 14], [0, 1], clamp);
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 4 * scale, opacity: p}}>
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 22 : 23) * scale,
                color: accent,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {r.label}
            </span>
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 22 : 23) * scale,
                color: t.colors.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {'→ '}
              {r.text}
            </span>
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
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'orange'} /> : null}

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
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 * scale}}>
          {QueryBar}
          {List}
        </div>
        {Readouts}
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
