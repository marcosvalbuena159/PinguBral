// ═══════════════════════════════════════════════════════
//  JUEGO.JS — Motor del modo 1 vs 1 (offline local)
//  Depende de: main.js (CHARS, CICONS), perfil-monedero.js
//  Variables globales que usa: canvas, ctx, keys, p1, p2,
//  particles, projs, effects, floats, blades, shake, stats,
//  base1, base2, running, animId, p1k, p2k, bgT
// ═══════════════════════════════════════════════════════

// ── Constantes del juego ─────────────────────────────
var CW=typeof CW!=="undefined"?CW:860,CH=typeof CH!=="undefined"?CH:520,CS=typeof CS!=="undefined"?CS:34;
var BHP=typeof BHP!=="undefined"?BHP:1400,BW=typeof BW!=="undefined"?BW:52,BH=typeof BH!=="undefined"?BH:64,RESP=typeof RESP!=="undefined"?RESP:300;
var TILE=typeof TILE!=="undefined"?TILE:20;
var MAXBL=typeof MAXBL!=="undefined"?MAXBL:10;

// ── Estado global del juego ──────────────────────────
if(typeof canvas==="undefined"){var canvas=null;} if(typeof ctx==="undefined"){var ctx=null;}
if(typeof running==="undefined"){var running=false;} if(typeof animId==="undefined"){var animId=null;}
if(typeof keys==="undefined"){var keys={};} if(typeof p1==="undefined"){var p1=null;} if(typeof p2==="undefined"){var p2=null;}
if(typeof particles==="undefined"){var particles=[];} if(typeof projs==="undefined"){var projs=[];}
if(typeof effects==="undefined"){var effects=[];} if(typeof floats==="undefined"){var floats=[];}
if(typeof blades==="undefined"){var blades=[];}
if(typeof shake==="undefined"){var shake={x:0,y:0,d:0};} if(typeof bgT==="undefined"){var bgT=[];}
if(typeof p1k==="undefined"){var p1k=null;} if(typeof p2k==="undefined"){var p2k=null;}
if(typeof base1==="undefined"){var base1=null;} if(typeof base2==="undefined"){var base2=null;}
if(typeof stats==="undefined"){var stats={p1:{dmg:0,kills:0,deaths:0},p2:{dmg:0,kills:0,deaths:0}};}

// ── Mapa: paredes y arbustos ─────────────────────────
const WALLS=[
  {x:0,y:0,w:CW,h:36},{x:0,y:CH-36,w:CW,h:36},
  {x:0,y:0,w:36,h:CH},{x:CW-36,y:0,w:36,h:CH},
  {x:340,y:200,w:180,h:32,t:'rock'},{x:340,y:288,w:180,h:32,t:'rock'},
  {x:110,y:140,w:75,h:75,t:'ice'},{x:675,y:305,w:75,h:75,t:'ice'},
  {x:165,y:340,w:58,h:52,t:'rock'},{x:637,y:128,w:58,h:52,t:'rock'},
  {x:310,y:100,w:48,h:48,t:'ice'},{x:502,y:372,w:48,h:48,t:'ice'},
];
if(typeof BUSHES==="undefined"){var BUSHES=[
  {x:148,y:188,w:88,h:72},{x:624,y:260,w:88,h:72},
  {x:376,y:118,w:80,h:68},{x:396,y:328,w:80,h:68},
  {x:228,y:372,w:80,h:64},{x:552,y:72,w:80,h:64},
];}

function hitW(x,y,w,h){for(const W of WALLS){if(x<W.x+W.w&&x+w>W.x&&y<W.y+W.h&&y+h>W.y)return true;}return false;}
function inBush(p){for(const b of BUSHES){if(p.cx>b.x+8&&p.cx<b.x+b.w-8&&p.cy>b.y+8&&p.cy<b.y+b.h-8)return b;}return null;}
function hidden(p,enemy){const pb=inBush(p);if(!pb)return false;const eb=inBush(enemy);return!eb||pb!==eb;}
function initBases(){
  base1={x:44,y:CH/2-BH/2,hp:BHP,max:BHP,owner:1,hit:0};
  base2={x:CW-44-BW,y:CH/2-BH/2,hp:BHP,max:BHP,owner:2,hit:0};
}

// ── Estadísticas en pantalla ─────────────────────────
function addDmg(o,d){if(o===p1)stats.p1.dmg+=d;else stats.p2.dmg+=d;updStats();}
function addKill(k){if(k===p1){stats.p1.kills++;stats.p2.deaths++;}else{stats.p2.kills++;stats.p1.deaths++;}updStats();}
function updStats(){
  const h=id=>document.getElementById(id);if(!h('sb1d'))return;
  h('sb1d').textContent=stats.p1.dmg;h('sb2d').textContent=stats.p2.dmg;
  h('sb1k').textContent=stats.p1.kills+'/'+stats.p1.deaths;
  h('sb2k').textContent=stats.p2.kills+'/'+stats.p2.deaths;
  if(p1&&p2){h('sb1n').textContent=p1.name;h('sb2n').textContent=p2.name;h('sb1n').style.color=p1.color;h('sb2n').style.color=p2.color;}
  const min=Math.min(base1?base1.hp/BHP:1,base2?base2.hp/BHP:1);
  h('sbph').textContent=min>0.6?'🧊':min>0.3?'⚔️':'💀';
}

// ── Audio ────────────────────────────────────────────
if(typeof _ac==="undefined"){var _ac=null;}
function sfx(t){
  try{
    if(!_ac)_ac=new(window.AudioContext||window.webkitAudioContext)();
    const a=_ac,o=a.createOscillator(),g=a.createGain();
    o.connect(g);g.connect(a.destination);const T=a.currentTime;
    const C={
      ice:[600,300,.08,'square',.06],wave:[200,400,.2,'sawtooth',.07],
      bomb:[300,80,.3,'triangle',.13],boom:[120,40,.5,'sawtooth',.16],
      hook:[500,800,.15,'square',.11],recall:[600,200,.3,'sawtooth',.12],
      zap:[900,400,.12,'square',.09],thunder:[150,50,.5,'sawtooth',.16],
      hit:[200,100,.08,'sine',.06],base_hit:[160,80,.15,'square',.16],
      respawn:[300,700,.3,'sine',.09],base_die:[70,25,.9,'sawtooth',.25],
      bush:[400,600,.1,'sine',.04],fire_exp:[350,120,.25,'sawtooth',.13],
      water_ray:[700,500,.08,'sine',.07],freeze:[800,200,.35,'square',.11],
      quake:[80,40,.4,'sawtooth',.18],buff:[500,900,.2,'sine',.1],
      pull:[400,200,.2,'sawtooth',.12],jump_land:[100,50,.35,'sawtooth',.22],
      dodge:[700,1800,.1,'sine',.08],dash_hit:[400,150,.15,'square',.13],
      frenzy:[600,800,.05,'square',.1],spear:[800,400,.07,'sawtooth',.07],
      shield_on:[400,700,.1,'sine',.08],
    };
    const c=C[t]||C.hit;
    o.type=c[3];o.frequency.setValueAtTime(c[0],T);
    o.frequency.exponentialRampToValueAtTime(c[1],T+c[2]);
    g.gain.setValueAtTime(c[4],T);g.gain.exponentialRampToValueAtTime(.001,T+c[2]+.04);
    o.start(T);o.stop(T+c[2]+.08);
  }catch(e){}
}

