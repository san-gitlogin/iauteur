import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem, hexA} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {TermCursor, TermWindow, glow} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — shell prompt + all-caps headline with a blinking cursor.
export const TermHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps), filter: `drop-shadow(0 0 ${16 * scale}px ${hexA(t.colors.accent, 0.6)})`}}>
          <AssetIcon asset={d.heroAsset} size={(vertical ? 150 : 140) * scale} />
        </div>
      ) : null}
      <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) - 2, fps), fontFamily: t.fonts.mono, fontSize: 30 * scale, color: t.colors.accent2, ...glow(scale, '#ffb000')}}>
        <span style={{color: t.colors.muted}}>$ </span>
        run --query
      </div>
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.mono,
          fontWeight: 700,
          fontSize: (vertical ? 74 : 92) * scale,
          textTransform: 'uppercase',
          color: t.colors.accent,
          textAlign: 'center',
          maxWidth: '90%',
          lineHeight: 1.05,
          ...glow(scale, '#33ff00'),
        }}
      >
        {d.headline}
        <TermCursor size={(vertical ? 62 : 76) * scale} />
      </div>
      {d.subtext ? (
        <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) + 10, fps), fontFamily: t.fonts.mono, fontSize: 28 * scale, color: t.colors.muted}}>
          <span style={{color: t.colors.accent2}}># </span>
          {d.subtext}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — a "SYSTEM STATUS" window with aligned metric lines + codes.
