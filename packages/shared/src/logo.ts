// E-Alert mark, redrawn as vectors from the 2048 px source logo so the
// background can be transparent (it adapts to light and dark mode).
// Coordinates are relative to the rings' center; the viewBox is centered.

/** Ring color sampled from the source logo. Same in both modes. */
export const LOGO_CORAL = '#FA4F3B';

export const LOGO_VIEWBOX = '-560 -560 1120 1120';
export const LOGO_RING_WIDTH = 72;

/** Centerline radius and visible arc spans in degrees (clockwise from +x, y down). */
const RINGS: { r: number; spans: [number, number][] }[] = [
  { r: 512, spans: [[47.4, 134.8], [139.5, 220.5], [225.2, 330.3]] },
  { r: 369, spans: [[48.4, 134.7], [141.1, 218.9], [225.3, 331.1]] },
  { r: 226, spans: [[50.5, 134.3], [144.9, 215.1], [225.7, 309.5]] },
];

const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
};

/** Stroke these with LOGO_CORAL, width LOGO_RING_WIDTH, butt caps. */
export const LOGO_ARCS: string[] = RINGS.flatMap(({ r, spans }) =>
  spans.map(([a0, a1]) => `M ${pt(r, a0)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${pt(r, a1)}`),
);

/** Location pin with a hole. Fill with the text color, fill-rule evenodd. */
export const LOGO_PIN: string = (() => {
  const cx = -20, cy = -26, R = 68, tipY = 112, hole = 30;
  const d = tipY - cy;
  const beta = (Math.acos(R / d) * 180) / Math.PI; // angle between "down" and each tangent point
  const right = 90 - beta;
  const left = 90 + beta;
  const p = (deg: number, r = R) => {
    const a = (deg * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  };
  const outline = `M ${cx} ${tipY} L ${p(right)} A ${R} ${R} 0 1 0 ${p(left)} Z`;
  const ring = `M ${cx + hole} ${cy} A ${hole} ${hole} 0 1 0 ${cx - hole} ${cy} A ${hole} ${hole} 0 1 0 ${cx + hole} ${cy} Z`;
  return `${outline} ${ring}`;
})();
