module.exports = (sequelize, DataTypes) => {
	return sequelize.define('jcj', {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true
		},
		dernier_jcj: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'undefined'
		}
	},
	{
		timestamps: false
	});
};