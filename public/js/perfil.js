// ═══════════════════════════════════════════════════════
//  PERFIL — conectado a Supabase via window.PB
//  Lee historial, estadísticas y reputación reales.
// ═══════════════════════════════════════════════════════

// ── Cache de datos cargados ─────────────────────────────
let _perfilHistorial = null;
let _perfilRep       = null;
let _perfilCargado   = false;

// ── Tab switcher ────────────────────────────────────────
function setProfileTab(el, tab) {
  document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  buildProfile(tab);
}

// ── Entrada principal ───────────────────────────────────
async function buildProfile(tab) {
  const area = document.getElementById('profile-area');
  if (!area) return;

  // Mostrar spinner mientras carga
  area.innerHTML = '<div style="color:rgba(255,255,255,.3);font-size:13px;padding:24px 0">Cargando...</div>';

  // Cargar datos de Supabase solo la primera vez por sesión
  if (!_perfilCargado && window.PB?.jugador?.id) {
    await _cargarDatosPerfil();
    _perfilCargado = true;
  }

  if (tab === 'stats')   _renderStats(area);
  else if (tab === 'history') _renderHistorial(area);
  else if (tab === 'edit')    _renderEditar(area);
  else if (tab === 'rep')     _renderReputacion(area);
}

// ── Cargar datos desde Supabase ─────────────────────────
async function _cargarDatosPerfil() {
  const jugadorId = window.PB.jugador.id;

  // Historial últimas 10 partidas
  try {
    const { data } = await window.sb
      .from('historial_partidas')
      .select('resultado, asesinatos, muertes, asistencias, dano_total, duracion_seg, jugada_en, modo')
      .eq('jugador_id', jugadorId)
      .order('jugada_en', { ascending: false })
      .limit(10);
    _perfilHistorial = data ?? [];
  } catch(e) { _perfilHistorial = []; }

  // Reputación
  try {
    const { data } = await window.sb
      .from('reputacion_jugador')
      .select('juego, actitud, comunicacion, total_valoraciones')
      .eq('jugador_id', jugadorId)
      .single();
    _perfilRep = data;
  } catch(e) { _perfilRep = null; }
}

// ── Resetear cache al cerrar sesión ────────────────────
function resetPerfilCache() {
  _perfilHistorial = null;
  _perfilRep       = null;
  _perfilCargado   = false;
}

// ── Renderizar pestaña Estadísticas ────────────────────
function _renderStats(area) {
  const s = window.PB?._stats ?? {};
  const u = getCurrUser() ?? {};

  const wins    = s.wins      ?? u.wins      ?? 0;
  const losses  = s.losses    ?? u.losses    ?? 0;
  const kills   = s.totalKills ?? u.totalKills ?? 0;
  const dmg     = s.totalDmg  ?? u.totalDmg  ?? 0;
  const games   = wins + losses;
  const winPct  = games > 0 ? Math.round(wins / games * 100) : 0;

  const jugador = window.PB?.jugador ?? {};
  const monedero = window.PB?.monedero ?? {};
  const ownedChars = window.PB?._ownedChars ?? ['polar', 'chili'];

  // Rango actual
  const rankPts = window.PB?._rankPts ?? 0;

  area.innerHTML = `
    <div class="stat-grid">
      <div class="stat-box"><div class="sv">${games}</div><div class="sl">Partidas</div></div>
      <div class="stat-box"><div class="sv">${wins}</div><div class="sl">Victorias</div></div>
      <div class="stat-box"><div class="sv" style="color:#66ff88">${winPct}%</div><div class="sl">% Victoria</div></div>
      <div class="stat-box"><div class="sv">${losses}</div><div class="sl">Derrotas</div></div>
      <div class="stat-box"><div class="sv">${kills}</div><div class="sl">Kills</div></div>
      <div class="stat-box"><div class="sv">${dmg.toLocaleString('es')}</div><div class="sl">Daño Total</div></div>
    </div>

    <div style="margin-top:18px;display:flex;gap:24px;flex-wrap:wrap">
      <div class="stat-box" style="min-width:110px">
        <div class="sv" style="color:#5ab0ff">${(monedero.peces??0).toLocaleString('es')}</div>
        <div class="sl">🐟 Peces</div>
      </div>
      <div class="stat-box" style="min-width:110px">
        <div class="sv" style="color:#66ddff">${(monedero.krill??0).toLocaleString('es')}</div>
        <div class="sl">🦐 Krill</div>
      </div>
      <div class="stat-box" style="min-width:110px">
        <div class="sv" style="color:#aaaaff">${(monedero.piedras??0).toLocaleString('es')}</div>
        <div class="sl">🪨 Piedras</div>
      </div>
      <div class="stat-box" style="min-width:110px">
        <div class="sv" style="color:#ffddaa">${(monedero.perlas??0).toLocaleString('es')}</div>
        <div class="sl">🦪 Perlas</div>
      </div>
    </div>

    <div style="margin-top:22px;font-size:11px;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:10px">
      Pingüinos Desbloqueados (${ownedChars.length}/${Object.keys(CHARS_DEF).length})
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;max-width:560px">
      ${Object.entries(CHARS_DEF).map(([k, d]) => {
        const isOwned = ownedChars.includes(k);
        const charData = typeof CHARS !== 'undefined' ? CHARS[k] : null;
        const icon  = charData?.icon  ?? '🐧';
        const color = charData?.color ?? '#888';
        const clsRaw = charData?.cls  ?? '';
        const cls = clsRaw.split('·')[0].trim();
        return `<div style="background:rgba(255,255,255,${isOwned?'.06':'.02'});border:1px solid ${isOwned?color+'44':'rgba(255,255,255,.08)'};border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:8px;opacity:${isOwned?1:.45}">
          <span style="font-size:22px">${icon}</span>
          <div>
            <div style="font-family:'Fredoka One',cursive;font-size:13px;color:${isOwned?color:'#888'}">${d.name ?? k}</div>
            <div style="font-size:9px;color:rgba(255,255,255,.3)">${isOwned ? cls : '🔒 ' + d.price.toLocaleString('es') + ' peces'}</div>
          </div>
        </div>`;
      }).join('')}
    </div>

    <div style="margin-top:18px;font-size:11px;color:rgba(255,255,255,.2)">
      Código de perfil: <span style="color:rgba(255,255,255,.5);font-family:monospace">#${jugador.codigo_perfil ?? '—'}</span>
      &nbsp;·&nbsp; Región: ${jugador.region ?? '—'}
      &nbsp;·&nbsp; Nivel jugador: ${jugador.nivel_jugador ?? 1}
    </div>
  `;
}

