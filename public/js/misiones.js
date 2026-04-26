// ══ SUPABASE — progreso real de misiones ════════════════

async function cargarProgresoMisionesDB() {
  const sb = window._sb, jug = window.PB?.jugador;
  if (!sb || !jug?.id) return null;
  try {
    const { data } = await sb
      .from('progreso_mision')
      .select('mision_id, progreso_actual, completada, misiones(nombre, tipo, recompensa_cantidad, meta, descripcion)')
      .eq('jugador_id', jug.id)
      .eq('completada', false);
    return data ?? [];
  } catch(e) { return null; }
}

// ═══════════════════════════════════════════════════════
//  MISIONES & EVENTOS
// ═══════════════════════════════════════════════════════

async function buildMisiones() {

  // ── DATOS — intentar cargar desde Supabase ──
  // Si hay misiones en DB, se mostrarán los datos reales
  // Si no, se usan los datos demo de abajo
  const dbMisiones = await cargarProgresoMisionesDB();

  // ── DATOS DEMO ──────────────────────────────────────────
  const daily = [
    { icon:'⚔️', name:'Primera Sangre',     desc:'Elimina a un enemigo en una partida',       prog:0,   max:1,     rew:80,  done:false },
    { icon:'🏠', name:'Destructor de Bases', desc:'Inflige 500 de daño a la base enemiga',     prog:340, max:500,   rew:50,  done:false },
    { icon:'🎮', name:'Jugador del Día',     desc:'Completa 2 partidas',                       prog:2,   max:2,     rew:120, done:true  },
  ];

  const season = [
    { icon:'🏆', name:'Ascenso Polar',       desc:'Sube 1 nivel de rango',                    prog:0,    max:1,     rew:300, done:false },
    { icon:'💀', name:'Cazador de la Tundra',desc:'Consigue 50 eliminaciones en total',        prog:28,   max:50,    rew:200, done:false },
    { icon:'🐧', name:'Maestro Polar',        desc:'Juega 10 partidas con Polar',              prog:6,    max:10,    rew:150, done:false },
    { icon:'⚡', name:'Poder Eléctrico',     desc:'Usa Electrochoque 20 veces',               prog:20,   max:20,    rew:180, done:true  },
    { icon:'🎯', name:'Francotirador Ártico',desc:'Inflige 10.000 de daño en total',          prog:8240, max:10000, rew:400, done:false },
  ];

  const events = [
    {
      id: 'blizzard',
      name: 'Tormenta Ártica',
      desc: 'Evento de temporada de hielo',
      icon: '🌨️',
      timeLeft: '5d 12h',
      live: true,
      gradient: 'linear-gradient(135deg, #0a2a5e 0%, #1a4a8e 50%, #0d3060 100%)',
      accentColor: '#5ab0ff',
      fillClass: 'fill-rare',
      progGeneral: 62,
      rewards: [
        { icon:'🐧', name:'Skin Polar Ártico',    type:'Skin Épica',  rarity:'epic',  prog:3,  max:5,  fillClass:'fill-epic',  badge:'badge-skin', badgeLabel:'SKIN' },
        { icon:'⭐', name:'Puntos de Experiencia',type:'+2.500 XP',   rarity:'common',prog:62, max:100,fillClass:'fill-xp',   badge:'badge-xp',   badgeLabel:'XP'   },
        { icon:'🏆', name:'Emblema de Hielo',     type:'Emblema Raro',rarity:'rare',  prog:1,  max:3,  fillClass:'fill-rare',  badge:'badge-rare', badgeLabel:'RARO' },
      ]
    },
    {
      id: 'chili',
      name: 'Festival del Fuego',
      desc: 'Domina con Chili para ganar recompensas',
      icon: '🌶️',
      timeLeft: '2d 4h',
      live: true,
      gradient: 'linear-gradient(135deg, #5e1a0a 0%, #9e3a10 50%, #6e1a05 100%)',
      accentColor: '#ff8844',
      fillClass: 'fill-xp',
      progGeneral: 35,
      rewards: [
        { icon:'🌶️', name:'Skin Chili Volcán',   type:'Skin Legendaria', rarity:'epic',  prog:1,  max:10, fillClass:'fill-epic', badge:'badge-skin', badgeLabel:'SKIN' },
        { icon:'⭐', name:'Puntos de Experiencia', type:'+1.000 XP',      rarity:'common',prog:35, max:100,fillClass:'fill-xp',  badge:'badge-xp',   badgeLabel:'XP'   },
      ]
    },
  ];

  // ── ESTADO LOCAL ──────────────────────────────────
  const state = {
    missionTab: 'daily',   // 'daily' | 'season'
    claimedMissions: new Set(),
    claimedEvents: new Set(),
  };

  // ── RENDER PRINCIPAL ──────────────────────────────
  const page = document.getElementById('page-misiones');
  if (!page) return;

  page.innerHTML = `
    <div class="mis-header page-header">
      <div>
        <div class="page-title">🎯 Misiones y Eventos</div>
        <div class="page-sub">Completa objetivos · Gana recompensas</div>
      </div>
    </div>

    <div class="mis-body">

      <!-- ══ COLUMNA MISIONES ══ -->
      <div class="mis-col" id="mis-col-missions">
        <div class="mis-col-header">
          <div class="mis-col-title missions">
            <div class="mct-icon">🎯</div>
            Misiones
          </div>
          <div class="mis-reset-badge" id="mis-reset-timer">⏰ Reinicia en 18h 42m</div>
        </div>

        <!-- Krill summary -->
        <div class="krill-summary">
          <div class="ks-icon">🦐</div>
          <div class="ks-body">
            <div class="ks-label">Krill disponible para ganar hoy</div>
            <div class="ks-amount" id="mis-krill-amount">+650 🦐</div>
            <div class="ks-sub">Completa misiones para reclamar</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="mis-tabs">
          <div class="mis-tab active-mis" id="tab-daily" onclick="switchMisTab('daily')">☀️ Diarias</div>
          <div class="mis-tab" id="tab-season" onclick="switchMisTab('season')">🏔️ Temporada</div>
        </div>

        <!-- Lista -->
        <div class="mis-list" id="mis-list"></div>
      </div>

      <!-- Divisor -->
      <div class="mis-divider"></div>

      <!-- ══ COLUMNA EVENTOS ══ -->
      <div class="mis-col" id="mis-col-events">
        <div class="mis-col-header">
          <div class="mis-col-title events">
            <div class="mct-icon">🎪</div>
            Eventos
          </div>
          <div class="mis-reset-badge">🎪 ${events.length} activos</div>
        </div>

        <!-- Lista eventos scroll -->
        <div class="mis-list" id="ev-list"></div>
      </div>
    </div>
  `;

  // Exponer switchMisTab globalmente
  window.switchMisTab = function(tab) {
    state.missionTab = tab;
    // tabs
    document.getElementById('tab-daily').className  = 'mis-tab' + (tab === 'daily'  ? ' active-mis' : '');
    document.getElementById('tab-season').className = 'mis-tab' + (tab === 'season' ? ' active-mis' : '');
    renderMissions();
  };

  // ── RENDER MISIONES ────────────────────────────────
  function renderMissions() {
    const list = state.missionTab === 'daily' ? daily : season;
    const container = document.getElementById('mis-list');
    if (!container) return;

    container.innerHTML = '';

    // Krill total disponible
    const totalKrill = list
      .filter(m => !m.done && !state.claimedMissions.has(m.name))
      .reduce((s, m) => s + m.rew, 0);
    const krillEl = document.getElementById('mis-krill-amount');
    if (krillEl) krillEl.textContent = '+' + totalKrill + ' 🦐';

    list.forEach(m => {
      const claimed = state.claimedMissions.has(m.name);
      const pct = Math.min(100, (m.prog / m.max) * 100).toFixed(1);
      const isDone = m.done || claimed;

      const card = document.createElement('div');
      card.className = 'mission-card' + (isDone ? ' mc-done' : '');

      let progressHTML = '';
      if (isDone) {
        progressHTML = `<div style="font-size:9px;color:#44ff88;margin-top:5px;display:flex;align-items:center;gap:4px">
          <span>✓</span><span>Completada</span>
        </div>`;
      } else {
        progressHTML = `
          <div class="mc-prog-wrap" style="margin-top:6px">
            <div class="mc-prog-track">
              <div class="mc-prog-fill" style="width:${pct}%"></div>
            </div>
            <div class="mc-prog-label">${m.prog.toLocaleString()}/${m.max.toLocaleString()}</div>
          </div>`;
      }

      let rewardHTML = '';
      if (isDone && !claimed) {
        rewardHTML = `
          <div class="mc-reward">
            <div class="mc-rew-pill rew-krill"><span class="rp-icon">🦐</span>+${m.rew}</div>
            <button class="btn-claim" onclick="claimMission('${m.name}', ${m.rew})">Reclamar</button>
          </div>`;
      } else if (claimed) {
        rewardHTML = `
          <div class="mc-reward">
            <div class="mc-rew-pill rew-krill" style="opacity:.45"><span class="rp-icon">🦐</span>+${m.rew}</div>
            <button class="btn-claim" disabled>✓</button>
          </div>`;
      } else {
        rewardHTML = `
          <div class="mc-reward">
            <div class="mc-rew-pill rew-krill"><span class="rp-icon">🦐</span>+${m.rew}</div>
          </div>`;
      }

      card.innerHTML = `
        <div class="mc-icon">${m.icon}</div>
        <div class="mc-body">
          <div class="mc-name">${m.name}</div>
          <div class="mc-desc">${m.desc}</div>
          ${progressHTML}
        </div>
        ${rewardHTML}
      `;

      container.appendChild(card);
    });
  }

  // ── CLAIM MISIÓN ──────────────────────────────────
  window.claimMission = async function(name, rew) {
    state.claimedMissions.add(name);

    // Dar krill via Supabase (perfil_monedero.js)
    if (typeof addCurrency === 'function') {
      await addCurrency('krill', rew, 'mision_' + name.toLowerCase().replace(/\s+/g,'_'));
    }

    if (typeof showToast === 'function') showToast('🦐 +' + rew + ' Krill reclamado!', '#44aaff');
    renderMissions();
  };

  // ── RENDER EVENTOS ────────────────────────────────
  function renderEvents() {
    const container = document.getElementById('ev-list');
    if (!container) return;
    container.innerHTML = '';

    events.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'event-card';

      const rewardsHTML = ev.rewards.map(r => {
        const pct = Math.min(100, (r.prog / r.max) * 100).toFixed(1);
        return `
          <div class="ev-rew-row">
            <div class="ev-rew-icon ${r.rarity === 'epic' ? 'rew-epic' : r.rarity === 'rare' ? 'rew-rare' : 'rew-common'}">${r.icon}</div>
            <div class="ev-rew-info">
              <div style="display:flex;align-items:center;gap:6px">
                <div class="ev-rew-name">${r.name}</div>
                <span class="ev-rew-badge ${r.badge}">${r.badgeLabel}</span>
              </div>
              <div class="ev-rew-type">${r.type}</div>
              <div class="ev-rew-prog-wrap">
                <div class="ev-rew-track">
                  <div class="ev-rew-fill ${r.fillClass}" style="width:${pct}%"></div>
                </div>
                <div class="ev-rew-label">${r.prog}/${r.max}</div>
              </div>
            </div>
          </div>`;
      }).join('');

      card.innerHTML = `
        <div class="event-banner">
          <div class="event-banner-bg" style="background:${ev.gradient}"></div>
          <div class="event-banner-content">
            <div class="event-banner-icon">${ev.icon}</div>
            <div class="event-banner-info">
              <div class="event-banner-name">${ev.name}</div>
              <div class="event-banner-time">⏰ Termina en ${ev.timeLeft} · ${ev.desc}</div>
            </div>
            ${ev.live ? '<div class="event-live-badge">● LIVE</div>' : ''}
          </div>
        </div>
        <div class="event-rewards">
          ${rewardsHTML}
        </div>
        <div class="event-prog-bar">
          <div class="event-prog-fill ${ev.fillClass}" style="width:${ev.progGeneral}%"></div>
        </div>
      `;

      container.appendChild(card);
    });
  }

  // ── INICIALIZAR ───────────────────────────────────
  renderMissions();
  renderEvents();
}