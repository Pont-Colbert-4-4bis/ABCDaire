"""Create one readable A5 summary per article and a bookmarked collection.

Run from any directory with Python containing ReportLab and pypdf; Node is also
required. The generated assets are committed, so the website build needs no
Python. npm run check detects stale or changed print assets.
"""
from pathlib import Path
from html import escape
import hashlib
import json
import subprocess

from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A5
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics import renderPDF
from brand import draw_brand_symbol

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'/'fiches-a5'
OUT.mkdir(parents=True, exist_ok=True)
data=json.loads(subprocess.check_output(['node', str(ROOT/'scripts/export-print-summaries.mjs')], cwd=ROOT))
font_dir=Path('/System/Library/Fonts/Supplemental')
if font_dir.exists():
    faces={'Body':'Arial.ttf','Bold':'Arial Bold.ttf','Display':'Georgia.ttf'}
else:
    font_dir=Path('/usr/share/fonts/truetype/dejavu')
    faces={'Body':'DejaVuSans.ttf','Bold':'DejaVuSans-Bold.ttf','Display':'DejaVuSerif.ttf'}
for name,file in faces.items():
    pdfmetrics.registerFont(TTFont(name,str(font_dir/file)))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold')

W,H=A5
M=29
CW=W-2*M
NAVY=HexColor('#19364c')
MUTED=HexColor('#52626b')
GREEN=HexColor('#45634b')
SALMON=HexColor('#cc8664')
LINE=HexColor('#d8d7cc')

def safe(text):
    return escape(text.replace('–','-').replace('—','-').replace('\u2011','-'))

def paragraph(c,text,x,top,width,size=10.6,leading=14.2,font='Body',color=NAVY):
    p=Paragraph(text,ParagraphStyle('print',fontName=font,fontSize=size,leading=leading,textColor=color))
    _,height=p.wrap(width,H)
    p.drawOn(c,x,top-height)
    return top-height

def qr(c,url,x,y,size=64):
    q=QrCodeWidget(url,barLevel='M',barBorder=4)
    x0,y0,x1,y1=q.getBounds()
    scale=size/(x1-x0)
    d=Drawing(size,size,transform=[scale,0,0,scale,-x0*scale,-y0*scale])
    d.add(Rect(x0,y0,x1-x0,y1-y0,fillColor=white,strokeColor=None))
    d.add(q)
    renderPDF.draw(d,c,x,y)
    c.linkURL(url,(x,y,x+size,y+size),relative=0)

def draw_sheet(record):
    file=OUT/record['filename']
    c=canvas.Canvas(str(file),pagesize=A5,pageCompression=1,invariant=1)
    c.setTitle(f"Villa Colbert - {record['title']} - Synthèse A5")
    c.setAuthor('Villa Colbert')
    c.setSubject(f"Résumé de la rubrique ; fiche du {data['edition']}")
    draw_brand_symbol(c,M,H-64,25,39)
    paragraph(c,'Villa Colbert',M+37,H-27,210,18,21,'Display')
    paragraph(c,'LE GUIDE DE LA RÉSIDENCE',M+38,H-51,220,7.3,10,'Bold',MUTED)
    c.setFillColor(SALMON);c.roundRect(W-M-48,H-55,48,24,5,fill=1,stroke=0)
    paragraph(c,f"{record['number']:02d} / A5",W-M-41,H-38,42,8.4,10,'Bold',white)
    c.setStrokeColor(LINE);c.setLineWidth(.6);c.line(M,H-76,W-M,H-76)
    top=paragraph(c,safe(record['category']).upper(),M,H-89,CW,7.8,10,'Bold',GREEN)
    top=paragraph(c,safe(record['title']),M,top-8,CW,23,26,'Display')-17

    for heading,items in record['sections']:
        top=paragraph(c,safe(heading),M,top,CW,10.8,14.3,'Bold')-5
        for item in items:
            c.setFillColor(SALMON);c.circle(M+2,top-6.4,1.6,fill=1,stroke=0)
            top=paragraph(c,safe(item),M+12,top,CW-12)-5
        top-=6

    # Measure the contact box first; never shrink body text to hide overflow.
    contact_lines=[]
    for contact in record['contacts']:
        label=safe(contact['company'])
        if contact.get('phone'):
            tel=''.join(ch for ch in contact['phone'] if ch.isdigit() or ch=='+')
            label+=f' · <link href="tel:{tel}">{safe(contact["phone"])}</link>'
        elif contact.get('url'):
            label+=f' · <link href="{escape(contact["url"],quote=True)}">{safe(contact.get("urlLabel") or "Site et démarches")}</link>'
        contact_lines.append(label)
    if not contact_lines:
        contact_lines=['Invitation au groupe résidents : lien et QR sur la page complète.',
                       'Adhésion soumise à l’approbation des administrateurs du CS.']
    box_height=30+len(contact_lines)*13.5
    contact_top=96+box_height
    if top < contact_top+8:
        raise ValueError(f"A5 overflow in {record['slug']}: shorten summary by {contact_top+8-top:.1f} pt")
    c.setFillColor(HexColor('#f3f4ef'));c.roundRect(M,96,CW,box_height,6,fill=1,stroke=0)
    paragraph(c,'CONTACTS UTILES' if record['contacts'] else 'REJOINDRE LES RÉSIDENTS',
              M+10,contact_top-9,CW-20,7.3,10,'Bold',GREEN)
    ct=contact_top-23
    for line in contact_lines:
        ct=paragraph(c,line,M+10,ct,CW-20,9,12.5)-1

    # QR always points to the corresponding article, keeping printed copies useful.
    qr(c,record['url'],W-M-64,19)
    paragraph(c,f'<link href="{record["url"]}"><b>La rubrique complète en ligne</b></link>',M,77,CW-76,9.1,12.5)
    paragraph(c,'Détails, contacts, sources et historique.',M,61,CW-76,8.3,11,color=MUTED)
    paragraph(c,f"Fiche du {data['edition']} · Synthèse",M,44,CW-76,7.7,10,color=MUTED)
    paragraph(c,'pont-colbert-4-4bis.github.io/ABCDaire/',M,28,CW-76,7.5,10,color=MUTED)
    c.showPage();c.save()
    reader=PdfReader(file)
    assert len(reader.pages)==1,record['slug']
    assert abs(float(reader.pages[0].mediabox.width)-W)<.1
    assert abs(float(reader.pages[0].mediabox.height)-H)<.1
    text=reader.pages[0].extract_text()
    assert record['title'].replace('—','-') in ' '.join(text.split()),record['slug']
    return {'slug':record['slug'],'filename':record['filename'],
            'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),
            'pages':1,'size':file.stat().st_size,'body_bottom':round(top,1)}

manifest={'edition':data['edition'],'sourceHash':data['sourceHash'],'sheets':[]}
for record in data['records']:
    manifest['sheets'].append(draw_sheet(record))
writer=PdfWriter()
for record in data['records']:
    writer.append(OUT/record['filename'],outline_item=record['title'])
writer.add_metadata({'/Title':'Villa Colbert - Les 26 fiches pratiques A5','/Author':'Villa Colbert'})
collection=OUT/'abcdaire-fiches-a5.pdf'
with collection.open('wb') as stream: writer.write(stream)
assert len(PdfReader(collection).pages)==len(data['records'])
manifest['collection']={'filename':collection.name,'pages':len(data['records']),
                        'sha256':hashlib.sha256(collection.read_bytes()).hexdigest()}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f"Created {len(data['records'])} one-page A5 summaries and a bookmarked collection in {OUT}")
