// ═══════════════════════════════════════════════════════
//  ELEMENTAL — Mago Control · Rango Medio
//  Pasiva: ralentiza al enemigo cercano (150px)
// ═══════════════════════════════════════════════════════

function emPass(p,e){if(p.dead||e.dead)return;if(dst(p,e)<150){e.slowed=8;if(Math.random()<.04)addPt(e.cx,e.cy,'#aaddff',0,-1,2,16);}}

function emQ(p,e){
  if(p.q_t>0)return;p.q_t=150;sfx('fire_exp');addFl(p.cx,p.cy-26,'🔥 EXPLOSIÓN!','#ff6622');shk(4,9);
  effects.push({x:p.cx,y:p.cy,col:'#ff6622',t:'explosion',l:28,ml:28,r:10});
  for(let i=0;i<14;i++)addPt(p.cx,p.cy,'#ff8844',(Math.random()-.5)*7,(Math.random()-.5)*7,5,32);
  if(!e.dead&&dst(p,e)<88)dmgP(e,28,p);
  else{const enBase=p===p1?base2:base1;if(Math.abs(p.cx-(enBase.x+BW/2))<120&&Math.abs(p.cy-(enBase.y+BH/2))<120)dmgB(enBase,18,p);}
}

function emW(p,e){
  if(p.w_t>0)return;p.w_t=200;sfx('water_ray');addFl(p.cx,p.cy-26,'💧 RAYO!','#44aaff');
  p.waterRayActive=true;
  const{tx,ty}=tgtPos(p,e);
  projs.push({type:'water_ray',owner:p,tx,ty,col:'#44aaff',life:120,dtick:0,dmg:6,dist:0,rng:9999,vx:0,vy:0,r:4,x:p.cx,y:p.cy});
  setTimeout(()=>{p.waterRayActive=false;},2000);
}

function emE(p,e){
  if(p.e_t>0)return;p.e_t=420;sfx('freeze');addFl(p.cx,p.cy-26,'🧊 CONGELACIÓN!','#aaddff');
  const{tx,ty}=tgtPos(p,e);
  spProj(p.cx,p.cy,tx,ty,10,'#aaddff',32,500,'freeze_proj',p);
  for(let i=0;i<9;i++)addPt(p.cx,p.cy,'#aaddff',0,0,3,22);
}