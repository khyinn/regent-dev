module.exports = (sequelize, DataTypes) => {
	return sequelize.define('dxdplayer', {
		userId: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true
		},
		fights: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		victories: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		defeats: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		points: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		credits: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 500
		},
		dusts: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		draws: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		lastTimeDaily: DataTypes.STRING,
		nomp: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	},
	{
		timestamps: false
	});
};