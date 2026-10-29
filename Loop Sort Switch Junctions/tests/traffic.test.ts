import test from "node:test";
import assert from "node:assert/strict";
import { Simulation, BLOCK_SPEED } from "../src/simulation";
import { levels } from "../src/levels";
import {
  BLOCK_WIDTH,
  BLOCK_HEIGHT,
  BLOCK_GAP,
  JUNCTION_CLEARANCE,
} from "../src/blockShape";
function merge() {
  const s = new Simulation({ ...levels[0], containers: [] });
  s.mode = "MANUAL";
  s.toggle();
  s.blocks = [
    {
      id: 1,
      color: "red",
      segment: "A0",
      distance: s.paths.A0.length - JUNCTION_CLEARANCE,
      crossings: 0,
    },
    {
      id: 2,
      color: "blue",
      segment: "B0",
      distance: s.paths.B0.length - JUNCTION_CLEARANCE,
      crossings: 0,
    },
  ];
  return s;
}
function separated(s: Simulation) {
  for (let i = 0; i < s.blocks.length; i++)
    for (let j = i + 1; j < s.blocks.length; j++) {
      const a = s.blocks[i],
        b = s.blocks[j],
        p = s.paths[a.segment].point(a.distance),
        q = s.paths[b.segment].point(b.distance);
      assert.ok(
        Math.hypot(p.x - q.x, p.y - q.y) >=
          Math.hypot(BLOCK_WIDTH, BLOCK_HEIGHT) - 0.05,
        `overlap #${a.id}/#${b.id}`,
      );
    }
}
test("moving blocks have compact proportions", () =>
  assert.ok(BLOCK_WIDTH / BLOCK_HEIGHT < 1.5));
test("rapid repeat release waits for space and never consumes or toggles on rejection", () => {
  const s = new Simulation(levels[2]);
  s.release(0);
  const c = s.colorCounts(),
    route = s.route,
    queue = [...s.containers[0].orderedBlocks];
  assert.equal(s.release(0), false);
  assert.equal(s.route, route);
  assert.deepEqual(s.containers[0].orderedBlocks, queue);
  assert.deepEqual(s.colorCounts(), c);
  s.step(0.6);
  assert.ok(s.release(0));
  separated(s);
});
test("simultaneous incoming blocks queue at a junction without overlapping or teleporting", () => {
  const s = merge();
  for (let i = 0; i < 200; i++) {
    s.step(0.02);
    separated(s);
  }
  assert.ok(s.blocks.every((b) => b.segment === "B1"));
  assert.ok(Math.abs(s.blocks[0].distance - s.blocks[1].distance) >= BLOCK_GAP);
});
test("waiting traffic is deterministic for large or small time steps", () => {
  const a = merge(),
    b = a.clone();
  a.step(4);
  for (let i = 0; i < 200; i++) b.step(0.02);
  for (let i = 0; i < 2; i++) {
    assert.equal(a.blocks[i].segment, b.blocks[i].segment);
    assert.ok(Math.abs(a.blocks[i].distance - b.blocks[i].distance) < 1e-6);
  }
  separated(a);
});
test("moving traffic resumes at the normal speed after the junction clears", () => {
  const s = merge();
  s.step(3);
  const d = s.blocks.map((b) => b.distanceTraveled ?? 0);
  s.step(0.1);
  s.blocks.forEach((b, i) =>
    assert.ok(
      Math.abs((b.distanceTraveled! - d[i]) / 0.1 - BLOCK_SPEED) < 1e-6,
    ),
  );
});
test("busy releases and both merge states preserve colors and body separation", () => {
  let seed = 17;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (const level of [levels[1], levels[4], levels[6], levels[9]]) {
    const s = new Simulation(level),
      counts = s.colorCounts();
    for (let i = 0; i < 900; i++) {
      if (rand() < 0.35) s.release(Math.floor(rand() * s.containers.length));
      s.step(0.07);
      separated(s);
      assert.deepEqual(s.colorCounts(), counts);
    }
  }
});
