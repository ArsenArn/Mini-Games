// Campaign
      const Campaign = {
        settings(level) {
          const l = Helpers.clamp(level, 1, CONFIG.MAX_CAMPAIGN_LEVEL);
          const archetypes = ["BASIC_SORT", "MANY_SMALL_CONTAINERS", "FEW_BIG_CONTAINERS", "MIXED_CONTAINER_SIZE", "LONG_WORM", "MANY_SHORT_WORMS", "COLOR_VARIETY", "DENSE_FIELD", "RELAX_LEVEL"];
          const ftue = ["BASIC_SORT", "BASIC_SORT", "FEW_BIG_CONTAINERS", "MIXED_CONTAINER_SIZE", "RELAX_LEVEL"];
          const archetype = l <= 5 ? ftue[l - 1] : archetypes[(l * 5 + Math.floor(l / 7)) % archetypes.length];
          let tier = l <= 5 ? 0 : l <= 20 ? 1 : l <= 45 ? 2 : l <= 75 ? 3 : 4;
          let settings = {
            width: [9, 10, 11, 12, 13][tier],
            height: [9, 10, 11, 12, 13][tier],
            crossThickness: [3, 3, 3, 4, 4][tier],
            containerCount: [2, 3, 4, 5, 6][tier],
            containerSizeMode: "normal",
            wormCount: [1, 2, 2, 3, 3][tier],
            wormLengthMin: 3,
            wormLengthMax: [3, 4, 5, 5, 6][tier],
            minGroup: 1 + Math.min(2, tier),
            maxGroup: 3 + Math.min(2, tier),
            paletteOffset: (l * 3) % CONFIG.COLOR_ORDER.length,
            seed: 800 + l * 37,
            preset: tier < 2 ? "easy" : tier < 4 ? "normal" : "hard",
            archetype
          };
          if (archetype === "BASIC_SORT") settings = { ...settings, containerCount: tier < 2 ? 2 : 3, containerSizeMode: "normal", wormCount: tier < 2 ? 1 : 2, wormLengthMin: 3, wormLengthMax: 4 };
          if (archetype === "MANY_SMALL_CONTAINERS") settings = { ...settings, containerCount: Math.min(8, 3 + tier), containerSizeMode: "small", wormCount: Math.min(4, 2 + Math.floor(tier / 2)), wormLengthMin: 3, wormLengthMax: 4 };
          if (archetype === "FEW_BIG_CONTAINERS") settings = { ...settings, containerCount: tier < 3 ? 2 : 3, containerSizeMode: "normal", wormCount: tier < 2 ? 1 : 2, wormLengthMin: 4, wormLengthMax: 5 };
          if (archetype === "MIXED_CONTAINER_SIZE") settings = { ...settings, containerCount: Math.min(7, 3 + tier), containerSizeMode: "mixed", wormCount: Math.min(4, 2 + Math.floor(tier / 2)), wormLengthMin: 3, wormLengthMax: 5 };
          if (archetype === "LONG_WORM") settings = { ...settings, containerCount: Math.min(5, 2 + tier), containerSizeMode: tier > 1 ? "mixed" : "normal", wormCount: 1, wormLengthMin: 5, wormLengthMax: 6 };
          if (archetype === "MANY_SHORT_WORMS") settings = { ...settings, containerCount: Math.min(6, 3 + tier), containerSizeMode: tier > 1 ? "mixed" : "small", wormCount: 3, wormLengthMin: 3, wormLengthMax: 3 };
          if (archetype === "COLOR_VARIETY") settings = { ...settings, containerCount: Math.min(8, 4 + tier), containerSizeMode: tier > 1 ? "mixed" : "normal", wormCount: Math.min(4, 2 + Math.floor(tier / 2)), wormLengthMin: 3, wormLengthMax: 5 };
          if (archetype === "DENSE_FIELD") settings = { ...settings, containerCount: Math.min(8, 4 + tier), containerSizeMode: "mixed", wormCount: Math.min(4, 3 + Math.floor(tier / 3)), wormLengthMin: 3, wormLengthMax: 5, crossThickness: Math.min(5, settings.crossThickness + 1) };
          if (archetype === "RELAX_LEVEL") settings = { ...settings, containerCount: tier < 3 ? 2 : 3, containerSizeMode: tier > 2 ? "mixed" : "normal", wormCount: tier < 3 ? 2 : 3, wormLengthMin: 3, wormLengthMax: 4, minGroup: 2, maxGroup: 4 };
          if (l > 20 && (archetype === "DENSE_FIELD" || archetype === "COLOR_VARIETY" || l % 9 === 0)) settings.containerSizeMode = "mixed";
          settings.totalBlocks = 0;
          return settings;
        },
        hint(level) {
          const hints = {
            1: "Tap a container to release one color group. Move the worm onto blocks to pick them up.",
            2: "A worm can carry as many blocks as it has segments.",
            3: "Move any worm segment onto a loading point to drop matching blocks into that container.",
            4: "A container accepts its first color, or any color if it became empty.",
            5: "Goal: gather each color into its own container."
          };
          return hints[level] || "Sort every color into a single container. The field is your only buffer.";
        }
      };

      // LevelGenerator
      const LevelGenerator = {
        containerCapacities(containerCount, mode, seed) {
          if (mode === "small") return Array(containerCount).fill(CONFIG.SMALL_CONTAINER_CAPACITY);
          if (mode === "normal") return Array(containerCount).fill(CONFIG.NORMAL_CONTAINER_CAPACITY);
          if (mode === "large") return Array(containerCount).fill(CONFIG.LARGE_CONTAINER_CAPACITY);
          const rng = new RNG(seed + containerCount * 19);
          return Array.from({ length: containerCount }, (_, index) => {
            if (index === 0) return CONFIG.NORMAL_CONTAINER_CAPACITY;
            if (index === 1) return CONFIG.SMALL_CONTAINER_CAPACITY;
            if (seed > 1500 && index === 2) return CONFIG.LARGE_CONTAINER_CAPACITY;
            const roll = rng.next();
            if (seed > 1500 && roll > 0.74) return CONFIG.LARGE_CONTAINER_CAPACITY;
            return roll > 0.44 ? CONFIG.NORMAL_CONTAINER_CAPACITY : CONFIG.SMALL_CONTAINER_CAPACITY;
          });
        },
        normalize(input, mode) {
          const containerCount = Helpers.clamp(input.containerCount, 2, CONFIG.MAX_CONTAINER_COUNT);
          const sizeMode = input.containerSizeMode || (input.preset === "easy" ? "normal" : "mixed");
          const minGroup = Helpers.clamp(input.minGroup || input.minGroupSize, 1, 8);
          const maxGroup = Helpers.clamp(input.maxGroup || input.maxGroupSize, minGroup, 10);
          const crossThickness = Helpers.clamp(input.crossThickness || Math.ceil(Math.min(input.width || 7, input.height || 7) / 3), 1, 8);
          const capacities = LevelGenerator.containerCapacities(containerCount, sizeMode, Number(input.seed) || 1);
          const totalBlocks = capacities.reduce((sum, value) => sum + value, 0);
          const rulesMode = input.rulesMode || "standard";
          return {
            width: Helpers.clamp(input.width, 5, 18),
            height: Helpers.clamp(input.height, 5, 28),
            crossThickness,
            wormCount: rulesMode === "growing" ? 1 : Helpers.clamp(input.wormCount, 1, 4),
            wormLengthMin: rulesMode === "growing" ? 3 : Helpers.clamp(input.wormLengthMin, 2, 8),
            wormLengthMax: rulesMode === "growing" ? 3 : Helpers.clamp(Math.max(input.wormLengthMax || 3, input.wormLengthMin || 2), 2, 8),
            containerCount,
            colorCount: containerCount,
            containerSizeMode: sizeMode,
            containerCapacities: capacities,
            containerCapacity: Math.max(...capacities),
            rulesMode,
            totalBlocks,
            minGroup,
            maxGroup,
            paletteOffset: Helpers.clamp(input.paletteOffset, 0, CONFIG.COLOR_ORDER.length - 1),
            seed: Number(input.seed) || Math.floor(Date.now() % 1000000),
            preset: input.preset || (mode === "campaign" ? "normal" : "easy"),
            archetype: input.archetype || "SANDBOX"
          };
        },
        build(level, mode, input) {
          const settings = LevelGenerator.normalize(input, mode);
          if (mode === "campaign" && level === 1) return LevelGenerator.firstLevel(settings);
          for (let attempt = 0; attempt < 80; attempt++) {
            const board = LevelGenerator.tryBuild(level, mode, { ...settings, seed: settings.seed + attempt * 97 });
            if (BoardUtils.validate(board, true).ok) return board;
          }
          return LevelGenerator.firstLevel({ ...settings, width: Math.max(5, settings.width), height: Math.max(5, settings.height) });
        },
        firstLevel(settings) {
          const board = {
            version: 1,
            mode: "campaign",
            level: 1,
            width: 9,
            height: 9,
            crossThickness: 3,
            playableCells: BoardUtils.buildPlayableCells(9, 9, 3),
            containerCapacity: 10,
            containerSizeMode: "normal",
            rulesMode: settings.rulesMode || "standard",
            archetype: "BASIC_SORT",
            colors: ["red", "blue"],
            containers: [
              { id: "container_1", zone: "top-left", slotIndex: 0, dock: { x: -1, y: 0 }, capacity: 10, loadCell: { x: 2, y: 2 }, cells: [{ x: 1, y: 2 }, { x: 0, y: 2 }], blocks: ["red", "red", "red", "blue", "blue", "red", "red", "blue", "blue", "blue"] },
              { id: "container_2", zone: "bottom-right", slotIndex: 0, dock: { x: 1, y: 0 }, capacity: 10, loadCell: { x: 6, y: 6 }, cells: [{ x: 7, y: 6 }, { x: 8, y: 6 }], blocks: ["blue", "blue", "blue", "red", "red", "blue", "blue", "red", "red", "red"] }
            ],
            worms: [
              (settings.rulesMode === "growing"
                ? { id: "worm_1", length: 3, baseLength: 3, cells: [{ x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }], carriedBlocks: [null, null, null], segmentKinds: ["native", "native", "native"] }
                : { id: "worm_1", length: 4, cells: [{ x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }], carriedBlocks: [null, null, null, null] })
            ],
            fieldBlocks: [],
            moves: 0,
            totalBlocks: 20,
            won: false
          };
          const blockedCells = board.containers.flatMap((container) => container.cells || []);
          board.playableCells = BoardUtils.buildPlayableCells(board.width, board.height, board.crossThickness, blockedCells);
          return LevelGenerator.prepare(board);
        },
        tryBuild(level, mode, settings) {
          const rng = new RNG(settings.seed + level * 131);
          const colors = LevelGenerator.pickColors(settings, rng);
          const containers = LevelGenerator.makeContainers(settings, colors, rng);
          const blockedCells = containers.flatMap((container) => container.cells || []);
          const playableCells = BoardUtils.buildPlayableCells(settings.width, settings.height, settings.crossThickness, blockedCells);
          const worms = LevelGenerator.makeWorms({ ...settings, playableCells }, containers, rng);
          const board = {
            version: 1,
            mode,
            level,
            width: settings.width,
            height: settings.height,
            crossThickness: settings.crossThickness,
            playableCells,
            containerCapacity: settings.containerCapacity,
            containerSizeMode: settings.containerSizeMode,
            rulesMode: settings.rulesMode,
            archetype: settings.archetype,
            colors,
            containers,
            worms,
            fieldBlocks: [],
            moves: 0,
            totalBlocks: containers.reduce((sum, container) => sum + container.blocks.length, 0),
            won: false
          };
          if (mode === "campaign" && level >= 4) LevelGenerator.scatterStartingBlocks(board, rng, level);
          return LevelGenerator.prepare(board);
        },
        pickColors(settings, rng) {
          const offset = settings.paletteOffset || 0;
          const rotated = CONFIG.COLOR_ORDER.map((_, index) => CONFIG.COLOR_ORDER[(index + offset) % CONFIG.COLOR_ORDER.length]);
          return rng.shuffle(rotated).slice(0, settings.containerCount);
        },
        makeContainers(settings, colors, rng) {
          const capacities = settings.containerCapacities || LevelGenerator.containerCapacities(settings.containerCount, settings.containerSizeMode, settings.seed);
          const slots = LevelGenerator.containerSlots(settings, capacities);
          const buckets = LevelGenerator.distributeBlocks(colors, capacities, settings, rng);
          return slots.map((slot, index) => ({
            id: `container_${index + 1}`,
            zone: slot.zone,
            slotIndex: slot.slotIndex,
            dock: slot.dock,
            capacity: capacities[index],
            loadCell: slot.loadCell,
            cells: slot.cells,
            blocks: buckets[index]
          }));
        },
        containerSlots(settings, capacities) {
          const zones = ["top-left", "top-right", "bottom-left", "bottom-right"];
          const counts = Object.fromEntries(zones.map((zone) => [zone, 0]));
          const occupied = new Set();
          const slots = [];
          for (let i = 0; i < settings.containerCount; i++) {
            const zone = zones[i % zones.length];
            const slotIndex = counts[zone]++;
            const dock = LevelGenerator.dockForZone(zone, slotIndex);
            const slot = LevelGenerator.loadSlotForZone(settings, zone, slotIndex, dock, Math.ceil((capacities[i] || 10) / 5), occupied);
            for (const cell of [slot.loadCell, ...slot.cells]) occupied.add(Helpers.key(cell.x, cell.y));
            slots.push({ zone, slotIndex, dock, loadCell: slot.loadCell, cells: slot.cells });
          }
          return slots;
        },
        loadSlotForZone(settings, zone, slotIndex, dock, lengthCells, occupied) {
          const circle = BoardUtils.buildCircleCells(settings.width, settings.height);
          const anchors = {
            "top-left": { x: 0, y: 0 },
            "top-right": { x: settings.width - 1, y: 0 },
            "bottom-left": { x: 0, y: settings.height - 1 },
            "bottom-right": { x: settings.width - 1, y: settings.height - 1 }
          };
          const anchor = anchors[zone];
          const ranked = circle
            .filter((cell) => LevelGenerator.hasContainerPocket(settings, cell, dock, lengthCells, occupied))
            .sort((a, b) => (Math.abs(a.x - anchor.x) + Math.abs(a.y - anchor.y)) - (Math.abs(b.x - anchor.x) + Math.abs(b.y - anchor.y)));
          const loadCell = ranked[0] || circle[0] || { x: Math.floor(settings.width / 2), y: Math.floor(settings.height / 2) };
          return { loadCell, cells: LevelGenerator.containerCellsFromLoad(loadCell, dock, lengthCells) };
        },
        dockForZone(zone, slotIndex = 0) {
          if (slotIndex % 2 === 1) return { x: 0, y: zone.includes("bottom") ? 1 : -1 };
          return { x: zone.includes("right") ? 1 : -1, y: 0 };
        },
        containerCellsFromLoad(loadCell, dock, lengthCells) {
          return Array.from({ length: lengthCells }, (_, index) => ({
            x: loadCell.x + dock.x * (index + 1),
            y: loadCell.y + dock.y * (index + 1)
          }));
        },
        hasContainerPocket(settings, cell, dock, lengthCells, occupied) {
          const temp = { width: settings.width, height: settings.height };
          const loadKey = Helpers.key(cell.x, cell.y);
          if (occupied.has(loadKey)) return false;
          if (!BoardUtils.isCircleCell(temp, cell.x, cell.y)) return false;
          for (let i = 1; i <= lengthCells; i++) {
            const x = cell.x + dock.x * i;
            const y = cell.y + dock.y * i;
            if (!BoardUtils.isCircleCell(temp, x, y)) return false;
            if (occupied.has(Helpers.key(x, y))) return false;
          }
          return true;
        },
        distributeBlocks(colors, capacities, settings, rng) {
          const remainingColor = Object.fromEntries(colors.map((color, index) => [color, capacities[index]]));
          const buckets = capacities.map(() => []);
          for (let containerIndex = 0; containerIndex < capacities.length; containerIndex++) {
            let remaining = capacities[containerIndex];
            let guard = 0;
            while (remaining > 0 && guard++ < 80) {
              const last = buckets[containerIndex][buckets[containerIndex].length - 1];
              const choices = colors
                .filter((color) => remainingColor[color] > 0 && color !== last)
                .sort((a, b) => remainingColor[b] - remainingColor[a]);
              const fallback = colors.find((color) => remainingColor[color] > 0);
              const color = choices[0] || fallback;
              if (!color) break;
              const maxTake = Math.min(remaining, remainingColor[color], settings.maxGroup);
              const minTake = Math.min(maxTake, Math.max(1, settings.minGroup));
              const take = Math.max(1, rng.int(minTake, maxTake));
              buckets[containerIndex].push(...Array(take).fill(color));
              remainingColor[color] -= take;
              remaining -= take;
            }
          }
          LevelGenerator.fixMixedBuckets(buckets, colors);
          return buckets;
        },
        fixMixedBuckets(buckets, colors) {
          for (let i = 0; i < buckets.length; i++) {
            if (new Set(buckets[i]).size > 1 || buckets[i].length < 2) continue;
            const own = buckets[i][0];
            const donorIndex = buckets.findIndex((bucket, index) => index !== i && bucket.some((color) => color !== own));
            if (donorIndex < 0) continue;
            const donorPos = buckets[donorIndex].findIndex((color) => color !== own);
            const temp = buckets[i][buckets[i].length - 1];
            buckets[i][buckets[i].length - 1] = buckets[donorIndex][donorPos];
            buckets[donorIndex][donorPos] = temp;
          }
        },
        scatterStartingBlocks(board, rng, level) {
          const total = board.totalBlocks || board.containers.reduce((sum, container) => sum + container.blocks.length, 0);
          const progress = Helpers.clamp(level, 1, CONFIG.MAX_CAMPAIGN_LEVEL) / CONFIG.MAX_CAMPAIGN_LEVEL;
          const scatterRatio = 0.2 + progress * 0.4;
          const target = Math.max(1, Math.floor(total * scatterRatio));
          const loadKeys = BoardUtils.loadKeys(board);
          const wormKeys = BoardUtils.wormCellMap(board);
          const used = new Set([...loadKeys, ...wormKeys.keys()]);
          const loadCells = board.containers.map((container) => container.loadCell);
          const center = { x: (board.width - 1) / 2, y: (board.height - 1) / 2 };
          const cells = board.playableCells.slice()
            .sort((a, b) => Helpers.manhattan(a, center) - Helpers.manhattan(b, center))
            .filter((cell) => !used.has(Helpers.key(cell.x, cell.y)) && loadCells.every((loadCell) => Helpers.manhattan(cell, loadCell) > 2));
          let placed = 0;
          const clusterSeeds = rng.shuffle(cells.slice()).slice(0, Math.max(2, Math.ceil(target / 5)));
          const clustered = [];
          for (const seed of clusterSeeds) {
            clustered.push(...cells
              .filter((cell) => Helpers.manhattan(cell, seed) <= 2)
              .sort((a, b) => Helpers.manhattan(a, seed) - Helpers.manhattan(b, seed)));
          }
          const orderedCells = clustered.concat(rng.shuffle(cells));
          while (placed < target && orderedCells.length) {
            const donor = board.containers
              .filter((container) => container.blocks.length > 2)
              .sort((a, b) => b.blocks.length - a.blocks.length)[0];
            if (!donor) break;
            const color = donor.blocks.pop();
            let cell = null;
            while (orderedCells.length && !cell) {
              const candidate = orderedCells.shift();
              const key = Helpers.key(candidate.x, candidate.y);
              if (!used.has(key)) cell = candidate;
            }
            if (!cell) break;
            board.fieldBlocks.push({ x: cell.x, y: cell.y, color, pop: 1 });
            used.add(Helpers.key(cell.x, cell.y));
            placed++;
          }
        },
        partitionTen(groupCount, minGroup, maxGroup, rng) {
          const total = CONFIG.START_BLOCKS_PER_CONTAINER;
          const min = Math.max(1, Math.min(minGroup, total));
          const max = Math.max(min, Math.min(maxGroup, total));
          const safeCount = Helpers.clamp(groupCount, 2, Math.min(5, total));
          for (let attempt = 0; attempt < 160; attempt++) {
            let remaining = total;
            const sizes = [];
            for (let i = 0; i < safeCount; i++) {
              const slotsLeft = safeCount - i - 1;
              const low = Math.max(min, remaining - slotsLeft * max);
              const high = Math.min(max, remaining - slotsLeft * min);
              if (low > high) break;
              const value = i === safeCount - 1 ? remaining : rng.int(low, high);
              sizes.push(value);
              remaining -= value;
            }
            if (sizes.length === safeCount && remaining === 0) return sizes;
          }
          if (safeCount === 2) return [5, 5];
          if (safeCount === 3) return [3, 3, 4];
          if (safeCount === 4) return [2, 3, 2, 3];
          return [2, 2, 2, 2, 2];
        },
        makeWorms(settings, containers, rng) {
          const loadKeys = new Set(containers.map((container) => Helpers.key(container.loadCell.x, container.loadCell.y)));
          const occupied = new Set(loadKeys);
          const worms = [];
          for (let i = 0; i < settings.wormCount; i++) {
            const length = rng.int(settings.wormLengthMin, settings.wormLengthMax);
            let placed = LevelGenerator.growWormPath(settings, occupied, length, rng);
            if (!placed) placed = LevelGenerator.scanWormPath(settings, occupied, length, rng);
            if (!placed) placed = [(settings.playableCells || BoardUtils.buildPlayableCells(settings.width, settings.height, settings.crossThickness)).find((cell) => !occupied.has(Helpers.key(cell.x, cell.y))) || { x: Math.floor(settings.width / 2), y: Math.floor(settings.height / 2) }];
            placed.forEach((cell) => occupied.add(Helpers.key(cell.x, cell.y)));
            worms.push({ id: `worm_${i + 1}`, length, baseLength: settings.rulesMode === "growing" ? 3 : length, cells: placed, carriedBlocks: Array(length).fill(null), segmentKinds: Array(length).fill("native") });
          }
          return worms;
        },
        growWormPath(settings, occupied, length, rng) {
          const temp = { width: settings.width, height: settings.height, crossThickness: settings.crossThickness };
          const playable = settings.playableCells || BoardUtils.buildPlayableCells(settings.width, settings.height, settings.crossThickness);
          const playableSet = new Set(playable.map((cell) => Helpers.key(cell.x, cell.y)));
          for (let attempt = 0; attempt < 240; attempt++) {
            const start = rng.pick(playable);
            if (occupied.has(Helpers.key(start.x, start.y))) continue;
            const path = [start];
            const local = new Set([Helpers.key(start.x, start.y)]);
            while (path.length < length) {
              const current = path[path.length - 1];
              const dirs = rng.shuffle(Object.values(DIRS));
              const next = dirs.map((delta) => ({ x: current.x + delta.x, y: current.y + delta.y }))
                .find((cell) => playableSet.has(Helpers.key(cell.x, cell.y)) && !occupied.has(Helpers.key(cell.x, cell.y)) && !local.has(Helpers.key(cell.x, cell.y)));
              if (!next) break;
              path.push(next);
              local.add(Helpers.key(next.x, next.y));
            }
            if (path.length === length) return path;
          }
          return null;
        },
        scanWormPath(settings, occupied, length, rng) {
          const temp = { width: settings.width, height: settings.height, crossThickness: settings.crossThickness };
          const starts = rng.shuffle(settings.playableCells || BoardUtils.buildPlayableCells(settings.width, settings.height, settings.crossThickness));
          const playableSet = new Set(starts.map((cell) => Helpers.key(cell.x, cell.y)));
          const search = (path, local) => {
            if (path.length === length) return path;
            const current = path[path.length - 1];
            for (const delta of rng.shuffle(Object.values(DIRS))) {
              const next = { x: current.x + delta.x, y: current.y + delta.y };
              const key = Helpers.key(next.x, next.y);
              if (!playableSet.has(key) || occupied.has(key) || local.has(key)) continue;
              const result = search(path.concat([next]), new Set([...local, key]));
              if (result) return result;
            }
            return null;
          };
          for (const start of starts) {
            const key = Helpers.key(start.x, start.y);
            if (occupied.has(key)) continue;
            const result = search([start], new Set([key]));
            if (result) return result;
          }
          return null;
        },
        prepare(board) {
          board.rulesMode = board.rulesMode || "standard";
          board.crossThickness = board.crossThickness || Math.ceil(Math.min(board.width, board.height) / 3);
          board.playableCells = Array.isArray(board.playableCells) ? board.playableCells : BoardUtils.buildPlayableCells(board.width, board.height, board.crossThickness);
          delete board._playableSet;
          for (const worm of board.worms) {
            worm.length = worm.cells.length;
            worm.carriedBlocks = (worm.carriedBlocks || []).slice(0, worm.length);
            while (worm.carriedBlocks.length < worm.length) worm.carriedBlocks.push(null);
            worm.baseLength = worm.baseLength || (board.rulesMode === "growing" ? 3 : worm.length);
            worm.segmentKinds = (worm.segmentKinds || Array(worm.length).fill("native")).slice(0, worm.length);
            while (worm.segmentKinds.length < worm.length) worm.segmentKinds.push(worm.segmentKinds.length < worm.baseLength ? "native" : "temp");
            worm.flash = 0;
            worm.moveT = 1;
          }
            for (const container of board.containers) {
              container.capacity = container.capacity || board.containerCapacity || CONFIG.NORMAL_CONTAINER_CAPACITY;
              container.zone = container.zone || container.side || "top-left";
            container.flash = 0;
            container.pulse = 0;
          }
          board.pops = board.pops || [];
          board.colors = board.colors.slice(0, board.containers.length);
          board.totalBlocks = board.totalBlocks || BoardUtils.totalInContainers(board) + board.fieldBlocks.length + BoardUtils.countCarried(board);
          return board;
        }
      };

