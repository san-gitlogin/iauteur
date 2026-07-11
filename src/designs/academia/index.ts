import {DesignRegistry} from '../index';
import {LibChrome, LibHeadline, LibPlate} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const libKit: ChartKit = {Headline: LibHeadline, Panel: LibPlate, panelColorProp: true, codeStyle: 'tab', progressVariant: 'bar'};
const LibLineChart = makeLineChart(libKit);
const LibDonut = makeDonut(libKit);
const LibCode = makeCodeWindow(libKit);
const LibProgress = makeProgress(libKit);
const LibTimeline = makeTimeline(libKit);
import {
  LibHook,
  LibStatPanels,
  LibStepFlow,
  LibListBuild,
  LibStatCallout,
} from './scenes';

// Academia pack: mahogany + brass + crimson, scholarly serif, book-plate frames,
// wax seals, chapter framing, fleurons. Unlisted types fall back to core.
export const academiaRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(libKit),
  CHAPTER: makeChapter(libKit),
  RECAP: makeRecap(libKit),
  HOOK: LibHook,
  STAT_PANELS: LibStatPanels,
  STEP_FLOW: LibStepFlow,
  LIST_BUILD: LibListBuild,
  STAT_CALLOUT: LibStatCallout,
  LINE_CHART: LibLineChart,
  DONUT: LibDonut,
  CODE_WINDOW: LibCode,
  PROGRESS: LibProgress,
  TIMELINE: LibTimeline,
};

export {LibChrome, libKit};
