import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem, hexA} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {SwissHeadline, SwissRule, SwissIndex, useSwissMargins} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — giant flush-left statement, red bar, hero glyph top-right.
export const SwissHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {left, right, scale, vertical} = useSwissMargins();
  const d = scene.data;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left, right, top: (vertical ? 300 : 300) * scale}}>
        <div style={{marginBottom: 20 * scale}}>
          <SwissIndex n={1} color="red" />
        </div>
        <div
          style={{
            ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
            fontFamily: t.fonts.display,
            fontWeight: 900,
            fontSize: (vertical ? 92 : 118) * scale,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            lineHeight: 0.94,
            color: t.colors.text,
          }}
        >
          {d.headline}
        </div>
        <div style={{marginTop: 28 * scale, maxWidth: '70%'}}>
          <SwissRule color="red" weight={3} delay={wordToFrame(d.headlineAtWord) + 8} />
        </div>
        {d.subtext ? (
          <div
            style={{
              ...fadeUp(frame, wordToFrame(d.headlineAtWord) + 12, fps),
              marginTop: 22 * scale,
              fontFamily: t.fonts.mono,
              fontWeight: 500,
              fontSize: 30 * scale,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: t.colors.muted,
            }}
          >
            {d.subtext}
          </div>
        ) : null}
      </div>
      {d.heroAsset ? (
        <div style={{position: 'absolute', top: (vertical ? 150 : 110) * scale, right: left, ...springPop(frame, wordToFrame(d.heroAtWord), fps)}}>
          <AssetIcon asset={d.heroAsset} size={(vertical ? 120 : 130) * scale} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — flush-left stat rows divided by hairlines; number-forward.
export const SwissStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {left, right, scale, vertical} = useSwissMargins();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <SwissHeadline text={d.headline} color={d.headlineColor ?? 'red'} /> : null}
      <div style={{position: 'absolute', left, right, top: (vertical ? 430 : 380) * scale, display: 'flex', flexDirection: 'column', gap: 26 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          const c = stat.color ?? 'red';
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <SwissRule color={c} delay={start} />
              <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: 14 * scale}}>
                <div style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 26 * scale, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.colors.muted, maxWidth: '55%'}}>
                  {stat.kicker}
                </div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 84 : 96) * scale, letterSpacing: '-0.04em', color: sem(c), fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>
                  {stat.value}
                </div>
              </div>
            </div>
          );
        })}
        {d.verdict ? (
          <div style={{...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), marginTop: 8 * scale, fontFamily: t.fonts.display, fontWeight: 800, fontSize: 34 * scale, textTransform: 'uppercase', letterSpacing: '-0.01em', color: sem(d.verdict.color ?? 'red')}}>
            {'→ ' + d.verdict.text}
          </div>
        ) : null}
      </div>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — numbered columns split by vertical hairlines, flush-left titles.
