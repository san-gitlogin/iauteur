import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {springPop, fadeUp, stackIn, counterValue} from '../../anim';
import {Kicker, Pill, SourceFooter, DottedConnector, useScale, useSem, hexA} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {CyberPanel, GlitchHeadline} from './primitives';
import {LineChart, Donut} from '../../charts';
import {HookStage} from '../../hookStage';

const CHART_CYCLE = ['blue', 'purple', 'green', 'orange', 'yellow', 'red'] as const;

const formatNumber = (n: number) => n.toLocaleString('en-US');

// TITLE_CARD — rgb-split glitch title over a drawing-in neon rule + mono subtitle.
export const CyberTitleCard: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const barW = interpolate(frame, [8, 26], [0, (vertical ? 320 : 440) * scale], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 * scale, padding: 80 * scale}}>
      <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: (vertical ? 82 : 104) * scale, letterSpacing: '0.04em', color: t.colors.text, textAlign: 'center', maxWidth: '90%', textShadow: `2px 0 ${hexA('#ff0033', 0.7)}, -2px 0 ${hexA('#00d4ff', 0.7)}, 0 0 ${28 * scale}px ${hexA(t.colors.accent, 0.4)}`}}>{d.title}</div>
      <div style={{height: 4 * scale, width: barW, background: t.colors.accent, boxShadow: `0 0 ${14 * scale}px ${t.colors.accent}`}} />
      {d.subtitle ? (<div style={{...fadeUp(frame, 14, fps), fontFamily: t.fonts.mono, fontWeight: 600, fontSize: 32 * scale, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.colors.accent3}}>{d.subtitle}</div>) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// HOOK — glitch headline, neon hero glyph, mono subtext.
export const CyberHook: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  return (
    <HookStage
      scene={scene}
      kit={{
        accent: t.colors.accent,
        headlineStyle: {
          letterSpacing: '0.04em',
          textShadow: `2px 0 ${hexA('#ff0033', 0.7)}, -2px 0 ${hexA('#00d4ff', 0.7)}, 0 0 ${28 * scale}px ${hexA(t.colors.accent, 0.4)}`,
        },
        mark: (size) => (
          <div style={{filter: `drop-shadow(0 0 ${18 * scale}px ${hexA(t.colors.accent, 0.7)})`}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </div>
        ),
        sub: (text) => (
          <span style={{fontFamily: t.fonts.mono, fontWeight: 600, fontSize: 34 * scale, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.colors.accent3}}>{text}</span>
        ),
      }}
    />
  );
};

// STAT_PANELS — chamfered neon stat cards + verdict pill.
export const CyberStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];

  return (
    <AbsoluteFill>
      {d.headline ? <GlitchHeadline text={d.headline} color={d.headlineColor ?? 'red'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 30 * scale}}>
          {stats.map((stat, i) => {
            const start = wordToFrame(stat.atWord);
            const c = stat.color ?? 'red';
            return (
              <div key={i} style={{...stackIn(frame, start, fps)}}>
                <CyberPanel color={c} style={{minWidth: (vertical ? 760 : 560) * scale, display: 'flex', flexDirection: 'column', gap: 10 * scale}}>
                  <Kicker text={stat.kicker} size={20} color={c} />
                  <div style={{display: 'flex', alignItems: 'baseline', gap: 18 * scale}}>
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontWeight: 800,
                        fontSize: 66 * scale,
                        color: sem(c),
                        letterSpacing: '-0.02em',
                        fontVariantNumeric: 'tabular-nums',
                        textShadow: `0 0 ${16 * scale}px ${hexA(sem(c), 0.5)}`,
                      }}
                    >
                      {stat.value}
                    </span>
                    {stat.note ? (
                      <span style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 32 * scale, color: t.colors.text}}>
                        {stat.note}
                      </span>
                    ) : null}
                  </div>
                </CyberPanel>
              </div>
            );
          })}
          {d.verdict ? (
            <div style={{...fadeUp(frame, wordToFrame(d.verdict.atWord), fps)}}>
              <Pill text={d.verdict.text} color={d.verdict.color ?? 'green'} maxWidth={(vertical ? 760 : 560) * scale} />
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — chamfered step cards joined by dotted connectors.
export const CyberStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];

  return (
    <AbsoluteFill>
      {d.headline ? <GlitchHeadline text={d.headline} color={d.headlineColor ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'stretch'}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            const c = step.color ?? 'blue';
            return (
              <React.Fragment key={i}>
                {i > 0 ? (
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <DottedConnector startFrame={Math.max(0, start - 8)} length={(vertical ? 56 : 76) * scale} vertical={vertical} color={c} />
                  </div>
                ) : null}
                <div style={{...springPop(frame, start, fps)}}>
                  <CyberPanel color={c} style={{width: (vertical ? 560 : 320) * scale, display: 'flex', flexDirection: 'column', gap: 12 * scale}}>
                    {step.kicker ? <Kicker text={step.kicker} size={19} color={c} /> : null}
                    <div
                      style={{
                        fontFamily: t.fonts.mono,
                        fontWeight: 800,
                        fontSize: 40 * scale,
                        color: sem(c),
                        letterSpacing: '-0.01em',
                        textShadow: `0 0 ${12 * scale}px ${hexA(sem(c), 0.45)}`,
                      }}
                    >
                      {step.title}
                    </div>
                    {step.sub ? (
                      <div style={{fontFamily: t.fonts.body, fontSize: 27 * scale, color: t.colors.muted, lineHeight: 1.35}}>
                        {step.sub}
                      </div>
                    ) : null}
                  </CyberPanel>
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

// LIST_BUILD — chamfered neon rows with icon + two-tier text.
export const CyberListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 * scale, padding: 90 * scale}}>
      {scene.data.heading ? (
        <div
          style={{
            ...fadeUp(frame, 0, fps),
            fontFamily: t.fonts.display,
            fontWeight: 800,
            fontSize: 58 * scale,
            color: t.colors.text,
            marginBottom: 20 * scale,
            textAlign: 'center',
            letterSpacing: t.style.displayTracking,
            textShadow: `1px 0 ${hexA('#ff0033', 0.6)}, -1px 0 ${hexA('#00d4ff', 0.6)}`,
          }}
        >
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => {
        const cyc: Array<'green' | 'purple' | 'blue'> = ['green', 'purple', 'blue'];
        return (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '72%'}}>
            <CyberPanel color={cyc[i % 3]} style={{display: 'flex', alignItems: 'center', gap: 30 * scale}}>
              <AssetIcon asset={item.icon} size={72 * scale} bare tint={t.colors.sem[cyc[i % 3]]} on={t.colors.panel} />
              <div style={{display: 'flex', flexDirection: 'column', gap: 4 * scale}}>
                <div style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 38 * scale, color: t.colors.text, lineHeight: 1.25}}>
                  {item.text}
                </div>
                {item.detail ? (
                  <div style={{fontFamily: t.fonts.mono, fontWeight: 400, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.3, letterSpacing: '0.04em'}}>
                    {item.detail}
                  </div>
                ) : null}
              </div>
            </CyberPanel>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant glitch counter + label + logo strip.
export const CyberStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26 * scale}}>
      <div
        style={{
          ...springPop(frame, start, fps),
          fontFamily: t.fonts.mono,
          fontWeight: 800,
          fontSize: (vertical ? 200 : 240) * scale,
          color: t.colors.accent2,
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
          textShadow: `3px 0 ${hexA('#ff0033', 0.6)}, -3px 0 ${hexA('#00d4ff', 0.6)}, 0 0 ${60 * scale}px ${hexA(t.colors.accent2, 0.5)}`,
        }}
      >
        {d.prefix ?? ''}
        {value}
        {d.suffix ?? ''}
      </div>
      <div
        style={{
          ...fadeUp(frame, start + 16, fps),
          fontFamily: t.fonts.body,
          fontWeight: 600,
          fontSize: 46 * scale,
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '80%',
        }}
      >
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 22 * scale, marginTop: 20 * scale, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '86%'}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps), filter: `drop-shadow(0 0 ${10 * scale}px ${hexA(t.colors.accent, 0.5)})`}}>
              <AssetIcon asset={lg} size={(vertical ? 92 : 84) * scale} />
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// LINE_CHART — neon line drawn inside a chamfered CyberPanel.
export const CyberLineChart: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const w = (vertical ? 880 : 1300) * scale;
  const h = (vertical ? 760 : 560) * scale;
  const series = d.lineChart?.series ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <GlitchHeadline text={d.headline} color={d.headlineColor ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 * scale, paddingTop: (vertical ? 130 : 90) * scale}}>
        <CyberPanel color={d.headlineColor ?? 'blue'}>
          {d.lineChart ? <LineChart data={d.lineChart} w={w} h={h} /> : null}
        </CyberPanel>
        {series.length > 1 ? (
          <div style={{display: 'flex', gap: 32 * scale, flexWrap: 'wrap', justifyContent: 'center'}}>
            {series.map((s, i) => {
              const c = sem(s.color ?? CHART_CYCLE[i % 3]);
              return (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
                  <div style={{width: 22 * scale, height: 6 * scale, background: c, boxShadow: `0 0 ${8 * scale}px ${c}`}} />
                  <span style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: t.colors.muted, letterSpacing: '0.06em'}}>{s.label}</span>
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

// DONUT — neon donut in a chamfered CyberPanel with a mono legend.
export const CyberDonut: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const segs = d.donut?.segments ?? [];
  const size = (vertical ? 520 : 480) * scale;
  return (
    <AbsoluteFill>
      {d.headline ? <GlitchHeadline text={d.headline} color={d.headlineColor ?? 'purple'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: (vertical ? 30 : 60) * scale, paddingTop: (vertical ? 130 : 80) * scale}}>
        <CyberPanel color={d.headlineColor ?? 'purple'}>
          {d.donut ? <Donut data={d.donut} size={size} /> : null}
        </CyberPanel>
        <div style={{display: 'flex', flexDirection: 'column', gap: 16 * scale}}>
          {segs.map((s, i) => {
            const c = sem(s.color ?? CHART_CYCLE[i % CHART_CYCLE.length]);
            const shown = frame >= wordToFrame(s.atWord);
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14 * scale, opacity: shown ? 1 : 0.25, minWidth: (vertical ? 420 : 340) * scale}}>
                <div style={{width: 18 * scale, height: 18 * scale, background: c, boxShadow: `0 0 ${8 * scale}px ${c}`}} />
                <span style={{fontFamily: t.fonts.mono, fontSize: 28 * scale, color: t.colors.text}}>{s.label}</span>
                <span style={{fontFamily: t.fonts.mono, fontSize: 28 * scale, color: c, marginLeft: 'auto', fontVariantNumeric: 'tabular-nums'}}>{s.value}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
