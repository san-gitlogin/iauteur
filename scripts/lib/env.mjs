// Channel identity for the Node scripts, read from the gitignored `.env`.
// Mirrors scripts/ai/provider.py's loader: stdlib only, and a real process env
// var always wins over the file, so a one-off override needs no edit.
//
// Why .env and not a tracked file: this repo is public. The channel name is
// the owner's identity, not the project's — keeping it here means a fork
// inherits the "YOUR CHANNEL" placeholder instead of somebody else's brand.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
let loaded = false;

export function loadEnv(file = path.join(ROOT, '.env')) {
  if (loaded) return;
  loaded = true;
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return; // no .env is normal — the defaults below are the shipped behaviour
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const eq = line.indexOf('=');
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) process.env[key] = val;
  }
}

// Lands in brand.channel on every scaffolded spec, and is the name the upload
// kit writes into the description.
export function channelName() {
  loadEnv();
  return (process.env.IAUTEUR_CHANNEL || '').trim() || 'YOUR CHANNEL';
}

// The brand.logo asset ref. Default points at public/assets/channel_logo.png —
// overwriting that file rebrands every video at once, so most setups never
// need to set this.
export function channelLogo() {
  loadEnv();
  return (process.env.IAUTEUR_CHANNEL_LOGO || '').trim() || 'img:channel_logo.png';
}
