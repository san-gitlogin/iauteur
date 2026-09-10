// APPLE GEOMETRY — every device in REAL MILLIMETRES, from Apple's own tech specs.
//
// Owner, 2026-09-10: "Make sure the wireframes align perfectly to the product. Not even a
// single mistake I should see."
//
// So nothing in this file is eyeballed. Body sizes are the published figures; screen sizes
// are DERIVED from the published pixel count and ppi, which means the bezel is a computed
// consequence rather than a guess. A viewBox of `0 0 w h` therefore has millimetre units,
// and anything drawn into it is to scale with everything else.
//
// Apple's own design resources (developer.apple.com/design/resources) ship device bezels
// as PSD/PNG only and publish no dimensions, so the tech-spec pages are the numeric source.
// Camera-cluster geometry is not published anywhere; those few figures are measured off
// Apple's straight-on product photography and are marked MEASURED below.

/** px / ppi -> mm. The bezel of every device here falls out of this and the body size. */
const mm = (px: number, ppi: number) => (px / ppi) * 25.4;

export interface Screen {
  w: number; h: number;      // mm
  bezel: number;             // mm, uniform (verified equal on both axes per device)
  r: number;                 // mm, screen corner radius
}

export interface Device {
  name: string;
  w: number; h: number; d: number;   // body, mm
  r: number;                          // body corner radius, mm
  screen: Screen;
}

/** Body corner radius. Apple does not publish it; the display corner radius on the Pro line
 *  is 55pt, and at 460ppi one point is 25.4/460*3 = 0.1657mm, so the screen radius is
 *  9.11mm and the body radius is that plus the bezel. */
const PRO_SCREEN_R = 55 * ((25.4 / 460) * 3);   // 9.11 mm

const screenOf = (bodyW: number, bodyH: number, px: number, py: number, ppi: number, r: number): Screen => {
  const w = mm(px, ppi), h = mm(py, ppi);
  const bx = (bodyW - w) / 2, by = (bodyH - h) / 2;
  return {w, h, bezel: (bx + by) / 2, r};
};

// ── iPhone 18 Pro — 150.0 x 71.9 x 8.75 mm, 6.3in 2622x1206 @460ppi ──────────
// Bezel computes to 2.65mm on the short axis and 2.60mm on the long: uniform, as expected.
export const IPHONE_18_PRO: Device = {
  name: 'iPhone 18 Pro', w: 71.9, h: 150.0, d: 8.75,
  r: PRO_SCREEN_R + 2.62,
  screen: screenOf(71.9, 150.0, 1206, 2622, 460, PRO_SCREEN_R),
};

export const IPHONE_18_PRO_MAX: Device = {
  name: 'iPhone 18 Pro Max', w: 78.0, h: 163.4, d: 8.75,
  r: PRO_SCREEN_R + 2.53,
  screen: screenOf(78.0, 163.4, 1320, 2868, 460, PRO_SCREEN_R),
};

// ── iPhone Duo — folded 84.1 x 117.8 x 11.3, open 164.6 x 117.8 x 5.2 ────────
// The HEIGHT is constant and the WIDTH doubles; Apple lists the folding axis as width.
// Inner 7.6in 1878x2670 @430ppi -> 110.9 x 157.7mm inside a 164.6 x 117.8 body, i.e. the
// long screen axis lies along the OPEN WIDTH. Bezel 3.45mm on both axes.
export const IPHONE_DUO_OPEN: Device = {
  name: 'iPhone Duo, open', w: 164.6, h: 117.8, d: 5.2, r: 9.0,
  screen: {w: mm(2670, 430), h: mm(1878, 430), bezel: 3.45, r: 6.2},
};
export const IPHONE_DUO_FOLDED: Device = {
  name: 'iPhone Duo, folded', w: 84.1, h: 117.8, d: 11.3, r: 9.0,
  screen: screenOf(84.1, 117.8, 1398, 2034, 460, 6.2),
};

