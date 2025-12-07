// config/db.js
const { Sequelize } = require('sequelize');

// Usaremos SQLite para simplificar el despliegue en Render.
// Crea un archivo "database.sqlite" en el servidor y lo usa como base de datos.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // Se creará en la carpeta raíz del proyecto
  logging: false
});

module.exports = sequelize;
