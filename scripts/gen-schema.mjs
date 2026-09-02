#!/usr/bin/env node
// GEN-SCHEMA — derive a per-video JSON Schema (draft-07) from the component
// MANIFEST, so any editor (VS Code) can validate + autocomplete a spec against
// the SAME contract the linter enforces. One source (the manifest) → the prompt
// schema, the normalizer, the field validator, AND now this JSON Schema.
//
// Usage:
//   node scripts/gen-schema.mjs                 → write specs/video.schema.json
//   node scripts/gen-schema.mjs --check         → verify specs/video.schema.json is up to date (CI)
//   node scripts/gen-schema.mjs --template T1,T2,…  → print a starter spec skeleton (manifest examples)
//
// The schema is a FLOOR, not the whole law: it checks shape + enums + string
// budgets (maxLength). The linter (scripts/lint-spec.mjs) still owns the deeper
// rules (adjacency, counts, cross-field). Schema green ≠ lint green.

import fs from 'node:fs';
import path from 'node:path';
import {MANIFEST, MANIFEST_TYPES} from './lib/manifest.mjs';
import {TYPES, DARK_THEMES, LIGHT_THEMES, BACKGROUNDS, ZONES, TRANSITIONS, ANIMS} from './lib/constants.mjs';

const SCHEMA_PATH = 'specs/video.schema.json';

// ---- field type → JSON Schema fragment ----
const fieldSchema = (spec) => {
  const {t, max, note} = spec;
  const withNote = (s) => (note ? {...s, description: note} : s);
  switch (t) {
    case 'string':
    case 'asset':
      return withNote(max ? {type: 'string', maxLength: max} : {type: 'string'});
    case 'anchor':
    case 'number':
      return withNote({type: 'number'});
    case 'boolean':
      return withNote({type: 'boolean'});
    case 'string[]':
      return withNote({type: 'array', items: {type: 'string'}});
    case 'number[]':
      return withNote({type: 'array', items: {type: 'number'}});
    case 'items':
      // arrays of objects whose per-item shape is described in `note` (the
      // linter validates the members precisely; the schema keeps it open).
      return withNote({type: 'array', items: {type: 'object'}});
    case 'object':
      return withNote({type: 'object'});
    default:
      return withNote({});
  }
};

// ---- one type's `data` object schema ----
// data_root: fields sit directly on scene.data
// data_key : fields sit under scene.data[key]
// NOTE: the schema is a FLOOR — it checks field TYPES, ENUMS and string BUDGETS
// (maxLength), but NOT required-ness. A manifest `req` flag is an AUTHORING hint
// for the prompt (the model should provide it); the interface often accepts an
// alias/fallback instead (e.g. REVEAL renders from kicker+sub with no statement),
// and shipped specs legitimately omit "required" fields. Completeness is the
// linter's job, so the schema never rejects a valid-but-sparse scene.
const dataSchemaFor = (entry) => {
  const props = {};
  for (const [name, f] of Object.entries(entry.fields ?? {})) {
    props[name] = fieldSchema(f);
  }
  const inner = {type: 'object', properties: props};
  if (entry.data_root) return inner;
  // data_key: wrap the fields under the key (key itself not required — floor only).
  return {type: 'object', properties: {[entry.data_key]: inner}};
};

