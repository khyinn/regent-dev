module.exports = (sequelize, DataTypes) => {
	return sequelize.define('dxdcard', {
		cardId: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ''
		},
		attack: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		defense: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		class: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ''
		},
		rarity: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ''
		}
	},
	{
		timestamps: false
	});
};