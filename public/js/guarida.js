// ═══════════════════════════════════════════════════════
//  GUARIDA POLAR v6 — fix: tabs no se borran nunca
//  El contenido se inyecta en #guarida-inner (no en guarida-content)
//  Tabs HTML esperado en tu index:
//    <div id="guarida-content">
//      <div class="guarida-tabs"> … </div>
//      <div id="guarida-inner"></div>   ← aquí va el contenido
//    </div>
//
//  ══ IMÁGENES ══════════════════════════════════════════
//  Personajes : image: 'img/pinguinos/polar.png'
//  Skins      : image: 'img/skins/polar_artico.png'
//  Emotes/etc : image: 'img/reacciones/baile.gif'
//  → null  =  usa el emoji automáticamente
// ═══════════════════════════════════════════════════════

const RAR_COL   = { Común:'#9aa4af', Rara:'#4488ff', Épica:'#aa44ff', Legendaria:'#ffd080', Ultra:'#ffffff' };
const RAR_CLASS = { Épica:'rar-epica', Legendaria:'rar-legendaria', Ultra:'rar-ultra' };
const ROL_COL   = { Tanque:'#5ab0ff', Asesino:'#ff6b5a', Mago:'#c0aaff', Guerrero:'#e8a020', Soporte:'#66dd44' };
const CICONS    = { peces:'🐟', krill:'🦐', piedras:'🪨', perlas:'🦪' };

