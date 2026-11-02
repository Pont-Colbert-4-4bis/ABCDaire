import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {articles} from '../content/articles.mjs';
import {enrich} from '../content/enrichments.mjs';
import {contacts} from '../content/contacts.mjs';
import {printEdition, printSummaries} from '../content/print-summaries.mjs';

enrich(articles);
if (Object.keys(printSummaries).length !== articles.length) throw Error('One A5 summary is required per article');
const records=articles.map((a,index)=>{
  const summary=printSummaries[a.slug];
  if (!summary) throw Error(`Missing summary: ${a.slug}`);
  return {
    slug:a.slug, title:a.title, category:a.category, number:index+1,
    sections:summary.sections,
    contacts:summary.contacts.map(id=>{
      const c=contacts.find(c=>c.id===id);
      if (!c) throw Error(`Unknown print contact: ${id}`);
      return {id,company:c.company,role:c.role,phone:c.phone,email:c.email,url:c.url};
    }),
    url:`https://pont-colbert-4-4bis.github.io/ABCDaire/fiches/${a.slug}/`,
    filename:`${a.slug}-a5.pdf`
  };
});
// A changed source must trigger regeneration/review of the committed summaries.
const inputs=['content/articles.mjs','content/enrichments.mjs','content/resident-review.mjs',
  'content/contacts.mjs','content/maintenance.mjs','content/print-summaries.mjs',
  'scripts/export-print-summaries.mjs','scripts/create-summary-pdfs.py','scripts/brand.py',
  'assets/brand/villa-colbert-symbol.svg'];
const sourceHash=createHash('sha256');
for(const file of inputs) sourceHash.update(file).update('\0').update(readFileSync(new URL(`../${file}`,import.meta.url)));
console.log(JSON.stringify({edition:printEdition,sourceHash:sourceHash.digest('hex'),records}));
