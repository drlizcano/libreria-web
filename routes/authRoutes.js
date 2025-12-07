// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');

const router = express.Router();

// GET /auth/login
router.get('/login', (req, res) => {
  res.render('login', { title: 'Iniciar sesión' });
});

// POST /auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email no válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map(e => e.msg).join('. '));
      return res.redirect('/auth/login');
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        req.flash('error', 'Credenciales inválidas');
        return res.redirect('/auth/login');
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        req.flash('error', 'Credenciales inválidas');
        return res.redirect('/auth/login');
      }

      req.session.user = {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      };

      req.flash('mensaje', 'Sesión iniciada correctamente');
      res.redirect('/');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error interno');
      res.redirect('/auth/login');
    }
  }
);

// GET /auth/register
router.get('/register', (req, res) => {
  res.render('register', { title: 'Registro' });
});

// POST /auth/register
router.post(
  '/register',
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email no válido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map(e => e.msg).join('. '));
      return res.redirect('/auth/register');
    }

    const { nombre, email, password } = req.body;

    try {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        req.flash('error', 'Ya existe un usuario con ese email');
        return res.redirect('/auth/register');
      }

      const passwordHash = await bcrypt.hash(password, 10);

      await User.create({ nombre, email, passwordHash });

      req.flash('mensaje', 'Registro exitoso. Ahora puedes iniciar sesión.');
      res.redirect('/auth/login');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error interno');
      res.redirect('/auth/register');
    }
  }
);

// GET /auth/logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
