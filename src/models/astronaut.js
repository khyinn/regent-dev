module.exports = (sequelize, DataTypes) => {
	return sequelize.define('astronaut', {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true
		},
		lifePoints: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 50
		},
		credits: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 20
		},
		level: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1
		},
		points: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		weapon: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1
		},
		gears: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue : 5
		},
		fights: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		victories: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		defeats: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		lastFight: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'undefined'
		}
	},
	{
		timestamps: false
	});
};