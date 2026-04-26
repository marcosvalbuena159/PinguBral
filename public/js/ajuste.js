// ═══════════════════════════════════════════════════════
//  AJUSTES — PenguBrawl · Wild Rift style
//  Tabs: Audio · Vídeo · Controles · Cuenta · Accesibilidad
//  Todos los cambios se guardan en localStorage bajo
//  la clave 'pb_settings' y se aplican inmediatamente.
// ═══════════════════════════════════════════════════════

// ── STORE ───────────────────────────────────────────────
const SETTINGS_KEY = 'pb_settings';

const SETTINGS_DEFAULT = {
  // Audio
  masterVol:    80,
  musicVol:     60,
  sfxVol:       80,
  uiVol:        70,
  muteAll:      false,
  muteMusic:    false,
  muteSfx:      false,
  // Vídeo
  quality:      'alta',    // baja | media | alta | ultra
  fpsCap:       60,        // 30 | 60 | 120 | ilimitado
  fullscreen:   false,
  showFps:      false,
  particulas:   true,
  sombras:      true,
  vsync:        true,
  brightness:   50,
  contrast:     50,
  // Controles P1 (teclado)
  p1Up:    'W', p1Down:'S', p1Left:'A', p1Right:'D',
  p1Skill1:'1', p1Skill2:'2', p1Skill3:'3',
  // Controles P2 (teclado)
  p2Up:'ArrowUp',p2Down:'ArrowDown',p2Left:'ArrowLeft',p2Right:'ArrowRight',
  p2Skill1:'I', p2Skill2:'O', p2Skill3:'P',
  // Cuenta
  showStatus:   true,
  publicProfile:true,
  chatFilter:   true,
  language:     'es',
  region:       'latam',
  // Accesibilidad
  fontSize:     'normal',  // pequeño | normal | grande
  colorblind:   'ninguno', // ninguno | deuteranopia | protanopia | tritanopia
  reduceMotion: false,
  highContrast: false,
  subtitles:    false,
};

function loadSettings() {
  try { return { ...SETTINGS_DEFAULT, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; }
  catch (e) { return { ...SETTINGS_DEFAULT }; }
}
function saveSettings(s) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    // Sincronizar idioma y región a Supabase si el jugador está autenticado
    const jug = window.PB?.jugador;
    if (window._sb && jug?.id && (s.language || s.region)) {
      window._sb.from('ajustes_jugador')
        .update({ idioma: s.language ?? 'es' })
        .eq('jugador_id', jug.id)
        .then(() => {}); // fire and forget
    }
  } catch (e) {}
}
function getSetting(key) { return loadSettings()[key]; }
function setSetting(key, val) {
  const s = loadSettings();
  s[key] = val;
  saveSettings(s);
  applySettings(s);
}

// Aplica ajustes que tienen efecto inmediato en el DOM/CSS
function applySettings(s) {
  // Tamaño de fuente
  const fontMap = { pequeño: '13px', normal: '15px', grande: '17px' };
  document.documentElement.style.setProperty('--app-font-size', fontMap[s.fontSize] || '15px');
  // Brillo/contraste
  const contentEl = document.getElementById('content');
  if (contentEl) {
    // slider 0-100, center 50 = normal (100% brightness, 100% contrast)
    contentEl.style.filter =
      `brightness(${s.brightness * 2}%) contrast(${s.contrast * 2}%)`;
  }
  // Modo daltonismo
  const cbFilters = {
    ninguno:      'none',
    deuteranopia: 'url(#filter-deutan)',
    protanopia:   'url(#filter-protan)',
    tritanopia:   'url(#filter-tritan)',
  };
  // Colorblind/contrast filter (applied to body safely)
  if (!s.highContrast && (s.colorblind === 'ninguno' || !s.colorblind)) {
    document.body.style.filter = '';
  } else if (s.highContrast) {
    document.body.style.filter = 'contrast(150%)';
  }
  // Reducir movimiento
  document.documentElement.classList.toggle('reduce-motion', !!s.reduceMotion);
}

// ── ESTADO DE UI ────────────────────────────────────────
let currentAjusteTab = 'audio';
let rebindTarget = null; // { key, el } mientras se escucha tecla

