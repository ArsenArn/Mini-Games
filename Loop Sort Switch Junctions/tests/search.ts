import { Simulation } from "../src/simulation";
import { type Level, levels } from "../src/levels";
// Search states share immutable geometry; only mutable gameplay fields are copied.
// Exact solutions are replayed with a fresh, ordinary Simulation in the tests.
export function copyForSearch(sim: Simulation): Simulation {
  const next = Object.assign(
    Object.create(Simulation.prototype),
    sim,
  ) as Simulation;
  next.containers = sim.containers.map((c) => ({
    ...c,
    orderedBlocks: [...c.orderedBlocks],
  }));
  next.blocks = sim.blocks.map((b) => ({ ...b }));
  next.junctions = sim.junctions.map((j) => ({ ...j }));
  next.events = [];
  return next;
}
// A player can wait for a busy physical entry without changing either arrow.
export function releaseWhenClear(sim: Simulation, index: number): boolean {
  const c = sim.containers[index];
  if (
    !c ||
    c.isCompleted ||
    !c.orderedBlocks.length ||
    sim.blocks.length >= sim.level.capacity
  )
    return false;
  for (let i = 0; i <= 160; i++) {
    if (sim.canRelease(index)) return sim.release(index);
    sim.step(0.05);
  }
  return false;
}
export function findSolution(
  level: Level,
  delay: number | number[] = 40,
  maxNodes = 80000,
) {
  if (level.containers.length >= 5) {
    const guided=findGuidedSolution(level,delay,Math.min(maxNodes,12000));
    if(guided)return guided;
  }
  const root = new Simulation(level);
  const queue: { sim: Simulation; actions: number[] }[] = [
    { sim: root, actions: [] },
  ];
  const seen = new Set<string>();
  for (let head = 0; head < queue.length && head < maxNodes; head++) {
    const { sim, actions } = queue[head];
    if (sim.won) return { actions, visited: head + 1 };
    if (actions.length >= 40) continue;
    for (let i = 0; i < sim.containers.length; i++) {
      const next = copyForSearch(sim);
      if (!releaseWhenClear(next, i)) continue;
      const waits = Array.isArray(delay) ? delay : [delay];
      next.step(waits[actions.length % waits.length]);
      // Settled-state abstraction: only stranded blocks remain after a long wait.
      // Replay at several delays is tested separately, including exact distances.
      const key =
        (Array.isArray(delay) ? (actions.length + 1) % delay.length : 0) +
        ":" +
        next.route +
        "|" +
        next.containers.map((c) => c.orderedBlocks.join(",")).join("|") +
        "|" +
        next.blocks
          .map((b) => b.color)
          .sort()
          .join(",");
      if (seen.has(key)) continue;
      seen.add(key);
      next.events = [];
      queue.push({ sim: next, actions: [...actions, i] });
    }
  }
  return null;
}
// Weighted best-first search for larger palettes. It is a heuristic, not a
// shortest-path proof. All returned actions still use release()/step().
export function findGuidedSolution(
  level: Level,
  delay: number | number[] = 40,
  maxNodes = 80000,
) {
  type Node = {
    sim: Simulation;
    actions: number[];
    priority: number;
    order: number;
  };
  const waits = Array.isArray(delay) ? delay : [delay],
    heap: Node[] = [];
  let serial = 0;
  const less = (a: Node, b: Node) =>
    a.priority < b.priority || (a.priority === b.priority && a.order < b.order);
  const push = (n: Node) => {
    heap.push(n);
    let i = heap.length - 1;
    while (i) {
      const parent = (i - 1) >> 1;
      if (!less(heap[i], heap[parent])) break;
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    }
  };
  const pop = () => {
    const n = heap[0],
      last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      while (true) {
        let best = i,
          left = i * 2 + 1,
          right = left + 1;
        if (left < heap.length && less(heap[left], heap[best])) best = left;
        if (right < heap.length && less(heap[right], heap[best])) best = right;
        if (best === i) break;
        [heap[i], heap[best]] = [heap[best], heap[i]];
        i = best;
      }
    }
    return n;
  };
  const heuristic = (s: Simulation) =>
    s.containers.reduce((sum, c) => {
      let suffix = 0;
      for (
        let i = c.orderedBlocks.length - 1;
        i >= 0 &&
        c.orderedBlocks[i] === c.orderedBlocks[c.orderedBlocks.length - 1];
        i--
      )
        suffix++;
      return (
        sum +
        c.capacity -
        suffix +
        Math.max(0, new Set(c.orderedBlocks).size - 1) * 0.4
      );
    }, 0) +
    s.blocks.length * 0.35;
  push({
    sim: new Simulation(level),
    actions: [],
    priority: 0,
    order: serial++,
  });
  const seen = new Map<string, number>();
  for (let visited = 1; heap.length && visited <= maxNodes; visited++) {
    const { sim, actions } = pop();
    if (sim.won) return { actions, visited };
    if (actions.length >= 72) continue;
    for (let i = 0; i < sim.containers.length; i++) {
      const next = copyForSearch(sim);
      if (!releaseWhenClear(next, i)) continue;
      next.step(waits[actions.length % waits.length]);
      if (next.stalled) continue;
      const moves = actions.length + 1,
        key =
          (moves % waits.length) +
          ":" +
          next.route +
          "|" +
          next.containers.map((c) => c.orderedBlocks.join(",")).join("|") +
          "|" +
          next.blocks
            .map((b) => b.color)
            .sort()
            .join(",");
      if ((seen.get(key) ?? Infinity) <= moves) continue;
      seen.set(key, moves);
      next.events = [];
      push({
        sim: next,
        actions: [...actions, i],
        priority: moves * 0.75 + heuristic(next) * 2,
        order: serial++,
      });
    }
  }
  return null;
}
if (process.argv[1]?.endsWith("search.ts"))
  for (const level of levels) {
    const result = findSolution(level);
    if (!result)
      throw new Error(`No AUTO solution found for level ${level.id}`);
    console.log(level.id, {
      ...result,
      actions: result.actions.map((i) => level.containers[i].id),
    });
  }
