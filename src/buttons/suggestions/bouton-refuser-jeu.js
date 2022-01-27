const { ButtonInteraction } = require('discord.js');
const { Suggestionsjeu } = require('../../managers/db.js');

module.exports = {
	data: {
		name: "bouton-refuser-jeu"
	},
	/**
	 * @param {ButtonInteraction} interaction 
	 */
	async execute (interaction) {
		if (!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply({ content: `❌ Vous ne pouvez pas utiliser ce bouton.`, ephemeral: true });

		const { message } = interaction;

		const suggestion = await Suggestionsjeu.findOne({ where: { msgId: message.id }});

		if (suggestion) {
			const embed = message.embeds[0];
			if (!embed) return;

			embed.fields[1] = { name: `⛔ Status`, value: `Refusée` };
			message.edit({ embeds: [embed.setColor('RED')], components: [] });
			await Suggestionsjeu.update({ status: 'Refusée' }, { where: { id: suggestion.id } });
			await interaction.reply({ content: `✅ Suggestion refusée avec succès.`, ephemeral: true });
		} else return interaction.reply({ content: `❌ Impossible de trouver cette suggestion.`, ephemeral: true });
	},
};