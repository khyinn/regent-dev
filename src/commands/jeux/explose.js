const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');
const { sequelize, Textline } = require('../../managers/db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('explose')
		.setDescription('Explose un autre membre.')
		.setDefaultPermission(false)
		.addUserOption(option =>
			option.setName('cible')
				.setDescription('Sélectionnez la cible.')
		),
	gameChannelOnly: true,
	permission: 'ADMINISTRATOR',
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		let target = interaction.options.getMember('cible');
		if (!target) target = interaction.member;

		const response = new MessageEmbed()
			.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })

		let line;
		if (target === interaction.member) {
			line = await Textline.findOne({ where : { linetype: `sansjoueur` }, order: sequelize.random() });
			response.setColor('RANDOM')
				.setDescription(client.parseString(line.value, `<@${target.id}>`))
			await interaction.reply({ content: `<@${target.id}>`, embeds: [response] });
		} else {
			line = await Textline.findOne({ where : { linetype: `joueurvainqueur` }, order: sequelize.random() });
			response.setColor('RANDOM')
				.setDescription(client.parseString(line.value, `<@${interaction.member.id}>`, `<@${target.id}>`))
			await interaction.reply({ content: `<@${interaction.member.id}>, <@${target.id}>`, embeds: [response] });
		}
	},
};