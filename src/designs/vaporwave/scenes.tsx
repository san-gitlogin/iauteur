import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem, hexA} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {VaporPanel, VaporHeadline, VaporPrompt} from './primitives';
import {HookStage} from '../../hookStage';

const formatNumber = (n: number) => n.toLocaleString('en-US');
const SUNSET = 'linear-gradient(180deg, #FFE95C 0%, #FF9900 38%, #FF00FF 78%, #B85CFF 100%)';

// HOOK — gradient headline, glowing hero, terminal subtext.
export const VaporHook: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  return (
    <HookStage
      scene={scene}
      kit={{
        accent: '#FF00FF',
        headlineStyle: {
          fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.0,
          backgroundImage: SUNSET, WebkitBackgroundClip: 'text', backgroundClip: 'text',
          color: 'transparent', WebkitTextFillColor: 'transparent',
          filter: `drop-shadow(0 0 ${18 * scale}px ${hexA('#FF00FF', 0.55)})`,
        },
        mark: (size) => (
          <div style={{filter: `drop-shadow(0 0 ${20 * scale}px ${hexA('#FF00FF', 0.7)})`}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </div>
        ),
        sub: (text) => <VaporPrompt text={text} color="blue" />,
      }}
    />
  );
};

// STAT_PANELS — glass panels with glowing neon numbers.
export const VaporStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <VaporHeadline text={d.headline} color={d.headlineColor ?? 'red'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 44 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          const c = stat.color ?? 'red';
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <VaporPanel color={c} style={{minWidth: (vertical ? 640 : 400) * scale, display: 'flex', flexDirection: 'column', gap: 10 * scale}}>
                <div style={{fontFamily: t.fonts.mono, fontWeight: 500, fontSize: 24 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.colors.muted}}>
                  {stat.kicker}
                </div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 92 : 84) * scale, color: sem(c), fontVariantNumeric: 'tabular-nums', lineHeight: 1, textShadow: `0 0 ${22 * scale}px ${hexA(sem(c), 0.7)}`}}>
                  {stat.value}
                </div>
                {stat.note ? (
                  <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 28 * scale, color: t.colors.text}}>{stat.note}</div>
                ) : null}
              </VaporPanel>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 116) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps)}}>
          <VaporPrompt text={d.verdict.text} color={d.verdict.color ?? 'orange'} />
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — glass step panels joined by neon ">" chevrons.
export const VaporStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <VaporHeadline text={d.headline} color={d.headlineColor ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', gap: 12 * scale}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            const c = step.color ?? 'blue';
            return (
              <React.Fragment key={i}>
                {i > 0 ? (
                  <div style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 46 * scale, color: sem('purple'), textShadow: `0 0 ${14 * scale}px ${hexA('#FF00FF', 0.6)}`, transform: vertical ? 'rotate(90deg)' : undefined}}>
                    {'>'}
                  </div>
                ) : null}
                <div style={{...springPop(frame, start, fps)}}>
                  <VaporPanel color={c} style={{width: (vertical ? 520 : 300) * scale, display: 'flex', flexDirection: 'column', gap: 10 * scale}}>
                    <div style={{fontFamily: t.fonts.mono, fontWeight: 500, fontSize: 22 * scale, letterSpacing: '0.12em', textTransform: 'uppercase', color: sem(c)}}>
                      {step.kicker}
                    </div>
                    <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: 40 * scale, textTransform: 'uppercase', color: t.colors.text, lineHeight: 1, textShadow: `0 0 ${12 * scale}px ${hexA(sem(c), 0.4)}`}}>
                      {step.title}
                    </div>
                    {step.sub ? (
                      <div style={{fontFamily: t.fonts.body, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.3}}>{step.sub}</div>
                    ) : null}
                  </VaporPanel>
                </div>
              </React.Fragment>
            );
          })}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps)}}>
            <VaporPrompt text={d.caption.text} color={d.caption.color ?? 'orange'} />
          </div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — terminal-style glass rows: "> item".
export const VaporListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  const cyc: Array<'blue' | 'purple' | 'orange'> = ['blue', 'purple', 'orange'];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30 * scale, padding: 84 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 800, fontSize: 56 * scale, textTransform: 'uppercase', color: t.colors.text, marginBottom: 16 * scale, backgroundImage: SUNSET, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => {
        const c = cyc[i % cyc.length];
        return (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '74%'}}>
            <VaporPanel color={c} style={{display: 'flex', alignItems: 'center', gap: 24 * scale}}>
              <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 40 * scale, color: sem(c), textShadow: `0 0 ${12 * scale}px ${hexA(sem(c), 0.7)}`}}>{'>'}</span>
              <AssetIcon asset={item.icon} size={58 * scale} bare tint={sem(c)} on={t.colors.panel} />
              <div style={{display: 'flex', flexDirection: 'column', gap: 3 * scale}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 40 : 38) * scale, color: t.colors.text, lineHeight: 1.15}}>
                  {item.text}
                </div>
                {item.detail ? (
                  <div style={{fontFamily: t.fonts.mono, fontWeight: 400, fontSize: 24 * scale, color: t.colors.muted, letterSpacing: '0.04em'}}>{item.detail}</div>
                ) : null}
              </div>
            </VaporPanel>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — huge sunset-gradient number over the grid + terminal label.
export const VaporStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30 * scale}}>
      <div
        style={{
          ...springPop(frame, start, fps),
          fontFamily: t.fonts.display,
          fontWeight: 800,
          fontSize: (vertical ? 210 : 250) * scale,
          letterSpacing: '-0.02em',
          lineHeight: 0.9,
          fontVariantNumeric: 'tabular-nums',
          backgroundImage: SUNSET,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
          filter: `drop-shadow(0 0 ${40 * scale}px ${hexA('#FF00FF', 0.6)})`,
        }}
      >
        {d.prefix ?? ''}
        {value}
        {d.suffix ?? ''}
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 600, fontSize: 44 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '80%'}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 22 * scale, marginTop: 10 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps), filter: `drop-shadow(0 0 ${10 * scale}px ${hexA('#00FFFF', 0.6)})`}}>
              <AssetIcon asset={lg} size={(vertical ? 84 : 76) * scale} />
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
