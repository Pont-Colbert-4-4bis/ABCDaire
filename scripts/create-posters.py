"""Rebuild vector QR assets and the three resident-facing A4 sheets.
Requires ReportLab; invitation and site URL are sourced from content/sharing.mjs.
"""
from pathlib import Path
import json, subprocess
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics import renderPDF, renderSVG
from brand import draw_brand_symbol

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'/'partage';OUT.mkdir(parents=True,exist_ok=True)
config=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {sharing} from './content/sharing.mjs'; console.log(JSON.stringify(sharing))"],cwd=ROOT))
FONT=Path('/System/Library/Fonts/Supplemental')
pdfmetrics.registerFont(TTFont('ColbertSans',str(FONT/'Arial.ttf')))
pdfmetrics.registerFont(TTFont('ColbertBold',str(FONT/'Arial Bold.ttf')))
pdfmetrics.registerFont(TTFont('ColbertDisplay',str(FONT/'Georgia.ttf')))
pdfmetrics.registerFontFamily('ColbertSans',normal='ColbertSans',bold='ColbertBold')
W,H=A4; NAVY=HexColor('#19364c'); CREAM=HexColor('#faf7f0'); MUTED=HexColor('#52626b'); LINE=HexColor('#d8d7cc'); GREEN=HexColor('#45634b')

def qr(url,size=280):
    code=QrCodeWidget(url,barLevel='Q',barBorder=4)
    x0,y0,x1,y1=code.getBounds();unit=size/(x1-x0)
    drawing=Drawing(size,size,transform=[unit,0,0,unit,-x0*unit,-y0*unit])
    drawing.add(Rect(x0,y0,x1-x0,y1-y0,fillColor=white,strokeColor=None));drawing.add(code)
    return drawing
for key,stem in [('guide','abcdaire'),('residents','whatsapp-residents')]:
    renderSVG.drawToFile(qr(config[key],320),str(OUT/f'{stem}-qr.svg'))

def paragraph(c,text,x,top,width,size=13,leading=None,color=NAVY,font='ColbertSans',align=0):
    p=Paragraph(text,ParagraphStyle('colbert',fontName=font,fontSize=size,leading=leading or size*1.4,textColor=color,alignment=align))
    _,height=p.wrap(width,H);p.drawOn(c,x,top-height);return top-height

def frame(filename,subtitle):
    c=canvas.Canvas(str(OUT/filename),pagesize=A4,pageCompression=1)
    c.setTitle(subtitle+' — Villa Colbert');c.setAuthor('Villa Colbert · Conseil syndical')
    c.setFillColor(CREAM);c.rect(0,0,W,H,fill=1,stroke=0)
    draw_brand_symbol(c,42,H-93)
    paragraph(c,'Villa Colbert',104,H-49,430,24,font='ColbertDisplay')
    paragraph(c,'4 &amp; 4 bis, rue du Pont Colbert · Versailles',104,H-76,430,10,color=MUTED)
    c.setStrokeColor(LINE);c.line(42,53,W-42,53)
    paragraph(c,'Édition pilote · 13 octobre 2026 · Conseil syndical',42,41,W-84,9,color=MUTED)
    return c

def finish(c): c.showPage();c.save()

c=frame('affiche-abcdaire.pdf','La vie à Villa Colbert, de A à Z')
paragraph(c,'LE GUIDE DE LA RÉSIDENCE',42,H-137,W-84,10,font='ColbertBold',color=MUTED)
paragraph(c,'La vie à Villa Colbert,<br/>de A à Z.',42,H-165,W-84,34,39,font='ColbertDisplay')
paragraph(c,'Une question ? Retrouvez les repères du quotidien,<br/>les contacts professionnels et les décisions de la résidence.',42,H-264,W-84,14,21)
renderPDF.draw(qr(config['guide'],282),c,(W-282)/2,216)
c.linkURL(config['guide'],((W-282)/2,216,(W+282)/2,498),relative=0)
paragraph(c,'Scannez pour consulter l’ABCDaire',42,190,W-84,17,font='ColbertBold',align=1)
paragraph(c,'Gratuit · Sans compte · Recherche par mot-clé',42,161,W-84,11,color=MUTED,align=1)
paragraph(c,'pont-colbert-4-4bis.github.io/ABCDaire/',42,125,W-84,11,align=1)
paragraph(c,'Un guide pratique à enrichir ensemble. Les points à confirmer sont indiqués.',42,95,W-84,9.5,color=MUTED,align=1)
finish(c)

