import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {springPop, fadeUp, stackIn} from '../anim';
import {Headline, Kicker, Panel, SourceFooter, AccentSpan, useScale, useSem, hexA} from '../ui';

// Reference frame 1: an AI-agent chat mockup + a side fact card.
export const ChatMockup: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const messages = d.messages ?? [];
  const panelColor = d.panelColor ?? 'purple';
  const firstAt = messages.length ? wordToFrame(messages[0].atWord) : 0;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={d.headlineColor ?? 'red'} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: vertical ? 'column' : 'row',
          gap: 60 * scale,
          padding: 70 * scale,
        }}
      >
        <div style={{...springPop(frame, Math.max(0, firstAt - 6), fps)}}>
          <Panel
            color={panelColor}
            style={{
              width: (vertical ? 900 : 860) * scale,
              display: 'flex',
              flexDirection: 'column',
              gap: 22 * scale,
              padding: `${34 * scale}px ${38 * scale}px`,
            }}
          >
            {d.panelLabel ? <Kicker text={d.panelLabel} color={panelColor} /> : null}
            {messages.map((m, i) => {
              const start = wordToFrame(m.atWord);
              const isUser = m.from === 'user';
              const tint = m.color ? sem(m.color) : null;
              return (
                <div
                  key={i}
                  style={{
                    ...stackIn(frame, start, fps),
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '86%',
                    background: tint ? hexA(tint, 0.09) : t.colors.softSurface,
                    border: tint ? `1.5px solid ${hexA(tint, 0.35)}` : `1.5px solid ${t.colors.panelBorder}`,
                    borderRadius: 14 * scale,
                    padding: `${20 * scale}px ${28 * scale}px`,
                    fontFamily: t.fonts.body,
                    fontSize: 32 * scale,
                    color: t.colors.text,
                    lineHeight: 1.4,
                  }}
                >
                  <AccentSpan text={m.text} color={m.color ?? 'red'} />
                </div>
              );
            })}
          </Panel>
        </div>
        {d.sideCard ? (
          <div style={{...fadeUp(frame, wordToFrame(d.sideCard.atWord), fps), display: 'flex', flexDirection: 'column', gap: 16 * scale}}>
            <Kicker text={d.sideCard.kicker} color={d.sideCard.kickerColor ?? null} />
            <Panel style={{display: 'flex', flexDirection: 'column', gap: 12 * scale, minWidth: (vertical ? 700 : 460) * scale}}>
              {d.sideCard.lines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: 29 * scale,
                    fontWeight: 600,
                    color: line.color ? sem(line.color) : t.colors.muted,
                  }}
                >
                  {line.text}
                </div>
              ))}
            </Panel>
          </div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
