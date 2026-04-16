// ============================================================
//  auth.js — Login · Registro completo · OAuth · Sesión
//  Campos: usuario, correo, teléfono, región, contraseña x2,
//          términos y condiciones, Google, Facebook
// ============================================================

function authLoading(on){
  const bar=document.getElementById('auth-bar');
  if(bar){bar.style.width=on?'100%':'0';bar.style.transition=on?'width 1.2s ease':'none';}
}
function showErr(id,msg,ok=false){
  const el=document.getElementById(id);if(!el)return;
  el.textContent=msg;el.style.display=msg?'block':'none';el.style.color=ok?'#66ff88':'#ff6b6b';
}
function clearErr(id){showErr(id,'');}

function showLogin(){
  _show('login');_hide('register');_hide('dashboard');clearErr('li-err');
  document.getElementById('li-u').value='';document.getElementById('li-p').value='';
}
function showReg(){_hide('login');_show('register');clearErr('reg-err');}
function _show(id){document.getElementById(id)?.classList.remove('hidden');}
function _hide(id){document.getElementById(id)?.classList.add('hidden');}

async function cargarJugador(authUserId){
  const{data:jugador,error}=await window.sb.from('jugadores').select('*').eq('auth_user_id',authUserId).single();
  if(error||!jugador){console.error('cargarJugador:',error);return null;}
  window.PB.jugador=jugador;
  const{data:monedero}=await window.sb.from('monedero_jugador').select('*').eq('jugador_id',jugador.id).single();
  window.PB.monedero=monedero??{peces:0,krill:0,piedras:0,perlas:0};
  return jugador;
}

async function abrirDashboard(authUserId){
  const jugador=await cargarJugador(authUserId);
  if(!jugador){showErr('li-err','No se encontró tu perfil. Contacta soporte.');authLoading(false);showLogin();return;}
  _hide('login');_hide('register');_show('dashboard');
  const tbName=document.getElementById('tb-pname');if(tbName)tbName.textContent=jugador.usuario;
  if(typeof initPerfilMonedero==='function')initPerfilMonedero();
  if(typeof navTo==='function')navTo('home');
  console.log('✅ Sesión iniciada:',jugador.usuario);
}

async function doLogin(){
  clearErr('li-err');
  const usuario=document.getElementById('li-u').value.trim();
  const pass=document.getElementById('li-p').value;
  if(!usuario||!pass){showErr('li-err','Completa usuario y contraseña.');return;}
  authLoading(true);
  try{
    const{data:row,error:e1}=await window.sb.from('jugadores').select('correo').eq('usuario',usuario).single();
    if(e1||!row){showErr('li-err','Usuario no encontrado.');authLoading(false);return;}
    const{data,error}=await window.sb.auth.signInWithPassword({email:row.correo,password:pass});
    if(error){showErr('li-err',_tradErr(error.message));authLoading(false);return;}
    window.PB.session=data.session;
    await abrirDashboard(data.user.id);
  }catch(e){showErr('li-err','Error de conexión.');console.error(e);}
  authLoading(false);
}

async function doGuest(){
  clearErr('li-err');authLoading(true);
  const alias='Invitado_'+Math.floor(Math.random()*9999);
  const{data,error}=await window.sb.auth.signInAnonymously();
  if(error){
    window.PB.jugador={id:'guest',usuario:alias,nivel_jugador:1,region:'—',codigo_perfil:'GUEST'};
    window.PB.monedero={peces:500,krill:100,piedras:0,perlas:0};window.PB.session=null;
    _hide('login');_show('dashboard');
    const tbName=document.getElementById('tb-pname');if(tbName)tbName.textContent=alias;
    if(typeof initPerfilMonedero==='function')initPerfilMonedero();
    if(typeof navTo==='function')navTo('home');authLoading(false);
    showToast('👤 Entrando como invitado (sin guardar progreso)','#aaa');return;
  }
  window.PB.session=data.session;
  window.PB.jugador={id:data.user.id,usuario:alias,nivel_jugador:1,region:'—',codigo_perfil:'GUEST'};
  window.PB.monedero={peces:500,krill:100,piedras:0,perlas:0};
  _hide('login');_show('dashboard');
  if(typeof initPerfilMonedero==='function')initPerfilMonedero();
  if(typeof navTo==='function')navTo('home');authLoading(false);
}

