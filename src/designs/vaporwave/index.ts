import {DesignRegistry} from '../index';
import {VaporChrome, VaporHeadline, VaporPanel} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const vaporKit: ChartKit = {Headline: VaporHeadline, Panel: VaporPanel, panelColorProp: true, legendGlow: true, codeStyle: 'prompt', progressVariant: 'ring'};
const VaporLineChart = makeLineChart(vaporKit);
const VaporDonut = makeDonut(vaporKit);
const VaporCode = makeCodeWindow(vaporKit);
const VaporProgress = makeProgress(vaporKit);
const VaporTimeline = makeTimeline(vaporKit);
import {
  VaporHook,
  VaporStatPanels,
  VaporStepFlow,
  VaporListBuild,
  VaporStatCallout,
} from './scenes';

// Vaporwave pack: gradient text, glass panels, terminal ">" grammar, outrun
// grid + sunset sun chrome. Unlisted types fall back to core (vaporwave-themed).
export const vaporwaveRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(vaporKit),
  CHAPTER: makeChapter(vaporKit),
  RECAP: makeRecap(vaporKit),
  HOOK: VaporHook,
  STAT_PANELS: VaporStatPanels,
  STEP_FLOW: VaporStepFlow,
  LIST_BUILD: VaporListBuild,
  STAT_CALLOUT: VaporStatCallout,
  LINE_CHART: VaporLineChart,
  DONUT: VaporDonut,
  CODE_WINDOW: VaporCode,
  PROGRESS: VaporProgress,
  TIMELINE: VaporTimeline,
};

export {VaporChrome, vaporKit};
