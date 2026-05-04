// Containers
      const Containers = {
        capacity(board, container) {
          return container.capacity || board.containerCapacity || CONFIG.NORMAL_CONTAINER_CAPACITY;
        },
        isLocked(board, container) {
          return false;
        },
        firstGroup(container) {
          if (!container.blocks.length) return [];
          const color = container.blocks[0];
          const group = [];
          for (const block of container.blocks) {
            if (block !== color) break;
            group.push(block);
          }
          return group;
        },
        findDropCells(board, container, limit) {
          const loadKeys = BoardUtils.loadKeys(board);
          const occupied = BoardUtils.wormCellMap(board);
          for (const block of board.fieldBlocks) occupied.set(Helpers.key(block.x, block.y), block);
          const queue = [{ ...container.loadCell, dist: 0 }];
          const seen = new Set([Helpers.key(container.loadCell.x, container.loadCell.y)]);
          const cells = [];
          while (queue.length && cells.length < limit) {
            const current = queue.shift();
            for (const delta of Object.values(DIRS)) {
              const next = { x: current.x + delta.x, y: current.y + delta.y, dist: current.dist + 1 };
              const key = Helpers.key(next.x, next.y);
              if (seen.has(key) || !BoardUtils.inside(board, next.x, next.y)) continue;
              seen.add(key);
              if (!loadKeys.has(key) && !occupied.has(key)) cells.push({ x: next.x, y: next.y });
              queue.push(next);
            }
          }
          return cells;
        },
        eject(board, container) {
          if (Containers.isLocked(board, container)) {
            container.pulse = 1;
            return { moved: 0, color: container.blocks[0], locked: true };
          }
          const group = Containers.firstGroup(container);
          if (!group.length) {
            container.flash = CONFIG.ANIM.flash;
            return { moved: 0, color: null };
          }
          const cells = Containers.findDropCells(board, container, group.length);
          if (!cells.length) {
            container.flash = CONFIG.ANIM.flash;
            return { moved: 0, color: group[0] };
          }
          const moved = Math.min(cells.length, group.length);
          for (let i = 0; i < moved; i++) board.fieldBlocks.push({ x: cells[i].x, y: cells[i].y, color: group[i], pop: 1 });
          container.blocks.splice(0, moved);
          return { moved, color: group[0] };
        },
        canReceiveFromWorm(board, container, worm) {
          const capacity = Containers.capacity(board, container);
          if (container.blocks.length >= capacity) return false;
          const loadIndex = worm.cells.findIndex((cell) => Helpers.same(cell, container.loadCell));
          if (loadIndex < 0) return false;
          const accepted = container.blocks.length ? container.blocks[0] : worm.carriedBlocks[loadIndex];
          if (!accepted) return false;
          if (board.rulesMode === "growing") return worm.carriedBlocks[loadIndex] === accepted;
          return worm.carriedBlocks.some((color) => color === accepted);
        },
        unload(board, container, worm) {
          if (board.rulesMode === "growing") return Containers.unloadGrowing(board, container, worm);
          const capacity = Containers.capacity(board, container);
          if (container.blocks.length >= capacity) return { moved: 0, color: null };
          const loadIndex = worm.cells.findIndex((cell) => Helpers.same(cell, container.loadCell));
          if (loadIndex < 0) return { moved: 0, color: null };
          const accepted = container.blocks.length ? container.blocks[0] : worm.carriedBlocks[loadIndex];
          if (!accepted) return { moved: 0, color: null };
          let room = capacity - container.blocks.length;
          let moved = 0;
          for (let i = 0; i < worm.carriedBlocks.length && room > 0; i++) {
            if (worm.carriedBlocks[i] !== accepted) continue;
            worm.carriedBlocks[i] = null;
            moved++;
            room--;
          }
          if (moved > 0) {
            container.blocks = Array(moved).fill(accepted).concat(container.blocks);
            container.pulse = 1;
          }
          return { moved, color: accepted };
        },
        unloadGrowing(board, container, worm) {
          const capacity = Containers.capacity(board, container);
          if (container.blocks.length >= capacity) return { moved: 0, color: null };
          const loadIndex = worm.cells.findIndex((cell) => Helpers.same(cell, container.loadCell));
          if (loadIndex < 0) return { moved: 0, color: null };
          const carried = worm.carriedBlocks[loadIndex];
          const accepted = container.blocks.length ? container.blocks[0] : carried;
          if (!carried || carried !== accepted) return { moved: 0, color: null };
          worm.carriedBlocks[loadIndex] = null;
          container.blocks.unshift(carried);
          container.pulse = 1;
          if (worm.cells.length > (worm.baseLength || 3)) {
            board.pops = board.pops || [];
            board.pops.push({ cell: { ...container.loadCell }, color: carried, life: 0.32, maxLife: 0.32 });
            Worms.collapseTempAt(worm, loadIndex);
            if (worm.cells.length > (worm.baseLength || 3) && Containers.canReceiveFromWorm(board, container, worm)) {
              board.growingCascade = { containerId: container.id, wormId: worm.id, timer: 0.085 };
            }
          }
          return { moved: 1, color: carried };
        },
        updateGrowingCascade(board, dt) {
          const cascade = board.growingCascade;
          if (!cascade) return null;
          cascade.timer -= dt;
          if (cascade.timer > 0) return null;
          const container = board.containers.find((item) => item.id === cascade.containerId);
          const worm = board.worms.find((item) => item.id === cascade.wormId);
          if (!container || !worm || !Containers.canReceiveFromWorm(board, container, worm)) {
            board.growingCascade = null;
            return null;
          }
          board.growingCascade = null;
          const result = Containers.unloadGrowing(board, container, worm);
          return result.moved ? result : null;
        }
      };

      // Worms
      const Worms = {
        isFull(worm) {
          return worm.carriedBlocks.every(Boolean);
        },
        firstFree(worm) {
          return worm.carriedBlocks.findIndex((color) => !color);
        },
        canStep(board, worm, end, next) {
          if (!BoardUtils.inside(board, next.x, next.y)) return { ok: false, reason: "edge" };
          const fieldBlock = BoardUtils.fieldBlockAt(board, next);
          const grows = board.rulesMode === "growing" && fieldBlock && Worms.isFull(worm);
          const ignore = grows ? null : { wormId: worm.id, index: end === "head" ? 0 : worm.cells.length - 1 };
          const occupied = BoardUtils.wormCellMap(board, ignore);
          if (occupied.has(Helpers.key(next.x, next.y))) return { ok: false, reason: "worm" };
          if (fieldBlock && Worms.isFull(worm) && board.rulesMode !== "growing") return { ok: false, reason: "full" };
          return { ok: true, fieldBlock };
        },
        step(board, worm, end, direction) {
          if (board.rulesMode === "growing") return Worms.stepGrowing(board, worm, end, direction);
          const delta = DIRS[direction];
          if (!delta) return { ok: false, reason: "bad direction" };
          const index = end === "tail" ? 0 : worm.cells.length - 1;
          const pivot = worm.cells[index];
          const next = { x: pivot.x + delta.x, y: pivot.y + delta.y };
          const check = Worms.canStep(board, worm, end, next);
          if (!check.ok) return check;
          const fieldBlock = check.fieldBlock;

          worm.prevCells = worm.cells.map((cell) => ({ ...cell }));
          worm.moveT = 0;
          if (end === "head") worm.cells = worm.cells.slice(1).concat([next]);
          else worm.cells = [next].concat(worm.cells.slice(0, -1));
          if (fieldBlock) {
            const slot = Worms.firstFree(worm);
            if (slot >= 0) {
              worm.carriedBlocks[slot] = fieldBlock.color;
              BoardUtils.removeFieldBlock(board, fieldBlock);
            }
          }
          board.moves++;
          return { ok: true, picked: fieldBlock ? fieldBlock.color : null };
        },
        stepGrowing(board, worm, end, direction) {
          const delta = DIRS[direction];
          if (!delta) return { ok: false, reason: "bad direction" };
          const pivot = end === "tail" ? worm.cells[0] : worm.cells[worm.cells.length - 1];
          const next = { x: pivot.x + delta.x, y: pivot.y + delta.y };
          const check = Worms.canStep(board, worm, end, next);
          if (!check.ok) return check;
          const fieldBlock = check.fieldBlock;
          const freeSlot = Worms.firstFree(worm);
          const grows = !!fieldBlock && freeSlot < 0;
          worm.prevCells = worm.cells.map((cell) => ({ ...cell }));
          worm.moveT = 0;
          worm.segmentKinds = worm.segmentKinds || Array(worm.cells.length).fill("native");
          if (end === "head") {
            if (grows) {
              worm.cells = worm.cells.concat([next]);
              worm.carriedBlocks = worm.carriedBlocks.concat([fieldBlock.color]);
              worm.segmentKinds = worm.segmentKinds.concat(["temp"]);
            } else {
              worm.cells = worm.cells.slice(1).concat([next]);
            }
          } else {
            if (grows) {
              worm.cells = [next].concat(worm.cells);
              worm.carriedBlocks = [fieldBlock.color].concat(worm.carriedBlocks);
              worm.segmentKinds = ["temp"].concat(worm.segmentKinds);
            } else {
              worm.cells = [next].concat(worm.cells.slice(0, -1));
            }
          }
          if (fieldBlock) {
            if (!grows) {
              const slot = Worms.firstFree(worm);
              if (slot >= 0) worm.carriedBlocks[slot] = fieldBlock.color;
            }
            BoardUtils.removeFieldBlock(board, fieldBlock);
          }
          worm.length = worm.cells.length;
          board.moves++;
          return { ok: true, picked: fieldBlock ? fieldBlock.color : null };
        },
        collapseTempAt(worm, index) {
          if (index <= 0) {
            worm.cells.shift();
            worm.carriedBlocks.shift();
            worm.segmentKinds.shift();
          } else {
            const pulledCells = worm.cells.slice(1, index + 1).map((cell) => ({ ...cell }));
            const frontCells = worm.cells.slice(index + 1).map((cell) => ({ ...cell }));
            worm.cells = pulledCells.concat(frontCells);
            worm.carriedBlocks = worm.carriedBlocks.slice(0, index).concat(worm.carriedBlocks.slice(index + 1));
            worm.segmentKinds = worm.segmentKinds.slice(0, index).concat(worm.segmentKinds.slice(index + 1));
          }
          worm.length = worm.cells.length;
        }
      };

      // Blocks
      const Blocks = {
        color(color) {
          return CONFIG.COLORS[color] || "#dfe8f3";
        },
        allColors(count) {
          return CONFIG.COLOR_ORDER.slice(0, count);
        }
      };

