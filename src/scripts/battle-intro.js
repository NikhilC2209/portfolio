// Battle-start transition for themes with `battleIntro: true` (see src/data/themes.js),
// after the wild-encounter wipe in the handheld games: the screen flashes twice, black
// bars sweep in from alternating sides, then open like shutters onto the page.
//
// Plays on the first page of a visit — BaseLayout marks <html data-battle-intro> before
// first paint so the page's own entrance effects (the dialog text, the HP bar) hold
// until it's done — and again whenever the visitor switches into the theme. While it
// runs, <html> carries data-battle-intro; when it ends, window gets "battleintroend".

import { themes, battleIntroSessionKey } from "../data/themes.js";

const BARS = 8;
const FLASH_MS = 520;
const CLOSE_MS = 420;
const STAGGER_MS = 30;
const HOLD_MS = 200;
const OPEN_MS = 360;

let playing = false;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function play() {
  if (playing) return;
  playing = true;

  const root = document.documentElement;
  root.dataset.battleIntro = "";
  try {
    window.sessionStorage.setItem(battleIntroSessionKey, "1");
  } catch {
    // Storage blocked — it simply plays again next time.
  }

  const overlay = document.createElement("div");
  overlay.className = "battle-intro";
  overlay.setAttribute("aria-hidden", "true");
  const flash = document.createElement("div");
  flash.className = "battle-intro-flash";
  const bars = Array.from({ length: BARS }, (_, index) => {
    const bar = document.createElement("div");
    bar.className = "battle-intro-bar";
    bar.style.top = `${(index * 100) / BARS}%`;
    // A hair taller than its share so no seams show between bars.
    bar.style.height = `calc(${100 / BARS}% + 1px)`;
    bar.style.transform = `translateX(${index % 2 ? 100 : -100}%)`;
    return bar;
  });
  overlay.append(flash, ...bars);
  document.body.append(overlay);

  try {
    // Two flashes — within the three-per-second limit for flashing content. The easing
    // goes on each keyframe (hard cuts between them); on the options it would apply to
    // the whole run and hold the first frame throughout.
    const cut = (opacity) => ({ opacity, easing: "steps(1, end)" });
    await flash.animate([cut(0), cut(0.6), cut(0), cut(0.6), cut(0)], { duration: FLASH_MS }).finished;

    // Bars sweep in, even ones from the left and odd ones from the right, in the
    // choppy steps of a handheld's frame rate.
    await Promise.all(
      bars.map((bar, index) =>
        bar.animate([{ transform: bar.style.transform }, { transform: "translateX(0)" }], {
          duration: CLOSE_MS,
          delay: index * STAGGER_MS,
          easing: "steps(7, end)",
          fill: "forwards",
        }).finished,
      ),
    );

    await wait(HOLD_MS);

    // Then each bar closes up on its centre line, like shutters opening.
    await Promise.all(
      bars.map((bar) =>
        bar.animate([{ transform: "translateX(0) scaleY(1)" }, { transform: "translateX(0) scaleY(0)" }], {
          duration: OPEN_MS,
          easing: "steps(4, end)",
          fill: "forwards",
        }).finished,
      ),
    );
  } finally {
    overlay.remove();
    delete root.dataset.battleIntro;
    playing = false;
    window.dispatchEvent(new Event("battleintroend"));
  }
}

export function autoBattleIntro() {
  // First page of the visit: BaseLayout already decided.
  if ("battleIntro" in document.documentElement.dataset) play();

  window.addEventListener("themechange", () => {
    const theme = themes.find((t) => t.id === document.documentElement.dataset.theme);
    if (!theme?.battleIntro) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    play();
  });
}

// Resolves once no battle intro is playing — straight away if there isn't one.
export function afterBattleIntro() {
  if (!("battleIntro" in document.documentElement.dataset)) return Promise.resolve();
  return new Promise((resolve) => {
    window.addEventListener("battleintroend", resolve, { once: true });
    // Failsafe, should the intro script never load.
    setTimeout(resolve, 4000);
  });
}
