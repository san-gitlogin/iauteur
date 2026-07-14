// ASSEMBLER — the console owns the envelope (topic/format/fps/design/theme/
// themeLight/channel come from the user's config, never the model). The model
// only returns story fields + thumbnail + scenes. This merges them into a
// full spec; any envelope the model emitted anyway is ignored-with-log.
// Accepts BOTH the new lean shape and a legacy full-spec shape (back-compat).
import {FPS} from './constants.mjs';

export function assembleSpec(model, cfg) {
  const changes = [];
  model = model || {};
  const m = model.meta || {};
  const format = (cfg.format === 'shorts' || cfg.format === 'short') ? 'short' : (cfg.format || 'long');

  const spec = {};
  spec.meta = {
    topic: cfg.topic || m.topic || m.title || '',
    format, fps: FPS,
    onePayoff: model.onePayoff ?? m.onePayoff,
    openLoop: model.openLoop ?? m.openLoop,
    analogy: model.analogy ?? m.analogy,
    screenplay: cfg.preset || m.screenplay || 'explainer',
    topicAxes: model.topicAxes ?? m.topicAxes,
  };
  for (const k of Object.keys(spec.meta)) if (spec.meta[k] === undefined) delete spec.meta[k];

  spec.brand = {
    theme: cfg.theme || cfg.design || 'moderndark',
    design: cfg.design || 'moderndark',
    themeLight: cfg.themeLight || 'daylight',
    channel: cfg.channel || 'THE STUDIO',
  };
  if (cfg.background && !String(cfg.background).startsWith('(')) spec.brand.background = cfg.background;

  const th = model.thumbnail || model.cover;
  if (th) { if (format === 'short') spec.cover = th; else spec.thumbnail = th; }

  spec.scenes = Array.isArray(model.scenes) ? model.scenes : [];

  if (model.meta && (m.topic || m.title || m.format || m.channel)) changes.push('ignored model-emitted meta envelope (console owns topic/format/fps/screenplay)');
  if (model.brand) changes.push('ignored model-emitted brand (console owns design/theme/channel)');
  return {spec, changes};
}
