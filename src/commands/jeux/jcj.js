const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');
const { sequelize, Config, Jcj, Textline } = require('../../managers/db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jcj')
		.setDescription('Combat contre un autre membre.')
		.addUserOption(option =>
			option.setName('cible')
				.setDescription('Sélectionnez la cible.')
		),
	gameChannelOnly: true,
	disallowMutin: true,
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const jcj_allowed_role = await Config.findOne({ where: { name: 'jcj_allowed_role' } });
		const allowedRole = interaction.guild.roles.cache.find(role => role.name === jcj_allowed_role.value);
		const tipeur_role = await Config.findOne({ where: { name: 'tipeur_role'} } );
		const tipeurRole = interaction.guild.roles.cache.find(role => role.name === tipeur_role.value);
		const userId = interaction.user.id;
		let target = interaction.options.getUser('cible');
		if (!target) target = interaction.user;

		await Jcj.findOrCreate({ where: { id: userId }, defaults: { id: userId } }).then(async ([userJcj, created]) => {
			const response = new MessageEmbed()
				.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })

			if (!interaction.member.roles.cache.has(allowedRole.id) && !interaction.member.roles.cache.has(tipeurRole.id) && !interaction.member.premiumSince) {
				if (userJcj.dernier_jcj != client.moment().format('L')) {
					await Jcj.update({ dernier_jcj: client.moment().format('L') }, { where: { id: userId } });
				} else {
					response.setColor('RED')
						.setDescription(`⏳ Tu as déjà combattu aujourd'hui, reviens demain pour combattre à nouveau !`)
					return await interaction.reply({ content: `<@${userId}>`, embeds: [response] });
				}
			}

			response.setColor("RANDOM")
			let line;
			if (target === interaction.user) {
				line = await Textline.findOne({ where : { linetype: `sansjoueur` }, order: sequelize.random() });
				response.setDescription(client.parseString(line.value, `<@${target.id}>`))
				await interaction.reply({ content: `<@${target.id}>`, embeds: [response] });
			} else {
				const joueurChance = Math.floor(Math.random() * (10000 - 1) + 1);
				const adversaireChance = Math.floor(Math.random() * (10000 - 1) + 1);
				const collateralChance = Math.floor(Math.random() * (10000 - 1) + 1);
				if (joueurChance >= adversaireChance) {
					line = await Textline.findOne({ where : { linetype: `joueurvainqueur` }, order: sequelize.random() });
					response.setDescription(client.parseString(line.value, `<@${userId}>`, `<@${target.id}>`))
					await interaction.reply({ content: `<@${userId}>, <@${target.id}>`, embeds: [response] });
				} else if (collateralChance >= adversaireChance) {
					await client.channels.fetch(interaction.channel.id).then(async (c) => {
						line = await Textline.findOne({ where : { linetype: `collateral` }, order: sequelize.random() });
						const victimeCollaterale = c.members.filter(member => member.id != userId && member.id != target.id).random();
						response.setDescription(client.parseString(line.value, `<@${userId}>`, `<@${target.id}>`, `<@${victimeCollaterale.id}>`))
						await interaction.reply({ content: `<@${userId}>, <@${target.id}>, <@${victimeCollaterale.id}>`, embeds: [response] });
					});
				} else {
					line = await Textline.findOne({ where : { linetype: `ciblevainqueur` }, order: sequelize.random() });
					response.setDescription(client.parseString(line.value, `<@${userId}>`, `<@${target.id}>`))
					await interaction.reply({ content: `<@${userId}>, <@${target.id}>`, embeds: [response] });
				}
			}
		});
	},
};