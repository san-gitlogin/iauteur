// PHASE A — MIN/MAX STRESS FIXTURE HARNESS (the high-yield audit surface).
// For a family, emits a spec of MIN-props and MAX-props scenes per (type × variant)
// with deliberately HOSTILE content authored exactly at the contract caps (longest
// headlines, max data points, max chips, worst-case label lengths). Renders via
// scripts/_proof.mjs (full-res, both aspects). The TYPE LIST is cross-checked against
// audit/census.json — every census type in the family MUST have a factory, or the
// generator errors (completeness guaranteed; never a silent hand-list).
//   node scripts/gen-fixtures.mjs <familyKey e.g. K>
import fs from 'node:fs';
import path from 'node:path';
import {famByKey} from './families.mjs';

const key = process.argv[2] || 'K';
const fam = famByKey(key);
if (!fam) {
  console.error(`unknown family key "${key}"`);
  process.exit(1);
}
const [famName, famTypes] = fam;

const HEAD = 'A hostile [headline] stressed to the very limit ok';   // 46 visible chars
const scene = (id, type, data, narration = 'A stress fixture with hostile content pushed to the contract cap here now.') =>
  ({id, type, narration, durationFrames: 210, timingSource: 'estimated', background: 'zoneA', data});

// ── FACTORY REGISTRY — keyed by TYPE. Each returns {min, max} full `data` objects.
// MAX is authored at the linter cap (worst case the contract permits); MIN is the
// sparsest legal content (tests centering / small-layout / empty degradation).
const F = {
  // ── FAMILY C · charts (Phase B2 expansion) ──
  FUNNEL: {
    min: {funnel: {color: 'blue', stages: [{label: 'Visits', value: 1000, atWord: 1}, {label: 'Signups', value: 320, atWord: 2}]}},
    max: {funnel: {color: 'blue', unit: '', stages: [
      {label: 'Site visits at the cap ok', value: 1000000, color: 'blue', atWord: 1},
      {label: 'Product page views now', value: 420000, color: 'purple', atWord: 2},
      {label: 'Added to cart totals', value: 145000, color: 'green', atWord: 3},
      {label: 'Began the checkout flow', value: 61000, color: 'orange', atWord: 4},
      {label: 'Entered payment details', value: 24000, color: 'red', atWord: 5},
      {label: 'Completed the purchase', value: 9800, color: 'yellow', atWord: 6}]}},
  },
  WATERFALL: {
    min: {waterfallChart: {color: 'blue', bars: [{label: 'Start', value: 100, isTotal: true, atWord: 1}, {label: 'Growth', value: 40, color: 'green', atWord: 2}]}},
    max: {waterfallChart: {color: 'blue', unit: 'k', bars: [
      {label: 'Opening balance', value: 500, isTotal: true, atWord: 1},
      {label: 'New sales', value: 320, color: 'green', atWord: 2},
      {label: 'Upsell revenue', value: 90, color: 'green', atWord: 3},
      {label: 'Churned accounts', value: -140, color: 'red', atWord: 4},
      {label: 'Refunds issued', value: -45, color: 'red', atWord: 5},
      {label: 'Discounts given', value: -60, color: 'red', atWord: 6},
      {label: 'Net revenue', value: 0, isTotal: true, atWord: 7}]}},
  },
  PICTOGRAM: {
    min: {pictogram: {color: 'blue', icon: 'lucide:user', rows: [{label: 'Team A', value: 3, atWord: 1}, {label: 'Team B', value: 7, color: 'green', atWord: 2}]}},
    max: {pictogram: {color: 'blue', unit: 'M', icon: 'lucide:users', rows: [
      {label: 'Monthly active users now', value: 250, color: 'blue', atWord: 1},
      {label: 'Weekly active accounts', value: 180, color: 'purple', atWord: 2},
      {label: 'Daily active sessions ok', value: 120, color: 'green', atWord: 3},
      {label: 'Paying subscribers total', value: 75, color: 'orange', atWord: 4},
      {label: 'Enterprise seats sold', value: 40, color: 'red', atWord: 5},
      {label: 'Churned last quarter', value: 15, color: 'yellow', atWord: 6}]}},
  },
  RADAR: {
    min: {radar: {color: 'blue', max: 100, axes: ['Speed', 'Power', 'Range'], series: [{name: 'Model A', values: [80, 55, 40], atWord: 1}]}},
    max: {radar: {color: 'blue', unit: '', max: 100, axes: ['Performance', 'Reliability', 'Security', 'Scalability', 'Usability', 'Cost fit', 'Support', 'Ecosystem'], series: [
      {name: 'Platform Alpha', values: [90, 75, 82, 68, 88, 55, 70, 84], color: 'blue', atWord: 1},
      {name: 'Platform Beta', values: [60, 92, 70, 85, 64, 78, 88, 62], color: 'purple', atWord: 2},
      {name: 'Platform Gamma', values: [72, 66, 95, 74, 80, 90, 60, 76], color: 'green', atWord: 3}]}},
  },
  CANDLESTICK: {
    min: {candlestick: {color: 'blue', prefix: '$', candles: [
      {open: 100, high: 108, low: 96, close: 105, label: 'Mon'}, {open: 105, high: 112, low: 102, close: 103, label: 'Tue'},
      {open: 103, high: 110, low: 99, close: 109, label: 'Wed'}]}},
    max: {candlestick: {color: 'blue', prefix: '$', unit: '', candles: Array.from({length: 30}).map((_, i) => {
      const base = 100 + Math.round(30 * Math.sin(i / 3) + i);
      const open = base;
      const close = base + (i % 3 === 0 ? -6 : 5);
      const high = Math.max(open, close) + 5;
      const low = Math.min(open, close) - 5;
      return {open, high, low, close, label: i % 6 === 0 ? `D${i}` : undefined};
    }), ma: Array.from({length: 30}).map((_, i) => 100 + Math.round(30 * Math.sin(i / 3) + i))}},
  },
  BOX_PLOT: {
    min: {boxPlot: {color: 'blue', unit: 'ms', boxes: [
      {label: 'API v1', min: 20, q1: 40, median: 55, q3: 70, max: 110, atWord: 1},
      {label: 'API v2', min: 15, q1: 30, median: 42, q3: 58, max: 90, color: 'green', atWord: 2}]}},
    max: {boxPlot: {color: 'blue', unit: 'ms', boxes: [
      {label: 'Gateway', min: 20, q1: 45, median: 60, q3: 85, max: 140, outliers: [180, 210], color: 'blue', atWord: 1},
      {label: 'Auth svc', min: 12, q1: 28, median: 38, q3: 52, max: 88, color: 'purple', atWord: 2},
      {label: 'Search svc', min: 40, q1: 70, median: 95, q3: 130, max: 200, outliers: [260], color: 'green', atWord: 3},
      {label: 'Cache svc', min: 4, q1: 8, median: 12, q3: 18, max: 30, color: 'orange', atWord: 4},
      {label: 'Payments', min: 60, q1: 90, median: 120, q3: 160, max: 240, color: 'red', atWord: 5},
      {label: 'Recommender', min: 30, q1: 55, median: 78, q3: 105, max: 170, color: 'yellow', atWord: 6},
      {label: 'Notifier', min: 8, q1: 16, median: 24, q3: 36, max: 60, color: 'blue', atWord: 7},
      {label: 'Analytics', min: 50, q1: 85, median: 115, q3: 150, max: 220, outliers: [300], color: 'purple', atWord: 8}]}},
  },
  TREEMAP: {
    min: {treemap: {color: 'blue', unit: '%', items: [
      {label: 'Compute', value: 60, atWord: 1}, {label: 'Storage', value: 40, color: 'green', atWord: 1}]}},
    max: {treemap: {color: 'blue', unit: 'M', items: [
      {label: 'Cloud compute', value: 320, color: 'blue', atWord: 1},
      {label: 'Data storage', value: 210, color: 'purple', atWord: 1},
      {label: 'Networking', value: 140, color: 'green', atWord: 1},
      {label: 'Databases', value: 120, color: 'orange', atWord: 1},
      {label: 'ML training', value: 95, color: 'red', atWord: 1},
      {label: 'Observability', value: 70, color: 'yellow', atWord: 1},
      {label: 'Security', value: 55, color: 'blue', atWord: 1},
      {label: 'CDN', value: 40, color: 'purple', atWord: 1},
      {label: 'Backups', value: 30, color: 'green', atWord: 1},
      {label: 'Support', value: 22, color: 'orange', atWord: 1},
      {label: 'Licenses', value: 16, color: 'red', atWord: 1},
      {label: 'Misc', value: 10, color: 'yellow', atWord: 1}]}},
  },
  SANKEY: {
    min: {sankey: {color: 'blue', unit: 'k', nodes: [
      {id: 'a', label: 'Traffic', col: 0, color: 'blue'}, {id: 'b', label: 'Signups', col: 1, color: 'green'}, {id: 'c', label: 'Bounced', col: 1, color: 'red'}],
      links: [{source: 'a', target: 'b', value: 40}, {source: 'a', target: 'c', value: 60}]}},
    max: {sankey: {color: 'blue', unit: 'k', nodes: [
      {id: 'src', label: 'All visitors', col: 0, color: 'blue'},
      {id: 'org', label: 'Organic', col: 1, color: 'green'},
      {id: 'paid', label: 'Paid', col: 1, color: 'orange'},
      {id: 'ref', label: 'Referral', col: 1, color: 'purple'},
      {id: 'trial', label: 'Trial', col: 2, color: 'yellow'},
      {id: 'paidplan', label: 'Paid plan', col: 2, color: 'green'},
      {id: 'churn', label: 'Churned', col: 2, color: 'red'}],
      links: [
        {source: 'src', target: 'org', value: 220}, {source: 'src', target: 'paid', value: 140}, {source: 'src', target: 'ref', value: 90},
        {source: 'org', target: 'trial', value: 120}, {source: 'org', target: 'churn', value: 100},
        {source: 'paid', target: 'trial', value: 80}, {source: 'paid', target: 'paidplan', value: 60},
        {source: 'ref', target: 'trial', value: 40}, {source: 'ref', target: 'paidplan', value: 30}, {source: 'ref', target: 'churn', value: 20}]}},
  },
  // ── FAMILY A · core-text (HOOK/TITLE_CARD/KINETIC_TEXT/REVEAL/LOWER_THIRD/
  // STAT_CALLOUT/QUOTE_SPOTLIGHT/CHAPTER/RECAP/OUTRO_CTA/SUBSCRIBE_REMINDER/
  // CREDITS_ROLL/COUNTDOWN/NOTIFICATION/CHANNEL_CARD). Mostly headline/text heavy →
  // tall-headline + fit-row are the owned classes. MAX at lint caps; MIN sparsest. ──
  HOOK: {
    min: {headline: 'A short hook', headlineAtWord: 1},
    max: {headline: 'THE FULL THIRTY CHAR HEADLINE!', subtext: 'a subtext line under the hook', heroAsset: 'lucide:brain-circuit', headlineAtWord: 1, heroAtWord: 3, anim: 'scale'},
  },
  TITLE_CARD: {
    min: {title: 'Title', subtitle: 'a subtitle'},
    max: {title: 'The Section Title At Cap!!', subtitle: 'a subtitle under the title cap'},
  },
  KINETIC_TEXT: {
    min: {kinetic: {fx: 'typewriter', text: 'Hello', color: 'blue', atWord: 1}},
    max: {kinetic: {fx: 'typewriter', text: 'Kinetic text stressed to forty eight chars ok!', sub: 'kinetic subtitle at the forty char cap!', color: 'purple', atWord: 1}},
  },
  REVEAL: {
    min: {headline: 'The [idea].', reveal: {kicker: 'REVEAL', color: 'blue', atWord: 1}},
    max: {headline: 'The [big idea] revealed at the headline!', reveal: {kicker: 'THE CINEMATIC REVEAL OK', sub: 'a cinematic statement stressed to the sixty character cap', color: 'blue', atWord: 1}},
  },
  LOWER_THIRD: {
    min: {lowerThird: {title: 'Jane Smith', color: 'blue', atWord: 1}},
    max: {lowerThird: {kicker: 'GUEST SPEAKER NOW', title: 'Dr Jane Alexander Smith', subtitle: 'Principal Research Scientist, ACME', color: 'purple', atWord: 1}},
  },
  STAT_CALLOUT: {
    min: {value: 42, label: 'a small number', atWord: 1},
    max: {value: 1500000000, suffix: '+', label: 'tokens in a typical vocabulary', atWord: 1, source: 'ILLUSTRATIVE VOCABULARY SIZE'},
  },
  QUOTE_SPOTLIGHT: {
    min: {quote: 'Less is more.', source: 'A SAYING'},
    max: {person: {name: 'Vaswani et al., 2017', role: 'The Transformer paper authors'}, quote: 'Attention is all you need, and a quote stressed close to the one hundred and twenty character contract cap ok', source: 'THE PAPER THAT INTRODUCED THE TRANSFORMER MODEL'},
  },
  CHAPTER: {
    min: {chapter: {number: '1', title: 'The Start', color: 'blue'}},
    max: {chapter: {number: '04', title: 'Attention Is The Engine Now!', subtitle: 'the transformer is the machine here', color: 'purple'}},
  },
  RECAP: {
    min: {heading: 'Recap', points: [{text: 'First point', atWord: 1}, {text: 'Second point', atWord: 2}]},
    max: {heading: 'The whole machine, recapped', points: [
      {text: 'Text becomes tokens at the cap ok', atWord: 1}, {text: 'Tokens become vectors at the cap now', atWord: 2},
      {text: 'Attention weighs their meaning fully', atWord: 3}, {text: 'Training tunes the weights over time', atWord: 4},
      {text: 'Generation predicts the next token', atWord: 5}]},
  },
  OUTRO_CTA: {
    min: {message: 'Thanks for watching', sub: 'subscribe'},
    max: {message: "It's prediction all the way down now", sub: 'subscribe to YOUR CHANNEL channel'},
  },
  SUBSCRIBE_REMINDER: {
    min: {subscribe: {text: 'Subscribe', color: 'red', atWord: 1}},
    max: {subscribe: {text: 'Subscribe for a new video weekly!', sub: 'deep-dives into how the machines really work', handle: '@yourchannel', color: 'red', atWord: 1}},
  },
  CREDITS_ROLL: {
    min: {credits: {title: 'Credits', color: 'blue', rows: [{role: 'Director', name: 'Your Studio'}, {role: 'Music', name: 'Public Domain'}]}},
    max: {credits: {title: 'How The Whole System Works Fully', color: 'blue', rows: [
      {role: 'THE INPUT LAYER', name: 'Tokens & Embeddings Pipeline'}, {role: 'THE CORE ENGINE', name: 'Multi-Head Self Attention'},
      {role: 'THE MACHINE ITSELF', name: 'The Transformer Architecture'}, {role: 'THE LEARNING LOOP', name: 'Training & Backpropagation'},
      {role: 'THE FINAL OUTPUT', name: 'Autoregressive Generation'}]}},
  },
  COUNTDOWN: {
    min: {countdown: {from: 3, go: 'GO', color: 'blue', atWord: 1}},
    max: {countdown: {from: 10, label: 'launching the whole thing in', go: 'LIFTOFF!', color: 'orange', atWord: 1}},
  },
  NOTIFICATION: {
    min: {notifications: [{app: 'Mail', title: 'One new message', atWord: 1}]},
    max: {notifications: [
      {app: 'Payments', title: 'You received a new payment', body: 'A customer just paid the full invoice amount now', color: 'green', atWord: 1},
      {app: 'Security Center', title: 'New sign-in from a device', body: 'A new device signed into your account from abroad', color: 'red', atWord: 2},
      {app: 'Calendar', title: 'Standup starts in five minutes', body: 'Daily engineering standup with the whole platform team', color: 'blue', atWord: 3},
      {app: 'Deploy Bot', title: 'Production deploy succeeded', body: 'Release v4.2.0 is now live across every region ok', color: 'purple', atWord: 4}]},
  },
  CHANNEL_CARD: {
    min: {handle: '@channel', atWord: 1},
    max: {handle: '@yourchannel', tagline: 'deep-dives into how it works', atWord: 1},
    maxChip: {subChip: {src: 'assets/video/demo_flow.mp4', name: 'Tech Explained Daily', handle: '@techexplaineddaily', avatar: 'lucide:cpu', buttonLabel: 'SUBSCRIBE', color: 'orange', atWord: 1}},
  },
  // ── FAMILY B · media-ui (PHOTO/IMAGE_SCENE/GALLERY/PHOTO_STACK/CAROUSEL/
  // COMPARISON_SLIDER/FLIP_CARD/SOUND_WAVE/LOGO_REVEAL/LOCATION_MAP/ACTIVITY_CARD/
  // CHAT_MOCKUP). MAX at the lint caps (labels at char limit, max tiles/cards/bars/
  // items); MIN sparsest legal. Several are FULL-BLEED (PHOTO/IMAGE/GALLERY) → the
  // edge-scan flags them by design; the agent opens them knowing edge content is ok. ──
  PHOTO: {
    min: {photo: {asset: 'img:network.jpg', caption: 'a scene', color: 'blue', atWord: 1}},
    max: {photo: {asset: 'img:server-racks.jpg', kicker: 'INSIDE THE DATACENTER', caption: 'Inside a live production data center at full capacity', pan: 'in', color: 'blue', atWord: 1}},
  },
  IMAGE_SCENE: {
    min: {image: {asset: 'img:network.jpg', color: 'blue', atWord: 1}},
    max: {image: {variant: 'pip', asset: 'img:server-racks.jpg', caption: 'A pip inset over the main image here', pip: {asset: 'img:network.jpg', label: 'inset detail view'}, color: 'purple', atWord: 1}},
    maxPolaroid: {image: {variant: 'polaroid', asset: 'img:datacenter.jpg', caption: 'A tilted polaroid at the cap now', color: 'orange', atWord: 1}},
  },
  GALLERY: {
    min: {gallery: {tiles: [{asset: 'lucide:box', label: 'One'}, {asset: 'lucide:star', label: 'Two'}]}},
    max: {gallery: {variant: 'grid', columns: 3, tiles: [
      {asset: 'lucide:layout-dashboard', label: 'Dashboard view', color: 'blue'}, {asset: 'lucide:bar-chart', label: 'Analytics panel', color: 'purple'},
      {asset: 'lucide:file-text', label: 'Reporting suite', color: 'green'}, {asset: 'lucide:settings', label: 'Settings screen', color: 'orange'},
      {asset: 'lucide:user', label: 'Profile editor', color: 'red'}, {asset: 'lucide:credit-card', label: 'Billing center', color: 'yellow'}]}},
    maxClips: {headline: 'The [clips] grid at cap', headlineColor: 'orange', gallery: {variant: 'clips', tiles: [
      {src: 'assets/video/demo_ui.mp4', label: 'Interface tour', color: 'orange', atWord: 1}, {src: 'assets/video/demo_flow.mp4', label: 'Dataflow demo', color: 'blue', atWord: 2},
      {src: 'assets/video/demo_grid.mp4', label: 'Layout engine', color: 'green', atWord: 3}, {src: 'assets/network.jpg', kind: 'image', label: 'Static tile too', color: 'purple', atWord: 4}]}},
  },
  PHOTO_STACK: {
    min: {photoStack: {cards: [{asset: 'img:network.jpg', label: 'A', atWord: 1}, {asset: 'img:server.jpg', label: 'B', atWord: 2}]}},
    max: {photoStack: {cards: [
      {asset: 'img:server-racks.jpg', label: 'Q1 revenue snapshot report', color: 'blue', atWord: 1}, {asset: 'img:network.jpg', label: 'Network topology overview', color: 'purple', atWord: 2},
      {asset: 'img:datacenter.jpg', label: 'Facility floor plan detail', color: 'green', atWord: 3}, {asset: 'img:server.jpg', label: 'Rack elevation diagram', color: 'orange', atWord: 4},
      {asset: 'img:network.jpg', label: 'Cabling schematic layout', color: 'red', atWord: 5}]}},
  },
  CAROUSEL: {
    min: {carousel: {items: [{label: 'One', sub: 'first', asset: 'lucide:box', color: 'blue'}, {label: 'Two', sub: 'second', asset: 'lucide:star', color: 'green'}], atWord: 1}},
    max: {carousel: {atWord: 1, items: [
      {label: 'Ingestion layer', sub: 'collect raw events', asset: 'lucide:download', color: 'blue'}, {label: 'Processing core', sub: 'transform + enrich', asset: 'lucide:cpu', color: 'purple'},
      {label: 'Storage engine', sub: 'durable persistence', asset: 'lucide:database', color: 'green'}, {label: 'Analytics suite', sub: 'query + aggregate', asset: 'lucide:bar-chart', color: 'orange'},
      {label: 'Delivery layer', sub: 'serve + cache', asset: 'lucide:send', color: 'red'}, {label: 'Monitoring hub', sub: 'observe + alert', asset: 'lucide:activity', color: 'yellow'},
      {label: 'Security gate', sub: 'authn + authz', asset: 'lucide:shield', color: 'blue'}, {label: 'Governance API', sub: 'policy + audit', asset: 'lucide:scale', color: 'purple'}]}},
  },
  COMPARISON_SLIDER: {
    min: {comparison: {before: {label: 'Before', color: 'red'}, after: {label: 'After', color: 'green'}, atWord: 1}},
    max: {comparison: {atWord: 1,
      before: {asset: 'img:network.jpg', label: 'Legacy design', caption: 'thirty-char caption at cap', color: 'red'},
      after: {asset: 'img:server-racks.jpg', label: 'Refreshed build', caption: 'thirty-char caption at cap', color: 'green'}}},
  },
  FLIP_CARD: {
    min: {flip: {front: {label: 'Myth', text: 'a short myth'}, back: {label: 'Fact', text: 'the real fact'}, atWord: 1}},
    max: {flip: {atWord: 1,
      front: {label: 'The common myth here', text: 'Front-face text stressed right up to the eighty character contract cap!', color: 'red'},
      back: {label: 'The actual fact now', text: 'Back-face text also pushed up to the eighty character contract cap here', color: 'green'}}},
  },
  SOUND_WAVE: {
    min: {wave: {label: 'audio', color: 'purple', atWord: 1}},
    max: {headline: 'Now [listen] closely.', wave: {label: 'episode twelve podcast', color: 'purple', bars: 40, atWord: 1}},
  },
  LOGO_REVEAL: {
    min: {logo: {name: 'ACME', asset: 'lucide:hexagon', color: 'blue', atWord: 1}},
    max: {logo: {name: 'ACME Intelligence Inc', tagline: 'shipping intelligence at scale everyday', asset: 'lucide:hexagon', color: 'blue', atWord: 1}},
  },
  LOCATION_MAP: {
    min: {locationMap: {location: 'Berlin', coordinates: '52.52 N', status: 'Live', color: 'green', atWord: 1}},
    max: {locationMap: {location: 'San Francisco California USA', coordinates: '37.7749 N, 122.4194 W approx', status: 'Streaming', color: 'green', atWord: 1}},
  },
  ACTIVITY_CARD: {
    min: {activity: {title: 'Activity', value: '21h', color: 'blue', trendColor: 'green', atWord: 1, data: [{day: 'M', value: 8}, {day: 'T', value: 12}, {day: 'W', value: 9}]}},
    max: {activity: {title: 'Weekly active minutes', value: '128.5h', trend: '+42% versus the prior week now', range: 'Last 9 days', color: 'blue', trendColor: 'green', atWord: 1, data: [
      {day: 'Mon', value: 82}, {day: 'Tue', value: 120}, {day: 'Wed', value: 95}, {day: 'Thu', value: 44}, {day: 'Fri', value: 140}, {day: 'Sat', value: 61}, {day: 'Sun', value: 33}, {day: 'M+7', value: 108}, {day: 'T+7', value: 127}]}},
  },
  CHAT_MOCKUP: {
    min: {source: 'illustrative', panelLabel: 'AI', messages: [{from: 'user', text: 'What is my refund window?', atWord: 1}, {from: 'agent', text: 'Thirty days.', atWord: 2}]},
    max: {source: 'illustrative', headline: 'Confident, instant \u2014 [and wrong.]', headlineColor: 'red', panelLabel: 'AI SUPPORT AGENT', panelColor: 'purple', messages: [
      {from: 'user', text: 'How long do I have to request a refund on my recent order?', atWord: 1},
      {from: 'agent', text: 'You have thirty days from the delivery date to request a refund.', color: 'purple', atWord: 2},
      {from: 'user', text: 'That does not match the policy document you were given.', atWord: 3},
      {from: 'agent', text: "You're right \u2014 the file says fourteen days. I never opened it.", color: 'red', atWord: 4}]},
  },

  // ── FAMILY G · ground-zero (BITS/MEMORY/PACKET/NUMBER_BASE/POINTER_DIAGRAM/
  // ENCRYPTION/BOOLEAN_LOGIC_GATES/HASH_FUNCTION/SORTING_VISUAL/CLOCK_SIGNAL/QUEUE/
  // CALL_STACK) — MAX pushed to the lint caps (labels at char limit, max cells/hops/
  // gates/frames), MIN at the sparsest legal shape. ──
  BITS: {
    min: {bits: {value: 5, bits: 4, color: 'blue'}},
    max: {bits: {value: 54235, bits: 16, label: 'One byte with place values shown', color: 'green'}},
  },
  MEMORY: {
    min: {memory: {cells: [{addr: '0x00', value: '00'}, {addr: '0x01', value: 'FF'}], color: 'blue'}},
    max: {memory: {label: 'Addressable memory cells with a pointer', pointerLabel: 'PTR→0x1F', color: 'purple', cols: 4, highlight: 6,
      cells: Array.from({length: 12}, (_, i) => ({addr: '0x' + (i * 4).toString(16).toUpperCase().padStart(2, '0'), value: ((i * 37) & 0xff).toString(16).toUpperCase().padStart(2, '0'), color: i === 6 ? 'red' : undefined}))}},
  },
  PACKET: {
    min: {packet: {hops: [{label: 'client'}, {label: 'server'}], color: 'blue'}},
    max: {packet: {packetLabel: 'GET /index.html HTTP/1.1', color: 'orange', hops: [
      {label: 'client-browser-1'}, {label: 'edge-cdn-node-01'}, {label: 'core-switch-fabric'}, {label: 'origin-load-bal'}, {label: 'app-server-pool', color: 'red'}]}},
  },
  NUMBER_BASE: {
    min: {numberBase: {value: 5, color: 'blue'}},
    max: {numberBase: {value: 65535, label: 'Max sixteen bit integer', color: 'purple'}},
  },
  POINTER_DIAGRAM: {
    min: {pointers: {headLabel: 'head', nodes: [{label: 'a', value: '1', next: 1}, {label: 'b', value: '2'}], color: 'blue'}},
    max: {pointers: {headLabel: 'head pointer', color: 'green', nodes: [
      {label: 'node-alpha', value: '0xFF0011', next: 1}, {label: 'node-bravo', value: '0xFF0022', next: 2},
      {label: 'node-charl', value: '0xFF0033', next: 3}, {label: 'node-delta', value: '0xFF0044', next: 4},
      {label: 'node-echo0', value: '0xFF0055', next: 5}, {label: 'node-final', value: '0xFF0066', color: 'red'}]}},
  },
  ENCRYPTION: {
    min: {encryption: {plaintext: 'hi', ciphertext: 'X9#mK2', keyLabel: 'key', mode: 'encrypt', color: 'blue'}},
    max: {encryption: {plaintext: 'attack at dawn tomorrow!', ciphertext: 'Xj9#mK2$pL7@qR4!vB6&nH1%wE8^tC3*yU5)zA0(', keyLabel: 'AES-256-GCM session', mode: 'encrypt', color: 'green'}},
  },
  BOOLEAN_LOGIC_GATES: {
    min: {logic: {gates: [{type: 'AND', a: 1, b: 0, label: 'AND'}], color: 'blue'}},
    max: {logic: {color: 'green', gates: [
      {type: 'AND', a: 1, b: 1, label: 'carry gate'}, {type: 'XOR', a: 1, b: 0, label: 'sum gate'},
      {type: 'NAND', a: 0, b: 1, label: 'latch set'}, {type: 'NOR', a: 0, b: 0, label: 'latch reset'}]}},
  },
  HASH_FUNCTION: {
    min: {hash: {input: 'hi', algo: 'MD5', digest: '49f68a5c8493ec2c0bf489821c21fc3b', color: 'blue'}},
    max: {hash: {input: 'hello world example okay', algo: 'SHA-256', digest: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824', color: 'purple'}},
  },
  SORTING_VISUAL: {
    min: {sort: {values: [5, 2, 8], label: 'Sort three', color: 'blue'}},
    max: {sort: {values: [42, 17, 88, 3, 61, 29, 74, 9, 53, 96, 21, 68], label: 'Unsorted to sorted', color: 'green'}},
  },
  CLOCK_SIGNAL: {
    min: {clock: {cycles: 3, label: 'Three cycles', color: 'blue'}},
    max: {clock: {cycles: 8, label: 'Rising edge triggers', color: 'orange'}},
  },
  QUEUE: {
    min: {queue: {items: [{label: 'A'}, {label: 'B'}], frontLabel: 'front', backLabel: 'back', color: 'blue'}},
    max: {queue: {frontLabel: 'front (dequeue)', backLabel: 'back (enqueue)', color: 'green', items: [
      {label: 'job-01'}, {label: 'job-02'}, {label: 'job-03'}, {label: 'job-04'}, {label: 'job-05'}, {label: 'job-06'}, {label: 'job-07', color: 'red'}]}},
  },
  CALL_STACK: {
    min: {callStack: {mode: 'stack', frames: [{fn: 'main()', sub: 'entry point'}, {fn: 'run()', sub: 'top of stack'}], color: 'blue'}},
    max: {callStack: {mode: 'stack', color: 'purple', frames: [
      {fn: 'main(argc, argv)', sub: 'program entry point'}, {fn: 'parseConfiguration()', sub: 'read the config from disk'},
      {fn: 'connectToDatabasePool()', sub: 'open the connection pool'}, {fn: 'runMigrationBatchNow()', sub: 'apply pending migrations'},
      {fn: 'executeSingleStatement()', sub: 'run one SQL statement here'}, {fn: 'raiseUnhandledException()', sub: 'top frame — throws here', color: 'red'}]}},
  },
  TEST_RUNNER: {
    min: {testRunner: {headline: 'A tiny [suite]', color: 'green', passed: 1, failed: 0, nodes: [
      {name: 'auth', depth: 0, kind: 'describe'},
      {name: 'logs in', depth: 1, kind: 'it', status: 'pass', ms: '3ms'}]}},
    max: {testRunner: {headline: HEAD, color: 'green', passed: 5, failed: 1, failIndex: 5,
      expected: 'account locked after five failed attempts', actual: 'account still active and unlocked here',
      nodes: [
        {name: 'authentication and session lifecycle', depth: 0, kind: 'describe'},
        {name: 'accepts a valid username + password', depth: 1, kind: 'it', status: 'pass', ms: '124ms'},
        {name: 'rejects an incorrect password', depth: 1, kind: 'it', status: 'pass', ms: '88ms'},
        {name: 'rate limiting on repeated logins', depth: 1, kind: 'describe'},
        {name: 'locks account after five failed tries', depth: 2, kind: 'it', status: 'fail', ms: '312ms'},
        {name: 'resets counter after a cooldown', depth: 2, kind: 'it', status: 'skip'},
        {name: 'audit logging of security events', depth: 1, kind: 'it', status: 'run', ms: '—'},
        {name: 'writes an entry for every lockout event', depth: 3, kind: 'it', status: 'pass', ms: '9ms'}]}},
  },
  TEST_MATRIX: {
    min: {testMatrix: {headline: 'A small [grid]', color: 'blue', rows: ['Chrome', 'Safari'], cols: ['Login', 'Pay'],
      cells: [{r: 0, c: 0, status: 'pass'}, {r: 0, c: 1, status: 'pass'}, {r: 1, c: 0, status: 'pass'}, {r: 1, c: 1, status: 'fail'}]}},
    max: {testMatrix: {headline: HEAD, color: 'blue', emphasize: {r: 2, c: 3},
      rows: ['Chrome 129', 'Firefox 131', 'Safari 18.1', 'Edge 129', 'Mobile WK'],
      cols: ['Sign in', 'Search', 'Cart', 'Checkout', 'Refund'],
      cells: (() => {const st = ['pass', 'pass', 'pass', 'flaky', 'fail']; const out = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) out.push({r, c, status: st[(r + c) % 5]}); return out;})()}},
  },
  CONTEXT_METER: {
    min: {context: {headline: 'A small [window]', windowTokens: 8000, verdict: '4k / 8k used', segments: [
      {label: 'system', tokens: 2000, kind: 'system'}, {label: 'free', tokens: 6000, kind: 'free'}]}},
    max: {context: {headline: HEAD, windowTokens: 1000000, verdict: '812k of 1,000k tokens already consumed',
      segments: [
        {label: 'system prompt xx', tokens: 24000, kind: 'system'},
        {label: 'tool definitions', tokens: 96000, kind: 'tools'},
        {label: 'recalled history', tokens: 512000, kind: 'history'},
        {label: 'retrieved chunks', tokens: 180000, kind: 'history'},
        {label: 'remaining space', tokens: 188000, kind: 'free'}]}},
  },
  AGENT_HARNESS: {
    min: {harness: {headline: 'A bare [agent]', agent: 'LLM', color: 'blue', rings: [
      {label: 'Information', chips: ['memory']}, {label: 'Execution', chips: ['tools']}]}},
    // MAX at the (Program-3-tightened) cap: 3 rings × 2 chips, long labels, guardrail on the OUTER ring.
    max: {harness: {headline: HEAD, agent: 'orchestrator', color: 'blue',
      rings: [
        {label: 'Information xxx', chips: ['retrieval', 'memory store']},
        {label: 'Execution core', chips: ['code sandbox', 'shell tools']},
        {label: 'Feedback loop', chips: ['evaluators', 'guardrails']}],
      guardrail: {label: 'rm -rf / --no-root', ring: 2, reason: 'blocked by safety policy'}}},
  },
  KNOWLEDGE_GRAPH: {
    min: {kg: {headline: 'A tiny [graph]', color: 'blue', seed: 1, queryPath: ['a', 'b'],
      nodes: [{id: 'a', label: 'Ada', kind: 'entity'}, {id: 'b', label: 'Person', kind: 'class'}],
      edges: [{from: 'a', to: 'b', label: 'is a'}]}},
    // radial fit + vertical reflow stress: 10 nodes (7 render vertical), 12 edges, long labels.
    max: {kg: {headline: HEAD, color: 'blue', seed: 7, queryPath: ['ada', 'analyticalengine', 'computing'],
      nodes: [
        {id: 'ada', label: 'Ada Lovelace xx', kind: 'entity'},
        {id: 'person', label: 'Person (class)', kind: 'class'},
        {id: 'london', label: 'London, England', kind: 'entity'},
        {id: 'y1815', label: '10 Dec 1815', kind: 'literal'},
        {id: 'ae', label: 'Analytical Engine', kind: 'entity'},
        {id: 'cs', label: 'Computer Science', kind: 'class'},
        {id: 'babbage', label: 'Charles Babbage', kind: 'entity'},
        {id: 'note', label: 'Note G (program)', kind: 'literal'},
        {id: 'poet', label: 'Lord Byron xxx', kind: 'entity'},
        {id: 'math', label: 'Mathematics', kind: 'class'}],
      edges: [
        {from: 'ada', to: 'person', label: 'is a'}, {from: 'ada', to: 'london', label: 'born in'},
        {from: 'ada', to: 'y1815', label: 'born on'}, {from: 'ada', to: 'ae', label: 'worked on'},
        {from: 'ae', to: 'cs', label: 'foundational to'}, {from: 'babbage', to: 'ae', label: 'designed'},
        {from: 'ada', to: 'note', label: 'wrote'}, {from: 'poet', to: 'ada', label: 'father of'},
        {from: 'ada', to: 'math', label: 'studied'}, {from: 'babbage', to: 'person', label: 'is a'},
        {from: 'note', to: 'ae', label: 'runs on'}, {from: 'cs', to: 'math', label: 'branch of'}]}},
  },
  RETRIEVAL_RANK: {
    min: {retrieval: {headline: 'A short [rank]', color: 'blue', rerankAtWord: 3, fuseAtWord: 5, chunks: [
      {label: 'Doc A', scoreA: 0.7, scoreFinal: 0.9, vec: 0.6, bm25: 0.8},
      {label: 'Doc B', scoreA: 0.8, scoreFinal: 0.6, vec: 0.5, bm25: 0.7}]}},
    max: {retrieval: {headline: HEAD, color: 'blue', rerankAtWord: 3, fuseAtWord: 5, chunks: [
      {label: 'Doc A — enterprise pricing and add-ons', scoreA: 0.72, scoreFinal: 0.91, vec: 0.68, bm25: 0.80},
      {label: 'Doc B — refund and cancellation policy', scoreA: 0.81, scoreFinal: 0.62, vec: 0.55, bm25: 0.70},
      {label: 'Doc C — service level agreement terms', scoreA: 0.64, scoreFinal: 0.78, vec: 0.72, bm25: 0.60},
      {label: 'Doc D — data processing and privacy dpa', scoreA: 0.59, scoreFinal: 0.70, vec: 0.61, bm25: 0.58},
      {label: 'Doc E — onboarding and migration guide', scoreA: 0.66, scoreFinal: 0.55, vec: 0.50, bm25: 0.64},
      {label: 'Doc F — regions and data residency map', scoreA: 0.52, scoreFinal: 0.48, vec: 0.44, bm25: 0.53}]}},
  },
  MODEL_STAGES: {
    min: {modelStages: {headline: 'A short [ladder]', prompt: 'Say hi.', color: 'purple', stages: [
      {label: 'Pre-train', method: 'raw', reply: 'hi hi hi hi hi'},
      {label: 'RLHF', method: 'aligned', reply: 'Hello! How can I help you today?'}]}},
    max: {modelStages: {headline: HEAD, prompt: 'Write a short haiku about the deep and restless sea today.', color: 'purple',
      stages: [
        {label: 'Pre-training xx', method: 'raw text', reply: 'and the sea and the sea and the sea and'},
        {label: 'Supervised FT', method: 'supervised', reply: 'Blue waves meet the shore at quiet dawn'},
        {label: 'RLHF alignment', method: 'aligned rl', reply: 'Of course — here is your ocean haiku'},
        {label: 'Tool-use tune', method: 'tools rl', reply: 'I searched and drafted three haiku'}]}},
  },
  CONFIDENCE_GATE: {
    min: {confidence: {headline: 'A quick [gate]', value: 82, threshold: 70, mode: 'pass', style: 'linear', color: 'green'}},
    max: {confidence: {headline: HEAD, value: 41, threshold: 70, mode: 'block', style: 'linear',
      reason: 'insufficient grounding evidence', color: 'red'}},
    // gauge style is a distinct layout — a second MAX scene covers it
    maxGauge: {confidence: {headline: 'The gauge [confidence] gate at the very limit', value: 63, threshold: 70,
      mode: 'block', style: 'gauge', reason: 'below the decision threshold', color: 'orange'}},
  },
  SANDBOX_BOX: {
    min: {sandbox: {headline: 'A small [box]', label: 'sandbox', color: 'orange', allowed: ['read file'], blocked: ['rm -rf /']}},
    max: {sandbox: {headline: HEAD, label: 'restricted sandbox', color: 'orange',
      allowed: ['read local file', 'fetch https api', 'query database'],
      blocked: ['rm -rf / --root', 'spawn a subshell', 'open raw socket']}},
  },
  DRILL_IN: {
    min: {drillIn: {headline: 'A small [drill]', color: 'blue', focusId: 'api', pushAtWord: 3,
      overview: {layout: 'flow', direction: 'horizontal', nodes: [{id: 'client', label: 'Client'}, {id: 'api', label: 'API'}], edges: [{from: 'client', to: 'api'}]},
      detail: {layout: 'flow', direction: 'horizontal', nodes: [{id: 'router', label: 'Router'}, {id: 'handler', label: 'Handler'}], edges: [{from: 'router', to: 'handler'}]}}},
    max: {drillIn: {headline: HEAD, color: 'blue', focusId: 'api', pushAtWord: 3,
      overview: {layout: 'flow', direction: 'horizontal', nodes: [
        {id: 'client', label: 'Web Client'}, {id: 'cdn', label: 'CDN Edge'}, {id: 'lb', label: 'Load Balancer'},
        {id: 'api', label: 'API Gateway', color: 'blue'}, {id: 'cache', label: 'Redis Cache'},
        {id: 'db', label: 'Postgres DB'}, {id: 'queue', label: 'Job Queue'}, {id: 'worker', label: 'Worker Pool'}],
        edges: [{from: 'client', to: 'cdn'}, {from: 'cdn', to: 'lb'}, {from: 'lb', to: 'api'}, {from: 'api', to: 'cache'}, {from: 'api', to: 'db'}, {from: 'api', to: 'queue'}, {from: 'queue', to: 'worker'}]},
      detail: {layout: 'flow', direction: 'horizontal', nodes: [
        {id: 'router', label: 'Router'}, {id: 'auth', label: 'Auth Middleware', color: 'purple'},
        {id: 'valid', label: 'Validator'}, {id: 'handler', label: 'Handler', color: 'green'},
        {id: 'orm', label: 'ORM Layer'}, {id: 'pool', label: 'Conn Pool'}],
        edges: [{from: 'router', to: 'auth'}, {from: 'auth', to: 'valid'}, {from: 'valid', to: 'handler'}, {from: 'handler', to: 'orm'}, {from: 'orm', to: 'pool'}]}}},
  },
  EVAL_DASHBOARD: {
    min: {evalDash: {headline: 'A short [eval]', metrics: [
      {label: 'Accuracy', value: 94, target: 90, unit: '%', color: 'green'},
      {label: 'Latency', value: 72, target: 80, degrading: true}]}},
    max: {evalDash: {headline: HEAD, metrics: [
      {label: 'Answer accuracy xx', value: 94, target: 90, unit: '%', color: 'green'},
      {label: 'Faithfulness score', value: 88, target: 85, unit: '%', color: 'blue'},
      {label: 'Latency p95 (ms)', value: 72, target: 80, degrading: true},
      {label: 'Cost per query xx', value: 63, target: 70, color: 'purple'}]}},
  },

  // ── FAMILY C · charts (MAX = maximum data density) ──────────────────────
  DONUT: {
    min: {headline: 'A tiny [donut]', donut: {segments: [{label: 'Yes', value: 70, color: 'green'}, {label: 'No', value: 30, color: 'red'}], centerValue: '70%', centerLabel: 'yes'}, source: 'illustrative'},
    max: {headline: HEAD, donut: {segments: [
      {label: 'Retrieval layer', value: 26, color: 'blue'}, {label: 'Generation core', value: 22, color: 'purple'},
      {label: 'Overhead & misc', value: 18, color: 'orange'}, {label: 'Network egress x', value: 14, color: 'green'},
      {label: 'Cold-start init', value: 12, color: 'yellow'}, {label: 'Logging & trace', value: 8, color: 'red'}],
      centerValue: '1.2M', centerLabel: 'total tokens'}, source: 'illustrative demo data at the cap'},
    maxPie: {headline: 'The pie [variant] pushed to the six-slice limit', donut: {variant: 'pie', segments: [
      {label: 'North America xx', value: 34, color: 'blue'}, {label: 'Europe (EMEA)', value: 26, color: 'purple'},
      {label: 'Asia Pacific xx', value: 20, color: 'green'}, {label: 'Latin America', value: 10, color: 'orange'},
      {label: 'Middle East xx', value: 6, color: 'yellow'}, {label: 'Africa region', value: 4, color: 'red'}]}, source: 'illustrative'},
  },
  PROGRESS: {
    min: {headline: 'A tiny [ring]', progress: {variant: 'ring', items: [{label: 'Coverage', value: 64, display: '64%', color: 'blue'}]}, source: 'illustrative'},
    max: {headline: HEAD, progress: {variant: 'ring', items: [
      {label: 'Retrieval accuracy', value: 92, display: '92%', color: 'green'},
      {label: 'Latency budget xxx', value: 80, display: '80%', color: 'blue'},
      {label: 'Cost efficiency xx', value: 74, display: '74%', color: 'orange'},
      {label: 'Coverage of tests', value: 61, display: '61%', color: 'purple'}]}, source: 'illustrative'},
    maxBar: {headline: 'The bar [variant] with four full-width rows here', progress: {variant: 'bar', items: [
      {label: 'Retrieval accuracy', value: 92, display: '92%', color: 'green'},
      {label: 'Latency budget xxx', value: 80, display: '80%', color: 'blue'},
      {label: 'Cost efficiency xx', value: 74, display: '74%', color: 'orange'},
      {label: 'Coverage of tests', value: 61, display: '61%', color: 'purple'}]}, source: 'illustrative'},
  },
  LINE_CHART: {
    min: {headline: 'A tiny [line]', lineChart: {series: [{label: 'Users', color: 'blue', values: [12, 20, 34]}], xAxis: ['Q1', 'Q2', 'Q3'], yMax: 40}, source: 'illustrative'},
    max: {headline: HEAD, lineChart: {area: true, xAxis: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'], yMax: 100, series: [
      {label: 'Active users', color: 'green', values: [12, 20, 34, 45, 58, 66, 78, 88]},
      {label: 'Churn rate x', color: 'red', values: [40, 36, 30, 26, 22, 19, 15, 11]},
      {label: 'Revenue $M', color: 'blue', values: [8, 14, 22, 30, 41, 52, 64, 79]}]}, source: 'illustrative dense series at the cap'},
    maxForecast: {headline: 'A [forecast] with history solid, future dashed band', lineChart: {forecastFrom: 5, bandPct: 0.22, nowLabel: 'now', xAxis: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'], yMax: 120, series: [{label: 'Growth', color: 'blue', values: [12, 22, 34, 50, 68, 84, 100, 116]}]}, source: 'illustrative'},
  },
  BAR_COMPARE: {
    min: {headline: 'A tiny [bar] pair', bars: [{label: 'Before', sub: 'baseline', value: 42, display: '42', color: 'red'}, {label: 'After', sub: 'optimised', value: 88, display: '88', color: 'green'}], maxValue: 100, source: 'illustrative'},
    max: {headline: HEAD, bars: [
      {label: 'Open model 397B', sub: 'open weights xx', value: 82.4, display: '82.4', color: 'orange'},
      {label: 'Closed flagship', sub: 'prior leader x', value: 80.8, display: '80.8', color: 'blue'},
      {label: 'Prev-gen model x', sub: 'last year xxxx', value: 71.2, display: '71.2', color: 'purple'},
      {label: 'Baseline system', sub: 'reference xxxx', value: 63.5, display: '63.5', color: 'red'}], maxValue: 100, source: 'illustrative benchmark at the cap'},
  },
  STAT_PANELS: {
    min: {headline: 'A tiny [stat] pair', stats: [{kicker: 'UPTIME', value: '99.9%', note: 'this month', color: 'green'}, {kicker: 'ERRORS', value: '12', note: 'down 40%', color: 'blue'}], source: 'illustrative demo data'},
    max: {headline: HEAD, stats: [
      {kicker: 'ANSWER QUALITY', value: '↓ 34%', note: 'degraded on long context', color: 'red'},
      {kicker: 'TOKEN COST', value: '18×', note: 'burned per query', color: 'yellow'},
      {kicker: 'LATENCY P95', value: '2.4 s', note: 'slower than budget', color: 'orange'},
      {kicker: 'MONTHLY SPEND', value: '$14.2k', note: 'well over budget', color: 'purple'}],
      verdict: {text: 'selective, routed retrieval wins', color: 'green'}, source: 'illustrative four-panel stat wall at the cap'},
  },
  QUADRANT: {
    min: {headline: 'A tiny [quadrant]', quadrant: {xAxis: {left: 'Hard', right: 'Easy'}, yAxis: {top: 'High value', bottom: 'Low value'}, points: [{label: 'Quick win', x: 0.8, y: 0.8, color: 'green'}, {label: 'Money pit', x: 0.2, y: 0.2, color: 'red'}]}, source: 'illustrative'},
    max: {headline: HEAD, quadrant: {xAxis: {left: 'Hard to build', right: 'Easy to build'}, yAxis: {top: 'High value', bottom: 'Low value'}, points: [
      {label: 'RAG pipeline xx', x: 0.72, y: 0.82, color: 'green'}, {label: 'Prompt tuning', x: 0.88, y: 0.6, color: 'blue'},
      {label: 'Fine-tuning xx', x: 0.28, y: 0.44, color: 'orange'}, {label: 'Distillation', x: 0.35, y: 0.7, color: 'purple'},
      {label: 'Quantization', x: 0.8, y: 0.3, color: 'yellow'}, {label: 'Speculative', x: 0.18, y: 0.24, color: 'red'}]}, source: 'illustrative six-point map at the cap'},
  },
  TIMELINE: {
    min: {headline: 'A tiny [timeline]', timeline: {milestones: [{date: 'MAR', title: 'Prototype', color: 'blue'}, {date: 'JUL', title: 'GA', color: 'green'}]}, source: 'illustrative'},
    max: {headline: HEAD, timeline: {milestones: [
      {date: 'Q1 2025', title: 'Prototype build', sub: 'internal spike, two devs', color: 'blue'},
      {date: 'Q2 2025', title: 'Private beta xx', sub: 'ten design partners on', color: 'purple'},
      {date: 'Q3 2025', title: 'Public preview', sub: 'waitlist opens to all x', color: 'orange'},
      {date: 'Q4 2025', title: 'General avail.', sub: 'SLA-backed, paid tiers', color: 'green'},
      {date: 'Q1 2026', title: 'Enterprise GA', sub: 'SSO, audit, residency x', color: 'blue'}]}, source: 'illustrative five-milestone track at the cap'},
  },

  // ── FAMILY D · diagram-flow (radial/seeded: DIAGRAM engine's 5 layouts) ──
  DIAGRAM: {
    min: {headline: 'A tiny [flow]', headlineColor: 'blue', diagram: {layout: 'flow', direction: 'horizontal', nodes: [{id: 'a', label: 'Input', asset: 'lucide:type'}, {id: 'b', label: 'Output', asset: 'lucide:sparkles', color: 'green'}], edges: [{from: 'a', to: 'b', label: 'run'}]}},
    maxFlow: {headline: HEAD, headlineColor: 'blue', diagram: {layout: 'flow', direction: 'horizontal', nodes: [
      {id: 'a', label: 'Ingest source', sub: 'raw documents', asset: 'lucide:download', color: 'blue'},
      {id: 'b', label: 'Chunk & clean', sub: 'split + normalise', asset: 'lucide:scissors', color: 'purple'},
      {id: 'c', label: 'Embed vectors', sub: 'to the index', asset: 'lucide:brain-circuit', color: 'green'},
      {id: 'd', label: 'Retrieve top-k', sub: 'by similarity', asset: 'lucide:search', color: 'orange'},
      {id: 'e', label: 'Rerank hits', sub: 'cross-encoder', asset: 'lucide:list-filter', color: 'yellow'},
      {id: 'f', label: 'Generate reply', sub: 'grounded answer', asset: 'lucide:sparkles', color: 'green'}],
      edges: [{from: 'a', to: 'b'}, {from: 'b', to: 'c'}, {from: 'c', to: 'd'}, {from: 'd', to: 'e'}, {from: 'e', to: 'f'}]}},
    maxHub: {headline: 'The [hub] layout with a full spoke count ok', headlineColor: 'purple', diagram: {layout: 'hub', nodes: [
      {id: 'core', label: 'Orchestrator', sub: 'the planner', asset: 'lucide:cpu', color: 'purple'},
      {id: 's1', label: 'Researcher', asset: 'lucide:search', color: 'blue'}, {id: 's2', label: 'Coder', asset: 'lucide:code', color: 'green'},
      {id: 's3', label: 'Critic', asset: 'lucide:shield', color: 'orange'}, {id: 's4', label: 'Retriever', asset: 'lucide:database', color: 'yellow'},
      {id: 's5', label: 'Summariser', asset: 'lucide:file-text', color: 'red'}, {id: 's6', label: 'Verifier', asset: 'lucide:check', color: 'blue'}],
      edges: [{from: 'core', to: 's1'}, {from: 'core', to: 's2'}, {from: 'core', to: 's3'}, {from: 'core', to: 's4'}, {from: 'core', to: 's5'}, {from: 'core', to: 's6'}]}},
    maxTree: {headline: 'The [tree] layout at the node cap here', headlineColor: 'green', diagram: {layout: 'tree', direction: 'vertical', nodes: [
      {id: 'root', label: 'Root request', asset: 'lucide:git-branch', color: 'blue'},
      {id: 'a', label: 'Auth service', asset: 'lucide:lock', color: 'purple'}, {id: 'b', label: 'Data service', asset: 'lucide:database', color: 'green'},
      {id: 'a1', label: 'Token check', color: 'purple'}, {id: 'a2', label: 'Role lookup', color: 'purple'},
      {id: 'b1', label: 'Cache read', color: 'green'}, {id: 'b2', label: 'DB query', color: 'green'}],
      edges: [{from: 'root', to: 'a'}, {from: 'root', to: 'b'}, {from: 'a', to: 'a1'}, {from: 'a', to: 'a2'}, {from: 'b', to: 'b1'}, {from: 'b', to: 'b2'}]}},
    maxSeq: {headline: 'The [sequence] layout with messages ok', headlineColor: 'orange', diagram: {layout: 'sequence', nodes: [
      {id: 'user', label: 'User', asset: 'lucide:user', color: 'blue'}, {id: 'app', label: 'App server', asset: 'lucide:server', color: 'green'}, {id: 'db', label: 'Database', asset: 'lucide:database', color: 'purple'}],
      edges: [{from: 'user', to: 'app', label: 'POST /order'}, {from: 'app', to: 'db', label: 'INSERT row'}, {from: 'db', to: 'app', label: 'ok, id=42'}, {from: 'app', to: 'user', label: '201 Created'}]}},
    maxBlock: {headline: 'The [block] grid layout at capacity', headlineColor: 'blue', diagram: {layout: 'block', nodes: [
      {id: 'lb', label: 'Load balancer', asset: 'lucide:network', color: 'blue'}, {id: 'w1', label: 'Web 1', asset: 'lucide:server', color: 'green'}, {id: 'w2', label: 'Web 2', asset: 'lucide:server', color: 'green'},
      {id: 'cache', label: 'Redis cache', asset: 'lucide:zap', color: 'orange'}, {id: 'db', label: 'Primary DB', asset: 'lucide:database', color: 'purple'}, {id: 'rep', label: 'Read replica', asset: 'lucide:database', color: 'purple'}],
      edges: [{from: 'lb', to: 'w1'}, {from: 'lb', to: 'w2'}, {from: 'w1', to: 'cache'}, {from: 'w2', to: 'cache'}, {from: 'w1', to: 'db'}, {from: 'db', to: 'rep'}]}},
  },
  CONCEPT_DIAGRAM: {
    min: {headline: 'Client and [server]', nodes: [{id: 'a', label: 'Client', asset: 'lucide:monitor'}, {id: 'b', label: 'Server', asset: 'lucide:server'}], edges: [{from: 'a', to: 'b'}]},
    max: {headline: HEAD, nodes: [
      {id: 'a', label: 'Browser client', asset: 'lucide:monitor'}, {id: 'b', label: 'API gateway', asset: 'lucide:network'},
      {id: 'c', label: 'App server', asset: 'lucide:server'}, {id: 'd', label: 'Database', asset: 'lucide:database'}],
      edges: [{from: 'a', to: 'b'}, {from: 'b', to: 'c'}, {from: 'c', to: 'd'}]},
  },
  STEP_FLOW: {
    min: {headline: 'Two [steps]', steps: [{kicker: 'STEP 1', title: 'DO THIS', sub: 'first thing'}, {kicker: 'STEP 2', title: 'THEN THAT', sub: 'second thing', color: 'green'}], source: 'illustrative'},
    max: {headline: HEAD, steps: [
      {kicker: 'STEP 1', title: 'DOCS', sub: 'everything you own'},
      {kicker: 'STEP 2', title: 'CHUNKS', sub: 'split into pieces'},
      {kicker: 'STEP 3', title: 'VECTORS', sub: 'embedded as numbers'},
      {kicker: 'STEP 4', title: 'INDEX', sub: 'stored for search', color: 'blue'},
      {kicker: 'STEP 5', title: 'RETRIEVE', sub: 'closest by meaning', color: 'green'}],
      caption: {text: 'ask → pull closest → answer', color: 'orange'}, source: 'illustrative five-step pipeline at the cap'},
  },
  SPLIT_PATHS: {
    min: {headline: 'Two [paths]', left: {title: 'Path A', badge: {text: 'simple', color: 'blue'}, lines: [{text: '✓ fast', color: 'green'}], color: 'green'}, center: {kicker: 'ROUTER', title: 'choose', color: 'purple'}, right: {title: 'Path B', badge: {text: 'complex', color: 'orange'}, lines: [{text: '✓ flexible', color: 'green'}], color: 'green'}, source: 'illustrative'},
    max: {headline: HEAD, left: {title: '"What is our refund window?"', badge: {text: 'canonical → facts', color: 'blue'}, lines: [{text: '✓ 14 days · policy linked', color: 'green'}, {text: 'exact, cited answer', color: 'blue'}], color: 'green'}, center: {kicker: 'SUPPORT AGENT', title: 'one router', color: 'purple'}, right: {title: '"Anyone hit this billing bug?"', badge: {text: 'open-ended → RAG', color: 'blue'}, lines: [{text: '40,000 tickets searched', color: 'blue'}, {text: '✓ 3 similar found', color: 'green'}], color: 'green'}, source: 'illustrative two-path router at the cap'},
  },
  LIST_BUILD: {
    min: {heading: 'Two ideas', items: [{icon: 'lucide:scissors', text: 'Tokenize', detail: 'split the text'}, {icon: 'lucide:sparkles', text: 'Predict', detail: 'the next token'}]},
    max: {heading: 'Five things that make retrieval work well', items: [
      {icon: 'lucide:scissors', text: 'Chunk documents at semantic boundaries', detail: 'not fixed windows'},
      {icon: 'lucide:brain-circuit', text: 'Embed with a domain-tuned model', detail: 'better recall'},
      {icon: 'lucide:search', text: 'Retrieve with hybrid vector plus keyword', detail: 'catches both'},
      {icon: 'lucide:list-filter', text: 'Rerank the candidates with a cross-encoder', detail: 'precision boost'},
      {icon: 'lucide:shield-check', text: 'Ground the answer and cite every source', detail: 'no hallucinations'}]},
  },

  // ── FAMILY I · data-cs (radial/seeded: STATE_MACHINE ring, EMBEDDING scatter, GIT graph) ──
  STATE_MACHINE: {
    min: {stateMachine: {headline: 'A tiny [FSM]', color: 'green', active: 1, states: [{label: 'Off', color: 'red'}, {label: 'On', color: 'green'}], transitions: [{from: 0, to: 1, label: 'flip'}, {from: 1, to: 0, label: 'flip'}]}},
    max: {stateMachine: {headline: HEAD, color: 'blue', active: 1, states: [
      {label: 'Idle', color: 'blue'}, {label: 'Loading', color: 'orange'}, {label: 'Success', color: 'green'}, {label: 'Error', color: 'red'}, {label: 'Retry', color: 'purple'}],
      transitions: [{from: 0, to: 1, label: 'fetch'}, {from: 1, to: 2, label: 'resolve'}, {from: 1, to: 3, label: 'reject'}, {from: 3, to: 4, label: 'retry'}, {from: 4, to: 1, label: 're-fetch'}, {from: 2, to: 0, label: 'reset'}, {from: 3, to: 0, label: 'give up'}]}},
    maxLifecycle: {stateMachine: {headline: 'A [lifecycle] line at the six-state cap', variant: 'lifecycle', color: 'orange', states: [
      {label: 'New', atWord: 1}, {label: 'Triaged', atWord: 1}, {label: 'In Progress', atWord: 1, color: 'blue'}, {label: 'Fixed', atWord: 1}, {label: 'Verified', atWord: 1}, {label: 'Closed', atWord: 1}],
      transitions: [{from: 0, to: 1}, {from: 1, to: 2}, {from: 2, to: 3}, {from: 3, to: 4}, {from: 4, to: 5}, {from: 4, to: 2, dashed: true, color: 'orange', label: 'reopen'}]}},
  },
  EMBEDDING_SPACE: {
    min: {embedding: {headline: 'A tiny [space]', color: 'blue', axisX: 'dim 1', axisY: 'dim 2', clusters: ['a', 'b'], points: [{label: 'cat', x: 0.2, y: 0.7, cluster: 0}, {label: 'gpu', x: 0.7, y: 0.3, cluster: 1}]}},
    max: {embedding: {headline: HEAD, color: 'blue', axisX: 'semantic dimension 1', axisY: 'semantic dimension 2', clusters: ['animals', 'royalty', 'technology', 'food & drink'], points: [
      {label: 'cat', x: 0.16, y: 0.72, cluster: 0}, {label: 'dog', x: 0.24, y: 0.8, cluster: 0}, {label: 'wolf', x: 0.12, y: 0.62, cluster: 0}, {label: 'fox', x: 0.2, y: 0.68, cluster: 0},
      {label: 'king', x: 0.72, y: 0.78, cluster: 1}, {label: 'queen', x: 0.8, y: 0.72, cluster: 1}, {label: 'throne', x: 0.68, y: 0.86, cluster: 1}, {label: 'crown', x: 0.78, y: 0.82, cluster: 1},
      {label: 'gpu', x: 0.5, y: 0.2, cluster: 2}, {label: 'server', x: 0.6, y: 0.28, cluster: 2}, {label: 'chip', x: 0.44, y: 0.14, cluster: 2}, {label: 'router', x: 0.56, y: 0.22, cluster: 2},
      {label: 'pizza', x: 0.32, y: 0.34, cluster: 3}, {label: 'sushi', x: 0.4, y: 0.4, cluster: 3}, {label: 'coffee', x: 0.28, y: 0.28, cluster: 3}, {label: 'bread', x: 0.36, y: 0.3, cluster: 3}]}},
  },
  GIT_BRANCH: {
    min: {git: {headline: 'A tiny [branch]', color: 'blue', lanes: ['main', 'feat'], commits: [{lane: 0, label: 'init'}, {lane: 1, label: 'work'}, {lane: 0, label: 'merge'}], links: [{from: 0, to: 1}, {from: 1, to: 2}]}},
    max: {git: {headline: HEAD, color: 'blue', lanes: ['main', 'feature', 'hotfix'], commits: [
      {lane: 0, label: 'init'}, {lane: 0, label: 'setup'}, {lane: 1, label: 'feat A'}, {lane: 1, label: 'feat B'}, {lane: 2, label: 'hotfix'}, {lane: 0, label: 'patch'}, {lane: 1, label: 'feat C'}, {lane: 0, label: 'release'}],
      links: [{from: 1, to: 2}, {from: 1, to: 4}, {from: 3, to: 6}, {from: 4, to: 5}, {from: 6, to: 7}]}},
  },
  TOKENIZER: {
    min: {tokenizer: {headline: 'A tiny [split]', color: 'blue', text: 'Hello world.', tokens: [{text: 'Hello', id: 15496}, {text: ' world', id: 995}]}},
    max: {tokenizer: {headline: HEAD, color: 'blue', showVectors: true, text: 'Tokenization maps every piece of text to integer ids.', tokens: [
      {text: 'Token', id: 15496}, {text: 'ization', id: 1634}, {text: ' maps', id: 34349}, {text: ' every', id: 790}, {text: ' piece', id: 6710}, {text: ' of', id: 286}, {text: ' text', id: 2420}, {text: ' to', id: 284}, {text: ' ids', id: 220}, {text: '.', id: 13}]}},
  },
  FILE_TREE: {
    min: {fileTree: {headline: 'A tiny [tree]', color: 'orange', highlight: 1, nodes: [{name: 'src', depth: 0, kind: 'folder'}, {name: 'index.ts', depth: 1, kind: 'file'}]}},
    max: {fileTree: {headline: HEAD, color: 'orange', highlight: 5, nodes: [
      {name: 'my-application', depth: 0, kind: 'folder'}, {name: 'src', depth: 1, kind: 'folder'}, {name: 'components', depth: 2, kind: 'folder'}, {name: 'Button', depth: 3, kind: 'folder'},
      {name: 'Button.tsx', depth: 4, kind: 'file', color: 'orange'}, {name: 'Button.test.tsx', depth: 4, kind: 'file'}, {name: 'index.ts', depth: 2, kind: 'file'}, {name: 'utils', depth: 2, kind: 'folder'},
      {name: 'format.ts', depth: 3, kind: 'file'}, {name: 'package.json', depth: 1, kind: 'file'}, {name: 'tsconfig.json', depth: 1, kind: 'file'}, {name: 'README.md', depth: 1, kind: 'file'}]}},
  },
  DATABASE_TABLE: {
    min: {database: {headline: 'A tiny [query]', tableName: 'users', query: 'WHERE id = 1', color: 'green', columns: ['id', 'name'], rows: [['1', 'Ada'], ['2', 'Linus']], highlight: [0]}},
    max: {database: {headline: HEAD, tableName: 'transactions', query: 'WHERE amount > 100 AND status = ok', color: 'green', columns: ['id', 'account', 'amount', 'status'], rows: [
      ['1001', 'acct_alpha', '$1,240.00', 'settled'], ['1002', 'acct_beta_x', '$88.50', 'pending'], ['1003', 'acct_gamma', '$4,300.10', 'settled'], ['1004', 'acct_delta', '$12.00', 'failed'], ['1005', 'acct_epsl', '$920.75', 'settled'], ['1006', 'acct_zeta_', '$305.20', 'settled']], highlight: [0, 2, 4, 5]}},
  },
  API_REQUEST_RESPONSE: {
    min: {api: {headline: 'A tiny [request]', color: 'blue', method: 'GET', path: '/ping', status: '200', statusText: 'OK', responseLines: ['{ "ok": true }']}},
    max: {api: {headline: HEAD, color: 'blue', method: 'POST', path: '/api/v2/orders/checkout', clientLabel: 'Mobile client', serverLabel: 'Orders service', requestLines: ['Authorization: Bearer …', 'Content-Type: app/json', '{ "cart": 42, "pay": 1 }'], status: '201', statusText: 'Created', responseLines: ['{ "orderId": "ord_8f2a",', '  "total": 128.40,', '  "status": "confirmed" }']}},
  },

  // ── FAMILY J · cloud-zone (tall tables + node-graphs — both recurring classes) ──
  CLOUD_ARCH: {
    min: {cloud: {headline: 'A tiny [region]', provider: 'aws', color: 'blue', boundaries: [{id: 'reg', label: 'us-east-1', kind: 'region'}], nodes: [{id: 'api', label: 'API', asset: 'lucide:server', boundary: 'reg', color: 'green'}], edges: []}},
    max: {cloud: {headline: HEAD, provider: 'aws', color: 'blue',
      boundaries: [{id: 'reg', label: 'us-east-1', kind: 'region'}, {id: 'vpc', label: 'vpc-prod', kind: 'vpc', parent: 'reg'}, {id: 'sn', label: 'subnet-private', kind: 'subnet', parent: 'vpc'}],
      nodes: [
        {id: 'cdn', label: 'CloudFront CDN', asset: 'lucide:globe', boundary: 'reg', color: 'blue'}, {id: 'alb', label: 'Load Balancer', asset: 'lucide:network', boundary: 'vpc', color: 'blue'},
        {id: 'api', label: 'API service', asset: 'lucide:server', boundary: 'sn', color: 'green'}, {id: 'worker', label: 'Worker pool', asset: 'lucide:cog', boundary: 'sn', color: 'green'},
        {id: 'cache', label: 'Redis cache', asset: 'lucide:zap', boundary: 'sn', color: 'orange'}, {id: 'db', label: 'Postgres', sub: 'arn:aws:rds:db-prod', asset: 'lucide:database', boundary: 'sn', color: 'purple'},
        {id: 'queue', label: 'SQS queue', asset: 'lucide:layers', boundary: 'vpc', color: 'yellow'}, {id: 's3', label: 'S3 bucket', asset: 'lucide:box', boundary: 'reg', color: 'red'}],
      edges: [{from: 'cdn', to: 'alb', label: 'HTTPS'}, {from: 'alb', to: 'api', label: 'REST'}, {from: 'api', to: 'db', label: 'SQL'}, {from: 'api', to: 'cache'}, {from: 'api', to: 'queue', label: 'enqueue'}, {from: 'queue', to: 'worker'}]}},
  },
  K8S_CLUSTER: {
    min: {k8s: {headline: 'A tiny [cluster]', mode: 'schedule', controlPlane: 'kube-apiserver', color: 'blue', nodes: [{label: 'node-1', pods: [{version: 'v1'}]}, {label: 'node-2', pods: [{version: 'v1'}]}]}},
    max: {k8s: {headline: HEAD, mode: 'rollout', controlPlane: 'kube-apiserver', color: 'green', nodes: [
      {label: 'worker-node-01', pods: [{version: 'v1'}, {version: 'v1'}, {version: 'v2'}, {version: 'v2'}, {version: 'v1'}, {version: 'v2'}]},
      {label: 'worker-node-02', pods: [{version: 'v1'}, {version: 'v2'}, {version: 'v1'}, {version: 'v2'}, {version: 'v1'}, {version: 'v2'}]},
      {label: 'worker-node-03', pods: [{version: 'v2'}, {version: 'v2'}, {version: 'v1'}, {version: 'v1'}]},
      {label: 'worker-node-04', pods: [{version: 'v1'}, {version: 'v2'}, {version: 'v2'}]}]}},
  },
  COST_METER: {
    min: {cost: {headline: 'A tiny [bill]', value: 800, budget: 1000, unit: '$', period: 'this month', color: 'green'}},
    max: {cost: {headline: HEAD, value: 14280, budget: 12000, unit: '$', period: 'this billing cycle', color: 'yellow'}},
  },
  SLO_GAUGE: {
    min: {slo: {headline: 'A tiny [SLO]', availability: 99.9, target: 99.5, budgetSpent: 0.3, period: '7-day window', color: 'green'}},
    max: {slo: {headline: HEAD, availability: 99.95, target: 99.9, budgetSpent: 0.62, period: '30-day rolling window', color: 'green'}},
  },
  IAC_PLAN: {
    min: {iac: {headline: 'A tiny [plan]', color: 'orange', rows: [{action: 'add', resource: 'aws_s3_bucket.assets', type: 's3'}, {action: 'destroy', resource: 'aws_instance.legacy', type: 'ec2'}]}},
    max: {iac: {headline: HEAD, color: 'orange', rows: [
      {action: 'add', resource: 'aws_s3_bucket.static_assets_bucket_prod', type: 's3'},
      {action: 'add', resource: 'aws_cloudfront_distribution.cdn_edge', type: 'cloudfront'},
      {action: 'change', resource: 'aws_iam_role.execution_role_for_lambda', type: 'iam'},
      {action: 'change', resource: 'aws_security_group.web_ingress_rules', type: 'security_group'},
      {action: 'destroy', resource: 'aws_instance.legacy_batch_worker_node', type: 'ec2'},
      {action: 'destroy', resource: 'aws_db_instance.old_replica_us_west', type: 'rds'},
      {action: 'noop', resource: 'aws_vpc.production_network_main', type: 'vpc'}]}},
  },
  ERD: {
    min: {erd: {headline: 'A tiny [schema]', color: 'blue', tables: [{id: 'u', name: 'users', color: 'blue', columns: [{name: 'id', type: 'uuid', key: 'pk'}, {name: 'email', type: 'text'}]}, {id: 'o', name: 'orders', color: 'green', columns: [{name: 'id', type: 'uuid', key: 'pk'}, {name: 'user_id', type: 'uuid', key: 'fk'}]}], relations: [{from: 'u', to: 'o', label: 'places', fromCard: '1', toCard: 'N'}]}},
    max: {erd: {headline: HEAD, color: 'blue', tables: [
      {id: 'users', name: 'users', color: 'blue', columns: [{name: 'id', type: 'uuid', key: 'pk'}, {name: 'email', type: 'text'}, {name: 'name', type: 'text'}, {name: 'created_at', type: 'timestamp'}]},
      {id: 'orders', name: 'orders', color: 'green', columns: [{name: 'id', type: 'uuid', key: 'pk'}, {name: 'user_id', type: 'uuid', key: 'fk'}, {name: 'total', type: 'numeric'}, {name: 'status', type: 'text'}]},
      {id: 'items', name: 'order_items', color: 'orange', columns: [{name: 'id', type: 'uuid', key: 'pk'}, {name: 'order_id', type: 'uuid', key: 'fk'}, {name: 'product_id', type: 'uuid', key: 'fk'}, {name: 'qty', type: 'int'}]},
      {id: 'products', name: 'products', color: 'purple', columns: [{name: 'id', type: 'uuid', key: 'pk'}, {name: 'sku', type: 'text'}, {name: 'price', type: 'numeric'}]}],
      relations: [{from: 'users', to: 'orders', label: 'places', fromCard: '1', toCard: 'N'}, {from: 'orders', to: 'items', label: 'contains', fromCard: '1', toCard: 'N'}, {from: 'products', to: 'items', label: 'in', fromCard: '1', toCard: 'N'}]}},
  },
  PROCESS_TABLE: {
    min: {proc: {headline: 'A tiny [top]', sortBy: 'cpu', color: 'blue', rows: [{pid: '1', name: 'systemd', cpu: 1, mem: 2}, {pid: '842', name: 'chrome', cpu: 22, mem: 34}]}},
    max: {proc: {headline: HEAD, sortBy: 'cpu', color: 'blue', rows: [
      {pid: '33901', name: 'ffmpeg transcode worker', cpu: 96, mem: 41, runaway: true},
      {pid: '8421', name: 'chrome --renderer', cpu: 42, mem: 34},
      {pid: '12037', name: 'node build-server.js', cpu: 28, mem: 22},
      {pid: '25170', name: 'postgres: writer process', cpu: 18, mem: 30},
      {pid: '3390', name: 'dockerd', cpu: 9, mem: 12},
      {pid: '1204', name: 'containerd-shim-runc', cpu: 4, mem: 6},
      {pid: '1', name: 'systemd', cpu: 1, mem: 2}]}},
  },
  KERNEL_BOUNDARY: {
    min: {kernel: {headline: 'A tiny [syscall]', userLabel: 'User space', kernelLabel: 'Kernel', syscall: 'read()', result: 'bytes', userChips: ['your app'], color: 'purple', steps: [{label: 'read disk'}]}},
    max: {kernel: {headline: HEAD, userLabel: 'User-space process', kernelLabel: 'Kernel space', syscall: 'read(fd, buf, n)', result: 'bytes copied', userChips: ['your app', 'libc', 'runtime'], color: 'purple', steps: [{label: 'check permissions'}, {label: 'locate inode block'}, {label: 'read from disk'}, {label: 'copy to user buffer'}]}},
  },

  // ── FAMILY H · systems-engine (tall stacks + radial + dense grids) ──
  PIPELINE: {
    min: {pipeline: {headline: 'A tiny [flow]', tokenLabel: 'job', color: 'blue', stages: [{label: 'Start', sub: 'begin'}, {label: 'End', sub: 'done', color: 'green'}]}},
    max: {pipeline: {headline: HEAD, tokenLabel: 'the instruction', color: 'blue', stages: [
      {label: 'Fetch', sub: 'read from cache', asset: 'lucide:download'}, {label: 'Decode', sub: 'read the opcode', asset: 'lucide:binary'},
      {label: 'Execute', sub: 'run the ALU', asset: 'lucide:cpu'}, {label: 'Memory', sub: 'load / store', asset: 'lucide:database'},
      {label: 'Write-back', sub: 'update register', asset: 'lucide:save'}, {label: 'Retire', sub: 'commit result', asset: 'lucide:check'}]}},
    maxCi: {pipeline: {headline: 'The [CI] run stressed to the stage cap here', variant: 'ci', color: 'blue', stages: [
      {label: 'Lint', status: 'pass', ms: '4.2 s'}, {label: 'Typecheck', status: 'pass', ms: '11 s'}, {label: 'Build', status: 'pass', ms: '38 s'},
      {label: 'Unit tests', status: 'fail', ms: '12 s', reason: 'expected 200, got 500 on /health check'}, {label: 'E2E tests', status: 'pending', ms: '--'}, {label: 'Deploy', status: 'pending', ms: '--'}]}},
    maxJourney: {pipeline: {headline: 'The [checkout] journey at the cap', variant: 'journey', color: 'green', tokenLabel: 'New user', stages: [
      {label: 'Login', badge: 'auth', status: 'pass'}, {label: 'Search', badge: 'search', status: 'pass'}, {label: 'Product', badge: 'catalog', status: 'pass'},
      {label: 'Add to cart', badge: 'cart', status: 'pass'}, {label: 'Checkout', badge: 'orders', status: 'pass'}, {label: 'Pay', badge: 'payments', status: 'fail', reason: 'gateway timeout after 30 seconds'}]}},
    maxBoot: {pipeline: {headline: 'The [boot] sequence rail at the cap', variant: 'boot', color: 'orange', stages: [
      {label: 'Firmware', ms: '120 ms', color: 'orange'}, {label: 'Bootloader', ms: '40 ms', color: 'orange'}, {label: 'Kernel', ms: '310 ms', color: 'blue'},
      {label: 'Init system', ms: '80 ms', color: 'blue'}, {label: 'Drivers', ms: '210 ms', color: 'blue'}, {label: 'Services', ms: '1.2 s', color: 'green'}]}},
  },
  LAYERED_STACK: {
    min: {stack: {headline: 'A tiny [stack]', signal: 'down', color: 'green', layers: [{label: 'App', sub: 'top'}, {label: 'Wire', sub: 'bottom', color: 'blue'}]}},
    max: {stack: {headline: HEAD, signal: 'down', color: 'green', layers: [
      {label: 'Application', sub: 'HTTP · DNS · TLS', color: 'green'}, {label: 'Presentation', sub: 'encoding · encryption', color: 'blue'},
      {label: 'Session', sub: 'connection state', color: 'purple'}, {label: 'Transport', sub: 'TCP · UDP ports', color: 'orange'},
      {label: 'Network', sub: 'IP addressing · routing', color: 'yellow'}, {label: 'Data link', sub: 'Ethernet · Wi-Fi MAC', color: 'red'},
      {label: 'Physical', sub: 'bits on the wire', color: 'blue'}]}},
    maxImage: {stack: {headline: 'The [image] build cache at the cap', variant: 'imageLayers', totalSize: '512 MB', color: 'blue', layers: [
      {label: 'FROM node:20-alpine', size: '142 MB', cached: true}, {label: 'RUN apk add build-base', size: '88 MB', cached: true},
      {label: 'COPY package.json .', size: '2 MB', cached: true}, {label: 'RUN npm ci', size: '210 MB', rebuilt: true},
      {label: 'COPY . .', size: '68 MB', rebuilt: true}, {label: 'RUN npm run build', size: '2 MB'}, {label: 'CMD npm start', size: '0 B'}]}},
  },
  GRID_ARRAY: {
    min: {grid: {headline: 'A tiny [grid]', rows: 3, cols: 4, mode: 'wave', label: 'a small array', legendA: 'on', legendB: 'off', color: 'green'}},
    max: {grid: {headline: HEAD, rows: 12, cols: 16, mode: 'wave', label: 'Thousands of cores computing in a parallel sweep', legendA: 'active', legendB: 'idle', color: 'green'}},
    maxHeat: {grid: {headline: 'The [attention] heatmap at density', rows: 14, cols: 14, mode: 'heatmap', label: 'attention weights across tokens', legendA: 'high', legendB: 'low', color: 'purple'}},
  },
  SPEC_COMPARE: {
    min: {source: 'illustrative', compare: {headline: 'A tiny [versus]', a: {name: 'Before', color: 'red'}, b: {name: 'After', color: 'green'}, rows: [{label: 'Speed', a: 'slow', b: 'fast', winner: 'b'}, {label: 'Cost', a: 'high', b: 'low', winner: 'b'}]}},
    max: {source: 'illustrative', compare: {headline: HEAD, a: {name: 'GeForce RTX', color: 'green', asset: 'si:nvidia'}, b: {name: 'Radeon RX', color: 'red', asset: 'si:amd'}, rows: [
      {label: 'Shader cores', a: '16,384', b: '6,144', winner: 'a'}, {label: 'Memory', a: '24 GB', b: '20 GB', winner: 'a'},
      {label: 'Bandwidth', a: '1 TB/s', b: '960 GB/s', winner: 'a'}, {label: 'Boost clock', a: '2.52 GHz', b: '2.42 GHz', winner: 'a'},
      {label: 'Board power', a: '450 W', b: '355 W', winner: 'b'}, {label: 'Launch price', a: '$1,599', b: '$999', winner: 'b'}]}},
  },
  DIE_SHOT: {
    min: {die: {headline: 'A tiny [chip]', chipLabel: 'SoC', cols: 2, rows: 2, color: 'blue', blocks: [{label: 'CPU', x: 1, y: 1, w: 1, h: 2, color: 'blue'}, {label: 'GPU', x: 2, y: 1, w: 1, h: 2, color: 'green'}]}},
    max: {die: {headline: HEAD, chipLabel: 'Apple M-series Max', cols: 4, rows: 4, color: 'blue', blocks: [
      {label: 'P-cores', sub: 'performance', x: 1, y: 1, w: 2, h: 1, color: 'blue'}, {label: 'E-cores', sub: 'efficiency', x: 1, y: 2, w: 2, h: 1, color: 'blue'},
      {label: 'GPU cores', sub: '40-core', x: 3, y: 1, w: 2, h: 2, color: 'green'}, {label: 'Neural Engine', sub: '16-core', x: 1, y: 3, w: 1, h: 1, color: 'purple'},
      {label: 'Media engine', sub: 'encode', x: 2, y: 3, w: 1, h: 1, color: 'orange'}, {label: 'Cache', sub: '48 MB', x: 3, y: 3, w: 1, h: 1, color: 'yellow'},
      {label: 'Fabric', sub: 'ring bus', x: 4, y: 3, w: 1, h: 1, color: 'red'}, {label: 'Unified Memory', sub: 'LPDDR5', x: 1, y: 4, w: 4, h: 1, color: 'orange'}]}},
  },
  NEURAL_NET: {
    min: {net: {headline: 'A tiny [net]', color: 'purple', layers: [2, 3, 1], labels: ['In', 'Hidden', 'Out']}},
    max: {net: {headline: HEAD, color: 'purple', layers: [6, 6, 6, 6, 6], labels: ['Input', 'Hidden 1', 'Hidden 2', 'Hidden 3', 'Output']}},
  },
  DATACENTER: {
    min: {datacenter: {headline: 'A tiny [hall]', variant: 'hall', spineLabel: 'Spine', color: 'blue', highlight: 1, racks: [{label: 'Web'}, {label: 'DB', color: 'red'}]}},
    max: {datacenter: {headline: HEAD, variant: 'hall', spineLabel: 'Spine · core switch fabric', color: 'blue', highlight: 3, racks: [{label: 'Web'}, {label: 'App'}, {label: 'Cache'}, {label: 'Queue'}, {label: 'Storage'}, {label: 'Database', color: 'red'}]}},
    maxRack: {datacenter: {headline: 'One [rack], unit by unit at the cap', variant: 'rack', rackLabel: 'Rack 07 · row B', color: 'blue', highlight: 1, units: [
      {label: 'Compute', sub: '16 servers', u: 2, color: 'blue'}, {label: 'GPU', sub: '8x H100', u: 2, color: 'green'}, {label: 'Storage', sub: '2 PB NVMe', u: 1, color: 'orange'},
      {label: 'Network', sub: 'leaf switch', u: 1, color: 'purple'}, {label: 'Cooling', sub: 'liquid CDU', u: 1, color: 'yellow'}, {label: 'Battery', sub: 'BBU', u: 1, color: 'red'}, {label: 'Power', sub: 'dual PDU', u: 1, color: 'blue'}]}},
  },
  TRANSFORMER_BLOCK: {
    min: {transformer: {headline: 'A tiny [block]', color: 'purple', blocks: [{label: 'Input', kind: 'io'}, {label: 'Attention', kind: 'attn'}, {label: 'Output', kind: 'io'}]}},
    max: {transformer: {headline: HEAD, color: 'purple', repeatFrom: 2, repeatTo: 5, repeatLabel: 'x 96', blocks: [
      {label: 'Token embeddings', sub: 'vocab lookup', kind: 'io'}, {label: 'Multi-Head Attention', sub: '96 heads', kind: 'attn'}, {label: 'Add & Norm', sub: 'residual', kind: 'norm'},
      {label: 'Feed Forward', sub: '4x MLP', kind: 'ffn'}, {label: 'Add & Norm', sub: 'residual', kind: 'norm'}, {label: 'Output projection', sub: 'to logits', kind: 'io'},
      {label: 'Softmax', sub: 'probabilities', kind: 'io'}]}},
  },
  CACHE_PYRAMID: {
    min: {pyramid: {headline: 'A tiny [hierarchy]', axisTop: 'fast', axisBottom: 'big', tiers: [{label: 'Cache', speed: '1 ns', size: '64 KB', color: 'orange'}, {label: 'RAM', speed: '80 ns', size: '32 GB', color: 'blue'}]}},
    max: {pyramid: {headline: HEAD, axisTop: 'faster · smaller · costly', axisBottom: 'bigger · slower · cheap', tiers: [
      {label: 'Registers', speed: '~0.3 ns', size: '1 KB', color: 'red'}, {label: 'L1 cache', speed: '~1 ns', size: '64 KB', color: 'orange'}, {label: 'L2 cache', speed: '~4 ns', size: '512 KB', color: 'yellow'},
      {label: 'L3 cache', speed: '~12 ns', size: '32 MB', color: 'green'}, {label: 'Main memory', speed: '~80 ns', size: '64 GB', color: 'blue'}, {label: 'NVMe SSD', speed: '~100 us', size: '4 TB', color: 'purple'},
      {label: 'Cold storage', speed: '~10 ms', size: '1 PB', color: 'blue'}]}},
    maxPyramid: {pyramid: {headline: 'The [test] pyramid at the tier cap', variant: 'pyramid', color: 'green', axisTop: 'few · slow · costly', axisBottom: 'many · fast · cheap', tiers: [
      {label: 'Manual QA', stat: 'slowest', color: 'red'}, {label: 'E2E', stat: 'slow', color: 'orange'}, {label: 'Integration', stat: 'medium', color: 'yellow'}, {label: 'Unit', stat: 'fast · cheap', color: 'green'}]}},
  },
  GPU_CLUSTER: {
    min: {gpuCluster: {headline: 'A tiny [cluster]', color: 'green', nodes: 2, gpusPerNode: 2, interconnect: 'NVLink', totalLabel: 'GPUs'}},
    max: {gpuCluster: {headline: HEAD, color: 'green', nodes: 8, gpusPerNode: 8, interconnect: 'NVLink · InfiniBand HDR', totalLabel: 'GPUs training together'}},
  },
  ZOOM_SCALE: {
    min: {zoomScale: {headline: 'A tiny [zoom]', color: 'blue', levels: [{label: 'Atom', sub: 'tiny', asset: 'lucide:atom', scale: '0.1 nm'}, {label: 'Chip', sub: 'the SoC', asset: 'lucide:cpu', scale: '1 cm'}, {label: 'Rack', sub: 'servers', asset: 'lucide:server', scale: '2 m'}]}},
    max: {zoomScale: {headline: HEAD, color: 'blue', levels: [
      {label: 'Transistor', sub: 'a switch', asset: 'lucide:toggle-left', scale: '3 nm', color: 'blue'}, {label: 'Core', sub: 'billions', asset: 'lucide:cpu', scale: '1 mm', color: 'purple'},
      {label: 'Chip', sub: 'the SoC', asset: 'lucide:square-stack', scale: '1 cm', color: 'green'}, {label: 'Board', sub: 'a server', asset: 'lucide:server', scale: '0.5 m', color: 'orange'},
      {label: 'Rack', sub: 'many servers', asset: 'lucide:columns-3', scale: '2 m', color: 'yellow'}, {label: 'Data center', sub: 'the cloud', asset: 'lucide:building-2', scale: '100 m', color: 'red'}]}},
  },

  // ── FAMILY E · code-surface (third pack terminalcli) ──────────────────────
  // Owned classes to stress here: (a) tall-headline clearance — MAX scenes carry
  // the 46-char HEAD; (b) label/line truncation — lines authored at the char caps.
  CODE_WINDOW: {
    min: {code: {filename: 'hello.js', language: 'js',
      lines: [{text: "console.log('hi');"}], runLabel: 'node hello.js'}},
    max: {code: {filename: 'src/server/http-listener.ts', language: 'ts', runLabel: 'node dist/server/http-listener.js',
      lines: [
        {text: "import http from 'node:http';"},
        {text: 'const PORT = process.env.PORT ?? 8080;'},
        {text: 'const server = http.createServer((req, res) => {'},
        {text: "  const url = new URL(req.url, 'http://x');"},
        {text: "  if (url.pathname === '/health') {", color: 'blue'},
        {text: "    res.writeHead(200, {'x':'application/json'});"},
        {text: "    return res.end('{ ok: true }');"},
        {text: '  }'},
        {text: '  res.writeHead(404);'},
        {text: "  res.end('not found');"},
        {text: '});'},
        {text: 'server.listen(PORT, onReady);'}],
      output: [
        {text: '> node server.js'},
        {text: 'listening on http://localhost:8080', color: 'green'},
        {text: 'GET /health 200 3ms'},
        {text: 'GET /users 404 1ms', color: 'orange'},
        {text: 'GET /favicon.ico 404 0ms', color: 'orange'},
        {text: '^C  server closed cleanly'}]}},
  },
  CODE_EDITOR: {
    min: {editor: {lang: 'py', lines: ["print('hi')"]}},
    max: {editor: {headline: HEAD, color: 'blue', lang: 'typescript',
      tabs: [{name: 'server.ts', active: true}, {name: 'routes.ts'}, {name: 'db.ts'}],
      highlight: {from: 5, to: 5, color: 'red'},
      squiggle: {line: 5, message: "'NotFound' is not defined (ts2304)"},
      lines: [
        'export function handler(req) {',
        '  const id = req.params.id;',
        '  const user = db.find(id);',
        '  if (!user) {',
        '    throw new NotFound(id);',
        '  }',
        '  return json(user);',
        '}',
        '// end of request handler here',
        'export default handler;']}},
    split: {editor: {headline: 'A [split] IDE with a terminal pane', color: 'green', variant: 'split', lang: 'python',
      tabs: [{name: 'main.py', active: true}],
      lines: [
        'def main() -> int:',
        "    data = load('input.json')",
        '    total = sum(x.value for x in data)',
        "    print(f'total = {total}')",
        '    return 0'],
      terminal: {promptLabel: 'app', cmd: 'python main.py', output: ['total = 4212', 'process finished, exit code 0']}}},
  },
  CODE_DIFF: {
    min: {diff: {fileName: 'README.md', rows: [
      {kind: 'del', text: 'old getting-started line'}, {kind: 'add', text: 'new getting-started line'}]}},
    max: {diff: {headline: HEAD, color: 'green', fileName: 'src/api/rate-limiter.ts', stat: {plus: 5, minus: 2},
      rows: [
        {kind: 'ctx', text: 'export function limit(key, max, windowMs) {'},
        {kind: 'ctx', text: '  const now = Date.now();'},
        {kind: 'del', text: '  const hits = store.get(key) || [];'},
        {kind: 'add', text: '  const hits = (store.get(key) ?? []).slice();'},
        {kind: 'ctx', text: '  const fresh = hits.filter(t => t > cut);'},
        {kind: 'del', text: '  if (fresh.length >= max) return false;'},
        {kind: 'add', text: '  if (fresh.length >= max) {'},
        {kind: 'add', text: "    log.warn('rate limit hit for ' + key);"},
        {kind: 'add', text: '    return false;'},
        {kind: 'add', text: '  }'},
        {kind: 'ctx', text: '  fresh.push(now);'},
        {kind: 'ctx', text: '  return true;'}]}},
  },
  TERMINAL_SESSION: {
    min: {terminal: {commands: [{cmd: 'whoami', output: ['root']}]}},
    max: {terminal: {headline: HEAD, color: 'green', promptLabel: 'deploy@prod-web-01', cwd: '/srv/app/current',
      commands: [
        {cmd: 'git pull --rebase origin main', output: ['Updating a1b2c3d..e4f5g6h', 'Fast-forward, 12 files changed'], exitCode: 0},
        {cmd: 'npm ci && npm run build', output: ['added 812 packages in 21s', 'build complete in 34.2s'], exitCode: 0},
        {cmd: 'pm2 reload ecosystem.config.js --update-env', output: ['[PM2] Applying action reloadProcessId', '[PM2] web online  (pid 20481)'], exitCode: 0}]}},
  },
  LOG_STREAM: {
    min: {logs: {lines: [
      {level: 'info', tag: 'app', text: 'server started'},
      {level: 'info', tag: 'app', text: 'ready on :3000'}]}},
    max: {logs: {headline: HEAD, color: 'orange', rate: '4.2k lines/s', highlight: 6,
      lines: [
        {level: 'info', tag: 'gateway', text: 'request GET /v1/checkout received'},
        {level: 'debug', tag: 'auth', text: 'token verified for user 48213'},
        {level: 'info', tag: 'cart', text: 'loaded 3 items, subtotal 128.40 USD'},
        {level: 'info', tag: 'payment', text: 'charge intent created pi_3Nk...'},
        {level: 'warn', tag: 'payment', text: 'gateway latency 1840ms over budget'},
        {level: 'warn', tag: 'inventory', text: 'stock low for sku 77-A (2 left)'},
        {level: 'error', tag: 'payment', text: 'declined: insufficient_funds (402)'},
        {level: 'info', tag: 'cart', text: 'rolled back reservation for order'},
        {level: 'debug', tag: 'gateway', text: 'response 402 in 2103ms'},
        {level: 'info', tag: 'metrics', text: 'emitted 6 spans to collector'}]}},
  },
  ERROR_TRACE: {
    min: {callStack: {mode: 'trace', exception: 'Error: boom', frames: [
      {fn: 'main', file: 'app.js', line: 3}, {fn: 'boot', file: 'app.js', line: 9}]}},
    max: {callStack: {headline: HEAD, color: 'red', mode: 'trace', culprit: 2,
      exception: 'TypeError: undefined is not a function here',
      frames: [
        {fn: 'renderInvoice', sub: 'invoice = orders[idx]', file: 'invoice.tsx', line: 88},
        {fn: 'mapOrdersToRows', sub: 'rows.map(renderInvoice)', file: 'table.tsx', line: 142},
        {fn: 'InvoiceTable.render', sub: 'props.orders (undefined)', file: 'table.tsx', line: 37, color: 'red'},
        {fn: 'renderWithHooks', sub: 'current = workInProgress', file: 'react-dom.js', line: 15008},
        {fn: 'mountIndeterminate', sub: 'fiber = workInProgress', file: 'react-dom.js', line: 19212},
        {fn: 'workLoopSync', sub: 'flushWork(deadline)', file: 'scheduler.js', line: 2634}]}},
  },

  // ── FAMILY F · framed-surface (third pack moderndark) ─────────────────────
  // Owned classes: tall-headline clearance (MAX carries HEAD), label overflow,
  // and (new, from E-2) OVERLAY OPACITY — devtools drawers + notification drops
  // must be opaque over the ContentSlot in translucent-panel themes.
  WINDOW_FRAME: {
    min: {window: {variant: 'browser', url: 'https://example.com', title: 'example.com',
      content: {kind: 'empty', message: 'No results yet', icon: 'lucide:inbox'}}},
    browser: {window: {headline: HEAD, variant: 'browser', color: 'blue', url: 'https://app.acme.io/dashboard/reports', title: 'Acme · Reports',
      content: {kind: 'cardGrid', title: 'Monthly reports', cards: [
        {title: 'Revenue', sub: 'up 12% this month', color: 'green'}, {title: 'Signups', sub: '2,481 new users', color: 'blue'},
        {title: 'Churn', sub: 'down to 1.8%', color: 'orange'}, {title: 'MRR', sub: '$128.4k recurring', color: 'purple'},
        {title: 'Refunds', sub: '14 this week', color: 'red'}, {title: 'NPS', sub: 'score of 62', color: 'green'}]},
      devtools: {open: true, panel: 'network', requests: [
        {name: 'reports.json', phases: [{phase: 'ttfb', ms: 120}, {phase: 'download', ms: 60}], status: '200'},
        {name: 'user.json', phases: [{phase: 'dns', ms: 10}, {phase: 'ttfb', ms: 40}], status: '200'},
        {name: 'avatar.png', phases: [{phase: 'connect', ms: 20}, {phase: 'download', ms: 90}], status: '200'},
        {name: 'flags.json', phases: [{phase: 'blocked', ms: 8}, {phase: 'ttfb', ms: 30}], status: '404'}]}}},
    mac: {window: {headline: 'A [mac] window frame at cap', variant: 'mac', color: 'purple', title: 'Create account',
      content: {kind: 'form', title: 'Create your account', submit: 'Create account', fields: [
        {label: 'Full name', value: 'Ada Lovelace', focus: true}, {label: 'Work email', value: 'ada@acme.io'},
        {label: 'Password', value: '••••••••••'}, {label: 'Company', value: 'Acme Inc'}]}}},
    windows: {window: {headline: 'A [windows] window at cap', variant: 'windows', color: 'green', title: 'System Monitor',
      content: {kind: 'metric', value: '99.98%', label: 'uptime this qtr', trend: '+0.2%'},
      devtools: {open: true, panel: 'console', logs: [
        {level: 'info', tag: 'boot', text: 'service worker registered ok'},
        {level: 'debug', tag: 'net', text: 'prefetched 4 routes in 82ms'},
        {level: 'warn', tag: 'perf', text: 'main thread blocked for 240ms'},
        {level: 'error', tag: 'api', text: 'GET /flags failed with 404 status'},
        {level: 'info', tag: 'net', text: 'retry succeeded on attempt 2'}]}}},
    linux: {window: {headline: 'A [linux] window frame ok', variant: 'linux', color: 'orange', title: 'gedit — release.md',
      content: {kind: 'text', title: 'Release notes — v2.4',
        body: 'Smaller bundles, faster cold starts, a brand-new dark theme, and dozens of small bug fixes across the app.'}}},
  },
  AUTOMATION_RUN: {
    min: {auto: {runner: 'playwright', url: 'example.com', steps: [{action: 'goto', target: '/', status: 'pass'}],
      content: {kind: 'text', title: 'Home', body: 'Welcome to the site'}}},
    max: {auto: {headline: HEAD, runner: 'playwright', color: 'blue', url: 'app.acme.io/checkout',
      content: {kind: 'form', title: 'Checkout', submit: 'Pay $128.40', fields: [
        {label: 'Email', value: 'ada@acme.io', focus: true}, {label: 'Card', value: '4242 4242 4242'},
        {label: 'Expiry', value: '12 / 29'}, {label: 'CVC', value: '123'}]},
      steps: [
        {action: 'goto', target: '/checkout', status: 'pass'},
        {action: 'type', target: '#email', value: 'ada@acme.io', status: 'pass'},
        {action: 'click', target: '#pay-button', status: 'pass'},
        {action: 'assert', target: '.confirmation', status: 'fail', reason: 'expected .confirmation visible within 5s'},
        {action: 'hover', target: '.retry-link', status: 'running'}]}},
  },
  DOM_INSPECT: {
    min: {dom: {selector: 'div.card', nodes: [
      {tag: 'div', attr: '.card', depth: 0}, {tag: 'span', attr: '.title', depth: 1}]}},
    max: {dom: {headline: HEAD, color: 'blue', selector: 'main section.hero h1.title span', highlight: 4, nodes: [
      {tag: 'main', attr: 'role=main', depth: 0},
      {tag: 'section', attr: '.hero', depth: 1},
      {tag: 'div', attr: '.container', depth: 2},
      {tag: 'h1', attr: '.title', depth: 3},
      {tag: 'span', attr: '.highlight', depth: 4},
      {tag: 'a', attr: 'href=/get-started', depth: 4},
      {tag: 'button', attr: '.cta primary', depth: 3},
      {tag: 'footer', attr: '.legal small', depth: 1}]}},
  },
  NETWORK_WATERFALL: {
    min: {waterfall: {requests: [
      {name: 'index.html', phases: [{phase: 'dns', ms: 12}, {phase: 'ttfb', ms: 80}, {phase: 'download', ms: 40}], status: '200'},
      {name: 'app.js', phases: [{phase: 'connect', ms: 20}, {phase: 'download', ms: 120}], status: '200'}]}},
    max: {waterfall: {headline: HEAD, color: 'blue', totalMs: 2100, requests: [
      {name: 'document', phases: [{phase: 'blocked', ms: 8}, {phase: 'dns', ms: 14}, {phase: 'connect', ms: 22}, {phase: 'ttfb', ms: 120}, {phase: 'download', ms: 40}], status: '200'},
      {name: 'app.bundle.js', phases: [{phase: 'queue', ms: 6}, {phase: 'ttfb', ms: 60}, {phase: 'download', ms: 210}], status: '200'},
      {name: 'styles.css', phases: [{phase: 'ttfb', ms: 40}, {phase: 'download', ms: 90}], status: '200'},
      {name: 'api/user', phases: [{phase: 'blocked', ms: 12}, {phase: 'ttfb', ms: 180}], status: '200'},
      {name: 'avatar.png', phases: [{phase: 'connect', ms: 20}, {phase: 'download', ms: 140}], status: '200'},
      {name: 'analytics.js', phases: [{phase: 'blocked', ms: 30}, {phase: 'ttfb', ms: 24}], status: '404'}]}},
  },
  DEVICE_FRAME: {
    min: {device: {os: 'ios', content: {kind: 'text', title: 'Notes', body: 'Buy milk on the way home'}}},
    max: {device: {headline: HEAD, os: 'android', color: 'green',
      content: {kind: 'cardGrid', title: 'Today', cards: [
        {title: 'Steps', sub: '8,204 today', color: 'green'}, {title: 'Sleep', sub: '7h 20m last night', color: 'blue'},
        {title: 'Heart', sub: '62 bpm resting', color: 'red'}, {title: 'Water', sub: '5 of 8 glasses', color: 'purple'}]},
      notification: {app: 'Messages', text: 'Sarah: are we still on for lunch today?'}}},
  },
};

// ── completeness check against census ────────────────────────────────────
const census = JSON.parse(fs.readFileSync(path.resolve('audit/census.json'), 'utf8'));
const censusTypes = new Set(census.rows.map((r) => r.type));
const missing = famTypes.filter((t) => censusTypes.has(t) && !F[t]);
if (missing.length) {
  console.error(`FACTORY GAP for family ${famName}: no MIN/MAX factory for ${missing.join(', ')}`);
  process.exit(1);
}

// ── emit spec ─────────────────────────────────────────────────────────────
const scenes = [];
for (const t of famTypes) {
  const f = F[t];
  if (!f) continue;
  for (const [k, data] of Object.entries(f)) {
    scenes.push(scene(`${t}-${k}`, t, data));
  }
}
const spec = {brand: {theme: 'studio', design: 'material'}, scenes};
const outDir = path.resolve('specs/matrix');
fs.mkdirSync(outDir, {recursive: true});
const outPath = path.join(outDir, `${key}.json`);
fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));
console.log(`wrote ${outPath} — ${scenes.length} stress scenes for family ${famName}`);
console.log(`render: node scripts/_proof.mjs specs/matrix/${key}.json material ${key}-material`);
