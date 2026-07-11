import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {Loud, Star, Burst, MaxHeadline, ACC, clash} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');
const TILT = [-3, 2.5, -2, 3, -1.5];
const GRAD = 'linear-gradient(90deg, #FF3AF2, #FFE600, #00F5D4)';

// HOOK — hero in a loud card, gradient headline, sticker subtext, sparkles.
export const MaxHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 46 * scale}}>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps)}}>
          <Loud index={0} rotate={-3} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: (vertical ? 240 : 224) * scale, height: (vertical ? 240 : 224) * scale}}>
            <AssetIcon asset={d.heroAsset} size={(vertical ? 116 : 108) * scale} />
          </Loud>
        </div>
      ) : null}
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.display,
          fontWeight: 900,
          fontSize: (vertical ? 80 : 94) * scale,
          textTransform: 'uppercase',
          letterSpacing: '-0.01em',
          textAlign: 'center',
          maxWidth: '90%',
          lineHeight: 1.02,
          backgroundImage: GRAD,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          filter: `drop-shadow(0 0 ${14 * scale}px rgba(255,58,242,0.45))`,
        }}
      >
        {d.headline}
      </div>
      {d.subtext ? (
        <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) + 10, fps)}}>
          <Loud index={2} rotate={2} badge={false} style={{padding: `${12 * scale}px ${30 * scale}px`}}>
            <span style={{fontFamily: t.fonts.body, fontWeight: 800, fontSize: 28 * scale, color: t.colors.text}}>{d.subtext}</span>
          </Loud>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — loud clashing cards with gradient numbers + star badges.
export const MaxStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <MaxHeadline text={d.headline} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 52 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <Loud index={i} rotate={TILT[i % TILT.length]} style={{minWidth: (vertical ? 560 : 370) * scale, display: 'flex', flexDirection: 'column', gap: 12 * scale, alignItems: 'center'}}>
                <div style={{fontFamily: t.fonts.body, fontWeight: 800, fontSize: 24 * scale, letterSpacing: '0.04em', textTransform: 'uppercase', color: ACC[(i + 1) % ACC.length], textAlign: 'center'}}>{stat.kicker}</div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 96 : 88) * scale, fontVariantNumeric: 'tabular-nums', lineHeight: 1, backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 0 ${8 * scale}px rgba(0,245,212,0.4))`}}>{stat.value}</div>
              </Loud>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 116) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), fontFamily: t.fonts.display, fontWeight: 900, fontSize: 34 * scale, textTransform: 'uppercase', color: ACC[0]}}>
          {d.verdict.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — number in a starburst, loud cards.
export const MaxStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <MaxHeadline text={d.headline} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 34 * scale, alignItems: 'stretch'}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            const c = ACC[i % ACC.length];
            return (
              <div key={i} style={{...springPop(frame, start, fps)}}>
                <Loud index={i} rotate={TILT[i % TILT.length]} badge={false} style={{width: (vertical ? 540 : 300) * scale, display: 'flex', flexDirection: 'column', gap: 16 * scale}}>
                  <div style={{position: 'relative', width: 72 * scale, height: 72 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Burst color={c} size={72} style={{left: 0, top: 0, opacity: 0.9}} />
                    <span style={{position: 'relative', fontFamily: t.fonts.display, fontWeight: 900, fontSize: 34 * scale, color: t.colors.text, textShadow: `0 0 ${8 * scale}px ${c}`}}>{i + 1}</span>
                  </div>
                  <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: 38 * scale, textTransform: 'uppercase', color: t.colors.text, lineHeight: 1.05}}>{step.title}</div>
                  {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.35}}>{step.sub}</div> : null}
                </Loud>
              </div>
            );
          })}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.display, fontWeight: 900, fontSize: 30 * scale, textTransform: 'uppercase', color: ACC[1]}}>{d.caption.text}</div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — loud rows with the icon in a bright clashing square.
export const MaxListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26 * scale, padding: 84 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 900, fontSize: 56 * scale, textTransform: 'uppercase', color: t.colors.text, marginBottom: 12 * scale}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => {
        const c = ACC[i % ACC.length];
        return (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '72%'}}>
            <Loud index={i} rotate={TILT[i % TILT.length] * 0.5} badge={false} style={{padding: `${20 * scale}px ${26 * scale}px`, display: 'flex', alignItems: 'center', gap: 24 * scale}}>
              <div style={{minWidth: 74 * scale, width: 74 * scale, height: 74 * scale, borderRadius: 16 * scale, background: c, border: `${3 * scale}px solid ${clash(i)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${16 * scale}px ${c}88`}}>
                <AssetIcon asset={item.icon} size={40 * scale} bare on={c} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 3 * scale}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 38 : 36) * scale, textTransform: 'uppercase', color: t.colors.text, lineHeight: 1.15}}>{item.text}</div>
                {item.detail ? <div style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 25 * scale, color: t.colors.muted}}>{item.detail}</div> : null}
              </div>
            </Loud>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant gradient number, bursting sparkles, clashing frame.
export const MaxStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
      <div style={{...springPop(frame, start, fps), position: 'relative'}}>
        <Star color={ACC[2]} size={54} rotate={0} style={{left: -80 * scale, top: -46 * scale}} />
        <Star color={ACC[1]} size={44} rotate={20} style={{right: -80 * scale, bottom: -30 * scale}} />
        <Loud index={0} rotate={-2} badge={false} style={{padding: `${28 * scale}px ${56 * scale}px`}}>
          <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 200 : 230) * scale, fontVariantNumeric: 'tabular-nums', lineHeight: 0.95, backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 0 ${16 * scale}px rgba(255,58,242,0.5))`}}>
            {d.prefix ?? ''}{value}{d.suffix ?? ''}
          </div>
        </Loud>
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 700, fontSize: 42 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '78%', lineHeight: 1.3}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 22 * scale, marginTop: 6 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <Loud index={i + 1} badge={false} style={{width: 104 * scale, height: 104 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
                <AssetIcon asset={lg} size={(vertical ? 60 : 54) * scale} />
              </Loud>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