export const SwissStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {left, right, scale, vertical} = useSwissMargins();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <SwissHeadline text={d.headline} color={d.headlineColor ?? 'red'} /> : null}
      <div style={{position: 'absolute', left, right, top: (vertical ? 440 : 400) * scale, display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: vertical ? 24 * scale : 0}}>
        {steps.map((step, i) => {
          const start = wordToFrame(step.atWord);
          const c = step.color ?? 'red';
          return (
            <div
              key={i}
              style={{
                ...fadeUp(frame, start, fps),
                flex: 1,
                paddingLeft: vertical ? 0 : (i === 0 ? 0 : 30 * scale),
                paddingRight: vertical ? 0 : 30 * scale,
                borderLeft: !vertical && i > 0 ? `1.5px solid ${t.colors.panelBorder}` : undefined,
                borderTop: vertical ? `1.5px solid ${t.colors.panelBorder}` : undefined,
                paddingTop: vertical ? 16 * scale : 0,
              }}
            >
              <div style={{marginBottom: 14 * scale}}>
                <SwissIndex n={i + 1} color={c} />
              </div>
              <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 46 : 44) * scale, textTransform: 'uppercase', letterSpacing: '-0.02em', color: t.colors.text, lineHeight: 1.02}}>
                {step.title}
              </div>
              {step.sub ? (
                <div style={{marginTop: 12 * scale, fontFamily: t.fonts.body, fontWeight: 500, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.3}}>
                  {step.sub}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {d.caption ? (
        <div style={{position: 'absolute', left, right, top: (vertical ? 760 : 720) * scale, ...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.mono, fontWeight: 600, fontSize: 28 * scale, letterSpacing: '0.08em', textTransform: 'uppercase', color: sem(d.caption.color ?? 'red')}}>
          {d.caption.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — numbered flush-left rows separated by hairlines. No icons.
export const SwissListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {left, right, scale, vertical} = useSwissMargins();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill>
      {scene.data.heading ? (
        <div style={{position: 'absolute', top: (vertical ? 160 : 110) * scale, left, right}}>
          <div style={{width: 64 * scale, height: 8 * scale, background: t.colors.accent, marginBottom: 20 * scale}} />
          <div style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 58 : 66) * scale, textTransform: 'uppercase', letterSpacing: '-0.03em', color: t.colors.text}}>
            {scene.data.heading}
          </div>
        </div>
      ) : null}
      <div style={{position: 'absolute', left, right, top: (vertical ? 400 : 360) * scale, display: 'flex', flexDirection: 'column', gap: 22 * scale}}>
        {items.map((item, i) => (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps)}}>
            <SwissRule delay={wordToFrame(item.atWord)} />
            <div style={{display: 'flex', gap: 30 * scale, alignItems: 'baseline', paddingTop: 14 * scale}}>
              <SwissIndex n={i + 1} color="red" />
              <div style={{flex: 1}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 44 : 42) * scale, textTransform: 'uppercase', letterSpacing: '-0.02em', color: t.colors.text, lineHeight: 1.05}}>
                  {item.text}
                </div>
                {item.detail ? (
                  <div style={{marginTop: 8 * scale, fontFamily: t.fonts.body, fontWeight: 500, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.3}}>
                    {item.detail}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — enormous flush-left number with red unit + label.
export const SwissStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {left, right, scale, vertical} = useSwissMargins();
  const d = scene.data;
  const start = wordToFrame(d.atWord);
  const target = d.value ?? 0;
  const decimals = Number.isInteger(target) ? 0 : 1;
  const animated = counterValue(frame, start, Math.round(target * 10 ** decimals)) / 10 ** decimals;
  const value = decimals ? animated.toFixed(1) : formatNumber(animated);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left, right, top: (vertical ? 560 : 300) * scale}}>
        <div
          style={{
            ...fadeUp(frame, start, fps),
            fontFamily: t.fonts.display,
            fontWeight: 900,
            fontSize: (vertical ? 260 : 320) * scale,
            letterSpacing: '-0.06em',
            lineHeight: 0.86,
            color: t.colors.text,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {d.prefix ?? ''}
          {value}
          <span style={{color: sem('red')}}>{d.suffix ?? ''}</span>
        </div>
        <div style={{marginTop: 30 * scale, maxWidth: '80%'}}>
          <SwissRule color="red" weight={3} delay={start + 8} />
        </div>
        <div style={{...fadeUp(frame, start + 14, fps), marginTop: 22 * scale, fontFamily: t.fonts.body, fontWeight: 600, fontSize: 40 * scale, color: t.colors.muted, maxWidth: '80%', lineHeight: 1.25}}>
          {d.label}
        </div>
        {(d.logos ?? []).length ? (
          <div style={{display: 'flex', gap: 26 * scale, marginTop: 30 * scale}}>
            {(d.logos ?? []).map((lg, i) => (
              <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
                <AssetIcon asset={lg} size={(vertical ? 84 : 76) * scale} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
