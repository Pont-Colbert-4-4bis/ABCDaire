import * as THREE from 'three';
export function mountScene(){
 const host=document.querySelector('#scene');if(!host)return;
 let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;host.append(renderer.domElement);
 renderer.domElement.setAttribute('aria-hidden','true');const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(-7,7,6.2,-6.2,.1,100);camera.position.set(12,10,16);camera.lookAt(0,2.5,0);
 scene.add(new THREE.HemisphereLight(0xf7faf3,0x64745a,2.5));const sun=new THREE.DirectionalLight(0xfff1d5,3.1);sun.position.set(-5,12,9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=14;sun.shadow.camera.bottom=-12;sun.shadow.normalBias=.025;scene.add(sun);
 const group=new THREE.Group();scene.add(group);
 const materials={wall:0xeae7d9,side:0xdcd9c9,roof:0x374c56,glass:0x35596a,rail:0xf8f7ee,stem:0x77634d,leaf:0x597346,leaf2:0x76945b,path:0xdfd9c7,ground:0xb9c99e,hedge:0x4c6942};const mat=Object.fromEntries(Object.entries(materials).map(([k,v])=>[k,new THREE.MeshStandardMaterial({color:v,roughness:.85})]));
 function box(w,h,d,x,y,z,m=mat.wall,parent=group){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 const base=new THREE.Mesh(new THREE.CylinderGeometry(6.5,6.5,.23,64),mat.ground);base.scale.z=.74;base.position.y=-.12;base.receiveShadow=true;group.add(base);
 box(10,.035,1.1,0,.02,2.5,mat.path);box(1.25,.04,4,0,.03,1.2,mat.path);
 function building(x,z,w,h,d,floors){box(w,h,d,x,h/2,z);box(w+.18,.22,d+.18,x,h+.1,z,mat.roof);box(w+.12,.2,d+.12,x,.1,z,mat.side);
 const front=z+d/2;for(let floor=0;floor<floors;floor++){const y=.9+floor*(h-.85)/floors;for(let col=0;col<3;col++){const xx=x+(col-1)*w*.28;box(w*.18,.6,.04,xx,y,front+.025,mat.glass);box(w*.245,.09,.56,xx,y-.35,front+.24,mat.rail);box(w*.245,.31,.04,xx,y-.16,front+.51,mat.rail);for(let r=-1;r<=1;r++)box(.025,.33,.035,xx+r*w*.085,y-.17,front+.51,mat.side);}
 for(let q=0;q<2;q++){box(.04,.62,.48,x+w/2+.025,y,z+(q-.5)*d*.55,mat.glass);}}
 box(.6,.9,.05,x,.55,front+.06,mat.roof);box(.82,.09,.65,x,1.02,front+.25,mat.side);
 }
 building(-2.0,-.9,3.1,5.7,2.35,5);building(1.85,-1.1,3.25,6.75,2.3,6);
 function tree(x,z,s=1){const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.09*s,.12*s,1.2*s,8),mat.stem);trunk.position.set(x,.6*s,z);trunk.castShadow=true;group.add(trunk);for(let i=0;i<3;i++){const canopy=new THREE.Mesh(new THREE.IcosahedronGeometry((.65-i*.08)*s,2),i%2?mat.leaf2:mat.leaf);canopy.position.set(x+(i===1?.28:0)*s,(1.2+i*.35)*s,z+(i===2?.16:0)*s);canopy.castShadow=true;group.add(canopy);}}
 tree(-4.35,.9,1.13);tree(4.35,.25,1.25);tree(-3.6,3.1,.72);tree(3.6,3.35,.86);tree(-4,-2.8,.8);
 box(2.2,.46,.44,-2.0,.26,3.3,mat.hedge);box(1.6,.43,.46,1.5,.25,3.45,mat.hedge);
 box(1.2,.09,.4,-.8,.45,3.0,mat.stem);box(.08,.42,.3,-1.25,.22,3,mat.roof);box(.08,.42,.3,-.35,.22,3,mat.roof);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(35,35),new THREE.ShadowMaterial({opacity:.14}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.25;shadow.receiveShadow=true;scene.add(shadow);
 const resize=()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height)return;const a=width/height;camera.left=-6.2*a;camera.right=6.2*a;camera.top=6.2;camera.bottom=-6.2;camera.updateProjectionMatrix();renderer.setSize(width,height);renderer.render(scene,camera);};
 const observer=new ResizeObserver(resize);observer.observe(host);resize();host.closest('.hero-art').querySelector('.illustration').hidden=true;host.dataset.ready='true';
 let target=0,current=0,frame=0;const draw=()=>{current+=(target-current)*.1;group.rotation.y=current;renderer.render(scene,camera);if(Math.abs(target-current)>.0005)frame=requestAnimationFrame(draw);else frame=0;};
 host.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=host.getBoundingClientRect();target=((e.clientX-r.left)/r.width-.5)*.22;if(!frame)draw();});host.addEventListener('pointerleave',()=>{target=0;if(!frame)draw();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}});
}
