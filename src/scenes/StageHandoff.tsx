import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {ChromeFrame} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// STAGE_HANDOFF — one job, two transports. The scaffolding runs down a thin unlit rail with
// its cost stamped beside it; then a handoff marker fires and the rest of the job walks onto
// a lit stage inside real browser chrome. The proportions are the argument: almost nothing is
// on the stage, and the part that is, is the only part anybody is actually asking about.
export const StageHandoff: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.stageHandoff;
  if (!d) return <AbsoluteFill />;

  const steps = (d.steps ?? []).slice(0, 6);
  if (!steps.length || !d.testName) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'blue');
  const quiet = t.colors.muted;
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the test name, both rails and their labels exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const startOf = (i: number) =>
    steps[i].atWord != null ? wordToFrame(steps[i].atWord!) : base + 28 + i * 26;
  const isApi = (i: number) => (steps[i].title ?? 'ui').toLowerCase() === 'api';
  const apiSteps = steps.filter((_, i) => isApi(i));
  const uiSteps = steps.filter((_, i) => !isApi(i));
  const uiFirst = steps.findIndex((_, i) => !isApi(i));
  const handoffStart =
    d.handoffAtWord != null ? wordToFrame(d.handoffAtWord) : uiFirst >= 0 ? startOf(uiFirst) - 10 : base + 60;
  const verdictStart = d.verdictAtWord != null ? wordToFrame(d.verdictAtWord) : handoffStart + 90;

  const rad = 11 * scale * t.style.cornerRadius;
  const bodyW = (vertical ? 900 : 1340) * scale;
  const rowH = (vertical ? 60 : 56) * scale;

  const Row = (st: (typeof steps)[number], i: number, lit: boolean) => {
    const p = interpolate(frame, [startOf(i), startOf(i) + 14], [0, 1], clamp);
    const c = lit ? accent : quiet;
    return (
      <div
        key={i}
        style={{
          height: rowH,
          boxSizing: 'border-box',
          padding: `0 ${13 * scale}px`,
          borderRadius: rad,
          background: lit ? hexA(accent, 0.12 * p) : hexA(t.colors.panelBorder, 0.22 * p),
          border: `${1.5 * scale}px solid ${hexA(c, (lit ? 0.25 : 0.18) + (lit ? 0.5 : 0.28) * p)}`,
          borderLeft: `${4 * scale}px solid ${hexA(c, 0.25 + 0.6 * p)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12 * scale,
          overflow: 'hidden',
          opacity: 0.35 + 0.65 * p,
        }}
      >
        <span
          style={{
            fontFamily: t.fonts.mono,
            fontSize: (vertical ? 20 : 22) * scale,
            color: lit ? t.colors.text : quiet,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {st.label}
        </span>
        {st.sub ? (
          <span
            style={{
              flexShrink: 0,
              fontFamily: t.fonts.body,
              fontSize: 19 * scale,
              color: c,
              opacity: p,
              whiteSpace: 'nowrap',
            }}
          >
            {st.sub}
          </span>
        ) : null}
      </div>
    );
  };

  const railHead = (text: string, c: string) => (
    <span
      style={{
        fontFamily: t.fonts.mono,
        fontSize: 18 * scale,
        letterSpacing: 1.4 * scale,
        textTransform: 'uppercase',
        color: c,
      }}
    >
      {text}
    </span>
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
        <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'blue'} />
      ) : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 * scale, opacity: appear}}>
        <div
          style={{
            padding: `${6 * scale}px ${16 * scale}px`,
            borderRadius: rad,
            background: t.colors.bg,
            backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
            border: `${1.5 * scale}px solid ${hexA(accent, 0.5)}`,
            fontFamily: t.fonts.mono,
            fontSize: 21 * scale,
            color: accent,
            whiteSpace: 'nowrap',
          }}
        >
          {d.testName}
        </div>

        {/* ── the unlit rail: scenery, done by phone ── */}
        {apiSteps.length ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: 6 * scale, width: bodyW, marginTop: 4 * scale}}>
            {railHead(d.railLabel ?? 'setup · by API', quiet)}
            {steps.map((st, i) => (isApi(i) ? Row(st, i, false) : null))}
          </div>
        ) : null}

        {/* ── the handoff ── */}
        {d.handoffLabel ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12 * scale,
              width: bodyW,
              opacity: interpolate(frame, [handoffStart, handoffStart + 12], [0, 1], clamp),
            }}
          >
            <div style={{flex: 1, height: 1.5 * scale, background: hexA(accent, 0.4)}} />
            <span
              style={{
                fontFamily: t.fonts.body,
                fontSize: 21 * scale,
                color: accent,
                whiteSpace: 'nowrap',
              }}
            >
              {d.handoffLabel}
            </span>
            <div style={{flex: 1, height: 1.5 * scale, background: hexA(accent, 0.4)}} />
          </div>
        ) : null}

        {/* ── the lit stage: the only part anybody is asking about ── */}
        {uiSteps.length ? (
          <ChromeFrame
            variant="browser"
            url={d.stageLabel ?? 'the test · by UI'}
            accent={(d.color as never) ?? 'blue'}
            width={bodyW}
            bodyStyle={{display: 'flex', flexDirection: 'column', gap: 6 * scale, padding: 13 * scale}}
          >
            {steps.map((st, i) => (isApi(i) ? null : Row(st, i, true)))}
          </ChromeFrame>
        ) : null}

        {d.verdict ? (
          <div
            style={{
              marginTop: 8 * scale,
              padding: `${6 * scale}px ${18 * scale}px`,
              borderRadius: rad,
              background: hexA(accent, 0.2),
              border: `${1.5 * scale}px solid ${hexA(accent, 0.65)}`,
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 23 : 25) * scale,
              color: accent,
              whiteSpace: 'nowrap',
              opacity: interpolate(frame, [verdictStart, verdictStart + 12], [0, 1], clamp),
            }}
          >
            {d.verdict}
          </div>
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
