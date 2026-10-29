import { BLOCK_WIDTH, BLOCK_HEIGHT } from "./blockShape";
import {
  COLORS,
  SYMBOLS,
  ROUTE_COLORS,
  type Point,
  type EdgeId,
  type Route,
} from "./levels";
import { Simulation, type GameEvent } from "./simulation";
import { EDGES } from "./geometry";
import { BoardLayout, CONTAINER_SIZE } from "./boardLayout";
const PALETTE = {
  A: { rail: "#66899b", deck: "#293f52" },
  B: { rail: "#8782a4", deck: "#37354e" },
};
export class Renderer {
  private seen = new Set<string>();
  private clock = 0;
  private layout?: BoardLayout;
  private levelId = 0;
  private effects: {
    event: Extract<GameEvent, { kind: "release" | "receive" }>;
    start: number;
  }[] = [];
  readonly measuredSpeeds = new Map<number, number>();
  private previousDistances = new Map<
    number,
    { distance: number; time: number }
  >();
  private angles = new Map<string, number>();
  private previousRoute?: Route;
  private switchedAt = -10;
  constructor(private ctx: CanvasRenderingContext2D) {}
  private round(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: string,
  ) {
    const c = this.ctx;
    c.beginPath();
    c.roundRect(x, y, w, h, r);
    c.fillStyle = fill;
    c.fill();
  }
  private text(label: string, x: number, y: number, color: string, size = 11) {
    const c = this.ctx;
    c.font = `600 ${size}px system-ui`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = color;
    c.fillText(label, x, y);
  }
  private stroke(
    points: Point[],
    color: string,
    width: number,
    cap: CanvasLineCap = "round",
  ) {
    const c = this.ctx;
    c.beginPath();
    points.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
    c.lineWidth = width;
    c.lineCap = cap;
    c.lineJoin = "round";
    c.strokeStyle = color;
    c.stroke();
  }
  private belt(
    points: Point[],
    edge: EdgeId,
    active: boolean,
    route: Route,
    cap: CanvasLineCap = "round",
  ) {
    const palette = PALETTE[edge[0] as "A" | "B"];
    this.stroke(points, "#100e2090", 30, cap);
    this.stroke(
      points,
      active ? ROUTE_COLORS[route] + "ac" : palette.rail,
      26,
      cap,
    );
    this.stroke(points, palette.deck, 21, cap);
  }
  draw(sim: Simulation, dt: number, debug: boolean) {
    if (!this.layout || this.levelId !== sim.level.id) {
      this.layout = new BoardLayout(sim.level);
      this.levelId = sim.level.id;
    }
    const layout = this.layout,
      c = this.ctx;
    this.clock += dt;
    c.clearRect(0, 0, 420, 640);
    if (this.previousRoute !== sim.route) {
      if (this.previousRoute) this.switchedAt = this.clock;
      this.previousRoute = sim.route;
    }
    const activeLetter = sim.route === "GREEN" ? "A" : "B";
    for (const event of sim.events) {
      if (event.kind === "junction") continue;
      const key = event.kind + event.blockId;
      if (!this.seen.has(key)) {
        this.seen.add(key);
        this.effects.push({ event, start: this.clock });
      }
    }
    this.effects = this.effects.filter((e) => this.clock - e.start < 0.55);
    // Docking necks align containers with their exact display interaction points.
    for (const box of sim.containers) {
      const point = layout.interaction(box),
        pos = layout.containers.get(box.id)!,
        mouth = {
          x: pos.x,
          y:
            pos.y +
            ((box.opening === "bottom" ? 1 : -1) * CONTAINER_SIZE.height) / 2,
        };
      this.stroke([mouth, point], "#625577", 18);
      this.stroke([mouth, point], "#30293f", 12);
      this.round(point.x - 11, point.y - 4, 22, 8, 3, "#9788b0");
    }
    // Draw the inactive loop first, then the active loop. Each is a single oval,
    // with a constant-width deck and deliberately sparse secondary chevrons.
    const order = [...EDGES].sort(
      (a, b) => Number(a[0] === activeLetter) - Number(b[0] === activeLetter),
    );
    for (const edge of order) {
      const path = layout.paths[edge];
      this.belt(path.section(), edge, edge[0] === activeLetter, sim.route);
      for (
        let distance = 24 + ((sim.time * 10) % 72);
        distance < path.length - 24;
        distance += 72
      ) {
        const p = path.point(distance),
          q = path.point(distance + 2);
        c.save();
        c.translate(p.x, p.y);
        c.rotate(Math.atan2(q.y - p.y, q.x - p.x));
        this.stroke(
          [
            { x: -3, y: -2.5 },
            { x: 0, y: 0 },
            { x: -3, y: 2.5 },
          ],
          "#c6ced94a",
          1.2,
        );
        c.restore();
      }
      if (debug) {
        const p = path.point(path.length * 0.5);
        this.text(edge, p.x, p.y - 23, "#d8d3e5", 10);
      }
    }
    for (const [index, j] of sim.junctions.entries()) {
      const outgoing = j.selectedOutgoingRoute;
      const incoming = j.incoming.find((edge) => edge[0] === outgoing[0])!;
      const before = layout.paths[incoming],
        after = layout.paths[outgoing];
      const bridge = [
        ...before.section(before.length - 32, before.length),
        ...after.section(0, 32).slice(1),
      ];
      // Local opaque separation + a small cast shadow cut the lower belt beneath
      // the selected upper belt. This is a shared routing node, not a tunnel.
      c.save();
      c.shadowColor = "#0a081dda";
      c.shadowBlur = 5;
      c.shadowOffsetY = 4;
      this.stroke(bridge, "#211c36", 34, "butt");
      c.restore();
      this.belt(bridge, outgoing, true, sim.route, "butt");
      const flash = Math.max(0, 1 - (this.clock - this.switchedAt) / 0.35);
      c.save();
      c.globalAlpha = 0.3 + flash * 0.15;
      this.stroke(after.section(0, 84), ROUTE_COLORS[sim.route], 7);
      c.restore();
      if (debug) {
        const p = layout.junctions[index];
        this.text(`${j.id} → ${outgoing}`, p.x, p.y - 32, "#d5c4e6", 9);
      }
    }
    // The model and canvas now use exactly the same arc-length units.
    for (const b of sim.blocks) {
      const previous = this.previousDistances.get(b.id),
        traveled = b.distanceTraveled ?? 0;
      if (previous && sim.time > previous.time)
        this.measuredSpeeds.set(
          b.id,
          (traveled - previous.distance) / (sim.time - previous.time),
        );
      if (!previous || sim.time > previous.time)
        this.previousDistances.set(b.id, {
          distance: traveled,
          time: sim.time,
        });
      const path = sim.paths[b.segment],
        d = b.distance,
        p = path.point(d),
        a = path.point(d - 2),
        q = path.point(d + 2);
      c.save();
      c.translate(p.x, p.y);
      c.rotate(Math.atan2(q.y - a.y, q.x - a.x));
      this.round(
        -BLOCK_WIDTH / 2 - 1,
        -BLOCK_HEIGHT / 2,
        BLOCK_WIDTH + 2,
        BLOCK_HEIGHT + 2,
        5,
        "#0e0b20cc",
      );
      this.round(
        -BLOCK_WIDTH / 2,
        -BLOCK_HEIGHT / 2,
        BLOCK_WIDTH,
        BLOCK_HEIGHT,
        5,
        COLORS[b.color],
      );
      this.stroke(
        [
          { x: -7, y: -6 },
          { x: 7, y: -6 },
        ],
        "#ffffff60",
        2,
      );
      c.restore();
      if (debug) this.text("#" + b.id, p.x, p.y - 20, "#f1eaff", 9);
    }
    for (const [index, j] of sim.junctions.entries()) {
      const p = layout.junctions[index],
        q = layout.paths[j.selectedOutgoingRoute].point(20),
        target = Math.atan2(q.y - p.y, q.x - p.x);
      let angle = this.angles.get(j.id) ?? target;
      const delta = Math.atan2(
        Math.sin(target - angle),
        Math.cos(target - angle),
      );
      angle += delta * Math.min(1, dt * 16);
      this.angles.set(j.id, angle);
      c.save();
      c.translate(p.x, p.y);
      c.rotate(angle);
      c.beginPath();
      c.moveTo(-8, -2.6);
      c.lineTo(3, -2.6);
      c.lineTo(3, -6);
      c.lineTo(12, 0);
      c.lineTo(3, 6);
      c.lineTo(3, 2.6);
      c.lineTo(-8, 2.6);
      c.closePath();
      c.fillStyle = "#ff8289";
      c.fill();
      c.strokeStyle = "#421d32";
      c.lineWidth = 1;
      c.stroke();
      c.restore();
    }
    for (const [index, box] of sim.containers.entries()) {
      const { x, y } = this.layout!.containers.get(box.id)!,
        w = CONTAINER_SIZE.width,
        h = CONTAINER_SIZE.height;
      this.round(
        x - w / 2 - 3,
        y - h / 2 - 3,
        w + 6,
        h + 6,
        11,
        box.isCompleted ? "#75d6a3" : "#74619f",
      );
      this.round(x - w / 2, y - h / 2, w, h, 8, "#41365f");
      this.round(x - w / 2 + 5, y - h / 2 + 5, w - 10, h - 10, 4, "#27203d");
      const slot = (h - 16) / box.capacity;
      for (let i = 0; i < box.capacity; i++) {
        const sy =
          box.opening === "bottom"
            ? y + h / 2 - 8 - slot * (i + 1)
            : y - h / 2 + 8 + slot * i;
        this.round(x - w / 2 + 8, sy + 1, w - 16, slot - 3, 4, "#493d63");
        const color = box.orderedBlocks[i];
        if (color) {
          this.round(x - w / 2 + 8, sy + 1, w - 16, slot - 3, 4, COLORS[color]);
          this.text(SYMBOLS[color], x, sy + slot / 2, "#ffffffb0", 12);
          if (i === 0 && !box.isCompleted) {
            c.strokeStyle = "#fff4db";
            c.lineWidth = 2;
            c.beginPath();
            c.roundRect(x - w / 2 + 7, sy, w - 14, slot - 1, 4);
            c.stroke();
          }
        }
      }
      const mouth = box.opening === "bottom" ? y + h / 2 : y - h / 2;
      if (box.isCompleted) {
        this.round(x - w / 2 - 2, mouth - 5, w + 4, 10, 4, "#a1e4bf");
        this.round(x - 15, y - 14, 30, 28, 8, "#203c36ed");
        this.text("✓", x, y, "#b8ffda", 21);
      } else {
        this.round(x - 17, mouth - 3, 34, 6, 2, "#b9a5dc");
        this.text(
          box.opening === "bottom" ? "▼" : "▲",
          x,
          mouth + (box.opening === "bottom" ? 15 : -15),
          "#c8b6e3",
          10,
        );
      }
      this.text(
        `${box.orderedBlocks.length}/${box.capacity}`,
        x,
        y + (box.opening === "bottom" ? -h / 2 - 12 : h / 2 + 12),
        box.isCompleted ? "#a9e1bf" : "#ab9cc5",
        10,
      );
      if (debug)
        this.text(box.id, x + (index % 2 ? 47 : -47), y, "#e3d4f8", 10);
    }
    for (const effect of this.effects) {
      const t = (this.clock - effect.start) / 0.55,
        box = sim.containers.find((b) => b.id === effect.event.containerId)!;
      const p = sim.paths[effect.event.segment].point(effect.event.distance),
        mouth = {
          x: this.layout!.containers.get(box.id)!.x,
          y:
            this.layout!.containers.get(box.id)!.y +
            ((box.opening === "top" ? -1 : 1) * CONTAINER_SIZE.height) / 2,
        };
      const from = effect.event.kind === "release" ? mouth : p,
        to = effect.event.kind === "release" ? p : mouth;
      for (let i = 0; i < 3; i++) {
        const u = Math.min(1, Math.max(0, t * 1.6 - i * 0.13)),
          x = from.x + (to.x - from.x) * u,
          y = from.y + (to.y - from.y) * u;
        c.globalAlpha = Math.max(0, 1 - t);
        this.round(x - 4 + i * 2, y - 4, 8, 8, 2, COLORS[effect.event.color]);
        c.globalAlpha = 1;
      }
    }
    if (debug)
      this.text(
        `t=${sim.time.toFixed(1)} · ${sim.route}`,
        210,
        630,
        "#a2d9c6",
        10,
      );
  }
}
