// ============================================================
//  perfil-monedero.js  —  Puente entre Supabase (window.PB)
//  y las funciones que main.js, tienda.js, etc. usan
//
//  Carga DESPUÉS de auth.js y ANTES de main.js
// ============================================================

// ── Íconos de moneda (usados en main.js) ───────────────────
const CICONS = { peces: '🐟', krill: '🦐', piedras: '🪨', perlas: '🦪' };
const CURRENCY_LABELS = {
  peces: '🐟 Peces', krill: '🦐 Krill',
  piedras: '🪨 Piedras', perlas: '🦪 Perlas',
};

// ── Definición de personajes (desbloqueables) ──────────────
// Complementa a CHARS (definido en main.js).
// owned se actualiza dinámicamente según el inventario del jugador.
const CHARS_DEF = {
  polar:     { price: 5000, currency: 'peces', owned: true  },
  chili:     { price: 5000, currency: 'peces', owned: true  },
  cuchillas: { price: 5000, currency: 'peces', owned: false },
  electrico: { price: 5000, currency: 'peces', owned: false },
  elemental: { price: 5000, currency: 'peces', owned: false },
  fortachon: { price: 5000, currency: 'peces', owned: false },
  velocista: { price: 5000, currency: 'peces', owned: false },
  guerrero:  { price: 5000, currency: 'peces', owned: false },
  naturaleza:{ price: 5000, currency: 'peces', owned: false },
  campos:    { price: 5000, currency: 'peces', owned: false },
};

// ── currentUser (alias de texto para compatibilidad) ───────
// main.js lee `currentUser` directamente como string.
// Lo mantenemos sincronizado con window.PB.jugador.
Object.defineProperty(window, 'currentUser', {
  get() { return window.PB?.jugador?.usuario ?? null; },
  set() {}, // ignorado — la fuente de verdad es window.PB
  configurable: true,
});

// ── getCurrUser ─────────────────────────────────────────────
// Devuelve un objeto con la forma que main.js espera:
// { peces, krill, piedras, perlas, ownedChars, wins, losses, ... }
function getCurrUser() {
  const j = window.PB?.jugador;
  const m = window.PB?.monedero;
  if (!j) return null;

  return {
    // Identidad
    usuario:       j.usuario,
    nivel_jugador: j.nivel_jugador ?? 1,
    experiencia:   j.experiencia   ?? 0,
    // Monedas (de monedero_jugador)
    peces:   m?.peces   ?? 0,
    krill:   m?.krill   ?? 0,
    piedras: m?.piedras ?? 0,
    perlas:  m?.perlas  ?? 0,
    // Inventario (arrays de keys de personaje)
    ownedChars: window.PB._ownedChars ?? ['polar', 'chili'],
    ownedSkins: window.PB._ownedSkins ?? [],
    ownedIcons: window.PB._ownedIcons ?? [],
    ownedBgs:   window.PB._ownedBgs   ?? [],
    // Stats de partidas (en memoria por sesión; se guardan al finalizar)
    wins:       window.PB._stats?.wins      ?? 0,
    losses:     window.PB._stats?.losses    ?? 0,
    totalDmg:   window.PB._stats?.totalDmg  ?? 0,
    totalKills: window.PB._stats?.totalKills ?? 0,
    rankPts:    window.PB._rankPts           ?? 0,
  };
}

// ── saveCurrUser ────────────────────────────────────────────
// main.js llama a esto después de modificar el objeto de usuario.
// Aquí sincronizamos los cambios relevantes a Supabase.
function saveCurrUser(data) {
  if (!window.PB?.jugador) return;

  // Actualizar monedero en memoria
  const m = window.PB.monedero;
  if (m) {
    if (data.peces   !== undefined) m.peces   = data.peces;
    if (data.krill   !== undefined) m.krill   = data.krill;
    if (data.piedras !== undefined) m.piedras = data.piedras;
    if (data.perlas  !== undefined) m.perlas  = data.perlas;
  }

  // Inventarios en memoria
  if (data.ownedChars) window.PB._ownedChars = data.ownedChars;
  if (data.ownedSkins) window.PB._ownedSkins = data.ownedSkins;
  if (data.ownedIcons) window.PB._ownedIcons = data.ownedIcons;
  if (data.ownedBgs)   window.PB._ownedBgs   = data.ownedBgs;

  // Stats
  if (!window.PB._stats) window.PB._stats = {};
  ['wins','losses','totalDmg','totalKills'].forEach(k => {
    if (data[k] !== undefined) window.PB._stats[k] = data[k];
  });

  // Flush a Supabase con debounce (800 ms)
  clearTimeout(window.PB._saveTimer);
  window.PB._saveTimer = setTimeout(_flushMonedero, 800);
}

