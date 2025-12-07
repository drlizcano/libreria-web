// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

/**
 * Página de registro
 */
router.get('/register', (req, res) => {
  res.render('register', {
    title: 'Registrarse',
    error: req.flash('error'),
    mensaje: req.flash('mensaje'),
    user: req.session.user || null
  });
});

/**
 * Registrar usuario
 */
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // Verificar si ya existe
    const existe = await User.findOne({ where: { email } });
    if (existe) {
      req.flash('error', 'El correo ya está registrado');
      return res.redirect('/auth/register');
    }

    // Encriptar contraseña
    const hashed = await bcrypt.hash(password, 10);

    // Crear usuario
    await User.create({
      nombre,
      email,
      password: hashed
    });

    req.flash('mensaje', 'Registro exitoso, ahora inicia sesión');
    res.redirect('/auth/login');
  } catch (err) {
    console.error('❌ Error registrando usuario:', err);
    req.flash('error', 'Ocurrió un error al registrar');
    res.redirect('/auth/register');
  }
});

/**
 * Página de login
 */
router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Iniciar sesión',
    error: req.flash('error'),
    mensaje: req.flash('mensaje'),
    user: req.session.user || null
  });
});

/**
 * Procesar login
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await User.findOne({ where: { email } });

    if (!usuario) {
      req.flash('error', 'Credenciales incorrectas');
      return res.redirect('/auth/login');
    }

    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) {
      req.flash('error', 'Credenciales incorrectas');
      return res.redirect('/auth/login');
    }

    // Guardar sesión
    req.session.user = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email
    };

    req.flash('mensaje', 'Sesión iniciada correctamente');
    res.redirect('/books');
  } catch (err) {
    console.error('❌ Error iniciando sesión:', err);
    req.flash('error', 'Ocurrió un error al iniciar sesión');
    res.redirect('/auth/login');
  }
});

/**
 * Cerrar sesión
 */
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;