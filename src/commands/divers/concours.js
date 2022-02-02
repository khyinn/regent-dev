const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { Giveaway, Giveawayuser } = require('../../managers/db.js');
const ms = require('ms');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('concours')
		.setDescription('Permet de gérer un concours sur le serveur.')
		.setDefaultPermission(false)
		.addSubcommand(subcommand =>
			subcommand
				.setName('créer')
				.setDescription('Permet de créer le concours.')
				.addIntegerOption(option => option.setName('gagnants').setDescription('Indiquez le nombre de gagnants.').setRequired(true))
				.addStringOption(option => option.setName('duree').setDescription('Indiquez la durée (5s = 5 secondes, 2m = 2 minutes, 12h = 12 heures, 1d = 1 jour).').setRequired(true))
				.addStringOption(option => option.setName('objet').setDescription('Indiquez le ou les items à gagner.').setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('stopper')
				.setDescription('Permet de stopper le concours.')
				.addStringOption(option => option.setName('identifiant').setDescription('Indiquez l\'identifiant du concours ou de son message.').setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('maj')
				.setDescription('Permet de mettre à jour le message du concours.')
				.addStringOption(option => option.setName('identifiant').setDescription('Indiquez l\'identifiant du concours ou de son message.').setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('relancer')
				.setDescription('Permet de retirer le ou les gagnants du concours.')
				.addStringOption(option => option.setName('identifiant').setDescription('Indiquez l\'identifiant du concours ou de son message.').setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('supprimer')
				.setDescription('Permet de supprimer le concours.')
				.addStringOption(option => option.setName('identifiant').setDescription('Indiquez l\'identifiant du concours ou de son message.').setRequired(true))
		),
	permission: 'ADMINISTRATOR',
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const { options } = interaction;
		if (options.getSubcommand() === 'créer') {
			const gagnants = options.getInteger('gagnants');
			const duree = options.getString('duree');
			const objet = options.getString('objet');
			const id = Math.random().toString(36).toUpperCase().replace(/[0-9O]/g, '').substring(1, 16);

			await Giveaway.findOrCreate({
				where: { id: id },
				defaults: {
					id: id,
					messageId: null,
					channelId: interaction.channel.id,
					guildId: interaction.guildId,
					authorId: interaction.user.id,
					authorName: interaction.user.username,
					authorURL: interaction.user.avatarURL({ dynmanic: true, size: 512 }),
					startAt: Date.now(),
					endAt: Date.now() + ms(duree),
					ended: false,
					prize: objet,
					winnerCount: gagnants,
					createdAt: interaction.createdAt
				}
			}).then(async ([giveaway, created]) => {
				if (!created) return await interaction.reply({ content: `❌ Création du concours impossible avec l'identifiant **${giveaway.id}**, cet identifiant existe. Veuillez réessayer.`, ephemeral: true });
				const response = new MessageEmbed()
					.setTitle('🎉 **CONCOURS** 🎉')
					.setAuthor({ name: giveaway.author, iconURL: giveaway.authorURL })
					.setColor('GOLD')
					.setDescription(`**${giveaway.winnerCount} gagnant${giveaway.winnerCount > 1 ? 's': ''}** tiré${giveaway.winnerCount > 1 ? 's': ''} au sort pour gagner **${giveaway.prize}**.\nCliquez sur le bouton pour participer !\nTerminé : **<t:${Math.round(giveaway.endAt / 1000)}:R>** ${client.progressBar(giveaway.endAt - Date.now(), giveaway.endAt - giveaway.startAt)}\nParticipant(s) : **0**`)
					.setFooter({ text: `ID : ${giveaway.id}`, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
					.setTimestamp(giveaway.timestamp)
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId(giveaway.id)
							.setLabel('🎉 Participer')
							.setStyle('PRIMARY')
					);
				await interaction.reply({ embeds: [response], components: [row] });
				const message = await interaction.fetchReply();
				await Giveaway.update({ messageId: message.id }, { where: { id: giveaway.id } });
			});
		}
		if (options.getSubcommand() === 'stopper') {
			const id = options.getString('identifiant');
			const giveaway = await Giveaway.findOne({ where: { id: id, ended: false } });
			if (giveaway) {
				client.majGiveaway(id, true, false);
				await interaction.reply({ content: `Concours ${id} mis à jour.`, ephemeral: true });
			} else return await interaction.reply({ content: `❌ Clôture du concours impossible avec l'identifiant **${id}**, cet identifiant n'existe pas ou ce concours est déjà terminé. Veuillez réessayer avec un identifiant valide.`, ephemeral: true });
		}
		if (options.getSubcommand() === 'maj') {
			const id = options.getString('identifiant');
			const giveaway = await Giveaway.findOne({ where: { id: id } });
			if (giveaway) {
				client.majGiveaway(id, false, false);
				await interaction.reply({ content: `Concours ${id} mis à jour.`, ephemeral: true });
			} else return await interaction.reply({ content: `❌ Mise à jour du concours impossible avec l'identifiant **${id}**, cet identifiant n'existe pas. Veuillez réessayer avec un identifiant valide.`, ephemeral: true });
		}
		if (options.getSubcommand() === 'relancer') {
			const id = options.getString('identifiant');
			const giveaway = await Giveaway.findOne({ where: { id: id, ended: true } });
			if (giveaway) {
				client.majGiveaway(id, true, true);
				await interaction.reply({ content: `Tirage au sort du concours ${id} relancé.`, ephemeral: true });
			} else return await interaction.reply({ content: `❌ Nouveau tirage du concours impossible avec l'identifiant **${id}**, cet identifiant n'existe pas ou ce concours n'est pas terminé. Veuillez réessayer avec un identifiant valide.`, ephemeral: true });
		}
		if (options.getSubcommand() === 'supprimer') {
			const id = options.getString('identifiant');
			const giveaway = await Giveaway.findOne({ where: { id: id } });
			if (giveaway) {
				await Giveawayuser.destroy({ where: { giveawayId: id } });
				await Giveaway.destroy({ where: { id: id } });
				await interaction.reply({ content: `Concours ${id} supprimé.`, ephemeral: true });
			} else return await interaction.reply({ content: `❌ Suppression du concours impossible avec l'identifiant **${id}**, cet identifiant n'existe pas. Veuillez réessayer avec un identifiant valide.`, ephemeral: true });
		}
	},
};