// ── Partículas y efectos ─────────────────────────────
function addPt(x,y,col,vx,vy,r,l){particles.push({x,y,col,vx,vy,r,l,ml:l});}
function addFl(x,y,txt,col){floats.push({x,y,txt,col,vy:-1.2,l:70});}
function shk(x,y){shake.x=x;shake.y=y;shake.d=12;}
function myBl(p){return blades.filter(b=>b.owner===p).length;}

// ── Creación de jugador ──────────────────────────────
function mkP(ck,isP1){
  const d=CHARS[ck];
  return{
    ck,isP1,name:d.name,icon:d.icon,color:d.color,hat:d.hat,body:d.body,
    x:isP1?80:CW-80-CS, y:CH/2-CS/2,
    cx:0,cy:0,
    hp:d.hp,maxHp:d.hp,spd:d.spd,
    facing:isP1?1:-1,dead:false,rT:0,
    q_t:0,w_t:0,e_t:0,
    slowed:0,frozenSkills:0,frozen:0,rooted:0,poisoned:0,poisonSrc:null,burnT:0,
    buffActive:false,buffTimer:0,
    invincible:0,shield:0,
    charges:0,energyForm:false,eT:0,
    dodging:false,frenzying:false,
    jumpT:0,jumping:false,jumpTarget:null,jumpIsGuerrero:false,
    jumpVX:0,jumpVY:0,
    gSpeedBuff:false,gSpeedTimer:0,
    cfCompressed:0,
    natVortexActive:false,natVortexT:0,
    cfShieldT:0,
  };
}

// ── Movimiento ───────────────────────────────────────
function moveP(p,ku,kd,kl,kr){
  if(p.dead||p.jumping||p.frozen>0)return;
  p.cx=p.x+CS/2;p.cy=p.y+CS/2;
  let spd=p.spd*(p.slowed>0?.5:1);
  if(p.buffActive&&p.ck==='fortachon')spd*=1.35;
  if(p.gSpeedBuff)spd*=1.4;
  let dx=0,dy=0;
  if(keys[ku])dy=-spd;if(keys[kd])dy=spd;
  if(keys[kl])dx=-spd;if(keys[kr])dx=spd;
  if(dx&&dy){dx*=0.707;dy*=0.707;}
  if(dx){if(!hitW(p.x+dx,p.y,CS,CS))p.x+=dx;}
  if(dy){if(!hitW(p.x,p.y+dy,CS,CS))p.y+=dy;}
  p.x=Math.max(36,Math.min(CW-36-CS,p.x));
  p.y=Math.max(36,Math.min(CH-36-CS,p.y));
  p.cx=p.x+CS/2;p.cy=p.y+CS/2;
  // Ataque base a la base enemiga
  const myBase=p.isP1?base1:base2;
  const enBase=p.isP1?base2:base1;
  const bx=enBase.x+BW/2,by=enBase.y+BH/2;
  const dist=Math.hypot(p.cx-bx,p.cy-by);
  if(dist<58&&!p.dead){
    enBase.hp=Math.max(0,enBase.hp-.9);enBase.hit=5;
    sfx('base_hit');
    if(enBase.hp<=0){sfx('base_die');shk(11,26);
      for(let i=0;i<24;i++)addPt(enBase.x+BW/2,enBase.y+BH/2,p.color,(Math.random()-.5)*5,(Math.random()-.5)*5,5,55);
      setTimeout(()=>endGame(enBase.owner===1?p2:p1),350);
    }
  }
  // Combate básico entre jugadores
  const enemy=p===p1?p2:p1;
  const ed=Math.hypot(p.cx-enemy.cx,p.cy-enemy.cy);
  if(ed<CS+4&&!p.dead&&!enemy.dead&&!enemy.invincible){
    dmgP(enemy,.38,p);
  }
}

// ── Daño ─────────────────────────────────────────────
function dmgP(target,amount,src){
  if(target.dead||target.invincible>0)return;
  if(target.shield>0){target.shield=Math.max(0,target.shield-amount);addPt(target.cx,target.cy,'#88ffff',0,-1,2,10);return;}
  target.hp=Math.max(0,target.hp-amount);
  addDmg(src,Math.ceil(amount));
  if(target.hp<=0)killP(target,src);
}
function killP(target,src){
  if(target.dead)return;
  target.dead=true;target.hp=0;
  target.rT=RESP;
  addKill(src);
  shk(8,18);
  addFl(target.cx,target.cy,'💀 KO!',src.color);
  sfx('boom');
  for(let i=0;i<16;i++)addPt(target.cx,target.cy,target.color,(Math.random()-.5)*4,(Math.random()-.5)*4,3,40);
}
function respawnP(p){
  p.dead=false;p.hp=p.maxHp;p.rT=0;
  p.x=p.isP1?80:CW-80-CS;p.y=CH/2-CS/2;
  p.cx=p.x+CS/2;p.cy=p.y+CS/2;
  p.invincible=120;p.slowed=0;p.frozen=0;p.frozenSkills=0;
  p.poisoned=0;p.burnT=0;p.rooted=0;p.cfCompressed=0;
  p.energyForm=false;p.dodging=false;p.frenzying=false;
  sfx('respawn');
  addFl(p.cx,p.cy,'✨ RESPAWN',p.color);
}

