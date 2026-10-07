import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import validator from 'gltf-validator';

const file=process.argv[2]||'assets/models/villa-colbert.glb';
const bytes=await readFile(file);
assert.equal(bytes.toString('ascii',0,4),'glTF','GLB magic');
assert.equal(bytes.readUInt32LE(4),2,'glTF version 2');
assert.equal(bytes.readUInt32LE(8),bytes.length,'Complete GLB');
const json=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)));
const report=await validator.validateBytes(new Uint8Array(bytes),{uri:file,maxIssues:100});
if(process.env.MODEL_REPORT)await writeFile(process.env.MODEL_REPORT,JSON.stringify(report,null,2));
assert.equal(report.issues.numErrors,0,JSON.stringify(report.issues));
const unexpected=report.issues.messages.filter(i=>i.severity===1&&i.code!=='UNSUPPORTED_EXTENSION');
assert.equal(unexpected.length,0,JSON.stringify(unexpected));
assert((json.buffers||[]).every(b=>!b.uri),'No external buffers');
assert((json.images||[]).every(i=>!i.uri),'No external textures');
const anchors=Object.fromEntries(['entree-4bis','entree-4','parking-bas','parking-haut'].map(name=>{
 const matches=json.nodes.filter(n=>n.name===name);assert.equal(matches.length,1,`One anchor: ${name}`);return[name,matches[0].translation];
}));
assert(anchors['entree-4bis'][0]<anchors['entree-4'][0],'4 bis left of 4');
assert(anchors['parking-bas'][0]<anchors['parking-haut'][0]&&anchors['parking-haut'][0]<anchors['entree-4bis'][0],'Both garages left of 4 bis');
assert(anchors['parking-bas'][1]<anchors['parking-haut'][1],'Distinct garage levels');
const triangles=json.meshes.reduce((n,m)=>n+m.primitives.reduce((n,p)=>n+json.accessors[p.indices].count/3,0),0);
if(file.startsWith('assets/')){
 assert(bytes.length<750_000,'Web GLB < 750 KB');assert(json.meshes.length<=35,'Web draw-call budget');
 const meta=JSON.parse(await readFile('assets/models/villa-colbert.json','utf8'));
 assert.equal(triangles,meta.triangles,'Triangle metadata matches geometry');
 assert.equal(bytes.length,meta.webBytes);
}
console.log(JSON.stringify({file,bytes:bytes.length,meshes:json.meshes.length,triangles,errors:report.issues.numErrors,warnings:report.issues.numWarnings,notes:[...new Set(report.issues.messages.map(i=>i.code))]}));
