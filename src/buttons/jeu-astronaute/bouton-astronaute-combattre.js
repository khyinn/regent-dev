const { Client, CommandInteraction, MessageEmbed } = require('discord.js');
const { sequelize, Astronaut, Astronautfight, Astronautweapon } = require('../../managers/db.js');
const { Op } = require('sequelize');

module.exports = {
	data: {
		name: 'bouton-astronaute-combattre'
	},
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const userId = interaction.user.id;
		const actions = new MessageEmbed()
			.setAuthor({ name: `${interaction.guild.members.cache.get(userId).user.username}`, iconURL: `${interaction.guild.members.cache.get(userId).user.avatarURL({ dynmanic: true, size: 512 })}` })
			.setColor('RED')
			.setDescription('L\'action ⚔️ Combattre a été choisie.')
		await interaction.update({ embeds: [actions], components: [], ephemeral: true });

		const astronaut = await Astronaut.findOne({ where: { id: userId } });
		const astronautWeapon = await Astronautweapon.findOne({ where: { id: astronaut.weapon } });
		let fight = await Astronautfight.findOrCreate({ where: { userId: id }, defaults: { userId: id } });

		let opponent = fight.opponentId;
		const response = new MessageEmbed()
			.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
			.setColor('RED')
		if (!fight.state) {
			if (astronaut.lastFight === client.moment().format('L')) {
				response.setTitle('L\'action ⚔️ Combattre a été choisie.')
					.setDescription(`⏳ Ton droïde a déjà combattu aujourd'hui et doit recharger ses batteries, reviens demain pour combattre à nouveau !`)
				return interaction.followUp({ content: `<@${userId}>`, embeds: [response] });
			}
			// On recherche un adversaire de même niveau
			const opponentSameLevel = await Astronaut.findAll({ where: { level: astronaut.level, [Op.not]: { id: userId } }, order: sequelize.random(), limit: 1 });
			if (opponentSameLevel && interaction.guild.member(opponentSameLevel.id)) opponent = opponentSameLevel;
			else {
				// On a pas d'adversaire de même niveau, on recherche un niveau proche
				const lessLevel = (astronaut.level - 3) > 0 ? astronaut.level - 3 : 1;
				const moreLevel = astronaut.level + 3;
				const opponentCloseLevel = await Astronaut.findAll({ where: { level: { [Op.gte]: lessLevel, [Op.lte]: moreLevel }, [Op.not]: { id: userId } }, order: sequelize.random(), limit: 1 });
				if (opponentCloseLevel && interaction.guild.member(opponentCloseLevel.id)) opponent = opponentCloseLevel;
				else {
					// Aucun adversaire de niveau proche, on se bat contre le régent
					opponent = await Astronaut.findOne({ where: { id: client.user.id } });
				}
			}

			let newLastFight = client.moment().format('L');
			await Astronaut.update({ lastFight: newLastFight }, { where: { id: userId } });
			fight = await Astronautfight.update({
				opponentId: opponent.id,
				lifePoints: opponent.lifePoints,
				lootCredits: Math.floor(Math.random() * (10 - 1) + 1) + 10 + (opponent.level * 10),
				lootXp: Math.floor(Math.random() * (10 - 1) + 1) + (opponent.level * 10),
				state: true
			})
		}
		let opponentCheck = await interaction.guild.members.fetch(fight.opponentId);
		let opponentUsername = opponentCheck ? opponentCheck.user.username : 'Inconnu';
		const dbOpponent = await Astronaut.findOne({ where: { id: fight.opponentId } });
		const dbOpponentWeapon = await Astronautweapon.findOne({ where: { id: dbOpponent.weapon } });

		response.setTitle(`⚔️ Combat ${interaction.guild.members.cache.get(userId).user.username} 🆚 ${opponentUsername}`)
			.setDescription('Infos sur l\'adversaire :')
			.addField( `❤️ Points de vie`, `${fight.lifePoints}`, true )
			.addField( `🏆 Niveau`, `${dbOpponent.level}`, true)
			.addField( `🔫 Armement`, `${dbOpponentWeapon.name}`, true )
			.addField( `🏆 Ton Niveau`, `${astronaut.level}`, true )
			.addField( `🔫 Ton arme`, `${astronautWeapon.name}`, true )
			.addField( '\u200b', '\u200b', true )
			.addField( `🎁 Expérience à gagner`, `${fight.lootXp}`, true )
			.addField( `💰 Crédits à gagner`, `${fight.lootCredits}`, true )
			.addField( '\u200b', '\u200b', true )
			.setFooter({ text: `Une pièce détachée redonne 20 PV et protège ton droïde contre l'attaque du droïde adverse.`, iconURL: interaction.guild.members.cache.get(userId).user.avatarURL({ dynmanic: true, size: 512 }) });
		await interaction.followUp({ content: `<@${userId}>`, embeds: [response] });
		client.astronautShowActions(interaction, userId, false, false, true, true, true);
	},
};