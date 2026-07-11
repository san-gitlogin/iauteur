import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {Glass, Delta, CoinRing, CrHeadline, gradText, ORANGE_GOLD} from './primitives';
import {LineChart} from '../../charts';

const CR_CYCLE = ['orange', 'blue', 'green', 'purple', 'yellow', 'red'] as const;

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — hero in an orange coin-ring, gradient headline, mono glass subtext.
export const CrHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 48 * scale}}>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps)}}>
          <CoinRing size={vertical ? 236 : 220}>
            <AssetIcon asset={d.heroAsset} size={(vertical ? 108 : 100) * scale} />
          </CoinRing>
        </div>
      ) : null}
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.display,
          fontWeight: 700,
          fontSize: (vertical ? 78 : 92) * scale,
          letterSpacing: '-0.01em',
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '88%',
          lineHeight: 1.04,
        }}
      >
        {d.headline}
      </div>
      {d.subtext ? (
        <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) + 10, fps)}}>
          <Glass style={{padding: `${12 * scale}px ${28 * scale}px`, borderRadius: 999}}>
            <span style={{fontFamily: t.fonts.mono, fontWeight: 500, fontSize: 26 * scale, letterSpacing: '0.04em', color: t.colors.muted}}>{d.subtext}</span>
          </Glass>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — glass panels with gradient numbers + delta chips.
export const CrStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <CrHeadline text={d.headline} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 40 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          const showDelta = stat.value.includes('%');
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <Glass active={i === 0} style={{minWidth: (vertical ? 560 : 360) * scale, display: 'flex', flexDirection: 'column', gap: 16 * scale, alignItems: 'flex-start'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12 * scale, width: '100%'}}>
                  <div style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.colors.muted, flex: 1}}>{stat.kicker}</div>
                  {showDelta ? <Delta value={stat.value} /> : null}
                </div>
                <div style={{...gradText(), fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 92 : 84) * scale, fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '-0.02em'}}>{stat.value}</div>
              </Glass>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 116) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), fontFamily: t.fonts.display, fontWeight: 600, fontSize: 34 * scale, color: t.colors.accent}}>
          {d.verdict.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — glass panels with orange gradient number badges.
export const CrStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <CrHeadline text={d.headline} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 30 * scale, alignItems: 'stretch'}}>
          {steps.map((step, i) => (
            <div key={i} style={{...springPop(frame, wordToFrame(step.atWord), fps)}}>
              <Glass style={{width: (vertical ? 540 : 300) * scale, display: 'flex', flexDirection: 'column', gap: 18 * scale}}>
                <div style={{width: 60 * scale, height: 60 * scale, borderRadius: '50%', border: `${2 * scale}px solid rgba(247,147,26,0.5)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span style={{...gradText(), fontFamily: t.fonts.display, fontWeight: 700, fontSize: 32 * scale}}>{i + 1}</span>
                </div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 38 * scale, color: t.colors.text, lineHeight: 1.08, letterSpacing: '-0.01em'}}>{step.title}</div>
                {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.4}}>{step.sub}</div> : null}
              </Glass>
            </div>
          ))}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.display, fontWeight: 600, fontSize: 30 * scale, color: t.colors.accent}}>{d.caption.text}</div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — glass rows with an orange gradient icon holder.
export const CrListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 22 * scale, padding: 86 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 700, fontSize: 56 * scale, letterSpacing: '-0.01em', color: t.colors.text, marginBottom: 14 * scale}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => (
        <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '70%'}}>
          <Glass style={{padding: `${20 * scale}px ${26 * scale}px`, display: 'flex', alignItems: 'center', gap: 26 * scale}}>
            <div style={{minWidth: 70 * scale, width: 70 * scale, height: 70 * scale, borderRadius: 16 * scale, padding: 3 * scale, background: ORANGE_GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{width: '100%', height: '100%', borderRadius: 13 * scale, background: '#0B0C10', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <AssetIcon asset={item.icon} size={38 * scale} bare on={'#0B0C10'} />
              </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 4 * scale}}>
              <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 38 : 36) * scale, color: t.colors.text, lineHeight: 1.2, letterSpacing: '-0.01em'}}>{item.text}</div>
              {item.detail ? <div style={{fontFamily: t.fonts.mono, fontWeight: 400, fontSize: 24 * scale, letterSpacing: '0.02em', color: t.colors.muted}}>{item.detail}</div> : null}
            </div>
          </Glass>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant orange→gold gradient number with glow, mono label.
export const CrStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
        <div style={{position: 'absolute', width: 620 * scale, height: 620 * scale, borderRadius: '50%', background: 'radial-gradient(circle, rgba(247,147,26,0.22) 0%, transparent 66%)', filter: `blur(${30 * scale}px)`}} />
        <div style={{...gradText(), position: 'relative', fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 210 : 250) * scale, fontVariantNumeric: 'tabular-nums', lineHeight: 0.95, letterSpacing: '-0.03em'}}>
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
              <Glass style={{width: 100 * scale, height: 100 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
                <AssetIcon asset={lg} size={(vertical ? 58 : 52) * scale} />
              </Glass>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// LINE_CHART — a market-style line inside a glassmorphic panel.
export const CrLineChart: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const w = (vertical ? 880 : 1300) * scale;
  const h = (vertical ? 760 : 560) * scale;
  const series = d.lineChart?.series ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <CrHeadline text={d.headline} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 * scale, paddingTop: (vertical ? 140 : 90) * scale}}>
        <Glass active style={{padding: 20 * scale}}>
          {d.lineChart ? <LineChart data={d.lineChart} w={w} h={h} /> : null}
        </Glass>
        {series.length > 1 ? (
          <div style={{display: 'flex', gap: 32 * scale, flexWrap: 'wrap', justifyContent: 'center'}}>
            {series.map((s, i) => {
              const c = sem(s.color ?? CR_CYCLE[i % 3]);
              return (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
                  <div style={{width: 22 * scale, height: 6 * scale, borderRadius: 3, background: c}} />
                  <span style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: t.colors.muted}}>{s.label}</span>
                </div>
              );
            })}
          </div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
