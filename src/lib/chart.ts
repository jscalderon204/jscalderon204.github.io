/* Tiny build-time chart math. No runtime dependency, charts render to static
   SVG/HTML at build and ship zero JS. */

/** A linear scale: maps [d0,d1] (data) to [r0,r1] (pixels). */
export function linear(d0: number, d1: number, r0: number, r1: number) {
  const m = (r1 - r0) / (d1 - d0 || 1);
  return (x: number) => r0 + (x - d0) * m;
}

/** "Nice" rounded tick values across [min,max]. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  const span = max - min || 1;
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0 / mag;
  const step = (norm >= 7.5 ? 10 : norm >= 3.5 ? 5 : norm >= 1.5 ? 2 : 1) * mag;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= max + 1e-9; t += step) {
    ticks.push(+t.toFixed(10));
  }
  return ticks;
}

/** Build an SVG path `d` string from [x,y] points (straight segments). */
export function linePath(pts: Array<[number, number]>): string {
  return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
}
