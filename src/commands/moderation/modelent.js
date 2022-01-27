const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('modelent')
		.setDescription('Permet de ralentir le rythme des messages postés dans ce salon.')
		.setDefaultPermission(false)
		.addStringOption(option =>
			option.setName('rythme')
				.setDescription('Définissez le rythme auquel un utilisateur peut poster des messages (ex: 5s, 1m, 30m, etc).')
		)
		.addStringOption(option =>
			option.setName('durée')
				.setDescription('Sélectionnez la durée pendant laquelle le mode lent est exécuté.')
		)
		.addStringOption(option =>
			option.setName('raison')
				.setDescription('Indiquez la raison de l\'activation du mode lent.')
		),
	permission: 'MANAGE_MESSAGES',
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const { channel, options } = interaction;
		const minRate = ms('5s');
		const maxRate = ms('6h');
		const minDuration = ms('10s');
		const rate = options.getString('rythme') && ms(options.getString('rythme')) ? ms(options.getString('rythme')) : 0;
		const duration = options.getString('durée') && ms(options.getString('durée')) ? ms(options.getString('durée')) : 0;
		const reason = options.getString('raison') || 'Non renseignée';
		const description = duration ? `Le mode lent a été activé au rythme de ${ms(rate)} pour ${ms(duration)}` 
									 : `Le mode lent a été activé au rythme de ${ms(rate)}`;
		const response = new MessageEmbed()
			.setTitle('🐌 Mode Lent 🐌')
			.setColor('RANDOM')
			.setDescription(`${description}. **Raison:** ${reason}.`)
			.setTimestamp();
		if (!rate) {
			channel.rateLimitPerUser ? response.setDescription(`Le mode lent a été désactivé.`) : response.setDescription(`Le mode lent a été activé au rythme de ${ms(minRate)}.`);
			channel.rateLimitPerUser ? channel.setRateLimitPerUser(0) : channel.setRateLimitPerUser(5);
			return await interaction.reply({ embeds: [response] });
		}

		if (rate < minRate || rate > maxRate) {
			response.setDescription(`Le rythme doit être compris entre ${ms(minRate)} et ${ms(maxRate)}. Le rythme peut être défini comme ceci : *10s, 1m, 2h*, etc., ou directement en millisecondes.`);
			return interaction.reply({ embeds: [response], ephemeral: true });
		}

		if (duration && duration < minDuration) {
			response.setDescription(`La durée doit être d'au moins ${ms(minDuration)}. La durée peut être définie comme ceci : *10s, 1m, 2h*, etc., ou directement en millisecondes.`);
			return interaction.reply({ embeds: [response], ephemeral: true });
		}

		channel.setRateLimitPerUser(rate / 1000, reason);
		await interaction.reply({ embeds: [response] });

		if (duration) setTimeout(async () => {
			channel.setRateLimitPerUser(0);
			const response2 = new MessageEmbed()
				.setTitle('🐌 Mode Lent 🐌')
				.setColor('RANDOM')
				.setDescription(`Le mode lent a été désactivé.`)
			await interaction.followUp({ embeds: [response2] });
			client.log(client, `🐌 Mode lent désactivé dans le salon <#${channel.id}> 🐌`);
		}, duration);
		client.log(client, `🐌 ${interaction.member} a activé le mode lent dans le salon <#${channel.id}> 🐌`);
	},
};