// ══ PERSONAJES ══════════════════════════════════════════
const CHARS_DEF = {
  polar:     { name:'Polar',     image:null, icon:'🐧', cls:'Tanque',   rol:'Rango Corto', color:'#5ab0ff', owned:true,  nivel:34, price:null,  currency:'peces', lore:'Nacido en las profundidades del Ártico, Polar fue el primero en despertar los poderes del hielo. Su armadura de escarcha ha resistido mil batallas.', habilidades:[{nombre:'Escudo de Hielo',desc:'Genera un escudo que absorbe 300 de daño durante 3s.',tipo:'Defensa',icon:'🛡️'},{nombre:'Avalancha',desc:'Ola de hielo que ralentiza enemigos 40%.',tipo:'Control',icon:'🌊'},{nombre:'Fortaleza Polar',desc:'Pasiva: +20% HP y resistencia al daño de área.',tipo:'Pasiva',icon:'❄️'}], stats:{ataque:55,defensa:90,velocidad:45,magia:30} },
  chili:     { name:'Chili',     image:null, icon:'🐧', cls:'Asesino',  rol:'Rango Medio', color:'#ff6b5a', owned:true,  nivel:51, price:null,  currency:'peces', lore:'Forjado en las grietas volcánicas del Sur. Canaliza el calor de la tierra en explosiones devastadoras y sus rivales nunca ven el golpe venir.', habilidades:[{nombre:'Cometa Ardiente',desc:'Proyectil ígnero que causa 220 de daño en área.',tipo:'Ataque',icon:'🔥'},{nombre:'Sombra Roja',desc:'Invisible 2s, reaparece con +50% daño.',tipo:'Especial',icon:'👤'},{nombre:'Fiebre Volcánica',desc:'Pasiva: Cada 5 ataques inflama al objetivo 3s.',tipo:'Pasiva',icon:'🌋'}], stats:{ataque:88,defensa:45,velocidad:82,magia:60} },
  cuchillas: { name:'Cuchillas', image:null, icon:'🐧', cls:'Asesino',  rol:'Rango Medio', color:'#c0aaff', owned:false, nivel:0,  price:800,   currency:'peces', lore:'Aprendió las artes oscuras de un antiguo hechicero. Mezcla veneno y magia con precisión quirúrgica que pocos pueden igualar.', habilidades:[{nombre:'Lluvia de Dagas',desc:'8 dagas que persiguen al objetivo más cercano.',tipo:'Ataque',icon:'🗡️'},{nombre:'Veneno Arcano',desc:'Envuelve al enemigo en veneno mágico 5s.',tipo:'Control',icon:'☠️'},{nombre:'Sombra Afilada',desc:'Pasiva: +35% daño crítico en sigilo.',tipo:'Pasiva',icon:'🌑'}], stats:{ataque:85,defensa:40,velocidad:75,magia:72} },
  electrico: { name:'Eléctrico', image:null, icon:'🐧', cls:'Mago',     rol:'Rango Largo', color:'#ffe844', owned:false, nivel:0,  price:800,   currency:'peces', lore:'Un accidente en un laboratorio antártico lo transformó en conductor de rayos. Ahora controla tormentas con la mente.', habilidades:[{nombre:'Rayo Cargado',desc:'Rayo que rebota 3 veces entre enemigos.',tipo:'Ataque',icon:'⚡'},{nombre:'Tormenta Estática',desc:'Zona de 300u que paraliza a los que entren.',tipo:'Control',icon:'🌩️'},{nombre:'Conductor',desc:'Pasiva: El 4to golpe descarga 2x daño.',tipo:'Pasiva',icon:'🔋'}], stats:{ataque:70,defensa:35,velocidad:55,magia:95} },
  elemental: { name:'Elemental', image:null, icon:'🐧', cls:'Mago',     rol:'Rango Medio', color:'#ff7730', owned:false, nivel:0,  price:1800,  currency:'peces', lore:'Nacido durante el equinoccio de los cuatro vientos, puede invocar cualquier fuerza de la naturaleza según la batalla lo requiera.', habilidades:[{nombre:'Ciclón Elemental',desc:'Tormenta de fuego y hielo, 400u de radio.',tipo:'Especial',icon:'🌀'},{nombre:'Cambio de Elemento',desc:'Alterna Fuego/Hielo/Rayo (+30% en su tipo).',tipo:'Especial',icon:'🔄'},{nombre:'Resonancia',desc:'Pasiva: 3 elementos activa Mega-Explosión.',tipo:'Pasiva',icon:'💥'}], stats:{ataque:78,defensa:50,velocidad:60,magia:90} },
  fortachon: { name:'Fortachón', image:null, icon:'🐧', cls:'Guerrero', rol:'Rango Corto', color:'#e8a020', owned:false, nivel:0,  price:1000,  currency:'peces', lore:'Entrenó décadas bajo las cascadas de krill de las Islas Meridionales. Su fuerza bruta puede partir icebergs de un golpe.', habilidades:[{nombre:'Martillo de Hielo',desc:'Aturde 1.5s y causa 280 daño.',tipo:'Ataque',icon:'🔨'},{nombre:'Carga Feroz',desc:'Carga 600u empujando a todos en el camino.',tipo:'Especial',icon:'🏃'},{nombre:'Piel de Acero',desc:'Pasiva: Reduce todo daño recibido 25%.',tipo:'Pasiva',icon:'🛡️'}], stats:{ataque:92,defensa:75,velocidad:38,magia:20} },
  velocista: { name:'Velocista', image:null, icon:'🐧', cls:'Asesino',  rol:'Rango Medio', color:'#44ffcc', owned:false, nivel:0,  price:1800,  currency:'peces', lore:'Modificada genéticamente en instalación secreta. Su velocidad supera a cualquier ser vivo conocido en el planeta.', habilidades:[{nombre:'Ráfaga Sónica',desc:'Teletransporte + 3 golpes rápidos (80 c/u).',tipo:'Especial',icon:'💨'},{nombre:'Estela de Hielo',desc:'Rastro que ralentiza enemigos 60% por 3s.',tipo:'Control',icon:'🌬️'},{nombre:'Adrenalina',desc:'Pasiva: Al eliminar, +15% velocidad.',tipo:'Pasiva',icon:'⚡'}], stats:{ataque:80,defensa:38,velocidad:99,magia:45} },
  naturaleza:{ name:'Naturaleza',image:null, icon:'🐧', cls:'Mago',     rol:'Rango Medio', color:'#66dd44', owned:false, nivel:0,  price:1400,  currency:'peces', lore:'Guardiana del último bosque verde del Ártico. Su magia es anterior incluso a los pingüinos y habla con los animales.', habilidades:[{nombre:'Enredadera',desc:'Inmoviliza objetivo 2.5s con raíces mágicas.',tipo:'Control',icon:'🌿'},{nombre:'Polen Tóxico',desc:'Nube de 350u que causa 40 daño/s por 4s.',tipo:'Ataque',icon:'🌸'},{nombre:'Regeneración',desc:'Pasiva: +3% HP/s en zona de naturaleza.',tipo:'Pasiva',icon:'💚'}], stats:{ataque:62,defensa:55,velocidad:58,magia:88} },
  campos:    { name:'Campos',    image:null, icon:'🐧', cls:'Soporte',  rol:'Rango Medio', color:'#a078ff', owned:false, nivel:0,  price:1600,  currency:'peces', lore:'Científico y mago. Protege al equipo con tecnología de escudos energéticos mientras castiga a los enemigos con precisión.', habilidades:[{nombre:'Burbuja Protectora',desc:'Escudo de 500 HP al aliado más herido.',tipo:'Defensa',icon:'🫧'},{nombre:'Campo Repulsor',desc:'Empuja a todos los enemigos en 300u.',tipo:'Control',icon:'🔮'},{nombre:'Barrera Perpetua',desc:'Pasiva: Genera escudo de 80 HP cada 8s.',tipo:'Pasiva',icon:'✨'}], stats:{ataque:45,defensa:70,velocidad:52,magia:85} },
};

