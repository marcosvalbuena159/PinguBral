// ═══════════════════════════════════════════════════════
//  NATURALEZA — Mago Control · Rango Medio
//  Pasiva: repele al enemigo c/2s y aplica veneno al contacto
// ═══════════════════════════════════════════════════════

function natPass(p,e){
  if(p.dead||e.dead)return;
  // veneno al contacto
  if(dst(p,e)<90){
    if(p.passT>0){p.passT--;}else{
      p.passT=45;e.poisoned=Math.max(e.poisoned,200);e.poisonSrc=p;
      addPt(e.cx,e.cy,'#66dd44',0,-1,2,16);addFl(e.cx,e.cy,'☠️ VENENO','#66dd44');
    }
  }

}

// Q: Levanta la tierra — daño + lanzar al enemigo
function natQ(p,e){
  if(p.q_t>0)return;p.q_t=140;sfx('quake');addFl(p.cx,p.cy-26,'🪨 TERREMOTO!','#aa8844');shk(5,12);
  effects.push({x:p.cx,y:p.cy+CS*.5,col:'#aa8844',t:'quake',l:22,ml:22,r:40});
  for(let i=0;i<14;i++)addPt(p.cx+(Math.random()-.5)*60,p.cy+CS*.4,'#8a6020',(Math.random()-.5)*5,-Math.random()*4,4,30);
  const enBase=p===p1?base2:base1;
  if(!e.dead&&dst(p,e)<140){
    dmgP(e,26,p);e.rooted=80;
    const dx=e.cx-p.cx,dy=e.cy-p.cy,dd=Math.sqrt(dx*dx+dy*dy)||1;
    let t=0;const iv=setInterval(()=>{
      if(!running){clearInterval(iv);return;}
      e.x+=dx/dd*20;e.y+=-8+t*1.5;e.x=Math.max(40,Math.min(CW-40-CS,e.x));e.y=Math.max(40,Math.min(CH-40-CS,e.y));
      addPt(e.cx,e.cy,'#aa8844',0,0,3,16);if(++t>8)clearInterval(iv);
    },16);
    addFl(e.cx,e.cy,'🪨 LANZADO!','#aa8844');
  }else if(Math.abs(p.cx-(enBase.x+BW/2))<160&&Math.abs(p.cy-(enBase.y+BH/2))<160){dmgB(enBase,18,p);}
}

// W: Enredaderas — inmoviliza al enemigo
function natW(p,e){
  if(p.w_t>0)return;p.w_t=220;sfx('pull');addFl(p.cx,p.cy-26,'🌿 ENREDADERA!','#44cc22');
  const{tx,ty}=tgtPos(p,e);
  spProj(p.cx,p.cy,tx,ty,10,'#44cc22',14,460,'vine',p);
  for(let i=0;i<10;i++)addPt(p.cx,p.cy,'#44cc22',(Math.random()-.5)*5,(Math.random()-.5)*5,3,22);
}

// E: Torbellino — vórtice que arrastra al enemigo y cura a Naturaleza
function natE(p,e){
  if(p.e_t>0)return;p.e_t=460;sfx('thunder');addFl(p.cx,p.cy-30,'🌪️ TORBELLINO!','#aaddaa');shk(4,10);
  p.natVortexActive=true;p.natVortexTimer=220;
  for(let i=0;i<14;i++)addPt(p.cx,p.cy,'#aaddaa',(Math.random()-.5)*8,(Math.random()-.5)*8,4,36);
}

function tickNatVortex(p,e){
  if(!p.natVortexActive)return;p.natVortexTimer--;
  if(p.natVortexTimer<=0){p.natVortexActive=false;return;}
  // partículas de viento girando
  const ang=(p.natVortexTimer*.08);const r=90+(Math.sin(p.natVortexTimer*.04)*20);
  for(let i=0;i<3;i++){const a=ang+i*(Math.PI*2/3);addPt(p.cx+Math.cos(a)*r,p.cy+Math.sin(a)*r,'#aaddaa',Math.cos(a+Math.PI/2)*1.5,Math.sin(a+Math.PI/2)*1.5,2,18);}
  // atraer al enemigo lentamente
  if(!e.dead&&dst(p,e)<160){
    const dx=p.cx-e.cx,dy=p.cy-e.cy,dd=Math.sqrt(dx*dx+dy*dy)||1;
    e.x+=dx/dd*1.2;e.y+=dy/dd*1.2;e.x=Math.max(40,Math.min(CW-40-CS,e.x));e.y=Math.max(40,Math.min(CH-40-CS,e.y));
    if(p.natVortexTimer%22===0){dmgP(e,5,p);addPt(e.cx,e.cy,'#aaddaa',0,-1,2,14);}
  }
  // curar a Naturaleza lentamente
  if(p.natVortexTimer%18===0&&p.hp<p.maxHp){
    p.hp=Math.min(p.maxHp,p.hp+3);
    addPt(p.cx,p.cy,'#66dd44',(Math.random()-.5)*3,-1.5,2,18);
    if(p.natVortexTimer%54===0)addFl(p.cx,p.cy-18,'+3 ❤️','#66dd44');
    updHUD();
  }
}