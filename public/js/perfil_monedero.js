// ================================================================
//  PENGUBRAWL — perfil_monedero.js  v3.0
//  Puente central entre el juego y Supabase.
// ================================================================

window.CICONS = { peces:'🐟', krill:'🦐', piedras:'🪨', perlas:'🦪' };
window.CURRENCY_LABELS = { peces:'Peces', krill:'Krill', piedras:'Piedras', perlas:'Perlas' };

const _TIPO_MAP = { char:'pinguino', skin:'skin', icon:'icono', bg:'fondo', emote:'reaccion' };
let _coleccionCache = null;

// ── MONEDERO ────────────────────────────────────────────────────

async function loadMonedero() {
  const sb = window._sb, jug = window.PB?.jugador;
  if (!sb || !jug?.id) return;
  try {
    const { data, error } = await sb
      .from('monedero_jugador')
      .select('peces,krill,piedras,perlas')
      .eq('jugador_id', jug.id)
      .single();
    if (error) { console.warn('[monedero]', error.message); return; }
    window.PB.monedero = data;
    updateTopbarCurrencies();
    return data;
  } catch(e) { console.error('[monedero]', e); }
}

function updateTopbarCurrencies() {
  const m = window.PB?.monedero ?? {};
  const fmt = n => Number(n ?? 0).toLocaleString('es');
  const el  = id => document.getElementById(id);
  if (el('c-peces'))   el('c-peces').textContent   = fmt(m.peces);
  if (el('c-krill'))   el('c-krill').textContent   = fmt(m.krill);
  if (el('c-piedras')) el('c-piedras').textContent = fmt(m.piedras);
  if (el('c-perlas'))  el('c-perlas').textContent  = fmt(m.perlas);
}

// ── COLECCIÓN ───────────────────────────────────────────────────

async function _cargarColeccion() {
  if (_coleccionCache) return _coleccionCache;
  const sb = window._sb, jug = window.PB?.jugador;
  if (!sb || !jug?.id) return [];
  try {
    const { data } = await sb
      .from('coleccion_jugador')
      .select('item_tipo,pinguino_id,skin_id,icono_id,fondo_id,reaccion_id')
      .eq('jugador_id', jug.id);
    _coleccionCache = data ?? [];
    return _coleccionCache;
  } catch(e) { return []; }
}

function hasItem(tipo, key) {
  if (tipo === 'char' && (key === 'polar' || key === 'chili')) return true;
  if (tipo === 'char') return (window.PB?._ownedChars ?? []).includes(key);
  if (tipo === 'skin') return (window.PB?._ownedSkins ?? []).includes(key);
  if (tipo === 'icon') return (window.PB?._ownedIcons ?? []).includes(key);
  if (tipo === 'bg')   return (window.PB?._ownedFondos ?? []).includes(key);
  if (tipo === 'emote')return (window.PB?._ownedReacciones ?? []).includes(key);
  return false;
}

async function initPerfilMonedero() {
  await Promise.all([loadMonedero(), _initColeccion()]);
}

async function _initColeccion() {
  const col = await _cargarColeccion();
  const pingIds = col.filter(c => c.item_tipo === 'pinguino' && c.pinguino_id).map(c => c.pinguino_id);

  if (pingIds.length > 0) {
    try {
      const { data: pings } = await window._sb.from('pinguinos').select('id,nombre').in('id', pingIds);
      const keys = (pings ?? []).map(p => _nombreToKey(p.nombre)).filter(Boolean);
      window.PB._ownedChars = ['polar','chili',...keys];
    } catch(e) { window.PB._ownedChars = ['polar','chili']; }
  } else {
    window.PB._ownedChars = ['polar','chili'];
  }

  window.PB._ownedSkins     = col.filter(c=>c.item_tipo==='skin').map(c=>c.skin_id);
  window.PB._ownedIcons     = col.filter(c=>c.item_tipo==='icono').map(c=>c.icono_id);
  window.PB._ownedFondos    = col.filter(c=>c.item_tipo==='fondo').map(c=>c.fondo_id);
  window.PB._ownedReacciones= col.filter(c=>c.item_tipo==='reaccion').map(c=>c.reaccion_id);
  if(typeof CHARS_DEF!=='undefined') syncOwnedChars();
}

function syncOwnedChars() {
  if (typeof CHARS_DEF === 'undefined' || typeof CHARS_DEF !== 'object') return;
  const owned = window.PB?._ownedChars ?? ['polar','chili'];
  Object.keys(CHARS_DEF).forEach(k => { CHARS_DEF[k].owned = owned.includes(k); });
}

function _nombreToKey(n) {
  const m = {
    'polar':'polar','chili':'chili','cuchillas':'cuchillas',
    'electro':'electrico','eléctrico':'electrico','elemental':'elemental',
    'fortachón':'fortachon','fortachon':'fortachon','velocista':'velocista',
    'guerrero':'guerrero','naturaleza':'naturaleza',
    'campos':'campos','campos de fuerza':'campos',
  };
  return m[(n??'').toLowerCase()] ?? null;
}

function _keyToNombre(k) {
  const m = {
    polar:'Polar',chili:'Chili',cuchillas:'Cuchillas',
    electrico:'Electro',elemental:'Elemental',fortachon:'Fortachón',
    velocista:'Velocista',guerrero:'Guerrero',naturaleza:'Naturaleza',campos:'Campos',
  };
  return m[k] ?? k;
}

// ── COMPATIBILIDAD LEGADO ───────────────────────────────────────

