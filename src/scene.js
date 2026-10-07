import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Geometry comes from the reviewed, portable GLB. This module only presents it.
export async function mountScene(onFailure=()=>{}) {
 const host=document.querySelector('#scene'); if(!host)return false;
 const detailed=host.dataset.mode==='explore';
 const scope=host.closest('[data-model-viewer]')||document;
 const motion=scope.querySelector('[data-scene-motion]');
 const presetButtons=[...scope.querySelectorAll('[data-scene-view]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const events=new AbortController();
 let renderer,alive=true,frame=0,visible=true,paused=detailed,dragging=false,last=0,phase=0,idleUntil=0;
 let model,environment,controls,observer,visibility,transition=null,activePreset='overview';
 let camera,scene,draco,baseTheta=-.49,basePhi=1.3,baseRadius=100;
 const labels=[];
 const listen=(el,type,fn)=>el?.addEventListener(type,fn,{signal:events.signal});
 const dispose=()=>{
  if(!alive)return;alive=false;cancelAnimationFrame(frame);observer?.disconnect();visibility?.disconnect();events.abort();controls?.dispose();draco?.dispose();
  const materials=new Set(),geometries=new Set();scene?.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());environment?.dispose();renderer?.dispose();host.replaceChildren();delete host.dataset.ready;
 };
 const fail=()=>{dispose();onFailure();};
 try {
  host.replaceChildren();delete host.dataset.ready;
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1.0;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  host.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
  listen(renderer.domElement,'webglcontextlost',e=>{e.preventDefault();fail();});
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(32,1,.15,400);
  scene.add(new THREE.HemisphereLight(0xf5f8ff,0x9b907e,1.2));
  const sun=new THREE.DirectionalLight(0xfffaf5,2.2);sun.position.set(-25,50,35);sun.castShadow=true;
  const shadowSize=matchMedia('(max-width:760px)').matches?2048:4096;sun.shadow.mapSize.set(shadowSize,shadowSize);
  Object.assign(sun.shadow.camera,{left:-46,right:46,top:36,bottom:-36,near:1,far:125});sun.shadow.normalBias=.025;sun.shadow.bias=-.00012;
  sun.target.position.set(-4,6,-2);scene.add(sun,sun.target);
  const fill=new THREE.DirectionalLight(0xe0ebf6,.4);fill.position.set(30,20,10);scene.add(fill);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();environment=pmrem.fromScene(room,.025);room.dispose();pmrem.dispose();scene.environment=environment.texture;scene.environmentIntensity=.22;
  draco=new DRACOLoader().setDecoderPath(host.dataset.decoder).setWorkerLimit(2);
  const gltf=await new GLTFLoader().setDRACOLoader(draco).loadAsync(host.dataset.model);
  if(!alive){gltf.scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});return false;}
  model=gltf.scene;model.name='Villa Colbert';model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(model);draco.dispose();
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(100,70),new THREE.ShadowMaterial({opacity:.12}));shadow.rotation.x=-Math.PI/2;shadow.position.set(-5,-1.65,-1);shadow.receiveShadow=true;scene.add(shadow);
  controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableDamping=false;controls.enableZoom=detailed;
  controls.minPolarAngle=.15;controls.maxPolarAngle=1.53;controls.minDistance=14;controls.maxDistance=180;controls.rotateSpeed=.55;
  // Hero keeps normal vertical page scrolling. The enlarged viewer owns both axes.
  renderer.domElement.style.touchAction=detailed?'none':'pan-y';
  const presets={
   overview:{target:[-5,7.4,-.2],theta:-.49,phi:1.3,width:65,height:28},
   facade:{target:[-2,8.2,.3],theta:0,phi:1.52,width:63,height:24},
   parkings:{target:[-27.1,3.9,1.5],theta:-.52,phi:1.2,width:26,height:21},
   roof:{target:[-3,7.3,-5],theta:-.45,phi:.37,width:62,height:39},
   '4bis':{target:[-21.5,3.6,1.7],theta:-.35,phi:1.36,width:17,height:15},
   '4':{target:[9,3.9,1.7],theta:-.24,phi:1.40,width:15,height:15}
  };
  const spherical=new THREE.Spherical(),offset=new THREE.Vector3();
  const captureOrbit=()=>{spherical.setFromVector3(camera.position.clone().sub(controls.target));baseTheta=spherical.theta;basePhi=spherical.phi;baseRadius=spherical.radius;phase=0;};
  const updateMotion=()=>{host.dataset.motion=reduced.matches?'reduced':paused?'paused':'playing';if(motion){motion.hidden=reduced.matches;motion.textContent=paused?'Animer':'Pause';motion.setAttribute('aria-label',paused?'Animer lentement la maquette':'Mettre la rotation en pause');motion.setAttribute('aria-pressed',String(!paused));}};
  const updatePresets=()=>presetButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sceneView===activePreset)));
  const fittedDistance=p=>Math.max(p.height,p.width/camera.aspect)/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)))*1.04;
  const view=(name,animate=true)=>{
   const p=presets[name]||presets.overview;activePreset=name;updatePresets();phase=0;
   const target=new THREE.Vector3(...p.target),position=target.clone().add(new THREE.Vector3().setFromSphericalCoords(fittedDistance(p),p.phi,p.theta));
   if(animate&&!reduced.matches)transition={start:performance.now(),from:camera.position.clone(),fromTarget:controls.target.clone(),position,target};
   else{transition=null;camera.position.copy(position);controls.target.copy(target);controls.update();captureOrbit();}
   if(name!=='overview')paused=true;updateMotion();schedule();
  };
  for(const [name,text]of[['entree-4bis','4 bis'],['entree-4','4']]){
   const anchor=model.getObjectByName(name);if(!anchor)continue;
   const button=document.createElement('button');button.type='button';button.className='scene-landmark';button.textContent=text;button.setAttribute('aria-label',`Voir l’entrée ${text}`);host.append(button);
   listen(button,'pointerdown',e=>e.stopPropagation());listen(button,'click',()=>view(text==='4'?'4':'4bis'));
   labels.push({anchor,button,point:new THREE.Vector3()});
  }
  const render=()=>{
   renderer.render(scene,camera);
   for(const item of labels){item.anchor.getWorldPosition(item.point);item.point.y+=.40;item.point.project(camera);item.button.hidden=activePreset==='roof'||camera.position.z<1||Math.abs(item.point.x)>.91||Math.abs(item.point.y)>.91||item.point.z>1;item.button.style.left=`${(item.point.x*.5+.5)*100}%`;item.button.style.top=`${(-item.point.y*.5+.5)*100}%`;}
   host.dataset.drawCalls=String(renderer.info.render.calls);host.dataset.triangles=String(renderer.info.render.triangles);
  };
  function schedule(){if(!frame&&alive&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
  function draw(now){
   frame=0;if(!alive||!visible||document.hidden){last=0;return;}
   if(last&&now-last<1000/30){schedule();return;}const dt=last?Math.min((now-last)/1000,.08):1/30;last=now;
   if(transition){const t=Math.min(1,(now-transition.start)/650),smooth=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.position,smooth);controls.target.lerpVectors(transition.fromTarget,transition.target,smooth);controls.update();if(t===1){transition=null;captureOrbit();}}
   else if(!paused&&!reduced.matches&&!dragging&&now>=idleUntil){phase+=dt*Math.PI*2/32;offset.setFromSphericalCoords(baseRadius,basePhi,baseTheta+Math.sin(phase)*.085);camera.position.copy(controls.target).add(offset);controls.update();}
   render();if(transition||(!paused&&!reduced.matches))schedule();
  }
  const resize=()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height)return;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio||1,2,2300/width));renderer.setSize(width,height);view(activePreset,false);render();};
  observer=new ResizeObserver(resize);visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();else{cancelAnimationFrame(frame);frame=0;last=0;}});
  controls.addEventListener('start',()=>{dragging=true;transition=null;idleUntil=Infinity;});
  controls.addEventListener('end',()=>{dragging=false;idleUntil=performance.now()+6000;captureOrbit();schedule();});
  controls.addEventListener('change',()=>{if(alive)schedule();});
  presetButtons.forEach(button=>listen(button,'click',()=>view(button.dataset.sceneView)));
  listen(motion,'click',()=>{paused=!paused;captureOrbit();idleUntil=0;updateMotion();schedule();});
  const rotate=delta=>{transition=null;captureOrbit();baseTheta+=delta;camera.position.copy(controls.target).add(offset.setFromSphericalCoords(baseRadius,basePhi,baseTheta));controls.update();idleUntil=performance.now()+6000;schedule();};
  scope.querySelectorAll('[data-scene-turn]').forEach(b=>listen(b,'click',()=>b.dataset.sceneTurn==='reset'?view('overview'):rotate(Number(b.dataset.sceneTurn))));
  scope.querySelectorAll('[data-scene-zoom]').forEach(b=>listen(b,'click',()=>{captureOrbit();baseRadius=THREE.MathUtils.clamp(baseRadius*Number(b.dataset.sceneZoom),14,180);camera.position.copy(controls.target).add(offset.setFromSphericalCoords(baseRadius,basePhi,baseTheta));controls.update();paused=true;updateMotion();schedule();}));
  listen(host,'keydown',e=>{if(e.target!==host)return;if(['ArrowLeft','ArrowRight','Home','+','-'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')rotate(-.12);if(e.key==='ArrowRight')rotate(.12);if(e.key==='Home')view('overview');if(detailed&&['+','-'].includes(e.key)){captureOrbit();baseRadius=THREE.MathUtils.clamp(baseRadius*(e.key==='+'?.85:1.15),14,180);camera.position.copy(controls.target).add(offset.setFromSphericalCoords(baseRadius,basePhi,baseTheta));controls.update();schedule();}});
  listen(document,'visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else schedule();});
  listen(reduced,'change',()=>{captureOrbit();updateMotion();schedule();});
  listen(window,'pagehide',e=>{if(!e.persisted)dispose();});
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  updateMotion();resize();observer.observe(host);visibility.observe(host);host.dataset.ready='true';schedule();return true;
 } catch(error) { console.warn('Villa Colbert: le modèle 3D ne peut pas être affiché.',error);dispose();return false; }
}
