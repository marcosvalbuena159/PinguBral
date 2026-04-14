// ============================================================
//  perfil-monedero.js  —  Monedero en tiempo real + Perfil
//  Coloca en: public/JS/perfil-monedero.js
//  Requiere: supabase-client.js y auth.js cargados antes
// ============================================================

// ── Refrescar monedero desde Supabase ─────────────────────

async function refrescarMonedero() {
  if (!window.PB.jugador) return;

  const { data, error } = await window.sb
    .from('monedero_jugador')
    .select('peces, krill, piedras, perlas')
    .eq('jugador_id', window.PB.jugador.id)
    .single();

  if (error || !data) return;

  window.PB.monedero = data;

  // Actualizar topbar
  document.getElementById('c-peces').textContent   = fmt(data.peces);
  document.getElementById('c-krill').textContent   = fmt(data.krill);
  document.getElementById('c-piedras').textContent = fmt(data.piedras);
  document.getElementById('c-perlas').textContent  = fmt(data.perlas);
}

function fmt(n) {
  return Number(n || 0).toLocaleString('es');
}

// ── Suscripción en tiempo real al monedero ────────────────
// Cada vez que el servidor actualice el monedero, la UI se refresca sola.

function suscribirMonedero() {
  if (!window.PB.jugador) return;

  window.sb
    .channel('monedero-' + window.PB.jugador.id)
    .on(
      'postgres_changes',
      {
        event:  'UPDATE',
        schema: 'public',
        table:  'monedero_jugador',
        filter: `jugador_id=eq.${window.PB.jugador.id}`,
      },
      (payload) => {
        window.PB.monedero = payload.new;
        document.getElementById('c-peces').textContent   = fmt(payload.new.peces);
        document.getElementById('c-krill').textContent   = fmt(payload.new.krill);
        document.getElementById('c-piedras').textContent = fmt(payload.new.piedras);
        document.getElementById('c-perlas').textContent  = fmt(payload.new.perlas);
        console.log('💰 Monedero actualizado en tiempo real');
      }
    )
    .subscribe();
}

// ── Cargar y mostrar perfil del jugador ───────────────────

async function cargarPerfil() {
  if (!window.PB.jugador) return;

  const jugador = window.PB.jugador;

  // Estadísticas de partidas
  const { data: stats } = await window.sb
    .from('historial_partidas')
    .select('resultado, asesinatos, muertes, asistencias, pinguino_id')
    .eq('jugador_id', jugador.id);

  const totales = calcularStats(stats || []);

  // Últimas 10 partidas
  const { data: historial } = await window.sb
    .from('historial_partidas')
    .select(`
      resultado, asesinatos, muertes, asistencias,
      dano_total, duracion_seg, jugada_en, modo,
      pinguinos ( nombre )
    `)
    .eq('jugador_id', jugador.id)
    .order('jugada_en', { ascending: false })
    .limit(10);

  // Reputación
  const { data: rep } = await window.sb
    .from('reputacion_jugador')
    .select('juego, actitud, comunicacion, total_valoraciones')
    .eq('jugador_id', jugador.id)
    .single();

  // Colonia actual
  const { data: coloniaData } = await window.sb
    .from('integrantes_colonia')
    .select('rol, colonias ( nombre, escudo_url )')
    .eq('jugador_id', jugador.id)
    .maybeSingle();

  // Ranking dominio polar
  const { data: rankingData } = await window.sb
    .from('ranking_jugador')
    .select('puntos, rangos_dominio ( nombre, sub_nivel )')
    .eq('jugador_id', jugador.id)
    .order('puntos', { ascending: false })
    .limit(1)
    .maybeSingle();

  renderPerfil(jugador, totales, historial || [], rep, coloniaData, rankingData);
}

function calcularStats(historial) {
  const total     = historial.length;
  const victorias = historial.filter(p => p.resultado === 'victoria').length;
  const derrotas  = historial.filter(p => p.resultado === 'derrota').length;
  const asesinatos = historial.reduce((s, p) => s + (p.asesinatos || 0), 0);
  const pct       = total > 0 ? Math.round((victorias / total) * 100) : 0;

  // Pingüino más usado
  const conteo = {};
  historial.forEach(p => {
    if (p.pinguino_id) conteo[p.pinguino_id] = (conteo[p.pinguino_id] || 0) + 1;
  });
  const favId = Object.keys(conteo).sort((a, b) => conteo[b] - conteo[a])[0] || null;

  return { total, victorias, derrotas, asesinatos, pct, favId };
}

