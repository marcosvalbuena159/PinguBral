// ═══════════════════════════════════════════════════════
//  BASE DE DATOS — Supabase (via perfil-monedero.js)
//  getCurrUser, saveCurrUser, getUserCurr, updateTopbarCurrencies,
//  addCurrency, buyItem, hasItem, buyChar, syncOwnedChars,
//  CHARS_DEF, CURRENCY_LABELS, CICONS
//  → todos definidos en perfil-monedero.js
// ═══════════════════════════════════════════════════════

// Toast de notificación
function showToast(msg,col){
  let t=document.getElementById('pb-toast');
  if(!t){t=document.createElement('div');t.id='pb-toast';t.style.cssText='position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:rgba(10,14,30,.96);border:1px solid rgba(255,255,255,.15);color:#fff;font-family:"Fredoka One",cursive;font-size:14px;padding:11px 24px;border-radius:10px;z-index:9999;transition:opacity .3s;pointer-events:none;backdrop-filter:blur(8px)';document.body.appendChild(t);}
  t.textContent=msg;t.style.borderColor=col+'66';t.style.color=col;t.style.opacity='1';
  clearTimeout(t._to);t._to=setTimeout(()=>{t.style.opacity='0';},2200);
}

// ── Auth functions (doLogin, doReg, doGuest, doLogout, showReg)
//    definidas en auth.js — no se redefinen aquí.

function showLogin(){
  // Mostrar pantalla auth y ocultar dashboard/juego
  const login = document.getElementById('login'); if(login) login.classList.remove('hidden');
  const reg   = document.getElementById('register'); if(reg) reg.classList.add('hidden');
  const dash  = document.getElementById('dashboard'); if(dash) dash.classList.add('hidden');
  const game  = document.getElementById('game-wrap'); if(game) game.classList.add('hidden');
  // Restaurar fondo y elementos auth
  const bg   = document.getElementById('auth-bg-layer'); if(bg)   bg.style.display   = '';
  const chbg = document.getElementById('auth-change-bg'); if(chbg) chbg.style.display = '';
  const ver  = document.querySelector('.auth-ver'); if(ver)  ver.style.display  = '';
  const bar  = document.getElementById('auth-bar'); if(bar)  bar.style.display  = '';
}
function syncOwnedChars(){
  const owned=window.PB?._ownedChars??['polar','chili'];
  Object.keys(CHARS_DEF).forEach(k=>{CHARS_DEF[k].owned=owned.includes(k);});
}
function enterDash(name, jugadorData){
  // Guardar datos del jugador globalmente
  if(jugadorData && window.PB) window.PB.jugador = jugadorData;

  document.getElementById('login').classList.add('hidden');
  const reg = document.getElementById('register'); if(reg) reg.classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('tb-pname').textContent = name;
  const profUname = document.getElementById('prof-uname');
  if(profUname) profUname.textContent = name;

  // Cargar monedero desde Supabase si está disponible
  if(typeof loadMonedero === 'function'){
    loadMonedero().catch(e => console.warn('[enterDash] loadMonedero:', e));
  } else if(typeof initPerfilMonedero === 'function'){
    initPerfilMonedero();
  } else {
    updateTopbarCurrencies();
  }

  syncOwnedChars();
  navTo('home');
}

// ═══════════════════════════════════════════════════════
//  NAVIGATION — dashboard pages
// ═══════════════════════════════════════════════════════
window.PAGES=['home','modesel','guarida','dominio','profile','charsel','misiones','tienda','colonia','ajustes'];
const PAGES=window.PAGES;
window.navTo=function navTo(page){
  PAGES.forEach(p=>{
    const el=document.getElementById('page-'+p);if(el){if(p===page)el.classList.remove('hidden');else el.classList.add('hidden');}
  });
  // sidebar active
  document.querySelectorAll('.snav').forEach(n=>{n.classList.remove('active');if(n.dataset.page===page)n.classList.add('active');});
  // build page content
  if(page==='modesel')buildHexModes('offline');
  else if(page==='guarida')buildGuarida('chars');
  else if(page==='dominio')buildDominio();
  else if(page==='profile')buildProfile('stats');
  else if(page==='charsel')buildCharSel();
  else if(page==='misiones')buildMisiones();
  else if(page==='tienda')buildShop('chars');
  else if(page==='colonia')buildColonia();
  else if(page==='ajustes')buildAjustes();
  if(page==='home')loadHomeBg();
};
function exitGame(){document.getElementById('game-wrap').classList.add('hidden');navTo('home');}
function goCharSel(){document.getElementById('game-wrap').classList.add('hidden');navTo('charsel');}

// ═══════════════════════════════════════════════════════
//  MODALS
// ═══════════════════════════════════════════════════════
function openModal(id){document.getElementById(id).classList.remove('hidden');}
function closeModal(id){document.getElementById(id).classList.add('hidden');}
function closeModalOutside(e,el){if(e.target===el)el.classList.add('hidden');}
// ── CHAT v2 ─────────────────────────────────────────────
let currentChatTab='global';
let currentFriendChat=null;
const ADMIN_USERS=['PolarDev','IceBalance','PenguAdmin'];

function setChatTab(tab){
  currentChatTab=tab;
  document.querySelectorAll('.chat-tab').forEach(t=>t.classList.remove('active'));
  const btn=document.getElementById('ctab-'+tab); if(btn)btn.classList.add('active');
  document.querySelectorAll('.chat-panel').forEach(p=>p.classList.add('hidden'));
  const panel=document.getElementById('chat-panel-'+tab); if(panel)panel.classList.remove('hidden');
  if(tab==='global'){
    const isAdmin=ADMIN_USERS.includes(currentUser);
    const inp=document.getElementById('chat-global-input');
    if(inp)inp.style.display=isAdmin?'flex':'none';
  }
}
function sendChatGlobal(){
  const inp=document.getElementById('chat-in-global'); if(!inp)return;
  const txt=inp.value.trim(); if(!txt)return;
  const wrap=document.getElementById('chat-msgs-global'); if(!wrap)return;
  const div=document.createElement('div'); div.className='chat-msg mine';
  div.innerHTML=`<div><div class="chat-sender chat-admin-badge">🛡️ Admin · ${currentUser}</div><div class="chat-bubble">${txt}</div></div>`;
  wrap.appendChild(div); wrap.scrollTop=wrap.scrollHeight; inp.value='';
}
function sendChat(){ sendChatGlobal(); }

function openFriendChat(name){
  currentFriendChat=name;
  document.querySelectorAll('.chat-friend-item').forEach(el=>el.classList.remove('active-chat'));
  document.querySelectorAll('.chat-friend-item').forEach(el=>{if(el.querySelector('.cfi-name')?.textContent===name)el.classList.add('active-chat');});
  const convo=document.getElementById('chat-friend-convo'); if(!convo)return;
  const friendMsgs={
    'PollarBrawler':['¡Acabo de ganar con Velocista!','¿Quieres una partida?'],
    'IceMaster99':['¿Cuándo sale el modo 3vs3?'],
    'FrostyPengu':[],
  };
  const msgs=friendMsgs[name]||[];
  convo.innerHTML=`<div class="chat-convo-header">💬 ${name}</div>
    <div class="chat-convo-msgs" id="convo-msgs-${name}">${msgs.length===0
      ?'<div class="chat-convo-empty">Sin mensajes aún. ¡Di hola! 👋</div>'
      :msgs.map(m=>`<div class="chat-msg"><div><div class="chat-sender">${name}</div><div class="chat-bubble">${m}</div></div></div>`).join('')}
    </div>
    <div class="chat-input-row" style="padding:10px 12px;border-top:1px solid rgba(255,255,255,.06)">
      <input class="chat-input" id="chat-in-friend" placeholder="Mensaje para ${name}..." maxlength="120" onkeydown="if(event.key==='Enter')sendFriendMsg('${name}')">
      <button class="btn btn-p btn-sm" onclick="sendFriendMsg('${name}')">Enviar</button>
    </div>`;
  const w=document.getElementById('convo-msgs-'+name); if(w)w.scrollTop=w.scrollHeight;
}
function sendFriendMsg(name){
  const inp=document.getElementById('chat-in-friend'); if(!inp)return;
  const txt=inp.value.trim(); if(!txt)return;
  const wrap=document.getElementById('convo-msgs-'+name); if(!wrap)return;
  const emp=wrap.querySelector('.chat-convo-empty'); if(emp)emp.remove();
  const div=document.createElement('div'); div.className='chat-msg mine';
  div.innerHTML=`<div><div class="chat-bubble">${txt}</div></div>`;
  wrap.appendChild(div); wrap.scrollTop=wrap.scrollHeight; inp.value='';
}
// ── FONDO HOME ───────────────────────────────────────────
function setHomeBg(input){
  const file=input.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=(e)=>{
    const bg=document.getElementById('home-bg');
    if(bg){bg.style.backgroundImage=`url('${e.target.result}')`;bg.style.backgroundSize='cover';bg.style.backgroundPosition='center';}
    try{localStorage.setItem('pb_home_bg',e.target.result);}catch(ex){}
    showToast('Fondo actualizado','#5ab0ff');
  };
  reader.readAsDataURL(file);
}
function loadHomeBg(){
  try{
    const saved=localStorage.getItem('pb_home_bg');
    if(saved){const bg=document.getElementById('home-bg');if(bg){bg.style.backgroundImage=`url('${saved}')`;bg.style.backgroundSize='cover';bg.style.backgroundPosition='center';}}
  }catch(e){}
}

// ═══════════════════════════════════════════════════════
//  MODE SELECT
// ═══════════════════════════════════════════════════════
const MODES={
  offline:[
    {icon:'⚔️',name:'1 vs 1',desc:'Duelo clásico\nBase Destruction',col:'#5ab0ff',action:()=>navTo('charsel')},
    {icon:'📖',name:'Modo Historia',desc:'Aventura tipo\nDungeons',col:'#ffd080',locked:true},
    {icon:'🤖',name:'1 vs IA',desc:'Entrena contra\nla IA',col:'#888',locked:true},
    {icon:'🎯',name:'Entrenamiento',desc:'Practica skills\nsin presión',col:'#888',locked:true},
  ],
  online:[
    {icon:'🃏',name:'Fight',desc:'Cartas tipo\nCard-Jitsu',col:'#cc88ff',locked:true},
    {icon:'⚔️',name:'1 vs 1',desc:'Partida rápida\nonline',col:'#888',locked:true},
    {icon:'👥',name:'3 vs 3',desc:'Equipo de 3',col:'#888',locked:true},
    {icon:'🏆',name:'Dominio Polar',desc:'Modo clasificado',col:'#ffd080',locked:true,action:()=>navTo('dominio')},
  ]
};
let currentModeTab='offline';
function setModeTab(tab){
  currentModeTab=tab;
  ['offline','online'].forEach(t=>{const el=document.getElementById('mt-'+t);if(el){el.style.background=t===tab?'rgba(80,140,255,.22)':'transparent';el.style.color=t===tab?'#fff':'rgba(255,255,255,.45)';}});
  buildHexModes(tab);
}
function buildHexModes(tab){
  currentModeTab=tab||currentModeTab;
  const wrap=document.getElementById('hex-modes');if(!wrap)return;wrap.innerHTML='';
  const modes=MODES[currentModeTab];const HW=160,HH=180;
  modes.forEach(m=>{
    const col=m.col;const card=document.createElement('div');card.className='hex-card'+(m.locked?' locked':'');
    card.style.cssText=`width:${HW}px;height:${HH}px;`;
    const pts=`${HW/2},4 ${HW-5},${HH*.26} ${HW-5},${HH*.74} ${HW/2},${HH-4} 5,${HH*.74} 5,${HH*.26}`;
    const id2='hg'+Math.random().toString(36).slice(2);
    card.innerHTML=`<svg width="${HW}" height="${HH}" style="display:block"><defs><linearGradient id="${id2}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${col}" stop-opacity="${m.locked?.06:.2}"/><stop offset="100%" stop-color="${col}" stop-opacity="${m.locked?.02:.08}"/></linearGradient></defs><polygon points="${pts}" fill="url(#${id2})" stroke="${col}" stroke-width="${m.locked?'1':'2'}" stroke-opacity="${m.locked?.25:.7}"/></svg><div class="hc-inner"><div class="hci-icon">${m.icon}</div><div class="hci-name" style="color:${col}">${m.name}</div><div class="hci-desc">${m.desc.replace('\n','<br>')}</div></div>`;
    if(!m.locked&&m.action){card.onclick=m.action;card.style.cursor='pointer';}
    wrap.appendChild(card);
  });
}





