import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// DATABASE_TABLE — a table that builds row by row, then a query pill appears and
// the matching rows light up. Equal-width flex columns keep every cell aligned.
// Both aspects (narrower on shorts). rows/highlight are indices into rows[].
export const DatabaseTable: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.database;
  if (!d) return <AbsoluteFill />;

  const columns = (d.columns ?? []).slice(0, 4);
  const nc = columns.length;
  const rows = (d.rows ?? []).slice(0, 6);
  const nr = rows.length;
  const start = wordToFrame(d.atWord ?? 1) + 8;
  const accent = sem(d.color ?? 'blue');
  const highlight = new Set(d.highlight ?? []);

  const tableW = (vertical ? 980 : 1180) * scale;
  const colW = tableW / nc;
  const rowH = (vertical ? 96 : 78) * scale;
  const rad = 14 * scale * t.style.cornerRadius;
  const per = 8;
  const revealed = interpolate(frame, [start, start + per * nr], [0, nr], clamp);
  const queryIn = interpolate(frame, [start + per * nr + 4, start + per * nr + 18], [0, 1], clamp);
  const matchOn = interpolate(frame, [start + per * nr + 20, start + per * nr + 34], [0, 1], clamp);

  const Cell = ({text, header, matched}: {text: string; header?: boolean; matched?: boolean}) => (
    <div
      style={{
        width: colW,
        height: rowH,
        display: 'flex',
        alignItems: 'center',
        padding: `0 ${20 * scale}px`,
        fontFamily: header ? t.fonts.mono : t.fonts.body,
        fontWeight: header ? 700 : 500,
        fontSize: (vertical ? 27 : 25) * scale,
        letterSpacing: header ? '0.08em' : undefined,
        textTransform: header ? 'uppercase' : undefined,
        color: header ? accent : matched ? t.colors.text : t.colors.muted,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        boxSizing: 'border-box',
      }}
    >
      {text}
    </div>
  );

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18 * scale,
          marginTop: d.headline ? (vertical ? 150 : 74) * scale : 0,
        }}
      >
        {/* table name + query */}
        <div style={{display: 'flex', alignItems: 'center', gap: 16 * scale, width: tableW, justifyContent: 'space-between'}}>
          {d.tableName ? (
            <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 24 * scale, letterSpacing: '0.06em', color: t.colors.text}}>
              {'\u25A4 '}{d.tableName}
            </span>
          ) : <span />}
          {d.query ? (
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontWeight: 700,
                fontSize: 21 * scale,
                color: t.colors.onAccent,
                background: accent,
                borderRadius: 8 * scale,
                padding: `${6 * scale}px ${14 * scale}px`,
                whiteSpace: 'nowrap',
                opacity: queryIn,
                transform: `translateY(${interpolate(queryIn, [0, 1], [-8 * scale, 0])}px)`,
              }}
            >
              {d.query}
            </span>
          ) : null}
        </div>
        {/* table */}
        <div style={{width: tableW, borderRadius: rad, border: `${2 * scale}px solid ${t.colors.panelBorder}`, overflow: 'hidden', background: t.colors.panel}}>
          {/* header */}
          <div style={{display: 'flex', borderBottom: `${2 * scale}px solid ${t.colors.panelBorder}`, background: hexA(accent, 0.06)}}>
            {columns.map((col, j) => <Cell key={j} text={col} header />)}
          </div>
          {/* rows */}
          {rows.map((row, i) => {
            const shown = i < revealed;
            const rowE = interpolate(revealed, [i, i + 1], [0, 1], clamp);
            const matched = highlight.has(i);
            const mo = matched ? matchOn : 0;
            return (
              <div
                key={i}
                style={{
                  display: shown ? 'flex' : 'none',
                  borderTop: i > 0 ? `${1 * scale}px solid ${hexA(t.colors.panelBorder, 0.6)}` : undefined,
                  background: matched ? hexA(accent, 0.02 + mo * 0.16) : 'transparent',
                  boxShadow: matched && mo > 0.5 && t.style.glow > 0 ? `inset 0 0 ${20 * scale * t.style.glow}px ${hexA(accent, 0.16)}` : undefined,
                  opacity: rowE,
                }}
              >
                {row.slice(0, nc).map((cell, j) => <Cell key={j} text={cell} matched={matched && mo > 0.3} />)}
              </div>
            );
          })}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
