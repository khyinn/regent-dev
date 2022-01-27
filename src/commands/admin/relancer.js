const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('relancer')
		.setDescription('Permet de redémarrer le régent.')
		.setDefaultPermission(false),
	permission: 'ADMINISTRATOR',
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		client.log(client, `⚠️ ${interaction.member} vient de lancer le redémarrage du bot. Redémarrage en cours... ⚠️`);
		await interaction.reply({ content: `⚠️ Redémarrage en cours... ⚠️`, ephemeral : true }).then(() => {
			process.exit();
		});
	},
};