window.CW=window.CW||860; window.CH=window.CH||520; window.CS=window.CS||34;
var CW=window.CW,CH=window.CH,CS=window.CS;
let canvas,ctx,running=false,animId=null;
let keys={},p1,p2;
let particles=[],projs=[],effects=[],floats=[],blades=[];
let shake={x:0,y:0,d:0},bgT=[];
let p1k=null,p2k=null;
let base1,base2;
const BHP=1400,BW=52,BH=64,RESP=300;
let stats={p1:{dmg:0,kills:0,deaths:0},p2:{dmg:0,kills:0,deaths:0}};
function addDmg(o,d){if(o===p1)stats.p1.dmg+=d;else stats.p2.dmg+=d;updStats();}
function addKill(k){if(k===p1){stats.p1.kills++;stats.p2.deaths++;}else{stats.p2.kills++;stats.p1.deaths++;}updStats();}
function updStats(){
  const h=id=>document.getElementById(id);if(!h('sb1d'))return;
  h('sb1d').textContent=stats.p1.dmg;h('sb2d').textContent=stats.p2.dmg;h('sb1k').textContent=stats.p1.kills+'/'+stats.p1.deaths;h('sb2k').textContent=stats.p2.kills+'/'+stats.p2.deaths;
  if(p1&&p2){h('sb1n').textContent=p1.name;h('sb2n').textContent=p2.name;h('sb1n').style.color=p1.color;h('sb2n').style.color=p2.color;}
  const min=Math.min(base1?base1.hp/BHP:1,base2?base2.hp/BHP:1);h('sbph').textContent=min>0.6?'🧊':min>0.3?'⚔️':'💀';
}
const TILE=20;
const BUSHES=[{x:148,y:188,w:88,h:72},{x:624,y:260,w:88,h:72},{x:376,y:118,w:80,h:68},{x:396,y:328,w:80,h:68},{x:228,y:372,w:80,h:64},{x:552,y:72,w:80,h:64}];
function inBush(p){for(const b of BUSHES){if(p.cx>b.x+8&&p.cx<b.x+b.w-8&&p.cy>b.y+8&&p.cy<b.y+b.h-8)return b;}return null;}
function hidden(p,enemy){const pb=inBush(p);if(!pb)return false;const eb=inBush(enemy);return!eb||pb!==eb;}
function initBases(){base1={x:44,y:CH/2-BH/2,hp:BHP,max:BHP,owner:1,hit:0};base2={x:CW-44-BW,y:CH/2-BH/2,hp:BHP,max:BHP,owner:2,hit:0};}

const CHARS={
  polar:{name:'Polar',icon:'🐧',cls:'Tanque · Rango Corto',color:'#5ab0ff',hat:'#1a3a70',body:'#0a1a40',hp:220,spd:2.6,pills:[{t:'Tanque',c:'#3a6fcc'},{t:'Resistente',c:'#334466'}],skills:[{e:'❄️',n:'Bola de Nieve',cd:110,col:'#8dd4ff'},{e:'🌊',n:'Ola Glaciar',cd:160,col:'#3a90ff'},{e:'☄️',n:'Avalancha',cd:340,col:'#fff'}],passive:'',p1k:['1','2','3'],p2k:['i','o','p']},
  chili:{name:'Chili',icon:'🐧',cls:'Asesino · Rango Medio',color:'#ff6b5a',hat:'#7a1a0a',body:'#3a0800',hp:190,spd:3.6,pills:[{t:'Veloz',c:'#cc4422'},{t:'Burst',c:'#883322'}],skills:[{e:'🔥',n:'Llama Pingüina',cd:105,col:'#ff8844'},{e:'💣',n:'Bomba Caliente',cd:190,col:'#ffaa22'},{e:'🌋',n:'Erupción',cd:320,col:'#ff3300'}],passive:'',p1k:['1','2','3'],p2k:['i','o','p']},
  cuchillas:{name:'Cuchillas',icon:'🐧',cls:'Asesino/Mago · Rango Medio',color:'#c0aaff',hat:'#2a1a5a',body:'#110830',hp:195,spd:3.1,pills:[{t:'Combo',c:'#6644cc'},{t:'Control',c:'#442288'}],skills:[{e:'🗡️',n:'Enganche',cd:240,col:'#c0aaff'},{e:'🌀',n:'Atracción',cd:240,col:'#8866ff'},{e:'💥',n:'Tormenta',cd:480,col:'#fff'}],passive:'Genera cuchilla c/0.5s (máx 10)',p1k:['1','2','3'],p2k:['i','o','p']},
  electrico:{name:'Eléctrico',icon:'🐧',cls:'Mago · Rango Largo',color:'#ffe844',hat:'#5a4400',body:'#2a1e00',hp:175,spd:3.2,pills:[{t:'Rango',c:'#aa8800'},{t:'Escalado',c:'#886600'}],skills:[{e:'⚡',n:'Electrochoque',cd:240,col:'#ffe844'},{e:'🔵',n:'Forma Energía',cd:160,col:'#88ffff'},{e:'🌩️',n:'Tormenta Eléc.',cd:480,col:'#ffff88'}],passive:'Acumula cargas al estar cerca (máx 5)',p1k:['1','2','3'],p2k:['i','o','p']},
  elemental:{name:'Elemental',icon:'🐧',cls:'Mago Control · Rango Medio',color:'#ff7730',hat:'#001a40',body:'#001028',hp:200,spd:3.0,pills:[{t:'Control',c:'#cc5500'},{t:'Mixto',c:'#006688'}],skills:[{e:'🔥',n:'Explosión Fuego',cd:150,col:'#ff6622'},{e:'💧',n:'Rayo de Agua',cd:200,col:'#44aaff'},{e:'🧊',n:'Congelación',cd:420,col:'#aaddff'}],passive:'Ralentiza al enemigo cercano (150px)',p1k:['1','2','3'],p2k:['i','o','p']},
  fortachon:{name:'Fortachón',icon:'🐧',cls:'Guerrero · Rango Corto',color:'#e8a020',hat:'#3a2000',body:'#1a0e00',hp:280,spd:2.4,pills:[{t:'Tanque++',c:'#996600'},{t:'Cuerpo a Cuerpo',c:'#664400'}],skills:[{e:'💪',n:'Modo Bestia',cd:240,col:'#e8a020'},{e:'🪝',n:'Agarre',cd:200,col:'#cc8800'},{e:'💥',n:'Salto Brutal',cd:360,col:'#ff6600'}],passive:'Pisotón: 4 dmg/0.5s, alcanza base en 90px',p1k:['1','2','3'],p2k:['i','o','p']},
  velocista:{name:'Velocista',icon:'🐧',cls:'Asesino · Rango Medio',color:'#44ffcc',hat:'#003322',body:'#001a12',hp:170,spd:4.2,pills:[{t:'Veloz++',c:'#00aa77'},{t:'Evasión',c:'#008855'}],skills:[{e:'🌀',n:'Esquiva',cd:420,col:'#44ffcc'},{e:'💫',n:'Dash Choque',cd:180,col:'#22ddaa'},{e:'⚡',n:'Furia Veloz',cd:420,col:'#aaffee'}],passive:'+25% vel. permanente, rastro de velocidad',p1k:['1','2','3'],p2k:['i','o','p']},
  guerrero:{name:'Guerrero',icon:'🐧',cls:'Guerrero · Rango Corto',color:'#ffd080',hat:'#2a1800',body:'#180e00',hp:210,spd:2.9,pills:[{t:'Guerrero',c:'#cc9900'},{t:'Lanza',c:'#aa7700'}],
    skills:[
      {e:'🏹',n:'Lanza Rápida',    cd:90, col:'#ffd080'},  // fast short-range spear
      {e:'🛡️',n:'Postura de Combate',cd:200,col:'#ffcc44'}, // shield + movspd
      {e:'💥',n:'Salto Lanza',     cd:380,col:'#ff8822'},   // jump + immobilize
    ],
    passive:'Ataque rápido: cada 0.5s lanza lanza corta al atacar',p1k:['1','2','3'],p2k:['i','o','p']},
  naturaleza:{name:'Naturaleza',icon:'🐧',cls:'Mago Control · Rango Medio',color:'#66dd44',hat:'#1a3a0a',body:'#0a1e04',hp:185,spd:3.0,
    pills:[{t:'Control',c:'#338822'},{t:'Veneno',c:'#44aa22'},{t:'Curación',c:'#88cc44'}],
    skills:[
      {e:'🪨',n:'Terremoto',cd:140,col:'#aa8844'},
      {e:'🌿',n:'Enredaderas',cd:220,col:'#44cc22'},
      {e:'🌪️',n:'Torbellino',cd:460,col:'#aaddaa'},
    ],
    passive:'Aleja al enemigo c/2s y aplica veneno al contacto',p1k:['1','2','3'],p2k:['i','o','p']},
  campos:{name:'Campos de Fuerza',icon:'🐧',cls:'Mago/Soporte · Rango Medio',color:'#a078ff',hat:'#1e0a4a',body:'#100520',hp:205,spd:2.9,
    pills:[{t:'Escudos',c:'#7a44cc'},{t:'Mago',c:'#5522aa'},{t:'Soporte',c:'#9966ff'}],
    skills:[
      {e:'🔮',n:'Proyectil Curvo',cd:130,col:'#c0a0ff'},
      {e:'💜',n:'Escudo Compresi',cd:200,col:'#dd88ff'},
      {e:'🛡️',n:'Campo Masivo',cd:440,col:'#ffffff'},
    ],
    passive:'Regenera escudo c/4s + daño mágico al enemigo cercano',p1k:['1','2','3'],p2k:['i','o','p']},
};

