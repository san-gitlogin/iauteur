import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene} from '../types';
import {Headline, SourceFooter, useScale} from '../ui';
import {Quadrant} from '../charts';

// QUADRANT — a 2x2 positioning map / scatter (landscape of options).
export const QuadrantScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const d = scene.data;
  const size = (vertical ? 900 : 720) * scale;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={d.headlineColor ?? 'orange'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 120 : 70) * scale}}>
        {d.quadrant ? <Quadrant data={d.quadrant} size={size} /> : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
