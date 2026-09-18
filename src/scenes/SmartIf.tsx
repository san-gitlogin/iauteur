import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {arriveAt, travelAt, landAt} from '../motion/system';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// SMART_IF — an if-statement with a hole where the condition goes.
//
// The object (LAW 0n): a SOCKET. Real code is on screen with a piece physically missing, and a
// judgement travels out of the incoming record and seats itself in the gap. Then the branch it
// controls fires. Nothing here is a caption: the viewer sees the shape of the program, sees the
// part that cannot be written, and watches something else supply it.
//
// Why it is not a CODE_WINDOW with a highlight: a highlight says "look at this line". This says
// "this line is INCOMPLETE, and here is what completes it" — which is the whole argument for
// putting a model inside ordinary control flow. LAW 0j: the thing being taught is the thing
// that moves.
//
// THE EMPTY SOCKET IS THE ESTABLISHING HALF (LAW 0l). It is on screen from the start, carrying
// the question a rule-writer would try and fail to express. If the socket arrived already full,
// the picture would be a code listing.
//
// BASE <= 38 FRAMES: the record, the code and the empty socket are all up immediately. The
// anchors time the TRAVEL and the BRANCH, never the render tree.
export const SmartIf: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.smartIf;
  if (!d) return <AbsoluteFill />;

  const lines = (d.stateLines ?? []).slice(0, 6);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const fillAt = wordToFrame(d.fillAtWord ?? d.atWord ?? 1);
  const branchAt = wordToFrame(d.branchAtWord ?? d.fillAtWord ?? d.atWord ?? 1);

  const appear = arriveAt(frame, base, 14);
  // The judgement TRAVELS — it is not a fade. Something leaves the record and arrives in the gap,
  // because the claim is that the answer comes OUT of the unstructured state.
  const fly = travelAt(frame, fillAt, 22);
  const seated = landAt(frame, fillAt + 14, 16);
  const filled = frame >= fillAt + 14;
  const branch = arriveAt(frame, branchAt, 14);
  const fired = frame >= branchAt;

  const accent = sem('purple');      // the judgement: not code, not data — the model's contribution
  const green = sem('green');        // the branch that actually runs
  const radius = 10 * scale * t.style.cornerRadius;

  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;

  const codeFont = (vertical ? 34 : 33) * scale;
  const stateFont = (vertical ? 26 : 24) * scale;

  const glow = (c: string, px: number) =>
    t.style.glow > 0 ? `0 0 ${px * scale * t.style.glow}px ${hexA(c, 0.5)}` : 'none';

  // The chip flies from the record to the socket. On wide the record is to the LEFT, so the
  // travel is horizontal; on 9:16 it is ABOVE, so the travel is vertical (the nested-box law:
  // lay the contents along the LONG axis of the aspect).
  // A SHORT travel that stays in the socket's own neighbourhood. The first version crossed the
  // whole stage and passed straight THROUGH the word "if" — and because its opacity was ramping,
  // its "opaque" pill was a 36%-opacity watermark with the code legible underneath it. A thing
  // in transit is fully present from the moment it exists; only its POSITION animates.
  const flyFrom = vertical
    ? {x: 0, y: -(1 - fly) * 62 * scale}
    : {x: -(1 - fly) * 78 * scale, y: 0};
  const chipIn = arriveAt(frame, fillAt, 4);

  const Socket = (
    <span style={{
      position: 'relative',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: (vertical ? 250 : 240) * scale,
      minHeight: codeFont * 1.7,
      margin: `0 ${6 * scale}px`,
      padding: `${2 * scale}px ${12 * scale}px`,
      borderRadius: radius,
      // Empty: a dashed outline with nothing in it. Filled: a solid seated chip.
      border: filled
        ? `2px solid ${hexA(accent, 0.85)}`
        : `2px dashed ${hexA(t.colors.muted, 0.55)}`,
      background: filled ? hexA(accent, 0.16) : hexA(t.colors.bg, 0.45),
      boxShadow: filled ? glow(accent, 14) : 'none',
      transform: `scale(${filled ? 1 + 0.05 * Math.max(0, Math.min(1, seated)) : 1})`,
      verticalAlign: 'middle',
    }}>
      {/* the question nobody can write as a rule — visible until the judgement lands on it */}
      <span style={{
        fontFamily: t.fonts.mono, fontSize: codeFont * 0.62,
        color: hexA(t.colors.muted, 0.9), fontStyle: 'italic',
        // the question clears as the answer arrives, rather than both being readable at once
        opacity: 1 - Math.min(1, fly * 6), whiteSpace: 'nowrap',
      }}>{d.socketHint ?? ''}</span>

      {/* the judgement, in flight and then seated */}
      {fly > 0 ? (
        <span style={{
          position: 'absolute', zIndex: 5,
          display: 'flex', alignItems: 'baseline', gap: 8 * scale,
          transform: `translate(${flyFrom.x}px, ${flyFrom.y}px)`,
          opacity: chipIn,
          // opaque while it travels, so it never reads as a watermark over whatever it crosses
          padding: filled ? 0 : `${3 * scale}px ${10 * scale}px`,
          borderRadius: radius,
          background: filled ? 'transparent' : t.colors.bg,
          border: filled ? 'none' : `1px solid ${hexA(accent, 0.6)}`,
          boxShadow: filled ? 'none' : glow(accent, 16),
          whiteSpace: 'nowrap',
        }}>
          <span style={{fontFamily: t.fonts.mono, fontSize: codeFont, color: accent}}>
            {d.condition ?? ''}
          </span>
          {d.prob != null ? (
            <span style={{
              fontFamily: t.fonts.mono, fontSize: codeFont * 0.56,
              color: hexA(accent, 0.9),
            }}>{d.prob.toFixed(2)}</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );

  const codeBlock = (
    <div style={{
      flex: '0 1 auto', minWidth: 0,
      borderRadius: radius,
      border: `1px solid ${hexA(t.colors.panelBorder, 0.4)}`,
      background: hexA(t.colors.panel, 0.6),
      padding: `${(vertical ? 24 : 26) * scale}px ${(vertical ? 22 : 30) * scale}px`,
      opacity: appear,
      display: 'flex', flexDirection: 'column', gap: (vertical ? 12 : 10) * scale,
      fontFamily: t.fonts.mono,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        fontSize: codeFont, color: t.colors.text, lineHeight: 1.5,
      }}>
        <span>{d.ifHead ?? 'if ('}</span>
        {Socket}
        <span>{d.ifTail ?? ') {'}</span>
      </div>
      {/* THE BRANCH. It is dim until the condition is true, then it runs — the consequence of
          the judgement, which is the reason the socket matters at all. */}
      <div style={{
        marginLeft: (vertical ? 26 : 34) * scale,
        fontSize: codeFont, lineHeight: 1.5,
        color: fired ? green : hexA(t.colors.muted, 0.45),
        opacity: fired ? 0.4 + 0.6 * branch : 1,
        transform: `translateX(${fired ? (1 - branch) * -10 * scale : 0}px)`,
        display: 'flex', alignItems: 'center', gap: 10 * scale,
        minWidth: 0,
      }}>
        <span style={{
          width: 6 * scale, height: codeFont, borderRadius: 3 * scale,
          background: fired ? green : 'transparent',
          boxShadow: fired ? glow(green, 10) : 'none', flex: '0 0 auto',
        }} />
        <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {d.bodyLine ?? ''}
        </span>
      </div>
      <div style={{fontSize: codeFont, color: t.colors.text, lineHeight: 1.5}}>
        {d.closeLine ?? '}'}
      </div>
    </div>
  );

  const stateCard = (
    <div style={{
      flex: vertical ? '0 0 auto' : `0 0 ${360 * scale}px`, minWidth: 0,
      borderRadius: radius,
      border: `1px solid ${hexA(t.colors.panelBorder, 0.4)}`,
      background: hexA(t.colors.bg, 0.5),
      padding: `${(vertical ? 16 : 18) * scale}px ${18 * scale}px`,
      opacity: appear,
      display: 'flex', flexDirection: 'column', gap: 5 * scale,
      // it dims as its judgement leaves — the record has given up what it had
      filter: `saturate(${1 - 0.35 * fly})`,
    }}>
      <div style={{
        fontFamily: t.fonts.mono, fontSize: stateFont * 0.8,
        color: t.colors.muted, letterSpacing: 1.1, marginBottom: 4 * scale,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{d.stateTitle ?? ''}</div>
      {lines.map((ln, i) => (
        <div key={i} style={{
          fontFamily: t.fonts.mono, fontSize: stateFont,
          color: t.colors.text, lineHeight: 1.45,
          opacity: arriveAt(frame, base + i * 3, 12),
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{ln}</div>
      ))}
    </div>
  );

  return (
    <AbsoluteFill>
      {d.caption ? <Headline text={d.caption} color="blue" /> : null}
      <div style={{
        position: 'absolute',
        top: stageTop,
        left: (vertical ? 52 : 72) * scale,
        right: (vertical ? 52 : 72) * scale,
        height: stageH,
        display: 'flex', flexDirection: 'column',
      }}>
        {d.premise ? (
          <div style={{
            height: premiseH, display: 'flex', alignItems: 'center',
            fontFamily: t.fonts.mono, letterSpacing: 0.9,
            fontSize: (vertical ? 28 : 24) * scale,
            color: t.colors.muted, lineHeight: 1.35,
          }}>{d.premise}</div>
        ) : null}

        <div style={{
          flex: 1, minHeight: 0,
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          alignItems: vertical ? 'stretch' : 'center',
          justifyContent: 'safe center',
          gap: (vertical ? 26 : 34) * scale,
        }}>
          {stateCard}
          {codeBlock}
        </div>
      </div>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
