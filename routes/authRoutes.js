// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const { User } = require('../models'); // models/index.js exporta { User, Book }

// GET /auth/login → muestra formulario de inicio de sesión
router.get('/login', (req, res) => {
  res.render('login', {
    error: null,
    user: res.locals.user,
  });
});

// GET /auth/register → muestra formulario de registro
router.get('/register', (req, res) => {
  res.render('register', {
    error: null,
    user: res.locals.user,
  });
});

// POST /auth/register → registrar nuevo usuario
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.render('register', {
        error: 'El correo ya está registrado',
        user: res.locals.user,
      });
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
    res.status(500).render('register', {
      error: 'Error en el servidor. Intenta nuevamente.',
      user: res.locals.user,
    });
  }
});

// POST /auth/login → iniciar sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.render('login', {
        error: 'Usuario no encontrado',
        user: res.locals.user,
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.render('login', {
        error: 'Contraseña incorrecta',
        user: res.locals.user,
      });
    }

    res.redirect('/books');
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).render('login', {
      error: 'Error en el servidor. Intenta nuevamente.',
      user: res.locals.user,
    });
  }
});

module.exports = router;