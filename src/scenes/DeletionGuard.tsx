import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// DELETION_GUARD — attempts travelling left-to-right at a target that sits behind
// a wall of guards. 'blocked' recoils at the wall, 'asks' stops ON the wall with a
// prompt, 'through' crosses it and the target dies. The target and the wall are up
// within 38 frames (LAW 8); the attempts are what the narration anchors.
export const DeletionGuard: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.deletionGuard;
  if (!d) return <AbsoluteFill />;

  const attempts = (d.attempts ?? []).slice(0, 4);
  const n = attempts.length;
  if (!n) return <AbsoluteFill />;

  const danger = sem(d.color ?? 'red');
  const green = sem('green');
  const orange = sem('orange');

  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 10;
  const per = 30;
  const baseIn = interpolate(frame, [4, 18], [0, 1], clamp);

  // has anything got through yet?
  let destroyed = false;
  let destroyFrame = 0;
  attempts.forEach((a, i) => {
    const s0 = start + i * per;
    if ((a.title ?? '') === 'through' && frame >= s0 + 16) {
      destroyed = true;
      destroyFrame = s0 + 16;
    }
  });
  const deathIn = destroyed ? interpolate(frame, [destroyFrame, destroyFrame + 14], [0, 1], clamp) : 0;

  const rowH = (vertical ? 128 : 104) * scale;
  const laneW = (vertical ? 560 : 720) * scale;
  const wallW = (vertical ? 26 : 30) * scale;
  const targetW = (vertical ? 300 : 380) * scale;
  const rad = 14 * scale * t.style.cornerRadius;

  const verdictColor = (v: string) => (v === 'through' ? danger : v === 'asks' ? orange : green);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'red'} /> : null}

      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          marginTop: d.headline ? (vertical ? 150 : 74) * scale : 0,
          opacity: baseIn,
        }}
      >
        {/* the attempts */}
        <div style={{width: laneW, display: 'flex', flexDirection: 'column', gap: 12 * scale}}>
          {attempts.map((a, i) => {
            const s0 = start + i * per;
            const v = a.title ?? 'blocked';
            const c = verdictColor(v);
            const go = interpolate(frame, [s0, s0 + 16], [0, 1], clamp);
            // blocked recoils: out to 0.8 then back to 0.55
            const travel =
              v === 'through' ? go : v === 'asks' ? go * 0.86 : go < 0.7 ? go : 0.7 - (go - 0.7) * 0.5;
            const live = frame >= s0;
            return (
              <div key={i} style={{height: rowH, position: 'relative'}}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: t.colors.panel,
                    border: `${2 * scale}px solid ${live ? hexA(c, 0.8) : t.colors.panelBorder}`,
                    borderRadius: rad,
                    padding: `${9 * scale}px ${14 * scale}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    opacity: live ? 1 : 0.4,
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
                    <span style={{fontFamily: t.fonts.mono, fontSize: (vertical ? 26 : 25) * scale, color: t.colors.text}}>
                      $ {a.label ?? ''}
                    </span>
                    {live ? (
                      <span
                        style={{
                          fontFamily: t.fonts.body,
                          fontSize: (vertical ? 17 : 16) * scale,
                          letterSpacing: 1.2,
                          fontWeight: 700,
                          color: c,
                          border: `${1.5 * scale}px solid ${hexA(c, 0.6)}`,
                          borderRadius: 6 * scale * t.style.cornerRadius,
                          padding: `${2 * scale}px ${7 * scale}px`,
                        }}
                      >
                        {/* `detail` overrides the badge word. rm's vocabulary
                            (REFUSED / PROMPTS) is wrong for tools that never ask —
                            dd has no guards at all, so it needs its own wording. */}
                        {a.detail ?? (v === 'through' ? 'NO GUARD' : v === 'asks' ? 'PROMPTS' : 'REFUSED')}
                      </span>
                    ) : null}
                  </div>
                  <div
                    style={{
                      marginTop: 3 * scale,
                      fontFamily: t.fonts.body,
                      fontSize: (vertical ? 20 : 19) * scale,
                      color: t.colors.muted,
                    }}
                  >
                    {a.sub ?? ''}
                  </div>
                </div>
                {/* the travelling probe */}
                {live ? (
                  <div
                    style={{
                      position: 'absolute',
                      right: -(wallW + 6 * scale),
                      top: '50%',
                      width: 12 * scale,
                      height: 12 * scale,
                      borderRadius: 999,
                      background: c,
                      transform: `translate(${-(1 - travel) * laneW * 0.5}px, -50%)`,
                      boxShadow: t.style.glow > 0 ? `0 0 ${14 * scale * t.style.glow}px ${c}` : undefined,
                    }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* the wall */}
        <div
          style={{
            width: wallW,
            margin: `0 ${10 * scale}px`,
            background: `repeating-linear-gradient(180deg, ${hexA(t.colors.muted, 0.5)} 0 ${10 * scale}px, transparent ${10 * scale}px ${20 * scale}px)`,
            borderLeft: `${2 * scale}px solid ${hexA(t.colors.muted, 0.55)}`,
            borderRight: `${2 * scale}px solid ${hexA(t.colors.muted, 0.55)}`,
          }}
        />

        {/* the target */}
        <div
          style={{
            width: targetW,
            alignSelf: 'center',
            background: t.colors.panel,
            border: `${2.5 * scale}px solid ${destroyed ? hexA(danger, 0.9) : hexA(green, 0.75)}`,
            borderRadius: rad,
            padding: `${24 * scale}px ${18 * scale}px`,
            textAlign: 'center',
            opacity: 1 - 0.5 * deathIn,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 25 : 24) * scale,
              color: t.colors.text,
              textDecoration: destroyed ? 'line-through' : 'none',
            }}
          >
            {d.target ?? ''}
          </div>
          <div
            style={{
              marginTop: 12 * scale,
              fontFamily: t.fonts.display,
              fontSize: (vertical ? 30 : 30) * scale,
              color: destroyed ? danger : green,
              fontWeight: t.style.displayWeight,
              letterSpacing: t.style.displayTracking,
            }}
          >
            {destroyed ? 'GONE' : 'INTACT'}
          </div>
          {destroyed ? (
            <div
              style={{
                marginTop: 6 * scale,
                fontFamily: t.fonts.body,
                fontSize: (vertical ? 20 : 19) * scale,
                color: danger,
              }}
            >
              no bin · no undo
            </div>
          ) : null}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
