import './style.css';
const menu=document.querySelector('.menu-toggle');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.querySelector('.nav').classList.toggle('is-open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu){menu.setAttribute('aria-expanded','false');document.querySelector('.nav').classList.remove('is-open');}});
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{const category=button.dataset.category;document.querySelectorAll('.filter').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let count=0;document.querySelectorAll('.entry').forEach(e=>{e.hidden=category!=='Tous les thèmes'&&e.dataset.category!==category;if(!e.hidden)count++;});document.querySelectorAll('.letter-group').forEach(g=>g.hidden=!g.querySelector('.entry:not([hidden])'));document.querySelectorAll('.alphabet a').forEach(a=>{const group=document.querySelector(a.getAttribute('href'));a.hidden=!!group?.hidden;});const counter=document.querySelector('[data-count]');counter.textContent=`${count} fiche${count>1?'s':''}`;}));
document.querySelector('[data-print]')?.addEventListener('click',()=>window.print());
document.querySelector('[data-copy]')?.addEventListener('click',async()=>{const status=document.querySelector('.status-message');try{await navigator.clipboard.writeText(location.href);status.textContent='Lien copié.';}catch{status.textContent='Vous pouvez copier l’adresse de cette page dans votre navigateur.';}});
const scene=document.querySelector('#scene');
if(scene){
 const buttons=[...document.querySelectorAll('[data-view]')];
 const illustration=document.querySelector('.hero-art .illustration');
 const status=document.querySelector('[data-scene-status]');
 let desired='illustration', loading;
 const fallback=()=>{loading=undefined;scene.style.opacity='';show('illustration');status.textContent='La vue 3D est indisponible sur cet appareil. L’illustration reste accessible.';};
 const show=view=>{desired=view;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));scene.hidden=view!=='3d';illustration.hidden=view==='3d';};
 buttons.forEach(button=>button.addEventListener('click',async()=>{
  const view=button.dataset.view;desired=view;
  if(view==='illustration'){show(view);status.textContent='Interprétation des façades · sans valeur de plan';return;}
  status.textContent='Chargement de la vue 3D…';
  try{scene.style.opacity='0';scene.hidden=false;loading??=import('./scene.js').then(m=>m.mountScene(fallback));const ok=await loading;if(!ok)throw Error('WebGL');if(desired==='3d'){scene.style.opacity='';show('3d');status.textContent='Maquette simplifiée · déplacez le pointeur pour changer légèrement l’angle';}}
  catch{fallback();}
 }));
}
