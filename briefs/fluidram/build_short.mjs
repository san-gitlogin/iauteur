// FluidRAM, tested — SHORT.
//
// One idea, shown rather than listed: the encoder's trick is brilliant on an empty page, and
// a browser's pages are not empty. Then the one number people quote, taken apart in a line.
// Every figure is in the wide cut and in briefs/fluidram/00-dossier.md.
//
// `stack` for the hook: a lower-third shape strands the card at the bottom of a 9:16 frame.
import {short} from '../../scripts/lib/apple-build.mjs';

const c = short();
const M = (t, bg, n, mk, o) => c.add('MEM_STAGE', t, bg, n, mk, o);

c.add('HOOK', 'dip', 'zoneA',
  "FluidRAM says Linux gets four times more memory. I tested it on a browser.",
  (A) => ({
    headline: 'FluidRAM: 4× more RAM?',
    subtext: 'Tested on live memory',
    heroAsset: 'si:linux',
    hookVariant: 'stack',
    atWord: A(0.5),
  }));

M('fade', 'zoneA',
  "FluidRAM's trick: drop every zero byte in a page, and store each byte that's left as three, two for " +
  "where and one for what.",
  (A) => ({
    headline: 'Zeros vanish, [survivors cost 3]',
    kind: 'sparse-encode',
    caption: 'The sparse mode',
    color: 'blue',
    cells: [
      {label: 'a page', text: 'page', value: 40, atWord: A(0.14)},
      {label: 'zero bytes dropped', text: 'zeros', atWord: A(0.22)},
      {label: 'each byte left → 3 bytes', text: 'tuple', atWord: A(0.5)},
    ],
  }));

M('wipe', 'zoneB',
  "That only works below a thousand and twenty four non-zero bytes. The test pages sat at a hundred and " +
  "twenty seven. A browser's typical page? Eleven hundred and seventy nine.",
  (A) => ({
    headline: 'Browser pages are [too full]',
    kind: 'sparsity-ruler',
    token: 'non-zero bytes per 4 KB page',
    caption: 'How sparse is a page?',
    color: 'orange',
    cells: [
      {label: 'the limit', text: 'limit', value: 1024, atWord: A(0.12)},
      {label: 'test pages', text: 'pop', value: 127, color: 'green', atWord: A(0.4)},
      {label: 'browser', text: 'pop', value: 1179, sub: 'stored raw, most of the time', atWord: A(0.62)},
    ],
  }));

M('zoom', 'zoneC',
  "Counted the way the kernel allocates, FluidRAM saved less than nothing on that browser: zero point nine " +
  "five times. LZ4 got four point three.",
  (A) => ({
    headline: 'Live memory: [below 1×]',
    kind: 'codec-bars',
    token: '1× = no saving',
    caption: 'A browser, three tabs',
    color: 'red',
    cells: [
      {text: 'Browser', label: 'FluidRAM', value: 0.95, color: 'red', atWord: A(0.36)},
      {text: 'Browser', label: 'LZ4', value: 4.33, color: 'green', atWord: A(0.62)},
    ],
  }));

M('push', 'zoneA',
  "And the famous thirty five times? A declared gigabyte that's never allocated, divided by twenty nine " +
  "megabytes.",
  (A) => ({
    headline: '35× is [1,024 ÷ 29.2]',
    kind: 'declared-vs-real',
    caption: 'How 35× is computed',
    color: 'red',
    cells: [
      {label: 'declared', text: 'declared', value: 1024, sub: 'never allocated', atWord: A(0.3)},
      {label: 'resident', text: 'resident', value: 29.2, atWord: A(0.6)},
      {label: '35.07×', text: 'ratio', atWord: A(0.68)},
    ],
  }));

c.add('OUTRO_CTA', 'fade', 'zoneA',
  "The full test, and three ideas that could work, are on the channel.",
  (A) => ({
    headline: 'Three ideas that could work',
    subtext: 'Full test on the channel',
    atWord: A(0.5),
  }));

const spec = {
  meta: {
    topic: 'FluidRAM 4x RAM claim, tested',
    format: 'shorts',
    fps: 30,
    subject: 'FluidRAM',
    topicAxes: ['entity-novelty', 'myth-busting'],
    screenplay: 'documentary',
    onePayoff: "FluidRAM's zero-dropping trick fits sparse test pages, not a browser's memory",
    openLoop: 'Does four times more RAM survive a browser?',
    seo: {
      title: "Did FluidRAM Just Solve the RAM Crisis? #linux #programming",
      hook: "RAM prices are climbing with AI buying up memory, and FluidRAM, an open-source Linux project by Aditya Raj, promises 4× more of it from the RAM you already have. Here is what its encoder does to a browser’s memory.",
      description:
        'FluidRAM promises 4× more RAM on Linux. Its encoder drops zero bytes and stores the rest as ' +
        '3-byte tuples: great on sparse test pages, below 1× on a browser. And where 35× comes from.',
      breakdown: 'the sparse trick, a browser page, the kmalloc count, and the 35× number',
      pinned: 'Would you trust a benchmark chart without its results file?',
      tags: ["RAM prices", "memory crisis", "AI memory", "more RAM", 'FluidRAM', 'Linux memory', 'zram', 'memory compression', 'LZ4', 'Linux kernel',
        'benchmark', 'computer science', 'shorts'],
      queries: ['does FluidRAM really give 4x RAM', 'FluidRAM vs zram', "will RAM prices go down"],
      sources: [
        'github.com/adityarajIITj/fluidram — FluidRAM by Aditya Raj (GPL-2.0)',
        'github.com/adityarajIITj/adios — AdiOS by Aditya Raj (MIT)',
      ],
    },
  },
  brand: c.brand(),
  thumbnail: {title: "THE END OF THE RAM CRISIS?",badge: "FluidRAM",note: "BY ADITYA RAJ · TESTED",asset: "img:fluidram_ram_hero.png",art: "img:fluidram_ram_hero.png"},
  cover: {title: "THE END OF THE RAM CRISIS?",badge: "FluidRAM",asset: "img:fluidram_ram_hero.png",art: "img:fluidram_ram_hero.png",frames: 2},
  scenes: c.S,
};

c.emitShort('topics/fluidram-tested/shorts.json', spec);
