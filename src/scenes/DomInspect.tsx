import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {middleTruncate} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// DOM_INSPECT — a DOM tree beside the rendered element; picking a node highlights
// BOTH the tree row and the element outline in the SAME frame, same colour. The
// inspection highlight is BLUE (info) — never red (devs read red as error). Tree
// uses FILE_TREE indent guides; the selector chip middle-truncates.
export const DomInspect: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.dom;
  if (!d) return <AbsoluteFill />;

  const nodes = (d.nodes ?? []).slice(0, 8);
  const n = nodes.length;
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const blue = sem('blue');
  const indent = 34 * scale;
  const rowH = (vertical ? 68 : 60) * scale;
  const hi = d.highlight ?? -1;
  const revealed = interpolate(frame, [start, start + n * 5], [0, n], clamp);
  const hiOn = interpolate(frame, [start + n * 5, start + n * 5 + 10], [0, 1], clamp);

  const treeW = (vertical ? 980 : 720) * scale;
  const elW = (vertical ? 980 : 560) * scale;

  const Tree = () => (
    <div style={{width: treeW, background: t.colors.panel, border: `${2 * scale}px solid ${t.colors.panelBorder}`, borderRadius: 16 * scale * t.style.cornerRadius, padding: `${16 * scale}px ${18 * scale}px`, boxSizing: 'border-box'}}>
      {nodes.map((nd, i) => {
        if (i >= revealed) return null;
        const active = i === hi;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', height: rowH, borderRadius: 10 * scale, background: active ? hexA(blue, 0.14 * hiOn) : 'transparent', border: `${1.5 * scale}px solid ${active ? hexA(blue, 0.7 * hiOn) : 'transparent'}`}}>
            {Array.from({length: nd.depth}).map((_, k) => (
              <div key={k} style={{width: indent, height: '100%', flexShrink: 0, position: 'relative'}}>
                <div style={{position: 'absolute', left: indent / 2, top: 0, bottom: 0, width: 2 * scale, background: hexA(t.colors.panelBorder, 0.9)}} />
              </div>
            ))}
            <span style={{fontFamily: t.fonts.mono, fontSize: (vertical ? 28 : 26) * scale, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingLeft: 8 * scale}}>
              <span style={{color: active ? blue : sem('purple')}}>{'<' + nd.tag}</span>
              {nd.attr ? <span style={{color: t.colors.muted}}>{' ' + nd.attr}</span> : null}
              <span style={{color: active ? blue : sem('purple')}}>{'>'}</span>
            </span>
          </div>
        );
      })}
    </div>
  );

  const hiNode = hi >= 0 && hi < n ? nodes[hi] : null;
  const Element = () => (
    <div style={{width: elW, background: hexA(t.colors.panelBorder, 0.12), border: `${2 * scale}px solid ${t.colors.panelBorder}`, borderRadius: 16 * scale * t.style.cornerRadius, padding: 28 * scale, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 16 * scale, minHeight: (vertical ? 360 : 340) * scale, justifyContent: 'center'}}>
      {/* faint sibling */}
      <div style={{height: 46 * scale, borderRadius: 10 * scale * t.style.cornerRadius, background: hexA(t.colors.panelBorder, 0.4)}} />
      {/* the inspected element */}
      <div style={{position: 'relative', minHeight: 88 * scale, borderRadius: 12 * scale * t.style.cornerRadius, background: hexA(blue, 0.1 * hiOn), border: `${2.5 * scale}px dashed ${hexA(blue, hiOn)}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 28 * scale, color: t.colors.text}}>{hiNode ? `<${hiNode.tag}>` : 'element'}</span>
        <span style={{position: 'absolute', top: -14 * scale, left: 14 * scale, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 16 * scale, color: t.colors.onAccent, background: blue, borderRadius: 999, padding: `${2 * scale}px ${10 * scale}px`, opacity: hiOn}}>{hiNode?.tag ?? 'node'}</span>
        <span style={{position: 'absolute', bottom: -14 * scale, right: 14 * scale, fontFamily: t.fonts.mono, fontSize: 16 * scale, color: t.colors.muted, background: t.colors.bg, border: `${1.5 * scale}px solid ${t.colors.panelBorder}`, borderRadius: 6 * scale, padding: `${2 * scale}px ${8 * scale}px`, opacity: hiOn}}>auto × 44</span>
      </div>
      <div style={{height: 46 * scale, borderRadius: 10 * scale * t.style.cornerRadius, background: hexA(t.colors.panelBorder, 0.4)}} />
      {/* selector chip */}
      {d.selector ? <div style={{marginTop: 6 * scale, alignSelf: 'flex-start', fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 20 * scale, color: blue, background: hexA(blue, 0.12), border: `${1.5 * scale}px solid ${hexA(blue, 0.5)}`, borderRadius: 999, padding: `${5 * scale}px ${14 * scale}px`, maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden'}}>{middleTruncate(d.selector, 34)}</div> : null}
    </div>
  );

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0, display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 22 * scale, alignItems: vertical ? 'center' : 'flex-start', justifyContent: 'center'}}>
        <Tree />
        <Element />
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
