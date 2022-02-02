const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pierrepapierciseaux')
		.setDescription('Affrontez le régent dans ce célèbre jeu.')
		.addStringOption(option =>
			option.setName('choix')
				.setDescription('Choisissez un objet (le papier enveloppe la pierre qui casse les ciseaux qui coupent le papier).')
				.setRequired(true)
				.addChoice('🪨 la pierre', 'pierre')
				.addChoice('✂️ les ciseaux', 'ciseaux')
				.addChoice('📜 le papier', 'papier')
		),
	gameChannelOnly: true,
	disallowMutin: true,
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const choice = interaction.options.getString('choix');
		const possibleResults = [
			{ objet: 'pierre', emoji: '🪨' },
			{ objet: 'ciseaux', emoji: '✂️' },
			{ objet: 'papier', emoji: '📜' }
		];
		const result = possibleResults[Math.floor((Math.random() * possibleResults.length))];
		const response = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
			.addField('🧑 Ton choix :', `${possibleResults.filter(o => o.objet == choice)[0].emoji} ${choice}`, true)
			.addField('🤖 Mon choix', `${result.emoji} ${result.objet}`, true)
		if (choice == result.objet) response.setDescription(`⚖️ Égalité ! Pas de vainqueur cette fois-ci !`)
		else {
			var winner;
			var explain;
			switch(result.objet) {
				case 'pierre' : {
					if (choice === 'papier') {
						winner = true;
						explain = `Le 📜 enveloppe la 🪨 !`;
					} else explain = `La 🪨 casse les ✂️ !`;
					break;
				}
				case 'ciseaux' : {
					if (choice === 'pierre') {
						winner = true;
						explain = `La 🪨 casse les ✂️ !`;
					} else explain = `Les ✂️ coupent le 📜 !`;
					break;
				}
				case 'papier' : {
					if (choice === 'ciseaux') {
						winner = true;
						explain = `Les ✂️ coupent le 📜 !`;
					} else explain = `Le 📜 enveloppe la 🪨 !`;
					break;
				}
			}
			if (winner) response.setDescription(`🎉 Bravo ! Tu as gagné pour cette fois !\n${explain}`)
			else response.setDescription(`❌ Dommage, c'est perdu !\n${explain}`)
		}
		await interaction.reply({ embeds: [response] });
	},
};