import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {Card, Glow, Hairline, Kicker, SdHeadline} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — hero in a calm card over an ambient amber glow, clean headline.
export const SdHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 52 * scale}}>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps), position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Glow size={420} style={{left: '50%', top: '50%', transform: 'translate(-50%,-50%)'}} />
          <Card style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: (vertical ? 236 : 220) * scale, height: (vertical ? 236 : 220) * scale}}>
            <AssetIcon asset={d.heroAsset} size={(vertical ? 112 : 104) * scale} />
          </Card>
        </div>
      ) : null}
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.display,
          fontWeight: 600,
          fontSize: (vertical ? 76 : 88) * scale,
          letterSpacing: '-0.02em',
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '84%',
          lineHeight: 1.08,
        }}
      >
        {d.headline}
      </div>
      {d.subtext ? (
        <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) + 10, fps), fontFamily: t.fonts.body, fontWeight: 400, fontSize: 30 * scale, color: t.colors.muted, textAlign: 'center', maxWidth: '66%', lineHeight: 1.5}}>
          {d.subtext}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — minimal slate cards: mono kicker, big number (amber key stat).
export const SdStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <SdHeadline text={d.headline} color={d.headlineColor ?? 'orange'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 40 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          const c = stat.color ?? (i === 0 ? 'orange' : undefined);
          return (
            <div key={i} style={{...stackIn(frame, start, fps), position: 'relative'}}>
              {c === 'orange' ? <Glow size={320} style={{left: '50%', top: '50%', transform: 'translate(-50%,-50%)'}} /> : null}
              <Card style={{position: 'relative', minWidth: (vertical ? 560 : 360) * scale, display: 'flex', flexDirection: 'column', gap: 18 * scale, alignItems: 'flex-start'}}>
                <Kicker>{stat.kicker}</Kicker>
                <Hairline />
                <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 92 : 84) * scale, color: c ? sem(c) : t.colors.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '-0.02em'}}>{stat.value}</div>
              </Card>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 116) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), fontFamily: t.fonts.body, fontSize: 32 * scale, color: t.colors.accent}}>
          {d.verdict.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — numbered amber-outline cards linked by a thin line.
export const SdStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <SdHeadline text={d.headline} color={d.headlineColor ?? 'orange'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 30 * scale, alignItems: 'stretch'}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            return (
              <div key={i} style={{...springPop(frame, start, fps)}}>
                <Card style={{width: (vertical ? 540 : 300) * scale, display: 'flex', flexDirection: 'column', gap: 18 * scale}}>
                  <div style={{width: 56 * scale, height: 56 * scale, borderRadius: '50%', border: `${2 * scale}px solid ${t.colors.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <span style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: 28 * scale, color: t.colors.accent}}>{i + 1}</span>
                  </div>
                  <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: 38 * scale, color: t.colors.text, lineHeight: 1.1, letterSpacing: '-0.01em'}}>{step.title}</div>
                  {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.4}}>{step.sub}</div> : null}
                </Card>
              </div>
            );
          })}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.body, fontSize: 30 * scale, color: t.colors.accent}}>{d.caption.text}</div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — clean rows with the icon in a subtle rounded square.
export const SdListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 * scale, padding: 88 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 600, fontSize: 54 * scale, letterSpacing: '-0.02em', color: t.colors.text, marginBottom: 16 * scale}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => (
        <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '70%'}}>
          <Card style={{padding: `${20 * scale}px ${26 * scale}px`, display: 'flex', alignItems: 'center', gap: 26 * scale}}>
            <div style={{minWidth: 68 * scale, width: 68 * scale, height: 68 * scale, borderRadius: 16 * scale, background: '#1A1A24', border: `${1 * scale}px solid ${t.colors.panelBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <AssetIcon asset={item.icon} size={38 * scale} bare on={'#1A1A24'} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 4 * scale}}>
              <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 38 : 36) * scale, color: t.colors.text, lineHeight: 1.2, letterSpacing: '-0.01em'}}>{item.text}</div>
              {item.detail ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 25 * scale, color: t.colors.muted}}>{item.detail}</div> : null}
            </div>
          </Card>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant number over an ambient amber glow, small label.
export const SdStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 36 * scale}}>
      <div style={{...springPop(frame, start, fps), position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Glow size={620} style={{left: '50%', top: '50%', transform: 'translate(-50%,-50%)'}} />
        <div style={{position: 'relative', fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 210 : 250) * scale, color: t.colors.accent, fontVariantNumeric: 'tabular-nums', lineHeight: 0.95, letterSpacing: '-0.03em'}}>
          {d.prefix ?? ''}{value}{d.suffix ?? ''}
        </div>
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 400, fontSize: 40 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '72%', lineHeight: 1.35}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 20 * scale, marginTop: 8 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <Card style={{width: 100 * scale, height: 100 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
                <AssetIcon asset={lg} size={(vertical ? 58 : 52) * scale} />
              </Card>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
