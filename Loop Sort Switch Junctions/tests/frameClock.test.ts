import test from "node:test";
import assert from "node:assert/strict";
import { FrameClock } from "../src/frameClock";
import { Simulation } from "../src/simulation";
import { levels } from "../src/levels";

test("first queued frame can predate initialization without passing a negative dt", () => {
  const sim = new Simulation(levels[0]);
  // Reproduce the previous mixed-clock failure: queued frame < performance.now().
  assert.throws(() => sim.step((1000 - 1005) / 1000), /Invalid dt/);
  const clock = new FrameClock();
  assert.doesNotThrow(() => sim.step(clock.tick(1000)));
  sim.step(clock.tick(1016));
  assert.equal(sim.time, 0.016);
});
test("frame elapsed time is preserved without clamping or changing game speed", () => {
  const clock = new FrameClock();
  assert.equal(clock.tick(100), 0);
  assert.equal(clock.tick(116), 0.016);
  assert.equal(clock.tick(366), 0.25);
  assert.equal(clock.tick(366), 0);
});
test("visibility reset accepts an already queued older frame and drops hidden elapsed time", () => {
  const clock = new FrameClock();
  clock.tick(500);
  clock.tick(516);
  clock.reset();
  assert.equal(clock.tick(510), 0);
  assert.equal(clock.tick(526), 0.016);
  clock.reset();
  assert.equal(clock.tick(100000), 0);
  assert.equal(clock.tick(100016), 0.016);
});
test("regressing or non-finite frame timestamps never reach Simulation as invalid dt", () => {
  const clock = new FrameClock(),
    sim = new Simulation(levels[0]);
  for (const time of [100, 99, 115, NaN, Infinity, 400, 416]) {
    const dt = clock.tick(time);
    assert.ok(Number.isFinite(dt) && dt >= 0);
    assert.doesNotThrow(() => sim.step(dt));
  }
});
