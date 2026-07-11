import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {Blob, OrgHeadline, BLOB_RADII} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');
const ONBLOB = '#23241D';
const TILTS = [-3, 2, -2, 3, -1.5];

// HOOK — hero in a moss blob, Fraunces headline, sand blob subtext.
export const OrgHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 44 * scale}}>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps)}}>
          <Blob fill="green" index={0} rotate={-3} style={{width: (vertical ? 220 : 210) * scale, height: (vertical ? 220 : 210) * scale, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <AssetIcon asset={d.heroAsset} size={(vertical ? 112 : 104) * scale} />
          </Blob>
        </div>
      ) : null}
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.display,
          fontWeight: 600,
          fontSize: (vertical ? 82 : 96) * scale,
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
          <Blob fill="orange" index={2} rotate={2} style={{padding: `${12 * scale}px ${30 * scale}px`}}>
            <span style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 28 * scale, color: ONBLOB}}>{d.subtext}</span>
          </Blob>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — earthy blob stat cards with serif numbers.
export const OrgStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <OrgHeadline text={d.headline} color={d.headlineColor ?? 'red'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 50 * scale}}>
        {stats.map((stat, i) => {
          const start = wordToFrame(stat.atWord);
          const c = stat.color ?? 'red';
          return (
            <div key={i} style={{...stackIn(frame, start, fps)}}>
              <Blob fill={c} index={i} rotate={TILTS[i % TILTS.length]} style={{minWidth: (vertical ? 560 : 380) * scale, padding: `${34 * scale}px ${40 * scale}px`, display: 'flex', flexDirection: 'column', gap: 12 * scale, alignItems: 'center'}}>
                <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 24 * scale, letterSpacing: '0.04em', textTransform: 'uppercase', color: ONBLOB, opacity: 0.85, textAlign: 'center'}}>{stat.kicker}</div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 92 : 84) * scale, color: ONBLOB, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{stat.value}</div>
              </Blob>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 116) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 34 * scale, color: t.colors.accent}}>
          {d.verdict.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — blob cards with a small number blob.
export const OrgStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <OrgHeadline text={d.headline} color={d.headlineColor ?? 'green'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 36 * scale, alignItems: 'center'}}>
          {steps.map((step, i) => {
            const start = wordToFrame(step.atWord);
            const c = step.color ?? 'green';
            return (
              <div key={i} style={{...springPop(frame, start, fps)}}>
                <Blob index={i} rotate={TILTS[i % TILTS.length]} style={{width: (vertical ? 540 : 300) * scale, padding: `${30 * scale}px`, display: 'flex', flexDirection: 'column', gap: 16 * scale}}>
                  <Blob fill={c} index={i + 1} style={{width: 64 * scale, height: 64 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <span style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: 32 * scale, color: ONBLOB}}>{i + 1}</span>
                  </Blob>
                  <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: 40 * scale, color: t.colors.text, lineHeight: 1.05}}>{step.title}</div>
                  {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.35}}>{step.sub}</div> : null}
                </Blob>
              </div>
            );
          })}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 30 * scale, color: t.colors.accent}}>{d.caption.text}</div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — blob rows with the icon in an earthy blob.
export const OrgListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  const cyc: Array<'green' | 'orange' | 'yellow'> = ['green', 'orange', 'yellow'];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 28 * scale, padding: 84 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 600, fontSize: 58 * scale, color: t.colors.text, marginBottom: 14 * scale}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => {
        const c = cyc[i % cyc.length];
        return (
          <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '72%'}}>
            <Blob index={i} rotate={TILTS[i % TILTS.length] * 0.5} style={{padding: `${22 * scale}px ${28 * scale}px`, display: 'flex', alignItems: 'center', gap: 26 * scale}}>
              <Blob fill={c} index={i + 2} style={{minWidth: 76 * scale, width: 76 * scale, height: 76 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <AssetIcon asset={item.icon} size={40 * scale} bare on={t.colors.sem[c]} />
              </Blob>
              <div style={{display: 'flex', flexDirection: 'column', gap: 3 * scale}}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 40 : 38) * scale, color: t.colors.text, lineHeight: 1.2}}>{item.text}</div>
                {item.detail ? <div style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 25 * scale, color: t.colors.muted}}>{item.detail}</div> : null}
              </div>
            </Blob>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant serif number inside a big earthy blob.
export const OrgStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
        <Blob fill="green" index={0} rotate={-2} style={{padding: `${34 * scale}px ${60 * scale}px`}}>
          <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 200 : 230) * scale, color: ONBLOB, fontVariantNumeric: 'tabular-nums', lineHeight: 0.95}}>
            {d.prefix ?? ''}{value}{d.suffix ?? ''}
          </div>
        </Blob>
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 500, fontSize: 42 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '78%', lineHeight: 1.3}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 22 * scale, marginTop: 6 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <Blob index={i + 1} style={{width: 104 * scale, height: 104 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <AssetIcon asset={lg} size={(vertical ? 60 : 54) * scale} />
              </Blob>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
