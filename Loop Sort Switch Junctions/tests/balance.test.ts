import test from "node:test";
import assert from "node:assert/strict";
import { levels } from "../src/levels";
import { Simulation } from "../src/simulation";
import { protectedBalance } from "./protected-balance";
const targets: Record<number, [number, number, number, number]> = {
  5: [5, 5, 3, 4],
  7: [3, 3, 4, 4],
  8: [4, 4, 4, 5],
  9: [5, 5, 4, 5],
  10: [6, 6, 4, 5],
};
for (const [idString, [containers, colors, depth, belt]] of Object.entries(
  targets,
)) {
  const id = Number(idString);
  test(`Balance ${id}: exact requested counts, colors, depths, and mixed starts`, () => {
    const level = levels[id - 1],
      sim = new Simulation(level);
    assert.equal(level.containers.length, containers);
    assert.equal(level.capacity, belt);
    const counts = sim.colorCounts(),
      present = Object.values(counts).filter((n) => n > 0);
    assert.equal(present.length, colors);
    assert.ok(present.every((n) => n === depth));
    for (const c of level.containers) {
      assert.equal(c.capacity, depth);
      assert.equal(c.orderedBlocks.length, depth);
      assert.ok(new Set(c.orderedBlocks).size > 1);
    }
    assert.equal(sim.completed, 0);
  });
}
for (const old of protectedBalance)
  test(`Balance ${old.id}: protected level is unchanged`, () => {
    const current = levels[old.id - 1];
    assert.deepEqual(
      {
        id: current.id,
        capacity: current.capacity,
        initialJunctionState: current.initialJunctionState,
        containers: current.containers,
      },
      old,
    );
  });
