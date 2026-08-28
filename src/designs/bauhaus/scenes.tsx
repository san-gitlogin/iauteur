import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {SemColor} from '../../types';
import {BauBlock, BauShape, BauHeadline, RED, BLUE, YELLOW, INK, PAPER, onFill} from './primitives';
import {HookStage} from '../../hookStage';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// Map semantic hue → a Bauhaus primary (only red/blue/yellow exist).
const fillFor = (c?: SemColor | null): string => {
  if (c === 'blue' || c === 'purple' || c === 'green') return BLUE;
  if (c === 'yellow') return YELLOW;
  return RED; // red, orange, default
};
const shadowFor = (fill: string): string => (fill === YELLOW ? RED : YELLOW);
const CYCLE = [RED, BLUE, YELLOW];

// HOOK — geometric composition: circle behind hero, color-blocked headline.
export const BauHook: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  return (
    <HookStage
      scene={scene}
      kit={{
        accent: BLUE,
        headlineStyle: {fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', lineHeight: 0.96},
        mark: (size) => (
          <div style={{position: 'relative'}}>
            <BauShape kind="circle" size={size * 1.6} fill={BLUE} style={{position: 'absolute', top: -size * 0.24, left: -size * 0.24}} />
            <BauBlock fill={PAPER} shadow={RED} style={{position: 'relative', padding: size * 0.2}}>
              <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
            </BauBlock>
          </div>
        ),
        sub: (text) => (
          <BauBlock fill={YELLOW} shadow={BLUE} style={{padding: `${8 * scale}px ${20 * scale}px`}}>
            <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 26 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: INK}}>{text}</span>
          </BauBlock>
        ),
      }}
    />
  );
};

// STAT_PANELS — primary color-block stat cards.
export const BauStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <BauHeadline text={d.headline} fill={fillFor(d.headlineColor)} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 46 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          const fill = fillFor(stat.color);
          const fg = onFill(fill);
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <BauBlock fill={fill} shadow={shadowFor(fill)} style={{minWidth: (vertical ? 620 : 380) * scale, display: 'flex', flexDirection: 'column', gap: 8 * scale}}>
                <div style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 24 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: fg, opacity: 0.9}}>
                  {stat.kicker}
                </div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 96 : 88) * scale, letterSpacing: '-0.04em', color: fg, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>
                  {stat.value}
                </div>
                {stat.note ? <div style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 30 * scale, color: fg}}>{stat.note}</div> : null}
              </BauBlock>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 118) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps)}}>
          <span style={{display: 'inline-block', fontFamily: t.fonts.display, fontWeight: 900, fontSize: 34 * scale, textTransform: 'uppercase', background: YELLOW, color: INK, border: `${3 * scale}px solid ${INK}`, padding: `${6 * scale}px ${18 * scale}px`}}>
            {d.verdict.text}
          </span>
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — color-block steps with circle number badges.
export const BauStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <BauHeadline text={d.headline} fill={fillFor(d.headlineColor)} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 40 * scale, alignItems: 'center'}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            const fill = CYCLE[i % CYCLE.length];
            const fg = onFill(fill);
            return (
              <div key={i} style={{...springPop(frame, start, fps), position: 'relative'}}>
                <div style={{position: 'absolute', top: -26 * scale, left: -22 * scale, width: 58 * scale, height: 58 * scale, borderRadius: '50%', background: PAPER, border: `${4 * scale}px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fonts.display, fontWeight: 900, fontSize: 30 * scale, color: INK, zIndex: 2}}>
                  {i + 1}
                </div>
                <BauBlock fill={fill} shadow={shadowFor(fill)} style={{width: (vertical ? 520 : 300) * scale, display: 'flex', flexDirection: 'column', gap: 10 * scale}}>
                  <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: 40 * scale, textTransform: 'uppercase', color: fg, lineHeight: 1}}>
                    {step.title}
                  </div>
                  {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 26 * scale, color: fg, opacity: 0.92, lineHeight: 1.3}}>{step.sub}</div> : null}
                </BauBlock>
              </div>
            );
          })}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps)}}>
            <span style={{display: 'inline-block', fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 26 * scale, letterSpacing: '0.08em', textTransform: 'uppercase', background: PAPER, color: INK, border: `${3 * scale}px solid ${INK}`, padding: `${6 * scale}px ${18 * scale}px`}}>
              {d.caption.text}
            </span>
          </div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — color-block rows with circle number badges.
export const BauListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30 * scale, padding: 80 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 900, fontSize: 58 * scale, textTransform: 'uppercase', letterSpacing: '-0.03em', color: t.colors.text, marginBottom: 16 * scale}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => {
        const fill = CYCLE[i % CYCLE.length];
        const fg = onFill(fill);
        return (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '74%'}}>
            <BauBlock fill={fill} shadow={shadowFor(fill)} style={{display: 'flex', alignItems: 'center', gap: 26 * scale}}>
              <div style={{minWidth: 60 * scale, height: 60 * scale, borderRadius: '50%', background: PAPER, border: `${4 * scale}px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fonts.display, fontWeight: 900, fontSize: 30 * scale, color: INK}}>
                {i + 1}
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 2 * scale}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 42 : 40) * scale, textTransform: 'uppercase', color: fg, lineHeight: 1.05}}>
                  {item.text}
                </div>
                {item.detail ? <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 25 * scale, color: fg, opacity: 0.92, lineHeight: 1.25}}>{item.detail}</div> : null}
              </div>
            </BauBlock>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant number over a big Bauhaus circle + primary label block.
export const BauStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
      <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', ...springPop(frame, start, fps)}}>
        <BauShape kind="circle" size={(vertical ? 420 : 460) * scale} fill={RED} style={{position: 'absolute'}} />
        <div style={{position: 'relative', fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 180 : 210) * scale, letterSpacing: '-0.05em', color: '#FFFFFF', fontVariantNumeric: 'tabular-nums', lineHeight: 0.9}}>
          {d.prefix ?? ''}
          {value}
          {d.suffix ?? ''}
        </div>
      </div>
      <div style={{...fadeUp(frame, start + 14, fps)}}>
        <BauBlock fill={PAPER} shadow={BLUE} style={{padding: `${10 * scale}px ${22 * scale}px`, maxWidth: (vertical ? 900 : 1000) * scale}}>
          <span style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: 40 * scale, textTransform: 'uppercase', color: INK, textAlign: 'center', display: 'block'}}>{d.label}</span>
        </BauBlock>
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 20 * scale, marginTop: 6 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <BauBlock fill={PAPER} shadow={YELLOW} style={{padding: `${12 * scale}px`}}>
                <AssetIcon asset={lg} size={(vertical ? 72 : 64) * scale} />
              </BauBlock>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
