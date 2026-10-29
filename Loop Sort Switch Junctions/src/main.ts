import { levels } from "./levels";
import { Simulation } from "./simulation";
import { Renderer } from "./renderer";
import { FrameClock } from "./frameClock";
import { BoardLayout, CONTAINER_SIZE } from "./boardLayout";
import "./style.css";
const $ = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;
document.querySelector("#app")!.innerHTML = `
<main>
 <header><a href="./" class="brand">loop<span>lab</span><b>↗</b></a><span class="eyebrow">SWITCH JUNCTIONS</span><button id="manualQuick" hidden>↗ Turn</button><button id="labOpen" aria-haspopup="dialog">? Rules & Lab</button></header>
 <section class="game">
  <div class="hud">
   <div class="level-picker" id="levelPicker"><h1><button id="levelTrigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="levelMenu"><span class="level-caption eyebrow"><span>Level selection</span><span id="levelId"></span></span><span class="level-titleline"><span id="levelName"></span><span class="caret" aria-hidden="true">▾</span></span></button></h1>
    <div id="levelMenu" role="listbox" aria-label="Choose a level" hidden>${levels.map((level, i) => `<button type="button" data-level="${i}" role="option" aria-selected="false"><span>${String(level.id).padStart(2, "0")} · ${level.name}</span><small>${level.difficulty}</small></button>`).join("")}</div>
   </div>
   <div class="beltCounter"><b id="capacity"></b><small>ON THE BELT</small></div>
  </div>
  <p id="goal"></p>
  <div id="playArea"><div id="board"><canvas width="420" height="640" aria-label="Two connected conveyor loops and sorting containers"></canvas><div id="containers"></div><div id="overlay" role="status"></div></div></div>
  <div class="statusrow"><span id="route"></span><span id="progress"></span><span id="actions"></span></div><p id="message" aria-live="polite"></p>
 </section>
 <div class="toolbar"><button id="pause">Ⅱ Pause</button><button id="restart">↻ Restart</button><div class="speeds">${[1, 2, 4].map((speed) => `<button data-speed="${speed}" aria-label="Speed ${speed} times">×${speed}</button>`).join("")}</div></div>
</main>
<dialog id="labDialog" aria-labelledby="labTitle"><div class="dialoghead"><h2 id="labTitle">How to play & lab</h2><button id="labClose" aria-label="Close rules and lab">✕</button></div>
 <p>Tap a container to release one block. The white outline marks its accessible end. Moving blocks enter an empty container, or one with a matching end color and space. A full, single-color container locks.</p>
 <p>In AUTO, every successful release turns both red arrows. Any block reaching a junction follows its selected exit. Collection does not turn the arrows. The branch highlight marks a route, not a block color.</p>
 <p>Wait for blocks to return, or release another to redirect them. Blocks can return to their original container. There is no time limit. Lock every container and empty the belt to win.</p>
 <div class="debugControls"><label>Mode <select id="mode"><option>AUTO</option><option>MANUAL</option></select></label><label><input id="debug" type="checkbox"> Show paths & nodes</label><button id="manualSwitch" hidden>Turn arrows ↗</button></div>
 <p class="note">MANUAL allows unlimited turns for comparison. Every level is verified in AUTO. Blocks keep a safe gap and wait at busy junctions. Belt capacity counts individual blocks.</p><pre id="debugText"></pre>
</dialog>`;
let selected = 0,
  sim = new Simulation(levels[0]),
  paused = false,
  speed = 1,
  debug = false;
