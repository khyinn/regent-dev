const { Sequelize } = require('sequelize');
const { db_user, db_password } = require('../data/config.json');

const sequelize = new Sequelize('regent-db', db_user, db_password, {
	dialect: 'sqlite',
	logging: false,
	storage: './src/data/db.sqlite',
});

const Astronaut = require('../models/astronaut')(sequelize, Sequelize.DataTypes);
const Astronautfight = require('../models/astronautfight')(sequelize, Sequelize.DataTypes);
const Astronautmarket = require('../models/astronautmarket')(sequelize, Sequelize.DataTypes);
const Astronautweapon = require('../models/astronautweapon')(sequelize, Sequelize.DataTypes);
const Config = require('../models/config')(sequelize, Sequelize.DataTypes);
const Dxdcard = require('../models/dxdcard')(sequelize, Sequelize.DataTypes);
const Dxdplayer = require('../models/dxdplayer')(sequelize, Sequelize.DataTypes);
const Dxdplayercard = require('../models/dxdplayercard')(sequelize, Sequelize.DataTypes);
Dxdcard.belongsToMany(Dxdplayer, { through: Dxdplayercard, as: 'cards', foreignKey: 'cardId' });
Dxdplayer.belongsToMany(Dxdcard, { through: Dxdplayercard, as: 'players', foreignKey: 'userId' });
const Giveaway = require('../models/giveaway')(sequelize, Sequelize.DataTypes);
const Giveawayuser = require('../models/giveawayuser')(sequelize, Sequelize.DataTypes);
const Levelsystem = require('../models/levelsystem')(sequelize, Sequelize.DataTypes);
const Pvp = require('../models/pvp')(sequelize, Sequelize.DataTypes);
const Suggestionsjeu = require('../models/suggestionsjeu')(sequelize, Sequelize.DataTypes);
const Textline = require('../models/textline')(sequelize, Sequelize.DataTypes);
const Youtube = require('../models/youtube')(sequelize, Sequelize.DataTypes);

module.exports = {
	sequelize,
	Astronaut,
	Astronautfight,
	Astronautmarket,
	Astronautweapon,
	Config,
	Dxdcard,
	Dxdplayer,
	Dxdplayercard,
	Giveaway,
	Giveawayuser,
	Levelsystem,
	Pvp,
	Suggestionsjeu,
	Textline,
	Youtube
};