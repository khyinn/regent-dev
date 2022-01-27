const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('miseenforme')
		.setDescription('Affiche les options de mise en forme de Discord (Markdown).'),
	cmdChannelOnly: true,
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const response = new MessageEmbed()
			.setTitle('Mise en forme du texte sur Discord')
			.setAuthor({ name: client.user.username, iconURL: interaction.guild.iconURL({ dynmanic: true, size: 512 }) })
			.setColor('RANDOM')
			.addField('*Italique*', '```*Italique*```')
			.addField('**Gras**', '```**Gras**```')
			.addField('***Italique & Gras***', '```***Italique & Gras***```')
			.addField('__Souligné__', '```__Souligné__```')
			.addField('__*Italique & Souligné*__', '```__*Italique & Souligné*__```')
			.addField('__**Gras & Souligné**__', '```__**Gras & Souligné**__```')
			.addField('__***Italique, Gras & Souligné***__', '```__***Italique, Gras & Souligné***__```')
			.addField('~~Barré~~', '```~~Barré~~```')
			.addField('||Cacher un texte||', '```||Cacher un texte||```');

		await interaction.reply({ embeds: [response] })
	},
};