import * as THREE from 'three';
export function mountScene(onFailure=()=>{}){
 const host=document.querySelector('#scene');if(!host)return false;
 host.replaceChildren();delete host.dataset.ready;
 let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return false;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;host.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-12,12,9,-9,.1,100);camera.position.set(-16,11,24);camera.lookAt(0,3.1,0);
 scene.add(new THREE.HemisphereLight(0xfffaf0,0x879276,2.4));const sun=new THREE.DirectionalLight(0xffefd8,2.6);sun.position.set(-10,16,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-15,right:15,top:15,bottom:-15});sun.shadow.normalBias=.025;scene.add(sun);
 const group=new THREE.Group();scene.add(group);
 const colors={wall:0xeee9dc,salmon:0xcd9879,roof:0xb9b8aa,glass:0x607782,frame:0xfaf5e9,rail:0x7c8580,stem:0x776a53,leaf:0x647750,leaf2:0x83915c,path:0xd9d4c8,ground:0xb0b895,hedge:0x486247};const mat=Object.fromEntries(Object.entries(colors).map(([k,v])=>[k,new THREE.MeshStandardMaterial({color:v,roughness:.9})]));
 function box(w,h,d,x,y,z,m=mat.wall,parent=group){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 // Visible facade proportions interpreted from the two supplied photographs; not survey geometry.
 box(18.5,.28,7.1,0,-.16,0,mat.path);box(16,.08,4.8,.3,.01,-.25,mat.ground);
 box(14.2,6.8,3.05,.75,3.46,-.8);box(2.15,6.45,3.9,-7.3,3.28,-1.2);
 box(13.8,.85,2.4,.75,7.28,-1.08);box(13.94,.09,2.54,.75,7.75,-1.08,mat.roof);
 box(2.02,.7,3.3,-7.3,6.83,-1.33);box(2.12,.09,3.4,-7.3,7.22,-1.33,mat.roof);
 const front=.755;box(14.2,.65,.025,.75,.43,front,mat.salmon);
 function windowAt(x,y,z,w=.92,h=.64){box(w+.1,h+.1,.045,x,y,z,mat.frame);box(w,h,.053,x,y,z+.024,mat.glass);box(.035,h,.065,x,y,z+.047,mat.frame);box(w+.16,.05,.16,x,y-h/2-.035,z+.06,mat.frame);}
 // Six horizontal rows, topped by the narrower recessed level.
 for(let row=0;row<5;row++){const y=1.5+row*1.12;box(14.2,.69,.025,.75,y,front,mat.salmon);for(let col=0;col<11;col++)windowAt(-5.8+col*1.29,y,front+.026,.85);}
 for(let col=0;col<11;col++)windowAt(-5.8+col*1.29,.44,front+.03,.83,.44);
 box(13.8,.49,.024,.75,7.3,.133,mat.salmon);for(let col=0;col<11;col++)windowAt(-5.55+col*1.24,7.3,.16,.72,.37);
 function balcony(x,y,z,w,solid=true,flip=false){const depth=.65;const points=flip?[[-w/2,0],[w/2,0],[w/2,.17],[-w/2,depth]]:[[-w/2,0],[w/2,0],[w/2,depth],[-w/2,.17]];const shape=new THREE.Shape();shape.moveTo(...points[0]);points.slice(1).forEach(p=>shape.lineTo(...p));shape.closePath();const floor=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.085,bevelEnabled:false}),mat.wall);floor.rotation.x=Math.PI/2;floor.position.set(x,y,z);floor.castShadow=true;floor.receiveShadow=true;group.add(floor);
 // Shape coordinates map to x/z after rotation. Parapets follow the angled edge.
 for(let i=1;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(solid){const panel=box(len,.38,.055,x+(a[0]+b[0])/2,y+.2,z+(a[1]+b[1])/2,mat.wall);panel.rotation.y=-Math.atan2(dz,dx);}else{const rail=box(len,.035,.035,x+(a[0]+b[0])/2,y+.42,z+(a[1]+b[1])/2,mat.rail);rail.rotation.y=-Math.atan2(dz,dx);for(let j=0;j<=5;j++)box(.021,.42,.021,x+a[0]+dx*j/5,y+.21,z+a[1]+dz*j/5,mat.rail);}}
 }
 for(let row=0;row<5;row++){const y=1.12+row*1.12;balcony(-5.25,y,front,1.65,true,true);balcony(-3.4,y,front,.86,false);balcony(-.2,y,front,1.66,true,true);balcony(3.95,y,front,.88,false);balcony(6.8,y,front,1.72,true);}
 // Short stepped left return with its horizontal peach bands and windows.
 const left=new THREE.Group();left.position.set(-8.39,0,-1.15);left.rotation.y=-Math.PI/2;group.add(left);
 for(let row=0;row<5;row++){const y=1.5+row*1.08;box(3.85,.67,.03,0,y,0,mat.salmon,left);for(const x of [-1.25,0,1.25]){box(.81,.69,.055,x,y,.03,mat.frame,left);box(.72,.6,.06,x,y,.065,mat.glass,left);}box(1.65,.07,.65,-.55,y-.4,.24,mat.wall,left);box(1.65,.37,.06,-.55,y-.19,.55,mat.wall,left);}
 // Entrance, hedge, paved approach and the visible garage at the left.
 box(.8,1.02,.075,1.4,.53,front+.08,mat.glass);box(1.17,.09,.5,1.4,1.08,front+.18,mat.wall);
 box(14.2,.38,.25,.8,.19,2.12);box(13.9,.52,.6,.8,.53,1.79,mat.hedge);
 box(2.8,.85,1.4,-7.42,.43,1.37,mat.salmon);box(1.9,.7,.05,-7.42,.36,2.1,mat.rail);for(let i=0;i<17;i++)box(.025,.64,.02,-8.28+i*.108,.36,2.14,mat.roof);
 box(3.3,.13,1.65,-7.4,.92,1.32,mat.wall);box(3.4,.07,1.4,-7.4,.04,2.78,mat.path);box(.16,.48,1.45,-9.01,.24,2.62);box(.16,.45,1.45,-5.8,.23,2.62);
 function tree(x,z,s=1){const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.065*s,.11*s,1.6*s,8),mat.stem);trunk.position.set(x,.8*s,z);trunk.castShadow=true;group.add(trunk);for(let i=0;i<4;i++){const crown=new THREE.Mesh(new THREE.IcosahedronGeometry((.67-i*.04)*s,2),i%2?mat.leaf2:mat.leaf);crown.position.set(x+Math.sin(i*2)*.29*s,(1.65+i*.2)*s,z+Math.cos(i*2)*.25*s);crown.scale.y=1.12;crown.castShadow=true;group.add(crown);}}
 tree(-8.7,-2.1,1.4);tree(8.55,-1.9,1.4);tree(-3.95,2.9,.78);tree(5.9,2.85,.84);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(45,45),new THREE.ShadowMaterial({opacity:.12}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.31;shadow.receiveShadow=true;scene.add(shadow);
 const resize=()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height)return false;const a=width/height,vertical=Math.max(6.5,11.5/a);camera.left=-vertical*a;camera.right=vertical*a;camera.top=vertical;camera.bottom=-vertical;camera.updateProjectionMatrix();renderer.setSize(width,height);renderer.render(scene,camera);return true;};
 if(!resize()){renderer.dispose();renderer.domElement.remove();return false;}
 const observer=new ResizeObserver(resize);observer.observe(host);host.dataset.ready='true';
 renderer.domElement.addEventListener('webglcontextlost',()=>{observer.disconnect();delete host.dataset.ready;onFailure();},{once:true});
 let target=0,current=0,frame=0;const draw=()=>{current+=(target-current)*.1;group.rotation.y=current;renderer.render(scene,camera);if(Math.abs(target-current)>.0005)frame=requestAnimationFrame(draw);else frame=0;};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');host.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||reduced.matches)return;const r=host.getBoundingClientRect();target=((e.clientX-r.left)/r.width-.5)*.16;if(!frame)draw();});host.addEventListener('pointerleave',()=>{target=0;if(!frame)draw();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}});return true;
}
