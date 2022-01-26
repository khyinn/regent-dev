const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageActionRow } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ajouterautorole')
		.setDescription('Ajoute un rôle au message de rôles automatiques.')
		.setDefaultPermission(false)
		.addChannelOption(option  =>
			option.setName('salon')
				.setDescription('Le salon dans lequel poster le message.')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('msg')
				.setDescription('L\'identifiant du message.')
				.setRequired(true)
		)
		.addRoleOption(option =>
			option.setName('role')
				.setDescription('Le rôle à ajouter au message.')
				.setRequired(true)
		),
	permission: 'ADMINISTRATOR',
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const channel = interaction.options.getChannel('salon');
		const msg = interaction.options.getString('msg');
		const role = interaction.options.getRole('role');
		if (!role) return await interaction.reply({ content: `❌ Rôle introuvable !`, ephemeral : true });
		const targetMessage = await channel.messages.fetch(msg, {
			cache: true,
			force: true
		});
		if (!targetMessage) return await interaction.reply({ content: `❌ Identifiant de message introuvable !`, ephemeral : true });
		if (targetMessage.author.id !== client.user?.id) return await interaction.reply({ content: `❌ Le message doit avoir été envoyé par <@${client.user?.id}> !`, ephemeral : true });
		let row = targetMessage.components[0];
		if (!row) row = new MessageActionRow();
		const option = [
			{
				label: role.name,
				value: role.id
			}
		];
		let menu = row.components[0];
		if (menu) {
			for (const o of menu.options) {
				if (o.value === option[0].value) return await interaction.reply({ content: `❌ <@${o.value}> est déjà dans ce menu !`, ephemeral : true });
			}
			menu.addOptions(option)
				.setMaxValues(menu.options.length);
		} else {
			row.addComponents(
				new MessageSelectMenu()
					.setCustomId('menu-autoroles')
					.setPlaceholder('🧢 Sélectionne un rôle.')
					.setMinValues(0)
					.setMaxValues(1)
					.addOptions(option)
			);
		}

		targetMessage.edit({ components: [row] });
		await interaction.reply({ content: `✅ Le rôle <@${role.id} a été ajouté au menu des auto-rôles !`, ephemeral : true });
	},
};