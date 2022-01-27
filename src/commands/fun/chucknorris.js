const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');
const cheerio = require('cheerio');
const needle = require('needle');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('chucknorris')
		.setDescription('Affiche une vérité aléatoire sur Chuck Norris.'),
	cantinaChannelOnly: true,
	disallowMutin: true,
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		await needle('get', `http://chucknorrisfacts.fr/facts/random`).then((reply) => {
			const $ = cheerio.load(reply.body);
			let fact = $('.card-text').first().text();
			const response = new MessageEmbed()
				.setTitle(`🥊 Vérité de Chuck Norris 🥋`)
				.setColor('RANDOM')
				.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
				.setThumbnail(`https://i.imgur.com/g5qwCJV.jpg`)
				.setDescription(`${fact}`);
			interaction.reply({ embeds: [response] });
		}).catch((error) => { console.log(error)});
	},
};