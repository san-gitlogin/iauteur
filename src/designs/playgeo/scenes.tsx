import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {Sticker, Shape, PgHeadline, dotPattern} from './primitives';
import {HookStage} from '../../hookStage';

const formatNumber = (n: number) => n.toLocaleString('en-US');
const CYC: Array<'purple' | 'red' | 'yellow' | 'green'> = ['purple', 'red', 'yellow', 'green'];
const TILT = [-3, 2.5, -2, 3, -1.5];

// HOOK — hero in a leaf sticker, highlighter headline, pill subtext.
export const PgHook: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  return (
    <HookStage
      scene={scene}
      kit={{
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.04},
        mark: (size) => (
          <Sticker color="purple" index={0} rotate={-3} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: size * 2.07, height: size * 2.07}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </Sticker>
        ),
        sub: (text) => (
          <Sticker color="yellow" index={2} rotate={2} style={{padding: `${12 * scale}px ${30 * scale}px`}}>
            <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 28 * scale, color: t.colors.text}}>{text}</span>
          </Sticker>
        ),
      }}
    />
  );
};

// STAT_PANELS — sticker cards with big numbers + polka-dot corner badge.
export const PgStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <PgHeadline text={d.headline} color={d.headlineColor ?? 'purple'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 52 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          const c = stat.color ?? CYC[i % CYC.length];
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <Sticker color={c} index={i} rotate={TILT[i % TILT.length]} style={{minWidth: (vertical ? 560 : 370) * scale, display: 'flex', flexDirection: 'column', gap: 12 * scale, alignItems: 'center', overflow: 'hidden'}}>
                <div style={{position: 'absolute', top: 0, right: 0, width: 64 * scale, height: 64 * scale, ...dotPattern(sem(c), scale), opacity: 0.5}} />
                <div style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 24 * scale, letterSpacing: '0.03em', textTransform: 'uppercase', color: t.colors.muted, textAlign: 'center'}}>{stat.kicker}</div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 96 : 88) * scale, color: sem(c), fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{stat.value}</div>
              </Sticker>
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

// STEP_FLOW — number in a colored shape + sticker card.
export const PgStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <PgHeadline text={d.headline} color={d.headlineColor ?? 'green'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 34 * scale, alignItems: 'stretch'}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            const c = step.color ?? CYC[i % CYC.length];
            return (
              <div key={i} style={{...springPop(frame, start, fps)}}>
                <Sticker color={c} index={i} rotate={TILT[i % TILT.length]} style={{width: (vertical ? 540 : 300) * scale, display: 'flex', flexDirection: 'column', gap: 16 * scale}}>
                  <div style={{width: 66 * scale, height: 66 * scale, borderRadius: '50%', background: sem(c), display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `${5 * scale}px ${5 * scale}px 0 rgba(0,0,0,0.25)`}}>
                    <span style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: 34 * scale, color: t.colors.onAccent}}>{i + 1}</span>
                  </div>
                  <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: 40 * scale, color: t.colors.text, lineHeight: 1.05}}>{step.title}</div>
                  {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.35}}>{step.sub}</div> : null}
                </Sticker>
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

// LIST_BUILD — sticker rows with the icon in a colored rounded square.
export const PgListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26 * scale, padding: 84 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 800, fontSize: 56 * scale, color: t.colors.text, marginBottom: 12 * scale}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => {
        const c = CYC[i % CYC.length];
        return (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '72%'}}>
            <Sticker color={c} index={i} rotate={TILT[i % TILT.length] * 0.5} style={{padding: `${20 * scale}px ${26 * scale}px`, display: 'flex', alignItems: 'center', gap: 24 * scale}}>
              <div style={{minWidth: 74 * scale, width: 74 * scale, height: 74 * scale, borderRadius: 20 * scale, background: sem(c), display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `${5 * scale}px ${5 * scale}px 0 rgba(0,0,0,0.25)`}}>
                <AssetIcon asset={item.icon} size={40 * scale} bare on={sem(c)} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 3 * scale}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 40 : 38) * scale, color: t.colors.text, lineHeight: 1.2}}>{item.text}</div>
                {item.detail ? <div style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 25 * scale, color: t.colors.muted}}>{item.detail}</div> : null}
              </div>
            </Sticker>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant number in a sticker, scattered shapes around.
export const PgStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
      <div style={{...springPop(frame, start, fps), position: 'relative'}}>
        <Shape kind="circle" color={sem('yellow')} size={54} rotate={0} style={{left: -70 * scale, top: -40 * scale}} />
        <Shape kind="triangle" color={sem('green')} size={60} rotate={16} style={{right: -80 * scale, bottom: -30 * scale}} />
        <Sticker color="purple" index={0} rotate={-2} style={{padding: `${28 * scale}px ${56 * scale}px`}}>
          <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 200 : 230) * scale, color: sem('purple'), fontVariantNumeric: 'tabular-nums', lineHeight: 0.95}}>
            {d.prefix ?? ''}{value}{d.suffix ?? ''}
          </div>
        </Sticker>
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 600, fontSize: 42 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '78%', lineHeight: 1.3}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 22 * scale, marginTop: 6 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <Sticker color={CYC[i % CYC.length]} index={i + 1} style={{width: 104 * scale, height: 104 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
                <AssetIcon asset={lg} size={(vertical ? 60 : 54) * scale} />
              </Sticker>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
