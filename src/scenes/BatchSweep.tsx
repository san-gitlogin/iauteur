import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { Scene, SemColor } from '../types';
import { useTheme, wordToFrame } from '../themes';
import { SourceFooter, useScale, useSem, hexA, Headline } from '../ui';
import { AssetIcon } from '../AssetIcon';

export interface BatchLane {
  label?: string;
  stat?: string;
  color?: SemColor;
}

export interface BatchSweepData {
  headline?: string;
  rows?: number;
  slow?: BatchLane;
  fast?: BatchLane;
  atWord?: number;
  source?: string;
}

// BATCH_SWEEP — Contrasts single-record modal context-switching against
// an all-at-once multi-select sweep over the same set of data records.
//
// Visual execution:
// 1. Two side-by-side (or top-to-bottom on vertical) execution lanes.
// 2. Slow lane: A simulated single-record workflow where a modal pops open/close
//    repeatedly over individual rows, ticking an agonizing timer/counter up.
// 3. Fast lane: A clean multi-select sweep that selects all records via a glowing
//    checkbox bar and executes instantly in one single action.
// 4. Token-driven + ×scale; obeys both-aspect rule, base-frame clamp ≤ 38,
//    opaque card panels, and tabular numbers for stable counter layout.

export const BatchSweep: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const { scale, vertical } = useScale();

  const raw = (scene.data as Record<string, unknown> | undefined)?.batchSweep;
  const d = raw as BatchSweepData | undefined;

  if (!d) return <AbsoluteFill />;

  const slow = d.slow ?? { label: 'Single-record modal', stat: '3h 20m', color: 'red' };
  const fast = d.fast ?? { label: 'Multi-select', stat: '12s', color: 'green' };

  const slowColor = sem(slow.color ?? 'red');
  const fastColor = sem(fast.color ?? 'green');

  // Base layout clamps to frame ≤ 38 so the base screen is active immediately
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const f = Math.max(0, frame - start);

  const rowCount = Math.min(9, Math.max(5, d.rows ?? 7));

  // Entrances
  const baseOpacity = interpolate(f, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const slideIn = interpolate(f, [0, 16], [24 * scale, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Slow lane animation loop (modal repeatedly pops up over rows)
  // Loop cycles every 24 frames
  const loopCycle = 24;
  const slowIndex = Math.min(rowCount - 1, Math.floor(f / loopCycle));
  const cycleFrame = f % loopCycle;

  // Modal scale inside slow cycle: pop up, hold, pop out
  const modalScale = interpolate(cycleFrame, [2, 8, 16, 22], [0.8, 1, 1, 0.85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const modalOpacity = interpolate(cycleFrame, [2, 6, 18, 22], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fast lane animation: continuous rapid checkbox sweep across all rows, then complete banner
  const sweepProgress = interpolate(f, [8, 32], [0, rowCount], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const isFastComplete = f >= 32;

  // Layout geometry calculations
  const laneGap = (vertical ? 24 : 36) * scale;
  const containerW = (vertical ? 920 : 1600) * scale;
  const laneW = vertical ? containerW : (containerW - laneGap) / 2;
  const cardRadius = 16 * scale * t.style.cornerRadius;

  const renderSlowLane = () => {
    return (
      <div
        style={{
          width: laneW,
          background: t.colors.panel,
          border: `${2 * scale}px solid ${hexA(slowColor, 0.4)}`,
          borderRadius: cardRadius,
          padding: `${24 * scale}px`,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 16 * scale,
          position: 'relative',
          boxShadow:
            t.style.glow > 0 ? `0 0 ${20 * scale}px ${hexA(slowColor, 0.15 * t.style.glow)}` : 'none',
        }}
      >
        {/* Lane Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 * scale }}>
            <AssetIcon asset="lucide:square-mouse-pointer" size={24 * scale} tint={slowColor} on={t.colors.panel} bare />
            <span
              style={{
                fontFamily: t.fonts.display,
                fontWeight: t.style.displayWeight,
                fontSize: 22 * scale,
                color: t.colors.text,
                letterSpacing: t.style.displayTracking,
              }}
            >
              {slow.label}
            </span>
          </div>
          <span
            style={{
              fontFamily: t.fonts.mono,
              fontSize: 22 * scale,
              fontWeight: 700,
              color: slowColor,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {slow.stat}
          </span>
        </div>

        {/* Mock Table Records */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8 * scale,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {Array.from({ length: rowCount }).map((_, idx) => {
            const isTarget = idx === slowIndex;
            return (
              <div
                key={idx}
                style={{
                  height: 36 * scale,
                  borderRadius: 6 * scale * t.style.cornerRadius,
                  background: isTarget ? hexA(slowColor, 0.15) : hexA(t.colors.text, 0.04),
                  border: `${1 * scale}px solid ${isTarget ? hexA(slowColor, 0.5) : hexA(t.colors.panelBorder, 0.5)}`,
                  display: 'flex',
                  alignItems: 'center',
                  padding: `0 ${12 * scale}px`,
                  justifyContent: 'space-between',
                  gap: 12 * scale,
                }}
              >
                <div
                  style={{
                    width: 14 * scale,
                    height: 14 * scale,
                    borderRadius: 3 * scale,
                    border: `${1.5 * scale}px solid ${isTarget ? slowColor : t.colors.muted}`,
                  }}
                />
                <div
                  style={{
                    width: (80 + (idx % 3) * 30) * scale,
                    height: 8 * scale,
                    borderRadius: 4 * scale,
                    background: isTarget ? slowColor : hexA(t.colors.text, 0.25),
                  }}
                />
                <div style={{ flex: 1 }} />
                <div
                  style={{
                    width: 44 * scale,
                    height: 8 * scale,
                    borderRadius: 4 * scale,
                    background: hexA(t.colors.text, 0.15),
                  }}
                />
              </div>
            );
          })}

          {/* Active Overlay Modal (Simulated Context Switch) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: hexA(t.colors.bg, 0.65),
              backdropFilter: t.style.glow > 0 ? 'blur(4px)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: modalOpacity,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: 240 * scale,
                background: t.colors.softSurface,
                border: `${2 * scale}px solid ${slowColor}`,
                borderRadius: 12 * scale * t.style.cornerRadius,
                padding: `${16 * scale}px`,
                transform: `scale(${modalScale})`,
                boxShadow:
                  t.style.glow > 0
                    ? `0 12px 32px ${hexA(t.colors.bg, 0.8)}, 0 0 20px ${hexA(slowColor, 0.3 * t.style.glow)}`
                    : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10 * scale,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6 * scale,
                  color: slowColor,
                  fontFamily: t.fonts.mono,
                  fontSize: 14 * scale,
                  fontWeight: 700,
                }}
              >
                <AssetIcon asset="lucide:app-window" size={16 * scale} tint={slowColor} on={t.colors.softSurface} bare />
                <span>Modal #{slowIndex + 1}</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 10 * scale,
                  borderRadius: 4 * scale,
                  background: hexA(t.colors.text, 0.1),
                }}
              />
              <div style={{ display: 'flex', gap: 8 * scale, marginTop: 4 * scale }}>
                <div
                  style={{
                    padding: `${4 * scale}px ${12 * scale}px`,
                    borderRadius: 4 * scale,
                    background: slowColor,
                    color: t.colors.onAccent,
                    fontSize: 12 * scale,
                    fontFamily: t.fonts.body,
                    fontWeight: 600,
                  }}
                >
                  Save & Close
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8 * scale,
            padding: `${8 * scale}px ${12 * scale}px`,
            borderRadius: 8 * scale * t.style.cornerRadius,
            background: hexA(slowColor, 0.1),
            color: slowColor,
            fontSize: 14 * scale,
            fontFamily: t.fonts.body,
          }}
        >
          <AssetIcon asset="lucide:alert-circle" size={16 * scale} tint={slowColor} on={t.colors.panel} bare />
          <span>Constant context switches &amp; lost state</span>
        </div>
      </div>
    );
  };

  const renderFastLane = () => {
    return (
      <div
        style={{
          width: laneW,
          background: t.colors.panel,
          border: `${2 * scale}px solid ${hexA(fastColor, 0.4)}`,
          borderRadius: cardRadius,
          padding: `${24 * scale}px`,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 16 * scale,
          position: 'relative',
          boxShadow:
            t.style.glow > 0 ? `0 0 ${20 * scale}px ${hexA(fastColor, 0.15 * t.style.glow)}` : 'none',
        }}
      >
        {/* Lane Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 * scale }}>
            <AssetIcon asset="lucide:check-square" size={24 * scale} tint={fastColor} on={t.colors.panel} bare />
            <span
              style={{
                fontFamily: t.fonts.display,
                fontWeight: t.style.displayWeight,
                fontSize: 22 * scale,
                color: t.colors.text,
                letterSpacing: t.style.displayTracking,
              }}
            >
              {fast.label}
            </span>
          </div>
          <span
            style={{
              fontFamily: t.fonts.mono,
              fontSize: 22 * scale,
              fontWeight: 700,
              color: fastColor,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {fast.stat}
          </span>
        </div>

        {/* Mock Multi-Select Table Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 * scale, position: 'relative' }}>
          {Array.from({ length: rowCount }).map((_, idx) => {
            const isChecked = idx < sweepProgress;
            return (
              <div
                key={idx}
                style={{
                  height: 36 * scale,
                  borderRadius: 6 * scale * t.style.cornerRadius,
                  background: isChecked ? hexA(fastColor, 0.12) : hexA(t.colors.text, 0.04),
                  border: `${1 * scale}px solid ${
                    isChecked ? hexA(fastColor, 0.6) : hexA(t.colors.panelBorder, 0.5)
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  padding: `0 ${12 * scale}px`,
                  gap: 12 * scale,
                  transition: 'background 0.1s ease',
                }}
              >
                <div
                  style={{
                    width: 16 * scale,
                    height: 16 * scale,
                    borderRadius: 4 * scale,
                    background: isChecked ? fastColor : 'transparent',
                    border: `${1.5 * scale}px solid ${isChecked ? fastColor : t.colors.muted}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isChecked && (
                    <AssetIcon asset="lucide:check" size={12 * scale} tint={t.colors.onAccent} on={fastColor} bare />
                  )}
                </div>
                <div
                  style={{
                    width: (80 + (idx % 3) * 30) * scale,
                    height: 8 * scale,
                    borderRadius: 4 * scale,
                    background: isChecked ? t.colors.text : hexA(t.colors.text, 0.25),
                  }}
                />
                <div style={{ flex: 1 }} />
                <div
                  style={{
                    width: 44 * scale,
                    height: 8 * scale,
                    borderRadius: 4 * scale,
                    background: hexA(t.colors.text, 0.15),
                  }}
                />
              </div>
            );
          })}

          {/* Floating Bulk Action Bar */}
          <div
            style={{
              marginTop: 4 * scale,
              padding: `${10 * scale}px ${16 * scale}px`,
              borderRadius: 8 * scale * t.style.cornerRadius,
              background: isFastComplete ? fastColor : hexA(fastColor, 0.15),
              border: `${1 * scale}px solid ${fastColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow:
                t.style.glow > 0 && isFastComplete
                  ? `0 0 24px ${hexA(fastColor, 0.4 * t.style.glow)}`
                  : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 * scale }}>
              <AssetIcon
                asset="lucide:zap"
                size={18 * scale}
                tint={isFastComplete ? t.colors.onAccent : fastColor}
                on={isFastComplete ? fastColor : t.colors.panel}
                bare
              />
              <span
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: 14 * scale,
                  fontWeight: 700,
                  color: isFastComplete ? t.colors.onAccent : t.colors.text,
                }}
              >
                {Math.min(rowCount, Math.floor(sweepProgress))} of {rowCount} Selected
              </span>
            </div>
            <div
              style={{
                fontSize: 13 * scale,
                fontFamily: t.fonts.body,
                fontWeight: 600,
                color: isFastComplete ? t.colors.onAccent : fastColor,
                textTransform: 'uppercase',
                letterSpacing: 1 * scale,
              }}
            >
              {isFastComplete ? 'Executed in 1 Click' : 'Sweeping...'}
            </div>
          </div>
        </div>

        {/* Success Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8 * scale,
            padding: `${8 * scale}px ${12 * scale}px`,
            borderRadius: 8 * scale * t.style.cornerRadius,
            background: hexA(fastColor, 0.1),
            color: fastColor,
            fontSize: 14 * scale,
            fontFamily: t.fonts.body,
          }}
        >
          <AssetIcon asset="lucide:sparkles" size={16 * scale} tint={fastColor} on={t.colors.panel} bare />
          <span>Zero context switches • Zero state loss</span>
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        background: t.colors.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${40 * scale}px`,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          opacity: baseOpacity,
          transform: `translateY(${slideIn}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: (vertical ? 24 : 32) * scale,
          width: '100%',
          maxWidth: containerW,
        }}
      >
        {/* Headline */}
        {d.headline && (
          <Headline
            text={d.headline}
          />
        )}

        {/* Main Side-by-Side or Stacked Execution Lanes */}
        <div
          style={{
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            gap: laneGap,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {renderSlowLane()}
          {renderFastLane()}
        </div>
      </div>

      {d.source && <SourceFooter text={d.source} />}
    </AbsoluteFill>
  );
};
