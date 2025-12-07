// config/db.js
const { Sequelize } = require('sequelize');
const path = require('path');

// Base de datos SQLite en el archivo database.sqlite dentro de /config
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false,
});

async function initDb() {
  try {
    await sequelize.authenticate();
    console.log('Base de datos conectada correctamente');

    // Los modelos se cargan cuando se requieren las rutas,
    // así que aquí solo sincronizamos.
    await sequelize.sync(); // puedes usar { alter: true } si quieres ajustar tablas

    console.log('Base de datos sincronizada correctamente');
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
    throw err;
  }
}

module.exports = {
  sequelize,
  initDb,
};