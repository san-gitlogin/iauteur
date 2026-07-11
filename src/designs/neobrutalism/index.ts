import {DesignRegistry} from '../index';
import {NeoChrome, NeoHeadline, NeoBox} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeChapter, makeRecap, ChartKit} from '../chartKit';

const neoKit: ChartKit = {Headline: NeoHeadline, Panel: NeoBox, codeStyle: 'dots', progressVariant: 'ring', ink: '#000000'};
const NeoLineChart = makeLineChart(neoKit);
const NeoDonut = makeDonut(neoKit);
const NeoCode = makeCodeWindow(neoKit);
const NeoProgress = makeProgress(neoKit);
const NeoTimeline = makeTimeline(neoKit);
import {
  NeoHook,
  NeoStatPanels,
  NeoStepFlow,
  NeoListBuild,
  NeoStatCallout,
  NeoTitleCard,
} from './scenes';

// Neo-brutalism pack: cream/pop sticker cutouts, thick black borders, hard
// offset shadows, tilts, number badges. Unlisted types fall back to core.
export const neobrutalismRegistry: DesignRegistry = {
  CHAPTER: makeChapter(neoKit),
  RECAP: makeRecap(neoKit),
  HOOK: NeoHook,
  TITLE_CARD: NeoTitleCard,
  STAT_PANELS: NeoStatPanels,
  STEP_FLOW: NeoStepFlow,
  LIST_BUILD: NeoListBuild,
  STAT_CALLOUT: NeoStatCallout,
  LINE_CHART: NeoLineChart,
  DONUT: NeoDonut,
  CODE_WINDOW: NeoCode,
  PROGRESS: NeoProgress,
  TIMELINE: NeoTimeline,
};

export {NeoChrome, neoKit};
