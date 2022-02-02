const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');
const { Levelsystem } = require('../../managers/db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Affiche les informations sur l\'élément demandé.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('utilisateur')
				.setDescription('Affiche le profil de l\'utilisateur sélectionné ou votre profil.')
				.addUserOption(option => option.setName('cible').setDescription('Sélectionner l\'utilisateur pour afficher son profil.'))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('serveur')
				.setDescription('Sélectionnez cette option pour afficher les informations du serveur.')
		),
	cmdChannelOnly: true,
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		if (interaction.options.getSubcommand() === 'utilisateur') {
			let target = interaction.options.getUser('cible');
			let member = interaction.options.getMember('cible');
			if (!target) target = interaction.user;
			if (!member) member = interaction.member;

			await Levelsystem.findOrCreate({ where: { id: target.id }, defaults: { id: target.id } }).then(async ([userLvl, created]) => {
				const xpToNextLvl = (1000 * (Math.pow(2, userLvl.level) - 1)) - userLvl.xp;

				const response = new MessageEmbed()
					.setColor('RANDOM')
					.setAuthor({ name: target.username, iconURL: target.avatarURL({ dynmanic: true, size: 512 }) })
					.setThumbnail(target.avatarURL({ dynmanic: true, size: 512 }))
					.addField(`⏳ Inscrit sur le serveur`, `<t:${parseInt(member.joinedTimestamp / 1000)}:R>`, true)
					.addField(`💬 Inscrit sur Discord`, `<t:${parseInt(target.createdTimestamp / 1000)}:R>`, true)
					.addField(`🤵 Rôles`, `${member.roles.cache.map(r => r).join(' ').replace('@everyone', '') || 'Aucun'}`)
					.addField(`📊 Niveau`, `${userLvl.level}`, true)
					.addField(`📕 XP`, `${userLvl.xp}`, true)
					.addField(`📈 XP avant prochain niveau`, `${xpToNextLvl}`, true);

				await interaction.reply({ embeds: [response] });
			});
		} else if (interaction.options.getSubcommand() === 'serveur') {
			client.moment.locale('fr');
			const response = new MessageEmbed()
				.setDescription(`**Informations du serveur ${interaction.guild.name}**`)
				.setAuthor({ name: client.user.username, iconURL: interaction.guild.iconURL({ dynmanic: true, size: 512 }) })
				.setColor('RANDOM')
				.setThumbnail(interaction.guild.iconURL({ dynmanic: true, size: 512 }))
				.addField( `Créé le`, `${client.moment(interaction.guild.createdAt).format('LLLL')}` )
				.addField( `Nombre total de membres`, `${interaction.guild.memberCount}` )
				.addField( `Vous avez rejoint le`, `${client.moment(interaction.member.joinedAt).format('LLLL')}` )
				.addField( `Nom du bot`, `${client.user.username}` )
				.addField( `Créé le`, `${client.moment(client.user.createdAt).format('LLLL')}` );

			await interaction.reply({ embeds: [response] });
		}
	},
};