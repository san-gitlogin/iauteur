import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {Panel, Screen, LED, Hazard, IndHeadline} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');
const LEDS: Array<'orange' | 'green' | 'yellow' | 'blue'> = ['orange', 'green', 'yellow', 'blue'];

// HOOK — hero mounted in a steel panel, mono status row, grotesk headline.
export const IndHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 46 * scale}}>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps)}}>
          <Panel style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Screen color="orange" style={{width: (vertical ? 220 : 208) * scale, height: (vertical ? 220 : 208) * scale, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
              <AssetIcon asset={d.heroAsset} size={(vertical ? 112 : 104) * scale} />
            </Screen>
          </Panel>
        </div>
      ) : null}
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.display,
          fontWeight: 800,
          fontSize: (vertical ? 76 : 90) * scale,
          textTransform: 'uppercase',
          letterSpacing: '-0.01em',
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '90%',
          lineHeight: 1.02,
        }}
      >
        {d.headline}
      </div>
      {d.subtext ? (
        <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) + 10, fps), display: 'flex', alignItems: 'center', gap: 14 * scale, fontFamily: t.fonts.mono, fontSize: 26 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.colors.muted}}>
          <LED color="orange" size={16} />
          {d.subtext}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — steel modules with recessed screens + mono labels + LEDs.
export const IndStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <IndHeadline text={d.headline} color={d.headlineColor ?? 'orange'} startFrame={0} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 44 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          const c = stat.color ?? LEDS[i % LEDS.length];
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <Panel style={{minWidth: (vertical ? 560 : 350) * scale, display: 'flex', flexDirection: 'column', gap: 18 * scale}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12 * scale}}>
                  <LED color={c} size={14} />
                  <div style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.colors.muted}}>{stat.kicker}</div>
                </div>
                <Screen color={c} style={{textAlign: 'center'}}>
                  <div style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: (vertical ? 88 : 80) * scale, color: sem(c), fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{stat.value}</div>
                </Screen>
              </Panel>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 116) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), fontFamily: t.fonts.mono, fontSize: 30 * scale, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.colors.accent}}>
          {d.verdict.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — numbered LED modules linked by a metal rail.
export const IndStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <IndHeadline text={d.headline} color={d.headlineColor ?? 'green'} startFrame={0} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 30 * scale, alignItems: 'stretch'}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            const c = step.color ?? LEDS[i % LEDS.length];
            return (
              <div key={i} style={{...springPop(frame, start, fps)}}>
                <Panel style={{width: (vertical ? 540 : 300) * scale, display: 'flex', flexDirection: 'column', gap: 16 * scale}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 14 * scale}}>
                    <Screen color={c} style={{width: 58 * scale, height: 58 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
                      <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 30 * scale, color: sem(c)}}>{i + 1}</span>
                    </Screen>
                    <LED color={c} size={16} />
                  </div>
                  <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: 38 * scale, textTransform: 'uppercase', letterSpacing: '-0.01em', color: t.colors.text, lineHeight: 1.05}}>{step.title}</div>
                  {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.35}}>{step.sub}</div> : null}
                </Panel>
              </div>
            );
          })}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.mono, fontSize: 28 * scale, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.colors.accent}}>{d.caption.text}</div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — panel rows with icon screen + LED + mono status.
export const IndListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 * scale, padding: 84 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 800, fontSize: 56 * scale, textTransform: 'uppercase', letterSpacing: '-0.01em', color: t.colors.text, marginBottom: 12 * scale}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => {
        const c = LEDS[i % LEDS.length];
        return (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '72%'}}>
            <Panel style={{padding: `${20 * scale}px ${26 * scale}px`, display: 'flex', alignItems: 'center', gap: 24 * scale}}>
              <Screen color={c} style={{minWidth: 72 * scale, width: 72 * scale, height: 72 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
                <AssetIcon asset={item.icon} size={40 * scale} bare tint={t.colors.sem[c]} on={'#141619'} />
              </Screen>
              <div style={{display: 'flex', flexDirection: 'column', gap: 4 * scale, flex: 1}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 38 : 36) * scale, textTransform: 'uppercase', letterSpacing: '-0.01em', color: t.colors.text, lineHeight: 1.15}}>{item.text}</div>
                {item.detail ? <div style={{fontFamily: t.fonts.mono, fontWeight: 500, fontSize: 23 * scale, letterSpacing: '0.05em', color: t.colors.muted}}>{item.detail}</div> : null}
              </div>
              <LED color={c} size={18} />
            </Panel>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant number on a recessed screen, hazard-framed.
export const IndStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const start = wordToFrame(d.atWord);
  const target = d.value ?? 0;
  const decimals = Number.isInteger(target) ? 0 : 1;
  const animated = counterValue(frame, start, Math.round(target * 10 ** decimals)) / 10 ** decimals;
  const value = decimals ? animated.toFixed(1) : formatNumber(animated);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 * scale}}>
      <div style={{...springPop(frame, start, fps)}}>
        <Panel style={{padding: `${34 * scale}px ${40 * scale}px`, display: 'flex', flexDirection: 'column', gap: 18 * scale, alignItems: 'stretch'}}>
          <Hazard style={{width: '100%', borderRadius: 3 * scale}} />
          <Screen color="orange" style={{padding: `${20 * scale}px ${56 * scale}px`}}>
            <div style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: (vertical ? 190 : 220) * scale, color: t.colors.accent, fontVariantNumeric: 'tabular-nums', lineHeight: 0.95, textAlign: 'center'}}>
              {d.prefix ?? ''}{value}{d.suffix ?? ''}
            </div>
          </Screen>
        </Panel>
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 600, fontSize: 42 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '78%', lineHeight: 1.3}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 22 * scale, marginTop: 6 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <Panel screws={false} style={{width: 104 * scale, height: 104 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
                <AssetIcon asset={lg} size={(vertical ? 60 : 54) * scale} />
              </Panel>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
