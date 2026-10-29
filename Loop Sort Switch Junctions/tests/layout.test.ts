import test from "node:test";
import assert from "node:assert/strict";
import { levels } from "../src/levels";
import { BoardLayout, CONTAINER_SIZE } from "../src/boardLayout";
import { Simulation, EDGES } from "../src/simulation";
for (const level of levels)
  test(`Display ${level.id}: connected CCW loops, continuous exits and accessible docks`, () => {
    const view = new BoardLayout(level),
      sim = new Simulation(level);
    for (let state = 0; state < 2; state++) {
      for (const edge of EDGES) {
        const a = view.point(edge, 1),
          b = view.point(sim.next(edge), 0);
        assert.ok(Math.hypot(a.x - b.x, a.y - b.y) < 1e-8);
      }
      sim.toggle();
    }
    for (const loop of [
      ["A0", "A1"],
      ["B0", "B1"],
    ] as const) {
      const points = loop.flatMap((edge) =>
        view.paths[edge].samples.map((s) => s.p),
      );
      let area = 0;
      for (let i = 0; i < points.length; i++) {
        const p = points[i],
          q = points[(i + 1) % points.length];
        area += p.x * q.y - q.x * p.y;
      }
      assert.ok(area < 0, "screen CCW");
    }
    const docks = [...view.containers.values()];
    for (let i = 0; i < docks.length; i++) {
      const p = docks[i];
      assert.ok(
        p.x > CONTAINER_SIZE.width / 2 + 6 &&
          p.x < 420 - CONTAINER_SIZE.width / 2 - 6,
      );
      assert.ok(
        p.y > CONTAINER_SIZE.height / 2 + 12 &&
          p.y < 640 - CONTAINER_SIZE.height / 2 - 12,
      );
      for (let j = i + 1; j < docks.length; j++)
        assert.ok(
          Math.abs(p.x - docks[j].x) > CONTAINER_SIZE.width + 12 ||
            Math.abs(p.y - docks[j].y) > CONTAINER_SIZE.height + 12,
          "container hit areas do not overlap",
        );
    }
  });
