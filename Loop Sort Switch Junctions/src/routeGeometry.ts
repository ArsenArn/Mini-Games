import { type EdgeId, type Level, type Point } from "./levels";
// One arc-length geometry is shared by simulation and rendering.
export class ArcLengthPath {
  readonly samples: { p: Point; distance: number }[] = [];
  readonly length: number;
  constructor(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    start: number,
    end: number,
    first: Point,
    last: Point,
  ) {
    let distance = 0,
      prev = first;
    for (let i = 0; i <= 240; i++) {
      const angle = start + ((end - start) * i) / 240;
      const p =
        i === 0
          ? first
          : i === 240
            ? last
            : { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
      distance += Math.hypot(p.x - prev.x, p.y - prev.y);
      this.samples.push({ p, distance });
      prev = p;
    }
    this.length = distance;
  }
  point(distance: number): Point {
    const d = Math.max(0, Math.min(this.length, distance));
    let low = 1,
      high = this.samples.length - 1;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (this.samples[mid].distance < d) low = mid + 1;
      else high = mid;
    }
    const a = this.samples[low - 1],
      b = this.samples[low],
      t = (d - a.distance) / (b.distance - a.distance || 1);
    return { x: a.p.x + (b.p.x - a.p.x) * t, y: a.p.y + (b.p.y - a.p.y) * t };
  }
  section(from = 0, to = this.length): Point[] {
    const count = Math.max(2, Math.ceil(Math.abs(to - from) / 3));
    return Array.from({ length: count + 1 }, (_, i) =>
      this.point(from + ((to - from) * i) / count),
    );
  }
}
export class RouteGeometry {
  readonly paths: Record<EdgeId, ArcLengthPath>;
  readonly junctions: Point[];
  constructor(level: Pick<Level, "layout">) {
    const specs = {
      twins: { a: [155, 320, 114], b: [265, 320, 114], scale: 118 / 114 },
      wideLens: { a: [158, 320, 114], b: [262, 320, 114], scale: 118 / 114 },
      figureEight: { a: [140, 320, 104], b: [280, 320, 104], scale: 134 / 104 },
      largeSmall: { a: [151, 320, 119], b: [288, 320, 78], scale: 1.05 },
      verticalShift: { a: [160, 282, 106], b: [245, 355, 109], scale: 1.02 },
      diagonal: { a: [140, 292, 112], b: [270, 350, 94], scale: 1 },
      stacked: { a: [210, 264, 110], b: [210, 390, 86], scale: 1 },
      crossRouting: { a: [150, 304, 112], b: [266, 336, 98], scale: 1.08 },
      advancedCross: { a: [150, 300, 116], b: [270, 350, 91], scale: 0.95 },
      masterEight: { a: [142, 314, 106], b: [278, 327, 100], scale: 1.18 },
    };
    const { a, b, scale } = specs[level.layout];
    const dx = b[0] - a[0],
      dy = b[1] - a[1],
      d = Math.hypot(dx, dy);
    if (d >= a[2] + b[2] || d <= Math.abs(a[2] - b[2]))
      throw new Error("Layout needs exactly two circle intersections");
    const along = (a[2] * a[2] - b[2] * b[2] + d * d) / (2 * d),
      h = Math.sqrt(a[2] * a[2] - along * along);
    const middle = { x: a[0] + (along * dx) / d, y: a[1] + (along * dy) / d };
    const raw = [
      { x: middle.x - (h * dy) / d, y: middle.y + (h * dx) / d },
      { x: middle.x + (h * dy) / d, y: middle.y - (h * dx) / d },
    ].sort((p, q) => (Math.abs(p.y - q.y) < 1e-6 ? p.x - q.x : p.y - q.y));
    const toScreen = (p: Point): Point => ({
      x: p.x,
      y: 320 + (p.y - 320) * scale,
    });
    const [first, last] = raw.map(toScreen);
    const angle = (center: number[], p: Point) =>
      Math.atan2(p.y - center[1], p.x - center[0]);
    const arc = (
      center: number[],
      from: number,
      to: number,
      first: Point,
      last: Point,
    ) => {
      while (to >= from) to -= Math.PI * 2;
      return new ArcLengthPath(
        center[0],
        320 + (center[1] - 320) * scale,
        center[2],
        center[2] * scale,
        from,
        to,
        first,
        last,
      );
    };
    const aa = angle(a, raw[0]),
      ab = angle(a, raw[1]),
      ba = angle(b, raw[0]),
      bb = angle(b, raw[1]);
    this.paths = {
      A0: arc(a, aa, ab, first, last),
      A1: arc(a, ab, aa, last, first),
      B0: arc(b, ba, bb, first, last),
      B1: arc(b, bb, ba, last, first),
    };
    this.junctions = [first, last];
  }
}
