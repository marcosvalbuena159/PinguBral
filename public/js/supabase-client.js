// ============================================================
//  supabase-client.js
//  Coloca este archivo en: public/JS/supabase-client.js
//  Este archivo debe cargarse PRIMERO en el index.html,
//  antes que cualquier otro JS del juego.
// ============================================================

// Supabase se carga desde CDN en el index.html (ver instrucciones).
// Aquí solo inicializamos el cliente y lo exponemos globalmente.

const SUPABASE_URL = 'https://uqtoprfpfgxejdvsmlvo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AyjHbCHVb0OSu5_6JSVIug_QB7P8QkH';

// window.sb = cliente global accesible desde cualquier JS
window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Estado global del jugador (se llena al hacer login)
window.PB = {
  session:  null,   // sesión de Supabase Auth
  jugador:  null,   // fila de la tabla jugadores
  monedero: null,   // fila de monedero_jugador
};

console.log('✅ Supabase client listo');