export const TermStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  const code = (c?: string) => (c === 'red' ? '[ERR]' : c === 'green' ? '[OK]' : '[WARN]');
  return (
    <AbsoluteFill>
      {d.headline ? (
        <div style={{position: 'absolute', top: (vertical ? 150 : 100) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.mono, fontWeight: 700, fontSize: (vertical ? 52 : 60) * scale, textTransform: 'uppercase', color: t.colors.accent, ...glow(scale, '#33ff00'), padding: `0 ${60 * scale}px`}}>
          {(d.headline || '').replace(/[\[\]]/g, '')}
        </div>
      ) : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <TermWindow title="SYSTEM STATUS" style={{width: (vertical ? '90%' : (760 * scale + 'px'))}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 22 * scale}}>
            {stats.map((stat, i) => {
              const start = wordToFrame(stat.atWord);
              const c = stat.color ?? 'green';
              return (
                <div key={i} style={{...stackIn(frame, start, fps), display: 'flex', alignItems: 'baseline', gap: 12 * scale, fontFamily: t.fonts.mono}}>
                  <span style={{color: t.colors.muted, fontSize: 26 * scale, whiteSpace: 'nowrap'}}>{stat.kicker.replace(/\s+/g, '_').toLowerCase()}</span>
                  <span style={{flex: 1, color: hexA(t.colors.accent, 0.4), overflow: 'hidden', whiteSpace: 'nowrap', letterSpacing: '0.1em'}}>{' .'.repeat(60)}</span>
                  <span style={{color: sem(c), fontWeight: 700, fontSize: 40 * scale, ...glow(scale, sem(c))}}>{stat.value}</span>
                  <span style={{color: sem(c), fontSize: 24 * scale, minWidth: 90 * scale, textAlign: 'right'}}>{code(c)}</span>
                </div>
              );
            })}
          </div>
        </TermWindow>
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 118) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), fontFamily: t.fonts.mono, fontSize: 28 * scale, color: t.colors.accent2}}>
          {'> ' + d.verdict.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — a shell pipeline of [n] steps, each ending [OK].
export const TermStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? (
        <div style={{position: 'absolute', top: (vertical ? 150 : 100) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.mono, fontWeight: 700, fontSize: (vertical ? 52 : 60) * scale, textTransform: 'uppercase', color: t.colors.accent, ...glow(scale, '#33ff00'), padding: `0 ${60 * scale}px`}}>
          {(d.headline || '').replace(/[\[\]]/g, '')}
        </div>
      ) : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <TermWindow title="RUN PIPELINE" style={{width: vertical ? '90%' : (860 * scale + 'px')}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 24 * scale}}>
            {steps.map((step, i) => {
              const start = wordToFrame(step.atWord);
              const c = step.color ?? 'green';
              return (
                <div key={i} style={{...stackIn(frame, start, fps), fontFamily: t.fonts.mono}}>
                  <div style={{display: 'flex', alignItems: 'baseline', gap: 14 * scale}}>
                    <span style={{color: t.colors.accent2}}>{'[' + (i + 1) + ']'}</span>
                    <span style={{color: t.colors.accent, fontWeight: 700, fontSize: 38 * scale, textTransform: 'uppercase', ...glow(scale, '#33ff00')}}>{step.title.replace(/\s+/g, '_')}</span>
                    <span style={{flex: 1}} />
                    <span style={{color: sem('green'), fontSize: 24 * scale}}>[OK]</span>
                  </div>
                  {step.sub ? <div style={{marginLeft: 48 * scale, color: t.colors.muted, fontSize: 25 * scale}}>{'# ' + step.sub}</div> : null}
                </div>
              );
            })}
          </div>
        </TermWindow>
      </AbsoluteFill>
      {d.caption ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 116) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.mono, fontSize: 27 * scale, color: t.colors.accent2}}>
          {'$ ' + d.caption.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — a checklist window: [x] item.
export const TermListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30 * scale, padding: 70 * scale}}>
      {scene.data.heading ? (
        <div style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: (vertical ? 50 : 56) * scale, textTransform: 'uppercase', color: t.colors.accent, ...glow(scale, '#33ff00'), marginBottom: 8 * scale}}>
          {'> ' + scene.data.heading}
        </div>
      ) : null}
      <TermWindow title="TODO.LIST" style={{width: vertical ? '94%' : (900 * scale + 'px')}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 22 * scale}}>
          {items.map((item, i) => (
            <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), fontFamily: t.fonts.mono, display: 'flex', gap: 16 * scale, alignItems: 'baseline'}}>
              <span style={{color: t.colors.accent2}}>[x]</span>
              <div>
                <div style={{color: t.colors.accent, fontWeight: 700, fontSize: (vertical ? 38 : 36) * scale, ...glow(scale, '#33ff00')}}>{item.text}</div>
                {item.detail ? <div style={{color: t.colors.muted, fontSize: 24 * scale}}>{'# ' + item.detail}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </TermWindow>
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant glowing mono number with a blinking cursor.
export const TermStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
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
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26 * scale}}>
      <div style={{fontFamily: t.fonts.mono, fontSize: 28 * scale, color: t.colors.muted, ...fadeUp(frame, start - 4, fps)}}>
        <span style={{color: t.colors.accent2}}>$ </span>echo $RESULT
      </div>
      <div style={{...springPop(frame, start, fps), fontFamily: t.fonts.mono, fontWeight: 700, fontSize: (vertical ? 200 : 240) * scale, color: t.colors.accent, fontVariantNumeric: 'tabular-nums', lineHeight: 0.95, ...glow(scale, '#33ff00'), display: 'flex', alignItems: 'center'}}>
        {d.prefix ?? ''}
        {value}
        {d.suffix ?? ''}
        <TermCursor size={(vertical ? 130 : 150) * scale} />
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.mono, fontSize: 38 * scale, color: t.colors.muted, textAlign: 'center', maxWidth: '80%'}}>
        {'# ' + d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 22 * scale, marginTop: 12 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps), filter: `drop-shadow(0 0 ${8 * scale}px ${hexA(t.colors.accent, 0.6)})`}}>
              <AssetIcon asset={lg} size={(vertical ? 78 : 70) * scale} />
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// CODE_WINDOW — a real phosphor shell: line-numbered code types in green with a
// blinking block cursor, then output prints as [OK] lines under a $ run command.
export const TermCodeWindow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.code;
  if (!d) return <AbsoluteFill />;
  const lines = d.lines;
  const cps = d.typeSpeed ?? 42;
  const start = Math.min(wordToFrame(d.atWord), 38);
  const elapsed = Math.max(0, frame - start);
  const charsShown = Math.floor((elapsed / fps) * cps);
  let remaining = charsShown;
  let currentLine = 0;
  let currentChars = 0;
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i].text.length;
    if (remaining >= L + 1) {
      remaining -= L + 1;
      currentLine = i + 1;
    } else {
      currentChars = Math.max(0, remaining);
      break;
    }
  }
  const totalChars = lines.reduce((s, l) => s + l.text.length + 1, 0);
  const typingDone = charsShown >= totalChars;
  const outStart = start + (totalChars / cps) * fps + 14;
  const showOutput = Boolean(d.output?.length) && frame >= outStart;
  const win = (vertical ? 960 : 1180) * scale;
  const fsz = 30 * scale;
  const lh = fsz * 1.5;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <TermWindow title={`~/${d.filename ?? 'shell'}${d.language ? ' \u00b7 ' + d.language.toUpperCase() : ''}`} style={{width: win}}>
        {lines.map((line, i) => {
          if (i > currentLine) return <div key={i} style={{height: lh}} />;
          const isCurrent = i === currentLine && !typingDone;
          const text = isCurrent ? line.text.slice(0, currentChars) : line.text;
          const col = line.color ? sem(line.color) : t.colors.accent;
          return (
            <div key={i} style={{display: 'flex', gap: 14 * scale, height: lh, alignItems: 'center', fontFamily: t.fonts.mono, fontSize: fsz}}>
              <span style={{color: hexA(t.colors.accent, 0.45), width: 22 * scale}}>{i + 1}</span>
              <span style={{color: col, whiteSpace: 'pre', ...glow(scale, col)}}>{text}</span>
              {isCurrent ? <TermCursor size={fsz} /> : null}
            </div>
          );
        })}
        {showOutput ? (
          <div style={{marginTop: 12 * scale, borderTop: `${1 * scale}px dashed ${hexA(t.colors.accent, 0.35)}`, paddingTop: 14 * scale}}>
            {d.runLabel ? (
              <div style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: hexA(t.colors.accent, 0.7)}}>
                <span style={{color: t.colors.accent2}}>$ </span>
                {d.runLabel}
              </div>
            ) : null}
            {d.output!.map((o, i) => (
              <div key={i} style={{fontFamily: t.fonts.mono, fontSize: 24 * scale, color: o.color ? sem(o.color) : t.colors.accent2, lineHeight: 1.5, ...glow(scale, o.color ? sem(o.color) : t.colors.accent2)}}>
                <span style={{color: sem('green')}}>[OK]</span> {o.text}
              </div>
            ))}
          </div>
        ) : null}
      </TermWindow>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
