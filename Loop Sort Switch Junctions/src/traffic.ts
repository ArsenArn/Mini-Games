import type { Simulation, MovingBlock, Container } from "./simulation";
import { BLOCK_GAP, JUNCTION_CLEARANCE } from "./blockShape";
const EPS = 1e-7;
type State = Pick<Simulation, "blocks" | "paths" | "junctions">;
function insideNode(
  s: State,
  b: MovingBlock,
  node: State["junctions"][number],
) {
  return (
    (node.incoming.includes(b.segment) &&
      b.distance > s.paths[b.segment].length - JUNCTION_CLEARANCE + EPS) ||
    (Object.values(node.outgoing).includes(b.segment) &&
      b.distance < JUNCTION_CLEARANCE - EPS)
  );
}
export function entryClear(s: State, c: Container): boolean {
  const edge = c.interaction.segment,
    d = s.paths[edge].length * c.interaction.at,
    p = s.paths[edge].point(d);
  if (
    s.blocks.some((b) => {
      const q = s.paths[b.segment].point(b.distance);
      return Math.hypot(p.x - q.x, p.y - q.y) < BLOCK_GAP - EPS;
    })
  )
    return false;
  const spawn: MovingBlock = {
    id: -1,
    color: c.orderedBlocks[0],
    segment: edge,
    distance: d,
    crossings: 0,
  };
  return !s.junctions.some(
    (node) =>
      insideNode(s, spawn, node) &&
      s.blocks.some((b) => insideNode(s, b, node)),
  );
}
// Event-driven traffic: blocks move at the normal belt speed or wait. No
// positional corrections, teleports, frame-sized collision steps or speed easing.
export function planTraffic(s: State) {
  const stopped = new Set<number>();
  for (const node of s.junctions) {
    const inside = s.blocks
      .filter((b) => insideNode(s, b, node))
      .sort((a, b) => a.id - b.id);
    const atGate = s.blocks
      .filter(
        (b) =>
          node.incoming.includes(b.segment) &&
          Math.abs(
            b.distance - (s.paths[b.segment].length - JUNCTION_CLEARANCE),
          ) <= EPS,
      )
      .sort((a, b) => a.id - b.id);
    const owner = inside[0]?.id ?? atGate[0]?.id;
    for (const b of atGate) if (b.id !== owner) stopped.add(b.id);
  }
  const lanes = new Map<string, MovingBlock[]>();
  for (const b of s.blocks) {
    const lane = lanes.get(b.segment) ?? [];
    lane.push(b);
    lanes.set(b.segment, lane);
  }
  for (const lane of lanes.values()) {
    lane.sort((a, b) => b.distance - a.distance || a.id - b.id);
    for (let i = 1; i < lane.length; i++)
      if (
        stopped.has(lane[i - 1].id) &&
        lane[i - 1].distance - lane[i].distance <= BLOCK_GAP + EPS
      )
        stopped.add(lane[i].id);
  }
  const moving = new Set<number>(),
    stops = new Map<number, number>();
  for (const lane of lanes.values())
    for (let i = 0; i < lane.length; i++) {
      const b = lane[i];
      if (stopped.has(b.id)) continue;
      moving.add(b.id);
      let distance = Infinity;
      const gate = s.paths[b.segment].length - JUNCTION_CLEARANCE;
      if (b.distance < gate - EPS)
        distance = Math.min(distance, gate - b.distance);
      if (b.distance < JUNCTION_CLEARANCE - EPS)
        distance = Math.min(distance, JUNCTION_CLEARANCE - b.distance);
      if (i > 0 && stopped.has(lane[i - 1].id))
        distance = Math.min(
          distance,
          Math.max(0, lane[i - 1].distance - b.distance - BLOCK_GAP),
        );
      stops.set(b.id, distance);
    }
  return { moving, stops };
}
