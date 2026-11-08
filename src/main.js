import * as THREE from 'three';
import './style.css';

const $ = (id) => document.getElementById(id);
const viewport = $('viewport');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090909);
scene.fog = new THREE.Fog(0x090909, 180, 650);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 1200);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
viewport.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x333333, 2.0));
const sun = new THREE.DirectionalLight(0xffffff, 3.0);
sun.position.set(-90, 160, 80); sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-220;sun.shadow.camera.right=220;sun.shadow.camera.top=220;sun.shadow.camera.bottom=-220;
scene.add(sun);

const mat = (color, roughness=0.85, metalness=0) => new THREE.MeshStandardMaterial({color,roughness,metalness});
const asphalt=mat(0x202020), grass=mat(0x111111), barrierMat=mat(0xbdbdbd), darkMat=mat(0x080808), whiteMat=mat(0xf2f2f2), rubber=mat(0x050505), glass=mat(0x777777,.25,.3);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),grass);ground.rotation.x=-Math.PI/2;ground.position.y=-.65;ground.receiveShadow=true;scene.add(ground);

// A closed, flowing road with several hairpins and sweeping bends.
const routePoints=[
  [-175,-75],[-105,-75],[-20,-75],[70,-75],[145,-75],
  [172,-52],[180,-15],[180,25],[165,58],[135,75],
  [65,75],[-25,75],[-115,75],[-165,75],
  [-190,52],[-195,15],[-195,-25],[-185,-55]
].map(([x,z])=>new THREE.Vector3(x,0,z));
const route=new THREE.CatmullRomCurve3(routePoints,true,'catmullrom',.18);
const LENGTH=route.getLength(), ROAD=17, SEG=520;
function frameAt(t){const p=route.getPointAt((t%1+1)%1), tangent=route.getTangentAt((t%1+1)%1).normalize();const side=new THREE.Vector3(-tangent.z,0,tangent.x);return {p,tangent,side};}
function ribbon(width,y,material,offset=0){
 const verts=[],indices=[];for(let i=0;i<=SEG;i++){const t=i/SEG,{p,side}=frameAt(t);for(const s of [-1,1])verts.push(p.x+side.x*(s*width/2+offset),y,p.z+side.z*(s*width/2+offset));if(i<SEG){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setIndex(indices);g.computeVertexNormals();const m=new THREE.Mesh(g,material);m.receiveShadow=true;scene.add(m);return m;
}
ribbon(ROAD,-.48,asphalt);
ribbon(ROAD+1.2,-.45,barrierMat);
ribbon(ROAD-1.1,-.445,darkMat);
ribbon(.25,-.43,mat(0x777777));
ribbon(.18,-.425,whiteMat,ROAD*.34);ribbon(.18,-.425,whiteMat,-ROAD*.34);

// Road edge kerbs, broken into alternating monochrome blocks.
for(let sideSign of [-1,1]){
 for(let i=0;i<SEG;i+=2){const t=i/SEG,{p,side}=frameAt(t);const q=frameAt((i+1)/SEG);const a=p.clone().addScaledVector(side,sideSign*(ROAD/2+.5));const b=q.p.clone().addScaledVector(q.side,sideSign*(ROAD/2+.5));const geo=new THREE.BoxGeometry(a.distanceTo(b)+.25,.22,.9);const m=new THREE.Mesh(geo,i%4===0?whiteMat:darkMat);m.position.set((a.x+b.x)/2,-.24,(a.z+b.z)/2);m.rotation.y=-Math.atan2(b.z-a.z,b.x-a.x);m.receiveShadow=true;scene.add(m);}
}
// Continuous outside safety barriers and repeated supports.
for(let sideSign of [-1,1]){
 for(let i=0;i<SEG;i+=3){const t=i/SEG,{p,side}=frameAt(t);const pos=p.clone().addScaledVector(side,sideSign*(ROAD/2+4));const post=new THREE.Mesh(new THREE.BoxGeometry(.65,2.3,.65),barrierMat);post.position.set(pos.x,.65,pos.z);post.castShadow=true;scene.add(post);}
 for(let i=0;i<SEG;i+=1){const t=i/SEG,{p,side}=frameAt(t);const pos=p.clone().addScaledVector(side,sideSign*(ROAD/2+4));const rail=new THREE.Mesh(new THREE.BoxGeometry(.45,.38,1.15),whiteMat);rail.position.set(pos.x,1.35,pos.z);rail.rotation.y=Math.atan2(side.x,side.z);scene.add(rail);}
}
// Start / finish stripe across the road.
{
 const {p,side,tangent}=frameAt(0);const stripe=new THREE.Group();
 for(let i=0;i<18;i++){const tile=new THREE.Mesh(new THREE.BoxGeometry(ROAD/18,.035,2.1),i%2?darkMat:whiteMat);tile.position.set(side.x*(-ROAD/2+(i+.5)*ROAD/18),-.19,0);stripe.add(tile);}
 stripe.position.set(p.x,-.05,p.z);stripe.rotation.y=Math.atan2(tangent.x,tangent.z);scene.add(stripe);
}
// Trackside floodlights, grandstand-like structures and sparse monochrome scenery.
for(let i=0;i<40;i++){const t=i/40,{p,side}=frameAt(t);for(let s of [-1,1]){
 const at=p.clone().addScaledVector(side,s*(ROAD/2+13));const pole=new THREE.Mesh(new THREE.CylinderGeometry(.18,.25,12,8),barrierMat);pole.position.set(at.x,5.5,at.z);scene.add(pole);
 const arm=new THREE.Mesh(new THREE.BoxGeometry(3,.22,.25),whiteMat);arm.position.set(at.x-s*1.2,11.2,at.z);scene.add(arm);
 const lamp=new THREE.Mesh(new THREE.BoxGeometry(2.3,.18,1),whiteMat);lamp.position.set(at.x-s*1.5,11.05,at.z);scene.add(lamp);
}}
for(let i=0;i<16;i++){const t=(i/16+.025)%1,{p,side}=frameAt(t);const at=p.clone().addScaledVector(side,(i%2?1:-1)*(ROAD/2+25));const block=new THREE.Mesh(new THREE.BoxGeometry(19,5,8),i%2?barrierMat:darkMat);block.position.set(at.x,1.8,at.z);block.rotation.y=Math.atan2(side.x,side.z);scene.add(block);}

// Car builder: stylised but fully 3D open-wheel single-seater with wheels and aero.
function buildCar(bodyColor=0xe8e8e8, accent=0x111111){
 const group=new THREE.Group();const body=mat(bodyColor,.32,.25),accentMat=mat(accent,.45,.15);
 const add=(geo,material,x,y,z,rx=0,ry=0,rz=0)=>{const mesh=new THREE.Mesh(geo,material);mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,rz);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;};
 add(new THREE.BoxGeometry(1.65,.34,3.4),body,0,.58,0);
 add(new THREE.BoxGeometry(1.15,.28,2.0),body,0,.75,-.05);
 add(new THREE.ConeGeometry(.58,2.4,4),body,0,.55,2.45,Math.PI/2,0,0);
 add(new THREE.BoxGeometry(2.5,.15,.42),accentMat,0,.42,3.25);
 add(new THREE.BoxGeometry(2.65,.16,.48),accentMat,0,.38,-2.0);
 add(new THREE.BoxGeometry(2.8,.16,.48),body,0,1.05,-2.12);
 add(new THREE.CylinderGeometry(.49,.49,.18,24),rubber,-1.02,.48,1.65,0,0,Math.PI/2);
 add(new THREE.CylinderGeometry(.49,.49,.18,24),rubber,1.02,.48,1.65,0,0,Math.PI/2);
 add(new THREE.CylinderGeometry(.49,.49,.18,24),rubber,-1.02,.48,-1.55,0,0,Math.PI/2);
 add(new THREE.CylinderGeometry(.49,.49,.18,24),rubber,1.02,.48,-1.55,0,0,Math.PI/2);
 for(const x of [-1.02,1.02])for(const z of [1.65,-1.55]){
  add(new THREE.CylinderGeometry(.24,.24,.2,20),accentMat,x,.48,z,0,0,Math.PI/2);
 }
 add(new THREE.SphereGeometry(.5,20,12),glass,0,.98,-.15);
 add(new THREE.BoxGeometry(.12,.55,.12),accentMat,0,.95,-.75);
 add(new THREE.BoxGeometry(.18,.16,.9),whiteMat,0,.9,-.8);
 return group;
}

const playerCar=buildCar(0xf2f2f2,0x111111);scene.add(playerCar);
const rivals=[];
const rivalColors=[0xbdbdbd,0x888888,0xeeeeee,0x666666,0xaaaaaa,0x999999,0xd0d0d0,0x777777,0xc0c0c0];
for(let i=0;i<9;i++){const car=buildCar(rivalColors[i],i%2?0x222222:0x050505);scene.add(car);rivals.push({mesh:car,t:(.025+i*.105)%1,lane:(i%3-1)*2.2,speed:42+(i%4)*1.6,lap:0,finished:false});}

const state={running:false,paused:false,done:false,elapsed:0,speed:0,heading:0,steer:0,damage:0,lap:0,progress:0,lastT:0,position:10,cameraMode:0,crashCooldown:0};
const keys={};const touch={};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function nearestTrack(pos){let best={d:Infinity,t:0,p:null,side:null,tangent:null};for(let i=0;i<SEG;i+=2){const t=i/SEG,{p,side,tangent}=frameAt(t);const d=pos.distanceToSquared(p);if(d<best.d)best={d,t,p,side,tangent};}return best;}
function updatePlayer(dt){
 const throttle=keys.KeyW||keys.ArrowUp||touch.accelerate;
 const reverse=keys.KeyS||keys.ArrowDown||touch.brake;
 const left=keys.KeyA||keys.ArrowLeft||touch.left,right=keys.KeyD||keys.ArrowRight||touch.right;
 // Positive steering is now left; this matches the on-screen arrow direction.
 const steerInput=(left?1:0)-(right?1:0);
 const maxSpeed=78*(1-state.damage*.006);
 if(throttle){
   if(state.speed<0)state.speed=Math.min(0,state.speed+65*dt);
   else state.speed+=35*dt;
 }else if(reverse){
   if(state.speed>0)state.speed=Math.max(0,state.speed-68*dt);
   else state.speed-=22*dt;
 }else{
   state.speed-=Math.sign(state.speed)*Math.min(Math.abs(state.speed),5.5*dt);
 }
 state.speed=clamp(state.speed,-22,maxSpeed);
 const steeringFactor=clamp(Math.abs(state.speed)/18,.15,1);
 state.steer+=(steerInput-state.steer)*Math.min(1,dt*7);
 state.heading+=state.steer*steeringFactor*1.28*dt*(state.speed/35);
 const forward=new THREE.Vector3(Math.sin(state.heading),0,Math.cos(state.heading));
 playerCar.position.addScaledVector(forward,state.speed*dt);
 playerCar.rotation.y=state.heading;
 const track=nearestTrack(playerCar.position);
 const offset=playerCar.position.clone().sub(track.p).dot(track.side);
 if(Math.abs(offset)>ROAD*.5-1.2){
   state.speed*=Math.max(.2,1-2.5*dt);
   if(state.crashCooldown<=0){state.damage=clamp(state.damage+Math.min(18,Math.abs(offset)*.65),0,85);state.crashCooldown=1.0;flashMessage('BARRIER IMPACT · DAMAGE');}
   playerCar.position.copy(track.p).addScaledVector(track.side,Math.sign(offset)*(ROAD*.5-1.5));
   playerCar.position.y=-.48;
   const tangentAngle=Math.atan2(track.tangent.x,track.tangent.z);
   state.heading=tangentAngle+(offset>0?-.12:.12);
 }
 // Car-to-car collisions.
 for(const rival of rivals){const rp=rival.mesh.position;const dist=playerCar.position.distanceTo(rp);if(dist<3.6&&state.crashCooldown<=0){
   state.speed*=.48;state.damage=clamp(state.damage+12,0,90);state.crashCooldown=1.15;
   const push=playerCar.position.clone().sub(rp).normalize();playerCar.position.addScaledVector(push,1.8);flashMessage('CAR CONTACT · DAMAGE');
 }}
 state.crashCooldown=Math.max(0,state.crashCooldown-dt);
 const t=track.t;let delta=t-state.lastT;if(delta<-.5)delta+=1;if(delta>.5)delta-=1;
 if(delta>0)state.progress+=delta*LENGTH;
 state.lastT=t;
 const newLap=Math.floor(state.progress/LENGTH);
 if(newLap>state.lap){state.lap=Math.min(5,newLap);$('lap').textContent=`${state.lap} / 5`;if(state.lap>=5)finishRace();}
}
function updateRivals(dt){
 for(const r of rivals){
  if(r.finished)continue;
  r.t+=r.speed*dt/LENGTH;if(r.t>=1){r.t-=1;r.lap++;}
  const {p,tangent,side}=frameAt(r.t);
  r.mesh.position.set(p.x+side.x*r.lane,-.48,p.z+side.z*r.lane);
  r.mesh.rotation.y=Math.atan2(tangent.x,tangent.z);
 }
}
function updatePosition(){
 const playerScore=state.progress;let ahead=0;
 for(const r of rivals){const score=r.lap*LENGTH+r.t*LENGTH;if(score>playerScore)ahead++;}
 state.position=10-ahead;$('position').textContent=`${state.position} / 10`;
}
let flashTimer=0;
function flashMessage(msg){const el=$('message');if(!state.running)return;el.style.display='grid';el.innerHTML=`<div class="message-panel" style="padding:15px 25px;width:auto"><strong style="letter-spacing:.15em">${msg}</strong></div>`;clearTimeout(flashTimer);flashTimer=setTimeout(()=>{if(state.running)el.style.display='none';},850);}
function finishRace(){if(state.done)return;state.done=true;state.running=false;$('finish-title').textContent=state.position===1?'YOU WIN':'RACE COMPLETE';$('finish-copy').textContent=`Finished ${state.position}${state.position===1?'st':state.position===2?'nd':state.position===3?'rd':'th'} · ${formatTime(state.elapsed)} · 5 / 5 laps`;$('finish').classList.remove('hidden');}
function formatTime(t){const m=Math.floor(t/60),s=(t%60).toFixed(3).padStart(6,'0');return `${String(m).padStart(2,'0')}:${s}`;}
function updateCamera(dt){
 const fwd=new THREE.Vector3(Math.sin(state.heading),0,Math.cos(state.heading));
 if(state.cameraMode===0){
  const desired=playerCar.position.clone().addScaledVector(fwd,-13);desired.y+=7.2;
  camera.position.lerp(desired,1-Math.exp(-4*dt));
  const look=playerCar.position.clone().addScaledVector(fwd,8);look.y+=1.2;camera.lookAt(look);
 }else{
  const desired=playerCar.position.clone().add(new THREE.Vector3(0,2.0,0)).addScaledVector(fwd,.25);
  camera.position.lerp(desired,1-Math.exp(-9*dt));camera.lookAt(playerCar.position.clone().addScaledVector(fwd,25).add(new THREE.Vector3(0,1.2,0)));
 }
}
function animate(now){
 requestAnimationFrame(animate);const dt=Math.min((now-lastFrame)/1000,.04);lastFrame=now;
 if(state.running&&!state.paused){
  state.elapsed+=dt;updatePlayer(dt);updateRivals(dt);updatePosition();
  $('time').textContent=formatTime(state.elapsed);$('speed').textContent=Math.round(state.speed*3.6);
  $('damage-bar').style.width=`${100-state.damage}%`;$('damage-text').textContent=`${Math.round(100-state.damage)}%`;
 }
 updateCamera(dt||.016);renderer.render(scene,camera);
}
let lastFrame=performance.now();requestAnimationFrame(animate);

function setCamera(){state.cameraMode=1-state.cameraMode;const name=state.cameraMode?'COCKPIT':'CHASE';$('camera-label').textContent=`${name} CAMERA · C`;$('camera-button').textContent=`CAMERA: ${name}`;}
function resetRace(){
 state.running=false;state.paused=false;state.done=false;state.elapsed=0;state.speed=0;state.heading=0;state.steer=0;state.damage=0;state.lap=0;state.progress=0;state.crashCooldown=0;
 const spawn=frameAt(.005);playerCar.position.copy(spawn.p).addScaledVector(spawn.side,-3);playerCar.position.y=-.48;state.heading=Math.atan2(spawn.tangent.x,spawn.tangent.z);state.lastT=.005;
 rivals.forEach((r,i)=>{r.t=(.04+i*.105)%1;r.lap=0;r.finished=false;});
 $('lap').textContent='0 / 5';$('position').textContent='10 / 10';$('speed').textContent='0';$('time').textContent='00:00.000';$('damage-bar').style.width='100%';$('damage-text').textContent='100%';
 $('finish').classList.add('hidden');$('message').style.display='grid';$('message').innerHTML=`<div class="message-panel"><span class="eyebrow">5 LAP WORLD CHAMPIONSHIP</span><h1>LIGHTS OUT.</h1><p>One circuit. Nine rivals. Five laps.</p><button id="start-button" class="primary">START RACE <span>↗</span></button><div class="instructions">W / ↑ ACCELERATE · S / ↓ REVERSE · A D / ← → STEER · C CAMERA</div></div>`;$('start-button').addEventListener('click',startRace);
}
function startRace(){if(state.done)return;state.running=true;state.paused=false;$('message').style.display='none';$('pause-button').textContent='PAUSE';}
$('start-button').addEventListener('click',startRace);$('again-button').addEventListener('click',resetRace);$('camera-button').addEventListener('click',setCamera);
$('pause-button').addEventListener('click',()=>{if(!state.running)return;state.paused=!state.paused;$('pause-button').textContent=state.paused?'RESUME':'PAUSE';if(state.paused){$('message').style.display='grid';$('message').innerHTML='<div class="message-panel"><h1>PAUSED</h1><p>Take a breath. The circuit can wait.</p><button id="resume-button" class="primary">RESUME RACE ↗</button></div>';$('resume-button').addEventListener('click',()=>{$('message').style.display='none';state.paused=false;$('pause-button').textContent='PAUSE';});}else $('message').style.display='none';});
window.addEventListener('keydown',e=>{keys[e.code]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.code==='KeyC'&&!e.repeat)setCamera();if(e.code==='Escape'&&state.running)$('pause-button').click();});
window.addEventListener('keyup',e=>keys[e.code]=false);
document.querySelectorAll('[data-control]').forEach(btn=>{const k=btn.dataset.control;const down=e=>{e.preventDefault();touch[k]=true;};const up=e=>{e.preventDefault();touch[k]=false;};btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('lostpointercapture',up);});
window.addEventListener('blur',()=>{Object.keys(keys).forEach(k=>keys[k]=false);Object.keys(touch).forEach(k=>touch[k]=false);});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));});
resetRace();
