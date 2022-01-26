const { Client, GuildMember } = require("discord.js");

module.exports = {
	name: 'guildMemberRemove',
	/**
	 * @param {GuildMember} member
	 * @param {Client} client
	 */
	async execute(member, client) {
		client.log(client, `🔻 ${member.user.username} a quitté le serveur !\nLe serveur compte désormais **${member.guild.memberCount}** membres. 🔻`);
	},
};