const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bannir')
		.setDescription('Permet de bannir la cible du serveur.')
		.setDefaultPermission(false)
		.addUserOption(option =>
			option.setName('cible')
				.setDescription('Sélectionnez la cible à bannir.')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('raison')
				.setDescription('Définissez la raison du bannissement.')
				.setRequired(true)
		),
	permission: 'BAN_MEMBERS',
	/**
	 * @param {CommandInteraction} interaction 
	 * @param {Client} client
	 */
	async execute(interaction, client ) {
		const { options } = interaction;
		const Target = options.getMember('cible');
		const Reason = options.getString('raison');
		const guild = interaction.guild;

		const response = new MessageEmbed()
			.setDescription(`**${Target} a été banni(e) avec succès.**\n\`\`\`Raison : ${Reason}\`\`\``)
			.setColor('RANDOM')
		if (Target.id === interaction.member.id) return interaction.reply({ content: `❌ Tu ne peux pas te bannir toi-même.` });
		if (Target.permissions.has('ADMINISTRATOR')) return interaction.reply({ content: `❌ Tu ne peux pas bannir un administrateur.` });
		if (Target.permissions.has('MANAGE_GUILD'))	return interaction.reply({ content: `❌ Tu ne peux pas bannir un modérateur.` });

		const targetEmbed = new MessageEmbed()
				.setColor('RANDOM')
				.setDescription(`ℹ️ Vous avez été banni du serveur **${guild.name}** pour la raison suivante :\n\`\`\`${Reason}\`\`\``)
		await Target.send({ embeds: [targetEmbed] });
		client.log(client, `🔨 ${interaction.member} a banni ${Target} (ID : \`\`\`${Target.id}\`\`\`) du serveur 🔨\n\`\`\`Raison : ${Reason}\`\`\``);
		await Target.ban({ reason: Reason });
		await interaction.reply({ embeds: [response] });
	},
};