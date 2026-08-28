import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {Headline, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';
import {arriveAt, travelAt} from '../motion/system';

// BROWSER_STEALS — why four shortcuts on the card cannot work in VS Code for the Web.
//
// LAW 0n: name the object. Not a row saying "Ctrl+W is unavailable in the browser" — a CONTEST
// over one keypress. The key falls, two things reach for it, and the browser gets there first, so
// the editor below never receives it at all. The measurement behind this is in
// briefs/vscode-shortcuts/VERIFIED.md: 143 of the card's 149 chords ARE bound in this build, and
// the ones that are not are not missing features, they are keys that never arrive.
//
// The depiction has to show INTERCEPTION, which is why a two-column comparison would be wrong:
// the point is not that the browser and the editor differ, it is that they are in the same path
// and only the first one gets a turn. So the keypress travels DOWN through the browser toward the
// editor, and stops.
//
// LAW 0i: the fall, the catch and the verdict each resolve from their own anchor.
export const BrowserSteals: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.browserSteals;
  if (!d) return <AbsoluteFill />;

  const keys = (d.keys ?? []).slice(0, 4);
  const stealC = sem('red');
  const editorC = sem('blue');

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = arriveAt(frame, base, 16);
  const pressAt = wordToFrame(d.pressAtWord ?? d.atWord ?? 1);
  const stealAt = wordToFrame(d.stealAtWord ?? d.pressAtWord ?? d.atWord ?? 1);

  // the key FALLS from the press toward the editor, and is caught part-way
  const fall = travelAt(frame, pressAt, 26);
  const caught = arriveAt(frame, stealAt, 14);

  const radius = 14 * scale * t.style.cornerRadius;
  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;
  const body = stageH - premiseH;

  const laneH = body * 0.30;
  const capFont = Math.min(laneH * 0.28, (vertical ? 32 : 34) * scale);
  const label = Math.min(laneH * 0.18, (vertical ? 26 : 24) * scale);

  const Lane: React.FC<{
    title: string; tone: string; note?: string; dim?: boolean; struck?: boolean;
  }> = ({title, tone, note, dim = false, struck = false}) => (
    <div style={{
      width: '100%', height: laneH, borderRadius: radius,
      border: `${2 * scale}px solid ${hexA(tone, dim ? 0.3 : 0.7)}`,
      background: hexA(tone, dim ? 0.04 : 0.1),
      display: 'flex', flexDirection: 'column',
      // the browser lane's text sits in its LOWER half so the caught key has the top to itself
      alignItems: 'center', justifyContent: 'flex-end', gap: 8 * scale,
      paddingBottom: laneH * 0.18,
      opacity: appear * (dim ? 0.55 : 1), position: 'relative', overflow: 'hidden',
    }}>
      <span style={{
        fontFamily: t.fonts.display, fontSize: capFont, color: tone,
        letterSpacing: 0.3, textDecoration: struck ? 'line-through' : 'none',
      }}>{title}</span>
      {note ? (
        <span style={{
          fontFamily: t.fonts.body, fontSize: label, color: t.colors.muted,
          textAlign: 'center', maxWidth: '88%',
        }}>{note}</span>
      ) : null}
    </div>
  );

  return (
    <AbsoluteFill>
      {d.caption ? <Headline text={d.caption} color={d.color ?? 'red'} /> : null}
      <div style={{
        position: 'absolute', top: stageTop,
        left: (vertical ? 64 : 300) * scale, right: (vertical ? 64 : 300) * scale,
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
          alignItems: 'center', justifyContent: 'safe center', gap: 14 * scale,
          position: 'relative',
        }}>
          {/* THE KEYPRESS, falling. It stops at the browser lane — it never reaches the editor,
              and that stopping IS the lesson. */}
          <div style={{
            display: 'flex', gap: 8 * scale, alignItems: 'center',
            opacity: appear,
            // CAUGHT AT THE DOOR, not in the middle of the room. Falling to 0.72 of the lane put
            // the caps squarely on top of the lane's own title and note — the browser's label was
            // legible only as a smudge behind them. Stopping at the lane's top EDGE reads better
            // anyway: the key never gets inside, which is the whole point.
            transform: `translateY(${fall * laneH * 0.30}px) scale(${1 - 0.08 * caught})`,
            zIndex: 3,
          }}>
            {keys.map((k, i) => (
              <span key={i} style={{
                fontFamily: t.fonts.mono, fontSize: capFont * 0.82,
                color: caught > 0.5 ? t.colors.onAccent ?? t.colors.text : t.colors.text,
                background: caught > 0.5 ? stealC : hexA(t.colors.panel, 1),
                border: `${2 * scale}px solid ${hexA(caught > 0.5 ? stealC : t.colors.panelBorder, 0.8)}`,
                borderRadius: radius * 0.7,
                padding: `${7 * scale}px ${14 * scale}px`,
                minWidth: capFont * 2.1, textAlign: 'center',
                boxShadow: caught > 0.5 && t.style.glow > 0
                  ? `0 0 ${18 * scale * t.style.glow}px ${hexA(stealC, 0.6)}` : 'none',
              }}>{k}</span>
            ))}
          </div>

          <Lane
            title={d.browserLabel ?? 'your browser'}
            tone={stealC}
            note={caught > 0.4 ? (d.browserDoes ?? 'takes it first') : undefined}
          />

          {/* the path onward, which nothing travels down */}
          <div style={{
            width: 2 * scale, height: body * 0.06,
            background: hexA(t.colors.panelBorder, 0.5), opacity: appear,
          }} />

          <Lane
            title={d.editorLabel ?? 'VS Code'}
            tone={editorC}
            note={caught > 0.4 ? (d.editorWanted ?? 'never sees the key') : undefined}
            dim={caught > 0.4}
            struck={caught > 0.6}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
