const express = require('express');
const path    = require('path');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, '../public')));

// API de estado (opcional)
app.get('/api/status', (req, res) => {
  res.json({ status: 'PenguBrawl Online' });
});

// Cualquier otra ruta devuelve index.html (SPA)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Solo escuchar en local (Vercel no usa app.listen)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🐧 PenguBrawl en local: http://localhost:${PORT}`);
  });
}

module.exports = app;