// ============================================================
//  auth.js  —  Login · Registro · Logout · Sesión persistente
//  Coloca en: public/JS/auth.js
//  Requiere: supabase-client.js cargado antes
// ============================================================

// ── Helpers de UI ──────────────────────────────────────────

function authLoading(on) {
  // Muestra/oculta barra de progreso del login
  const bar = document.getElementById('auth-bar');
  if (bar) bar.style.width = on ? '100%' : '0';
}

function showErr(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
}

function clearErr(id) { showErr(id, ''); }

// ── Navegación entre pantallas de auth ────────────────────

function showLogin() {
  document.getElementById('login').classList.remove('hidden');
  document.getElementById('register').classList.add('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  clearErr('li-err');
}

function showReg() {
  document.getElementById('login').classList.add('hidden');
  document.getElementById('register').classList.remove('hidden');
  clearErr('reg-err');
}

// ── Cargar datos del jugador en el dashboard ───────────────

async function cargarJugador(authUserId) {
  // 1. Obtener fila del jugador
  const { data: jugador, error } = await window.sb
    .from('jugadores')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();

  if (error || !jugador) {
    console.error('Error cargando jugador:', error);
    return null;
  }

  window.PB.jugador = jugador;

  // 2. Obtener monedero
  const { data: monedero } = await window.sb
    .from('monedero_jugador')
    .select('*')
    .eq('jugador_id', jugador.id)
    .single();

  window.PB.monedero = monedero;

  return jugador;
}

function aplicarJugadorUI(jugador, monedero) {
  // Topbar — nombre
  const tbName = document.getElementById('tb-pname');
  if (tbName) tbName.textContent = jugador.usuario;

  // Topbar — avatar (icono del jugador, por ahora emoji genérico)
  // cuando tengas iconos reales, aquí iría la imagen

  // Monedero
  if (monedero) {
    setCV('c-peces',   monedero.peces);
    setCV('c-krill',   monedero.krill);
    setCV('c-piedras', monedero.piedras);
    setCV('c-perlas',  monedero.perlas);
  }
}

function setCV(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = Number(valor).toLocaleString('es');
}

// ── Abrir dashboard tras login exitoso ────────────────────

async function abrirDashboard(authUserId) {
  const jugador = await cargarJugador(authUserId);
  if (!jugador) {
    showErr('li-err', 'No se encontró tu perfil. Contacta soporte.');
    showLogin();
    return;
  }

  aplicarJugadorUI(jugador, window.PB.monedero);

  document.getElementById('login').classList.add('hidden');
  document.getElementById('register').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');

  // Ir a la página de inicio por defecto
  if (typeof navTo === 'function') navTo('home');

  console.log('✅ Bienvenido,', jugador.usuario);
}

// ── LOGIN ──────────────────────────────────────────────────

async function doLogin() {
  clearErr('li-err');

  const usuario  = document.getElementById('li-u').value.trim();
  const password = document.getElementById('li-p').value;

  if (!usuario || !password) {
    showErr('li-err', 'Completa usuario y contraseña.');
    return;
  }

  authLoading(true);

  try {
    // Buscar el correo asociado a ese usuario
    // (Supabase Auth usa correo, nosotros guardamos el alias en jugadores)
    const { data: jugadorData, error: buscarErr } = await window.sb
      .from('jugadores')
      .select('correo')
      .eq('usuario', usuario)
      .single();

    if (buscarErr || !jugadorData) {
      showErr('li-err', 'Usuario no encontrado.');
      authLoading(false);
      return;
    }

    // Login con correo + contraseña en Supabase Auth
    const { data, error } = await window.sb.auth.signInWithPassword({
      email:    jugadorData.correo,
      password: password,
    });

    if (error) {
      showErr('li-err', tradError(error.message));
      authLoading(false);
      return;
    }

    window.PB.session = data.session;
    await abrirDashboard(data.user.id);

  } catch (e) {
    showErr('li-err', 'Error de conexión. Intenta de nuevo.');
    console.error(e);
  }

  authLoading(false);
}

// ── LOGIN COMO INVITADO ────────────────────────────────────

async function doGuest() {
  clearErr('li-err');
  authLoading(true);

  // Anon sign-in de Supabase (debe estar habilitado en Auth → Providers → Anonymous)
  const { data, error } = await window.sb.auth.signInAnonymously();

  if (error) {
    showErr('li-err', 'Modo invitado no disponible ahora.');
    authLoading(false);
    return;
  }

  // Para invitados creamos un jugador temporal en memoria (no en BD)
  window.PB.session = data.session;
  window.PB.jugador = {
    id:       data.user.id,
    usuario:  'Invitado_' + Math.floor(Math.random() * 9999),
    nivel_jugador: 1,
    region:   '—',
  };
  window.PB.monedero = { peces: 0, krill: 0, piedras: 0, perlas: 0 };

  aplicarJugadorUI(window.PB.jugador, window.PB.monedero);

  document.getElementById('login').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  if (typeof navTo === 'function') navTo('home');

  authLoading(false);
}

// ── REGISTRO ───────────────────────────────────────────────

async function doReg() {
  clearErr('reg-err');

  const usuario = document.getElementById('ru').value.trim();
  const pass1   = document.getElementById('rp').value;
  const pass2   = document.getElementById('rp2').value;

  // Validaciones básicas
  if (usuario.length < 3) {
    showErr('reg-err', 'El usuario debe tener al menos 3 caracteres.');
    return;
  }
  if (!/^[a-zA-Z0-9_]+$/.test(usuario)) {
    showErr('reg-err', 'Solo letras, números y guión bajo.');
    return;
  }
  if (pass1.length < 4) {
    showErr('reg-err', 'La contraseña debe tener al menos 4 caracteres.');
    return;
  }
  if (pass1 !== pass2) {
    showErr('reg-err', 'Las contraseñas no coinciden.');
    return;
  }

  authLoading(true);

  try {
    // Verificar que el usuario no exista ya
    const { data: existe } = await window.sb
      .from('jugadores')
      .select('id')
      .eq('usuario', usuario)
      .maybeSingle();

    if (existe) {
      showErr('reg-err', 'Ese nombre de usuario ya está en uso.');
      authLoading(false);
      return;
    }

    // Crear correo interno único basado en el usuario
    // (el jugador no necesita ingresar correo real en tu flujo actual)
    const correoInterno = `${usuario.toLowerCase()}@pengubrawl.game`;

    // Crear cuenta en Supabase Auth
    const { data, error } = await window.sb.auth.signUp({
      email:    correoInterno,
      password: pass1,
    });

    if (error) {
      showErr('reg-err', tradError(error.message));
      authLoading(false);
      return;
    }

    // Insertar fila en la tabla jugadores
    const { error: insertErr } = await window.sb
      .from('jugadores')
      .insert({
        auth_user_id: data.user.id,
        usuario:      usuario,
        correo:       correoInterno,
        metodo_auth:  'email',
      });

    if (insertErr) {
      showErr('reg-err', 'Error al crear el perfil: ' + insertErr.message);
      authLoading(false);
      return;
    }

    // Login automático tras registro
    window.PB.session = data.session;
    if (data.session) {
      await abrirDashboard(data.user.id);
    } else {
      // Supabase puede pedir confirmación de email según tu config
      showErr('reg-err', '');
      document.getElementById('reg-err').style.color = '#7cffb2';
      showErr('reg-err', '✅ Cuenta creada. Iniciando sesión...');
      // Hacer login manual
      const { data: loginData, error: loginErr } = await window.sb.auth.signInWithPassword({
        email:    correoInterno,
        password: pass1,
      });
      if (!loginErr && loginData.session) {
        window.PB.session = loginData.session;
        await abrirDashboard(loginData.user.id);
      } else {
        showErr('reg-err', '✅ Cuenta creada. Ya puedes iniciar sesión.');
        setTimeout(showLogin, 2000);
      }
    }

  } catch (e) {
    showErr('reg-err', 'Error de conexión. Intenta de nuevo.');
    console.error(e);
  }

  authLoading(false);
}

// ── CERRAR SESIÓN ──────────────────────────────────────────

async function doLogout() {
  await window.sb.auth.signOut();
  window.PB.session  = null;
  window.PB.jugador  = null;
  window.PB.monedero = null;
  showLogin();
}

// ── SESIÓN PERSISTENTE al recargar la página ───────────────

async function initAuth() {
  const { data: { session } } = await window.sb.auth.getSession();

  if (session) {
    window.PB.session = session;
    await abrirDashboard(session.user.id);
  } else {
    showLogin();
  }

  // Escuchar cambios de sesión (token refresh, logout externo, etc.)
  window.sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
      showLogin();
    }
    if (event === 'TOKEN_REFRESHED' && session) {
      window.PB.session = session;
    }
  });
}

// ── Traducir mensajes de error de Supabase al español ─────

function tradError(msg) {
  if (!msg) return 'Error desconocido.';
  if (msg.includes('Invalid login credentials'))  return 'Usuario o contraseña incorrectos.';
  if (msg.includes('Email not confirmed'))         return 'Confirma tu correo primero.';
  if (msg.includes('User already registered'))     return 'Ese correo ya está registrado.';
  if (msg.includes('Password should be'))         return 'La contraseña es muy corta.';
  if (msg.includes('Unable to validate'))         return 'Credenciales inválidas.';
  if (msg.includes('rate limit'))                 return 'Demasiados intentos. Espera un momento.';
  return msg;
}

// ── Arranque (initAuth es llamado desde window.load en main.js) ──────────────────
// initAuth se expone globalmente; main.js la llama en window.load.