const canvas = document.querySelector("canvas")!;
let renderer = new Renderer(canvas.getContext("2d")!);
function load(index: number) {
  closeMenu();
  selected = index;
  const mode = sim.mode;
  sim = new Simulation(levels[index]);
  sim.mode = mode;
  paused = false;
  renderer = new Renderer(canvas.getContext("2d")!);
  const layout = new BoardLayout(sim.level);
  $("levelId").textContent = `LEVEL / ${String(index + 1).padStart(2, "0")}`;
  $("levelName").textContent = sim.level.name;
  $("goal").textContent = sim.level.description;
  $("containers").innerHTML = sim.containers
    .map(
      (box, i) =>
        `<button class="container-hit" data-container="${i}" style="left:${((layout.containers.get(box.id)!.x - CONTAINER_SIZE.width / 2 - 6) / 420) * 100}%;top:${((layout.containers.get(box.id)!.y - CONTAINER_SIZE.height / 2 - 6) / 640) * 100}%;width:${((CONTAINER_SIZE.width + 12) / 420) * 100}%;height:${((CONTAINER_SIZE.height + 12) / 640) * 100}%"></button>`,
    )
    .join("");
  document.querySelectorAll<HTMLButtonElement>("[data-container]").forEach(
    (b) =>
      (b.onclick = () => {
        if (!paused) {
          sim.release(Number(b.dataset.container));
          sync();
        }
      }),
  );
  sync();
  // Paint the initial scene without waiting for the first animation callback.
  renderer.draw(sim, 0, debug);
}
let overlayState = "";
function sync() {
  document.querySelectorAll<HTMLButtonElement>("[data-level]").forEach((b) => {
    b.classList.toggle("active", Number(b.dataset.level) === selected);
    b.setAttribute(
      "aria-selected",
      String(Number(b.dataset.level) === selected),
    );
  });
  document
    .querySelectorAll<HTMLButtonElement>("[data-speed]")
    .forEach((b) =>
      b.classList.toggle("active", Number(b.dataset.speed) === speed),
    );
  $("capacity").textContent = `${sim.blocks.length} / ${sim.level.capacity}`;
  $("capacity").classList.toggle(
    "full",
    sim.blocks.length === sim.level.capacity,
  );
  $("progress").textContent =
    `Locked ${sim.completed}/${sim.containers.length}`;
  $("actions").textContent = `Moves: ${sim.actions}`;
  $("route").textContent =
    sim.route === "GREEN" ? "● Green route" : "● Yellow route";
  $("route").className = sim.route.toLowerCase();
  $("message").textContent =
    sim.lastMessage || "Tap a container. Fill every stack with one color.";
  $("pause").textContent = paused ? "▶ Resume" : "Ⅱ Pause";
  $("manualSwitch").hidden = sim.mode !== "MANUAL";
  $("manualQuick").hidden = sim.mode !== "MANUAL";
  document
    .querySelector("header")!
    .classList.toggle("manual", sim.mode === "MANUAL");
  ($("manualQuick") as HTMLButtonElement).disabled = paused || sim.won;
  ($("manualSwitch") as HTMLButtonElement).disabled = paused || sim.won;
  document
    .querySelectorAll<HTMLButtonElement>("[data-container]")
    .forEach((b, i) => {
      const box = sim.containers[i];
      b.disabled =
        paused ||
        box.isCompleted ||
        !box.orderedBlocks.length ||
        sim.blocks.length >= sim.level.capacity;
      b.setAttribute(
        "aria-label",
        `Container ${i + 1}, ${box.isCompleted ? "locked" : `${box.orderedBlocks.length} of ${box.capacity} blocks, accessible ${box.orderedBlocks[0] || "empty"}`}`,
      );
      b.title = box.isCompleted
        ? "Complete and locked"
        : box.orderedBlocks.length
          ? sim.canRelease(i)
            ? "Release one block"
            : "Waiting for a gap at the entry"
          : "Empty — accepts any color";
    });
  const state = sim.won
    ? "won"
    : paused
      ? "paused"
      : sim.stalled
        ? "stalled"
        : "";
  if (state !== overlayState || (!$("overlay").childElementCount && state)) {
    overlayState = state;
    $("overlay").innerHTML =
      state === "won"
        ? `<div class="win"><small>ALL CONTAINERS SORTED</small><h2>All sorted!</h2><p>${sim.actions} releases · ${sim.mode}</p><button id="next">${selected < levels.length - 1 ? "Next level →" : "Play again ↻"}</button></div>`
        : state === "paused"
          ? '<div class="toast">Ⅱ Pause</div>'
          : state === "stalled"
            ? '<div class="toast">Belt full with no available collection.<br>Restart, or compare in MANUAL.</div>'
            : "";
    const next = document.getElementById("next");
    if (next) next.onclick = () => load((selected + 1) % levels.length);
  }
  $("debugText").textContent = debug
    ? `${sim.route} / ${sim.mode}\n${sim.junctions.map((j) => `${j.id}: ${j.incoming.join(", ")} → ${j.selectedOutgoingRoute}`).join("\n")}\n${sim.blocks.map((b) => `#${b.id} ${b.color}: ${b.segment} @ ${b.distance.toFixed(1)} | v=${paused ? "0.0" : (renderer.measuredSpeeds.get(b.id)?.toFixed(1) ?? "—")} u/s (${(((paused ? 0 : (renderer.measuredSpeeds.get(b.id) ?? 0)) * speed * canvas.getBoundingClientRect().width) / 420).toFixed(1)} screen px/s)`).join("\n")}\n${sim.containers.map((c) => `${c.id}: [${c.orderedBlocks.join(", ")}] ${c.isCompleted ? "CLOSED" : ""}`).join("\n")}\nColor totals: ${JSON.stringify(sim.colorCounts())}`
    : "";
}
$("restart").onclick = () => load(selected);
$("pause").onclick = () => {
  paused = !paused;
  sync();
};
function manualTurn() {
  if (!paused && !sim.won) {
    sim.toggle();
    sync();
  }
}
$("manualSwitch").onclick = manualTurn;
$("manualQuick").onclick = manualTurn;
($("mode") as HTMLSelectElement).onchange = (e) => {
  sim.mode = (e.target as HTMLSelectElement).value as "AUTO" | "MANUAL";
  sync();
};
($("debug") as HTMLInputElement).onchange = (e) => {
  debug = (e.target as HTMLInputElement).checked;
  sync();
};
document.querySelectorAll<HTMLButtonElement>("[data-level]").forEach(
  (b) =>
    (b.onclick = () => {
      load(Number(b.dataset.level));
      closeMenu(true);
    }),
);
document.querySelectorAll<HTMLButtonElement>("[data-speed]").forEach(
  (b) =>
    (b.onclick = () => {
      speed = Number(b.dataset.speed);
      sync();
    }),
);
const levelMenu = $<HTMLDivElement>("levelMenu"),
  levelTrigger = $<HTMLButtonElement>("levelTrigger");
