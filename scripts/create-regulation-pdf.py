"""Publish only the reviewed, non-nominative core of the 1977 regulation.

Local source scans stay outside Git. Images must have been reviewed before this
script is run. prepare-regulation-scans.py extracts their original binary pixels.
No original PDF object, metadata, attachment or hidden OCR layer is copied.
"""
from pathlib import Path
import hashlib
import json
from io import BytesIO
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader, PdfWriter
from brand import draw_brand_symbol

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'assets/reglement'
OUT.mkdir(parents=True, exist_ok=True)
NATIVE = ROOT/'tmp/reglement/native'
sizes=json.loads((NATIVE/'sizes.json').read_text())
mapping = [(690259, n) for n in range(28, 69)] + [(739697, 47)]
mapping += [(690259, 69), (690259, 72), (690259, 71)]
mapping += [(690259, n) for n in range(73, 108)]
mapping += [(739697, 86), (739697, 87)]
mapping += [(690259, n) for n in range(108, 142)]
assert len(mapping) == 116

fonts = Path('/System/Library/Fonts/Supplemental')
pdfmetrics.registerFont(TTFont('RegBody', str(fonts/'Arial.ttf')))
pdfmetrics.registerFont(TTFont('RegTitle', str(fonts/'Georgia.ttf')))
pdfmetrics.registerFont(TTFont('RegBold', str(fonts/'Arial Bold.ttf')))
pdfmetrics.registerFontFamily('RegBody', normal='RegBody', bold='RegBold')
file = OUT/'reglement-1977-public.pdf'
cover=BytesIO()
c = canvas.Canvas(cover, pagesize=A4, pageCompression=1, invariant=1)
c.setTitle('Villa Colbert - Reglement de copropriete de 1977 - Copie publique')
c.setAuthor('Villa Colbert')
c.setSubject('116 pages de clauses et tableaux, sans preambule nominatif ni signatures. Texte non consolide.')
W,H=A4
draw_brand_symbol(c,44,H-96,36,55)
c.setFillColor(HexColor('#19364c'));c.setFont('RegTitle',24)
c.drawString(97,H-59,'Villa Colbert')
c.setFont('RegBody',10);c.drawString(98,H-80,'Le guide de la résidence')
c.setStrokeColor(HexColor('#cc8664'));c.line(44,H-114,W-44,H-114)
y=H-149
def para(text, size=11, title=False):
    global y
    p=Paragraph(text, ParagraphStyle('reg',fontName='RegTitle' if title else 'RegBody',
        fontSize=size,leading=size*1.42,textColor=HexColor('#19364c')))
    _,h=p.wrap(W-88,H);p.drawOn(c,44,y-h);y-=h+16

para('Règlement de copropriété',28,True)
para('Acte du 5 octobre 1977<br/>Publié le 14 novembre 1977',14)
para('<b>Copie publique : clauses et tableaux, sans noms de personnes.</b><br/>Les 116 pages numérotées du règlement initial suivent cette page de présentation. Le préambule notarial nominatif et la page de signatures ne sont pas reproduits.')
para('<b>Un texte d’origine, non consolidé.</b><br/>Cette copie ne fusionne pas les modificatifs ultérieurs et ne met pas les clauses de 1977 à jour au regard du droit actuel. Le dernier modificatif disponible dans le catalogue Homeland consulté le 2 novembre 2026 est l’acte du 30 mars 2012, publié le 25 avril 2012.')
para('<b>Provenance et continuité des pages.</b><br/>Source principale : document Homeland 690259. Les pages numérotées 42, 81 et 82, absentes de cette numérisation, proviennent de la seconde copie du même règlement, document 739697 (pages PDF 47, 86 et 87). Une page numérotée 43 en double a été écartée et les pages 44 et 45 remises dans l’ordre. Les tableaux sont tournés pour faciliter leur lecture. Les annotations visibles des copies sont conservées ; elles ne constituent pas des modifications du règlement.')
para('<b>Modificatifs, sommaire et lecture en ligne</b><br/><link href="https://pont-colbert-4-4bis.github.io/ABCDaire/reglement/" color="#19364c">pont-colbert-4-4bis.github.io/ABCDaire/reglement/</link>')
assert y>55
c.setFont('RegBody',9);c.drawString(44,35,'Copie préparée le 2 novembre 2026 - Les actes authentiques restent la référence.')
c.showPage();c.save()
cover.seek(0)
writer=PdfWriter()
writer.append(PdfReader(cover))
manifest={'edition':'2026-11-02','pdf':file.name,'pages':[]}
starts={1:'Désignation et division',36:'Parties privatives, parties communes et usages',53:'Charges, équipements et reconstruction',69:'Mutations et modification des lots',74:'Administration de la copropriété',97:'Décisions extraordinaires et litiges',105:'Tableaux de répartition'}
for printed,(doc_id,n) in enumerate(mapping,1):
    source=NATIVE/f'{doc_id}-{n}.png'
    im=Image.open(source)
    assert im.mode=='1'
    if printed>=107: im=im.transpose(Image.Transpose.ROTATE_270)
    filename=f'page-{printed:03}.webp'
    im.save(OUT/filename,'WEBP',lossless=True,method=6)
    w,h=im.size
    pw,ph=sizes[f'{doc_id}-{n}']
    if printed>=107:pw,ph=ph,pw
    # Pillow encodes bilevel PDF images with lossless CCITT compression.
    encoded=BytesIO()
    im.save(encoded,'PDF',resolution=200)
    encoded.seek(0)
    sheet=PdfReader(encoded).pages[0]
    sheet.scale_to(pw,ph)
    writer.add_page(sheet)
    if printed in starts:writer.add_outline_item(starts[printed],printed)
    manifest['pages'].append({'number':printed,'image':filename,'width':w,'height':h,
        'sourceDocument':doc_id,'sourcePage':n,'rotation':90 if printed>=107 else 0,
        'sha256':hashlib.sha256((OUT/filename).read_bytes()).hexdigest()})
writer.add_metadata({'/Title':'Villa Colbert - Reglement de copropriete de 1977 - Copie publique',
    '/Author':'Villa Colbert','/Subject':'Clauses et tableaux sans noms ; texte non consolide'})
with file.open('wb') as stream:writer.write(stream)
r=PdfReader(file)
assert len(r.pages)==117
assert all(not p.extract_text().strip() for p in r.pages[1:]),'No unreviewed hidden text'
manifest['pdfPages']=117
manifest['sha256']=hashlib.sha256(file.read_bytes()).hexdigest()
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f'Created {len(mapping)} public page images and {len(r.pages)}-page PDF: {file.stat().st_size:,} bytes')
