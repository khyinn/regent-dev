module.exports = (sequelize, DataTypes) => {
	return sequelize.define('levelsystem', {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true
		},
		xp: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		level: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		}
	},
	{
		timestamps: false
	});
};