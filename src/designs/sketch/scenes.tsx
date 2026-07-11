import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {Note, Doodle, SkHeadline, PENCIL} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');
const TILT = [-3, 2.5, -2, 3, -1.5];
const PAPER_CYC = [1, 3, 2, 4, 0];

// HOOK — hero taped to a paper note, big handwritten headline, post-it subtext.
export const SkHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 48 * scale}}>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps)}}>
          <Note paper={0} rotate={-3} wobble={0} tape style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: (vertical ? 244 : 228) * scale, height: (vertical ? 244 : 228) * scale}}>
            <AssetIcon asset={d.heroAsset} size={(vertical ? 112 : 104) * scale} />
          </Note>
        </div>
      ) : null}
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.display,
          fontWeight: 700,
          fontSize: (vertical ? 92 : 108) * scale,
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '88%',
          lineHeight: 1.0,
        }}
      >
        {d.headline}
      </div>
      {d.subtext ? (
        <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) + 10, fps)}}>
          <Note paper={1} rotate={2} wobble={1} style={{padding: `${10 * scale}px ${26 * scale}px`}}>
            <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 34 * scale, color: PENCIL}}>{d.subtext}</span>
          </Note>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — post-it notes with big handwritten numbers.
export const SkStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  const tacks = ['red', 'blue', 'green', 'orange'] as const;
  return (
    <AbsoluteFill>
      {d.headline ? <SkHeadline text={d.headline} color={d.headlineColor ?? 'red'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 50 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <Note paper={PAPER_CYC[i % PAPER_CYC.length]} rotate={TILT[i % TILT.length]} wobble={i} tack={tacks[i % tacks.length]} style={{minWidth: (vertical ? 540 : 350) * scale, display: 'flex', flexDirection: 'column', gap: 8 * scale, alignItems: 'center', paddingTop: 34 * scale}}>
                <div style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 30 * scale, color: PENCIL, opacity: 0.8, textAlign: 'center'}}>{stat.kicker}</div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 110 : 100) * scale, color: PENCIL, lineHeight: 1}}>{stat.value}</div>
              </Note>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 148 : 112) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), fontFamily: t.fonts.display, fontWeight: 700, fontSize: 40 * scale, color: t.colors.accent}}>
          {d.verdict.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — numbered notes linked by hand-drawn dashed arrows.
export const SkStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <SkHeadline text={d.headline} color={d.headlineColor ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 20 * scale, alignItems: 'center'}}>
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div style={{...springPop(frame, wordToFrame(step.atWord), fps)}}>
                <Note paper={PAPER_CYC[i % PAPER_CYC.length]} rotate={TILT[i % TILT.length]} wobble={i} style={{width: (vertical ? 520 : 300) * scale, display: 'flex', flexDirection: 'column', gap: 14 * scale}}>
                  <div style={{width: 58 * scale, height: 58 * scale, borderRadius: '48% 52% 50% 50%', border: `${3 * scale}px solid ${PENCIL}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <span style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 34 * scale, color: PENCIL}}>{i + 1}</span>
                  </div>
                  <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 44 * scale, color: PENCIL, lineHeight: 1.02}}>{step.title}</div>
                  {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 30 * scale, color: PENCIL, opacity: 0.75, lineHeight: 1.25}}>{step.sub}</div> : null}
                </Note>
              </div>
              {!vertical && i < steps.length - 1 ? <Doodle kind="arrow" color={sem('red')} size={90} style={{position: 'relative'}} /> : null}
            </React.Fragment>
          ))}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.display, fontWeight: 700, fontSize: 36 * scale, color: t.colors.accent}}>{d.caption.text}</div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — a lined-paper list with hand-drawn checkmarks.
export const SkListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 22 * scale, padding: 84 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 700, fontSize: 68 * scale, color: t.colors.text, marginBottom: 14 * scale}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => (
        <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '70%'}}>
          <Note paper={PAPER_CYC[i % PAPER_CYC.length]} rotate={TILT[i % TILT.length] * 0.5} wobble={i} style={{padding: `${18 * scale}px ${26 * scale}px`, display: 'flex', alignItems: 'center', gap: 24 * scale}}>
            <div style={{minWidth: 64 * scale, width: 64 * scale, height: 64 * scale, borderRadius: '46% 54% 50% 50%', border: `${3 * scale}px solid ${PENCIL}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Doodle kind="check" color={sem('green')} size={38} style={{position: 'relative'}} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 2 * scale}}>
              <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 44 : 42) * scale, color: PENCIL, lineHeight: 1.1}}>{item.text}</div>
              {item.detail ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 30 * scale, color: PENCIL, opacity: 0.72}}>{item.detail}</div> : null}
            </div>
          </Note>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant handwritten number on a note, circled in red marker.
export const SkStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 38 * scale}}>
      <div style={{...springPop(frame, start, fps), position: 'relative'}}>
        <Note paper={1} rotate={-2} wobble={0} tape style={{padding: `${24 * scale}px ${58 * scale}px`}}>
          <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 210 : 250) * scale, color: PENCIL, lineHeight: 0.95}}>
            {d.prefix ?? ''}{value}{d.suffix ?? ''}
          </div>
        </Note>
        <div style={{position: 'absolute', inset: -18 * scale, border: `${5 * scale}px solid ${sem('red')}`, borderRadius: '42% 58% 45% 55% / 55% 45% 58% 42%', pointerEvents: 'none'}} />
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 700, fontSize: 46 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '74%', lineHeight: 1.25}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 20 * scale, marginTop: 8 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <Note paper={PAPER_CYC[i % PAPER_CYC.length]} rotate={TILT[i % TILT.length]} wobble={i} style={{width: 108 * scale, height: 108 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
                <AssetIcon asset={lg} size={(vertical ? 58 : 52) * scale} />
              </Note>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
