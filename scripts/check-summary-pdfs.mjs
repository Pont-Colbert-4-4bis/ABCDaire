import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const data=JSON.parse(execFileSync(process.execPath,['scripts/export-print-summaries.mjs'],{encoding:'utf8'}));
const manifest=JSON.parse(readFileSync('assets/fiches-a5/manifest.json','utf8'));
assert.equal(manifest.sourceHash,data.sourceHash,'A5 sources changed: review the summaries and run scripts/create-summary-pdfs.py');
assert.equal(manifest.sheets.length,data.records.length);
for(const record of data.records){
  const sheet=manifest.sheets.find(s=>s.slug===record.slug);
  assert(sheet,`Missing A5 sheet ${record.slug}`);
  assert.equal(sheet.filename,record.filename);
  assert.equal(sheet.pages,1);
  const html=readFileSync(`dist/fiches/${record.slug}/index.html`,'utf8');
  assert(!html.includes('Dans Le Petit Colbert'));
  assert(html.includes(`/ABCDaire/assets/fiches-a5/${record.filename}`),`Missing download on ${record.slug}`);
}
for(const asset of [...manifest.sheets,manifest.collection]){
  const bytes=readFileSync(`dist/assets/fiches-a5/${asset.filename}`);
  assert(bytes.subarray(0,5).toString()==='%PDF-');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.filename);
}
const arrival=readFileSync('dist/fiches/arriver-et-demenager/index.html','utf8');
assert(!arrival.includes('Une fois installé'));
assert(!arrival.includes('TK Elevator'));
console.log(`Checked ${manifest.sheets.length} A5 downloads, source freshness and PDF integrity.`);
