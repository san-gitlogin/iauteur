// Apple September 2026 — iPhone 18 Pro.  SHORT.
//
// Not a trailer for the wide cut. One thing — the camera that signs its own pictures —
// shown properly and then stopped. Every figure has a row in the dossier.
import {short} from '../../scripts/lib/apple-build.mjs';

const c = short();
const S = (t, bg, n, mk, o) => c.stage(t, bg, n, mk, o);

c.add('HOOK', 'dip', 'zoneA',
  'Your iPhone 18 Pro photo can now prove that it is real.',
  (A) => ({
    headline: 'Your photo proves it is real',
    subtext: 'iPhone 18 Pro',
    kicker: 'September 2026',
    variant: 'plaque',
    atWord: A(0.5),
  }));

S('fade', 'zoneA',
  'Apple Reference Image signs the picture while the sensor is still reading it, and that signature ' +
  'binds to the pixels themselves.',
  (A) => ({
    // The gate wants a content word shared with the voice over it: the narration says
    // "signature binds to the pixels", so the card says pixels.
    headline: 'Bound to the [pixels]',
    kind: 'reference-image',
    caption: 'Apple Reference Image',
    color: 'blue',
    cells: [
      {label: 'capture', text: 'capture', atWord: A(0.16)},
      {label: 'signed', text: 'sign', atWord: A(0.34)},
    ],
  }));

S('wipe', 'zoneB',
  'Copy it, paint something out of the middle, and the copy stops matching its own signature. So the ' +
  'original stays provable and the edit cannot borrow that.',
  (A) => ({
    headline: 'Edit it and the [signature] breaks',
    kind: 'reference-image',
    caption: 'The original still holds',
    color: 'blue',
    cells: [
      {label: 'capture', text: 'capture', atWord: 1},
      {label: 'signed', text: 'sign', atWord: 2},
      {label: 'edited', text: 'edit', atWord: A(0.24)},
      {label: 'checked', text: 'check', atWord: A(0.52)},
    ],
  }));

S('zoom', 'zoneC',
  'The lens under it opens to f one point four eight on six real blades, and closes to f four when you ' +
  'want the whole scene sharp.',
  (A) => ({
    headline: 'Six blades, [four] stops',
    kind: 'aperture-iris',
    caption: 'A real variable aperture',
    color: 'green',
    cells: [
      {label: 'f/1.48', text: 'stop', value: 1.48, sub: 'widest', atWord: A(0.30)},
      {label: 'f/1.8', text: 'stop', value: 1.8},
      {label: 'f/2.8', text: 'stop', value: 2.8},
      {label: 'f/4', text: 'stop', value: 4, sub: 'deepest', atWord: A(0.62)},
    ],
  }));

S('whippan', 'zoneC',
  'The 18 Pro starts at eleven ninety nine, and every older iPhone went up a hundred dollars that day.',
  (A) => ({
    headline: 'And the old ones went [up]',
    kind: 'price-rise',
    token: '$',
    caption: 'Same day',
    color: 'orange',
    cells: [
      {label: 'iPhone 17', text: 'rise', value: 899, sub: '799', atWord: A(0.55)},
      {label: 'iPhone 16', text: 'rise', value: 799, sub: '699', atWord: A(0.68)},
    ],
  }));

c.add('OUTRO_CTA', 'fade', 'zoneA',
  'Full breakdown of the iPhone 18 Pro is on the channel.',
  (A) => ({
    headline: 'Worth it?',
    subtext: 'Full breakdown on the channel',
    atWord: A(0.5),
  }));

const spec = {
  meta: {
    topic: 'Apple September 2026 — iPhone 18 Pro',
    format: 'shorts',
    fps: 30,
    subject: 'iPhone 18 Pro',
    topicAxes: ['entity-novelty', 'economic-pain'],
    screenplay: 'documentary',
    onePayoff: 'the iPhone 18 Pro signs its photos at capture, so an edited copy cannot pass as the original',
    openLoop: 'How can a photo prove it is a photo?',
    seo: {
      title: 'Your iPhone photo can now prove it is real #apple #iphone18pro',
      description:
        'Apple Reference Image signs the picture at capture, so an edited copy stops matching its own ' +
        'signature. Plus a real six-blade variable aperture, and the $100 rise across the old lineup.',
      breakdown: 'Apple Reference Image, the variable aperture, and the price rise',
      pinned: 'Would a camera that can prove a photo is real change what you trust online?',
      tags: ['iPhone 18 Pro', 'Apple Reference Image', 'variable aperture', 'Apple September 2026', 'shorts'],
      queries: ['what is Apple Reference Image', 'iPhone 18 Pro variable aperture'],
      sources: ['apple.com/newsroom — iPhone 18 Pro and iPhone 18 Pro Max', 'apple.com/iphone-18-pro/specs'],
    },
  },
  brand: c.brand(),
  thumbnail: {title: 'EVERYTHING THAT ACTUALLY CHANGED', badge: 'iPhone 18 Pro',
    note: 'and what only looks new', asset: 'si:apple'},
  cover: {title: 'EVERYTHING THAT ACTUALLY CHANGED', badge: 'iPhone 18 Pro', asset: 'si:apple', frames: 2},
  scenes: c.S,
};

c.emitShort('topics/apple-18-pro/shorts.json', spec);
