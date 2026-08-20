import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// COPY_FORK — one card becoming two, then PROOF that they are independent. The
// duplicate slides out of the source on the anchor; afterwards an edit lands on
// exactly one of them and the other visibly keeps its old contents. Showing the
// divergence is the whole point — a card that just says "cp makes a copy" is not
// this component (LAW 0e-8).
export const CopyFork: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.copyFork;
  if (!d) return <AbsoluteFill />;

  const accent = sem(d.color ?? 'green');
  const muted = sem('blue');

  const forkAt = Math.min(wordToFrame(d.atWord ?? 1), 38) + 12;
  const fork = spring({frame: frame - forkAt, fps, config: {damping: 200}});
  const editAt = forkAt + 46;
  const edited = Boolean(d.after) && frame >= editAt;
  const editIn = interpolate(frame, [editAt, editAt + 12], [0, 1], clamp);

  const baseIn = interpolate(frame, [4, 18], [0, 1], clamp);
  const cardW = (vertical ? 400 : 440) * scale;
  const cardH = (vertical ? 260 : 240) * scale;
  const rad = 14 * scale * t.style.cornerRadius;
  const editSource = Boolean(d.editSource);

  const card = (name: string, body: string, c: string, isEdited: boolean, shift: number, op: number) => (
    <div
      style={{
        width: cardW,
        height: cardH,
        background: t.colors.panel,
        border: `${2.5 * scale}px solid ${hexA(c, 0.85)}`,
        borderRadius: rad,
        padding: `${18 * scale}px ${20 * scale}px`,
        boxSizing: 'border-box',
        transform: `translateX(${shift}px)`,
        opacity: op,
        boxShadow: t.style.glow > 0 ? `0 0 ${18 * scale * t.style.glow}px ${hexA(c, 0.25)}` : undefined,
      }}
    >
      <div style={{fontFamily: t.fonts.mono, fontSize: (vertical ? 28 : 27) * scale, color: c, fontWeight: 700}}>
        {name}
      </div>
      <div
        style={{
          marginTop: 16 * scale,
          fontFamily: t.fonts.mono,
          fontSize: (vertical ? 24 : 23) * scale,
          color: t.colors.text,
          lineHeight: 1.4,
        }}
      >
        {body}
      </div>
      {isEdited ? (
        <div
          style={{
            marginTop: 12 * scale,
            display: 'inline-block',
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 17 : 16) * scale,
            letterSpacing: 1.2,
            fontWeight: 700,
            color: sem('orange'),
            border: `${1.5 * scale}px solid ${hexA(sem('orange'), 0.6)}`,
            borderRadius: 6 * scale * t.style.cornerRadius,
            padding: `${2 * scale}px ${8 * scale}px`,
            opacity: editIn,
          }}
        >
          EDITED
        </div>
      ) : null}
    </div>
  );

  const srcBody = edited && editSource ? (d.after ?? '') : (d.before ?? '');
  const cpyBody = edited && !editSource ? (d.after ?? '') : (d.before ?? '');

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'green'} /> : null}

      <div style={{marginTop: d.headline ? (vertical ? 140 : 66) * scale : 0, opacity: baseIn}}>
        {/* the command */}
        <div
          style={{
            textAlign: 'center',
            fontFamily: t.fonts.mono,
            fontSize: (vertical ? 28 : 27) * scale,
            color: fork > 0.05 ? accent : t.colors.muted,
            marginBottom: 26 * scale,
          }}
        >
          $ {d.command ?? ''}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            gap: (vertical ? 22 : 40) * scale,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {card(d.source ?? '', srcBody, edited && editSource ? sem('orange') : accent, edited && editSource, 0, 1)}
          {card(
            d.copy ?? '',
            cpyBody,
            edited && !editSource ? sem('orange') : muted,
            edited && !editSource,
            vertical ? 0 : (1 - fork) * -70 * scale,
            fork,
          )}
        </div>

        {/* the independence verdict */}
        <div
          style={{
            marginTop: 26 * scale,
            textAlign: 'center',
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 27 : 26) * scale,
            color: edited ? t.colors.text : 'transparent',
            opacity: edited ? editIn : 0,
            minHeight: 34 * scale,
          }}
        >
          {edited ? 'Two separate files from the moment of the copy.' : ''}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
