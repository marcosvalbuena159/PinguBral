const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Servir archivos estáticos (CSS, JS, Imágenes)
// Esto debe ir ANTES de las rutas
app.use(express.static(path.join(__dirname, '../public')));

// 2. Ruta para la API o pruebas (Opcional)
app.get('/api/status', (req, res) => {
  res.json({ status: 'Udrysko Online' });
});

// 3. LA SOLUCIÓN DEFINITIVA: Usa una función anónima para capturar todo
// En lugar de una cadena con '*' o '(.*)', usamos una función que siempre devuelve true
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // Al final de tu archivo, reemplaza app.listen(...) por esto:

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🐧 Udrysko en local: http://localhost:${PORT}`));
}

module.exports = app; // <--- ESTO ES VITAL PARA VERCEL
});