async function _flushMonedero() {
  const jugadorId = window.PB?.jugador?.id;
  const m = window.PB?.monedero;
  if (!jugadorId || !m) return;

  try {
    await window.sb.from('monedero_jugador').upsert({
      jugador_id:    jugadorId,
      peces:         m.peces   ?? 0,
      krill:         m.krill   ?? 0,
      piedras:       m.piedras ?? 0,
      perlas:        m.perlas  ?? 0,
      actualizado_en: new Date().toISOString(),
    }, { onConflict: 'jugador_id' });
  } catch (e) {
    console.warn('[PB] Error guardando monedero:', e);
  }
}

// ── getUserCurr ─────────────────────────────────────────────
function getUserCurr() {
  const m = window.PB?.monedero;
  return {
    peces:   m?.peces   ?? 0,
    krill:   m?.krill   ?? 0,
    piedras: m?.piedras ?? 0,
    perlas:  m?.perlas  ?? 0,
  };
}

// ── updateTopbarCurrencies ──────────────────────────────────
function updateTopbarCurrencies() {
  const c = getUserCurr();
  const fmt = n => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'K' : n;
  const el = id => document.getElementById(id);
  if (el('c-peces'))   el('c-peces').textContent   = fmt(c.peces);
  if (el('c-krill'))   el('c-krill').textContent   = fmt(c.krill);
  if (el('c-piedras')) el('c-piedras').textContent = fmt(c.piedras);
  if (el('c-perlas'))  el('c-perlas').textContent  = fmt(c.perlas);
}

// ── addCurrency ─────────────────────────────────────────────
function addCurrency(currency, amount) {
  const m = window.PB?.monedero;
  if (!m) return;
  m[currency] = (m[currency] ?? 0) + amount;
  updateTopbarCurrencies();
  clearTimeout(window.PB._saveTimer);
  window.PB._saveTimer = setTimeout(_flushMonedero, 800);
}

// ── hasItem ─────────────────────────────────────────────────
function hasItem(type, key) {
  const arrKey = '_owned' + type.charAt(0).toUpperCase() + type.slice(1) + 's';
  const arr = window.PB?.[arrKey] ?? [];
  return arr.includes(key);
}

// ── buyItem ─────────────────────────────────────────────────
function buyItem(type, key, price, currency) {
  const u = getCurrUser();
  if (!u)              { showToast('⚠️ Debes iniciar sesión', '#ff8844'); return false; }

  if (hasItem(type, key)) { showToast('✅ ¡Ya tienes este ítem!', '#44ff88'); return false; }
  if (u[currency] < price) {
    showToast('❌ No tienes suficiente ' + CURRENCY_LABELS[currency], '#ff4444');
    return false;
  }

  // Descontar moneda
  const m = window.PB.monedero;
  m[currency] -= price;
  updateTopbarCurrencies();

  // Añadir al inventario en memoria
  const arrKey = '_owned' + type.charAt(0).toUpperCase() + type.slice(1) + 's';
  window.PB[arrKey] = [...(window.PB[arrKey] ?? []), key];

  // Reflejar en CHARS_DEF si es personaje
  if (type === 'char' && CHARS_DEF[key]) CHARS_DEF[key].owned = true;

  showToast('🎉 ¡Comprado! -' + price + ' ' + CICONS[currency], '#a078ff');

  // Persistir en Supabase
  _persistCompra(type, key, price, currency);
  return true;
}

