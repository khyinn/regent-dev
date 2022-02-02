const { Client, CommandInteraction, MessageEmbed } = require('discord.js');
const { Astronaut, Astronautfight, Astronautweapon } = require('../../managers/db.js');

module.exports = {
	data: {
		name: 'bouton-astronaute-fuir'
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
			.setDescription('L\'action 🏃 Tenter de fuir a été choisie.')
		await interaction.update({ embeds: [actions], components: [], ephemeral: true });

		const astronaut = await Astronaut.findOne({ where: { id: userId } });
		const fight = await Astronautfight.findOne({ where: { userId: userId } });
		const opponent = await Astronaut.findOne({ where: { id: fight.userId } });
		const opponentWeapon = await Astronautweapon.findOne({ where: { id: opponent.weapon } });

		const opponentCriticalDamage = opponent.level + opponentWeapon.level + (opponentWeapon.attack * 2) + Math.floor(Math.random() * (10 - 1) + 1);
		const opponentNormalDamage = opponent.level + opponentWeapon.attack + Math.floor(Math.random() * (10 - 1) + 1);

		var reply = [];
		let runAway = false, levelSup = 0, result = false, lp = astronaut.lifePoints;

		const response = new MessageEmbed()
			.setTitle('L\'action 🏃 Tenter de fuir a été choisie.')
			.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
		const responseEnd = new MessageEmbed()
			.setTitle( `⚔️ Fin du combat de ${interaction.guild.members.cache.get(userId).user.username}` )
			.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
			.setFooter({ text: `Utilise /astronaute pour voir ton profil de combat`, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })

		if (lp >= opponentCriticalDamage) {
			response.setColor('RED')
				.setDescription('❌ Le droïde adverse ne laisse aucune possibilité de fuite.')
		} else {
			// possibilité de fuite, jet de dé
			let chance = Math.floor(Math.random() * 100 + 1);
			if (chance >= 80) {
				// La fuite échoue et l'adversaire effectue un coup critique
				lp -= opponentCriticalDamage;
				if (lp < 0) lp = 0;
				response.setColor('RED')
					.addField( `🗡️ Attaque`, `Échec critique, alors que ton droïde tente de prendre la fuite, le droïde adverse puise dans ses réserves, le rejoint, et parvient à placer un coup critique, ton droïde perd ${opponentCriticalDamage} ❤️` )
			   		.addField( `❤️ Ton droïde`, `${lp}`, true )
			   		.addField( `❤️ Droïde adverse`, `${fight.lifePoints}`, true )
			   		.addField( `\u200b`, `\u200b`, true )
			} else if (chance >= 50) {
				// La fuite échoue et l'adversaire effectue un coup normal
				lp -= opponentNormalDamage;
				if (lp < 0) lp = 0;
				response.setColor('ORANGE')
					.addField( `🗡️ Attaque`, `Échec, alors que ton droïde tente de prendre la fuite, le droïde adverse puise dans ses réserves, le rejoint, et parvient à placer un coup, ton droïde perd ${opponentNormalDamage} ❤️` )
			   		.addField( `❤️ Ton droïde`, `${lp}`, true )
			   		.addField( `❤️ Droïde adverse`, `${fight.lifePoints}`, true )
			   		.addField( `\u200b`, `\u200b`, true )
			} else {
				// La fuite réussit
				runAway = true;
				response.setColor('GREEN')
					.setDescription(`🏃 Réussite ! Profitant d'un moment d'inattention de son adversaire, ton droïde parvient à atteindre l'entrée de l'arène et appuie sur le bouton d'évacuation. Il est en piteux état mais a tout de même réussi à fuir, emportant avec lui l'expérience accumulée.`)
			}
		}
		reply.push(response);

		// Analyse du résultat
		let newGears = astronaut.gears, newLevel = astronaut.level, newPoints = astronaut.points, newFights = astronaut.fights, newDefeats = astronaut.defeats;
		let newOpponentLifePoints = opponent.lifePoints, newOpponentPoints = opponent.points, newOpponentLevel = opponent.level, newOpponentWeapon = opponent.weapon;
		if (lp === 0) {
			// Défaite
			responseEnd.setColor('RED')
				.setDescription(`Défaite ! Alors que ton droïde chancèle suite au dernier coup porté par son adversaire, des volutes d'une fumée noire s'échappe d'un trou béant dans l'abdomen. Ton droïde s'écroule, définitivement hors d'usage.`)
			   	.addField( `☠️ Conséquence`, `Tu perds **1** niveau`, true )
				.addField( `💰 Crédits perdus`, `${fight.lootCredits}`, true )
			// Mise à jour des statistiques
			if (astronaut.gears === 0 && astronaut.credits < 20) {
				newGears += 3;
				responseEnd.addField( `⚙️ Un peu d'aide`, `Tu gagnes **3 pièces détachées**`, true )
			}
			else responseEnd.addField( '\u200b', '\u200b', true )

			newLevel -= 1;
			newPoints = ((10 * (newLevel)) + 10) * (newLevel);
			if (newLevel <= 1) {
				newLevel = 1;
				newPoints = 0;
			}
			lp = 40 + (10 * newLevel);
			newFights += 1;
			newDefeats += 1;
			newOpponentPoints += fight.lootXp;
			while (((10 * (newOpponentLevel + 1)) + 10) * (newOpponentLevel + 1) < newOpponentPoints) {
				newOpponentLevel++;
				levelSup += 1;
			}
			if (opponent.id === client.user.id && newOpponentLevel <= 15) newOpponentWeapon = newOpponentLevel;

			newOpponentLifePoints = 40 + (10 * newOpponentLevel);
			responseEnd.addField( `🔺 Gain d'expérience pour`, `${interaction.guild.members.cache.get(opponent.id).user.username} qui gagne **${fight.lootXp} points d'expérience.**` )
			if (levelSup > 0) responseEnd.addField( `🔺 Gain de niveau`, `${interaction.guild.members.cache.get(opponent.id).user.username} gagne **${levelSup} niveau(x).**` )
			reply.push(responseEnd);
			result = true;
		} else if (runAway) {
			responseEnd.setColor('GREEN')
				.addField( `🎁 Expérience gagnée`, `${Math.floor(fight.lootXp / 2)}`, true )
				.addField( `💰 Crédits gagnés`, `0`, true )
				.addField( '\u200b', '\u200b', true )
			// Mise à jour des statistiques
			newPoints += Math.floor(fight.lootXp / 2);
			while (((10 * (newLevel + 1)) + 10) * (newLevel + 1) < newPoints) {
				newLevel++;
				levelSup += 1;
			}
			lp = 40 + (10 * newLevel);
			newFights += 1;
			if (opponent.id === client.user.id) {
				newOpponentPoints += Math.floor(fight.lootXp / 2);
				while (((10 * (newOpponentLevel + 1)) + 10) * (newOpponentLevel + 1) < newOpponentPoints) {
					newOpponentLevel++;
				}
				if (newOpponentLevel <= 15) newOpponentWeapon = newOpponentLevel;
				newOpponentLifePoints = 40 + (10 * newOpponentLevel);
				responseEnd.addField( `🔺 Gain d'expérience pour`, `${interaction.guild.members.cache.get(opponent.id).user.username} qui gagne **${Math.floor(fight.lootXp / 2)} points d'expérience.**` )
			}
			if (levelSup > 0) responseEnd.addField( `🔺 Gain de niveau`, `${interaction.guild.members.cache.get(userId).user.username} gagne **${levelSup} niveau(x).**` )
			reply.push(responseEnd);
			result = true;
		}
		// Sauvegarde des données
		await Astronautfight.update({ state: false }, { where: { userId: userId } });
		await Astronaut.update({ gears: newGears, level: newLevel, points: newPoints, fights: newFights, defeats: newDefeats }, { where: { id: userId } });
		await Astronaut.update({ points: newOpponentPoints, level: newOpponentLevel, weapon: newOpponentWeapon, lifePoints: newOpponentLifePoints }, { where: { id: opponent.id } });

		await interaction.followUp({ content: `<@${userId}>`, embeds: reply }).then(sentInteraction => {
			if (!runAway) sentInteraction.react('902630776296845312');
		});
		if (!result) client.astronautShowActions(interaction, userId, false, false, true, true, true);
	},
};