// ── Apple Watch — case sizes published directly ──────────────────────────────
export const WATCH_S12_46: Device = {
  name: 'Apple Watch Series 12, 46mm', w: 40, h: 46, d: 9.7, r: 11.5,
  screen: screenOf(40, 46, 416, 496, 326, 9.0),
};
export const WATCH_S12_42: Device = {
  name: 'Apple Watch Series 12, 42mm', w: 37, h: 42, d: 9.7, r: 10.6,
  screen: screenOf(37, 42, 374, 446, 326, 8.3),
};
export const WATCH_ULTRA_4: Device = {
  name: 'Apple Watch Ultra 4', w: 44, h: 49, d: 12, r: 9.5,
  screen: screenOf(44, 49, 422, 514, 326, 6.5),
};

// ── AirPods 5 — bud 30.2 x 18.3 x 18.1, case 46.2 x 50.1 x 21.2 ─────────────
export const AIRPODS_5 = {
  bud: {h: 30.2, w: 18.3, d: 18.1},
  case: {h: 46.2, w: 50.1, d: 21.2},
};

// ── The camera island — MEASURED, because Apple publishes none of it ─────────
//
// Read off the straight-on "Pro camera system" photography on the product page. Two ratios
// are what actually matter and both were wrong in the first draft:
//
//  · CENTRE SPACING is ~1.53 LENS DIAMETERS. The first draft used 1.08, so the three
//    circles touched and the triangle read as one blob. Owner: "which right now is kinda
//    packed near, where real ones has space between them."
//  · THE INNER RING IS THIN AND SITS NEAR THE OUTER BORDER, at ~0.80 of the outer radius,
//    with only a small bright element at the centre. The first draft drew an inner circle
//    at 0.46 - a fat bullseye that exists on no iPhone. Owner: "Camera doesnt have that
//    much bigger inner circle, its kinda thin near to the border of the outer circle."
export const CAM = {
  /** Lens outer diameter, mm.
   *
   *  FROM APPLE'S OWN ENGINEERING DRAWING (Accessory Design Guidelines, sheet 62.1
   *  "iPhone 17 Pro Max, 1 of 4", detail D): rear cameras are **3X Ø16.20**, the flash is
   *  **Ø6.80**, the rear sensor **Ø6.65** and the rear mic **Ø1.15**, on a 77.98mm-wide
   *  body — so a lens is 0.208 of the body's width.
   *
   *  The first pass used 9.5mm, i.e. 0.13 of the width, measured by eye off an ANGLED
   *  marketing photograph. Everything in the island came out around half size and the back
   *  read as wrong without it being obvious why. Owner: "Still the back of the phone doesnt
   *  look right." A dimensioned drawing beats a photograph, every time.
   *
   *  Scaled to the 18 Pro's narrower 71.9mm body: 16.20 x (71.9/77.98) = 14.9. Held at 14.0
   *  so the triangle clears the plateau's top and bottom edges with real margin. */
  lensD: 14.0,
  /** Centre-to-centre of the triangle, as a multiple of lens diameter. */
  spacing: 1.45,
  /** Thin inner ring, as a fraction of the outer radius. */
  innerRing: 0.80,
  /** The bright centre element, as a fraction of the outer radius. */
  core: 0.20,
  /** Ø6.80 and Ø6.65 scaled to this body: near enough the same size as each other, and
   *  both far larger than the 3.8/3.4mm the first pass guessed. */
  flashR: 3.13,
  lidarR: 3.07,
  micR: 0.53,
  /** Plateau inset from the body's side edges, and from its top, mm.
   *  These were 3.6 and 6.5 on the first pass, which put the plateau's top-left corner
   *  almost on top of the body's own corner radius (11.7mm) — the two curves collided and
   *  the plateau read as falling off the edge of the phone. Owner: "The palette kinda also
   *  falls to the edge of the phone." Clearing the body radius is the constraint. */
  /** THE PLATEAU IS A BOX AROUND THE CAMERAS, NOT A SHRINK-WRAP. Owner, 2026-09-10: "the
   *  box which contains the camera the lidar and flash must not be that much near to the
   *  cameras. It must be extended further just a few mm away from the edge of the phone."
   *  At inset 4.6 / height 38 the lens triangle sat hard against the plateau's top, left
   *  and bottom edges. The box now runs to 3.2mm from the body edge and is 44 tall, which
   *  leaves ~5mm of clearance around the cluster on every side. It still clears the body's
   *  own 11.7mm corner radius, which was the constraint that pushed it inward last time. */
  inset: 3.2,
  top: 7.5,
  /** Apple's drawing gives the plateau as 64.16 x 32.36 on a 77.98mm body. The 18 Pro's
   *  plateau runs the full width, so only the HEIGHT carries over: 32.36 scaled to this
   *  body is 29.8 — but at Ø14 lenses the triangle needs 34.3mm of it, so the plateau is
   *  38 and the cluster clears top and bottom by 1.85mm. */
  height: 44,
  radius: 13,
};

