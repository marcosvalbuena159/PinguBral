// ═══════════════════════════════════════════════════════
//  FORTACHÓN — Guerrero · Rango Corto
//  Pasiva: pisotón — 4 dmg/0.5s, alcanza base en 90px
// ═══════════════════════════════════════════════════════

function ftPass(p,e){
  if(p.dead)return;p.quakeTimer=(p.quakeTimer||0)+1;if(p.quakeTimer<30)return;p.quakeTimer=0;
  effects.push({x:p.cx,y:p.cy+CS*.5,col:'#e8a020',t:'quake',l:16,ml:16,r:28});shk(1,3);
  addPt(p.cx,p.cy+CS*.5,'#8a5500',0,1,3,18);addPt(p.cx+18,p.cy+CS*.5,'#8a5500',0,1,2,14);addPt(p.cx-18,p.cy+CS*.5,'#8a5500',0,1,2,14);
  if(!e.dead&&dst(p,e)<120)dmgP(e,4,p);
  else{const enBase=p===p1?base2:base1;if(Math.abs(p.cx-(enBase.x+BW/2))<90&&Math.abs(p.cy-(enBase.y+BH/2))<90)dmgB(enBase,3,p);}
}

function ftQ(p,e){
  if(p.q_t>0)return;p.q_t=240;sfx('buff');
  p.buffActive=true;p.buffTimer=180;p.shield=1;
  addFl(p.cx,p.cy-26,'💪 MODO BESTIA!','#e8a020');
  effects.push({x:p.cx,y:p.cy,col:'#e8a020',t:'buff_ring',l:40,ml:40});
  for(let i=0;i<10;i++)addPt(p.cx,p.cy,'#ffcc44',(Math.random()-.5)*5,(Math.random()-.5)*5,4,35);
}

function ftW(p,e){
  if(p.w_t>0)return;p.w_t=200;sfx('pull');
  const d=dst(p,e);if(d>280){addFl(p.cx,p.cy-18,'¡Lejos!','#888');return;}
  addFl(p.cx,p.cy-26,'🪝 AGARRE!','#cc8800');
  if(e.dead){const enBase=p===p1?base2:base1;dmgB(enBase,20,p);return;}
  const dx=p.cx-e.cx,dy=p.cy-e.cy,dd=Math.sqrt(dx*dx+dy*dy)||1;let t=0;
  const iv=setInterval(()=>{
    if(!running){clearInterval(iv);return;}
    e.x+=dx/dd*14;e.y+=dy/dd*14;e.x=Math.max(40,Math.min(CW-40-CS,e.x));e.y=Math.max(40,Math.min(CH-40-CS,e.y));
    addPt(e.cx,e.cy,'#cc8800',0,0,3,14);
    if(++t>7||dst(p,e)<44){e.rooted=90;addFl(e.cx,e.cy,'🪝 ATRAPADO!','#cc8800');dmgP(e,16,p);clearInterval(iv);}
  },18);
}

function ftE(p,e){
  if(p.e_t>0)return;p.e_t=360;sfx('boom');addFl(p.cx,p.cy-28,'💥 SALTO BRUTAL!','#ff6600');
  const enBase=p===p1?base2:base1;
  p.jumpTX=!e.dead?e.cx:enBase.x+BW/2;p.jumpTY=!e.dead?e.cy:enBase.y+BH/2;
  p.jumping=true;p.jumpSX=p.cx;p.jumpSY=p.cy;p.jumpT=0;
}

function tickFortaJump(p,e){
  if(!p.jumping)return;p.jumpT++;const prog=p.jumpT/35;
  p.x=p.jumpSX+(p.jumpTX-p.jumpSX)*prog-CS/2;p.y=p.jumpSY+(p.jumpTY-p.jumpSY)*prog-Math.sin(prog*Math.PI)*100-CS/2;
  p.x=Math.max(40,Math.min(CW-40-CS,p.x));p.y=Math.max(40,Math.min(CH-40-CS,p.y));
  if(p.jumpT>=35){
    p.jumping=false;sfx('jump_land');shk(9,22);
    effects.push({x:p.cx,y:p.cy,col:'#ff6600',t:'shockwave',l:35,ml:35,r:10});
    for(let i=0;i<20;i++)addPt(p.cx,p.cy,'#ff8844',(Math.random()-.5)*7,(Math.random()-.5)*7,5,40);
    const enBase=p===p1?base2:base1;
    if(!e.dead&&dst(p,e)<100){const d=p.buffActive?52:38;dmgP(e,d,p);addFl(e.cx,e.cy,'💥 IMPACTO!','#ff6600');}
    else if(Math.abs(p.cx-(enBase.x+BW/2))<110&&Math.abs(p.cy-(enBase.y+BH/2))<110)dmgB(enBase,p.buffActive?36:26,p);
  }
}