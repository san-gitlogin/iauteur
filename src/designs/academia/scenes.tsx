import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem, hexA} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {LibPlate, LibRule, LibHeadline, WaxSeal} from './primitives';
import {HookStage} from '../../hookStage';

const formatNumber = (n: number) => n.toLocaleString('en-US');
const roman = (n: number) => ['I', 'II', 'III', 'IV', 'V'][n - 1] ?? String(n);

// HOOK — book-plate framed serif headline + brass rule + hero.
export const LibHook: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  return (
    <HookStage
      scene={scene}
      kit={{
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 600, lineHeight: 1.06},
        plate: (children) => (
          <LibPlate style={{width: vertical ? '88%' : 1080 * scale + 'px'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 * scale}}>{children}</div>
          </LibPlate>
        ),
        mark: (size) => (
          <div style={{filter: `sepia(0.4) drop-shadow(0 0 ${14 * scale}px ${hexA(t.colors.accent, 0.5)})`}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </div>
        ),
        divider: () => <LibRule width={vertical ? 380 : 420} delay={0} />,
        sub: (text) => (
          <span style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 30 * scale, fontStyle: 'italic', letterSpacing: '0.06em', color: t.colors.accent}}>{text}</span>
        ),
      }}
    />
  );
};

// STAT_PANELS — book-plate stat cards with brass numbers + crimson labels.
export const LibStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <LibHeadline text={d.headline} color={d.headlineColor ?? 'red'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 46 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          const c = stat.color ?? 'orange';
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <LibPlate color={c} style={{minWidth: (vertical ? 560 : 380) * scale}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale}}>
                  <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 24 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', color: sem('red'), textAlign: 'center'}}>{stat.kicker}</div>
                  <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 88 : 82) * scale, color: sem(c), fontVariantNumeric: 'tabular-nums', lineHeight: 1, textShadow: `0 0 ${16 * scale}px ${hexA(sem(c), 0.4)}`}}>{stat.value}</div>
                </div>
              </LibPlate>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 118) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 34 * scale, color: t.colors.accent}}>
          {d.verdict.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — "Chapter I/II/III" plates with brass numerals.
export const LibStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <LibHeadline text={d.headline} color={d.headlineColor ?? 'orange'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 30 * scale, alignItems: 'center'}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            const c = step.color ?? 'orange';
            return (
              <div key={i} style={{...springPop(frame, start, fps)}}>
                <LibPlate color={c} style={{width: (vertical ? 500 : 300) * scale}}>
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 * scale, textAlign: 'center'}}>
                    <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 20 * scale, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.colors.muted}}>{'Chapter ' + roman(i + 1)}</div>
                    <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 34 * scale, color: sem(c), lineHeight: 1.05}}>{step.title}</div>
                    {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 25 * scale, fontStyle: 'italic', color: t.colors.muted, lineHeight: 1.35}}>{step.sub}</div> : null}
                  </div>
                </LibPlate>
              </div>
            );
          })}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 30 * scale, color: t.colors.accent}}>{d.caption.text}</div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — manuscript list with fleuron bullets + wood-grain hairlines.
export const LibListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 22 * scale, padding: 90 * scale}}>
      {scene.data.heading ? (
        <>
          <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 58 : 64) * scale, color: t.colors.text, textAlign: 'center'}}>
            {scene.data.heading}
          </div>
          <div style={{marginBottom: 14 * scale}}><LibRule width={vertical ? 380 : 420} delay={8} /></div>
        </>
      ) : null}
      <div style={{width: vertical ? '92%' : '70%', display: 'flex', flexDirection: 'column', gap: 20 * scale}}>
        {items.map((item, i) => (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps)}}>
            <div style={{height: 1 * scale, background: t.colors.panelBorder}} />
            <div style={{display: 'flex', gap: 22 * scale, alignItems: 'baseline', paddingTop: 14 * scale}}>
              <span style={{fontFamily: t.fonts.display, fontSize: 34 * scale, color: t.colors.accent}}>{'\u2766'}</span>
              <div style={{flex: 1}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 44 : 42) * scale, color: t.colors.text, lineHeight: 1.12}}>{item.text}</div>
                {item.detail ? <div style={{marginTop: 6 * scale, fontFamily: t.fonts.body, fontWeight: 500, fontSize: 26 * scale, fontStyle: 'italic', color: t.colors.muted}}>{item.detail}</div> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant brass serif number over a wax-seal medallion.
export const LibStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 28 * scale}}>
      <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'absolute'}}><WaxSeal size={(vertical ? 440 : 480) * scale} /></div>
        <div style={{...springPop(frame, start, fps), position: 'relative', fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 170 : 200) * scale, color: t.colors.accent, fontVariantNumeric: 'tabular-nums', lineHeight: 0.95, textShadow: `0 ${2 * scale}px ${8 * scale}px rgba(0,0,0,0.5)`}}>
          {d.prefix ?? ''}{value}{d.suffix ?? ''}
        </div>
      </div>
      <LibRule width={vertical ? 360 : 420} delay={start + 8} />
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 500, fontSize: 36 * scale, fontStyle: 'italic', color: t.colors.muted, textAlign: 'center', maxWidth: '78%', lineHeight: 1.35}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 22 * scale, marginTop: 8 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps), filter: 'sepia(0.4)'}}>
              <AssetIcon asset={lg} size={(vertical ? 74 : 66) * scale} />
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