const WALLS=[{x:0,y:0,w:CW,h:36},{x:0,y:CH-36,w:CW,h:36},{x:0,y:0,w:36,h:CH},{x:CW-36,y:0,w:36,h:CH},{x:340,y:200,w:180,h:32,t:'rock'},{x:340,y:288,w:180,h:32,t:'rock'},{x:110,y:140,w:75,h:75,t:'ice'},{x:675,y:305,w:75,h:75,t:'ice'},{x:165,y:340,w:58,h:52,t:'rock'},{x:637,y:128,w:58,h:52,t:'rock'},{x:310,y:100,w:48,h:48,t:'ice'},{x:502,y:372,w:48,h:48,t:'ice'}];
function hitW(x,y,w,h){for(const W of WALLS){if(x<W.x+W.w&&x+w>W.x&&y<W.y+W.h&&y+h>W.y)return true;}return false;}

let _ac=null;
function sfx(t){try{if(!_ac)_ac=new(window.AudioContext||window.webkitAudioContext)();const a=_ac,o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);const T=a.currentTime;const C={ice:[600,300,.08,'square',.06],wave:[200,400,.2,'sawtooth',.07],bomb:[300,80,.3,'triangle',.13],boom:[120,40,.5,'sawtooth',.16],hook:[500,800,.15,'square',.11],recall:[600,200,.3,'sawtooth',.12],zap:[900,400,.12,'square',.09],thunder:[150,50,.5,'sawtooth',.16],hit:[200,100,.08,'sine',.06],base_hit:[160,80,.15,'square',.16],respawn:[300,700,.3,'sine',.09],base_die:[70,25,.9,'sawtooth',.25],bush:[400,600,.1,'sine',.04],fire_exp:[350,120,.25,'sawtooth',.13],water_ray:[700,500,.08,'sine',.07],freeze:[800,200,.35,'square',.11],quake:[80,40,.4,'sawtooth',.18],buff:[500,900,.2,'sine',.1],pull:[400,200,.2,'sawtooth',.12],jump_land:[100,50,.35,'sawtooth',.22],dodge:[700,17800,.1,'sine',.08],dash_hit:[400,150,.15,'square',.13],frenzy:[600,800,.05,'square',.1],spear:[800,400,.07,'sawtooth',.07],shield_on:[400,700,.1,'sine',.08]};const c=C[t]||C.hit;o.type=c[3];o.frequency.setValueAtTime(c[0],T);o.frequency.exponentialRampToValueAtTime(c[1],T+c[2]);g.gain.setValueAtTime(c[4],T);g.gain.exponentialRampToValueAtTime(.001,T+c[2]+.04);o.start(T);o.stop(T+c[2]+.08);}catch(e){}}

function addPt(x,y,col,vx,vy,r,l){particles.push({x,y,vx:(vx||0)+(Math.random()-.5)*3,vy:(vy||0)+(Math.random()-.5)*3,col,l:l||36,ml:l||36,r:r||2.5+Math.random()*3});}
function addFx(x,y,col,t){effects.push({x,y,col,t:t||'ring',l:32,ml:32});}
function addFl(x,y,txt,col){floats.push({x,y:y-10,txt,col,l:68,vy:-1.3});}
function shk(m,d){shake.x=m;shake.y=m;shake.d=d;}
function dst(a,b){return Math.sqrt((a.cx-b.cx)**2+(a.cy-b.cy)**2);}

// ── DAMAGE ──────────────────────────────────────────────
function dmgP(target,dmg,src){
  if(target.invincible>0||target.dead||target.dodging)return 0;
  let d=Math.round(dmg);
  if(src&&src.buffActive)d=Math.round(d*1.35);
  if(target.shield>0){d=Math.round(d*.35);target.shield=0;addFl(target.cx,target.cy,'🛡️ -'+d,'#88ffff');}
  else addFl(target.cx,target.cy,'-'+d,target===p1?'#ff6666':'#ffaa44');
  target.hp=Math.max(0,target.hp-d);target.invincible=10;
  for(let i=0;i<7;i++)addPt(target.cx,target.cy,target.color);
  addFx(target.cx,target.cy,target.color);shk(d>35?4:2,d>35?10:5);
  if(src)addDmg(src,d);
  if(target.hp<=0&&!target.dead){target.dead=true;target.rT=RESP;target.hp=0;addFl(target.cx,target.cy,'💀 KO!',target.color);shk(7,18);if(src)addKill(src);}
  updHUD();return d;
}
function dmgB(base,dmg,src){
  if(base.hp<=0)return;const d=Math.round(dmg);base.hp=Math.max(0,base.hp-d);base.hit=9;
  const col=base.owner===1?'#5ab0ff':'#ff6b5a';addFl(base.x+BW/2,base.y-8,'🏠 -'+d,base.owner===1?'#ff6666':'#ff8844');
  for(let i=0;i<4;i++)addPt(base.x+BW/2,base.y+BH/2,col,0,0,3,22);sfx('base_hit');shk(3,6);
  if(base.hp<=0){sfx('base_die');shk(11,26);for(let i=0;i<24;i++)addPt(base.x+BW/2,base.y+BH/2,col,(Math.random()-.5)*5,(Math.random()-.5)*5,5,55);setTimeout(()=>endGame(base.owner===1?p2:p1),350);}
  updHUD();updStats();
}

const MAXBL=10,BLIFE=360;
function spBl(x,y,owner){const mine=blades.filter(b=>b.o===owner);if(mine.length>=MAXBL){const i=blades.findIndex(b=>b.o===owner);if(i>=0)blades.splice(i,1);}blades.push({x,y,o:owner,l:BLIFE,a:Math.random()*Math.PI*2});}
function myBl(o){return blades.filter(b=>b.o===o).length;}

function spProj(sx,sy,tx,ty,sp,col,dmg,rng,type,owner,extra){const dx=tx-sx,dy=ty-sy,d=Math.sqrt(dx*dx+dy*dy)||1;projs.push({x:sx,y:sy,vx:dx/d*sp,vy:dy/d*sp,col,dmg,rng,dist:0,type,owner,r:5,...(extra||{})});}

// Smart target: if enemy dead/hidden → aim at enemy base
function tgtPos(owner,enemy){
  const enBase=owner===p1?base2:base1;
  if(enemy.dead||hidden(enemy,owner))return{tx:enBase.x+BW/2,ty:enBase.y+BH/2};
  return{tx:enemy.cx,ty:enemy.cy};
}
function inBase(pr,base){return base.hp>0&&pr.x>=base.x&&pr.x<=base.x+BW&&pr.y>=base.y&&pr.y<=base.y+BH;}

function tickProjs(){
  for(let i=projs.length-1;i>=0;i--){
    const pr=projs[i];const en=pr.owner===p1?p2:p1;const enBase=pr.owner===p1?base2:base1;
    if(pr.type==='bomb'){pr.t++;const prog=pr.t/pr.mt;pr.dx=pr.sx+(pr.tx-pr.sx)*prog;pr.dy=pr.sy+(pr.ty-pr.sy)*prog-Math.sin(prog*Math.PI)*60;if(Math.random()<.26)addPt(pr.dx,pr.dy,pr.col,.4,-.4,3,15);if(pr.t>=pr.mt){for(let j=0;j<12;j++)addPt(pr.tx,pr.ty,pr.col,0,0,4,28);addFx(pr.tx,pr.ty,pr.col,'boom');shk(4,8);if(!en.dead&&!en.dodging&&Math.abs(pr.tx-en.cx)<52&&Math.abs(pr.ty-en.cy)<52)dmgP(en,pr.dmg,pr.owner);else if(Math.abs(pr.tx-(enBase.x+BW/2))<62&&Math.abs(pr.ty-(enBase.y+BH/2))<62)dmgB(enBase,pr.dmg,pr.owner);projs.splice(i,1);}continue;}
    if(pr.type==='water_ray'){pr.life--;if(pr.life<=0){projs.splice(i,1);continue;}if(!en.dead&&!hidden(en,pr.owner)){pr.tx=en.cx;pr.ty=en.cy;}pr.dtick=(pr.dtick||0)+1;if(pr.dtick%8===0){if(!en.dead&&dst(pr.owner,en)<200)dmgP(en,6,pr.owner);else dmgB(enBase,4,pr.owner);}continue;}
    if(pr.type==='vine'){pr.x+=pr.vx;pr.y+=pr.vy;pr.dist+=Math.sqrt(pr.vx*pr.vx+pr.vy*pr.vy);if(Math.random()<.3)addPt(pr.x,pr.y,'#44cc22',0,0,3,16);if(pr.dist>pr.rng||pr.x<36||pr.x>CW-36||pr.y<36||pr.y>CH-36){projs.splice(i,1);continue;}if(hitW(pr.x-pr.r,pr.y-pr.r,pr.r*2,pr.r*2)){projs.splice(i,1);continue;}if(!en.dead&&!en.dodging&&Math.abs(pr.x-en.cx)<50&&Math.abs(pr.y-en.cy)<50){en.rooted=200;en.poisoned=Math.max(en.poisoned,120);en.poisonSrc=pr.owner;addFl(en.cx,en.cy,'🌿 ENREDADA!','#44cc22');sfx('pull');shk(3,8);for(let j=0;j<12;j++)addPt(en.cx,en.cy,'#44cc22',(Math.random()-.5)*4,(Math.random()-.5)*4,3,32);addFx(en.cx,en.cy,'#44cc22','buff_ring');dmgP(en,14,pr.owner);projs.splice(i,1);}else if(inBase(pr,enBase)){dmgB(enBase,14,pr.owner);projs.splice(i,1);}continue;}
    if(pr.type==='freeze_proj'){pr.x+=pr.vx;pr.y+=pr.vy;pr.dist+=Math.sqrt(pr.vx*pr.vx+pr.vy*pr.vy);if(Math.random()<.38)addPt(pr.x,pr.y,'#aaddff',0,0,3,18);if(pr.dist>pr.rng||pr.x<36||pr.x>CW-36||pr.y<36||pr.y>CH-36){projs.splice(i,1);continue;}if(hitW(pr.x-pr.r,pr.y-pr.r,pr.r*2,pr.r*2)){projs.splice(i,1);continue;}if(!en.dead&&!en.dodging&&Math.abs(pr.x-en.cx)<48&&Math.abs(pr.y-en.cy)<48){en.frozen=180;en.frozenSkills=180;addFl(en.cx,en.cy,'🧊 CONGELADO!','#aaddff');sfx('freeze');shk(5,13);for(let j=0;j<16;j++)addPt(en.cx,en.cy,'#aaddff',(Math.random()-.5)*4,(Math.random()-.5)*4,4,42);addFx(en.cx,en.cy,'#aaddff','freeze');dmgP(en,32,pr.owner);projs.splice(i,1);}else if(inBase(pr,enBase)){dmgB(enBase,32,pr.owner);addFx(pr.x,pr.y,'#aaddff');projs.splice(i,1);}continue;}
    if(pr.type==='curve_field'){
      pr.curveTimer=(pr.curveTimer||0)+1;
      // Curvar progresivamente hacia el objetivo
      const dx=pr.tx-pr.x,dy=pr.ty-pr.y,d=Math.sqrt(dx*dx+dy*dy)||1;
      const steer=0.12;pr.vx+=(dx/d*10-pr.vx)*steer;pr.vy+=(dy/d*10-pr.vy)*steer;
      const spd=Math.sqrt(pr.vx*pr.vx+pr.vy*pr.vy)||1;pr.vx=pr.vx/spd*10;pr.vy=pr.vy/spd*10;
      pr.x+=pr.vx;pr.y+=pr.vy;pr.dist+=10;
      if(Math.random()<.4)addPt(pr.x,pr.y,'#c0a0ff',0,0,2,14);
      if(pr.dist>pr.rng||pr.x<36||pr.x>CW-36||pr.y<36||pr.y>CH-36){projs.splice(i,1);continue;}
      if(hitW(pr.x-pr.r,pr.y-pr.r,pr.r*2,pr.r*2)){projs.splice(i,1);continue;}
      if(!en.dead&&!en.dodging&&Math.abs(pr.x-en.cx)<46&&Math.abs(pr.y-en.cy)<46){
        dmgP(en,pr.dmg,pr.owner);addFx(pr.x,pr.y,'#c0a0ff');
        addPt(en.cx,en.cy,'#a078ff',0,0,4,22);
        projs.splice(i,1);
      }else if(inBase(pr,enBase)){dmgB(enBase,pr.dmg,pr.owner);addFx(pr.x,pr.y,'#c0a0ff');projs.splice(i,1);}
      continue;
    }
    pr.x+=pr.vx;pr.y+=pr.vy;pr.dist+=Math.sqrt(pr.vx*pr.vx+pr.vy*pr.vy);
    if(Math.random()<.28)addPt(pr.x,pr.y,pr.col,0,0,2,14);
    if(pr.dist>pr.rng||pr.x<36||pr.x>CW-36||pr.y<36||pr.y>CH-36){if(pr.type==='ulti_blade')spBl(pr.x,pr.y,pr.owner===p1?p1:p2);projs.splice(i,1);continue;}
    if(hitW(pr.x-pr.r,pr.y-pr.r,pr.r*2,pr.r*2)){if(pr.type==='ulti_blade')spBl(pr.x,pr.y,pr.owner===p1?p1:p2);for(let j=0;j<3;j++)addPt(pr.x,pr.y,pr.col);projs.splice(i,1);continue;}
    let hit=false;
    if(!en.dead&&!en.dodging&&Math.abs(pr.x-en.cx)<CS*.62&&Math.abs(pr.y-en.cy)<CS*.62){dmgP(en,pr.dmg,pr.owner);addFx(pr.x,pr.y,pr.col);if(pr.type==='zap'&&pr.charges>=5){en.rooted=100;addFl(en.cx,en.cy,'⚡ RAÍZ!','#ffff44');}hit=true;}
    else if(inBase(pr,enBase)){dmgB(enBase,pr.dmg,pr.owner);addFx(pr.x,pr.y,pr.col);hit=true;}
    if(hit)projs.splice(i,1);
  }
}

