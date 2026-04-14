// ═══════════════════════════════════════════════════════
//  DOMINIO POLAR v2
//  Layout 2 columnas:
//    IZQUIERDA — rango actual + botón ver todos + panel rangos
//    DERECHA   — tabla de clasificación del rango actual
// ═══════════════════════════════════════════════════════

const RANKS = [
  { icon:'🐣', name:'Polluelo',    color:'#aabbcc', tiers:3, pts:'0–299'    },
  { icon:'🦐', name:'Recolector',  color:'#66aacc', tiers:3, pts:'300–799'  },
  { icon:'🐟', name:'Pescador',    color:'#44aadd', tiers:3, pts:'800–1499' },
  { icon:'🪨', name:'Constructor', color:'#8899aa', tiers:3, pts:'1500–2499'},
  { icon:'🛡️', name:'Guardián',   color:'#88bbdd', tiers:3, pts:'2500–3999'},
  { icon:'❄️', name:'Explorador',  color:'#aaddff', tiers:3, pts:'4000–5999'},
  { icon:'👑', name:'Emperador',   color:'#ffd080', tiers:3, pts:'6000–8999'},
  { icon:'🌌', name:'Leyenda',     color:'#cc88ff', tiers:0, pts:'9000+'    },
];

// Todos los jugadores del leaderboard — cada uno tiene rankIdx y tier
const ALL_LB_PLAYERS = [
  { pos:1,  name:'FrostKing',     rankIdx:6, tier:1, pts:6420, col:'#ffd080' },
  { pos:2,  name:'IceMaster99',   rankIdx:5, tier:3, pts:5980, col:'#aaddff' },
  { pos:3,  name:'PollarBrawler', rankIdx:5, tier:2, pts:5540, col:'#aaddff' },
  { pos:4,  name:'VeloKing',      rankIdx:4, tier:3, pts:3870, col:'#88bbdd' },
  { pos:5,  name:'ChiliMaster',   rankIdx:4, tier:2, pts:3440, col:'#88bbdd' },
  { pos:6,  name:'ElectroZ',      rankIdx:3, tier:3, pts:2490, col:'#8899aa' },
  { pos:7,  name:'GuerreroX',     rankIdx:3, tier:1, pts:1620, col:'#8899aa' },
  { pos:8,  name:'ArcticSniper',  rankIdx:2, tier:3, pts:1480, col:'#44aadd' },
  { pos:9,  name:'FrozenWave',    rankIdx:2, tier:2, pts:1210, col:'#44aadd' },
  { pos:10, name:'KrillHunter',   rankIdx:1, tier:3, pts:790,  col:'#66aacc' },
  { pos:11, name:'IceDrifter',    rankIdx:1, tier:2, pts:650,  col:'#66aacc' },
  { pos:12, name:'PolarRookie',   rankIdx:0, tier:3, pts:290,  col:'#aabbcc' },
  { pos:13, name:'ChillPengu',    rankIdx:0, tier:2, pts:180,  col:'#aabbcc' },
  { pos:14, name:'NewbieIce',     rankIdx:0, tier:1, pts:80,   col:'#aabbcc' },
  // El jugador — siempre al final de su rango
  { pos:15, name:'__ME__',        rankIdx:0, tier:2, pts:45,   col:'#aabbcc', isMe:true },
];

const MY_RANK = { rankIdx:0, tier:2, pts:45, maxPts:300 };
let rankPanelOpen = false;

