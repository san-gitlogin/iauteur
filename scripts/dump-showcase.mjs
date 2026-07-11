// AUTHORITATIVE showcase dump. Bundles a tiny entry that imports the REAL
// `showcaseScenes` export from src/showcaseSpec.ts (via esbuild, so TS + imports
// resolve) and writes audit/showcase-scenes.json. This replaces all regex parsing
// of source text — the renderer (matrix-shots.mjs) and the labels now share ONE
// source of truth. react/remotion are marked external (only loaded, never exercised).
//   node scripts/dump-showcase.mjs
import esbuild from 'esbuild';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const tmp = path.resolve('scripts/_dump.cjs');
await esbuild.build({
  stdin: {
    contents: `
      const {showcaseScenes} = require('../src/showcaseSpec');
      const fs = require('fs');
      fs.writeFileSync('audit/showcase-scenes.json', JSON.stringify(showcaseScenes, null, 2));
      console.log('SCENES ' + showcaseScenes.length);
    `,
    resolveDir: path.resolve('scripts'),
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: tmp,
  external: ['react', 'react-dom', 'remotion', '@remotion/*'],
  loader: {'.json': 'json'},
  logLevel: 'warning',
});

const require = createRequire(import.meta.url);
require(tmp);
fs.rmSync(tmp, {force: true});
console.log('wrote audit/showcase-scenes.json');