function mkP(ck,isP1){
  const d=CHARS[ck];
  return{ck,name:d.name,icon:d.icon,color:d.color,hat:d.hat,body:d.body,
    x:isP1?115:CW-115-CS,y:CH/2-CS/2,hp:d.hp,maxHp:d.hp,spd:d.spd,facing:isP1?1:-1,
    invincible:0,shield:0,rooted:0,frozen:0,frozenSkills:0,slowed:0,energyForm:false,eT:0,
    q_t:0,w_t:0,e_t:0,passT:0,charges:0,cT:0,cD:0,waterRayActive:false,
    buffActive:false,buffTimer:0,jumping:false,jumpT:0,jumpSX:0,jumpSY:0,jumpTX:0,jumpTY:0,quakeTimer:0,
    dodging:false,dodgeTimer:0,frenzying:false,frenzyTimer:0,frenzyHits:0,
    // guerrero
    gShield:false,gShieldTimer:0,gSpeedBuff:false,gSpeedTimer:0,gPassTimer:0,gAtkSpeed:1,
    // pasivas mejoradas
    poisoned:0,poisonSrc:null,         // veneno (chili pasiva, naturaleza pasiva)
    burnT:0,                           // chili pasiva: tiempo de quemadura visual
    vDistAccum:0,                      // velocista: distancia acumulada para dash bonus
    // naturaleza
    natRepelT:0,natVortexActive:false,natVortexTimer:0,natVortexHeal:0,
    // campos de fuerza
    cfShieldRegen:0,cfShieldVal:0,cfShieldMax:60,cfPassTimer:0,cfCompressed:0,
    // flags
    dead:false,rT:0,isP1,inBushLast:false,
    get cx(){return this.x+CS/2;},get cy(){return this.y+CS/2;}
  };
}
function respawnP(p){
  p.dead=false;p.hp=p.maxHp;p.x=p.isP1?115:CW-115-CS;p.y=CH/2-CS/2;
  p.invincible=90;p.rooted=0;p.shield=0;p.energyForm=false;p.eT=0;p.frozen=0;p.frozenSkills=0;p.slowed=0;p.waterRayActive=false;p.buffActive=false;p.buffTimer=0;p.jumping=false;p.dodging=false;p.dodgeTimer=0;p.frenzying=false;p.frenzyTimer=0;p.gShield=false;p.gShieldTimer=0;
  p.poisoned=0;p.poisonSrc=null;p.burnT=0;p.vDistAccum=0;p.natRepelT=0;p.natVortexActive=false;p.natVortexTimer=0;
  p.cfShieldRegen=0;p.cfShieldVal=0;p.cfPassTimer=0;
  addFl(p.cx,p.cy,'✨ RESPAWN!',p.color);sfx('respawn');
  for(let i=0;i<11;i++)addPt(p.cx,p.cy,p.color,(Math.random()-.5)*4,(Math.random()-.5)*4,4,44);
  updHUD();
}

// ── SKILLS ──────────────────────────────────────────────

function useSkill(p,e,slot){
  if(p.dead)return;if(p.frozenSkills>0){addFl(p.cx,p.cy,'🧊 Bloqueado!','#aaddff');return;}
  const c=p.ck;
  if(c==='polar'){[pQ,pW,pE][slot]?.(p,e);}else if(c==='chili'){[cQ,cW,cE][slot]?.(p,e);}
  else if(c==='cuchillas'){[cuQ,cuW,cuE][slot]?.(p,e);}else if(c==='electrico'){[elQ,elW,elE][slot]?.(p,e);}
  else if(c==='elemental'){[emQ,emW,emE][slot]?.(p,e);}else if(c==='fortachon'){[ftQ,ftW,ftE][slot]?.(p,e);}
  else if(c==='velocista'){[vQ,vW,vE][slot]?.(p,e);}
  else if(c==='guerrero'){[gQ,gW,gE][slot]?.(p,e);}
  else if(c==='naturaleza'){[natQ,natW,natE][slot]?.(p,e);}
  else if(c==='campos'){[cfQ,cfW,cfE][slot]?.(p,e);}
}

function moveP(p,up,dn,lt,rt){
  if(p.dead||p.jumping)return;
  if(p.dodgeTimer>0){p.dodgeTimer--;if(p.dodgeTimer===0)p.dodging=false;}
  if(p.gSpeedTimer>0){p.gSpeedTimer--;if(p.gSpeedTimer===0)p.gSpeedBuff=false;}
  if(p.frozen>0){p.frozen--;return;}if(p.rooted>0){p.rooted--;return;}
  let dx=0,dy=0;let sp=p.spd*(p.energyForm?1.6:1)*(p.slowed>0?.45:1)*(p.buffActive?1.15:1)*(p.gSpeedBuff?1.25:1);
  if(keys[up])dy-=sp;if(keys[dn])dy+=sp;if(keys[lt]){dx-=sp;p.facing=-1;}if(keys[rt]){dx+=sp;p.facing=1;}
  if(dx&&dy){dx*=.707;dy*=.707;}
  const nx=p.x+dx;if(!hitW(nx,p.y,CS,CS)&&nx>40&&nx<CW-40-CS)p.x=nx;
  const ny=p.y+dy;if(!hitW(p.x,ny,CS,CS)&&ny>40&&ny<CH-40-CS)p.y=ny;
  const nowIn=!!inBush(p);if(nowIn&&!p.inBushLast)sfx('bush');p.inBushLast=nowIn;
}

