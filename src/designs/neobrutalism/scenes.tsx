import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {NeoBox, NeoHeadline, NeoTag, CREAM, INK} from './primitives';
import {HookStage} from '../../hookStage';

const formatNumber = (n: number) => n.toLocaleString('en-US');
const TILTS = [-2, 1.5, -1.5, 2, -1];

// HOOK — big tilted headline, hero sticker, pop subtext tag.
export const NeoHook: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  const sem = useSem();
  return (
    <HookStage
      scene={scene}
      kit={{
        accent: sem('purple'),
        headlineStyle: {fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', lineHeight: 0.98},
        mark: (size) => (
          <NeoBox fill={CREAM} shadow={sem('purple')} rotate={-3} style={{padding: size * 0.18}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </NeoBox>
        ),
        sub: (text) => <NeoTag text={text} color="yellow" rotate={2} />,
      }}
    />
  );
};

// TITLE_CARD — big tilted sticker title in a pop box + tag subtitle.
export const NeoTitleCard: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale, padding: 80 * scale}}>
      <div style={{...springPop(frame, 0, fps)}}>
        <NeoBox fill={sem('yellow')} shadow={INK} rotate={-2} style={{padding: `${30 * scale}px ${46 * scale}px`}}>
          <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 76 : 92) * scale, letterSpacing: '-0.03em', textTransform: 'uppercase', color: INK, textAlign: 'center', lineHeight: 0.98, maxWidth: (vertical ? 820 : 1240) * scale}}>{d.title}</div>
        </NeoBox>
      </div>
      {d.subtitle ? (<div style={{...fadeUp(frame, 12, fps)}}><NeoTag text={d.subtitle} color="purple" rotate={2} /></div>) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — pop sticker stat cards, alternating tilt, black numbers.
export const NeoStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <NeoHeadline text={d.headline} color={d.headlineColor ?? 'red'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 46 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          const c = stat.color ?? 'red';
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <NeoBox fill={sem(c)} shadow={INK} rotate={TILTS[i % TILTS.length]} style={{minWidth: (vertical ? 620 : 380) * scale, display: 'flex', flexDirection: 'column', gap: 8 * scale}}>
                <div style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 24 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: INK}}>
                  {stat.kicker}
                </div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 96 : 88) * scale, letterSpacing: '-0.04em', color: INK, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>
                  {stat.value}
                </div>
                {stat.note ? (
                  <div style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 30 * scale, color: INK}}>{stat.note}</div>
                ) : null}
              </NeoBox>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 120) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps)}}>
          <NeoTag text={d.verdict.text} color={d.verdict.color ?? 'yellow'} rotate={-1.5} />
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — tilted sticker cards with number badges; no connectors.
export const NeoStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <NeoHeadline text={d.headline} color={d.headlineColor ?? 'purple'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 34 * scale, alignItems: 'center'}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            const c = step.color ?? 'yellow';
            return (
              <div key={i} style={{...springPop(frame, start, fps), position: 'relative'}}>
                <NeoBox fill={CREAM} shadow={sem(c)} rotate={TILTS[i % TILTS.length]} style={{width: (vertical ? 540 : 300) * scale, display: 'flex', flexDirection: 'column', gap: 10 * scale}}>
                  <div style={{position: 'absolute', top: -28 * scale, left: -18 * scale, width: 56 * scale, height: 56 * scale, borderRadius: '50%', background: sem(c), border: `${4 * scale}px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fonts.display, fontWeight: 900, fontSize: 30 * scale, color: INK}}>
                    {i + 1}
                  </div>
                  <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: 40 * scale, textTransform: 'uppercase', letterSpacing: '-0.02em', color: INK, lineHeight: 1}}>
                    {step.title}
                  </div>
                  {step.sub ? (
                    <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 26 * scale, color: '#333', lineHeight: 1.3}}>{step.sub}</div>
                  ) : null}
                </NeoBox>
              </div>
            );
          })}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps)}}>
            <NeoTag text={d.caption.text} color={d.caption.color ?? 'yellow'} rotate={1.5} />
          </div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — tilted sticker rows with number badge + icon.
export const NeoListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  const fills: SemColorList = ['yellow', 'red', 'purple'];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30 * scale, padding: 80 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 900, fontSize: 58 * scale, textTransform: 'uppercase', letterSpacing: '-0.03em', color: t.colors.text, marginBottom: 16 * scale, transform: 'rotate(-1deg)'}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => (
        <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '74%'}}>
          <NeoBox fill={sem(fills[i % fills.length])} shadow={INK} rotate={TILTS[i % TILTS.length]} style={{display: 'flex', alignItems: 'center', gap: 26 * scale}}>
            <div style={{minWidth: 60 * scale, height: 60 * scale, borderRadius: '50%', background: CREAM, border: `${4 * scale}px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fonts.display, fontWeight: 900, fontSize: 30 * scale, color: INK}}>
              {i + 1}
            </div>
            <AssetIcon asset={item.icon} size={58 * scale} bare tint={INK} on={sem(fills[i % fills.length])} />
            <div style={{display: 'flex', flexDirection: 'column', gap: 2 * scale}}>
              <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 42 : 40) * scale, textTransform: 'uppercase', letterSpacing: '-0.02em', color: INK, lineHeight: 1.05}}>
                {item.text}
              </div>
              {item.detail ? (
                <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 25 * scale, color: '#222', lineHeight: 1.25}}>{item.detail}</div>
              ) : null}
            </div>
          </NeoBox>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — enormous number inside a big cream sticker + pop label tag.
export const NeoStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
      <div style={{...springPop(frame, start, fps)}}>
        <NeoBox fill={sem('yellow')} shadow={INK} rotate={-2} style={{padding: `${20 * scale}px ${48 * scale}px`}}>
          <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 200 : 230) * scale, letterSpacing: '-0.05em', color: INK, fontVariantNumeric: 'tabular-nums', lineHeight: 0.95}}>
            {d.prefix ?? ''}
            {value}
            {d.suffix ?? ''}
          </div>
        </NeoBox>
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.display, fontWeight: 800, fontSize: 44 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '80%', textTransform: 'uppercase', letterSpacing: '-0.01em'}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 22 * scale, marginTop: 6 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <NeoBox fill={CREAM} shadow={sem('purple')} rotate={TILTS[i % TILTS.length]} style={{padding: `${14 * scale}px`}}>
                <AssetIcon asset={lg} size={(vertical ? 74 : 66) * scale} />
              </NeoBox>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

type SemColorList = Array<'yellow' | 'red' | 'purple' | 'blue' | 'green' | 'orange'>;
