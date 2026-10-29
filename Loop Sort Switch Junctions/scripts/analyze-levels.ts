import { mkdirSync, writeFileSync } from "node:fs";
import { levels } from "../src/levels";
import { Simulation } from "../src/simulation";
import { findSolution } from "../tests/search";
import { solutionProofs } from "../tests/solutions";
const SEED = 20261029,
  RUNS = 400;
let seed = SEED;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const records = [];
for (const level of levels) {
  const proof = solutionProofs.find(
    (p) => p.levelId === level.id && p.waits.length === 1 && p.waits[0] === 40,
  )!;
  const search = findSolution(level);
  if (!search) throw new Error("No solution");
  const s = new Simulation(level),
    redirects = new Map<number, number>(),
    seen = new Set<string>();
  let peak = 0;
  for (const [i, a] of proof.actions.entries()) {
    s.release(a);
    peak = Math.max(peak, s.blocks.length);
    s.step(proof.waits[i % proof.waits.length]);
    for (const e of s.events) {
      if (e.kind !== "junction" || e.from[0] === e.to[0]) continue;
      const key = e.blockId + ":" + e.time;
      if (seen.has(key)) continue;
      seen.add(key);
      redirects.set(e.blockId, (redirects.get(e.blockId) ?? 0) + 1);
    }
  }
  let wins = 0,
    deadlocks = 0,
    saturation = 0,
    totalChoices = 0,
    decisionPoints = 0;
  const winningOrders = new Set<string>();
  const blockCount = level.containers.reduce(
    (n, c) => n + c.orderedBlocks.length,
    0,
  );
  for (let run = 0; run < RUNS; run++) {
    const trial = new Simulation(level),
      counts = JSON.stringify(trial.colorCounts()),
      actions: number[] = [];
    let full = false;
    for (let move = 0; move < blockCount * 4 + 12 && !trial.won; move++) {
      const choices = trial.containers.flatMap((c, i) =>
        !c.isCompleted &&
        c.orderedBlocks.length &&
        trial.blocks.length < level.capacity
          ? [i]
          : [],
      );
      totalChoices += choices.length;
      decisionPoints++;
      if (!choices.length) {
        deadlocks++;
        break;
      }
      const a = choices[Math.floor(random() * choices.length)];
      trial.release(a);
      actions.push(a);
      if (trial.blocks.length === level.capacity) full = true;
      trial.step([20, 40, 80][Math.floor(random() * 3)]);
      if (JSON.stringify(trial.colorCounts()) !== counts)
        throw new Error("Color conservation violated");
    }
    if (full) saturation++;
    if (trial.won) {
      wins++;
      winningOrders.add(actions.join(","));
    }
  }
  records.push({
    id: level.id,
    name: level.name,
    difficulty: level.difficulty,
    containers: level.containers.length,
    colors: new Set(level.containers.flatMap((c) => c.orderedBlocks)).size,
    containerDepth: level.containers[0].capacity,
    searchMethod:
      level.containers.length >= 6 ? "weighted best-first" : "bounded BFS",
    blocks: blockCount,
    beltCapacity: level.capacity,
    boundedSearchMoves: search.actions.length,
    boundedSearchVisited: search.visited,
    proofPeakOnBelt: peak,
    proofMaxRedirectsPerBlock: Math.max(0, ...redirects.values()),
    sampleRuns: RUNS,
    sampleWins: wins,
    sampleFailures: RUNS - wins,
    sampleDeadlocks: deadlocks,
    sampledUniqueWinningOrders: winningOrders.size,
    sampleReachedCapacity: saturation,
    meanLegalChoices: +(totalChoices / decisionPoints).toFixed(2),
    verifiedDistinctProofOrders: new Set(
      solutionProofs
        .filter((p) => p.levelId === level.id)
        .map((p) => p.actions.join(",")),
    ).size,
    verifiedProofs: solutionProofs.filter((p) => p.levelId === level.id),
    verifiedWaits: solutionProofs
      .filter((p) => p.levelId === level.id)
      .map((p) => p.waits),
  });
  console.log(
    level.id,
    level.name,
    `search=${search.actions.length}`,
    `wins=${wins}/${RUNS}`,
    `deadlocks=${deadlocks}`,
    `unique=${winningOrders.size}`,
  );
}
mkdirSync("reports", { recursive: true });
writeFileSync(
  "reports/level-analysis.json",
  JSON.stringify(
    {
      seed: SEED,
      method:
        "Bounded phase-abstracted state search (BFS, weighted best-first for six containers) plus exact replays; seeded random legal releases, 20/40/80-second waits, capped action budget. Sample counts are not total solution counts or human difficulty.",
      levels: records,
    },
    null,
    2,
  ) + "\n",
);
writeFileSync(
  "reports/level-analysis.md",
  "# Level progression — modeled evidence\n\nSeed " +
    SEED +
    ". " +
    RUNS +
    " sampled runs per level. These are modeled outcomes, not player results. Search uses a settled-state abstraction; six-container levels use weighted best-first guidance. Neither is a proof of a global minimum.\n\n| Level | Search moves | Proof peak / capacity | Max redirects / block | Sample wins | Sample deadlocks | Unique sampled winning orders |\n|---|---:|---:|---:|---:|---:|---:|\n" +
    records
      .map(
        (r) =>
          `| ${String(r.id).padStart(2, "0")} ${r.name} | ${r.boundedSearchMoves} | ${r.proofPeakOnBelt}/${r.beltCapacity} | ${r.proofMaxRedirectsPerBlock} | ${r.sampleWins}/${r.sampleRuns} | ${r.sampleDeadlocks} | ${r.sampledUniqueWinningOrders} |`,
      )
      .join("\n") +
    "\n\nDifferent wait schedules may need different release orders. All four schedules have exact AUTO replays in tests/solutions.ts. Random-policy success rates are sensitive to placement, waiting policy, and action budget; do not interpret them as human win rates.\n",
);
