import {DesignRegistry} from '../index';
import {MdChrome, MdHeadline, Glass} from './primitives';
import {makeLineChart, makeDonut, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const mdKit: ChartKit = {Headline: MdHeadline, Panel: Glass, panelProps: {glow: true}, progressVariant: 'ring'};
const MdLineChart = makeLineChart(mdKit);
const MdDonut = makeDonut(mdKit);
const MdProgress = makeProgress(mdKit);
const MdTimeline = makeTimeline(mdKit);
import {
  MdHook,
  MdStatPanels,
  MdStepFlow,
  MdListBuild,
  MdStatCallout,
  MdCodeWindow,
} from './scenes';

// Modern-dark pack: premium dev tools (Linear/Vercel/Raycast) — near-black,
// indigo accent, glass surfaces, technical grid, layered ambient lighting,
// mock-window chrome. Unlisted types fall back to core + blob/noise chrome.
export const moderndarkRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(mdKit),
  CHAPTER: makeChapter(mdKit),
  RECAP: makeRecap(mdKit),
  HOOK: MdHook,
  STAT_PANELS: MdStatPanels,
  STEP_FLOW: MdStepFlow,
  LIST_BUILD: MdListBuild,
  STAT_CALLOUT: MdStatCallout,
  CODE_WINDOW: MdCodeWindow,
  LINE_CHART: MdLineChart,
  DONUT: MdDonut,
  PROGRESS: MdProgress,
  TIMELINE: MdTimeline,
};

export {MdChrome, mdKit};
