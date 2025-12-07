// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const { User } = require('../models'); // models/index.js exporta { User, Book }

// Función para generar HTML simple
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

// GET /auth/login → muestra formulario de inicio de sesión (SIN EJS)
router.get('/login', (req, res) => {
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

// GET /auth/register → muestra formulario de registro (SIN EJS)
router.get('/register', (req, res) => {
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

// POST /auth/register → registrar nuevo usuario (USANDO SEQUELIZE)
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.redirect('/auth/register?error=' + encodeURIComponent('El correo ya está registrado'));
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
    res.redirect('/auth/register?error=' + encodeURIComponent('Error en el servidor. Intenta nuevamente.'));
  }
});

// POST /auth/login → iniciar sesión (USANDO SEQUELIZE)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.redirect('/auth/login?error=' + encodeURIComponent('Usuario no encontrado'));
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.redirect('/auth/login?error=' + encodeURIComponent('Contraseña incorrecta'));
    }

    // Si quisieras, aquí podrías guardar algo en sesión. Por ahora:
    res.redirect('/books');
  } catch (err) {
    console.error('Error en login:', err);
    res.redirect('/auth/login?error=' + encodeURIComponent('Error en el servidor. Intenta nuevamente.'));
  }
});

module.exports = router;