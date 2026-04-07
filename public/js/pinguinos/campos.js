// ═══════════════════════════════════════════════════════
//  CAMPOS DE FUERZA — Mago/Soporte · Rango Medio
//  Pasiva: regenera escudo c/4s + daño mágico al enemigo cercano
// ═══════════════════════════════════════════════════════

function cfPass(p,e){
  if(p.dead)return;
  // Regenerar escudo cada 240 frames (~4s) si no está al máx
  p.cfShieldRegen=(p.cfShieldRegen||0)+1;
  if(p.cfShieldRegen>=240){p.cfShieldRegen=0;
    if(p.cfShieldVal<p.cfShieldMax){
      p.cfShieldVal=Math.min(p.cfShieldMax,p.cfShieldVal+20);
      addFl(p.cx,p.cy-20,'🔮 +20 ESCUDO','#a078ff');
      addPt(p.cx,p.cy,'#c0a0ff',0,0,3,22);
      for(let i=0;i<6;i++){const a=i/6*Math.PI*2;addPt(p.cx+Math.cos(a)*22,p.cy+Math.sin(a)*22,'#a078ff',Math.cos(a)*1.5,Math.sin(a)*1.5,2,18);}
    }
  }
  // Daño mágico al enemigo cercano cada 80 frames
  p.cfPassTimer=(p.cfPassTimer||0)+1;
  if(p.cfPassTimer>=80){p.cfPassTimer=0;
    if(!e.dead&&dst(p,e)<130){
      const d=dmgP(e,7,p);
      effects.push({x:e.cx,y:e.cy,col:'#c0a0ff',t:'buff_ring',l:18,ml:18});
      addFl(e.cx,e.cy,'🔮 -'+d,'#a078ff');
      addPt(e.cx,e.cy,'#a078ff',0,-1,2,16);
    }
  }
}

// Q: Proyectil de campo de fuerza con trayecto curvado
function cfQ(p,e){
  if(p.q_t>0)return;p.q_t=130;sfx('ice');
  addFl(p.cx,p.cy-26,'🔮 ¡CAMPO CURVO!','#c0a0ff');
  const{tx,ty}=tgtPos(p,e);
  // Lanzar 3 proyectiles en ángulos curvos convergentes
  for(let j=0;j<2;j++){
    const ang=(j-1)*0.45; // -0.45, 0, +0.45 rad offset
    const dx=tx-p.cx,dy=ty-p.cy,d=Math.sqrt(dx*dx+dy*dy)||1;
    const nx=dx/d*Math.cos(ang)-dy/d*Math.sin(ang);
    const ny=dx/d*Math.sin(ang)+dy/d*Math.cos(ang);
    const curveProj={x:p.cx,y:p.cy,vx:nx*10,vy:ny*10,
      col:'#c0a0ff',dmg:16,rng:480,dist:0,type:'curve_field',
      owner:p,r:6,curveAng:ang,curveTimer:0,
      tx,ty,origDx:dx/d,origDy:dy/d};
    projs.push(curveProj);
  }
}

// W: Escudo compresivo — le da al enemigo un escudo que lo comprime
function cfW(p,e){
  if(p.w_t>0)return;p.w_t=200;
  if(e.dead){ // daño a la base si enemigo muerto
    const enBase=p===p1?base2:base1;dmgB(enBase,22,p);addFl(p.cx,p.cy-20,'💜 BASE DMG!','#dd88ff');return;
  }
  addFl(e.cx,e.cy,'💜 COMPRESIÓN!','#dd88ff');sfx('pull');shk(4,9);
  // El "escudo" aparece sobre el enemigo y lo comprime (daño continuo + root)
  e.cfCompressed=(e.cfCompressed||0)+120; // 2s de compresión
  effects.push({x:e.cx,y:e.cy,col:'#dd88ff',t:'buff_ring',l:50,ml:50});
  for(let i=0;i<12;i++)addPt(e.cx,e.cy,'#aa44ff',(Math.random()-.5)*5,(Math.random()-.5)*5,3,28);
  // Daño inmediato
  dmgP(e,24,p);
}

// E: Campo Masivo — gran escudo propio + curación
function cfE(p,e){
  if(p.e_t>0)return;p.e_t=440;sfx('buff');shk(5,12);
  addFl(p.cx,p.cy-32,'🛡️ CAMPO MASIVO!','#fff');
  // Escudo máximo propio
  p.cfShieldVal=Math.min(p.cfShieldMax,p.cfShieldVal+p.cfShieldMax);
  p.shield=1;
  // Gran curación propia
  const healAmt=Math.min(p.maxHp-p.hp,60);p.hp=Math.min(p.maxHp,p.hp+60);
  if(healAmt>0)addFl(p.cx,p.cy-20,'+'+healAmt+' ❤️','#a078ff');
  for(let i=0;i<20;i++){const a=i/20*Math.PI*2;const r=60+Math.random()*40;addPt(p.cx+Math.cos(a)*r,p.cy+Math.sin(a)*r,'#a078ff',Math.cos(a)*2,Math.sin(a)*2,4,45);}
  effects.push({x:p.cx,y:p.cy,col:'#a078ff',t:'explosion',l:55,ml:55,r:16});
  effects.push({x:p.cx,y:p.cy,col:'#ffffff',t:'buff_ring',l:60,ml:60});
  updHUD();
}