// ── ENTRY POINT ────────────────────────────────────────
function buildDominio() {
  // Inyecta el HTML del layout 2 columnas en page-dominio
  // (debajo del page-header que ya está en el HTML)
  const page = document.getElementById('page-dominio');
  if (!page) return;

  // Limpia todo excepto el page-header
  const header = page.querySelector('.page-header');
  page.innerHTML = '';
  if (header) page.appendChild(header);

  // Crea el layout
  const layout = document.createElement('div');
  layout.className = 'dominio-layout';
  layout.innerHTML = `
    <!-- COLUMNA IZQUIERDA -->
    <div class="dominio-left">
      <div class="dominio-rank-card" id="my-rank-box"></div>
      <button class="dominio-rank-toggle" id="rank-info-btn" onclick="toggleRankPanel()">
        <span id="rank-btn-icon">📋</span> Ver todos los rangos
      </button>
      <div class="dominio-rank-panel" id="rank-all-panel">
        <div class="rank-grid" id="rank-grid"></div>
      </div>
    </div>
    <!-- COLUMNA DERECHA -->
    <div class="dominio-right">
      <div class="dominio-lb-header">
        <div class="dominio-lb-title">🥇 Clasificación</div>
        <div class="dominio-lb-filter-row" id="lb-filter-row"></div>
      </div>
      <div id="leaderboard-list"></div>
    </div>
  `;
  page.appendChild(layout);

  renderMyRank();
  renderRankGrid();
  renderLeaderboard(MY_RANK.rankIdx);
  buildLbFilters();
}

// ── MI RANGO ────────────────────────────────────────────
function renderMyRank() {
  const box = document.getElementById('my-rank-box');
  if (!box) return;
  const me = RANKS[MY_RANK.rankIdx];
  const tierName = me.tiers > 0 ? ['I','II','III'][MY_RANK.tier - 1] : '∞';
  const pct = Math.min(100, (MY_RANK.pts / MY_RANK.maxPts * 100)).toFixed(0);

  // Calcular posición global del jugador
  const myPlayer = ALL_LB_PLAYERS.find(p => p.isMe);
  const globalPos = myPlayer ? myPlayer.pos : '—';

  box.innerHTML = `
    <div class="mrank-season">Temporada 1 · Clasificada</div>
    <div class="mrank-icon">${me.icon}</div>
    <div class="mrank-name" style="color:${me.color}">${me.name} ${tierName}</div>
    <div class="mrank-pts">${MY_RANK.pts} <span>/ ${MY_RANK.maxPts} pts</span></div>
    <div class="mrank-bar-wrap">
      <div class="mrank-bar-fill" style="width:${pct}%;background:${me.color}"></div>
    </div>
    <div class="mrank-meta">
      <span>Posición global: <strong>#${globalPos}</strong></span>
      <span>Progreso: <strong>${pct}%</strong></span>
    </div>
    <button class="btn btn-p" style="margin-top:14px;width:100%;font-size:13px;padding:10px" onclick="navTo('modesel')">⚔️ Jugar Clasificada</button>
  `;
}

// ── PANEL TODOS LOS RANGOS ─────────────────────────────
function toggleRankPanel() {
  rankPanelOpen = !rankPanelOpen;
  const panel = document.getElementById('rank-all-panel');
  const btn   = document.getElementById('rank-info-btn');
  const icon  = document.getElementById('rank-btn-icon');
  if (!panel || !btn) return;
  panel.classList.toggle('open', rankPanelOpen);
  icon.textContent = rankPanelOpen ? '▲' : '📋';
  btn.querySelector('span').nextSibling.textContent = rankPanelOpen ? ' Ocultar rangos' : ' Ver todos los rangos';
}

function renderRankGrid() {
  const grid = document.getElementById('rank-grid');
  if (!grid) return; grid.innerHTML = '';
  RANKS.forEach((r, i) => {
    const isCurrent = i === MY_RANK.rankIdx;
    const isPast    = i < MY_RANK.rankIdx;
    const card = document.createElement('div');
    card.className = 'rank-card' + (isCurrent ? ' current-rank' : '') + (isPast ? ' past-rank' : '');
    // Tiers
    let tiersHtml = '';
    if (r.tiers > 0) {
      for (let t = 1; t <= r.tiers; t++) {
        const done = isPast || (isCurrent && t < MY_RANK.tier);
        const cur  = isCurrent && t === MY_RANK.tier;
        tiersHtml += `<div class="rtier${done?' done':''}${cur?' cur':''}"
          style="${cur?`background:${r.color};box-shadow:0 0 6px ${r.color}`:done?`background:${r.color}55`:''}"
        ></div>`;
      }
    }
    card.innerHTML = `
      <span class="r-icon">${r.icon}</span>
      <div class="r-name" style="color:${r.color}">${r.name}</div>
      <div class="r-tiers">${tiersHtml || `<span style="font-size:13px;color:${r.color}">∞</span>`}</div>
      <div class="r-pts">${r.pts}</div>
      ${isCurrent ? `<div class="r-cur-badge">Tú aquí</div>` : ''}
    `;
    grid.appendChild(card);
  });
}