// ── ENTRY POINT ─────────────────────────────────────────
function buildAjustes() {
  const page = document.getElementById('page-ajustes');
  if (!page) return;
  const header = page.querySelector('.page-header');
  page.innerHTML = '';
  if (header) page.appendChild(header);

  applySettings(loadSettings());

  const shell = document.createElement('div');
  shell.className = 'aj-shell';
  shell.innerHTML = `
    <!-- Sidebar de tabs -->
    <nav class="aj-nav">
      ${[
        { id:'audio',         icon:'🔊', label:'Audio'         },
        { id:'video',         icon:'🖥️', label:'Vídeo'         },
        { id:'controles',     icon:'⌨️', label:'Controles'     },
        { id:'cuenta',        icon:'👤', label:'Cuenta'        },
        { id:'accesibilidad', icon:'♿', label:'Accesibilidad' },
      ].map(t => `
        <div class="aj-tab${t.id === currentAjusteTab ? ' active' : ''}"
             onclick="setAjTab('${t.id}')">
          <span class="aj-tab-icon">${t.icon}</span>
          <span class="aj-tab-label">${t.label}</span>
        </div>`).join('')}
      <div class="aj-nav-spacer"></div>
      <button class="aj-reset-btn" onclick="resetSettings()">↺ Restablecer</button>
    </nav>
    <!-- Contenido -->
    <div class="aj-content" id="aj-content"></div>
  `;
  page.appendChild(shell);
  renderAjTab(currentAjusteTab);
}

function setAjTab(tab) {
  currentAjusteTab = tab;
  document.querySelectorAll('.aj-tab').forEach(t => t.classList.toggle('active', t.getAttribute('onclick').includes(`'${tab}'`)));
  renderAjTab(tab);
}

function renderAjTab(tab) {
  const cont = document.getElementById('aj-content');
  if (!cont) return;
  cont.innerHTML = '';
  if      (tab === 'audio')         buildAudioTab(cont);
  else if (tab === 'video')         buildVideoTab(cont);
  else if (tab === 'controles')     buildControlesTab(cont);
  else if (tab === 'cuenta')        buildCuentaTab(cont);
  else if (tab === 'accesibilidad') buildAccesibilidadTab(cont);
}

// ══ TAB: AUDIO ══════════════════════════════════════════
function buildAudioTab(cont) {
  const s = loadSettings();
  cont.appendChild(ajSection('Volumen General', `
    ${ajToggle('muteAll', s.muteAll, 'Silenciar todo')}
    ${ajSlider('masterVol', s.masterVol, 'Volumen maestro', '🔊')}
  `));
  cont.appendChild(ajSection('Música', `
    ${ajToggle('muteMusic', s.muteMusic, 'Silenciar música')}
    ${ajSlider('musicVol', s.musicVol, 'Volumen música', '🎵')}
  `));
  cont.appendChild(ajSection('Efectos de Sonido', `
    ${ajToggle('muteSfx', s.muteSfx, 'Silenciar efectos')}
    ${ajSlider('sfxVol', s.sfxVol, 'Efectos de combate', '💥')}
    ${ajSlider('uiVol',  s.uiVol,  'Efectos de interfaz', '🔔')}
  `));
  bindSliders(cont);
  bindToggles(cont);
}

// ══ TAB: VÍDEO ══════════════════════════════════════════
function buildVideoTab(cont) {
  const s = loadSettings();
  cont.appendChild(ajSection('Calidad y Rendimiento', `
    ${ajSelect('quality', s.quality, 'Calidad gráfica', [
      {val:'baja',label:'Baja'},{val:'media',label:'Media'},
      {val:'alta',label:'Alta'},{val:'ultra',label:'Ultra'},
    ])}
    ${ajSelect('fpsCap', s.fpsCap, 'Límite de FPS', [
      {val:30,label:'30 FPS'},{val:60,label:'60 FPS'},
      {val:120,label:'120 FPS'},{val:0,label:'Sin límite'},
    ])}
    ${ajToggle('vsync',   s.vsync,   'V-Sync')}
    ${ajToggle('showFps', s.showFps, 'Mostrar FPS en partida')}
  `));
  cont.appendChild(ajSection('Efectos Visuales', `
    ${ajToggle('particulas', s.particulas, 'Partículas y efectos')}
    ${ajToggle('sombras',    s.sombras,    'Sombras')}
    ${ajToggle('fullscreen', s.fullscreen, 'Pantalla completa')}
  `));
  cont.appendChild(ajSection('Imagen', `
    ${ajSlider('brightness', s.brightness, 'Brillo',    '☀️')}
    ${ajSlider('contrast',   s.contrast,   'Contraste', '◐')}
  `));
  bindSliders(cont);
  bindToggles(cont);
  bindSelects(cont);
}

