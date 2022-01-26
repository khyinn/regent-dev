const { Sequelize } = require('sequelize');
const { db_user, db_password } = require('../data/config.json');

const sequelize = new Sequelize('regent-db', db_user, db_password, {
	dialect: 'sqlite',
	storage: './src/data/db.sqlite',
});

const Config = require('../models/config.js')(sequelize, Sequelize.DataTypes);

module.exports = { Config };