# Level progression — modeled evidence

Seed 20261029. 400 sampled runs per level. These are modeled outcomes, not player results. Search uses a settled-state abstraction; six-container levels use weighted best-first guidance. Neither is a proof of a global minimum.

| Level | Search moves | Proof peak / capacity | Max redirects / block | Sample wins | Sample deadlocks | Unique sampled winning orders |
|---|---:|---:|---:|---:|---:|---:|
| 01 Tutorial | 3 | 2/3 | 3 | 330/400 | 70 | 10 |
| 02 Route Shift | 3 | 2/4 | 2 | 378/400 | 22 | 143 |
| 03 Figure Eight | 6 | 4/4 | 5 | 265/400 | 80 | 261 |
| 04 Big & Small | 8 | 4/4 | 5 | 92/400 | 273 | 92 |
| 05 Vertical Shift | 10 | 4/4 | 8 | 43/400 | 347 | 43 |
| 06 Offset Paths | 9 | 3/3 | 3 | 5/400 | 392 | 5 |
| 07 Stacked Loops | 13 | 4/4 | 9 | 9/400 | 209 | 9 |
| 08 Cross Routing | 14 | 5/5 | 13 | 11/400 | 133 | 11 |
| 09 Advanced Sorting | 18 | 5/5 | 11 | 1/400 | 248 | 1 |
| 10 Master Junctions | 24 | 5/5 | 23 | 0/400 | 308 | 0 |

Different wait schedules may need different release orders. All four schedules have exact AUTO replays in tests/solutions.ts. Random-policy success rates are sensitive to placement, waiting policy, and action budget; do not interpret them as human win rates.
