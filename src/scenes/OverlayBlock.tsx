import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {ChromeFrame, bounceTravel} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// OVERLAY_BLOCK — a click being INTERCEPTED, drawn as a wall not a fade.
// A banner covers the target button from the base frame. At blockedAtWord the pointer
// travels in and BOUNCES off the banner (shared `bounceTravel` grammar, the same one
// AGENT_HARNESS and SANDBOX_BOX use, so a wall always reads the same way here); a red
// note stamps at the impact. A wait pill holds. At clearedAtWord the banner lifts away
// and the SAME pointer travels again, unobstructed, and presses the button.
export const OverlayBlock: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.overlayBlock;
  if (!d) return <AbsoluteFill />;

  const accent = sem(d.color ?? 'blue');
  const red = sem('red');
  const green = sem('green');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — page, button and overlay all exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const blockedStart = d.blockedAtWord != null ? wordToFrame(d.blockedAtWord) : base + 30;
  const clearedStart = d.clearedAtWord != null ? wordToFrame(d.clearedAtWord) : blockedStart + 90;

  const DUR = 30;
  const blocked = bounceTravel(frame, blockedStart, DUR, true);
  const landing = bounceTravel(frame, clearedStart, DUR, false);
  const phase2 = frame >= clearedStart;
  const travel = phase2 ? landing.t : frame >= blockedStart ? blocked.t : 0;

  // overlay lifts away when the second phase starts
  const lift = interpolate(frame, [clearedStart, clearedStart + 16], [0, 1], clamp);
  // the button is pressed only once the pointer has actually arrived
  const pressed = phase2 && landing.t > 0.92;

  const pageW = (vertical ? 980 : 1080) * scale;
  const rad = 14 * scale * t.style.cornerRadius;

  const Pointer = (
    <div
      style={{
        position: 'absolute',
        left: `${interpolate(travel, [0, 1], [0, 56], clamp)}%`,
        bottom: 0,
        transform: 'translate(-30%, 0)',
        zIndex: 6,
        opacity: frame >= blockedStart ? appear : 0,
        pointerEvents: 'none',
      }}
    >
      <svg width={40 * scale} height={44 * scale} viewBox="0 0 24 26">
        <path
          d="M3 1 L3 21 L8.5 16 L12 24 L15.5 22.5 L12 15 L19 15 Z"
          fill={t.colors.text}
          stroke={t.colors.bg}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  // the note that stamps at impact / at landing
  const noteText = phase2 ? d.clearedNote : frame >= blockedStart ? d.blockedNote : undefined;
  const noteColor = phase2 ? green : red;
  const noteOn = phase2
    ? interpolate(frame, [clearedStart + 20, clearedStart + 32], [0, 1], clamp)
    : interpolate(frame, [blockedStart + 16, blockedStart + 26], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}

      <div style={{opacity: appear, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 * scale}}>
        <ChromeFrame
          variant="browser"
          url="example.com"
          accent={(d.color as never) ?? 'blue'}
          width={pageW}
          bodyStyle={{padding: `${28 * scale}px ${32 * scale}px`, minHeight: (vertical ? 400 : 420) * scale}}
        >
          <div style={{position: 'relative', display: 'flex', flexDirection: 'column', gap: 18 * scale}}>
            {d.screenTitle ? (
              <div style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 36 * scale, color: t.colors.text}}>
                {d.screenTitle}
              </div>
            ) : null}

            {/* two inert content bars so the page reads as a page, not a card */}
            {[0.82, 0.55].map((w, i) => (
              <div key={i} style={{height: 16 * scale, width: `${w * 100}%`, borderRadius: 8 * scale * t.style.cornerRadius, background: hexA(t.colors.panelBorder, 0.75)}} />
            ))}

            {/* the target button + the pointer track that ends on it */}
            <div style={{position: 'relative', height: (vertical ? 150 : 160) * scale, marginTop: 12 * scale}}>
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                  maxWidth: '42%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  padding: `${15 * scale}px ${32 * scale}px`,
                  borderRadius: rad,
                  background: pressed ? green : accent,
                  color: t.colors.onAccent,
                  fontFamily: t.fonts.body,
                  fontWeight: 700,
                  fontSize: 27 * scale,
                  whiteSpace: 'nowrap',
                  transform: `translateY(${pressed ? 3 * scale : 0}px) scale(${pressed ? 0.97 : 1})`,
                  boxShadow: t.style.glow > 0 ? `0 ${8 * scale}px ${20 * scale}px ${hexA(pressed ? green : accent, 0.4)}` : undefined,
                }}
              >
                {d.button}
              </div>
              {Pointer}
            </div>

            {/* THE OVERLAY — sits over the button until it lifts away */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: -(10 * scale),
                zIndex: 5,
                transform: `translateY(${lift * -140}%)`,
                opacity: 1 - lift,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16 * scale,
                padding: `${18 * scale}px ${22 * scale}px`,
                borderRadius: rad,
                // MUST be OPAQUE — `t.colors.panel` is translucent in several themes and the
                // button showed straight through it, inverting the whole lesson. Same
                // bg + gradient-layer idiom kit.tsx uses for popovers/notifications.
                background: t.colors.bg,
                backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
                border: `${2 * scale}px solid ${blocked.hit && !phase2 ? red : t.colors.panelBorder}`,
                boxShadow: t.style.glow > 0 ? `0 ${10 * scale}px ${26 * scale}px ${hexA('#000000', 0.45)}` : undefined,
              }}
            >
              <span
                style={{
                  fontFamily: t.fonts.body,
                  fontSize: 26 * scale,
                  color: t.colors.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}
              >
                {d.overlayLabel}
              </span>
              {d.overlayButton ? (
                <span
                  style={{
                    flexShrink: 0,
                    padding: `${9 * scale}px ${18 * scale}px`,
                    borderRadius: 9 * scale * t.style.cornerRadius,
                    border: `${1.5 * scale}px solid ${t.colors.panelBorder}`,
                    fontFamily: t.fonts.body,
                    fontSize: 22 * scale,
                    color: t.colors.muted,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {d.overlayButton}
                </span>
              ) : null}
            </div>
          </div>
        </ChromeFrame>

        {/* wait pill — only between the bounce and the clear */}
        {d.waitLabel && frame >= blockedStart + 26 && !phase2 ? (
          <div
            style={{
              padding: `${9 * scale}px ${20 * scale}px`,
              borderRadius: 999 * t.style.cornerRadius + 4 * scale,
              border: `${1.5 * scale}px solid ${hexA(sem('orange'), 0.6)}`,
              background: hexA(sem('orange'), 0.14),
              fontFamily: t.fonts.mono,
              fontSize: 22 * scale,
              color: sem('orange'),
              opacity: 0.65 + 0.35 * Math.sin((frame - blockedStart) * 0.16),
            }}
          >
            {d.waitLabel}
          </div>
        ) : null}

        {/* the plain-words note for whichever phase we are in */}
        {noteText ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10 * scale,
              opacity: noteOn,
              padding: `${10 * scale}px ${20 * scale}px`,
              borderRadius: rad,
              background: hexA(noteColor, 0.14),
              border: `${1.5 * scale}px solid ${hexA(noteColor, 0.55)}`,
              maxWidth: pageW,
            }}
          >
            <span style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: noteColor, flexShrink: 0}}>
              {phase2 ? '✓' : '✕'}
            </span>
            <span
              style={{
                fontFamily: t.fonts.body,
                fontSize: (vertical ? 26 : 28) * scale,
                color: t.colors.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              {noteText}
            </span>
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