function getCurrUser() {
  const m = window.PB?.monedero ?? {};
  return {
    peces: m.peces??0, krill: m.krill??0, piedras: m.piedras??0, perlas: m.perlas??0,
    ownedChars:  window.PB?._ownedChars??['polar','chili'],
    ownedSkins:  window.PB?._ownedSkins??[],
    ownedIcons:  window.PB?._ownedIcons??[],
    ownedFondos: window.PB?._ownedFondos??[],
    wins:      window.PB?._stats?.wins??0,
    losses:    window.PB?._stats?.losses??0,
    totalKills:window.PB?._stats?.totalKills??0,
    totalDmg:  window.PB?._stats?.totalDmg??0,
  };
}
function saveCurrUser() { /* deprecated — datos van a Supabase */ }

// ── TRANSACCIONES ───────────────────────────────────────────────

async function addCurrency(moneda, cantidad, motivo) {
  const sb = window._sb, jug = window.PB?.jugador;
  if (!sb || !jug?.id || !cantidad) return false;
  try {
    const { error } = await sb.rpc('dar_monedas', {
      p_jugador_id: jug.id, p_moneda: moneda,
      p_cantidad: cantidad, p_motivo: motivo ?? 'sistema',
    });
    if (error) { console.warn('[addCurrency]', error.message); return false; }
    if (window.PB.monedero) window.PB.monedero[moneda] = (window.PB.monedero[moneda]??0) + cantidad;
    updateTopbarCurrencies();
    return true;
  } catch(e) { return false; }
}

async function gastarMoneda(moneda, cantidad, motivo) {
  const sb = window._sb, jug = window.PB?.jugador;
  if (!sb || !jug?.id) return false;
  const saldo = window.PB?.monedero?.[moneda] ?? 0;
  if (saldo < cantidad) return false;
  try {
    const { data, error } = await sb.rpc('gastar_monedas', {
      p_jugador_id: jug.id, p_moneda: moneda,
      p_cantidad: cantidad, p_motivo: motivo ?? 'compra',
    });
    if (error || data === false) return false;
    if (window.PB.monedero) window.PB.monedero[moneda] = Math.max(0, saldo - cantidad);
    updateTopbarCurrencies();
    return true;
  } catch(e) { return false; }
}

// ── COMPRAS ─────────────────────────────────────────────────────

async function buyChar(charKey, price, currency) {
  if (hasItem('char', charKey)) { showToast('Ya tienes este pingüino 🐧','#44ff88'); return; }
  const cur = currency ?? 'peces';
  const ok  = await gastarMoneda(cur, price, `compra_pinguino_${charKey}`);
  if (!ok) { showToast(`❌ No tienes suficientes ${window.CICONS[cur]}`, '#ff4444'); return; }

  try {
    const { data: pingRow } = await window._sb
      .from('pinguinos').select('id').ilike('nombre', _keyToNombre(charKey)).maybeSingle();
    if (pingRow?.id) {
      await window._sb.rpc('agregar_a_coleccion', {
        p_jugador_id: window.PB.jugador.id, p_item_tipo:'pinguino', p_item_id: pingRow.id,
      });
    }
  } catch(e) { console.warn('[buyChar] colección:', e); }

  if (!window.PB._ownedChars) window.PB._ownedChars = ['polar','chili'];
  if (!window.PB._ownedChars.includes(charKey)) window.PB._ownedChars.push(charKey);
  if (typeof CHARS_DEF !== 'undefined' && CHARS_DEF[charKey]) CHARS_DEF[charKey].owned = true;
  _coleccionCache = null;
  showToast(`✅ ¡${CHARS_DEF?.[charKey]?.name ?? charKey} desbloqueado! 🐧`, '#44ff88');
  if (typeof buildGuarida === 'function') buildGuarida('chars');
}

async function buyItem(tipo, key, price, currency) {
  if (hasItem(tipo, key)) { showToast('Ya tienes este ítem ✅','#44ff88'); return; }
  const cur = currency ?? 'peces';
  const ok  = await gastarMoneda(cur, price, `compra_${tipo}_${key}`);
  if (!ok) { showToast(`❌ No tienes suficientes ${window.CICONS[cur]}`, '#ff4444'); return; }
  showToast('✅ ¡Compra exitosa!','#44ff88');
  _coleccionCache = null;
}

// ── GUARDAR PARTIDA ─────────────────────────────────────────────

async function saveMatchResult({ winner, p1Stats, p2Stats, modeName }) {
  const sb = window._sb, jug = window.PB?.jugador;
  if (!sb || !jug?.id) return null;

  const esGanador = winner === 'p1';
  const misStats  = p1Stats ?? {};
  const pecesGan  = (esGanador ? 120 : 40) + (misStats.kills ?? 0) * 15;
  const krillGan  = esGanador ? 20 : 5;

  try {
    await sb.from('historial_partidas').insert({
      jugador_id:  jug.id,
      resultado:   esGanador ? 'victoria' : 'derrota',
      asesinatos:  misStats.kills  ?? 0,
      muertes:     misStats.deaths ?? 0,
      asistencias: 0,
      dano_total:  misStats.dmg   ?? 0,
      modo:        modeName ?? '1v1_offline',
      jugada_en:   new Date().toISOString(),
    });
    await addCurrency('peces', pecesGan,  `partida_${modeName}`);
    await addCurrency('krill', krillGan,  `partida_krill`);

    if (!window.PB._stats) window.PB._stats = {wins:0,losses:0,totalKills:0,totalDmg:0};
    if (esGanador) window.PB._stats.wins++; else window.PB._stats.losses++;
    window.PB._stats.totalKills += misStats.kills ?? 0;
    window.PB._stats.totalDmg   += misStats.dmg   ?? 0;

    return { pecesGan, krillGan };
  } catch(e) { console.error('[saveMatch]', e); return null; }
}