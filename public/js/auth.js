// ================================================================
//  PENGUBRAWL — auth.js  v1.0.8.5
//  Maneja: sesión persistente, enterDash, logout, y helpers auth.
//  Se carga ANTES del override doLogin al final del body.
// ================================================================

/* ── 1. CONSTANTES ─────────────────────────────────────────────── */
const PB_SESSION_KEY = 'pb-auth';   // storageKey del cliente Supabase
const PB_USER_KEY    = 'pb_user';   // nombre del jugador guardado localmente

/* ── 2. ESPERA A QUE EL DOM ESTÉ LISTO ─────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});

/* ── 3. INICIALIZACIÓN DE AUTENTICACIÓN ─────────────────────────── */
async function initAuth() {
  const sb = window._sb;
  if (!sb) {
    // Supabase aún no cargó; esperar un tick y reintentar
    setTimeout(initAuth, 150);
    return;
  }

  // Escuchar cambios de sesión (login, logout, token refresh)
  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      await onSignedIn(session.user);
    } else if (event === 'SIGNED_OUT') {
      onSignedOut();
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      // Silencioso — sesión ya activa, solo actualizar estado
      window.currentAuthUser = session.user;
    }
  });

  // Verificar sesión existente al cargar la página
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) {
      await onSignedIn(session.user);
    } else {
      showLogin();
    }
  } catch (err) {
    console.warn('[auth.js] getSession error:', err);
    showLogin();
  }
}

/* ── 4. EVENTO: SESIÓN INICIADA ─────────────────────────────────── */
async function onSignedIn(authUser) {
  window.currentAuthUser = authUser;

  try {
    const sb = window._sb;
    // Obtener datos del jugador desde la tabla jugadores
    const { data: jugador, error } = await sb
      .from('jugadores')
      .select('usuario, nivel_jugador, icono_id, pinguino_fav1_id, pinguino_fav2_id, pinguino_fav3_id')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    if (error) {
      console.warn('[auth.js] Error obteniendo jugador:', error.message);
    }

    const displayName = jugador?.usuario
      || authUser.user_metadata?.usuario
      || authUser.email?.split('@')[0]
      || 'Jugador';

    window.currentUser     = displayName;
    window.currentAuthUser = authUser;

    // Poblar estado global PB (usado por monedero, perfil, etc.)
    if (window.PB) {
      window.PB.jugador = jugador || null;
    }

    // Guardar para restauración rápida
    try { localStorage.setItem(PB_USER_KEY, displayName); } catch(_) {}

    hideAuthUI();
    document.getElementById('login')?.classList.add('hidden');

    if (typeof enterDash === 'function') {
      enterDash(displayName, jugador);
    }
  } catch (err) {
    console.error('[auth.js] onSignedIn error:', err);
    // Entrar al dashboard de todas formas con info básica
    const fallbackName = authUser.user_metadata?.usuario
      || authUser.email?.split('@')[0]
      || 'Jugador';
    window.currentUser = fallbackName;
    hideAuthUI();
    document.getElementById('login')?.classList.add('hidden');
    if (typeof enterDash === 'function') enterDash(fallbackName, null);
  }
}

/* ── 5. EVENTO: SESIÓN CERRADA ──────────────────────────────────── */
function onSignedOut() {
  window.currentAuthUser = null;
  window.currentUser     = null;
  try { localStorage.removeItem(PB_USER_KEY); } catch(_) {}
  showLogin();
}

/* ── 6. LOGOUT PÚBLICO ──────────────────────────────────────────── */
async function doLogout() {
  try {
    const sb = window._sb;
    if (sb) await sb.auth.signOut();
  } catch(err) {
    console.warn('[auth.js] signOut error:', err);
  }
  onSignedOut();
}

/* ── 7. ENTER DASHBOARD ──────────────────────────────────────────
   Muestra el dashboard y actualiza nombre en topbar / perfil.
   jugadorData puede ser null si el jugador aún no tiene fila.
   ─────────────────────────────────────────────────────────────── */
function enterDash(username, jugadorData) {
  const dash = document.getElementById('dashboard');
  if (!dash) return;
  dash.classList.remove('hidden');

  // Topbar
  const tbName = document.getElementById('tb-pname');
  if (tbName) tbName.textContent = username || '—';

  // Perfil
  const profUname = document.getElementById('prof-uname');
  if (profUname) profUname.textContent = username || '—';

  // Cargar monedero si hay función disponible
  if (typeof loadMonedero === 'function') {
    loadMonedero().catch(() => {});
  }

  // Ir a la página de inicio por defecto
  if (typeof navTo === 'function') {
    navTo('home');
  }

  // Toast de bienvenida
  if (typeof showToast === 'function') {
    showToast(`¡Bienvenido, ${username}! 🐧`, '#44ff88');
  }
}

/* ── 8. HELPERS DE VISIBILIDAD AUTH ─────────────────────────────── */
// Estas funciones son usadas por index.html también — se definen aquí
// como base y el inline del HTML puede sobreescribirlas.

