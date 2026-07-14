// SI-RESOLVE — validate/correct `si:<slug>` brand references against the
// simple-icons catalog installed LOCALLY in node_modules (no network). Powers
// ASSET_MATRIX mechanism 2: a wrong slug (typo) gets a fuzzy correction; a slug
// with no brand at all falls back to a lucide glyph suggestion. Lazy-loads the
// (large) catalog only on first use so the linter stays fast when a spec has no
// si: references.

let _slugs = null;   // Set<string> of valid slugs
let _titles = null;  // Map<lowercased title, slug>

const load = async () => {
  if (_slugs) return;
  const mod = await import('simple-icons');
  const icons = mod.default ?? mod;
  _slugs = new Set();
  _titles = new Map();
  for (const v of Object.values(icons)) {
    if (v && typeof v === 'object' && typeof v.slug === 'string') {
      _slugs.add(v.slug);
      if (typeof v.title === 'string') _titles.set(v.title.toLowerCase(), v.slug);
    }
  }
};

// classic Levenshtein (small strings, fine over ~3k slugs).
const lev = (a, b) => {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 3) return 99; // early out — too far
  const dp = Array.from({length: n + 1}, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
};

// resolveSi('si:githubb') → {ok:false, kind:'corrected', input, suggestion:'github'}
// resolveSi('si:github')  → {ok:true,  kind:'ok', slug:'github'}
// resolveSi('si:zzzzz')   → {ok:false, kind:'fallback', suggestion:'lucide:…'}
export const resolveSi = async (raw) => {
  await load();
  const input = String(raw ?? '').replace(/^si:/, '').trim().toLowerCase();
  if (!input) return {ok: false, kind: 'fallback', input, suggestion: 'lucide:box'};
  if (_slugs.has(input)) return {ok: true, kind: 'ok', slug: input};
  // exact title match (e.g. "node.js" → nodedotjs)
  if (_titles.has(input)) return {ok: false, kind: 'corrected', input, suggestion: _titles.get(input)};
  // fuzzy: closest slug within a small edit distance
  let best = null;
  let bestD = 99;
  const cap = Math.max(1, Math.min(3, Math.floor(input.length / 4)));
  for (const s of _slugs) {
    const d = lev(input, s);
    if (d < bestD) { bestD = d; best = s; if (d === 1) break; }
  }
  if (best && bestD <= cap) return {ok: false, kind: 'corrected', input, suggestion: best, distance: bestD};
  return {ok: false, kind: 'fallback', input, suggestion: 'lucide:box'};
};

// Convenience for callers that only need the count / preloaded set.
export const siCatalogSize = async () => { await load(); return _slugs.size; };
