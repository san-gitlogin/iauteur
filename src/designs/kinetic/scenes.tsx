import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {KBlock, Marquee, GhostNumber, KiHeadline} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — giant uppercase headline over a ghost number, sharp hero block, marquee.
export const KiHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 44 * scale, overflow: 'hidden'}}>
      <GhostNumber style={{top: '50%', left: '50%', transform: 'translate(-50%,-50%)'}}>0</GhostNumber>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps), position: 'relative'}}>
          <KBlock style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: (vertical ? 224 : 208) * scale, height: (vertical ? 224 : 208) * scale}}>
            <AssetIcon asset={d.heroAsset} size={(vertical ? 108 : 100) * scale} />
          </KBlock>
        </div>
      ) : null}
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          position: 'relative',
          fontFamily: t.fonts.display,
          fontWeight: 900,
          fontSize: (vertical ? 88 : 108) * scale,
          textTransform: 'uppercase',
          letterSpacing: '-0.03em',
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '92%',
          lineHeight: 0.92,
        }}
      >
        {d.headline}
      </div>
      {d.subtext ? (
        <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) + 10, fps), position: 'relative', width: '100%', maxWidth: (vertical ? 900 : 1100) * scale}}>
          <Marquee text={d.subtext} filled speed={0.4} height={vertical ? 58 : 52} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — connected hairline grid; huge acid numbers, one inverted block.
export const KiStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <KiHeadline text={d.headline} color={d.headlineColor ?? 'yellow'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 2 * scale, background: t.colors.panelBorder, border: `${2 * scale}px solid ${t.colors.panelBorder}`}}>
          {stats.map((stat, i) => {
            const start = wordToFrame(stat.atWord);
            const active = i === 0;
            return (
              <div key={i} style={{...stackIn(frame, start, fps)}}>
                <KBlock active={active} style={{minWidth: (vertical ? 560 : 340) * scale, border: 'none', display: 'flex', flexDirection: 'column', gap: 12 * scale, alignItems: 'flex-start', padding: `${34 * scale}px ${38 * scale}px`}}>
                  <div style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', color: active ? t.colors.onAccent : t.colors.muted}}>{stat.kicker}</div>
                  <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 108 : 100) * scale, color: active ? t.colors.onAccent : sem(stat.color ?? 'yellow'), fontVariantNumeric: 'tabular-nums', lineHeight: 0.9, letterSpacing: '-0.03em'}}>{stat.value}</div>
                </KBlock>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 156 : 120) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), fontFamily: t.fonts.display, fontWeight: 900, fontSize: 34 * scale, textTransform: 'uppercase', color: t.colors.accent}}>
          {d.verdict.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — connected blocks with giant index numbers.
export const KiStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <KiHeadline text={d.headline} color={d.headlineColor ?? 'yellow'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 2 * scale, background: t.colors.panelBorder, border: `${2 * scale}px solid ${t.colors.panelBorder}`}}>
          {steps.map((step, i) => (
            <div key={i} style={{...springPop(frame, wordToFrame(step.atWord), fps)}}>
              <KBlock style={{width: (vertical ? 540 : 300) * scale, border: 'none', display: 'flex', flexDirection: 'column', gap: 12 * scale, minHeight: (vertical ? 0 : 300) * scale}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 100 : 120) * scale, color: t.colors.accent, lineHeight: 0.8, letterSpacing: '-0.04em'}}>{i + 1}</div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: 38 * scale, textTransform: 'uppercase', color: t.colors.text, lineHeight: 0.98}}>{step.title}</div>
                {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.35}}>{step.sub}</div> : null}
              </KBlock>
            </div>
          ))}
        </div>
        {d.caption ? (
          <div style={{position: 'absolute', bottom: (vertical ? 150 : 96) * scale, ...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.display, fontWeight: 900, fontSize: 30 * scale, textTransform: 'uppercase', color: t.colors.accent}}>{d.caption.text}</div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — full-width rows split by hairlines, big uppercase + acid index.
export const KiListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: vertical ? 60 * scale : 96 * scale, paddingTop: 96 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 900, fontSize: 56 * scale, textTransform: 'uppercase', color: t.colors.text, marginBottom: 20 * scale, alignSelf: 'flex-start', letterSpacing: '-0.02em'}}>
          {scene.data.heading}
        </div>
      ) : null}
      <div style={{width: '100%', borderTop: `${2 * scale}px solid ${t.colors.panelBorder}`}}>
        {items.map((item, i) => (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), display: 'flex', alignItems: 'center', gap: 30 * scale, padding: `${20 * scale}px ${8 * scale}px`, borderBottom: `${2 * scale}px solid ${t.colors.panelBorder}`}}>
            <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 64 : 60) * scale, color: t.colors.accent, minWidth: (vertical ? 90 : 96) * scale, lineHeight: 0.9}}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{width: 52 * scale, height: 52 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <AssetIcon asset={item.icon} size={40 * scale} bare on={t.colors.bg} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 2 * scale, flex: 1}}>
              <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 40 : 40) * scale, textTransform: 'uppercase', color: t.colors.text, lineHeight: 1.0, letterSpacing: '-0.01em'}}>{item.text}</div>
              {item.detail ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 24 * scale, color: t.colors.muted}}>{item.detail}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — viewport-huge acid number over a ghost duplicate + marquee label.
export const KiStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30 * scale, overflow: 'hidden'}}>
      <div style={{...springPop(frame, start, fps), position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 240 : 300) * scale, color: t.colors.accent, fontVariantNumeric: 'tabular-nums', lineHeight: 0.86, letterSpacing: '-0.04em'}}>
          {d.prefix ?? ''}{value}{d.suffix ?? ''}
        </div>
      </div>
      {d.label ? (
        <div style={{...fadeUp(frame, start + 14, fps), width: '100%', maxWidth: (vertical ? 960 : 1200) * scale}}>
          <Marquee text={d.label} filled speed={0.4} height={vertical ? 58 : 54} />
        </div>
      ) : null}
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 2 * scale, marginTop: 10 * scale, background: t.colors.panelBorder, border: `${2 * scale}px solid ${t.colors.panelBorder}`}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <KBlock style={{width: 104 * scale, height: 104 * scale, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
                <AssetIcon asset={lg} size={(vertical ? 58 : 52) * scale} />
              </KBlock>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
