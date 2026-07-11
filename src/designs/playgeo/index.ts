import {DesignRegistry} from '../index';
import {PgChrome, PgHeadline, Sticker} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const pgKit: ChartKit = {Headline: PgHeadline, Panel: Sticker, panelColorProp: true, codeStyle: 'dots', progressVariant: 'ring'};
const PgLineChart = makeLineChart(pgKit);
const PgDonut = makeDonut(pgKit);
const PgCode = makeCodeWindow(pgKit);
const PgProgress = makeProgress(pgKit);
const PgTimeline = makeTimeline(pgKit);
import {
  PgHook,
  PgStatPanels,
  PgStepFlow,
  PgListBuild,
  PgStatCallout,
} from './scenes';

// Playful geometric (Memphis) pack: floating primitive shapes, hard sticker
// shadows, pattern fills, leaf-shaped cards with mixed radii, punchy palette.
// Unlisted types fall back to core (playgeo-themed) + scattered-shape chrome.
export const playgeoRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(pgKit),
  CHAPTER: makeChapter(pgKit),
  RECAP: makeRecap(pgKit),
  HOOK: PgHook,
  STAT_PANELS: PgStatPanels,
  STEP_FLOW: PgStepFlow,
  LIST_BUILD: PgListBuild,
  STAT_CALLOUT: PgStatCallout,
  LINE_CHART: PgLineChart,
  DONUT: PgDonut,
  CODE_WINDOW: PgCode,
  PROGRESS: PgProgress,
  TIMELINE: PgTimeline,
};

export {PgChrome, pgKit};
