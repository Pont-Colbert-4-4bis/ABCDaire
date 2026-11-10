import {mkdir, readFile, writeFile, cp} from 'node:fs/promises';
import {regulationChapters,regulationAmendments} from '../content/reglement.mjs';

export async function writeRegulationPage({shell,base,esc}) {
  const manifest=JSON.parse(await readFile('assets/reglement/manifest.json','utf8'));
  await cp('assets/reglement','dist/assets/reglement',{recursive:true});
  const asset=file=>`${base}assets/reglement/${file}`;
  const page=manifest.pages;
  const blocks=JSON.parse(await readFile('content/reglement-texte.json','utf8'));
  const img=n=>page.find(p=>p.number===n);
  const cap=s=>{const l=s.toLowerCase();return l.charAt(0).toUpperCase()+l.slice(1);};
  const fmt=v=>String(v).replace(/\B(?=(\d{3})+(?!\d))/g,'\u202f');
  let lastPage=0, textHTML='', tocHTML='', inLots=false;
  for(const b of blocks){
    if(b.page!==lastPage){
      if(inLots){textHTML+='</div>';inLots=false;}
      lastPage=b.page;
      textHTML+=`<p class="reg-page" id="reg-page-${b.page}" data-pagefind-ignore><a href="${asset(img(b.page).image)}" target="_blank" rel="noopener">Page ${b.page} · voir l’original ↗</a></p>`;
    }
    if(b.type==='lot'){
      if(!inLots){textHTML+='<div class="reg-lots">';inLots=true;}
      textHTML+=`<div class="reg-lot" id="lot-${b.lot}"><strong>Lot n° ${b.lot}</strong><p>${esc(b.text)}</p><span class="reg-share">${fmt(b.tantiemes)} / 100${'\u202f'}000</span></div>`;
      continue;
    }
    if(inLots){textHTML+='</div>';inLots=false;}
    if(b.type==='part'){textHTML+=`<h3 class="reg-part" id="partie-${esc(b.text.split(' ')[0].toLowerCase())}">${esc(b.partLabel||cap(b.text))}${b.label?` · ${esc(b.label)}`:''}</h3>`;tocHTML+=`<p class="reg-toc-part">${esc(b.partLabel||cap(b.text))}${b.label?` · ${esc(b.label)}`:''}</p>`;}
    else if(b.type==='chapter'){const label=`Chapitre ${b.text.split(' ')[1]}${b.label?' · '+b.label:''}`;textHTML+=`<h3 class="reg-chapter" id="chapitre-${b.num}">${esc(label)}</h3>`;tocHTML+=`<a href="#chapitre-${b.num}">${esc(label)}</a>`;}
    else if(b.type==='article'){textHTML+=`<h4 class="reg-article" id="article-${b.num}">Article ${b.num}${b.label?` · ${esc(b.label)}`:''}</h4>`;}
    else if(b.type==='title'){textHTML+=`<h5 class="reg-title">${esc(b.label||b.text)}</h5>`;}
    else textHTML+=`<p>${esc(b.text)}</p>`;
  }
  if(inLots) textHTML+='</div>';
  const body=`<main id="contenu" class="container"><div class="regulation-page" data-pagefind-body>
    <nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="${base}">Accueil</a><span aria-hidden="true">/</span><span>Règlement de copropriété</span></nav>
    <p class="edition">Documents de la résidence · Consultation du 2 novembre 2026</p>
    <h1 data-pagefind-meta="title">Règlement de copropriété</h1>
    <p class="directory-intro">Le texte complet du règlement de 1977, consultable et cherchable, l’original à télécharger, et les modificatifs disponibles. Sans noms de personnes.</p>
    <section class="directory-note"><h2>Quel est le dernier document disponible ?</h2>
      <p>Le règlement a été établi le <strong>5 octobre 1977</strong> et publié le <strong>14 novembre 1977</strong>. Le dernier modificatif déposé dans le catalogue Homeland consulté est l’acte du <strong>30 mars 2012</strong>, publié le <strong>25 avril 2012</strong>.</p>
      <p>Ces documents se lisent ensemble. Aucune version réunissant le règlement et tous les modificatifs dans un texte actualisé n’a été trouvée dans ce catalogue. Les pages de 1977 ci-dessous conservent donc leur rédaction d’origine ; elles ne constituent pas une présentation du droit en vigueur aujourd’hui.</p>
    </section>
    <div class="article-actions" data-pagefind-ignore><a class="summary-download" href="${asset(manifest.pdf)}" download>Télécharger l’original numérisé (PDF)</a><a href="#texte">Lire le texte</a><a href="#modificatifs">Les modificatifs</a><button data-copy>Copier le lien</button></div><div class="status-message" role="status" data-pagefind-ignore></div>
    <section class="article-section"><h2>Ce que contient le règlement</h2><p>Il définit les lots et les parties communes, l’usage des logements et des équipements, la répartition des charges et l’organisation de la copropriété.</p><p>Par exemple, l’article 19 décrit le chauffage collectif par résistances électriques intégrées aux planchers et plafonds, complété par des convecteurs alimentés par le compteur individuel. Voir l’<a href="#article-19">article 19</a>, page 64.</p><p>Le document porte sur un ensemble immobilier comprenant les bâtiments I et II. Le bâtiment I correspond aux entrées du 4 et du 4 bis ; le bâtiment II au 6 rue du Pont Colbert. Ces désignations historiques sont conservées dans les textes.</p></section>
    <section id="texte" class="regulation-reader">
      <h2>Le texte du règlement de 1977</h2>
      <p>Le texte ci-dessous est celui des pages 1 à 104 du règlement, avec les 182 lots et leurs quotes-parts. Pour chercher un mot, utilisez la recherche du site ou la recherche de votre navigateur (Ctrl+F, ou ⌘+F sur Mac).</p>
      <p class="regulation-note">Ce texte a été obtenu par reconnaissance de caractères à partir des pages numérisées, puis corrigé. Quelques coquilles peuvent subsister : la page originale fait foi. Chaque page est accessible depuis son numéro, en marge du texte. Les quotes-parts des 182 lots ont été contrôlées : leur total fait bien 100 000/100 000.</p>
      <nav class="regulation-toc" aria-label="Sommaire du règlement">${tocHTML}</nav>
      <div class="regulation-text">${textHTML}</div>
      <details class="regulation-chapter" id="reg-tableaux"><summary><span>Tableaux de répartition des charges</span><small>Pages 105 à 116 · images</small></summary><p>Tableaux par lot et par catégorie de charges, tels qu’ils figurent dans le règlement initial. Ce ne sont pas des décomptes de charges actuels.</p><div class="regulation-scans" data-pagefind-ignore>${page.filter(p=>p.number>=105).map(p=>`<figure id="reg-page-${p.number}"><a href="${asset(p.image)}" target="_blank" rel="noopener" aria-label="Agrandir la page ${p.number} du règlement"><img src="${asset(p.image)}" width="${p.width}" height="${p.height}" loading="lazy" decoding="async" alt="Page ${p.number} du règlement de copropriété de 1977 : tableau de répartition des charges"></a><figcaption>Page ${p.number} du règlement initial <a href="${asset(p.image)}" target="_blank" rel="noopener">Agrandir ↗</a></figcaption></figure>`).join('')}</div></details>
    </section>
    <section id="modificatifs" class="article-section"><h2>Les modificatifs, du plus récent au plus ancien</h2><p>Les descriptions ci-dessous reprennent l’objet et la portée des documents. Les actes notariés nominatifs, signatures et conditions de ventes individuelles ne sont pas publiés.</p>${regulationAmendments.map(a=>`<section class="regulation-amendment"><p class="edition">${esc(a.date)} · ${esc(a.status)}</p><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p><p class="regulation-note">${esc(a.note)}</p><p class="decision-source">${esc(a.source)}</p></section>`).join('')}</section>
    <details class="regulation-provenance"><summary>Sources et préparation de la copie publique</summary><p>Le catalogue des documents généraux de l’extranet Homeland a été consulté le 2 novembre 2026. Il contient le règlement de 1977, une seconde copie du règlement et les modificatifs listés ci-dessus. « Dernier disponible » désigne le dernier document de ce catalogue, sans garantir qu’aucun autre acte n’existe.</p><p>La copie publique conserve les 116 pages numérotées de clauses et de tableaux. Le préambule notarial contenant les identités et la page de signatures sont omis. Aucun nom de personne ni document de vente nominatif n’est reproduit.</p><p>La numérisation principale (document 690259) omet les pages numérotées 42, 81 et 82 ; elles sont reprises de l’autre copie du même règlement (document 739697, pages PDF 47, 86 et 87). Une page 43 en double est écartée et les pages 44 et 45 sont remises dans l’ordre. Les tableaux sont tournés pour faciliter la lecture. Les annotations des copies sont conservées ; elles ne valent pas modification du texte.</p><p>Les actes authentiques et les documents accessibles aux copropriétaires dans <a href="https://extranet.homeland.immo/pages/documents" rel="noreferrer">l’extranet Homeland</a> restent les références. Le règlement intérieur et les décisions d’AG sont des documents distincts.</p></details>
    <p class="directory-links"><a href="${base}fiches/regles-de-vie/">Les règles de vie au quotidien →</a><a href="${base}decisions/">Les décisions d’AG par sujet →</a></p>
  </div></main>`;
  await mkdir('dist/reglement',{recursive:true});
  await writeFile('dist/reglement/index.html',shell('Règlement de copropriété','Texte complet et cherchable du règlement de copropriété de 1977 de Villa Colbert, original numérisé et modificatifs.',body,{path:'reglement/'}));
}
