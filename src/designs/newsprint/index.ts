import {DesignRegistry} from '../index';
import {NewsChrome, NewsPage} from './primitives';
import {Headline} from '../../ui';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const newsKit: ChartKit = {Headline, Panel: NewsPage, codeStyle: 'tab', progressVariant: 'bar'};
const NewsLineChart = makeLineChart(newsKit);
const NewsDonut = makeDonut(newsKit);
const NewsCode = makeCodeWindow(newsKit);
const NewsProgress = makeProgress(newsKit);
const NewsTimeline = makeTimeline(newsKit);
import {
  NewsHook,
  NewsStatPanels,
  NewsStepFlow,
  NewsListBuild,
  NewsStatCallout,
} from './scenes';

// Newsprint pack: an off-white newspaper page (ink serif masthead, column
// rules, editorial red, dateline, drop caps). Unlisted types fall back to core.
export const newsprintRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(newsKit),
  CHAPTER: makeChapter(newsKit),
  RECAP: makeRecap(newsKit),
  HOOK: NewsHook,
  STAT_PANELS: NewsStatPanels,
  STEP_FLOW: NewsStepFlow,
  LIST_BUILD: NewsListBuild,
  STAT_CALLOUT: NewsStatCallout,
  LINE_CHART: NewsLineChart,
  DONUT: NewsDonut,
  CODE_WINDOW: NewsCode,
  PROGRESS: NewsProgress,
  TIMELINE: NewsTimeline,
};

export {NewsChrome, newsKit};
