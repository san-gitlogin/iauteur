import {DesignRegistry} from '../index';
import {SkChrome, SkHeadline, Note} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const skKit: ChartKit = {Headline: SkHeadline, Panel: Note, codeStyle: 'plain', progressVariant: 'ring', ink: '#2B2B2B'};
const SkLineChart = makeLineChart(skKit);
const SkDonut = makeDonut(skKit);
const SkCode = makeCodeWindow(skKit);
const SkProgress = makeProgress(skKit);
const SkTimeline = makeTimeline(skKit);
import {
  SkHook,
  SkStatPanels,
  SkStepFlow,
  SkListBuild,
  SkStatCallout,
} from './scenes';

// Hand-drawn sketch pack: sticky notes on a dark corkboard, wobbly borders, hard
// offset shadows, tape + thumbtacks, tilt, Caveat handwriting, doodle arrows.
// Unlisted types fall back to core (sketch-themed) + corkboard-doodle chrome.
export const sketchRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(skKit),
  CHAPTER: makeChapter(skKit),
  RECAP: makeRecap(skKit),
  HOOK: SkHook,
  STAT_PANELS: SkStatPanels,
  STEP_FLOW: SkStepFlow,
  LIST_BUILD: SkListBuild,
  STAT_CALLOUT: SkStatCallout,
  LINE_CHART: SkLineChart,
  DONUT: SkDonut,
  CODE_WINDOW: SkCode,
  PROGRESS: SkProgress,
  TIMELINE: SkTimeline,
};

export {SkChrome, skKit};
