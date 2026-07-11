import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {Rule, DoubleRule, SmallCaps, FigTag, BsHeadline} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — small-caps kicker between rules, large Playfair headline, italic subtext.
export const BsHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 * scale, padding: `0 ${(vertical ? 120 : 220) * scale}px`}}>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps), display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 * scale}}>
          <AssetIcon asset={d.heroAsset} size={(vertical ? 116 : 108) * scale} />
        </div>
      ) : null}
      <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) - 6, fps), width: (vertical ? 300 : 360) * scale, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 * scale}}>
        <DoubleRule />
        <SmallCaps size={20}>An AI Search Brief</SmallCaps>
      </div>
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.display,
          fontWeight: 700,
          fontSize: (vertical ? 84 : 100) * scale,
          color: t.colors.text,
          textAlign: 'center',
          lineHeight: 1.02,
        }}
      >
        {d.headline}
      </div>
      {d.subtext ? (
        <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) + 10, fps), fontFamily: t.fonts.body, fontStyle: 'italic', fontSize: 34 * scale, color: t.colors.muted, textAlign: 'center', maxWidth: '80%', lineHeight: 1.4}}>
          {d.subtext}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — an editorial ruled table: columns split by vertical hairlines.
export const BsStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <BsHeadline text={d.headline} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: `0 ${(vertical ? 90 : 150) * scale}px`}}>
        <div style={{width: '100%', maxWidth: (vertical ? 900 : 1400) * scale}}>
          <DoubleRule style={{marginBottom: 40 * scale}} />
          <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'stretch'}}>
            {stats.map((stat, i) => (
              <React.Fragment key={i}>
                {vertical && i > 0 ? <Rule style={{margin: `${20 * scale}px 0`}} /> : null}
                <div style={{...stackIn(frame, wordToFrame(stat.atWord), fps), flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 * scale, padding: `${10 * scale}px ${30 * scale}px`, borderLeft: !vertical && i > 0 ? `${1 * scale}px solid ${t.colors.panelBorder}` : undefined}}>
                  <FigTag n={i + 1} />
                  <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 104 : 112) * scale, color: i === 0 ? sem(stat.color ?? 'orange') : t.colors.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{stat.value}</div>
                  <SmallCaps size={20} color={undefined} style={{color: t.colors.muted, textAlign: 'center'}}>{stat.kicker}</SmallCaps>
                </div>
              </React.Fragment>
            ))}
          </div>
          <DoubleRule style={{marginTop: 40 * scale}} />
        </div>
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 120) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 36 * scale, color: t.colors.accent}}>
          {d.verdict.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — numbered editorial entries divided by hairline rules.
export const BsStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <BsHeadline text={d.headline} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: `0 ${(vertical ? 90 : 160) * scale}px`}}>
        <div style={{width: '100%', maxWidth: (vertical ? 900 : 1400) * scale, display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 0, alignItems: 'stretch'}}>
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              {vertical && i > 0 ? <Rule style={{margin: `${22 * scale}px 0`}} /> : null}
              <div style={{...springPop(frame, wordToFrame(step.atWord), fps), flex: 1, display: 'flex', flexDirection: 'column', gap: 14 * scale, padding: `${10 * scale}px ${34 * scale}px`, borderLeft: !vertical && i > 0 ? `${1 * scale}px solid ${t.colors.panelBorder}` : undefined}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 76 : 88) * scale, color: t.colors.accent, lineHeight: 0.9}}>{String(i + 1).padStart(2, '0')}</div>
                <Rule color={t.colors.accent} style={{width: 60 * scale}} />
                <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 40 * scale, color: t.colors.text, lineHeight: 1.05}}>{step.title}</div>
                {step.sub ? <div style={{fontFamily: t.fonts.body, fontSize: 27 * scale, color: t.colors.muted, lineHeight: 1.4}}>{step.sub}</div> : null}
              </div>
            </React.Fragment>
          ))}
        </div>
      </AbsoluteFill>
      {d.caption ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 118) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 32 * scale, color: t.colors.accent}}>{d.caption.text}</div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — a ruled editorial list: small-caps index, hairline dividers.
export const BsListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: `${110 * scale}px ${(vertical ? 90 : 200) * scale}px`}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 700, fontSize: 60 * scale, color: t.colors.text, marginBottom: 24 * scale, alignSelf: 'center', textAlign: 'center'}}>
          {scene.data.heading}
        </div>
      ) : null}
      <div style={{width: '100%'}}>
        <Rule />
        {items.map((item, i) => (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 30 * scale, padding: `${22 * scale}px ${6 * scale}px`}}>
              <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 48 : 46) * scale, color: t.colors.accent, minWidth: (vertical ? 80 : 84) * scale}}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{width: 50 * scale, height: 50 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <AssetIcon asset={item.icon} size={40 * scale} bare on={t.colors.bg} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 2 * scale, flex: 1}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 40 : 40) * scale, color: t.colors.text, lineHeight: 1.1}}>{item.text}</div>
                {item.detail ? <div style={{fontFamily: t.fonts.body, fontSize: 26 * scale, color: t.colors.muted}}>{item.detail}</div> : null}
              </div>
            </div>
            <Rule />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant Playfair number flanked by rules, small-caps label.
export const BsStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26 * scale, padding: `0 ${(vertical ? 90 : 200) * scale}px`}}>
      <SmallCaps size={22} style={{...fadeUp(frame, start, fps)}}>By the Numbers</SmallCaps>
      <div style={{...springPop(frame, start, fps), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 * scale, width: '100%'}}>
        <DoubleRule style={{width: (vertical ? 420 : 560) * scale}} />
        <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 220 : 260) * scale, color: t.colors.accent, fontVariantNumeric: 'tabular-nums', lineHeight: 0.95}}>
          {d.prefix ?? ''}{value}{d.suffix ?? ''}
        </div>
        <DoubleRule style={{width: (vertical ? 420 : 560) * scale}} />
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontStyle: 'italic', fontSize: 40 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '80%', lineHeight: 1.35}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 40 * scale, marginTop: 10 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <AssetIcon asset={lg} size={(vertical ? 62 : 56) * scale} />
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
