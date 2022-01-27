module.exports = (sequelize, DataTypes) => {
	return sequelize.define('youtube', {
		channel: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		video_id: {
			type: DataTypes.STRING,
			allowNull: false
		},
		video_title: {
			type: DataTypes.STRING,
			allowNull: false
		},
		video_url: {
			type: DataTypes.STRING,
			allowNull: false
		},
		video_date: {
			type: DataTypes.STRING,
			allowNull: false
		},
		video_thumbnail: {
			type: DataTypes.STRING,
			allowNull: false
		}
	},
	{
		timestamps: false
	});
};