import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene} from '../types';
import {Headline, SourceFooter, useScale} from '../ui';
import {Timeline} from '../charts';

// TIMELINE — an ordered sequence of dated milestones (history, roadmap).
export const TimelineScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const d = scene.data;
  const w = (vertical ? 960 : 1600) * scale;
  const h = (vertical ? 1200 : 460) * scale;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={d.headlineColor ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 130 : 60) * scale}}>
        {d.timeline ? <Timeline data={d.timeline} w={w} h={h} /> : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
