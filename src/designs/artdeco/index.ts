import {DesignRegistry} from '../index';
import {DecoChrome, DecoHeadline, DecoFrame} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const decoKit: ChartKit = {Headline: DecoHeadline, Panel: DecoFrame, panelColorProp: true, codeStyle: 'tab', progressVariant: 'ring'};
const DecoLineChart = makeLineChart(decoKit);
const DecoDonut = makeDonut(decoKit);
const DecoCode = makeCodeWindow(decoKit);
const DecoProgress = makeProgress(decoKit);
const DecoTimeline = makeTimeline(decoKit);
import {
  DecoHook,
  DecoStatPanels,
  DecoStepFlow,
  DecoListBuild,
  DecoStatCallout,
} from './scenes';

// Art Deco pack: obsidian + gold, Cinzel caps, sunbursts, diamond dividers,
// ziggurat frames, Roman numerals, symmetric. Unlisted types fall back to core.
export const artdecoRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(decoKit),
  CHAPTER: makeChapter(decoKit),
  RECAP: makeRecap(decoKit),
  HOOK: DecoHook,
  STAT_PANELS: DecoStatPanels,
  STEP_FLOW: DecoStepFlow,
  LIST_BUILD: DecoListBuild,
  STAT_CALLOUT: DecoStatCallout,
  LINE_CHART: DecoLineChart,
  DONUT: DecoDonut,
  CODE_WINDOW: DecoCode,
  PROGRESS: DecoProgress,
  TIMELINE: DecoTimeline,
};

export {DecoChrome, decoKit};
