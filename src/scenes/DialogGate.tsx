import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {ChromeFrame} from '../kit';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// DIALOG_GATE — a modal that is NOT part of the document. It knocks, the page behind
// freezes (desaturated and unreachable), and no locator can touch it: the dialog is
// drawn as browser chrome, above and outside the page surface. What happens next is
// decided entirely by a handler registered BEFORE the trigger, and the page BEHIND is
// the evidence — with no handler the confirm is auto-dismissed, which is a Cancel
// nobody asked for and the target row simply survives.
// Deliberately NOT OVERLAY_BLOCK: that draws an obstacle that lifts on its own.
export const DialogGate: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.dialogGate;
  if (!d) return <AbsoluteFill />;

  const rows = (d.rows ?? []).slice(0, 4);
  if (!rows.length) return <AbsoluteFill />;
  const handler = d.handler ?? 'none';
  const kind = d.kind ?? 'confirm';
  const accepted = handler === 'accept';
  const accent = sem(d.color ?? (accepted ? 'green' : 'red'));
  const ok = sem('green');
  const bad = sem('red');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the page, its rows and the handler line exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const knock = d.knockAtWord != null ? Math.max(wordToFrame(d.knockAtWord), base + 22) : base + 60;
  const answer = d.answerAtWord != null ? Math.max(wordToFrame(d.answerAtWord), knock + 30) : knock + 70;
  const knockP = interpolate(frame, [knock, knock + 16], [0, 1], clamp);
  const answerP = interpolate(frame, [answer, answer + 16], [0, 1], clamp);
  const open = knockP > 0.1 && answerP < 0.9;
  const done = answerP > 0.9;
  // the target row only disappears if the dialog was ACCEPTED
  const rowGone = done && accepted;

  const targetIdx = Math.max(0, rows.findIndex((r) => (r.title ?? '').toLowerCase() === 'target'));

  const rad = 14 * scale * t.style.cornerRadius;
  const paneW = (vertical ? 960 : 1000) * scale;

  // the page is FROZEN while the dialog is up — that is the whole reason locators fail
  const frozen = open;

  const HandlerLine = !d.handlerLine ? null : (
    <div
      style={{
        width: paneW,
        boxSizing: 'border-box',
        padding: `${11 * scale}px ${16 * scale}px`,
        borderRadius: rad,
        background: t.colors.bg,
        backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
        border: `${2 * scale}px solid ${hexA(accent, 0.6)}`,
        display: 'flex',
        alignItems: 'center',
        gap: 11 * scale,
      }}
    >
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontFamily: t.fonts.mono,
          fontSize: (vertical ? 21 : 23) * scale,
          color: accent,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {d.handlerLine}
      </span>
      <span
        style={{
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
        registered first
      </span>
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
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'red'} /> : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 13 * scale, opacity: appear}}>
        {HandlerLine}

        <div style={{width: paneW, position: 'relative'}}>
          {/* ── the page. It is a real page and it keeps existing underneath ── */}
          <div style={{filter: frozen ? `saturate(0.25) brightness(0.72)` : undefined}}>
            <ChromeFrame variant="browser" title={d.pageTitle ?? 'the page'}>
              <div style={{display: 'flex', flexDirection: 'column', gap: 9 * scale, padding: `${4 * scale}px 0`}}>
                {rows.map((r, i) => {
                  const isTarget = i === targetIdx;
                  const gone = isTarget && rowGone;
                  const c = sem(r.color ?? (isTarget ? d.color ?? 'red' : 'blue'));
                  return (
                    <div
                      key={i}
                      style={{
                        boxSizing: 'border-box',
                        width: '100%',
                        padding: `${10 * scale}px ${13 * scale}px`,
                        borderRadius: 9 * scale * t.style.cornerRadius,
                        background: gone ? 'transparent' : hexA(isTarget ? c : t.colors.panelBorder, isTarget ? 0.12 : 0.32),
                        border: `${1.5 * scale}px ${gone ? 'dashed' : 'solid'} ${
                          gone ? hexA(t.colors.muted, 0.35) : hexA(isTarget ? c : t.colors.muted, isTarget ? 0.6 : 0.3)
                        }`,
                        fontFamily: t.fonts.body,
                        fontSize: (vertical ? 23 : 24) * scale,
                        color: gone ? hexA(t.colors.muted, 0.55) : isTarget ? c : t.colors.text,
                        textDecoration: gone ? 'line-through' : 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.label}
                    </div>
                  );
                })}
                {d.trigger ? (
                  <div
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: 4 * scale,
                      padding: `${8 * scale}px ${16 * scale}px`,
                      borderRadius: 9 * scale * t.style.cornerRadius,
                      background: hexA(bad, 0.2),
                      border: `${1.5 * scale}px solid ${hexA(bad, 0.55)}`,
                      fontFamily: t.fonts.body,
                      fontSize: (vertical ? 21 : 22) * scale,
                      color: bad,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {d.trigger}
                  </div>
                ) : null}
              </div>
            </ChromeFrame>
          </div>

          {/* ── the dialog: browser chrome, ABOVE and OUTSIDE the page ── */}
          {open ? (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '30%',
                transform: `translate(-50%, -50%) scale(${interpolate(knockP, [0, 0.6, 1], [0.86, 1.03, 1], clamp)})`,
                width: (vertical ? 780 : 640) * scale,
                boxSizing: 'border-box',
                padding: `${18 * scale}px ${20 * scale}px ${16 * scale}px`,
                borderRadius: 12 * scale * t.style.cornerRadius,
                // OPAQUE — t.colors.panel is translucent in several themes and the page
                // showing through would say the dialog is part of it, which it is not
                background: t.colors.bg,
                backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
                border: `${2.5 * scale}px solid ${hexA(t.colors.text, 0.45)}`,
                boxShadow: `0 ${20 * scale}px ${50 * scale}px ${hexA('#000000', 0.6)}`,
                opacity: knockP,
                display: 'flex',
                flexDirection: 'column',
                gap: 14 * scale,
              }}
            >
              <span
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: 17 * scale,
                  letterSpacing: 1.5 * scale,
                  textTransform: 'uppercase',
                  color: t.colors.muted,
                }}
              >
                {'the browser · '}
                {kind}
              </span>
              <span
                style={{
                  fontFamily: t.fonts.body,
                  fontSize: (vertical ? 25 : 27) * scale,
                  color: t.colors.text,
                  lineHeight: 1.3,
                }}
              >
                {d.message}
              </span>
              <div style={{display: 'flex', gap: 10 * scale, justifyContent: 'flex-end'}}>
                {kind !== 'alert' ? (
                  <span
                    style={{
                      padding: `${7 * scale}px ${16 * scale}px`,
                      borderRadius: 8 * scale * t.style.cornerRadius,
                      border: `${(handler !== 'accept' ? 2.5 : 1.5) * scale}px solid ${
                        handler !== 'accept' ? bad : hexA(t.colors.muted, 0.4)
                      }`,
                      background: handler !== 'accept' ? hexA(bad, 0.18) : 'transparent',
                      fontFamily: t.fonts.body,
                      fontSize: 21 * scale,
                      color: handler !== 'accept' ? bad : t.colors.muted,
                    }}
                  >
                    Cancel
                  </span>
                ) : null}
                <span
                  style={{
                    padding: `${7 * scale}px ${16 * scale}px`,
                    borderRadius: 8 * scale * t.style.cornerRadius,
                    border: `${(accepted ? 2.5 : 1.5) * scale}px solid ${accepted ? ok : hexA(t.colors.muted, 0.4)}`,
                    background: accepted ? hexA(ok, 0.2) : 'transparent',
                    fontFamily: t.fonts.body,
                    fontSize: 21 * scale,
                    color: accepted ? ok : t.colors.muted,
                  }}
                >
                  OK
                </span>
              </div>
              <span
                style={{
                  fontFamily: t.fonts.body,
                  fontSize: 19 * scale,
                  color: hexA(t.colors.muted, 0.9),
                }}
              >
                {handler === 'none'
                  ? 'no handler — Playwright dismisses it'
                  : handler === 'accept'
                    ? 'your handler answers: accept'
                    : 'your handler answers: dismiss'}
              </span>
            </div>
          ) : null}

          {/* the page is frozen while it is up — say so, once, on the page itself */}
          {frozen ? (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: -14 * scale,
                transform: 'translateX(-50%)',
                padding: `${5 * scale}px ${13 * scale}px`,
                borderRadius: 7 * scale * t.style.cornerRadius,
                background: t.colors.bg,
                backgroundImage: `linear-gradient(${hexA(bad, 0.2)}, ${hexA(bad, 0.2)})`,
                border: `${1.5 * scale}px solid ${hexA(bad, 0.5)}`,
                fontFamily: t.fonts.body,
                fontSize: 20 * scale,
                color: bad,
                whiteSpace: 'nowrap',
              }}
            >
              the page is frozen · no locator can reach this
            </div>
          ) : null}
        </div>

        {done && d.outcome ? (
          <div
            style={{
              padding: `${7 * scale}px ${16 * scale}px`,
              borderRadius: 8 * scale * t.style.cornerRadius,
              background: hexA(accepted ? ok : bad, 0.16),
              border: `${1.5 * scale}px solid ${hexA(accepted ? ok : bad, 0.6)}`,
              fontFamily: t.fonts.body,
              fontSize: 22 * scale,
              color: accepted ? ok : bad,
              opacity: answerP,
              whiteSpace: 'nowrap',
            }}
          >
            {d.outcome}
          </div>
        ) : null}
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
