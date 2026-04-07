// ═══════════════════════════════════════════════════════
//  ELÉCTRICO — Mago · Rango Largo
//  Pasiva: acumula cargas al estar cerca (máx 5), electrocuta al contacto
// ═══════════════════════════════════════════════════════

function elPass(p,e){
  if(p.dead||e.dead)return;
  // acumular cargas
  if(p.charges>0){p.cD--;if(p.cD<=0){p.charges=0;updHUD();}}
  if(p.charges>=5)return;
  if(dst(p,e)<170){if(p.cT>0){p.cT--;return;}p.cT=30;p.charges=Math.min(5,p.charges+1);p.cD=300;addPt(e.cx,e.cy,'#ffe844',0,0,2,11);updHUD();}
  // electrocutar al contacto (cada 40 frames)
  if(p.passT>0){p.passT--;return;}p.passT=40;
  if(dst(p,e)<90){
    const d=dmgP(e,6,p);
    effects.push({x:e.cx,y:e.cy,col:'#ffe844',t:'lightning',l:14,ml:14});
    addFl(e.cx,e.cy,'⚡ -'+d,'#ffe844');
    sfx('zap');
  }
}

function elQ(p,e){
  if(p.q_t>0)return;p.q_t=240;sfx('zap');
  const c=p.charges;const d=c<=2?15:c<=4?25:42;
  addFl(p.cx,p.cy-26,(c<=2?'⚡':c<=4?'⚡⚡':'⚡⚡⚡')+' '+d+(c>=5?' RAÍZ!':''),'#ffe844');
  const{tx,ty}=tgtPos(p,e);spProj(p.cx,p.cy,tx,ty,13,'#ffe844',d,520,'zap',p,{charges:c});
  p.charges=0;updHUD();
}

function elW(p,e){if(p.w_t>0)return;p.w_t=160;sfx('zap');p.energyForm=true;p.eT=90;addFl(p.cx,p.cy-26,'🔵 ESFERA!','#aaffff');}

function elE(p,e){
  if(p.e_t>0)return;p.e_t=480;sfx('thunder');shk(5,14);addFl(p.cx,p.cy-26,'🌩️ TORMENTA!','#ffff44');
  let el=0;const iv=setInterval(()=>{
    if(!running){clearInterval(iv);return;}el++;if(el>180){clearInterval(iv);return;}
    if(el%22===0){
      const ox=(Math.random()-.5)*225,oy=(Math.random()-.5)*180;
      const bx=p.cx+ox,by=p.cy+oy;
      effects.push({x:bx,y:by,col:'#ffe844',t:'lightning',l:20,ml:20});
      for(let j=0;j<3;j++)addPt(bx,by,'#ffe844',0,0,2,14);
      if(!e.dead&&Math.abs(bx-e.cx)<54&&Math.abs(by-e.cy)<54)dmgP(e,10,p);
      if(Math.abs(e.cx-p.cx)<300&&p.charges<5){p.charges++;p.cD=300;updHUD();}
    }
  },16);
}