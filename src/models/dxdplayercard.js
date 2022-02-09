module.exports = (sequelize, DataTypes) => {
	return sequelize.define('dxdplayercard', {
		userId: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true
		},
		cardId: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true
		}
	},
	{
		timestamps: false
	});
};