function renderPerfil(jugador, stats, historial, rep, coloniaData, rankingData) {
  // ── Info básica ──
  setTxt('prf-nombre',    jugador.usuario);
  setTxt('prf-nivel',     'Nivel ' + jugador.nivel_jugador);
  setTxt('prf-codigo',    '#' + jugador.codigo_perfil);
  setTxt('prf-region',    jugador.region || '—');

  // ── Rango ──
  const rango = rankingData?.rangos_dominio;
  const rangoStr = rango
    ? rango.nombre + (rango.sub_nivel ? ' ' + rango.sub_nivel : '')
    : 'Polluelo I';
  setTxt('prf-rango', rangoStr);
  setTxt('tb-rank-line', '🐣 ' + rangoStr);
  setTxt('prf-puntos-rango', rankingData?.puntos ?? 0);

  // ── Stats ──
  setTxt('prf-partidas',    stats.total);
  setTxt('prf-victorias',   stats.victorias);
  setTxt('prf-derrotas',    stats.derrotas);
  setTxt('prf-pct',         stats.pct + '%');
  setTxt('prf-asesinatos',  stats.asesinatos);

  // ── Colonia ──
  const coloniaNombre = coloniaData?.colonias?.nombre ?? 'Sin colonia';
  setTxt('prf-colonia', coloniaNombre);

  // ── Reputación ──
  if (rep) {
    setTxt('prf-rep-juego',   (rep.juego || 0).toFixed(1));
    setTxt('prf-rep-actitud', (rep.actitud || 0).toFixed(1));
    setTxt('prf-rep-com',     (rep.comunicacion || 0).toFixed(1));
  }

  // ── Historial de partidas ──
  const lista = document.getElementById('prf-historial-lista');
  if (lista) {
    if (historial.length === 0) {
      lista.innerHTML = '<div style="color:rgba(255,255,255,.35);font-size:12px;padding:12px 0">Sin partidas registradas aún.</div>';
    } else {
      lista.innerHTML = historial.map(p => {
        const ping   = p.pinguinos?.nombre ?? '—';
        const res    = p.resultado ?? '—';
        const resCol = res === 'victoria' ? '#7cffb2' : res === 'derrota' ? '#ff7c7c' : '#ffd97c';
        const hace   = tiempoRelativo(p.jugada_en);
        const dur    = p.duracion_seg ? Math.floor(p.duracion_seg / 60) + 'm' : '—';
        return `
          <div class="hist-row">
            <span class="hist-res" style="color:${resCol}">${res.toUpperCase()}</span>
            <span class="hist-ping">🐧 ${ping}</span>
            <span class="hist-kda">${p.asesinatos}/${p.muertes}/${p.asistencias}</span>
            <span class="hist-modo">${p.modo ?? '—'}</span>
            <span class="hist-dur">${dur}</span>
            <span class="hist-hace">${hace}</span>
          </div>`;
      }).join('');
    }
  }
}

function setTxt(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? '—';
}

function tiempoRelativo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)   return 'Ahora';
  if (min < 60)  return `hace ${min}m`;
  const h = Math.floor(min / 60);
  if (h  < 24)   return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

// ── Guardar cambios del perfil ────────────────────────────

async function guardarPerfil() {
  if (!window.PB.jugador) return;

  const nuevoUsuario = document.getElementById('prf-edit-usuario')?.value?.trim();
  const nuevaRegion  = document.getElementById('prf-edit-region')?.value?.trim();

  if (!nuevoUsuario || nuevoUsuario.length < 3) {
    alert('El nombre debe tener al menos 3 caracteres.');
    return;
  }

  const { error } = await window.sb
    .from('jugadores')
    .update({ usuario: nuevoUsuario, region: nuevaRegion || null })
    .eq('id', window.PB.jugador.id);

  if (error) {
    alert('Error al guardar: ' + error.message);
    return;
  }

  window.PB.jugador.usuario = nuevoUsuario;
  window.PB.jugador.region  = nuevaRegion;

  // Actualizar topbar
  document.getElementById('tb-pname').textContent = nuevoUsuario;
  alert('✅ Perfil actualizado.');
}

// ── Guardar ajustes del jugador ───────────────────────────

async function guardarAjustes(ajustes) {
  if (!window.PB.jugador) return;

  const { error } = await window.sb
    .from('ajustes_jugador')
    .upsert({ jugador_id: window.PB.jugador.id, ...ajustes });

  if (error) console.error('Error guardando ajustes:', error);
}

async function cargarAjustes() {
  if (!window.PB.jugador) return null;

  const { data } = await window.sb
    .from('ajustes_jugador')
    .select('*')
    .eq('jugador_id', window.PB.jugador.id)
    .single();

  return data;
}

// ── Inicializar cuando el jugador entra al dashboard ──────
// Llama a esta función desde auth.js después de abrirDashboard()
// o desde el evento de la página de perfil.

async function initPerfilMonedero() {
  await refrescarMonedero();
  suscribirMonedero();
}
