import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {ChromeFrame, ContentSlot, StatusBadge, middleTruncate} from '../kit';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const hash = (i: number, s: number) => {
  const x = Math.sin(i * 51.3 + s * 12.7) * 43758.5453;
  return x - Math.floor(x);
};
const ACTION_ICON: Record<string, string> = {click: 'lucide:mouse-pointer-click', type: 'lucide:keyboard', hover: 'lucide:mouse-pointer-2', assert: 'lucide:check-check', goto: 'lucide:navigation'};

// AUTOMATION_RUN — a scripted browser test. Composition: ChromeFrame(browser) +
// ContentSlot + a ghost cursor (eased curves) + a step rail. Page settles first,
// cursor moves second, the assertion stamps last. A FAIL freezes the cursor and
// glows the step row red — the run does NOT continue past a failed step.
export const AutomationRun: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.auto;
  if (!d) return <AbsoluteFill />;

  const steps = (d.steps ?? []).slice(0, 5);
  const n = steps.length;
  const start = wordToFrame(d.atWord ?? 1) + 14; // page settles first
  const accent = sem(d.color ?? 'purple');
  const failIdx = steps.findIndex((s) => s.status === 'fail');
  const lastStep = failIdx >= 0 ? failIdx : n - 1;
  const per = 34;

  const stepProg = (frame - start) / per;
  const active = Math.max(0, Math.min(lastStep, Math.floor(stepProg)));
  const tWithin = easeInOut(Math.max(0, Math.min(1, stepProg - active)));
  const frozen = failIdx >= 0 && active === failIdx && tWithin > 0.5;

  const pageW = (vertical ? 980 : 820) * scale;
  const pageH = (vertical ? 460 : 470) * scale;
  const railW = (vertical ? 980 : 440) * scale;

  const target = (i: number): [number, number] => [
    (0.18 + 0.64 * hash(i + 1, 1)) * pageW,
    (0.24 + 0.52 * hash(i + 1, 2)) * pageH,
  ];
  const from = active > 0 ? target(active - 1) : [pageW * 0.5, pageH * 0.5];
  const to = target(active);
  const cx = from[0] + (to[0] - from[0]) * tWithin;
  const cy = from[1] + (to[1] - from[1]) * tWithin;
  const act = steps[active]?.action;
  const clicking = act === 'click' && tWithin > 0.6 && tWithin < 0.98 && !frozen;
  const ripple = clicking ? interpolate(tWithin, [0.6, 0.98], [0, 1], clamp) : 0;
  const asserting = act === 'assert' && tWithin > 0.7;
  const assertPass = asserting && steps[active].status !== 'fail';

  const Page = () => (
    <ChromeFrame variant="browser" url={d.url ?? 'https://app.example.com'} accent={d.color ?? 'purple'} width={pageW}>
      <div style={{position: 'relative', width: '100%', height: pageH}}>
        <ContentSlot content={d.content} startFrame={wordToFrame(d.atWord ?? 1)} />
        {/* click ripple */}
        {ripple > 0 ? <div style={{position: 'absolute', left: cx, top: cy, width: 60 * scale * ripple, height: 60 * scale * ripple, marginLeft: -30 * scale * ripple, marginTop: -30 * scale * ripple, borderRadius: 999, border: `${3 * scale}px solid ${accent}`, opacity: 1 - ripple}} /> : null}
        {/* assertion stamp */}
        {asserting ? (
          <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) scale(${interpolate(tWithin, [0.7, 0.85], [0.6, 1], clamp)})`, transformOrigin: 'center'}}>
            <div style={{transform: 'scale(1.6)'}}><StatusBadge status={assertPass ? 'pass' : 'fail'} label={assertPass ? 'assert ok' : 'assert failed'} /></div>
          </div>
        ) : null}
        {/* ghost cursor */}
        {frame >= start ? (
          <div style={{position: 'absolute', left: cx, top: cy, transform: 'translate(-15%, -10%)', filter: `drop-shadow(0 ${3 * scale}px ${5 * scale}px ${hexA('#000', 0.5)})`}}>
            <AssetIcon asset="lucide:mouse-pointer-2" size={40 * scale} bare tint={t.colors.text} on={t.colors.panel} />
          </div>
        ) : null}
      </div>
    </ChromeFrame>
  );

  const Rail = () => (
    <div style={{width: railW, display: 'flex', flexDirection: 'column', gap: 10 * scale}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale, marginBottom: 4 * scale}}>
        <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 20 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.colors.muted}}>{d.runner ?? 'playwright'}</span>
        <span style={{fontFamily: t.fonts.mono, fontSize: 18 * scale, color: t.colors.muted}}>{'\u00B7'} test run</span>
      </div>
      {steps.map((s, i) => {
        const st = i < active ? s.status ?? 'pass' : i === active ? (s.status === 'fail' ? 'fail' : 'running') : 'pending';
        const isFail = st === 'fail';
        const on = i <= active;
        const c = isFail ? sem('red') : st === 'pending' ? t.colors.panelBorder : accent;
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 4 * scale, borderRadius: 12 * scale * t.style.cornerRadius, background: isFail ? hexA(sem('red'), 0.12) : on ? t.colors.panel : 'transparent', border: `${2 * scale}px solid ${isFail ? sem('red') : on ? t.colors.panelBorder : hexA(t.colors.panelBorder, 0.5)}`, padding: `${10 * scale}px ${14 * scale}px`, opacity: on ? 1 : 0.55, boxShadow: isFail && t.style.glow > 0 ? `0 0 ${22 * scale * t.style.glow}px ${hexA(sem('red'), 0.4)}` : undefined}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
              <AssetIcon asset={ACTION_ICON[s.action] ?? 'lucide:circle'} size={26 * scale} bare tint={isFail ? sem('red') : t.colors.muted} on={t.colors.panel} />
              <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, color: t.colors.text}}>{s.action}</span>
              <span style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1}}>{middleTruncate(s.target, 22)}</span>
              <div style={{flexShrink: 0}}><StatusBadge status={st} /></div>
            </div>
            {isFail && s.reason ? <span style={{fontFamily: t.fonts.mono, fontSize: 18 * scale, color: sem('red'), lineHeight: 1.2}}>{s.reason}</span> : null}
          </div>
        );
      })}
    </div>
  );

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'purple'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 140 : 60) * scale : 0, display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 24 * scale, alignItems: vertical ? 'center' : 'flex-start', justifyContent: 'center'}}>
        <Page />
        <Rail />
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
