// THE MOTION SYSTEM — four named roles, so every component moves the same way.
//
// Owner, sending a motion-design guide: *"our quality of generating new components to explain
// a concept have depreciated, no alignment, no animation sync ... we need to improve on
// deciding the frame and creating new components to animate which not just sticks to boxes,
// putting something and showing, but focus on actual animations."*
//
// Measured across the eleven components built for the SQLite course: **33 interpolates, zero
// easing**. Every arrival, every travel, every collapse ran LINEAR. That is the guide's own
// headline note — *"Linear motion looks robotic ... Easing is often the single biggest
// improvement beginners can make"* — and it is why the set read as boxes appearing rather
// than as animation.
//
// Two more of its rules are baked in here rather than left to memory:
//
//   "Consistency creates style" — style comes from a small set of repeated rules, not from
//   complexity. So there are FOUR roles and one duration each, and a component picks a role
//   rather than inventing a curve.
//
//   "Overlap and follow-through" — objects rarely start and stop at the same moment. `stagger`
//   exists so a list of children never arrives as a block.
//
// Every helper returns 0..1 and is a pure function of the frame, so it obeys LAW 0i: no fixed
// intervals, no hooks, every moment resolved from an element's own anchor.
import {easeInCubic, easeInOutCubic, easeOutBack, easeOutCubic, progress} from './util';

/** Durations in frames at 30fps. One number per role — that is the whole point. */
export const BEAT = {
  /** something arrives on screen */
  appear: 14,
  /** something moves from one place to another */
  travel: 22,
  /** something settles into its final place */
  land: 18,
  /** something leaves */
  release: 12,
} as const;

/**
 * ARRIVE — fast in, gentle settle. Nothing in the physical world appears at constant speed,
 * and an ease-out is what makes a card feel placed rather than switched on.
 */
export const arriveAt = (frame: number, start: number, dur: number = BEAT.appear): number =>
  easeOutCubic(progress(frame, start, dur));

/**
 * TRAVEL — the S-curve: accelerate away, decelerate in. This is the one the guide is really
 * asking for, and the one that separates a camera move from a slide.
 */
export const travelAt = (frame: number, start: number, dur: number = BEAT.travel): number =>
  easeInOutCubic(progress(frame, start, dur));

/**
 * LAND — travel with a small overshoot, so the object settles instead of stopping dead.
 * Follow-through, in the guide's terms. Use sparingly: one landing per beat.
 */
export const landAt = (frame: number, start: number, dur: number = BEAT.land): number =>
  easeOutBack(progress(frame, start, dur), 1.2);

/** LEAVE — ease in, so an exit drifts away rather than being cut. */
export const leaveAt = (frame: number, start: number, dur: number = BEAT.release): number =>
  easeInCubic(progress(frame, start, dur));

/**
 * OVERLAP — children start a few frames apart so a list never lands as one block. Keep the
 * step small: 3 frames reads as life, 10 reads as a queue.
 */
export const stagger = (index: number, step = 3): number => index * step;
