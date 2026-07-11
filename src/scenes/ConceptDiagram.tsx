import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {fadeUp} from '../anim';
import {entranceStyle} from '../motion';
import {AssetIcon} from '../AssetIcon';
import {Connector} from '../Connector';

// Nodes appear in narration order; designed connectors draw between them;
// the newest node glows briefly (the "you are here" of the explanation).

export const ConceptDiagram: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = useTheme();
  const vertical = height > width;
  const scale = vertical ? width / 1080 : width / 1920;
  const d = scene.data;
  const nodes = d.nodes ?? [];
  const edges = d.edges ?? [];

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 60 * scale}}>
      {d.heading ? (
        <div
          style={{
            ...fadeUp(frame, 0, fps),
            position: 'absolute',
            top: (vertical ? 140 : 90) * scale,
            fontFamily: t.fonts.display,
            fontWeight: 800,
            fontSize: 52 * scale,
            color: t.colors.text,
            textAlign: 'center',
            width: '90%',
            letterSpacing: t.style.displayTracking,
          }}
        >
          {d.heading}
        </div>
      ) : null}
      <div
        style={{
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          alignItems: 'center',
        }}
      >
        {nodes.map((node, i) => {
          const nodeStart = wordToFrame(node.atWord);
          const edge = edges.find((e) => e.to === node.id);
          const edgeStart = edge ? wordToFrame(edge.atWord) : Math.max(0, nodeStart - 6);
          // Fresh-node emphasis: glow rises then settles
          const activeGlow = interpolate(
            frame,
            [nodeStart, nodeStart + 10, nodeStart + 45, nodeStart + 60],
            [0, 1, 1, 0],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
          );
          return (
            <React.Fragment key={node.id}>
              {i > 0 ? (
                <Connector
                  startFrame={edgeStart}
                  vertical={vertical}
                  length={(vertical ? 90 : 130) * scale}
                  thickness={4 * scale}
                />
              ) : null}
              <div
                style={{
                  ...entranceStyle(d.anim ?? 'pop', frame, nodeStart, fps),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 18 * scale,
                  background: t.colors.panel,
                  border: `2px solid ${t.colors.panelBorder}`,
                  borderRadius: 24 * scale * t.style.cornerRadius,
                  padding: `${34 * scale}px ${40 * scale}px`,
                  minWidth: (vertical ? 300 : 260) * scale,
                  boxShadow:
                    t.style.glow > 0
                      ? `0 0 ${34 * activeGlow * t.style.glow}px ${t.colors.glowSoft}`
                      : `0 ${6 * activeGlow}px ${20 * activeGlow}px rgba(0,0,0,0.12)`,
                }}
              >
                <AssetIcon asset={node.asset} size={86 * scale} bare on={t.colors.panel} />
                <div
                  style={{
                    fontFamily: t.fonts.body,
                    fontWeight: 700,
                    fontSize: 34 * scale,
                    color: t.colors.text,
                    textAlign: 'center',
                  }}
                >
                  {node.label}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