// ── Proyectiles ──────────────────────────────────────
function tickProjs(){
  for(let i=projs.length-1;i>=0;i--){
    const pr=projs[i];
    if(pr.type==='water_ray'){pr.life--;if(pr.life<=0){projs.splice(i,1);continue;}
      const enemy=pr.owner===p1?p2:p1;
      if(!enemy.dead){const d=Math.hypot(enemy.cx-pr.tx,enemy.cy-pr.ty);if(d<CS*.6){dmgP(enemy,3.5,pr.owner);pr.life=0;}}
      continue;
    }
    if(pr.type==='bomb'){
      pr.t--;pr.dx+=pr.dvx;pr.dy+=pr.dvy;pr.dvy+=.18;
      if(pr.t<=0){
        const enemy=pr.owner===p1?p2:p1;
        if(!enemy.dead){const d=Math.hypot(enemy.cx-pr.dx,enemy.cy-pr.dy);if(d<55)dmgP(enemy,28,pr.owner);}
        sfx('fire_exp');effects.push({x:pr.dx,y:pr.dy,col:'#ff6622',t:'explosion',l:22,ml:22});
        for(let j=0;j<10;j++)addPt(pr.dx,pr.dy,'#ff8844',(Math.random()-.5)*4,(Math.random()-1)*3,3,25);
        projs.splice(i,1);
      }
      continue;
    }
    pr.x+=pr.vx;pr.y+=pr.vy;pr.life--;
    if(pr.life<=0){projs.splice(i,1);continue;}
    const enemy=pr.owner===p1?p2:p1;
    if(!enemy.dead&&!enemy.invincible){
      const d=Math.hypot(enemy.cx-pr.x,enemy.cy-pr.y);
      if(d<CS*.55+pr.r){
        _hitProj(pr,enemy);projs.splice(i,1);
      }
    }
    if(pr.type==='recall_blade'||pr.type==='ulti_blade')continue;
    if(hitW(pr.x,pr.y,pr.r*2,pr.r*2)){projs.splice(i,1);}
  }
}
function _hitProj(pr,enemy){
  const dmgMap={snowball:18,fireball:22,lava:16,wave:8,zap:14,avalanche:20,freeze_proj:18,vine:12,spear:20};
  const d=dmgMap[pr.type]||10;
  dmgP(enemy,d,pr.owner);
  sfx(pr.type==='snowball'?'ice':pr.type==='fireball'||pr.type==='lava'?'fire_exp':pr.type==='zap'?'zap':'hit');
  if(pr.type==='freeze_proj'){enemy.frozen=180;enemy.frozenSkills=180;effects.push({x:enemy.cx,y:enemy.cy,col:'#aaddff',t:'freeze',l:20,ml:20});}
  if(pr.type==='vine'){enemy.rooted=120;addFl(enemy.cx,enemy.cy,'🌿 RAÍZ',`#44cc22`);}
  addPt(enemy.cx,enemy.cy,pr.col||'#fff',0,-1.5,3,18);
}

// ── Habilidades (delega a los archivos de pingüino) ──
function useSkill(p,enemy,idx){
  if(p.frozenSkills>0||p.frozen>0)return;
  const t=[p.q_t,p.w_t,p.e_t][idx];
  if(t>0)return;
  const fn=window['useSkill_'+p.ck];
  if(typeof fn==='function')fn(p,enemy,idx);
}

// ── Passives (delega a los archivos de pingüino) ─────
function pPass(p,e){const fn=window['pass_polar'];if(fn)fn(p,e);}
function cPass(p,e){const fn=window['pass_chili'];if(fn)fn(p,e);}
function cuPass(p){const fn=window['pass_cuchillas'];if(fn)fn(p);}
function elPass(p,e){const fn=window['pass_electrico'];if(fn)fn(p,e);}
function emPass(p,e){const fn=window['pass_elemental'];if(fn)fn(p,e);}
function ftPass(p,e){const fn=window['pass_fortachon'];if(fn)fn(p,e);}
function vPass(p){const fn=window['pass_velocista'];if(fn)fn(p);}
function gPass(p,e){const fn=window['pass_guerrero'];if(fn)fn(p,e);}
function natPass(p,e){const fn=window['pass_naturaleza'];if(fn)fn(p,e);}
function cfPass(p,e){const fn=window['pass_campos'];if(fn)fn(p,e);}
function tickNatVortex(p,e){const fn=window['tickVortex_naturaleza'];if(fn)fn(p,e);}
function tickVeloFrenzy(p,e){const fn=window['tickFrenzy_velocista'];if(fn)fn(p,e);}
function tickFortaJump(p,e){const fn=window['tickJump_fortachon'];if(fn)fn(p,e);}
function tickGuerreroJump(p,e){const fn=window['tickJump_guerrero'];if(fn)fn(p,e);}

