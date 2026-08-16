import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// INDEX_DRIFT — why a positional reference is a sandcastle. Two pointers start on
// the SAME row: one found it by index, one by meaning. The list re-orders, and the
// index pointer stays at its slot while the meaning pointer travels to wherever the
// target actually went. Both stay on screen throughout, because the divergence is
// the whole picture — one of them being right afterwards proves nothing on its own.
export const IndexDrift: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.indexDrift;
  if (!d) return <AbsoluteFill />;

  const before = (d.before ?? []).slice(0, 6);
  const after = (d.after ?? []).slice(0, 6);
  if (!before.length || !after.length) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'orange');
  const bad = sem('red');
  const ok = sem('green');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the list and BOTH pointers exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const shuffleAt = d.shuffleAtWord != null ? Math.max(wordToFrame(d.shuffleAtWord), base + 30) : base + 100;
  const shuffleP = interpolate(frame, [shuffleAt, shuffleAt + 26], [0, 1], clamp);
  const shuffled = shuffleP > 0.5;

  // which rows are on screen right now, and where the target sits in each ordering
  const labels = shuffled ? after : before.map((b) => b.label ?? '');
  const targetBefore = before.findIndex((b) => b.label === d.target);
  const targetAfter = after.indexOf(d.target ?? '');
  // the INDEX pointer never moves — that is the entire point
  const slot = Math.max(0, targetBefore);
  const meaningRow = shuffled ? (targetAfter >= 0 ? targetAfter : slot) : slot;

  const rowH = (vertical ? 58 : 56) * scale;
  const gap = 9 * scale;
  const rad = 14 * scale * t.style.cornerRadius;
  const listW = (vertical ? 620 : 700) * scale;
  const railW = (vertical ? 170 : 300) * scale;

  const topOf = (i: number) => i * (rowH + gap);

  const Pointer: React.FC<{row: number; label: string; note?: string; color: string; side: 'left' | 'right'}> = ({
    row, label, note, color, side,
  }) => (
    <div
      style={{
        position: 'absolute',
        top: topOf(row),
        height: rowH,
        [side]: 0,
        width: railW,
        display: 'flex',
        alignItems: 'center',
        justifyContent: side === 'left' ? 'flex-end' : 'flex-start',
        gap: 8 * scale,
        flexDirection: side === 'left' ? 'row' : 'row-reverse',
      }}
    >
      <div
        style={{
          minWidth: 0,
          padding: `${5 * scale}px ${12 * scale}px`,
          borderRadius: 8 * scale * t.style.cornerRadius,
          background: t.colors.bg,
          backgroundImage: `linear-gradient(${hexA(color, 0.18)}, ${hexA(color, 0.18)})`,
          border: `${1.5 * scale}px solid ${hexA(color, 0.7)}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: side === 'left' ? 'flex-end' : 'flex-start',
        }}
      >
        <span
          style={{
            fontFamily: t.fonts.mono,
            fontSize: (vertical ? 19 : 21) * scale,
            color,
            maxWidth: railW - 40 * scale,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        {note ? (
          <span
            style={{
              fontFamily: t.fonts.body,
              fontSize: (vertical ? 17 : 19) * scale,
              color: t.colors.muted,
              maxWidth: railW - 40 * scale,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {note}
          </span>
        ) : null}
      </div>
      <span style={{flexShrink: 0, fontFamily: t.fonts.mono, fontSize: 22 * scale, color}}>
        {side === 'left' ? '▸' : '◂'}
      </span>
    </div>
  );

  const indexHitsTarget = labels[slot] === d.target;

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'orange'} /> : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * scale, opacity: appear}}>
        {d.causeLabel ? (
          <div
            style={{
              padding: `${6 * scale}px ${15 * scale}px`,
              borderRadius: 8 * scale * t.style.cornerRadius,
              background: hexA(accent, 0.14 * shuffleP),
              border: `${1.5 * scale}px ${shuffled ? 'solid' : 'dashed'} ${hexA(accent, 0.3 + 0.45 * shuffleP)}`,
              fontFamily: t.fonts.body,
              fontSize: 22 * scale,
              color: shuffled ? accent : t.colors.muted,
              whiteSpace: 'nowrap',
            }}
          >
            {d.causeLabel}
          </div>
        ) : null}

        <div
          style={{
            position: 'relative',
            width: listW + railW * 2,
            height: labels.length * (rowH + gap) - gap,
          }}
        >
          {/* the rows, centred, with the two pointer rails either side */}
          {labels.map((lab, i) => {
            const isTarget = lab === d.target;
            const c = isTarget ? accent : t.colors.muted;
            return (
              <div
                key={`${lab}-${i}`}
                style={{
                  position: 'absolute',
                  top: topOf(i),
                  left: railW,
                  width: listW,
                  height: rowH,
                  boxSizing: 'border-box',
                  padding: `0 ${16 * scale}px`,
                  borderRadius: rad,
                  background: hexA(isTarget ? accent : t.colors.panelBorder, isTarget ? 0.14 : 0.3),
                  border: `${(isTarget ? 2 : 1.5) * scale}px solid ${hexA(c, isTarget ? 0.65 : 0.32)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12 * scale,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 26 * scale,
                    fontFamily: t.fonts.mono,
                    fontSize: 19 * scale,
                    color: hexA(t.colors.muted, 0.85),
                    textAlign: 'right',
                  }}
                >
                  {i}
                </span>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontFamily: t.fonts.body,
                    fontSize: (vertical ? 24 : 26) * scale,
                    color: isTarget ? accent : t.colors.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {lab}
                </span>
              </div>
            );
          })}

          {/* INDEX pointer — pinned to its slot forever */}
          <Pointer
            side="left"
            row={slot}
            label={d.indexLabel ?? '.nth(n)'}
            note={shuffled ? (indexHitsTarget ? undefined : d.brokenNote ?? 'points at a stranger') : undefined}
            color={shuffled && !indexHitsTarget ? bad : t.colors.muted}
          />
          {/* MEANING pointer — travels to wherever the target went */}
          <Pointer
            side="right"
            row={meaningRow}
            label={d.meaningLabel ?? 'filter(has_text=)'}
            note={shuffled ? d.heldNote ?? 'still finds it' : undefined}
            color={shuffled ? ok : t.colors.muted}
          />
        </div>
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
