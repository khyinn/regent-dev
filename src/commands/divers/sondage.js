const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sondage')
		.setDescription('Lance un sondage sur la question posée.')
		.addStringOption(option => option.setName('question').setDescription('Tapez votre question.').setRequired(true))
		.addStringOption(option => option.setName('choix1').setDescription('Choix 1').setRequired(true))
		.addStringOption(option => option.setName('choix2').setDescription('Choix 2').setRequired(true))
		.addStringOption(option => option.setName('choix3').setDescription('Choix 3'))
		.addStringOption(option => option.setName('choix4').setDescription('Choix 4'))
		.addStringOption(option => option.setName('choix5').setDescription('Choix 5'))
		.addStringOption(option => option.setName('choix6').setDescription('Choix 6'))
		.addStringOption(option => option.setName('choix7').setDescription('Choix 7'))
		.addStringOption(option => option.setName('choix8').setDescription('Choix 8'))
		.addStringOption(option => option.setName('choix9').setDescription('Choix 9'))
		.addStringOption(option => option.setName('choix10').setDescription('Choix 10')),
	disallowMutin: true,
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const { options } = interaction;
		const question = options.getString('question');
		const choice1 = options.getString('choix1');
		const choice2 = options.getString('choix2');
		const choice3 = options.getString('choix3');
		const choice4 = options.getString('choix4');
		const choice5 = options.getString('choix5');
		const choice6 = options.getString('choix6');
		const choice7 = options.getString('choix7');
		const choice8 = options.getString('choix8');
		const choice9 = options.getString('choix9');
		const choice10 = options.getString('choix10');
		const reacts = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

		let choices = [];
		choices.push(choice1, choice2);
		if (choice3) choices.push(choice3);
		if (choice4) choices.push(choice4);
		if (choice5) choices.push(choice5);
		if (choice6) choices.push(choice6);
		if (choice7) choices.push(choice7);
		if (choice8) choices.push(choice8);
		if (choice9) choices.push(choice9);
		if (choice10) choices.push(choice10);

		const response = new MessageEmbed()
			.setTitle(`${question}`)
			.setAuthor({ name: client.user.username, iconURL: interaction.guild.iconURL({ dynmanic: true, size: 512 }) })
			.setColor('RANDOM');
		for (i = 0; i < choices.length; i++) {
			response.addField(`${reacts[i]} ${choices[i]}`, '\u200b')
		}

		const msg = await interaction.reply({ embeds: [response], fetchReply: true });
		for (i = 0; i < choices.length; i++) await msg.react(reacts[i]);
	},
};