// ── LEADERBOARD ────────────────────────────────────────
let currentLbFilter = MY_RANK.rankIdx; // por defecto el rango del jugador

function buildLbFilters() {
  const row = document.getElementById('lb-filter-row');
  if (!row) return;
  row.innerHTML = '';
  // Botón "Mi rango" y cada rango
  const filters = [{ label:'Mi rango', val: MY_RANK.rankIdx }, ...RANKS.map((r,i) => ({ label: r.icon, val: i, title: r.name }))];
  filters.forEach((f, fi) => {
    const btn = document.createElement('button');
    btn.className = 'lb-filt-btn' + (f.val === currentLbFilter && fi === 0 ? ' active' : '');
    btn.title = f.title || 'Mi rango';
    btn.textContent = f.label;
    btn.onclick = () => {
      document.querySelectorAll('.lb-filt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLbFilter = f.val;
      renderLeaderboard(f.val);
    };
    row.appendChild(btn);
  });
}

function renderLeaderboard(rankIdx) {
  const list = document.getElementById('leaderboard-list');
  if (!list) return; list.innerHTML = '';

  const me = RANKS[rankIdx];
  const players = ALL_LB_PLAYERS.filter(p => p.rankIdx === rankIdx);
  // Reordena por pts desc, el "yo" siempre al final si está en este rango
  players.sort((a,b) => {
    if (a.isMe && !b.isMe) return 1;
    if (!a.isMe && b.isMe) return -1;
    return b.pts - a.pts;
  });

  if (!players.length) {
    list.innerHTML = `<div class="lb-empty">Sin jugadores en ${me.name} todavía</div>`;
    return;
  }

  // Encabezado del rango
  const hdr = document.createElement('div');
  hdr.className = 'lb-rank-hdr';
  hdr.innerHTML = `<span class="lb-rank-hdr-icon">${me.icon}</span>
    <span class="lb-rank-hdr-name" style="color:${me.color}">${me.name}</span>
    <span class="lb-rank-hdr-count">${players.length} jugadores</span>`;
  list.appendChild(hdr);

  const wrap = document.createElement('div');
  wrap.className = 'lb-wrap';

  players.forEach((e, idx) => {
    const localPos = idx + 1;
    const row = document.createElement('div');
    row.className = 'lb-row' + (e.isMe ? ' lb-row-me' : '');
    const medal = localPos === 1 ? '🥇' : localPos === 2 ? '🥈' : localPos === 3 ? '🥉'
      : `<span class="lb-pos">#${localPos}</span>`;
    const userName = e.isMe ? (typeof currentUser !== 'undefined' && currentUser ? currentUser : 'Tú') : e.name;
    const tierName = RANKS[e.rankIdx].tiers > 0 ? ['I','II','III'][e.tier - 1] : '∞';
    row.innerHTML = `
      <div class="lb-medal">${medal}</div>
      <div class="lb-player-info">
        <div class="lb-player-name${e.isMe ? ' lb-me' : ''}">${userName}${e.isMe ? ' <span class="lb-you-tag">Tú</span>' : ''}</div>
        <div class="lb-player-rank">${RANKS[e.rankIdx].icon} ${RANKS[e.rankIdx].name} ${tierName}</div>
      </div>
      <div class="lb-pts" style="color:${e.col}">
        ${e.pts.toLocaleString('es')} <span class="lb-pts-label">pts</span>
      </div>
    `;
    wrap.appendChild(row);
  });
  list.appendChild(wrap);
}