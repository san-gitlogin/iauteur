import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, hexA, useScale, useSem} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {Arch, Sprig, BotHeadline} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');
const STAGGER = [0, 28, 0, 28, 0];

// HOOK — hero in a sage arch frame, Playfair italic headline, clay pill subtext.
export const BotHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 46 * scale}}>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps)}}>
          <Arch width={vertical ? 220 : 206} height={vertical ? 264 : 248} fill={hexA(sem('green'), 0.16)} border={hexA(sem('green'), 0.5)}>
            <AssetIcon asset={d.heroAsset} size={(vertical ? 108 : 100) * scale} />
          </Arch>
        </div>
      ) : null}
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.display,
          fontWeight: 600,
          fontSize: (vertical ? 82 : 96) * scale,
          letterSpacing: '-0.01em',
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '84%',
          lineHeight: 1.05,
        }}
      >
        {d.headline}
      </div>
      {d.subtext ? (
        <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) + 10, fps), fontFamily: t.fonts.body, fontWeight: 400, fontSize: 30 * scale, letterSpacing: '0.02em', color: t.colors.onAccent, background: sem('orange'), borderRadius: 999, padding: `${11 * scale}px ${28 * scale}px`}}>
          {d.subtext}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — arch-topped stat containers, staggered vertical rhythm.
export const BotStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <BotHeadline text={d.headline} color={d.headlineColor ?? 'red'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 48 * scale}}>
        {stats.map((stat, i) => {
          const c = stat.color ?? (i === 0 ? 'red' : 'green');
          return (
            <div key={i} style={{...stackIn(frame, wordToFrame(stat.atWord), fps), transform: `translateY(${vertical ? 0 : STAGGER[i % STAGGER.length] * scale}px)`}}>
              <Arch width={vertical ? 540 : 320} height={vertical ? 300 : 320} fill={hexA(sem(c), 0.14)} border={hexA(sem(c), 0.4)} style={{flexDirection: 'column', gap: 12 * scale, padding: `${40 * scale}px ${30 * scale}px`}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 96 : 88) * scale, color: sem(c), fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{stat.value}</div>
                <div style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 24 * scale, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.colors.muted, textAlign: 'center'}}>{stat.kicker}</div>
              </Arch>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 116) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 36 * scale, color: t.colors.accent}}>
          {d.verdict.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — soft rounded cards with arch number badges, staggered.
export const BotStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <BotHeadline text={d.headline} color={d.headlineColor ?? 'green'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 34 * scale, alignItems: vertical ? 'stretch' : 'flex-start'}}>
          {steps.map((step, i) => (
            <div key={i} style={{...springPop(frame, wordToFrame(step.atWord), fps), transform: `translateY(${vertical ? 0 : STAGGER[i % STAGGER.length] * scale}px)`}}>
              <div style={{width: (vertical ? 540 : 300) * scale, background: t.colors.panel, borderRadius: 40 * scale, border: `${1.5 * scale}px solid ${t.colors.panelBorder}`, padding: `${30 * scale}px`, display: 'flex', flexDirection: 'column', gap: 18 * scale}}>
                <Arch width={64} height={80} fill={hexA(sem('green'), 0.16)} border={hexA(sem('green'), 0.5)}>
                  <span style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: 32 * scale, color: sem('green')}}>{i + 1}</span>
                </Arch>
                <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: 40 * scale, color: t.colors.text, lineHeight: 1.05}}>{step.title}</div>
                {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.4}}>{step.sub}</div> : null}
              </div>
            </div>
          ))}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 32 * scale, color: t.colors.accent}}>{d.caption.text}</div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — soft clay rows with a sage leaf sprig marker.
export const BotListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 * scale, padding: 86 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 600, fontSize: 58 * scale, color: t.colors.text, marginBottom: 14 * scale}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => (
        <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '72%'}}>
          <div style={{background: t.colors.panel, borderRadius: 999, border: `${1.5 * scale}px solid ${t.colors.panelBorder}`, padding: `${18 * scale}px ${30 * scale}px`, display: 'flex', alignItems: 'center', gap: 24 * scale}}>
            <div style={{position: 'relative', minWidth: 66 * scale, width: 66 * scale, height: 66 * scale, borderRadius: '50%', background: hexA(sem('green'), 0.16), border: `${1.5 * scale}px solid ${hexA(sem('green'), 0.5)}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <AssetIcon asset={item.icon} size={36 * scale} bare tint={sem('green')} on={t.colors.panel} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 3 * scale}}>
              <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 40 : 38) * scale, color: t.colors.text, lineHeight: 1.2}}>{item.text}</div>
              {item.detail ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 25 * scale, color: t.colors.muted}}>{item.detail}</div> : null}
            </div>
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant Playfair number in an arch, flanked by botanical sprigs.
export const BotStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
      <div style={{...springPop(frame, start, fps), position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Sprig size={vertical ? 180 : 200} color={hexA(sem('green'), 0.6)} rotate={-20} style={{left: -180 * scale, top: '50%', marginTop: -100 * scale}} />
        <Sprig size={vertical ? 180 : 200} color={hexA(sem('green'), 0.6)} rotate={20} flip style={{right: -180 * scale, top: '50%', marginTop: -100 * scale}} />
        <Arch width={vertical ? 460 : 520} height={vertical ? 440 : 440} fill={hexA(sem('green'), 0.12)} border={hexA(sem('green'), 0.4)}>
          <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 180 : 210) * scale, color: t.colors.accent, fontVariantNumeric: 'tabular-nums', lineHeight: 0.95}}>
            {d.prefix ?? ''}{value}{d.suffix ?? ''}
          </div>
        </Arch>
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 400, fontSize: 40 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '72%', lineHeight: 1.35}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 22 * scale, marginTop: 6 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <Arch width={96} height={116} fill={hexA(sem('green'), 0.14)} border={hexA(sem('green'), 0.4)}>
                <AssetIcon asset={lg} size={(vertical ? 54 : 50) * scale} />
              </Arch>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
