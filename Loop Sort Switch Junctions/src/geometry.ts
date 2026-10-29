import { type Curve, type Point, type EdgeId } from "./levels";
export const EDGES: EdgeId[] = ["A0", "A1", "B0", "B1"];
export function bezier(c: Curve, t: number): Point {
  const u = 1 - t;
  return {
    x:
      u * u * u * c[0].x +
      3 * u * u * t * c[1].x +
      3 * u * t * t * c[2].x +
      t * t * t * c[3].x,
    y:
      u * u * u * c[0].y +
      3 * u * u * t * c[1].y +
      3 * u * t * t * c[2].y +
      t * t * t * c[3].y,
  };
}
// Arc-length lookup keeps movement speed constant on curved edges.
export class Path {
  samples: {
    p: Point;
    d: number;
  }[] = [];
  length = 0;
  constructor(public curve: Curve) {
    let prev = curve[0];
    for (let i = 0; i <= 240; i++) {
      const p = bezier(curve, i / 240);
      this.length += Math.hypot(p.x - prev.x, p.y - prev.y);
      this.samples.push({ p, d: this.length });
      prev = p;
    }
  }
  point(distance: number): Point {
    const d = Math.max(0, Math.min(this.length, distance));
    let lo = 1,
      hi = this.samples.length - 1;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (this.samples[m].d < d) lo = m + 1;
      else hi = m;
    }
    const a = this.samples[lo - 1],
      b = this.samples[lo],
      t = (d - a.d) / (b.d - a.d || 1);
    return { x: a.p.x + (b.p.x - a.p.x) * t, y: a.p.y + (b.p.y - a.p.y) * t };
  }
}
