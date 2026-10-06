import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// An architectural interpretation of the supplied photographs and illustration,
// not a measured model. All materials and vegetation are generated locally.
export function mountScene(onFailure=()=>{}){
 const host=document.querySelector('#scene');if(!host)return false;
 host.replaceChildren();delete host.dataset.ready;
 let renderer;
 try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return false;}
 renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 host.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene(),group=new THREE.Group();scene.add(group);
 const camera=new THREE.PerspectiveCamera(29,1,.1,100);
 const focus=new THREE.Vector3(-.55,3.7,.2),direction=new THREE.Vector3(-.60,.08,1).normalize();
 camera.position.copy(focus).addScaledVector(direction,34);camera.lookAt(focus);camera.updateMatrixWorld();
 scene.add(new THREE.HemisphereLight(0xf4f6ff,0x9a9079,1.3));
 const sun=new THREE.DirectionalLight(0xfff5e9,2.15);sun.position.set(-10,17,12);sun.castShadow=true;
 sun.shadow.mapSize.set(matchMedia('(max-width:760px)').matches?2048:4096,matchMedia('(max-width:760px)').matches?2048:4096);
 Object.assign(sun.shadow.camera,{left:-15,right:15,top:13,bottom:-13,near:1,far:50});sun.shadow.normalBias=.025;sun.shadow.bias=-.00008;sun.shadow.radius=3;scene.add(sun);
 const fill=new THREE.DirectionalLight(0xd6e2f0,.55);fill.position.set(12,8,3);scene.add(fill);
 let seed=437;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 const texture=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;};
 const plaster=texture(128,128,(ctx,w,h)=>{ctx.fillStyle='#eeede7';ctx.fillRect(0,0,w,h);for(let i=0;i<11000;i++){const a=.02+random()*.06;ctx.fillStyle=`rgba(85,74,56,${a})`;ctx.fillRect(random()*w,random()*h,1,1);}});plaster.wrapS=plaster.wrapT=THREE.RepeatWrapping;plaster.repeat.set(2,2);
 const material=(color,more={})=>new THREE.MeshStandardMaterial({color,roughness:.82,...more});
 const mat={wall:material(0xe5e3d9,{map:plaster}),salmon:material(0xcd9577),salmonLight:material(0xd39c7e),edge:material(0xada491),frame:material(0xf2eee4,{roughness:.45}),recess:material(0x545955),rail:material(0x72776f,{metalness:.32,roughness:.54}),roof:material(0xb6b4a7),stem:material(0x77654d),soil:material(0x77745a),path:material(0xc6bfae),joint:material(0xaaa491),door:material(0x555e60,{metalness:.25}),leaf:material(0x9aad7b,{roughness:.96})};
 const glazing=Array.from({length:5},(_,i)=>material(0xffffff,{roughness:.37,metalness:.08,map:texture(64,128,(ctx,w,h)=>{const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,['#8cabb7','#aeb8b6','#7e929a','#c7c9bd','#7797a4'][i]);g.addColorStop(.48,'#76919a');g.addColorStop(1,'#384f59');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);if(i!==4){ctx.fillStyle=i===3?'#deddd0':'#c4c8bf';ctx.fillRect(3,0,i===3?50:18,h);for(let x=4;x<=(i===3?50:18);x+=4){ctx.fillStyle='rgba(76,82,79,.17)';ctx.fillRect(x,0,1,h);}}ctx.fillStyle='rgba(240,244,233,.25)';ctx.beginPath();ctx.moveTo(0,12);ctx.lineTo(w,0);ctx.lineTo(w,27);ctx.lineTo(0,53);ctx.fill();})}));
 const unit=new THREE.BoxGeometry(1,1,1);
 const box=(w,h,d,x,y,z,m=mat.wall,parent=group)=>{const mesh=new THREE.Mesh(unit,m);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 const line=(a,b,thickness,m=mat.rail,parent=group)=>{const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(thickness,thickness,delta.length(),6),m);mesh.position.copy(start.add(end).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());parent.add(mesh);return mesh;};
 function windowAt(x,y,z,w=.95,h=.75,parent=group,index=0){
  box(w+.12,h+.12,.035,x,y,z,mat.recess,parent);
  box(w,h,.045,x,y,z+.025,glazing[index%5],parent);
  for(const dx of [-w/2,w/2,0])box(.032,h+.05,.065,x+dx,y,z+.065,mat.frame,parent);
  for(const dy of [-h/2,h/2])box(w+.07,.035,.07,x,y+dy,z+.07,mat.frame,parent);
  box(w+.16,.045,.2,x,y-h/2-.04,z+.08,mat.wall,parent);
  // Narrow shadow under the projecting sill and shutter housing.
  box(w+.1,.02,.035,x,y-h/2-.072,z+.028,mat.edge,parent);
  box(w+.08,.06,.09,x,y+h/2+.02,z+.045,mat.frame,parent);
 }
 function balcony(x,y,z,w,solid=true,flip=false,parent=group){
  const points=[[-w/2,0],[w/2,0],[flip?-w/2:w/2,.85]];
  const shape=new THREE.Shape();shape.moveTo(...points[0]);points.slice(1).forEach(p=>shape.lineTo(...p));shape.closePath();
  const floor=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.095,bevelEnabled:false}),mat.wall);floor.rotation.x=Math.PI/2;floor.position.set(x,y,z);parent.add(floor);
  for(let i=1;i<points.length;i++){
   const a=points[i],b=points[(i+1)%points.length],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
   if(solid){const p=box(len,.48,.062,x+(a[0]+b[0])/2,y+.24,z+(a[1]+b[1])/2,mat.wall,parent);p.rotation.y=-Math.atan2(dz,dx);const cap=box(len+.02,.035,.08,p.position.x,y+.497,p.position.z,mat.frame,parent);cap.rotation.y=p.rotation.y;}
   else{line([x+a[0],y+.49,z+a[1]],[x+b[0],y+.49,z+b[1]],.014,mat.rail,parent);line([x+a[0],y+.06,z+a[1]],[x+b[0],y+.06,z+b[1]],.01,mat.rail,parent);const n=Math.ceil(len/.075);for(let j=0;j<=n;j++)box(.013,.46,.013,x+a[0]+dx*j/n,y+.25,z+a[1]+dz*j/n,mat.rail,parent);}
  }
 }
 // Plinth, paved pavement and the stepped volumes of the front and left return.
 box(21.6,.28,7.8,-.9,-.51,.1,mat.path);box(18.25,.06,7.75,.75,-.06,.1,mat.joint);
 for(let iz=0;iz<5;iz++)for(let ix=0;ix<45;ix++)box(.422,.038,.355,-9.65+ix*.434+(iz%2)*.15,-.008,2.22+iz*.37,ix%4===0?mat.wall:mat.path);
 for(let ix=0;ix<46;ix++)box(.414,.17,.2,-9.67+ix*.43,-.095,3.94,mat.wall);
 box(13.7,7.9,3.4,1.1,3.96,-1.23);box(2.75,7.35,4.15,-7.125,3.69,-.68);
 const front=.49,wingFront=1.405;
 box(13.7,.83,.024,1.1,.48,front,mat.salmon);box(2.75,.83,.024,-7.125,.48,wingFront,mat.salmon);
 box(13.4,.92,2.66,1.1,8.37,-1.57);box(13.4,.49,.023,1.1,8.34,-.227,mat.salmon);
 box(13.54,.075,2.8,1.1,8.865,-1.57,mat.edge);box(13.42,.025,2.65,1.1,8.91,-1.57,mat.roof);
 box(2.55,.7,3.38,-7.12,7.71,-1.01);box(2.64,.07,3.48,-7.12,8.09,-1.01,mat.edge);
 box(.8,.4,.6,-4.2,9.05,-1.9,mat.roof);
 const columns=[-4.98,-3.5,-1.96,-.48,1.0,2.55,4.06,5.62,7.13];
 for(let row=0;row<5;row++){
  const y=1.67+row*1.31;
  // Alternating continuous peach bands and quieter ivory storeys.
  if(row%2===1)box(13.7,.79,.028,1.1,y,front,mat.salmon);
  for(let col=0;col<columns.length;col++){
   const x=columns[col],w=col%3===1?1.07:.78;
   if(row%2===0&&col%3===1)box(w+.72,.79,.027,x+.15,y,front,mat.salmonLight);
   windowAt(x,y,front+.018,w,.68,group,col+row*2);
  }
  balcony(-4.97,y-.47,front+.015,.91,false);
  balcony(-1.28,y-.47,front+.015,1.99,true,true);
  balcony(4.06,y-.47,front+.015,.91,false,true);
  balcony(7.12,y-.47,front+.015,1.9,true,false);
  if(row%2===1)box(2.75,.79,.028,-7.125,y,wingFront,mat.salmon);
  windowAt(-7.1,y,wingFront+.018,1.16,.68,group,row+1);balcony(-7.05,y-.47,wingFront+.02,1.9,true,true);
 }
 columns.forEach((x,i)=>{windowAt(x,8.35,-.204,.89,.48,group,i+1);windowAt(x,.49,front+.02,.92,.52,group,i+2);});
 // Finely drawn joints rather than a heavy outline around every storey.
 for(const y of [.98,3.68,6.29,7.89])box(13.7,.012,.015,1.1,y,front+.02,mat.edge);
 const side=new THREE.Group();side.position.set(-8.508,0,-.65);side.rotation.y=-Math.PI/2;group.add(side);
 for(let row=0;row<5;row++){
  const y=1.67+row*1.31;if(row%2===1)box(4.15,.79,.025,0,y,0,mat.salmon,side);
  [-1.38,0,1.36].forEach((x,i)=>windowAt(x,y,.02,.67,.68,side,row+i));balcony(-.5,y-.47,.04,1.92,true,false,side);
 }
 // Two distinct parking entrances under the left terrace, at different levels.
 box(5.75,1.45,1.33,-8.28,.385,2.03,mat.salmon);
 box(5.99,.16,1.6,-8.28,1.18,2.06);
 function parkingDoor(x,width,bottom,height){
  box(width+.16,height+.12,.035,x,bottom+height/2,2.717,mat.recess);
  box(width,height,.05,x,bottom+height/2,2.749,mat.door);
  const n=Math.ceil(width/.055);for(let i=0;i<=n;i++)box(.018,height-.025,.023,x-width/2+i*width/n,bottom+height/2,2.787,mat.rail);
  box(width+.22,.08,.1,x,bottom+height+.06,2.78);
 }
 parkingDoor(-7.04,2.05,.32,.79);
 parkingDoor(-9.7,1.65,-.22,.74);
 // Separate access ramps and low dividing walls make both mouths legible.
 const ramp=box(2.14,.06,1.23,-7.04,.15,3.32,mat.path);ramp.rotation.x=.27;
 const lowerRamp=box(1.85,.05,1.2,-9.7,-.13,3.34,mat.path);lowerRamp.rotation.x=-.23;
 for(const x of [-10.68,-8.7,-5.86]){box(.14,.49,1.35,x,.25,3.22);box(.18,.04,1.37,x,.515,3.22,mat.frame);}
 for(let i=0;i<43;i++)box(.018,.48,.018,-11.02+i*.13,1.49,2.77,mat.rail);
 box(5.5,.026,.032,-8.29,1.74,2.77,mat.rail);
 box(12.82,.34,.24,1.38,.17,2.08);box(12.75,.045,.31,1.38,.36,2.08,mat.frame);
 box(12.78,.07,1.2,1.38,.14,1.38,mat.soil);
 box(.96,1.12,.045,2.35,.59,front+.018,mat.door);box(.025,1.04,.035,2.35,.59,front+.063,mat.frame);box(1.33,.1,.57,2.35,1.17,front+.22);box(.11,.2,.035,3.02,.81,front+.04,mat.rail);
 // Street frontage visible in the references: entrance steps, a bus shelter and bollards.
 for(let i=0;i<4;i++)box(1.05,.10,1.05-i*.21,2.35,.05+i*.10,1.57-i*.105,mat.path);
 const shelter=material(0x29453c,{roughness:.6,metalness:.18});mat.shelter=shelter;
 for(const x of [-1.7,.3])box(.055,1.40,.055,x,.70,3.10,shelter);
 box(2.28,.065,.67,-.7,1.43,3.12,shelter);
 box(1.96,.81,.035,-.7,.89,2.98,mat.door);
 box(.58,.61,.04,-1.12,.89,3.003,mat.frame);box(.58,.61,.04,-.38,.89,3.003,mat.path);
 box(1.6,.055,.25,-.7,.43,3.15,shelter);
 for(const x of [-4.9,1.2,4.25,7.5]){box(.045,.47,.045,x,.23,3.70,mat.stem);box(.058,.035,.058,x,.48,3.70,mat.rail);}
 line([7.75,0,3.20],[7.75,5.05,3.20],.031,mat.rail);
 line([7.75,4.94,3.20],[8.54,5.14,3.20],.022,mat.rail);box(.41,.07,.16,8.47,5.06,3.20,mat.rail);
 // Individual leaves are instanced: natural silhouettes with few draw calls.
 const leaves=[];
 function spray(x,y,z,rx,ry,rz,count,tone=0){for(let i=0;i<count;i++){const u=random()*Math.PI*2,v=Math.acos(2*random()-1),r=Math.cbrt(random());leaves.push({x:x+Math.cos(u)*Math.sin(v)*r*rx,y:y+Math.cos(v)*r*ry,z:z+Math.sin(u)*Math.sin(v)*r*rz,s:.038+random()*.062,tone:tone+random()*.17});}}
 function tree(x,z,height,radius){
  line([x,0,z],[x+.08,height*.74,z],.045,mat.stem);
  for(let j=0;j<11;j++){const a=j*2.4,r=radius*(.32+random()*.65),cy=height*(.56+random()*.31),cx=x+Math.cos(a)*r*.65,cz=z+Math.sin(a)*r*.65;line([x,height*.35,z],[cx,cy,cz],.013,mat.stem);spray(cx,cy,cz,radius*.53,radius*.65,radius*.52,240,.06);}
 }
 tree(-8.75,-1.75,6.15,1.65);tree(8.48,-1.55,5.75,1.5);tree(-3.7,2.87,3.25,.87);tree(6.8,2.85,3.1,.86);
 for(let i=0;i<48;i++)spray(-4.84+i*.269,.57,1.68,.23,.32,.34,100,-.1);
 for(let i=0;i<22;i++)spray(-5.1+i*.59,.49,1.04,.25,.3,.32,25,.02);
 const foliage=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),mat.leaf,leaves.length),dummy=new THREE.Object3D(),color=new THREE.Color();
 leaves.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(random()*3,random()*6,random()*3);dummy.scale.set(p.s,p.s*.57,p.s*.78);dummy.updateMatrix();foliage.setMatrixAt(i,dummy.matrix);color.setHSL(.18+random()*.055,.24+random()*.22,.19+p.tone);foliage.setColorAt(i,color);});foliage.castShadow=true;foliage.receiveShadow=true;
 for(const x of [-3.7,6.8]){box(1.12,.09,.96,x,.025,2.87,mat.wall);box(.98,.1,.81,x,.03,2.87,mat.soil);}
 // Batch static architecture by material, including window frames and railings.
 group.scale.y=.87;group.updateMatrixWorld(true);const batches=new Map();group.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(o.matrixWorld);const flat=g.index?g.toNonIndexed():g;if(flat!==g)g.dispose();if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(flat);});
 const originalGeometry=new Set();group.traverse(o=>{if(o.isMesh)originalGeometry.add(o.geometry);});group.clear();group.scale.set(1,1,1);originalGeometry.forEach(g=>g.dispose());
 for(const [m,parts]of batches){const geometry=mergeGeometries(parts);parts.forEach(g=>g.dispose());const mesh=new THREE.Mesh(geometry,m);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}foliage.scale.y=.87;group.add(foliage);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(70,70),new THREE.ShadowMaterial({opacity:.17}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.58;shadow.receiveShadow=true;scene.add(shadow);
 // Frame the full diorama close to the reference, including during small rotations.
 const bounds=new THREE.Box3().setFromObject(group),projected=new THREE.Box3();
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])projected.expandByPoint(new THREE.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse));
 const size=projected.getSize(new THREE.Vector3());
 let alive=true,frame=0,target=0,current=0,visible=true;
 let phase=0,lastTick=0,idleUntil=0,paused=false,dragging=false;
 const motionButton=document.querySelector('[data-scene-motion]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),events=new AbortController();
 const draw=now=>{
  frame=0;if(!alive||!visible||document.hidden){lastTick=0;return;}
  // Thirty frames/second are enough for a gentle 28-second rocking cycle.
  if(lastTick&&now-lastTick<1000/30){schedule();return;}
  const dt=lastTick?Math.min((now-lastTick)/1000,.1):1/30;lastTick=now;
  const automatic=!reduced.matches&&!paused&&!dragging&&now>=idleUntil;
  if(automatic){phase=(phase+dt*Math.PI*2/28)%(Math.PI*2);target=.12*Math.sin(phase);}
  const previous=current;current=reduced.matches?target:current+(target-current)*(1-Math.exp(-5*dt));
  if(Math.abs(current-target)<.00001)current=target;
  group.rotation.y=current;
  if(Math.abs(current-previous)>.000001)renderer.render(scene,camera);
  if((!reduced.matches&&!paused&&!dragging)||Math.abs(current-target)>.00001)schedule();
 };
 const schedule=()=>{if(!frame&&alive&&visible&&!document.hidden)frame=requestAnimationFrame(draw);};
 const stop=()=>{cancelAnimationFrame(frame);frame=0;lastTick=0;};
 const updateMotionButton=()=>{if(!motionButton)return;motionButton.hidden=reduced.matches;motionButton.textContent=paused?'Animer':'Pause';motionButton.setAttribute('aria-label',paused?'Reprendre la rotation automatique':'Mettre la rotation en pause');};
 const resize=()=>{const{width,height}=host.getBoundingClientRect();if(!width||!height)return false;const aspect=width/height;camera.aspect=aspect;const distance=Math.max(size.y/.83,size.x/(aspect*.98))/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));camera.position.copy(focus).addScaledVector(direction,distance+1);camera.lookAt(focus);camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(Math.max(devicePixelRatio,2),2.5,1800/width));renderer.setSize(width,height);renderer.render(scene,camera);return true;};
 const dispose=()=>{if(!alive)return;alive=false;cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();events.abort();scene.traverse(o=>{if(o.isMesh)o.geometry.dispose();});const all=new Set([...Object.values(mat),...glazing,shadow.material]);all.forEach(m=>{m.map?.dispose();m.dispose();});renderer.dispose();renderer.domElement.remove();delete host.dataset.ready;};
 let observer=new ResizeObserver(()=>{try{resize();}catch{dispose();onFailure();}}),visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();else stop();});
 try{if(!resize()){dispose();return false;}}catch{dispose();return false;}
 observer.observe(host);visibility.observe(host);host.dataset.ready='true';
 const listen=(el,type,fn)=>el.addEventListener(type,fn,{signal:events.signal});
 listen(renderer.domElement,'webglcontextlost',()=>{dispose();onFailure();});
 listen(document,'visibilitychange',()=>{if(document.hidden)stop();else schedule();});
 listen(reduced,'change',()=>{stop();target=current;updateMotionButton();schedule();});
 if(motionButton)listen(motionButton,'click',()=>{paused=!paused;target=current;idleUntil=0;stop();updateMotionButton();if(!paused)schedule();});
 updateMotionButton();
 let startX=0,startAngle=0;
 const setAngle=a=>{idleUntil=performance.now()+6000;target=THREE.MathUtils.clamp(a,-.2,.32);schedule();};
 listen(host,'pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;dragging=true;target=current;startX=e.clientX;startAngle=current;host.setPointerCapture(e.pointerId);host.classList.add('is-dragging');});
 listen(host,'pointermove',e=>{if(dragging)setAngle(startAngle+(e.clientX-startX)/host.clientWidth*.9);});
 const release=()=>{dragging=false;idleUntil=performance.now()+6000;host.classList.remove('is-dragging');schedule();};listen(host,'pointerup',release);listen(host,'pointercancel',release);
 listen(host,'keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();setAngle(target+(e.key==='ArrowLeft'?-.1:.1));}else if(e.key==='Home'){e.preventDefault();setAngle(0);}});
 document.querySelectorAll('[data-scene-turn]').forEach(b=>listen(b,'click',()=>setAngle(b.dataset.sceneTurn==='reset'?0:target+Number(b.dataset.sceneTurn))));
 listen(window,'pagehide',e=>{if(!e.persisted)dispose();});
 schedule();
 return true;
}
