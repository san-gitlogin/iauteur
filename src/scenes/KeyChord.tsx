import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {Headline, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';
import {arriveAt, landAt} from '../motion/system';

// KEY_CHORD — a shortcut as a THING THAT HAPPENS, not a label.
//
// LAW 0n's test: name the object the viewer should see. "Ctrl+K Ctrl+S" written on a card is a
// caption; every existing component in the library would render it as exactly that. What a chord
// actually IS, is a SEQUENCE OF SIMULTANEOUS PRESSES — and that is the whole reason two-key chords
// confuse people. Ctrl+K Ctrl+S is not four keys held together. It is Ctrl and K down together,
// released, then Ctrl and S down together. Nothing on a printed card says so.
//
// So the keycaps physically depress, in groups, in order, and only once the last group lifts does
// the command that fired appear. Swap the labels for lorem and it still teaches that a chord is a
// rhythm rather than a spelling.
//
// LAW 0i: each group carries its own `atWord`, so the rhythm belongs to the voice — this is the
// one component where a fixed interval would be actively wrong, because the GAP between the two
// halves of a chord is the thing being taught.
//
// BASE ≤38 (LAW 8): the caps, the hand-rest and the empty result slot are all on screen at once;
// the anchors time the PRESSES and the RESULT, never the diagram.
export const KeyChord: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.keyChord;
  if (!d) return <AbsoluteFill />;

  const groups = (d.groups ?? []).slice(0, 3);
  const accent = sem(d.color ?? 'blue');
  const okC = sem('green');

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = arriveAt(frame, base, 16);
  const cmdAt = wordToFrame(d.commandAtWord ?? d.atWord ?? 1);

  const radius = 12 * scale * t.style.cornerRadius;
  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;
  const body = stageH - premiseH;

  // A cap is sized from the SPACE and the widest label, so `Ctrl` and `S` sit in the same row
  // without one of them being a postage stamp (LAW 0k, 4: components size to the space they get).
  const widest = Math.max(3, ...groups.flatMap((g) => (g.keys ?? []).map((k) => String(k).length)));
  const capH = Math.min(body * (vertical ? 0.13 : 0.2), (vertical ? 130 : 148) * scale);
  const capFont = Math.min(capH * 0.34, (vertical ? 34 : 38) * scale);
  const capW = Math.max(capH, capFont * widest * 0.72 + 26 * scale);

  return (
    <AbsoluteFill>
      {d.caption ? <Headline text={d.caption} color={d.color ?? 'blue'} /> : null}
      <div style={{
        position: 'absolute', top: stageTop,
        left: (vertical ? 52 : 72) * scale, right: (vertical ? 52 : 72) * scale,
        height: stageH, display: 'flex', flexDirection: 'column',
      }}>
        {d.premise ? (
          <div style={{
            height: premiseH, display: 'flex', alignItems: 'center',
            fontFamily: t.fonts.body, fontSize: (vertical ? 28 : 24) * scale,
            color: t.colors.muted, lineHeight: 1.35,
          }}>{d.premise}</div>
        ) : null}

        <div style={{
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'safe center', gap: (vertical ? 30 : 38) * scale,
        }}>
          {/* THE PRESSES, in groups, left to right. The separator between groups is what says
              "let go, then press again" — without it this would read as one long chord. */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: (vertical ? 18 : 26) * scale,
            opacity: appear, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '100%',
          }}>
            {groups.map((g, gi) => {
              const at = wordToFrame(g.atWord ?? d.atWord ?? 1);
              // DOWN, then UP. `landAt` overshoots slightly, which is what a key feels like.
              const down = landAt(frame, at, 12);
              const up = gi < groups.length - 1 ? arriveAt(frame, at + 20, 10) : 0;
              const held = Math.max(0, down - up);
              return (
                <React.Fragment key={gi}>
                  {gi > 0 ? (
                    <span style={{
                      fontFamily: t.fonts.mono, fontSize: capFont * 0.8,
                      color: hexA(t.colors.muted, 0.8), padding: `0 ${4 * scale}px`,
                    }}>then</span>
                  ) : null}
                  <div style={{display: 'flex', gap: 10 * scale}}>
                    {(g.keys ?? []).slice(0, 3).map((k, ki) => (
                      <div key={ki} style={{
                        width: capW, height: capH,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: t.fonts.mono, fontSize: capFont,
                        color: held > 0.4 ? t.colors.onAccent ?? t.colors.text : t.colors.text,
                        borderRadius: radius,
                        background: held > 0.4 ? accent : hexA(t.colors.panel, 1),
                        border: `${2 * scale}px solid ${hexA(held > 0.4 ? accent : t.colors.panelBorder, held > 0.4 ? 1 : 0.55)}`,
                        // a real key sinks INTO the board and its shadow collapses with it
                        transform: `translateY(${held * 6 * scale}px)`,
                        boxShadow: held > 0.4
                          ? `0 ${2 * scale}px 0 ${hexA(accent, 0.5)}`
                          : `0 ${6 * scale}px 0 ${hexA(t.colors.panelBorder, 0.55)}`,
                      }}>{k}</div>
                    ))}
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* WHAT FIRED. Not a caption on the chord — the consequence of it, arriving only after
              the last key is down, which is the causal order the viewer needs to feel. */}
          {d.command ? (() => {
            const on = arriveAt(frame, cmdAt, 16);
            return (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 * scale,
                opacity: on, transform: `translateY(${(1 - on) * 14 * scale}px)`,
              }}>
                <span style={{
                  fontFamily: t.fonts.mono,
                  // SIZE TO THE STRING. A command id is as long as it is — "Preferences: Open
                  // Keyboard Shortcuts" is 36 characters and was being cut to "Open Keyboard
                  // Shortc...", which teaches the wrong command name. Shrink rather than trim.
                  fontSize: Math.min(30, 30 * (34 / Math.max(20, String(d.command).length))) * scale,
                  color: okC, background: hexA(okC, 0.12),
                  border: `${1.5 * scale}px solid ${hexA(okC, 0.55)}`,
                  borderRadius: radius, padding: `${8 * scale}px ${20 * scale}px`,
                  whiteSpace: 'nowrap', maxWidth: '96%',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{d.command}</span>
                {d.result ? (
                  <span style={{
                    fontFamily: t.fonts.body, fontSize: (vertical ? 27 : 24) * scale,
                    color: t.colors.muted, textAlign: 'center', maxWidth: '90%',
                  }}>{d.result}</span>
                ) : null}
              </div>
            );
          })() : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
