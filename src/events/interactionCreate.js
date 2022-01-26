const { CommandInteraction, Client, MessageEmbed } = require('discord.js');

module.exports = {
	name: 'interactionCreate',
	/**
	 * @param {CommandInteraction} interaction 
	 * @param {Client} client 
	 */
	async execute(interaction, client) {
		if (interaction.isCommand()) {
			const command = client.commands.get(interaction.commandName);

			if (!command) return;

			const cmd_channel = await Config.findOne({ where: { name: 'cmd_channel'} } );
			const game_channel = await Config.findOne({ where: { name: 'game_channel'} } );
			const suggestion_channel = await Config.findOne({ where: { name: 'suggestion_channel'} } );
			const cantina_channel = await Config.findOne({ where: { name: 'cantina_channel'} } );

			if (command.cmdChannelOnly && interaction.channel.id != cmd_channel.value) {
				return interaction.reply({ embeds: [
					new MessageEmbed()
						.setColor('RED')
						.setDescription(`⛔ Impossible d'effectuer cette commande dans ce salon, utilise le salon <#${cmd_channel.value}>.`)
				]});
			}
			
			if (command.gameChannelOnly && interaction.channel.id != game_channel.value) {
				return interaction.reply({ embeds: [
					new MessageEmbed()
						.setColor('RED')
						.setDescription(`⛔ Impossible d'effectuer cette commande dans ce salon, utilise le salon <#${game_channel.value}>.`)
				]});
			}

			if (command.suggestionChannel && interaction.channel.id != suggestion_channel.value) {
				return interaction.reply({ embeds: [
					new MessageEmbed()
						.setColor('RED')
						.setDescription(`⛔ Impossible d'effectuer cette commande dans ce salon, utilise le salon <#${suggestion_channel.value}>.`)
				]});
			}
			
			if (command.cantinaChannelOnly && interaction.channel.id != cantina_channel.value) {
				return interaction.reply({ embeds: [
					new MessageEmbed()
						.setColor('RED')
						.setDescription(`⛔ Impossible d'effectuer cette commande dans ce salon, utilise le salon <#${cantina_channel.value}>.`)
				]});
			}

			if (command.disallowMutin) {
				const mutin_role = await Config.findOne({ where: { name: 'mutin_role'} } );
				const r = interaction.guild.roles.cache.find(role => role.name === mutin_role);
				if (interaction.member.roles.cache.has(r.id)) {
					return interaction.reply({ embeds: [
						new MessageEmbed()
							.setColor('RED')
							.setDescription(`⛔ Les mutins n'ont pas le droit d'exécuter cette commande !`)
					]});
				}
			}

			if (command.cooldown) {
				const cooldwn = client.cooldown.get(`${command.name}${interaction.user.id}`) - Date.now();
				const mth = Math.floor(cooldwn / 1000) + '';
				if (client.cooldown.has(`${command.name}${interaction.user.id}`)) {
					return interaction.reply({ embeds: [
						new MessageEmbed()
							.setColor('RED')
							.setDescription(`⏳ Vous ne pouvez pas encore effectuer cette commande. Vous devez patienter \`${mth.split('.')[0]}\` secondes.`),
						], ephemeral: true});
				}
				client.cooldown.set(`${cmd.name}${interaction.user.id}`, Date.now() + command.cooldown);
				setTimeout(() => {client.cooldown.delete(`${command.name}${interaction.user.id}`)}, command.cooldown);
			}
	
			try {
				await command.execute(interaction, client);
			} catch (error) {
				if (error) console.error(error);
				await interaction.reply({ content: `❌ Une erreur est survenue lors de l'exécution de cette commande !`, ephemeral: true });
			}
		} else if (interaction.isSelectMenu()) {
			const menu = client.menus.get(interaction.customId);

			if (!menu) return await interaction.reply({ content: `❌ Aucun code trouvé pour ce menu !` });
	
			try {
				await menu.execute(interaction, client);
			} catch (error) {
				if (error) console.error(error);
				await interaction.reply({ content: `❌ Une erreur est survenue lors de l'exécution de ce menu !`, ephemeral: true });
			}
		} else if (interaction.isButton()) {
			const button = client.buttons.get(interaction.customId);

			if (!button) return await interaction.reply({ content: `❌ Aucun code trouvé pour ce bouton !` });

			try {
				await button.execute(interaction, client);
			} catch (error) {
				if (error) console.error(error);
				await interaction.reply({ content: `❌ Une erreur est survenue lors de l'exécution de ce bouton !`, ephemeral: true });
			}
		} else return;
	},
};