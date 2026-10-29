import { RouteGeometry } from "./routeGeometry";
export type Color = "red" | "blue" | "green" | "yellow" | "purple" | "cyan";
export type EdgeId = "A0" | "A1" | "B0" | "B1";
export type Point = { x: number; y: number };
export type Curve = [Point, Point, Point, Point];
export type Route = "GREEN" | "YELLOW";
export interface JunctionConfig {
  id: string;
  position: Point;
  incoming: EdgeId[];
  outgoing: Record<Route, EdgeId>;
}
export interface ContainerConfig {
  id: string;
  capacity: number;
  orderedBlocks: Color[];
  position: Point;
  opening: "top" | "bottom";
  interaction: { segment: EdgeId; at: number };
}
export type LayoutId =
  | "twins"
  | "wideLens"
  | "figureEight"
  | "largeSmall"
  | "verticalShift"
  | "diagonal"
  | "stacked"
  | "crossRouting"
  | "advancedCross"
  | "masterEight";
export interface Level {
  layout: LayoutId;
  difficulty: "Easy" | "Medium" | "Hard";
  id: number;
  name: string;
  description: string;
  capacity: number;
  initialJunctionState: Route;
  curves: Record<EdgeId, Curve>;
  junctions: JunctionConfig[];
  containers: ContainerConfig[];
}
export const COLORS: Record<Color, string> = {
  red: "#f06d79",
  blue: "#56aafa",
  green: "#71d594",
  yellow: "#f6ca62",
  purple: "#b594f5",
  cyan: "#51dbd6",
};
export const SYMBOLS: Record<Color, string> = {
  red: "●",
  blue: "◆",
  green: "▲",
  yellow: "✦",
  purple: "■",
  cyan: "✚",
};
export const ROUTE_COLORS: Record<Route, string> = {
  GREEN: "#80dfb2",
  YELLOW: "#f6ce70",
};
const p = (x: number, y: number) => ({ x, y });
const normal: Record<EdgeId, Curve> = {
  A0: [p(210, 230), p(0, 110), p(0, 530), p(210, 410)],
  A1: [p(210, 410), p(330, 450), p(330, 190), p(210, 230)],
  B0: [p(210, 230), p(90, 190), p(90, 450), p(210, 410)],
  B1: [p(210, 410), p(420, 530), p(420, 110), p(210, 230)],
};
const eight: Record<EdgeId, Curve> = {
  A0: [p(210, 285), p(-5, -180), p(-5, 820), p(210, 355)],
  A1: [p(210, 355), p(345, 500), p(345, 140), p(210, 285)],
  B0: [p(210, 285), p(75, 140), p(75, 500), p(210, 355)],
  B1: [p(210, 355), p(425, 820), p(425, -180), p(210, 285)],
};
const nodes = (curves: Record<EdgeId, Curve>): JunctionConfig[] => [
  {
    id: "N1",
    position: curves.A0[0],
    incoming: ["A1", "B1"],
    outgoing: { GREEN: "A0", YELLOW: "B0" },
  },
  {
    id: "N2",
    position: curves.A0[3],
    incoming: ["A0", "B0"],
    outgoing: { GREEN: "A1", YELLOW: "B1" },
  },
];
const c = (
  id: string,
  blocks: Color[],
  segment: EdgeId,
  at: number,
  x: number,
  bottom = false,
): ContainerConfig => ({
  id,
  capacity: blocks.length,
  orderedBlocks: blocks,
  position: p(x, bottom ? 550 : 82),
  opening: bottom ? "top" : "bottom",
  interaction: { segment, at },
});
// Choose real interaction points on the outer envelope of each unchanged layout.
// Containers remain vertical; top/bottom docks are clear of the other loop.
function mixedContainers(
  layout: LayoutId,
  blocks: Color[][],
): ContainerConfig[] {
  const geometry = new RouteGeometry({ layout });
  const slots =
    blocks.length === 3
      ? [
          { x: 120, top: true },
          { x: 300, top: true },
          { x: 210, top: false },
        ]
      : blocks.length === 4
        ? [
            { x: 130, top: true },
            { x: 300, top: true },
            { x: 130, top: false },
            { x: 300, top: false },
          ]
        : blocks.length === 5
          ? [
              { x: 90, top: true },
              { x: 210, top: true },
              { x: 320, top: true },
              { x: 100, top: false },
              { x: 300, top: false },
            ]
          : [
              { x: 90, top: true },
              { x: 210, top: true },
              { x: 330, top: true },
              { x: 90, top: false },
              { x: 210, top: false },
              { x: 330, top: false },
            ];
  return blocks.map((orderedBlocks, i) => {
    const slot = slots[i],
      candidates = Object.entries(geometry.paths).flatMap(([segment, path]) =>
        path.samples.map((sample) => ({
          segment: segment as EdgeId,
          at: sample.distance / path.length,
          p: sample.p,
        })),
      );
    const minX = Math.min(...candidates.map((c) => Math.abs(c.p.x - slot.x)));
    const near = candidates.filter((c) => Math.abs(c.p.x - slot.x) <= minX + 2);
    near.sort((a, b) => (slot.top ? a.p.y - b.p.y : b.p.y - a.p.y));
    const port = near[0];
    return {
      id: `C${i + 1}`,
      capacity: orderedBlocks.length,
      orderedBlocks,
      position: { x: port.p.x, y: port.p.y + (slot.top ? -89 : 89) },
      opening: slot.top ? "bottom" : "top",
      interaction: { segment: port.segment, at: port.at },
    };
  });
}
export const levels: Level[] = [
  {
    id: 1,
    layout: "twins",
    difficulty: "Easy",
    name: "Tutorial",
    description:
      "Fill each container with one color. Every release turns both arrows.",
    capacity: 3,
    initialJunctionState: "GREEN",
    curves: normal,
    junctions: nodes(normal),
    containers: [
      c("C1", ["red", "blue"], "A0", 0.14, 100),
      c("C2", ["blue", "red"], "B1", 0.14, 320, true),
    ],
  },
  {
    id: 2,
    layout: "wideLens",
    difficulty: "Medium",
    name: "Route Shift",
    description:
      "A stranded block needs a new route. Release another block to turn both arrows.",
    capacity: 4,
    initialJunctionState: "GREEN",
    curves: normal,
    junctions: nodes(normal),
    containers: [
      c("C1", ["red", "blue"], "A0", 0.14, 100),
      c("C2", ["blue", "green"], "B1", 0.86, 320),
      c("C3", ["green", "red"], "A0", 0.86, 100, true),
    ],
  },
  {
    id: 3,
    layout: "figureEight",
    difficulty: "Medium",
    name: "Figure Eight",
    description:
      "Keep several blocks in play. Open matching ends before changing their route.",
    capacity: 4,
    initialJunctionState: "GREEN",
    curves: eight,
    junctions: nodes(eight),
    containers: [
      c("C1", ["red", "blue", "green"], "A0", 0.13, 90),
      c("C2", ["blue", "green", "red"], "B1", 0.87, 330),
      c("C3", ["green", "red", "blue"], "A0", 0.87, 90, true),
    ],
  },
  {
    id: 4,
    layout: "largeSmall",
    difficulty: "Medium",
    name: "Big & Small",
    description:
      "Four dependent stacks, four shared belt slots. Size changes travel time, not speed.",
    capacity: 4,
    initialJunctionState: "GREEN",
    curves: normal,
    junctions: nodes(normal),
    containers: [
      c("C1", ["red", "green", "blue"], "A0", 0.16, 100),
      c("C2", ["blue", "yellow", "red"], "B1", 0.82, 320),
      c("C3", ["green", "blue", "yellow"], "A0", 0.84, 100, true),
      c("C4", ["yellow", "red", "green"], "B1", 0.18, 320, true),
    ],
  },
  {
    id: 5,
    layout: "verticalShift",
    difficulty: "Hard",
    name: "Vertical Shift",
    description:
      "Five colors share four belt slots. Keep a matching stack open.",
    capacity: 4,
    initialJunctionState: "YELLOW",
    curves: normal,
    junctions: nodes(normal),
    containers: mixedContainers("verticalShift", [
      ["red", "blue", "green"],
      ["blue", "green", "yellow"],
      ["green", "yellow", "purple"],
      ["yellow", "purple", "red"],
      ["purple", "red", "blue"],
    ]),
  },
  {
    id: 6,
    layout: "diagonal",
    difficulty: "Hard",
    name: "Offset Paths",
    description:
      "Plan both ends of the diagonal. Free slots are your shared buffer.",
    capacity: 3,
    initialJunctionState: "GREEN",
    curves: normal,
    junctions: nodes(normal),
    containers: [
      c("C1", ["red", "yellow", "blue"], "A0", 0.23, 100),
      c("C2", ["yellow", "green", "red"], "B1", 0.82, 320),
      c("C3", ["green", "blue", "yellow"], "B1", 0.22, 320, true),
      c("C4", ["blue", "red", "green"], "A0", 0.78, 100, true),
    ],
  },
  {
    id: 7,
    layout: "stacked",
    difficulty: "Hard",
    name: "Stacked Loops",
    description:
      "Deep stacks need several turns. Expose matching colors before releasing more.",
    capacity: 4,
    initialJunctionState: "GREEN",
    curves: eight,
    junctions: nodes(eight),
    containers: mixedContainers("stacked", [
      ["red", "green", "red", "blue"],
      ["blue", "red", "blue", "green"],
      ["green", "blue", "green", "red"],
    ]),
  },
  {
    id: 8,
    layout: "crossRouting",
    difficulty: "Hard",
    name: "Cross Routing",
    description: "Four deep stacks. Save space for your next route change.",
    capacity: 5,
    initialJunctionState: "YELLOW",
    curves: normal,
    junctions: nodes(normal),
    containers: mixedContainers("crossRouting", [
      ["red", "blue", "red", "yellow"],
      ["blue", "green", "blue", "red"],
      ["green", "yellow", "green", "blue"],
      ["yellow", "red", "yellow", "green"],
    ]),
  },
  {
    id: 9,
    layout: "advancedCross",
    difficulty: "Hard",
    name: "Advanced Sorting",
    description: "Five colors and deep stacks. Plan the next few releases.",
    capacity: 5,
    initialJunctionState: "GREEN",
    curves: normal,
    junctions: nodes(normal),
    containers: mixedContainers("advancedCross", [
      ["red", "blue", "red", "blue"],
      ["blue", "green", "green", "blue"],
      ["green", "purple", "green", "purple"],
      ["purple", "yellow", "purple", "yellow"],
      ["yellow", "red", "yellow", "red"],
    ]),
  },
  {
    id: 10,
    layout: "masterEight",
    difficulty: "Hard",
    name: "Master Junctions",
    description:
      "Six colors, five belt slots. Keep room to redirect circulating blocks.",
    capacity: 5,
    initialJunctionState: "YELLOW",
    curves: eight,
    junctions: nodes(eight),
    containers: mixedContainers("masterEight", [
      ["red", "blue", "red", "blue"],
      ["blue", "green", "green", "blue"],
      ["green", "yellow", "green", "yellow"],
      ["yellow", "purple", "purple", "yellow"],
      ["purple", "cyan", "purple", "cyan"],
      ["cyan", "red", "cyan", "red"],
    ]),
  },
];
