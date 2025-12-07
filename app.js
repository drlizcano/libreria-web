// app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const helmet = require('helmet');
const csrf = require('csurf');

const { initDb } = require('./models');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');

const app = express();

// Seguridad básica HTTP
app.use(helmet());

// Vistas y archivos estáticos
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Parseo de formularios
app.use(express.urlencoded({ extended: false }));

// Sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secreto_dev',
    resave: false,
    saveUninitialized: false
  })
);

app.use(flash());

// CSRF
const csrfProtection = csrf();
app.use(csrfProtection);

// Variables globales
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.mensaje = req.flash('mensaje');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  next();
});

// Rutas
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);

// Home
app.get('/', (req, res) => {
  res.render('layout', {
    title: 'Inicio',
    body: `
      <h1>Bienvenido al sistema de librería</h1>
      <p>Inicia sesión o regístrate para gestionar los libros.</p>
    `
  });
});

// Inicializar BD y levantar servidor
initDb()
  .then(() => {
    const PORT = process.env.PORT || 3000;

    console.log("Base de datos inicializada correctamente");

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error("🔥 ERROR INICIALIZANDO LA BASE DE DATOS 🔥");
    console.error(err);
    process.exit(1); // <--- Esto obliga a Render a mostrar el error
  });

