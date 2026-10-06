"""Generate the pixel-art backdrop for the Pokémon theme: a night-time route.

Writes these files to public/pokemon/, each a small SVG drawn on a pixel grid (the CSS
scales them up with crisp edges, see src/styles/themes/pokemon.css):

    tall-grass.svg   strip of tall grass along the bottom of the window (tiles in x)
    trees.svg        two rows of pine trees behind the grass (tiles in x)
    mountains.svg    two mountain ranges on the horizon (tiles in x)
    stars-dim.svg    faint stars that stay put (tiles in x and y)
    stars-mid.svg    brighter stars, twinkled by the CSS as a layer
    stars-bright.svg the brightest stars and a few four-point sparkles
    moon.svg         full moon with craters
    cloud.svg        a night cloud with a moonlit top edge
    grass-tuft.svg   a patch of tall grass that rustles now and then

Everything is seeded, so re-running it reproduces the same art. Standard library only:

    python3 scripts/pokemon-scenery.py
"""

import math
import random
from collections import defaultdict
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "pokemon"


def to_svg(width, height, pixels):
    """pixels maps (x, y) -> colour. Each colour becomes one path of horizontal runs."""
    runs = defaultdict(list)
    for y in range(height):
        x = 0
        while x < width:
            colour = pixels.get((x, y))
            if colour is None:
                x += 1
                continue
            end = x
            while pixels.get((end + 1, y)) == colour:
                end += 1
            length = end - x + 1
            runs[colour].append(f"M{x} {y}h{length}v1h-{length}z")
            x = end + 1
    paths = "".join(f"<path fill='{c}' d='{''.join(d)}'/>" for c, d in runs.items())
    return (
        f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {width} {height}' "
        f"width='{width}' height='{height}' shape-rendering='crispEdges'>{paths}</svg>"
    )


def column(pixels, x, top, bottom, colour):
    for y in range(top, bottom):
        pixels[(x, y)] = colour


def tall_grass():
    rng = random.Random(151)
    w, h = 48, 14
    px = {}
    # Back layer: a blade in every column, alternating tall and short.
    for x in range(w):
        height = rng.randint(7, 13) if x % 2 == 0 else rng.randint(4, 8)
        column(px, x, h - height, h, "#1B3F33")
    # Front layer: lighter tufts of three blades, the tallest tipped with a highlight.
    x = 1
    while x < w - 2:
        height = rng.randint(3, 7)
        column(px, x, h - height, h, "#28593F")
        column(px, x + 1, h - height + 2, h, "#28593F")
        column(px, x + 2, h - height - 1, h, "#28593F")
        px[(x + 2, h - height - 1)] = "#3C7A4E"
        x += rng.randint(4, 7)
    return w, h, px


def pine(px, w, h, left, height, body, lit):
    """A pine of stacked tiers, widest at the bottom, lit on the moon's side (right)."""
    top = h - height
    for row in range(height):
        tier, step = divmod(row, 5)
        half = tier + step // 2
        for dx in range(-half, half + 1):
            px[((left + dx) % w, top + row)] = lit if dx == half and half > 0 else body


def trees():
    rng = random.Random(7)
    w, h = 96, 30
    px = {}
    x = 2
    while x < w:
        pine(px, w, h, x, rng.randint(18, 29), "#12243A", "#1A3350")
        x += rng.randint(6, 10)
    x = 5
    while x < w:
        pine(px, w, h, x, rng.randint(11, 20), "#0C1928", "#132A40")
        x += rng.randint(5, 9)
    for y in range(h - 3, h):
        for x in range(w):
            px[(x, y)] = "#0C1928"
    return w, h, px


def mountains():
    w, h = 160, 44

    # Sums of sines whose periods divide the width, so the ridge tiles seamlessly.
    def ridge(base, waves):
        return [
            round(base + sum(a * math.sin(2 * math.pi * f * x / w + p) for a, f, p in waves))
            for x in range(w)
        ]

    far = ridge(24, [(9, 1, 0.4), (5, 3, 1.9), (2, 7, 0.2)])
    near = ridge(12, [(5, 2, 2.6), (3, 5, 0.9), (1.5, 11, 1.3)])
    px = {}
    for x in range(w):
        column(px, x, h - far[x], h, "#1A2A50")
        px[(x, h - far[x])] = "#26396A"  # moonlit ridge
        column(px, x, h - near[x], h, "#132041")
        px[(x, h - near[x])] = "#1B2C55"
    return w, h, px


def starfield(seed, size, count, colours, sparkles=0):
    rng = random.Random(seed)
    px = {}
    for _ in range(count):
        x, y = rng.randrange(2, size - 2), rng.randrange(2, size - 2)
        px[(x, y)] = rng.choice(colours)
    for _ in range(sparkles):
        x, y = rng.randrange(3, size - 3), rng.randrange(3, size - 3)
        px[(x, y)] = "#FFFFFF"
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            px[(x + dx, y + dy)] = "#A9B8EC"
    return size, size, px


def moon():
    size, c, r = 32, 15.5, 14
    craters = [(11, 10, 2.6), (20, 8, 1.8), (19, 18, 2.8), (10, 21, 1.6), (24, 14, 1.2)]
    px = {}
    for y in range(size):
        for x in range(size):
            if math.hypot(x - c, y - c) > r:
                continue
            colour = "#F3E7C4"
            if (x - c) + (y - c) * 0.6 > r * 0.72:
                colour = "#D9CAA0"  # shadowed limb, away from the light
            for cx, cy, cr in craters:
                if math.hypot(x - cx, y - cy) <= cr:
                    colour = "#D2C196" if x + y > cx + cy else "#E2D4AC"
            px[(x, y)] = colour
    return size, size, px


def cloud():
    w, h = 44, 14
    puffs = [(9, 9, 4.5), (18, 6, 5.8), (28, 7, 5.2), (36, 9, 4)]
    px = {}
    for y in range(h):
        for x in range(w):
            inside = any(math.hypot(x - cx, (y - cy) * 1.15) <= cr for cx, cy, cr in puffs)
            if inside or (y >= 9 and 5 <= x <= 39):
                px[(x, y)] = "#1D2B52"
    for x in range(w):
        top = next((y for y in range(h) if (x, y) in px), None)
        if top is not None:
            px[(x, top)] = "#2C3E70"
    return w, h, px


def grass_tuft():
    art = [
        "..l....l....",
        "..d.l..d.l..",
        ".dd.d.dd.d.l",
        ".d.dd.d.dd.d",
        "dd.d.dd.d.dd",
        "d.dd.d.dd.dd",
        "dddddddddddd",
        "dddddddddddd",
    ]
    colours = {"d": "#2F6A45", "l": "#4C8E58"}
    px = {
        (x, y): colours[cell]
        for y, row in enumerate(art)
        for x, cell in enumerate(row)
        if cell in colours
    }
    return len(art[0]), len(art), px


ART = {
    "tall-grass.svg": tall_grass,
    "trees.svg": trees,
    "mountains.svg": mountains,
    "stars-dim.svg": lambda: starfield(11, 180, 26, ["#3E4C78", "#4C5B8C"]),
    "stars-mid.svg": lambda: starfield(23, 230, 14, ["#8190C4", "#A2AEDD"]),
    "stars-bright.svg": lambda: starfield(37, 290, 6, ["#EEF2FF", "#FFF4D6"], sparkles=3),
    "moon.svg": moon,
    "cloud.svg": cloud,
    "grass-tuft.svg": grass_tuft,
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, draw in ART.items():
        svg = to_svg(*draw())
        (OUT / name).write_text(svg)
        print(f"{name:18} {len(svg):6} bytes")
