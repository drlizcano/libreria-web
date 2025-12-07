// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');

const { initDb } = require('./config/db');
const { User } = require('./models');      // models/index.js exporta { User, Book }
const bookRoutes = require('./routes/bookRoutes');

const app = express();

// ─────────── Middlewares básicos ───────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔥 SIEMPRE DEFINIR "user" PARA LAS VISTAS EJS (para layout.ejs, libros, etc.)
app.use((req, res, next) => {
  if (typeof res.locals.user === 'undefined') {
    res.locals.user = null;
  }
  next();
});

// ─────────── Motor de vistas y estáticos ───────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// ─────────── Función para HTML simple (login/registro) ───────────
function pageTemplate(title, bodyContent) {
  return `
    <!doctype html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
    </head>
    <body>
      ${bodyContent}
    </body>
    </html>
  `;
}

// ─────────── RUTA RAÍZ ───────────
app.get('/', (req, res) => {
  const html = pageTemplate(
    'Librería Web',
    `
      <h1>Librería Web</h1>
      <p>La aplicación está en funcionamiento.</p>
      <p>Ir a <a href="/auth/login">/auth/login</a> para iniciar sesión.</p>
    `
  );
  res.send(html);
});

// ─────────── LOGIN (GET) ───────────
app.get('/auth/login', (req, res) => {
  console.log('GET /auth/login');
  const html = pageTemplate(
    'Iniciar sesión - Librería Web',
    `
      <h1>Iniciar sesión</h1>

      ${req.query.error ? `<p style="color:red;">${req.query.error}</p>` : ''}

      <form action="/auth/login" method="POST">
        <div>
          <label>Correo:</label>
          <input type="email" name="email" required>
        </div>
        <div>
          <label>Contraseña:</label>
          <input type="password" name="password" required>
        </div>
        <button type="submit">Entrar</button>
      </form>

      <p><a href="/auth/register">Ir a registro</a></p>
      <p><a href="/">Volver al inicio</a></p>
    `
  );
  res.send(html);
});

// ─────────── LOGIN (POST) ───────────
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.redirect(
        '/auth/login?error=' + encodeURIComponent('Usuario no encontrado')
      );
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.redirect(
        '/auth/login?error=' + encodeURIComponent('Contraseña incorrecta')
      );
    }

    // Aquí podrías guardar algo en sesión si quisieras.
    // Por ahora simplemente redirigimos al listado de libros.
    res.redirect('/books');
  } catch (err) {
    console.error('Error en login:', err);
    res.redirect(
      '/auth/login?error=' +
        encodeURIComponent('Error en el servidor. Intenta nuevamente.')
    );
  }
});

// ─────────── REGISTER (GET) ───────────
app.get('/auth/register', (req, res) => {
  console.log('GET /auth/register');
  const html = pageTemplate(
    'Registrarse - Librería Web',
    `
      <h1>Registrarse</h1>

      ${req.query.error ? `<p style="color:red;">${req.query.error}</p>` : ''}

      <form action="/auth/register" method="POST">
        <div>
          <label>Nombre:</label>
          <input type="text" name="nombre" required>
        </div>
        <div>
          <label>Correo:</label>
          <input type="email" name="email" required>
        </div>
        <div>
          <label>Contraseña:</label>
          <input type="password" name="password" required>
        </div>
        <button type="submit">Crear cuenta</button>
      </form>

      <p><a href="/auth/login">Volver al login</a></p>
      <p><a href="/">Volver al inicio</a></p>
    `
  );
  res.send(html);
});

// ─────────── REGISTER (POST) ───────────
app.post('/auth/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.redirect(
        '/auth/register?error=' +
          encodeURIComponent('El correo ya está registrado')
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      nombre,
      email,
      password: hashedPassword,
    });

    res.redirect('/auth/login');
  } catch (err) {
    console.error('Error en registro:', err);
    res.redirect(
      '/auth/register?error=' +
        encodeURIComponent('Error en el servidor. Intenta nuevamente.')
    );
  }
});

// ─────────── RUTAS DE LIBROS (tu sistema original) ───────────
app.use('/books', bookRoutes);

// ─────────── Iniciar BD y servidor ───────────
const PORT = process.env.PORT || 3000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo iniciar la aplicación:', err);
    app.listen(PORT, () => {
      console.log(
        `Servidor iniciado con errores en BD, escuchando en puerto ${PORT}`
      );
    });
  });

module.exports = app;