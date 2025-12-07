// models/index.js
const sequelize = require('../config/db');
const Book = require('./Book');
const User = require('./User');

// Inicializa la base de datos (crea tablas si no existen)
async function initDb() {
  try {
    await sequelize.sync(); // { force: true } si quisieras recrear tablas
    console.log('Base de datos sincronizada correctamente');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  Book,
  User,
  initDb
};
