const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Permet de connaître le temps de réponse du bot.')
		.setDefaultPermission(false),
	permission: 'ADMINISTRATOR',
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const response1 = new MessageEmbed()
			.setColor('RANDOM')
			.setDescription(`Ping en cours...`);
		const timestamp1 = Date.now();
		await interaction.reply({ embeds: [response1] });
		const timestamp2 = Date.now();
		const response2 = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
			.setDescription(`Statistiques d'accès sur le serveur ${interaction.guild.name}`)
			.addField( `⏳ Latence du bot`, `${timestamp2 - timestamp1}ms`, true )
			.addField( `⏳ Latence de l'API`, `${client.ws.ping}ms`, true )
			.addField( `🟢 En ligne`, `<t:${parseInt(client.readyTimestamp / 1000)}:R>`, true );

		await interaction.editReply({ embeds: [response2] })
	},
};