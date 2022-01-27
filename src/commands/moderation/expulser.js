const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { Config } = require('../../managers/db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('expulser')
		.setDescription('Permet d\'expulser la cible du serveur.')
		.setDefaultPermission(false)
		.addUserOption(option =>
			option.setName('cible')
				.setDescription('Sélectionnez la cible à expulser.')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('raison')
				.setDescription('Définissez la raison de l\'expulsion.')
				.setRequired(true)
		),
	permission: 'KICK_MEMBERS',
	/**
	 * @param {CommandInteraction} interaction 
	 * @param {Client} client
	 */
	async execute(interaction, client ) {
		const invite_url = await Config.findOne({ where: { name: 'invite_url'} } );
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Join Back')
					.setStyle('LINK')
					.setURL(invite_url.value),
			);
		const { options } = interaction;
		const Target = options.getMember('cible');
		const Reason = options.getString('raison');
		const guild = interaction.guild;

		const response = new MessageEmbed()
			.setDescription(`**${Target} a été expulsé(e) avec succès.**\n\`\`\`Raison : ${Reason}\`\`\``)
			.setColor('RANDOM')
		if (Target.id === interaction.member.id) return interaction.reply({ content: `❌ Tu ne peux pas t'expulser toi-même.` });
		if (Target.permissions.has('ADMINISTRATOR')) return interaction.reply({ content: `❌ Tu ne peux pas expulser un administrateur.` });
		if (Target.permissions.has('MANAGE_GUILD'))	return interaction.reply({ content: `❌ Tu ne peux pas expulser un modérateur.` });

		const targetEmbed = new MessageEmbed()
				.setColor('RANDOM')
				.setDescription(`ℹ️ Vous avez été expulsé du serveur **${guild.name}** pour la raison suivante :\n\`\`\`${Reason}\`\`\`\nSouvenez-vous que vous pouvez toujours revenir une fois que vous avez compris votre erreur.`)
		await Target.send({ embeds: [targetEmbed], components: [row] });
		client.log(client, `🦶 ${interaction.member} a expulsé ${Target} du serveur 🦶\n\`\`\`Raison : ${Reason}\`\`\``);
		await Target.kick({ reason: Reason });
		await interaction.reply({ embeds: [response] });
	},
};