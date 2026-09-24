// UI, Input, DebugTools
      class Game {
        constructor() {
          this.refs = {};
          for (const id of ["gameCanvas","menuScreen","victoryScreen","campaignButton","campaignLevelInput","campaignRulesInput","sandboxButton","menuUnlocked","hudLevel","hudMoves","hudSorted","hudWorms","restartButton","menuButton","debugButton","hintLine","selectionMeta","containerList","containerBadge","validityBadge","debugStats","selectedBox","wormBadge","tailButton","headButton","designerPanel","fieldWidthInput","fieldHeightInput","crossThicknessInput","containerCountInput","containerSizeModeInput","colorCountInput","smallCapacityInput","normalCapacityInput","largeCapacityInput","wormCountInput","wormLengthMinInput","wormLengthMaxInput","totalBlocksInput","minGroupInput","maxGroupInput","paletteOffsetInput","seedInput","presetInput","rulesModeInput","generateButton","designerRestartButton","exportButton","importButton","jsonBox","toastStack","nextButton","victoryRestartButton","victoryMenuButton","victoryMoves","victorySorted"]) {
            this.refs[id] = document.getElementById(id);
          }
          this.board = null;
          this.initialBoard = null;
          this.state = {
            mode: "menu",
            level: 1,
            selection: null,
            selectedEnd: "head",
            screen: "menu",
            keyDirection: null,
            keyCooldown: 0,
            pointer: null,
            pointerBoard: null,
            dragging: false,
            dragDistance: 0,
            pointerStepCooldown: 0,
            designerOpen: false
          };
          this.toasts = [];
          this.sandboxSettings = LevelGenerator.normalize({ width: 11, height: 11, crossThickness: 3, wormCount: 2, wormLengthMin: 3, wormLengthMax: 4, containerCount: 4, containerSizeMode: "mixed", totalBlocks: 30, minGroup: 2, maxGroup: 4, paletteOffset: 0, seed: 12345, preset: "normal", rulesMode: "standard" }, "sandbox");
          this.renderer = new Renderer(this.refs.gameCanvas, this);
          this.bind();
          this.fillDesigner(this.sandboxSettings);
          this.updateUI();
          requestAnimationFrame((time) => this.loop(time));
        }
        bind() {
          this.refs.campaignButton.addEventListener("click", () => this.startCampaign(this.refs.campaignLevelInput.value || Save.data.unlockedLevel || 1, this.refs.campaignRulesInput.value || "growing"));
          this.refs.sandboxButton.addEventListener("click", () => this.startSandbox());
          this.refs.restartButton.addEventListener("click", () => this.restart());
          this.refs.menuButton.addEventListener("click", () => this.showMenu());
          this.refs.debugButton.addEventListener("click", () => this.toggleDesigner());
          this.refs.generateButton.addEventListener("click", () => this.generateSandbox());
          this.refs.designerRestartButton.addEventListener("click", () => this.restart());
          this.refs.exportButton.addEventListener("click", () => this.exportJSON());
          this.refs.importButton.addEventListener("click", () => this.importJSON());
          this.refs.nextButton.addEventListener("click", () => this.nextLevel());
          this.refs.victoryRestartButton.addEventListener("click", () => this.restart());
          this.refs.victoryMenuButton.addEventListener("click", () => this.showMenu());
          this.refs.tailButton.addEventListener("click", () => this.setEnd("tail"));
          this.refs.headButton.addEventListener("click", () => this.setEnd("head"));
          document.querySelectorAll("[data-dir]").forEach((button) => button.addEventListener("click", () => this.stepSelected(button.dataset.dir)));
          this.refs.containerCountInput.addEventListener("input", () => {
            this.refs.colorCountInput.value = this.refs.containerCountInput.value;
            this.updateDesignerDerived();
          });
          this.refs.containerSizeModeInput.addEventListener("input", () => this.updateDesignerDerived());
          this.refs.gameCanvas.addEventListener("pointerdown", (event) => this.onPointerDown(event));
          this.refs.gameCanvas.addEventListener("pointermove", (event) => this.onPointerMove(event));
          this.refs.gameCanvas.addEventListener("pointerup", (event) => this.onPointerUp(event));
          this.refs.gameCanvas.addEventListener("pointercancel", (event) => this.onPointerUp(event));
          this.refs.gameCanvas.addEventListener("pointerleave", (event) => this.onPointerUp(event));
          window.addEventListener("keydown", (event) => this.onKeyDown(event));
          window.addEventListener("keyup", (event) => this.onKeyUp(event));
        }
        loop(time) {
          const dt = Math.min(0.05, (time - (this.lastTime || time)) / 1000);
          this.lastTime = time;
          this.tick(dt);
          this.renderer.draw();
          requestAnimationFrame((next) => this.loop(next));
        }
        tick(dt) {
          if (this.board) {
            for (const worm of this.board.worms) {
              worm.flash = Math.max(0, (worm.flash || 0) - dt);
              worm.moveT = Math.min(1, (worm.moveT || 1) + dt * 9);
            }
            for (const container of this.board.containers) {
              container.flash = Math.max(0, (container.flash || 0) - dt);
              container.pulse = Math.max(0, (container.pulse || 0) - dt * 3);
            }
            if (this.board.victoryPending) {
              this.board.victoryPending -= dt;
              if (this.board.victoryPending <= 0 && this.state.screen === "gameplay") this.showVictory();
            }
            if (this.board.pops) {
              for (const pop of this.board.pops) pop.life -= dt;
              this.board.pops = this.board.pops.filter((pop) => pop.life > 0);
            }
            const cascadeResult = Containers.updateGrowingCascade(this.board, dt);
            if (cascadeResult) {
              this.toast(`Loaded ${cascadeResult.moved} ${cascadeResult.color}.`, "success");
              this.afterAction();
            }
          }
          for (const toast of this.toasts) toast.life -= dt;
          const before = this.toasts.length;
          this.toasts = this.toasts.filter((toast) => toast.life > 0);
          if (before !== this.toasts.length) this.renderToasts();
          this.updatePointerDrag(dt);
          if (this.state.keyDirection && this.state.keyCooldown <= 0 && this.state.screen === "gameplay") {
            const moved = this.stepSelected(this.state.keyDirection, { suppressSelectionToast: true, silentBlocked: true });
            this.state.keyCooldown = moved ? CONFIG.INPUT.keyboardStepInterval : CONFIG.INPUT.keyboardStepInterval * 0.7;
          }
          this.state.keyCooldown = Math.max(0, this.state.keyCooldown - dt);
        }
        startCampaign(level, rulesMode = "growing") {
          const maxLevel = window.GameEntry?.current && !window.GameEntry.current.isDeveloper() ? Save.data.unlockedLevel : CONFIG.MAX_CAMPAIGN_LEVEL;
          const safeLevel = Helpers.clamp(level, 1, maxLevel);
          this.board = LevelGenerator.build(safeLevel, "campaign", { ...Campaign.settings(safeLevel), rulesMode });
          this.initialBoard = Helpers.clone(this.board);
          this.state = { ...this.state, mode: "campaign", level: safeLevel, screen: "gameplay", selection: { id: this.board.worms[0].id }, selectedEnd: "head" };
          this.refs.menuScreen.classList.add("hidden");
          this.refs.victoryScreen.classList.add("hidden");
          this.toast(Campaign.hint(safeLevel), "success");
          this.updateUI();
        }
        startSandbox() {
          if (window.GameEntry?.current && !window.GameEntry.current.isDeveloper()) return;
          this.generateSandbox();
          this.state.mode = "sandbox";
          this.state.level = 0;
          this.refs.menuScreen.classList.add("hidden");
          this.refs.victoryScreen.classList.add("hidden");
          this.toast("Sandbox level generated.", "success");
          this.updateUI();
        }
        generateSandbox() {
          if (window.GameEntry?.current && !window.GameEntry.current.isDeveloper()) return;
          this.sandboxSettings = this.readDesigner();
          this.board = LevelGenerator.build(0, "sandbox", this.sandboxSettings);
          this.initialBoard = Helpers.clone(this.board);
          this.state = { ...this.state, mode: "sandbox", level: 0, screen: "gameplay", selection: { id: this.board.worms[0].id }, selectedEnd: "head" };
          this.refs.menuScreen.classList.add("hidden");
          this.refs.victoryScreen.classList.add("hidden");
          this.updateUI();
        }
        restart() {
          if (!this.initialBoard) return;
          this.board = LevelGenerator.prepare(Helpers.clone(this.initialBoard));
          this.board.won = false;
          this.state.screen = "gameplay";
          this.refs.victoryScreen.classList.add("hidden");
          this.state.selection = this.board.worms[0] ? { id: this.board.worms[0].id } : null;
          this.toast("Restarted.", "success");
          this.updateUI();
        }
        nextLevel() {
          if (this.state.mode !== "campaign") {
            this.startSandbox();
            return;
          }
          this.startCampaign(Math.min(CONFIG.MAX_CAMPAIGN_LEVEL, this.state.level + 1), this.board?.rulesMode || "growing");
        }
        showMenu() {
          this.state.screen = "menu";
          this.refs.menuScreen.classList.remove("hidden");
          this.refs.victoryScreen.classList.add("hidden");
          this.updateUI();
        }
        showVictory() {
          this.state.screen = "victory";
          const info = BoardUtils.sortedInfo(this.board);
          this.refs.victoryMoves.textContent = String(this.board.moves || 0);
          this.refs.victorySorted.textContent = `${info.sorted} / ${info.total}`;
          this.refs.nextButton.disabled = this.state.mode === "campaign" && this.state.level >= CONFIG.MAX_CAMPAIGN_LEVEL;
          if (this.state.mode === "campaign") Save.unlock(Math.min(CONFIG.MAX_CAMPAIGN_LEVEL, this.state.level + 1));
          this.refs.victoryScreen.classList.remove("hidden");
          this.updateUI();
        }
        onPointerDown(event) {
          if (!this.board || this.state.screen !== "gameplay") return;
          event.preventDefault();
          const containerId = this.renderer.hitContainer(event.clientX, event.clientY);
          if (containerId) {
            const container = this.board.containers.find((item) => item.id === containerId);
            if (container) this.tapContainer(container);
            return;
          }
          const cell = this.updatePointerBoard(event);
          if (!BoardUtils.inside(this.board, cell.x, cell.y)) return;
          const hit = this.findWormCell(cell);
          if (hit) {
            const selectionBefore = this.state.selection?.id || null;
            this.state.selection = { id: hit.worm.id };
            this.state.selectedEnd = this.pickEndForCell(hit.worm, cell);
            this.state.pointer = {
              id: event.pointerId,
              startX: event.clientX,
              startY: event.clientY,
              hitId: hit.worm.id,
              cell,
              selectionBefore
            };
            this.state.dragging = false;
            this.state.dragDistance = 0;
            this.state.pointerStepCooldown = 0;
            try { this.refs.gameCanvas.setPointerCapture(event.pointerId); } catch (error) {}
            this.updateUI();
            return;
          }
          const worm = this.getSelectedWorm();
          if (!worm) return;
          const head = worm.cells[worm.cells.length - 1];
          const tail = worm.cells[0];
          for (const [dir, delta] of Object.entries(DIRS)) {
            if (this.state.selectedEnd === "head" && head.x + delta.x === cell.x && head.y + delta.y === cell.y) this.stepSelected(dir);
            if (this.state.selectedEnd === "tail" && tail.x + delta.x === cell.x && tail.y + delta.y === cell.y) this.stepSelected(dir);
          }
        }
        onPointerMove(event) {
          if (!this.state.pointer || this.state.pointer.id !== event.pointerId || !this.board || this.state.screen !== "gameplay") return;
          event.preventDefault();
          this.updatePointerBoard(event);
          this.state.dragDistance = Math.abs(event.clientX - this.state.pointer.startX) + Math.abs(event.clientY - this.state.pointer.startY);
          if (this.state.dragDistance > CONFIG.INPUT.dragThreshold) this.state.dragging = true;
        }
        onPointerUp(event) {
          if (!this.state.pointer || this.state.pointer.id !== event.pointerId) return;
          event.preventDefault();
          const pointer = this.state.pointer;
          try { this.refs.gameCanvas.releasePointerCapture(event.pointerId); } catch (error) {}
          const wasDragging = this.state.dragging;
          this.state.pointer = null;
          this.state.pointerBoard = null;
          this.state.dragging = false;
          this.state.dragDistance = 0;
          this.state.pointerStepCooldown = 0;
          if (!wasDragging && this.board && this.state.screen === "gameplay") {
            const worm = this.board.worms.find((candidate) => candidate.id === pointer.hitId);
            if (worm) {
              if (pointer.selectionBefore === worm.id) this.state.selectedEnd = this.state.selectedEnd === "head" ? "tail" : "head";
              else this.state.selection = { id: worm.id };
              this.updateUI();
            }
          }
        }
        onKeyDown(event) {
          if (this.state.screen !== "gameplay") return;
          const key = event.key.toLowerCase();
          const map = { arrowup: "up", w: "up", arrowdown: "down", s: "down", arrowleft: "left", a: "left", arrowright: "right", d: "right" };
          if (map[key]) {
            event.preventDefault();
            if (event.repeat && this.state.keyDirection === map[key]) return;
            this.state.keyDirection = map[key];
            this.state.keyCooldown = 0;
            this.stepSelected(map[key], { suppressSelectionToast: true, silentBlocked: true });
          } else if (event.key === "Tab") {
            event.preventDefault();
            this.cycleWorm();
          } else if (key === "q" || key === "e") {
            this.setEnd(this.state.selectedEnd === "head" ? "tail" : "head");
          } else if (key === "g") {
            this.toggleDesigner();
          }
        }
        onKeyUp(event) {
          const key = event.key.toLowerCase();
          const map = { arrowup: "up", w: "up", arrowdown: "down", s: "down", arrowleft: "left", a: "left", arrowright: "right", d: "right" };
          if (map[key] && this.state.keyDirection === map[key]) this.state.keyDirection = null;
        }
        tapContainer(container) {
          const result = Containers.eject(this.board, container);
          if (result.moved) {
            this.board.moves++;
            this.toast(`Released ${result.moved} ${result.color} block${result.moved === 1 ? "" : "s"}.`, "success");
          } else if (result.locked) {
            this.toast("Sorted container is locked.", "success");
          } else {
            this.toast("No room beside that container.", "warn");
          }
          this.afterAction();
        }
        updatePointerBoard(event) {
          const cell = this.renderer.screenToCell(event.clientX, event.clientY);
          this.state.pointerBoard = BoardUtils.inside(this.board, cell.x, cell.y)
            ? { x: cell.x + 0.5, y: cell.y + 0.5 }
            : null;
          return cell;
        }
        getDesiredPointerStep() {
          if (!this.state.dragging || !this.state.pointerBoard || this.state.dragDistance <= CONFIG.INPUT.dragThreshold) return null;
          if (!this.board || this.state.screen !== "gameplay") return null;
          const worm = this.getSelectedWorm();
          if (!worm) return null;
          const activeEnd = this.state.selectedEnd;
          const current = activeEnd === "head" ? worm.cells[worm.cells.length - 1] : worm.cells[0];
          let bestDirection = null;
          let bestDistance = Helpers.dist(this.state.pointerBoard.x, this.state.pointerBoard.y, current.x + 0.5, current.y + 0.5);
          for (const [direction, delta] of Object.entries(DIRS)) {
            const nextCell = { x: current.x + delta.x, y: current.y + delta.y };
            const test = Worms.canStep(this.board, worm, activeEnd, nextCell);
            if (!test.ok) continue;
            const distance = Helpers.dist(this.state.pointerBoard.x, this.state.pointerBoard.y, nextCell.x + 0.5, nextCell.y + 0.5);
            if (distance < bestDistance - CONFIG.INPUT.pointerBias) {
              bestDistance = distance;
              bestDirection = direction;
            }
          }
          return bestDirection;
        }
        updatePointerDrag(dt) {
          this.state.pointerStepCooldown = Math.max(0, this.state.pointerStepCooldown - dt);
          const direction = this.getDesiredPointerStep();
          if (!direction || this.state.pointerStepCooldown > 0) return;
          const moved = this.stepSelected(direction, { suppressSelectionToast: true, silentBlocked: true });
          this.state.pointerStepCooldown = moved ? CONFIG.INPUT.pointerStepInterval : CONFIG.INPUT.pointerStepInterval * 0.6;
        }
        stepSelected(direction, options = {}) {
          if (typeof options === "boolean") options = { suppressSelectionToast: options, silentBlocked: options };
          const worm = this.getSelectedWorm();
          if (!worm) {
            if (!options.suppressSelectionToast) this.toast("Select a worm first.", "warn");
            return false;
          }
          const result = Worms.step(this.board, worm, this.state.selectedEnd, direction);
          if (!result.ok) {
            worm.flash = CONFIG.ANIM.flash;
            if (!options.silentBlocked) this.toast(result.reason === "full" ? "Full worm cannot pass through a block." : "Cannot move there.", "warn");
            return false;
          }
          if (result.picked) this.toast(`Picked up ${result.picked}.`, "success");
          this.tryAutoUnload(worm);
          this.afterAction();
          return true;
        }
        tryAutoUnload(worm) {
          for (const container of this.board.containers) {
            if (!worm.cells.some((cell) => Helpers.same(cell, container.loadCell))) continue;
            const result = Containers.unload(this.board, container, worm);
            if (result.moved) this.toast(`Loaded ${result.moved} ${result.color}.`, "success");
          }
        }
        afterAction() {
          if (BoardUtils.isComplete(this.board) && !this.board.won) {
            this.board.won = true;
            this.board.victoryPending = CONFIG.ANIM.victoryDelay;
            this.toast("All colors sorted.", "success");
          }
          this.updateUI();
        }
        findWormCell(cell) {
          for (const worm of this.board.worms) {
            const index = worm.cells.findIndex((part) => Helpers.same(part, cell));
            if (index >= 0) return { worm, index };
          }
          return null;
        }
        pickEndForCell(worm, cell) {
          const tail = worm.cells[0];
          const head = worm.cells[worm.cells.length - 1];
          return Helpers.manhattan(tail, cell) <= Helpers.manhattan(head, cell) ? "tail" : "head";
        }
        getSelectedWorm() {
          return this.board?.worms.find((worm) => worm.id === this.state.selection?.id) || null;
        }
        setEnd(end) {
          this.state.selectedEnd = end;
          this.updateUI();
        }
        cycleWorm() {
          if (!this.board?.worms.length) return;
          const index = this.board.worms.findIndex((worm) => worm.id === this.state.selection?.id);
          const next = this.board.worms[(index + 1 + this.board.worms.length) % this.board.worms.length];
          this.state.selection = { id: next.id };
          this.state.selectedEnd = "head";
          this.updateUI();
        }
        fillDesigner(settings) {
          this.refs.fieldWidthInput.value = settings.width;
          this.refs.fieldHeightInput.value = settings.height;
          this.refs.crossThicknessInput.value = settings.crossThickness;
          this.refs.containerCountInput.value = settings.containerCount;
          this.refs.containerSizeModeInput.value = settings.containerSizeMode;
          this.refs.colorCountInput.value = settings.containerCount;
          this.refs.smallCapacityInput.value = CONFIG.SMALL_CONTAINER_CAPACITY;
          this.refs.normalCapacityInput.value = CONFIG.NORMAL_CONTAINER_CAPACITY;
          this.refs.largeCapacityInput.value = CONFIG.LARGE_CONTAINER_CAPACITY;
          this.refs.wormCountInput.value = settings.wormCount;
          this.refs.wormLengthMinInput.value = settings.wormLengthMin;
          this.refs.wormLengthMaxInput.value = settings.wormLengthMax;
          this.refs.totalBlocksInput.value = settings.totalBlocks;
          this.refs.minGroupInput.value = settings.minGroup;
          this.refs.maxGroupInput.value = settings.maxGroup;
          this.refs.paletteOffsetInput.value = settings.paletteOffset;
          this.refs.seedInput.value = settings.seed;
          this.refs.presetInput.value = settings.preset;
          this.refs.rulesModeInput.value = settings.rulesMode || "standard";
          this.updateDesignerDerived();
        }
        updateDesignerDerived() {
          const count = Helpers.clamp(this.refs.containerCountInput.value || 2, 2, CONFIG.MAX_CONTAINER_COUNT);
          const capacities = LevelGenerator.containerCapacities(count, this.refs.containerSizeModeInput.value || "normal", Number(this.refs.seedInput.value) || 1);
          this.refs.colorCountInput.value = count;
          this.refs.totalBlocksInput.value = capacities.reduce((sum, value) => sum + value, 0);
        }
        readDesigner() {
          return LevelGenerator.normalize({
            width: this.refs.fieldWidthInput.value,
            height: this.refs.fieldHeightInput.value,
            crossThickness: this.refs.crossThicknessInput.value,
            containerCount: this.refs.containerCountInput.value,
            containerSizeMode: this.refs.containerSizeModeInput.value,
            wormCount: this.refs.wormCountInput.value,
            wormLengthMin: this.refs.wormLengthMinInput.value,
            wormLengthMax: this.refs.wormLengthMaxInput.value,
            totalBlocks: this.refs.totalBlocksInput.value,
            minGroup: this.refs.minGroupInput.value,
            maxGroup: this.refs.maxGroupInput.value,
            paletteOffset: this.refs.paletteOffsetInput.value,
            seed: this.refs.seedInput.value,
            preset: this.refs.presetInput.value,
            rulesMode: this.refs.rulesModeInput.value
          }, "sandbox");
        }
        toggleDesigner() {
          if (!this.state.designerOpen && window.GameEntry?.current && !window.GameEntry.current.isDeveloper()) return;
          this.state.designerOpen = !this.state.designerOpen;
          this.refs.designerPanel.classList.toggle("hidden", !this.state.designerOpen);
        }
        exportJSON() {
          if (window.GameEntry?.current && !window.GameEntry.current.isDeveloper()) return;
          if (!this.board) return;
          const clean = Helpers.clone(this.board);
          delete clean._playableSet;
          for (const container of clean.containers) delete container.flash;
          for (const worm of clean.worms) {
            delete worm.flash;
            delete worm.moveT;
            delete worm.prevCells;
          }
          this.refs.jsonBox.value = JSON.stringify({ type: "worm_sort_level", level: clean }, null, 2);
          this.toast("JSON exported.", "success");
        }
        importJSON() {
          if (window.GameEntry?.current && !window.GameEntry.current.isDeveloper()) return;
          try {
            const parsed = JSON.parse(this.refs.jsonBox.value);
            const level = parsed.level || parsed;
            if (!level || !Array.isArray(level.containers) || !Array.isArray(level.worms)) throw new Error("Missing level data");
            const prepared = LevelGenerator.prepare(level);
            const validity = BoardUtils.validate(prepared, true);
            if (!validity.ok) throw new Error(validity.issues[0]);
            this.board = prepared;
            this.initialBoard = Helpers.clone(prepared);
            this.state.mode = prepared.mode || "sandbox";
            this.state.level = prepared.level || 0;
            this.state.screen = "gameplay";
            this.state.selection = prepared.worms[0] ? { id: prepared.worms[0].id } : null;
            this.refs.menuScreen.classList.add("hidden");
            this.refs.victoryScreen.classList.add("hidden");
            this.toast("JSON imported.", "success");
            this.updateUI();
          } catch (error) {
            this.toast(`Import failed: ${error.message}`, "warn");
          }
        }
        updateUI() {
          const board = this.board;
          this.refs.menuUnlocked.textContent = String(Save.data.unlockedLevel || 1);
          if (this.refs.campaignLevelInput && this.state.screen === "menu") this.refs.campaignLevelInput.value = this.refs.campaignLevelInput.value || String(Save.data.unlockedLevel || 1);
          this.refs.hudLevel.textContent = board ? (this.state.mode === "campaign" ? String(this.state.level) : "Free") : "-";
          this.refs.hudMoves.textContent = board ? String(board.moves || 0) : "0";
          const info = BoardUtils.sortedInfo(board);
          this.refs.hudSorted.textContent = `${info.sorted} / ${info.total}`;
          this.refs.hudWorms.textContent = board ? String(board.worms.length) : "0";
          this.refs.hintLine.textContent = board ? (this.state.mode === "campaign" ? Campaign.hint(this.state.level) : "Sandbox: tune settings, generate, then test the board immediately.") : "Choose Campaign or Sandbox from the menu.";
          this.renderContainers();
          this.renderSelection();
          this.renderStats();
          this.renderToasts();
        }
        renderContainers() {
          if (!this.board) {
            this.refs.containerBadge.textContent = "0";
            this.refs.containerList.innerHTML = "";
            return;
          }
          this.refs.containerBadge.textContent = `${this.board.containers.length}`;
          this.refs.containerList.innerHTML = this.board.containers.map((container, index) => {
            const single = container.blocks.length && container.blocks.every((block) => block === container.blocks[0]);
            const capacity = container.capacity || this.board.containerCapacity || CONFIG.NORMAL_CONTAINER_CAPACITY;
            return `<div class="item ${single ? "done" : ""}">
              <div class="itemTop"><span>Container ${index + 1}</span><span class="tag">${container.blocks.length} / ${capacity}</span></div>
              <div class="swatches">${container.blocks.map((color) => `<span class="swatch" style="background:${Blocks.color(color)}"></span>`).join("")}</div>
              <div class="muted">${this.escape(Helpers.groupText(container.blocks))}</div>
              <div class="muted">${container.zone || "corner"} loading point: ${container.loadCell.x}, ${container.loadCell.y}</div>
            </div>`;
          }).join("");
        }
        renderSelection() {
          const worm = this.getSelectedWorm();
          this.refs.wormBadge.textContent = this.board ? `${this.board.worms.length} worms` : "0 worms";
          this.refs.tailButton.classList.toggle("accent", this.state.selectedEnd === "tail");
          this.refs.headButton.classList.toggle("accent", this.state.selectedEnd === "head");
          if (!worm) {
            this.refs.selectionMeta.textContent = "No worm selected";
            this.refs.selectedBox.innerHTML = `<p class="muted">Tap a worm, then move it with buttons, WASD, or arrow keys.</p>`;
            return;
          }
          const carried = worm.carriedBlocks.filter(Boolean).length;
          this.refs.selectionMeta.textContent = `Selected ${worm.id.replace("_", " ")} from ${this.state.selectedEnd}`;
          this.refs.selectedBox.innerHTML = `
            <div class="itemTop"><span>${worm.length} segments</span><span class="tag">${carried} / ${worm.length}</span></div>
            <div class="swatches">${worm.carriedBlocks.map((color) => `<span class="swatch" style="background:${color ? Blocks.color(color) : "#dfe8f3"}"></span>`).join("")}</div>
            <p class="muted">${carried ? "Carrying blocks. Step onto a matching loading point to unload." : "Empty. Step onto blocks to pick them up."}</p>
          `;
        }
        renderStats() {
          if (!this.board) {
            this.refs.validityBadge.textContent = "Ready";
            this.refs.debugStats.innerHTML = "";
            return;
          }
          const validity = BoardUtils.validate(this.board, false);
          this.refs.validityBadge.textContent = this.board.colors.length === this.board.containers.length ? "colors == containers" : "check setup";
          const capacities = this.board.containers.map((container) => container.capacity || this.board.containerCapacity || CONFIG.NORMAL_CONTAINER_CAPACITY).join(", ");
          const wormPattern = this.board.worms.map((worm) => worm.length).join(", ");
          this.refs.debugStats.innerHTML = `
            <div class="item ${validity.ok ? "done" : "warn"}">
              <div class="itemTop"><span>Level validity</span><span class="tag">${validity.ok ? "OK" : "Check"}</span></div>
              <div class="muted">${validity.ok ? "Colors match containers and loading points are usable." : this.escape(validity.issues.join(", "))}</div>
            </div>
            <div class="item">
              <div class="itemTop"><span>Playable cells</span><span class="tag">${BoardUtils.playableCount(this.board)}</span></div>
              <div class="muted">Cross thickness ${this.board.crossThickness || "-"}. Archetype: ${this.escape(this.board.archetype || "Sandbox")}.</div>
            </div>
            <div class="item">
              <div class="itemTop"><span>Containers / colors</span><span class="tag">${this.board.containers.length} / ${this.board.colors.length}</span></div>
              <div class="muted">Capacities: ${this.escape(capacities)}. Total blocks: ${this.board.totalBlocks || 0}.</div>
            </div>
            <div class="item">
              <div class="itemTop"><span>Worm pattern</span><span class="tag">${this.board.worms.length}</span></div>
              <div class="muted">Lengths: ${this.escape(wormPattern)}.</div>
            </div>
            <div class="item">
              <div class="itemTop"><span>Field blocks</span><span class="tag">${this.board.fieldBlocks.length}</span></div>
              <div class="muted">Loose blocks currently on the grid.</div>
            </div>
            <div class="item">
              <div class="itemTop"><span>Blocks inside worms</span><span class="tag">${BoardUtils.countCarried(this.board)}</span></div>
              <div class="muted">Capacity equals segment count.</div>
            </div>
          `;
        }
        renderToasts() {
          this.refs.toastStack.innerHTML = this.toasts.map((toast) => `<div class="toast ${toast.tone === "warn" ? "warn" : toast.tone === "success" ? "success" : ""}">${this.escape(toast.text)}</div>`).join("");
        }
        toast(text, tone = "info") {
          this.toasts.unshift({ text, tone, life: CONFIG.ANIM.toast });
          this.toasts = this.toasts.slice(0, 4);
          this.renderToasts();
        }
        escape(value) {
          return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
        }
      }

