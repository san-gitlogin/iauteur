import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// LINK_PAIR — names on the left, one data block on the right, arrows between.
// A hard link lands on the data itself and counts toward its link count; a
// symbolic link lands on ANOTHER NAME, which is why deleting that name breaks it
// and does not break the hard links. The whole diagram is up within 38 frames
// (LAW 8); only the deletion is anchored to the narration.
export const LinkPair: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.linkPair;
  if (!d) return <AbsoluteFill />;

  const links = (d.links ?? []).slice(0, 4);
  const n = links.length;
  if (!n) return <AbsoluteFill />;

  const accent = sem(d.color ?? 'blue');
  const red = sem('red');
  const green = sem('green');
  const hardIdx = links.findIndex((l) => (l.title ?? 'hard') !== 'sym');
  const origin = d.origin ?? links[hardIdx >= 0 ? hardIdx : 0]?.label ?? '';

  const breakAt = Math.min(wordToFrame(d.atWord ?? 1), 38) + 14;
  const broke = Boolean(d.breakOrigin) && frame >= breakAt;
  const breakIn = interpolate(frame, [breakAt, breakAt + 12], [0, 1], clamp);

  const baseIn = interpolate(frame, [4, 18], [0, 1], clamp);

  const hardCount = links.filter((l) => (l.title ?? 'hard') !== 'sym').length;
  const liveCount = broke ? Math.max(0, hardCount - 1) : hardCount;

  const rowH = (vertical ? 150 : 122) * scale;
  const nameW = (vertical ? 430 : 470) * scale;
  const gapW = (vertical ? 140 : 260) * scale;
  const dataW = (vertical ? 330 : 380) * scale;
  const rad = 14 * scale * t.style.cornerRadius;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: d.headline ? (vertical ? 150 : 74) * scale : 0,
          opacity: baseIn,
        }}
      >
        {/* the names */}
        <div style={{width: nameW, display: 'flex', flexDirection: 'column', gap: 14 * scale}}>
          {links.map((l, i) => {
            const isSym = (l.title ?? 'hard') === 'sym';
            const isOrigin = l.label === origin;
            const dead = broke && isOrigin;
            const dangling = broke && isSym;
            const c = dead ? red : dangling ? red : isSym ? sem('purple') : accent;
            return (
              <div
                key={i}
                style={{
                  height: rowH - 14 * scale,
                  background: t.colors.panel,
                  border: `${2 * scale}px solid ${hexA(c, dead ? 0.5 : 0.85)}`,
                  borderRadius: rad,
                  padding: `${10 * scale}px ${16 * scale}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  opacity: dead ? 1 - 0.55 * breakIn : 1,
                  boxSizing: 'border-box',
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
                  <span
                    style={{
                      fontFamily: t.fonts.mono,
                      fontSize: (vertical ? 30 : 28) * scale,
                      color: t.colors.text,
                      textDecoration: dead ? 'line-through' : 'none',
                    }}
                  >
                    {l.label ?? ''}
                  </span>
                  <span
                    style={{
                      fontFamily: t.fonts.body,
                      fontSize: (vertical ? 18 : 16) * scale,
                      letterSpacing: 1.2,
                      fontWeight: 700,
                      color: c,
                      border: `${1.5 * scale}px solid ${hexA(c, 0.6)}`,
                      borderRadius: 6 * scale * t.style.cornerRadius,
                      padding: `${2 * scale}px ${7 * scale}px`,
                    }}
                  >
                    {isSym ? 'SYM' : 'HARD'}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 4 * scale,
                    fontFamily: t.fonts.body,
                    fontSize: (vertical ? 21 : 19) * scale,
                    color: dangling ? red : t.colors.muted,
                  }}
                >
                  {dangling ? 'dangling — target gone' : dead ? 'deleted' : l.sub ?? ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* arrows */}
        <div style={{width: gapW, display: 'flex', flexDirection: 'column', gap: 14 * scale}}>
          {links.map((l, i) => {
            const isSym = (l.title ?? 'hard') === 'sym';
            const dangling = broke && isSym;
            // A deleted NAME no longer references the data — its arrow has to go,
            // otherwise the picture says the link survived the deletion.
            const dead = broke && l.label === origin && !isSym;
            const c = dangling ? red : isSym ? sem('purple') : accent;
            return (
              <div key={i} style={{height: rowH - 14 * scale, display: 'flex', alignItems: 'center'}}>
                <div
                  style={{
                    height: Math.max(2, 2.5 * scale),
                    flex: 1,
                    background: dangling
                      ? `repeating-linear-gradient(90deg, ${c} 0 ${8 * scale}px, transparent ${8 * scale}px ${16 * scale}px)`
                      : hexA(c, 0.85),
                    opacity: dead ? 0.12 * (1 - breakIn) : dangling ? 0.9 : 1,
                  }}
                />
                <span
                  style={{
                    color: c,
                    fontSize: (vertical ? 26 : 24) * scale,
                    marginLeft: 3 * scale,
                    opacity: dead ? 1 - breakIn : 1,
                  }}
                >
                  {dangling ? '✕' : '▶'}
                </span>
              </div>
            );
          })}
        </div>

        {/* the data block */}
        <div
          style={{
            width: dataW,
            background: t.colors.panel,
            border: `${2.5 * scale}px solid ${hexA(green, 0.8)}`,
            borderRadius: rad,
            padding: `${22 * scale}px ${18 * scale}px`,
            textAlign: 'center',
            boxShadow: t.style.glow > 0 ? `0 0 ${22 * scale * t.style.glow}px ${hexA(green, 0.3)}` : undefined,
            boxSizing: 'border-box',
          }}
        >
          <div style={{fontFamily: t.fonts.mono, fontSize: (vertical ? 24 : 23) * scale, color: t.colors.text}}>
            {d.inode ?? ''}
          </div>
          <div
            style={{
              marginTop: 14 * scale,
              fontFamily: t.fonts.display,
              fontSize: (vertical ? 64 : 68) * scale,
              color: green,
              fontWeight: t.style.displayWeight,
            }}
          >
            {liveCount}
          </div>
          <div
            style={{
              fontFamily: t.fonts.body,
              fontSize: (vertical ? 19 : 18) * scale,
              color: t.colors.muted,
              letterSpacing: 1.1,
            }}
          >
            LINK COUNT
          </div>
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
