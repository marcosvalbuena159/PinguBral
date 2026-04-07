// ═══════════════════════════════════════════════════════
//  CHILI — Asesino · Rango Medio
//  Pasiva: incendia al enemigo y hace daño por tiempo al contacto
// ═══════════════════════════════════════════════════════

function cPass(p,e){
  if(p.dead||e.dead)return;
  if(p.passT>0){p.passT--;return;}p.passT=50;
  if(dst(p,e)<130){
    e.poisoned=Math.max(e.poisoned,180);e.poisonSrc=p;e.burnT=180;
    addPt(e.cx,e.cy,'#ff6622',0,-1,2,16);
    addFl(e.cx,e.cy,'🔥 FUEGO!','#ff6622');
  }
}

function cQ(p,e){if(p.q_t>0)return;p.q_t=105;sfx('ice');const{tx,ty}=tgtPos(p,e);spProj(p.cx,p.cy,tx,ty,13,'#ff8844',18,440,'fireball',p);}

function cW(p,e){if(p.w_t>0)return;p.w_t=190;sfx('bomb');const{tx,ty}=tgtPos(p,e);projs.push({type:'bomb',sx:p.cx,sy:p.cy,tx,ty,dx:p.cx,dy:p.cy,t:0,mt:38,col:'#ffaa22',dmg:30,owner:p,r:9,dist:0,rng:9999,vx:0,vy:0});}

function cE(p,e){if(p.e_t>0)return;p.e_t=320;sfx('boom');shk(6,16);addFl(p.cx,p.cy-26,'🌋 ERUPCIÓN!','#ff4400');const{tx,ty}=tgtPos(p,e);for(let i=0;i<8;i++)setTimeout(()=>{if(!running)return;const ox=(Math.random()-.5)*185,oy=(Math.random()-.5)*155;spProj(tx+ox,CH-36,tx+ox,ty+oy,9,'#ff4400',14,510,'lava',p);addPt(tx+ox,CH-36,'#ff6600',0,-3,4,20);},i*50);}