import test from "node:test";
import assert from "node:assert/strict";
import {
  Simulation,
  BLOCK_SPEED,
  EDGES,
  type MovingBlock,
} from "../src/simulation";
import { BoardLayout } from "../src/boardLayout";
import { levels, type Route } from "../src/levels";
for (const level of levels) {
  test(`Speed ${level.id}: same arc lengths in model and canvas; 64 u/s on every edge`, () => {
    const sim = new Simulation(level),
      view = new BoardLayout(level);
    for (const edge of EDGES) {
      const path = sim.paths[edge];
      assert.equal(path.length, view.paths[edge].length);
      for (const fraction of [0.05, 0.2, 0.5, 0.8, 0.95]) {
        const distance = path.length * fraction,
          dt = 1 / 240,
          a = view.paths[edge].point(distance),
          b = view.paths[edge].point(distance + BLOCK_SPEED * dt);
        const measured = Math.hypot(b.x - a.x, b.y - a.y) / dt;
        assert.ok(
          Math.abs(measured - BLOCK_SPEED) < 0.02,
          `${edge}: ${measured}`,
        );
      }
    }
  });
  test(`Speed ${level.id}: constant distance per second across both junction states and frame rates`, () => {
    for (const route of ["GREEN", "YELLOW"] as Route[])
      for (const edge of EDGES) {
        const sim = new Simulation({ ...level, containers: [] });
        if (sim.route !== route) sim.toggle();
        const block: MovingBlock = {
          id: 1,
          color: "red",
          segment: edge,
          distance: sim.paths[edge].length - 0.2,
          crossings: 0,
          distanceTraveled: 0,
        };
        sim.blocks = [block];
        const before = sim.paths[edge].point(block.distance),
          node = sim.paths[edge].point(sim.paths[edge].length);
        sim.step(0.01);
        assert.equal(block.segment, sim.next(edge));
        assert.ok(Math.abs(block.distance - 0.44) < 1e-6);
        const after = sim.paths[block.segment].point(block.distance);
        const actualDistance =
          Math.hypot(before.x - node.x, before.y - node.y) +
          Math.hypot(after.x - node.x, after.y - node.y);
        assert.ok(Math.abs(actualDistance / 0.01 - BLOCK_SPEED) < 0.02);
        assert.ok(
          Math.abs(block.distanceTraveled! / 0.01 - BLOCK_SPEED) < 1e-8,
        );
        for (const dt of [1 / 30, 1 / 60, 1 / 144, 0.12, 0.003, 0.8]) {
          const prior = block.distanceTraveled!;
          sim.step(dt);
          assert.ok(
            Math.abs((block.distanceTraveled! - prior) / dt - BLOCK_SPEED) <
              1e-7,
          );
        }
      }
  });
}
