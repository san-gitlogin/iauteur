import React from 'react';
import {AbsoluteFill, staticFile, Img} from 'remotion';
import {ThemeProvider, useTheme} from './themes';
import {useSem, hexA} from './ui';

/**
 * DISCLAIMER BOARD — a still card that goes in FRONT of a finished cut (owner, 2026-10-03).
 *
 * A disclaimer is read, not watched: nothing on it moves (LAW 0h), the title is bold and red the
 * way a notice board is, the body is semi-bold and white, and it holds long enough to be read once
 * at an unhurried pace. It is its own composition so it can be rendered alone and joined to an
 * already-rendered video with a stream copy — adding it never costs a re-render of the cut.
 * Everything is a theme token, so it follows whichever design the video uses.
 */
export const DISCLAIMER_TEXT =
  "The code and software demonstrated in this video are provided 'as-is' without warranty of any kind, " +
  'express or implied. This project is intended for educational, informational, and portfolio purposes only. ' +
  'Use, deployment, or implementation of this code in a production or live environment is done entirely at ' +
  'your own risk. The creator assumes no liability for any direct or indirect damages, data loss, or system ' +
  'issues resulting from the use of this material.';

const Inner: React.FC<{text: string; logo?: string}> = ({text, logo}) => {
  const t = useTheme();
  const red = useSem()('red');
  return (
    <AbsoluteFill style={{background: t.colors.bg, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 1480, boxSizing: 'border-box', padding: '64px 84px 70px',
        borderRadius: 26 * t.style.cornerRadius, background: hexA(red, 0.06),
        border: `3px solid ${hexA(red, 0.85)}`, boxShadow: `0 0 90px ${hexA(red, 0.16)}`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 26, marginBottom: 34}}>
          <div style={{width: 64, height: 64, borderRadius: '50%', border: `5px solid ${red}`, color: red,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fonts.display,
            fontWeight: 800, fontSize: 44, lineHeight: 1}}>!</div>
          <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: 84, lineHeight: 1,
            letterSpacing: '0.06em', textTransform: 'uppercase', color: red}}>Disclaimer</div>
        </div>
        <div style={{height: 3, background: hexA(red, 0.5), marginBottom: 38}} />
        <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 40, lineHeight: 1.5,
          color: t.colors.text}}>{text}</div>
      </div>
      {logo ? (
        <Img src={staticFile('assets/' + logo.replace(/^img:/, ''))}
          style={{position: 'absolute', right: 56, top: 44, height: 64, width: 'auto', opacity: 0.9}} />
      ) : null}
    </AbsoluteFill>
  );
};

export const Disclaimer: React.FC<{themeName: string; text?: string; logo?: string}> = ({themeName, text, logo}) => (
  <ThemeProvider themeName={themeName}>
    <Inner text={text ?? DISCLAIMER_TEXT} logo={logo} />
  </ThemeProvider>
);

/** ~3 words a second is a comfortable silent read; a second on either side to arrive and leave. */
export const disclaimerFrames = (text: string = DISCLAIMER_TEXT, fps = 30) =>
  Math.round((text.trim().split(/\s+/).length / 3 + 2) * fps);
