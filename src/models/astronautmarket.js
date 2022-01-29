module.exports = (sequelize, DataTypes) => {
	return sequelize.define('astronautmarket', {
		Id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		cost: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		type: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'weapon'
		},
		weaponId: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		lifeRestored: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		gearQuantity: {
			type: DataTypes.INTEGER,
			allowNull: true
		}
	},
	{
		timestamps: false
	});
};