import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {Headline, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';
// MOTION SYSTEM (src/motion/system.ts): nothing on screen moves linearly. An arrival
// eases OUT so it settles; a move or a state change uses the S-curve so it accelerates
// away and decelerates in. Measured before this pass: 33 interpolates, zero easing.
import {easeInOutCubic, easeOutCubic} from '../motion/util';

// PLACEHOLDER_SEAL — why `?` is not "quoting for you".
//
// The object the viewer should see (LAW 0n) is a SENTENCE, and what happens to it when a value
// arrives. In the safe lane the sentence never changes shape: the placeholder stays a sealed
// slot and the value sits in a separate tray below, joined by a line — it is DATA, handed over
// beside the sentence. In the unsafe lane the value's characters are spliced into the sentence
// itself, a clause that nobody wrote lights up, and the rest of the query greys out because a
// comment marker just turned it into prose.
//
// That is the mechanism, not a description of it: the two lanes hold the same query and the eye
// can see which one grew a new clause. A card reading "always use parameters" teaches nothing,
// which is exactly the failure LAW 0j and 0e rule 8 are about.
//
// BASE <= 38 FRAMES: both lanes and the full query are on screen from the start. The anchors
// time the ARRIVAL of the value in each lane, which is the emphasis.
export const PlaceholderSeal: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.placeholderSeal;
  if (!d) return <AbsoluteFill />;

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const safeAt = wordToFrame(d.safeAtWord ?? d.atWord ?? 1);
  const evilAt = wordToFrame(d.evilAtWord ?? d.safeAtWord ?? d.atWord ?? 1);

  const appear = easeOutCubic(interpolate(frame, [base, base + 14], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const safe = easeInOutCubic(interpolate(frame, [safeAt, safeAt + 16], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const evil = easeInOutCubic(interpolate(frame, [evilAt, evilAt + 16], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

  const head = d.queryHead ?? '';
  const tail = d.queryTail ?? '';
  const value = d.value ?? '';
  const evilText = d.evil ?? '';
  const hi = d.evilHighlight ?? '';

  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;
  const laneGap = (vertical ? 30 : 34) * scale;
  const laneH = (stageH - premiseH - laneGap) / 2;

  const radius = 12 * scale * t.style.cornerRadius;
  const mono = Math.min(laneH * 0.155, (vertical ? 25 : 30) * scale);
  const chipFont = mono * 0.95;

  // Split the injected string so the clause nobody wrote can be lit on its own, and everything
  // from the comment marker onward can be shown as the dead text it has become.
  const hiAt = hi ? evilText.indexOf(hi) : -1;
  const evilPre = hiAt >= 0 ? evilText.slice(0, hiAt) : evilText;
  const evilMid = hiAt >= 0 ? hi : '';
  const evilPost = hiAt >= 0 ? evilText.slice(hiAt + hi.length) : '';

  const Lane: React.FC<{lane: 'safe' | 'evil'}> = ({lane}) => {
    const isSafe = lane === 'safe';
    const accent = isSafe ? sem('green') : sem('red');
    const on = isSafe ? safe : evil;
    const label = (isSafe ? d.safeLabel : d.evilLabel) ?? (isSafe ? 'parameterised' : 'built by hand');
    const result = isSafe ? d.safeResult : d.evilResult;

    return (
      <div style={{
        height: laneH,
        borderRadius: radius,
        border: `1px solid ${hexA(on > 0.5 ? accent : t.colors.panelBorder, on > 0.5 ? 0.55 : 0.32)}`,
        background: t.colors.panel,
        boxShadow: on > 0.5 && t.style.glow > 0
          ? `0 0 ${20 * scale * t.style.glow}px ${hexA(accent, 0.22)}` : 'none',
        padding: `${(vertical ? 16 : 18) * scale}px ${(vertical ? 18 : 24) * scale}px`,
        display: 'flex', flexDirection: 'column', gap: 10 * scale,
        opacity: appear, minWidth: 0, overflow: 'hidden',
      }}>
        {/* lane header: what this lane IS, and what it returned */}
        <div style={{display: 'flex', alignItems: 'center', gap: 12 * scale, minWidth: 0}}>
          <span style={{
            fontFamily: t.fonts.display, fontSize: mono * 0.82,
            color: accent, letterSpacing: 0.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{label}</span>
          {result ? (
            <span style={{
              marginLeft: 'auto',
              fontFamily: t.fonts.mono, fontSize: mono * 0.82,
              color: on > 0.5 ? accent : t.colors.muted,
              opacity: on,
              padding: `${3 * scale}px ${10 * scale}px`,
              borderRadius: radius,
              border: `1px solid ${hexA(accent, 0.5)}`,
              background: hexA(accent, 0.12),
              whiteSpace: 'nowrap',
            }}>{result}</span>
          ) : null}
        </div>

        {/* THE SENTENCE. Same head in both lanes — what follows it is the lesson. */}
        <div style={{
          fontFamily: t.fonts.mono, fontSize: mono, lineHeight: 1.45,
          color: t.colors.text, wordBreak: 'break-word', minWidth: 0,
        }}>
          <span style={{color: t.colors.muted}}>{head}</span>
          {isSafe ? (
            // THE SEALED SLOT stays a slot. The sentence never grows.
            <span style={{
              display: 'inline-block',
              padding: `${1 * scale}px ${10 * scale}px`,
              margin: `0 ${2 * scale}px`,
              borderRadius: radius,
              border: `2px solid ${hexA(accent, 0.5 + 0.45 * safe)}`,
              background: hexA(accent, 0.10 + 0.12 * safe),
              color: accent, fontWeight: 700,
            }}>?</span>
          ) : (
            on < 0.5 ? (
              // BEFORE THE VALUE ARRIVES the two lanes are the SAME sentence, with the same
              // hole in it. That is what makes the divergence legible a moment later — and it
              // fixes a real defect in the first proof still, where the injected spans held
              // their width at zero opacity and left a quote mark floating in empty space.
              <span style={{
                display: 'inline-block',
                padding: `${1 * scale}px ${10 * scale}px`,
                margin: `0 ${2 * scale}px`,
                borderRadius: radius,
                border: `2px dashed ${hexA(t.colors.muted, 0.45)}`,
                color: t.colors.muted, fontWeight: 700,
              }}>?</span>
            ) : (
            <>
              <span style={{color: t.colors.text, opacity: on}}>{evilPre}</span>
              {evilMid ? (
                <span style={{
                  color: accent, fontWeight: 700, opacity: on,
                  background: hexA(accent, 0.16 * on),
                  padding: `${1 * scale}px ${4 * scale}px`,
                  borderRadius: radius,
                  boxShadow: t.style.glow > 0
                    ? `0 0 ${14 * scale * t.style.glow * on}px ${hexA(accent, 0.5)}` : 'none',
                }}>{evilMid}</span>
              ) : null}
              <span style={{color: accent, opacity: on * 0.9}}>{evilPost}</span>
            </>
            )
          )}
          {/* The tail is ordinary code in the safe lane. In the unsafe one the comment marker
              has already killed it, so it is struck through and faded — not merely "less
              important", but no longer running. */}
          <span style={{
            color: t.colors.muted,
            opacity: isSafe ? 1 : 1 - 0.62 * on,
            textDecoration: isSafe ? 'none' : (on > 0.5 ? 'line-through' : 'none'),
          }}>{tail}</span>
        </div>

        {/* THE TRAY. Only the safe lane has one: the value travels BESIDE the sentence. */}
        {isSafe ? (
          <div style={{
            marginTop: 'auto', display: 'flex', alignItems: 'center',
            gap: 10 * scale, minWidth: 0, opacity: safe,
          }}>
            <svg width={(vertical ? 26 : 34) * scale} height={(vertical ? 20 : 22) * scale}
                 style={{overflow: 'visible', flex: '0 0 auto'}}>
              <path
                d={`M ${4 * scale} ${2 * scale} L ${4 * scale} ${12 * scale} L ${(vertical ? 22 : 30) * scale} ${12 * scale}`}
                fill="none" stroke={hexA(accent, 0.7)} strokeWidth={2 * scale}
                strokeDasharray={120} strokeDashoffset={120 * (1 - safe)}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span style={{
              fontFamily: t.fonts.body, fontSize: chipFont * 0.78,
              color: t.colors.muted, whiteSpace: 'nowrap',
            }}>value</span>
            <span style={{
              fontFamily: t.fonts.mono, fontSize: chipFont,
              color: t.colors.text,
              padding: `${3 * scale}px ${12 * scale}px`,
              borderRadius: radius,
              border: `1px solid ${hexA(accent, 0.55)}`,
              background: hexA(accent, 0.10),
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              minWidth: 0,
            }}>{value}</span>
          </div>
        ) : (
          // THE UNSAFE LANE HAS NO TRAY — and saying so is the point, not a gap to leave
          // blank. An empty half-pane also reads as an unfinished slide (LAW 0o rule 2).
          <div style={{
            marginTop: 'auto', display: 'flex', alignItems: 'center',
            gap: 10 * scale, minWidth: 0, opacity: appear,
          }}>
            <svg width={(vertical ? 26 : 34) * scale} height={(vertical ? 20 : 22) * scale}
                 style={{overflow: 'visible', flex: '0 0 auto'}}>
              <path
                d={`M ${4 * scale} ${2 * scale} L ${4 * scale} ${12 * scale} L ${(vertical ? 22 : 30) * scale} ${12 * scale}`}
                fill="none" stroke={hexA(t.colors.muted, 0.5)} strokeWidth={2 * scale}
                strokeDasharray={`${4 * scale} ${4 * scale}`}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span style={{
              fontFamily: t.fonts.body, fontSize: chipFont * 0.78,
              color: t.colors.muted, whiteSpace: 'nowrap',
            }}>no value</span>
            <span style={{
              fontFamily: t.fonts.body, fontSize: chipFont * 0.86,
              color: on > 0.5 ? accent : t.colors.muted,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
            }}>{on > 0.5 ? 'it IS the sentence now' : 'the value becomes code'}</span>
          </div>
        )}
      </div>
    );
  };

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
            fontFamily: t.fonts.body, fontSize: (vertical ? 28 : 24) * scale,
            color: t.colors.muted, lineHeight: 1.35,
          }}>{d.premise}</div>
        ) : null}
        {/* Both aspects stack the lanes: the comparison is between two SENTENCES, and a
            sentence needs its width far more than it needs to sit beside its twin. */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          gap: laneGap, justifyContent: 'safe center', minHeight: 0,
        }}>
          <Lane lane="safe" />
          <Lane lane="evil" />
        </div>
      </div>
    </AbsoluteFill>
  );
};
