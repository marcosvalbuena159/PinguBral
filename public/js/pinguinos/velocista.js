// ═══════════════════════════════════════════════════════
//  VELOCISTA — Asesino · Rango Medio
//  Pasiva: +25% vel. permanente, rastro de velocidad
//          acumula distancia recorrida → más daño en el dash
// ═══════════════════════════════════════════════════════

function vPass(p){
  if(!p.dead){
    // rastro visual
    if(Math.random()<.18)addPt(p.cx+(Math.random()-.5)*20,p.cy+(Math.random()-.5)*10,'#44ffcc',0,0,2,12);
    // acumular distancia (por velocidad del personaje)
    const moving=(keys['w']||keys['s']||keys['a']||keys['d']||keys['arrowup']||keys['arrowdown']||keys['arrowleft']||keys['arrowright']);
    if(moving)p.vDistAccum=Math.min(p.vDistAccum+(p.spd*.016),6);
  }
}

function vQ(p,e){
  if(p.q_t>0)return;p.q_t=720;sfx('dodge');
  p.dodging=true;p.dodgeTimer=90;
  addFl(p.cx,p.cy-26,'🌀 ESQUIVA!','#44ffcc');
  effects.push({x:p.cx,y:p.cy,col:'#44ffcc',t:'dodge_ring',l:25,ml:25});
  for(let i=0;i<8;i++)addPt(p.cx,p.cy,'#44ffcc',(Math.random()-.5)*6,(Math.random()-.5)*6,3,22);
}

function vW(p,e){
  if(p.w_t>0)return;p.w_t=180;sfx('dash_hit');
  const bonus=Math.floor(p.vDistAccum*4); // 0-24 bonus dmg based on distance
  const dashDmg=20+bonus;
  if(bonus>0)addFl(p.cx,p.cy-36,'💨 DASH +'+bonus+'!','#44ffcc');
  else addFl(p.cx,p.cy-26,'💫 DASH!','#22ddaa');
  p.vDistAccum=0; // reset accumulation
  const enBase=p===p1?base2:base1;
  if(e.dead){
    // dash toward base when enemy dead
    const dx2=enBase.x+BW/2-p.cx,dy2=enBase.y+BH/2-p.cy,dd2=Math.sqrt(dx2*dx2+dy2*dy2)||1;
    let t2=0;const iv2=setInterval(()=>{
      if(!running){clearInterval(iv2);return;}
      p.x+=dx2/dd2*16;p.y+=dy2/dd2*16;p.x=Math.max(40,Math.min(CW-40-CS,p.x));p.y=Math.max(40,Math.min(CH-40-CS,p.y));
      addPt(p.cx,p.cy,'#44ffcc',0,0,3,14);
      if(Math.abs(p.cx-(enBase.x+BW/2))<55&&Math.abs(p.cy-(enBase.y+BH/2))<55){dmgB(enBase,22,p);clearInterval(iv2);}
      if(++t2>10)clearInterval(iv2);
    },16);
    return;
  }
  const dx=e.cx-p.cx,dy=e.cy-p.cy,d=Math.sqrt(dx*dx+dy*dy)||1;
  let t=0;const iv=setInterval(()=>{
    if(!running){clearInterval(iv);return;}
    p.x+=dx/d*16;p.y+=dy/d*16;p.x=Math.max(40,Math.min(CW-40-CS,p.x));p.y=Math.max(40,Math.min(CH-40-CS,p.y));
    addPt(p.cx,p.cy,'#44ffcc',0,0,3,14);
    if(!e.dead&&Math.abs(p.cx-e.cx)<46&&Math.abs(p.cy-e.cy)<46){
      dmgP(e,dashDmg,p);addFx(e.cx,e.cy,'#22ddaa');
      const pushDx=dx/d,pushDy=dy/d;let pt=0;
      const piv=setInterval(()=>{
        if(!running){clearInterval(piv);return;}
        const nx=e.x+pushDx*18,ny=e.y+pushDy*18;
        const hB=hitW(nx,e.y,CS,CS)||hitW(e.x,ny,CS,CS);
        e.x=Math.max(40,Math.min(CW-40-CS,nx));e.y=Math.max(40,Math.min(CH-40-CS,ny));
        if(hB||++pt>5){if(hB){e.rooted=120;addFl(e.cx,e.cy,'💥 MURO!','#44ffcc');sfx('boom');shk(5,12);}clearInterval(piv);}
      },16);
      clearInterval(iv);
    }
    if(++t>10)clearInterval(iv);
  },16);
}

function vE(p,e){
  if(p.e_t>0)return;p.e_t=420;sfx('frenzy');shk(6,16);addFl(p.cx,p.cy-28,'⚡ FURIA VELOZ!','#aaffee');
  effects.push({x:p.cx,y:p.cy,col:'#44ffcc',t:'explosion',l:26,ml:26,r:10});
  for(let i=0;i<16;i++)addPt(p.cx,p.cy,'#44ffcc',(Math.random()-.5)*8,(Math.random()-.5)*8,5,32);
  const enBase=p===p1?base2:base1;
  if(!e.dead&&dst(p,e)<90)dmgP(e,18,p);
  else if(e.dead&&Math.abs(p.cx-(enBase.x+BW/2))<100&&Math.abs(p.cy-(enBase.y+BH/2))<100)dmgB(enBase,12,p);
  p.frenzying=true;p.frenzyTimer=0;p.frenzyHits=0;
}

function tickVeloFrenzy(p,e){
  if(!p.frenzying)return;p.frenzyTimer++;if(p.frenzyHits>=5){p.frenzying=false;return;}
  if(p.frenzyTimer%18===0){
    const enBase=p===p1?base2:base1;
    if(!e.dead){const dx=e.cx-p.cx,dy=e.cy-p.cy,d=Math.sqrt(dx*dx+dy*dy)||1;p.x+=dx/d*30;p.y+=dy/d*30;p.x=Math.max(40,Math.min(CW-40-CS,p.x));p.y=Math.max(40,Math.min(CH-40-CS,p.y));}
    else{// frenzy hits base when enemy dead
      const dx2=enBase.x+BW/2-p.cx,dy2=enBase.y+BH/2-p.cy,dd2=Math.sqrt(dx2*dx2+dy2*dy2)||1;
      p.x+=dx2/dd2*20;p.y+=dy2/dd2*20;p.x=Math.max(40,Math.min(CW-40-CS,p.x));p.y=Math.max(40,Math.min(CH-40-CS,p.y));
    }
    addPt(p.cx,p.cy,'#44ffcc',0,0,4,20);
    if(!e.dead&&dst(p,e)<60){dmgP(e,14,p);addFx(e.cx,e.cy,'#44ffcc');sfx('frenzy');}
    else if(e.dead&&Math.abs(p.cx-(enBase.x+BW/2))<70&&Math.abs(p.cy-(enBase.y+BH/2))<70)dmgB(enBase,8,p);
    p.frenzyHits++;
  }
}