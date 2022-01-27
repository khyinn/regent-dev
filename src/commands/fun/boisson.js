const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('boisson')
		.setDescription('Offre une boisson à la cible ou à soi-même.')
		.addStringOption(option =>
			option.setName('boisson')
				.setDescription('Sélectionnez la boisson à offrir.')
				.setRequired(true)
				.addChoice('bière', 'bière')
				.addChoice('café', 'café')
				.addChoice('thé', 'thé')
		)
		.addUserOption(option =>
			option.setName('cible')
				.setDescription('Sélectionnez la cible à qui offrir une bière.')
		),
	cantinaChannelOnly: true,
	disallowMutin: true,
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const target = interaction.options.getUser('cible');
		const choices = interaction.options.getString('boisson');
		let boisson, phrase;

		switch (choices) {
			case 'bière': {
				boisson = `une :beer:`;
				phrase = `Santé !`;
			}
			break;
			case 'café': {
				boisson = `un :coffee:`;
				phrase = `Voilà qui va te remonter !`;
			}
			break;
			case 'thé': {
				boisson = `une tasse de :tea:`;
				phrase = `Paix et sérénité !`;
			}
			break;
		}
		
		const response = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) });
		let member;

		if (!target) {
			response.setThumbnail(interaction.user.avatarURL({ dynmanic: true, size: 512 }))
				.setDescription(`J'offre ${boisson} à <@${interaction.user.id}>.\n${phrase}`);
			member = interaction.user.id;
		} else {
			response.setThumbnail(target.avatarURL({ dynmanic: true, size: 512 }))
				.setDescription(`<@${interaction.user.id}> offre ${boisson} à <@${target.id}>.\n${phrase}`);
			member = target.id;
		}

		await interaction.reply({ embeds: [response] });
	},
};