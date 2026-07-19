import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig} from 'remotion';
import {Scene, K8sClusterData} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA, Kicker} from '../ui';
import {BoundaryGroup} from '../kit';
import {counterValue} from '../motion/numbers';
import {easeInOutCubic} from '../motion/util';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// K8S_CLUSTER — a control-plane bar over worker nodes (BoundaryGroups) holding
// pods. Four modes, each ONE story per scene: schedule / scale / selfheal /
// rollout. Vertical: nodes stack, control-plane stays on top. zone-surface.
export const K8sCluster: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d: K8sClusterData | undefined = scene.data.k8s;
  if (!d) return <AbsoluteFill />;

  const mode = d.mode ?? 'schedule';
  const nodes = (d.nodes ?? []).slice(0, 4);
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38) + 10;
  const cell = (vertical ? 62 : 66) * scale;
  const gap = 12 * scale;

  const podColor = (status?: string, version?: string) => {
    if (mode === 'rollout' && version) return version === 'v2' ? sem('green') : sem('blue');
    if (status === 'fail') return sem('red');
    if (status === 'pending') return sem('orange');
    return sem('green');
  };

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 60 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 110 : 50) * scale : 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 * scale, width: (vertical ? 960 : 1560) * scale}}>
        {/* control plane bar */}
        <div style={{width: '100%', display: 'flex', alignItems: 'center', gap: 16 * scale, padding: `${16 * scale}px ${26 * scale}px`, borderRadius: 14 * scale * t.style.cornerRadius, border: `${2 * scale}px solid ${hexA(sem('purple'), 0.5)}`, background: hexA(sem('purple'), 0.1)}}>
          <Kicker text="Control plane" color="purple" />
          <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 24 * scale, color: t.colors.text}}>{d.controlPlane ?? 'kube-apiserver'}</span>
          {mode === 'scale' && d.toReplicas != null ? (
            <span style={{marginLeft: 'auto', fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 24 * scale, color: sem('green'), fontVariantNumeric: 'tabular-nums'}}>replicas: {counterValue(frame, base, d.toReplicas, 40)}{d.fromReplicas != null ? '' : ''}</span>
          ) : (
            <span style={{marginLeft: 'auto', fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.muted, letterSpacing: '0.06em', textTransform: 'uppercase'}}>{mode}</span>
          )}
        </div>
        {/* worker nodes */}
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 24 * scale, width: '100%', justifyContent: 'center'}}>
          {nodes.map((node, ni) => {
            const nst = wordToFrame(node.atWord ?? d.atWord ?? 1) + 6;
            const nshow = interpolate(frame, [nst, nst + 12], [0, 1], clamp);
            const pods = node.pods.slice(0, 6);
            const cols = Math.min(pods.length, 3) || 1;
            return (
              <div key={ni} style={{flex: vertical ? undefined : 1, opacity: nshow, transform: `translateY(${interpolate(nshow, [0, 1], [16 * scale, 0])}px)`}}>
                <BoundaryGroup label={node.label} color="blue">
                  <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap, justifyContent: 'center'}}>
                    {pods.map((pod, pi) => {
                      const podStart = base + (mode === 'scale' ? pi * 7 : 0);
                      let opacity = 1;
                      let ty = 0;
                      let scaleP = 1;
                      let c = podColor(pod.status, pod.version);
                      let versionLabel = pod.version;
                      // mode-specific motion
                      if (mode === 'scale') {
                        const e = spring({frame: frame - podStart, fps, config: {damping: 14, mass: 0.7}});
                        opacity = interpolate(e, [0, 1], [0, 1]);
                        scaleP = interpolate(e, [0, 1], [0.4, 1]);
                      } else if (mode === 'schedule' && pod.status === 'pending') {
                        const p = easeInOutCubic(interpolate(frame, [base, base + 24], [0, 1], clamp));
                        ty = interpolate(p, [0, 1], [-140 * scale, 0]);
                        opacity = interpolate(frame, [base, base + 6], [0, 1], clamp);
                        c = p >= 1 ? sem('green') : sem('orange');
                      } else if (mode === 'selfheal' && pod.status === 'fail') {
                        // red pulse → fade → green replacement scales in same slot
                        const dieFade = interpolate(frame, [base + 34, base + 46], [1, 0], clamp);
                        const heal = spring({frame: frame - (base + 44), fps, config: {damping: 14}});
                        if (frame < base + 46) {
                          const pulse = 0.6 + 0.4 * Math.sin((frame - base) * 0.3);
                          c = sem('red');
                          opacity = dieFade;
                          scaleP = frame > base + 30 ? 1 : 1;
                          return (
                            <React.Fragment key={pi}>
                              <div style={{width: cell, height: cell, borderRadius: 12 * scale * t.style.cornerRadius, background: hexA(sem('red'), 0.16 * pulse + 0.08), border: `${2 * scale}px solid ${hexA(sem('red'), pulse)}`, opacity: dieFade, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.style.glow > 0 ? `0 0 ${16 * scale * pulse}px ${hexA(sem('red'), 0.5 * pulse)}` : undefined}}>
                                <span style={{color: sem('red'), fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 22 * scale}}>{'\u2717'}</span>
                              </div>
                            </React.Fragment>
                          );
                        }
                        c = sem('green');
                        opacity = interpolate(heal, [0, 1], [0, 1]);
                        scaleP = interpolate(heal, [0, 1], [0.4, 1]);
                        versionLabel = undefined;
                      } else if (mode === 'rollout' && pod.version) {
                        const flip = base + pi * 9;
                        const done = frame >= flip;
                        c = done ? sem('green') : sem('blue');
                        versionLabel = done ? 'v2' : 'v1';
                        const t2 = interpolate(frame, [flip, flip + 8], [0, 1], clamp);
                        scaleP = 1 - 0.12 * Math.sin(Math.PI * Math.max(0, Math.min(1, t2)));
                      }
                      return (
                        <div key={pi} style={{width: cell, height: cell, opacity, transform: `translateY(${ty}px) scale(${scaleP})`, borderRadius: 12 * scale * t.style.cornerRadius, background: hexA(c, 0.16), border: `${2 * scale}px solid ${hexA(c, 0.7)}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 * scale, boxShadow: t.style.glow > 0 ? `0 0 ${10 * scale}px ${hexA(c, 0.3)}` : undefined}}>
                          <div style={{width: 12 * scale, height: 12 * scale, borderRadius: 999, background: c}} />
                          {versionLabel ? <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 14 * scale, color: c}}>{versionLabel}</span> : null}
                        </div>
                      );
                    })}
                  </div>
                </BoundaryGroup>
              </div>
            );
          })}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
