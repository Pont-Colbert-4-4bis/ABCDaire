import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {regulationChapters} from '../content/reglement.mjs';

const m=JSON.parse(await readFile('assets/reglement/manifest.json','utf8'));
assert.equal(m.pages.length,116);
assert.equal(m.pdfPages,117);
assert.deepEqual(m.pages.map(p=>p.number),Array.from({length:116},(_,i)=>i+1));
assert.deepEqual(regulationChapters.flatMap(c=>Array.from({length:c.end-c.start+1},(_,i)=>c.start+i)),m.pages.map(p=>p.number));
const supplements=new Map([[42,47],[81,86],[82,87]]);
assert.equal(m.pages[63].sourcePage,91,'Article 19 is printed page 64');
assert.equal(m.pages[43].sourcePage,72,'Page 44 was out of order');
assert.equal(m.pages[44].sourcePage,71,'Page 45 was out of order');
const used=new Set();
for(const p of m.pages){
  if(supplements.has(p.number)){
    assert.equal(p.sourceDocument,739697);assert.equal(p.sourcePage,supplements.get(p.number));
  }else{
    assert.equal(p.sourceDocument,690259);
    assert(p.sourcePage>=28&&p.sourcePage<=141&&p.sourcePage!==70,'Only reviewed non-nominative core pages');
  }
  const key=`${p.sourceDocument}/${p.sourcePage}`;assert(!used.has(key));used.add(key);
}
for(const [file,sha] of [[m.pdf,m.sha256],...m.pages.map(p=>[p.image,p.sha256])]){
  for(const root of ['assets/reglement','dist/assets/reglement']){
    const bytes=await readFile(`${root}/${file}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),sha,`${root}/${file}: changed scan`);
  }
}
const html=await readFile('dist/reglement/index.html','utf8');
assert(!/LOISEAU|GUILLARD|POISSON|MAILLEY|MAILLET|nom de naissance|domiciliée? à|épouse de/i.test(html),'No notarial identities');
assert(!/homeland-scrape|tmp\/reglement|modificatif-.*\.pdf/.test(html),'No unreviewed private source PDF links');
assert.equal((html.match(/id="reg-page-\d+"/g)||[]).length,116);
console.log('Checked 116 reviewed regulation pages, chapter coverage, public file hashes and source boundaries.');
