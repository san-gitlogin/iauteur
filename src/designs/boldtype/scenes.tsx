import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {Label, Hairline, BtHeadline} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — wide-tracked label, a massive headline (vermillion + underline), subtext.
export const BtHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 * scale, padding: `0 ${(vertical ? 90 : 170) * scale}px`}}>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps), marginBottom: 4 * scale}}>
          <AssetIcon asset={d.heroAsset} size={(vertical ? 110 : 100) * scale} />
        </div>
      ) : null}
      <Label style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) - 6, fps)}} color="red">An AI Search Manifesto</Label>
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.display,
          fontWeight: 700,
          fontSize: (vertical ? 100 : 128) * scale,
          letterSpacing: '-0.05em',
          textTransform: 'uppercase',
          color: t.colors.text,
          textAlign: 'center',
          lineHeight: 0.9,
        }}
      >
        {d.headline}
      </div>
      {d.subtext ? (
        <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) + 10, fps), fontFamily: t.fonts.body, fontWeight: 400, fontSize: 32 * scale, color: t.colors.muted, textAlign: 'center', maxWidth: '78%', lineHeight: 1.4}}>
          {d.subtext}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — extreme scale contrast: giant numbers, tiny wide-tracked labels.
export const BtStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <BtHeadline text={d.headline} size={vertical ? 64 : 72} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: `0 ${(vertical ? 80 : 150) * scale}px`}}>
        <div style={{width: '100%', display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'stretch'}}>
          {stats.map((stat, i) => (
            <React.Fragment key={i}>
              {vertical && i > 0 ? <Hairline style={{margin: `${24 * scale}px 0`}} /> : null}
              <div style={{...stackIn(frame, wordToFrame(stat.atWord), fps), flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * scale, padding: `${10 * scale}px ${30 * scale}px`, borderLeft: !vertical && i > 0 ? `${1 * scale}px solid ${t.colors.panelBorder}` : undefined}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 130 : 148) * scale, color: i === 0 ? sem(stat.color ?? 'red') : t.colors.text, fontVariantNumeric: 'tabular-nums', lineHeight: 0.85, letterSpacing: '-0.05em'}}>{stat.value}</div>
                <Label size={20} style={{textAlign: 'center'}}>{stat.kicker}</Label>
              </div>
            </React.Fragment>
          ))}
        </div>
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 120) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), fontFamily: t.fonts.display, fontWeight: 700, fontSize: 34 * scale, textTransform: 'uppercase', letterSpacing: '-0.02em', color: t.colors.accent}}>
          {d.verdict.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — huge index numbers with titles, hairline dividers.
export const BtStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <BtHeadline text={d.headline} size={vertical ? 64 : 72} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: `0 ${(vertical ? 80 : 150) * scale}px`}}>
        <div style={{width: '100%', display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'stretch'}}>
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              {vertical && i > 0 ? <Hairline style={{margin: `${24 * scale}px 0`}} /> : null}
              <div style={{...springPop(frame, wordToFrame(step.atWord), fps), flex: 1, display: 'flex', flexDirection: 'column', gap: 14 * scale, padding: `${10 * scale}px ${34 * scale}px`, borderLeft: !vertical && i > 0 ? `${1 * scale}px solid ${t.colors.panelBorder}` : undefined}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 110 : 128) * scale, color: t.colors.accent, lineHeight: 0.8, letterSpacing: '-0.05em'}}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 42 * scale, textTransform: 'uppercase', letterSpacing: '-0.02em', color: t.colors.text, lineHeight: 0.98}}>{step.title}</div>
                {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.35}}>{step.sub}</div> : null}
              </div>
            </React.Fragment>
          ))}
        </div>
      </AbsoluteFill>
      {d.caption ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 118) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.display, fontWeight: 700, fontSize: 30 * scale, textTransform: 'uppercase', letterSpacing: '-0.02em', color: t.colors.accent}}>{d.caption.text}</div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — big list rows, wide-tracked index, hairline dividers.
export const BtListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: `${108 * scale}px ${(vertical ? 80 : 180) * scale}px`}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 700, fontSize: 60 * scale, textTransform: 'uppercase', letterSpacing: '-0.03em', color: t.colors.text, marginBottom: 20 * scale, alignSelf: 'flex-start'}}>
          {scene.data.heading}
        </div>
      ) : null}
      <div style={{width: '100%'}}>
        <Hairline />
        {items.map((item, i) => (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 30 * scale, padding: `${22 * scale}px ${6 * scale}px`}}>
              <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: (vertical ? 26 : 24) * scale, letterSpacing: '0.16em', color: t.colors.accent, minWidth: (vertical ? 74 : 78) * scale}}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{width: 50 * scale, height: 50 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <AssetIcon asset={item.icon} size={40 * scale} bare on={t.colors.bg} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 2 * scale, flex: 1}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 44 : 44) * scale, textTransform: 'uppercase', letterSpacing: '-0.02em', color: t.colors.text, lineHeight: 1.0}}>{item.text}</div>
                {item.detail ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 25 * scale, color: t.colors.muted}}>{item.detail}</div> : null}
              </div>
            </div>
            <Hairline />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — an enormous vermillion number filling the frame, tiny label.
export const BtStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 * scale, padding: `0 ${(vertical ? 60 : 150) * scale}px`}}>
      <Label size={22} style={{...fadeUp(frame, start, fps)}} color="red">By the Numbers</Label>
      <div style={{...springPop(frame, start, fps), fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 300 : 380) * scale, color: t.colors.accent, fontVariantNumeric: 'tabular-nums', lineHeight: 0.82, letterSpacing: '-0.06em'}}>
        {d.prefix ?? ''}{value}{d.suffix ?? ''}
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 400, fontSize: 40 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '80%', lineHeight: 1.3, marginTop: 8 * scale}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 40 * scale, marginTop: 14 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <AssetIcon asset={lg} size={(vertical ? 60 : 54) * scale} />
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
