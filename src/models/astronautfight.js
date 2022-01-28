module.exports = (sequelize, DataTypes) => {
	return sequelize.define('astronautfight', {
		userId: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		opponentId: {
			type: DataTypes.STRING,
			allowNull: false
		},
		lifePoints: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		lootCredits: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		lootXp: {
			type: DataTypes.INTEGER,
			allowNull: false
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