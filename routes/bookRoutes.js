// routes/bookRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { Book } = require('../models');
const { ensureAuth, ensureAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// LISTAR libros – GET /books
router.get('/', ensureAuth, async (req, res) => {
  const books = await Book.findAll();
  res.render('books/list', { title: 'Listado de libros', books });
});

// FORM NUEVO – GET /books/new
router.get('/new', ensureAdmin, (req, res) => {
  res.render('books/form', { title: 'Nuevo libro', book: {}, accion: 'Crear' });
});

// CREAR – POST /books
router.post(
  '/',
  ensureAdmin,
  [
    body('titulo').notEmpty().withMessage('El título es obligatorio'),
    body('autor').notEmpty().withMessage('El autor es obligatorio'),
    body('precio').isFloat({ gt: 0 }).withMessage('El precio debe ser mayor que 0')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map(e => e.msg).join('. '));
      return res.redirect('/books/new');
    }

    try {
      const { titulo, autor, genero, precio, descripcion } = req.body;
      await Book.create({ titulo, autor, genero, precio, descripcion });
      req.flash('mensaje', 'Libro creado correctamente');
      res.redirect('/books');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al crear el libro');
      res.redirect('/books/new');
    }
  }
);

// DETALLE – GET /books/:id
router.get('/:id', ensureAuth, async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) {
    req.flash('error', 'Libro no encontrado');
    return res.redirect('/books');
  }
  res.render('books/detail', { title: 'Detalle de libro', book });
});

// FORM EDITAR – GET /books/:id/edit
router.get('/:id/edit', ensureAdmin, async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) {
    req.flash('error', 'Libro no encontrado');
    return res.redirect('/books');
  }
  res.render('books/form', { title: 'Editar libro', book, accion: 'Actualizar' });
});

// ACTUALIZAR – POST /books/:id
router.post(
  '/:id',
  ensureAdmin,
  [
    body('titulo').notEmpty().withMessage('El título es obligatorio'),
    body('autor').notEmpty().withMessage('El autor es obligatorio'),
    body('precio').isFloat({ gt: 0 }).withMessage('El precio debe ser mayor que 0')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const id = req.params.id;

    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map(e => e.msg).join('. '));
      return res.redirect(`/books/${id}/edit`);
    }

    try {
      const book = await Book.findByPk(id);
      if (!book) {
        req.flash('error', 'Libro no encontrado');
        return res.redirect('/books');
      }

      const { titulo, autor, genero, precio, descripcion } = req.body;
      book.titulo = titulo;
      book.autor = autor;
      book.genero = genero;
      book.precio = precio;
      book.descripcion = descripcion;
      await book.save();

      req.flash('mensaje', 'Libro actualizado correctamente');
      res.redirect('/books');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error al actualizar el libro');
      res.redirect(`/books/${id}/edit`);
    }
  }
);

// ELIMINAR – POST /books/:id/delete
router.post('/:id/delete', ensureAdmin, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      req.flash('error', 'Libro no encontrado');
      return res.redirect('/books');
    }
    await book.destroy();
    req.flash('mensaje', 'Libro eliminado correctamente');
    res.redirect('/books');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error al eliminar el libro');
    res.redirect('/books');
  }
});

module.exports = router;
