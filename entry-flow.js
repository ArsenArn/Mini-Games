/* Shared entry screens. Game state and rules stay with each game. */
(() => {
  "use strict";

  const illustrations = {
    plush: '<rect x="40" y="38" width="280" height="164" rx="18" fill="#302947"/><rect x="67" y="74" width="61" height="61" rx="15" fill="#f8a8bc"/><rect x="141" y="74" width="61" height="61" rx="15" fill="#f8a8bc"/><path d="M126 104h18m-8-8 8 8-8 8" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><rect x="220" y="74" width="70" height="70" rx="17" fill="#ffd47c"/><circle cx="245" cy="102" r="4" fill="#49334b"/><circle cx="267" cy="102" r="4" fill="#49334b"/><path d="M244 118q13 10 25 0" stroke="#49334b" stroke-width="3" fill="none"/>',
    snake: '<rect x="38" y="33" width="284" height="174" rx="17" fill="#183b4d"/><g fill="#fa6f79"><rect x="60" y="44" width="47" height="26" rx="6"/><rect x="114" y="44" width="47" height="26" rx="6"/><rect x="168" y="44" width="47" height="26" rx="6"/></g><path d="M76 175h48v-33h48v-31h48" fill="none" stroke="#c8ea68" stroke-width="23" stroke-linecap="round" stroke-linejoin="round"/><circle cx="256" cy="111" r="14" fill="#ffcc65"/><circle cx="222" cy="169" r="12" fill="#77d5ff"/><path d="M68 84h236" stroke="#e8f4f1" stroke-width="5" stroke-dasharray="9 9" opacity=".7"/>',
    worm: '<rect x="38" y="34" width="284" height="172" rx="17" fill="#243743"/><path d="M72 163h58v-44h45v-39h58" fill="none" stroke="#81d8bd" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/><circle cx="249" cy="80" r="20" fill="#f5d169"/><circle cx="94" cy="163" r="6" fill="#20323d"/><path d="M248 125v39h48" fill="none" stroke="#f5d169" stroke-width="8" stroke-dasharray="7 8"/><circle cx="296" cy="164" r="15" fill="none" stroke="#f5d169" stroke-width="7"/>',
    sort: '<rect x="37" y="34" width="286" height="173" rx="17" fill="#283643"/><path d="M64 161h83v28H64zm149 0h83v28h-83z" fill="#41576a"/><rect x="74" y="148" width="20" height="20" rx="3" fill="#ff8c84"/><rect x="102" y="148" width="20" height="20" rx="3" fill="#ff8c84"/><rect x="225" y="148" width="20" height="20" rx="3" fill="#7cc9ff"/><path d="M135 93h94" stroke="#f0de8a" stroke-width="23" stroke-linecap="round" stroke-dasharray="13 5"/><rect x="174" y="79" width="21" height="21" rx="3" fill="#7cc9ff"/><path d="M203 75l21 18-21 18" stroke="white" stroke-width="5" fill="none"/>',
    fortress: '<rect x="36" y="31" width="288" height="179" rx="18" fill="#293442"/><path d="M69 166h221" stroke="#627b74" stroke-width="8"/><g fill="#95dcac"><rect x="83" y="106" width="48" height="52" rx="18"/><rect x="154" y="96" width="48" height="62" rx="18"/></g><path d="M222 129h28" stroke="#ffd977" stroke-width="5"/><path d="M242 121l13 8-13 8" fill="none" stroke="#ffd977" stroke-width="5"/><rect x="264" y="100" width="35" height="59" rx="10" fill="#ef8b82"/><path d="M65 178h230" stroke="#ebc783" stroke-width="4" stroke-dasharray="9 7"/>',
    maze: '<rect x="37" y="31" width="286" height="179" rx="18" fill="#203842"/><path d="M70 70h205v30H135v29h138v29H87" fill="none" stroke="#c5d0aa" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><g fill="#78cfa9"><circle cx="143" cy="68" r="19"/><circle cx="245" cy="125" r="19"/></g><path d="M82 154l22 12-22 12z" fill="#f3a072"/><circle cx="283" cy="157" r="18" fill="#f7d36e"/><circle cx="283" cy="157" r="8" fill="#38505d"/>',
    arena: '<rect x="35" y="30" width="290" height="180" rx="18" fill="#2d344d"/><circle cx="180" cy="120" r="76" fill="none" stroke="#7c85a9" stroke-width="7"/><circle cx="111" cy="117" r="22" fill="#77dafa"/><circle cx="248" cy="117" r="22" fill="#f49c76"/><path d="M139 108l76 22" stroke="#ffd678" stroke-width="8" stroke-linecap="round"/><path d="M142 160h76" stroke="#cbd5ff" stroke-width="5" stroke-dasharray="10 8"/>',
    ball: '<rect x="36" y="31" width="288" height="180" rx="18" fill="#253746"/><path d="M76 172h207" stroke="#a5c0bd" stroke-width="9"/><path d="M175 162l35-86" stroke="#ffe083" stroke-width="8" stroke-linecap="round"/><circle cx="224" cy="70" r="18" fill="#ffb76d"/><rect x="74" y="59" width="38" height="38" rx="6" fill="#ef8e80"/><rect x="260" y="93" width="38" height="38" rx="6" fill="#9bd9e8"/><path d="M191 125q22-38 58-49" stroke="white" stroke-width="4" stroke-dasharray="6 7" fill="none"/>',
    mixer: '<rect x="36" y="31" width="288" height="180" rx="18" fill="#262d47"/><g fill="#7ed9e3"><circle cx="91" cy="94" r="22"/><circle cx="178" cy="94" r="22"/><circle cx="265" cy="94" r="22"/></g><g fill="#f0b5dd"><rect x="66" y="118" width="50" height="43" rx="17"/><rect x="153" y="118" width="50" height="43" rx="17"/><rect x="240" y="118" width="50" height="43" rx="17"/></g><path d="M73 183v-13m20 13v-26m20 26v-19m20 19v-36m20 36v-16m20 16v-33m20 33v-12m20 12v-22m20 22v-15m20 15v-29" stroke="#f8d981" stroke-width="6" stroke-linecap="round"/>',
    combo: '<rect x="35" y="30" width="290" height="181" rx="18" fill="#243746"/><path d="M71 59v120h221V59" stroke="#b6c9c7" stroke-width="8" fill="none"/><path d="M108 86l40 34-26 20" stroke="#f3b36f" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="174" cy="121" r="18" fill="#f7d776"/><circle cx="261" cy="151" r="18" fill="#8fd8ef"/><path d="M191 128q29 24 48 23" fill="none" stroke="white" stroke-width="4" stroke-dasharray="7 7"/>'
  };

  function updateNativeHints(id, platform, mode) {
    const set = (selector, value) => { const node = document.querySelector(selector); if (node) node.textContent = value; };
    if (id === "worm_link") set("#menuControlHint", platform === "mobile"
      ? "Ведите конец червя пальцем; экранные кнопки двигают, объединяют и закрывают соединения."
      : `Ведите конец мышью или стрелками/WASD. M — Merge, R — Resolve, Tab — другой червь${mode === "developer" ? ", G — редактор" : ""}.`);
    if (id === "worm_sort") set("#sortControlTag", platform === "mobile" ? "Кнопки" : "WASD");
    if (id === "weapon") set("#battleKeyHint", platform === "mobile"
      ? "Пауза — кнопка II"
      : `Space — пауза · Esc — назад/пауза${mode === "developer" ? " · ` — отладка" : ""}`);
    if (id === "bastion") set("#bastionControlHint", platform === "mobile"
      ? "Ведите палец для прицеливания и отпустите для выстрела. Есть кнопки Shoot и Collect All."
      : "Наводите мышью и кликайте по полю или Shoot. Space тоже стреляет.");
  }

  function mount(options) {
    const key = `mini_games_platform_${options.id}`;
    let platform = "pc";
    try { platform = localStorage.getItem(key) === "mobile" ? "mobile" : "pc"; } catch (_) {}
    let mode = "normal";
    let activeMode = "normal";
    let step = "platform";
    let helping = false;
    let hasStarted = false;
    document.body.dataset.entryGame = options.id;
    document.body.dataset.entryPlatform = platform;
    const root = document.createElement("div");
    root.className = "entry-flow";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", `${options.title}: начало игры`);
    const dock = document.createElement("div");
    dock.className = "entry-dock";
    dock.hidden = true;
    dock.innerHTML = '<button type="button" data-entry="help" aria-label="Открыть справку">?</button><button type="button" data-entry="menu">Меню</button>';
    document.body.append(root, dock);
    if (options.dockTarget) document.querySelector(options.dockTarget)?.append(dock);
    const normalLabel = options.normalLabel || "Обычная игра";
    const platformText = () => platform === "pc" ? options.pcInput : options.mobileInput;
    const scene = `<svg class="entry-scene" viewBox="0 0 360 240" role="img" aria-label="Схема механики игры">${illustrations[options.art] || illustrations.arena}</svg>`;

    function syncDeveloper() {
      document.body.dataset.entryMode = activeMode;
      for (const selector of options.developerSelectors || []) {
        for (const node of document.querySelectorAll(selector)) {
          node.classList.add("entry-developer-only");
          node.hidden = activeMode !== "developer";
          node.inert = activeMode !== "developer";
        }
      }
      options.onModeChange?.(activeMode);
      updateNativeHints(options.id, platform, activeMode);
    }

    function render() {
      root.hidden = false;
      dock.hidden = true;
      const back = helping || (step === "platform" && hasStarted) ? '<button class="entry-text-button" type="button" data-entry="resume">← Вернуться к игре</button>' : step === "platform" ? "" : '<button class="entry-text-button" type="button" data-entry="back">← Назад</button>';
      const title = step === "platform" ? "Где будете играть?" : step === "mode" ? "Выберите режим" : "Как играть";
      let body = "";
      if (step === "platform") {
        body = `<div class="entry-options"><button type="button" class="entry-option ${platform === "pc" ? "selected" : ""}" data-entry="pc" aria-pressed="${platform === "pc"}"><strong>ПК</strong><span>Мышь и клавиатура${options.pcDetail ? ` · ${options.pcDetail}` : ""}</span></button><button type="button" class="entry-option ${platform === "mobile" ? "selected" : ""}" data-entry="mobile" aria-pressed="${platform === "mobile"}"><strong>Мобильное устройство</strong><span>Касания и экранные кнопки${options.mobileDetail ? ` · ${options.mobileDetail}` : ""}</span></button></div><p class="entry-note">${platformText()}</p><button class="entry-primary" type="button" data-entry="next">Продолжить</button>`;
      } else if (step === "mode") {
        body = `<div class="entry-options"><button class="entry-option" type="button" data-entry="normal"><strong>${normalLabel}</strong><span>${options.normalDescription || "Основной игровой режим"}</span></button><button class="entry-option" type="button" data-entry="developer"><strong>Режим разработчика</strong><span>${options.developerDescription || "Инструменты для тестирования этой игры"}</span></button></div>`;
      } else {
        body = `<div class="entry-tutorial">${scene}<div class="entry-instructions"><div><span>Управление</span><strong>${platformText()}</strong></div><div><span>Главное действие</span><strong>${options.action}</strong></div><div><span>Цель</span><strong>${options.goal}</strong></div>${options.rule ? `<div><span>Важно</span><strong>${options.rule}</strong></div>` : ""}</div></div><button class="entry-primary" type="button" data-entry="${helping ? "resume" : "start"}">${helping ? "Вернуться к игре" : "Начать игру"}</button>`;
      }
      root.innerHTML = `<div class="entry-panel" style="--entry-accent:${options.accent || "#d5f36a"}"><div class="entry-top"><span class="entry-eyebrow">${options.title} / ${step === "platform" ? "01" : step === "mode" ? "02" : "03"}</span><a href="${options.launcher || "game_launcher.html"}">В лаунчер ↗</a></div><div class="entry-heading">${back}<h1>${title}</h1><p>${step === "platform" ? "Выбор сохранится для этой игры. Его можно изменить позже через меню." : step === "mode" ? "Игровые правила и сохранённый прогресс сохраняются." : "Короткая схема перед началом. Справку можно открыть повторно во время игры."}</p></div>${body}</div>`;
      root.querySelector(".entry-primary, .entry-option, .entry-text-button")?.focus({ preventScroll: true });
    }

    function open(startStep = "platform") {
      helping = false;
      mode = activeMode;
      step = startStep;
      render();
    }

    function startGame() {
      activeMode = mode;
      syncDeveloper();
      options.onPlatform?.(platform);
      root.hidden = true;
      dock.hidden = false;
      hasStarted = true;
      options.onStart?.(mode, platform);
    }

    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-entry]");
      if (!button) return;
      const action = button.dataset.entry;
      if (action === "back") { step = step === "tutorial" ? "mode" : "platform"; render(); }
      if (action === "pc" || action === "mobile") {
        platform = action;
        document.body.dataset.entryPlatform = platform;
        try { localStorage.setItem(key, platform); } catch (_) {}
        options.onPlatform?.(platform);
        updateNativeHints(options.id, platform, activeMode);
        render();
      }
      if (action === "next") { step = "mode"; render(); }
      if (action === "normal" || action === "developer") {
        mode = action;
        if (mode === "developer") startGame();
        else { step = "tutorial"; render(); }
      }
      if (action === "start") startGame();
      if (action === "resume") { mode = activeMode; root.hidden = true; dock.hidden = false; helping = false; }
    });
    dock.addEventListener("click", (event) => {
      const action = event.target.closest("[data-entry]")?.dataset.entry;
      if (action === "menu") open("platform");
      if (action === "help") { helping = true; step = "tutorial"; render(); }
    });
    root.addEventListener("keydown", (event) => {
      event.stopPropagation();
      if (event.key !== "Tab") return;
      const focusable = [...root.querySelectorAll("button:not([disabled]),a[href]")];
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    window.addEventListener("keydown", (event) => {
      if (activeMode === "developer" || !root.hidden || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target?.tagName || "")) return;
      if ((options.developerKeys || []).some((key) => key.toLowerCase() === event.key.toLowerCase())) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
    document.addEventListener("click", (event) => {
      if (activeMode === "developer") return;
      if (event.target.closest?.(".entry-developer-only")) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
    syncDeveloper();
    options.onOpenMenu?.();
    render();
    return { open, isDeveloper: () => activeMode === "developer", isOpen: () => !root.hidden, platform: () => platform, syncDeveloper, showHelp: () => { helping = true; step = "tutorial"; render(); } };
  }

  window.GameEntry = { mount };

  const click = (selector) => document.querySelector(selector)?.click();
  const profiles = {
    plush: {
      title: "Plush Merge Jam", art: "plush", accent: "#ffbd83", normalLabel: "Кампания", normalDescription: "12 уровней с сохранением звёзд и рекордов.", developerDescription: "Случайные уровни разных сложностей и бесконечная игра.",
      pcInput: "Перетаскивайте блоки мышью. Z — отмена, R — повтор, H — подсказка, Esc — пауза.", mobileInput: "Перетаскивайте блоки пальцем; используйте кнопки отмены, подсказки и паузы.", action: "Сдвигайте одинаковые плюшевые блоки, чтобы объединять их.", goal: "Оставьте одну фигуру нужного уровня на поле.", rule: "Сливаются только одинаковые блоки.",
      onOpenMenu: () => window.__PLUSH_MERGE_JAM__?.setState("MENU"), onStart: (mode) => { const game = window.__PLUSH_MERGE_JAM__; if (!game) return; if (mode === "normal") game.startCampaignLevel(Math.min(12, game.save.data.unlockedLevel || 1)); else game.setState("MENU"); }
    },
    snake: {
      title: "Snake Merge Defense", art: "snake", accent: "#cbed74", normalLabel: "Прохождение уровней", normalDescription: "Последовательные уровни в одном оборонительном забеге.", developerDescription: "Настройка поля, орбов, волн и бесконечный режим.",
      pcInput: "Удерживайте кнопку мыши и ведите ближайший конец змеи. Esc/P — пауза, M — звук.", mobileInput: "Удерживайте палец на поле и ведите ближайший конец змеи; Pause и Sound — в HUD.", action: "Собирайте цветные орбы обоими концами змеи.", goal: "Разрушайте подходящие блоки до переполнения полос и берегите стену.", rule: "Цвет сегментов нужно совмещать с колонками у стены.",
      developerKeys: [], developerSelectors: ["#menuSettingsOpenButton", "#menuMobileSettingsSheet", "#menuScreen .settingsBoard", "#pauseScreen .debugCard", "#menuScreen [data-mode='endless']", "#changeLayoutButton"],
      onPlatform: (platform) => click(platform === "pc" ? "#layoutDesktopButton" : "#layoutMobileButton"),
      onModeChange: (mode) => window.SnakeMergeDefense?.setEntryMode(mode),
      onOpenMenu: () => window.SnakeMergeDefense?.openLayoutMenu(),
      onStart: (mode) => { click("#layoutContinueButton"); if (mode === "normal") { click("#menuScreen [data-mode='levels']"); click("#startButton"); } }
    },
    worm_link: {
      title: "Worm Link Merge", art: "worm", accent: "#8ce4ba", normalLabel: "Кампания", normalDescription: "Последовательные доски с трубами и квестами.", developerDescription: "Редактор доски, seed, генерация и JSON.",
      pcInput: "Ведите конец червя мышью или стрелками/WASD. M — Merge, R — Resolve, Tab — другой червь.", mobileInput: "Ведите конец червя пальцем; используйте экранные стрелки, Merge и Resolve.", action: "Подведите концы червей к подходящим трубам и соедините пары.", goal: "Выполните задания по трубам на доске.", rule: "Пульсирующих совпадающих червей можно объединять; Resolve завершает готовые соединения.",
      developerKeys: ["g"], developerSelectors: ["#designerOpenButton", "#designerOpenButtonDesktop", "#menuDesignerButton", "#pauseDesignerButton", "#designerDrawer", "#menuSeedField", "#seedSignal", "#editModeSignal"],
      onOpenMenu: () => window.WormLinkMerge?.showScreen("menu"),
      onModeChange: (mode) => window.WormLinkMerge?.setEntryMode?.(mode),
      onStart: (mode) => { const game = window.WormLinkMerge; if (!game) return; game.startLevelFromMenu(); if (mode === "developer") game.toggleDesigner(true); }
    },
    worm_place: {
      title: "Worm Place Puzzle", art: "worm", accent: "#a5e59e", normalLabel: "Кампания", normalDescription: "100 досок с сохранённым прогрессом.", developerDescription: "Песочница, генератор, seed и JSON доски.",
      pcInput: "Тяните конец червя мышью или используйте стрелки/WASD; Tab и Q/E меняют выбор.", mobileInput: "Тяните конец червя пальцем или используйте экранные стрелки и Head/Tail.", action: "Укладывайте червей вдоль отмеченных для них маршрутов.", goal: "Разместите всех червей на подходящих путях.", rule: "Цвет и путь каждого червя должны совпасть с целью.",
      developerKeys: ["g"], developerSelectors: ["#debugButton", "#designerDrawer", "#sandboxMenuPanel"],
      onOpenMenu: () => window.WormPlacePuzzle?.openMenu(),
      onModeChange: (mode) => { if (mode === "normal") window.WormPlacePuzzle?.toggleDesigner(false); },
      onStart: (mode) => { if (mode === "normal") document.getElementById("campaignLevelInput").value = document.getElementById("menuUnlocked").textContent.trim(); click(mode === "developer" ? "#sandboxDesignerButton" : "#campaignButton"); }
    },
    worm_sort: {
      title: "Worm Sort", art: "sort", accent: "#f0db8a", launcher: "../game_launcher.html", normalLabel: "Кампания", normalDescription: "100 досок и сохранение открытого уровня.", developerDescription: "Песочница, генератор, правила и JSON.",
      pcInput: "Ведите червя мышью или стрелками/WASD; Tab и Q/E меняют выбор. Нажмите контейнер для выдачи блока.", mobileInput: "Ведите червя пальцем или экранными стрелками; нажмите контейнер для выдачи блока.", action: "Переносите цветные блоки нейтральными червями.", goal: "Соберите в каждом контейнере блоки одного цвета.", rule: "Выдавайте блоки из контейнеров по одному и планируйте порядок переноса.",
      developerKeys: ["g"], developerSelectors: ["#debugButton", "#designerPanel", "#boardStatusCard", "#sandboxMenuChoice"],
      onOpenMenu: () => window.WormSort?.showMenu(),
      onModeChange: (mode) => { if (mode === "normal" && window.WormSort?.state.designerOpen) window.WormSort.toggleDesigner(); },
      onStart: (mode) => { if (mode === "normal") document.getElementById("campaignLevelInput").value = document.getElementById("menuUnlocked").textContent.trim(); click(mode === "developer" ? "#sandboxButton" : "#campaignButton"); if (mode === "developer" && !window.WormSort?.state.designerOpen) click("#debugButton"); }
    },
    fortress: {
      title: "Wormhold Merge", art: "fortress", accent: "#9cddab", normalLabel: "Кампания", normalDescription: "Шесть уровней с открытием по прогрессу.", developerDescription: "Настройки баланса, генерация, тестовые действия и JSON.",
      pcInput: "Перетаскивайте червей мышью; Space начинает бой, Esc ставит паузу.", mobileInput: "Перетаскивайте червей пальцем из пула на базу; Battle и Pause — экранные кнопки.", action: "Размещайте защитников и объединяйте одинаковых червей.", goal: "Защитите ядро от каждой волны.", rule: "Сначала настройте команду в фазе сборки, затем нажмите Battle.",
      developerKeys: ["d"], developerSelectors: ["#debugButton", "#menuSandboxButton", "#levelDebugButton", "#pauseDebugButton", "#resultDebugButton", "#debugDrawer"],
      onOpenMenu: () => window.WormholdMerge?.openMenu(), onModeChange: (mode) => window.WormholdMerge?.setEntryMode?.(mode),
      onStart: (mode) => { const game = window.WormholdMerge; game?.openLevelSelect(); if (mode === "developer") game?.toggleDebug(true); }
    },
    maze: {
      title: "Wormhold Maze Merge", art: "maze", accent: "#8ed9c5", normalLabel: "Кампания", normalDescription: "Шесть уровней защиты ядра и построения маршрута.", developerDescription: "Настройки пути и баланса, тестовые действия и JSON.",
      pcInput: "Перетаскивайте червей мышью; Space начинает бой, Esc ставит паузу.", mobileInput: "Перетаскивайте червей пальцем из пула; Battle и Pause — экранные кнопки.", action: "Разместите и объедините червей, формируя путь врагов.", goal: "Проведите врагов по открытому пути и защитите ядро.", rule: "Размещение не должно перекрыть все пути к ядру.",
      developerKeys: ["d"], developerSelectors: ["#debugButton", "#menuSandboxButton", "#levelDebugButton", "#pauseDebugButton", "#resultDebugButton", "#debugDrawer"],
      onOpenMenu: () => window.WormholdMazeMerge?.openMenu(), onModeChange: (mode) => window.WormholdMazeMerge?.setEntryMode?.(mode),
      onStart: (mode) => { const game = window.WormholdMazeMerge; game?.openLevelSelect(); if (mode === "developer") game?.toggleDebug(true); }
    },
    weapon: {
      title: "Weapon Arena", art: "arena", accent: "#87def9", normalLabel: "Кампания", normalDescription: "Десять автоматических боёв с выбором бойца и улучшений.", developerDescription: "Турнир и отладка боя: скорость, баланс и быстрый результат.",
      pcInput: "Выбирайте бойца и улучшения мышью; Space — пауза, Esc — назад или пауза.", mobileInput: "Выбирайте бойца и улучшения касанием карточек; пауза — экранная кнопка.", action: "Подберите бойца к угрозе и выбирайте улучшения после побед.", goal: "Пройдите десять уровней кампании.", rule: "Бои автоматические: тактика находится в выборе бойцов и улучшений.",
      developerKeys: ["`"], developerSelectors: ["#debugBtn", "#debugPanel", "#modeTournament", "#resetProgressBtn"],
      onOpenMenu: () => window.WeaponArenaUI?.showMain(), onModeChange: (mode) => window.WeaponArenaUI?.setEntryMode(mode),
      onStart: (mode) => { window.WeaponArenaUI?.showMain(); if (mode === "normal") { click("#modeCampaign"); click("#startModeBtn"); } }
    },
    oddities: {
      title: "Arena Oddities", art: "arena", accent: "#8de0eb", normalLabel: "Кампания", normalDescription: "Десять волн на выбранной арене.", developerDescription: "Турнир и отладка боя: хитбоксы, скорость, баланс и результат.",
      pcInput: "Выбирайте арену, бойца и улучшения мышью; Esc — пауза.", mobileInput: "Выбирайте арену, бойца и улучшения касанием; пауза — экранная кнопка.", action: "Выберите форму арены и бойца с подходящей способностью.", goal: "Пройдите десять волн кампании.", rule: "Бой автоматический; форма арены меняет отражения и давление на бойцов.",
      developerKeys: ["`"], developerSelectors: ["#debugBtn", "#debugPanel"],
      onOpenMenu: () => window.ArenaOdditiesUI?.showMain(), onModeChange: (mode) => window.ArenaOdditiesUI?.setEntryMode(mode),
      onStart: (mode) => { window.ArenaOdditiesUI?.showMain(); if (mode === "normal") window.ArenaOdditiesUI?.startCampaign(); }
    },
    bastion: {
      title: "Ball Bastion", art: "ball", accent: "#ffd482", normalLabel: "Оборонительный забег", normalDescription: "Трёхминутная защита с постоянными улучшениями за золото.", developerDescription: "Отладочная статистика, тестовое золото и сброс сохранения.",
      pcInput: "Наводите мышью и кликайте по полю или Shoot; Space стреляет.", mobileInput: "Ведите палец для прицеливания и отпустите для выстрела; есть Shoot и Collect All.", action: "Запускайте шары разных типов и собирайте их обратно.", goal: "Удержите стену в течение трёх минут.", rule: "После повышения уровня выберите одно улучшение забега.",
      developerKeys: ["d"], developerSelectors: ["#addGoldBtn", "#debugToggle", "#resetSaveBtn"],
      onOpenMenu: () => window.BallBastionUI?.openMeta(), onModeChange: (mode) => window.BallBastionUI?.setEntryMode(mode),
      onStart: () => window.BallBastionUI?.openMeta()
    },
    mixer: {
      title: "Loop Crew Mixer", art: "mixer", accent: "#89e3ed", normalLabel: "Создать микс", normalDescription: "Свободное смешивание звуков без кампании и уровней.", developerDescription: "Диагностика загрузки MP3, синхронизации и очереди лупов.",
      launcher: "../game_launcher.html", dockTarget: ".titleRow", pcInput: "Нажмите Play, выберите звук мышью и назначьте его слоту; Enter/Space активируют выбранный слот.", mobileInput: "Нажмите Play, коснитесь звука и затем исполнителя; кнопка On/Off отключает слой.", action: "Назначайте музыкальные лупы исполнителям.", goal: "Соберите синхронный многослойный микс.", rule: "Новые лупы вступают на следующей границе цикла.",
      onOpenMenu: () => click("#stopBtn"), onModeChange: (mode) => window.LoopCrewMixerUI?.setEntryMode(mode), onStart: () => {}
    },
    combo: {
      title: "Combo Drop Lab", art: "combo", accent: "#f4c478", normalLabel: "Сборка и дроп", normalDescription: "Стройте цепную реакцию и улучшайте рекорд.", developerDescription: "Тестовое начисление монет и сброс сохранённой схемы.",
      dockTarget: ".headRow",
      pcInput: "Покупайте устройства кликом, размещайте и перетаскивайте мышью; Rotate и DROP — кнопки.", mobileInput: "Выберите устройство касанием, разместите на арене и перетаскивайте; Rotate и DROP — кнопки.", action: "Расставьте пружины, пушки, бамперы и умножающие ворота.", goal: "Запустите машину и соберите максимальное комбо.", rule: "После результата вернитесь к сборке, сохранив размещённые устройства.",
      developerSelectors: ["#debugCoinsBtn", "#resetBtn"], onModeChange: (mode) => window.ComboDropLabUI?.setEntryMode(mode), onStart: () => {}
    }
  };

  const gameId = document.currentScript?.dataset.entryGame;
  if (gameId && profiles[gameId]) {
    const begin = () => { window.GameEntry.current = mount({ id: gameId, ...profiles[gameId] }); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", begin, { once: true });
    else begin();
  }
})();
