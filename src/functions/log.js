const { Client, MessageEmbed } = require('discord.js');
const { Config } = require('../managers/db.js');

module.exports = (client) => {
	/**
	 * @param {Client} client 
	 * @param {String} log
	 */
	client.log = async (client, log) => {
		client.moment.locale('fr');
		const chan = await Config.findOne({ where: { name: 'logs_channel'} } );
		const chanLog = await client.channels.cache.get(chan.value);
		const logEmbed = new MessageEmbed()
			.setColor("GOLD")
			.setTitle(`📖 Log`)
			.setDescription(`${log}`)
			.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
			.setFooter({ text : client.moment().format('LLLL'), iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) });
		await chanLog.send({ embeds: [logEmbed] });
	};
}