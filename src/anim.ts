// Back-compat shim. The animation vocabulary now lives in src/motion/ (a
// curated, deterministic library). This file preserves the original four
// helpers so existing scenes/packs that `import {...} from '../anim'` keep
// working unchanged. Prefer importing from '../motion' in new code.
export {fadeUp, springPop, stackIn} from './motion/entrances';
export {counterValue} from './motion/numbers';