// ── Dibujo del mapa ──────────────────────────────────
function drawMap(){
  // Fondo
  ctx.fillStyle='#0a0e1a';ctx.fillRect(0,0,CW,CH);
  // Grid decorativo
  ctx.strokeStyle='rgba(80,120,200,.06)';ctx.lineWidth=1;
  for(let x=0;x<CW;x+=TILE){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CH);ctx.stroke();}
  for(let y=0;y<CH;y+=TILE){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CW,y);ctx.stroke();}
  // Paredes
  WALLS.forEach(W=>{
    if(W.t==='rock'){ctx.fillStyle='#2a3040';ctx.fillRect(W.x,W.y,W.w,W.h);ctx.strokeStyle='#3a4460';ctx.lineWidth=1.5;ctx.strokeRect(W.x+.5,W.y+.5,W.w-1,W.h-1);}
    else if(W.t==='ice'){ctx.fillStyle='rgba(140,200,255,.13)';ctx.fillRect(W.x,W.y,W.w,W.h);ctx.strokeStyle='rgba(160,220,255,.35)';ctx.lineWidth=1.5;ctx.strokeRect(W.x+.5,W.y+.5,W.w-1,W.h-1);}
    else{ctx.fillStyle='#12172a';ctx.fillRect(W.x,W.y,W.w,W.h);}
  });
}
function drawBushGround(){
  BUSHES.forEach(b=>{
    ctx.save();ctx.fillStyle='rgba(30,70,20,.55)';ctx.strokeStyle='rgba(60,120,30,.5)';
    ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(b.x+b.w/2,b.y+b.h/2,b.w/2,b.h/2,0,0,Math.PI*2);
    ctx.fill();ctx.stroke();ctx.restore();
  });
}
function drawBushCanopy(){
  BUSHES.forEach(b=>{
    const cx2=b.x+b.w/2,cy2=b.y+b.h/2;
    ctx.save();ctx.globalAlpha=.82;
    for(let i=0;i<5;i++){
      const ox=(i-2)*(b.w*.18),oy=Math.sin(i*1.3)*8;
      ctx.fillStyle=i%2===0?'#2a6618':'#3a8822';
      ctx.beginPath();ctx.ellipse(cx2+ox,cy2+oy,b.w*.22,b.h*.3,i*.3,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=.4;ctx.fillStyle='rgba(80,200,40,.28)';
    ctx.beginPath();ctx.ellipse(cx2-b.w*.14,cy2-b.h*.1,5,9,.4,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(cx2+b.w*.14,cy2-b.h*.1,5,9,-.4,0,Math.PI*2);ctx.fill();
    ctx.restore();
  });
}

// ── Dibujo de bases ───────────────────────────────────
function drawBase(base){
  const {x,y,hp,max,owner,hit}=base;
  const col=owner===1?'#5ab0ff':'#ff6b5a';
  const pct=hp/max;
  ctx.save();
  // Sombra
  if(hit>0){ctx.shadowColor=col;ctx.shadowBlur=22;base.hit--;}
  ctx.fillStyle=owner===1?'rgba(20,60,120,.7)':'rgba(120,30,20,.7)';
  ctx.fillRect(x,y,BW,BH);
  ctx.strokeStyle=col+(pct<.3?'ff':'88');
  ctx.lineWidth=pct<.3?2.5:1.5;
  ctx.strokeRect(x+.5,y+.5,BW-1,BH-1);
  // Barra de vida
  ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(x,y+BH+4,BW,6);
  ctx.fillStyle=pct<.3?'#ff4444':pct<.6?'#ffaa22':col;
  ctx.fillRect(x,y+BH+4,BW*pct,6);
  // Icono
  ctx.fillStyle='#fff';ctx.globalAlpha=.7;ctx.font='bold 18px serif';
  ctx.textAlign='center';ctx.fillText('🏠',x+BW/2,y+BH/2+7);
  ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.restore();
}

// ── Dibujo de cuchillas en suelo ─────────────────────
function drawBlades(){
  blades.forEach(b=>{
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.a||0);
    ctx.fillStyle='#c0aaff88';ctx.shadowColor='#9977ff';ctx.shadowBlur=4;
    ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(2,2);ctx.lineTo(-7,0);ctx.lineTo(2,-2);ctx.closePath();ctx.fill();
    ctx.restore();
  });
}

// ── Dibujo de proyectiles de agua (rayo) ─────────────
function drawWaterRay(){
  for(const pr of projs){
    if(pr.type!=='water_ray')continue;
    const ox=pr.owner;
    ctx.save();ctx.strokeStyle='#44aaff';ctx.lineWidth=5;ctx.shadowColor='#88ccff';ctx.shadowBlur=11;ctx.globalAlpha=.72;
    ctx.beginPath();ctx.moveTo(ox.cx,ox.cy);ctx.lineTo(pr.tx,pr.ty);ctx.stroke();
    ctx.strokeStyle='#aaeeff';ctx.lineWidth=2;ctx.shadowBlur=5;ctx.globalAlpha=.88;
    ctx.beginPath();ctx.moveTo(ox.cx,ox.cy);ctx.lineTo(pr.tx,pr.ty);ctx.stroke();
    ctx.restore();
  }
}

// ── Dibujo de todos los proyectiles ──────────────────
function drawProjs(){
  for(const pr of projs){
    if(pr.type==='water_ray')continue;
    ctx.save();
    const px=pr.type==='bomb'?pr.dx:pr.x;
    const py=pr.type==='bomb'?pr.dy:pr.y;
    if(pr.type==='snowball'){ctx.fillStyle='#fff';ctx.shadowColor='#8dd4ff';ctx.shadowBlur=9;ctx.beginPath();ctx.arc(px,py,pr.r,0,Math.PI*2);ctx.fill();}
    else if(pr.type==='fireball'){const fg=ctx.createRadialGradient(px,py,1,px,py,pr.r+3);fg.addColorStop(0,'#fff088');fg.addColorStop(.5,'#ff6600');fg.addColorStop(1,'rgba(255,50,0,0)');ctx.fillStyle=fg;ctx.shadowColor='#ff4400';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(px,py,pr.r+3,0,Math.PI*2);ctx.fill();}
    else if(pr.type==='wave'){ctx.fillStyle=pr.col+'cc';ctx.shadowColor=pr.col;ctx.shadowBlur=6;ctx.fillRect(px-4,py-3,8,6);}
    else if(pr.type==='bomb'){ctx.fillStyle='#222';ctx.shadowColor='#ffaa22';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(px,py,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffbb33';ctx.beginPath();ctx.arc(px+7,py-8,3,0,Math.PI*2);ctx.fill();}
    else if(pr.type==='recall_blade'||pr.type==='ulti_blade'){ctx.translate(px,py);ctx.rotate(Math.atan2(pr.vy,pr.vx));ctx.fillStyle='#c0aaff';ctx.shadowColor='#9977ff';ctx.shadowBlur=9;ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(2,3);ctx.lineTo(-10,0);ctx.lineTo(2,-3);ctx.closePath();ctx.fill();}
    else if(pr.type==='zap'){ctx.fillStyle='#ffe844';ctx.shadowColor='#ffff88';ctx.shadowBlur=13;ctx.beginPath();ctx.arc(px,py,pr.r,0,Math.PI*2);ctx.fill();}
    else if(pr.type==='avalanche'){ctx.fillStyle='#eef8ff';ctx.shadowColor='#fff';ctx.shadowBlur=7;ctx.beginPath();ctx.arc(px,py,pr.r+1,0,Math.PI*2);ctx.fill();}
    else if(pr.type==='lava'){ctx.fillStyle='#ff5500';ctx.shadowColor='#ff7700';ctx.shadowBlur=9;ctx.beginPath();ctx.arc(px,py,pr.r,0,Math.PI*2);ctx.fill();}
    else if(pr.type==='freeze_proj'){const fg=ctx.createRadialGradient(px,py,1,px,py,pr.r+4);fg.addColorStop(0,'#fff');fg.addColorStop(.5,'#88ddff');fg.addColorStop(1,'rgba(100,200,255,0)');ctx.fillStyle=fg;ctx.shadowColor='#aaddff';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(px,py,pr.r+4,0,Math.PI*2);ctx.fill();}
    else if(pr.type==='vine'){ctx.save();ctx.translate(px,py);ctx.rotate(Math.atan2(pr.vy,pr.vx));ctx.strokeStyle='#44cc22';ctx.lineWidth=4;ctx.shadowColor='#66dd44';ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(-8,0);ctx.bezierCurveTo(-4,-5,4,5,8,0);ctx.stroke();ctx.strokeStyle='#88ff44';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-6,0);ctx.bezierCurveTo(-2,-4,2,4,6,0);ctx.stroke();ctx.restore();}
    else if(pr.type==='spear'){ctx.translate(px,py);ctx.rotate(Math.atan2(pr.vy,pr.vx));ctx.fillStyle='#ffd080';ctx.shadowColor='#ffaa22';ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(4,3);ctx.lineTo(-10,0);ctx.lineTo(4,-3);ctx.closePath();ctx.fill();ctx.strokeStyle='#aa8820';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-18,0);ctx.stroke();}
    else{ctx.fillStyle=pr.col;ctx.shadowColor=pr.col;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(px,py,pr.r,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }
}

// ── Dibujo del pingüino ───────────────────────────────
function drawPenguin(p){
  if(p.dead){
    const secs=Math.ceil(p.rT/60);
    ctx.save();ctx.globalAlpha=.43;ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=13;
    ctx.beginPath();ctx.arc(p.x+CS/2,p.y+CS/2,CS/2,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;ctx.globalAlpha=.94;ctx.fillStyle='#fff';
    ctx.font='bold 14px "Fredoka One",cursive';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(secs,p.x+CS/2,p.y+CS/2-4);
    ctx.fillStyle=p.color;ctx.font='bold 7px Nunito,sans-serif';ctx.fillText('RESPAWN',p.x+CS/2,p.y+CS/2+8);
    ctx.restore();return;
  }
  if(p.jumping){
    ctx.save();ctx.globalAlpha=.65;ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=20;
    const sz=CS*(1+Math.sin(p.jumpT/34*Math.PI)*.4);
    ctx.beginPath();ctx.ellipse(p.x+CS/2,p.y+CS/2,sz/2,sz*.55,0,0,Math.PI*2);ctx.fill();
    ctx.restore();return;
  }
  const x=p.x,y=p.y,s=CS;ctx.save();
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(x+s/2,y+s+3,s/2,5,0,0,Math.PI*2);ctx.fill();
  if(p.dodging){ctx.strokeStyle='#44ffcc';ctx.lineWidth=2.5;ctx.shadowColor='#44ffcc';ctx.shadowBlur=18;ctx.globalAlpha=.7+Math.sin(Date.now()*.02)*.3;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2+8,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=1;}
  if(p.frenzying){ctx.strokeStyle='#aaffee';ctx.lineWidth=2;ctx.shadowColor='#44ffcc';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2+5+(Math.sin(Date.now()*.04)*4),0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
  if(p.gSpeedBuff){ctx.strokeStyle='rgba(255,208,128,.5)';ctx.lineWidth=2;ctx.shadowColor='#ffd080';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2+7+(Math.sin(Date.now()*.02)*3),0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
  if(p.frozen>0){ctx.save();ctx.globalAlpha=.48;const fg=ctx.createRadialGradient(x+s/2,y+s/2,2,x+s/2,y+s/2,s*.78);fg.addColorStop(0,'rgba(160,230,255,.7)');fg.addColorStop(1,'rgba(100,180,255,.08)');ctx.fillStyle=fg;ctx.beginPath();ctx.ellipse(x+s/2,y+s/2,s*.65,s*.75,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  if(p.slowed>0){ctx.strokeStyle='rgba(100,200,255,.32)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2+9,0,Math.PI*2);ctx.stroke();}
  if(p.buffActive){ctx.strokeStyle='rgba(255,190,50,.55)';ctx.lineWidth=2.5;ctx.shadowColor='#ffcc44';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2+7+(Math.sin(Date.now()*.015)*3),0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
  if(p.rooted>0){ctx.strokeStyle='#ffff44';ctx.lineWidth=1.5;for(let i=0;i<4;i++){const ang=(i/4)*Math.PI*2,r=s/2+5;ctx.beginPath();ctx.moveTo(x+s/2+Math.cos(ang)*r,y+s/2+Math.sin(ang)*r);ctx.lineTo(x+s/2+Math.cos(ang)*(r+8),y+s/2+Math.sin(ang)*(r+8));ctx.stroke();}}
  if(p.invincible>0&&Math.floor(p.invincible/3)%2===0)ctx.globalAlpha=.3;
  if(p.energyForm){ctx.shadowColor=p.color;ctx.shadowBlur=24;ctx.strokeStyle=p.color+'aa';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2+8,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
  if(p.shield>0){ctx.strokeStyle='#88ffff';ctx.lineWidth=2;ctx.shadowColor='#88ffff';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2+6,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
  // Cuerpo por personaje (delegado desde main.js que tiene el código visual completo)
  const drawFn=window['drawBody_'+p.ck];
  if(typeof drawFn==='function'){drawFn(ctx,p,x,y,s);}
  else{
    // Cuerpo genérico
    const bg=ctx.createRadialGradient(x+s/2-3,y+s/2-4,1,x+s/2,y+s/2,s/2);
    bg.addColorStop(0,'#252538');bg.addColorStop(1,p.body||'#080820');
    ctx.fillStyle=bg;ctx.beginPath();ctx.ellipse(x+s/2,y+s/2+2,s/2,s*.55,0,0,Math.PI*2);ctx.fill();
    ctx.shadowColor=p.color;ctx.shadowBlur=11;ctx.strokeStyle=p.color+'88';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.ellipse(x+s/2,y+s/2+2,s/2,s*.55,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;
  }
  // Pecho y gorra (genérico para todos)
  const bel=ctx.createRadialGradient(x+s/2,y+s/2+2,1,x+s/2,y+s/2+2,s*.3);bel.addColorStop(0,'#eef4ff');bel.addColorStop(1,'#b8d4ee');ctx.fillStyle=bel;ctx.beginPath();ctx.ellipse(x+s/2,y+s/2+4,s*.27,s*.36,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=p.hat;ctx.beginPath();ctx.ellipse(x+s/2,y+s*.12,s*.32,s*.09,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=p.body||'#080820';ctx.beginPath();ctx.moveTo(x+s*.2,y+s*.12);ctx.lineTo(x+s*.5,y-s*.1);ctx.lineTo(x+s*.8,y+s*.12);ctx.fill();
  // Ojo
  const ex=x+s/2+(p.facing>0?4:-4);
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex,y+s*.28,3.5,0,Math.PI*2);ctx.fill();
  const eyeCol=p.ck==='elemental'?(p.facing>0?'#ff6622':'#44aaff'):p.ck==='velocista'?'#44ffcc':p.ck==='guerrero'?'#ffd080':p.ck==='naturaleza'?'#88ff44':'#111';
  ctx.fillStyle=eyeCol;ctx.beginPath();ctx.arc(ex+(p.facing>0?1.2:-1.2),y+s*.28,1.8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  // Pico
  ctx.fillStyle='#ffaa00';ctx.beginPath();ctx.moveTo(x+s/2+(p.facing>0?7:-7),y+s*.37);ctx.lineTo(x+s/2+(p.facing>0?15:-15),y+s*.41);ctx.lineTo(x+s/2+(p.facing>0?7:-7),y+s*.45);ctx.fill();
  // Partículas pasivas
  if(p.ck==='elemental'){if(Math.random()<.22)addPt(x+s*.28,y+s*.04,'#ff6622',(-1+Math.random()*.5),-1,1.5,11);if(Math.random()<.22)addPt(x+s*.72,y+s*.04,'#44aaff',(Math.random()*.5-.25),-1,1.5,11);}
  if(p.ck==='fortachon'&&Math.random()<.12)addPt(p.cx+(Math.random()-.5)*26,p.cy+CS*.5,'#6a4010',0,.5,2,14);
  if(p.ck==='velocista'&&(p.dodging||p.frenzying)){for(let i=0;i<2;i++)addPt(p.cx+(Math.random()-.5)*s,p.cy+(Math.random()-.5)*s,'#44ffcc',(-p.facing)*2,0,2,10);}
  if(p.ck==='naturaleza'&&Math.random()<.15)addPt(p.cx+(Math.random()-.5)*s*.8,p.cy+(Math.random()-.5)*s*.6,'#66dd44',(Math.random()-.5),-0.8,1.5,14);
  if(p.poisoned>0&&Math.random()<.22){const col=p.burnT>0?'#ff8844':'#88ff44';addPt(p.cx+(Math.random()-.5)*s,p.cy+(Math.random()-.5)*s*.8,col,0,-0.7,2,18);}
  ctx.restore();
}

// ── Dibujo de partículas y floats ────────────────────
function drawPts(){
  for(const p of particles){const a=p.l/p.ml;ctx.save();ctx.globalAlpha=a;ctx.fillStyle=p.col;ctx.shadowColor=p.col;ctx.shadowBlur=4;ctx.beginPath();ctx.arc(p.x,p.y,p.r*a,0,Math.PI*2);ctx.fill();ctx.restore();}
}
function drawFx(){
  for(const ef of effects){
    const a=ef.l/ef.ml;ctx.save();ctx.globalAlpha=a*.66;
    if(ef.t==='boom'||ef.t==='shockwave'){ctx.strokeStyle=ef.col;ctx.lineWidth=ef.t==='shockwave'?4:3;ctx.shadowColor=ef.col;ctx.shadowBlur=13;ctx.beginPath();ctx.arc(ef.x,ef.y,(1-a)*(ef.t==='shockwave'?110:44),0,Math.PI*2);ctx.stroke();}
    else if(ef.t==='explosion'){ctx.strokeStyle='#ff8844';ctx.lineWidth=4;ctx.shadowColor='#ff6622';ctx.shadowBlur=17;ctx.beginPath();ctx.arc(ef.x,ef.y,(1-a)*88,0,Math.PI*2);ctx.stroke();}
    else if(ef.t==='freeze'){ctx.strokeStyle='#aaddff';ctx.lineWidth=3;ctx.shadowColor='#88ccff';ctx.shadowBlur=17;ctx.beginPath();ctx.arc(ef.x,ef.y,(1-a)*68,0,Math.PI*2);ctx.stroke();for(let k=0;k<8;k++){const ak=(k/8)*Math.PI*2;ctx.beginPath();ctx.moveTo(ef.x,ef.y);ctx.lineTo(ef.x+Math.cos(ak)*(1-a)*52,ef.y+Math.sin(ak)*(1-a)*52);ctx.stroke();}}
    else if(ef.t==='quake'){ctx.strokeStyle=ef.col;ctx.lineWidth=3;ctx.shadowColor=ef.col;ctx.shadowBlur=8;ctx.beginPath();ctx.ellipse(ef.x,ef.y,(1-a)*(ef.r+20),7,0,0,Math.PI*2);ctx.stroke();}
    else if(ef.t==='buff_ring'){ctx.strokeStyle=ef.col;ctx.lineWidth=3;ctx.shadowColor=ef.col;ctx.shadowBlur=15;ctx.beginPath();ctx.arc(ef.x,ef.y,(1-a)*60,0,Math.PI*2);ctx.stroke();}
    else if(ef.t==='dodge_ring'){ctx.strokeStyle='#44ffcc';ctx.lineWidth=3;ctx.shadowColor='#44ffcc';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(ef.x,ef.y,(1-a)*50,0,Math.PI*2);ctx.stroke();}
    else{ctx.strokeStyle=ef.col;ctx.lineWidth=2.5;ctx.shadowColor=ef.col;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(ef.x,ef.y,(1-a)*32,0,Math.PI*2);ctx.stroke();}
    ctx.restore();ef.l--;
  }
}
function drawFloats(){
  for(const f of floats){const a=f.l/70;ctx.save();ctx.globalAlpha=a;ctx.fillStyle=f.col;ctx.font='bold 12px "Fredoka One",cursive';ctx.textAlign='center';ctx.shadowColor=f.col;ctx.shadowBlur=5;ctx.fillText(f.txt,f.x,f.y);ctx.restore();}
}

// ── HUD ───────────────────────────────────────────────
function buildHUD(){bHUDP(p1,'h1',false);bHUDP(p2,'h2',true);}
function bHUDP(p,id,isR){
  const el=document.getElementById(id);const def=CHARS[p.ck];const kkeys=p.isP1?def.p1k:def.p2k;
  const hasRes=p.ck==='cuchillas'||p.ck==='electrico';
  const rCol=p.ck==='electrico'?'#ffe844':'#c0aaff';const bCol=p.isP1?'#5ab0ff':'#ff6b5a';
  el.innerHTML=`<div class="pn">${isR?'':`${p.icon} `}${p.name}${isR?` ${p.icon}`:''}</div><div class="hb"><div class="hf" id="${id}_hp" style="width:100%;background:linear-gradient(90deg,${p.color}88,${p.color})"></div></div><div class="bb"><div class="bf" id="${id}_bhp" style="width:100%;background:linear-gradient(90deg,${bCol}55,${bCol}cc)"></div></div><div class="rl2" id="${id}_blbl" style="color:${bCol}aa">🏠 Base: ${BHP}/${BHP}</div>${hasRes?`<div class="rb2" style="border-color:${rCol}44"><div class="rf2" id="${id}_res" style="width:0%;background:${rCol}"></div></div><div class="rl2" id="${id}_rlbl"></div>`:''}<div class="skr" id="${id}_sk"></div><div class="bi" id="${id}_bush">🌿 Oculto</div>`;
  const sr=document.getElementById(`${id}_sk`);
  def.skills.forEach((sk,i)=>{const kl=(kkeys[i]||'').toUpperCase();const d=document.createElement('div');d.className='sk';d.id=`${id}_sk${i}`;d.style.background=sk.col+'22';d.style.borderColor=sk.col+'66';d.innerHTML=`<span style="font-size:11px">${sk.e}</span><span class="skk">${kl}</span>`;sr.appendChild(d);});
}
function updHUD(){
  if(!p1||!p2||!base1||!base2)return;const h=id=>document.getElementById(id);
  h('h1_hp').style.width=(p1.hp/p1.maxHp*100)+'%';h('h2_hp').style.width=(p2.hp/p2.maxHp*100)+'%';
  h('h1_bhp').style.width=(base1.hp/BHP*100)+'%';h('h2_bhp').style.width=(base2.hp/BHP*100)+'%';
  h('h1_blbl').textContent='🏠 Base: '+Math.ceil(base1.hp)+'/'+BHP;h('h2_blbl').textContent='🏠 Base: '+Math.ceil(base2.hp)+'/'+BHP;
  const b1=h('h1_bush');const b2=h('h2_bush');if(b1)b1.style.display=inBush(p1)?'block':'none';if(b2)b2.style.display=inBush(p2)?'block':'none';
  [[p1,'h1'],[p2,'h2']].forEach(([p,hid])=>{
    if(p.ck==='cuchillas'){const e=h(hid+'_res');const l=h(hid+'_rlbl');if(e)e.style.width=(myBl(p)/MAXBL*100)+'%';if(l)l.textContent='🔪 '+myBl(p)+'/'+MAXBL;}
    else if(p.ck==='electrico'){const e=h(hid+'_res');const l=h(hid+'_rlbl');if(e)e.style.width=(p.charges/5*100)+'%';if(l)l.textContent='⚡ '+p.charges+'/5';}
    CHARS[p.ck].skills.forEach((_,i)=>{const el=h(`${hid}_sk${i}`);if(!el)return;const t=[p.q_t,p.w_t,p.e_t][i];if(t>0){el.classList.add('cd');let ct=el.querySelector('.skcd');if(!ct){ct=document.createElement('span');ct.className='skcd';el.appendChild(ct);}ct.textContent=Math.ceil(t/60)+'s';}else{el.classList.remove('cd');const ct=el.querySelector('.skcd');if(ct)ct.remove();}});
  });
}

// ── Fondo del canvas ─────────────────────────────────
function initBg(){bgT=[];}

// ── Game Loop ─────────────────────────────────────────
function gameLoop(){
  if(!running)return;animId=requestAnimationFrame(gameLoop);
  let sx=0,sy=0;
  if(shake.d>0){sx=(Math.random()-.5)*shake.x;sy=(Math.random()-.5)*shake.y;shake.d--;shake.x*=.84;shake.y*=.84;}
  ctx.save();ctx.translate(sx,sy);
  drawMap();drawBushGround();drawBase(base1);drawBase(base2);drawBlades();
  [p1,p2].forEach(p=>{if(p.dead){p.rT--;if(p.rT<=0)respawnP(p);}});
  moveP(p1,'w','s','a','d');moveP(p2,'arrowup','arrowdown','arrowleft','arrowright');
  if(p1.buffTimer>0){p1.buffTimer--;if(p1.buffTimer===0)p1.buffActive=false;}
  if(p2.buffTimer>0){p2.buffTimer--;if(p2.buffTimer===0)p2.buffActive=false;}
  if(p1.jumping){if(p1.jumpIsGuerrero)tickGuerreroJump(p1,p2);else tickFortaJump(p1,p2);}
  if(p2.jumping){if(p2.jumpIsGuerrero)tickGuerreroJump(p2,p1);else tickFortaJump(p2,p1);}
  if(p1.frenzying)tickVeloFrenzy(p1,p2);if(p2.frenzying)tickVeloFrenzy(p2,p1);
  if(p1.slowed>0)p1.slowed--;if(p2.slowed>0)p2.slowed--;
  if(p1.frozenSkills>0)p1.frozenSkills--;if(p2.frozenSkills>0)p2.frozenSkills--;
  if(p1.frozen>0)p1.frozen--;if(p2.frozen>0)p2.frozen--;
  if(p1.rooted>0)p1.rooted--;if(p2.rooted>0)p2.rooted--;
  if(!p1.dead&&!p2.dead&&!p1.jumping&&!p2.jumping){p1.facing=Math.sign(p2.cx-p1.cx)||p1.facing;p2.facing=Math.sign(p1.cx-p2.cx)||p2.facing;}
  if(p1.q_t>0)p1.q_t--;if(p1.w_t>0)p1.w_t--;if(p1.e_t>0)p1.e_t--;
  if(p2.q_t>0)p2.q_t--;if(p2.w_t>0)p2.w_t--;if(p2.e_t>0)p2.e_t--;
  if(p1.invincible>0)p1.invincible--;if(p2.invincible>0)p2.invincible--;
  if(p1.eT>0){p1.eT--;if(p1.eT===0)p1.energyForm=false;}
  if(p2.eT>0){p2.eT--;if(p2.eT===0)p2.energyForm=false;}
  if(p1.gSpeedTimer>0){p1.gSpeedTimer--;if(p1.gSpeedTimer===0)p1.gSpeedBuff=false;}
  if(p2.gSpeedTimer>0){p2.gSpeedTimer--;if(p2.gSpeedTimer===0)p2.gSpeedBuff=false;}
  // Passivas
  if(p1.ck==='polar'&&!p1.dead)pPass(p1,p2);if(p2.ck==='polar'&&!p2.dead)pPass(p2,p1);
  if(p1.ck==='chili'&&!p1.dead)cPass(p1,p2);if(p2.ck==='chili'&&!p2.dead)cPass(p2,p1);
  if(p1.ck==='cuchillas'&&!p1.dead)cuPass(p1);if(p2.ck==='cuchillas'&&!p2.dead)cuPass(p2);
  if(p1.ck==='electrico')elPass(p1,p2);if(p2.ck==='electrico')elPass(p2,p1);
  if(p1.ck==='elemental'&&!p1.dead)emPass(p1,p2);if(p2.ck==='elemental'&&!p2.dead)emPass(p2,p1);
  if(p1.ck==='fortachon'&&!p1.dead)ftPass(p1,p2);if(p2.ck==='fortachon'&&!p2.dead)ftPass(p2,p1);
  if(p1.ck==='velocista'&&!p1.dead)vPass(p1);if(p2.ck==='velocista'&&!p2.dead)vPass(p2);
  if(p1.ck==='guerrero'&&!p1.dead)gPass(p1,p2);if(p2.ck==='guerrero'&&!p2.dead)gPass(p2,p1);
  if(p1.ck==='naturaleza'&&!p1.dead)natPass(p1,p2);if(p2.ck==='naturaleza'&&!p2.dead)natPass(p2,p1);
  if(p1.ck==='campos'&&!p1.dead)cfPass(p1,p2);if(p2.ck==='campos'&&!p2.dead)cfPass(p2,p1);
  if(p1.natVortexActive)tickNatVortex(p1,p2);if(p2.natVortexActive)tickNatVortex(p2,p1);
  // Veneno / quemadura
  [p1,p2].forEach(p=>{
    if(p.poisoned>0){p.poisoned--;if(p.poisoned%20===0&&!p.dead){dmgP(p,4,p.poisonSrc);addPt(p.cx,p.cy,p.burnT>0?'#ff6622':'#66dd44',0,-1,2,14);}}
    if(p.burnT>0)p.burnT--;
    if(p.cfCompressed>0&&!p.dead){p.cfCompressed--;if(p.cfCompressed%18===0){const src=p===p1?p2:p1;dmgP(p,5,src);effects.push({x:p.cx,y:p.cy,col:'#dd88ff',t:'buff_ring',l:10,ml:10});addPt(p.cx,p.cy,'#aa44ff',0,0,2,14);if(p.cfCompressed===60)addFl(p.cx,p.cy,'💜 APLASTADO!','#dd88ff');}}
  });
  // Input habilidades
  if(!p1.dead&&!p1.jumping){['1','2','3'].forEach((k,i)=>{if(keys[k]){useSkill(p1,p2,i);keys[k]=false;}});}
  if(!p2.dead&&!p2.jumping){['i','o','p'].forEach((k,i)=>{if(keys[k]){useSkill(p2,p1,i);keys[k]=false;}});}
  for(let i=blades.length-1;i>=0;i--){blades[i].l--;if(blades[i].l<=0)blades.splice(i,1);}
  tickProjs();
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.07;p.l--;if(p.l<=0)particles.splice(i,1);}
  for(let i=effects.length-1;i>=0;i--){if(effects[i].l<=0)effects.splice(i,1);}
  for(let i=floats.length-1;i>=0;i--){floats[i].y+=floats[i].vy;floats[i].l--;if(floats[i].l<=0)floats.splice(i,1);}
  drawPts();drawFx();drawWaterRay();drawProjs();drawPenguin(p1);drawPenguin(p2);drawBushCanopy();drawFloats();updHUD();
  ctx.restore();
}

// ── Fin de partida ────────────────────────────────────
function endGame(winner){
  if(!running)return;running=false;
  document.getElementById('ro').classList.remove('hidden');
  document.getElementById('rt').textContent='🏠 '+winner.name+' destruyó la base!';
  const msgs={polar:'¡Polar arrasó!',chili:'¡Chili quemó la base!',cuchillas:'¡Las cuchillas ganaron!',electrico:'¡Voltaje triunfó!',elemental:'¡Los elementos arrasaron!',fortachon:'¡Fortachón aplastó!',velocista:'¡Demasiado rápido!',guerrero:'¡La lanza del Guerrero ganó!',naturaleza:'¡La naturaleza triunfó!',campos:'¡Los campos de fuerza ganaron!'};
  document.getElementById('rs').textContent=msgs[winner.ck]||'¡Victoria!';
  document.getElementById('rb').style.borderColor=winner.color+'66';
  const loser=winner===p1?p2:p1;
  document.getElementById('fstats').innerHTML=`<tr><th></th><th>Personaje</th><th>💀 K</th><th>☠️ M</th><th>⚔️ Daño</th></tr><tr><td>🏆</td><td class="pnc" style="color:${winner.color}">${winner.icon} ${winner.name}</td><td style="color:#66ff88;font-weight:700">${stats[winner===p1?'p1':'p2'].kills}</td><td>${stats[winner===p1?'p1':'p2'].deaths}</td><td style="color:#ffcc44;font-weight:700">${stats[winner===p1?'p1':'p2'].dmg}</td></tr><tr><td>💀</td><td class="pnc" style="color:${loser.color}">${loser.icon} ${loser.name}</td><td style="color:#66ff88;font-weight:700">${stats[loser===p1?'p1':'p2'].kills}</td><td>${stats[loser===p1?'p1':'p2'].deaths}</td><td style="color:#ffcc44;font-weight:700">${stats[loser===p1?'p1':'p2'].dmg}</td></tr>`;
  // Guardar resultado en Supabase
  if(typeof saveMatchResult==='function'){
    saveMatchResult({winner:winner===p1?'p1':'p2',p1Stats:stats.p1,p2Stats:stats.p2,modeName:'1v1_offline'})
    .then(rew=>{
      if(!rew)return;
      setTimeout(()=>{
        const rb=document.getElementById('rb');
        if(rb){const div=document.createElement('div');div.style.cssText='margin-top:12px;font-size:12px;color:rgba(255,255,255,.5)';div.innerHTML=`Recompensa: <span style="color:#5ab0ff">+${rew.pecesGan} 🐟</span> · <span style="color:#66ddff">+${rew.krillGan} 🦐</span>`;rb.appendChild(div);}
      },200);
    });
  }
}

// ── Selección de personaje y arranque ─────────────────
function buildCharSel(){
  const grid=document.getElementById('cg');grid.innerHTML='';p1k=null;p2k=null;
  document.getElementById('p1s').textContent='—';document.getElementById('p2s').textContent='—';
  document.getElementById('fight-btn').disabled=true;
  syncOwnedChars();
  Object.entries(CHARS).forEach(([key,def])=>{
    const defData=CHARS_DEF[key];const owned=!defData||defData.owned;
    const card=document.createElement('div');card.className='cc2'+(owned?'':' locked');
    const pills=def.pills.map(p=>`<span class="pill2" style="background:${p.c}22;color:${p.c};border:1px solid ${p.c}44">${p.t}</span>`).join('');
    const sl=def.skills.map(s=>`${s.e} ${s.n}`).join('<br>');
    const pas=def.passive?`<br><span style="color:rgba(255,255,255,.2)">${def.passive}</span>`:'';
    const lockOverlay=owned?'':` <div style="position:absolute;inset:0;background:rgba(0,0,0,.6);border-radius:inherit;display:flex;align-items:center;justify-content:center;font-size:22px;flex-direction:column;gap:4px"><div>🔒</div><div style="font-size:10px;color:rgba(255,255,255,.5)">${CICONS[defData?.currency||'peces']} ${defData?.price||'?'}</div><button class="btn btn-p btn-sm" style="font-size:9px;margin-top:4px" onclick="event.stopPropagation();buyChar('${key}',${defData?.price||0},'${defData?.currency||'peces'}')">Comprar</button></div>`;
    card.innerHTML=`${lockOverlay}<span class="ci2">${def.icon}</span><div class="cn2" style="color:${def.color}">${def.name}</div><div class="ccls2">${def.cls}</div><div class="cpills2">${pills}</div><div class="csk2">${sl}${pas}</div>`;
    if(owned){
      card.addEventListener('click',e=>{if(e.button===2)return;document.querySelectorAll('.cc2').forEach(c=>{c.classList.remove('sp1');const b=c.querySelector('.p1b');if(b)b.remove();});card.classList.add('sp1');const b=document.createElement('div');b.className='badge2 p1b';b.style.background='#60aaff';b.textContent='P1';card.appendChild(b);p1k=key;document.getElementById('p1s').textContent=def.name;document.getElementById('p1s').style.color=def.color;chkS();});
      card.addEventListener('contextmenu',e=>{e.preventDefault();document.querySelectorAll('.cc2').forEach(c=>{c.classList.remove('sp2');const b=c.querySelector('.p2b');if(b)b.remove();});card.classList.add('sp2');const b=document.createElement('div');b.className='badge2 p2b';b.style.background='#ff8060';b.textContent='P2';card.appendChild(b);p2k=key;document.getElementById('p2s').textContent=def.name;document.getElementById('p2s').style.color=def.color;chkS();});
    }
    grid.appendChild(card);
  });
}
function chkS(){document.getElementById('fight-btn').disabled=!(p1k&&p2k);}
function startGame(){
  if(!p1k)p1k='polar';if(!p2k)p2k='guerrero';
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('game-wrap').classList.remove('hidden');
  document.getElementById('ro').classList.add('hidden');
  if(!canvas){canvas=document.getElementById('cv');canvas.width=CW;canvas.height=CH;ctx=canvas.getContext('2d');}
  if(animId)cancelAnimationFrame(animId);
  keys={};particles=[];projs=[];effects=[];floats=[];blades=[];shake={x:0,y:0,d:0};
  stats={p1:{dmg:0,kills:0,deaths:0},p2:{dmg:0,kills:0,deaths:0}};
  p1=mkP(p1k,true);p2=mkP(p2k,false);
  initBases();initBg();buildHUD();updHUD();updStats();running=true;gameLoop();
}