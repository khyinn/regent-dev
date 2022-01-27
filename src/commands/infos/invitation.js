const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');
const { Config } = require('../../managers/db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invitation')
		.setDescription('Affiche le lien d\'invitation vers ce serveur Discord.')
		.setDefaultPermission(false),
	permission: 'MANAGE_MESSAGES',
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const invite_url = await Config.findOne({ where: { name: 'invite_url' } });
		const response = new MessageEmbed()
			.setTitle('Lien officiel du Discord')
			.setURL(`${invite_url.value}`)
			.setAuthor({ name: client.user.username, iconURL: interaction.guild.iconURL({ dynmanic: true, size: 512 }) })
			.setColor('RANDOM')
			.setDescription( `🔗 Copiez l'URL suivante :  ${invite_url.value}` );

		await interaction.reply({ embeds: [response] });
	},
};