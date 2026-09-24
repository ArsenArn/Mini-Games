(() => {
  "use strict";

  const CONFIG = {
    GAME_TITLE: "Wormhold Maze Merge",
    VERSION: "0.3.0",
    SAVE_KEY: "wormhold_maze_merge_save_v1",
    SCREENS: {
      BOOT: "boot",
      MENU: "menu",
      LEVELS: "levels",
      GAMEPLAY: "gameplay",
      PAUSE: "pause",
      RESULT: "result"
    },
    PHASES: {
      BUILD: "build",
      BATTLE: "battle"
    },
    MODES: {
      campaign: { id: "campaign", label: "Campaign", implemented: true },
      endless: { id: "endless", label: "Endless", implemented: false },
      sandbox: { id: "sandbox", label: "Sandbox", implemented: false },
      challenge: { id: "challenge", label: "Challenge", implemented: false }
    },
    CAMPAIGN_LEVELS: [
      { id: 1, name: "Level 1", waves: 3, layout: { width: 10, height: 10, obstacleBudget: 6 }, enemyPressure: 0.92 },
      { id: 2, name: "Level 2", waves: 4, layout: { width: 10, height: 11, obstacleBudget: 8 }, enemyPressure: 0.97 },
      { id: 3, name: "Level 3", waves: 5, layout: { width: 11, height: 11, obstacleBudget: 9 }, enemyPressure: 1.01 },
      { id: 4, name: "Level 4", waves: 6, layout: { width: 11, height: 12, obstacleBudget: 11 }, enemyPressure: 1.06 },
      { id: 5, name: "Level 5", waves: 7, layout: { width: 12, height: 12, obstacleBudget: 13 }, enemyPressure: 1.11 },
      { id: 6, name: "Level 6", waves: 8, layout: { width: 13, height: 12, obstacleBudget: 15 }, enemyPressure: 1.16 }
    ],
    THEME: {
      backgroundTop: "#eef6ff",
      backgroundBottom: "#fff2d6",
      boardTop: "#fbfcf5",
      boardBottom: "#f2f9ff",
      gridLine: "rgba(22,49,79,.08)",
      spawnFill: "rgba(109,64,80,.16)",
      spawnStroke: "rgba(109,64,80,.48)",
      coreFill: "#f4c765",
      coreGlow: "rgba(244,199,101,.38)",
      obstacleFill: "#8f9fb0",
      obstacleStroke: "#516375",
      invalidFill: "rgba(235,110,110,.18)",
      invalidStroke: "rgba(235,110,110,.84)",
      pathColors: ["#6aa7ff", "#f0a95c", "#7ed4a6", "#d18cff", "#ff8f8f"],
      bonusTypes: {
        range: { icon: "🎯", color: "#6aa7ff", glow: "rgba(106,167,255,.34)" },
        damage: { icon: "💥", color: "#ff9d57", glow: "rgba(255,157,87,.34)" },
        attackSpeed: { icon: "⚡", color: "#ffd34d", glow: "rgba(255,211,77,.34)" }
      }
    },
    DEFAULT_DESIGNER: {
      totalFieldWidth: 12,
      totalFieldHeight: 11,
      initialPoolSize: 3,
      refreshCostStart: 4,
      refreshCostCurve: [4, 5, 6, 8, 10, 12, 15, 18, 22, 26, 30],
      initialWormCount: 3,
      startingCrystals: 11,
      allowedWormTypes: ["wall", "archer", "fire", "ice", "spike", "electric"],
      allowedWormSizes: [2, 3],
      mergeRules: "sameTypeSameSize",
      bonusTileStartCount: 3,
      bonusTileGrowthPerWave: 1,
      allowedBonusTypes: ["range", "damage", "attackSpeed"],
      bonusValues: {
        range: 0.12,
        damage: 0.15,
        attackSpeed: 0.12
      },
      towerDamageMultiplier: 1,
      towerRangeMultiplier: 1,
      towerAttackSpeedMultiplier: 1,
      enemyHpMultiplier: 1,
      enemySpeedMultiplier: 1,
      enemySpawnRateMultiplier: 1,
      waveDurationStart: 16,
      waveDurationPerWave: 4,
      waveDurationCap: 40,
      battleSpeed: 1,
      wormMoveMode: "slither",
      seed: "wormhold",
      baseCoreHp: 20,
      maxActiveEnemies: 100,
      obstacleBudgetBonus: 0,
      showPathDebug: false,
      showPathNodes: false
    },
    BALANCE: {
      dragSnap: 18,
      mergePulseTime: 0.44,
      wormBreathSpeed: 2.1,
      pointerBias: 0.02,
      slitherStepCooldown: 0.055,
      maxParticles: 320,
      maxEffects: 80,
      projectileHitRadius: 0.18,
      sizeDamageStep: 0.38,
      sizeRangeStep: 0.06,
      sizeAttackSpeedStep: 0.08,
      sizeHpStep: 0.32,
      holdDelayMs: 260,
      holdMoveTolerance: 7,
      invalidFlashTime: 0.56,
      invalidShakeTime: 0.38,
      rewardPadding: 3,
      chainFalloff: 0.82,
      defaultChainJumpRange: 2.35,
      defaultSlowFactor: 0.5,
      defaultSlowDuration: 2.8
    },
    WORM_TYPES: {
      wall: {
        id: "wall",
        label: "Wall Worm",
        short: "WALL",
        icon: "🧱",
        color: "#a2b4c5",
        soft: "#ebf1f7",
        dark: "#516375",
        role: "wall",
        towerNodeMode: "none",
        baseHp: 300,
        powerWeight: 0.84
      },
      archer: {
        id: "archer",
        label: "Archer Worm",
        short: "ARCH",
        icon: "🏹",
        color: "#6aa7ff",
        soft: "#dceaff",
        dark: "#244f98",
        role: "tower",
        towerNodeMode: "head",
        attackStyle: "projectile",
        baseHp: 116,
        damage: 14,
        attackCooldown: 0.95,
        range: 4.2,
        projectileSpeed: 10.8,
        powerWeight: 1.02
      },
      fire: {
        id: "fire",
        label: "Fire Mage Worm",
        short: "FIRE",
        icon: "🔥",
        color: "#ff8f66",
        soft: "#ffe4d6",
        dark: "#984826",
        role: "tower",
        towerNodeMode: "center",
        attackStyle: "projectile",
        baseHp: 100,
        damage: 18,
        attackCooldown: 1.45,
        range: 3.95,
        projectileSpeed: 8.8,
        splashRadius: 1.25,
        powerWeight: 1.08
      },
      ice: {
        id: "ice",
        label: "Ice Mage Worm",
        short: "ICE",
        icon: "❄️",
        color: "#8fd9ff",
        soft: "#e1f6ff",
        dark: "#2d6a91",
        role: "tower",
        towerNodeMode: "center",
        attackStyle: "projectile",
        baseHp: 102,
        damage: 9,
        attackCooldown: 1.22,
        range: 3.65,
        projectileSpeed: 8.6,
        splashRadius: 0.82,
        slowFactor: 0.5,
        slowDuration: 2.8,
        powerWeight: 0.96
      },
      spike: {
        id: "spike",
        label: "Spike Worm",
        short: "SPIKE",
        icon: "🪡",
        color: "#f0c15c",
        soft: "#fff0bf",
        dark: "#92712a",
        role: "tower",
        towerNodeMode: "head",
        attackStyle: "instant",
        baseHp: 92,
        damage: 5,
        attackCooldown: 0.28,
        range: 5.35,
        powerWeight: 0.98
      },
      electric: {
        id: "electric",
        label: "Electric Worm",
        short: "ARC",
        icon: "⚡",
        color: "#c190ff",
        soft: "#f0e2ff",
        dark: "#6943a9",
        role: "tower",
        towerNodeMode: "center",
        attackStyle: "chain",
        baseHp: 108,
        damage: 12,
        attackCooldown: 1.08,
        range: 4.2,
        chainJumps: 3,
        chainRadius: 2.4,
        powerWeight: 1.06
      }
    },
    ENEMY_TYPES: {
      runner: {
        id: "runner",
        label: "Runner",
        icon: "🐇",
        color: "#ffb36b",
        hp: 18,
        speed: 2.25,
        radius: 0.26,
        reward: 1,
        coreDamage: 1
      },
      basic: {
        id: "basic",
        label: "Basic",
        icon: "🐜",
        color: "#d17c8d",
        hp: 34,
        speed: 1.7,
        radius: 0.31,
        reward: 1,
        coreDamage: 1
      },
      tank: {
        id: "tank",
        label: "Tank",
        icon: "🐢",
        color: "#7f4a5b",
        hp: 92,
        speed: 1.04,
        radius: 0.42,
        reward: 3,
        coreDamage: 2
      },
      swarm: {
        id: "swarm",
        label: "Swarm",
        icon: "🪰",
        color: "#f5c94d",
        hp: 8,
        speed: 1.92,
        radius: 0.22,
        reward: 1,
        coreDamage: 1
      }
    }
  };

  const TWO_PI = Math.PI * 2;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    const safeW = Math.max(0, w);
    const safeH = Math.max(0, h);
    const radius = Math.max(0, Math.min(r, safeW * 0.5, safeH * 0.5));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + safeW, y, x + safeW, y + safeH, radius);
    ctx.arcTo(x + safeW, y + safeH, x, y + safeH, radius);
    ctx.arcTo(x, y + safeH, x, y, radius);
    ctx.arcTo(x, y, x + safeW, y, radius);
    ctx.closePath();
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function parseNumberList(text) {
    return String(text || "")
      .split(",")
      .map((entry) => Number(entry.trim()))
      .filter((entry) => Number.isFinite(entry));
  }

  function parseStringList(text) {
    return String(text || "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  function formatWave(level, wave, total) {
    return `L${level} W${wave}/${total}`;
  }

  function formatShortNumber(value) {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return String(Math.round(value));
  }

  function pickWeighted(rng, items, getWeight) {
    let total = 0;
    for (const item of items) total += getWeight(item);
    let roll = rng.range(0, Math.max(total, 0.0001));
    for (const item of items) {
      roll -= getWeight(item);
      if (roll <= 0) return item;
    }
    return items[items.length - 1];
  }

  function cellKey(x, y) {
    return `${x},${y}`;
  }

  function parseCellKey(key) {
    const [x, y] = String(key).split(",").map(Number);
    return { x, y };
  }

  function manhattan(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  function distanceSq(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy;
  }

  function average(list) {
    if (!list.length) return 0;
    return list.reduce((sum, value) => sum + value, 0) / list.length;
  }

  function isOrthAdjacent(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
  }

  function countPathTurns(path) {
    if (!path || path.length < 3) return 0;
    let turns = 0;
    for (let i = 2; i < path.length; i++) {
      const a = path[i - 2];
      const b = path[i - 1];
      const c = path[i];
      const dx1 = b.x - a.x;
      const dy1 = b.y - a.y;
      const dx2 = c.x - b.x;
      const dy2 = c.y - b.y;
      if (dx1 !== dx2 || dy1 !== dy2) turns += 1;
    }
    return turns;
  }

  class RNG {
    constructor(seed) {
      this.state = RNG.hash(seed);
    }

    static hash(seed) {
      const text = String(seed ?? "seed");
      let h = 2166136261 >>> 0;
      for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0 || 0x9e3779b9;
    }

    next() {
      let x = this.state >>> 0;
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      this.state = x >>> 0;
      return (this.state >>> 0) / 4294967296;
    }

    range(min, max) {
      return min + (max - min) * this.next();
    }

    int(min, max) {
      return Math.floor(this.range(min, max + 1));
    }

    chance(probability) {
      return this.next() < probability;
    }

    pick(list) {
      return list[this.int(0, list.length - 1)];
    }

    shuffle(list) {
      for (let i = list.length - 1; i > 0; i--) {
        const j = this.int(0, i);
        [list[i], list[j]] = [list[j], list[i]];
      }
      return list;
    }
  }

  class SaveManager {
    constructor(key) {
      this.key = key;
      this.data = this.load();
    }

    load() {
      try {
        const parsed = JSON.parse(localStorage.getItem(this.key));
        if (parsed && typeof parsed === "object") {
          return {
            highestUnlocked: Math.max(1, parsed.highestUnlocked || 1),
            soundOn: parsed.soundOn !== false,
            lastLevel: Math.max(1, parsed.lastLevel || 1),
            designer: parsed.designer || null
          };
        }
      } catch (error) {}
      return {
        highestUnlocked: 1,
        soundOn: true,
        lastLevel: 1,
        designer: null
      };
    }

    write() {
      localStorage.setItem(this.key, JSON.stringify(this.data));
    }

    setHighestUnlocked(level) {
      if (window.GameEntry?.current?.isDeveloper()) return;
      this.data.highestUnlocked = Math.max(this.data.highestUnlocked, level);
      this.write();
    }

    setSoundOn(value) {
      this.data.soundOn = !!value;
      this.write();
    }

    setLastLevel(level) {
      if (window.GameEntry?.current?.isDeveloper()) return;
      this.data.lastLevel = Math.max(1, level);
      this.write();
    }

    setDesigner(data) {
      if (window.GameEntry?.current && !window.GameEntry.current.isDeveloper()) return;
      this.data.designer = deepClone(data);
      this.write();
    }

    setBattleSpeed(speed) {
      this.data.designer = deepClone(this.data.designer || CONFIG.DEFAULT_DESIGNER);
      this.data.designer.battleSpeed = speed;
      this.write();
    }
  }

  class AudioManager {
    constructor(enabled) {
      this.enabled = enabled;
      this.ctx = null;
    }

    setEnabled(value) {
      this.enabled = !!value;
    }

    unlock() {
      if (!this.enabled || this.ctx) return;
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        this.ctx = null;
      }
    }

    beep(frequency, duration, type = "sine", gain = 0.025) {
      if (!this.enabled) return;
      this.unlock();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);
      amp.gain.setValueAtTime(gain, now);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(amp);
      amp.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    }

    ui() {
      this.beep(620, 0.06, "triangle", 0.02);
    }

    merge() {
      this.beep(540, 0.12, "triangle", 0.03);
      this.beep(760, 0.16, "sine", 0.018);
    }

    hit() {
      this.beep(180, 0.05, "square", 0.015);
    }

    spawn() {
      this.beep(420, 0.06, "sine", 0.015);
    }

    zap() {
      this.beep(880, 0.04, "sawtooth", 0.014);
      this.beep(640, 0.06, "triangle", 0.012);
    }

    win() {
      this.beep(640, 0.18, "triangle", 0.03);
      this.beep(860, 0.22, "triangle", 0.026);
    }

    lose() {
      this.beep(230, 0.2, "sawtooth", 0.02);
    }
  }

  class Renderer {
    constructor(game) {
      this.game = game;
      this.canvas = game.canvas;
      this.ctx = game.canvas.getContext("2d");
      this.metrics = {
        width: 1,
        height: 1,
        boardX: 0,
        boardY: 0,
        boardW: 1,
        boardH: 1,
        cell: 10
      };
      if ("ResizeObserver" in window) {
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.canvas);
      }
      window.addEventListener("resize", () => this.resize());
      window.addEventListener("orientationchange", () => this.resize());
      this.resize();
      setTimeout(() => this.resize(), 0);
    }

    resize() {
      const ratio = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width || this.canvas.parentElement.clientWidth || 320);
      const height = Math.max(1, rect.height || this.canvas.parentElement.clientHeight || 520);
      this.canvas.width = Math.floor(width * ratio);
      this.canvas.height = Math.floor(height * ratio);
      this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const board = this.game.getBoardConfig();
      const paddingX = clamp(width * 0.025, 12, 22);
      const paddingY = clamp(height * 0.035, 14, 24);
      const cell = Math.min((width - paddingX * 2) / board.totalFieldWidth, (height - paddingY * 2) / board.totalFieldHeight, 64);
      const boardW = cell * board.totalFieldWidth;
      const boardH = cell * board.totalFieldHeight;
      this.metrics = {
        width,
        height,
        boardX: (width - boardW) * 0.5,
        boardY: (height - boardH) * 0.5,
        boardW,
        boardH,
        cell
      };
    }

    screenToWorld(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    screenToBoardPosition(clientX, clientY, clampToBoard = false) {
      const point = this.screenToWorld(clientX, clientY);
      const m = this.metrics;
      const board = this.game.getBoardConfig();
      const rawX = (point.x - m.boardX) / m.cell;
      const rawY = (point.y - m.boardY) / m.cell;
      if (!clampToBoard) {
        if (rawX < 0 || rawY < 0 || rawX >= board.totalFieldWidth || rawY >= board.totalFieldHeight) return null;
        return { x: rawX, y: rawY };
      }
      return {
        x: clamp(rawX, 0, Math.max(0.001, board.totalFieldWidth - 0.001)),
        y: clamp(rawY, 0, Math.max(0.001, board.totalFieldHeight - 0.001))
      };
    }

    screenToGridCell(clientX, clientY) {
      const point = this.screenToBoardPosition(clientX, clientY, false);
      if (!point) return null;
      const col = Math.floor(point.x);
      const row = Math.floor(point.y);
      const board = this.game.getBoardConfig();
      if (col < 0 || row < 0 || col >= board.totalFieldWidth || row >= board.totalFieldHeight) return null;
      return { x: col, y: row };
    }

    cellRect(col, row) {
      const m = this.metrics;
      return {
        x: m.boardX + col * m.cell,
        y: m.boardY + row * m.cell,
        size: m.cell
      };
    }

    cellCenter(col, row) {
      const m = this.metrics;
      return {
        x: m.boardX + (col + 0.5) * m.cell,
        y: m.boardY + (row + 0.5) * m.cell
      };
    }

    worldToScreen(worldX, worldY) {
      const m = this.metrics;
      return {
        x: m.boardX + worldX * m.cell,
        y: m.boardY + worldY * m.cell
      };
    }

    render(ts) {
      const ctx = this.ctx;
      const m = this.metrics;
      const board = this.game.getBoardConfig();
      ctx.clearRect(0, 0, m.width, m.height);

      const bg = ctx.createLinearGradient(0, 0, 0, m.height);
      bg.addColorStop(0, CONFIG.THEME.backgroundTop);
      bg.addColorStop(1, CONFIG.THEME.backgroundBottom);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, m.width, m.height);

      const shake = this.game.getBoardShakeOffset(ts);
      ctx.save();
      ctx.translate(shake.x, shake.y);
      roundRectPath(ctx, m.boardX - 8, m.boardY - 8, m.boardW + 16, m.boardH + 16, Math.min(32, m.cell * 0.7));
      ctx.fillStyle = "rgba(255,255,255,.82)";
      ctx.shadowColor = "rgba(22,49,79,.14)";
      ctx.shadowBlur = 26;
      ctx.fill();
      ctx.shadowBlur = 0;

      const boardGrad = ctx.createLinearGradient(0, m.boardY, 0, m.boardY + m.boardH);
      boardGrad.addColorStop(0, CONFIG.THEME.boardTop);
      boardGrad.addColorStop(1, CONFIG.THEME.boardBottom);
      ctx.fillStyle = boardGrad;
      roundRectPath(ctx, m.boardX, m.boardY, m.boardW, m.boardH, Math.min(28, m.cell * 0.62));
      ctx.fill();

      this.renderGrid(ctx, board);
      this.renderStaticObstacles(ctx);
      this.renderSpawnPoints(ctx);
      this.renderCore(ctx, ts);
      this.renderBonusTiles(ctx, ts);
      this.renderPathDebug(ctx);
      this.renderInvalidFeedback(ctx, ts);
      this.renderWorms(ctx, ts);
      this.renderRangePreview(ctx, ts);
      this.renderEnemies(ctx, ts);
      this.renderProjectiles(ctx);
      this.renderEffects(ctx);
      this.renderParticles(ctx);
      this.renderDragGhost(ctx, ts);
      ctx.restore();
    }

    renderGrid(ctx, board) {
      const m = this.metrics;
      ctx.lineWidth = 1;
      ctx.strokeStyle = CONFIG.THEME.gridLine;
      for (let x = 0; x <= board.totalFieldWidth; x++) {
        const px = m.boardX + x * m.cell;
        ctx.beginPath();
        ctx.moveTo(px, m.boardY);
        ctx.lineTo(px, m.boardY + m.boardH);
        ctx.stroke();
      }
      for (let y = 0; y <= board.totalFieldHeight; y++) {
        const py = m.boardY + y * m.cell;
        ctx.beginPath();
        ctx.moveTo(m.boardX, py);
        ctx.lineTo(m.boardX + m.boardW, py);
        ctx.stroke();
      }
    }

    renderStaticObstacles(ctx) {
      for (const cell of this.game.state.staticObstacles) {
        const rect = this.cellRect(cell.x, cell.y);
        roundRectPath(ctx, rect.x + 3, rect.y + 3, rect.size - 6, rect.size - 6, rect.size * 0.18);
        ctx.fillStyle = CONFIG.THEME.obstacleFill;
        ctx.fill();
        ctx.strokeStyle = CONFIG.THEME.obstacleStroke;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.18)";
        roundRectPath(ctx, rect.x + 7, rect.y + 7, rect.size - 14, rect.size * 0.18, rect.size * 0.08);
        ctx.fill();
      }
    }

    renderSpawnPoints(ctx) {
      const m = this.metrics;
      ctx.font = `700 ${Math.max(10, m.cell * 0.2)}px Trebuchet MS`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const spawn of this.game.state.spawnPoints) {
        const rect = this.cellRect(spawn.x, spawn.y);
        roundRectPath(ctx, rect.x + 2, rect.y + 2, rect.size - 4, rect.size - 4, rect.size * 0.22);
        ctx.fillStyle = CONFIG.THEME.spawnFill;
        ctx.fill();
        ctx.strokeStyle = CONFIG.THEME.spawnStroke;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "rgba(22,49,79,.86)";
        ctx.fillText(spawn.marker, rect.x + rect.size * 0.5, rect.y + rect.size * 0.56);
      }
    }

    renderCore(ctx, ts) {
      const core = this.game.state.core;
      if (!core) return;
      const rect = this.cellRect(core.x, core.y);
      const center = this.cellCenter(core.x, core.y);
      ctx.save();
      ctx.shadowColor = CONFIG.THEME.coreGlow;
      ctx.shadowBlur = rect.size * 0.4;
      const pulse = 1 + Math.sin(ts * 0.004) * 0.035;
      ctx.translate(center.x, center.y);
      ctx.scale(pulse, pulse);
      ctx.translate(-center.x, -center.y);
      const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.size);
      grad.addColorStop(0, "#fff7d6");
      grad.addColorStop(1, CONFIG.THEME.coreFill);
      roundRectPath(ctx, rect.x + 2, rect.y + 2, rect.size - 4, rect.size - 4, rect.size * 0.22);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(22,49,79,.24)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = "rgba(22,49,79,.9)";
      ctx.font = `700 ${Math.max(12, rect.size * 0.28)}px Trebuchet MS`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("CORE", center.x, center.y + 1);
      ctx.restore();
    }

    renderBonusTiles(ctx, ts) {
      const m = this.metrics;
      for (const tile of this.game.state.bonusTiles) {
        const rect = this.cellRect(tile.x, tile.y);
        const meta = CONFIG.THEME.bonusTypes[tile.type];
        const pulse = 0.76 + Math.sin(ts * 0.004 + tile.x * 1.2 + tile.y) * 0.18;
        ctx.save();
        ctx.shadowColor = meta.glow;
        ctx.shadowBlur = rect.size * 0.2;
        roundRectPath(ctx, rect.x + 3, rect.y + 3, rect.size - 6, rect.size - 6, rect.size * 0.2);
        ctx.fillStyle = `${meta.color}66`;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = meta.color;
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.globalAlpha = pulse;
        roundRectPath(ctx, rect.x + 7, rect.y + 7, rect.size - 14, rect.size - 14, rect.size * 0.16);
        ctx.fillStyle = "#ffffff55";
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(22,49,79,.96)";
        ctx.font = `700 ${Math.max(8, m.cell * 0.18)}px Trebuchet MS`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(meta.icon, rect.x + rect.size * 0.5, rect.y + rect.size * 0.56);
        ctx.restore();
      }
    }

    renderPathDebug(ctx) {
      if (!this.game.designer.showPathDebug) return;
      const nav = this.game.state.navigation;
      if (!nav || !nav.pathsBySpawn) return;
      const showNodes = this.game.designer.showPathNodes;
      let colorIndex = 0;
      for (const spawn of this.game.state.spawnPoints) {
        const path = nav.pathsBySpawn[spawn.id];
        if (!path || !path.length) continue;
        const color = CONFIG.THEME.pathColors[colorIndex % CONFIG.THEME.pathColors.length];
        colorIndex += 1;
        ctx.save();
        ctx.strokeStyle = `${color}bb`;
        ctx.lineWidth = Math.max(2, this.metrics.cell * 0.08);
        ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
          const center = this.cellCenter(path[i].x, path[i].y);
          if (i === 0) ctx.moveTo(center.x, center.y);
          else ctx.lineTo(center.x, center.y);
        }
        ctx.stroke();
        if (showNodes) {
          for (const node of path) {
            const center = this.cellCenter(node.x, node.y);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(center.x, center.y, Math.max(2, this.metrics.cell * 0.08), 0, TWO_PI);
            ctx.fill();
          }
        }
        ctx.restore();
      }
    }

    renderInvalidFeedback(ctx, ts) {
      const feedback = this.game.state.feedback;
      if (!feedback || !feedback.invalidCells.length || feedback.invalidUntil <= ts) return;
      const pulse = 0.6 + Math.sin(ts * 0.02) * 0.18;
      ctx.save();
      ctx.strokeStyle = CONFIG.THEME.invalidStroke;
      ctx.fillStyle = CONFIG.THEME.invalidFill;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 5]);
      for (const cell of feedback.invalidCells) {
        const rect = this.cellRect(cell.x, cell.y);
        ctx.globalAlpha = pulse;
        roundRectPath(ctx, rect.x + 2, rect.y + 2, rect.size - 4, rect.size - 4, rect.size * 0.18);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    renderWorms(ctx, ts) {
      const state = this.game.state;
      const drag = this.game.input.drag;
      const mergeReady = this.game.getMergeReadyMap();
      const worms = state.worms.slice().sort((a, b) => {
        const aDrag = drag && drag.kind === "board" && drag.sourceId === a.id ? 1 : 0;
        const bDrag = drag && drag.kind === "board" && drag.sourceId === b.id ? 1 : 0;
        return aDrag - bDrag;
      });
      for (const worm of worms) {
        const type = CONFIG.WORM_TYPES[worm.type];
        if (!type || !worm.cells || !worm.cells.length) continue;
        const cells = worm.renderCells || worm.cells;
        const activeEnd = this.game.input.getActiveEndForWorm(worm.id);
        const segment = this.metrics.cell * 0.82;
        const half = segment * 0.5;
        const breath = 1 + Math.sin(ts * 0.001 * CONFIG.BALANCE.wormBreathSpeed + worm.seed) * 0.03;
        const mergePulse = worm.mergePulse > 0 ? 1 + easeOutCubic(1 - worm.mergePulse / CONFIG.BALANCE.mergePulseTime) * 0.12 : 1;
        const scale = breath * mergePulse;
        const haloAlpha = mergeReady.has(worm.id) ? 0.58 : worm.flash > 0 ? 0.4 : 0.16;
        const haloColor = mergeReady.has(worm.id) ? "rgba(244,178,79,.8)" : worm.flash > 0 ? "rgba(255,120,120,.8)" : "rgba(255,255,255,.6)";
        const center = this.cellCenter(worm.centerX - 0.5, worm.centerY - 0.5);
        const iconIndex = type.role === "tower" && worm.towerCell
          ? worm.cells.findIndex((cell) => cell.x === worm.towerCell.x && cell.y === worm.towerCell.y)
          : Math.floor((cells.length - 1) * 0.5);
        ctx.save();
        ctx.translate(center.x, center.y);
        ctx.scale(scale, scale);
        ctx.translate(-center.x, -center.y);
        for (let i = 1; i < cells.length; i++) {
          const from = this.cellCenter(cells[i - 1].x, cells[i - 1].y);
          const to = this.cellCenter(cells[i].x, cells[i].y);
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const length = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          const connectorWidth = Math.max(0, length - this.metrics.cell * 0.18);
          if (connectorWidth <= 0) continue;
          ctx.save();
          ctx.translate(from.x, from.y);
          ctx.rotate(angle);
          roundRectPath(ctx, this.metrics.cell * 0.09, -segment * 0.3, connectorWidth, segment * 0.6, segment * 0.3);
          ctx.fillStyle = type.color;
          ctx.fill();
          ctx.restore();
        }
        for (let i = 0; i < cells.length; i++) {
          const cell = cells[i];
          const cellCenter = this.cellCenter(cell.x, cell.y);
          const rectX = cellCenter.x - half;
          const rectY = cellCenter.y - half;
          const isTail = i === 0;
          const isHead = i === cells.length - 1;
          const isActiveHandle = (activeEnd === "tail" && isTail) || (activeEnd === "head" && isHead);
          ctx.globalAlpha = haloAlpha;
          ctx.strokeStyle = haloColor;
          ctx.lineWidth = 2.5;
          roundRectPath(ctx, rectX - 2, rectY - 2, segment + 4, segment + 4, segment * 0.24);
          ctx.stroke();
          ctx.globalAlpha = 1;
          const fill = ctx.createLinearGradient(rectX, rectY, rectX, rectY + segment);
          fill.addColorStop(0, type.soft);
          fill.addColorStop(1, type.color);
          ctx.fillStyle = fill;
          roundRectPath(ctx, rectX, rectY, segment, segment, segment * 0.22);
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,.24)";
          roundRectPath(ctx, rectX + segment * 0.16, rectY + segment * 0.1, segment * 0.68, segment * 0.16, segment * 0.08);
          ctx.fill();
          if (isActiveHandle) {
            ctx.strokeStyle = `${type.dark}ee`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cellCenter.x, cellCenter.y, segment * 0.44, 0, TWO_PI);
            ctx.stroke();
          }
          if (i === iconIndex) {
            ctx.fillStyle = "rgba(18,34,56,.92)";
            ctx.font = `${Math.max(13, this.metrics.cell * 0.34)}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",Trebuchet MS`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(type.icon, cellCenter.x, cellCenter.y + 1);
          }
        }
        if (type.role === "tower" && worm.towerCell) {
          const towerCenter = this.cellCenter(worm.towerCell.x, worm.towerCell.y);
          ctx.fillStyle = "rgba(18,34,56,.9)";
          ctx.beginPath();
          ctx.arc(towerCenter.x, towerCenter.y, Math.max(3, this.metrics.cell * 0.08), 0, TWO_PI);
          ctx.fill();
          ctx.strokeStyle = `${type.dark}cc`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(towerCenter.x, towerCenter.y, Math.max(5, this.metrics.cell * 0.13), 0, TWO_PI);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    renderRangePreview(ctx) {
      const preview = this.game.state.rangePreview;
      if (!preview) return;
      const worm = this.game.getWormById(preview.wormId);
      if (!worm) return;
      const type = CONFIG.WORM_TYPES[worm.type];
      if (!type || type.role !== "tower" || !worm.towerCell) return;
      const stats = worm.combatStats || this.game.computeWormCombatStats(worm);
      const center = this.cellCenter(worm.towerCell.x, worm.towerCell.y);
      const radius = stats.range * this.metrics.cell;
      ctx.save();
      ctx.fillStyle = `${type.color}26`;
      ctx.strokeStyle = `${type.dark}ee`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, TWO_PI);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = `${type.color}dd`;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, TWO_PI);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `${type.dark}ee`;
      ctx.beginPath();
      ctx.arc(center.x, center.y, Math.max(5, this.metrics.cell * 0.16), 0, TWO_PI);
      ctx.fill();
      ctx.restore();
    }

    renderEnemies(ctx, ts) {
      for (const enemy of this.game.state.enemies) {
        if (!enemy.alive) continue;
        const px = this.metrics.boardX + enemy.x * this.metrics.cell;
        const py = this.metrics.boardY + enemy.y * this.metrics.cell;
        const radius = enemy.radius * this.metrics.cell * (1 + Math.sin(ts * 0.01 + enemy.seed) * 0.03);
        ctx.save();
        ctx.shadowColor = `${enemy.color}55`;
        ctx.shadowBlur = 12;
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, TWO_PI);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,255,255,.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, radius * 0.66, 0, TWO_PI);
        ctx.stroke();
        ctx.fillStyle = "rgba(18,34,56,.92)";
        ctx.font = `700 ${Math.max(9, radius * 0.62)}px Trebuchet MS`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(enemy.icon, px, py + 1);
        if (enemy.slowTimer > 0) {
          ctx.strokeStyle = "rgba(143,217,255,.92)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, radius + 4, 0, TWO_PI);
          ctx.stroke();
        }
        const hp = clamp(enemy.hp / Math.max(1, enemy.maxHp), 0, 1);
        if (hp < 1) {
          roundRectPath(ctx, px - radius, py - radius - 10, radius * 2, 4, 3);
          ctx.fillStyle = "rgba(18,34,56,.16)";
          ctx.fill();
          roundRectPath(ctx, px - radius, py - radius - 10, radius * 2 * hp, 4, 3);
          ctx.fillStyle = "#ff9aa3";
          ctx.fill();
        }
        ctx.restore();
      }
    }

    renderProjectiles(ctx) {
      for (const projectile of this.game.state.projectiles) {
        const px = this.metrics.boardX + projectile.x * this.metrics.cell;
        const py = this.metrics.boardY + projectile.y * this.metrics.cell;
        ctx.save();
        ctx.fillStyle = projectile.color;
        ctx.shadowColor = projectile.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, this.metrics.cell * 0.11, 0, TWO_PI);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    }

    renderEffects(ctx) {
      for (const effect of this.game.state.effects) {
        const alpha = clamp(effect.life / Math.max(0.0001, effect.maxLife), 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha;
        if (effect.type === "line") {
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = effect.width;
          ctx.beginPath();
          ctx.moveTo(this.metrics.boardX + effect.x1 * this.metrics.cell, this.metrics.boardY + effect.y1 * this.metrics.cell);
          ctx.lineTo(this.metrics.boardX + effect.x2 * this.metrics.cell, this.metrics.boardY + effect.y2 * this.metrics.cell);
          ctx.stroke();
        } else if (effect.type === "ring") {
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = effect.width;
          ctx.beginPath();
          ctx.arc(this.metrics.boardX + effect.x * this.metrics.cell, this.metrics.boardY + effect.y * this.metrics.cell, effect.radius * this.metrics.cell * (2 - alpha), 0, TWO_PI);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    renderParticles(ctx) {
      for (const particle of this.game.state.particles) {
        const alpha = clamp(particle.life / Math.max(0.0001, particle.maxLife), 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(
          this.metrics.boardX + particle.x * this.metrics.cell,
          this.metrics.boardY + particle.y * this.metrics.cell,
          particle.size * this.metrics.cell * alpha,
          0,
          TWO_PI
        );
        ctx.fill();
        ctx.restore();
      }
    }

    renderDragGhost(ctx, ts) {
      const drag = this.game.input.drag;
      if (!drag || !drag.candidate) return;
      const candidate = drag.candidate;
      if (candidate.mode === "slither") {
        if (!Number.isFinite(candidate.x) || !Number.isFinite(candidate.y)) return;
        const rect = this.cellRect(candidate.x, candidate.y);
        ctx.save();
        ctx.strokeStyle = `${CONFIG.WORM_TYPES[drag.worm.type].dark}dd`;
        ctx.lineWidth = 3;
        ctx.setLineDash([7, 5]);
        roundRectPath(ctx, rect.x + 4, rect.y + 4, rect.size - 8, rect.size - 8, rect.size * 0.16);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        return;
      }
      if (candidate.mode === "merge" && candidate.previewCells?.length) {
        ctx.save();
        ctx.strokeStyle = `rgba(244,178,79,${0.55 + Math.sin(ts * 0.014) * 0.18})`;
        ctx.lineWidth = 3.5;
        for (const cell of candidate.previewCells) {
          const rect = this.cellRect(cell.x, cell.y);
          roundRectPath(ctx, rect.x + 2, rect.y + 2, rect.size - 4, rect.size - 4, rect.size * 0.2);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }
      if (!candidate.cells?.length) return;
      const valid = candidate.mode !== "invalid";
      ctx.save();
      ctx.globalAlpha = 0.74;
      ctx.strokeStyle = valid ? "rgba(44,179,122,.88)" : CONFIG.THEME.invalidStroke;
      ctx.fillStyle = valid ? `${CONFIG.WORM_TYPES[drag.worm.type].color}33` : CONFIG.THEME.invalidFill;
      ctx.lineWidth = 3;
      ctx.setLineDash([9, 6]);
      for (const cell of candidate.cells) {
        const rect = this.cellRect(cell.x, cell.y);
        roundRectPath(ctx, rect.x + 2, rect.y + 2, rect.size - 4, rect.size - 4, rect.size * 0.18);
        ctx.fill();
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  class InputManager {
    constructor(game) {
      this.game = game;
      this.drag = null;
      this.pointerBoard = null;
      this.stepCooldown = 0;
      this.press = null;
      this.bind();
    }

    bind() {
      this.game.canvas.addEventListener("pointerdown", (event) => this.onCanvasPointerDown(event));
      document.addEventListener("pointermove", (event) => this.onPointerMove(event));
      document.addEventListener("pointerup", (event) => this.onPointerUp(event));
      document.addEventListener("pointercancel", (event) => this.onPointerUp(event));
      this.game.refs.poolCards.addEventListener("pointerdown", (event) => this.onPoolPointerDown(event));
      window.addEventListener("keydown", (event) => this.onKeyDown(event));
    }

    onKeyDown(event) {
      if (event.key === "Escape") {
        if (this.game.state.debugOpen) {
          this.game.toggleDebug(false);
          return;
        }
        if (this.game.state.screen === CONFIG.SCREENS.GAMEPLAY) this.game.togglePause();
      }
      if (event.key === " " && this.game.state.screen === CONFIG.SCREENS.GAMEPLAY) {
        event.preventDefault();
        if (this.game.state.phase === CONFIG.PHASES.BUILD) this.game.startBattle();
      }
      if (event.key.toLowerCase() === "d") {
        this.game.toggleDebug(!this.game.state.debugOpen);
      }
    }

    onPoolPointerDown(event) {
      if (this.game.state.screen !== CONFIG.SCREENS.GAMEPLAY || this.game.state.phase !== CONFIG.PHASES.BUILD) return;
      const card = event.target.closest(".poolCard");
      if (!card) return;
      const worm = this.game.state.pool.find((entry) => entry.id === card.dataset.id);
      if (!worm) return;
      event.preventDefault();
      this.game.audio.unlock();
      this.game.clearRangePreview();
      this.press = null;
      this.drag = {
        pointerId: event.pointerId,
        kind: "pool",
        sourceId: worm.id,
        worm: deepClone(worm),
        anchor: Math.floor(worm.size * 0.5),
        candidate: null,
        previewSize: worm.size
      };
      card.classList.add("dragging");
      this.updateCandidate(event.clientX, event.clientY);
    }

    onCanvasPointerDown(event) {
      if (this.game.state.screen !== CONFIG.SCREENS.GAMEPLAY || this.game.state.phase !== CONFIG.PHASES.BUILD) return;
      const cell = this.game.renderer.screenToGridCell(event.clientX, event.clientY);
      if (!cell) {
        this.game.clearRangePreview();
        return;
      }
      const worm = this.game.getWormAtCell(cell.x, cell.y);
      if (!worm) {
        this.game.clearRangePreview();
        return;
      }
      this.game.audio.unlock();
      event.preventDefault();
      this.press = {
        pointerId: event.pointerId,
        wormId: worm.id,
        cell,
        activeEnd: this.game.pickClosestWormEnd(worm, cell),
        startX: event.clientX,
        startY: event.clientY,
        startedAt: performance.now(),
        holdShown: false
      };
      const type = CONFIG.WORM_TYPES[worm.type];
      if (type && type.role === "tower") {
        this.game.showRangePreview(worm.id);
        this.press.holdShown = true;
      }
      this.pointerBoard = this.game.renderer.screenToBoardPosition(event.clientX, event.clientY, true) || { x: cell.x, y: cell.y };
      this.stepCooldown = 0;
    }

    onPointerMove(event) {
      if (this.drag && event.pointerId === this.drag.pointerId) {
        this.updateCandidate(event.clientX, event.clientY);
        return;
      }
      if (!this.press || event.pointerId !== this.press.pointerId) return;
      const dx = event.clientX - this.press.startX;
      const dy = event.clientY - this.press.startY;
      const distance = Math.hypot(dx, dy);
      this.pointerBoard = this.game.renderer.screenToBoardPosition(event.clientX, event.clientY, true) || this.pointerBoard;
      if (distance < CONFIG.BALANCE.holdMoveTolerance) return;
      this.startBoardDragFromPress(event);
      if (this.drag) this.updateCandidate(event.clientX, event.clientY);
    }

    onPointerUp(event) {
      if (this.drag && event.pointerId === this.drag.pointerId) {
        const current = this.drag;
        this.drag = null;
        this.pointerBoard = null;
        this.stepCooldown = 0;
        this.game.clearPoolDragging();
        this.game.commitDrag(current);
        return;
      }
      if (this.press && event.pointerId === this.press.pointerId) {
        this.press = null;
        this.pointerBoard = null;
        if (this.game.state.rangePreview) this.game.clearRangePreview();
      }
    }

    startBoardDragFromPress(event) {
      if (!this.press) return;
      const worm = this.game.getWormById(this.press.wormId);
      if (!worm) {
        this.press = null;
        return;
      }
      this.game.clearRangePreview();
      this.drag = {
        pointerId: event.pointerId,
        kind: "board",
        sourceId: worm.id,
        worm: deepClone(worm),
        activeEnd: this.press.activeEnd,
        candidate: null,
        previewSize: worm.size,
        anchor: Math.floor(worm.size * 0.5)
      };
      this.press = null;
      this.stepCooldown = 0;
    }

    updateCandidate(clientX, clientY) {
      const drag = this.drag;
      if (!drag) return;
      this.pointerBoard = this.game.renderer.screenToBoardPosition(clientX, clientY, true) || this.pointerBoard;
      const cell = this.game.renderer.screenToGridCell(clientX, clientY);
      if (!cell) {
        drag.candidate = { mode: "invalid", cells: [], reason: "outside-board" };
        return;
      }
      if (drag.kind === "board" && this.game.designer.wormMoveMode === "slither") {
        drag.candidate = { mode: "slither", x: cell.x, y: cell.y };
        return;
      }

      const ignore = new Set(drag.kind === "board" ? [drag.sourceId] : []);
      const hover = this.game.getWormAtCell(cell.x, cell.y, drag.kind === "board" ? drag.sourceId : null);
      if (hover && hover.type === drag.worm.type && hover.size === drag.worm.size) {
        const placement = this.game.findMergePlacement(drag.worm, hover, drag.kind === "board" ? drag.sourceId : null);
        if (placement) {
          drag.previewSize = hover.size + 1;
          drag.candidate = {
            mode: "merge",
            target: hover,
            placement,
            previewCells: placement.cells
          };
          return;
        }
      }

      drag.previewSize = drag.worm.size;
      const anchor = Number.isFinite(drag.anchor) ? drag.anchor : Math.floor(drag.worm.size * 0.5);
      const x = Math.round(cell.x - anchor);
      const y = cell.y;
      const cells = this.game.createLinearCells(x, y, drag.worm.size);
      const validation = this.game.validateWormCells(cells, ignore);
      drag.candidate = {
        mode: validation.valid ? "place" : "invalid",
        x,
        y,
        cells,
        reason: validation.reason || "",
        validation
      };
    }

    update(dt) {
      if (this.press && this.game.state.phase === CONFIG.PHASES.BUILD) {
        const worm = this.game.getWormById(this.press.wormId);
        if (!worm) {
          this.press = null;
        } else if (!this.press.holdShown && performance.now() - this.press.startedAt >= CONFIG.BALANCE.holdDelayMs) {
          const type = CONFIG.WORM_TYPES[worm.type];
          if (type && type.role === "tower") {
            this.game.showRangePreview(worm.id);
            this.press.holdShown = true;
          }
        }
      }
      if (!this.drag || this.drag.kind !== "board" || this.game.designer.wormMoveMode !== "slither" || !this.pointerBoard) return;
      this.stepCooldown = Math.max(0, this.stepCooldown - dt);
      if (this.stepCooldown > 0) return;
      const direction = this.game.getSlitherDirection(this.drag.sourceId, this.drag.activeEnd, this.pointerBoard);
      if (!direction) return;
      const moved = this.game.stepSlitherWorm(this.drag.sourceId, direction, this.drag.activeEnd);
      this.stepCooldown = moved ? CONFIG.BALANCE.slitherStepCooldown : CONFIG.BALANCE.slitherStepCooldown * 0.72;
    }

    getActiveEndForWorm(wormId) {
      if (this.drag?.kind === "board" && this.drag.sourceId === wormId) return this.drag.activeEnd;
      if (this.press?.wormId === wormId) return this.press.activeEnd;
      return null;
    }
  }

  class UIManager {
    constructor(game) {
      this.game = game;
      this.refs = game.refs;
      this.bind();
    }

    bind() {
      const refs = this.refs;
      refs.menuPlayButton.addEventListener("click", () => this.game.openLevelSelect());
      refs.menuContinueButton.addEventListener("click", () => this.game.startLevel(this.game.save.data.lastLevel || 1));
      refs.menuSandboxButton.addEventListener("click", () => {
        this.game.toggleDebug(true);
        this.game.openLevelSelect();
      });
      refs.menuLauncherButton.addEventListener("click", () => {
        window.location.href = "./game_launcher.html";
      });
      refs.levelBackButton.addEventListener("click", () => this.game.openMenu());
      refs.levelDebugButton.addEventListener("click", () => this.game.toggleDebug(true));
      refs.pauseResumeButton.addEventListener("click", () => this.game.resumeFromPause());
      refs.pauseRestartButton.addEventListener("click", () => this.game.restartLevel());
      refs.pauseMenuButton.addEventListener("click", () => this.game.openMenu());
      refs.pauseDebugButton.addEventListener("click", () => this.game.toggleDebug(true));
      refs.resultRetryButton.addEventListener("click", () => this.game.restartLevel());
      refs.resultMenuButton.addEventListener("click", () => this.game.openMenu());
      refs.resultNextButton.addEventListener("click", () => this.game.handleResultNext());
      refs.resultDebugButton.addEventListener("click", () => this.game.toggleDebug(true));
      refs.battleButton.addEventListener("click", () => this.game.startBattle());
      refs.secondaryBattleButton.addEventListener("click", () => this.game.startBattle());
      refs.refreshButton.addEventListener("click", () => this.game.refreshShop());
      refs.secondaryRefreshButton.addEventListener("click", () => this.game.refreshShop());
      refs.pauseButton.addEventListener("click", () => this.game.togglePause());
      refs.soundButton.addEventListener("click", () => this.game.toggleSound());
      refs.speedButton.addEventListener("click", () => this.game.toggleBattleSpeed());
      refs.debugButton.addEventListener("click", () => this.game.toggleDebug(!this.game.state.debugOpen));
      refs.menuButton.addEventListener("click", () => this.game.openMenu());
      refs.closeDebugButton.addEventListener("click", () => this.game.toggleDebug(false));
      refs.applyDebugButton.addEventListener("click", () => this.game.applyDesignerInputs(true));
      refs.dbgRegenerateButton.addEventListener("click", () => this.game.regenerateLevel());
      refs.dbgAddCrystalsButton.addEventListener("click", () => this.game.addCrystals(20));
      refs.dbgSpawnPoolButton.addEventListener("click", () => this.game.spawnWormInPool());
      refs.dbgSpawnFieldButton.addEventListener("click", () => this.game.spawnRandomWormOnField());
      refs.dbgForceMergeButton.addEventListener("click", () => this.game.forceFirstMerge());
      refs.dbgStartBattleButton.addEventListener("click", () => this.game.startBattle());
      refs.dbgKillEnemiesButton.addEventListener("click", () => this.game.killAllEnemies());
      refs.dbgFastForwardButton.addEventListener("click", () => this.game.toggleBattleSpeed());
      refs.dbgExportLevelButton.addEventListener("click", () => this.game.exportLevelJson());
      refs.dbgImportLevelButton.addEventListener("click", () => this.game.importLevelJson());
      refs.dbgExportBalanceButton.addEventListener("click", () => this.game.exportBalanceJson());
      refs.dbgImportBalanceButton.addEventListener("click", () => this.game.importBalanceJson());
    }

    setScreen(screen) {
      this.refs.bootScreen.classList.toggle("visible", screen === CONFIG.SCREENS.BOOT);
      this.refs.menuScreen.classList.toggle("visible", screen === CONFIG.SCREENS.MENU);
      this.refs.levelScreen.classList.toggle("visible", screen === CONFIG.SCREENS.LEVELS);
      this.refs.pauseScreen.classList.toggle("visible", screen === CONFIG.SCREENS.PAUSE);
      this.refs.resultScreen.classList.toggle("visible", screen === CONFIG.SCREENS.RESULT);
      const showGameplayChrome = screen === CONFIG.SCREENS.GAMEPLAY || screen === CONFIG.SCREENS.PAUSE;
      this.refs.hudRoot.style.display = showGameplayChrome ? "grid" : "none";
      this.refs.bottomBar.style.display = showGameplayChrome ? "grid" : "none";
    }

    refresh() {
      const state = this.game.state;
      const refreshCost = this.game.getRefreshCost();
      const estimate = state.lastEstimate || { playerPower: 0, enemyPower: 0, ratio: 1, targetDuration: 16, expectedDuration: 16 };
      this.refs.hudLevel.textContent = String(state.levelIndex || 1);
      this.refs.hudWave.textContent = `${state.waveIndex || 1} / ${state.totalWaves || 3}`;
      this.refs.hudPhase.textContent = state.phase === CONFIG.PHASES.BUILD ? "Build" : "Battle";
      this.refs.hudCrystals.textContent = String(state.crystals || 0);
      this.refs.hudRefreshCost.textContent = String(refreshCost);
      this.refs.hudPower.textContent = `${formatShortNumber(estimate.playerPower)}:${formatShortNumber(estimate.enemyPower)}`;
      this.refs.hudCore.textContent = String(Math.max(0, Math.round(state.core?.hp || 0)));
      this.refs.soundButton.textContent = this.game.audio.enabled ? "Sound On" : "Sound Off";
      this.refs.speedButton.textContent = `Speed x${state.battleSpeed.toFixed(0)}`;
      const buildPhase = state.phase === CONFIG.PHASES.BUILD && state.screen === CONFIG.SCREENS.GAMEPLAY;
      const canRefresh = buildPhase && state.crystals >= refreshCost;
      this.refs.refreshButton.disabled = !canRefresh;
      this.refs.secondaryRefreshButton.disabled = !canRefresh;
      const canBattle = buildPhase && state.worms.length > 0 && !state.navigation.blocked;
      this.refs.battleButton.disabled = !canBattle;
      this.refs.secondaryBattleButton.disabled = !canBattle;
      this.refs.poolSubtitle.textContent = buildPhase
        ? "🫳 Drag a worm by its head or tail to slither, merge equal worms, then launch the wave."
        : "⚔️ Auto-battle running.";
      this.refs.floatingHint.textContent = this.game.getHintText();
      this.renderStatus();
      this.renderPool();
      this.renderLevels();
      this.renderResult();
      this.updateDebugOutputs();
    }

    renderStatus() {
      const state = this.game.state;
      const estimate = state.lastEstimate || { ratio: 1, targetDuration: 0, expectedDuration: 0, averagePathLength: 0 };
      const tags = [];
      if (window.GameEntry?.current?.isDeveloper()) {
        tags.push(`<div class="statusTag">⏱️ Target ${Math.round(estimate.targetDuration || 0)}s</div>`);
        tags.push(`<div class="statusTag">📈 Estimate ${Math.round(estimate.expectedDuration || 0)}s</div>`);
        tags.push(`<div class="statusTag">🧭 Path ${estimate.averagePathLength ? estimate.averagePathLength.toFixed(1) : "0.0"} tiles</div>`);
        const ratioClass = estimate.ratio >= 1.1 ? "good" : estimate.ratio >= 0.92 ? "warn" : "danger";
        tags.push(`<div class="statusTag ${ratioClass}">🔥 Pressure ${estimate.ratio.toFixed(2)}x</div>`);
      }
      if (state.navigation.blocked) tags.push(`<div class="statusTag danger">🚫 Path Blocked</div>`);
      else tags.push(`<div class="statusTag">${state.phase === CONFIG.PHASES.BATTLE ? `👾 Enemies ${state.enemies.filter((enemy) => enemy.alive).length}` : `🚪 Spawns ${state.spawnPoints.length}`}</div>`);
      this.refs.statusRow.innerHTML = tags.join("");
    }

    renderPool() {
      const state = this.game.state;
      const container = this.refs.poolCards;
      if (!state.pool.length) {
        container.innerHTML = `<div class="poolCard"><div class="poolCardHeader"><div class="poolType"><div class="poolIcon">🫙</div><span>Pool empty</span></div></div><div class="poolCardMeta">Refresh the shop or clear the wave to refill it.</div></div>`;
      } else {
        container.innerHTML = state.pool.map((worm) => {
          const type = CONFIG.WORM_TYPES[worm.type];
          return `
            <div class="poolCard" data-id="${worm.id}" style="border-color:${type.color}44;background:linear-gradient(180deg,${type.soft},rgba(255,255,255,.96))">
              <div class="poolCardHeader">
                <div class="poolType">
                  <div class="poolIcon">${type.icon}</div>
                  <span>${type.label}</span>
                </div>
                <div class="poolSize">x${worm.size}</div>
              </div>
              <div class="poolCardMeta">
                <span>${type.role === "wall" ? "🧱 Maze wall" : "🎯 One active tower node"}</span>
                <strong>${worm.size} cells</strong>
              </div>
            </div>
          `;
        }).join("");
      }
      const refreshCost = this.game.getRefreshCost();
      const footerTags = [];
      footerTags.push(`<div class="statusTag">🔄 Refresh ${refreshCost}</div>`);
      if (window.GameEntry?.current?.isDeveloper()) {
        footerTags.push(`<div class="statusTag">🌱 Seed ${this.game.designer.seed}</div>`);
        footerTags.push(`<div class="statusTag">🪨 Obstacles ${state.staticObstacles.length}</div>`);
      }
      footerTags.push(`<div class="statusTag">✨ Bonus ${state.bonusTiles.length}</div>`);
      this.refs.poolFooterText.innerHTML = footerTags.join("");
    }

    renderLevels() {
      const current = this.game.save.data.highestUnlocked || 1;
      this.refs.levelGrid.innerHTML = CONFIG.CAMPAIGN_LEVELS.map((level) => {
        const unlocked = !!window.GameEntry?.current?.isDeveloper() || level.id <= current;
        return `
          <button class="levelCard ${unlocked ? "" : "locked"}" data-level="${level.id}" ${unlocked ? "" : "disabled"}>
            <div class="eyebrow">Campaign</div>
            <strong>${level.name}</strong>
            <div class="levelMeta"><span>${level.waves} waves</span><span>${level.layout.width}x${level.layout.height}</span></div>
          </button>
        `;
      }).join("");
      [...this.refs.levelGrid.querySelectorAll("[data-level]")].forEach((button) => {
        button.addEventListener("click", () => this.game.startLevel(Number(button.dataset.level)));
      });
    }

    renderResult() {
      const result = this.game.state.result;
      if (!result) return;
      this.refs.resultTitle.textContent = result.title;
      this.refs.resultBody.textContent = result.body;
      this.refs.resultLevel.textContent = String(this.game.state.levelIndex);
      this.refs.resultWave.textContent = `${this.game.state.waveIndex} / ${this.game.state.totalWaves}`;
      this.refs.resultCrystals.textContent = String(this.game.state.crystals);
      this.refs.resultUnlocked.textContent = String(this.game.save.data.highestUnlocked);
      this.refs.resultNextButton.textContent = result.nextLabel;
    }

    loadDesignerValues() {
      const d = this.game.designer;
      this.refs.dbgTotalFieldWidth.value = d.totalFieldWidth;
      this.refs.dbgTotalFieldHeight.value = d.totalFieldHeight;
      this.refs.dbgInitialPoolSize.value = d.initialPoolSize;
      this.refs.dbgRefreshCostStart.value = d.refreshCostStart;
      this.refs.dbgInitialWormCount.value = d.initialWormCount;
      this.refs.dbgWormMoveMode.value = d.wormMoveMode;
      this.refs.dbgMergeRules.value = d.mergeRules;
      this.refs.dbgAllowedWormTypes.value = d.allowedWormTypes.join(", ");
      this.refs.dbgAllowedWormSizes.value = d.allowedWormSizes.join(", ");
      this.refs.dbgRefreshCostCurve.value = JSON.stringify(d.refreshCostCurve, null, 2);
      this.refs.dbgBonusStart.value = d.bonusTileStartCount;
      this.refs.dbgBonusGrowth.value = d.bonusTileGrowthPerWave;
      this.refs.dbgAllowedBonusTypes.value = d.allowedBonusTypes.join(", ");
      this.refs.dbgBonusValues.value = JSON.stringify(d.bonusValues, null, 2);
      this.refs.dbgEnemyHpMultiplier.value = d.enemyHpMultiplier;
      this.refs.dbgEnemySpeedMultiplier.value = d.enemySpeedMultiplier;
      this.refs.dbgEnemySpawnRateMultiplier.value = d.enemySpawnRateMultiplier;
      this.refs.dbgTowerDamageMultiplier.value = d.towerDamageMultiplier;
      this.refs.dbgTowerRangeMultiplier.value = d.towerRangeMultiplier;
      this.refs.dbgTowerAttackSpeedMultiplier.value = d.towerAttackSpeedMultiplier;
      this.refs.dbgWaveDurationStart.value = d.waveDurationStart;
      this.refs.dbgWaveDurationPerWave.value = d.waveDurationPerWave;
      this.refs.dbgWaveDurationCap.value = d.waveDurationCap;
      this.refs.dbgBattleSpeed.value = d.battleSpeed;
      this.refs.dbgSeed.value = d.seed;
      this.refs.dbgCoreHp.value = d.baseCoreHp;
      this.refs.dbgMaxActiveEnemies.value = d.maxActiveEnemies;
      this.refs.dbgShowPathDebug.checked = d.showPathDebug;
      this.refs.dbgShowPathNodes.checked = d.showPathNodes;
      this.refs.dbgEnemyBaseStats.value = JSON.stringify(CONFIG.ENEMY_TYPES, null, 2);
      this.refs.dbgWormTypeStats.value = JSON.stringify(CONFIG.WORM_TYPES, null, 2);
      this.updateDebugOutputs();
    }

    updateDebugOutputs() {
      if (!this.refs.dbgPathStatus) return;
      this.refs.dbgPathStatus.textContent = this.game.state.navigation.blocked
        ? `Blocked: ${this.game.state.navigation.blockedBy || "no path"}`
        : `Open (${this.game.state.navigation.averageLength.toFixed(1)} avg tiles)`;
    }
  }

  class Game {
    constructor() {
      this.canvas = document.getElementById("gameCanvas");
      this.refs = this.collectRefs();
      this.save = new SaveManager(CONFIG.SAVE_KEY);
      this.audio = new AudioManager(this.save.data.soundOn);
      this.entryDefaults = deepClone({ worm: CONFIG.WORM_TYPES, enemy: CONFIG.ENEMY_TYPES, balance: CONFIG.BALANCE });
      this.entryDeveloperConfig = null;
      this.entryMode = null;
      this.designer = this.normalizeDesigner(deepClone(this.save.data.designer || CONFIG.DEFAULT_DESIGNER));
      this.pathCache = new Map();
      this.state = this.createInitialState();
      this.renderer = new Renderer(this);
      this.input = new InputManager(this);
      this.ui = new UIManager(this);
      this.lastFrame = performance.now();
      this.loop = this.loop.bind(this);
      this.boot();
      requestAnimationFrame(this.loop);
    }

    normalizeDesigner(input) {
      const designer = { ...deepClone(CONFIG.DEFAULT_DESIGNER), ...(input || {}) };
      designer.totalFieldWidth = clamp(Number(designer.totalFieldWidth || 12), 8, 16);
      designer.totalFieldHeight = clamp(Number(designer.totalFieldHeight || 11), 8, 16);
      designer.initialPoolSize = clamp(Number(designer.initialPoolSize || 3), 1, 6);
      designer.refreshCostStart = clamp(Number(designer.refreshCostStart || 4), 1, 20);
      designer.initialWormCount = clamp(Number(designer.initialWormCount || 3), 0, 10);
      designer.allowedWormTypes = (designer.allowedWormTypes || []).filter((id) => CONFIG.WORM_TYPES[id]);
      if (!designer.allowedWormTypes.length) designer.allowedWormTypes = deepClone(CONFIG.DEFAULT_DESIGNER.allowedWormTypes);
      designer.allowedWormSizes = (designer.allowedWormSizes || []).filter((size) => size >= 2 && size <= 4);
      if (!designer.allowedWormSizes.length) designer.allowedWormSizes = [2, 3];
      designer.allowedBonusTypes = (designer.allowedBonusTypes || []).filter((id) => CONFIG.THEME.bonusTypes[id]);
      if (!designer.allowedBonusTypes.length) designer.allowedBonusTypes = deepClone(CONFIG.DEFAULT_DESIGNER.allowedBonusTypes);
      designer.towerDamageMultiplier = clamp(Number(designer.towerDamageMultiplier || 1), 0.3, 4);
      designer.towerRangeMultiplier = clamp(Number(designer.towerRangeMultiplier || 1), 0.3, 3);
      designer.towerAttackSpeedMultiplier = clamp(Number(designer.towerAttackSpeedMultiplier || 1), 0.3, 4);
      designer.enemyHpMultiplier = clamp(Number(designer.enemyHpMultiplier || 1), 0.3, 4);
      designer.enemySpeedMultiplier = clamp(Number(designer.enemySpeedMultiplier || 1), 0.3, 3);
      designer.enemySpawnRateMultiplier = clamp(Number(designer.enemySpawnRateMultiplier || 1), 0.3, 4);
      designer.waveDurationStart = clamp(Number(designer.waveDurationStart || 16), 10, 45);
      designer.waveDurationPerWave = clamp(Number(designer.waveDurationPerWave || 4), 1, 12);
      designer.waveDurationCap = clamp(Number(designer.waveDurationCap || 40), 15, 60);
      designer.battleSpeed = clamp(Number(designer.battleSpeed || 1), 1, 4);
      if (designer.wormMoveMode === "dragPlace") designer.wormMoveMode = "slither";
      designer.wormMoveMode = ["slither", "dragPlace"].includes(designer.wormMoveMode) ? designer.wormMoveMode : "slither";
      designer.baseCoreHp = clamp(Number(designer.baseCoreHp || 20), 5, 80);
      designer.maxActiveEnemies = clamp(Number(designer.maxActiveEnemies || 100), 20, 140);
      designer.obstacleBudgetBonus = clamp(Number(designer.obstacleBudgetBonus || 0), 0, 12);
      designer.showPathDebug = !!designer.showPathDebug;
      designer.showPathNodes = !!designer.showPathNodes;
      return designer;
    }

    collectRefs() {
      return {
        hudRoot: document.querySelector(".hud"),
        bottomBar: document.querySelector(".bottomBar"),
        bootScreen: document.getElementById("bootScreen"),
        menuScreen: document.getElementById("menuScreen"),
        levelScreen: document.getElementById("levelScreen"),
        pauseScreen: document.getElementById("pauseScreen"),
        resultScreen: document.getElementById("resultScreen"),
        debugDrawer: document.getElementById("debugDrawer"),
        floatingHint: document.getElementById("floatingHint"),
        statusRow: document.getElementById("statusRow"),
        hudLevel: document.getElementById("hudLevel"),
        hudWave: document.getElementById("hudWave"),
        hudPhase: document.getElementById("hudPhase"),
        hudCrystals: document.getElementById("hudCrystals"),
        hudRefreshCost: document.getElementById("hudRefreshCost"),
        hudPower: document.getElementById("hudPower"),
        hudCore: document.getElementById("hudCore"),
        battleButton: document.getElementById("battleButton"),
        speedButton: document.getElementById("speedButton"),
        pauseButton: document.getElementById("pauseButton"),
        soundButton: document.getElementById("soundButton"),
        debugButton: document.getElementById("debugButton"),
        menuPlayButton: document.getElementById("menuPlayButton"),
        menuContinueButton: document.getElementById("menuContinueButton"),
        menuSandboxButton: document.getElementById("menuSandboxButton"),
        menuLauncherButton: document.getElementById("menuLauncherButton"),
        levelBackButton: document.getElementById("levelBackButton"),
        levelDebugButton: document.getElementById("levelDebugButton"),
        levelGrid: document.getElementById("levelGrid"),
        pauseResumeButton: document.getElementById("pauseResumeButton"),
        pauseRestartButton: document.getElementById("pauseRestartButton"),
        pauseMenuButton: document.getElementById("pauseMenuButton"),
        pauseDebugButton: document.getElementById("pauseDebugButton"),
        resultTitle: document.getElementById("resultTitle"),
        resultBody: document.getElementById("resultBody"),
        resultLevel: document.getElementById("resultLevel"),
        resultWave: document.getElementById("resultWave"),
        resultCrystals: document.getElementById("resultCrystals"),
        resultUnlocked: document.getElementById("resultUnlocked"),
        resultRetryButton: document.getElementById("resultRetryButton"),
        resultMenuButton: document.getElementById("resultMenuButton"),
        resultNextButton: document.getElementById("resultNextButton"),
        resultDebugButton: document.getElementById("resultDebugButton"),
        refreshButton: document.getElementById("refreshButton"),
        menuButton: document.getElementById("menuButton"),
        poolCards: document.getElementById("poolCards"),
        poolSubtitle: document.getElementById("poolSubtitle"),
        poolFooterText: document.getElementById("poolFooterText"),
        secondaryBattleButton: document.getElementById("secondaryBattleButton"),
        secondaryRefreshButton: document.getElementById("secondaryRefreshButton"),
        closeDebugButton: document.getElementById("closeDebugButton"),
        applyDebugButton: document.getElementById("applyDebugButton"),
        dbgTotalFieldWidth: document.getElementById("dbgTotalFieldWidth"),
        dbgTotalFieldHeight: document.getElementById("dbgTotalFieldHeight"),
        dbgInitialPoolSize: document.getElementById("dbgInitialPoolSize"),
        dbgRefreshCostStart: document.getElementById("dbgRefreshCostStart"),
        dbgInitialWormCount: document.getElementById("dbgInitialWormCount"),
        dbgWormMoveMode: document.getElementById("dbgWormMoveMode"),
        dbgMergeRules: document.getElementById("dbgMergeRules"),
        dbgAllowedWormTypes: document.getElementById("dbgAllowedWormTypes"),
        dbgAllowedWormSizes: document.getElementById("dbgAllowedWormSizes"),
        dbgRefreshCostCurve: document.getElementById("dbgRefreshCostCurve"),
        dbgBonusStart: document.getElementById("dbgBonusStart"),
        dbgBonusGrowth: document.getElementById("dbgBonusGrowth"),
        dbgAllowedBonusTypes: document.getElementById("dbgAllowedBonusTypes"),
        dbgBonusValues: document.getElementById("dbgBonusValues"),
        dbgEnemyHpMultiplier: document.getElementById("dbgEnemyHpMultiplier"),
        dbgEnemySpeedMultiplier: document.getElementById("dbgEnemySpeedMultiplier"),
        dbgEnemySpawnRateMultiplier: document.getElementById("dbgEnemySpawnRateMultiplier"),
        dbgTowerDamageMultiplier: document.getElementById("dbgTowerDamageMultiplier"),
        dbgTowerRangeMultiplier: document.getElementById("dbgTowerRangeMultiplier"),
        dbgTowerAttackSpeedMultiplier: document.getElementById("dbgTowerAttackSpeedMultiplier"),
        dbgWaveDurationStart: document.getElementById("dbgWaveDurationStart"),
        dbgWaveDurationPerWave: document.getElementById("dbgWaveDurationPerWave"),
        dbgWaveDurationCap: document.getElementById("dbgWaveDurationCap"),
        dbgBattleSpeed: document.getElementById("dbgBattleSpeed"),
        dbgSeed: document.getElementById("dbgSeed"),
        dbgCoreHp: document.getElementById("dbgCoreHp"),
        dbgMaxActiveEnemies: document.getElementById("dbgMaxActiveEnemies"),
        dbgShowPathDebug: document.getElementById("dbgShowPathDebug"),
        dbgShowPathNodes: document.getElementById("dbgShowPathNodes"),
        dbgPathStatus: document.getElementById("dbgPathStatus"),
        dbgWormTypeStats: document.getElementById("dbgWormTypeStats"),
        dbgEnemyBaseStats: document.getElementById("dbgEnemyBaseStats"),
        dbgRegenerateButton: document.getElementById("dbgRegenerateButton"),
        dbgAddCrystalsButton: document.getElementById("dbgAddCrystalsButton"),
        dbgSpawnPoolButton: document.getElementById("dbgSpawnPoolButton"),
        dbgSpawnFieldButton: document.getElementById("dbgSpawnFieldButton"),
        dbgForceMergeButton: document.getElementById("dbgForceMergeButton"),
        dbgStartBattleButton: document.getElementById("dbgStartBattleButton"),
        dbgKillEnemiesButton: document.getElementById("dbgKillEnemiesButton"),
        dbgFastForwardButton: document.getElementById("dbgFastForwardButton"),
        dbgExportLevelButton: document.getElementById("dbgExportLevelButton"),
        dbgImportLevelButton: document.getElementById("dbgImportLevelButton"),
        dbgLevelJson: document.getElementById("dbgLevelJson"),
        dbgExportBalanceButton: document.getElementById("dbgExportBalanceButton"),
        dbgImportBalanceButton: document.getElementById("dbgImportBalanceButton"),
        dbgBalanceJson: document.getElementById("dbgBalanceJson")
      };
    }

    createInitialState() {
      return {
        screen: CONFIG.SCREENS.BOOT,
        phase: CONFIG.PHASES.BUILD,
        debugOpen: false,
        mode: CONFIG.MODES.campaign.id,
        modeLabel: CONFIG.MODES.campaign.label,
        levelIndex: 1,
        totalWaves: CONFIG.CAMPAIGN_LEVELS[0].waves,
        waveIndex: 1,
        globalWaveIndex: 1,
        worms: [],
        pool: [],
        bonusTiles: [],
        spawnPoints: [],
        staticObstacles: [],
        enemies: [],
        projectiles: [],
        particles: [],
        effects: [],
        result: null,
        refreshStep: 0,
        crystals: 0,
        battleTime: 0,
        battleSpeed: this.designer.battleSpeed || 1,
        lastEstimate: { playerPower: 0, enemyPower: 0, ratio: 1, targetDuration: 16, expectedDuration: 16, averagePathLength: 0 },
        wavePlan: null,
        waveEventCursor: 0,
        nextId: 1,
        core: {
          id: "core",
          kind: "core",
          x: Math.floor(this.designer.totalFieldWidth * 0.5),
          y: Math.floor(this.designer.totalFieldHeight * 0.5),
          hp: this.designer.baseCoreHp,
          maxHp: this.designer.baseCoreHp,
          alive: true
        },
        navigation: {
          blocked: false,
          blockedBy: "",
          averageLength: 0,
          directLength: 0,
          turns: 0,
          pathsBySpawn: {}
        },
        feedback: {
          invalidCells: [],
          invalidReason: "",
          invalidUntil: 0,
          shakeUntil: 0
        },
        rangePreview: null
      };
    }

    boot() {
      this.ui.setScreen(CONFIG.SCREENS.BOOT);
      this.ui.refresh();
      setTimeout(() => { if (this.state.screen === CONFIG.SCREENS.BOOT) this.openMenu(); }, 650);
    }

    getBoardConfig() {
      return {
        totalFieldWidth: this.designer.totalFieldWidth,
        totalFieldHeight: this.designer.totalFieldHeight
      };
    }

    openMenu() {
      this.state.screen = CONFIG.SCREENS.MENU;
      this.state.phase = CONFIG.PHASES.BUILD;
      this.ui.setScreen(CONFIG.SCREENS.MENU);
      this.ui.refresh();
    }

    openLevelSelect() {
      this.state.screen = CONFIG.SCREENS.LEVELS;
      this.ui.setScreen(CONFIG.SCREENS.LEVELS);
      this.ui.refresh();
    }

    applyCampaignLevelTuning(level) {
      if (!level || !level.layout) return;
      this.designer.totalFieldWidth = clamp(Number(level.layout.width) || this.designer.totalFieldWidth, 8, 16);
      this.designer.totalFieldHeight = clamp(Number(level.layout.height) || this.designer.totalFieldHeight, 8, 16);
      this.designer.obstacleBudgetBonus = clamp((level.layout.obstacleBudget || 0) - 6, 0, 12);
    }

    startLevel(levelIndex) {
      const level = CONFIG.CAMPAIGN_LEVELS[levelIndex - 1] || CONFIG.CAMPAIGN_LEVELS[0];
      this.applyCampaignLevelTuning(level);
      this.state = this.createInitialState();
      this.state.screen = CONFIG.SCREENS.GAMEPLAY;
      this.state.mode = CONFIG.MODES.campaign.id;
      this.state.modeLabel = CONFIG.MODES.campaign.label;
      this.state.levelIndex = level.id;
      this.state.totalWaves = level.waves;
      this.state.waveIndex = 1;
      this.state.globalWaveIndex = this.computeGlobalWaveIndex(level.id, 1);
      this.state.crystals = this.designer.startingCrystals;
      this.state.refreshStep = 0;
      this.state.result = null;
      this.state.battleSpeed = this.designer.battleSpeed || 1;
      this.buildArenaLayout(level);
      this.seedInitialWorms();
      this.fillPool(true);
      this.generateBonusTiles();
      this.recomputeEstimate();
      this.save.setLastLevel(level.id);
      this.ui.setScreen(CONFIG.SCREENS.GAMEPLAY);
      this.renderer.resize();
      this.ui.refresh();
    }

    restartLevel() {
      this.startLevel(this.state.levelIndex || 1);
    }

    buildArenaLayout(level) {
      const width = this.designer.totalFieldWidth;
      const height = this.designer.totalFieldHeight;
      this.state.core = {
        id: "core",
        kind: "core",
        x: Math.floor(width * 0.5),
        y: Math.floor(height * 0.5),
        hp: this.designer.baseCoreHp,
        maxHp: this.designer.baseCoreHp,
        alive: true
      };
      this.state.spawnPoints = this.createSpawnPoints(width, height);
      this.state.staticObstacles = this.createStaticObstacles(level);
      this.refreshNavigation();
    }

    createSpawnPoints(width, height) {
      const midX = Math.floor(width * 0.5);
      const midY = Math.floor(height * 0.5);
      const points = [
        { id: "topL", x: clamp(1, 0, width - 1), y: 0, marker: "N" },
        { id: "topM", x: clamp(midX, 0, width - 1), y: 0, marker: "N" },
        { id: "topR", x: clamp(width - 2, 0, width - 1), y: 0, marker: "N" },
        { id: "leftM", x: 0, y: clamp(midY, 0, height - 1), marker: "W" },
        { id: "rightM", x: width - 1, y: clamp(midY, 0, height - 1), marker: "E" }
      ];
      const seen = new Set();
      return points.filter((point) => {
        const key = cellKey(point.x, point.y);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    createStaticObstacles(level) {
      const width = this.designer.totalFieldWidth;
      const height = this.designer.totalFieldHeight;
      const budget = clamp((level?.layout?.obstacleBudget || 6) + (this.designer.obstacleBudgetBonus || 0), 0, 18);
      const reserved = new Set([cellKey(this.state.core.x, this.state.core.y), ...this.state.spawnPoints.map((spawn) => cellKey(spawn.x, spawn.y))]);
      const clusters = this.buildObstacleClusters(width, height);
      const rng = this.randomForScope(`obstacles_${level?.id || 1}`);
      rng.shuffle(clusters);
      const blocked = [];
      for (const cluster of clusters) {
        if (blocked.length >= budget) break;
        const proposed = blocked.slice();
        for (const cell of cluster) {
          const key = cellKey(cell.x, cell.y);
          if (reserved.has(key)) continue;
          if (manhattan(cell, this.state.core) <= 1) continue;
          if (proposed.some((entry) => entry.x === cell.x && entry.y === cell.y)) continue;
          proposed.push({ x: cell.x, y: cell.y });
        }
        if (proposed.length === blocked.length) continue;
        const blockedSet = new Set(proposed.map((cell) => cellKey(cell.x, cell.y)));
        const nav = this.computeNavigationFromBlockedSet(blockedSet);
        if (!nav.blocked) {
          blocked.splice(0, blocked.length, ...proposed);
        }
      }
      return blocked;
    }

    buildObstacleClusters(width, height) {
      const cx = Math.floor(width * 0.5);
      const cy = Math.floor(height * 0.5);
      const candidates = [];
      const pushCluster = (...cells) => {
        candidates.push(cells.filter((cell) => cell.x >= 0 && cell.y >= 0 && cell.x < width && cell.y < height));
      };
      pushCluster({ x: 2, y: 2 }, { x: width - 3, y: 2 });
      pushCluster({ x: 2, y: height - 3 }, { x: width - 3, y: height - 3 });
      pushCluster({ x: 3, y: Math.max(2, cy - 2) }, { x: width - 4, y: Math.max(2, cy - 2) });
      pushCluster({ x: 2, y: Math.min(height - 3, cy + 2) }, { x: width - 3, y: Math.min(height - 3, cy + 2) });
      pushCluster({ x: Math.max(2, cx - 3), y: 2 }, { x: Math.min(width - 3, cx + 3), y: 2 });
      pushCluster({ x: Math.max(2, cx - 3), y: height - 3 }, { x: Math.min(width - 3, cx + 3), y: height - 3 });
      pushCluster({ x: 1, y: Math.max(2, cy - 3) }, { x: width - 2, y: Math.max(2, cy - 3) });
      pushCluster({ x: 1, y: Math.min(height - 3, cy + 3) }, { x: width - 2, y: Math.min(height - 3, cy + 3) });
      pushCluster({ x: Math.max(1, cx - 2), y: 1 }, { x: Math.min(width - 2, cx + 2), y: 1 });
      pushCluster({ x: Math.max(1, cx - 2), y: height - 2 }, { x: Math.min(width - 2, cx + 2), y: height - 2 });
      pushCluster({ x: 3, y: 3 }, { x: width - 4, y: height - 4 });
      pushCluster({ x: width - 4, y: 3 }, { x: 3, y: height - 4 });
      pushCluster({ x: Math.max(1, cx - 4), y: cy }, { x: Math.min(width - 2, cx + 4), y: cy });
      return candidates;
    }

    resumeFromPause() {
      if (this.state.screen !== CONFIG.SCREENS.PAUSE) return;
      this.state.screen = CONFIG.SCREENS.GAMEPLAY;
      this.ui.setScreen(CONFIG.SCREENS.GAMEPLAY);
      this.ui.refresh();
    }

    togglePause() {
      if (this.state.screen === CONFIG.SCREENS.GAMEPLAY) {
        this.state.screen = CONFIG.SCREENS.PAUSE;
        this.ui.setScreen(CONFIG.SCREENS.PAUSE);
        this.ui.refresh();
      } else if (this.state.screen === CONFIG.SCREENS.PAUSE) {
        this.resumeFromPause();
      }
    }

    toggleSound() {
      this.audio.setEnabled(!this.audio.enabled);
      this.save.setSoundOn(this.audio.enabled);
      this.ui.refresh();
    }

    toggleBattleSpeed() {
      const cycle = [1, 2, 4];
      const currentIndex = cycle.indexOf(Math.round(this.state.battleSpeed));
      const next = cycle[(currentIndex + 1) % cycle.length] || 1;
      this.state.battleSpeed = next;
      this.designer.battleSpeed = next;
      if (window.GameEntry?.current?.isDeveloper()) this.save.setDesigner(this.designer);
      else this.save.setBattleSpeed(next);
      this.ui.refresh();
    }

    toggleDebug(force) {
      if (force !== false && window.GameEntry?.current && !window.GameEntry.current.isDeveloper()) return;
      this.state.debugOpen = typeof force === "boolean" ? force : !this.state.debugOpen;
      this.refs.debugDrawer.classList.toggle("open", this.state.debugOpen);
      if (this.state.debugOpen) this.ui.loadDesignerValues();
      this.ui.refresh();
    }

    setEntryMode(mode) {
      this.toggleDebug(false);
      if (this.entryMode === "developer") this.entryDeveloperConfig = deepClone({ worm: CONFIG.WORM_TYPES, enemy: CONFIG.ENEMY_TYPES, balance: CONFIG.BALANCE });
      const config = mode === "developer" ? (this.entryDeveloperConfig || this.entryDefaults) : this.entryDefaults;
      Object.assign(CONFIG.WORM_TYPES, deepClone(config.worm));
      Object.assign(CONFIG.ENEMY_TYPES, deepClone(config.enemy));
      Object.assign(CONFIG.BALANCE, deepClone(config.balance));
      this.entryMode = mode;
      this.designer = this.normalizeDesigner(deepClone(mode === "developer" ? (this.save.data.designer || CONFIG.DEFAULT_DESIGNER) : CONFIG.DEFAULT_DESIGNER));
      this.designer.battleSpeed = this.save.data.designer?.battleSpeed || this.designer.battleSpeed;
      this.state.battleSpeed = this.designer.battleSpeed;
      this.ui.refresh();
    }

    clearPoolDragging() {
      [...this.refs.poolCards.querySelectorAll(".poolCard.dragging")].forEach((card) => card.classList.remove("dragging"));
    }

    getHintText() {
      if (this.state.screen === CONFIG.SCREENS.RESULT && this.state.result) return this.state.result.body;
      if (this.state.phase === CONFIG.PHASES.BATTLE) {
        return `⚔️ Auto-battle running. ${formatWave(this.state.levelIndex, this.state.waveIndex, this.state.totalWaves)} with ${this.state.enemies.filter((enemy) => enemy.alive).length} active enemies.`;
      }
      if (this.state.navigation.blocked) {
        return "🚫 Path blocked. Open at least one route from every entry to the core before starting the wave.";
      }
      if (this.state.rangePreview) {
        const worm = this.getWormById(this.state.rangePreview.wormId);
        const type = worm ? CONFIG.WORM_TYPES[worm.type] : null;
        return type ? `${type.icon} ${type.label}: hold preview shows the single active tower node and its range.` : "Hold a tower worm to preview range.";
      }
      const mergeReady = this.getMergeReadyMap().size;
      if (mergeReady > 0) {
        return `🧬 ${mergeReady} merge-ready worm${mergeReady > 1 ? "s" : ""}. Drag a matching worm onto its partner to grow it by one cell.`;
      }
      return this.designer.wormMoveMode === "slither"
        ? "🫳 Build phase: drag from a worm head or tail to slither the body and shape the maze without sealing every entry."
        : "Build phase: drag pool worms onto the field, merge equal worms, and build long corridors into the core.";
    }

    loop(now) {
      const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
      this.lastFrame = now;
      if (!window.GameEntry?.current?.isOpen()) this.input.update(dt);
      if (!window.GameEntry?.current?.isOpen()) this.updateVisualState(dt, now);
      if (!window.GameEntry?.current?.isOpen() && this.state.screen === CONFIG.SCREENS.GAMEPLAY && this.state.phase === CONFIG.PHASES.BATTLE) {
        this.updateBattle(dt);
      }
      this.renderer.render(now);
      requestAnimationFrame(this.loop);
    }

    updateVisualState(dt, now) {
      for (const worm of this.state.worms) {
        this.syncWormGeometry(worm, false);
        if (!worm.renderCells || worm.renderCells.length !== worm.cells.length) {
          worm.renderCells = worm.cells.map((cell) => ({ x: cell.x, y: cell.y }));
        }
        for (let i = 0; i < worm.cells.length; i++) {
          worm.renderCells[i].x = lerp(worm.renderCells[i].x, worm.cells[i].x, clamp(dt * CONFIG.BALANCE.dragSnap, 0, 1));
          worm.renderCells[i].y = lerp(worm.renderCells[i].y, worm.cells[i].y, clamp(dt * CONFIG.BALANCE.dragSnap, 0, 1));
        }
        worm.renderX = lerp(worm.renderX ?? worm.x, worm.x, clamp(dt * CONFIG.BALANCE.dragSnap, 0, 1));
        worm.renderY = lerp(worm.renderY ?? worm.y, worm.y, clamp(dt * CONFIG.BALANCE.dragSnap, 0, 1));
        worm.mergePulse = Math.max(0, (worm.mergePulse || 0) - dt);
        worm.flash = Math.max(0, (worm.flash || 0) - dt * 2.2);
      }
      for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
        const projectile = this.state.projectiles[i];
        projectile.life -= dt;
        if (projectile.life <= 0) this.state.projectiles.splice(i, 1);
      }
      for (let i = this.state.effects.length - 1; i >= 0; i--) {
        const effect = this.state.effects[i];
        effect.life -= dt;
        if (effect.life <= 0) this.state.effects.splice(i, 1);
      }
      for (let i = this.state.particles.length - 1; i >= 0; i--) {
        const particle = this.state.particles[i];
        particle.life -= dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy += particle.gravity * dt;
        if (particle.life <= 0) this.state.particles.splice(i, 1);
      }
      if (this.state.feedback.invalidUntil <= now) {
        this.state.feedback.invalidCells = [];
        this.state.feedback.invalidReason = "";
      }
      if (this.state.effects.length > CONFIG.BALANCE.maxEffects) {
        this.state.effects.splice(0, this.state.effects.length - CONFIG.BALANCE.maxEffects);
      }
      if (this.state.particles.length > CONFIG.BALANCE.maxParticles) {
        this.state.particles.splice(0, this.state.particles.length - CONFIG.BALANCE.maxParticles);
      }
    }

    getBoardShakeOffset(now) {
      if (!this.state.feedback || this.state.feedback.shakeUntil <= now) return { x: 0, y: 0 };
      const remaining = clamp((this.state.feedback.shakeUntil - now) / (CONFIG.BALANCE.invalidShakeTime * 1000), 0, 1);
      return {
        x: Math.sin(now * 0.09) * remaining * 4,
        y: Math.cos(now * 0.12) * remaining * 3
      };
    }

    clearRangePreview() {
      if (this.state.rangePreview) {
        this.state.rangePreview = null;
        this.ui.refresh();
      }
    }

    showRangePreview(wormId) {
      this.state.rangePreview = { wormId };
      this.ui.refresh();
    }

    triggerInvalidPlacement(result, fallbackReason = "Invalid placement.") {
      const reasonMap = {
        outside: "🚧 Placement must stay inside the board.",
        reserved: "🪨 That tile is reserved by a spawn, the core, or a static obstacle.",
        overlap: "🐛 That space is already occupied by another worm.",
        pathBlocked: "🚫 That placement blocks the path to the core.",
        shape: "↪️ That move would break the worm body."
      };
      const reason = reasonMap[result?.reason] || fallbackReason;
      const cells = result?.cells?.length ? result.cells : [];
      this.state.feedback = {
        invalidCells: cells,
        invalidReason: reason,
        invalidUntil: performance.now() + CONFIG.BALANCE.invalidFlashTime * 1000,
        shakeUntil: performance.now() + CONFIG.BALANCE.invalidShakeTime * 1000
      };
      this.refs.floatingHint.textContent = reason;
      this.ui.refresh();
    }

    getRefreshCost() {
      const curve = this.designer.refreshCostCurve;
      return curve[Math.min(this.state.refreshStep, curve.length - 1)] ?? this.designer.refreshCostStart;
    }

    computeGlobalWaveIndex(levelIndex, waveIndex) {
      let total = 0;
      for (let i = 0; i < levelIndex - 1; i++) total += CONFIG.CAMPAIGN_LEVELS[i].waves;
      return total + waveIndex;
    }

    addCrystals(amount) {
      this.state.crystals += amount;
      this.ui.refresh();
    }

    regenerateLevel() {
      this.applyDesignerInputs(false);
      if (this.state.screen === CONFIG.SCREENS.GAMEPLAY) this.restartLevel();
      else this.openLevelSelect();
    }

    applyDesignerInputs(regenerate) {
      try {
        const next = deepClone(this.designer);
        const readNumber = (ref, fallback) => {
          const value = Number(ref.value);
          return Number.isFinite(value) ? value : fallback;
        };
        const readJson = (ref, fallback) => {
          try {
            const parsed = JSON.parse(ref.value || "null");
            return parsed == null ? fallback : parsed;
          } catch (error) {
            return fallback;
          }
        };
        const nextEnemyStats = readJson(this.refs.dbgEnemyBaseStats, CONFIG.ENEMY_TYPES);
        const nextWormTypes = readJson(this.refs.dbgWormTypeStats, CONFIG.WORM_TYPES);
        next.totalFieldWidth = readNumber(this.refs.dbgTotalFieldWidth, next.totalFieldWidth);
        next.totalFieldHeight = readNumber(this.refs.dbgTotalFieldHeight, next.totalFieldHeight);
        next.initialPoolSize = readNumber(this.refs.dbgInitialPoolSize, next.initialPoolSize);
        next.refreshCostStart = readNumber(this.refs.dbgRefreshCostStart, next.refreshCostStart);
        next.initialWormCount = readNumber(this.refs.dbgInitialWormCount, next.initialWormCount);
        next.wormMoveMode = this.refs.dbgWormMoveMode.value.trim() || next.wormMoveMode;
        next.mergeRules = this.refs.dbgMergeRules.value.trim() || next.mergeRules;
        next.allowedWormTypes = parseStringList(this.refs.dbgAllowedWormTypes.value).filter((id) => CONFIG.WORM_TYPES[id] || nextWormTypes[id]);
        next.allowedWormSizes = parseNumberList(this.refs.dbgAllowedWormSizes.value).filter((value) => value >= 2 && value <= 4);
        const refreshCurve = readJson(this.refs.dbgRefreshCostCurve, next.refreshCostCurve);
        next.refreshCostCurve = Array.isArray(refreshCurve) ? refreshCurve : next.refreshCostCurve;
        next.bonusTileStartCount = readNumber(this.refs.dbgBonusStart, next.bonusTileStartCount);
        next.bonusTileGrowthPerWave = readNumber(this.refs.dbgBonusGrowth, next.bonusTileGrowthPerWave);
        next.allowedBonusTypes = parseStringList(this.refs.dbgAllowedBonusTypes.value).filter((id) => CONFIG.THEME.bonusTypes[id]);
        next.bonusValues = readJson(this.refs.dbgBonusValues, next.bonusValues);
        next.enemyHpMultiplier = readNumber(this.refs.dbgEnemyHpMultiplier, next.enemyHpMultiplier);
        next.enemySpeedMultiplier = readNumber(this.refs.dbgEnemySpeedMultiplier, next.enemySpeedMultiplier);
        next.enemySpawnRateMultiplier = readNumber(this.refs.dbgEnemySpawnRateMultiplier, next.enemySpawnRateMultiplier);
        next.towerDamageMultiplier = readNumber(this.refs.dbgTowerDamageMultiplier, next.towerDamageMultiplier);
        next.towerRangeMultiplier = readNumber(this.refs.dbgTowerRangeMultiplier, next.towerRangeMultiplier);
        next.towerAttackSpeedMultiplier = readNumber(this.refs.dbgTowerAttackSpeedMultiplier, next.towerAttackSpeedMultiplier);
        next.waveDurationStart = readNumber(this.refs.dbgWaveDurationStart, next.waveDurationStart);
        next.waveDurationPerWave = readNumber(this.refs.dbgWaveDurationPerWave, next.waveDurationPerWave);
        next.waveDurationCap = readNumber(this.refs.dbgWaveDurationCap, next.waveDurationCap);
        next.battleSpeed = readNumber(this.refs.dbgBattleSpeed, next.battleSpeed);
        next.seed = this.refs.dbgSeed.value.trim() || next.seed;
        next.baseCoreHp = readNumber(this.refs.dbgCoreHp, next.baseCoreHp);
        next.maxActiveEnemies = readNumber(this.refs.dbgMaxActiveEnemies, next.maxActiveEnemies);
        next.showPathDebug = this.refs.dbgShowPathDebug.checked;
        next.showPathNodes = this.refs.dbgShowPathNodes.checked;
        Object.assign(CONFIG.ENEMY_TYPES, nextEnemyStats);
        Object.assign(CONFIG.WORM_TYPES, nextWormTypes);
        this.designer = this.normalizeDesigner(next);
        this.state.battleSpeed = this.designer.battleSpeed;
        this.save.setDesigner(this.designer);
        this.pathCache.clear();
        this.ui.loadDesignerValues();
        this.renderer.resize();
        this.ui.refresh();
        if (regenerate && this.state.screen === CONFIG.SCREENS.GAMEPLAY) this.restartLevel();
      } catch (error) {
        this.refs.floatingHint.textContent = `Debug parse error: ${error.message}`;
      }
    }

    randomForScope(scope) {
      return new RNG(`${this.designer.seed}|L${this.state.levelIndex}|W${this.state.waveIndex}|${scope}|${this.state.globalWaveIndex}`);
    }

    nextId(prefix = "id") {
      this.state.nextId += 1;
      return `${prefix}_${this.state.nextId}`;
    }

    seedInitialWorms() {
      const rng = this.randomForScope("start");
      this.state.worms = [];
      let attempts = 0;
      while (this.state.worms.length < this.designer.initialWormCount && attempts < 120) {
        attempts += 1;
        const worm = this.createRandomWorm(rng, "field");
        const placed = this.placeWormRandomly(worm, rng);
        if (placed) this.state.worms.push(placed);
      }
      this.refreshWormState();
    }

    fillPool(clearExisting) {
      const rng = this.randomForScope(`pool_${this.state.refreshStep}_${this.state.waveIndex}`);
      if (clearExisting) this.state.pool = [];
      while (this.state.pool.length < this.designer.initialPoolSize) {
        this.state.pool.push(this.createRandomWorm(rng, "pool"));
      }
    }

    refreshShop() {
      if (this.state.phase !== CONFIG.PHASES.BUILD) return;
      const cost = this.getRefreshCost();
      if (this.state.crystals < cost) return;
      this.state.crystals -= cost;
      this.state.refreshStep += 1;
      this.fillPool(true);
      this.audio.ui();
      this.ui.refresh();
    }

    createRandomWorm(rng, source) {
      const type = pickWeighted(rng, this.designer.allowedWormTypes, (id) => {
        if (id === "wall") return 0.8;
        if (id === "electric") return 0.76;
        if (id === "fire" || id === "ice") return 0.88;
        return 1;
      });
      const availableSizes = this.getScaledSizeWeights(source);
      const size = pickWeighted(rng, availableSizes.length ? availableSizes : [{ size: 2, weight: 1 }], (entry) => entry.weight).size;
      return {
        id: this.nextId(source),
        type,
        size,
        x: 0,
        y: 0,
        cells: [],
        renderCells: [],
        renderX: 0,
        renderY: 0,
        seed: rng.range(0, 999),
        mergePulse: 0,
        flash: 0,
        bonuses: {},
        towerCell: null,
        combatStats: null,
        cooldown: 0
      };
    }

    getScaledSizeWeights(source) {
      const wave = Math.max(1, this.state.globalWaveIndex || 1);
      const base = [
        { size: 2, weight: 16 },
        { size: 3, weight: 3 + Math.max(0, wave - 2) * 0.7 }
      ];
      return base
        .filter((entry) => this.designer.allowedWormSizes.includes(entry.size))
        .map((entry) => ({
          size: entry.size,
          weight: source === "field" && entry.size === 2 ? entry.weight + 2 : entry.weight
        }));
    }

    placeWormRandomly(worm, rng) {
      const positions = [];
      for (let y = 0; y < this.designer.totalFieldHeight; y++) {
        for (let x = 0; x <= this.designer.totalFieldWidth - worm.size; x++) positions.push({ x, y });
      }
      rng.shuffle(positions);
      for (const pos of positions) {
        const cells = this.createLinearCells(pos.x, pos.y, worm.size);
        const validation = this.validateWormCells(cells);
        if (!validation.valid) continue;
        worm.cells = cells;
        this.syncWormGeometry(worm, true);
        return worm;
      }
      return null;
    }

    createLinearCells(x, y, size) {
      const cells = [];
      for (let i = 0; i < size; i++) cells.push({ x: x + i, y });
      return cells;
    }

    isValidWormShape(cells) {
      if (!Array.isArray(cells) || !cells.length) return false;
      const seen = new Set();
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const key = cellKey(cell.x, cell.y);
        if (seen.has(key)) return false;
        seen.add(key);
        if (i > 0 && !isOrthAdjacent(cells[i - 1], cell)) return false;
      }
      return true;
    }

    sanitizeWormCells(worm) {
      const safeSize = clamp(Number(worm.size) || 2, 2, 12);
      const fallbackX = clamp(Number(worm.x) || 0, 0, Math.max(0, this.designer.totalFieldWidth - safeSize));
      const fallbackY = clamp(Number(worm.y) || 0, 0, Math.max(0, this.designer.totalFieldHeight - 1));
      const sourceCells = Array.isArray(worm.cells) ? worm.cells : [];
      const cleaned = [];
      const seen = new Set();
      for (const cell of sourceCells) {
        if (!cell || !Number.isFinite(cell.x) || !Number.isFinite(cell.y)) continue;
        const next = {
          x: clamp(Math.round(cell.x), 0, this.designer.totalFieldWidth - 1),
          y: clamp(Math.round(cell.y), 0, this.designer.totalFieldHeight - 1)
        };
        const key = cellKey(next.x, next.y);
        if (seen.has(key)) continue;
        seen.add(key);
        cleaned.push(next);
      }
      worm.cells = this.isValidWormShape(cleaned) ? cleaned : this.createLinearCells(fallbackX, fallbackY, safeSize);
    }

    syncWormGeometry(worm, snapRender = false) {
      this.sanitizeWormCells(worm);
      worm.size = worm.cells.length;
      worm.x = Math.min(...worm.cells.map((cell) => cell.x));
      worm.y = Math.min(...worm.cells.map((cell) => cell.y));
      worm.maxX = Math.max(...worm.cells.map((cell) => cell.x));
      worm.maxY = Math.max(...worm.cells.map((cell) => cell.y));
      worm.centerX = worm.cells.reduce((sum, cell) => sum + cell.x + 0.5, 0) / worm.cells.length;
      worm.centerY = worm.cells.reduce((sum, cell) => sum + cell.y + 0.5, 0) / worm.cells.length;
      worm.towerCell = this.resolveTowerCell(worm);
      if (snapRender || !worm.renderCells || worm.renderCells.length !== worm.cells.length) {
        worm.renderCells = worm.cells.map((cell) => ({ x: cell.x, y: cell.y }));
      }
      worm.renderX = worm.x;
      worm.renderY = worm.y;
    }

    resolveTowerCell(worm) {
      const type = CONFIG.WORM_TYPES[worm.type];
      if (!type || type.role !== "tower") return null;
      if (type.towerNodeMode === "head") return worm.cells[worm.cells.length - 1];
      return worm.cells[Math.floor((worm.cells.length - 1) * 0.5)];
    }

    spawnWormInPool() {
      const rng = this.randomForScope(`manual_pool_${this.state.nextId}`);
      this.state.pool.push(this.createRandomWorm(rng, "pool"));
      this.ui.refresh();
    }

    spawnRandomWormOnField() {
      const rng = this.randomForScope(`manual_field_${this.state.nextId}`);
      const worm = this.createRandomWorm(rng, "field");
      const placed = this.placeWormRandomly(worm, rng);
      if (placed) {
        this.state.worms.push(placed);
        this.refreshWormState();
        this.recomputeEstimate();
      }
      this.ui.refresh();
    }

    getWormById(id) {
      return this.state.worms.find((worm) => worm.id === id) || null;
    }

    getWormAtCell(x, y, ignoreId = null) {
      for (const worm of this.state.worms) {
        if (ignoreId && worm.id === ignoreId) continue;
        for (const cell of worm.cells) {
          if (cell.x === x && cell.y === y) return worm;
        }
      }
      return null;
    }

    isReservedCell(x, y) {
      if (x < 0 || y < 0 || x >= this.designer.totalFieldWidth || y >= this.designer.totalFieldHeight) return true;
      if (x === this.state.core.x && y === this.state.core.y) return true;
      if (this.state.spawnPoints.some((spawn) => spawn.x === x && spawn.y === y)) return true;
      if (this.state.staticObstacles.some((cell) => cell.x === x && cell.y === y)) return true;
      return false;
    }

    buildBlockedSet(ignoreIds = new Set(), candidateCells = null) {
      const blocked = new Set(this.state.staticObstacles.map((cell) => cellKey(cell.x, cell.y)));
      for (const worm of this.state.worms) {
        if (ignoreIds.has(worm.id)) continue;
        for (const cell of worm.cells) blocked.add(cellKey(cell.x, cell.y));
      }
      if (candidateCells) {
        for (const cell of candidateCells) blocked.add(cellKey(cell.x, cell.y));
      }
      return blocked;
    }

    getNavigationSignature(blockedSet) {
      const spawnSignature = this.state.spawnPoints.map((spawn) => `${spawn.id}:${spawn.x},${spawn.y}`).join(";");
      return [
        `${this.designer.totalFieldWidth}x${this.designer.totalFieldHeight}`,
        `core:${this.state.core.x},${this.state.core.y}`,
        `spawns:${spawnSignature}`,
        `blocked:${[...blockedSet].sort().join("|")}`
      ].join("||");
    }

    findPath(start, goal, blockedSet) {
      const startKey = cellKey(start.x, start.y);
      const goalKey = cellKey(goal.x, goal.y);
      const open = [start];
      const openSet = new Set([startKey]);
      const cameFrom = new Map();
      const gScore = new Map([[startKey, 0]]);
      const fScore = new Map([[startKey, manhattan(start, goal)]]);
      while (open.length) {
        let currentIndex = 0;
        let current = open[0];
        let currentKey = cellKey(current.x, current.y);
        let currentF = fScore.get(currentKey) ?? Infinity;
        for (let i = 1; i < open.length; i++) {
          const candidate = open[i];
          const candidateKey = cellKey(candidate.x, candidate.y);
          const candidateF = fScore.get(candidateKey) ?? Infinity;
          if (candidateF < currentF) {
            currentIndex = i;
            current = candidate;
            currentKey = candidateKey;
            currentF = candidateF;
          }
        }
        if (currentKey === goalKey) {
          const path = [current];
          let walk = currentKey;
          while (cameFrom.has(walk)) {
            walk = cameFrom.get(walk);
            path.unshift(parseCellKey(walk));
          }
          return path;
        }
        open.splice(currentIndex, 1);
        openSet.delete(currentKey);
        const neighbors = [
          { x: current.x + 1, y: current.y },
          { x: current.x - 1, y: current.y },
          { x: current.x, y: current.y + 1 },
          { x: current.x, y: current.y - 1 }
        ];
        for (const neighbor of neighbors) {
          if (neighbor.x < 0 || neighbor.y < 0 || neighbor.x >= this.designer.totalFieldWidth || neighbor.y >= this.designer.totalFieldHeight) continue;
          const neighborKey = cellKey(neighbor.x, neighbor.y);
          if (neighborKey !== goalKey && blockedSet.has(neighborKey)) continue;
          const tentative = (gScore.get(currentKey) ?? Infinity) + 1;
          if (tentative >= (gScore.get(neighborKey) ?? Infinity)) continue;
          cameFrom.set(neighborKey, currentKey);
          gScore.set(neighborKey, tentative);
          fScore.set(neighborKey, tentative + manhattan(neighbor, goal));
          if (!openSet.has(neighborKey)) {
            open.push(neighbor);
            openSet.add(neighborKey);
          }
        }
      }
      return null;
    }

    computeNavigationFromBlockedSet(blockedSet) {
      const signature = this.getNavigationSignature(blockedSet);
      if (this.pathCache.has(signature)) return this.pathCache.get(signature);
      const pathsBySpawn = {};
      const lengths = [];
      const directs = [];
      const turns = [];
      let blocked = false;
      let blockedBy = "";
      for (const spawn of this.state.spawnPoints) {
        const path = this.findPath(spawn, this.state.core, blockedSet);
        if (!path) {
          blocked = true;
          blockedBy = spawn.id;
          break;
        }
        pathsBySpawn[spawn.id] = path;
        lengths.push(Math.max(0, path.length - 1));
        directs.push(manhattan(spawn, this.state.core));
        turns.push(countPathTurns(path));
      }
      const nav = {
        blocked,
        blockedBy,
        averageLength: average(lengths),
        directLength: average(directs),
        turns: average(turns),
        pathsBySpawn
      };
      this.pathCache.set(signature, nav);
      if (this.pathCache.size > 32) {
        const first = this.pathCache.keys().next();
        if (!first.done) this.pathCache.delete(first.value);
      }
      return nav;
    }

    refreshNavigation() {
      const blockedSet = this.buildBlockedSet();
      this.state.navigation = this.computeNavigationFromBlockedSet(blockedSet);
    }

    validateWormCells(cells, ignoreIds = new Set()) {
      if (!this.isValidWormShape(cells)) {
        return { valid: false, reason: "shape", cells };
      }
      const seen = new Set();
      for (const cell of cells) {
        const key = cellKey(cell.x, cell.y);
        if (seen.has(key)) return { valid: false, reason: "shape", cells };
        seen.add(key);
        if (cell.x < 0 || cell.y < 0 || cell.x >= this.designer.totalFieldWidth || cell.y >= this.designer.totalFieldHeight) {
          return { valid: false, reason: "outside", cells };
        }
        if (this.isReservedCell(cell.x, cell.y)) return { valid: false, reason: "reserved", cells };
        const occupant = this.getWormAtCell(cell.x, cell.y, null);
        if (occupant && !ignoreIds.has(occupant.id)) return { valid: false, reason: "overlap", cells };
      }
      const blockedSet = this.buildBlockedSet(ignoreIds, cells);
      const nav = this.computeNavigationFromBlockedSet(blockedSet);
      if (nav.blocked) {
        return { valid: false, reason: "pathBlocked", cells, navigation: nav };
      }
      return { valid: true, reason: "", cells, navigation: nav };
    }

    pickClosestWormEnd(worm, cell) {
      const tail = worm.cells[0];
      const head = worm.cells[worm.cells.length - 1];
      const tailDist = Math.abs((tail.x + 0.5) - (cell.x + 0.5)) + Math.abs((tail.y + 0.5) - (cell.y + 0.5));
      const headDist = Math.abs((head.x + 0.5) - (cell.x + 0.5)) + Math.abs((head.y + 0.5) - (cell.y + 0.5));
      return tailDist <= headDist ? "tail" : "head";
    }

    getSlitherDirection(wormId, activeEnd, pointerBoard) {
      const worm = this.getWormById(wormId);
      if (!worm) return null;
      const current = activeEnd === "head" ? worm.cells[worm.cells.length - 1] : worm.cells[0];
      const dirs = [
        { name: "right", x: 1, y: 0 },
        { name: "left", x: -1, y: 0 },
        { name: "down", x: 0, y: 1 },
        { name: "up", x: 0, y: -1 }
      ];
      let best = null;
      let bestDistance = Math.hypot(pointerBoard.x - (current.x + 0.5), pointerBoard.y - (current.y + 0.5));
      for (const dir of dirs) {
        const next = { x: current.x + dir.x, y: current.y + dir.y };
        if (!this.canWormStep(worm, next, activeEnd) && !this.canMergeStep(worm, next)) continue;
        const distance = Math.hypot(pointerBoard.x - (next.x + 0.5), pointerBoard.y - (next.y + 0.5));
        if (distance < bestDistance - CONFIG.BALANCE.pointerBias) {
          bestDistance = distance;
          best = dir.name;
        }
      }
      return best;
    }

    canMergeStep(worm, nextCell) {
      const occupant = this.getWormAtCell(nextCell.x, nextCell.y, worm.id);
      return !!(occupant && occupant.type === worm.type && occupant.size === worm.size);
    }

    canWormStep(worm, nextCell, activeEnd) {
      if (nextCell.x < 0 || nextCell.y < 0 || nextCell.x >= this.designer.totalFieldWidth || nextCell.y >= this.designer.totalFieldHeight) return false;
      if (this.isReservedCell(nextCell.x, nextCell.y)) return false;
      const cells = worm.cells;
      const releaseIndex = activeEnd === "head" ? 0 : cells.length - 1;
      const occupiedBySelf = cells.some((cell, index) => index !== releaseIndex && cell.x === nextCell.x && cell.y === nextCell.y);
      if (occupiedBySelf) return false;
      const occupant = this.getWormAtCell(nextCell.x, nextCell.y, worm.id);
      if (!occupant) return true;
      const releaseCell = cells[releaseIndex];
      return releaseCell.x === nextCell.x && releaseCell.y === nextCell.y;
    }

    stepSlitherWorm(wormId, direction, activeEnd) {
      const worm = this.getWormById(wormId);
      if (!worm) return false;
      const delta = {
        right: { x: 1, y: 0 },
        left: { x: -1, y: 0 },
        down: { x: 0, y: 1 },
        up: { x: 0, y: -1 }
      }[direction];
      if (!delta) return false;
      const anchor = activeEnd === "head" ? worm.cells[worm.cells.length - 1] : worm.cells[0];
      const next = { x: anchor.x + delta.x, y: anchor.y + delta.y };
      const occupant = this.getWormAtCell(next.x, next.y, worm.id);
      if (occupant && occupant.type === worm.type && occupant.size === worm.size) {
        const placement = this.findMergePlacement(worm, occupant, worm.id);
        if (placement) {
          this.applyMerge({ kind: "board", sourceId: worm.id, worm }, occupant, placement);
          return true;
        }
        this.triggerInvalidPlacement({ reason: "pathBlocked", cells: [next] }, "Merge would block the route.");
        return false;
      }
      if (!this.canWormStep(worm, next, activeEnd)) return false;
      const nextCells = activeEnd === "head"
        ? [...worm.cells.slice(1), next]
        : [next, ...worm.cells.slice(0, -1)];
      const validation = this.validateWormCells(nextCells, new Set([worm.id]));
      if (!validation.valid) {
        this.triggerInvalidPlacement(validation, "That step blocks the path.");
        return false;
      }
      worm.cells = nextCells;
      this.syncWormGeometry(worm, false);
      worm.flash = 0.18;
      this.refreshNavigation();
      this.recomputeEstimate();
      this.ui.refresh();
      return true;
    }

    getEndpointGrowthCandidates(cells) {
      const head = cells[cells.length - 1];
      const tail = cells[0];
      const headNeighbor = cells[cells.length - 2] || tail;
      const tailNeighbor = cells[1] || head;
      const headDir = { x: head.x - headNeighbor.x, y: head.y - headNeighbor.y };
      const tailDir = { x: tail.x - tailNeighbor.x, y: tail.y - tailNeighbor.y };
      const candidates = [];
      const headOptions = [
        { x: head.x + headDir.x, y: head.y + headDir.y },
        { x: head.x + 1, y: head.y },
        { x: head.x - 1, y: head.y },
        { x: head.x, y: head.y + 1 },
        { x: head.x, y: head.y - 1 }
      ];
      const tailOptions = [
        { x: tail.x + tailDir.x, y: tail.y + tailDir.y },
        { x: tail.x + 1, y: tail.y },
        { x: tail.x - 1, y: tail.y },
        { x: tail.x, y: tail.y + 1 },
        { x: tail.x, y: tail.y - 1 }
      ];
      for (const option of headOptions) {
        candidates.push({ cells: [...cells, option] });
      }
      for (const option of tailOptions) {
        candidates.push({ cells: [option, ...cells] });
      }
      return candidates;
    }

    findMergePlacement(sourceWorm, targetWorm, ignoreBoardId = null) {
      const ignore = new Set([targetWorm.id]);
      if (ignoreBoardId) ignore.add(ignoreBoardId);
      const growthCandidates = this.getEndpointGrowthCandidates(targetWorm.cells);
      for (const candidate of growthCandidates) {
        if (!this.isValidWormShape(candidate.cells)) continue;
        const validation = this.validateWormCells(candidate.cells, ignore);
        if (validation.valid) return { cells: candidate.cells };
      }
      return null;
    }

    commitDrag(drag) {
      if (!drag || this.state.phase !== CONFIG.PHASES.BUILD) return;
      const candidate = drag.candidate;
      if (!candidate) return;
      if (drag.kind === "board" && this.designer.wormMoveMode === "slither") {
        this.refreshWormState();
        this.recomputeEstimate();
        this.ui.refresh();
        return;
      }
      if (candidate.mode === "merge" && candidate.target && candidate.placement) {
        this.applyMerge(drag, candidate.target, candidate.placement);
        return;
      }
      if (candidate.mode !== "place") {
        this.triggerInvalidPlacement(candidate.validation || candidate, "Placement rejected.");
        return;
      }
      if (drag.kind === "pool") {
        const index = this.state.pool.findIndex((worm) => worm.id === drag.sourceId);
        if (index === -1) return;
        const worm = this.state.pool.splice(index, 1)[0];
        worm.cells = candidate.cells;
        this.syncWormGeometry(worm, true);
        this.state.worms.push(worm);
      } else {
        const worm = this.getWormById(drag.sourceId);
        if (!worm) return;
        worm.cells = candidate.cells;
        this.syncWormGeometry(worm, false);
      }
      this.audio.ui();
      this.refreshWormState();
      this.recomputeEstimate();
      this.ui.refresh();
    }

    applyMerge(drag, targetWorm, placement) {
      const target = this.getWormById(targetWorm.id);
      if (!target) return;
      if (drag.kind === "pool") {
        const index = this.state.pool.findIndex((worm) => worm.id === drag.sourceId);
        if (index !== -1) this.state.pool.splice(index, 1);
      } else {
        this.state.worms = this.state.worms.filter((worm) => worm.id !== drag.sourceId);
      }
      target.cells = placement.cells.map((cell) => ({ x: cell.x, y: cell.y }));
      target.size = target.cells.length;
      this.syncWormGeometry(target, false);
      target.mergePulse = CONFIG.BALANCE.mergePulseTime;
      target.flash = 0.5;
      this.audio.merge();
      this.emitBurst(target.centerX, target.centerY, CONFIG.WORM_TYPES[target.type].color, 18, 0.7);
      this.refreshWormState();
      this.recomputeEstimate();
      this.ui.refresh();
    }

    refreshWormState() {
      this.state.worms = this.state.worms.filter((worm) => worm && (worm.cells?.length || worm.size));
      for (const worm of this.state.worms) {
        this.syncWormGeometry(worm, worm.renderCells == null);
        worm.bonuses = this.computeBonusBundle(worm);
        worm.maxHp = this.computeWormMaxHp(worm);
        worm.currentHp = worm.maxHp;
        worm.combatStats = this.computeWormCombatStats(worm);
        worm.cooldown = clamp(worm.cooldown || 0, 0, 99);
      }
      this.refreshNavigation();
    }

    getMergeReadyMap() {
      const ready = new Set();
      const groups = new Map();
      for (const worm of this.state.worms) {
        const key = `${worm.type}|${worm.size}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(worm);
      }
      for (const worms of groups.values()) {
        if (worms.length < 2) continue;
        for (const worm of worms) ready.add(worm.id);
      }
      return ready;
    }

    generateBonusTiles() {
      const count = this.designer.bonusTileStartCount + (this.state.waveIndex - 1) * this.designer.bonusTileGrowthPerWave;
      const rng = this.randomForScope("bonus");
      const taken = new Set([
        cellKey(this.state.core.x, this.state.core.y),
        ...this.state.spawnPoints.map((spawn) => cellKey(spawn.x, spawn.y)),
        ...this.state.staticObstacles.map((cell) => cellKey(cell.x, cell.y)),
        ...this.state.worms.flatMap((worm) => worm.cells.map((cell) => cellKey(cell.x, cell.y)))
      ]);
      this.state.bonusTiles = [];
      let attempts = 0;
      while (this.state.bonusTiles.length < count && attempts < 500) {
        attempts += 1;
        const x = rng.int(0, this.designer.totalFieldWidth - 1);
        const y = rng.int(0, this.designer.totalFieldHeight - 1);
        const key = cellKey(x, y);
        if (taken.has(key)) continue;
        taken.add(key);
        const type = rng.pick(this.designer.allowedBonusTypes);
        this.state.bonusTiles.push({
          x,
          y,
          type,
          value: this.designer.bonusValues[type] || 0.1
        });
      }
      this.refreshWormState();
    }

    computeBonusBundle(worm) {
      const bundle = {
        range: 0,
        damage: 0,
        attackSpeed: 0
      };
      for (const cell of worm.cells) {
        for (const tile of this.state.bonusTiles) {
          if (tile.x === cell.x && tile.y === cell.y) bundle[tile.type] += tile.value;
        }
      }
      return bundle;
    }

    computeWormMaxHp(worm) {
      const type = CONFIG.WORM_TYPES[worm.type];
      return Math.round(type.baseHp * (1 + (worm.size - 2) * CONFIG.BALANCE.sizeHpStep));
    }

    computeWormCombatStats(worm) {
      const type = CONFIG.WORM_TYPES[worm.type];
      const bonuses = worm.bonuses || { range: 0, damage: 0, attackSpeed: 0 };
      const sizeFactor = Math.max(0, worm.size - 2);
      if (!type || type.role !== "tower") {
        return {
          damage: 0,
          range: 0,
          attackCooldown: Infinity,
          splashRadius: 0,
          attackStyle: "none",
          chainJumps: 0,
          chainRadius: 0,
          slowFactor: 0,
          slowDuration: 0
        };
      }
      const damageMultiplier = (1 + sizeFactor * CONFIG.BALANCE.sizeDamageStep) * (1 + bonuses.damage) * this.designer.towerDamageMultiplier;
      const rangeMultiplier = (1 + sizeFactor * CONFIG.BALANCE.sizeRangeStep + bonuses.range) * this.designer.towerRangeMultiplier;
      const attackSpeedMultiplier = clamp((1 + sizeFactor * CONFIG.BALANCE.sizeAttackSpeedStep + bonuses.attackSpeed) * this.designer.towerAttackSpeedMultiplier, 0.25, 5);
      return {
        damage: type.damage * damageMultiplier,
        range: type.range * rangeMultiplier,
        attackCooldown: type.attackCooldown / attackSpeedMultiplier,
        splashRadius: (type.splashRadius || 0) * (1 + sizeFactor * 0.04),
        attackStyle: type.attackStyle,
        projectileSpeed: type.projectileSpeed || 0,
        chainJumps: type.chainJumps || 0,
        chainRadius: type.chainRadius || CONFIG.BALANCE.defaultChainJumpRange,
        slowFactor: type.slowFactor || 0,
        slowDuration: type.slowDuration || 0
      };
    }

    computeMazeMetrics() {
      const nav = this.state.navigation;
      return {
        averageLength: nav.averageLength || 0,
        directLength: nav.directLength || 0,
        turns: nav.turns || 0
      };
    }

    computePlayerPower() {
      const maze = this.computeMazeMetrics();
      let total = 0;
      let dps = 0;
      for (const worm of this.state.worms) {
        const type = CONFIG.WORM_TYPES[worm.type];
        const stats = worm.combatStats || this.computeWormCombatStats(worm);
        let contribution = 0;
        if (type.role === "tower") {
          const baseDps = stats.damage / Math.max(0.08, stats.attackCooldown);
          let utility = 1;
          if (stats.splashRadius > 0) utility += stats.splashRadius * 0.3;
          if (stats.slowDuration > 0) utility += 0.32;
          if (stats.chainJumps > 0) utility += stats.chainJumps * 0.2;
          dps += baseDps * utility;
          contribution = baseDps * (8 + stats.range * 1.8) * utility;
        } else {
          contribution = worm.size * 7.5;
        }
        total += contribution * (type.powerWeight || 1);
      }
      const corridorFactor = 1 + clamp((maze.averageLength - maze.directLength) / Math.max(1, maze.directLength), 0, 1.5) * 0.65 + clamp(maze.turns * 0.05, 0, 0.45);
      return {
        total: total * corridorFactor,
        dps,
        corridorFactor,
        averagePathLength: maze.averageLength
      };
    }

    computeWaveTargetDuration() {
      return Math.min(this.designer.waveDurationCap, this.designer.waveDurationStart + (this.state.globalWaveIndex - 1) * this.designer.waveDurationPerWave);
    }

    computeEnemyWaveFromPlayerPower() {
      const player = this.computePlayerPower();
      const targetDuration = this.computeWaveTargetDuration();
      const rng = this.randomForScope("wave");
      const levelPressure = CONFIG.CAMPAIGN_LEVELS[this.state.levelIndex - 1]?.enemyPressure || 1;
      const hpScale = clamp((0.92 + this.state.globalWaveIndex * 0.12) * this.designer.enemyHpMultiplier * levelPressure, 0.5, 5);
      const speedScale = clamp((0.96 + this.state.globalWaveIndex * 0.02) * this.designer.enemySpeedMultiplier, 0.35, 3);
      const spawnScale = clamp(this.designer.enemySpawnRateMultiplier, 0.3, 4);
      const allowed = ["runner", "basic"];
      if (this.state.globalWaveIndex >= 2) allowed.push("swarm");
      if (this.state.globalWaveIndex >= 3) allowed.push("tank");
      const weights = {
        runner: 1.15 + this.state.globalWaveIndex * 0.04,
        basic: 1,
        swarm: this.state.globalWaveIndex >= 2 ? 0.65 + this.state.globalWaveIndex * 0.06 : 0,
        tank: this.state.globalWaveIndex >= 3 ? 0.22 + this.state.globalWaveIndex * 0.03 : 0
      };
      const budget = 24 + this.state.globalWaveIndex * 18 * levelPressure + player.total * 0.14;
      const events = [];
      let remaining = budget;
      let time = 0.35;
      let serial = 0;
      while (remaining > 4 && events.length < 160) {
        const id = pickWeighted(rng, allowed, (key) => weights[key] || 1);
        const preview = CONFIG.ENEMY_TYPES[id];
        const baseCost = preview.hp * hpScale * 0.14 + preview.speed * speedScale * 4 + preview.coreDamage * 8;
        const pack = id === "swarm" ? rng.int(3, 5) : id === "runner" ? rng.int(1, 2) : 1;
        for (let i = 0; i < pack && remaining > 2; i++) {
          const spawn = rng.pick(this.state.spawnPoints);
          events.push({
            id: this.nextId("spawn"),
            enemyType: id,
            spawnId: spawn.id,
            at: time,
            seed: serial++
          });
          time += rng.range(0.22, 0.65) / spawnScale;
          remaining -= baseCost * (id === "swarm" ? 0.42 : 0.92);
        }
        time += rng.range(0.08, 0.28) / spawnScale;
      }
      const enemyPower = budget * spawnScale * 0.9;
      return {
        targetDuration,
        enemyPower,
        playerPower: player.total,
        ratio: player.total / Math.max(1, enemyPower),
        expectedDuration: clamp(targetDuration * (enemyPower / Math.max(player.total, 1)) * 0.95, 12, this.designer.waveDurationCap),
        averagePathLength: player.averagePathLength,
        hpScale,
        speedScale,
        spawnScale,
        events: events.sort((a, b) => a.at - b.at)
      };
    }

    simulateOrEstimateBattleStrength() {
      const wave = this.computeEnemyWaveFromPlayerPower();
      return {
        playerPower: wave.playerPower,
        enemyPower: wave.enemyPower,
        ratio: wave.playerPower / Math.max(1, wave.enemyPower),
        targetDuration: wave.targetDuration,
        expectedDuration: wave.expectedDuration,
        averagePathLength: wave.averagePathLength
      };
    }

    recomputeEstimate() {
      this.state.lastEstimate = this.simulateOrEstimateBattleStrength();
      this.ui.refresh();
    }

    startBattle() {
      if (this.state.screen !== CONFIG.SCREENS.GAMEPLAY || this.state.phase !== CONFIG.PHASES.BUILD || !this.state.worms.length) return;
      if (this.state.navigation.blocked) {
        this.triggerInvalidPlacement({ reason: "pathBlocked", cells: [] }, "Open a path before starting the wave.");
        return;
      }
      this.clearRangePreview();
      this.state.phase = CONFIG.PHASES.BATTLE;
      this.state.battleTime = 0;
      this.state.enemies = [];
      this.state.projectiles = [];
      this.state.effects = [];
      this.state.particles = [];
      this.state.wavePlan = this.computeEnemyWaveFromPlayerPower();
      this.state.lastEstimate = {
        playerPower: this.state.wavePlan.playerPower,
        enemyPower: this.state.wavePlan.enemyPower,
        ratio: this.state.wavePlan.playerPower / Math.max(1, this.state.wavePlan.enemyPower),
        targetDuration: this.state.wavePlan.targetDuration,
        expectedDuration: this.state.wavePlan.expectedDuration,
        averagePathLength: this.state.wavePlan.averagePathLength
      };
      this.state.waveEventCursor = 0;
      this.prepareBattleWorms();
      this.audio.ui();
      this.ui.refresh();
    }

    prepareBattleWorms() {
      for (const worm of this.state.worms) {
        worm.bonuses = this.computeBonusBundle(worm);
        worm.maxHp = this.computeWormMaxHp(worm);
        worm.currentHp = worm.maxHp;
        worm.combatStats = this.computeWormCombatStats(worm);
        worm.cooldown = 0.24 + Math.random() * 0.2;
      }
      this.state.core.hp = this.state.core.maxHp = this.designer.baseCoreHp;
      this.state.core.alive = true;
    }

    updateBattle(dt) {
      const step = dt * this.state.battleSpeed;
      this.state.battleTime += step;
      this.spawnScheduledEnemies();
      this.updateEnemies(step);
      this.updateWormBattle(step);
      this.updateProjectiles(step);
      this.cleanupDeadEnemies();
      if (this.state.core.hp <= 0) {
        this.finishBattle(false, "The core collapsed under the wave.");
        return;
      }
      const allSpawned = this.state.waveEventCursor >= (this.state.wavePlan?.events.length || 0);
      const aliveEnemies = this.state.enemies.some((enemy) => enemy.alive);
      if (allSpawned && !aliveEnemies) {
        this.finishBattle(true, `Wave ${this.state.waveIndex} cleared.`);
      }
    }

    spawnScheduledEnemies() {
      const limit = this.designer.maxActiveEnemies;
      while (this.state.waveEventCursor < this.state.wavePlan.events.length) {
        if (this.state.enemies.filter((enemy) => enemy.alive).length >= limit) return;
        const event = this.state.wavePlan.events[this.state.waveEventCursor];
        if (event.at > this.state.battleTime) break;
        this.state.waveEventCursor += 1;
        this.spawnEnemy(event.enemyType, event.spawnId, event.seed);
      }
    }

    spawnEnemy(typeId, spawnId, seed) {
      const baseRaw = CONFIG.ENEMY_TYPES[typeId];
      const path = this.state.navigation.pathsBySpawn[spawnId];
      if (!baseRaw || !path || !path.length) return;
      const first = path[0];
      const enemy = {
        id: this.nextId("enemy"),
        type: typeId,
        label: baseRaw.label,
        icon: baseRaw.icon,
        color: baseRaw.color,
        x: first.x + 0.5,
        y: first.y + 0.5,
        hp: baseRaw.hp * this.state.wavePlan.hpScale,
        maxHp: baseRaw.hp * this.state.wavePlan.hpScale,
        baseSpeed: baseRaw.speed * this.state.wavePlan.speedScale,
        radius: baseRaw.radius,
        reward: baseRaw.reward,
        coreDamage: baseRaw.coreDamage,
        path,
        pathIndex: 1,
        slowFactor: 1,
        slowTimer: 0,
        alive: true,
        seed: seed + Math.random()
      };
      this.state.enemies.push(enemy);
      this.audio.spawn();
    }

    updateEnemies(dt) {
      for (const enemy of this.state.enemies) {
        if (!enemy.alive) continue;
        enemy.slowTimer = Math.max(0, enemy.slowTimer - dt);
        const speedMultiplier = enemy.slowTimer > 0 ? enemy.slowFactor : 1;
        const speed = enemy.baseSpeed * speedMultiplier;
        const nextNode = enemy.path[enemy.pathIndex];
        if (!nextNode) {
          this.state.core.hp = Math.max(0, this.state.core.hp - enemy.coreDamage);
          enemy.alive = false;
          this.emitBurst(enemy.x, enemy.y, enemy.color, 10, 0.36);
          continue;
        }
        const targetX = nextNode.x + 0.5;
        const targetY = nextNode.y + 0.5;
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const distance = Math.hypot(dx, dy);
        const step = speed * dt;
        if (distance <= step + 0.001) {
          enemy.x = targetX;
          enemy.y = targetY;
          enemy.pathIndex += 1;
        } else if (distance > 0) {
          enemy.x += (dx / distance) * step;
          enemy.y += (dy / distance) * step;
        }
      }
    }

    updateWormBattle(dt) {
      for (const worm of this.state.worms) {
        const type = CONFIG.WORM_TYPES[worm.type];
        if (!type || type.role !== "tower" || !worm.towerCell) continue;
        worm.cooldown = Math.max(0, worm.cooldown - dt);
        if (worm.cooldown > 0) continue;
        const stats = worm.combatStats || this.computeWormCombatStats(worm);
        const target = this.findTowerTarget(worm, stats.range);
        if (!target) {
          worm.cooldown = 0.08;
          continue;
        }
        if (stats.attackStyle === "projectile") {
          this.fireTowerProjectile(worm, target, stats);
        } else if (stats.attackStyle === "instant") {
          this.fireInstantSpike(worm, target, stats);
        } else if (stats.attackStyle === "chain") {
          this.fireChainLightning(worm, target, stats);
        }
        worm.cooldown = stats.attackCooldown;
      }
    }

    findTowerTarget(worm, range) {
      const wx = worm.towerCell.x + 0.5;
      const wy = worm.towerCell.y + 0.5;
      const rangeSq = range * range;
      let best = null;
      let bestDist = rangeSq;
      let bestProgress = -Infinity;
      for (const enemy of this.state.enemies) {
        if (!enemy.alive) continue;
        const dist = distanceSq(wx, wy, enemy.x, enemy.y);
        if (dist > rangeSq) continue;
        const progress = enemy.pathIndex + (enemy.maxHp - enemy.hp) * 0.001;
        if (dist < bestDist - 0.05 || (Math.abs(dist - bestDist) <= 0.05 && progress > bestProgress)) {
          best = enemy;
          bestDist = dist;
          bestProgress = progress;
        }
      }
      return best;
    }

    fireTowerProjectile(worm, target, stats) {
      const type = CONFIG.WORM_TYPES[worm.type];
      this.state.projectiles.push({
        id: this.nextId("proj"),
        x: worm.towerCell.x + 0.5,
        y: worm.towerCell.y + 0.5,
        targetId: target.id,
        speed: stats.projectileSpeed,
        damage: stats.damage,
        splashRadius: stats.splashRadius || 0,
        slowFactor: stats.slowFactor || 0,
        slowDuration: stats.slowDuration || 0,
        color: type.color,
        life: 3,
        maxLife: 3
      });
    }

    fireInstantSpike(worm, target, stats) {
      const fromX = worm.towerCell.x + 0.5;
      const fromY = worm.towerCell.y + 0.5;
      this.emitLineEffect(fromX, fromY, target.x, target.y, "#f0c15c", Math.max(2, this.renderer.metrics.cell * 0.08), 0.12);
      this.applyEnemyDamage(target.id, stats.damage, { splashRadius: 0, slowFactor: 0, slowDuration: 0 });
      this.audio.hit();
    }

    fireChainLightning(worm, target, stats) {
      const visited = new Set();
      let current = target;
      let originX = worm.towerCell.x + 0.5;
      let originY = worm.towerCell.y + 0.5;
      let damage = stats.damage;
      for (let jump = 0; current && jump <= stats.chainJumps; jump++) {
        visited.add(current.id);
        this.emitLineEffect(originX, originY, current.x, current.y, "#c190ff", Math.max(2, this.renderer.metrics.cell * 0.09), 0.16);
        this.applyEnemyDamage(current.id, damage, { splashRadius: 0, slowFactor: 0, slowDuration: 0 });
        originX = current.x;
        originY = current.y;
        damage *= CONFIG.BALANCE.chainFalloff;
        current = this.findChainTarget(originX, originY, stats.chainRadius, visited);
      }
      this.audio.zap();
    }

    findChainTarget(originX, originY, range, visited) {
      const rangeSq = range * range;
      let best = null;
      let bestDist = rangeSq;
      for (const enemy of this.state.enemies) {
        if (!enemy.alive || visited.has(enemy.id)) continue;
        const dist = distanceSq(originX, originY, enemy.x, enemy.y);
        if (dist < bestDist) {
          best = enemy;
          bestDist = dist;
        }
      }
      return best;
    }

    updateProjectiles(dt) {
      for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
        const projectile = this.state.projectiles[i];
        const target = this.getEnemyById(projectile.targetId);
        if (!target) {
          this.state.projectiles.splice(i, 1);
          continue;
        }
        const dx = target.x - projectile.x;
        const dy = target.y - projectile.y;
        const distance = Math.hypot(dx, dy);
        const step = projectile.speed * dt;
        if (distance <= step + CONFIG.BALANCE.projectileHitRadius) {
          this.applyEnemyDamage(target.id, projectile.damage, {
            splashRadius: projectile.splashRadius,
            slowFactor: projectile.slowFactor,
            slowDuration: projectile.slowDuration
          });
          this.emitRingEffect(target.x, target.y, projectile.splashRadius > 0 ? projectile.splashRadius : 0.45, projectile.color, 2.4, 0.18);
          this.audio.hit();
          this.state.projectiles.splice(i, 1);
          continue;
        }
        projectile.x += (dx / distance) * step;
        projectile.y += (dy / distance) * step;
      }
    }

    getEnemyById(id) {
      return this.state.enemies.find((enemy) => enemy.id === id && enemy.alive) || null;
    }

    applyEnemyDamage(targetId, amount, options) {
      const target = this.getEnemyById(targetId);
      if (!target) return;
      target.hp -= amount;
      if (options.slowFactor > 0 && options.slowDuration > 0) {
        target.slowFactor = Math.min(target.slowFactor, options.slowFactor);
        target.slowTimer = Math.max(target.slowTimer, options.slowDuration);
      }
      this.emitBurst(target.x, target.y, target.color, 6, 0.24);
      if (target.hp <= 0) {
        target.alive = false;
        this.emitBurst(target.x, target.y, "#ffd08b", 8, 0.28);
      }
      if (options.splashRadius > 0) {
        for (const enemy of this.state.enemies) {
          if (!enemy.alive || enemy.id === targetId) continue;
          if (Math.hypot(enemy.x - target.x, enemy.y - target.y) <= options.splashRadius) {
            enemy.hp -= amount * 0.55;
            if (options.slowFactor > 0 && options.slowDuration > 0) {
              enemy.slowFactor = Math.min(enemy.slowFactor, options.slowFactor);
              enemy.slowTimer = Math.max(enemy.slowTimer, options.slowDuration * 0.8);
            }
            if (enemy.hp <= 0) enemy.alive = false;
          }
        }
      }
    }

    cleanupDeadEnemies() {
      this.state.enemies = this.state.enemies.filter((enemy) => enemy.alive && enemy.hp > 0);
    }

    emitBurst(x, y, color, count, spread) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * TWO_PI;
        const speed = Math.random() * spread;
        this.state.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 0.18,
          size: Math.random() * 0.08 + 0.05,
          color,
          life: 0.32 + Math.random() * 0.26,
          maxLife: 0.58
        });
      }
    }

    emitLineEffect(x1, y1, x2, y2, color, width, life) {
      this.state.effects.push({
        type: "line",
        x1,
        y1,
        x2,
        y2,
        color,
        width,
        life,
        maxLife: life
      });
    }

    emitRingEffect(x, y, radius, color, width, life) {
      this.state.effects.push({
        type: "ring",
        x,
        y,
        radius,
        color,
        width,
        life,
        maxLife: life
      });
    }

    finishBattle(win, text) {
      if (this.state.phase !== CONFIG.PHASES.BATTLE) return;
      this.state.phase = CONFIG.PHASES.BUILD;
      this.state.enemies = [];
      this.state.projectiles = [];
      this.state.wavePlan = null;
      this.state.waveEventCursor = 0;
      if (win) {
        this.audio.win();
        const reward = this.computeWaveReward();
        this.state.crystals += reward;
        if (this.state.waveIndex >= this.state.totalWaves) {
          const unlocked = clamp(this.state.levelIndex + 1, 1, CONFIG.CAMPAIGN_LEVELS.length);
          this.save.setHighestUnlocked(unlocked);
          this.state.result = {
            win: true,
            title: this.state.levelIndex >= CONFIG.CAMPAIGN_LEVELS.length ? "Campaign Complete" : "Level Clear",
            body: `${text} Reward: ${reward} crystals. ${this.state.levelIndex >= CONFIG.CAMPAIGN_LEVELS.length ? "All six levels cleared." : "Next level unlocked."}`,
            nextLabel: this.state.levelIndex >= CONFIG.CAMPAIGN_LEVELS.length ? "Back To Menu" : "Next Level"
          };
          this.state.screen = CONFIG.SCREENS.RESULT;
          this.ui.setScreen(CONFIG.SCREENS.RESULT);
          this.ui.refresh();
          return;
        }
        this.state.waveIndex += 1;
        this.state.globalWaveIndex = this.computeGlobalWaveIndex(this.state.levelIndex, this.state.waveIndex);
        this.fillPool(true);
        this.generateBonusTiles();
        this.recomputeEstimate();
      } else {
        this.audio.lose();
        this.state.result = {
          win: false,
          title: "Defeat",
          body: text,
          nextLabel: "Retry Level"
        };
        this.state.screen = CONFIG.SCREENS.RESULT;
        this.ui.setScreen(CONFIG.SCREENS.RESULT);
      }
      this.ui.refresh();
    }

    computeWaveReward() {
      const nextCost = this.designer.refreshCostCurve[Math.min(this.state.refreshStep + 1, this.designer.refreshCostCurve.length - 1)] || this.getRefreshCost();
      return nextCost + CONFIG.BALANCE.rewardPadding + Math.round(this.state.waveIndex * 1.1);
    }

    handleResultNext() {
      if (!this.state.result) return;
      if (!this.state.result.win) {
        this.restartLevel();
        return;
      }
      if (this.state.levelIndex >= CONFIG.CAMPAIGN_LEVELS.length) {
        this.openMenu();
      } else {
        this.startLevel(this.state.levelIndex + 1);
      }
    }

    killAllEnemies() {
      for (const enemy of this.state.enemies) enemy.alive = false;
      this.ui.refresh();
    }

    forceFirstMerge() {
      const groups = new Map();
      for (const worm of this.state.worms) {
        const key = `${worm.type}|${worm.size}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(worm);
      }
      for (const worms of groups.values()) {
        if (worms.length < 2) continue;
        const [a, b] = worms;
        const placement = this.findMergePlacement(a, b, a.id);
        if (!placement) continue;
        this.applyMerge({ kind: "board", sourceId: a.id, worm: a }, b, placement);
        return;
      }
    }

    exportLevelJson() {
      const payload = {
        levelIndex: this.state.levelIndex,
        waveIndex: this.state.waveIndex,
        totalWaves: this.state.totalWaves,
        crystals: this.state.crystals,
        refreshStep: this.state.refreshStep,
        seed: this.designer.seed,
        designer: this.designer,
        core: deepClone(this.state.core),
        spawnPoints: deepClone(this.state.spawnPoints),
        staticObstacles: deepClone(this.state.staticObstacles),
        worms: this.state.worms.map((worm) => ({
          id: worm.id,
          type: worm.type,
          size: worm.size,
          cells: deepClone(worm.cells)
        })),
        pool: this.state.pool.map((worm) => ({
          id: worm.id,
          type: worm.type,
          size: worm.size
        })),
        bonusTiles: deepClone(this.state.bonusTiles)
      };
      this.refs.dbgLevelJson.value = JSON.stringify(payload, null, 2);
    }

    importLevelJson() {
      try {
        const parsed = JSON.parse(this.refs.dbgLevelJson.value.trim());
        if (parsed.designer) this.designer = this.normalizeDesigner(parsed.designer);
        this.pathCache.clear();
        this.state = this.createInitialState();
        this.state.screen = CONFIG.SCREENS.GAMEPLAY;
        this.state.levelIndex = parsed.levelIndex || 1;
        this.state.waveIndex = parsed.waveIndex || 1;
        this.state.totalWaves = parsed.totalWaves || (CONFIG.CAMPAIGN_LEVELS[this.state.levelIndex - 1]?.waves || 3);
        this.state.globalWaveIndex = this.computeGlobalWaveIndex(this.state.levelIndex, this.state.waveIndex);
        this.state.crystals = parsed.crystals || 0;
        this.state.refreshStep = parsed.refreshStep || 0;
        if (parsed.core) this.state.core = parsed.core;
        if (parsed.spawnPoints) this.state.spawnPoints = parsed.spawnPoints;
        if (parsed.staticObstacles) this.state.staticObstacles = parsed.staticObstacles;
        this.state.worms = (parsed.worms || []).map((worm) => ({
          ...worm,
          renderX: 0,
          renderY: 0,
          renderCells: [],
          seed: Math.random() * 999,
          mergePulse: 0,
          flash: 0,
          bonuses: {},
          towerCell: null,
          combatStats: null,
          cooldown: 0
        }));
        this.state.pool = (parsed.pool || []).map((worm) => ({
          ...worm,
          x: 0,
          y: 0,
          renderX: 0,
          renderY: 0,
          renderCells: [],
          seed: Math.random() * 999,
          mergePulse: 0,
          flash: 0,
          bonuses: {},
          towerCell: null,
          combatStats: null,
          cooldown: 0,
          cells: []
        }));
        this.state.bonusTiles = parsed.bonusTiles || [];
        this.save.setDesigner(this.designer);
        this.refreshWormState();
        this.recomputeEstimate();
        this.ui.setScreen(CONFIG.SCREENS.GAMEPLAY);
        this.renderer.resize();
        this.ui.refresh();
      } catch (error) {
        this.refs.floatingHint.textContent = `Import level error: ${error.message}`;
      }
    }

    exportBalanceJson() {
      const payload = {
        designer: this.designer,
        wormTypes: CONFIG.WORM_TYPES,
        enemyBaseStats: CONFIG.ENEMY_TYPES,
        balance: CONFIG.BALANCE
      };
      this.refs.dbgBalanceJson.value = JSON.stringify(payload, null, 2);
    }

    importBalanceJson() {
      try {
        const parsed = JSON.parse(this.refs.dbgBalanceJson.value.trim());
        if (parsed.designer) this.designer = this.normalizeDesigner(parsed.designer);
        if (parsed.wormTypes) Object.assign(CONFIG.WORM_TYPES, parsed.wormTypes);
        if (parsed.enemyBaseStats) Object.assign(CONFIG.ENEMY_TYPES, parsed.enemyBaseStats);
        if (parsed.balance) Object.assign(CONFIG.BALANCE, parsed.balance);
        this.save.setDesigner(this.designer);
        this.pathCache.clear();
        this.ui.loadDesignerValues();
        this.renderer.resize();
        this.ui.refresh();
      } catch (error) {
        this.refs.floatingHint.textContent = `Import balance error: ${error.message}`;
      }
    }
  }

  window.WormholdMazeMerge = new Game();
})();
