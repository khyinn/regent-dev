const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');
const { Astronaut, Astronautweapon, Astronautfight } = require('../../managers/db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('astronaute')
		.setDescription('Jouez au jeu des astronautes !')
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
				.setDescription('Affiche le profil d\'un joueur ou votre profil.')
				.addUserOption(option => option.setName('cible').setDescription('Sélectionner l\'utilisateur pour afficher son profil.'))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('réinitialiser')
				.setDescription('Sélectionnez cette option pour réinitialiser votre personnage.')
		),
	gameChannelOnly: true,
	disallowMutin: true,
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		let target;

		if (interaction.options.getSubcommand() === 'info') {
			if (!interaction.options.getUser('cible')) target = interaction.user.id;
			else target = interaction.options.getUser('cible').id;
		} else target = interaction.user.id;

		await Astronaut.findOrCreate({ where: { id: target }, defaults: { id: target } }).then(async ([astronaut, created]) => {
			if (interaction.options.getSubcommand() === 'réinitialiser') {
				const id = astronaut.id;
				await Astronautfight.findOrCreate({ where: { userId: id }, defaults: { userId: id } }).then(async ([astronautFight, created]) => {
					if (astronautFight.state) {
						const undo = new MessageEmbed()
							.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
							.setColor('RED')
							.setDescription('❌ Tu ne peux pas réinitialiser ton personnage pendant un combat.')
						return await interaction.reply({ content: `<@${astronautFight.userId}>`, embeds: [undo] });
					}
				});
				await Astronaut.destroy({ where: { id: id } });
				await Astronautfight.destroy({ where: { userId: id } });
				const reinit = new MessageEmbed()
					.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
					.setColor('GREEN')
					.setDescription('✅ Droïde réinitialisé !')
				await interaction.reply({ content: `<@${id}>`, embeds: [reinit] });
			} else {
				const derniercombat = (astronaut.lastFight != 'undefined') ? client.moment(astronaut.lastFight, 'DD.MM.YYYY').format('DD/MM/YYYY') : `\u200b`;
				const weapon = await Astronautweapon.findOne({ where: { id: astronaut.weapon } });
				const response = new MessageEmbed()
					.setTitle(`⚔️ Droïde de ${interaction.guild.members.cache.get(target).user.username}`)
					.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
					.setColor('RANDOM')
					.addField( `❤️ Points de vie`, `${astronaut.lifePoints}`, true )
					.addField( `💰 Crédits galactiques`, `${astronaut.credits}`, true )
					.addField( `🏆 Niveau ${astronaut.level}`, `${astronaut.points}/${((10  * (astronaut.level + 1)) + 10) * (astronaut.level + 1)}`, true )
					.addField( `🔫 Armement`, `${weapon.name}`, true )
					.addField( `⚙️ Pièces détachées`, `${astronaut.gears}`, true )
					.addField( `☠️ Combats effectués`, `${astronaut.fights}`, true )
					.addField( `✅ Victoires`, `${astronaut.victories}`, true )
					.addField( `❌ Défaites`, `${astronaut.defeats}`, true )
					.addField( `⏰ Dernier combat`, `${derniercombat}`, true )
					.setFooter({ text: `Lance des combats pour gagner des crédits galactiques et de l'expérience martiale`, iconURL: interaction.guild.members.cache.get(target).user.avatarURL({ dynmanic: true, size: 512 }) });

				await interaction.reply({ content: `<@${target}>`, embeds: [response] });
				client.astronautShowActions(interaction, target, true, true, false, false, false);
			}
		});
	},
};