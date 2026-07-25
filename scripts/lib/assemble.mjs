// ASSEMBLER — the console owns the envelope (topic/format/fps/design/theme/
// themeLight/channel come from the user's config, never the model). The model
// only returns story fields + thumbnail + scenes. This merges them into a
// full spec; any envelope the model emitted anyway is ignored-with-log.
// Accepts BOTH the new lean shape and a legacy full-spec shape (back-compat).
import {FPS} from './constants.mjs';

// `beats` (optional) is the ACCEPTED Stage-1 beat sheet. Stage 1 collects the story
// fields — onePayoff / openLoop / analogy / topicAxes — but the Stage-2 fill prompt
// asks only for scenes, so without this every two-paste video silently lost all four
// (and tripped the "topicAxes has <2 strategy axes" warning on every single render).
export function assembleSpec(model, cfg, beats) {
  const changes = [];
  model = model || {};
  const bm = (beats && beats.meta) || {};
  const m = model.meta || {};
  // story-field precedence: the fill reply, then the beat sheet, then the model's meta
  const story = (k) => model[k] ?? m[k] ?? bm[k];
  const format = (cfg.format === 'shorts' || cfg.format === 'short') ? 'short' : (cfg.format || 'long');

  const spec = {};
  spec.meta = {
    topic: cfg.topic || m.topic || m.title || '',
    format, fps: FPS,
    onePayoff: story('onePayoff'),
    openLoop: story('openLoop'),
    analogy: story('analogy'),
    screenplay: cfg.preset || m.screenplay || bm.screenplay || 'explainer',
    topicAxes: story('topicAxes'),
  };
  for (const k of Object.keys(spec.meta)) if (spec.meta[k] === undefined) delete spec.meta[k];
  if (beats && (spec.meta.topicAxes || spec.meta.onePayoff)) {
    const carried = ['onePayoff', 'openLoop', 'analogy', 'topicAxes'].filter((k) => model[k] == null && m[k] == null && bm[k] != null);
    if (carried.length) changes.push(`carried ${carried.join(', ')} forward from the accepted beat sheet`);
  }

  spec.brand = {
    theme: cfg.theme || cfg.design || 'moderndark',
    design: cfg.design || 'moderndark',
    themeLight: cfg.themeLight || 'daylight',
    channel: cfg.channel || 'THE STUDIO',
    // brand.logo drives the in-video watermark, the thumbnail/cover stamp and the
    // OUTRO_CTA subscribe circle. new-topic scaffolds it, but a spec assembled here
    // REPLACES the scaffold — so without this line every console-authored video
    // shipped with no watermark at all. Defaults to the house logo; cfg.logo lets
    // the console point at any file in public/assets (e.g. a product's own logo).
    logo: cfg.logo || 'img:channel_logo.png',
  };
  if (cfg.background && !String(cfg.background).startsWith('(')) spec.brand.background = cfg.background;

  const th = model.thumbnail || model.cover;
  if (th) { if (format === 'short') spec.cover = th; else spec.thumbnail = th; }

  spec.scenes = Array.isArray(model.scenes) ? model.scenes : [];

  if (model.meta && (m.topic || m.title || m.format || m.channel)) changes.push('ignored model-emitted meta envelope (console owns topic/format/fps/screenplay)');
  if (model.brand) changes.push('ignored model-emitted brand (console owns design/theme/channel)');
  return {spec, changes};
}
