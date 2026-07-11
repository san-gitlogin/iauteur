import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem, hexA} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {NeuRaised, NeuInset, NeuHeadline} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — hero in a raised disc, embossed headline, inset pill subtext.
export const NeuHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 46 * scale}}>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps)}}>
          <NeuRaised circle style={{width: (vertical ? 220 : 210) * scale, height: (vertical ? 220 : 210) * scale, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <AssetIcon asset={d.heroAsset} size={(vertical ? 110 : 104) * scale} />
          </NeuRaised>
        </div>
      ) : null}
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.display,
          fontWeight: 800,
          fontSize: (vertical ? 84 : 100) * scale,
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '88%',
          lineHeight: 1.02,
          letterSpacing: '-0.02em',
          textShadow: `-${1.5 * scale}px -${1.5 * scale}px ${3 * scale}px rgba(255,255,255,0.06), ${1.5 * scale}px ${1.5 * scale}px ${3 * scale}px rgba(0,0,0,0.55)`,
        }}
      >
        {d.headline}
      </div>
      {d.subtext ? (
        <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) + 10, fps)}}>
          <NeuInset style={{padding: `${12 * scale}px ${28 * scale}px`}}>
            <span style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 28 * scale, color: t.colors.muted}}>{d.subtext}</span>
          </NeuInset>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — raised cards, each number pressed into an inset well.
export const NeuStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <NeuHeadline text={d.headline} color={d.headlineColor ?? 'red'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 46 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          const c = stat.color ?? 'red';
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <NeuRaised style={{minWidth: (vertical ? 620 : 400) * scale, padding: `${30 * scale}px`, display: 'flex', flexDirection: 'column', gap: 18 * scale}}>
                <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 24 * scale, color: t.colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em'}}>{stat.kicker}</div>
                <NeuInset style={{padding: `${16 * scale}px ${22 * scale}px`, textAlign: 'center'}}>
                  <span style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 82 : 76) * scale, color: sem(c), fontVariantNumeric: 'tabular-nums', textShadow: `0 0 ${14 * scale}px ${hexA(sem(c), 0.4)}`}}>{stat.value}</span>
                </NeuInset>
              </NeuRaised>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 116) * scale, width: '100%', display: 'flex', justifyContent: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps)}}>
          <NeuInset style={{padding: `${10 * scale}px ${26 * scale}px`}}>
            <span style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 28 * scale, color: sem(d.verdict.color ?? 'purple')}}>{d.verdict.text}</span>
          </NeuInset>
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — raised cards with a raised number disc.
export const NeuStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <NeuHeadline text={d.headline} color={d.headlineColor ?? 'purple'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 34 * scale, alignItems: 'center'}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            const c = step.color ?? 'purple';
            return (
              <div key={i} style={{...springPop(frame, start, fps)}}>
                <NeuRaised style={{width: (vertical ? 540 : 300) * scale, padding: `${28 * scale}px`, display: 'flex', flexDirection: 'column', gap: 16 * scale}}>
                  <NeuInset circle style={{width: 62 * scale, height: 62 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <span style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: 30 * scale, color: sem(c)}}>{i + 1}</span>
                  </NeuInset>
                  <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 40 * scale, color: t.colors.text, lineHeight: 1.05}}>{step.title}</div>
                  {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.35}}>{step.sub}</div> : null}
                </NeuRaised>
              </div>
            );
          })}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps)}}>
            <NeuInset style={{padding: `${10 * scale}px ${26 * scale}px`}}>
              <span style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 27 * scale, color: sem(d.caption.color ?? 'purple')}}>{d.caption.text}</span>
            </NeuInset>
          </div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — raised rows with the icon pressed into an inset disc.
export const NeuListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 28 * scale, padding: 84 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 800, fontSize: 58 * scale, color: t.colors.text, marginBottom: 14 * scale, letterSpacing: '-0.02em'}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => (
        <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '72%'}}>
          <NeuRaised style={{padding: `${22 * scale}px ${28 * scale}px`, display: 'flex', alignItems: 'center', gap: 26 * scale}}>
            <NeuInset circle style={{minWidth: 76 * scale, width: 76 * scale, height: 76 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <AssetIcon asset={item.icon} size={40 * scale} bare on={t.colors.panel} />
            </NeuInset>
            <div style={{display: 'flex', flexDirection: 'column', gap: 3 * scale}}>
              <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 40 : 38) * scale, color: t.colors.text, lineHeight: 1.2}}>{item.text}</div>
              {item.detail ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 25 * scale, color: t.colors.muted}}>{item.detail}</div> : null}
            </div>
          </NeuRaised>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant number pressed deep into an inset well.
export const NeuStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const start = wordToFrame(d.atWord);
  const target = d.value ?? 0;
  const decimals = Number.isInteger(target) ? 0 : 1;
  const animated = counterValue(frame, start, Math.round(target * 10 ** decimals)) / 10 ** decimals;
  const value = decimals ? animated.toFixed(1) : formatNumber(animated);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 36 * scale}}>
      <div style={{...springPop(frame, start, fps)}}>
        <NeuInset style={{padding: `${30 * scale}px ${56 * scale}px`}}>
          <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 200 : 230) * scale, color: sem('purple'), fontVariantNumeric: 'tabular-nums', lineHeight: 0.95, textShadow: `0 0 ${24 * scale}px ${hexA(sem('purple'), 0.4)}`}}>
            {d.prefix ?? ''}{value}{d.suffix ?? ''}
          </div>
        </NeuInset>
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 500, fontSize: 42 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '78%', lineHeight: 1.25}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 22 * scale, marginTop: 6 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <NeuRaised circle style={{width: 104 * scale, height: 104 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <AssetIcon asset={lg} size={(vertical ? 60 : 54) * scale} />
              </NeuRaised>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
