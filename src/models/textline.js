module.exports = (sequelize, DataTypes) => {
	return sequelize.define('textline', {
		linetype: {
			type: DataTypes.STRING,
			allowNull: false
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