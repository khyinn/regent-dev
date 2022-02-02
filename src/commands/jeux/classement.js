const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');
const { Astronaut, Levelsystem } = require('../../managers/db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('classement')
		.setDescription('Affiche le top 10 des personnes les plus actives et celui des plus puissants droïdes de combat.'),
	cmdChannelOnly: true,
	disallowMutin: true,
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const users = await Levelsystem.findAll({ order: [['xp', 'DESC']]});
		var topXp = new Array();
		var j = 0;
		for (let i in users) {
			if (!interaction.guild.members.cache.get(i.id)) continue;
			topXp[j] = {
				user: i.id,
				level: i.level,
				xp: i.xp
			}
			j++;
		}
		topXp = topXp.slice(0, 10);

		let response = new MessageEmbed()
			.setTitle(`Top ${topXp.length} des membres les plus actifs`)
			.setAuthor({ name: client.user.username, iconURL: interaction.guild.iconURL({ dynmanic: true, size: 512 }) })
			.setThumbnail(interaction.guild.iconURL({ dynmanic: true, size: 512 }))
			.setColor('RANDOM');
		for (var ind = 0; ind < topXp.length; ind++)
		{
			response.addField(`${ind + 1}. ${interaction.guild.members.cache.get(topXp[ind].user).user.username}`, `**Niveau : ${topXp[ind].level}, XP : ${topXp[ind].xp}**`);
		}

		const players = await Astronaut.findAll();
		var playersTopTmp = new Array();
		var k = 0;
		for (let l in players) {
			if (!interaction.guild.members.cache.get(l.id)) continue;
			if (l.fights !== 0) {
				playersTopTmp[k] = {
					user: l.id,
					combats: l.victories,
					ratio: Math.floor((l.victories / l.fights) * 100)
				}
				k++;
			}
		}
		var playersTop = playersTopTmp.sort(function(a, b) { return b.combats - a.combats || b.ratio - a.ratio}).slice(0, 10);

		let response2 = new MessageEmbed()
			.setTitle(`Top ${playersTop.length} des droïdes de combat les plus puissants`)
			.setAuthor({ name: client.user.username, iconURL: interaction.guild.iconURL({ dynmanic: true, size: 512 }) })
			.setThumbnail(interaction.guild.iconURL({ dynmanic: true, size: 512 }))
			.setColor('RANDOM');
		for (var ind = 0; ind < playersTop.length; ind++)
		{
			response2.addField( `${ind + 1}. ${interaction.guild.members.cache.get(playersTop[ind].user).user.username}`, `**Victoires : ${playersTop[ind].combats} (${playersTop[ind].ratio}%)**` )
		}

		await interaction.reply({ embeds: [response, response2] });
	},
};