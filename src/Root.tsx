import React from 'react';
import {Composition} from 'remotion';
import {MainComposition, specDuration} from './MainComposition';
import {designPacks} from './designs';
import {showcaseSpec, newShowcaseSpec} from './showcaseSpec';
import {topics} from './topicsIndex';
import {Thumbnail} from './Thumbnail';
import {ThemedCover} from './CoverCard';

// STUDIO ROOT — two groups of compositions:
//
// 1. TOPIC videos (the real deliverables): per topic slug, a Dark + Light variant
//    of the long-form (16:9) and shorts (9:16) specs, plus the thumbnail / cover
//    stills. These are what `npm run render -- <slug> <variant>` renders.
//       <slug>-wide-dark · <slug>-wide-light · <slug>-short-dark · <slug>-short-light
//       <slug>-thumb (1280x720 still) · <slug>-cover (1080x1920 still)
//
// 2. DESIGN PREVIEW: one composition per design pack playing the FULL component
//    showcase in that pack's grammar — flip a design and scrub to see every
//    component. `<design>-wide/-short` = the whole library; `<design>-new-wide/
//    -short` = a focused reel of the recently-built components.

const DESIGN_KEYS = Object.keys(designPacks).sort();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ---------- TOPIC VIDEOS ---------- */}
      {topics.map((tp) => {
        const long = tp.long;
        const shorts = tp.shorts;
        const darkTheme = long?.brand?.theme ?? 'studio';
        const lightTheme = long?.brand?.themeLight ?? 'daylight';
        const shortsDark = shorts?.brand?.theme ?? darkTheme;
        const shortsLight = shorts?.brand?.themeLight ?? lightTheme;
        return (
          <React.Fragment key={tp.slug}>
            <Composition
              id={`${tp.slug}-wide-dark`}
              component={MainComposition}
              durationInFrames={specDuration(long)}
              fps={30}
              width={1920}
              height={1080}
              defaultProps={{spec: long, themeOverride: darkTheme}}
            />
            <Composition
              id={`${tp.slug}-wide-light`}
              component={MainComposition}
              durationInFrames={specDuration(long)}
              fps={30}
              width={1920}
              height={1080}
              defaultProps={{spec: long, themeOverride: lightTheme}}
            />
            {shorts ? (
              <>
                <Composition
                  id={`${tp.slug}-short-dark`}
                  component={MainComposition}
                  durationInFrames={specDuration(shorts)}
                  fps={30}
                  width={1080}
                  height={1920}
                  defaultProps={{spec: shorts, themeOverride: shortsDark}}
                />
                <Composition
                  id={`${tp.slug}-short-light`}
                  component={MainComposition}
                  durationInFrames={specDuration(shorts)}
                  fps={30}
                  width={1080}
                  height={1920}
                  defaultProps={{spec: shorts, themeOverride: shortsLight}}
                />
              </>
            ) : null}
            {long.thumbnail ? (
              <Composition
                id={`${tp.slug}-thumb`}
                component={Thumbnail}
                durationInFrames={1}
                fps={30}
                width={1280}
                height={720}
                defaultProps={{themeName: darkTheme, title: long.thumbnail.title, badge: long.thumbnail.badge, asset: long.thumbnail.asset, logo: long.brand?.logo}}
              />
            ) : null}
            {shorts?.cover ? (
              <Composition
                id={`${tp.slug}-cover`}
                component={ThemedCover}
                durationInFrames={1}
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{themeName: shortsDark, title: shorts.cover.title, badge: shorts.cover.badge ?? '', asset: shorts.cover.asset ?? 'lucide:sparkles', logo: shorts.brand?.logo}}
              />
            ) : null}
          </React.Fragment>
        );
      })}

      {/* ---------- DESIGN PREVIEW (component showcase per pack) ---------- */}
      {DESIGN_KEYS.map((design) => (
        <React.Fragment key={design}>
          <Composition
            id={`${design}-wide`}
            component={MainComposition}
            durationInFrames={specDuration(showcaseSpec)}
            fps={30}
            width={1920}
            height={1080}
            defaultProps={{spec: showcaseSpec, themeOverride: design, designOverride: design}}
          />
          <Composition
            id={`${design}-short`}
            component={MainComposition}
            durationInFrames={specDuration(showcaseSpec)}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{spec: showcaseSpec, themeOverride: design, designOverride: design}}
          />
          <Composition
            id={`${design}-new-wide`}
            component={MainComposition}
            durationInFrames={specDuration(newShowcaseSpec)}
            fps={30}
            width={1920}
            height={1080}
            defaultProps={{spec: newShowcaseSpec, themeOverride: design, designOverride: design}}
          />
          <Composition
            id={`${design}-new-short`}
            component={MainComposition}
            durationInFrames={specDuration(newShowcaseSpec)}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{spec: newShowcaseSpec, themeOverride: design, designOverride: design}}
          />
        </React.Fragment>
      ))}
    </>
  );
};
