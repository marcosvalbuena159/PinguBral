// ============================================================
//  supabase-client.js  — PenguBrawl
//  Cargado PRIMERO en index.html, antes de auth.js y main.js.
//  Expone el cliente como window._sb (nombre usado en toda la app).
// ============================================================

const SUPABASE_URL = 'https://uqtoprfpfgxejdvsmlvo.supabase.co';
// ⚠️  Usa siempre el anon/public JWT key (empieza con "eyJ...").
//     La clave "sb_publishable_..." es para otro SDK y NO funciona aquí.
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdG9wcmZwZmd4ZWpkdnNtbHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTQwNjMsImV4cCI6MjA5MTA5MDA2M30.R8z5OTezM1TtivcXoVWRtZ2EM_u7HYn8BzybFFE84M4';

// Inicializar cliente con storageKey único para evitar conflictos GoTrueClient
window._sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { storageKey: 'pb-auth' }
});

// Alias por compatibilidad (algunos archivos pueden usar window.sb)
window.sb = window._sb;

// Estado global del jugador (se llena al hacer login en auth.js)
window.PB = {
  session:  null,   // sesión de Supabase Auth
  jugador:  null,   // fila de la tabla jugadores
  monedero: null,   // fila de monedero_jugador
};

console.log('✅ Supabase client listo — window._sb OK');