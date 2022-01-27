const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('des')
		.setDescription('Lance un dé, affiche le résultat.')
		.addIntegerOption(option =>
			option.setName('nombre')
				.setDescription('Sélectionnez le nombre de faces du dé.')
		),
	cantinaChannelOnly: true,
	disallowMutin: true,
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const dice = Math.round(Math.random() * (interaction.options.getInteger('nombre') - 1) + 1);
		const response = new MessageEmbed()
			.setColor('RANDOM')
			.setDescription(`🎲 Tu as lancé un 🎲${interaction.options.getInteger('nombre')} et obtenu un score de 🎲${dice}`)
			.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })

		await interaction.reply({ content: `${interaction.member}`, embeds: [response] })
	},
};