// ══ TAB: CONTROLES ══════════════════════════════════════
function buildControlesTab(cont) {
  const s = loadSettings();

  const p1Actions = [
    { key:'p1Up',    label:'Mover arriba'   },
    { key:'p1Down',  label:'Mover abajo'    },
    { key:'p1Left',  label:'Mover izquierda'},
    { key:'p1Right', label:'Mover derecha'  },
    { key:'p1Skill1',label:'Habilidad 1'    },
    { key:'p1Skill2',label:'Habilidad 2'    },
    { key:'p1Skill3',label:'Habilidad 3'    },
  ];
  const p2Actions = [
    { key:'p2Up',    label:'Mover arriba'   },
    { key:'p2Down',  label:'Mover abajo'    },
    { key:'p2Left',  label:'Mover izquierda'},
    { key:'p2Right', label:'Mover derecha'  },
    { key:'p2Skill1',label:'Habilidad 1'    },
    { key:'p2Skill2',label:'Habilidad 2'    },
    { key:'p2Skill3',label:'Habilidad 3'    },
  ];

  const makeBindTable = (actions) =>
    `<div class="aj-bind-table">
      ${actions.map(a => `
        <div class="aj-bind-row">
          <span class="aj-bind-action">${a.label}</span>
          <button class="aj-key-btn" data-bind="${a.key}" onclick="startRebind('${a.key}',this)">
            ${formatKey(s[a.key])}
          </button>
        </div>`).join('')}
    </div>`;

  cont.appendChild(ajSection('Jugador 1', makeBindTable(p1Actions)));
  cont.appendChild(ajSection('Jugador 2', makeBindTable(p2Actions)));
  cont.appendChild(ajSection('', `
    <div style="display:flex;gap:10px">
      <button class="aj-action-btn" onclick="resetControls()">↺ Restablecer controles</button>
    </div>
  `));
}

function formatKey(k) {
  const map = {
    'ArrowUp':'↑','ArrowDown':'↓','ArrowLeft':'←','ArrowRight':'→',
    ' ':'Espacio','Escape':'ESC','Enter':'Enter','Shift':'Shift',
    'Control':'Ctrl','Alt':'Alt','Tab':'Tab',
  };
  return map[k] || k?.toUpperCase() || '?';
}

function startRebind(key, el) {
  if (rebindTarget) cancelRebind();
  rebindTarget = { key, el };
  el.classList.add('listening');
  el.textContent = '…';
  document.addEventListener('keydown', onRebindKey, { once: true });
}
function onRebindKey(e) {
  e.preventDefault();
  if (!rebindTarget) return;
  const { key, el } = rebindTarget;
  setSetting(key, e.key);
  el.textContent = formatKey(e.key);
  el.classList.remove('listening');
  rebindTarget = null;
  showToast('⌨️ Tecla actualizada: ' + formatKey(e.key), '#5ab0ff');
}
function cancelRebind() {
  if (!rebindTarget) return;
  rebindTarget.el.classList.remove('listening');
  rebindTarget.el.textContent = formatKey(getSetting(rebindTarget.key));
  rebindTarget = null;
  document.removeEventListener('keydown', onRebindKey);
}
function resetControls() {
  const s = loadSettings();
  const def = SETTINGS_DEFAULT;
  ['p1Up','p1Down','p1Left','p1Right','p1Skill1','p1Skill2','p1Skill3',
   'p2Up','p2Down','p2Left','p2Right','p2Skill1','p2Skill2','p2Skill3'].forEach(k => s[k] = def[k]);
  saveSettings(s);
  renderAjTab('controles');
  showToast('⌨️ Controles restablecidos', '#44ff88');
}