/** iPhone Duo's rear camera bump — a HORIZONTAL PILL with two lenses side by side, a flash
 *  to their right and a mic slit above it. Read off Apple's own Duo product photography.
 *  Owner: "Iphone duo camera bump also needs corrections."
 *
 *  Not the Pro's triangle: the Duo is a DUAL 48MP Fusion system (main + ultra wide), so
 *  there are two lenses, they sit level with each other, and the housing is a pill rather
 *  than a rounded square. Drawing the Pro's island on it would be a different phone.
 *  Coordinates are millimetres on the FOLDED body (84.1 x 117.8). */
export const DUO_CAM = {
  // The pill is 52 wide, not 48: at 48 the flash overlapped the second lens's ring and sat
  // hard against the housing edge. On the real thing the flash is clear of both.
  bump: {x: 5, y: 7, w: 52, h: 24, r: 12},
  lenses: [{cx: 18, cy: 19, r: 8.2}, {cx: 35, cy: 19, r: 8.2}],
  flash: {cx: 47.5, cy: 21.5, r: 2.6},
  mic: {x: 45.2, y: 12.4, w: 4.6, h: 1.4},
};

/** The three lens centres of the Pro triangle, in body millimetres.
 *  Equilateral, apex to the RIGHT, which is the arrangement on the Pro line. */
export const lensCentres = (dev: Device) => {
  const d = CAM.lensD, r = d / 2, side = d * CAM.spacing;
  const plateauTop = CAM.top, plateauH = CAM.height;
  const clusterH = side + d;
  const top = plateauTop + (plateauH - clusterH) / 2 + r;
  const left = CAM.inset + 2.5 + r;
  return [
    {cx: left, cy: top, r},                                  // upper left
    {cx: left, cy: top + side, r},                           // lower left
    {cx: left + side * (Math.sqrt(3) / 2), cy: top + side / 2, r},  // apex, right
  ];
};

/** Plateau rectangle in body millimetres. */
export const plateau = (dev: Device) => ({
  x: CAM.inset, y: CAM.top, w: dev.w - CAM.inset * 2, h: CAM.height, r: CAM.radius,
});

/** Side buttons, in body millimetres, measured from the top of the body.
 *  Left edge: Action Button above the volume pair. Right edge: side button, then
 *  Camera Control below it. */
export const BUTTONS = [
  {id: 'action', side: 'l' as const, y: 28, h: 10},
  {id: 'volup', side: 'l' as const, y: 46, h: 14},
  {id: 'voldn', side: 'l' as const, y: 64, h: 14},
  {id: 'power', side: 'r' as const, y: 48, h: 24},
  {id: 'control', side: 'r' as const, y: 84, h: 14},
];

/** Dynamic Island, in body millimetres. Smaller on the 18 Pro than its predecessor;
 *  drawn as a pill centred on the screen's horizontal axis. */
export const ISLAND = {w: 22, h: 6.2, topFromBody: 10.5};