// ── DRAWING ─────────────────────────────────────────────
function initBg(){bgT=[];for(let x=36;x<CW-36;x+=52)for(let y=36;y<CH-36;y+=52)bgT.push({x,y,v:Math.random()});}
function drawMap(){const g=ctx.createLinearGradient(0,0,CW,CH);g.addColorStop(0,'#060818');g.addColorStop(1,'#080a1e');ctx.fillStyle=g;ctx.fillRect(0,0,CW,CH);for(const t of bgT){ctx.fillStyle=`rgba(${10+t.v*12},${12+t.v*15},${35+t.v*22},.3)`;ctx.fillRect(t.x,t.y,51,51);}for(const W of WALLS){const isBorder=W.x===0||W.y===0||W.x===CW-36||W.y===CH-36;if(isBorder){ctx.fillStyle='#060818';ctx.fillRect(W.x,W.y,W.w,W.h);ctx.strokeStyle='rgba(80,120,255,.16)';ctx.lineWidth=1.5;ctx.strokeRect(W.x+.75,W.y+.75,W.w-1.5,W.h-1.5);}else if(W.t==='ice'){ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(W.x+3,W.y+3,W.w,W.h);const gi=ctx.createLinearGradient(W.x,W.y,W.x+W.w,W.y+W.h);gi.addColorStop(0,'#8ec8e0');gi.addColorStop(1,'#4488b4');ctx.fillStyle=gi;ctx.beginPath();ctx.roundRect(W.x,W.y,W.w,W.h,5);ctx.fill();ctx.fillStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.roundRect(W.x+4,W.y+4,W.w*.3,W.h*.24,3);ctx.fill();ctx.strokeStyle='rgba(180,230,255,.35)';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(W.x,W.y,W.w,W.h,5);ctx.stroke();}else{ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(W.x+3,W.y+3,W.w,W.h);const gr=ctx.createLinearGradient(W.x,W.y,W.x+W.w,W.y+W.h);gr.addColorStop(0,'#445060');gr.addColorStop(1,'#1e2838');ctx.fillStyle=gr;ctx.beginPath();ctx.roundRect(W.x,W.y,W.w,W.h,7);ctx.fill();ctx.strokeStyle='rgba(70,100,160,.28)';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(W.x,W.y,W.w,W.h,7);ctx.stroke();}}}
function drawBushGround(){for(const b of BUSHES){ctx.save();ctx.fillStyle='rgba(0,0,0,.26)';ctx.beginPath();ctx.roundRect(b.x+3,b.y+3,b.w,b.h,6);ctx.fill();ctx.fillStyle='rgba(12,30,10,.68)';ctx.beginPath();ctx.roundRect(b.x,b.y,b.w,b.h,6);ctx.fill();ctx.restore();}}
function drawBushCanopy(){for(const b of BUSHES){ctx.save();ctx.beginPath();ctx.roundRect(b.x,b.y,b.w,b.h,6);ctx.clip();for(let ty2=b.y;ty2<b.y+b.h;ty2+=TILE){for(let tx2=b.x;tx2<b.x+b.w;tx2+=TILE){const sh=0.55+Math.sin(tx2*.3+ty2*.2)*.08;ctx.fillStyle=`rgb(${Math.floor(18+sh*12)},${Math.floor(72+sh*28)},${Math.floor(18+sh*10)})`;ctx.fillRect(tx2,ty2,TILE-1,TILE-1);ctx.fillStyle='rgba(80,200,50,.16)';ctx.fillRect(tx2+2,ty2+2,4,4);}}ctx.fillStyle='rgba(90,210,55,.2)';ctx.fillRect(b.x,b.y,b.w,3);ctx.strokeStyle='rgba(30,120,20,.55)';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(b.x,b.y,b.w,b.h,6);ctx.stroke();ctx.restore();}}
function drawBase(base){
  const col=base.owner===1?'#5ab0ff':'#ff6b5a';const col2=base.owner===1?'#1a3a70':'#7a1a0a';if(base.hit>0)base.hit--;
  if(base.hp<=0){ctx.save();ctx.globalAlpha=.28;ctx.fillStyle='#333344';ctx.beginPath();ctx.roundRect(base.x,base.y+BH*.55,BW,BH*.45,4);ctx.fill();ctx.restore();return;}
  const pct=base.hp/BHP;ctx.save();ctx.fillStyle='rgba(0,0,0,.24)';ctx.beginPath();ctx.roundRect(base.x+4,base.y+4,BW,BH,10);ctx.fill();if(base.hit>0){ctx.shadowColor='#fff';ctx.shadowBlur=17;}
  const bg=ctx.createLinearGradient(base.x,base.y,base.x,base.y+BH);bg.addColorStop(0,col2);bg.addColorStop(1,'#080a18');ctx.fillStyle=bg;ctx.beginPath();ctx.roundRect(base.x,base.y,BW,BH,10);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=base.hit>0?'#fff':col+(pct<.3?'ff':pct<.6?'cc':'88');ctx.lineWidth=base.hit>0?3:2;ctx.beginPath();ctx.roundRect(base.x,base.y,BW,BH,10);ctx.stroke();
  const cx=base.x+BW/2,cy=base.y+BH/2-4;ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=5;ctx.beginPath();ctx.moveTo(cx,cy-17);ctx.lineTo(cx-15,cy-6);ctx.lineTo(cx+15,cy-6);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle=col2;ctx.fillRect(cx-11,cy-6,22,15);ctx.strokeStyle=col+'88';ctx.lineWidth=1;ctx.strokeRect(cx-11,cy-6,22,15);ctx.fillStyle='#080a18';ctx.fillRect(cx-4,cy+1,8,8);ctx.fillStyle=col+'55';ctx.fillRect(cx-9,cy-3,5,5);ctx.fillRect(cx+4,cy-3,5,5);ctx.fillStyle=col;ctx.fillRect(cx-1.5,cy-25,2,9);ctx.beginPath();ctx.moveTo(cx,cy-25);ctx.lineTo(cx+7,cy-21);ctx.lineTo(cx,cy-17);ctx.fill();
  const bx2=base.x,by2=base.y+BH+4;ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.roundRect(bx2,by2,BW,5,2);ctx.fill();const bc=pct>.5?col:pct>.25?'#ffaa22':'#ff3333';ctx.fillStyle=bc;ctx.shadowColor=bc;ctx.shadowBlur=3;ctx.beginPath();ctx.roundRect(bx2,by2,BW*pct,5,2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,.55)';ctx.font='bold 7px Nunito,sans-serif';ctx.textAlign='center';ctx.fillText(Math.ceil(base.hp)+'/'+BHP,base.x+BW/2,by2+13);ctx.restore();
}
function drawBlades(){for(const bl of blades){const a=Math.min(1,bl.l/60)*.74;ctx.save();ctx.globalAlpha=a;ctx.translate(bl.x,bl.y);ctx.rotate(bl.a);ctx.fillStyle='#c0aaff';ctx.shadowColor='#8866ff';ctx.shadowBlur=5;ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(2,-2);ctx.lineTo(9,0);ctx.lineTo(2,2);ctx.lineTo(0,9);ctx.lineTo(-2,2);ctx.lineTo(-9,0);ctx.lineTo(-2,-2);ctx.closePath();ctx.fill();ctx.restore();}}
function drawWaterRay(){for(const pr of projs){if(pr.type!=='water_ray')continue;const ox=pr.owner;ctx.save();ctx.strokeStyle='#44aaff';ctx.lineWidth=5;ctx.shadowColor='#88ccff';ctx.shadowBlur=11;ctx.globalAlpha=.72;ctx.beginPath();ctx.moveTo(ox.cx,ox.cy);ctx.lineTo(pr.tx,pr.ty);ctx.stroke();ctx.strokeStyle='#aaeeff';ctx.lineWidth=2;ctx.shadowBlur=5;ctx.globalAlpha=.88;ctx.beginPath();ctx.moveTo(ox.cx,ox.cy);ctx.lineTo(pr.tx,pr.ty);ctx.stroke();ctx.restore();}}
function drawProjs(){for(const pr of projs){if(pr.type==='water_ray')continue;ctx.save();const px=pr.type==='bomb'?pr.dx:pr.x;const py=pr.type==='bomb'?pr.dy:pr.y;if(pr.type==='snowball'){ctx.fillStyle='#fff';ctx.shadowColor='#8dd4ff';ctx.shadowBlur=9;ctx.beginPath();ctx.arc(px,py,pr.r,0,Math.PI*2);ctx.fill();}else if(pr.type==='fireball'){const fg=ctx.createRadialGradient(px,py,1,px,py,pr.r+3);fg.addColorStop(0,'#fff088');fg.addColorStop(.5,'#ff6600');fg.addColorStop(1,'rgba(255,50,0,0)');ctx.fillStyle=fg;ctx.shadowColor='#ff4400';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(px,py,pr.r+3,0,Math.PI*2);ctx.fill();}else if(pr.type==='wave'){ctx.fillStyle=pr.col+'cc';ctx.shadowColor=pr.col;ctx.shadowBlur=6;ctx.fillRect(px-4,py-3,8,6);}else if(pr.type==='bomb'){ctx.fillStyle='#222';ctx.shadowColor='#ffaa22';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(px,py,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffbb33';ctx.beginPath();ctx.arc(px+7,py-8,3,0,Math.PI*2);ctx.fill();}else if(pr.type==='recall_blade'||pr.type==='ulti_blade'){ctx.translate(px,py);ctx.rotate(Math.atan2(pr.vy,pr.vx));ctx.fillStyle='#c0aaff';ctx.shadowColor='#9977ff';ctx.shadowBlur=9;ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(2,3);ctx.lineTo(-10,0);ctx.lineTo(2,-3);ctx.closePath();ctx.fill();}else if(pr.type==='zap'){ctx.fillStyle='#ffe844';ctx.shadowColor='#ffff88';ctx.shadowBlur=13;ctx.beginPath();ctx.arc(px,py,pr.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,255,200,.5)';ctx.lineWidth=1.5;for(let i=0;i<3;i++){const a2=Math.random()*Math.PI*2;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+Math.cos(a2)*10,py+Math.sin(a2)*10);ctx.stroke();}}else if(pr.type==='avalanche'){ctx.fillStyle='#eef8ff';ctx.shadowColor='#fff';ctx.shadowBlur=7;ctx.beginPath();ctx.arc(px,py,pr.r+1,0,Math.PI*2);ctx.fill();}else if(pr.type==='lava'){ctx.fillStyle='#ff5500';ctx.shadowColor='#ff7700';ctx.shadowBlur=9;ctx.beginPath();ctx.arc(px,py,pr.r,0,Math.PI*2);ctx.fill();}else if(pr.type==='freeze_proj'){const fg=ctx.createRadialGradient(px,py,1,px,py,pr.r+4);fg.addColorStop(0,'#fff');fg.addColorStop(.5,'#88ddff');fg.addColorStop(1,'rgba(100,200,255,0)');ctx.fillStyle=fg;ctx.shadowColor='#aaddff';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(px,py,pr.r+4,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#cceeff';ctx.lineWidth=1.5;for(let i=0;i<6;i++){const a3=(i/6)*Math.PI*2;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+Math.cos(a3)*10,py+Math.sin(a3)*10);ctx.stroke();}}else if(pr.type==='vine'){ctx.save();ctx.translate(px,py);ctx.rotate(Math.atan2(pr.vy,pr.vx));ctx.strokeStyle='#44cc22';ctx.lineWidth=4;ctx.shadowColor='#66dd44';ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(-8,0);ctx.bezierCurveTo(-4,-5,4,5,8,0);ctx.stroke();ctx.strokeStyle='#88ff44';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-6,0);ctx.bezierCurveTo(-2,-4,2,4,6,0);ctx.stroke();ctx.restore();}else if(pr.type==='spear'){// Spear: elongated golden projectile
  ctx.translate(px,py);ctx.rotate(Math.atan2(pr.vy,pr.vx));ctx.fillStyle='#ffd080';ctx.shadowColor='#ffaa22';ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(4,3);ctx.lineTo(-10,0);ctx.lineTo(4,-3);ctx.closePath();ctx.fill();// shaft
  ctx.strokeStyle='#aa8820';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-18,0);ctx.stroke();}else{ctx.fillStyle=pr.col;ctx.shadowColor=pr.col;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(px,py,pr.r,0,Math.PI*2);ctx.fill();}ctx.restore();}}

