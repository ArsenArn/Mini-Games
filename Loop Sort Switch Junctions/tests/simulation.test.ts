import test from "node:test";
import assert from "node:assert/strict";
import { Simulation, type MovingBlock } from "../src/simulation";
import { EDGES } from "../src/geometry";
import { levels, type Color, type Level, type Route } from "../src/levels";
import { findSolution, releaseWhenClear } from "./search";
import { solutionProofs } from "./solutions";
const plans = levels.map(
  (level) =>
    solutionProofs.find(
      (p) =>
        p.levelId === level.id && p.waits.length === 1 && p.waits[0] === 40,
    )!.actions,
);

function arriving(contents: Color[], color: Color, capacity = 3) {
  const level: Level = {
    ...levels[0],
    containers: [
      {
        ...levels[0].containers[0],
        capacity,
        orderedBlocks: contents,
        interaction: { segment: "A0", at: 0.5 },
      },
    ],
  };
  const s = new Simulation(level);
  s.mode = "MANUAL";
  s.blocks = [
    {
      id: 1,
      color,
      segment: "A0",
      distance: s.paths.A0.length * 0.5 - 1,
      crossings: 0,
    },
  ];
  return s;
}
test("release removes exactly one accessible block and toggles both arrows", () => {
  const s = new Simulation(levels[0]),
    before = s.colorCounts();
  assert.ok(s.release(0));
  assert.deepEqual(s.containers[0].orderedBlocks, ["blue"]);
  assert.equal(s.blocks.length, 1);
  assert.equal(s.blocks[0].color, "red");
  assert.equal(s.route, "YELLOW");
  assert.deepEqual(
    s.junctions.map((j) => j.selectedOutgoingRoute),
    ["B0", "B1"],
  );
  assert.deepEqual(s.colorCounts(), before);
});
test("same container can release repeatedly when the entry clears", () => {
  const s = new Simulation(levels[2]);
  assert.ok(s.release(0));
  s.step(0.6);
  assert.ok(s.release(0));
  s.step(0.6);
  assert.ok(s.release(0));
  assert.equal(s.blocks.length, 3);
  assert.equal(s.containers[0].orderedBlocks.length, 0);
  const route = s.route;
  assert.equal(s.release(0), false);
  assert.equal(s.route, route);
});
test("matching color is received at the accessible edge", () => {
  const s = arriving(["red", "blue"], "red");
  s.step(0.1);
  assert.deepEqual(s.containers[0].orderedBlocks, ["red", "red", "blue"]);
  assert.equal(s.blocks.length, 0);
  assert.equal(s.containers[0].isCompleted, false);
});
test("empty container accepts any color", () => {
  const s = arriving([], "green");
  s.step(0.1);
  assert.deepEqual(s.containers[0].orderedBlocks, ["green"]);
  assert.equal(s.blocks.length, 0);
});
test("different accessible color rejects a passing block", () => {
  const s = arriving(["blue"], "red");
  s.step(0.1);
  assert.deepEqual(s.containers[0].orderedBlocks, ["blue"]);
  assert.equal(s.blocks.length, 1);
});
test("full monochrome container closes and cannot release or receive", () => {
  const s = arriving(["red"], "red", 2);
  s.step(0.1);
  assert.ok(s.containers[0].isCompleted);
  assert.ok(s.won);
  const route = s.route;
  assert.equal(s.release(0), false);
  assert.equal(s.canReceive(s.containers[0], "red"), false);
  assert.equal(s.route, route);
});
test("full mixed container does not accept or close", () => {
  const s = arriving(["red", "blue"], "red", 2);
  s.step(0.1);
  assert.equal(s.blocks.length, 1);
  assert.equal(s.containers[0].isCompleted, false);
});
test("automatic receive does not toggle arrows", () => {
  const s = arriving(["red"], "red");
  const route = s.route,
    outputs = s.junctions.map((j) => j.selectedOutgoingRoute);
  s.step(1);
  assert.equal(s.route, route);
  assert.deepEqual(
    s.junctions.map((j) => j.selectedOutgoingRoute),
    outputs,
  );
  assert.equal(s.actions, 0);
});
test("a block can return to its originating container after a real lap", () => {
  const level: Level = {
    ...levels[0],
    containers: [
      {
        ...levels[0].containers[0],
        capacity: 3,
        orderedBlocks: ["red", "red", "blue"],
      },
    ],
  };
  const s = new Simulation(level);
  s.mode = "MANUAL";
  const before = s.colorCounts();
  assert.ok(s.release(0));
  s.step(0.001);
  assert.equal(s.blocks.length, 1, "no immediate return at spawn");
  s.step(30);
  assert.equal(s.blocks.length, 0);
  assert.deepEqual(s.containers[0].orderedBlocks, ["red", "red", "blue"]);
  assert.deepEqual(s.colorCounts(), before);
  assert.ok(s.events.some((e) => e.kind === "junction"));
});
test("full conveyor, empty and closed taps never toggle or consume blocks", () => {
  const s = new Simulation(levels[2]);
  assert.ok(s.release(0));
  s.step(0.6);
  assert.ok(s.release(0));
  s.step(0.6);
  assert.ok(s.release(0));
  s.step(0.6);
  assert.ok(s.release(1));
  const before = s.colorCounts(),
    route = s.route,
    blocks = JSON.stringify(s.containers);
  assert.equal(s.release(1), false);
  assert.equal(s.route, route);
  assert.deepEqual(s.colorCounts(), before);
  assert.equal(JSON.stringify(s.containers), blocks);
  assert.equal(s.blocks.length, s.level.capacity);
});
test("selected outgoing branch is the same for every incoming edge", () => {
  const s = new Simulation(levels[0]);
  for (const route of ["GREEN", "YELLOW"] as Route[]) {
    if (s.route !== route) s.toggle();
    assert.equal(s.next("A0"), s.next("B0"));
    assert.equal(s.next("A1"), s.next("B1"));
    assert.equal(s.next("A0"), route === "GREEN" ? "A1" : "B1");
    assert.equal(s.next("B1"), route === "GREEN" ? "A0" : "B0");
  }
});
test("switching keeps all coordinates; old blocks use the new exit at arrival", () => {
  const s = new Simulation(levels[2]);
  s.mode = "MANUAL";
  s.release(0);
  s.release(1);
  s.blocks[0].segment = "A0";
  s.blocks[1].segment = "B0";
  s.blocks[0].distance = s.paths.A0.length - 1;
  s.blocks[1].distance = s.paths.B0.length - 40;
  const before = JSON.stringify(s.blocks);
  s.toggle();
  assert.equal(JSON.stringify(s.blocks), before);
  s.step(0.1);
  assert.equal(s.blocks[0].segment, "B1");
  assert.equal(s.blocks[1].segment, "B0");
  s.step(1.3);
  assert.ok(s.blocks.every((b) => b.segment === "B1"));
});
for (const level of levels) {
  test(`Level ${level.id}: both loops CCW and node coordinates coincide exactly`, () => {
    const s = new Simulation(level);
    for (let k = 0; k < 2; k++) {
      for (const edge of EDGES)
        assert.deepEqual(
          s.paths[edge].point(s.paths[edge].length),
          s.paths[s.next(edge)].point(0),
        );
      s.toggle();
    }
    for (const loop of [
      ["A0", "A1"],
      ["B0", "B1"],
    ] as const) {
      const points = loop.flatMap((edge) =>
        s.paths[edge].samples.map((a) => a.p),
      );
      let area = 0;
      points.forEach((p, i) => {
        const q = points[(i + 1) % points.length];
        area += p.x * q.y - q.x * p.y;
      });
      assert.ok(area < 0);
    }
  });
  test(`Level ${level.id}: AUTO completion with 20/40/80s and varied waits`, () => {
    for (const proof of solutionProofs.filter((p) => p.levelId === level.id)) {
      const delays = proof.waits;
      const s = new Simulation(level),
        counts = s.colorCounts();
      for (const [index, action] of proof.actions.entries()) {
        if (s.won) break;
        assert.ok(
          releaseWhenClear(s, action),
          `release ${index} with ${delays}`,
        );
        s.step(delays[index % delays.length]);
        assert.deepEqual(s.colorCounts(), counts);
      }
      assert.ok(s.won, `waits: ${delays}`);
      assert.equal(s.blocks.length, 0);
      assert.ok(s.containers.every((c) => c.isCompleted));
    }
  });
  test(`Level ${level.id}: state search discovers a valid solution, game has no answer table`, () => {
    const result = findSolution(level);
    assert.ok(result);
    const s = new Simulation(level);
    for (const action of result.actions) {
      assert.ok(releaseWhenClear(s, action));
      s.step(40);
    }
    assert.ok(s.won);
  });
}
test("continuous movement at junction in either state without coordinate jumps", () => {
  for (const route of ["GREEN", "YELLOW"] as Route[])
    for (const segment of EDGES) {
      const s = new Simulation(levels[0]);
      if (s.route !== route) s.toggle();
      const b: MovingBlock = {
        id: 1,
        color: "red",
        segment,
        distance: s.paths[segment].length - 0.2,
        crossings: 0,
      };
      s.blocks = [b];
      const p = s.paths[segment].point(b.distance);
      s.step(0.01);
      const q = s.paths[b.segment].point(b.distance);
      assert.ok(Math.hypot(q.x - p.x, q.y - p.y) <= 0.640001);
      assert.equal(b.segment, s.next(segment));
    }
});
test("routing level contains a stranded block that a later release redirects", () => {
  const s = new Simulation(levels[1]);
  s.release(0);
  s.step(40);
  assert.equal(s.blocks.length, 1);
  assert.equal(s.canEventuallyReceive(s.blocks[0]), false);
  const id = s.blocks[0].id;
  s.release(1);
  s.step(40);
  assert.ok(
    s.events.some(
      (e) => e.kind === "junction" && e.blockId === id && e.to === "A0",
    ),
  );
  assert.ok(s.containers.some((c) => c.isCompleted));
});
test("global arrival order is independent of timestep when competing for last slot", () => {
  const a = arriving([], "red", 1);
  a.blocks = [
    {
      id: 1,
      color: "red",
      segment: "A0",
      distance: a.paths.A0.length * 0.5 - 12,
      crossings: 0,
    },
    {
      id: 2,
      color: "blue",
      segment: "A0",
      distance: a.paths.A0.length * 0.5 - 2,
      crossings: 0,
    },
  ];
  const b = a.clone();
  a.step(1);
  for (let i = 0; i < 100; i++) b.step(0.01);
  assert.deepEqual(a.containers, b.containers);
  assert.equal(a.containers[0].orderedBlocks[0], "blue");
  assert.deepEqual(
    a.blocks.map((x) => [x.id, x.segment]),
    b.blocks.map((x) => [x.id, x.segment]),
  );
});
test("x1/x2/x4 frames and large steps preserve the same final sort and every color", () => {
  const counts = new Simulation(levels[2]).colorCounts();
  for (const speed of [1, 2, 4]) {
    const s = new Simulation(levels[2]);
    for (const action of plans[2]) {
      if (s.won) break;
      assert.ok(releaseWhenClear(s, action));
      for (let f = 0; f < 2400 / speed; f++) s.step(speed / 60);
      assert.deepEqual(s.colorCounts(), counts);
    }
    assert.ok(s.won);
  }
});
test("MANUAL has no usage limit and release does not toggle in that mode", () => {
  const s = new Simulation(levels[0]);
  s.mode = "MANUAL";
  for (let i = 0; i < 101; i++) s.toggle();
  assert.equal(s.route, "YELLOW");
  assert.ok(s.release(0));
  assert.equal(s.route, "YELLOW");
});
test("bad timing values are rejected", () => {
  const s = new Simulation(levels[0]);
  for (const dt of [-1, Infinity, NaN]) assert.throws(() => s.step(dt));
});
