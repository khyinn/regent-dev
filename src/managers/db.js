const { Sequelize } = require('sequelize');
const { db_user, db_password } = require('../data/config.json');

const sequelize = new Sequelize('regent-db', db_user, db_password, {
	dialect: 'sqlite',
	logging: false,
	storage: './src/data/db.sqlite',
});

const Astronaut = require('../models/astronaut')(sequelize, Sequelize.DataTypes);
const Astronautfight = require('../models/astronautfight')(sequelize, Sequelize.DataTypes);
const Astronautweapon = require('../models/astronautweapon')(sequelize, Sequelize.DataTypes);
const Config = require('../models/config')(sequelize, Sequelize.DataTypes);
const Levelsystem = require('../models/levelsystem')(sequelize, Sequelize.DataTypes);
const Pvp = require('../models/pvp')(sequelize, Sequelize.DataTypes);
const Suggestionsjeu = require('../models/suggestionsjeu')(sequelize, Sequelize.DataTypes);
const Textline = require('../models/textline')(sequelize, Sequelize.DataTypes);
const Youtube = require('../models/youtube')(sequelize, Sequelize.DataTypes);

module.exports = { sequelize, Astronaut, Astronautfight, Astronautweapon, Config, Levelsystem, Pvp, Suggestionsjeu, Textline, Youtube };