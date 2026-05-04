// RNG
      class RNG {
        constructor(seed) {
          this.seed = (Number(seed) || 1) >>> 0;
        }
        next() {
          this.seed = (1664525 * this.seed + 1013904223) >>> 0;
          return this.seed / 4294967296;
        }
        int(min, max) {
          return Math.floor(this.next() * (max - min + 1)) + min;
        }
        pick(list) {
          return list[this.int(0, list.length - 1)];
        }
        shuffle(list) {
          const out = list.slice();
          for (let i = out.length - 1; i > 0; i--) {
            const j = this.int(0, i);
            [out[i], out[j]] = [out[j], out[i]];
          }
          return out;
        }
      }

      const Helpers = {
        clamp(value, min, max) {
          return Math.max(min, Math.min(max, Number(value) || min));
        },
        key(x, y) {
          return `${x},${y}`;
        },
        same(a, b) {
          return a && b && a.x === b.x && a.y === b.y;
        },
        dist(ax, ay, bx, by) {
          return Math.hypot(ax - bx, ay - by);
        },
        manhattan(a, b) {
          return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
        },
        clone(value) {
          return JSON.parse(JSON.stringify(value));
        },
        groupText(blocks) {
          if (!blocks.length) return "empty";
          const groups = [];
          for (const color of blocks) {
            const last = groups[groups.length - 1];
            if (last && last.color === color) last.count++;
            else groups.push({ color, count: 1 });
          }
          return groups.map((group) => `${group.count} ${group.color}`).join(", ");
        }
      };

      // BoardUtils
      const BoardUtils = {
        inBounds(board, x, y) {
          return x >= 0 && y >= 0 && x < board.width && y < board.height;
        },
        inside(board, x, y) {
          return BoardUtils.isPlayableCell(board, x, y);
        },
        isPlayableCell(board, x, y) {
          if (!BoardUtils.inBounds(board, x, y)) return false;
          if (Array.isArray(board.playableCells)) {
            if (!board._playableSet) board._playableSet = new Set(board.playableCells.map((cell) => Helpers.key(cell.x, cell.y)));
            return board._playableSet.has(Helpers.key(x, y));
          }
          return BoardUtils.isCircleCell(board, x, y);
        },
        isCircleCell(board, x, y) {
          if (!BoardUtils.inBounds(board, x, y)) return false;
          const cx = (board.width - 1) / 2;
          const cy = (board.height - 1) / 2;
          const rx = board.width / 2;
          const ry = board.height / 2;
          const margin = 0.08;
          const corners = [
            { x: x - 0.5 + margin, y: y - 0.5 + margin },
            { x: x + 0.5 - margin, y: y - 0.5 + margin },
            { x: x - 0.5 + margin, y: y + 0.5 - margin },
            { x: x + 0.5 - margin, y: y + 0.5 - margin }
          ];
          return corners.every((point) => (((point.x - cx) / rx) ** 2 + ((point.y - cy) / ry) ** 2) <= 1);
        },
        buildCircleCells(width, height) {
          const temp = { width, height };
          const cells = [];
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              if (BoardUtils.isCircleCell(temp, x, y)) cells.push({ x, y });
            }
          }
          return cells;
        },
        buildPlayableCells(width, height, thickness, blockedCells = []) {
          const blocked = new Set(blockedCells.map((cell) => Helpers.key(cell.x, cell.y)));
          return BoardUtils.buildCircleCells(width, height).filter((cell) => !blocked.has(Helpers.key(cell.x, cell.y)));
        },
        playableCount(board) {
          return BoardUtils.buildPlayableCells(board.width, board.height, board.crossThickness).length;
        },
        loadKeys(board) {
          return new Set(board.containers.map((container) => Helpers.key(container.loadCell.x, container.loadCell.y)));
        },
        wormCellMap(board, ignore) {
          const map = new Map();
          for (const worm of board.worms) {
            worm.cells.forEach((cell, index) => {
              if (ignore && ignore.wormId === worm.id && ignore.index === index) return;
              map.set(Helpers.key(cell.x, cell.y), { worm, index });
            });
          }
          return map;
        },
        fieldBlockAt(board, cell) {
          return board.fieldBlocks.find((block) => block.x === cell.x && block.y === cell.y) || null;
        },
        removeFieldBlock(board, block) {
          const index = board.fieldBlocks.indexOf(block);
          if (index >= 0) board.fieldBlocks.splice(index, 1);
        },
        countCarried(board) {
          return board.worms.reduce((sum, worm) => sum + worm.carriedBlocks.filter(Boolean).length, 0);
        },
        totalInContainers(board) {
          return board.containers.reduce((sum, container) => sum + container.blocks.length, 0);
        },
        countByColor(board) {
          const counts = Object.fromEntries(board.colors.map((color) => [color, 0]));
          for (const container of board.containers) for (const color of container.blocks) counts[color] = (counts[color] || 0) + 1;
          for (const block of board.fieldBlocks) counts[block.color] = (counts[block.color] || 0) + 1;
          for (const worm of board.worms) for (const color of worm.carriedBlocks) if (color) counts[color] = (counts[color] || 0) + 1;
          return counts;
        },
        sortedInfo(board) {
          if (!board) return { sorted: 0, total: 0 };
          const total = board.totalBlocks || (BoardUtils.totalInContainers(board) + board.fieldBlocks.length + BoardUtils.countCarried(board));
          let sorted = 0;
          const seen = new Set();
          for (const container of board.containers) {
            if (!container.blocks.length) continue;
            const color = container.blocks[0];
            const single = container.blocks.every((block) => block === color);
            if (single && !seen.has(color)) {
              sorted += container.blocks.length;
              seen.add(color);
            }
          }
          return { sorted, total };
        },
        validate(board, requireStart) {
          const issues = [];
          if (!board || board.width < 5 || board.height < 5) issues.push("field too small");
          if (!board || BoardUtils.playableCount(board) <= 0) issues.push("no playable cells");
          if (!board || board.worms.length > 4) issues.push("too many worms");
          if (!board || board.colors.length !== board.containers.length) issues.push("colors must equal containers");
          if (requireStart && board.containers.some((container) => !container.blocks.length)) issues.push("empty start container");
          if (board) {
            const loadKeys = BoardUtils.loadKeys(board);
            const wormMap = BoardUtils.wormCellMap(board);
            for (const container of board.containers) {
              if (!BoardUtils.inside(board, container.loadCell.x, container.loadCell.y)) issues.push("bad loading point");
              if (![CONFIG.SMALL_CONTAINER_CAPACITY, CONFIG.NORMAL_CONTAINER_CAPACITY, CONFIG.LARGE_CONTAINER_CAPACITY].includes(container.capacity || board.containerCapacity)) issues.push("bad container capacity");
              if (container.rect && container.rect.overlapsField) issues.push("container overlaps field");
              if (wormMap.has(Helpers.key(container.loadCell.x, container.loadCell.y))) issues.push("loading point occupied at start");
              const freeNear = Containers.findDropCells(board, container, container.blocks.length ? 1 : 0).length;
              if (freeNear < 1) issues.push("no first move");
            }
            for (const block of board.fieldBlocks) {
              if (!BoardUtils.inside(board, block.x, block.y)) issues.push("field block outside");
              if (wormMap.has(Helpers.key(block.x, block.y))) issues.push("field block on worm");
              if (loadKeys.has(Helpers.key(block.x, block.y))) issues.push("field block on loading point");
            }
            const counts = BoardUtils.countByColor(board);
            for (let i = 0; i < board.colors.length; i++) {
              const color = board.colors[i];
              const capacity = board.containers[i]?.capacity || board.containerCapacity || CONFIG.NORMAL_CONTAINER_CAPACITY;
              if ((counts[color] || 0) > capacity) issues.push(`${color} exceeds one container`);
              if ((counts[color] || 0) !== capacity) issues.push(`${color} must match final container capacity`);
            }
            const totalCapacity = board.containers.reduce((sum, container) => sum + (container.capacity || board.containerCapacity || CONFIG.NORMAL_CONTAINER_CAPACITY), 0);
            if (Object.values(counts).reduce((sum, value) => sum + value, 0) > totalCapacity) issues.push("container capacity too low");
          }
          return { ok: issues.length === 0, issues };
        },
        isComplete(board) {
          if (!board || board.colors.length !== board.containers.length) return false;
          if (board.fieldBlocks.length > 0 || BoardUtils.countCarried(board) > 0) return false;
          const colorHome = new Map();
          for (const container of board.containers) {
            const capacity = container.capacity || board.containerCapacity || CONFIG.NORMAL_CONTAINER_CAPACITY;
            if (container.blocks.length > capacity) return false;
            if (!container.blocks.length) return false;
            const color = container.blocks[0];
            if (!container.blocks.every((block) => block === color)) return false;
            if (!board.colors.includes(color) || colorHome.has(color)) return false;
            colorHome.set(color, container.id);
          }
          return colorHome.size === board.colors.length;
        }
      };

