import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem} from '../../ui';
import {SemColor} from '../../types';
import {AssetIcon} from '../../AssetIcon';
import {Block, Tag, FdHeadline, onColor} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');
const CYC: SemColor[] = ['blue', 'green', 'orange', 'purple'];

// HOOK — hero in a solid blue block, bold headline, tag subtext.
export const FdHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 46 * scale}}>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps)}}>
          <Block color="blue" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: (vertical ? 236 : 220) * scale, height: (vertical ? 236 : 220) * scale, borderRadius: 20 * scale}}>
            <AssetIcon asset={d.heroAsset} size={(vertical ? 112 : 104) * scale} />
          </Block>
        </div>
      ) : null}
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.display,
          fontWeight: 800,
          fontSize: (vertical ? 80 : 94) * scale,
          letterSpacing: '-0.02em',
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '88%',
          lineHeight: 1.04,
        }}
      >
        {d.headline}
      </div>
      {d.subtext ? (
        <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) + 10, fps)}}>
          <Tag color="green">{d.subtext}</Tag>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — solid color blocks (color as structure), big numbers.
export const FdStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <FdHeadline text={d.headline} color={d.headlineColor ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 40 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          const c = (stat.color ?? CYC[i % CYC.length]) as SemColor;
          const fg = onColor(c);
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <Block color={c} style={{minWidth: (vertical ? 560 : 370) * scale, display: 'flex', flexDirection: 'column', gap: 14 * scale, alignItems: 'flex-start', padding: `${32 * scale}px ${36 * scale}px`}}>
                <div style={{fontFamily: t.fonts.mono, fontWeight: 600, fontSize: 24 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: fg, opacity: 0.85}}>{stat.kicker}</div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 96 : 88) * scale, color: fg, fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '-0.02em'}}>{stat.value}</div>
              </Block>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 116) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), fontFamily: t.fonts.display, fontWeight: 700, fontSize: 34 * scale, color: t.colors.accent}}>
          {d.verdict.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — neutral blocks with a solid colored number circle + color bar.
export const FdStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <FdHeadline text={d.headline} color={d.headlineColor ?? 'green'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 30 * scale, alignItems: 'stretch'}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            const c = (step.color ?? CYC[i % CYC.length]) as SemColor;
            return (
              <div key={i} style={{...springPop(frame, start, fps)}}>
                <Block style={{width: (vertical ? 540 : 300) * scale, display: 'flex', flexDirection: 'column', gap: 18 * scale, overflow: 'hidden'}}>
                  <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: 8 * scale, background: sem(c)}} />
                  <div style={{width: 60 * scale, height: 60 * scale, borderRadius: '50%', background: sem(c), display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8 * scale}}>
                    <span style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: 30 * scale, color: onColor(c)}}>{i + 1}</span>
                  </div>
                  <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: 38 * scale, color: t.colors.text, lineHeight: 1.08, letterSpacing: '-0.01em'}}>{step.title}</div>
                  {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.4}}>{step.sub}</div> : null}
                </Block>
              </div>
            );
          })}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.display, fontWeight: 700, fontSize: 30 * scale, color: t.colors.accent}}>{d.caption.text}</div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — neutral rows with the icon in a solid colored square.
export const FdListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 22 * scale, padding: 86 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 800, fontSize: 56 * scale, letterSpacing: '-0.02em', color: t.colors.text, marginBottom: 14 * scale}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => {
        const c = CYC[i % CYC.length];
        return (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '70%'}}>
            <Block style={{padding: `${20 * scale}px ${26 * scale}px`, display: 'flex', alignItems: 'center', gap: 26 * scale}}>
              <div style={{minWidth: 70 * scale, width: 70 * scale, height: 70 * scale, borderRadius: 12 * scale, background: sem(c), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <AssetIcon asset={item.icon} size={38 * scale} bare on={sem(c)} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 4 * scale}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 38 : 36) * scale, color: t.colors.text, lineHeight: 1.18, letterSpacing: '-0.01em'}}>{item.text}</div>
                {item.detail ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 25 * scale, color: t.colors.muted}}>{item.detail}</div> : null}
              </div>
            </Block>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant number in a solid color block, flat.
export const FdStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 36 * scale}}>
      <div style={{...springPop(frame, start, fps)}}>
        <Block color="blue" style={{padding: `${26 * scale}px ${58 * scale}px`, borderRadius: 20 * scale}}>
          <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 200 : 230) * scale, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums', lineHeight: 0.95, letterSpacing: '-0.03em'}}>
            {d.prefix ?? ''}{value}{d.suffix ?? ''}
          </div>
        </Block>
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 500, fontSize: 42 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '76%', lineHeight: 1.3}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 20 * scale, marginTop: 8 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <Block style={{width: 100 * scale, height: 100 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
                <AssetIcon asset={lg} size={(vertical ? 58 : 52) * scale} />
              </Block>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
