const { Client, CommandInteraction, MessageEmbed } = require('discord.js');
const { Astronaut, Astronautfight, Astronautmarket } = require('../../managers/db.js');

module.exports = {
	data: {
		name: 'bouton-astronaute-reparer'
	},
	/**
	 * @param {CommandInteraction} interaction 
	 * @param {Client} client 
	 */
	async execute (interaction, client) {
		const userId = interaction.user.id;
		const actions = new MessageEmbed()
			.setAuthor({ name: `${interaction.guild.members.cache.get(userId).user.username}`, iconURL: `${interaction.guild.members.cache.get(userId).user.avatarURL({ dynmanic: true, size: 512 })}` })
			.setColor('RED')
			.setDescription('L\'action 🛠️ Réparer a été choisie.')
		await interaction.update({ embeds: [actions], components: [], ephemeral: true });

		const response = new MessageEmbed()
			.setTitle('L\'action 🛠️ Réparer a été choisie.')
			.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })

		const astronaut = await Astronaut.findOne({ where: { id: userId } });
		const fight = await Astronautfight.findOne({ where: { userId: userId } });
		const gear = await Astronautmarket.findOne({ where: { type: 'gear', gearQuantity: 1 } });

		if (astronaut.lifePoints >= (40 + (10 * astronaut.level))) {
			response.setColor('AQUA')
				.setDescription('❌ Ton droïde n\'a pas besoin de réparation.')
			await interaction.followUp({ content: `<@${userId}>`, embeds: [response] });
		} else if (astronaut.gears > 0) {
			const newGears = astronaut.gears - 1;
			let lp = astronaut.lifePoints + gear.lifeRestored;
			if (lp > (40 + (10 * astronaut.level))) lp = (40 + (10 * astronaut.level));
			await Astronaut.update({ lifePoints: lp, gears: newGears }, { where: { id: userId } });
			response.setColor('AQUA')
				.setDescription(`✅ Tu as utilisé **${gear.name}** pour regagner **${gear.lifeRestored}** ❤️.`)
				.addField( `❤️ Ton droïde`, `${lp}`, true )
			   	.addField( `❤️ Droïde adverse`, `${fight.lifePoints}`, true )
			   	.addField( `\u200b`, `\u200b`, true )
			await interaction.followUp({ content: `<@${userId}>`, embeds: [response] });
		} else {
			response.setColor('RED')
				.setDescription('❌ Tu n\'as plus de pièces détachées.')
			await interaction.followUp({ content: `<@${userId}>`, embeds: [response] });
		}
		client.astronautShowActions(interaction, userId, false, false, true, true, true);
	},
};