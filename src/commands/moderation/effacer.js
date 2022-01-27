const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('effacer')
		.setDescription('Permet de supprimer des messages d\'un salon ou d\'une cible.')
		.setDefaultPermission(false)
		.addIntegerOption(option =>
			option.setName('nombre')
				.setDescription('Sélectionnez le nombre de messages d\'un salon ou d\'une cible à supprimer.')
				.setRequired(true)
		)
		.addUserOption(option =>
			option.setName('cible')
				.setDescription('Sélectionnez la cible pour supprimer ses messages.')
		),
	permission: 'MANAGE_MESSAGES',
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const { channel, options } = interaction;
		const amount = options.getInteger('nombre');
		const target = options.getMember('cible');
		const messages = await channel.messages.fetch();

		const response = new MessageEmbed()
			.setColor('RED')
			.setTitle('Suppression de message(s)')

		if (amount > 100 || amount <= 0) {
			response.setDescription(`❌ Le nombre de messages ne peut pas dépasser 100 ni être inférieur à 1.`)
			return interaction.reply({ embeds: [response], ephemeral: true })
		}

		const text  = (target) ? `de ${target} ` : ``;

		if (target) {
			let i = 0;
			const filtered = [];
			(await messages).filter((m) => {
				if (m.author.id === target.id && amount > i) {
					filtered.push(m);
					i++;
				}
			});

			await channel.bulkDelete(filtered, true).then(async messages => {
				response.setDescription(`🧹 Suppression de ${messages.size} messages de ${target} effectuée.`);
				await interaction.reply({ embeds: [response], ephemeral: true }).then(m => {
					setTimeout(() => {
						m.delete();
					}, 5 * 1000)
				}).catch(() => { });
			});
		} else {
			await channel.bulkDelete(amount, true).then(async messages => {
				response.setDescription(`🧹 Suppression de ${messages.size} messages de ce salon effectuée.`);
				await interaction.reply({ embeds: [response], ephemeral: true }).then(m => {
					setTimeout(() => {
						m.delete();
					}, 5 * 1000)
				}).catch(() => { });
			});
		}
		client.log(client, `🧹 ${interaction.member} a supprimé ${messages.size} message(s) ${text}dans le salon <#${channel.id}> 🧹`);
	},
};