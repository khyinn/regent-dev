module.exports = (sequelize, DataTypes) => {
	return sequelize.define('astronauteweapon', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true,
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		attack: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		level: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		modifier: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
	},
	{
		timestamps: false
	});
};