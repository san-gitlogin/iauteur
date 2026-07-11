import type {MotionStyle} from './util';
import {fadeUp, springPop, stackIn, slideIn, blurIn, scalePop, riseIn, clipReveal} from './entrances';
import {bounceIn, bubblePop} from './text';
import {scaleRotate} from './fx';

// A named entrance a spec can pick per element (scene.data.anim). Every value
// resolves to one of the ported/curated motion helpers. Default 'fadeUp'.
// This is what turns the motion library into VISIBLE variety: two videos using
// the same scene type can still enter differently.
export const ENTRANCES = [
  'fadeUp',
  'rise',
  'blur',
  'pop',
  'scale',
  'bounce',
  'bubble',
  'spin',
  'stack',
  'slideLeft',
  'slideRight',
  'slideUp',
  'slideDown',
  'clip',
  'wipe',
] as const;

export type EntranceKind = (typeof ENTRANCES)[number];

export const entranceStyle = (
  kind: string | undefined,
  frame: number,
  start: number,
  fps: number,
): MotionStyle => {
  switch (kind) {
    case 'rise':
      return riseIn(frame, start);
    case 'blur':
      return blurIn(frame, start, {rise: 20});
    case 'pop':
      return springPop(frame, start, fps);
    case 'scale':
      return scalePop(frame, start, fps);
    case 'bounce':
      return bounceIn(frame, start, fps);
    case 'bubble':
      return bubblePop(frame, start, fps);
    case 'spin':
      return scaleRotate(frame, start, fps);
    case 'stack':
      return stackIn(frame, start, fps);
    case 'slideLeft':
      return slideIn(frame, start, fps, {from: 'left'});
    case 'slideRight':
      return slideIn(frame, start, fps, {from: 'right'});
    case 'slideUp':
      return slideIn(frame, start, fps, {from: 'bottom'});
    case 'slideDown':
      return slideIn(frame, start, fps, {from: 'top'});
    case 'clip':
    case 'wipe':
      return clipReveal(frame, start, {dir: 'left'});
    case 'fadeUp':
    default:
      return fadeUp(frame, start, fps);
  }
};
