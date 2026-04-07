// ═══════════════════════════════════════════════════════
//  COLONIA
// ═══════════════════════════════════════════════════════
function buildColonia(){
  const members=[
    {name:'PolarBrawler',role:'Fundador',pts:1240,rank:'❄️'},
    {name:'IceMaster99',role:'Capitán',pts:980,rank:'🛡️'},
    {name:'FrostyPengu',role:'Miembro',pts:720,rank:'🪨'},
    {name:'ChiliZ',role:'Miembro',pts:610,rank:'🪨'},
    {name:'VeloFast',role:'Miembro',pts:480,rank:'🐟'},
    {name:'ElectroB',role:'Miembro',pts:390,rank:'🐟'},
    {name:'GuerreroX',role:'Miembro',pts:280,rank:'🦐'},
    {name:currentUser||'Tú',role:'Miembro',pts:45,rank:'🐣',isMe:true},
  ];
  const list=document.getElementById('colony-members-list');if(!list)return;list.innerHTML='';
  const wrap=document.createElement('div');wrap.style.cssText='background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:0 16px;max-width:620px;';
  members.forEach((m,i)=>{
    const row=document.createElement('div');row.className='cm-item';
    row.innerHTML=`<div class="cm-rank">${m.rank}</div><div class="cm-name" style="color:${m.isMe?'#7ab8ff':'#fff'}">${m.name}${m.isMe?' (Tú)':''}</div><div class="cm-role">${m.role}</div><div class="cm-pts">${m.pts} pts</div>`;
    wrap.appendChild(row);
  });list.appendChild(wrap);
}