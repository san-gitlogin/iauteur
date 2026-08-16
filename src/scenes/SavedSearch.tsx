import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {ChromeFrame} from '../kit';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// SAVED_SEARCH — laziness, drawn. A query card sits beside a real page whose
// elements are ALL untouched, and its chip says so. Only when the trigger fires
// does a scan band sweep the page and one element light up. The first half of the
// scene is the lesson: writing the query looked at nothing.
// Shares ChromeFrame with BROWSER_STEP so a page is always the same object.
export const SavedSearch: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.savedSearch;
  if (!d) return <AbsoluteFill />;

  const els = (d.elements ?? []).slice(0, 5);
  if (!els.length) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'blue');
  const ok = sem('green');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the query card, its chip and the whole page exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const run = d.runAtWord != null ? Math.max(wordToFrame(d.runAtWord), base + 30) : base + 110;
  const scanP = interpolate(frame, [run, run + 26], [0, 1], clamp);
  const ran = scanP > 0.98;
  const match = Math.max(0, Math.min(els.length - 1, Math.round(d.matchIndex ?? 0)));

  const rad = 14 * scale * t.style.cornerRadius;
  const paneW = (vertical ? 940 : 700) * scale;

  const chipColor = ran ? ok : t.colors.muted;
  const chipText = ran ? d.ranLabel ?? 'run · 1 found' : d.savedLabel ?? 'saved, not run';

  const QueryCard = (
    <div
      style={{
        width: paneW,
        boxSizing: 'border-box',
        padding: `${18 * scale}px ${20 * scale}px`,
        borderRadius: rad,
        background: t.colors.bg,
        backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
        border: `${2 * scale}px solid ${ran ? hexA(ok, 0.7) : t.colors.panelBorder}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12 * scale,
      }}
    >
      <span
        style={{
          fontFamily: t.fonts.mono,
          fontSize: (vertical ? 24 : 25) * scale,
          color: accent,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {d.query}
      </span>
      <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale, flexWrap: 'nowrap'}}>
        <span
          style={{
            flexShrink: 0,
            padding: `${5 * scale}px ${13 * scale}px`,
            borderRadius: 8 * scale * t.style.cornerRadius,
            background: hexA(chipColor, 0.15),
            border: `${1.5 * scale}px ${ran ? 'solid' : 'dashed'} ${hexA(chipColor, 0.6)}`,
            fontFamily: t.fonts.body,
            fontSize: 21 * scale,
            color: chipColor,
            whiteSpace: 'nowrap',
          }}
        >
          {chipText}
        </span>
        {d.trigger ? (
          <span
            style={{
              minWidth: 0,
              fontFamily: t.fonts.mono,
              fontSize: 21 * scale,
              color: ran ? ok : hexA(t.colors.muted, 0.55),
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {d.trigger}
          </span>
        ) : null}
      </div>
    </div>
  );

  const Page = (
    <div style={{width: paneW, position: 'relative'}}>
      <ChromeFrame variant="browser" title={d.pageTitle ?? 'the page'}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10 * scale, padding: `${6 * scale}px 0`}}>
          {els.map((e, i) => {
            const isMatch = i === match;
            // an element only lights once the scan band has PASSED it
            const passed = scanP >= (i + 1) / (els.length + 0.5);
            const lit = isMatch && passed;
            const kind = (e.title ?? 'text').toLowerCase();
            const c = lit ? sem(e.color ?? d.color ?? 'blue') : t.colors.muted;
            return (
              <div
                key={i}
                style={{
                  boxSizing: 'border-box',
                  width: kind === 'button' ? '46%' : '100%',
                  padding: `${10 * scale}px ${14 * scale}px`,
                  borderRadius: (kind === 'button' ? 9 : 7) * scale * t.style.cornerRadius,
                  background: lit ? hexA(c, 0.2) : kind === 'text' ? 'transparent' : hexA(t.colors.panelBorder, 0.3),
                  border: kind === 'text' ? 'none' : `${(lit ? 2.5 : 1.5) * scale}px solid ${hexA(c, lit ? 0.85 : 0.32)}`,
                  boxShadow: lit && t.style.glow > 0 ? `0 0 ${20 * scale * t.style.glow}px ${hexA(c, 0.4)}` : undefined,
                  fontFamily: kind === 'text' ? t.fonts.display : t.fonts.body,
                  fontWeight: kind === 'text' ? t.style.displayWeight : undefined,
                  fontSize: (kind === 'text' ? 27 : 23) * scale,
                  color: lit ? c : kind === 'text' ? t.colors.text : hexA(t.colors.muted, 0.9),
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  opacity: interpolate(frame, [base + 8 + i * 4, base + 22 + i * 4], [0, 1], clamp),
                }}
              >
                {e.label}
              </div>
            );
          })}
        </div>
      </ChromeFrame>
      {/* the scan band — only ever exists while the query is actually running */}
      {scanP > 0 && scanP < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${interpolate(scanP, [0, 1], [6, 94], clamp)}%`,
            height: 3 * scale,
            background: accent,
            boxShadow: t.style.glow > 0 ? `0 0 ${18 * scale * t.style.glow}px ${hexA(accent, 0.8)}` : undefined,
          }}
        />
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
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}

      <div
        style={{
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: (vertical ? 18 : 34) * scale,
          opacity: appear,
        }}
      >
        {QueryCard}
        <span
          style={{
            flexShrink: 0,
            fontFamily: t.fonts.mono,
            fontSize: 26 * scale,
            color: ran ? ok : hexA(t.colors.muted, 0.5),
          }}
        >
          {vertical ? '↓' : '→'}
        </span>
        {Page}
      </div>

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
