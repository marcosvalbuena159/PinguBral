// ═══════════════════════════════════════════════════════
const RANKS=[{icon:'🐣',name:'Polluelo',color:'#aabbcc',tiers:3,pts:'0–299'},{icon:'🦐',name:'Recolector',color:'#66aacc',tiers:3,pts:'300–799'},{icon:'🐟',name:'Pescador',color:'#44aadd',tiers:3,pts:'800–1499'},{icon:'🪨',name:'Constructor',color:'#8899aa',tiers:3,pts:'1500–2499'},{icon:'🛡️',name:'Guardián',color:'#88bbdd',tiers:3,pts:'2500–3999'},{icon:'❄️',name:'Explorador',color:'#aaddff',tiers:3,pts:'4000–5999'},{icon:'👑',name:'Emperador',color:'#ffd080',tiers:3,pts:'6000–8999'},{icon:'🌌',name:'Leyenda',color:'#cc88ff',tiers:0,pts:'9000+'}];
const MY_RANK={rankIdx:0,tier:2,pts:45,maxPts:300};
function toggleRankPanel(){const p=document.getElementById('rank-all-panel');const b=document.getElementById('rank-info-btn');if(p.classList.contains('open')){p.classList.remove('open');b.textContent='ℹ️ Ver todos los rangos';}else{p.classList.add('open');b.textContent='▲ Ocultar rangos';}}
function buildDominio(){
  const me=RANKS[MY_RANK.rankIdx];
  const box=document.getElementById('my-rank-box');if(!box)return;
  box.innerHTML=`<div style="font-size:9px;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Mi Rango Actual · Temporada 1</div><div style="font-size:46px;margin-bottom:4px">${me.icon}</div><div style="font-family:'Fredoka One',cursive;font-size:22px;color:${me.color}">${me.name} ${me.tiers>0?['I','II','III'][MY_RANK.tier-1]:'∞'}</div><div style="font-size:11px;color:rgba(255,255,255,.38);margin:8px 0">Puntos: ${MY_RANK.pts} / ${MY_RANK.maxPts}</div><div style="width:100%;max-width:280px;height:8px;background:rgba(255,255,255,.07);border-radius:4px;margin:0 auto;overflow:hidden"><div style="height:100%;border-radius:4px;background:${me.color};width:${(MY_RANK.pts/MY_RANK.maxPts*100).toFixed(0)}%"></div></div><div style="margin-top:12px;display:flex;justify-content:center;gap:8px"><button class="btn btn-p btn-sm" onclick="navTo('modesel')">⚔️ Jugar Clasificada</button></div>`;
  const grid=document.getElementById('rank-grid');if(!grid)return;grid.innerHTML='';
  RANKS.forEach((r,i)=>{
    const card=document.createElement('div');card.className='rank-card'+(i===MY_RANK.rankIdx?' current-rank':'');
    let tiersHtml='';
    if(r.tiers>0){for(let t=1;t<=r.tiers;t++){const isDone=i<MY_RANK.rankIdx||(i===MY_RANK.rankIdx&&t<MY_RANK.tier);const isCur=i===MY_RANK.rankIdx&&t===MY_RANK.tier;tiersHtml+=`<div class="rtier${isDone?' done':''}${isCur?' cur':''}" style="${isCur?'background:#ffd080;box-shadow:0 0 5px #ffd080':''}"></div>`;}}
    card.innerHTML=`<span class="r-icon">${r.icon}</span><div class="r-name" style="color:${r.color}">${r.name}</div><div class="r-tiers">${tiersHtml||'<span style="font-size:11px;color:#cc88ff">∞</span>'}</div><div class="r-pts">${r.pts} pts</div>`;
    grid.appendChild(card);
  });
  // Leaderboard
  const lb=document.getElementById('leaderboard-list');if(!lb)return;
  const lbData=[
    {pos:1,name:'FrostKing',rank:'👑',rankName:'Emperador I',pts:6.420,col:'#ffd080'},
    {pos:2,name:'IceMaster99',rank:'❄️',rankName:'Explorador III',pts:5.980,col:'#aaddff'},
    {pos:3,name:'PollarBrawler',rank:'❄️',rankName:'Explorador II',pts:5.540,col:'#aaddff'},
    {pos:4,name:'VeloKing',rank:'🛡️',rankName:'Guardián III',pts:3.870,col:'#88bbdd'},
    {pos:5,name:'ChiliMaster',rank:'🛡️',rankName:'Guardián II',pts:3.440,col:'#88bbdd'},
    {pos:6,name:'ElectroZ',rank:'🪨',rankName:'Constructor III',pts:2.490,col:'#8899aa'},
    {pos:7,name:'GuerreroX',rank:'🪨',rankName:'Constructor I',pts:1.620,col:'#8899aa'},
    {pos:8,name:currentUser||'Tú',rank:'🐣',rankName:'Polluelo III',pts:45,col:'#aabbcc',isMe:true},
  ];
  lb.innerHTML='';
  const wrap=document.createElement('div');wrap.style.cssText='max-width:560px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:14px;overflow:hidden;';
  lbData.forEach((e,i)=>{
    const row=document.createElement('div');
    row.style.cssText=`display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid rgba(255,255,255,.04);${e.isMe?'background:rgba(80,140,255,.08);':''}`;
    const medal=e.pos===1?'🥇':e.pos===2?'🥈':e.pos===3?'🥉':`<span style="color:rgba(255,255,255,.35);font-size:12px">#${e.pos}</span>`;
    row.innerHTML=`<div style="width:28px;text-align:center;font-size:16px">${medal}</div><div style="flex:1"><div style="font-size:12px;font-weight:700;color:${e.isMe?'#7ab8ff':'#fff'}">${e.name}${e.isMe?' (Tú)':''}</div><div style="font-size:9px;color:rgba(255,255,255,.3)">${e.rank} ${e.rankName}</div></div><div style="font-family:'Fredoka One',cursive;font-size:13px;color:${e.col}">${e.pts.toLocaleString()} <span style="font-size:9px;color:rgba(255,255,255,.35)">pts</span></div>`;
    wrap.appendChild(row);
  });
  lb.appendChild(wrap);
}
