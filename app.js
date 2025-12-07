// app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const helmet = require('helmet');

const { initDb } = require('./models');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');

const app = express();

// ───────────────────────────────
// Seguridad básica HTTP
// ───────────────────────────────
app.use(helmet());

// ───────────────────────────────
// Vistas y archivos estáticos
// ───────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// Para leer los datos de los formularios (POST)
app.use(express.urlencoded({ extended: false }));

// ───────────────────────────────
// Sesiones y mensajes flash
// ───────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secreto_dev',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

// Variables disponibles en TODAS las vistas
app.use((req, res, next) => {
  res.locals.mensaje = req.flash('mensaje');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  next();
});

// ───────────────────────────────
// Rutas principales
// ───────────────────────────────
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);

// Página de inicio
app.get('/', (req, res) => {
  res.render('layout', {
    title: 'Inicio',
    body: `
      <h2>Bienvenido al sistema de librería</h2>
      <p>Inicia sesión o regístrate para gestionar los libros.</p>
    `,
  });
});

// (Opcional) 404 simple
app.use((req, res) => {
  res.status(404).render('layout', {
    title: 'Página no encontrada',
    body: '<h2>404 - Página no encontrada</h2>',
  });
});

// ───────────────────────────────
// Inicializar BD y levantar servidor
// ───────────────────────────────
initDb()
  .then(() => {
    const PORT = process.env.PORT || 3000;

    console.log('Base de datos sincronizada correctamente');
    console.log('Servidor escuchando en puerto ' + PORT);

    app.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('🔥 ERROR INICIALIZANDO LA BASE DE DATOS 🔥');
    console.error(err);
    process.exit(1);
  });