function drawPenguin(p){
  if(p.dead){const secs=Math.ceil(p.rT/60);ctx.save();ctx.globalAlpha=.43;ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=13;ctx.beginPath();ctx.arc(p.x+CS/2,p.y+CS/2,CS/2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.globalAlpha=.94;ctx.fillStyle='#fff';ctx.font='bold 14px "Fredoka One",cursive';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(secs,p.x+CS/2,p.y+CS/2-4);ctx.fillStyle=p.color;ctx.font='bold 7px Nunito,sans-serif';ctx.fillText('RESPAWN',p.x+CS/2,p.y+CS/2+8);ctx.restore();return;}
  if(p.jumping){ctx.save();ctx.globalAlpha=.65;ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=20;const sz=CS*(1+Math.sin(p.jumpT/34*Math.PI)*.4);ctx.beginPath();ctx.ellipse(p.x+CS/2,p.y+CS/2,sz/2,sz*.55,0,0,Math.PI*2);ctx.fill();ctx.restore();return;}
  const x=p.x,y=p.y,s=CS;ctx.save();
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(x+s/2,y+s+3,s/2,5,0,0,Math.PI*2);ctx.fill();
  // Status rings
  if(p.dodging){ctx.strokeStyle='#44ffcc';ctx.lineWidth=2.5;ctx.shadowColor='#44ffcc';ctx.shadowBlur=18;ctx.globalAlpha=.7+Math.sin(Date.now()*.02)*.3;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2+8,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=1;}
  if(p.frenzying){ctx.strokeStyle='#aaffee';ctx.lineWidth=2;ctx.shadowColor='#44ffcc';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2+5+(Math.sin(Date.now()*.04)*4),0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
  if(p.gSpeedBuff){ctx.strokeStyle='rgba(255,208,128,.5)';ctx.lineWidth=2;ctx.shadowColor='#ffd080';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2+7+(Math.sin(Date.now()*.02)*3),0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
  if(p.frozen>0){ctx.save();ctx.globalAlpha=.48;const fg=ctx.createRadialGradient(x+s/2,y+s/2,2,x+s/2,y+s/2,s*.78);fg.addColorStop(0,'rgba(160,230,255,.7)');fg.addColorStop(1,'rgba(100,180,255,.08)');ctx.fillStyle=fg;ctx.beginPath();ctx.ellipse(x+s/2,y+s/2,s*.65,s*.75,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  if(p.slowed>0){ctx.strokeStyle='rgba(100,200,255,.32)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2+9,0,Math.PI*2);ctx.stroke();}
  if(p.buffActive){ctx.strokeStyle='rgba(255,190,50,.55)';ctx.lineWidth=2.5;ctx.shadowColor='#ffcc44';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2+7+(Math.sin(Date.now()*.015)*3),0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
  if(p.rooted>0){ctx.strokeStyle='#ffff44';ctx.lineWidth=1.5;for(let i=0;i<4;i++){const ang=(i/4)*Math.PI*2,r=s/2+5;ctx.beginPath();ctx.moveTo(x+s/2+Math.cos(ang)*r,y+s/2+Math.sin(ang)*r);ctx.lineTo(x+s/2+Math.cos(ang)*(r+8),y+s/2+Math.sin(ang)*(r+8));ctx.stroke();}}
  if(p.invincible>0&&Math.floor(p.invincible/3)%2===0)ctx.globalAlpha=.3;
  if(p.energyForm){ctx.shadowColor=p.color;ctx.shadowBlur=24;ctx.strokeStyle=p.color+'aa';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2+8,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
  if(p.shield>0){ctx.strokeStyle='#88ffff';ctx.lineWidth=2;ctx.shadowColor='#88ffff';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2+6,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
  // Body by char
  if(p.ck==='elemental'){ctx.save();ctx.beginPath();ctx.ellipse(x+s/2,y+s/2+2,s/2,s*.55,0,0,Math.PI*2);ctx.clip();ctx.fillStyle='#3a0c00';ctx.fillRect(x,y,s/2,s+6);ctx.fillStyle='#001030';ctx.fillRect(x+s/2,y,s/2,s+6);ctx.restore();ctx.strokeStyle=p.color+'88';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x+s/2,y+s/2+2,s/2,s*.55,0,0,Math.PI*2);ctx.stroke();}
  else if(p.ck==='fortachon'){const bg=ctx.createRadialGradient(x+s/2-3,y+s/2-3,1,x+s/2,y+s/2,s*.58);bg.addColorStop(0,'#3a2800');bg.addColorStop(1,'#1a0e00');ctx.fillStyle=bg;ctx.beginPath();ctx.ellipse(x+s/2,y+s/2+2,s*.55,s*.58,0,0,Math.PI*2);ctx.fill();ctx.shadowColor=p.color;ctx.shadowBlur=p.buffActive?18:11;ctx.strokeStyle=p.color+'99';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x+s/2,y+s/2+2,s*.55,s*.58,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
  else if(p.ck==='velocista'){const bg=ctx.createRadialGradient(x+s/2-2,y+s/2-4,1,x+s/2,y+s/2,s*.48);bg.addColorStop(0,'#0a2820');bg.addColorStop(1,'#001a12');ctx.fillStyle=bg;ctx.beginPath();ctx.ellipse(x+s/2,y+s/2+2,s*.42,s*.55,0,0,Math.PI*2);ctx.fill();ctx.shadowColor='#44ffcc';ctx.shadowBlur=p.frenzying?20:10;ctx.strokeStyle='#44ffcc88';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x+s/2,y+s/2+2,s*.42,s*.55,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;if(p.dodging||p.frenzying){ctx.strokeStyle='rgba(68,255,204,.18)';ctx.lineWidth=1;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x-5-i*7,y+s*.2+i*9);ctx.lineTo(x-5-i*7-18,y+s*.2+i*9);ctx.stroke();}}}
  else if(p.ck==='guerrero'){
    // Golden penguin body
    const bg=ctx.createRadialGradient(x+s/2-3,y+s/2-4,1,x+s/2,y+s/2,s/2);bg.addColorStop(0,'#3a2800');bg.addColorStop(1,'#180e00');ctx.fillStyle=bg;ctx.beginPath();ctx.ellipse(x+s/2,y+s/2+2,s/2,s*.55,0,0,Math.PI*2);ctx.fill();ctx.shadowColor='#ffd080';ctx.shadowBlur=p.gSpeedBuff?18:10;ctx.strokeStyle='#ffd08099';ctx.lineWidth=1.8;ctx.beginPath();ctx.ellipse(x+s/2,y+s/2+2,s/2,s*.55,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;
    // Cape (golden cloak behind)
    ctx.fillStyle='rgba(200,140,10,.4)';ctx.beginPath();ctx.ellipse(x+s/2-(p.facing>0?4:-4),y+s/2+4,s*.3,s*.45,.2*p.facing,0,Math.PI*2);ctx.fill();
    // Spear (golden lance on side)
    ctx.strokeStyle='#ffd080';ctx.lineWidth=2.5;ctx.shadowColor='#ffaa22';ctx.shadowBlur=6;ctx.beginPath();ctx.moveTo(x+s/2+(p.facing>0?s*.4:-s*.4),y+s*.08);ctx.lineTo(x+s/2+(p.facing>0?s*.7:-s*.7),y+s*.9);ctx.stroke();// spear tip
    ctx.fillStyle='#ffee88';ctx.beginPath();ctx.moveTo(x+s/2+(p.facing>0?s*.4:-s*.4),y+s*.02);ctx.lineTo(x+s/2+(p.facing>0?s*.46:-s*.46),y+s*.14);ctx.lineTo(x+s/2+(p.facing>0?s*.34:-s*.34),y+s*.14);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
  }
  else if(p.ck==='naturaleza'){
    const bg=ctx.createRadialGradient(x+s/2-3,y+s/2-4,1,x+s/2,y+s/2,s*.52);
    bg.addColorStop(0,'#0e2808');bg.addColorStop(1,'#0a1e04');
    ctx.fillStyle=bg;ctx.beginPath();ctx.ellipse(x+s/2,y+s/2+2,s*.48,s*.56,0,0,Math.PI*2);ctx.fill();
    ctx.shadowColor='#66dd44';ctx.shadowBlur=p.natVortexActive?20:10;
    ctx.strokeStyle='#66dd4488';ctx.lineWidth=1.6;
    ctx.beginPath();ctx.ellipse(x+s/2,y+s/2+2,s*.48,s*.56,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;
    // leaf details
    ctx.fillStyle='rgba(80,200,40,.28)';
    ctx.beginPath();ctx.ellipse(x+s*.18,y+s*.28,5,9,.4,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(x+s*.82,y+s*.28,5,9,-.4,0,Math.PI*2);ctx.fill();
    if(p.natVortexActive){for(let i=0;i<2;i++)addPt(p.cx+(Math.random()-.5)*s*1.4,p.cy+(Math.random()-.5)*s*1.4,'#aaddaa',(Math.random()-.5)*1.5,(Math.random()-.5)*1.5,2,18);}
  }
  else{const bg=ctx.createRadialGradient(x+s/2-3,y+s/2-4,1,x+s/2,y+s/2,s/2);bg.addColorStop(0,'#252538');bg.addColorStop(1,p.body||'#080820');ctx.fillStyle=bg;ctx.beginPath();ctx.ellipse(x+s/2,y+s/2+2,s/2,s*.55,0,0,Math.PI*2);ctx.fill();ctx.shadowColor=p.color;ctx.shadowBlur=11;ctx.strokeStyle=p.color+'88';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x+s/2,y+s/2+2,s/2,s*.55,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
  const bel=ctx.createRadialGradient(x+s/2,y+s/2+2,1,x+s/2,y+s/2+2,s*.3);bel.addColorStop(0,'#eef4ff');bel.addColorStop(1,'#b8d4ee');ctx.fillStyle=bel;ctx.beginPath();ctx.ellipse(x+s/2,y+s/2+4,s*.27,s*.36,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=p.hat;ctx.beginPath();ctx.ellipse(x+s/2,y+s*.12,s*.32,s*.09,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=p.body||'#080820';ctx.beginPath();ctx.moveTo(x+s*.2,y+s*.12);ctx.lineTo(x+s*.5,y-s*.1);ctx.lineTo(x+s*.8,y+s*.12);ctx.fill();
  if(p.ck==='fortachon'){ctx.fillStyle='#e8a020';ctx.beginPath();ctx.ellipse(x+s/2,y-s*.06,s*.2,s*.07,0,0,Math.PI*2);ctx.fill();for(let i=0;i<3;i++){ctx.fillRect(x+s*.34+i*(s*.16),y-s*.16,s*.08,s*.12);}ctx.fillStyle='#3a2800';ctx.beginPath();ctx.ellipse(x+s*.1,y+s*.54,6,10,Math.PI*.15,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x+s*.9,y+s*.54,6,10,-Math.PI*.15,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e8a020';ctx.beginPath();ctx.ellipse(x+(p.facing>0?s*.96:s*.04),y+s*.58,5,5,0,0,Math.PI*2);ctx.fill();}
  if(p.ck==='guerrero'){// Crown/helmet
    ctx.fillStyle='#ffd080';ctx.shadowColor='#ffaa22';ctx.shadowBlur=6;for(let i=0;i<3;i++){const cx3=x+s*.26+i*(s*.24);ctx.fillRect(cx3,y-s*.18,s*.12,s*.14);}ctx.fillStyle='#cc8800';ctx.beginPath();ctx.ellipse(x+s/2,y+s*.1,s*.35,s*.1,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
  const ex=x+s/2+(p.facing>0?4:-4);
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex,y+s*.28,3.5,0,Math.PI*2);ctx.fill();
  const eyeCol=p.ck==='elemental'?(p.facing>0?'#ff6622':'#44aaff'):p.ck==='velocista'?'#44ffcc':p.ck==='guerrero'?'#ffd080':p.ck==='naturaleza'?'#88ff44':'#111';
  ctx.fillStyle=eyeCol;if(p.ck==='velocista'||p.ck==='guerrero'){ctx.shadowColor=eyeCol;ctx.shadowBlur=5;}ctx.beginPath();ctx.arc(ex+(p.facing>0?1.2:-1.2),y+s*.28,1.8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#ffaa00';ctx.beginPath();ctx.moveTo(x+s/2+(p.facing>0?7:-7),y+s*.37);ctx.lineTo(x+s/2+(p.facing>0?15:-15),y+s*.41);ctx.lineTo(x+s/2+(p.facing>0?7:-7),y+s*.45);ctx.fill();
  if(p.ck==='electrico'&&p.charges>0){for(let i=0;i<p.charges;i++){const ang=(i/5)*Math.PI*2-Math.PI/2;const cr=s/2+7;ctx.fillStyle='#ffe844';ctx.shadowColor='#ffe844';ctx.shadowBlur=5;ctx.beginPath();ctx.arc(x+s/2+Math.cos(ang)*cr,y+s/2+Math.sin(ang)*cr,2.5,0,Math.PI*2);ctx.fill();}}
  if(p.ck==='elemental'){if(Math.random()<.22)addPt(x+s*.28,y+s*.04,'#ff6622',(-1+Math.random()*.5),-1,1.5,11);if(Math.random()<.22)addPt(x+s*.72,y+s*.04,'#44aaff',(Math.random()*.5-.25),-1,1.5,11);}
  if(p.ck==='fortachon'&&Math.random()<.12)addPt(p.cx+(Math.random()-.5)*26,p.cy+CS*.5,'#6a4010',0,.5,2,14);
  if(p.ck==='velocista'&&(p.dodging||p.frenzying)){for(let i=0;i<2;i++)addPt(p.cx+(Math.random()-.5)*s,p.cy+(Math.random()-.5)*s,'#44ffcc',(-p.facing)*2,0,2,10);}
  if(p.ck==='guerrero'&&Math.random()<.08)addPt(p.cx+(Math.random()-.5)*s,p.cy+s*.05,'#ffd080',(Math.random()-.5),-0.5,1.5,12);
  if(p.ck==='naturaleza'&&Math.random()<.15)addPt(p.cx+(Math.random()-.5)*s*.8,p.cy+(Math.random()-.5)*s*.6,'#66dd44',(Math.random()-.5),-0.8,1.5,14);
  // poison visual overlay
  if(p.poisoned>0&&Math.random()<.22){const col=p.burnT>0?'#ff8844':'#88ff44';addPt(p.cx+(Math.random()-.5)*s,p.cy+(Math.random()-.5)*s*.8,col,0,-0.7,2,18);}
  ctx.restore();
}
function drawPts(){for(const p of particles){const a=p.l/p.ml;ctx.save();ctx.globalAlpha=a;ctx.fillStyle=p.col;ctx.shadowColor=p.col;ctx.shadowBlur=4;ctx.beginPath();ctx.arc(p.x,p.y,p.r*a,0,Math.PI*2);ctx.fill();ctx.restore();}}
function drawFx(){
  for(const ef of effects){const a=ef.l/ef.ml;ctx.save();ctx.globalAlpha=a*.66;
    if(ef.t==='lightning'){ctx.strokeStyle=ef.col;ctx.lineWidth=2+a*2.5;ctx.shadowColor=ef.col;ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(ef.x,ef.y-16);ctx.lineTo(ef.x+5,ef.y);ctx.lineTo(ef.x-4,ef.y+5);ctx.lineTo(ef.x,ef.y+16);ctx.stroke();}
    else if(ef.t==='boom'||ef.t==='shockwave'){ctx.strokeStyle=ef.col;ctx.lineWidth=ef.t==='shockwave'?4:3;ctx.shadowColor=ef.col;ctx.shadowBlur=13;ctx.beginPath();ctx.arc(ef.x,ef.y,(1-a)*(ef.t==='shockwave'?110:44),0,Math.PI*2);ctx.stroke();if(ef.t==='shockwave'){ctx.lineWidth=2;ctx.beginPath();ctx.arc(ef.x,ef.y,(1-a)*70,0,Math.PI*2);ctx.stroke();}}
    else if(ef.t==='explosion'){ctx.strokeStyle='#ff8844';ctx.lineWidth=4;ctx.shadowColor='#ff6622';ctx.shadowBlur=17;ctx.beginPath();ctx.arc(ef.x,ef.y,(1-a)*88,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#ffcc44';ctx.lineWidth=2;ctx.beginPath();ctx.arc(ef.x,ef.y,(1-a)*52,0,Math.PI*2);ctx.stroke();}
    else if(ef.t==='freeze'){ctx.strokeStyle='#aaddff';ctx.lineWidth=3;ctx.shadowColor='#88ccff';ctx.shadowBlur=17;ctx.beginPath();ctx.arc(ef.x,ef.y,(1-a)*68,0,Math.PI*2);ctx.stroke();for(let k=0;k<8;k++){const ak=(k/8)*Math.PI*2;ctx.beginPath();ctx.moveTo(ef.x,ef.y);ctx.lineTo(ef.x+Math.cos(ak)*(1-a)*52,ef.y+Math.sin(ak)*(1-a)*52);ctx.stroke();}}
    else if(ef.t==='quake'){ctx.strokeStyle=ef.col;ctx.lineWidth=3;ctx.shadowColor=ef.col;ctx.shadowBlur=8;ctx.beginPath();ctx.ellipse(ef.x,ef.y,(1-a)*(ef.r+20),7,0,0,Math.PI*2);ctx.stroke();}
    else if(ef.t==='buff_ring'){ctx.strokeStyle=ef.col;ctx.lineWidth=3;ctx.shadowColor=ef.col;ctx.shadowBlur=15;ctx.beginPath();ctx.arc(ef.x,ef.y,(1-a)*60,0,Math.PI*2);ctx.stroke();}
    else if(ef.t==='dodge_ring'){ctx.strokeStyle='#44ffcc';ctx.lineWidth=3;ctx.shadowColor='#44ffcc';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(ef.x,ef.y,(1-a)*50,0,Math.PI*2);ctx.stroke();}
    else{ctx.strokeStyle=ef.col;ctx.lineWidth=2.5;ctx.shadowColor=ef.col;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(ef.x,ef.y,(1-a)*32,0,Math.PI*2);ctx.stroke();}
    ctx.restore();ef.l--;
  }
}
function drawFloats(){for(const f of floats){const a=f.l/70;ctx.save();ctx.globalAlpha=a;ctx.fillStyle=f.col;ctx.font='bold 12px "Fredoka One",cursive';ctx.textAlign='center';ctx.shadowColor=f.col;ctx.shadowBlur=5;ctx.fillText(f.txt,f.x,f.y);ctx.restore();}}

// ── HUD ─────────────────────────────────────────────────
function buildHUD(){bHUDP(p1,'h1',false);bHUDP(p2,'h2',true);}
function bHUDP(p,id,isR){
  const el=document.getElementById(id);const def=CHARS[p.ck];const kkeys=p.isP1?def.p1k:def.p2k;
  const hasRes=p.ck==='cuchillas'||p.ck==='electrico';const rCol=p.ck==='electrico'?'#ffe844':'#c0aaff';const bCol=p.isP1?'#5ab0ff':'#ff6b5a';
  el.innerHTML=`<div class="pn">${isR?'':`${p.icon} `}${p.name}${isR?` ${p.icon}`:''}</div><div class="hb"><div class="hf" id="${id}_hp" style="width:100%;background:linear-gradient(90deg,${p.color}88,${p.color})"></div></div><div class="bb"><div class="bf" id="${id}_bhp" style="width:100%;background:linear-gradient(90deg,${bCol}55,${bCol}cc)"></div></div><div class="rl2" id="${id}_blbl" style="color:${bCol}aa">🏠 Base: ${BHP}/${BHP}</div>${hasRes?`<div class="rb2" style="border-color:${rCol}44"><div class="rf2" id="${id}_res" style="width:0%;background:${rCol}"></div></div><div class="rl2" id="${id}_rlbl"></div>`:''}<div class="skr" id="${id}_sk"></div><div class="bi" id="${id}_bush">🌿 Oculto</div>`;
  const sr=document.getElementById(`${id}_sk`);
  def.skills.forEach((sk,i)=>{const kl=(kkeys[i]||'').toUpperCase();const d=document.createElement('div');d.className='sk';d.id=`${id}_sk${i}`;d.style.background=sk.col+'22';d.style.borderColor=sk.col+'66';d.innerHTML=`<span style="font-size:11px">${sk.e}</span><span class="skk">${kl}</span>`;sr.appendChild(d);});
}
function updHUD(){
  if(!p1||!p2||!base1||!base2)return;const h=id=>document.getElementById(id);
  h('h1_hp').style.width=(p1.hp/p1.maxHp*100)+'%';h('h2_hp').style.width=(p2.hp/p2.maxHp*100)+'%';
  h('h1_bhp').style.width=(base1.hp/BHP*100)+'%';h('h2_bhp').style.width=(base2.hp/BHP*100)+'%';
  h('h1_blbl').textContent='🏠 Base: '+Math.ceil(base1.hp)+'/'+BHP;h('h2_blbl').textContent='🏠 Base: '+Math.ceil(base2.hp)+'/'+BHP;
  const b1=h('h1_bush');const b2=h('h2_bush');if(b1)b1.style.display=inBush(p1)?'block':'none';if(b2)b2.style.display=inBush(p2)?'block':'none';
  [[p1,'h1'],[p2,'h2']].forEach(([p,hid])=>{
    if(p.ck==='cuchillas'){const e=h(hid+'_res');const l=h(hid+'_rlbl');if(e)e.style.width=(myBl(p)/MAXBL*100)+'%';if(l)l.textContent='🔪 '+myBl(p)+'/'+MAXBL;}
    else if(p.ck==='electrico'){const e=h(hid+'_res');const l=h(hid+'_rlbl');if(e)e.style.width=(p.charges/5*100)+'%';if(l)l.textContent='⚡ '+p.charges+'/5';}
    CHARS[p.ck].skills.forEach((_,i)=>{const el=h(`${hid}_sk${i}`);if(!el)return;const t=[p.q_t,p.w_t,p.e_t][i];if(t>0){el.classList.add('cd');let ct=el.querySelector('.skcd');if(!ct){ct=document.createElement('span');ct.className='skcd';el.appendChild(ct);}ct.textContent=Math.ceil(t/60)+'s';}else{el.classList.remove('cd');const ct=el.querySelector('.skcd');if(ct)ct.remove();}});
  });
}

// ── GAME LOOP ────────────────────────────────────────────
function gameLoop(){
  if(!running)return;animId=requestAnimationFrame(gameLoop);
  let sx=0,sy=0;if(shake.d>0){sx=(Math.random()-.5)*shake.x;sy=(Math.random()-.5)*shake.y;shake.d--;shake.x*=.84;shake.y*=.84;}
  ctx.save();ctx.translate(sx,sy);
  drawMap();drawBushGround();drawBase(base1);drawBase(base2);drawBlades();
  [p1,p2].forEach(p=>{if(p.dead){p.rT--;if(p.rT<=0)respawnP(p);}});
  moveP(p1,'w','s','a','d');moveP(p2,'arrowup','arrowdown','arrowleft','arrowright');
  if(p1.buffTimer>0){p1.buffTimer--;if(p1.buffTimer===0)p1.buffActive=false;}if(p2.buffTimer>0){p2.buffTimer--;if(p2.buffTimer===0)p2.buffActive=false;}
  if(p1.jumping){if(p1.jumpIsGuerrero)tickGuerreroJump(p1,p2);else tickFortaJump(p1,p2);}
  if(p2.jumping){if(p2.jumpIsGuerrero)tickGuerreroJump(p2,p1);else tickFortaJump(p2,p1);}
  if(p1.frenzying)tickVeloFrenzy(p1,p2);if(p2.frenzying)tickVeloFrenzy(p2,p1);
  if(p1.slowed>0)p1.slowed--;if(p2.slowed>0)p2.slowed--;if(p1.frozenSkills>0)p1.frozenSkills--;if(p2.frozenSkills>0)p2.frozenSkills--;
  if(!p1.dead&&!p2.dead&&!p1.jumping&&!p2.jumping){p1.facing=Math.sign(p2.cx-p1.cx)||p1.facing;p2.facing=Math.sign(p1.cx-p2.cx)||p2.facing;}
  if(p1.q_t>0)p1.q_t--;if(p1.w_t>0)p1.w_t--;if(p1.e_t>0)p1.e_t--;if(p2.q_t>0)p2.q_t--;if(p2.w_t>0)p2.w_t--;if(p2.e_t>0)p2.e_t--;
  if(p1.invincible>0)p1.invincible--;if(p2.invincible>0)p2.invincible--;
  if(p1.eT>0){p1.eT--;if(p1.eT===0)p1.energyForm=false;}if(p2.eT>0){p2.eT--;if(p2.eT===0)p2.energyForm=false;}
  // Passives
  if(p1.ck==='polar'&&!p1.dead)pPass(p1,p2);if(p2.ck==='polar'&&!p2.dead)pPass(p2,p1);
  if(p1.ck==='chili'&&!p1.dead)cPass(p1,p2);if(p2.ck==='chili'&&!p2.dead)cPass(p2,p1);
  if(p1.ck==='cuchillas'&&!p1.dead)cuPass(p1);if(p2.ck==='cuchillas'&&!p2.dead)cuPass(p2);
  if(p1.ck==='electrico')elPass(p1,p2);if(p2.ck==='electrico')elPass(p2,p1);
  if(p1.ck==='elemental'&&!p1.dead)emPass(p1,p2);if(p2.ck==='elemental'&&!p2.dead)emPass(p2,p1);
  if(p1.ck==='fortachon'&&!p1.dead)ftPass(p1,p2);if(p2.ck==='fortachon'&&!p2.dead)ftPass(p2,p1);
  if(p1.ck==='velocista'&&!p1.dead)vPass(p1);if(p2.ck==='velocista'&&!p2.dead)vPass(p2);
  if(p1.ck==='guerrero'&&!p1.dead)gPass(p1,p2);if(p2.ck==='guerrero'&&!p2.dead)gPass(p2,p1);
  if(p1.ck==='naturaleza'&&!p1.dead)natPass(p1,p2);if(p2.ck==='naturaleza'&&!p2.dead)natPass(p2,p1);
  if(p1.ck==='campos'&&!p1.dead)cfPass(p1,p2);if(p2.ck==='campos'&&!p2.dead)cfPass(p2,p1);
  // Vortex tick
  if(p1.natVortexActive)tickNatVortex(p1,p2);if(p2.natVortexActive)tickNatVortex(p2,p1);
  // Poison / burn tick (every 20 frames)
  [p1,p2].forEach(p=>{
    if(p.poisoned>0){p.poisoned--;
      if(p.poisoned%20===0&&!p.dead){dmgP(p,4,p.poisonSrc);addPt(p.cx,p.cy,p.burnT>0?'#ff6622':'#66dd44',0,-1,2,14);}
    }
    if(p.burnT>0)p.burnT--;
    // Compresión de Campos de Fuerza
    if(p.cfCompressed>0&&!p.dead){p.cfCompressed--;
      if(p.cfCompressed%18===0){
        const src=p===p1?p2:p1;
        dmgP(p,5,src);
        effects.push({x:p.cx,y:p.cy,col:'#dd88ff',t:'buff_ring',l:10,ml:10});
        addPt(p.cx,p.cy,'#aa44ff',0,0,2,14);
        if(p.cfCompressed===60)addFl(p.cx,p.cy,'💜 APLASTADO!','#dd88ff');
      }
    }
  });
  // Input
  if(!p1.dead&&!p1.jumping){['1','2','3'].forEach((k,i)=>{if(keys[k]){useSkill(p1,p2,i);keys[k]=false;}});}
  if(!p2.dead&&!p2.jumping){['i','o','p'].forEach((k,i)=>{if(keys[k]){useSkill(p2,p1,i);keys[k]=false;}});}
  for(let i=blades.length-1;i>=0;i--){blades[i].l--;if(blades[i].l<=0)blades.splice(i,1);}
  tickProjs();
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.07;p.l--;if(p.l<=0)particles.splice(i,1);}
  for(let i=effects.length-1;i>=0;i--){if(effects[i].l<=0)effects.splice(i,1);}
  for(let i=floats.length-1;i>=0;i--){floats[i].y+=floats[i].vy;floats[i].l--;if(floats[i].l<=0)floats.splice(i,1);}
  drawPts();drawFx();drawWaterRay();drawProjs();drawPenguin(p1);drawPenguin(p2);drawBushCanopy();drawFloats();updHUD();
  ctx.restore();
}
function endGame(winner){
  if(!running)return;running=false;
  document.getElementById('ro').classList.remove('hidden');
  document.getElementById('rt').textContent='🏠 '+winner.name+' destruyó la base!';
  const msgs={polar:'¡Polar arrasó!',chili:'¡Chili quemó la base!',cuchillas:'¡Las cuchillas ganaron!',electrico:'¡Voltaje triunfó!',elemental:'¡Los elementos arrasaron!',fortachon:'¡Fortachón aplastó!',velocista:'¡Demasiado rápido!',guerrero:'¡La lanza del Guerrero ganó!',naturaleza:'¡La naturaleza triunfó!',campos:'¡Los campos de fuerza ganaron!'};
  document.getElementById('rs').textContent=msgs[winner.ck]||'¡Victoria!';document.getElementById('rb').style.borderColor=winner.color+'66';
  const loser=winner===p1?p2:p1;
  document.getElementById('fstats').innerHTML=`<tr><th></th><th>Personaje</th><th>💀 K</th><th>☠️ M</th><th>⚔️ Daño</th></tr><tr><td>🏆</td><td class="pnc" style="color:${winner.color}">${winner.icon} ${winner.name}</td><td style="color:#66ff88;font-weight:700">${stats[winner===p1?'p1':'p2'].kills}</td><td>${stats[winner===p1?'p1':'p2'].deaths}</td><td style="color:#ffcc44;font-weight:700">${stats[winner===p1?'p1':'p2'].dmg}</td></tr><tr><td>💀</td><td class="pnc" style="color:${loser.color}">${loser.icon} ${loser.name}</td><td style="color:#66ff88;font-weight:700">${stats[loser===p1?'p1':'p2'].kills}</td><td>${stats[loser===p1?'p1':'p2'].deaths}</td><td style="color:#ffcc44;font-weight:700">${stats[loser===p1?'p1':'p2'].dmg}</td></tr>`;

  // Guardar resultado y recompensas en Supabase (via perfil-monedero.js)
  if(typeof saveMatchResult === 'function'){
    saveMatchResult({
      winner: winner===p1?'p1':'p2',
      p1Stats: stats.p1,
      p2Stats: stats.p2,
      modeName: '1v1_offline',
    }).then(rew=>{
      if(!rew)return;
      setTimeout(()=>{
        const rb=document.getElementById('rb');
        if(rb){const div=document.createElement('div');div.style.cssText='margin-top:12px;font-size:12px;color:rgba(255,255,255,.5)';div.innerHTML=`Recompensa: <span style="color:#5ab0ff">+${rew.pecesGan} 🐟</span> · <span style="color:#66ddff">+${rew.krillGan} 🦐</span>`;rb.appendChild(div);}
      },200);
    });
  }
}

// ── CHAR SELECT ──────────────────────────────────────────
function buildCharSel(){
  const grid=document.getElementById('cg');grid.innerHTML='';p1k=null;p2k=null;
  document.getElementById('p1s').textContent='—';document.getElementById('p2s').textContent='—';document.getElementById('fight-btn').disabled=true;
  // Sincronizar inventario
  syncOwnedChars();
  Object.entries(CHARS).forEach(([key,def])=>{
    const defData=CHARS_DEF[key];
    const owned=!defData||defData.owned;
    const card=document.createElement('div');card.className='cc2'+(owned?'':' locked');
    const pills=def.pills.map(p=>`<span class="pill2" style="background:${p.c}22;color:${p.c};border:1px solid ${p.c}44">${p.t}</span>`).join('');
    const sl=def.skills.map(s=>`${s.e} ${s.n}`).join('<br>');
    const pas=def.passive?`<br><span style="color:rgba(255,255,255,.2)">${def.passive}</span>`:'';
    const lockOverlay=owned?'':` <div style="position:absolute;inset:0;background:rgba(0,0,0,.6);border-radius:inherit;display:flex;align-items:center;justify-content:center;font-size:22px;flex-direction:column;gap:4px"><div>🔒</div><div style="font-size:10px;color:rgba(255,255,255,.5)">${CICONS[defData?.currency||'peces']} ${defData?.price||'?'}</div><button class="btn btn-p btn-sm" style="font-size:9px;margin-top:4px" onclick="event.stopPropagation();buyChar('${key}',${defData?.price||0},'${defData?.currency||'peces'}')">Comprar</button></div>`;
    card.innerHTML=`${lockOverlay}<span class="ci2">${def.icon}</span><div class="cn2" style="color:${def.color}">${def.name}</div><div class="ccls2">${def.cls}</div><div class="cpills2">${pills}</div><div class="csk2">${sl}${pas}</div>`;
    if(owned){
      card.addEventListener('click',e=>{if(e.button===2)return;document.querySelectorAll('.cc2').forEach(c=>{c.classList.remove('sp1');const b=c.querySelector('.p1b');if(b)b.remove();});card.classList.add('sp1');const b=document.createElement('div');b.className='badge2 p1b';b.style.background='#60aaff';b.textContent='P1';card.appendChild(b);p1k=key;document.getElementById('p1s').textContent=def.name;document.getElementById('p1s').style.color=def.color;chkS();});
      card.addEventListener('contextmenu',e=>{e.preventDefault();document.querySelectorAll('.cc2').forEach(c=>{c.classList.remove('sp2');const b=c.querySelector('.p2b');if(b)b.remove();});card.classList.add('sp2');const b=document.createElement('div');b.className='badge2 p2b';b.style.background='#ff8060';b.textContent='P2';card.appendChild(b);p2k=key;document.getElementById('p2s').textContent=def.name;document.getElementById('p2s').style.color=def.color;chkS();});
    }
    grid.appendChild(card);
  });
}
function chkS(){document.getElementById('fight-btn').disabled=!(p1k&&p2k);}
function startGame(){
  if(!p1k)p1k='polar';if(!p2k)p2k='guerrero';
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('game-wrap').classList.remove('hidden');
  document.getElementById('ro').classList.add('hidden');
  if(!canvas){canvas=document.getElementById('cv');canvas.width=CW;canvas.height=CH;ctx=canvas.getContext('2d');}
  if(animId)cancelAnimationFrame(animId);
  keys={};particles=[];projs=[];effects=[];floats=[];blades=[];shake={x:0,y:0,d:0};
  stats={p1:{dmg:0,kills:0,deaths:0},p2:{dmg:0,kills:0,deaths:0}};
  p1=mkP(p1k,true);p2=mkP(p2k,false);
  initBases();initBg();buildHUD();updHUD();updStats();running=true;gameLoop();
}

// Ticker
let tickPos=0;
setInterval(()=>{const el=document.getElementById('ticker-txt');if(!el)return;tickPos-=.4;if(tickPos<-el.scrollWidth)tickPos=500;el.style.transform='translateX('+tickPos+'px)';},16);

// Input
document.addEventListener('keydown',e=>{
  keys[e.key.toLowerCase()]=true;
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase()))e.preventDefault();
  if(e.key==='Escape'&&running)exitGame();
  if(e.key==='Enter'){const li=document.getElementById('login');if(li&&!li.classList.contains('hidden'))doLogin();}
});
document.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
document.addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('load',()=>{
  // auth.js maneja initAuth() via DOMContentLoaded — no llamar de nuevo aquí.
  // Solo mostrar login si auth.js no cargó en absoluto.
  if(typeof initAuth !== 'function') showLogin();

  // Reemplazar stub navTo con la versión real y ejecutar cualquier nav pendiente
  window.navTo = navTo;
  if(document._pendingNav && window.PAGES.includes(document._pendingNav)){
    const p = document._pendingNav; document._pendingNav = null; navTo(p);
  }
});