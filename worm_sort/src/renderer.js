// Renderer
      class Renderer {
        constructor(canvas, game) {
          this.canvas = canvas;
          this.ctx = canvas.getContext("2d");
          this.game = game;
          this.dpr = 1;
          this.layout = { cell: 40, boardX: 0, boardY: 0, top: 0, bottom: 0, containerRects: new Map() };
          window.addEventListener("resize", () => this.resize());
          this.resize();
        }
        resize() {
          const rect = this.canvas.getBoundingClientRect();
          this.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
          this.canvas.width = Math.max(1, Math.floor(rect.width * this.dpr));
          this.canvas.height = Math.max(1, Math.floor(rect.height * this.dpr));
          this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
          this.computeLayout();
        }
        computeLayout() {
          const board = this.game.board || { width: 6, height: 6 };
          const rect = this.canvas.getBoundingClientRect();
          const containerCount = board.containers?.length || 2;
          const maxSideCount = Math.max(1, Math.ceil(containerCount / 4));
          const containerW = Math.max(54, Math.min(96, (rect.width - 28) / maxSideCount - 8));
          const containerH = Math.max(38, Math.min(56, containerW * 0.58));
          const gap = 10;
          const top = 18;
          const bottom = 18;
          const framePadCells = 1.15;
          const cell = Math.max(18, Math.min((rect.width - 32) / (board.width + framePadCells * 2), (rect.height - top - bottom - 24) / (board.height + framePadCells * 2)));
          const boardW = board.width * cell;
          const boardH = board.height * cell;
          this.layout = {
            cell,
            boardX: (rect.width - boardW) / 2,
            boardY: top + Math.max(cell * framePadCells, (rect.height - top - bottom - boardH) / 2),
            top,
            bottom,
            containerW,
            containerH,
            containerGap: gap,
            containerRects: new Map()
          };
        }
        cellRect(cell) {
          const l = this.layout;
          return { x: l.boardX + cell.x * l.cell, y: l.boardY + cell.y * l.cell, w: l.cell, h: l.cell };
        }
        cellCenter(cell) {
          const rect = this.cellRect(cell);
          return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
        }
        screenToCell(clientX, clientY) {
          const rect = this.canvas.getBoundingClientRect();
          const x = clientX - rect.left;
          const y = clientY - rect.top;
          const cx = Math.floor((x - this.layout.boardX) / this.layout.cell);
          const cy = Math.floor((y - this.layout.boardY) / this.layout.cell);
          return { x: cx, y: cy };
        }
        hitContainer(clientX, clientY) {
          const rect = this.canvas.getBoundingClientRect();
          const x = clientX - rect.left;
          const y = clientY - rect.top;
          for (const [id, box] of this.layout.containerRects.entries()) {
            if (x >= box.x && y >= box.y && x <= box.x + box.w && y <= box.y + box.h) return id;
          }
          return null;
        }
        draw() {
          this.computeLayout();
          const ctx = this.ctx;
          const rect = this.canvas.getBoundingClientRect();
          ctx.clearRect(0, 0, rect.width, rect.height);
          if (!this.game.board) return;
          this.drawBoard();
          this.drawContainers();
          this.drawBlocks();
          this.drawWorms();
          this.drawPops();
        }
        drawBoard() {
          const ctx = this.ctx;
          const board = this.game.board;
          const l = this.layout;
          ctx.save();
          const frameX = l.boardX - l.cell * 1.15;
          const frameY = l.boardY - l.cell * 1.15;
          const frameW = board.width * l.cell + l.cell * 2.3;
          const frameH = board.height * l.cell + l.cell * 2.3;
          ctx.fillStyle = "rgba(24,42,61,.78)";
          ctx.strokeStyle = "rgba(85,167,255,.34)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(frameX + frameW / 2, frameY + frameH / 2, frameW / 2, frameH / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          for (let y = 0; y < board.height; y++) {
            for (let x = 0; x < board.width; x++) {
              if (!BoardUtils.isPlayableCell(board, x, y)) continue;
              const r = this.cellRect({ x, y });
              ctx.fillStyle = (x + y) % 2 ? "rgba(47,76,108,.98)" : "rgba(60,93,129,.98)";
              this.roundRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4, Math.min(10, r.w * .22));
              ctx.fill();
            }
          }
          for (const container of board.containers) {
            const r = this.cellRect(container.loadCell);
            const can = board.worms.some((worm) => Containers.canReceiveFromWorm(board, container, worm));
            ctx.fillStyle = can ? "rgba(53,185,120,.25)" : "rgba(36,101,167,.16)";
            ctx.strokeStyle = can ? "rgba(53,185,120,.9)" : "rgba(36,101,167,.42)";
            ctx.lineWidth = 2;
            this.roundRect(r.x + 7, r.y + 7, r.w - 14, r.h - 14, 9);
            ctx.fill();
            ctx.stroke();
            const p = this.cellCenter(container.loadCell);
            const dock = this.containerDock(container);
            const sx = dock.x;
            const sy = dock.y;
            ctx.fillStyle = can ? "rgba(53,185,120,.9)" : "rgba(36,101,167,.72)";
            ctx.beginPath();
            if (sx !== 0) {
              ctx.moveTo(p.x + sx * r.w * .24, p.y);
              ctx.lineTo(p.x - sx * r.w * .13, p.y - r.h * .17);
              ctx.lineTo(p.x - sx * r.w * .13, p.y + r.h * .17);
            } else {
              ctx.moveTo(p.x, p.y + sy * r.h * .24);
              ctx.lineTo(p.x - r.w * .17, p.y - sy * r.h * .13);
              ctx.lineTo(p.x + r.w * .17, p.y - sy * r.h * .13);
            }
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
        drawContainers() {
          const ctx = this.ctx;
          const board = this.game.board;
          const l = this.layout;
          l.containerRects.clear();
          for (const container of board.containers) {
            const dock = this.containerDock(container);
            const capacity = container.capacity || board.containerCapacity || 10;
            const lengthCells = Math.max(1, Math.ceil(capacity / 5));
            const horizontal = dock.x !== 0;
            const w = horizontal ? l.cell * lengthCells : l.cell;
            const h = horizontal ? l.cell : l.cell * lengthCells;
            const canvasRect = this.canvas.getBoundingClientRect();
            const firstCell = (container.cells && container.cells[0]) || container.loadCell;
            const lastCell = (container.cells && container.cells[container.cells.length - 1]) || firstCell;
            const firstRect = this.cellRect(firstCell);
            const lastRect = this.cellRect(lastCell);
            const rawX = Math.min(firstRect.x, lastRect.x);
            const rawY = Math.min(firstRect.y, lastRect.y);
            const x = Math.max(8, Math.min(rawX, canvasRect.width - w - 8));
            const y = Math.max(8, Math.min(rawY, canvasRect.height - h - 8));
            l.containerRects.set(container.id, { x, y, w, h, dock });
            const danger = container.flash > 0;
            const locked = Containers.isLocked(board, container);
            const lockedColor = locked ? Blocks.color(container.blocks[0]) : null;
            ctx.save();
            ctx.fillStyle = danger ? "rgba(255,104,117,.22)" : locked ? `${lockedColor}33` : "rgba(255,255,255,.9)";
            ctx.strokeStyle = danger ? "rgba(255,104,117,.9)" : locked ? lockedColor : "rgba(24,49,79,.18)";
            ctx.lineWidth = 2;
            this.roundRect(x, y, w, h, Math.min(12, l.cell * .22));
            ctx.fill();
            ctx.stroke();
            const blocks = container.blocks.slice(0, container.capacity || board.containerCapacity || 10);
            const innerPad = Math.max(5, l.cell * .13);
            const bw = horizontal ? Math.max(5, (w - innerPad * 2) / capacity) : w - innerPad * 2;
            const bhUnit = horizontal ? h - innerPad * 2 : Math.max(5, (h - innerPad * 2) / capacity);
            for (let i = 0; i < blocks.length; i++) {
              const index = this.blockDrawIndex(i, blocks.length, dock);
              ctx.fillStyle = Blocks.color(blocks[i]);
              const bx = horizontal ? x + innerPad + index * bw : x + innerPad;
              const by = horizontal ? y + innerPad : y + innerPad + index * bhUnit;
              this.roundRect(bx + 1, by + 1, Math.max(4, bw - 2), Math.max(4, bhUnit - 2), 5);
              ctx.fill();
            }
            ctx.fillStyle = "rgba(24,49,79,.76)";
            ctx.font = "700 11px Trebuchet MS";
            ctx.textAlign = "center";
            ctx.fillText(`${container.blocks.length}/${capacity}`, x + w / 2, y + h - 5);
            ctx.restore();
          }
        }
        containerDock(container) {
          if (container.dock) return container.dock;
          const zone = container.zone || "top-left";
          if (zone === "top-left") return { x: -1, y: 0 };
          if (zone === "top-right") return { x: 1, y: 0 };
          if (zone === "bottom-left") return { x: -1, y: 0 };
          return { x: 1, y: 0 };
        }
        blockDrawIndex(index, length, dock) {
          if (dock.x < 0 || dock.y < 0) return length - 1 - index;
          return index;
        }
        drawBlocks() {
          const ctx = this.ctx;
          const board = this.game.board;
          for (const block of board.fieldBlocks) {
            const r = this.cellRect(block);
            const pad = Math.max(5, r.w * .18);
            ctx.save();
            ctx.fillStyle = Blocks.color(block.color);
            ctx.shadowColor = "rgba(24,49,79,.18)";
            ctx.shadowBlur = 9;
            ctx.shadowOffsetY = 5;
            this.roundRect(r.x + pad, r.y + pad, r.w - pad * 2, r.h - pad * 2, 8);
            ctx.fill();
            ctx.restore();
          }
        }
        drawWorms() {
          const ctx = this.ctx;
          const board = this.game.board;
          for (const worm of board.worms) {
            const selected = this.game.state.selection?.id === worm.id;
            const centers = worm.cells.map((cell) => this.cellCenter(cell));
            ctx.save();
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = worm.flash > 0 ? "rgba(255,104,117,.9)" : selected ? "rgba(36,101,167,.9)" : "rgba(160,176,195,.85)";
            ctx.lineWidth = this.layout.cell * .52;
            ctx.beginPath();
            centers.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
            ctx.stroke();
            ctx.strokeStyle = "rgba(255,255,255,.58)";
            ctx.lineWidth = this.layout.cell * .34;
            ctx.beginPath();
            centers.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
            ctx.stroke();
            for (let i = 0; i < centers.length; i++) {
              const p = centers[i];
              ctx.fillStyle = worm.flash > 0 ? "#ff7b86" : selected ? "#c9e4ff" : "#9fb4cf";
              if (worm.segmentKinds?.[i] === "temp") ctx.fillStyle = selected ? "#ffe29a" : "#d8a94d";
              ctx.strokeStyle = selected ? "rgba(85,167,255,.95)" : "rgba(6,14,26,.35)";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(p.x, p.y, this.layout.cell * .32, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              if (worm.carriedBlocks[i]) {
                ctx.fillStyle = Blocks.color(worm.carriedBlocks[i]);
                this.roundRect(p.x - this.layout.cell * .16, p.y - this.layout.cell * .16, this.layout.cell * .32, this.layout.cell * .32, 6);
                ctx.fill();
              }
            }
            const head = centers[centers.length - 1];
            ctx.fillStyle = "rgba(24,49,79,.55)";
            ctx.beginPath();
            ctx.arc(head.x - this.layout.cell * .09, head.y - this.layout.cell * .05, Math.max(2, this.layout.cell * .035), 0, Math.PI * 2);
            ctx.arc(head.x + this.layout.cell * .09, head.y - this.layout.cell * .05, Math.max(2, this.layout.cell * .035), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
        drawPops() {
          const ctx = this.ctx;
          const board = this.game.board;
          for (const pop of board.pops || []) {
            const p = this.cellCenter(pop.cell);
            const t = Math.max(0, pop.life / pop.maxLife);
            ctx.save();
            ctx.globalAlpha = t;
            ctx.strokeStyle = pop.color ? Blocks.color(pop.color) : "#ffe29a";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, this.layout.cell * (0.22 + (1 - t) * 0.42), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
        }
        roundRect(x, y, w, h, r) {
          const ctx = this.ctx;
          const radius = Math.min(r, w / 2, h / 2);
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + w - radius, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
          ctx.lineTo(x + w, y + h - radius);
          ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
          ctx.lineTo(x + radius, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
        }
      }

