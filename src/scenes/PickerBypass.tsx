import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {ChromeFrame} from '../kit';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// PICKER_BYPASS — routing around the un-automatable. The OS file picker is drawn as
// its own window with OS chrome, struck through and dimmed: it is not a web page and
// nothing can click inside it. The file then travels DIRECTLY from that window's
// contents into the page's input, arcing past the picker rather than through it, and
// the picker never opens. The arc is the lesson — the fix is avoidance, not handling.
export const PickerBypass: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.pickerBypass;
  if (!d) return <AbsoluteFill />;

  const files = (d.files ?? []).slice(0, 3);
  if (!files.length) return <AbsoluteFill />;
  const pickerItems = (d.pickerItems ?? []).slice(0, 3);
  const accent = sem(d.color ?? 'green');
  const bad = sem('red');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the page, the empty input and the struck-out OS window exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const hand = d.handAtWord != null ? Math.max(wordToFrame(d.handAtWord), base + 26) : base + 80;
  const handP = interpolate(frame, [hand, hand + 24], [0, 1], clamp);
  const landed = handP > 0.9;

  const rad = 14 * scale * t.style.cornerRadius;
  const paneW = (vertical ? 940 : 620) * scale;

  const Picker = (
    <div style={{width: paneW, position: 'relative', opacity: 0.5}}>
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          borderRadius: 10 * scale * t.style.cornerRadius,
          overflow: 'hidden',
          border: `${2 * scale}px solid ${hexA(bad, 0.55)}`,
          background: t.colors.bg,
          backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
          position: 'relative',
        }}
      >
        {/* struck through: not a web page, so nothing in it can be clicked. It lives
            INSIDE the bordered box, which already clips — a MIN-height window used to
            let the rotated line poke out past its own corners. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: 3 * scale,
            background: bad,
            transform: 'rotate(-9deg)',
            zIndex: 2,
          }}
        />
        {/* deliberately NOT ChromeFrame — this is an OS window, not a browser one */}
        <div
          style={{
            padding: `${9 * scale}px ${13 * scale}px`,
            background: hexA(t.colors.muted, 0.16),
            borderBottom: `${1.5 * scale}px solid ${hexA(t.colors.muted, 0.3)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 9 * scale,
          }}
        >
          <span style={{width: 11 * scale, height: 11 * scale, borderRadius: 2 * scale, background: hexA(t.colors.muted, 0.6)}} />
          <span
            style={{
              fontFamily: t.fonts.body,
              fontSize: 20 * scale,
              color: t.colors.muted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {d.pickerTitle ?? 'Open File'}
          </span>
        </div>
        <div style={{padding: `${11 * scale}px ${13 * scale}px`, display: 'flex', flexDirection: 'column', gap: 7 * scale}}>
          {pickerItems.map((it, i) => (
            <span
              key={i}
              style={{
                fontFamily: t.fonts.body,
                fontSize: (vertical ? 21 : 22) * scale,
                color: hexA(t.colors.muted, 0.9),
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {it}
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: -16 * scale,
          transform: 'translateX(-50%)',
          padding: `${5 * scale}px ${12 * scale}px`,
          borderRadius: 7 * scale * t.style.cornerRadius,
          background: t.colors.bg,
          backgroundImage: `linear-gradient(${hexA(bad, 0.22)}, ${hexA(bad, 0.22)})`,
          border: `${1.5 * scale}px solid ${hexA(bad, 0.6)}`,
          fontFamily: t.fonts.body,
          fontSize: 19 * scale,
          color: bad,
          whiteSpace: 'nowrap',
        }}
      >
        {d.blockedNote ?? 'not a web page'}
      </div>
    </div>
  );

  const Page = (
    <div style={{width: paneW}}>
      <ChromeFrame variant="browser" title={d.pageTitle ?? 'the page'}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10 * scale, padding: `${4 * scale}px 0`}}>
          <span style={{fontFamily: t.fonts.body, fontSize: 20 * scale, color: t.colors.muted}}>
            {d.inputLabel}
          </span>
          <div
            style={{
              boxSizing: 'border-box',
              width: '100%',
              minHeight: 54 * scale,
              padding: `${10 * scale}px ${13 * scale}px`,
              borderRadius: 9 * scale * t.style.cornerRadius,
              background: landed ? hexA(accent, 0.16) : hexA(t.colors.panelBorder, 0.35),
              border: `${(landed ? 2.5 : 1.5) * scale}px ${landed ? 'solid' : 'dashed'} ${
                landed ? hexA(accent, 0.8) : hexA(t.colors.muted, 0.4)
              }`,
              boxShadow: landed && t.style.glow > 0 ? `0 0 ${18 * scale * t.style.glow}px ${hexA(accent, 0.4)}` : undefined,
              display: 'flex',
              flexDirection: 'column',
              gap: 5 * scale,
              justifyContent: 'center',
            }}
          >
            {landed ? (
              files.map((f, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: (vertical ? 21 : 22) * scale,
                    color: accent,
                    opacity: interpolate(frame, [hand + 18 + i * 7, hand + 32 + i * 7], [0, 1], clamp),
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f}
                </span>
              ))
            ) : (
              <span style={{fontFamily: t.fonts.body, fontSize: 21 * scale, color: hexA(t.colors.muted, 0.8)}}>
                no file chosen
              </span>
            )}
          </div>
          {landed && d.landedNote ? (
            <span
              style={{
                alignSelf: 'flex-start',
                padding: `${4 * scale}px ${11 * scale}px`,
                borderRadius: 7 * scale * t.style.cornerRadius,
                background: hexA(accent, 0.18),
                fontFamily: t.fonts.body,
                fontSize: 19 * scale,
                color: accent,
                opacity: handP,
                whiteSpace: 'nowrap',
              }}
            >
              {d.landedNote}
            </span>
          ) : null}
        </div>
      </ChromeFrame>
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'green'} /> : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * scale, opacity: appear}}>
        <div
          style={{
            boxSizing: 'border-box',
            padding: `${11 * scale}px ${17 * scale}px`,
            borderRadius: rad,
            background: t.colors.bg,
            backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
            border: `${2 * scale}px solid ${hexA(accent, 0.3 + 0.45 * handP)}`,
            maxWidth: (vertical ? 960 : 1300) * scale,
          }}
        >
          <span
            style={{
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 22 : 24) * scale,
              color: handP > 0.3 ? accent : hexA(t.colors.muted, 0.9),
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {d.call}
          </span>
        </div>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: (vertical ? 34 : 44) * scale,
          }}
        >
          {Picker}
          {Page}

          {/* the file, travelling PAST the picker straight into the input */}
          {handP > 0 && handP < 1 ? (
            <div
              style={{
                position: 'absolute',
                left: `${interpolate(handP, [0, 1], [22, 74], clamp)}%`,
                top: vertical
                  ? `${interpolate(handP, [0, 0.5, 1], [26, 44, 62], clamp)}%`
                  : `${interpolate(handP, [0, 0.5, 1], [46, 16, 46], clamp)}%`,
                transform: 'translate(-50%, -50%)',
                padding: `${5 * scale}px ${13 * scale}px`,
                borderRadius: 8 * scale * t.style.cornerRadius,
                background: t.colors.bg,
                backgroundImage: `linear-gradient(${hexA(accent, 0.95)}, ${hexA(accent, 0.95)})`,
                color: t.colors.onAccent,
                fontFamily: t.fonts.mono,
                fontSize: 21 * scale,
                whiteSpace: 'nowrap',
                boxShadow: t.style.glow > 0 ? `0 0 ${20 * scale * t.style.glow}px ${hexA(accent, 0.6)}` : undefined,
              }}
            >
              {files[0]}
            </div>
          ) : null}
        </div>
      </div>

      {d.caption ? (
        <div
          style={{
            marginTop: 30 * scale,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 26 : 28) * scale,
            color: t.colors.muted,
            opacity: appear,
            textAlign: 'center',
            maxWidth: (vertical ? 980 : 1500) * scale,
          }}
        >
          {d.caption}
        </div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
