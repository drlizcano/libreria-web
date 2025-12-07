// app.js
const express = require('express');
const path = require('path');
const { initDb } = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/books', bookRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

const PORT = process.env.PORT || 3000;

// 🔥 Inicializar BD y luego levantar servidor
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo iniciar la aplicación:', err);
    process.exit(1);
  });