import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {useScale, useSem} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {NewsPage, NewsBadge, INK, PAPER} from './primitives';
import {HookStage} from '../../hookStage';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — front page: BREAKING badge, huge serif banner, photo box, deck.
export const NewsHook: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  return (
    <HookStage
      scene={scene}
      kit={{
        accent: INK,
        headlineStyle: {fontWeight: 700, color: INK, lineHeight: 0.98, textTransform: 'uppercase'},
        plate: (children) => (
          <NewsPage style={{width: vertical ? '90%' : 1180 * scale + 'px'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 * scale}}>{children}</div>
          </NewsPage>
        ),
        kicker: () => <NewsBadge text="Breaking" />,
        mark: (size) => (
          <div style={{border: `${2 * scale}px solid ${INK}`, padding: size * 0.16, background: '#EBE8DF'}}>
            {/* AN ICON ON PAPER HAS TO BE INK. `AssetIcon` paints in the theme's light-on-dark
                glyph colour, so the mark rendered near-white inside a newsprint box and read as
                an empty frame. Pre-dates this rewrite; visible the moment a still was taken. */}
            <div style={{filter: 'brightness(0)'}}>
              <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
            </div>
          </div>
        ),
        divider: () => <div style={{height: 2 * scale, width: (vertical ? 380 : 460) * scale, background: INK}} />,
        sub: (text) => (
          <span style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 28 * scale, fontStyle: 'italic', color: INK}}>{text}</span>
        ),
      }}
    />
  );
};

// STAT_PANELS — a page with headline + ink-boxed figure columns.
export const NewsStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <NewsPage style={{width: vertical ? '92%' : (1120 * scale + 'px')}}>
        {d.headline ? (
          <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 52 : 58) * scale, color: INK, textAlign: 'center', textTransform: 'uppercase', lineHeight: 1.02, marginBottom: 20 * scale}}>
            {(d.headline || '').replace(/[\[\]]/g, '')}
          </div>
        ) : null}
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 0}}>
          {stats.map((stat, i) => {
            const start = wordToFrame(stat.atWord);
            return (
              <div key={i} style={{...stackIn(frame, start, fps), flex: 1, padding: `${16 * scale}px ${22 * scale}px`, borderLeft: !vertical && i > 0 ? `${2 * scale}px solid ${INK}` : undefined, borderTop: vertical && i > 0 ? `${2 * scale}px solid ${INK}` : undefined, textAlign: 'center'}}>
                <div style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 20 * scale, letterSpacing: '0.12em', textTransform: 'uppercase', color: INK}}>{stat.kicker}</div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 92 : 96) * scale, color: (stat.color === 'red' ? sem('red') : INK), fontVariantNumeric: 'tabular-nums', lineHeight: 1, marginTop: 8 * scale}}>{stat.value}</div>
              </div>
            );
          })}
        </div>
        {d.verdict ? (
          <div style={{...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), marginTop: 20 * scale, borderTop: `${3 * scale}px solid ${INK}`, paddingTop: 12 * scale, fontFamily: t.fonts.body, fontStyle: 'italic', fontSize: 30 * scale, color: INK, textAlign: 'center'}}>
            {d.verdict.text}
          </div>
        ) : null}
      </NewsPage>
    </AbsoluteFill>
  );
};

// STEP_FLOW — a page with a numbered column list separated by ink rules.
export const NewsStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <NewsPage style={{width: vertical ? '92%' : (1160 * scale + 'px')}}>
        {d.headline ? (
          <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 50 : 56) * scale, color: INK, textAlign: 'center', textTransform: 'uppercase', marginBottom: 18 * scale}}>
            {(d.headline || '').replace(/[\[\]]/g, '')}
          </div>
        ) : null}
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 0}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            return (
              <div key={i} style={{...fadeUp(frame, start, fps), flex: 1, padding: `${12 * scale}px ${22 * scale}px`, borderLeft: !vertical && i > 0 ? `${2 * scale}px solid ${INK}` : undefined, borderTop: vertical && i > 0 ? `${2 * scale}px solid ${INK}` : undefined}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 60 * scale, color: INK, lineHeight: 1}}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 32 * scale, color: INK, textTransform: 'uppercase', lineHeight: 1.05, marginTop: 6 * scale}}>{step.title}</div>
                {step.sub ? <div style={{marginTop: 8 * scale, fontFamily: t.fonts.body, fontSize: 24 * scale, color: '#3A362E', lineHeight: 1.35}}>{step.sub}</div> : null}
              </div>
            );
          })}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps), marginTop: 16 * scale, borderTop: `${2 * scale}px solid ${INK}`, paddingTop: 10 * scale, fontFamily: t.fonts.body, fontStyle: 'italic', fontSize: 26 * scale, color: INK, textAlign: 'center'}}>{d.caption.text}</div>
        ) : null}
      </NewsPage>
    </AbsoluteFill>
  );
};

// LIST_BUILD — a page column with a drop-cap first item + ink rules.
export const NewsListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <NewsPage style={{width: vertical ? '92%' : (1060 * scale + 'px')}}>
        {scene.data.heading ? (
          <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 54 : 60) * scale, color: INK, textAlign: 'center', textTransform: 'uppercase', marginBottom: 18 * scale}}>
            {scene.data.heading}
          </div>
        ) : null}
        <div style={{display: 'flex', flexDirection: 'column', gap: 16 * scale}}>
          {items.map((item, i) => (
            <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps)}}>
              <div style={{height: 1 * scale, background: INK, opacity: 0.4}} />
              <div style={{display: 'flex', gap: 20 * scale, alignItems: 'baseline', paddingTop: 12 * scale}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 54 * scale, color: INK, lineHeight: 0.9, minWidth: 44 * scale}}>{item.text.charAt(0)}</div>
                <div style={{flex: 1}}>
                  <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 42 : 40) * scale, color: INK, lineHeight: 1.1}}>{item.text.slice(1)}</div>
                  {item.detail ? <div style={{marginTop: 4 * scale, fontFamily: t.fonts.body, fontSize: 25 * scale, color: '#3A362E'}}>{item.detail}</div> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </NewsPage>
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — a front-page figure: giant serif number in an ink box.
export const NewsStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <NewsPage style={{width: vertical ? '90%' : undefined}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * scale}}>
          <div style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', color: INK}}>By the numbers</div>
          <div style={{...springPop(frame, start, fps), border: `${3 * scale}px solid ${INK}`, padding: `${10 * scale}px ${36 * scale}px`}}>
            <span style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 170 : 200) * scale, color: INK, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{d.prefix ?? ''}{value}{d.suffix ?? ''}</span>
          </div>
          <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontStyle: 'italic', fontSize: 34 * scale, color: INK, textAlign: 'center', maxWidth: (vertical ? 900 : 1000) * scale, lineHeight: 1.3}}>{d.label}</div>
          {(d.logos ?? []).length ? (
            <div style={{display: 'flex', gap: 18 * scale, marginTop: 4 * scale}}>
              {(d.logos ?? []).map((lg, i) => (
                <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps), border: `${2 * scale}px solid ${INK}`, padding: 10 * scale, background: '#EBE8DF'}}>
                  <AssetIcon asset={lg} size={(vertical ? 62 : 56) * scale} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </NewsPage>
    </AbsoluteFill>
  );
};
