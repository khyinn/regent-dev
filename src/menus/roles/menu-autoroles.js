const { CommandInteraction } = require('discord.js');

module.exports = {
	data: {
		name: 'menu-autoroles'
	},
	/**
	 * @param {CommandInteraction} interaction 
	 */
	async execute (interaction) {
		const choices = interaction.values;
		const member = interaction.member;

		const component = interaction.component;
		const removed = component.options.filter(() => {
			return !choices.includes(option.values);
		});
		for (const id of removed) member.roles.remove(id.value);
		for (const id of choices) member.roles.add(id);

		await interaction.reply({ content: `✅ Rôles mis à jour !`, ephemeral: true });
	},
};