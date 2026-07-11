import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem, hexA} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {LuxRule, LuxOverline, LuxHeadline} from './primitives';
import {Donut} from '../../charts';

const LUX_CYCLE = ['blue', 'purple', 'green', 'orange', 'yellow', 'red'] as const;

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — hero glyph, gold overline, Playfair headline, hairline.
export const LuxHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps), filter: `drop-shadow(0 0 ${20 * scale}px ${hexA(t.colors.accent, 0.4)})`}}>
          <AssetIcon asset={d.heroAsset} size={(vertical ? 150 : 138) * scale} />
        </div>
      ) : null}
      <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) - 2, fps)}}>
        <LuxOverline text={d.subtext ?? ''} />
      </div>
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.display,
          fontWeight: 500,
          fontSize: (vertical ? 92 : 108) * scale,
          letterSpacing: '-0.01em',
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '86%',
          lineHeight: 1.02,
        }}
      >
        {d.headline}
      </div>
      <div style={{width: (vertical ? 200 : 240) * scale}}>
        <LuxRule delay={wordToFrame(d.headlineAtWord) + 10} />
      </div>
    </AbsoluteFill>
  );
};

// STAT_PANELS — hairline-divided stat rows; gold overline + Playfair number.
export const LuxStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <LuxHeadline text={d.headline} /> : null}
      <div style={{position: 'absolute', left: (vertical ? 80 : 200) * scale, right: (vertical ? 80 : 200) * scale, top: (vertical ? 440 : 380) * scale, display: 'flex', flexDirection: 'column', gap: 30 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          const c = stat.color ?? 'orange';
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <LuxRule delay={start} />
              <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: 16 * scale}}>
                <div style={{maxWidth: '55%'}}>
                  <LuxOverline text={stat.kicker} gold={false} size={22} />
                </div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 500, fontSize: (vertical ? 88 : 96) * scale, color: sem(c), fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>
                  {stat.value}
                </div>
              </div>
            </div>
          );
        })}
        {d.verdict ? (
          <div style={{...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), marginTop: 6 * scale, fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 34 * scale, color: t.colors.accent}}>
            {d.verdict.text}
          </div>
        ) : null}
      </div>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — numbered "N° 01" columns divided by gold hairlines.
export const LuxStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <LuxHeadline text={d.headline} /> : null}
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
                borderLeft: !vertical && i > 0 ? `1px solid ${hexA(t.colors.accent, 0.3)}` : undefined,
                borderTop: vertical ? `1px solid ${hexA(t.colors.accent, 0.3)}` : undefined,
                paddingTop: vertical ? 18 * scale : 0,
              }}
            >
              <div style={{marginBottom: 16 * scale}}>
                <LuxOverline text={'N\u00B0 ' + String(i + 1).padStart(2, '0')} />
              </div>
              <div style={{fontFamily: t.fonts.display, fontWeight: 500, fontSize: (vertical ? 48 : 46) * scale, color: t.colors.text, lineHeight: 1.05}}>
                {step.title}
              </div>
              {step.sub ? (
                <div style={{marginTop: 12 * scale, fontFamily: t.fonts.body, fontWeight: 400, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.4}}>
                  {step.sub}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {d.caption ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: (vertical ? 780 : 730) * scale, textAlign: 'center', ...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 32 * scale, color: t.colors.accent}}>
          {d.caption.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — hairline-divided rows, "N° 01" gold overline + Playfair item.
export const LuxListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill>
      {scene.data.heading ? (
        <div style={{position: 'absolute', top: (vertical ? 170 : 116) * scale, left: (vertical ? 80 : 200) * scale, right: (vertical ? 80 : 200) * scale, textAlign: 'center'}}>
          <div style={{fontFamily: t.fonts.display, fontWeight: 500, fontSize: (vertical ? 58 : 66) * scale, color: t.colors.text}}>
            {scene.data.heading}
          </div>
        </div>
      ) : null}
      <div style={{position: 'absolute', left: (vertical ? 80 : 240) * scale, right: (vertical ? 80 : 240) * scale, top: (vertical ? 400 : 340) * scale, display: 'flex', flexDirection: 'column', gap: 24 * scale}}>
        {items.map((item, i) => (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps)}}>
            <LuxRule delay={wordToFrame(item.atWord)} />
            <div style={{display: 'flex', gap: 30 * scale, alignItems: 'baseline', paddingTop: 16 * scale}}>
              <div style={{fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 34 * scale, color: t.colors.accent, minWidth: 60 * scale}}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{flex: 1}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 500, fontSize: (vertical ? 46 : 44) * scale, color: t.colors.text, lineHeight: 1.1}}>
                  {item.text}
                </div>
                {item.detail ? (
                  <div style={{marginTop: 8 * scale, fontFamily: t.fonts.body, fontWeight: 400, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.35}}>
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

// STAT_CALLOUT — enormous Playfair number, gold hairline, overline label.
export const LuxStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
      <div
        style={{
          ...springPop(frame, start, fps),
          fontFamily: t.fonts.display,
          fontWeight: 500,
          fontSize: (vertical ? 230 : 280) * scale,
          letterSpacing: '-0.02em',
          lineHeight: 0.9,
          color: t.colors.text,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {d.prefix ?? ''}
        {value}
        <span style={{color: t.colors.accent, fontStyle: 'italic'}}>{d.suffix ?? ''}</span>
      </div>
      <div style={{width: (vertical ? 300 : 360) * scale}}>
        <LuxRule delay={start + 8} />
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 400, fontSize: 40 * scale, color: t.colors.muted, textAlign: 'center', maxWidth: '76%', lineHeight: 1.3}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 26 * scale, marginTop: 14 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps), opacity: 0.85}}>
              <AssetIcon asset={lg} size={(vertical ? 78 : 70) * scale} />
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// DONUT — a gold-accented donut with hairline-separated legend rows (no boxes).
export const LuxDonut: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const segs = d.donut?.segments ?? [];
  const size = (vertical ? 540 : 500) * scale;
  return (
    <AbsoluteFill>
      {d.headline ? <LuxHeadline text={d.headline} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: (vertical ? 36 : 80) * scale, paddingTop: (vertical ? 150 : 90) * scale}}>
        {d.donut ? <Donut data={d.donut} size={size} /> : null}
        <div style={{display: 'flex', flexDirection: 'column', minWidth: (vertical ? 460 : 380) * scale}}>
          {segs.map((s, i) => {
            const c = sem(s.color ?? LUX_CYCLE[i % LUX_CYCLE.length]);
            const shown = frame >= wordToFrame(s.atWord);
            return (
              <div key={i} style={{opacity: shown ? 1 : 0.25}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16 * scale, padding: `${16 * scale}px 0`}}>
                  <div style={{width: 12 * scale, height: 12 * scale, borderRadius: '50%', background: c}} />
                  <span style={{fontFamily: t.fonts.display, fontSize: 34 * scale, color: t.colors.text}}>{s.label}</span>
                  <span style={{fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 34 * scale, color: t.colors.accent, marginLeft: 'auto', fontVariantNumeric: 'tabular-nums'}}>{s.value}</span>
                </div>
                <LuxRule delay={wordToFrame(s.atWord)} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
