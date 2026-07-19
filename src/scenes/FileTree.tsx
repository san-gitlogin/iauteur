import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// FILE_TREE — a folder/file hierarchy that expands top-down. A flat node list
// with `depth` drives indentation; stacked indent hairlines form the tree guides
// (VS Code style). Folders get a chevron, files a document glyph; the highlighted
// node glows. Left-aligned card, same on both aspects (wider rows on shorts).
export const FileTree: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.fileTree;
  if (!d) return <AbsoluteFill />;

  const nodes = (d.nodes ?? []).slice(0, 12);
  const n = nodes.length;
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const accent = sem(d.color ?? 'blue');
  const highlight = d.highlight ?? -1;

  const cardW = (vertical ? 940 : 1080) * scale;
  const indent = (vertical ? 46 : 42) * scale;
  // Row height is capped by the available height so the CENTERED card clears the
  // headline zone even at the 12-node max (reuse of the K-5 TEST_MATRIX pattern:
  // a centered block of height H clears a headline of zone hz iff H ≤ frameH − 2·hz).
  const frameH = vertical ? 1920 : 1080;
  const hz = vertical ? 340 : 210;
  const padV = 36 * scale;
  const rowH = Math.min((vertical ? 92 : 74) * scale, ((frameH - 2 * hz) - padV) / n);
  const per = 7;
  const revealed = interpolate(frame, [start, start + per * n], [0, n], clamp);
  const rad = 14 * scale * t.style.cornerRadius;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div
        style={{
          width: cardW,
          marginTop: d.headline ? (vertical ? 150 : 74) * scale : 0,
          background: t.colors.panel,
          border: `${2 * scale}px solid ${t.colors.panelBorder}`,
          borderRadius: rad,
          padding: `${18 * scale}px ${20 * scale}px`,
          boxSizing: 'border-box',
        }}
      >
        {nodes.map((node, i) => {
          const shown = i < revealed;
          const rowE = interpolate(revealed, [i, i + 1], [0, 1], clamp);
          const isFolder = node.kind !== 'file';
          const active = i === highlight;
          const c = node.color ? sem(node.color) : accent;
          return (
            <div
              key={i}
              style={{
                display: shown ? 'flex' : 'none',
                alignItems: 'center',
                height: rowH,
                borderRadius: 10 * scale,
                background: active ? hexA(c, 0.14) : 'transparent',
                border: `${1.5 * scale}px solid ${active ? hexA(c, 0.6) : 'transparent'}`,
                paddingRight: 16 * scale,
                opacity: rowE,
                transform: `translateX(${interpolate(rowE, [0, 1], [-14 * scale, 0])}px)`,
              }}
            >
              {/* indent guides */}
              {Array.from({length: node.depth}).map((_, k) => (
                <div key={k} style={{width: indent, height: '100%', flexShrink: 0, position: 'relative'}}>
                  <div style={{position: 'absolute', left: indent / 2, top: 0, bottom: 0, width: 2 * scale, background: hexA(t.colors.panelBorder, 0.9)}} />
                  {k === node.depth - 1 ? (
                    <div style={{position: 'absolute', left: indent / 2, top: '50%', width: indent / 2 - 6 * scale, height: 2 * scale, background: hexA(t.colors.panelBorder, 0.9)}} />
                  ) : null}
                </div>
              ))}
              {/* chevron for folders */}
              {isFolder ? (
                <span style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: t.colors.muted, width: 22 * scale, textAlign: 'center', flexShrink: 0}}>{'\u25BE'}</span>
              ) : (
                <span style={{width: 22 * scale, flexShrink: 0}} />
              )}
              <AssetIcon asset={isFolder ? 'lucide:folder' : 'lucide:file'} size={(vertical ? 34 : 30) * scale} bare tint={isFolder ? c : t.colors.muted} on={t.colors.panel} />
              <span
                style={{
                  marginLeft: 14 * scale,
                  fontFamily: isFolder ? t.fonts.body : t.fonts.mono,
                  fontWeight: isFolder ? 700 : 500,
                  fontSize: (vertical ? 32 : 29) * scale,
                  color: active ? t.colors.text : isFolder ? t.colors.text : t.colors.muted,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {node.name}
              </span>
            </div>
          );
        })}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
