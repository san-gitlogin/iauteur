import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem, hexA} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {MatCard, MatChip, MatHeadline} from './primitives';
import {HookStage} from '../../hookStage';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — hero in a rounded tonal circle, rounded headline, pill subtext.
export const MatHook: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  const sem = useSem();
  return (
    <HookStage
      scene={scene}
      kit={{
        accent: sem('purple'),
        headlineStyle: {fontWeight: 500, lineHeight: 1.04},
        mark: (size) => (
          <div style={{width: size * 1.79, height: size * 1.79, borderRadius: '50%', background: hexA(sem('purple'), 0.18), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </div>
        ),
        sub: (text) => <MatChip text={text} color="purple" />,
      }}
    />
  );
};

// STAT_PANELS — elevated tonal cards with big primary numbers.
export const MatStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <MatHeadline text={d.headline} color={d.headlineColor ?? 'red'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 40 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          const c = stat.color ?? 'red';
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <MatCard tint={c} style={{minWidth: (vertical ? 640 : 400) * scale, display: 'flex', flexDirection: 'column', gap: 14 * scale}}>
                <MatChip text={stat.kicker} color={c} />
                <div style={{fontFamily: t.fonts.display, fontWeight: 500, fontSize: (vertical ? 96 : 88) * scale, color: sem(c), fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>
                  {stat.value}
                </div>
                {stat.note ? <div style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 30 * scale, color: t.colors.muted}}>{stat.note}</div> : null}
              </MatCard>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 116) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps)}}>
          <MatChip text={d.verdict.text} color={d.verdict.color ?? 'purple'} filled />
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — rounded cards with tonal number circles.
export const MatStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <MatHeadline text={d.headline} color={d.headlineColor ?? 'purple'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 30 * scale, alignItems: 'center'}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            const c = step.color ?? 'purple';
            return (
              <div key={i} style={{...springPop(frame, start, fps)}}>
                <MatCard style={{width: (vertical ? 540 : 300) * scale, display: 'flex', flexDirection: 'column', gap: 14 * scale}}>
                  <div style={{width: 56 * scale, height: 56 * scale, borderRadius: '50%', background: hexA(sem(c), 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fonts.display, fontWeight: 600, fontSize: 30 * scale, color: sem(c)}}>{i + 1}</div>
                  <div style={{fontFamily: t.fonts.display, fontWeight: 500, fontSize: 40 * scale, color: t.colors.text, lineHeight: 1.05}}>{step.title}</div>
                  {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.35}}>{step.sub}</div> : null}
                </MatCard>
              </div>
            );
          })}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps)}}>
            <MatChip text={d.caption.text} color={d.caption.color ?? 'purple'} filled />
          </div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — rounded tonal list rows with leading icon circles.
export const MatListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  const cyc: Array<'purple' | 'green' | 'blue'> = ['purple', 'green', 'blue'];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26 * scale, padding: 84 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 500, fontSize: 58 * scale, color: t.colors.text, marginBottom: 14 * scale}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => {
        const c = cyc[i % cyc.length];
        return (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '72%'}}>
            <MatCard style={{display: 'flex', alignItems: 'center', gap: 26 * scale}}>
              <div style={{minWidth: 72 * scale, width: 72 * scale, height: 72 * scale, borderRadius: '50%', background: hexA(sem(c), 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <AssetIcon asset={item.icon} size={40 * scale} bare tint={sem(c)} on={t.colors.panel} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 3 * scale}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 500, fontSize: (vertical ? 40 : 38) * scale, color: t.colors.text, lineHeight: 1.2}}>{item.text}</div>
                {item.detail ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 25 * scale, color: t.colors.muted}}>{item.detail}</div> : null}
              </div>
            </MatCard>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant primary number inside a soft tonal card.
export const MatStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 * scale}}>
      <div style={{...springPop(frame, start, fps)}}>
        <MatCard tint="purple" style={{padding: `${28 * scale}px ${54 * scale}px`}}>
          <div style={{fontFamily: t.fonts.display, fontWeight: 500, fontSize: (vertical ? 200 : 230) * scale, color: sem('purple'), fontVariantNumeric: 'tabular-nums', lineHeight: 0.95}}>
            {d.prefix ?? ''}{value}{d.suffix ?? ''}
          </div>
        </MatCard>
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 500, fontSize: 42 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '78%', lineHeight: 1.25}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 22 * scale, marginTop: 6 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps), width: 100 * scale, height: 100 * scale, borderRadius: '50%', background: t.colors.softSurface, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <AssetIcon asset={lg} size={(vertical ? 62 : 56) * scale} />
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