// ══ SKINS ═══════════════════════════════════════════════
const ALL_SKINS = [
  { key:'skin_polar_base',         name:'Polar Base',         charKey:'polar',     icon:'🐧', image:null, rar:'Épica',      price:560,  cur:'piedras', col:'#88ddff' },
  { key:'skin_polar_artico',       name:'Polar Ártico',       charKey:'polar',     icon:'🐧', image:null, rar:'Legendaria', price:16,   cur:'perlas',  col:'#c8f8ff' },
  { key:'skin_polar_ultra',        name:'Polar Ultra',        charKey:'polar',     icon:'🐧', image:null, rar:'Ultra',      price:30,   cur:'perlas',  col:'#ffffff' },
  { key:'skin_chili_volcanico',    name:'Chili Volcánico',    charKey:'chili',     icon:'🐧', image:null, rar:'Épica',      price:560,  cur:'piedras', col:'#ff8844' },
  { key:'skin_chili_infernal',     name:'Chili Infernal',     charKey:'chili',     icon:'🐧', image:null, rar:'Legendaria', price:16,   cur:'perlas',  col:'#ff3300' },
  { key:'skin_cuchillas_sombrio',  name:'Cuchillas Sombrío',  charKey:'cuchillas', icon:'🔪', image:null, rar:'Épica',      price:560,  cur:'piedras', col:'#aa88ff' },
  { key:'skin_guerrero_dorado',    name:'Guerrero Dorado',    charKey:'fortachon', icon:'🏹', image:null, rar:'Legendaria', price:16,   cur:'perlas',  col:'#ffd080' },
  { key:'skin_velocista_fantasma', name:'Velocista Fantasma', charKey:'velocista', icon:'💨', image:null, rar:'Épica',      price:560,  cur:'piedras', col:'#44ffcc' },
  { key:'skin_velocista_ultra',    name:'Velocista Ultra',    charKey:'velocista', icon:'💨', image:null, rar:'Ultra',      price:30,   cur:'perlas',  col:'#ffffff' },
  { key:'skin_campos_prisma',      name:'Campos Prisma',      charKey:'campos',    icon:'🐧', image:null, rar:'Épica',      price:560,  cur:'piedras', col:'#c0a0ff' },
  { key:'skin_electrico_neon',     name:'Eléctrico Neón',     charKey:'electrico', icon:'⚡', image:null, rar:'Épica',      price:560,  cur:'piedras', col:'#ffe844' },
  { key:'skin_naturaleza_floral',  name:'Naturaleza Floral',  charKey:'naturaleza',icon:'🌸', image:null, rar:'Legendaria', price:16,   cur:'perlas',  col:'#88ff66' },
];
const ALL_EMOTES = [
  {key:'emote_0',name:'Baile Pingüino',   icon:'🕺', image:null, rar:'Rara',      price:300, cur:'peces',   col:'#cc88ff'},
  {key:'emote_1',name:'Beso Frío',        icon:'😘', image:null, rar:'Común',     price:150, cur:'peces',   col:'#88ccff'},
  {key:'emote_2',name:'Temblor de Hielo', icon:'🥶', image:null, rar:'Común',     price:80,  cur:'krill',   col:'#aaddff'},
  {key:'emote_3',name:'Victoria Polar',   icon:'🎉', image:null, rar:'Rara',      price:120, cur:'krill',   col:'#ffcc44'},
  {key:'emote_4',name:'Desafío Ártico',   icon:'😤', image:null, rar:'Épica',     price:560, cur:'piedras', col:'#ff8844'},
];
const ALL_ICONS = [
  {key:'icon_0',name:'Pingüino Clásico', icon:'🐧', image:null, rar:'Común',     price:200, cur:'peces',  col:'#5ab0ff'},
  {key:'icon_1',name:'Corona de Hielo',  icon:'👑', image:null, rar:'Épica',     price:500, cur:'peces',  col:'#aaddff'},
  {key:'icon_2',name:'Trofeo Polar',     icon:'🏆', image:null, rar:'Legendaria',price:6,   cur:'perlas', col:'#ffd080'},
  {key:'icon_3',name:'Maestro Krill',    icon:'🦐', image:null, rar:'Rara',      price:200, cur:'krill',  col:'#ffaa55'},
  {key:'icon_4',name:'Escudo Ártico',    icon:'🛡️', image:null, rar:'Rara',      price:300, cur:'peces',  col:'#88aaff'},
];
const ALL_BGS = [
  {key:'bg_0',name:'Tundra Nevada',  icon:'🌨️', image:null, rar:'Rara',      price:400, cur:'peces',   col:'#aaddff'},
  {key:'bg_1',name:'Océano Ártico',  icon:'🌊', image:null, rar:'Rara',      price:400, cur:'peces',   col:'#44aaff'},
  {key:'bg_2',name:'Aurora Boreal',  icon:'🌌', image:null, rar:'Legendaria',price:8,   cur:'perlas',  col:'#cc88ff'},
  {key:'bg_3',name:'Lava del Sur',   icon:'🌋', image:null, rar:'Rara',      price:300, cur:'krill',   col:'#ff8844'},
  {key:'bg_4',name:'Glaciar Eterno', icon:'🏔️', image:null, rar:'Épica',     price:560, cur:'piedras', col:'#88ccff'},
];

