import {DesignRegistry} from '../index';
import {SdChrome, SdHeadline, Card} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const sdKit: ChartKit = {Headline: SdHeadline, Panel: Card, codeStyle: 'dots', progressVariant: 'ring'};
const SdLineChart = makeLineChart(sdKit);
const SdDonut = makeDonut(sdKit);
const SdCode = makeCodeWindow(sdKit);
const SdProgress = makeProgress(sdKit);
const SdTimeline = makeTimeline(sdKit);
import {
  SdHook,
  SdStatPanels,
  SdStepFlow,
  SdListBuild,
  SdStatCallout,
} from './scenes';

// Simple-dark (minimalist dark) pack: layered slate cards, single warm amber
// accent, ambient glow, generous darkspace, soft edges — calm and premium.
// Unlisted types fall back to core (simpledark-themed) + ambient-glow chrome.
export const simpledarkRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(sdKit),
  CHAPTER: makeChapter(sdKit),
  RECAP: makeRecap(sdKit),
  HOOK: SdHook,
  STAT_PANELS: SdStatPanels,
  STEP_FLOW: SdStepFlow,
  LIST_BUILD: SdListBuild,
  STAT_CALLOUT: SdStatCallout,
  LINE_CHART: SdLineChart,
  DONUT: SdDonut,
  CODE_WINDOW: SdCode,
  PROGRESS: SdProgress,
  TIMELINE: SdTimeline,
};

export {SdChrome, sdKit};
