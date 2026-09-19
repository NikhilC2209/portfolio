// "Decrypting" text effect: characters cycle through random glyphs before settling on
// the real text, left to right. The real text is in the HTML the whole time — search
// engines and no-JS visitors see it as-is, and screen readers get it via aria-label
// while the animation runs.

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@*+=<>/\\";
const DURATION = 1100; // ms until the last character settles
const SHUFFLE_EVERY = 45; // ms between glyph changes on unsettled characters

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

export function decode(element) {
  if (!element || element.dataset.decoding) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  element.dataset.decoding = "true";
  element.setAttribute("aria-label", element.textContent.replace(/\s+/g, " ").trim());

  // Swap every text node for words made of one span per character, remembering the
  // originals so the element can be put back exactly as it was.
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  const swaps = [];
  const cells = [];
  for (const node of textNodes) {
    const group = document.createElement("span");
    group.setAttribute("aria-hidden", "true");
    for (const part of node.textContent.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        group.append(part);
        continue;
      }
      const word = document.createElement("span");
      word.className = "decode-word";
      for (const char of part) {
        const cell = document.createElement("span");
        cell.className = "decode-char";
        cell.textContent = char;
        word.append(cell);
        cells.push({ cell, char });
      }
      group.append(word);
    }
    node.replaceWith(group);
    swaps.push({ group, node });
  }

  // Pin each character to the width of its real glyph before scrambling.
  for (const { cell } of cells) {
    cell.style.width = `${cell.getBoundingClientRect().width}px`;
  }

  const start = performance.now();
  cells.forEach((entry, index) => {
    const order = index / Math.max(cells.length - 1, 1);
    entry.settleAt = start + DURATION * (0.2 + 0.6 * order + 0.2 * Math.random());
  });

  let lastShuffle = 0;
  const frame = (now) => {
    const shuffle = now - lastShuffle >= SHUFFLE_EVERY;
    if (shuffle) lastShuffle = now;

    let pending = 0;
    for (const entry of cells) {
      if (now >= entry.settleAt) {
        if (entry.cell.textContent !== entry.char) entry.cell.textContent = entry.char;
      } else {
        pending += 1;
        if (shuffle) entry.cell.textContent = randomGlyph();
      }
    }

    if (pending > 0) {
      requestAnimationFrame(frame);
      return;
    }

    for (const { group, node } of swaps) group.replaceWith(node);
    element.removeAttribute("aria-label");
    delete element.dataset.decoding;
  };

  requestAnimationFrame(frame);
}