c=frame('affiche-whatsapp-residents.pdf','WhatsApp des résidents')
paragraph(c,'LE GROUPE WHATSAPP DES RÉSIDENTS',42,H-137,W-84,10,font='ColbertBold',color=GREEN)
paragraph(c,'Restons en contact.',42,H-172,W-84,34,40,font='ColbertDisplay')
paragraph(c,'Informations pratiques, entraide<br/>et vie de la résidence.',42,H-230,W-84,16,23)
renderPDF.draw(qr(config['residents'],282),c,(W-282)/2,244)
c.linkURL(config['residents'],((W-282)/2,244,(W+282)/2,526),relative=0)
paragraph(c,'Scannez pour demander à rejoindre',42,220,W-84,17,font='ColbertBold',align=1)
paragraph(c,'Residents Pont Colbert 4&amp;4bis',42,186,W-84,13,align=1)
paragraph(c,'Accès réservé aux résidents,<br/><b>après validation du conseil syndical.</b>',42,157,W-84,12,17,align=1)
paragraph(c,'L’adhésion ajoute aussi à la communauté Pont Colbert 4&amp;4bis<br/>et à son groupe d’annonces. Le groupe du CS reste réservé à ses membres.',42,99,W-84,9,12,color=MUTED,align=1)
finish(c)

c=frame('bienvenue-villa-colbert.pdf','Bienvenue à Villa Colbert')
paragraph(c,'Bienvenue à Villa Colbert.',42,H-132,W-84,28,34,font='ColbertDisplay')
paragraph(c,'Les essentiels pour votre arrivée',42,H-177,W-84,13,color=MUTED)
y=H-222
blocks=[
 ('01', 'Gardons les passages libres.', 'Halls, paliers et abords des portes doivent rester dégagés, notamment pour le nettoyage. Protégez les sols et l’ascenseur pendant votre déménagement.'),
 ('02', 'Prenons soin du voisinage.', 'Limitez le bruit et prévenez avant des travaux ou une fête. Avant une modification visible depuis l’extérieur ou côté couloir, faites préciser les démarches et teintes applicables.'),
 ('03', 'Trions et utilisons les bons bacs.', 'Vérifiez les collectes et les modalités des encombrants. Le CS déconseille les vide-ordures : privilégiez les bacs des locaux poubelles.'),
 ('04', 'Signalons avec les bons repères.', 'Homeland : indiquez bâtiment, étage, emplacement, date et faits. WhatsApp avec photo ou un membre du CS peut aussi relayer le signalement. Danger immédiat : 18 ou 112.'),
]
for num,title,body in blocks:
    paragraph(c,num,42,y,31,11,font='ColbertBold',color=GREEN)
    bottom=paragraph(c,title,84,y,W-126,13,font='ColbertBold')
    bottom=paragraph(c,body,84,bottom-6,W-126,10.5,14.5,color=MUTED)
    y=bottom-19
c.setStrokeColor(LINE);c.line(42,y+4,W-42,y+4)
renderPDF.draw(qr(config['guide'],126),c,42,99)
c.linkURL(config['guide'],(42,99,168,225),relative=0)
paragraph(c,'Le guide complet, à portée de main.',188,217,W-230,17,21,font='ColbertDisplay')
paragraph(c,'Contacts professionnels, démarches, contrats et décisions.<br/><b>Scannez pour consulter l’ABCDaire.</b>',188,169,W-230,11,15)
paragraph(c,'Projet de règles de vie à valider par le CS.<br/>Les textes applicables de la copropriété restent la référence.',188,109,W-230,9,12,color=MUTED)
paragraph(c,'pont-colbert-4-4bis.github.io/ABCDaire/',42,77,W-84,9,color=MUTED)
finish(c)
print('Created 3 A4 PDFs and 2 vector QR codes in', OUT)
