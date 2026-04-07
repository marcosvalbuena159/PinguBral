// ═══════════════════════════════════════════════════════
//  TIENDA v3 · Wild Rift Style
//  Tabs: Pingüinos · Skins · Huevos · Piedras · Cambio
//  · Sin "Destacados"
//  · Huevos tienen rarezas: Épica/Legendaria/Ultra
//  · Mismo sistema de tarjetas que la Guarida
// ═══════════════════════════════════════════════════════

let currentShopTab = 'chars';

// ── Reutiliza constantes de guarida.js ────────────────
// RAR_COL, RAR_CLASS, ROL_COL, CICONS, CHARS_DEF, ALL_SKINS
// deben estar cargados antes que tienda.js

// ── HUEVOS ────────────────────────────────────────────
const SHOP_EGGS = [
  { id:'egg_pengu',  icon:'🥚', name:'Huevo Pingüino',  type:'Pingüinos',  cost:400,  costIcon:'🐟', rar:'Rara',       col:'#4488ff', locked:false,
    desc:'Contiene skins y variantes de pingüinos. ¡Puede aparecer Legendario!',
    pool:[{icon:'🐧',name:'Polar Alt',rar:'Rara',col:'#4488ff'},{icon:'🐧',name:'Chili Alt',rar:'Rara',col:'#ff6b5a'},{icon:'🌿',name:'Nat. Alt',rar:'Épica',col:'#66dd44'},{icon:'🏹',name:'G.Dorado',rar:'Legendaria',col:'#ffd080'}]},
  { id:'egg_skin',   icon:'🥚', name:'Huevo de Skin',   type:'Skins',      cost:500,  costIcon:'🪨', rar:'Épica',      col:'#aa44ff', locked:false,
    desc:'Garantiza skin Rara o superior. Alta probabilidad de Épica.',
    pool:[{icon:'❄️',name:'Polar Ártico',rar:'Épica',col:'#88ddff'},{icon:'🌋',name:'Chili Volc.',rar:'Rara',col:'#ff8844'},{icon:'👻',name:'V.Fantasma',rar:'Épica',col:'#44ffcc'},{icon:'✨',name:'C.Sombrío',rar:'Épica',col:'#aa88ff'}]},
  { id:'egg_icon',   icon:'🥚', name:'Huevo de Ícono',  type:'Íconos',     cost:200,  costIcon:'🦐', rar:'Común',      col:'#88aaff', locked:false,
    desc:'Íconos y emotes aleatorios. Barato con sorpresas Épicas.',
    pool:[{icon:'👑',name:'Corona Hielo',rar:'Épica',col:'#aaddff'},{icon:'🏆',name:'Trofeo Polar',rar:'Rara',col:'#ffd080'},{icon:'⚡',name:'Rayo',rar:'Común',col:'#ffe844'}]},
  { id:'egg_emote',  icon:'🥚', name:'Huevo Emoticono', type:'Emoticonos', cost:150,  costIcon:'🦐', rar:'Común',      col:'#cc88ff', locked:false,
    desc:'Emoticonos animados para usar en partida.',
    pool:[{icon:'🕺',name:'Baile Pingüino',rar:'Rara',col:'#cc88ff'},{icon:'😂',name:'Carcajada',rar:'Común',col:'#aabbcc'},{icon:'🎉',name:'Fiesta',rar:'Común',col:'#ffaa44'}]},
  { id:'egg_bg',     icon:'🥚', name:'Huevo de Fondo',  type:'Fondos',     cost:300,  costIcon:'🦐', rar:'Rara',       col:'#44aaff', locked:true,
    desc:'Fondos de perfil. ¡La Aurora Boreal es Legendaria!',
    pool:[{icon:'🌌',name:'Aurora Boreal',rar:'Legendaria',col:'#cc88ff'},{icon:'🌊',name:'Océano Ártico',rar:'Rara',col:'#44aaff'}]},
  { id:'egg_legend', icon:'🥚', name:'Huevo Legendario',type:'Legendario', cost:5,    costIcon:'🦪', rar:'Legendaria', col:'#ffd080', locked:false,
    desc:'100% garantizado Legendario. Se obtienen en Eventos especiales.',
    pool:[{icon:'🌌',name:'Skin Aurora',rar:'Legendaria',col:'#cc88ff'},{icon:'🏆',name:'Emote Victoria',rar:'Legendaria',col:'#ffd080'},{icon:'👑',name:'Ícono Leyenda',rar:'Legendaria',col:'#ffd080'}]},
  { id:'egg_ultra',  icon:'🥚', name:'Huevo Ultra',     type:'Ultra',      cost:15,   costIcon:'🦪', rar:'Ultra',      col:'#ffffff', locked:false,
    desc:'Ultra garantizado. El contenido más exclusivo del juego.',
    pool:[{icon:'💫',name:'Skin Ultra Polar',rar:'Ultra',col:'#ffffff'},{icon:'🌈',name:'Emote Arcoíris',rar:'Ultra',col:'#ffffff'},{icon:'⭐',name:'Ícono Ultra',rar:'Ultra',col:'#ffffff'}]},
];
window._EGGS = SHOP_EGGS;

