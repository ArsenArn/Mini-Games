import {
  type EdgeId,
  type Level,
  type Point,
  type ContainerConfig,
} from "./levels";
import { RouteGeometry } from "./routeGeometry";
export const CONTAINER_SIZE = { width: 66, height: 122 };
export class BoardLayout extends RouteGeometry {
  readonly containers: Map<string, Point>;
  constructor(level: Level) {
    super(level);
    this.containers = new Map(
      level.containers.map((box) => {
        const p = this.interaction(box),
          offset = 28 + CONTAINER_SIZE.height / 2;
        return [
          box.id,
          { x: p.x, y: p.y + (box.opening === "bottom" ? -offset : offset) },
        ];
      }),
    );
  }
  interaction(box: ContainerConfig): Point {
    const path = this.paths[box.interaction.segment];
    return path.point(path.length * box.interaction.at);
  }
  point(segment: EdgeId, fraction: number): Point {
    const path = this.paths[segment];
    return path.point(path.length * fraction);
  }
}