if (typeof showLogin === 'undefined') {
  window.showLogin = function showLogin() {
    const login = document.getElementById('login');
    const dash  = document.getElementById('dashboard');
    const game  = document.getElementById('game-wrap');
    const bg    = document.getElementById('auth-bg-layer');
    const chbg  = document.getElementById('auth-change-bg');
    const ver   = document.querySelector('.auth-ver');
    const bar   = document.getElementById('auth-bar');
    if (login)  login.classList.remove('hidden');
    if (dash)   dash.classList.add('hidden');
    if (game)   game.classList.add('hidden');
    if (bg)     bg.style.display = '';
    if (chbg)   chbg.style.display = '';
    if (ver)    ver.style.display = '';
    if (bar)    bar.style.display = '';
  };
}

if (typeof hideAuthUI === 'undefined') {
  window.hideAuthUI = function hideAuthUI() {
    const bg   = document.getElementById('auth-bg-layer');
    const chbg = document.getElementById('auth-change-bg');
    const ver  = document.querySelector('.auth-ver');
    const bar  = document.getElementById('auth-bar');
    if (bg)   bg.style.display   = 'none';
    if (chbg) chbg.style.display = 'none';
    if (ver)  ver.style.display  = 'none';
    if (bar)  bar.style.display  = 'none';
  };
}

/* ── 9. OAUTH PLACEHOLDERS (Google / Facebook) ───────────────────
   Implementación base. Se puede activar en Supabase Dashboard →
   Authentication → Providers. Solo se necesita habilitar el
   proveedor y añadir las credenciales OAuth.
   ─────────────────────────────────────────────────────────────── */
async function doLoginGoogle() {
  const sb = window._sb;
  if (!sb) return;
  try {
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) {
      if (typeof showToast === 'function') showToast('❌ ' + error.message, '#ff6666');
      else console.error('[auth.js] Google OAuth error:', error.message);
    }
  } catch(err) {
    if (typeof showToast === 'function') showToast('Google OAuth próximamente 🔧', '#7ab8ff');
  }
}

async function doLoginFacebook() {
  const sb = window._sb;
  if (!sb) return;
  try {
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: window.location.origin }
    });
    if (error) {
      if (typeof showToast === 'function') showToast('❌ ' + error.message, '#ff6666');
      else console.error('[auth.js] Facebook OAuth error:', error.message);
    }
  } catch(err) {
    if (typeof showToast === 'function') showToast('Facebook OAuth próximamente 🔧', '#1877f2');
  }
}

/* ── 10. doLogin BASE (sobreescrito por el inline al final del body) ─
   Esta versión base usa #lu y #lp igual que el override.
   Al cargarse auth.js primero, esta queda como fallback.
   El override inline en index.html la reemplaza correctamente.
   ─────────────────────────────────────────────────────────────── */
window.doLogin = async function doLogin() {
  const user = (document.getElementById('lu')?.value || '').trim();
  const pass  = document.getElementById('lp')?.value || '';
  const err   = document.getElementById('login-err');
  if (!err) return;

  if (!user || !pass) { err.textContent = 'Completa usuario y contraseña.'; return; }
  err.textContent = '⏳ Ingresando...';

  try {
    const sb = window._sb;
    if (!sb) { err.textContent = '❌ Error: cliente no inicializado.'; return; }

    let email = user;
    if (!user.includes('@')) {
      const { data, error: selErr } = await sb
        .from('jugadores')
        .select('correo')
        .eq('usuario', user)
        .maybeSingle();
      if (selErr || !data) { err.textContent = '❌ Usuario no encontrado.'; return; }
      email = data.correo;
    }

    const { error: authErr } = await sb.auth.signInWithPassword({ email, password: pass });
    if (authErr) {
      err.textContent = '❌ ' + (authErr.message || 'Contraseña incorrecta.');
      return;
    }
    // onAuthStateChange → SIGNED_IN → onSignedIn se encarga del resto
    err.textContent = '';
  } catch(e) {
    err.textContent = '❌ Error de conexión.';
    console.error('[auth.js] doLogin error:', e);
  }
};

/* ── 11. doReg BASE ────────────────────────────────────────────────
   La versión completa ya está en el <script> inline de index.html.
   Esta solo existe como fallback vacío para evitar errores si se
   llama antes de que el inline esté definido.
   ─────────────────────────────────────────────────────────────── */
if (typeof window.doReg === 'undefined') {
  window.doReg = function() {
    console.warn('[auth.js] doReg: esperando versión inline del HTML...');
  };
}

/* ── 12. showToast FALLBACK ─────────────────────────────────────── */
if (typeof window.showToast === 'undefined') {
  window.showToast = function showToast(msg, color) {
    // Implementación mínima si main.js aún no cargó
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position: 'fixed', bottom: '24px', left: '50%',
      transform: 'translateX(-50%)',
      background: color || '#333', color: '#fff',
      padding: '10px 20px', borderRadius: '10px',
      fontSize: '13px', fontFamily: 'Nunito, sans-serif',
      zIndex: '9999', pointerEvents: 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,.4)',
      transition: 'opacity .3s'
    });
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 350); }, 2400);
  };
}