async function doReg(){
  clearErr('reg-err');
  const usuario =document.getElementById('ru')?.value.trim()??'';
  const correo  =document.getElementById('re')?.value.trim()??'';
  const tel     =document.getElementById('rt-')?.value.trim()??'';
  const region  =document.getElementById('rr')?.value??'';
  const pass1   =document.getElementById('rp')?.value??'';
  const pass2   =document.getElementById('rp2')?.value??'';
  const terminos=document.getElementById('rtos')?.checked??false;

  if(usuario.length<3){showErr('reg-err','El usuario debe tener mínimo 3 caracteres.');return;}
  if(!/^[a-zA-Z0-9_]+$/.test(usuario)){showErr('reg-err','Usuario: solo letras, números y guión bajo.');return;}
  if(correo&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)){showErr('reg-err','Ingresa un correo válido.');return;}
  if(pass1.length<4){showErr('reg-err','La contraseña debe tener mínimo 4 caracteres.');return;}
  if(pass1!==pass2){showErr('reg-err','Las contraseñas no coinciden.');return;}
  if(!terminos){showErr('reg-err','Debes aceptar los términos y condiciones.');return;}

  authLoading(true);
  try{
    const{data:existe}=await window.sb.from('jugadores').select('id').eq('usuario',usuario).maybeSingle();
    if(existe){showErr('reg-err','Ese nombre de usuario ya está en uso.');authLoading(false);return;}
    const emailAuth=correo||`${usuario.toLowerCase()}@pengubrawl.game`;
    const{data,error}=await window.sb.auth.signUp({email:emailAuth,password:pass1});
    if(error){showErr('reg-err',_tradErr(error.message));authLoading(false);return;}
    const{error:ie}=await window.sb.from('jugadores').insert({
      auth_user_id:data.user.id,usuario,correo:emailAuth,
      telefono:tel||null,region:region||null,metodo_auth:'email',
    });
    if(ie){showErr('reg-err','Error al crear perfil: '+ie.message);authLoading(false);return;}
    window.PB.session=data.session;
    if(data.session){await abrirDashboard(data.user.id);}
    else{
      showErr('reg-err','✅ Cuenta creada. Iniciando sesión...',true);
      const{data:ld,error:le}=await window.sb.auth.signInWithPassword({email:emailAuth,password:pass1});
      if(!le&&ld.session){window.PB.session=ld.session;await abrirDashboard(ld.user.id);}
      else setTimeout(showLogin,2500);
    }
  }catch(e){showErr('reg-err','Error de conexión. Intenta de nuevo.');console.error(e);}
  authLoading(false);
}

async function doLoginGoogle(){
  authLoading(true);
  const{error}=await window.sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}});
  if(error){showErr('li-err','Error con Google: '+error.message);authLoading(false);}
}

async function doLoginFacebook(){
  authLoading(true);
  const{error}=await window.sb.auth.signInWithOAuth({provider:'facebook',options:{redirectTo:window.location.origin}});
  if(error){showErr('li-err','Error con Facebook: '+error.message);authLoading(false);}
}

async function _completarPerfilOAuth(user){
  const{data:existe}=await window.sb.from('jugadores').select('id').eq('auth_user_id',user.id).maybeSingle();
  if(existe)return;
  const base=(user.user_metadata?.full_name||user.email||'Player').split(' ')[0].replace(/[^a-zA-Z0-9]/g,'');
  const alias=base.slice(0,20)+'_'+Math.floor(Math.random()*999);
  const proveedor=user.app_metadata?.provider==='google'?'google':'facebook';
  await window.sb.from('jugadores').insert({auth_user_id:user.id,usuario:alias,correo:user.email??`${alias}@pengubrawl.game`,metodo_auth:proveedor});
}

async function doLogout(){
  await window.sb.auth.signOut();
  window.PB.session=null;window.PB.jugador=null;window.PB.monedero=null;
  if(typeof resetPerfilCache==='function')resetPerfilCache();
  showLogin();
}

async function initAuth(){
  const{data:{session}}=await window.sb.auth.getSession();
  if(session){window.PB.session=session;await abrirDashboard(session.user.id);}
  else showLogin();
  window.sb.auth.onAuthStateChange(async(event,session)=>{
    if(event==='SIGNED_IN'&&session){
      window.PB.session=session;
      const prov=session.user.app_metadata?.provider;
      if(prov==='google'||prov==='facebook')await _completarPerfilOAuth(session.user);
      const dash=document.getElementById('dashboard');
      if(dash?.classList.contains('hidden'))await abrirDashboard(session.user.id);
    }
    if(event==='SIGNED_OUT'){window.PB.session=null;window.PB.jugador=null;showLogin();}
    if(event==='TOKEN_REFRESHED'&&session)window.PB.session=session;
  });
}

function _tradErr(msg){
  if(!msg)return'Error desconocido.';
  if(msg.includes('Invalid login credentials'))return'Usuario o contraseña incorrectos.';
  if(msg.includes('Email not confirmed'))return'Confirma tu correo para ingresar.';
  if(msg.includes('User already registered'))return'Ese correo ya está registrado.';
  if(msg.includes('Password should be'))return'La contraseña debe tener mínimo 6 caracteres.';
  if(msg.includes('rate limit'))return'Demasiados intentos. Espera un momento.';
  return msg;
}