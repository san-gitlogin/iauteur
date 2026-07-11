import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {useScale, useSem} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {Win95, Win95Button, raised, sunken, GRAY, INK, NAVY} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — WELCOME.HTM window with big heading + blinking NEW! badge.
export const RetroHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const blink = frame % 30 < 16;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Win95 title="WELCOME.HTM" status="Done." style={{width: vertical ? '90%' : (1180 * scale + 'px')}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 * scale, background: '#fff', padding: `${34 * scale}px ${24 * scale}px`, border: `${1 * scale}px solid ${INK}`}}>
          {d.heroAsset ? (
            <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps)}}>
              <AssetIcon asset={d.heroAsset} size={(vertical ? 130 : 120) * scale} />
            </div>
          ) : null}
          <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord), fps), fontFamily: t.fonts.display, fontSize: (vertical ? 74 : 90) * scale, color: sem('red'), textAlign: 'center', textTransform: 'uppercase', lineHeight: 1, textShadow: `${3 * scale}px ${3 * scale}px 0 ${INK}`}}>
            {d.headline}
          </div>
          {d.subtext ? (
            <div style={{display: 'flex', alignItems: 'center', gap: 14 * scale}}>
              {blink ? <span style={{fontFamily: t.fonts.display, fontSize: 26 * scale, color: '#fff', background: sem('red'), padding: `${3 * scale}px ${10 * scale}px`}}>NEW!</span> : <span style={{width: 66 * scale}} />}
              <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 30 * scale, color: sem('blue'), textDecoration: 'underline'}}>{d.subtext}</span>
            </div>
          ) : null}
        </div>
      </Win95>
    </AbsoluteFill>
  );
};

// STAT_PANELS — STATS.EXE window with sunken LCD counters.
export const RetroStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Win95 title={(d.headline || 'STATS').replace(/[\[\]]/g, '').toUpperCase()} status={d.source ? 'src: ' + d.source : undefined} style={{width: vertical ? '92%' : (1000 * scale + 'px')}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 26 * scale, justifyContent: 'center'}}>
          {stats.map((stat, i) => {
            const start = wordToFrame(stat.atWord);
            const c = stat.color ?? 'red';
            return (
              <div key={i} style={{...stackIn(frame, start, fps), flex: 1, display: 'flex', flexDirection: 'column', gap: 10 * scale}}>
                <div style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 22 * scale, color: INK, textTransform: 'uppercase'}}>{stat.kicker}</div>
                <div style={{...sunken(scale, '#000'), padding: `${14 * scale}px ${18 * scale}px`, textAlign: 'center'}}>
                  <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: (vertical ? 64 : 58) * scale, color: sem(c), fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em'}}>
                    {stat.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {d.verdict ? (
          <div style={{...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), marginTop: 22 * scale, textAlign: 'center'}}>
            <Win95Button label={d.verdict.text} color={sem(d.verdict.color ?? 'blue')} />
          </div>
        ) : null}
      </Win95>
    </AbsoluteFill>
  );
};

// STEP_FLOW — SETUP.EXE wizard with numbered beveled steps.
export const RetroStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Win95 title={(d.headline || 'SETUP').replace(/[\[\]]/g, '').toUpperCase() + '.EXE'} status={d.source ? 'src: ' + d.source : 'Setup Wizard'} style={{width: vertical ? '92%' : (1100 * scale + 'px')}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 22 * scale}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            const c = step.color ?? 'blue';
            return (
              <div key={i} style={{...stackIn(frame, start, fps), ...raised(scale), flex: 1, padding: `${18 * scale}px`, display: 'flex', flexDirection: 'column', gap: 10 * scale}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
                  <div style={{width: 44 * scale, height: 44 * scale, background: sem(c), border: `${2 * scale}px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fonts.display, fontSize: 24 * scale, color: '#fff'}}>{i + 1}</div>
                  <div style={{fontFamily: t.fonts.display, fontSize: 30 * scale, color: INK, textTransform: 'uppercase'}}>{step.title}</div>
                </div>
                {step.sub ? <div style={{fontFamily: t.fonts.body, fontSize: 24 * scale, color: '#303030', lineHeight: 1.3}}>{step.sub}</div> : null}
              </div>
            );
          })}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps), marginTop: 20 * scale, display: 'flex', justifyContent: 'flex-end'}}>
            <Win95Button label={'Next >  ' + d.caption.text} color={INK} />
          </div>
        ) : null}
      </Win95>
    </AbsoluteFill>
  );
};

// LIST_BUILD — a GeoCities bulleted list window.
export const RetroListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Win95 title={(scene.data.heading || 'LIST').toUpperCase() + '.HTM'} status="Done." style={{width: vertical ? '92%' : (1080 * scale + 'px')}}>
        <div style={{background: '#fff', border: `${1 * scale}px solid ${INK}`, padding: `${26 * scale}px ${30 * scale}px`, display: 'flex', flexDirection: 'column', gap: 20 * scale}}>
          {items.map((item, i) => (
            <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), display: 'flex', gap: 16 * scale, alignItems: 'baseline'}}>
              <span style={{color: sem('red'), fontSize: 30 * scale}}>{'\u25BA'}</span>
              <div>
                <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: (vertical ? 38 : 36) * scale, color: sem('blue'), textDecoration: 'underline'}}>{item.text}</span>
                {item.detail ? <div style={{fontFamily: t.fonts.body, fontSize: 24 * scale, color: INK}}>{item.detail}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </Win95>
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — a giant GeoCities "hit counter" (LCD odometer).
export const RetroStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Win95 title="COUNTER.CGI" status={d.label} style={{width: vertical ? '90%' : undefined}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 * scale}}>
          <div style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 28 * scale, color: INK}}>You are visitor #</div>
          <div style={{...sunken(scale, '#000'), padding: `${16 * scale}px ${26 * scale}px`, ...springPop(frame, start, fps)}}>
            <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: (vertical ? 150 : 190) * scale, color: sem('green'), fontVariantNumeric: 'tabular-nums', letterSpacing: '0.06em', textShadow: `0 0 ${16 * scale}px ${sem('green')}`}}>
              {d.prefix ?? ''}{value}{d.suffix ?? ''}
            </span>
          </div>
          <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontSize: 34 * scale, color: sem('blue'), textAlign: 'center', maxWidth: '80%', textDecoration: 'underline'}}>
            {d.label}
          </div>
          {(d.logos ?? []).length ? (
            <div style={{display: 'flex', gap: 18 * scale, marginTop: 4 * scale}}>
              {(d.logos ?? []).map((lg, i) => (
                <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps), ...raised(scale), padding: `${10 * scale}px`}}>
                  <AssetIcon asset={lg} size={(vertical ? 66 : 60) * scale} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Win95>
    </AbsoluteFill>
  );
};
