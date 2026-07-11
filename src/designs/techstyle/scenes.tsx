import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {Card, GradTile, LiveBadge, Ring, TsHeadline, gradText} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — hero in a floating elevated card (gradient tile + ring), serif headline.
export const TsHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const bob = Math.sin(frame / 26) * 8 * scale;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 48 * scale}}>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps), position: 'relative', transform: `translateY(${bob}px)`}}>
          <Ring size={vertical ? 300 : 280} style={{left: '50%', top: '50%', transform: 'translate(-50%,-50%)'}} />
          <Card style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30 * scale}}>
            <GradTile size={vertical ? 176 : 164} radius={32}>
              <AssetIcon asset={d.heroAsset} size={(vertical ? 100 : 92) * scale} />
            </GradTile>
          </Card>
        </div>
      ) : null}
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.display,
          fontWeight: 600,
          fontSize: (vertical ? 80 : 94) * scale,
          letterSpacing: '-0.01em',
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '86%',
          lineHeight: 1.04,
        }}
      >
        {d.headline}
      </div>
      {d.subtext ? (
        <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) + 10, fps)}}>
          <LiveBadge label={d.subtext} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — elevated cards; the first is an inverted light spotlight.
export const TsStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <TsHeadline text={d.headline} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 40 * scale}}>
        {stats.map((stat, i) => {
          const inv = i === 0;
          return (
            <div key={i} style={{...stackIn(frame, wordToFrame(stat.atWord), fps)}}>
              <Card inverted={inv} style={{minWidth: (vertical ? 560 : 360) * scale, display: 'flex', flexDirection: 'column', gap: 16 * scale, alignItems: 'flex-start'}}>
                <div style={{fontFamily: t.fonts.mono, fontWeight: 600, fontSize: 22 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: inv ? '#5B6478' : t.colors.muted}}>{stat.kicker}</div>
                <div style={inv ? {fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 96 : 88) * scale, color: '#2F6BFF', fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '-0.02em'} : {...gradText(), fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 92 : 84) * scale, fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '-0.02em'}}>{stat.value}</div>
              </Card>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 116) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), fontFamily: t.fonts.display, fontWeight: 600, fontStyle: 'italic', fontSize: 34 * scale, color: t.colors.accent}}>
          {d.verdict.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — elevated cards with gradient number tiles.
export const TsStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <TsHeadline text={d.headline} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 30 * scale, alignItems: 'stretch'}}>
          {steps.map((step, i) => (
            <div key={i} style={{...springPop(frame, wordToFrame(step.atWord), fps)}}>
              <Card style={{width: (vertical ? 540 : 300) * scale, display: 'flex', flexDirection: 'column', gap: 18 * scale}}>
                <GradTile size={60} radius={16}>
                  <span style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: 30 * scale, color: '#fff'}}>{i + 1}</span>
                </GradTile>
                <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: 38 * scale, color: t.colors.text, lineHeight: 1.08, letterSpacing: '-0.01em'}}>{step.title}</div>
                {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.4}}>{step.sub}</div> : null}
              </Card>
            </div>
          ))}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.display, fontWeight: 600, fontStyle: 'italic', fontSize: 30 * scale, color: t.colors.accent}}>{d.caption.text}</div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — elevated rows with a gradient icon tile + live dot.
export const TsListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 22 * scale, padding: 86 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 600, fontSize: 58 * scale, letterSpacing: '-0.01em', color: t.colors.text, marginBottom: 14 * scale}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => (
        <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '70%'}}>
          <Card style={{padding: `${20 * scale}px ${26 * scale}px`, display: 'flex', alignItems: 'center', gap: 26 * scale}}>
            <GradTile size={68} radius={16}>
              <AssetIcon asset={item.icon} size={38 * scale} bare tint={t.colors.onAccent} on={t.colors.accent} />
            </GradTile>
            <div style={{display: 'flex', flexDirection: 'column', gap: 4 * scale, flex: 1}}>
              <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 38 : 36) * scale, color: t.colors.text, lineHeight: 1.2, letterSpacing: '-0.01em'}}>{item.text}</div>
              {item.detail ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 25 * scale, color: t.colors.muted}}>{item.detail}</div> : null}
            </div>
            <span style={{width: 12 * scale, height: 12 * scale, borderRadius: '50%', background: t.colors.accent3, boxShadow: `0 0 ${10 * scale}px ${t.colors.accent3}`}} />
          </Card>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant gradient number with a rotating ring behind it.
export const TsStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
      <div style={{...springPop(frame, start, fps), position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Ring size={vertical ? 560 : 620} style={{left: '50%', top: '50%', transform: 'translate(-50%,-50%)'}} />
        <div style={{position: 'absolute', width: 620 * scale, height: 620 * scale, borderRadius: '50%', background: 'radial-gradient(circle, rgba(61,110,255,0.20) 0%, transparent 66%)', filter: `blur(${34 * scale}px)`}} />
        <div style={{...gradText(), position: 'relative', fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 210 : 250) * scale, fontVariantNumeric: 'tabular-nums', lineHeight: 0.95, letterSpacing: '-0.03em'}}>
          {d.prefix ?? ''}{value}{d.suffix ?? ''}
        </div>
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 400, fontSize: 40 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '74%', lineHeight: 1.35}}>
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
