module.exports = (sequelize, DataTypes) => {
	return sequelize.define('pvp', {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true
		},
		lastPvp: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'undefined'
		}
	},
	{
		timestamps: false
	});
};