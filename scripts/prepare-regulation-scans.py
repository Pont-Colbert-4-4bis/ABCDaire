"""Extract the reviewed scan pixels, discarding hidden OCR and PDF metadata."""
import sys
import json
from pathlib import Path
from io import BytesIO
import fitz
from PIL import Image

source=Path(sys.argv[1])
out=Path(__file__).resolve().parents[1]/'tmp/reglement/native'
out.mkdir(parents=True,exist_ok=True)
docs={690259:('reglement-de-copropriete-en-date-du-14-11-1977-690259.pdf',list(range(28,70))+list(range(71,142))),
      739697:('reglement-de-copropriete-739697.pdf',[47,86,87])}
sizes={}
for doc_id,(name,pages) in docs.items():
    doc=fitz.open(source/name)
    for number in pages:
        page=doc[number-1]
        images=page.get_images(full=True)
        assert len(images)==1, 'Only a single reviewed scan per page is supported'
        raw=doc.extract_image(images[0][0])
        im=Image.open(BytesIO(raw['image'])).convert('L')
        # The original scans are bilevel: no thresholding of faded text is needed.
        assert set(im.getdata()).issubset({0,255}), f'Unexpected grayscale: {doc_id}/{number}'
        im=im.convert('1',dither=Image.Dither.NONE)
        key=f'{doc_id}-{number}'
        im.save(out/f'{key}.png')
        sizes[key]=[page.rect.width,page.rect.height]
(out/'sizes.json').write_text(json.dumps(sizes))
print(f'Extracted {len(sizes)} non-nominative page scans without hidden text')