// ══ ESTADO ══════════════════════════════════════════════
let currentGTab = 'chars';
let gCharFilter = '', gSkinFilter = '', cosFilterVal = '';
window.gCharRolFilter  = ''; window.gCharOwnedFilter  = 'all';
window.gSkinRarFilter  = ''; window.gSkinOwnedFilter  = 'all';
window.cosRarFilter    = ''; window.cosOwnedFilter    = 'all';

// ══ TABS ════════════════════════════════════════════════
function setGTab(el, tab) {
  document.querySelectorAll('.gtab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  buildGuarida(tab);
}

// FIX: siempre inyecta en #guarida-inner, NUNCA borra guarida-content
function buildGuarida(tab) {
  currentGTab = tab || currentGTab;
  // Asegura que exista #guarida-inner dentro de #guarida-content
  let inner = document.getElementById('guarida-inner');
  if (!inner) {
    const cont = document.getElementById('guarida-content');
    if (!cont) return;
    inner = document.createElement('div');
    inner.id = 'guarida-inner';
    cont.appendChild(inner);
  }
  inner.innerHTML = '';
  if      (currentGTab === 'chars')       buildChars(inner);
  else if (currentGTab === 'skins')       buildSkinsTab(inner);
  else if (currentGTab === 'emotes')      buildCosmetics(inner, 'emotes');
  else if (currentGTab === 'icons')       buildCosmetics(inner, 'icons');
  else if (currentGTab === 'backgrounds') buildCosmetics(inner, 'backgrounds');
}

// ══ HELPERS ═════════════════════════════════════════════
function activateFiltBtn(el) {
  const p = el.closest('.wr-filter-btns');
  if (p) p.querySelectorAll('.wr-filt-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function makeBar(owned, total, label, searchHtml, selectHtml, btns, cbName) {
  const d = document.createElement('div');
  d.className = 'collection-bar';
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

function imgOrEmoji(image, icon, imgCls='char-compact-img', emojiCls='char-compact-emoji') {
  if (image) {
    return `<img src="${image}" class="${imgCls}" alt=""
              onerror="this.style.display='none';this.nextElementSibling.style.removeProperty('display')">
            <div class="${emojiCls}" style="display:none">${icon}</div>`;
  }
  return `<div class="${emojiCls}">${icon}</div>`;
}

// ══ PERSONAJES ══════════════════════════════════════════
function buildChars(cont) {
  const entries = Object.entries(CHARS_DEF);
  const ownedN  = entries.filter(([k,d])=>d.owned||hasItem('char',k)).length;
  cont.appendChild(makeBar(ownedN, entries.length, 'Pingüinos',
    `<input class="wr-search-input" placeholder="Buscar pingüino..."
       oninput="gCharFilter=this.value.toLowerCase();renderCharGrid()" value="${gCharFilter}">`,
    `<select class="wr-filter-select" onchange="window.gCharRolFilter=this.value;renderCharGrid()">
       <option value="">Todos los roles</option>
       <option>Tanque</option><option>Asesino</option><option>Mago</option>
       <option>Guerrero</option><option>Soporte</option>
     </select>`,
    [['all','Todos'],['owned','Obtenidos'],['locked','Bloqueados']], 'setCharOwned'
  ));
  const grid = document.createElement('div');
  grid.className = 'g-card-grid'; grid.id = 'chars-grid';
  cont.appendChild(grid);
  window.gCharRolFilter = ''; window.gCharOwnedFilter = 'all';
  renderCharGrid();
}
window.setCharOwned = function(el,val){ activateFiltBtn(el); window.gCharOwnedFilter=val; renderCharGrid(); };

function renderCharGrid() {
  const grid = document.getElementById('chars-grid');
  if (!grid) return; grid.innerHTML = '';
  const list = Object.entries(CHARS_DEF).filter(([k,d])=>{
    const owned = d.owned||hasItem('char',k);
    if (gCharFilter && !d.name.toLowerCase().includes(gCharFilter)) return false;
    if (window.gCharRolFilter && d.cls !== window.gCharRolFilter) return false;
    if (window.gCharOwnedFilter==='owned' && !owned) return false;
    if (window.gCharOwnedFilter==='locked' && owned) return false;
    return true;
  });
  if (!list.length) { grid.innerHTML='<div class="g-no-results">Sin resultados 🐧</div>'; return; }
  list.forEach(([k,d])=>{
    const isOwned = d.owned||hasItem('char',k);
    const card = document.createElement('div');
    card.className = 'g-card'+(isOwned?' owned':' locked');
    card.onclick = ()=>openCharModal(k);
    card.innerHTML = `
      <div class="g-card-portrait" style="--col:${d.color}">
        ${imgOrEmoji(d.image,d.icon)}
        ${!isOwned?'<div class="g-lock">🔒</div>':'<div class="g-check">✓</div>'}
        <div class="g-role-tag" style="color:${ROL_COL[d.cls]};background:${ROL_COL[d.cls]}1a;border-color:${ROL_COL[d.cls]}35">${d.cls}</div>
      </div>
      <div class="g-card-foot">
        <div class="g-name" style="color:${isOwned?d.color:'rgba(255,255,255,.45)'}">${d.name}</div>
        ${isOwned?`<div class="g-nivel">Nv. <span>${d.nivel||1}</span></div>`:''}
      </div>`;
    grid.appendChild(card);
  });
}

function openCharModal(key) {
  const d = CHARS_DEF[key]; if(!d) return;
  const isOwned = d.owned||hasItem('char',key);
  const tipoCol = {Ataque:'#ff6b5a',Defensa:'#5ab0ff',Control:'#c0aaff',Especial:'#ffe844',Pasiva:'#66dd44'};
  const statCol = {ataque:'#ff6b5a',defensa:'#5ab0ff',velocidad:'#44ffcc',magia:'#c0aaff'};
  const statLbl = {ataque:'Ataque',defensa:'Defensa',velocidad:'Velocidad',magia:'Magia'};
  const ov = mkOv();
  ov.innerHTML = `<div class="wr-modal-box" style="--col:${d.color}">
    <button class="wr-modal-close" onclick="this.closest('.wr-modal-overlay').remove()">✕</button>
    <div class="wr-modal-splash" style="background:linear-gradient(150deg,${d.color}22,${d.color}06 55%,transparent)">
      <div class="wr-modal-portrait">${imgOrEmoji(d.image,d.icon,'wr-portrait-img','wr-portrait-emoji')}</div>
      <div class="wr-modal-info">
        <div class="wr-role-badge" style="color:${ROL_COL[d.cls]}">${d.cls} · ${d.rol}</div>
        <div class="wr-char-name" style="color:${d.color}">${d.name}</div>
        <div class="wr-lore">${d.lore}</div>
        ${isOwned
          ?`<div class="wr-nivel-badge">Nivel <strong>${d.nivel||1}</strong></div>
            <div class="wr-owned-badge">✅ Desbloqueado</div>`
          :`<div class="wr-locked-notice">🔒 No desbloqueado · ${CICONS[d.currency||'peces']} ${d.price||'—'}</div>
            <button class="wr-shop-btn" onclick="this.closest('.wr-modal-overlay').remove();showToast('Visita la Tienda 🛒','#c8aa64')">Ir a la Tienda →</button>`}
      </div>
    </div>
    <div class="wr-modal-body">
      <div class="wr-col">
        <div class="wr-col-title">Estadísticas</div>
        ${Object.entries(d.stats).map(([k,v])=>`
          <div class="wr-stat">
            <div class="wr-stat-hdr"><span class="wr-stat-lbl">${statLbl[k]}</span><span class="wr-stat-val" style="color:${statCol[k]}">${v}</span></div>
            <div class="wr-stat-bar"><div style="width:${v}%;height:100%;border-radius:2px;background:${statCol[k]};transition:width .5s"></div></div>
          </div>`).join('')}
      </div>
      <div class="wr-col">
        <div class="wr-col-title">Habilidades</div>
        ${d.habilidades.map(h=>`
          <div class="wr-skill">
            <div class="wr-skill-icon" style="background:${tipoCol[h.tipo]||'#888'}18;border-color:${tipoCol[h.tipo]||'#888'}35">${h.icon}</div>
            <div class="wr-skill-body">
              <div class="wr-skill-name">${h.nombre} <span class="wr-skill-tipo" style="color:${tipoCol[h.tipo]}">${h.tipo}</span></div>
              <div class="wr-skill-desc">${h.desc}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
  showOv(ov);
}

// ══ SKINS ═══════════════════════════════════════════════
function buildSkinsTab(cont) {
  const ownedN = ALL_SKINS.filter(s=>hasItem('skin',s.key)).length;
  cont.appendChild(makeBar(ownedN, ALL_SKINS.length, 'Skins',
    `<input class="wr-search-input" placeholder="Skin o pingüino..."
       oninput="gSkinFilter=this.value.toLowerCase();renderSkinGrid()" value="${gSkinFilter}">`,
    `<select class="wr-filter-select" onchange="window.gSkinRarFilter=this.value;renderSkinGrid()">
       <option value="">Toda rareza</option>
       <option>Épica</option><option>Legendaria</option><option>Ultra</option>
     </select>`,
    [['all','Todas'],['owned','Obtenidas'],['locked','Bloqueadas']], 'setSkinOwned'
  ));
  const grid = document.createElement('div');
  grid.className = 'g-card-grid'; grid.id = 'skins-grid';
  cont.appendChild(grid);
  window.gSkinRarFilter = ''; window.gSkinOwnedFilter = 'all';
  renderSkinGrid();
}
window.setSkinOwned = function(el,val){ activateFiltBtn(el); window.gSkinOwnedFilter=val; renderSkinGrid(); };

function renderSkinGrid() {
  const grid = document.getElementById('skins-grid');
  if (!grid) return; grid.innerHTML = '';
  const list = ALL_SKINS.filter(s=>{
    const owned = hasItem('skin',s.key);
    const cn = CHARS_DEF[s.charKey]?.name||'';
    if (gSkinFilter && !s.name.toLowerCase().includes(gSkinFilter) && !cn.toLowerCase().includes(gSkinFilter)) return false;
    if (window.gSkinRarFilter && s.rar!==window.gSkinRarFilter) return false;
    if (window.gSkinOwnedFilter==='owned' && !owned) return false;
    if (window.gSkinOwnedFilter==='locked' && owned) return false;
    return true;
  });
  if (!list.length) { grid.innerHTML='<div class="g-no-results">Sin resultados 🎨</div>'; return; }
  list.forEach(s=>{
    const isOwned = hasItem('skin',s.key);
    const rc = RAR_CLASS[s.rar]||'';
    const isUltra = s.rar==='Ultra';
    const bg = isUltra
      ?'linear-gradient(160deg,rgba(255,107,157,.15),rgba(68,255,204,.1),rgba(170,68,255,.12))'
      :`linear-gradient(160deg,${s.col}22,${s.col}08)`;
    const card = document.createElement('div');
    card.className = `g-card ${rc}`+(isOwned?' owned':' locked');
    card.onclick = ()=>openSkinModal(s.key);
    card.innerHTML = `
      <div class="g-card-portrait" style="--col:${s.col};background:${bg}">
        ${imgOrEmoji(s.image,s.icon)}
        ${!isOwned?'<div class="g-lock">🔒</div>':'<div class="g-check">✓</div>'}
        <div class="g-rar-dot ${rc}"></div>
      </div>
      <div class="g-card-foot">
        <div class="g-name" style="color:${isOwned?s.col:'rgba(255,255,255,.45)'}">${s.name}</div>
        <div class="g-sub">${CHARS_DEF[s.charKey]?.name||''}</div>
        <div class="g-rar" style="color:${RAR_COL[s.rar]}">${s.rar}</div>
      </div>`;
    grid.appendChild(card);
  });
}

function openSkinModal(skinKey) {
  let active = ALL_SKINS.find(s=>s.key===skinKey); if(!active) return;
  function build(sk) {
    const charDef   = CHARS_DEF[sk.charKey];
    const charSkins = ALL_SKINS.filter(s=>s.charKey===sk.charKey);
    const isOwned   = hasItem('skin',sk.key);
    const rc  = RAR_CLASS[sk.rar]||'';
    const isU = sk.rar==='Ultra';
    const prevBg = isU
      ?'linear-gradient(145deg,rgba(255,107,157,.2),rgba(68,255,204,.12),rgba(170,68,255,.18))'
      :`linear-gradient(145deg,${sk.col}30,${sk.col}0a)`;
    return `<div class="wr-modal-box skin-modal" style="--col:${sk.col}">
      <button class="wr-modal-close" onclick="this.closest('.wr-modal-overlay').remove()">✕</button>
      <div class="skin-prev-section" style="${prevBg}">
        <div class="skin-prev-wrap ${rc}">
          ${imgOrEmoji(sk.image,sk.icon,'skin-prev-img','skin-prev-emoji')}
          <div class="skin-prev-rar-badge ${rc}">${sk.rar}</div>
        </div>
        <div class="skin-prev-info">
          <div class="skin-prev-char">${charDef?.icon||'🐧'} ${charDef?.name||sk.charKey}</div>
          <div class="skin-prev-name">${sk.name}</div>
          <div class="skin-prev-rar-text" style="color:${RAR_COL[sk.rar]}">${sk.rar}</div>
          ${isOwned
            ?'<div class="skin-obtained">✅ Ya la tienes</div>'
            :`<div class="skin-price">${CICONS[sk.cur]} <strong>${sk.price}</strong></div>
              <button class="wr-shop-btn" onclick="this.closest('.wr-modal-overlay').remove();showToast('Visita la Tienda para comprar esta skin 🛒','#c8aa64')">Comprar en Tienda →</button>`}
        </div>
      </div>
      ${charSkins.length>1?`
      <div class="skin-gallery-title">Otras skins de ${charDef?.name||sk.charKey}</div>
      <div class="skin-gallery">
        ${charSkins.map(cs=>{
          const crc=RAR_CLASS[cs.rar]||'';
          const isAct=cs.key===sk.key;
          const cgBg=cs.rar==='Ultra'?'linear-gradient(135deg,rgba(255,107,157,.15),rgba(68,255,204,.1))':`linear-gradient(135deg,${cs.col}22,${cs.col}08)`;
          return `<div class="skin-gal-thumb${isAct?' active':''}" onclick="updateSkinModal('${cs.key}')" title="${cs.name}">
            <div class="skin-gal-img" style="${cgBg}">
              ${imgOrEmoji(cs.image,cs.icon,'skin-gal-real-img','skin-gal-emoji')}
              <div class="skin-gal-dot ${crc}"></div>
            </div>
            <div class="skin-gal-name">${cs.name}</div>
          </div>`;
        }).join('')}
      </div>`:''}
    </div>`;
  }
  const ov = mkOv(); ov.innerHTML = build(active); showOv(ov);
  window.updateSkinModal = function(key){ active=ALL_SKINS.find(s=>s.key===key)||active; ov.innerHTML=build(active); };
}

// ══ COSMÉTICOS ══════════════════════════════════════════
const COSMETIC_CFG = {
  emotes:      {label:'Emoticonos',data:()=>ALL_EMOTES,type:'emote', emoji:'🕺'},
  icons:       {label:'Íconos',    data:()=>ALL_ICONS, type:'icon',  emoji:'👑'},
  backgrounds: {label:'Fondos',    data:()=>ALL_BGS,   type:'bg',    emoji:'🌌'},
};
function buildCosmetics(cont, tabKey) {
  const cfg = COSMETIC_CFG[tabKey]; const all = cfg.data();
  const ownedN = all.filter(it=>hasItem(cfg.type,it.key)).length;
  cosFilterVal=''; window.cosRarFilter=''; window.cosOwnedFilter='all';
  const cbName = 'setCosOwned_'+tabKey;
  cont.appendChild(makeBar(ownedN, all.length, cfg.label,
    `<input class="wr-search-input" placeholder="Buscar ${cfg.label.toLowerCase()}..."
       oninput="cosFilterVal=this.value.toLowerCase();renderCosGrid('${tabKey}')">`,
    `<select class="wr-filter-select" onchange="window.cosRarFilter=this.value;renderCosGrid('${tabKey}')">
       <option value="">Toda rareza</option>
       <option>Común</option><option>Rara</option><option>Épica</option><option>Legendaria</option>
     </select>`,
    [['all','Todos'],['owned','Obtenidos'],['locked','Bloqueados']], cbName
  ));
  window[cbName] = function(el,val){ activateFiltBtn(el); window.cosOwnedFilter=val; renderCosGrid(tabKey); };
  const grid = document.createElement('div');
  grid.className = 'g-card-grid'; grid.id = 'cos-grid-'+tabKey;
  cont.appendChild(grid);
  renderCosGrid(tabKey);
}
function renderCosGrid(tabKey) {
  const cfg = COSMETIC_CFG[tabKey];
  const grid = document.getElementById('cos-grid-'+tabKey);
  if (!grid) return; grid.innerHTML='';
  const list = cfg.data().filter(it=>{
    const owned = hasItem(cfg.type,it.key);
    if (cosFilterVal && !it.name.toLowerCase().includes(cosFilterVal)) return false;
    if (window.cosRarFilter && it.rar!==window.cosRarFilter) return false;
    if (window.cosOwnedFilter==='owned' && !owned) return false;
    if (window.cosOwnedFilter==='locked' && owned) return false;
    return true;
  });
  if (!list.length) { grid.innerHTML=`<div class="g-no-results">Sin resultados ${cfg.emoji}</div>`; return; }
  list.forEach(it=>{
    const isOwned = hasItem(cfg.type,it.key);
    const rc = RAR_CLASS[it.rar]||'';
    const card = document.createElement('div');
    card.className = `g-card ${rc}`+(isOwned?' owned':' locked');
    card.onclick = ()=>openCosModal(it,cfg);
    card.innerHTML = `
      <div class="g-card-portrait" style="--col:${it.col};background:linear-gradient(160deg,${it.col}22,${it.col}08)">
        ${imgOrEmoji(it.image,it.icon)}
        ${!isOwned?'<div class="g-lock">🔒</div>':'<div class="g-check">✓</div>'}
        <div class="g-rar-dot" style="background:${RAR_COL[it.rar]};box-shadow:0 0 6px ${RAR_COL[it.rar]}"></div>
      </div>
      <div class="g-card-foot">
        <div class="g-name" style="color:${isOwned?it.col:'rgba(255,255,255,.45)'}">${it.name}</div>
        <div class="g-rar" style="color:${RAR_COL[it.rar]}">${it.rar}</div>
      </div>`;
    grid.appendChild(card);
  });
}
function openCosModal(it, cfg) {
  const isOwned = hasItem(cfg.type,it.key);
  const ov = mkOv();
  ov.innerHTML = `<div class="wr-modal-box cos-modal" style="--col:${it.col}">
    <button class="wr-modal-close" onclick="this.closest('.wr-modal-overlay').remove()">✕</button>
    <div class="cos-preview" style="background:radial-gradient(circle at 50%,${it.col}28,transparent 70%)">
      ${imgOrEmoji(it.image,it.icon,'cos-img','cos-emoji')}
    </div>
    <div class="cos-info">
      <div class="cos-type">${cfg.label}</div>
      <div class="cos-name">${it.name}</div>
      <div class="cos-rar" style="color:${RAR_COL[it.rar]}">${it.rar}</div>
      ${isOwned
        ?'<div class="cos-owned">✅ Ya lo tienes</div>'
        :`<div class="cos-price">${CICONS[it.cur]} ${it.price}</div>
          <button class="wr-shop-btn" onclick="this.closest('.wr-modal-overlay').remove();showToast('Visita la Tienda 🛒','#c8aa64')">Ir a la Tienda →</button>`}
    </div>
  </div>`;
  showOv(ov);
}

// ══ OVERLAY HELPERS ═════════════════════════════════════
function mkOv() {
  const ov = document.createElement('div');
  ov.className = 'wr-modal-overlay';
  ov.onclick = e=>{ if(e.target===ov) ov.remove(); };
  return ov;
}
function showOv(ov) { document.body.appendChild(ov); requestAnimationFrame(()=>ov.classList.add('visible')); }

// ══ openEgg — llamado desde Tienda ══════════════════════
function openEgg(id) {
  const egg = (window._EGGS||[]).find(e=>e.id===id);
  if (!egg||egg.locked) return;
  const u = getCurrUser(); if(!u){showToast('⚠️ Inicia sesión','#ff8844');return;}
  const curKey = egg.costIcon==='🐟'?'peces':egg.costIcon==='🦐'?'krill':egg.costIcon==='🪨'?'piedras':'perlas';
  if(u[curKey]<egg.cost){showToast('❌ No tienes suficiente '+egg.costIcon,'#ff4444');return;}
  u[curKey]-=egg.cost; saveCurrUser(u); updateTopbarCurrencies();
  const item = egg.pool[Math.floor(Math.random()*egg.pool.length)];
  document.getElementById('egg-reveal-icon').textContent = item.icon;
  document.getElementById('egg-reveal-name').textContent = item.name;
  document.getElementById('egg-reveal-rar').textContent  = item.rar;
  document.getElementById('egg-reveal-rar').style.color  = RAR_COL[item.rar]||'#aaa';
  document.getElementById('egg-reveal-desc').textContent = '¡Obtuviste: '+item.name+'! (-'+egg.cost+' '+egg.costIcon+')';
  if(item.rar!=='Común'){
    const sk='skin_'+item.name.toLowerCase().replace(/ /g,'_').replace(/[()·]/g,'');
    if(!u.ownedSkins)u.ownedSkins=[];
    if(!u.ownedSkins.includes(sk))u.ownedSkins.push(sk);
    saveCurrUser(u);
  }
  const cols = item.rar==='Ultra'?['#ff6b9d','#44ffcc','#aa44ff','#c8aa64']:[item.col];
  for(let i=0;i<22;i++){
    const pt=document.createElement('div'); const c=cols[i%cols.length];
    pt.style.cssText=`position:fixed;left:50%;top:50%;width:7px;height:7px;border-radius:50%;background:${c};pointer-events:none;z-index:700;transform:translate(-50%,-50%);transition:all .7s ease-out;`;
    document.body.appendChild(pt);
    const a=Math.random()*Math.PI*2, dist=80+Math.random()*140;
    setTimeout(()=>{pt.style.transform=`translate(calc(-50% + ${Math.cos(a)*dist}px),calc(-50% + ${Math.sin(a)*dist}px))`;pt.style.opacity='0';},20);
    setTimeout(()=>pt.remove(),780);
  }
  document.getElementById('egg-modal').classList.remove('hidden');
}