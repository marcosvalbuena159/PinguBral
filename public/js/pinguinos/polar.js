// ═══════════════════════════════════════════════════════
//  POLAR — Tanque · Rango Corto
//  Pasiva: ralentiza y hace daño con el frío
// ═══════════════════════════════════════════════════════

function pPass(p,e){
  if(p.dead||e.dead)return;
  if(p.passT>0){p.passT--;return;}p.passT=55;
  if(dst(p,e)<145){
    e.slowed=120;
    const d=dmgP(e,4,p);
    addPt(e.cx,e.cy,'#8dd4ff',0,-1,2,18);
    addFl(e.cx,e.cy,'❄️ -'+d,'#8dd4ff');
  }
}

function pQ(p,e){if(p.q_t>0)return;p.q_t=110;sfx('ice');const{tx,ty}=tgtPos(p,e);spProj(p.cx,p.cy,tx,ty,11,'#8dd4ff',20,480,'snowball',p);}

function pW(p,e){if(p.w_t>0)return;p.w_t=160;sfx('wave');addFl(p.cx,p.cy-26,'🌊 OLA!','#5ab0ff');const{tx,ty}=tgtPos(p,e);for(let i=0;i<5;i++)setTimeout(()=>{if(!running)return;const off=(i-2)*16;spProj(p.cx+p.facing*20,p.cy+off,tx,p.cy+off,7,'#3a90ff',10,340,'wave',p);},i*35);}

function pE(p,e){if(p.e_t>0)return;p.e_t=340;sfx('boom');shk(6,14);addFl(p.cx,p.cy-26,'☄️ AVALANCHA!','#fff');const{tx,ty}=tgtPos(p,e);for(let i=0;i<9;i++)setTimeout(()=>{if(!running)return;const ox=(Math.random()-.5)*200;spProj(tx+ox,36,tx+ox,ty,9,'#fff',15,560,'avalanche',p);},i*55);}