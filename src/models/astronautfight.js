module.exports = (sequelize, DataTypes) => {
	return sequelize.define('astronautfight', {
		userId: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true
		},
		opponentId: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ''
		},
		lifePoints: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 50
		},
		lootCredits: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		lootXp: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		state: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	},
	{
		timestamps: false
	});
};