function closeMenu(returnFocus = false) {
  $("levelMenu").hidden = true;
  $("levelTrigger").setAttribute("aria-expanded", "false");
  if (returnFocus) $("levelTrigger").focus();
}
function openMenu() {
  levelMenu.hidden = false;
  levelTrigger.setAttribute("aria-expanded", "true");
  const current = levelMenu.querySelector<HTMLButtonElement>(
    `[data-level="${selected}"]`,
  )!;
  current.focus();
  current.scrollIntoView({ block: "nearest" });
}
levelTrigger.onclick = () => (levelMenu.hidden ? openMenu() : closeMenu());
levelTrigger.onkeydown = (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    openMenu();
  }
};
levelMenu.onkeydown = (event) => {
  const buttons = Array.from(
      levelMenu.querySelectorAll<HTMLButtonElement>("[data-level]"),
    ),
    index = buttons.indexOf(document.activeElement as HTMLButtonElement);
  let next = index;
  if (event.key === "ArrowDown") next = (index + 1) % buttons.length;
  else if (event.key === "ArrowUp")
    next = (index - 1 + buttons.length) % buttons.length;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = buttons.length - 1;
  else return;
  event.preventDefault();
  buttons[next].focus();
};
document.addEventListener("pointerdown", (event) => {
  if (!$("levelPicker").contains(event.target as Node)) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !levelMenu.hidden) {
    event.preventDefault();
    closeMenu(true);
  }
});
const lab = $<HTMLDialogElement>("labDialog");
$("labOpen").onclick = () => {
  closeMenu();
  lab.showModal();
};
$("labClose").onclick = () => lab.close();
lab.addEventListener("click", (event) => {
  if (event.target === lab) {
    const r = lab.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      lab.close();
  }
});
// Size the board from the remaining viewport, keeping canvas and hit areas in
// the same 420×640 coordinate system at every size and safe-area inset.
function fitBoard() {
  const area = $("playArea"),
    width = Math.min(area.clientWidth, (area.clientHeight * 420) / 640);
  $("board").style.width = `${width}px`;
  $("board").style.height = `${(width * 640) / 420}px`;
}
new ResizeObserver(fitBoard).observe($("playArea"));
window.visualViewport?.addEventListener("resize", fitBoard);
// Diagnostics expose the actual simulation; game decisions never consult a solver.
Object.assign(window, {
  loopLab: {
    get simulation() {
      return sim;
    },
    get paused() {
      return paused;
    },
  },
});
const frameClock = new FrameClock();
let tick = 0;
document.addEventListener("visibilitychange", () => {
  frameClock.reset();
});
function frame(now: number) {
  const dt = frameClock.tick(now);
  if (!paused && !sim.won) sim.step(dt * speed);
  renderer.draw(sim, paused ? 0 : dt, debug);
  if (++tick % 4 === 0) sync();
  requestAnimationFrame(frame);
}
load(0);
fitBoard();
requestAnimationFrame(frame);
