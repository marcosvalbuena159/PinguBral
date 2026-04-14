// ═══════════════════════════════════════════════════════
//  COLONIA — Sistema completo
//  Puntos de guerra: kills - muertes + asistencias
//  Tabla liga: top-10 sube · mid-10 se mantiene · bot-10 baja
// ═══════════════════════════════════════════════════════

function buildColonia() {

  // ════════════════════════════════════════════════════
  //  FÓRMULA DE PUNTOS DE GUERRA
  //  ptsBatalla = kills - deaths + assists
  // ════════════════════════════════════════════════════
  function calcWarPts(kills, deaths, assists) {
    return Math.max(0, kills - deaths + assists);
  }

  const CLAN_CREATE_COST = 500;

  // ── MI COLONIA ──────────────────────────────────────
  const myClan = {
    id: 'iceguard',
    name: 'IceGuard',
    shield: '🛡️',
    desc: 'La colonia más fría del ártico. Dominamos la tundra.',
    founder: 'PolarBrawler',
    level: 4,
    minRank: 200,
    minGames: 5,
    open: true,
    members: [
      { name:'PolarBrawler', role:'lider',     pts:1240, avatar:'🐧', online:true  },
      { name:'IceMaster99',  role:'asistente', pts:980,  avatar:'❄️', online:true  },
      { name:'FrostyPengu',  role:'asistente', pts:720,  avatar:'🧊', online:false },
      { name:'ChiliZ',       role:'miembro',   pts:610,  avatar:'🌶️', online:true  },
      { name:'VeloFast',     role:'miembro',   pts:480,  avatar:'⚡', online:false },
      { name:'ElectroB',     role:'miembro',   pts:390,  avatar:'🔥', online:false },
      { name:'GuerreroX',    role:'miembro',   pts:280,  avatar:'⚔️', online:false },
      { name: (typeof currentUser !== 'undefined' && currentUser) || 'Tú',
        role:'miembro', pts:45, avatar:'🐣', online:true, isMe:true },
    ],
  };

  // ── APORTES DE GUERRA ───────────────────────────────
  // Cada miembro acumula kills/deaths/assists de sus partidas durante la guerra.
  // ptsBatalla = kills - deaths + assists  (por miembro, acumulado)
  const warContributions = [
    { name:'PolarBrawler', avatar:'🐧', kills:38, deaths:12, assists:21, games:14, online:true  },
    { name:'IceMaster99',  avatar:'❄️', kills:31, deaths:18, assists:27, games:12, online:true  },
    { name:'FrostyPengu',  avatar:'🧊', kills:27, deaths:20, assists:15, games:10, online:false },
    { name:'ChiliZ',       avatar:'🌶️', kills:24, deaths:22, assists:18, games: 9, online:true  },
    { name:'VeloFast',     avatar:'⚡', kills:19, deaths:14, assists:12, games: 8, online:false },
    { name:'ElectroB',     avatar:'🔥', kills:16, deaths:19, assists:10, games: 7, online:false },
    { name:'GuerreroX',    avatar:'⚔️', kills:11, deaths:16, assists: 8, games: 6, online:false },
    { name: (typeof currentUser !== 'undefined' && currentUser) || 'Tú',
      avatar:'🐣', kills: 4, deaths: 3, assists: 2, games: 2, online:true, isMe:true },
  ].map(m => ({ ...m, warPts: calcWarPts(m.kills, m.deaths, m.assists) }))
   .sort((a, b) => b.warPts - a.warPts);

  const myTotalWarPts  = warContributions.reduce((s, m) => s + m.warPts, 0);
  const rivalTotalPts  = 172; // rival simulado

  // ── TABLA DE LIGA — 30 clanes, 10-10-10 ────────────
  const PROMOTION_ZONE = 10;
  const STABLE_ZONE    = 10;
  const LEAGUE_TOTAL   = 30;

  const leagueTable = [
    { name:'ArcticElite',   shield:'🦅', members:14, pts:9200 },
    { name:'BlizzardKings', shield:'🌨️', members:12, pts:8750 },
    { name:'PolarForce',    shield:'🔱', members:15, pts:8100 },
    { name:'FrostFangs',    shield:'🐺', members:11, pts:7900 },
    { name:'ColdStrike',    shield:'🌊', members:13, pts:7700 },
    { name:'IceRavens',     shield:'🦅', members:10, pts:7500 },
    { name:'SnowBlade',     shield:'🔪', members:14, pts:7300 },
    { name:'ArcticWolves',  shield:'🐺', members:12, pts:7100 },
    { name:'TundraKings',   shield:'🏔️', members:11, pts:6900 },
    { name:'FrozenEagles',  shield:'🦅', members: 9, pts:6700 },
    // zona media
    { name:'IceGuard',      shield:'🛡️', members: 8, pts:6500, isMe:true },
    { name:'FrostFang2',    shield:'🐺', members:11, pts:6300 },
    { name:'ColdBlood',     shield:'🩸', members:10, pts:6100 },
    { name:'SnowFury',      shield:'❄️', members: 9, pts:5900 },
    { name:'IceClaw',       shield:'🦀', members:13, pts:5700 },
    { name:'WinterGuard',   shield:'🛡️', members:12, pts:5500 },
    { name:'FrostByte',     shield:'🔵', members: 8, pts:5300 },
    { name:'ArcticSeal',    shield:'🦭', members:10, pts:5100 },
    { name:'NorthPeak',     shield:'🏔️', members:11, pts:4900 },
    { name:'IceBreaker',    shield:'⛏️', members: 9, pts:4700 },
    // zona descenso
    { name:'TundraGuard',   shield:'🪨', members:13, pts:4500 },
    { name:'IceCrawlers',   shield:'🦀', members: 7, pts:4300 },
    { name:'FrozenPaws',    shield:'🐾', members: 8, pts:4100 },
    { name:'ChillBirds',    shield:'🐦', members: 6, pts:3900 },
    { name:'SnowDrift',     shield:'🌬️', members: 9, pts:3700 },
    { name:'PolarBears',    shield:'🐻', members:11, pts:3500 },
    { name:'IceMice',       shield:'🐭', members: 5, pts:3300 },
    { name:'FrostBugs',     shield:'🪲', members: 6, pts:3100 },
    { name:'SlushPengu',    shield:'🐧', members: 4, pts:2900 },
    { name:'IceDust',       shield:'💨', members: 3, pts:2700 },
  ].map((c, i) => {
    const pos = i + 1;
    const zone  = pos <= PROMOTION_ZONE ? 'promotion'
                : pos <= PROMOTION_ZONE + STABLE_ZONE ? 'stable'
                : 'relegation';
    const trend = zone === 'promotion' ? '▲' : zone === 'stable' ? '─' : '▼';
    return { ...c, pos, zone, trend };
  });

  // Búsqueda de colonias
  const searchResults = [
    { name:'ArcticElite',  shield:'🦅', level:6, members:14, maxMembers:15, open:true,  desc:'Top de la liga. Requerimos 1000+ pts.' },
    { name:'BlizzardKings',shield:'🌨️', level:5, members:12, maxMembers:15, open:true,  desc:'Clan competitivo y activo.' },
    { name:'SnowFury',     shield:'❄️', level:4, members: 9, maxMembers:15, open:true,  desc:'Amigables, todos bienvenidos.' },
    { name:'TundraGuard',  shield:'🪨', level:3, members:13, maxMembers:15, open:false, desc:'Inscripción cerrada por ahora.' },
  ];

  // ── ESTADO ──────────────────────────────────────────
  const S = {
    inClan: true,
    rightTab: 'batalla',
    selectedShield: myClan.shield,
    myRole: 'miembro',
  };

  const me = myClan.members.find(m => m.isMe);
  if (me) S.myRole = me.role;

  // ════════════════════════════════════════════════════
  //  RENDER PRINCIPAL
  // ════════════════════════════════════════════════════
  const page = document.getElementById('page-colonia');
  if (!page) return;

  page.innerHTML = `
    <div class="col-header page-header">
      <div>
        <div class="page-title">🐧 Colonia</div>
        <div class="page-sub">Tu grupo de pingüinos · Compite en conjunto</div>
      </div>
    </div>
    <div class="col-body" id="col-body"></div>
  `;

  render();

  function render() {
    const body = document.getElementById('col-body');
    if (!body) return;
    if (!S.inClan) { renderNoClan(body); return; }
    body.innerHTML = `
      <div class="col-panel col-panel-left" id="clan-left-col"></div>
      <div class="col-divider"></div>
      <div class="col-panel col-panel-right" id="clan-right-col"></div>
    `;
    renderLeftCol();
    renderRightCol();
  }

  // ════════════════════════════════════════════════════
  //  COLUMNA IZQUIERDA
  // ════════════════════════════════════════════════════
  function renderLeftCol() {
    const col = document.getElementById('clan-left-col');
    if (!col) return;
    const isLider     = S.myRole === 'lider';
    const isAsistente = S.myRole === 'asistente' || isLider;

    col.innerHTML = `
      <div class="cpanel-title">
        <div class="cpt-icon cpt-blue">🛡️</div>
        Mi Colonia
      </div>

      <div class="clan-hero-card">
        <div class="clan-hero-top">
          <div class="clan-shield" onclick="${isLider ? 'openManage()' : ''}">
            ${myClan.shield}
            ${isLider ? '<div class="clan-shield-edit">✏️</div>' : ''}
          </div>
          <div class="clan-meta">
            <div class="clan-name-row">
              <div class="clan-name">${myClan.name}</div>
              <div class="clan-level-badge">Nv.${myClan.level}</div>
            </div>
            <div class="clan-desc">${myClan.desc}</div>
            <div class="clan-founder">Fundado por ${myClan.founder}</div>
          </div>
        </div>
        <div class="clan-stats-row">
          <div class="clan-stat"><div class="cs-val">${myClan.members.length}/15</div><div class="cs-lab">Miembros</div></div>
          <div class="clan-stat"><div class="cs-val">${myTotalWarPts}</div><div class="cs-lab">Pts Guerra</div></div>
          <div class="clan-stat"><div class="cs-val">#11</div><div class="cs-lab">Liga</div></div>
          <div class="clan-stat"><div class="cs-val">Estable</div><div class="cs-lab">Estado</div></div>
        </div>
        <div class="clan-req-row">
          <div class="req-chip">🏆 Mín. <span>${myClan.minRank} pts</span></div>
          <div class="req-chip">🎮 Mín. <span>${myClan.minGames} partidas</span></div>
          <div class="req-chip">${myClan.open ? '🟢 Abierta' : '🔴 Cerrada'}</div>
        </div>
        <div class="clan-actions">
          ${isLider     ? `<button class="btn-clan btn-clan-gold" onclick="openManage()">⚙️ Gestionar</button>` : ''}
          ${isAsistente ? `<button class="btn-clan btn-clan-blue" onclick="openManage()">👥 Miembros</button>` : ''}
          <button class="btn-clan btn-clan-red" onclick="confirmLeave()">🚪 Salir</button>
        </div>
      </div>

      <div class="cpanel-title" style="margin-bottom:8px">
        <div class="cpt-icon cpt-blue">👥</div>
        Miembros · ${myClan.members.length}/15
      </div>

      <div class="clan-members-wrap">
        <div class="cm-header">
          <div>#</div><div>Jugador</div><div>Rol</div><div style="text-align:right">Pts</div><div></div>
        </div>
        <div id="members-list-body"></div>
      </div>

      <div class="manage-overlay" id="manage-overlay" style="display:none">
        <div class="manage-modal" id="manage-modal"></div>
      </div>
    `;

    renderMembersList();
  }

  function renderMembersList() {
    const body = document.getElementById('members-list-body');
    if (!body) return;
    body.innerHTML = '';
    const sorted      = [...myClan.members].sort((a,b) => b.pts - a.pts);
    const isLider     = S.myRole === 'lider';
    const isAsistente = S.myRole === 'asistente' || isLider;

    sorted.forEach((m, i) => {
      const pos      = i + 1;
      const posClass = pos===1?'top1':pos===2?'top2':pos===3?'top3':'';
      const posLabel = pos===1?'🥇':pos===2?'🥈':pos===3?'🥉':pos;
      const roleName = {lider:'Líder',asistente:'Asistente',miembro:'Miembro'}[m.role];
      const roleCls  = {lider:'role-lider',asistente:'role-asistente',miembro:'role-miembro'}[m.role];
      const canManage= (isLider&&!m.isMe)||(isAsistente&&m.role==='miembro'&&!m.isMe);
      const row = document.createElement('div');
      row.className = 'cm-row'+(m.isMe?' cm-me':'');
      row.innerHTML = `
        <div class="cm-pos ${posClass}">${posLabel}</div>
        <div class="cm-identity">
          <div class="cm-avatar${m.isMe?' av-me':''}">${m.avatar}</div>
          <div>
            <div class="cm-uname${m.isMe?' me-label':''}">${m.name}${m.isMe?' (Tú)':''}</div>
            <div style="font-size:8px;color:${m.online?'#44ff88':'rgba(255,255,255,.2)'}">
              ${m.online?'● En línea':'○ Desconectado'}
            </div>
          </div>
        </div>
        <div><span class="cm-role-badge ${roleCls}">${roleName}</span></div>
        <div class="cm-pts">${m.pts.toLocaleString()}</div>
        <div class="cm-actions">
          ${canManage?`<button class="cm-action-btn" onclick="openMemberMenu()">···</button>`:''}
        </div>
      `;
      body.appendChild(row);
    });
  }

  // ════════════════════════════════════════════════════
  //  COLUMNA DERECHA
  // ════════════════════════════════════════════════════
  function renderRightCol() {
    const col = document.getElementById('clan-right-col');
    if (!col) return;
    col.innerHTML = `
      <div class="col-right-tabs">
        <div class="col-rtab${S.rightTab==='batalla'?' active':''}" onclick="setRightTab('batalla')">⚔️ Batalla</div>
        <div class="col-rtab${S.rightTab==='tabla'  ?' active':''}" onclick="setRightTab('tabla')">📊 Tabla Liga</div>
      </div>
      <div id="right-tab-content" style="flex:1;display:flex;flex-direction:column;overflow:hidden;"></div>
    `;
    if (S.rightTab === 'batalla') renderBatalla();
    else renderTabla();
  }

  // ── BATALLA + APORTES ───────────────────────────────
  function renderBatalla() {
    const wrap    = document.getElementById('right-tab-content');
    if (!wrap) return;
    const winning = myTotalWarPts >= rivalTotalPts;
    const total   = myTotalWarPts + rivalTotalPts;

    // Totales del clan para las barras
    const myK  = warContributions.reduce((s,m)=>s+m.kills,0);
    const myD  = warContributions.reduce((s,m)=>s+m.deaths,0);
    const myA  = warContributions.reduce((s,m)=>s+m.assists,0);
    const rivK = Math.max(0, myK - 18);
    const rivD = myD + 10;
    const rivA = Math.max(0, myA - 12);

    const statBars = [
      {label:'⚔️ Eliminaciones', mine:myK,  rival:rivK},
      {label:'💀 Muertes',        mine:myD,  rival:rivD},
      {label:'🤝 Asistencias',    mine:myA,  rival:rivA},
    ].map(s => {
      const t  = s.mine + s.rival;
      const mp = t > 0 ? Math.round((s.mine/t)*100) : 50;
      return `
        <div>
          <div style="display:flex;justify-content:space-between;font-size:8px;color:rgba(255,255,255,.35);margin-bottom:3px">
            <span style="color:#7ab8ff;font-weight:700">${s.mine}</span>
            <span>${s.label}</span>
            <span style="color:#ff8888;font-weight:700">${s.rival}</span>
          </div>
          <div class="battle-bar-track">
            <div class="bbt-left"  style="width:${mp}%"></div>
            <div class="bbt-right" style="width:${100-mp}%"></div>
          </div>
        </div>`;
    }).join('');

    // ── LISTA DE APORTES (reemplaza historial) ──
    const topPts = warContributions[0]?.warPts || 1;

    const contribRows = warContributions.map((m, i) => {
      const pos      = i + 1;
      const posLabel = pos===1?'🥇':pos===2?'🥈':pos===3?'🥉':pos;
      const pct      = Math.round((m.warPts / topPts) * 100);
      const kdaColor = m.kills > m.deaths ? '#44ff88' : m.kills === m.deaths ? '#ffd080' : '#ff8888';
      const ratio    = m.deaths > 0 ? (m.kills/m.deaths).toFixed(1) : m.kills.toFixed(1);
      return `
        <div class="contrib-row${m.isMe?' contrib-me':''}">
          <div class="contrib-pos">${posLabel}</div>
          <div class="contrib-avatar">${m.avatar}</div>
          <div class="contrib-body">
            <div class="contrib-name-row">
              <span class="contrib-name${m.isMe?' contrib-name-me':''}">${m.name}${m.isMe?' (Tú)':''}</span>
              <span class="contrib-kda">
                <span style="color:#7ab8ff">${m.kills}K</span>
                <span style="color:rgba(255,255,255,.25)">·</span>
                <span style="color:#ff8888">${m.deaths}M</span>
                <span style="color:rgba(255,255,255,.25)">·</span>
                <span style="color:#44ffaa">${m.assists}A</span>
                <span class="contrib-ratio" style="color:${kdaColor}">${ratio} KD</span>
              </span>
            </div>
            <div class="contrib-bar-wrap">
              <div class="contrib-bar-track">
                <div class="contrib-bar-fill" style="width:${pct}%"></div>
              </div>
              <span class="contrib-pts-label" style="color:${m.warPts>0?'#44ff88':'#ffd080'}">+${m.warPts} pts</span>
            </div>
            <div class="contrib-games">${m.games} partida${m.games!==1?'s':''} · ${m.kills}K−${m.deaths}M+${m.assists}A = ${m.warPts}</div>
          </div>
        </div>`;
    }).join('');

    wrap.innerHTML = `
      <div class="cpanel-title" style="flex-shrink:0">
        <div class="cpt-icon cpt-gold">⚔️</div>
        Batalla Activa · Nv.${myClan.level}
      </div>

      <div class="battle-card" style="flex-shrink:0">
        <div class="battle-banner">
          <div class="battle-clan-side">
            <div class="battle-shield">${myClan.shield}</div>
            <div class="battle-clan-name">${myClan.name}</div>
            <div class="battle-pts" style="color:${winning?'#44ff88':'#fff'}">${myTotalWarPts}</div>
          </div>
          <div class="battle-vs">
            <div class="vs-text">VS</div>
            <div class="battle-timer">⏰ 1d 14h</div>
          </div>
          <div class="battle-clan-side right">
            <div class="battle-shield">🐺</div>
            <div class="battle-clan-name">FrostFangs</div>
            <div class="battle-pts" style="color:${!winning?'#ff8888':'rgba(255,255,255,.6)'}">${rivalTotalPts}</div>
          </div>
        </div>
        <div class="battle-bars">
          ${statBars}
          <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:2px">
            <span style="font-size:8px;color:rgba(255,255,255,.22)">Puntos por partida:</span>
            <span class="war-formula-badge">⚔️ K − 💀 M + 🤝 A</span>
          </div>
          <div class="battle-phase-badge">
            <span class="bpb-live">⚔️ En curso — termina en 1d 14h</span>
          </div>
        </div>
      </div>

      <!-- APORTES DE GUERRA -->
      <div class="cpanel-title" style="flex-shrink:0;margin-top:6px">
        <div class="cpt-icon cpt-blue">📊</div>
        Aportes a la Guerra
        <span style="margin-left:auto;font-size:8px;color:rgba(255,255,255,.3);font-family:'Nunito',sans-serif;font-weight:400">Total colonia: ${myTotalWarPts} pts</span>
      </div>
      <div style="font-size:8px;color:rgba(255,255,255,.22);margin-bottom:7px;flex-shrink:0">
        Puntos = Kills − Muertes + Asistencias (acumulado en la guerra)
      </div>
      <div style="flex:1;overflow-y:auto;padding-right:3px">
        ${contribRows}
      </div>
    `;
  }

  // ── TABLA DE LIGA ─────────────────────────────────
  function renderTabla() {
    const wrap = document.getElementById('right-tab-content');
    if (!wrap) return;

    let html = '';
    leagueTable.forEach((c, i) => {
      // Separador de zona
      if (c.pos === PROMOTION_ZONE + 1) {
        html += `<div class="league-zone-sep">
          <div class="lzs-line"></div>
          <div class="lzs-label" style="color:rgba(255,255,255,.35)">Puestos ${PROMOTION_ZONE+1}–${PROMOTION_ZONE+STABLE_ZONE} · Se mantienen</div>
          <div class="lzs-line"></div>
        </div>`;
      }
      if (c.pos === PROMOTION_ZONE + STABLE_ZONE + 1) {
        html += `<div class="league-zone-sep">
          <div class="lzs-line"></div>
          <div class="lzs-label" style="color:#ff8888">Puestos ${PROMOTION_ZONE+STABLE_ZONE+1}–${LEAGUE_TOTAL} · Descienden</div>
          <div class="lzs-line"></div>
        </div>`;
      }

      const posClass = c.pos===1?'top1':c.pos===2?'top2':c.pos===3?'top3':'';
      const posLabel = c.pos===1?'🥇':c.pos===2?'🥈':c.pos===3?'🥉':c.pos;
      const trendCol = c.zone==='promotion'?'#44ff88':c.zone==='relegation'?'#ff8888':'rgba(255,255,255,.3)';
      const rowCls   = ['ct-row', c.isMe?'ct-me':'', c.zone==='promotion'?'ct-promotion':'', c.zone==='relegation'?'ct-relegation':'']
                       .filter(Boolean).join(' ');

      html += `
        <div class="${rowCls}" style="animation-delay:${i*0.015}s">
          <div class="ct-pos-num ${posClass}">${posLabel}</div>
          <div class="ct-identity">
            <div class="ct-shield">${c.shield}</div>
            <div class="ct-name">${c.name}${c.isMe?' (Tú)':''}</div>
          </div>
          <div class="ct-members">${c.members}/15</div>
          <div class="ct-pts">${c.pts.toLocaleString()}</div>
          <div class="ct-trend" style="color:${trendCol};font-size:13px">${c.trend}</div>
        </div>`;
    });

    wrap.innerHTML = `
      <div class="clan-league-header" style="flex-shrink:0">
        <div class="cpanel-title" style="margin-bottom:0">
          <div class="cpt-icon cpt-gold">🏆</div>
          Liga · Nivel ${myClan.level} · ${LEAGUE_TOTAL} colonias
        </div>
        <div class="clan-league-badge">🥇 Oro Nivel ${myClan.level}</div>
      </div>

      <!-- Resumen de zonas -->
      <div class="league-zones-summary" style="flex-shrink:0">
        <div class="lzs-chip" style="background:rgba(68,255,136,.08);border-color:rgba(68,255,136,.22);color:#44ff88">
          ▲ Top ${PROMOTION_ZONE} — Ascienden de liga
        </div>
        <div class="lzs-chip" style="background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);color:rgba(255,255,255,.4)">
          ─ Puestos ${PROMOTION_ZONE+1}–${PROMOTION_ZONE+STABLE_ZONE} — Se mantienen
        </div>
        <div class="lzs-chip" style="background:rgba(255,80,80,.08);border-color:rgba(255,80,80,.22);color:#ff8888">
          ▼ Últimos ${LEAGUE_TOTAL-PROMOTION_ZONE-STABLE_ZONE} — Descienden de liga
        </div>
      </div>

      <!-- Header columnas -->
      <div class="ct-header-row" style="flex-shrink:0">
        <div style="text-align:center">#</div>
        <div>Colonia</div>
        <div style="text-align:center">👥</div>
        <div style="text-align:right">Puntos</div>
        <div style="text-align:center">Tend.</div>
      </div>

      <!-- Etiqueta zona ascenso -->
      <div class="league-zone-sep" style="flex-shrink:0;margin-bottom:2px">
        <div class="lzs-line"></div>
        <div class="lzs-label" style="color:#44ff88">Top ${PROMOTION_ZONE} · Ascienden</div>
        <div class="lzs-line"></div>
      </div>

      <div class="clan-table-scroll">${html}</div>
    `;
  }

  // ════════════════════════════════════════════════════
  //  SIN COLONIA
  // ════════════════════════════════════════════════════
  function renderNoClan(body) {
    const shields = ['🛡️','🐧','❄️','🔱','🦅','🌨️','⚔️','🏔️','🪨','🌊','⭐','🔥'];
    body.innerHTML = `
      <div style="flex:1;display:flex;flex-direction:column;overflow-y:auto;align-items:center;padding:20px 0">
        <div class="no-clan-icon">🐧</div>
        <div class="no-clan-title">No estás en ninguna Colonia</div>
        <div class="no-clan-sub">Únete a una colonia para batallar en equipo, ganar recompensas exclusivas y subir en la tabla de ligas.</div>
        <div class="no-clan-btns">
          <button class="btn btn-s" onclick="toggleSearchPanel()">🔍 Buscar Colonia</button>
          <button class="btn btn-gold btn-sm" onclick="toggleCreatePanel()">➕ Crear Colonia</button>
        </div>
        <div id="search-panel" style="display:none;width:100%;max-width:440px;margin-top:14px">
          <div class="clan-search-box">
            <div style="font-family:'Fredoka One',cursive;font-size:13px;color:#fff;margin-bottom:10px">🔍 Buscar Colonia</div>
            <input class="clan-search-input" placeholder="Nombre de la colonia..." oninput="filterClans(this.value)">
            <div id="search-results"></div>
          </div>
        </div>
        <div id="create-panel" style="display:none;width:100%;max-width:440px;margin-top:14px">
          <div class="create-clan-form">
            <div style="font-family:'Fredoka One',cursive;font-size:13px;color:#fff;margin-bottom:4px">➕ Crear Colonia</div>
            <div><div class="ccf-label">Nombre</div><input class="ccf-input" id="new-clan-name" placeholder="Nombre de tu colonia" maxlength="20"></div>
            <div><div class="ccf-label">Escudo</div>
              <div class="shield-picker" id="shield-picker-create">
                ${shields.map(s=>`<div class="sp-opt${s==='🛡️'?' selected':''}" data-sh="${s}" onclick="selectShieldCreate('${s}')">${s}</div>`).join('')}
              </div>
            </div>
            <div><div class="ccf-label">Descripción</div><input class="ccf-input" id="new-clan-desc" placeholder="Describe tu colonia..." maxlength="80"></div>
            <div class="ccf-cost"><span>Costo de creación:</span><strong>🪨 ${CLAN_CREATE_COST} Piedras</strong></div>
            <button class="btn btn-gold" style="font-size:13px;padding:9px 0;width:100%" onclick="doCreateClan()">🐧 Crear Colonia</button>
          </div>
        </div>
      </div>
    `;
    filterClans('');
  }

  // ════════════════════════════════════════════════════
  //  MODAL GESTIÓN
  // ════════════════════════════════════════════════════
  function renderManageModal() {
    const modal   = document.getElementById('manage-modal');
    if (!modal) return;
    const shields = ['🛡️','🐧','❄️','🔱','🦅','🌨️','⚔️','🏔️','🪨','🌊','⭐','🔥'];
    const isLider = S.myRole === 'lider';
    modal.innerHTML = `
      <div class="mm-title">⚙️ Gestionar Colonia<div class="mm-close" onclick="closeManage()">✕</div></div>
      ${isLider ? `
        <div class="mm-section"><div class="mm-label">Nombre</div><input class="mm-input" id="mm-name" value="${myClan.name}" maxlength="20"></div>
        <div class="mm-section"><div class="mm-label">Escudo</div>
          <div class="shield-picker" id="shield-picker-manage">
            ${shields.map(s=>`<div class="sp-opt${s===S.selectedShield?' selected':''}" data-sh="${s}" onclick="selectShieldManage('${s}')">${s}</div>`).join('')}
          </div>
        </div>
        <div class="mm-section"><div class="mm-label">Descripción</div><input class="mm-input" id="mm-desc" value="${myClan.desc}" maxlength="80"></div>
        <div class="mm-section"><div class="mm-label">Pts mínimos para unirse</div><input class="mm-input" id="mm-minrank" type="number" value="${myClan.minRank}" min="0" max="9999"></div>
        <div class="mm-section"><div class="mm-label">Partidas mínimas</div><input class="mm-input" id="mm-mingames" type="number" value="${myClan.minGames}" min="0" max="999"></div>
        <div class="mm-section"><div class="mm-label">Inscripción</div>
          <select class="mm-select" id="mm-open">
            <option value="1" ${myClan.open?'selected':''}>🟢 Abierta</option>
            <option value="0" ${!myClan.open?'selected':''}>🔴 Cerrada</option>
          </select>
        </div>
        <button class="btn btn-gold" style="width:100%;font-size:13px;padding:9px 0;margin-bottom:12px" onclick="saveManage()">💾 Guardar Cambios</button>
      ` : ''}
      <div class="mm-section"><div class="mm-label">Miembros</div><div id="mm-members-list"></div></div>
      ${isLider ? `<div class="mm-danger"><div class="mm-danger-title">⚠️ Zona de peligro</div>
        <button class="btn-clan btn-clan-red" style="width:100%;justify-content:center" onclick="dissolveConfirm()">💀 Disolver Colonia</button>
      </div>` : ''}
    `;
    renderModalMembers();
  }

  function renderModalMembers() {
    const list = document.getElementById('mm-members-list');
    if (!list) return;
    list.innerHTML = '';
    const isLider = S.myRole === 'lider';
    const sorted  = [...myClan.members].sort((a,b)=>({lider:0,asistente:1,miembro:2}[a.role]-{lider:0,asistente:1,miembro:2}[b.role]));
    sorted.forEach(m => {
      const roleName = {lider:'Líder',asistente:'Asistente',miembro:'Miembro'}[m.role];
      const roleCls  = {lider:'role-lider',asistente:'role-asistente',miembro:'role-miembro'}[m.role];
      const canEdit  = isLider && !m.isMe;
      const canKick  = (S.myRole==='lider'&&!m.isMe)||(S.myRole==='asistente'&&m.role==='miembro'&&!m.isMe);
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.04)';
      row.innerHTML = `
        <div style="font-size:16px;flex-shrink:0">${m.avatar}</div>
        <div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:700;color:${m.isMe?'#7ab8ff':'#fff'}">${m.name}${m.isMe?' (Tú)':''}</div></div>
        ${canEdit?`<select class="mm-select" style="width:110px;font-size:9px;padding:4px 8px" onchange="changeRole('${m.name}',this.value)">
          <option value="lider"     ${m.role==='lider'    ?'selected':''}>👑 Líder</option>
          <option value="asistente" ${m.role==='asistente'?'selected':''}>⭐ Asistente</option>
          <option value="miembro"   ${m.role==='miembro'  ?'selected':''}>🐧 Miembro</option>
        </select>`:`<span class="cm-role-badge ${roleCls}" style="font-size:8px">${roleName}</span>`}
        ${canKick?`<button class="cm-action-btn" style="color:rgba(255,100,100,.6)" onclick="kickMember('${m.name}')">✕</button>`:''}
      `;
      list.appendChild(row);
    });
  }

  // ════════════════════════════════════════════════════
  //  FUNCIONES GLOBALES
  // ════════════════════════════════════════════════════
  window.setRightTab = t => { S.rightTab=t; renderRightCol(); };
  window.openManage  = () => { const o=document.getElementById('manage-overlay'); if(o)o.style.display='flex'; renderManageModal(); };
  window.closeManage = () => { const o=document.getElementById('manage-overlay'); if(o)o.style.display='none'; };

  window.saveManage = function() {
    const g = id => document.getElementById(id);
    if(g('mm-name')?.value.trim())  myClan.name    = g('mm-name').value.trim();
    if(g('mm-desc'))                myClan.desc    = g('mm-desc').value.trim();
    if(g('mm-minrank'))             myClan.minRank  = parseInt(g('mm-minrank').value)||0;
    if(g('mm-mingames'))            myClan.minGames = parseInt(g('mm-mingames').value)||0;
    if(g('mm-open'))                myClan.open     = g('mm-open').value==='1';
    myClan.shield = S.selectedShield;
    closeManage(); render();
    if(typeof showToast==='function') showToast('✅ Colonia actualizada','#44ff88');
  };

  window.selectShieldManage = sh => {
    S.selectedShield=sh;
    document.querySelectorAll('#shield-picker-manage .sp-opt').forEach(el=>el.classList.toggle('selected',el.dataset.sh===sh));
  };
  window.selectShieldCreate = sh => {
    document.querySelectorAll('#shield-picker-create .sp-opt').forEach(el=>el.classList.toggle('selected',el.dataset.sh===sh));
    window._selectedCreateShield=sh;
  };
  window.changeRole = function(name,newRole) {
    const m=myClan.members.find(x=>x.name===name); if(!m)return;
    if(newRole==='lider'){const c=myClan.members.find(x=>x.role==='lider');if(c)c.role='asistente';S.myRole='asistente';}
    m.role=newRole; renderModalMembers(); renderMembersList();
    if(typeof showToast==='function') showToast('✅ Rol actualizado','#7ab8ff');
  };
  window.kickMember = function(name) {
    const idx=myClan.members.findIndex(x=>x.name===name); if(idx===-1)return;
    myClan.members.splice(idx,1); renderModalMembers(); renderMembersList();
    if(typeof showToast==='function') showToast('🚪 '+name+' fue expulsado','#ffaa44');
  };
  window.openMemberMenu = () => openManage();
  window.confirmLeave  = () => { if(!confirm('¿Seguro que quieres salir de la colonia?'))return; S.inClan=false; render(); if(typeof showToast==='function')showToast('🚪 Saliste de la colonia','#ffaa44'); };
  window.dissolveConfirm = () => { if(!confirm('⚠️ ¿Seguro que quieres DISOLVER la colonia?'))return; closeManage(); S.inClan=false; render(); if(typeof showToast==='function')showToast('💀 Colonia disuelta','#ff4444'); };
  window.toggleSearchPanel = () => { const p=document.getElementById('search-panel'),c=document.getElementById('create-panel'); if(!p)return; const v=p.style.display!=='none'; p.style.display=v?'none':'block'; if(c)c.style.display='none'; if(!v)filterClans(''); };
  window.toggleCreatePanel = () => { const p=document.getElementById('create-panel'),s=document.getElementById('search-panel'); if(!p)return; p.style.display=p.style.display!=='none'?'none':'block'; if(s)s.style.display='none'; };
  window.filterClans = function(query) {
    const container=document.getElementById('search-results'); if(!container)return;
    const q=query.toLowerCase();
    const filtered=searchResults.filter(c=>c.name.toLowerCase().includes(q));
    if(!filtered.length){container.innerHTML='<div style="font-size:10px;color:rgba(255,255,255,.25);text-align:center;padding:12px">Sin resultados</div>';return;}
    container.innerHTML=filtered.map(c=>`
      <div class="clan-search-result">
        <div class="csr-icon">${c.shield}</div>
        <div class="csr-info">
          <div class="csr-name">${c.name} <span style="font-size:8px;color:rgba(255,200,80,.6)">Nv.${c.level}</span></div>
          <div class="csr-meta">${c.members}/${c.maxMembers} miembros · ${c.open?'🟢 Abierta':'🔴 Cerrada'}</div>
          <div class="csr-meta" style="color:rgba(255,255,255,.22)">${c.desc}</div>
        </div>
        ${c.open?`<div class="csr-join" onclick="joinClan('${c.name}')">Unirse</div>`:'<div style="font-size:9px;color:rgba(255,100,100,.4)">Cerrada</div>'}
      </div>`).join('');
  };
  window.joinClan = name => { S.inClan=true; render(); if(typeof showToast==='function')showToast('🐧 ¡Te uniste a '+name+'!','#44ff88'); };
  window.doCreateClan = function() {
    const nameEl=document.getElementById('new-clan-name'),descEl=document.getElementById('new-clan-desc');
    const name=nameEl?.value.trim(); if(!name){if(typeof showToast==='function')showToast('⚠️ Escribe un nombre','#ffaa44');return;}
    try{const u=getCurrUser();if(u){if(u.piedras<CLAN_CREATE_COST){if(typeof showToast==='function')showToast('❌ Necesitas 🪨 '+CLAN_CREATE_COST+' Piedras','#ff4444');return;}u.piedras-=CLAN_CREATE_COST;saveCurrUser(u);updateTopbarCurrencies();}}catch(e){}
    myClan.name=name;myClan.desc=descEl?.value.trim()||'Nueva colonia en construcción.';myClan.shield=window._selectedCreateShield||'🛡️';myClan.founder=(typeof currentUser!=='undefined'&&currentUser)||'Tú';
    S.inClan=true;S.myRole='lider';if(me)me.role='lider';
    render();if(typeof showToast==='function')showToast('🎉 ¡Colonia creada! -🪨'+CLAN_CREATE_COST,'#a078ff');
  };
}