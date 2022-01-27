const { Sequelize } = require('sequelize');
const { db_user, db_password } = require('../data/config.json');

const sequelize = new Sequelize('regent-db', db_user, db_password, {
	dialect: 'sqlite',
	logging: false,
	storage: './src/data/db.sqlite',
});

const Config = require('../models/config')(sequelize, Sequelize.DataTypes);
const Levelsystem = require('../models/levelsystem')(sequelize, Sequelize.DataTypes);
const Textline = require('../models/textline')(sequelize, Sequelize.DataTypes);
const Youtube = require('../models/youtube')(sequelize, Sequelize.DataTypes);

module.exports = { sequelize, Config, Levelsystem, Textline, Youtube };