// ── Renderizar pestaña Historial ────────────────────────
function _renderHistorial(area) {
  if (!_perfilHistorial || _perfilHistorial.length === 0) {
    area.innerHTML = `
      <div style="color:rgba(255,255,255,.3);font-size:13px;padding:24px 0;text-align:center">
        Aún no tienes partidas registradas.<br>
        <span style="font-size:11px;opacity:.6">¡Juega una partida para que aparezca aquí!</span>
      </div>`;
    return;
  }

  const modoLabels = {
    '1v1_offline': '1v1 Local', 'vs_ia': 'vs IA',
    'entrenamiento': 'Entrena', '1v1_online': '1v1 Online',
    'pvp': 'PvP 4v4', 'dominio_polar': 'Dominio', 'fight': 'Fight',
  };

  area.innerHTML = '<div>' + _perfilHistorial.map(r => {
    const esVic  = r.resultado === 'victoria';
    const esEmp  = r.resultado === 'empate';
    const col    = esVic ? '#66ff88' : esEmp ? '#ffd080' : '#ff6666';
    const icon   = esVic ? '🏆' : esEmp ? '🤝' : '💀';
    const dur    = r.duracion_seg ? Math.floor(r.duracion_seg / 60) + ':' + String(r.duracion_seg % 60).padStart(2,'0') : '—';
    const hace   = _tiempoRelativo(r.jugada_en);
    const modo   = modoLabels[r.modo] ?? r.modo ?? '—';
    const kda    = `${r.asesinatos ?? 0}/${r.muertes ?? 0}/${r.asistencias ?? 0}`;
    const dmg    = (r.dano_total ?? 0).toLocaleString('es');

    return `<div class="history-row">
      <div class="hr-result" style="color:${col};min-width:80px">${icon} ${(r.resultado ?? '—').charAt(0).toUpperCase() + (r.resultado ?? '').slice(1)}</div>
      <div style="flex:1;font-size:12px;color:rgba(255,255,255,.6)">${modo}</div>
      <div style="color:rgba(255,255,255,.5);font-size:11px;min-width:60px">⚔️ ${kda}</div>
      <div style="color:#ffcc44;font-size:10px;min-width:56px;text-align:right">💥 ${dmg}</div>
      <div style="color:rgba(255,255,255,.3);font-size:10px;min-width:44px;text-align:right">${dur}</div>
      <div style="color:rgba(255,255,255,.2);font-size:9px;min-width:70px;text-align:right">${hace}</div>
    </div>`;
  }).join('') + '</div>';
}

