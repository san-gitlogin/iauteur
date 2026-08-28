import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {MonoRule, MonoLabel, MonoHeadline} from './primitives';
import {HookStage} from '../../hookStage';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — oversized serif headline with an inverted-block word.
export const MonoHook: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  return (
    <HookStage
      scene={scene}
      kit={{
        accent: '#FFFFFF',
        headlineStyle: {fontWeight: 500, color: '#FFFFFF', lineHeight: 0.98, letterSpacing: '-0.02em'},
        mark: (size) => (
          <div style={{filter: 'grayscale(1) brightness(2)'}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </div>
        ),
        divider: () => <MonoRule width={vertical ? 260 : 300} weight={3} delay={0} />,
        sub: (text) => <MonoLabel text={text} size={24} />,
      }}
    />
  );
};

// STAT_PANELS — hairline-divided rows: label + huge serif number.
export const MonoStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <MonoHeadline text={d.headline} /> : null}
      <div style={{position: 'absolute', left: (vertical ? 80 : 220) * scale, right: (vertical ? 80 : 220) * scale, top: (vertical ? 440 : 380) * scale, display: 'flex', flexDirection: 'column', gap: 30 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <div style={{height: 2 * scale, background: '#FFFFFF'}} />
              <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: 14 * scale}}>
                <div style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 24 * scale, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.colors.muted, maxWidth: '55%'}}>{stat.kicker}</div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 500, fontSize: (vertical ? 88 : 100) * scale, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{stat.value}</div>
              </div>
            </div>
          );
        })}
        {d.verdict ? (
          <div style={{...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), marginTop: 8 * scale, fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 34 * scale, color: '#FFFFFF', textAlign: 'right'}}>
            {'\u2014 ' + d.verdict.text}
          </div>
        ) : null}
      </div>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — giant serif numerals with hairline dividers.
export const MonoStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <MonoHeadline text={d.headline} /> : null}
      <div style={{position: 'absolute', left: (vertical ? 80 : 180) * scale, right: (vertical ? 80 : 180) * scale, top: (vertical ? 450 : 400) * scale, display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: vertical ? 26 * scale : 0}}>
        {steps.map((step, i) => {
          const start = wordToFrame(step.atWord);
          return (
            <div
              key={i}
              style={{
                ...fadeUp(frame, start, fps),
                flex: 1,
                paddingLeft: vertical ? 0 : (i === 0 ? 0 : 36 * scale),
                paddingRight: vertical ? 0 : 36 * scale,
                borderLeft: !vertical && i > 0 ? `1px solid rgba(255,255,255,0.35)` : undefined,
                borderTop: vertical ? `1px solid rgba(255,255,255,0.35)` : undefined,
                paddingTop: vertical ? 18 * scale : 0,
                textAlign: 'center',
              }}
            >
              <div style={{fontFamily: t.fonts.display, fontWeight: 500, fontSize: (vertical ? 76 : 84) * scale, color: '#FFFFFF', lineHeight: 1}}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{marginTop: 14 * scale, fontFamily: t.fonts.display, fontWeight: 500, fontSize: (vertical ? 44 : 42) * scale, color: '#FFFFFF', lineHeight: 1.05}}>{step.title}</div>
              {step.sub ? <div style={{marginTop: 10 * scale, fontFamily: t.fonts.body, fontWeight: 400, fontSize: 25 * scale, color: t.colors.muted, lineHeight: 1.35}}>{step.sub}</div> : null}
            </div>
          );
        })}
      </div>
      {d.caption ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: (vertical ? 790 : 730) * scale, textAlign: 'center', ...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 32 * scale, color: '#FFFFFF'}}>
          {d.caption.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — serif numbered rows, thick rule under heading, hairlines between.
export const MonoListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 22 * scale, padding: 90 * scale}}>
      {scene.data.heading ? (
        <>
          <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 500, fontSize: (vertical ? 60 : 68) * scale, color: '#FFFFFF', textAlign: 'center'}}>
            {scene.data.heading}
          </div>
          <div style={{marginBottom: 14 * scale}}><MonoRule width={vertical ? 300 : 360} weight={3} delay={8} /></div>
        </>
      ) : null}
      <div style={{width: vertical ? '92%' : '72%', display: 'flex', flexDirection: 'column', gap: 20 * scale}}>
        {items.map((item, i) => (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps)}}>
            <div style={{height: 1 * scale, background: 'rgba(255,255,255,0.35)'}} />
            <div style={{display: 'flex', gap: 26 * scale, alignItems: 'baseline', paddingTop: 14 * scale}}>
              <div style={{fontFamily: t.fonts.display, fontWeight: 500, fontSize: 40 * scale, color: '#FFFFFF', minWidth: 60 * scale}}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{flex: 1}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 500, fontSize: (vertical ? 44 : 42) * scale, color: '#FFFFFF', lineHeight: 1.1}}>{item.text}</div>
                {item.detail ? <div style={{marginTop: 6 * scale, fontFamily: t.fonts.body, fontWeight: 400, fontSize: 25 * scale, color: t.colors.muted}}>{item.detail}</div> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — enormous serif number, thick rule, label caps.
export const MonoStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30 * scale}}>
      <div style={{...springPop(frame, start, fps), fontFamily: t.fonts.display, fontWeight: 500, fontSize: (vertical ? 260 : 320) * scale, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums', lineHeight: 0.86, letterSpacing: '-0.02em'}}>
        {d.prefix ?? ''}{value}{d.suffix ?? ''}
      </div>
      <MonoRule width={vertical ? 340 : 420} weight={3} delay={start + 8} />
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 400, fontSize: 34 * scale, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.colors.muted, textAlign: 'center', maxWidth: '80%', lineHeight: 1.4}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 26 * scale, marginTop: 12 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps), filter: 'grayscale(1) brightness(2)'}}>
              <AssetIcon asset={lg} size={(vertical ? 74 : 66) * scale} />
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
