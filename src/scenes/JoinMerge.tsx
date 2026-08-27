import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {Headline, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// JOIN_MERGE — what a JOIN physically does.
//
// The object (LAW 0n): two ROWS, from two tables, that have one value in common. They start
// apart, the shared value lights up in both, and then they TRAVEL together and become one
// wider row while the duplicated key column collapses out of existence. The merge IS the
// explanation — there is no sentence on screen saying "a join combines rows", because a
// sentence like that is the caption LAW 0j was written against.
//
// The travel is real: the gap between the cards interpolates to zero and the duplicate cell's
// width interpolates to zero with it, so the columns close up the way they actually would.
//
// BASE <= 38 FRAMES: both rows and all their columns are on screen at once. The anchors time
// the KEY lighting up and the MERGE — the emphasis, never the diagram.
export const JoinMerge: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.joinMerge;
  if (!d) return <AbsoluteFill />;

  const left = (d.leftRow ?? []).slice(0, 4);
  const right = (d.rightRow ?? []).slice(0, 4);
  const keyL = d.keyLeft ?? '';
  const keyR = d.keyRight ?? '';

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const keyAt = wordToFrame(d.keyAtWord ?? d.atWord ?? 1);
  const mergeAt = wordToFrame(d.mergeAtWord ?? d.keyAtWord ?? d.atWord ?? 1);

  const appear = interpolate(frame, [base, base + 14], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const lit = interpolate(frame, [keyAt, keyAt + 12], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const merged = interpolate(frame, [mergeAt, mergeAt + 20], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;
  const body = stageH - premiseH;

  const radius = 12 * scale * t.style.cornerRadius;
  const cardH = Math.min(body * (vertical ? 0.30 : 0.46), (vertical ? 300 : 320) * scale);
  const colFont = Math.min(cardH * 0.13, (vertical ? 22 : 25) * scale);
  const valFont = Math.min(cardH * 0.18, (vertical ? 28 : 34) * scale);

  const accentL = sem('blue');
  const accentR = sem('purple');
  const accentM = sem('green');

  // THE TRAVEL. Apart at rest, touching once merged — and the same number drives the
  // duplicate column's collapse, so the picture cannot desynchronise from itself.
  const apart = (vertical ? 34 : 56) * scale;
  const travel = apart * (1 - merged);

  const Cell: React.FC<{
    label: string; value: string; isKey: boolean; accent: string;
    collapse?: number; weight?: number;
  }> = ({label, value, isKey, accent, collapse = 0, weight = 1}) => {
    const on = isKey ? lit : 0;
    const c = isKey ? (merged > 0.4 ? accentM : accent) : accent;
    return (
      <div style={{
        flex: collapse > 0 ? `0 1 auto` : `${weight} 1 0%`,
        minWidth: 0,
        // The duplicated key column does not fade — it CLOSES, which is what a join does
        // to it. Width and padding go to zero together so the neighbours slide inward.
        maxWidth: collapse > 0 ? `${(1 - collapse) * 100}%` : undefined,
        opacity: collapse > 0 ? 1 - collapse : 1,
        transform: collapse > 0 ? `scaleX(${1 - collapse})` : undefined,
        transformOrigin: 'left center',
        display: 'flex', flexDirection: 'column', justifyContent: 'safe center',
        gap: 4 * scale,
        padding: `${8 * scale}px ${(collapse > 0 ? (1 - collapse) * 12 : 12) * scale}px`,
        borderRadius: radius,
        border: `${on > 0.4 ? 2 : 1}px solid ${hexA(on > 0.4 ? c : t.colors.panelBorder, on > 0.4 ? 0.85 : 0.3)}`,
        background: on > 0.4 ? hexA(c, 0.12) : hexA(t.colors.bg, 0.35),
        boxShadow: on > 0.4 && t.style.glow > 0
          ? `0 0 ${14 * scale * t.style.glow}px ${hexA(c, 0.4)}` : 'none',
        overflow: 'hidden',
      }}>
        <span style={{
          fontFamily: t.fonts.mono, fontSize: colFont,
          color: on > 0.4 ? c : t.colors.muted,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{label}</span>
        <span style={{
          fontFamily: t.fonts.mono, fontSize: valFont,
          color: on > 0.4 ? c : t.colors.text,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{value}</span>
      </div>
    );
  };

  const Card: React.FC<{
    table: string; row: {label?: string; sub?: string}[]; keyName: string;
    accent: string; collapseKey: boolean;
  }> = ({table, row, keyName, accent, collapseKey}) => (
    <div style={{
      // The CARDS are weighted the same way their columns are: a table whose row carries a
      // long product name needs more of the width than one carrying three short integers.
      // A 50/50 split is only correct when both rows happen to be the same length.
      flex: `${row.reduce((a, c) => a + Math.max((c.label ?? '').length, (c.sub ?? '').length, 3), 0)} 1 0%`,
      minWidth: 0, height: cardH,
      borderRadius: radius,
      // Once merged the two cards share one outline, so they read as ONE row rather than
      // as two cards that happen to be adjacent.
      border: `1px solid ${hexA(merged > 0.6 ? accentM : accent, merged > 0.6 ? 0.6 : 0.45)}`,
      background: t.colors.panel,
      padding: `${10 * scale}px ${12 * scale}px`,
      display: 'flex', flexDirection: 'column', gap: 8 * scale,
      opacity: appear,
      boxShadow: merged > 0.6 && t.style.glow > 0
        ? `0 0 ${22 * scale * t.style.glow}px ${hexA(accentM, 0.2)}` : 'none',
    }}>
      <span style={{
        fontFamily: t.fonts.display, fontSize: colFont * 1.05,
        color: merged > 0.6 ? accentM : accent, letterSpacing: 0.3,
        opacity: 1 - merged * 0.45,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{table}</span>
      <div style={{flex: 1, display: 'flex', gap: 8 * scale, minWidth: 0, minHeight: 0}}>
        {row.map((c, i) => (
          <Cell
            key={i}
            label={c.label ?? ''}
            value={c.sub ?? ''}
            isKey={(c.label ?? '') === keyName}
            accent={accent}
            // A COLUMN IS AS WIDE AS WHAT IS IN IT. Equal flex truncated "Mechanical
            // keyboard" to "Mechanical ..." in the first proof while an id column two
            // characters wide sat in the same amount of space. Weighting by the longer of
            // the label and the value is the structural fix — real column values differ by
            // an order of magnitude in length and a fixed split can only ever suit one set.
            weight={Math.max((c.label ?? '').length, (c.sub ?? '').length, 3)}
            collapse={collapseKey && (c.label ?? '') === keyName ? merged : 0}
          />
        ))}
      </div>
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
            fontFamily: t.fonts.body, fontSize: (vertical ? 28 : 24) * scale,
            color: t.colors.muted, lineHeight: 1.35,
          }}>{d.premise}</div>
        ) : null}

        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'safe center', gap: (vertical ? 18 : 22) * scale, minHeight: 0,
        }}>
          {/* Wide: the rows travel toward each other along the x axis. Vertical: down the y
              axis — the "along" and "cross" axes swap, per the both-aspects rule. */}
          <div style={{
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            gap: travel,
            minWidth: 0, minHeight: 0,
          }}>
            <Card table={d.leftTable ?? 'left'} row={left} keyName={keyL}
                  accent={accentL} collapseKey={false} />
            {/* the RIGHT card loses its duplicate of the key — one row cannot carry the
                same column twice, and watching it close is the lesson */}
            <Card table={d.rightTable ?? 'right'} row={right} keyName={keyR}
                  accent={accentR} collapseKey />
          </div>

          {d.resultLabel ? (
            <div style={{
              display: 'flex', justifyContent: 'center', opacity: merged,
            }}>
              <span style={{
                fontFamily: t.fonts.mono, fontSize: (vertical ? 26 : 26) * scale,
                color: accentM,
                padding: `${5 * scale}px ${16 * scale}px`,
                borderRadius: radius,
                border: `1px solid ${hexA(accentM, 0.55)}`,
                background: hexA(accentM, 0.12),
                whiteSpace: 'nowrap',
              }}>{d.resultLabel}</span>
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