// ══ TAB: CUENTA ═════════════════════════════════════════
function buildCuentaTab(cont) {
  const s  = loadSettings();
  const u  = window.PB?.jugador ?? null;
  const isGuest = !u;

  cont.appendChild(ajSection('Perfil', `
    <div class="aj-profile-row">
      <div class="aj-avatar">🐧</div>
      <div class="aj-profile-info">
        <div class="aj-profile-name">${currentUser || '—'}</div>
        <div class="aj-profile-tag">${isGuest ? 'Cuenta de Invitado' : 'Cuenta Registrada'}</div>
      </div>
    </div>
    ${!isGuest ? `
    <div class="aj-field-row">
      <label class="aj-field-label">Cambiar contraseña</label>
      <div style="display:flex;gap:8px;flex:1">
        <input class="aj-input" type="password" id="aj-pass-old"  placeholder="Contraseña actual"  maxlength="32">
        <input class="aj-input" type="password" id="aj-pass-new"  placeholder="Nueva contraseña"   maxlength="32">
        <input class="aj-input" type="password" id="aj-pass-new2" placeholder="Confirmar"           maxlength="32">
        <button class="aj-action-btn" onclick="changePassword()">Guardar</button>
      </div>
    </div>` : ''}
  `));

  cont.appendChild(ajSection('Preferencias de Juego', `
    ${ajSelect('language', s.language, 'Idioma', [
      {val:'es',label:'Español'},{val:'en',label:'English (próx.)'},{val:'pt',label:'Português (próx.)'},
    ])}
    ${ajSelect('region', s.region, 'Región', [
      {val:'latam',label:'Latinoamérica'},{val:'na',label:'Norteamérica'},{val:'eu',label:'Europa'},
    ])}
  `));

  cont.appendChild(ajSection('Privacidad', `
    ${ajToggle('showStatus',   s.showStatus,   'Mostrar mi estado en línea')}
    ${ajToggle('publicProfile',s.publicProfile,'Perfil público')}
    ${ajToggle('chatFilter',   s.chatFilter,   'Filtro de chat')}
  `));

  cont.appendChild(ajSection('Zona Peligrosa', `
    <div class="aj-danger-zone">
      <div class="aj-danger-item">
        <div>
          <div class="aj-danger-title">Cerrar sesión</div>
          <div class="aj-danger-desc">Saldrás de tu cuenta en este dispositivo</div>
        </div>
        <button class="aj-danger-btn secondary" onclick="doLogout()">Cerrar sesión</button>
      </div>
      <div class="aj-danger-item">
        <div>
          <div class="aj-danger-title">Borrar datos de progreso</div>
          <div class="aj-danger-desc">Reinicia monedas, inventario y estadísticas. Irreversible.</div>
        </div>
        <button class="aj-danger-btn" onclick="confirmResetProgress()">Borrar progreso</button>
      </div>
    </div>
  `));

  bindToggles(cont);
  bindSelects(cont);
}

async function changePassword() {
  const oldPass = document.getElementById('aj-pass-old')?.value.trim();
  const nw      = document.getElementById('aj-pass-new')?.value.trim();
  const nw2     = document.getElementById('aj-pass-new2')?.value.trim();

  if (!window._sb || !window.PB?.jugador) return;
  if (nw.length < 4)  { showToast('❌ Mínimo 4 caracteres', '#ff8844'); return; }
  if (nw !== nw2)     { showToast('❌ Las contraseñas no coinciden', '#ff8844'); return; }

  // Verificar contraseña actual re-autenticando
  const email = window.PB.jugador.correo;
  const { error: signErr } = await window._sb.auth.signInWithPassword({ email, password: oldPass });
  if (signErr) { showToast('❌ Contraseña actual incorrecta', '#ff4444'); return; }

  // Cambiar contraseña en Supabase Auth
  const { error } = await window._sb.auth.updateUser({ password: nw });
  if (error) { showToast('❌ Error: ' + error.message, '#ff4444'); return; }

  showToast('✅ Contraseña actualizada', '#44ff88');
  ['aj-pass-old','aj-pass-new','aj-pass-new2'].forEach(id => { const el=document.getElementById(id); if(el)el.value=''; });
}

async function confirmResetProgress() {
  const confirmed = confirm('⚠️ ¿Borrar todo el progreso? Esta acción es IRREVERSIBLE.\n\nSe borrarán:\n• Monedas\n• Inventario\n• Estadísticas');
  if (!confirmed) return;
  const sb  = window._sb;
  const jug = window.PB?.jugador;
  if (!sb || !jug?.id) return;

  try {
    // Resetear monedero a valores iniciales
    const { error } = await sb.from('monedero_jugador')
      .update({ peces:500, krill:0, piedras:0, perlas:0, actualizado_en: new Date().toISOString() })
      .eq('jugador_id', jug.id);
    if (error) { showToast('❌ Error al resetear: ' + error.message, '#ff4444'); return; }

    // Borrar colección (excepto pingüinos base que no están en DB)
    await sb.from('coleccion_jugador').delete().eq('jugador_id', jug.id);

    // Actualizar estado local
    if (window.PB.monedero) {
      window.PB.monedero = { peces:500, krill:0, piedras:0, perlas:0 };
    }
    window.PB._ownedChars     = ['polar','chili'];
    window.PB._ownedSkins     = [];
    window.PB._ownedIcons     = [];
    window.PB._ownedFondos    = [];
    window.PB._ownedReacciones= [];

    updateTopbarCurrencies();
    if (typeof syncOwnedChars === 'function') syncOwnedChars();
    showToast('🔄 Progreso reiniciado', '#ff8844');
  } catch(e) {
    showToast('❌ Error de conexión', '#ff4444');
  }
}

