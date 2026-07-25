import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// PROMPT_HANDOFF — a question leaves the app, goes to whichever assistant you already
// use, and the answer travels back and is pasted in. The ROUND TRIP is the content, and
// the row of named assistants carries the real argument: nothing here is tied to one
// provider. Not API_REQUEST_RESPONSE (a wire protocol with status codes) and not
// CHAT_MOCKUP (a conversation) — no one is talking, a document is being carried.
//
// BASE ≤38f: the app, the assistant row and both paths are on screen immediately. The
// scene anchor times only the RETURN leg, which is the payoff.
export const PromptHandoff: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.promptHandoff;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'blue');
  const back = sem('green');
  const assistants = (d.assistants ?? []).slice(0, 5);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const returnAt = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);
  const outIn = ease(base + 4, 18);
  const backIn = ease(returnAt, 20);

  const radius = 14 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  // Sized FROM the budgets: appLabel 16 glyphs and assistant labels 14 glyphs at mono.
  const appW = (vertical ? 320 : 400) * scale;
  const appH = (vertical ? 98 : 120) * scale;
  // Sized FROM the label budget, not by eye: a 20-glyph path label at 18px mono is
  // ~216px, and a leg shorter than its own label lets the text spill over the boxes
  // at both ends. This is the Fit-guard-vs-Budget-guard conflict that has bitten
  // every component in this set.
  // Both lanes run HORIZONTALLY in either aspect (in vertical the app sits above the
  // assistants and the lanes bridge them), so the length is bounded by frame width in
  // both — 260px comfortably clears a 20-glyph label at 18px mono.
  const legLen = (vertical ? 280 : 340) * scale;

  // one travelling document per lane — a small page that slides along its path.
  // Lanes are horizontal in BOTH aspects, so this is always an x-axis journey; the
  // earlier vertical branch pinned the page to the lane's midpoint instead of moving it.
  const courier = (progress: number, tone: string) => (
    <div
      style={{
        position: 'absolute',
        left: `${progress * 100}%`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 22 * scale,
        height: 28 * scale,
        borderRadius: 4 * scale * t.style.cornerRadius,
        background: hexA(tone, 0.9),
        opacity: progress > 0.01 && progress < 0.99 ? 1 : 0,
        boxShadow: glow > 0 ? `0 0 ${16 * scale * glow}px ${hexA(tone, 0.5 * glow)}` : undefined,
      }}
    >
      {/* two ruled lines so it reads as a page, not a dot */}
      <div style={{position: 'absolute', left: 4 * scale, right: 4 * scale, top: 8 * scale, height: 2 * scale, background: hexA(t.colors.bg, 0.55)}} />
      <div style={{position: 'absolute', left: 4 * scale, right: 8 * scale, top: 15 * scale, height: 2 * scale, background: hexA(t.colors.bg, 0.35)}} />
    </div>
  );

  // an arrowhead pointing along the lane's direction, drawn from borders so it scales
  const head = (tone: string, reverse: boolean, show: number) => (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        [reverse ? 'left' : 'right']: -2 * scale,
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: `${7 * scale}px solid transparent`,
        borderBottom: `${7 * scale}px solid transparent`,
        [reverse ? 'borderRight' : 'borderLeft']: `${10 * scale}px solid ${tone}`,
        opacity: show,
      }}
    />
  );

  // ONE LANE of the loop: a label riding above its line, the line filling in its own
  // direction, an arrowhead at the end and a page travelling along it.
  const lane = (label: string, tone: string, fill: number, reverse: boolean) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 * scale, flex: 'none'}}>
      <span style={{fontFamily: t.fonts.mono, fontSize: 18 * scale, color: hexA(tone, 0.95), whiteSpace: 'nowrap'}}>
        {label}
      </span>
      <div
        style={{
          position: 'relative',
          width: legLen,
          height: 4 * scale,
          background: hexA(t.colors.panelBorder, 0.7),
          borderRadius: 4 * scale,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: tone,
            borderRadius: 4 * scale,
            transformOrigin: reverse ? 'right' : 'left',
            transform: `scaleX(${fill})`,
          }}
        />
        {head(tone, reverse, fill)}
        {courier(reverse ? 1 - fill : fill, tone)}
      </div>
    </div>
  );

  const appBox = (label: string, strong: boolean) => (
    <div
      style={{
        width: appW,
        minHeight: appH,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${12 * scale}px ${18 * scale}px`,
        background: strong ? hexA(accent, 0.12) : t.colors.panel,
        border: `2px solid ${hexA(strong ? accent : t.colors.panelBorder, 0.6)}`,
        borderRadius: radius,
        boxShadow: strong && glow > 0 ? `0 0 ${28 * scale * glow}px ${hexA(accent, 0.22 * glow)}` : undefined,
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          fontFamily: t.fonts.mono,
          fontSize: 30 * scale,
          color: t.colors.text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}
      >
        {label}
      </span>
    </div>
  );

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={(d.color as SemColor) ?? 'blue'} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: (vertical ? 150 : 100) * scale,
          paddingLeft: 50 * scale,
          paddingRight: 50 * scale,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: (vertical ? 22 : 30) * scale, opacity: baseIn}}>
          {/* THE ROUND TRIP. One app, one set of assistants, two lanes between them —
              out along the top, back along the bottom. Drawing the app box twice (once
              at each end) read as two different apps in a pipeline, which is the
              opposite of the point: the answer comes back to where it started. */}
          <div
            style={{
              display: 'flex',
              flexDirection: vertical ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: (vertical ? 16 : 24) * scale,
            }}
          >
            {appBox(d.appLabel ?? '', true)}

            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: (vertical ? 14 : 26) * scale, flex: 'none'}}>
              {lane(d.outLabel ?? '', accent, outIn, false)}
              {lane(d.backLabel ?? '', back, backIn, true)}
            </div>

            {/* the assistants — a SET, because the point is that any of them will do */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10 * scale,
                padding: `${16 * scale}px ${20 * scale}px`,
                border: `2px dashed ${hexA(t.colors.panelBorder, 0.85)}`,
                borderRadius: radius,
                flex: 'none',
              }}
            >
              {assistants.map((a, i) => {
                const lit = ease(wordToFrame(a.atWord ?? 1), 12);
                return (
                  <span
                    key={i}
                    style={{
                      fontFamily: t.fonts.mono,
                      fontSize: 23 * scale,
                      color: t.colors.text,
                      padding: `${7 * scale}px ${16 * scale}px`,
                      minWidth: (vertical ? 230 : 240) * scale,
                      textAlign: 'center',
                      background: hexA(t.colors.panel, 0.9),
                      border: `1.5px solid ${hexA(t.colors.panelBorder, 0.4 + 0.5 * lit)}`,
                      borderRadius: 999,
                      opacity: 0.45 + 0.55 * lit,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {a.label}
                  </span>
                );
              })}
            </div>
          </div>

          {d.footNote ? (
            <span
              style={{
                fontFamily: t.fonts.body,
                fontSize: 24 * scale,
                color: hexA(t.colors.muted, 0.95),
                textAlign: 'center',
                opacity: backIn,
                transform: `translateY(${(1 - backIn) * 8 * scale}px)`,
                maxWidth: (vertical ? 880 : 1400) * scale,
              }}
            >
              {d.footNote}
            </span>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
