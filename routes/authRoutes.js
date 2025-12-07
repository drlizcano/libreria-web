// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models'); // 👈 lo sacamos de models/index.js

// GET /auth/login  → muestra formulario de login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// GET /auth/register  → muestra formulario de registro
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// POST /auth/register  → registra usuario nuevo
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // ¿ya existe el correo?
    const existingUser = await User.findOne({ where: { email } }); // 👈 Sequelize
    if (existingUser) {
      return res.render('register', {
        error: 'El correo ya está registrado',
      });
    }

    // encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // crear usuario
    await User.create({
      nombre,
      email,
      password: hashedPassword,
    });

    // redirigir al login
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).render('register', {
      error: 'Error en el servidor. Intenta nuevamente.',
    });
  }
});

// POST /auth/login  → inicia sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // buscar usuario por email
    const user = await User.findOne({ where: { email } }); // 👈 Sequelize

    if (!user) {
      return res.render('login', {
        error: 'Usuario no encontrado',
      });
    }

    // comparar contraseña
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', {
        error: 'Contraseña incorrecta',
      });
    }

    // aquí podrías guardar datos en sesión, por ahora redirigimos a libros
    res.redirect('/books'); // o donde tengas el listado
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).render('login', {
      error: 'Error en el servidor. Intenta nuevamente.',
    });
  }
});

module.exports = router;