// ══ TAB: ACCESIBILIDAD ══════════════════════════════════
function buildAccesibilidadTab(cont) {
  const s = loadSettings();
  cont.appendChild(ajSection('Texto e Interfaz', `
    ${ajSelect('fontSize', s.fontSize, 'Tamaño de texto', [
      {val:'pequeño',label:'Pequeño'},{val:'normal',label:'Normal'},{val:'grande',label:'Grande'},
    ])}
  `));
  cont.appendChild(ajSection('Visión', `
    ${ajSelect('colorblind', s.colorblind, 'Modo daltonismo', [
      {val:'ninguno',label:'Ninguno (predeterminado)'},
      {val:'deuteranopia',label:'Deuteranopía (verde-rojo)'},
      {val:'protanopia',  label:'Protanopía (rojo)'},
      {val:'tritanopia',  label:'Tritanopía (azul-amarillo)'},
    ])}
    ${ajToggle('highContrast', s.highContrast, 'Alto contraste')}
  `));
  cont.appendChild(ajSection('Movimiento y Animaciones', `
    ${ajToggle('reduceMotion', s.reduceMotion, 'Reducir movimiento y animaciones')}
  `));
  cont.appendChild(ajSection('Audio / Texto', `
    ${ajToggle('subtitles', s.subtitles, 'Subtítulos y avisos de texto')}
  `));
  bindToggles(cont);
  bindSelects(cont);
}

// ══ COMPONENTES UI ══════════════════════════════════════
function ajSection(title, innerHtml) {
  const div = document.createElement('div');
  div.className = 'aj-section';
  div.innerHTML = `
    ${title ? `<div class="aj-section-title">${title}</div>` : ''}
    <div class="aj-section-body">${innerHtml}</div>
  `;
  return div;
}

function ajSlider(key, val, label, icon) {
  return `
    <div class="aj-row">
      <span class="aj-row-label">${label}</span>
      <div class="aj-slider-wrap">
        <span class="aj-slider-icon">${icon}</span>
        <input class="aj-slider" type="range" min="0" max="100" value="${val}"
               data-key="${key}">
        <span class="aj-slider-val" id="sv-${key}">${val}%</span>
      </div>
    </div>`;
}

function ajToggle(key, val, label) {
  return `
    <div class="aj-row">
      <span class="aj-row-label">${label}</span>
      <label class="aj-toggle">
        <input type="checkbox" data-key="${key}" ${val ? 'checked' : ''}
               onchange="setSetting('${key}',this.checked)">
        <span class="aj-toggle-track"></span>
      </label>
    </div>`;
}

function ajSelect(key, val, label, options) {
  return `
    <div class="aj-row">
      <span class="aj-row-label">${label}</span>
      <select class="aj-select" data-key="${key}">
        ${options.map(o => `<option value="${o.val}" ${String(o.val)===String(val)?'selected':''}>${o.label}</option>`).join('')}
      </select>
    </div>`;
}

// ── Bind events tras insertar HTML ──────────────────────
function bindSliders(cont) {
  cont.querySelectorAll('.aj-slider').forEach(sl => {
    const key = sl.dataset.key;
    const valEl = document.getElementById('sv-' + key);
    sl.addEventListener('input', () => {
      const v = parseInt(sl.value);
      if (valEl) valEl.textContent = v + '%';
      setSetting(key, v);
    });
  });
}
function bindToggles(cont) {
  cont.querySelectorAll('input[type="checkbox"][data-key]').forEach(cb => {
    cb.addEventListener('change', () => setSetting(cb.dataset.key, cb.checked));
  });
}
function bindSelects(cont) {
  cont.querySelectorAll('.aj-select[data-key]').forEach(sel => {
    sel.addEventListener('change', () => {
      const v = isNaN(sel.value) ? sel.value : Number(sel.value);
      setSetting(sel.dataset.key, v);
    });
  });
}

// ── Reset all ────────────────────────────────────────────
function resetSettings() {
  const confirmed = confirm('¿Restablecer todos los ajustes a los valores predeterminados?');
  if (!confirmed) return;
  saveSettings({ ...SETTINGS_DEFAULT });
  applySettings(SETTINGS_DEFAULT);
  renderAjTab(currentAjusteTab);
  showToast('↺ Ajustes restablecidos', '#5ab0ff');
}

// Aplicar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  applySettings(loadSettings());
});