// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models');

const router = express.Router();

// GET /auth/register
router.get('/register', (req, res) => {
  res.render('layout', {
    title: 'Registro',
    body: `
      <h2>Registro de usuario</h2>

      <form action="/auth/register" method="POST">
        <input type="hidden" name="_csrf" value="${req.csrfToken()}">

        <div>
          <label for="nombre">Nombre</label><br>
          <input type="text" id="nombre" name="nombre" required>
        </div>

        <div>
          <label for="email">Correo electrónico</label><br>
          <input type="email" id="email" name="email" required>
        </div>

        <div>
          <label for="password">Contraseña</label><br>
          <input type="password" id="password" name="password" required>
        </div>

        <button type="submit">Registrarse</button>
      </form>
    `
  });
});

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      req.flash('error', 'Ya existe un usuario con ese correo');
      return res.redirect('/auth/register');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({ nombre, email, passwordHash });

    req.flash('mensaje', 'Registro exitoso. Ahora puede iniciar sesión.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error interno');
    res.redirect('/auth/register');
  }
});

// GET /auth/login
router.get('/login', (req, res) => {
  res.render('layout', {
    title: 'Iniciar sesión',
    body: `
      <h2>Iniciar sesión</h2>

      <form action="/auth/login" method="POST">
        <input type="hidden" name="_csrf" value="${req.csrfToken()}">

        <div>
          <label for="email">Correo electrónico</label><br>
          <input type="email" id="email" name="email" required>
        </div>

        <div>
          <label for="password">Contraseña</label><br>
          <input type="password" id="password" name="password" required>
        </div>

        <button type="submit">Ingresar</button>
      </form>
    `
  });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      req.flash('error', 'Credenciales inválidas');
      return res.redirect('/auth/login');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      req.flash('error', 'Credenciales inválidas');
      return res.redirect('/auth/login');
    }

    // guardar usuario en sesión
    req.session.user = {
      id: user.id,
      nombre: user.nombre,
      email: user.email
    };

    req.flash('mensaje', 'Has iniciado sesión correctamente');
    res.redirect('/books');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error interno');
    res.redirect('/auth/login');
  }
});

// GET /auth/logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;