const buildSchema = () => {
  // per-type conditional: if scene.type === X then scene.data matches X's shape.
  const allOf = MANIFEST_TYPES.map((type) => ({
    if: {properties: {type: {const: type}}},
    then: {properties: {data: dataSchemaFor(MANIFEST[type])}},
  }));

  const sceneSchema = {
    type: 'object',
    required: ['id', 'type'],
    properties: {
      id: {type: 'string'},
      type: {enum: TYPES},
      narration: {type: 'string'},
      durationFrames: {type: 'number'},
      timingSource: {enum: ['estimated', 'measured', 'tts']},
      background: {enum: ZONES},
      transition: {enum: TRANSITIONS},
      anim: {enum: ANIMS},
      data: {type: 'object'},
      pip: {type: 'object'},
    },
    allOf,
  };

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'https://tech-video-starter/video.schema.json',
    title: 'Tech Video Spec',
    description:
      'Derived from scripts/lib/manifest.mjs by scripts/gen-schema.mjs — do not edit by hand. ' +
      'A FLOOR check (shape + enums + string budgets); scripts/lint-spec.mjs owns the deeper rules.',
    type: 'object',
    required: ['meta', 'brand', 'scenes'],
    properties: {
      meta: {
        type: 'object',
        required: ['topic'],
        properties: {
          topic: {type: 'string'},
          // REQUIRED by LAW 0g since 2026-08-30: the thing being taught, spelled as a
          // person would SAY it ("SQLite", "VS Code", "uv"). Scene 1 has to contain it.
          subject: {type: 'string', description: 'the subject, spelled as spoken (LAW 0g.1)'},
          format: {enum: ['long', 'short']},
          fps: {type: 'number'},
          screenplay: {type: 'string'},
          onePayoff: {type: 'string'},
          openLoop: {type: 'string'},
          analogy: {type: 'string'},
          topicAxes: {type: 'array', items: {type: 'string'}},
          seo: {type: 'object'},
        },
      },
      brand: {
        type: 'object',
        properties: {
          theme: {enum: DARK_THEMES, description: 'the DARK skin (light variant renders automatically)'},
          themeLight: {enum: LIGHT_THEMES},
          design: {type: 'string'},
          background: {enum: BACKGROUNDS},
          channel: {type: 'string'},
          logo: {type: 'string'},
        },
      },
      thumbnail: {type: 'object'},
      assetsNeeded: {
        type: 'array',
        description: 'Asset-request protocol: declare a needed asset instead of inventing a URL. A media field then references it as "needed:<key>".',
        items: {
          type: 'object',
          required: ['key', 'kind', 'query'],
          properties: {
            key: {type: 'string'},
            kind: {enum: ['image', 'video', 'logo']},
            query: {type: 'string', description: 'what to search for — never a URL'},
            sources: {type: 'array', items: {type: 'string'}},
            mustShow: {type: 'string'},
          },
        },
      },
      scenes: {type: 'array', minItems: 1, items: sceneSchema},
    },
  };
};

// ---- template mode: a starter spec whose scenes ARE the manifest examples ----
const buildTemplate = (types) => {
  const bad = types.filter((t) => !MANIFEST_TYPES.includes(t));
  if (bad.length) {
    console.error(`Unknown type(s): ${bad.join(', ')}. Known: see scripts/lib/manifest.mjs`);
    process.exit(2);
  }
  const scene = (type, i) => {
    const entry = MANIFEST[type];
    const ex = entry.example ?? {};
    // data_root examples already sit at data-level; data_key examples nest.
    const data = entry.data_root ? ex : ex;
    return {
      id: `s${String(i + 1).padStart(2, '0')}`,
      type,
      narration: `TODO narration for ${type} — replace this line.`,
      data,
    };
  };
  const list = types[0] === 'HOOK' ? types : ['HOOK', ...types];
  const scenes = [...list];
  if (scenes[scenes.length - 1] !== 'OUTRO_CTA') scenes.push('OUTRO_CTA');
  return {
    meta: {topic: 'TODO topic', format: 'long', fps: 30},
    brand: {theme: 'studio', themeLight: 'daylight', background: 'plain', channel: 'YOUR CHANNEL'},
    scenes: scenes.map(scene),
  };
};

// ---- CLI ----
const argv = process.argv.slice(2);
if (argv[0] === '--template') {
  const types = (argv[1] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!types.length) {
    console.error('Usage: node scripts/gen-schema.mjs --template HOOK,KINETIC_TEXT,OUTRO_CTA');
    process.exit(2);
  }
  process.stdout.write(JSON.stringify(buildTemplate(types), null, 2) + '\n');
  process.exit(0);
}

const schema = buildSchema();
const json = JSON.stringify(schema, null, 2) + '\n';

if (argv[0] === '--check') {
  const cur = fs.existsSync(SCHEMA_PATH) ? fs.readFileSync(SCHEMA_PATH, 'utf8') : '';
  if (cur !== json) {
    console.error(`✗ ${SCHEMA_PATH} is STALE — run: node scripts/gen-schema.mjs`);
    process.exit(1);
  }
  console.log(`✓ SCHEMA CHECK PASSED (${SCHEMA_PATH} matches the manifest; ${MANIFEST_TYPES.length} types)`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(SCHEMA_PATH), {recursive: true});
fs.writeFileSync(SCHEMA_PATH, json);
console.log(`✓ wrote ${SCHEMA_PATH} — ${MANIFEST_TYPES.length} types, draft-07 JSON Schema derived from the manifest.`);
