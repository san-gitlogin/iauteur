// Shared variant-enum parser — used by BOTH the census gate (audit-census.mjs)
// and its self-test (audit-census-selftest.mjs). Extracting it means the
// self-test exercises the REAL parser: reverting the L-BK-1 regex fix breaks
// the test (an untested gate is an unverified claim about everything it guards).
//
// The linter emits `TYPE variant must be a/b/c` (and `... mode must be ...`).
// Enum lists use EITHER `/` OR `|` as the separator (both forms exist in
// lint-spec) — accept BOTH, or a `|`-separated list silently drops all but the
// first variant (defect L-BK-1: `GALLERY variant must be grid|clips` hid `clips`,
// shrinking the denominator while the gate reported green).
export function parseVariantEnums(lintText) {
  const uniq = (a) => [...new Set(a)];
  const variantsByType = {};
  for (const m of lintText.matchAll(/([A-Z0-9_]+) (?:variant|mode) must be ([a-z/|]+)/g)) {
    const [, ty, list] = m;
    variantsByType[ty] = uniq([...(variantsByType[ty] ?? []), ...list.split(/[/|]/)]);
  }
  return variantsByType;
}
