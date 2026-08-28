import React from 'react';
import {Scene} from '../types';
import {useTheme} from '../themes';
import {useScale} from '../ui';
import {HookStage} from '../hookStage';
import {AssetIcon} from '../AssetIcon';

// HOOK — the unstyled fallback, for a spec that names no design pack.
//
// Every silhouette, every anchor and every easing lives in `src/hookStage.tsx`; this file is only
// the plainest possible handwriting for it — a bare icon and an accent line. It used to hold a
// composition of its own, which meant the same layout existed in thirty-one places and could drift
// in each. See the header of hookStage.tsx for why the opening needed more than one shape.
export const Hook: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const {scale} = useScale();
  return (
    <HookStage
      scene={scene}
      kit={{
        accent: t.colors.accent3,
        mark: (size) => <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />,
        sub: (text) => (
          <span style={{
            fontFamily: t.fonts.accent, fontWeight: 700,
            fontSize: 48 * scale, color: t.colors.accent3,
          }}>{text}</span>
        ),
      }}
    />
  );
};