// ── Renderizar pestaña Editar perfil ────────────────────
function _renderEditar(area) {
  const j = window.PB?.jugador ?? {};
  const regiones = ['Colombia','México','Argentina','España','Venezuela','Chile','Perú','Ecuador','Bolivia','Otro'];

  area.innerHTML = `
    <div style="max-width:400px">
      <div class="form-row">
        <label>Nombre de usuario</label>
        <input class="form-input" id="edit-usuario" value="${_esc(j.usuario ?? '')}" maxlength="32">
      </div>
      <div class="form-row">
        <label>Región</label>
        <select class="form-input" id="edit-region" style="cursor:pointer">
          ${regiones.map(r => `<option ${j.region === r ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
      </div>
      <div id="edit-msg" style="font-size:12px;margin:8px 0;min-height:18px"></div>
      <button class="btn btn-p btn-sm" style="margin-top:4px" onclick="guardarEdicionPerfil()">💾 Guardar Cambios</button>
    </div>`;
}

async function guardarEdicionPerfil() {
  const nuevoUsuario = document.getElementById('edit-usuario')?.value?.trim();
  const nuevaRegion  = document.getElementById('edit-region')?.value;
  const msg          = document.getElementById('edit-msg');

  if (!nuevoUsuario || nuevoUsuario.length < 3) {
    if (msg) { msg.style.color = '#ff6666'; msg.textContent = 'El nombre debe tener al menos 3 caracteres.'; }
    return;
  }
  if (!/^[a-zA-Z0-9_]+$/.test(nuevoUsuario)) {
    if (msg) { msg.style.color = '#ff6666'; msg.textContent = 'Solo letras, números y guión bajo.'; }
    return;
  }

  if (msg) { msg.style.color = 'rgba(255,255,255,.4)'; msg.textContent = 'Guardando...'; }

  try {
    const { error } = await window.sb
      .from('jugadores')
      .update({ usuario: nuevoUsuario, region: nuevaRegion })
      .eq('id', window.PB.jugador.id);

    if (error) {
      if (msg) { msg.style.color = '#ff6666'; msg.textContent = 'Error: ' + (error.message.includes('unique') ? 'Ese nombre ya está en uso.' : error.message); }
      return;
    }

    // Actualizar en memoria
    window.PB.jugador.usuario = nuevoUsuario;
    window.PB.jugador.region  = nuevaRegion;

    // Actualizar topbar
    const tbName = document.getElementById('tb-pname');
    if (tbName) tbName.textContent = nuevoUsuario;

    if (msg) { msg.style.color = '#66ff88'; msg.textContent = '✅ Guardado correctamente.'; }
    showToast('✅ Perfil actualizado', '#66ff88');

  } catch(e) {
    if (msg) { msg.style.color = '#ff6666'; msg.textContent = 'Error de conexión.'; }
  }
}

// ── Renderizar pestaña Reputación ───────────────────────
function _renderReputacion(area) {
  const rep = _perfilRep;

  if (!rep || rep.total_valoraciones === 0) {
    area.innerHTML = `
      <div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:20px">
        Tu reputación es valorada por otros jugadores al finalizar una partida online.
      </div>
      <div style="color:rgba(255,255,255,.25);font-size:13px;text-align:center;padding:20px 0">
        Sin valoraciones aún. ¡Juega partidas online para recibir reputación!
      </div>`;
    return;
  }

  // Escalar de 0-10 a 0-100%
  const cats = [
    { n: 'Juego',        v: Math.round((rep.juego        ?? 5) * 10), col: '#44ff88' },
    { n: 'Actitud',      v: Math.round((rep.actitud      ?? 5) * 10), col: '#5ab0ff' },
    { n: 'Comunicación', v: Math.round((rep.comunicacion ?? 5) * 10), col: '#cc88ff' },
  ];
  const promedio = Math.round(cats.reduce((s, c) => s + c.v, 0) / cats.length);
  const nivelRep = promedio >= 80 ? 'Excelente' : promedio >= 60 ? 'Buena' : promedio >= 40 ? 'Regular' : 'Baja';
  const colNivel = promedio >= 80 ? '#66ff88' : promedio >= 60 ? '#ffd080' : promedio >= 40 ? '#ff9944' : '#ff6666';

  area.innerHTML = `
    <div style="max-width:440px">
      <div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:16px">
        Basado en ${rep.total_valoraciones} valoración${rep.total_valoraciones !== 1 ? 'es' : ''} de otros jugadores.
      </div>
      ${cats.map(c => `
        <div class="rep-bar-wrap">
          <div style="display:flex;justify-content:space-between;font-size:12px">
            <span style="font-weight:700">${c.n}</span>
            <span style="color:${c.col}">${c.v}%</span>
          </div>
          <div class="rep-bar-bg">
            <div class="rep-bar-fill" style="width:${c.v}%;background:${c.col}"></div>
          </div>
        </div>`).join('')}
      <div style="margin-top:16px;font-size:10px;color:rgba(255,255,255,.28)">
        ⭐ Reputación general: <strong style="color:${colNivel}">${nivelRep}</strong>
      </div>
    </div>`;
}

// ── Utilidades ──────────────────────────────────────────
function _tiempoRelativo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)  return 'Ahora';
  if (min < 60) return `hace ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24)   return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

function _esc(str) {
  return String(str).replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}