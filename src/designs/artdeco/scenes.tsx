import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem, hexA} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {DecoFrame, DecoDivider, DecoHeadline, Sunburst, toRoman} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — sunburst behind hero, Cinzel headline, diamond divider.
export const DecoHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 * scale}}>
      {d.heroAsset ? (
        <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', ...springPop(frame, wordToFrame(d.heroAtWord), fps)}}>
          <Sunburst size={(vertical ? 320 : 300) * scale} opacity={0.4} style={{position: 'absolute'}} />
          <div style={{position: 'relative', filter: `drop-shadow(0 0 ${16 * scale}px ${hexA(t.colors.accent, 0.6)})`}}>
            <AssetIcon asset={d.heroAsset} size={(vertical ? 120 : 112) * scale} />
          </div>
        </div>
      ) : null}
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.display,
          fontWeight: 600,
          fontSize: (vertical ? 74 : 86) * scale,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '88%',
          lineHeight: 1.1,
        }}
      >
        {d.headline}
      </div>
      <DecoDivider width={vertical ? 420 : 460} delay={wordToFrame(d.headlineAtWord) + 8} />
      {d.subtext ? (
        <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) + 12, fps), fontFamily: t.fonts.body, fontWeight: 500, fontSize: 28 * scale, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.colors.accent}}>
          {d.subtext}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — symmetric gold-framed stat cards with Cinzel numbers.
export const DecoStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <DecoHeadline text={d.headline} color={d.headlineColor ?? 'red'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 46 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          const c = stat.color ?? 'orange';
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <DecoFrame color={c} style={{minWidth: (vertical ? 560 : 380) * scale}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale}}>
                  <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 22 * scale, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.colors.muted, textAlign: 'center'}}>{stat.kicker}</div>
                  <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 86 : 80) * scale, color: sem(c), fontVariantNumeric: 'tabular-nums', lineHeight: 1, textShadow: `0 0 ${18 * scale}px ${hexA(sem(c), 0.5)}`}}>{stat.value}</div>
                </div>
              </DecoFrame>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 118) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), fontFamily: t.fonts.display, fontWeight: 600, fontSize: 32 * scale, letterSpacing: '0.06em', textTransform: 'uppercase', color: sem(d.verdict.color ?? 'orange')}}>
          {d.verdict.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — Roman-numeral framed steps joined by diamonds.
export const DecoStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <DecoHeadline text={d.headline} color={d.headlineColor ?? 'orange'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', gap: 20 * scale}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            const c = step.color ?? 'orange';
            return (
              <React.Fragment key={i}>
                {i > 0 ? <div style={{width: 18 * scale, height: 18 * scale, background: t.colors.accent, transform: 'rotate(45deg)', opacity: 0.8}} /> : null}
                <div style={{...springPop(frame, start, fps)}}>
                  <DecoFrame color={c} style={{width: (vertical ? 500 : 300) * scale}}>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 * scale, textAlign: 'center'}}>
                      <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 40 * scale, color: sem(c)}}>{toRoman(i + 1)}</div>
                      <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: 32 * scale, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.colors.text, lineHeight: 1.1}}>{step.title}</div>
                      {step.sub ? <div style={{fontFamily: t.fonts.body, fontSize: 24 * scale, color: t.colors.muted, lineHeight: 1.35}}>{step.sub}</div> : null}
                    </div>
                  </DecoFrame>
                </div>
              </React.Fragment>
            );
          })}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.display, fontWeight: 600, fontSize: 28 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.colors.accent}}>
            {d.caption.text}
          </div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — centered list with diamond bullets + gold dividers.
export const DecoListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 * scale, padding: 90 * scale}}>
      {scene.data.heading ? (
        <>
          <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 600, fontSize: 56 * scale, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.colors.text, textAlign: 'center'}}>
            {scene.data.heading}
          </div>
          <div style={{marginBottom: 14 * scale}}><DecoDivider width={vertical ? 400 : 440} delay={8} /></div>
        </>
      ) : null}
      {items.map((item, i) => (
        <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '92%' : '68%', display: 'flex', alignItems: 'center', gap: 24 * scale, justifyContent: 'center'}}>
          <div style={{width: 16 * scale, height: 16 * scale, background: t.colors.accent, transform: 'rotate(45deg)', flexShrink: 0}} />
          <div style={{textAlign: 'left'}}>
            <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 40 : 38) * scale, letterSpacing: '0.04em', textTransform: 'uppercase', color: t.colors.text, lineHeight: 1.15}}>{item.text}</div>
            {item.detail ? <div style={{fontFamily: t.fonts.body, fontSize: 25 * scale, color: t.colors.muted}}>{item.detail}</div> : null}
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant gold Cinzel number crowned by a sunburst.
export const DecoStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
      <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Sunburst size={(vertical ? 560 : 620) * scale} opacity={0.3} style={{position: 'absolute'}} />
        <div style={{...springPop(frame, start, fps), position: 'relative', fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 180 : 220) * scale, color: t.colors.accent, fontVariantNumeric: 'tabular-nums', lineHeight: 0.95, textShadow: `0 0 ${40 * scale}px ${hexA(t.colors.accent, 0.5)}`}}>
          {d.prefix ?? ''}{value}{d.suffix ?? ''}
        </div>
      </div>
      <DecoDivider width={vertical ? 360 : 420} delay={start + 8} />
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 500, fontSize: 38 * scale, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.colors.muted, textAlign: 'center', maxWidth: '80%', lineHeight: 1.35}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 22 * scale, marginTop: 10 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps), filter: `drop-shadow(0 0 ${8 * scale}px ${hexA(t.colors.accent, 0.5)})`}}>
              <AssetIcon asset={lg} size={(vertical ? 74 : 66) * scale} />
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
