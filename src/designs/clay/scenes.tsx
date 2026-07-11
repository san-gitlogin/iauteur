import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {ClayBlob, ClayPress, ClayHeadline, onClay} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — hero in a puffy clay orb, rounded headline, clay pill subtext.
export const ClayHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 46 * scale}}>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps)}}>
          <ClayBlob fill="purple" circle style={{width: (vertical ? 220 : 210) * scale, height: (vertical ? 220 : 210) * scale, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <AssetIcon asset={d.heroAsset} size={(vertical ? 112 : 104) * scale} />
          </ClayBlob>
        </div>
      ) : null}
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.display,
          fontWeight: 800,
          fontSize: (vertical ? 84 : 100) * scale,
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '88%',
          lineHeight: 1.02,
          letterSpacing: '-0.02em',
        }}
      >
        {d.headline}
      </div>
      {d.subtext ? (
        <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) + 10, fps)}}>
          <ClayPress style={{padding: `${12 * scale}px ${28 * scale}px`}}>
            <span style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 28 * scale, color: t.colors.muted}}>{d.subtext}</span>
          </ClayPress>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — puffy candy clay stat cards.
export const ClayStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <ClayHeadline text={d.headline} color={d.headlineColor ?? 'red'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 46 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          const c = stat.color ?? 'red';
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <ClayBlob fill={c} style={{minWidth: (vertical ? 620 : 400) * scale, padding: `${30 * scale}px ${36 * scale}px`, display: 'flex', flexDirection: 'column', gap: 12 * scale, alignItems: 'center'}}>
                <div style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 24 * scale, letterSpacing: '0.04em', textTransform: 'uppercase', color: onClay, opacity: 0.85}}>{stat.kicker}</div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 94 : 86) * scale, color: onClay, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{stat.value}</div>
              </ClayBlob>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 116) * scale, width: '100%', display: 'flex', justifyContent: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps)}}>
          <ClayBlob fill={d.verdict.color ?? 'purple'} style={{padding: `${10 * scale}px ${26 * scale}px`, borderRadius: 999}}>
            <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 28 * scale, color: onClay}}>{d.verdict.text}</span>
          </ClayBlob>
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — clay cards with puffy number orbs.
export const ClayStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <ClayHeadline text={d.headline} color={d.headlineColor ?? 'purple'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 34 * scale, alignItems: 'center'}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            const c = step.color ?? 'purple';
            return (
              <div key={i} style={{...springPop(frame, start, fps)}}>
                <ClayBlob style={{width: (vertical ? 540 : 300) * scale, padding: `${28 * scale}px`, display: 'flex', flexDirection: 'column', gap: 16 * scale}}>
                  <ClayBlob fill={c} circle style={{width: 64 * scale, height: 64 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <span style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: 32 * scale, color: onClay}}>{i + 1}</span>
                  </ClayBlob>
                  <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 40 * scale, color: t.colors.text, lineHeight: 1.05}}>{step.title}</div>
                  {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.35}}>{step.sub}</div> : null}
                </ClayBlob>
              </div>
            );
          })}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps)}}>
            <ClayBlob fill={d.caption.color ?? 'purple'} style={{padding: `${10 * scale}px ${26 * scale}px`, borderRadius: 999}}>
              <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 27 * scale, color: onClay}}>{d.caption.text}</span>
            </ClayBlob>
          </div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — puffy clay rows with the icon in a candy orb.
export const ClayListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  const cyc: Array<'purple' | 'green' | 'orange'> = ['purple', 'green', 'orange'];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26 * scale, padding: 84 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 800, fontSize: 58 * scale, color: t.colors.text, marginBottom: 14 * scale, letterSpacing: '-0.02em'}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => {
        const c = cyc[i % cyc.length];
        return (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '72%'}}>
            <ClayBlob style={{padding: `${22 * scale}px ${28 * scale}px`, display: 'flex', alignItems: 'center', gap: 26 * scale}}>
              <ClayBlob fill={c} circle style={{minWidth: 76 * scale, width: 76 * scale, height: 76 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <AssetIcon asset={item.icon} size={40 * scale} bare on={t.colors.sem[c]} />
              </ClayBlob>
              <div style={{display: 'flex', flexDirection: 'column', gap: 3 * scale}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 40 : 38) * scale, color: t.colors.text, lineHeight: 1.2}}>{item.text}</div>
                {item.detail ? <div style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 25 * scale, color: t.colors.muted}}>{item.detail}</div> : null}
              </div>
            </ClayBlob>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant number inside a huge puffy clay orb.
export const ClayStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
      <div style={{...springPop(frame, start, fps)}}>
        <ClayBlob fill="purple" style={{padding: `${28 * scale}px ${54 * scale}px`, borderRadius: 60 * scale}}>
          <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 200 : 230) * scale, color: onClay, fontVariantNumeric: 'tabular-nums', lineHeight: 0.95}}>
            {d.prefix ?? ''}{value}{d.suffix ?? ''}
          </div>
        </ClayBlob>
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 600, fontSize: 42 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '78%', lineHeight: 1.25}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 22 * scale, marginTop: 6 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <ClayBlob circle style={{width: 104 * scale, height: 104 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <AssetIcon asset={lg} size={(vertical ? 60 : 54) * scale} />
              </ClayBlob>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