// ══════════════════════════════════════════════════════
function setShopTab(el, tab) {
  document.querySelectorAll('.stab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  buildShop(tab);
}

// FIX: igual que guarida — inyecta en #shop-inner, nunca borra shop-content
function buildShop(tab) {
  currentShopTab = tab || currentShopTab;
  let inner = document.getElementById('shop-inner');
  if (!inner) {
    const cont = document.getElementById('shop-content');
    if (!cont) return;
    inner = document.createElement('div');
    inner.id = 'shop-inner';
    cont.appendChild(inner);
  }
  inner.innerHTML = '';
  if      (currentShopTab === 'chars')    buildShopChars(inner);
  else if (currentShopTab === 'skins')    buildShopSkins(inner);
  else if (currentShopTab === 'eggs')     buildShopEggs(inner);
  else if (currentShopTab === 'gems')     buildShopGems(inner);
  else if (currentShopTab === 'exchange') buildShopExchange(inner);
}

// ── Helpers compartidos con guarida ───────────────────
function sActivateFiltBtn(el) {
  const p = el.closest('.wr-filter-btns');
  if (p) p.querySelectorAll('.wr-filt-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
}
function sMakeBar(owned, total, label, searchHtml, selectHtml, btns, cbName) {
  const d = document.createElement('div'); d.className = 'collection-bar';
  d.innerHTML = `
    <div class="collection-counts">
      <span class="cc-num">${owned}</span><span class="cc-sep">/</span>
      <span class="cc-total">${total}</span>
      <span class="cc-label">${label}</span>
    </div>
    <div class="filter-row">
      <div class="wr-search-box"><span class="wr-search-icon">🔍</span>${searchHtml}</div>
      ${selectHtml}
      <div class="wr-filter-btns">
        ${btns.map((b,i)=>`<button class="wr-filt-btn${i===0?' active':''}" onclick="${cbName}(this,'${b[0]}')">${b[1]}</button>`).join('')}
      </div>
    </div>`;
  return d;
}
function sImg(image, icon, imgCls='char-compact-img', emojiCls='char-compact-emoji') {
  if (image) return `<img src="${image}" class="${imgCls}" alt=""
    onerror="this.style.display='none';this.nextElementSibling.style.removeProperty('display')">
    <div class="${emojiCls}" style="display:none">${icon}</div>`;
  return `<div class="${emojiCls}">${icon}</div>`;
}

// ══ PINGÜINOS ════════════════════════════════════════
let sCharFilter='', sCharRolF='', sCharOwnedF='all';
function buildShopChars(cont) {
  const entries = Object.entries(CHARS_DEF);
  const ownedN  = entries.filter(([k,d])=>d.owned||hasItem('char',k)).length;
  cont.appendChild(sMakeBar(ownedN, entries.length, 'Pingüinos',
    `<input class="wr-search-input" placeholder="Buscar pingüino..." oninput="sCharFilter=this.value.toLowerCase();renderShopCharGrid()">`,
    `<select class="wr-filter-select" onchange="sCharRolF=this.value;renderShopCharGrid()">
       <option value="">Todos los roles</option>
       <option>Tanque</option><option>Asesino</option><option>Mago</option>
       <option>Guerrero</option><option>Soporte</option>
     </select>`,
    [['all','Todos'],['owned','Obtenidos'],['locked','Bloqueados']], 'setShopCharOwned'
  ));
  const grid = document.createElement('div');
  grid.className = 'g-card-grid'; grid.id = 'shop-chars-grid';
  cont.appendChild(grid);
  sCharFilter=''; sCharRolF=''; sCharOwnedF='all';
  renderShopCharGrid();
}
window.setShopCharOwned = function(el,val){ sActivateFiltBtn(el); sCharOwnedF=val; renderShopCharGrid(); };
function renderShopCharGrid() {
  const grid = document.getElementById('shop-chars-grid');
  if (!grid) return; grid.innerHTML='';
  const list = Object.entries(CHARS_DEF).filter(([k,d])=>{
    const owned = d.owned||hasItem('char',k);
    if (sCharFilter && !d.name.toLowerCase().includes(sCharFilter)) return false;
    if (sCharRolF && d.cls!==sCharRolF) return false;
    if (sCharOwnedF==='owned' && !owned) return false;
    if (sCharOwnedF==='locked' && owned) return false;
    return true;
  });
  if (!list.length){grid.innerHTML='<div class="g-no-results">Sin resultados 🐧</div>';return;}
  list.forEach(([k,d])=>{
    const isOwned = d.owned||hasItem('char',k);
    const card = document.createElement('div');
    card.className = 'g-card'+(isOwned?' owned':' locked');
    card.onclick = ()=>openShopCharModal(k);
    card.innerHTML = `
      <div class="g-card-portrait" style="--col:${d.color}">
        ${sImg(d.image,d.icon)}
        ${isOwned?'<div class="g-check">✓</div>':'<div class="g-lock">🔒</div>'}
        <div class="g-role-tag" style="color:${ROL_COL[d.cls]};background:${ROL_COL[d.cls]}1a;border-color:${ROL_COL[d.cls]}35">${d.cls}</div>
      </div>
      <div class="g-card-foot">
        <div class="g-name" style="color:${d.color}">${d.name}</div>
        <div class="g-sub">${d.cls} · ${d.rol}</div>
        ${!isOwned?`<div class="g-price">${CICONS[d.currency||'peces']} <strong>${d.price||'—'}</strong></div>`
                  :`<div class="g-nivel">Nv. <span>${d.nivel||1}</span></div>`}
      </div>`;
    grid.appendChild(card);
  });
}
function openShopCharModal(key) {
  const d = CHARS_DEF[key]; if(!d) return;
  const isOwned = d.owned||hasItem('char',key);
  const ov = sMkOv();
  ov.innerHTML = `<div class="wr-modal-box" style="--col:${d.color}">
    <button class="wr-modal-close" onclick="this.closest('.wr-modal-overlay').remove()">✕</button>
    <div class="wr-modal-splash" style="background:linear-gradient(150deg,${d.color}22,${d.color}06 55%,transparent)">
      <div class="wr-modal-portrait">${sImg(d.image,d.icon,'wr-portrait-img','wr-portrait-emoji')}</div>
      <div class="wr-modal-info">
        <div class="wr-role-badge" style="color:${ROL_COL[d.cls]}">${d.cls} · ${d.rol}</div>
        <div class="wr-char-name" style="color:${d.color}">${d.name}</div>
        <div class="wr-lore">${d.lore}</div>
        ${isOwned
          ?`<div class="wr-nivel-badge">Nivel <strong>${d.nivel||1}</strong></div>
            <div class="wr-owned-badge">✅ Ya lo tienes</div>`
          :`<div class="wr-locked-notice">🔒 No desbloqueado</div>
            <div class="wr-shop-price">${CICONS[d.currency||'peces']} <strong>${d.price||'—'}</strong></div>
            <button class="wr-shop-btn" onclick="buyChar('${key}',${d.price},'${d.currency||'peces'}');this.closest('.wr-modal-overlay').remove()">
              Comprar Pingüino
            </button>`}
      </div>
    </div>
  </div>`;
  sShowOv(ov);
}

// ══ SKINS ════════════════════════════════════════════
let sSkinFilter='', sSkinRarF='', sSkinOwnedF='all';
function buildShopSkins(cont) {
  const ownedN = ALL_SKINS.filter(s=>hasItem('skin',s.key)).length;
  cont.appendChild(sMakeBar(ownedN, ALL_SKINS.length, 'Skins',
    `<input class="wr-search-input" placeholder="Skin o pingüino..." oninput="sSkinFilter=this.value.toLowerCase();renderShopSkinGrid()">`,
    `<select class="wr-filter-select" onchange="sSkinRarF=this.value;renderShopSkinGrid()">
       <option value="">Toda rareza</option>
       <option>Épica</option><option>Legendaria</option><option>Ultra</option>
     </select>`,
    [['all','Todas'],['owned','Obtenidas'],['locked','Bloqueadas']], 'setShopSkinOwned'
  ));
  const grid = document.createElement('div');
  grid.className = 'g-card-grid'; grid.id = 'shop-skins-grid';
  cont.appendChild(grid);
  sSkinFilter=''; sSkinRarF=''; sSkinOwnedF='all';
  renderShopSkinGrid();
}
window.setShopSkinOwned = function(el,val){ sActivateFiltBtn(el); sSkinOwnedF=val; renderShopSkinGrid(); };
function renderShopSkinGrid() {
  const grid = document.getElementById('shop-skins-grid');
  if (!grid) return; grid.innerHTML='';
  const list = ALL_SKINS.filter(s=>{
    const owned = hasItem('skin',s.key);
    const cn = CHARS_DEF[s.charKey]?.name||'';
    if (sSkinFilter && !s.name.toLowerCase().includes(sSkinFilter) && !cn.toLowerCase().includes(sSkinFilter)) return false;
    if (sSkinRarF && s.rar!==sSkinRarF) return false;
    if (sSkinOwnedF==='owned' && !owned) return false;
    if (sSkinOwnedF==='locked' && owned) return false;
    return true;
  });
  if (!list.length){grid.innerHTML='<div class="g-no-results">Sin resultados 🎨</div>';return;}
  list.forEach(s=>{
    const isOwned = hasItem('skin',s.key);
    const rc = RAR_CLASS[s.rar]||'';
    const isU = s.rar==='Ultra';
    const bg = isU?'linear-gradient(160deg,rgba(255,107,157,.15),rgba(68,255,204,.1),rgba(170,68,255,.12))':`linear-gradient(160deg,${s.col}22,${s.col}08)`;
    const card = document.createElement('div');
    card.className = `g-card ${rc}`+(isOwned?' owned':' locked');
    card.onclick = ()=>openShopSkinModal(s.key);
    card.innerHTML = `
      <div class="g-card-portrait" style="--col:${s.col};background:${bg}">
        ${sImg(s.image,s.icon)}
        ${isOwned?'<div class="g-check">✓</div>':'<div class="g-lock">🔒</div>'}
        <div class="g-rar-dot ${rc}"></div>
      </div>
      <div class="g-card-foot">
        <div class="g-name" style="color:${s.col}">${s.name}</div>
        <div class="g-sub">${CHARS_DEF[s.charKey]?.name||''}</div>
        <div class="g-rar" style="color:${RAR_COL[s.rar]}">${s.rar}</div>
        ${!isOwned?`<div class="g-price">${CICONS[s.cur]} <strong>${s.price}</strong></div>`:''}
      </div>`;
    grid.appendChild(card);
  });
}
function openShopSkinModal(skinKey) {
  let active = ALL_SKINS.find(s=>s.key===skinKey); if(!active) return;
  function build(sk) {
    const charDef   = CHARS_DEF[sk.charKey];
    const charSkins = ALL_SKINS.filter(s=>s.charKey===sk.charKey);
    const isOwned   = hasItem('skin',sk.key);
    const rc  = RAR_CLASS[sk.rar]||'';
    const isU = sk.rar==='Ultra';
    const prevBg = isU?'linear-gradient(145deg,rgba(255,107,157,.2),rgba(68,255,204,.12),rgba(170,68,255,.18))':`linear-gradient(145deg,${sk.col}30,${sk.col}0a)`;
    return `<div class="wr-modal-box skin-modal" style="--col:${sk.col}">
      <button class="wr-modal-close" onclick="this.closest('.wr-modal-overlay').remove()">✕</button>
      <div class="skin-prev-section" style="${prevBg}">
        <div class="skin-prev-wrap ${rc}">
          ${sImg(sk.image,sk.icon,'skin-prev-img','skin-prev-emoji')}
          <div class="skin-prev-rar-badge ${rc}">${sk.rar}</div>
        </div>
        <div class="skin-prev-info">
          <div class="skin-prev-char">${charDef?.icon||'🐧'} ${charDef?.name||sk.charKey}</div>
          <div class="skin-prev-name">${sk.name}</div>
          <div class="skin-prev-rar-text" style="color:${RAR_COL[sk.rar]}">${sk.rar}</div>
          ${isOwned
            ?'<div class="skin-obtained">✅ Ya la tienes</div>'
            :`<div class="skin-price">${CICONS[sk.cur]} <strong>${sk.price}</strong></div>
              <button class="wr-shop-btn" onclick="buyItem('skin','${sk.key}',${sk.price},'${sk.cur}');buildShop(currentShopTab);this.closest('.wr-modal-overlay').remove()">
                Comprar Skin
              </button>`}
        </div>
      </div>
      ${charSkins.length>1?`
      <div class="skin-gallery-title">Otras skins de ${charDef?.name||sk.charKey}</div>
      <div class="skin-gallery">
        ${charSkins.map(cs=>{
          const crc=RAR_CLASS[cs.rar]||'';const isAct=cs.key===sk.key;
          const cgBg=cs.rar==='Ultra'?'linear-gradient(135deg,rgba(255,107,157,.15),rgba(68,255,204,.1))':`linear-gradient(135deg,${cs.col}22,${cs.col}08)`;
          return `<div class="skin-gal-thumb${isAct?' active':''}" onclick="updateShopSkinModal('${cs.key}')" title="${cs.name}">
            <div class="skin-gal-img" style="${cgBg}">
              ${sImg(cs.image,cs.icon,'skin-gal-real-img','skin-gal-emoji')}
              <div class="skin-gal-dot ${crc}"></div>
            </div>
            <div class="skin-gal-name">${cs.name}</div>
          </div>`;
        }).join('')}
      </div>`:''}
    </div>`;
  }
  const ov = sMkOv(); ov.innerHTML = build(active); sShowOv(ov);
  window.updateShopSkinModal = function(key){ active=ALL_SKINS.find(s=>s.key===key)||active; ov.innerHTML=build(active); };
}

// ══ HUEVOS ═══════════════════════════════════════════
function buildShopEggs(cont) {
  // Info de probabilidades
  const probBar = document.createElement('div'); probBar.className='shop-prob-bar';
  probBar.innerHTML=`
    <span style="color:#9aa4af">Común ~50%</span>
    <span style="color:#4488ff">Rara ~30%</span>
    <span style="color:#aa44ff">Épica ~18%</span>
    <span style="color:#ffd080">Legendaria ~2%</span>
    <span class="ultra-text">Ultra &lt;0.1%</span>`;
  cont.appendChild(probBar);

  const grid = document.createElement('div'); grid.className='g-card-grid';
  SHOP_EGGS.forEach(egg=>{
    const rc  = RAR_CLASS[egg.rar]||'';
    const isU = egg.rar==='Ultra';
    const bg  = isU?'linear-gradient(160deg,rgba(255,107,157,.14),rgba(68,255,204,.08),rgba(170,68,255,.12))':`linear-gradient(160deg,${egg.col}22,${egg.col}08)`;
    const card = document.createElement('div');
    card.className = `g-card egg-card ${rc}`+(egg.locked?' locked':'');
    card.onclick = ()=>openEggDetailModal(egg);
    card.innerHTML = `
      <div class="g-card-portrait" style="background:${bg}">
        <div class="egg-portrait-icon">🥚</div>
        ${egg.locked?'<div class="g-lock">🔒</div>':''}
        <div class="g-rar-dot ${rc}" style="${!rc?`background:${RAR_COL[egg.rar]};box-shadow:0 0 6px ${RAR_COL[egg.rar]}`:''}"></div>
        <div class="g-role-tag" style="color:${egg.locked?'rgba(255,255,255,.3)':RAR_COL[egg.rar]};background:${egg.col}18;border-color:${egg.col}35">${egg.type}</div>
      </div>
      <div class="g-card-foot">
        <div class="g-name" style="color:${isU?'#fff':RAR_COL[egg.rar]}">${egg.name}</div>
        <div class="g-rar" style="color:${RAR_COL[egg.rar]}">${egg.rar}</div>
        <div class="g-price">${egg.costIcon} <strong>${egg.cost}</strong></div>
      </div>`;
    grid.appendChild(card);
  });
  cont.appendChild(grid);
}

function openEggDetailModal(egg) {
  const rc  = RAR_CLASS[egg.rar]||'';
  const isU = egg.rar==='Ultra';
  const prevBg = isU?'linear-gradient(145deg,rgba(255,107,157,.18),rgba(68,255,204,.1),rgba(170,68,255,.16))':`linear-gradient(145deg,${egg.col}28,${egg.col}08)`;
  const ov = sMkOv();
  ov.innerHTML = `<div class="wr-modal-box egg-modal-detail" style="--col:${egg.col}">
    <button class="wr-modal-close" onclick="this.closest('.wr-modal-overlay').remove()">✕</button>
    <div class="egg-detail-top" style="${prevBg}">
      <div class="egg-detail-icon ${rc}">🥚</div>
      <div class="egg-detail-info">
        <div class="egg-detail-type" style="color:${RAR_COL[egg.rar]}">${egg.type} · ${egg.rar}</div>
        <div class="egg-detail-name">${egg.name}</div>
        <div class="egg-detail-desc">${egg.desc}</div>
        <div class="egg-detail-cost">${egg.costIcon} <strong>${egg.cost}</strong></div>
        ${egg.locked
          ?'<div class="egg-detail-locked">🔒 Bloqueado · Consíguelo en Eventos</div>'
          :`<button class="wr-shop-btn" onclick="openEgg('${egg.id}');this.closest('.wr-modal-overlay').remove()">
              ✨ Abrir Huevo
            </button>`}
      </div>
    </div>
    <div class="egg-detail-pool-section">
      <div class="egg-pool-title">Posibles recompensas</div>
      <div class="egg-pool-list">
        ${egg.pool.map(p=>`
          <div class="egg-pool-row">
            <span class="egg-pool-icon">${p.icon}</span>
            <span class="egg-pool-name">${p.name}</span>
            <span class="egg-pool-rar" style="color:${RAR_COL[p.rar]}">${p.rar}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
  sShowOv(ov);
}

// ══ PIEDRAS ══════════════════════════════════════════
function buildShopGems(cont) {
  const hdr = document.createElement('div'); hdr.className='shop-section-hdr';
  hdr.innerHTML='<div class="shop-sec-title">Comprar Piedras 🪨</div><div class="shop-sec-sub">Las Piedras permiten comprar Skins Épicas, Legendarias y Ultra</div>';
  cont.appendChild(hdr);
  const grid = document.createElement('div'); grid.className='gems-grid';
  [
    {icon:'💎',amount:80,  bonus:0,    price:'USD 1.99', featured:false},
    {icon:'💎💎',amount:400,bonus:40,   price:'USD 9.99', featured:false},
    {icon:'💎💎💎',amount:900,bonus:180,price:'USD 19.99',featured:true},
    {icon:'🪨✨',amount:2000,bonus:600, price:'USD 39.99',featured:false},
    {icon:'🌌',amount:5000, bonus:2000, price:'USD 99.99',featured:false},
  ].forEach(p=>{
    const total=p.amount+p.bonus;
    const c=document.createElement('div'); c.className='gem-card'+(p.featured?' featured':'');
    c.innerHTML=`${p.featured?'<div class="gem-popular">⭐ MÁS POPULAR</div>':''}
      <span class="gc-icon">${p.icon}</span>
      <div class="gc-amount">🪨 ${p.amount.toLocaleString('es')}</div>
      <div class="gc-bonus">${p.bonus?'+'+p.bonus.toLocaleString('es')+' GRATIS':'&nbsp;'}</div>
      <div class="gc-price">${p.price}</div>
      <button class="wr-shop-btn" style="width:100%;margin-top:10px" onclick="addCurrency('piedras',${total});showToast('🪨 +${total} añadidas (demo)','#c0a0ff');this.textContent='✅ Añadido';this.disabled=true">
        Comprar
      </button>`;
    grid.appendChild(c);
  });
  cont.appendChild(grid);
  const note=document.createElement('div'); note.className='gems-note';
  note.textContent='💳 Demo: las piedras se añaden directo · Pagos reales próximamente';
  cont.appendChild(note);
}

// ══ CAMBIO ═══════════════════════════════════════════
function buildShopExchange(cont) {
  const hdr=document.createElement('div'); hdr.className='shop-section-hdr';
  hdr.innerHTML='<div class="shop-sec-title">Intercambio de Monedas</div><div class="shop-sec-sub">Convierte entre tipos a tasa fija</div>';
  cont.appendChild(hdr);
  const grid=document.createElement('div'); grid.className='exchange-grid';
  [
    {from:'piedras',fromA:100,fromI:'🪨',to:'peces',toA:500,toI:'🐟'},
    {from:'krill',  fromA:200,fromI:'🦐',to:'peces',toA:400,toI:'🐟'},
    {from:'piedras',fromA:50, fromI:'🪨',to:'krill', toA:100,toI:'🦐'},
    {from:'perlas', fromA:1,  fromI:'🦪',to:'piedras',toA:80,toI:'🪨'},
  ].forEach(ex=>{
    const row=document.createElement('div'); row.className='exch-row';
    row.innerHTML=`
      <div class="exch-from">${ex.fromI} <strong>${ex.fromA}</strong> ${ex.from.charAt(0).toUpperCase()+ex.from.slice(1)}</div>
      <div class="exch-arrow">→</div>
      <div class="exch-to">${ex.toI} <strong>${ex.toA}</strong></div>
      <div class="exch-rate">Tasa fija</div>
      <button class="exch-btn" onclick="doExchange('${ex.from}',${ex.fromA},'${ex.to}',${ex.toA},this)">Cambiar</button>`;
    grid.appendChild(row);
  });
  cont.appendChild(grid);
}

function doExchange(fromCur,fromAmt,toCur,toAmt,btn) {
  const u=getCurrUser(); if(!u){showToast('⚠️ Inicia sesión','#ff8844');return;}
  if(u[fromCur]<fromAmt){showToast('❌ No tienes suficiente '+CICONS[fromCur],'#ff4444');return;}
  u[fromCur]-=fromAmt; u[toCur]=(u[toCur]||0)+toAmt; saveCurrUser(u); updateTopbarCurrencies();
  showToast('✅ +'+toAmt+' '+CICONS[toCur],'#44ff88');
  btn.textContent='✅'; btn.disabled=true;
  setTimeout(()=>{btn.textContent='Cambiar';btn.disabled=false;},2500);
}

function buyChar(key,price,currency) {
  const ok=buyItem('char',key,price,currency);
  if(ok){CHARS_DEF[key].owned=true;const u=getCurrUser();if(u){u.ownedChars=[...(u.ownedChars||[]),key];saveCurrUser(u);}buildShop(currentShopTab);}
}

// ══ OVERLAY ══════════════════════════════════════════
function sMkOv() {
  const ov=document.createElement('div'); ov.className='wr-modal-overlay';
  ov.onclick=e=>{if(e.target===ov)ov.remove();}; return ov;
}
function sShowOv(ov){ document.body.appendChild(ov); requestAnimationFrame(()=>ov.classList.add('visible')); }