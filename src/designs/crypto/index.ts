import {DesignRegistry} from '../index';
import {CrChrome, CrHeadline, Glass} from './primitives';
import {makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const crKit: ChartKit = {Headline: CrHeadline, Panel: Glass, panelProps: {active: true}, legendGlow: true, codeStyle: 'prompt', progressVariant: 'ring'};
const CrDonut = makeDonut(crKit);
const CrCode = makeCodeWindow(crKit);
const CrProgress = makeProgress(crKit);
const CrTimeline = makeTimeline(crKit);
import {
  CrHook,
  CrStatPanels,
  CrStepFlow,
  CrListBuild,
  CrStatCallout,
  CrLineChart,
} from './scenes';

// Crypto pack: Bitcoin/DeFi — true void, glassmorphic panels, orange→gold
// gradient glow, blockchain grid, mono tickers, delta chips, Space Grotesk.
// Unlisted types fall back to core (crypto-themed) + grid/ticker/glow chrome.
export const cryptoRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(crKit),
  CHAPTER: makeChapter(crKit),
  RECAP: makeRecap(crKit),
  HOOK: CrHook,
  STAT_PANELS: CrStatPanels,
  STEP_FLOW: CrStepFlow,
  LIST_BUILD: CrListBuild,
  STAT_CALLOUT: CrStatCallout,
  LINE_CHART: CrLineChart,
  DONUT: CrDonut,
  CODE_WINDOW: CrCode,
  PROGRESS: CrProgress,
  TIMELINE: CrTimeline,
};

export {CrChrome, crKit};
