module.exports = (sequelize, DataTypes) => {
	return sequelize.define('giveaway', {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true
		},
		messageId: DataTypes.STRING,
		channelId: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ''
		},
		guildId: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ''
		},
		authorId: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ''
		},
		authorName: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ''
		},
		authorURL: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ''
		},
		startAt: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue : ''
		},
		endAt: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ''
		},
		ended: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		prize: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ''
		},
		winnerCount: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1
		},
		winners: DataTypes.JSON,
		createdAt: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ''
		}
	},
	{
		timestamps: false
	});
};