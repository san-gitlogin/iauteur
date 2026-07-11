import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {fadeUp} from '../anim';
import {entranceStyle, pulse} from '../motion';
import {Headline, Kicker, Panel, Pill, SourceFooter, DottedConnector, useScale, useSem} from '../ui';

// Reference frame 2: step cards joined by dotted connectors + pill caption.
export const StepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={d.headlineColor ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'stretch'}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            return (
              <React.Fragment key={i}>
                {i > 0 ? (
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <DottedConnector
                      startFrame={Math.max(0, start - 8)}
                      length={(vertical ? 56 : 76) * scale}
                      vertical={vertical}
                      color={step.color ?? 'blue'}
                    />
                  </div>
                ) : null}
                <div style={{...entranceStyle(d.anim ?? 'pop', frame, start, fps)}}>
                  <div style={i === steps.length - 1 ? pulse(frame, {period: 64, amount: 0.014}) : undefined}>
                  <Panel
                    color={i === steps.length - 1 ? step.color ?? 'blue' : null}
                    style={{
                      width: (vertical ? 560 : 320) * scale,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12 * scale,
                    }}
                  >
                    {step.kicker ? <Kicker text={step.kicker} size={19} /> : null}
                    <div
                      style={{
                        fontFamily: t.fonts.mono,
                        fontWeight: 800,
                        fontSize: 40 * scale,
                        color: step.color ? sem(step.color) : t.colors.text,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {step.title}
                    </div>
                    {step.sub ? (
                      <div style={{fontFamily: t.fonts.body, fontSize: 27 * scale, color: t.colors.muted, lineHeight: 1.35}}>
                        {step.sub}
                      </div>
                    ) : null}
                  </Panel>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps)}}>
            <Pill text={d.caption.text} color={d.caption.color ?? 'orange'} maxWidth={(vertical ? 900 : 1100) * scale} />
          </div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
