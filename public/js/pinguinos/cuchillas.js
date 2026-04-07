// ═══════════════════════════════════════════════════════
//  CUCHILLAS — Asesino/Mago · Rango Medio
//  Pasiva: genera cuchilla c/0.5s (máx 10)
// ═══════════════════════════════════════════════════════

function cuPass(p){if(p.passT>0){p.passT--;return;}p.passT=30;if(myBl(p)<MAXBL){const ox=(Math.random()-.5)*25,oy=(Math.random()-.5)*19;spBl(p.cx+ox,p.cy+oy+10,p);addPt(p.cx+ox,p.cy+oy,'#c0aaff',0,-1,2,12);}}

function cuQ(p,e){
  if(p.q_t>0)return;p.q_t=240;sfx('hook');addFl(p.cx,p.cy-26,'🗡️ ENGANCHE!','#c0aaff');
  const{tx,ty}=tgtPos(p,e);const dx=tx-p.cx,dy=ty-p.cy,d=Math.sqrt(dx*dx+dy*dy)||1;
  const near=d<230;const dX=near?dx/d:p.facing;const dY=near?dy/d:0;let t=0;
  const iv=setInterval(()=>{
    if(!running){clearInterval(iv);return;}
    p.x+=dX*12;p.y+=dY*12;p.x=Math.max(40,Math.min(CW-40-CS,p.x));p.y=Math.max(40,Math.min(CH-40-CS,p.y));
    addPt(p.cx,p.cy,'#c0aaff',0,0,3,14);
    if(near&&!e.dead&&Math.abs(p.cx-e.cx)<44&&Math.abs(p.cy-e.cy)<44){dmgP(e,18,p);addFx(e.cx,e.cy,'#c0aaff');clearInterval(iv);}
    if(++t>9)clearInterval(iv);
  },18);
}

function cuW(p,e){
  if(p.w_t>0)return;
  const mine=blades.filter(b=>b.o===p);
  if(mine.length===0){addFl(p.cx,p.cy-18,'Sin cuchillas!','#888');return;}
  p.w_t=240;sfx('recall');addFl(p.cx,p.cy-26,'🌀 ATRACCIÓN!','#8866ff');
  const rec=[...mine];blades=blades.filter(b=>b.o!==p);
  for(const bl of rec)spProj(bl.x,bl.y,p.cx,p.cy,11,'#c0aaff',12,700,'recall_blade',p);
}

function cuE(p,e){
  if(p.e_t>0)return;p.e_t=480;sfx('boom');shk(5,12);addFl(p.cx,p.cy-26,'💥 TORMENTA!','#fff');
  for(let wave=0;wave<3;wave++)setTimeout(()=>{
    if(!running)return;
    for(let i=0;i<10;i++){const ang=(Math.PI*2/10)*i+wave*.35;projs.push({x:p.cx+Math.cos(ang)*22,y:p.cy+Math.sin(ang)*22,vx:Math.cos(ang)*7,vy:Math.sin(ang)*7,col:'#c0aaff',dmg:8,rng:200,dist:0,type:'ulti_blade',owner:p,r:5});}
  },wave*190);
}