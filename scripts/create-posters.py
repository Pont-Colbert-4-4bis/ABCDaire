"""Generate the single A4 hall poster and the two website QR assets."""
from pathlib import Path
import json,subprocess
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor,white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing,Rect
from reportlab.graphics import renderPDF, renderSVG

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'/'partage'
OUT.mkdir(parents=True,exist_ok=True)
from brand import draw_brand_symbol
sharing=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {sharing} from './content/sharing.mjs';console.log(JSON.stringify(sharing))"],cwd=ROOT))
fonts=Path('/System/Library/Fonts/Supplemental')
for label,file in [('Sans','Arial.ttf'),('Bold','Arial Bold.ttf'),('Display','Georgia.ttf')]:pdfmetrics.registerFont(TTFont(label,str(fonts/file)))
pdfmetrics.registerFontFamily('Sans',normal='Sans',bold='Bold')
navy=HexColor('#19364c');muted=HexColor('#52626b');green=HexColor('#45634b');line=HexColor('#d8d7cc')
W,H=A4
out=OUT/'affiche-hall-abcdaire-et-whatsapp.pdf'
c=canvas.Canvas(str(out),pagesize=A4,pageCompression=1)
c.setTitle('Villa Colbert - ABCDaire et WhatsApp des résidents');c.setAuthor('Villa Colbert')
c.setFillColor(HexColor('#faf7f0'));c.rect(0,0,W,H,stroke=0,fill=1)

def text(content,x,top,width,size=12,font='Sans',color=navy,leading=None,align=0):
 p=Paragraph(content,ParagraphStyle('poster',fontName=font,fontSize=size,leading=leading or size*1.4,textColor=color,alignment=align))
 _,h=p.wrap(width,H);p.drawOn(c,x,top-h);return top-h

def qr_drawing(url,size):
 q=QrCodeWidget(url,barLevel='Q',barBorder=4)
 x0,y0,x1,y1=q.getBounds();scale=size/(x1-x0)
 d=Drawing(size,size,transform=[scale,0,0,scale,-x0*scale,-y0*scale])
 d.add(Rect(x0,y0,x1-x0,y1-y0,fillColor=white,strokeColor=None));d.add(q)
 return d

def qr(url,x,y,size):
 renderPDF.draw(qr_drawing(url,size),c,x,y)
 c.linkURL(url,(x,y,x+size,y+size),relative=0)

for key,stem in [('guide','abcdaire'),('residents','whatsapp-residents')]:
 renderSVG.drawToFile(qr_drawing(sharing[key],320),str(OUT/f'{stem}-qr.svg'))

# A common header and a pair of equally prominent destinations.
draw_brand_symbol(c,42,H-93)
text('Villa Colbert',104,H-49,430,24,'Display')
text('4 &amp; 4 bis, rue du Pont Colbert · Versailles',104,H-76,430,10,color=muted)
text('LE GUIDE ET LA VIE DE LA RÉSIDENCE',42,702,W-84,10,'Bold',muted)
text('Les bons repères,<br/>les échanges entre voisins.',42,674,W-84,31,'Display',leading=37)
text('Scannez le QR code qui vous intéresse.',42,581,W-84,13,color=muted)

left=42;gap=18;cw=(W-84-gap)/2;bottom=166;top=540
for index,(label,title,desc,key,caption,tint) in enumerate([
 ('01 · LE GUIDE','L’ABCDaire','Conseils pratiques, contacts<br/>et décisions de la résidence.','guide','Consultation libre,<br/>sans compte.','#f2eee6'),
 ('02 · LES ÉCHANGES','WhatsApp','Informations, entraide<br/>et vie entre résidents.','residents','<b>Réservé aux résidents.</b><br/>Validation du CS requise.','#eef1e8')
]):
 x=left+index*(cw+gap)
 c.setFillColor(HexColor(tint));c.setStrokeColor(line);c.setLineWidth(.6);c.roundRect(x,bottom,cw,top-bottom,14,fill=1,stroke=1)
 text(label,x+18,top-22,cw-36,9,'Bold',green if index else muted)
 text(title,x+18,top-48,cw-36,25,'Display')
 text(desc,x+18,top-88,cw-36,11,leading=16)
 size=190;qx=x+(cw-size)/2;qy=220
 qr(sharing[key],qx,qy,size)
 text(caption,x+12,204,cw-24,10.5,align=1,leading=15)

text('pont-colbert-4-4bis.github.io/ABCDaire/',42,145,W-84,10.5,align=1)
text('Le lien WhatsApp ouvre le groupe « Residents Pont Colbert 4&amp;4bis ».<br/>L’adhésion ajoute aussi à la communauté et à son groupe d’annonces.<br/>Le groupe du conseil syndical reste réservé à ses membres.',42,117,W-84,9,color=muted,leading=12,align=1)
c.setStrokeColor(line);c.line(42,53,W-42,53)
text('Édition pilote · 13 octobre 2026',42,40,W-84,9,color=muted)
c.showPage();c.save();print(out)
