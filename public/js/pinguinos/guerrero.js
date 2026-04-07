// ═══════════════════════════════════════════════════════
//  GUERRERO — Guerrero · Rango Corto
//  Pasiva: lanza lanza automáticamente (más rápido cerca)
// ═══════════════════════════════════════════════════════

function gPass(p,e){
  if(p.dead)return;p.gPassTimer=(p.gPassTimer||0)+1;
  const enBase=p===p1?base2:base1;
  const distToE=e.dead?9999:dst(p,e);
  // CD según distancia: 30 frames (~0.5s) cerca, 70 frames lejos
  const passCD=distToE<140?30:70;
  if(p.gPassTimer<passCD)return;p.gPassTimer=0;
  const spearDmg=p.gAtkSpeed>1?14:10;
  if(!e.dead&&distToE<220){
    sfx('spear');const{tx,ty}=tgtPos(p,e);spProj(p.cx,p.cy,tx,ty,14,'#ffd080',spearDmg,200,'spear',p);
    addPt(p.cx,p.cy,'#ffd080',p.facing*3,0,2,14);
  }else if(Math.abs(p.cx-(enBase.x+BW/2))<160&&Math.abs(p.cy-(enBase.y+BH/2))<140){
    sfx('spear');spProj(p.cx,p.cy,enBase.x+BW/2,enBase.y+BH/2,14,'#ffd080',spearDmg,200,'spear',p);
  }
}

function gQ(p,e){
  // Lanza Rápida: lanza lanza y aumenta vel. de ataque 4s
  if(p.q_t>0)return;p.q_t=90;sfx('spear');
  addFl(p.cx,p.cy-26,'🏹 ¡LANZA!','#ffd080');
  const{tx,ty}=tgtPos(p,e);spProj(p.cx,p.cy,tx,ty,15,'#ffd080',24,320,'spear',p);
  for(let i=0;i<4;i++)addPt(p.cx,p.cy,'#ffd080',p.facing*(3+i),0,2,16);
  // Speed buff: halve passive CD
  p.gAtkSpeed=2;p.gPassTimer=Math.min(p.gPassTimer,14);
  setTimeout(()=>{if(p)p.gAtkSpeed=1;},4000);
}

function gW(p,e){
  // Postura de Combate: escudo + speed 3s
  if(p.w_t>0)return;p.w_t=200;sfx('shield_on');
  addFl(p.cx,p.cy-26,'🛡️ POSTURA!','#ffcc44');
  p.shield=1;p.gSpeedBuff=true;p.gSpeedTimer=180;
  effects.push({x:p.cx,y:p.cy,col:'#ffd080',t:'buff_ring',l:35,ml:35});
  for(let i=0;i<8;i++)addPt(p.cx,p.cy,'#ffd080',(Math.random()-.5)*4,(Math.random()-.5)*4,3,28);
}

function gE(p,e){
  // Salto Lanza: salta hacia el enemigo, al aterrizar lo inmoviliza
  if(p.e_t>0)return;p.e_t=380;sfx('boom');addFl(p.cx,p.cy-28,'💥 SALTO LANZA!','#ff8822');
  const enBase=p===p1?base2:base1;
  p.jumpTX=!e.dead?e.cx:enBase.x+BW/2;p.jumpTY=!e.dead?e.cy:enBase.y+BH/2;
  p.jumping=true;p.jumpSX=p.cx;p.jumpSY=p.cy;p.jumpT=0;p.jumpIsGuerrero=true;
}

function tickGuerreroJump(p,e){
  if(!p.jumping||!p.jumpIsGuerrero)return;p.jumpT++;const prog=p.jumpT/32;
  p.x=p.jumpSX+(p.jumpTX-p.jumpSX)*prog-CS/2;p.y=p.jumpSY+(p.jumpTY-p.jumpSY)*prog-Math.sin(prog*Math.PI)*90-CS/2;
  p.x=Math.max(40,Math.min(CW-40-CS,p.x));p.y=Math.max(40,Math.min(CH-40-CS,p.y));
  if(p.jumpT>=32){
    p.jumping=false;p.jumpIsGuerrero=false;sfx('jump_land');shk(7,18);
    effects.push({x:p.cx,y:p.cy,col:'#ffd080',t:'shockwave',l:30,ml:30,r:8});
    for(let i=0;i<16;i++)addPt(p.cx,p.cy,'#ffd080',(Math.random()-.5)*7,(Math.random()-.5)*7,5,36);
    const enBase=p===p1?base2:base1;
    if(!e.dead&&dst(p,e)<90){
      dmgP(e,32,p);e.rooted=150;addFl(e.cx,e.cy,'🏹 INMOVILIZADO!','#ffd080');
    }else if(Math.abs(p.cx-(enBase.x+BW/2))<100&&Math.abs(p.cy-(enBase.y+BH/2))<100)dmgB(enBase,24,p);
  }
}