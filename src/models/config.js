module.exports = (sequelize, DataTypes) => {
	return sequelize.define('config', {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		value: {
			type: DataTypes.STRING,
			allowNull: false
		}
	},
	{
		timestamps: false
	});
};