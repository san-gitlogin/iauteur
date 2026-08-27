import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {Headline, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';
import {useTheme, wordToFrame} from '../themes';

// DB_TWO_WAYS — what you have to stand up before you can store a row.
//
// The object (LAW 0n): a PILE that grows, beside a thing that is already finished. The left
// column assembles itself as the narration names each piece — a machine, a service that has to
// stay running, a port, credentials — so the cost accumulates in front of the viewer. The right
// column is one file, complete from frame zero, with its real byte count on it.
//
// The asymmetry is the whole argument. Nothing on screen says "SQLite is simpler", because a
// component that has to assert its own point is a card (LAW 0j).
//
// Each part carries its OWN atWord and is resolved by a pure helper — never a fixed interval,
// and never a hook inside a .map() (LAW 0i rule 1).
export const DbTwoWays: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.dbTwoWays;
  if (!d) return <AbsoluteFill />;

  const parts = (d.serverParts ?? []).slice(0, 5);
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // PURE: resolves one element's own anchor. Called from inside a map, so it must not be a hook.
  const liveAt = (atWord?: number) => {
    const f = wordToFrame(atWord ?? d.atWord ?? 1);
    return interpolate(frame, [f, f + 12], [0, 1],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  };

  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;
  const body = stageH - premiseH;

  const radius = 14 * scale * t.style.cornerRadius;
  const headH = (vertical ? 54 : 50) * scale;
  const cols = vertical ? 1 : 2;
  const colBudget = vertical ? (body - (26 * scale)) / 2 : body;
  const n = Math.max(parts.length, 1);
  const rowGap = (vertical ? 8 : 12) * scale;
  const rowH = Math.max((vertical ? 46 : 56) * scale,
    Math.min((colBudget - headH - rowGap * (n - 1) - 16 * scale) / n, (vertical ? 84 : 110) * scale));
  const rowFont = Math.min(rowH * 0.32, (vertical ? 25 : 28) * scale);

  const warm = sem('orange');
  const cool = sem('green');

  const Column: React.FC<{children: React.ReactNode; label: string; accent: string}> =
    ({children, label, accent}) => (
      <div style={{
        flex: 1, minWidth: 0, minHeight: 0,
        height: vertical ? colBudget : undefined,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          height: headH, display: 'flex', alignItems: 'center',
          fontFamily: t.fonts.display,
          fontSize: Math.min(headH * 0.52, (vertical ? 30 : 32) * scale),
          color: accent, letterSpacing: 0.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{label}</div>
        <div style={{
          flex: 1, minHeight: 0, display: 'flex',
          // column-reverse so the FIRST requirement is the foundation at the bottom and the
          // pile grows upward, the way the narration describes it.
          flexDirection: 'column-reverse',
          gap: rowGap, justifyContent: 'safe center',
        }}>{children}</div>
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
          flex: 1, minHeight: 0, display: 'flex',
          flexDirection: cols === 1 ? 'column' : 'row',
          gap: (vertical ? 26 : 52) * scale,
        }}>
          {/* THE PILE — each requirement lands at its own word and stays. */}
          <Column label={d.serverLabel ?? 'a database server'} accent={warm}>
            {/* A TOWER, NOT A LIST. The first version rendered these as four rows that lit up
                in order, which is precisely the shape LAW 0n's corollary names: "a list-shaped
                data model becomes a list on screen". Standing up a server HAS a shape — every
                piece has to be under the next one before anything can sit on top. So the parts
                are slabs, laid bottom-up (column-reverse), each narrower than the one beneath
                it, dropping into place from above at its own word. Beside one finished file,
                the tower argues for itself. */}
            {parts.map((p, i) => {
              const on = liveAt(p.atWord);
              return (
                <div key={i} style={{
                  height: rowH, display: 'flex', alignItems: 'center',
                  gap: 12 * scale, padding: `0 ${14 * scale}px`,
                  width: `${100 - i * 7}%`,
                  alignSelf: 'center',
                  borderRadius: radius,
                  border: `1px solid ${hexA(on > 0.5 ? warm : t.colors.panelBorder, on > 0.5 ? 0.55 : 0.22)}`,
                  background: on > 0.5 ? hexA(warm, 0.08 + i * 0.02) : hexA(t.colors.panel, 0.5),
                  // Each slab DROPS onto the pile from above, so the tower is seen being
                  // built rather than appearing already built.
                  transform: `translateY(${-(1 - on) * (vertical ? 22 : 30) * scale}px)`,
                  boxShadow: on > 0.5 && t.style.glow > 0
                    ? `0 ${3 * scale}px ${10 * scale * t.style.glow}px ${hexA('#000000', 0.45)}` : 'none',
                  opacity: appear * (0.18 + 0.82 * on),
                  minWidth: 0, flex: '0 0 auto',
                }}>
                  <AssetIcon
                    asset={p.asset ?? 'lucide:box'}
                    size={rowH * 0.44}
                    tint={on > 0.5 ? warm : t.colors.muted}
                    on={t.colors.panel}
                    bare
                  />
                  <span style={{
                    fontFamily: t.fonts.body, fontSize: rowFont,
                    color: on > 0.5 ? t.colors.text : t.colors.muted,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{p.label ?? ''}</span>
                </div>
              );
            })}
          </Column>

          {/* THE FILE — one object, finished, from the first frame. Its size is a real
              number read off disk (LAW 0m), not an adjective. */}
          <Column label={d.fileLabel ?? 'SQLite'} accent={cool}>
            <div style={{
              flex: '0 0 auto',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'safe center', gap: 12 * scale,
              padding: `${(vertical ? 20 : 30) * scale}px ${18 * scale}px`,
              borderRadius: radius,
              border: `2px solid ${hexA(cool, 0.55)}`,
              background: hexA(cool, 0.07),
              boxShadow: t.style.glow > 0
                ? `0 0 ${26 * scale * t.style.glow}px ${hexA(cool, 0.20)}` : 'none',
              opacity: appear, minWidth: 0,
            }}>
              <AssetIcon asset="lucide:file" size={(vertical ? 74 : 92) * scale}
                         tint={cool} on={t.colors.panel} bare />
              <span style={{
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 32 : 36) * scale,
                color: t.colors.text,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}>{d.fileName ?? ''}</span>
              {d.fileSize ? (
                <span style={{
                  fontFamily: t.fonts.mono,
                  fontSize: (vertical ? 26 : 28) * scale,
                  color: cool,
                  padding: `${3 * scale}px ${12 * scale}px`,
                  borderRadius: radius,
                  border: `1px solid ${hexA(cool, 0.5)}`,
                  whiteSpace: 'nowrap',
                }}>{d.fileSize}</span>
              ) : null}
              {d.fileNote ? (
                <span style={{
                  fontFamily: t.fonts.body,
                  fontSize: (vertical ? 24 : 23) * scale,
                  color: t.colors.muted, textAlign: 'center', lineHeight: 1.3,
                  maxWidth: (vertical ? 420 : 340) * scale,
                }}>{d.fileNote}</span>
              ) : null}
            </div>
          </Column>
        </div>
      </div>
    </AbsoluteFill>
  );
};
