// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');

const { initDb } = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// ───────────────── Middlewares básicos ─────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Hacer que TODAS las vistas tengan una variable "user"
app.use((req, res, next) => {
  if (typeof res.locals.user === 'undefined') {
    res.locals.user = null;
  }
  next();
});

// ───────────────── Motor de vistas y estáticos ─────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// ───────────────── Rutas ─────────────────
app.use('/books', bookRoutes);
app.use('/auth', authRoutes);

// Ruta raíz → redirige al login
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

// ───────────────── Iniciar BD y servidor ─────────────────
const PORT = process.env.PORT || 3000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo iniciar la aplicación:', err);
    process.exit(1);
  });