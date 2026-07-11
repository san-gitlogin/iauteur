import {DesignRegistry} from '../index';
import {BotChrome, BotHeadline} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const botKit: ChartKit = {Headline: BotHeadline, codeStyle: 'tab', progressVariant: 'ring'};
const BotLineChart = makeLineChart(botKit);
const BotDonut = makeDonut(botKit);
const BotCode = makeCodeWindow(botKit);
const BotProgress = makeProgress(botKit);
const BotTimeline = makeTimeline(botKit);
import {
  BotHook,
  BotStatPanels,
  BotStepFlow,
  BotListBuild,
  BotStatCallout,
} from './scenes';

// Botanical organic serif pack: digital ode to nature — arch-framed shapes,
// botanical line-art sprigs, Playfair italic serif, earthy sage/clay/terracotta,
// paper grain, breathing space. Unlisted types fall back to core + sprig chrome.
export const botanicalRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(botKit),
  CHAPTER: makeChapter(botKit),
  RECAP: makeRecap(botKit),
  HOOK: BotHook,
  STAT_PANELS: BotStatPanels,
  STEP_FLOW: BotStepFlow,
  LIST_BUILD: BotListBuild,
  STAT_CALLOUT: BotStatCallout,
  LINE_CHART: BotLineChart,
  DONUT: BotDonut,
  CODE_WINDOW: BotCode,
  PROGRESS: BotProgress,
  TIMELINE: BotTimeline,
};

export {BotChrome, botKit};
