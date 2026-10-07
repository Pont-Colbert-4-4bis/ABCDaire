import './style.css';
const menu=document.querySelector('.menu-toggle');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.querySelector('.nav').classList.toggle('is-open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu){menu.setAttribute('aria-expanded','false');document.querySelector('.nav').classList.remove('is-open');}});
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{const category=button.dataset.category;document.querySelectorAll('.filter').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let count=0;document.querySelectorAll('.entry').forEach(e=>{e.hidden=category!=='Tous les thèmes'&&e.dataset.category!==category;if(!e.hidden)count++;});document.querySelectorAll('.letter-group').forEach(g=>g.hidden=!g.querySelector('.entry:not([hidden])'));document.querySelectorAll('.alphabet a').forEach(a=>{const group=document.querySelector(a.getAttribute('href'));a.hidden=!!group?.hidden;});const counter=document.querySelector('[data-count]');counter.textContent=`${count} fiche${count>1?'s':''}`;}));
document.querySelector('[data-print]')?.addEventListener('click',()=>window.print());
document.querySelector('[data-copy]')?.addEventListener('click',async()=>{const status=document.querySelector('.status-message');try{await navigator.clipboard.writeText(location.href);status.textContent='Lien copié.';}catch{status.textContent='Vous pouvez copier l’adresse de cette page dans votre navigateur.';}});
const scene=document.querySelector('#scene');
if(scene){
 const illustration=document.querySelector('.model-poster');
 const status=document.querySelector('[data-scene-status]');
 const controls=document.querySelector('.scene-controls');
 const fallback=()=>{scene.hidden=true;illustration.hidden=false;controls.hidden=true;scene.style.opacity='';status.textContent='Vue fixe de la maquette · la 3D est indisponible sur cet appareil.';};
 // The poster is a render of this same model, kept until the first successful frame.
 scene.style.opacity='0';scene.hidden=false;
 import('./scene.js').then(m=>m.mountScene(fallback)).then(ok=>{
  if(!ok||scene.dataset.ready!=='true'){fallback();return;}
  scene.style.opacity='';illustration.hidden=true;controls.hidden=false;
  status.textContent=scene.dataset.mode==='explore'?'Faites glisser pour tourner · pincez ou utilisez + / − pour zoomer.':'Faites glisser pour explorer · maquette d’après photographies.';
 }).catch(fallback);
}
