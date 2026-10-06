// 12×12 pixel-art Poké Balls for the Pokémon theme's cursor trail (src/components/Pointer.jsx).
// Each ball is the same shell with its own top colour and markings. Legend:
//   k outline   t top      h top highlight   m marking   n second marking
//   w bottom    s shade    b button          . transparent

const SHELL = [
  "....kkkk....",
  "..kkttttkk..",
  ".kthhtttttk.",
  "kthttttttttk",
  "kttttkkttttk",
  "kkkkkbbkkkkk",
  "kkkkkbbkkkkk",
  "kwwwwkkwwwwk",
  "kwwwwwwwwwsk",
  ".kwwwwwwwsk.",
  "..kksssskk..",
  "....kkkk....",
];

// Markings drawn over the shell's top half, as [row, column, key].
const MARKS = {
  poke: [],
  // Red side panels.
  great: [
    [2, 2, "m"], [2, 3, "m"], [2, 8, "m"], [2, 9, "m"],
    [3, 1, "m"], [3, 2, "m"], [3, 9, "m"], [3, 10, "m"],
    [4, 1, "m"], [4, 2, "m"], [4, 9, "m"], [4, 10, "m"],
  ],
  // The yellow H: two uprights joined by the band.
  ultra: [
    [1, 4, "m"], [2, 3, "m"], [3, 3, "m"], [4, 3, "m"],
    [1, 7, "m"], [2, 8, "m"], [3, 8, "m"], [4, 8, "m"],
  ],
  // Pink bumps either side of a white M.
  master: [
    [3, 1, "n"], [3, 2, "n"], [4, 1, "n"], [4, 2, "n"],
    [3, 9, "n"], [3, 10, "n"], [4, 9, "n"], [4, 10, "n"],
    [2, 4, "w"], [2, 7, "w"], [3, 4, "w"], [3, 5, "w"], [3, 6, "w"], [3, 7, "w"],
  ],
};

const BASE = { k: "#1E1E28", w: "#F8F8F8", s: "#B8BCCB", b: "#F8F8F8" };

const COLORS = {
  poke: { t: "#E3350D", h: "#FF9A8A" },
  great: { t: "#3A78D8", h: "#9CC2FF", m: "#E3350D" },
  ultra: { t: "#46464F", h: "#8A8A98", m: "#FFD23F" },
  master: { t: "#8A3FC8", h: "#C99BF2", n: "#F070C0" },
};

export const SPRITE_SIZE = SHELL.length;

const cache = new Map();

// The ball drawn at 1px per pixel on an offscreen canvas, ready to scale up with
// smoothing off. Unknown names fall back to the plain Poké Ball.
export function pokeballSprite(name) {
  const key = name in COLORS ? name : "poke";
  if (cache.has(key)) return cache.get(key);

  const grid = SHELL.map((row) => row.split(""));
  for (const [row, col, mark] of MARKS[key]) grid[row][col] = mark;

  const palette = { ...BASE, ...COLORS[key] };
  const canvas = document.createElement("canvas");
  canvas.width = SPRITE_SIZE;
  canvas.height = SPRITE_SIZE;
  const ctx = canvas.getContext("2d");
  grid.forEach((row, y) =>
    row.forEach((cell, x) => {
      const color = palette[cell];
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }),
  );

  cache.set(key, canvas);
  return canvas;
}
