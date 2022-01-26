const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('message')
		.setDescription('Permet d\'envoyer un message sur le salon spécifié.')
		.setDefaultPermission(false)
		.addChannelOption(option  =>
			option.setName('salon')
				.setDescription('Le salon dans lequel poster le message.')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('msg')
				.setDescription('Tapez votre message.')
				.setRequired(true)
		),
	permission: 'ADMINISTRATOR',
	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		const channel = interaction.options.getChannel('salon');
		const msg = interaction.options.getString('msg');
		channel.send(msg);
		await interaction.reply({ content: `✅ Message envoyé !`, ephemeral : true });
	},
};