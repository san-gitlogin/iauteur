## What this changes

<!-- One or two sentences. If it fixes an issue, say "Fixes #123". -->

## Why

<!-- The constraint you hit, or the defect you saw. This is the part future contributors read. -->

## What you looked at

<!-- REQUIRED for any component, layout or theme change: before/after stills.
     In this repo, tsc and the gate have never caught a visual defect — only looking has.
     Drag images straight into this box. Say which design pack and aspect each still is. -->

## Checks

- [ ] `npm run typecheck` clean
- [ ] `npm run gate` exits 0
- [ ] `npm run lint` adds no *new* rejections (old topics already have some)

For a component / layout / theme change, also:

- [ ] Theme tokens only — no hardcoded colour, font, radius or shadow
- [ ] Every pixel `× scale`
- [ ] Checked in **both** aspects (16:9 and 9:16)
- [ ] Checked in two opposite designs — `material` and `neobrutalism`
- [ ] Checked against **MIN / MAX / MIX** content, not just a happy demo
- [ ] Base visual on screen within 38 frames
- [ ] `interpolate` clamps both ends; no unseeded randomness

## Anything unresolved

<!-- Known limitations, things you chose not to do, questions for review.
     Saying "I'm not sure about X" is welcome and speeds up review. -->
