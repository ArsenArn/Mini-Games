import { entryClear, planTraffic } from "./traffic";
import { COLORS } from "./levels";
import {
  type Color,
  type EdgeId,
  type Level,
  type Route,
  type ContainerConfig,
  type JunctionConfig,
} from "./levels";
import { RouteGeometry, type ArcLengthPath } from "./routeGeometry";
export { EDGES, Path } from "./geometry";
export interface Container extends ContainerConfig {
  isCompleted: boolean;
}
export interface MovingBlock {
  id: number;
  color: Color;
  segment: EdgeId;
  distance: number;
  crossings: number;
  distanceTraveled?: number;
}
export interface Junction extends JunctionConfig {
  selectedOutgoingRoute: EdgeId;
}
export type GameEvent =
  | {
      kind: "release" | "receive";
      blockId: number;
      color: Color;
      containerId: string;
      segment: EdgeId;
      distance: number;
      time: number;
    }
  | {
      kind: "junction";
      blockId: number;
      node: string;
      from: EdgeId;
      to: EdgeId;
      time: number;
    };
export const BLOCK_SPEED = 64;
const EPS = 1e-7;
export class Simulation {
  paths: Record<EdgeId, ArcLengthPath>;
  containers: Container[];
  junctions: Junction[];
  blocks: MovingBlock[] = [];
  route: Route;
  mode: "AUTO" | "MANUAL" = "AUTO";
  time = 0;
  actions = 0;
  nextId = 1;
  revision = 0;
  lastMessage = "";
  events: GameEvent[] = [];
  constructor(public level: Level) {
    const geometry = new RouteGeometry(level);
    this.paths = geometry.paths;
    this.route = level.initialJunctionState;
    this.containers = level.containers.map((c) => ({
      ...c,
      position: { ...c.position },
      interaction: { ...c.interaction },
      orderedBlocks: [...c.orderedBlocks],
      isCompleted: false,
    }));
    this.junctions = level.junctions.map((j, index) => ({
      ...j,
      position: geometry.junctions[index],
      selectedOutgoingRoute: j.outgoing[this.route],
    }));
    this.containers.forEach((c) => this.closeIfSorted(c));
  }
  get won() {
    return (
      this.blocks.length === 0 && this.containers.every((c) => c.isCompleted)
    );
  }
  get completed() {
    return this.containers.filter((c) => c.isCompleted).length;
  }
  next(segment: EdgeId): EdgeId {
    const j = this.junctions.find((j) => j.incoming.includes(segment));
    if (!j) throw new Error(`No junction after ${segment}`);
    return j.selectedOutgoingRoute;
  }
  toggle() {
    this.route = this.route === "GREEN" ? "YELLOW" : "GREEN";
    this.junctions.forEach(
      (j) => (j.selectedOutgoingRoute = j.outgoing[this.route]),
    );
    this.revision++;
  }
  private emit(event: GameEvent) {
    this.events.push(event);
    if (this.events.length > 180) this.events.shift();
  }
  private closeIfSorted(c: Container) {
    c.isCompleted =
      c.orderedBlocks.length === c.capacity &&
      c.orderedBlocks.every((color) => color === c.orderedBlocks[0]);
  }
  canReceive(c: Container, color: Color) {
    return (
      !c.isCompleted &&
      c.orderedBlocks.length < c.capacity &&
      (c.orderedBlocks.length === 0 || c.orderedBlocks[0] === color)
    );
  }
  canRelease(index: number): boolean {
    const c = this.containers[index];
    return (
      !!c &&
      !c.isCompleted &&
      c.orderedBlocks.length > 0 &&
      !this.won &&
      this.blocks.length < this.level.capacity &&
      entryClear(this, c)
    );
  }
  release(index: number): boolean {
    const c = this.containers[index];
    if (!c || c.isCompleted || !c.orderedBlocks.length || this.won)
      return false;
    if (this.blocks.length >= this.level.capacity) {
      this.lastMessage = "Belt full. Wait for space or restart.";
      return false;
    }
    if (!entryClear(this, c)) {
      this.lastMessage = "Entry busy. Wait for a gap.";
      return false;
    }
    const color = c.orderedBlocks.shift()!;
    const block: MovingBlock = {
      id: this.nextId++,
      color,
      segment: c.interaction.segment,
      distance: this.paths[c.interaction.segment].length * c.interaction.at,
      crossings: 0,
    };
    this.blocks.push(block);
    this.actions++;
    if (this.mode === "AUTO") this.toggle();
    this.emit({
      kind: "release",
      blockId: block.id,
      color,
      containerId: c.id,
      segment: block.segment,
      distance: block.distance,
      time: this.time,
    });
    this.lastMessage =
      "Block released. A matching container with space will collect it.";
    this.revision++;
    return true;
  }
  // Every arrival is handled in global chronological order. A long frame cannot
  // reorder two blocks competing for the same final container slot.
  step(dt: number) {
    if (!Number.isFinite(dt) || dt < 0) throw new Error("Invalid dt");
    const end = this.time + dt;
    while (this.time < end - EPS && this.blocks.length) {
      const traffic = planTraffic(this);
      if (!traffic.moving.size) break;
      let travel = Infinity;
      const arrivals = new Map<number, number>();
      for (const b of this.blocks) {
        if (!traffic.moving.has(b.id)) continue;
        let nearest = Math.min(
          this.paths[b.segment].length - b.distance,
          traffic.stops.get(b.id) ?? Infinity,
        );
        for (const c of this.containers) {
          const d = this.paths[b.segment].length * c.interaction.at;
          if (c.interaction.segment === b.segment && d > b.distance + EPS)
            nearest = Math.min(nearest, d - b.distance);
        }
        arrivals.set(b.id, nearest);
        travel = Math.min(travel, nearest);
      }
      const remaining = (end - this.time) * BLOCK_SPEED;
      if (travel > remaining + EPS) {
        this.blocks.forEach((b) => {
          if (!traffic.moving.has(b.id)) return;
          b.distance += remaining;
          b.distanceTraveled = (b.distanceTraveled ?? 0) + remaining;
        });
        this.time = end;
        break;
      }
      this.blocks.forEach((b) => {
        if (!traffic.moving.has(b.id)) return;
        b.distance += travel;
        b.distanceTraveled = (b.distanceTraveled ?? 0) + travel;
      });
      this.time += travel / BLOCK_SPEED;
      const accepted = new Set<number>();
      // Same-time ties use increasing block ID, independent of the frame rate.
      for (const b of [...this.blocks].sort((a, b) => a.id - b.id)) {
        if (
          !traffic.moving.has(b.id) ||
          Math.abs(arrivals.get(b.id)! - travel) > EPS
        )
          continue;
        const c = this.containers.find(
          (c) =>
            c.interaction.segment === b.segment &&
            Math.abs(
              this.paths[b.segment].length * c.interaction.at - b.distance,
            ) < EPS &&
            this.canReceive(c, b.color),
        );
        if (c) {
          c.orderedBlocks.unshift(b.color);
          this.closeIfSorted(c);
          accepted.add(b.id);
          this.emit({
            kind: "receive",
            blockId: b.id,
            color: b.color,
            containerId: c.id,
            segment: b.segment,
            distance: b.distance,
            time: this.time,
          });
          this.revision++;
          continue;
        }
        if (b.distance >= this.paths[b.segment].length - EPS) {
          const from = b.segment,
            j = this.junctions.find((j) => j.incoming.includes(from))!;
          b.segment = j.selectedOutgoingRoute;
          b.distance = 0;
          b.crossings++;
          this.emit({
            kind: "junction",
            blockId: b.id,
            node: j.id,
            from,
            to: b.segment,
            time: this.time,
          });
          this.revision++;
        }
      }
      this.blocks = this.blocks.filter((b) => !accepted.has(b.id));
    }
    this.time = end;
  }
  // A block may return to its own container after a lap. Interaction at exactly
  // the release point is skipped until it reaches that point again.
  canEventuallyReceive(block: MovingBlock) {
    let edge = block.segment;
    const seen = new Set<EdgeId>();
    while (!seen.has(edge)) {
      seen.add(edge);
      edge = this.next(edge);
    }
    return this.containers.some(
      (c) => seen.has(c.interaction.segment) && this.canReceive(c, block.color),
    );
  }
  get stalled() {
    return (
      !this.won &&
      this.blocks.length >= this.level.capacity &&
      !this.blocks.some((b) => this.canEventuallyReceive(b))
    );
  }
  colorCounts(): Record<Color, number> {
    const counts = Object.fromEntries(
      Object.keys(COLORS).map((color) => [color, 0]),
    ) as Record<Color, number>;
    this.containers.forEach((c) =>
      c.orderedBlocks.forEach((color) => counts[color]++),
    );
    this.blocks.forEach((b) => counts[b.color]++);
    return counts;
  }
  clone(): Simulation {
    const s = new Simulation(this.level);
    s.containers = this.containers.map((c) => ({
      ...c,
      orderedBlocks: [...c.orderedBlocks],
    }));
    s.blocks = this.blocks.map((b) => ({ ...b }));
    s.route = this.route;
    s.junctions = this.junctions.map((j) => ({ ...j }));
    s.mode = this.mode;
    s.time = this.time;
    s.actions = this.actions;
    s.nextId = this.nextId;
    return s;
  }
}
