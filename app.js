// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');

const { initDb } = require('./config/db');
const { User, Book } = require('./models'); // 👈 Asegúrate que models/index.js exporta { User, Book }

const app = express();

// ─────────── Middlewares básicos ───────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Definir "user" para las vistas EJS (por si alguna las usa)
app.use((req, res, next) => {
  if (typeof res.locals.user === 'undefined') {
    res.locals.user = null;
  }
  next();
});

// ─────────── Motor de vistas y estáticos (no rompe nada aunque no usemos EJS) ───────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// ─────────── Función para HTML simple ───────────
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

    // Si todo ok → lista de libros
    res.redirect('/books');
  } catch (err) {
    console.error('Error en login:', err);
    res.redirect(
      '/auth/login?error=' +
        encodeURIComponent('Error en el servidor. Intenta nuevamente.')
    );
  }
});

// ─────────── REGISTRO (GET) ───────────
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

// ─────────── REGISTRO (POST) ───────────
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

// ─────────── LISTA DE LIBROS (GET /books) ───────────
app.get('/books', async (req, res) => {
  console.log('GET /books');

  try {
    const books = await Book.findAll();

    const listItems = books
      .map(
        (b) => `
          <li>
            <strong>${b.titulo || b.title || 'Sin título'}</strong><br>
            Autor: ${b.autor || b.author || 'Desconocido'}<br>
            Precio: ${b.precio || b.price || 'N/D'}
          </li>
        `
      )
      .join('');

    const html = pageTemplate(
      'Libros - Librería Web',
      `
        <h1>Lista de libros</h1>
        ${
          books.length === 0
            ? '<p>No hay libros registrados.</p>'
            : `<ul>${listItems}</ul>`
        }
        <p><a href="/books/new">Agregar nuevo libro</a></p>
        <p><a href="/">Volver al inicio</a></p>
      `
    );

    res.send(html);
  } catch (err) {
    console.error('Error al obtener libros:', err);
    const html = pageTemplate(
      'Error',
      `
        <h1>Error al obtener libros</h1>
        <p>${err.message}</p>
        <p><a href="/">Volver al inicio</a></p>
      `
    );
    res.status(500).send(html);
  }
});

// ─────────── FORMULARIO NUEVO LIBRO (GET /books/new) ───────────
app.get('/books/new', (req, res) => {
  const html = pageTemplate(
    'Nuevo libro - Librería Web',
    `
      <h1>Agregar nuevo libro</h1>

      <form action="/books/new" method="POST">
        <div>
          <label>Título:</label>
          <input type="text" name="titulo" required>
        </div>
        <div>
          <label>Autor:</label>
          <input type="text" name="autor" required>
        </div>
        <div>
          <label>Precio:</label>
          <input type="number" step="0.01" name="precio" required>
        </div>
        <div>
          <label>Descripción:</label><br>
          <textarea name="descripcion" rows="4" cols="40"></textarea>
        </div>
        <button type="submit">Guardar</button>
      </form>

      <p><a href="/books">Volver a la lista de libros</a></p>
      <p><a href="/">Volver al inicio</a></p>
    `
  );

  res.send(html);
});

// ─────────── GUARDAR LIBRO (POST /books/new) ───────────
app.post('/books/new', async (req, res) => {
  const { titulo, autor, precio, descripcion } = req.body;

  try {
    await Book.create({
      titulo,
      autor,
      precio,
      descripcion,
    });

    res.redirect('/books');
  } catch (err) {
    console.error('Error al crear libro:', err);
    const html = pageTemplate(
      'Error',
      `
        <h1>Error al crear libro</h1>
        <p>${err.message}</p>
        <p><a href="/books/new">Volver al formulario</a></p>
      `
    );
    res.status(500).send(html);
  }
});

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