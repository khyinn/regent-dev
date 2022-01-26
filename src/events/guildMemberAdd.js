const { Client, MessageEmbed, GuildMember } = require('discord.js');
const { Config } = require('../managers/db.js');

module.exports = {
	name: 'guildMemberAdd',
	/**
	 * @param {GuildMember} member
	 * @param {Client} client
	 */
	async execute(member, client) {
		const { user, guild } = member;
		const chan1 = await Config.findOne({ where: { name: 'accueil_channel'} } );
		const chan2 = await Config.findOne({ where: { name: 'rules_channel'} } );
		const chan3 = await Config.findOne({ where: { name: 'welcome_channel'} } );
		const response = new MessageEmbed()
			.setColor('BLUE')
			.setAuthor({ name: `Bienvenue à bord ${user.username} !`, iconURL: user.avatarURL({ dynamic: true, size: 512 })})
			.setDescription(`Bienvenue ${member} sur le serveur **${guild.name}** !\n
			N'oublie pas de consulter les salons suggérés ci-dessous.\n
			Ce serveur compte actuellement **${guild.memberCount}** membres.`)
			.addField( '📖 Infos/Choix des rôles', `<#${chan1.value}>`, true )
			.addField( '\u200B', '\u200B', true )
			.addField( '📜 Règles du serveur', `<#${chan2.value}>`, true )
			.setTimestamp()
			.setFooter({ text: user.tag });
		client.log(client, `🔺 ${member} a rejoint le serveur !\nLe serveur compte désormais **${guild.memberCount}** membres. 🔺`);
		await client.channels.fetch(chan3.value).then((chan) => {
			chan.send({ content: `Bienvenue à bord, ${member}`, embeds: [response] });
		});
	},
};