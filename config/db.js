// config/db.js
const path = require('path');
const { Sequelize } = require('sequelize');

// Usamos SQLite porque funciona perfecto en Render sin configuraciones externas
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false,
});

module.exports = sequelize;
