// ═══════════════════════════════════════════════════════
//  MISIONES
// ═══════════════════════════════════════════════════════
function buildMisiones(){
  const daily=[
    {icon:'⚔️',name:'Primera Sangre',desc:'Elimina a un enemigo en una partida',prog:0,max:1,rew:150,rewIcon:'🐟',done:false},
    {icon:'🏠',name:'Destructor de Bases',desc:'Inflige 500 de daño a la base enemiga',prog:340,max:500,rew:80,rewIcon:'🦐',done:false},
    {icon:'🎮',name:'Jugador del Día',desc:'Completa 2 partidas',prog:2,max:2,rew:200,rewIcon:'🐟',done:true},
  ];
  const season=[
    {icon:'🏆',name:'Ascenso Polar',desc:'Sube 1 nivel de rango',prog:0,max:1,rew:500,rewIcon:'🐟',done:false},
    {icon:'💀',name:'Cazador de la Tundra',desc:'Consigue 50 eliminaciones en total',prog:28,max:50,rew:300,rewIcon:'🦐',done:false},
    {icon:'🐧',name:'Maestro Polar',desc:'Juega 10 partidas con Polar',prog:6,max:10,rew:8,rewIcon:'🦪',done:false},
    {icon:'⚡',name:'Poder Eléctrico',desc:'Usa Electrochoque 20 veces',prog:20,max:20,rew:5,rewIcon:'🦪',done:true},
    {icon:'🎯',name:'Francotirador Ártico',desc:'Inflige 10.000 de daño en total',prog:8240,max:10000,rew:12,rewIcon:'🦪',done:false},
  ];
  function renderList(items,containerId){
    const c=document.getElementById(containerId);if(!c)return;c.innerHTML='';
    items.forEach(m=>{
      const pct=Math.min(100,(m.prog/m.max)*100).toFixed(0);
      const div=document.createElement('div');div.className='mission-item'+(m.done?' completed':'');
      div.innerHTML=`<div class="mi-icon">${m.icon}</div><div class="mi-body"><div class="mi-name">${m.name}</div><div class="mi-desc">${m.desc}</div>${!m.done?`<div class="mi-prog-bar"><div class="mi-prog-fill" style="width:${pct}%"></div></div><div style="font-size:8px;color:rgba(255,255,255,.3);margin-top:3px">${m.prog}/${m.max}</div>`:'<div style="font-size:9px;color:#44ff88;margin-top:4px">✓ Completada</div>'}</div><div class="mi-reward"><div class="mi-rew-icon">${m.rewIcon}</div><div class="mi-rew-val">+${m.rew}</div>${m.done&&!m._claimed?`<button class="btn btn-gold btn-sm" onclick="this.textContent='✓';this.disabled=true" style="margin-top:4px;font-size:10px">Reclamar</button>`:''}  </div>`;
      c.appendChild(div);
    });
  }
  renderList(daily,'mission-daily');
  renderList(season,'mission-season');
}