async function _persistCompra(type, key, price, currency) {
  const jugadorId = window.PB?.jugador?.id;
  if (!jugadorId) return;
  try {
    await window.sb.rpc('gastar_monedas', {
      p_jugador_id: jugadorId,
      p_moneda:     currency,
      p_cantidad:   price,
      p_motivo:     'Compra tienda: ' + type + ' / ' + key,
    });
  } catch (e) {
    console.warn('[PB] Error RPC gastar_monedas:', e);
  }
}

// ── buyChar (alias usado en tienda.js) ─────────────────────
function buyChar(key, price, currency) {
  return buyItem('char', key, price, currency);
}

// ── syncOwnedChars ──────────────────────────────────────────
// Actualiza CHARS_DEF.owned según el inventario actual
function syncOwnedChars() {
  const owned = window.PB?._ownedChars ?? ['polar', 'chili'];
  Object.keys(CHARS_DEF).forEach(k => {
    CHARS_DEF[k].owned = owned.includes(k);
  });
}

// ── enterDash ───────────────────────────────────────────────
// auth.js llama a enterDash(nombre) tras login exitoso.
// Aquí inicializamos PB._owned* y actualizamos la UI.
function initPerfilMonedero() {
  // Cargar inventario de coleccion_jugador (ya estará en window.PB._coleccion
  // si auth.js lo populate; si no, usamos defaults)
  const col = window.PB?._coleccion ?? [];

  // Mapear IDs de pingüinos a las keys de CHARS usando el nombre
  // (la tabla pinguinos usa nombre: 'Polar','Chili',etc.)
  const charNameToKey = {
    'polar': 'polar', 'chili': 'chili', 'cuchillas': 'cuchillas',
    'electro': 'electrico', 'elemental': 'elemental', 'fortachón': 'fortachon',
    'velocista': 'velocista', 'guerrero': 'guerrero',
    'naturaleza': 'naturaleza', 'campos': 'campos',
  };

  // Por ahora asignamos defaults seguros
  // (en una implementación completa se resolvería pinguino_id → nombre via JOIN)
  if (!window.PB._ownedChars) window.PB._ownedChars = ['polar', 'chili'];
  if (!window.PB._ownedSkins) window.PB._ownedSkins = [];
  if (!window.PB._ownedIcons) window.PB._ownedIcons = [];
  if (!window.PB._ownedBgs)   window.PB._ownedBgs   = [];
  if (!window.PB._stats)      window.PB._stats = { wins: 0, losses: 0, totalDmg: 0, totalKills: 0 };
  if (!window.PB._rankPts)    window.PB._rankPts = 0;

  syncOwnedChars();
  updateTopbarCurrencies();
}

// ── Guardar resultado de partida a Supabase ─────────────────
async function saveMatchResult({ winner, p1Stats, p2Stats, modeName }) {
  const jugadorId = window.PB?.jugador?.id;
  if (!jugadorId) return;

  // Actualizar stats en memoria
  if (!window.PB._stats) window.PB._stats = {};
  const isWin = winner === 'p1';
  window.PB._stats.wins       = (window.PB._stats.wins       ?? 0) + (isWin ? 1 : 0);
  window.PB._stats.losses     = (window.PB._stats.losses     ?? 0) + (isWin ? 0 : 1);
  window.PB._stats.totalDmg   = (window.PB._stats.totalDmg   ?? 0) + p1Stats.dmg;
  window.PB._stats.totalKills = (window.PB._stats.totalKills ?? 0) + p1Stats.kills;

  // Recompensas
  const pecesGan = isWin ? 120 : 60;
  const krillGan = isWin ? 30  : 15;
  addCurrency('peces', pecesGan);
  addCurrency('krill', krillGan);

  try {
    // Llamar a dar_monedas en Supabase para registrar transacción
    await window.sb.rpc('dar_monedas', {
      p_jugador_id: jugadorId,
      p_moneda:     'peces',
      p_cantidad:   pecesGan,
      p_motivo:     'Recompensa partida (' + (isWin ? 'victoria' : 'derrota') + ')',
    });
    await window.sb.rpc('dar_monedas', {
      p_jugador_id: jugadorId,
      p_moneda:     'krill',
      p_cantidad:   krillGan,
      p_motivo:     'Recompensa partida krill',
    });
  } catch (e) {
    console.warn('[PB] Error guardando recompensas:', e);
  }

  return { pecesGan, krillGan };
}