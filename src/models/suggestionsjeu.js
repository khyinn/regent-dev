module.exports = (sequelize, DataTypes) => {
	return sequelize.define('suggestionsjeu', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true,
			autoIncrement: true,
			primaryKey: true
		},
		msgId: {
			type: DataTypes.STRING,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		url: {
			type: DataTypes.STRING,
			allowNull: false
		},
		screenshot: {
			type: DataTypes.STRING,
			allowNull: false
		},
		type: {
			type: DataTypes.STRING,
			allowNull: false
		},
		trailer: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ''
		},
		status: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'En attente'
		}
	},
	{
		timestamps: false
	});
};