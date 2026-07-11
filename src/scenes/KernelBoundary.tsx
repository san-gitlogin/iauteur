import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {BoundaryGroup} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// KERNEL_BOUNDARY — user space above, kernel below. The boundary line BETWEEN
// them is the emphasized element (double hairline). A labelled syscall arrow
// crosses DOWN, work chips appear inside the kernel band, a result arrow returns
// UP; steps sequenced at atWords. Built on BoundaryGroup. zone-surface family.
export const KernelBoundary: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.kernel;
  if (!d) return <AbsoluteFill />;

  const CW = (vertical ? 980 : 1300) * scale;
  const bandH = (vertical ? 260 : 240) * scale;
  const steps = (d.steps ?? []).slice(0, 4);
  const userChips = (d.userChips ?? []).slice(0, 3);
  const base = wordToFrame(d.atWord ?? 1) + 8;
  const syscallStart = base;
  const stepsStart = base + 20;
  const resultStart = stepsStart + steps.length * 12 + 14;
  const blue = sem('blue');
  const purple = sem('purple');
  const arrowH = bandH * 0.9;

  const chip = (label: string, c: string) => (
    <div style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, color: t.colors.text, background: hexA(c, 0.14), border: `${2 * scale}px solid ${hexA(c, 0.55)}`, borderRadius: 10 * scale * t.style.cornerRadius, padding: `${10 * scale}px ${18 * scale}px`, whiteSpace: 'nowrap'}}>{label}</div>
  );

  const Arrow = ({down, label, x, start, color}: {down: boolean; label: string; x: number; start: number; color: string}) => {
    const draw = interpolate(frame, [start, start + 16], [0, 1], clamp);
    if (draw <= 0) return null;
    const len = arrowH * draw;
    return (
      <div style={{position: 'absolute', left: x, top: down ? bandH * 0.55 : undefined, bottom: down ? undefined : bandH * 0.55, height: arrowH, width: 3 * scale, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{position: 'absolute', top: down ? 0 : undefined, bottom: down ? undefined : 0, width: 3 * scale, height: len, background: color, boxShadow: t.style.glow > 0 ? `0 0 ${8 * scale}px ${hexA(color, 0.5)}` : undefined}} />
        {draw >= 0.9 ? (
          <div style={{position: 'absolute', ...(down ? {top: len - 8 * scale} : {bottom: len - 8 * scale}), width: 0, height: 0, borderLeft: `${9 * scale}px solid transparent`, borderRight: `${9 * scale}px solid transparent`, ...(down ? {borderTop: `${13 * scale}px solid ${color}`} : {borderBottom: `${13 * scale}px solid ${color}`})}} />
        ) : null}
        <div style={{position: 'absolute', top: '42%', left: 14 * scale, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 19 * scale, color, whiteSpace: 'nowrap', background: t.colors.bg, padding: `${2 * scale}px ${8 * scale}px`, borderRadius: 6 * scale * t.style.cornerRadius}}>{label}</div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'purple'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 120 : 56) * scale : 0, position: 'relative', width: CW, display: 'flex', flexDirection: 'column', gap: 0}}>
        {/* user space band */}
        <div style={{height: bandH}}>
          <BoundaryGroup label={d.userLabel ?? 'User space'} color="blue" dashed style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 * scale}}>
            {userChips.length ? userChips.map((cc, i) => <span key={i}>{chip(cc, blue)}</span>) : chip('your program', blue)}
          </BoundaryGroup>
        </div>
        {/* emphasized boundary — double hairline */}
        <div style={{position: 'relative', height: 26 * scale, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 * scale, margin: `${10 * scale}px 0`}}>
          <div style={{height: 2 * scale, background: hexA(t.colors.text, 0.7)}} />
          <div style={{height: 2 * scale, background: hexA(t.colors.text, 0.7)}} />
          <span style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 16 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.colors.muted, background: t.colors.bg, padding: `${2 * scale}px ${14 * scale}px`}}>syscall boundary</span>
        </div>
        {/* kernel band */}
        <div style={{height: bandH}}>
          <BoundaryGroup label={d.kernelLabel ?? 'Kernel'} color="purple" dashed style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 * scale}}>
            {steps.map((s, i) => {
              const sst = stepsStart + i * 12;
              const show = interpolate(frame, [sst, sst + 8], [0, 1], clamp);
              return <div key={i} style={{opacity: show, transform: `scale(${interpolate(show, [0, 1], [0.85, 1])})`}}>{chip(s.label, purple)}</div>;
            })}
          </BoundaryGroup>
        </div>
        {/* crossing arrows */}
        <Arrow down label={d.syscall ?? 'syscall'} x={CW * 0.28} start={syscallStart} color={blue} />
        <Arrow down={false} label={d.result ?? 'result'} x={CW * 0.72} start={resultStart} color={sem('green')} />
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
