const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');
const { Config } = require('../../managers/db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mutin')
		.setDescription('Permet de punir/lever la punition d\'un membre qui se mutine !')
		.setDefaultPermission(false)
		.addUserOption(option =>
			option.setName('cible')
				.setDescription('Sélectionnez la cible à punir/pardonner.')
				.setRequired(true)
		),
	permission: 'KICK_MEMBERS',
	cmdChannelOnly: true,
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const target = interaction.options.getMember('cible');
		const mutin_role = await Config.findOne({ where: { name: 'mutin_role'} } );
		const r = interaction.guild.roles.cache.find(role => role.name === mutin_role.value);
		const tipeur_role = await Config.findOne({ where: { name: 'tipeur_role'} } );
		const tipeurRole = interaction.guild.roles.cache.find(role => role.name === tipeur_role.value);
		let reply, text, thumb;
		if (target.roles.cache.has(tipeurRole.id) || target.premiumSince) {
			const noway = new MessageEmbed()
				.setColor('RANDOM')
				.setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynmanic: true, size: 512 }) })
				.setDescription(`❌ Désolé mais tu ne peux pas rendre ${target} mutin car il est protégé par son statut d'actionnaire ! ❌`)
			return await interaction.reply({ embeds: [noway] });
		}

		if (!target.roles.cache.has(r.id)) {
			target.roles.add(r);
			reply = `Tu t'es rendu coupable de mutinerie ${target}, te voilà affublé d'une belle couleur... Va donc nettoyer les fonds de cale et prie pour que le Commandant soit clément !`;
			text = 'punir';
			thumb = 'https://i.imgur.com/5u4A4xu.png';
		} else {
			target.roles.remove(r);
			reply = `Tu n'es plus considéré comme mutin ${target}. Tu peux regagner ta place dans les quartiers de l'équipage. Néanmoins, je te surveille du coin de l'oeil...`;
			text = 'lever la punition de';
			thumb = 'https://i.imgur.com/DgRrDXQ.png';
		}

		const response = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor({ name: target.user.username, iconURL: target.user.avatarURL({ dynmanic: true, size: 512 }) })
			.setThumbnail(thumb)
			.addField(`🦜 Mutinerie !`, `${reply}`)

		client.log(client, `🦜 ${interaction.member} a utilisé la commande /${interaction.commandName} dans le salon <#${interaction.channel.id}> pour ${text} ${target} 🦜`);
		await interaction.reply({ content: `${target}`, embeds: [response] });
	},
};