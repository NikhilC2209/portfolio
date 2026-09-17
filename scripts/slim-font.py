"""Generate a lighter weight of a font by eroding every glyph outline inwards.

Used to derive "Interceptor Slim" from Pixel Sagas' Interceptor, which only ships
in heavy weights (source: https://www.pixelsagas.com/?download=interceptor).
Interceptor is under the SIL Open Font License, which permits modified versions
as long as they stay under the OFL; its readme asks derivatives to use a
different name, hence the rename.

Usage:
    python -m venv .venv && .venv/bin/pip install fonttools brotli skia-pathops
    .venv/bin/python scripts/slim-font.py Interceptor.otf InterceptorSlim.woff2 --inset 45 --name "Interceptor Slim"

public/fonts/interceptor/InterceptorSlim.woff2 was built with exactly that command.

--inset is in font units (Interceptor uses 2048 per em; its stems are ~500 wide).
Advance widths are left untouched, so a thinner glyph also gains a little air.
"""

import argparse

import pathops
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

HINTING_TABLES = ("fpgm", "prep", "cvt ", "hdmx", "LTSH", "VDMX", "gasp")


def erode(glyph_set, name, inset):
    outline = pathops.Path()
    glyph_set[name].draw(outline.getPen(glyphSet=glyph_set))
    if outline.area == 0:
        return outline
    outline.simplify(fix_winding=True)

    # A stroke is centred on the contour, so a width of 2*inset covers `inset`
    # units either side; subtracting it removes exactly that much from the fill.
    edge = pathops.Path(outline)
    edge.stroke(inset * 2, pathops.LineCap.BUTT_CAP, pathops.LineJoin.MITER_JOIN, 4)
    return pathops.op(outline, edge, pathops.PathOp.DIFFERENCE, fix_winding=True)


def rename(font, family):
    postscript = family.replace(" ", "") + "-Regular"
    for record in font["name"].names:
        if record.nameID in (1, 16):
            record.string = family
        elif record.nameID in (2, 17):
            record.string = "Regular"
        elif record.nameID in (3, 4):
            record.string = f"{family} Regular"
        elif record.nameID == 6:
            record.string = postscript


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("source")
    parser.add_argument("output")
    parser.add_argument("--inset", type=float, required=True, help="font units to remove from each side of every stroke")
    parser.add_argument("--name", required=True, help="family name for the derived font")
    args = parser.parse_args()

    font = TTFont(args.source)
    if "glyf" not in font:
        raise SystemExit("only TrueType-flavoured (glyf) fonts are supported")

    glyph_set = font.getGlyphSet()
    eroded = {name: erode(glyph_set, name, args.inset) for name in font.getGlyphOrder()}

    glyf = font["glyf"]
    for name, path in eroded.items():
        pen = TTGlyphPen(None)
        path.draw(pen)
        glyf[name] = pen.glyph()

    # The original hinting no longer matches the new outlines.
    for tag in HINTING_TABLES:
        if tag in font:
            del font[tag]

    rename(font, args.name)
    font["OS/2"].usWeightClass = 300
    if args.output.endswith(".woff2"):
        font.flavor = "woff2"
    font.save(args.output)


if __name__ == "__main__":
    main()
