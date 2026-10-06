// In-game text printing: a [data-dialog] box's text appears a letter at a time, with a
// beat between paragraphs, like a handheld game's dialog box. Every character keeps its
// place while hidden, so nothing reflows as it prints. The real text is in the HTML the
// whole time — search engines and no-JS visitors see it as-is, and screen readers get
// a visually hidden copy of each run of text while the animation plays.
//
// For themes with `textScroll: true`, BaseLayout marks <html data-dialog-pending> before
// first paint, which hides the boxes until this script takes over (with a CSS failsafe).

import { themes } from "../data/themes.js";
import { afterBattleIntro } from "./battle-intro.js";

const LETTER_MS = 38;
const PARAGRAPH_PAUSE_MS = 420;

function scrollText(box) {
  const release = () => delete document.documentElement.dataset.dialogPending;
  if (!box || box.dataset.scrolling) return release();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    box.dataset.scrolled = "true";
    return release();
  }

  box.dataset.scrolling = "true";
  delete box.dataset.scrolled;

  // Swap every text node for one hidden span per character, remembering the originals
  // so the box can be put back exactly as it was. Hidden elements (display: none) are
  // skipped, since they don't print.
  const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement.offsetParent === null ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  const swaps = [];
  const cells = [];
  for (const node of textNodes) {
    // The paragraph this text belongs to: the box's child that contains it.
    let block = node.parentElement;
    while (block.parentElement !== box && block !== box) block = block.parentElement;

    const group = document.createElement("span");
    const spoken = document.createElement("span");
    spoken.className = "sr-only";
    spoken.textContent = node.textContent;
    const printed = document.createElement("span");
    printed.setAttribute("aria-hidden", "true");
    group.append(spoken, printed);
    for (const char of node.textContent) {
      if (/\s/.test(char)) {
        printed.append(char);
        continue;
      }
      const cell = document.createElement("span");
      cell.className = "scroll-char";
      cell.textContent = char;
      printed.append(cell);
      cells.push({ cell, block });
    }
    node.replaceWith(group);
    swaps.push({ group, node });
  }
  release();

  let at = performance.now() + 150;
  let lastBlock = cells[0]?.block;
  for (const entry of cells) {
    if (entry.block !== lastBlock) at += PARAGRAPH_PAUSE_MS;
    lastBlock = entry.block;
    entry.showAt = at;
    at += LETTER_MS;
  }

  let next = 0;
  const frame = (now) => {
    while (next < cells.length && cells[next].showAt <= now) {
      cells[next].cell.classList.add("is-shown");
      next += 1;
    }
    if (next < cells.length) {
      requestAnimationFrame(frame);
      return;
    }

    for (const { group, node } of swaps) group.replaceWith(node);
    delete box.dataset.scrolling;
    box.dataset.scrolled = "true";
  };

  requestAnimationFrame(frame);
}

// Prints every dialog box on the page when the active theme wants it: on load, and
// again when the visitor switches into such a theme. If a battle intro is playing
// (src/scripts/battle-intro.js), the text waits and prints as the battle opens.
export function autoScrollDialogs() {
  const run = () => {
    const root = document.documentElement;
    const theme = themes.find((t) => t.id === root.dataset.theme);
    const boxes = document.querySelectorAll("[data-dialog]");
    if (!theme?.textScroll || boxes.length === 0) {
      delete root.dataset.dialogPending;
      return;
    }
    // Hide the text while waiting, so it doesn't show in full and then reprint.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.dataset.dialogPending = "";
    // Let every themechange listener run first: switching in may start a battle intro.
    setTimeout(() => afterBattleIntro().then(() => boxes.forEach(scrollText)), 0);
  };

  run();
  window.addEventListener("themechange", run);
}
