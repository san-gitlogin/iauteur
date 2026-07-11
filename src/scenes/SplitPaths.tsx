import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {PathCard as PathCardType, Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {entranceStyle} from '../motion';
import {Headline, Kicker, Panel, Pill, SourceFooter, DottedConnector, useScale, useSem} from '../ui';

// Reference frame 5: one center router, two branch cards.
const PathCardView: React.FC<{card: PathCardType; anim?: string}> = ({card, anim}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  return (
    <div style={{...entranceStyle(anim ?? 'pop', frame, wordToFrame(card.atWord), fps)}}>
      <Panel
        color={card.color ?? 'green'}
        style={{
          width: (vertical ? 780 : 470) * scale,
          display: 'flex',
          flexDirection: 'column',
          gap: 16 * scale,
        }}
      >
        <div style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 32 * scale, color: t.colors.text, lineHeight: 1.3}}>
          {card.title}
        </div>
        {card.badge ? (
          <Pill
            text={card.badge.text}
            color={card.badge.color ?? 'blue'}
            maxWidth={(vertical ? 780 : 470) * scale - 68 * scale}
          />
        ) : null}
        {(card.lines ?? []).map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: t.fonts.mono,
              fontWeight: 600,
              fontSize: 28 * scale,
              color: line.color ? sem(line.color) : t.colors.muted,
              lineHeight: 1.4,
            }}
          >
            {line.text}
          </div>
        ))}
      </Panel>
    </div>
  );
};

export const SplitPaths: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const center = d.center;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={d.headlineColor ?? 'orange'} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: vertical ? 'column' : 'row',
          gap: 0,
          padding: 60 * scale,
        }}
      >
        {d.left ? <PathCardView card={d.left} anim={d.anim} /> : null}
        {d.left && center ? (
          <DottedConnector
            startFrame={wordToFrame(d.left.atWord) + 6}
            length={(vertical ? 60 : 90) * scale}
            vertical={vertical}
            color={d.left.color ?? 'green'}
          />
        ) : null}
        {center ? (
          <div style={{...entranceStyle(d.anim ?? 'pop', frame, wordToFrame(center.atWord), fps)}}>
            <Panel
              color={center.color ?? 'purple'}
              style={{display: 'flex', flexDirection: 'column', gap: 12 * scale, alignItems: 'center', padding: `${30 * scale}px ${44 * scale}px`}}
            >
              {center.kicker ? <Kicker text={center.kicker} color={center.color ?? 'purple'} size={20} /> : null}
              <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 38 * scale, color: t.colors.text}}>
                {center.title}
              </div>
            </Panel>
          </div>
        ) : null}
        {center && d.right ? (
          <DottedConnector
            startFrame={wordToFrame(d.right.atWord) - 10}
            length={(vertical ? 60 : 90) * scale}
            vertical={vertical}
            color={d.right.color ?? 'blue'}
          />
        ) : null}
        {d.right ? <PathCardView card={d.right} anim={d.anim} /> : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
