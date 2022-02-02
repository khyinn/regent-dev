module.exports = (sequelize, DataTypes) => {
	return sequelize.define('giveawayusers', {
		giveawayId: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ''
		},
		userId: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ''
		}
	},
	{
		timestamps: false
	});
};