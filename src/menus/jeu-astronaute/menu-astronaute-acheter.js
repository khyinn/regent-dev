const { Client, CommandInteraction, MessageEmbed } = require('discord.js');
const { Astronaut, Astronautmarket, Astronautweapon } = require('../../managers/db.js');

module.exports = {
	data: {
		name: 'menu-astronaute-acheter'
	},
	/**
	 * @param {CommandInteraction} interaction 
	 * @param {Client} client 
	 */
	async execute (interaction, client) {
		const choice = interaction.values[0];
		const userId = interaction.user.id;
		const actions = new MessageEmbed()
			.setAuthor({ name: `${interaction.guild.members.cache.get(userId).user.username}`, iconURL: `${interaction.guild.members.cache.get(userId).user.avatarURL({ dynmanic: true, size: 512 })}` })
			.setColor('RED')
			.setDescription('L\'action 💰 Acheter a été choisie.')
		await interaction.update({ embeds: [actions], components: [], ephemeral: true });

		const response = new MessageEmbed()
			.setTitle('L\'action 💰 Acheter a été choisie.')
			.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
        
        const astronaut = await Astronaut.findOne({ where: { id: userId } });
        const boughtObject = await Astronautmarket.findOne({ where: { id: parseInt(choice, 10) } });

        if (astronaut.credits < boughtObject.cost) {
            response.setColor('RED')
				.setDescription('❌ Tu n\'as pas assez de crédits galactiques.')
        } else {
            const newCredits = astronaut.credits - boughtObject.cost;
            if (boughtObject.type === 'gear') {
                const newGears = astronaut.gears + boughtObject.gearQuantity;
                await Astronaut.update({ credits: newCredits, gears: newGears }, { where: { id: userId } });
                response.setColor('AQUA')
					.setDescription(`✅ Tu as acheté **${boughtObject.name}** avec succès.`)
            } else if (boughtObject.type === 'weapon') {
                const weaponDetails = await Astronautweapon.findOne({ where: { id: boughtObject.weaponId } });
                await Astronaut.update({ credits: newCredits, weapon: boughtObject.weaponId }, { where: { id: userId } });
                response.setColor('AQUA')
					.setDescription(`✅ Tu as acheté l'arme suivante : **${weaponDetails.name}**. Celle-ci a été équipée et a remplacé ton arme précédente.`)
            }
        }

		await interaction.followUp({ content: `<@${userId}>`, embeds: [response] });
		client.astronautShowActions(interaction, userId, true, true, false, false, false);
	},
};