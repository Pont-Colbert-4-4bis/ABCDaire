"""Draw the approved website SVG directly in resident-facing PDFs."""
from pathlib import Path
from xml.etree import ElementTree

from reportlab.lib.colors import HexColor


SYMBOL = Path(__file__).resolve().parents[1] / 'assets/brand/villa-colbert-symbol.svg'


def draw_brand_symbol(canvas, x, y, width=47, height=47):
    """Fit the canonical three-balcony mark inside a bottom-left PDF rectangle."""
    svg = ElementTree.parse(SYMBOL).getroot()
    min_x, min_y, svg_width, svg_height = map(float, svg.attrib['viewBox'].split())
    scale = min(width / svg_width, height / svg_height)
    canvas.saveState()
    canvas.translate(x + (width - svg_width * scale) / 2,
                     y + (height + svg_height * scale) / 2)
    canvas.scale(scale, -scale)
    canvas.translate(-min_x, -min_y)
    for polygon in svg.findall('{http://www.w3.org/2000/svg}polygon'):
        points = [tuple(map(float, pair.split(','))) for pair in polygon.attrib['points'].split()]
        path = canvas.beginPath()
        path.moveTo(*points[0])
        for point in points[1:]:
            path.lineTo(*point)
        path.close()
        canvas.setFillColor(HexColor(polygon.attrib['fill']))
        canvas.drawPath(path, fill=1, stroke=0)
    canvas.restoreState()
