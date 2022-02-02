const { Client, CommandInteraction, MessageEmbed } = require('discord.js');
const { Astronaut, Astronautfight, Astronautweapon } = require('../../managers/db.js');

module.exports = {
	data: {
		name: "bouton-astronaute-attaquer"
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
			.setDescription('L\'action ⚔️ Attaquer a été choisie.')
		await interaction.update({ embeds: [actions], components: [], ephemeral: true });

		const response = new MessageEmbed()
			.setTitle( `⚔️ Attaque de ${interaction.guild.members.cache.get(userId).user.username}` )
			.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
			.setColor('RED')
		const responseEnd = new MessageEmbed()
			.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
		var reply = [];

		const astronaut = await Astronaut.findOne({ where: { id: userId } });
		const astronautWeapon = await Astronautweapon.findOne({ where: { id: astronaut.weapon } });
		const astronautCriticalDamage = astronaut.level + astronautWeapon.level + (astronautWeapon.attack * 2) + Math.floor(Math.random() * (10 - 1) + 1);
		const astronautNormalDamage = astronaut.level + astronautWeapon.attack + Math.floor(Math.random() * (10 - 1) + 1);

		const fight = await Astronautfight.findOne({ where: { userId: userId } });

		const opponent = await Astronaut.findOne({ where: { id: fight.userId } });
		const opponentWeapon = await Astronautweapon.findOne({ where: { id: opponent.weapon } });
		const opponentCriticalDamage = opponent.level + opponentWeapon.level + (opponentWeapon.attack * 2) + Math.floor(Math.random() * (10 - 1) + 1);
		const opponentNormalDamage = opponent.level + opponentWeapon.attack + Math.floor(Math.random() * (10 - 1) + 1);

		const creditsSup = opponentWeapon.attack + opponent.level + Math.floor(Math.random() * (10 - 1) + 1);
		const gearsSup = Math.floor(Math.random() * 2 + 1);

		let levelSup = 0, levelOpSup = 0, newState = fight.state;
		let newLifePoints = astronaut.lifePoints, newGears = astronaut.gears, newCredits = astronaut.credits;
		let newPoints = astronaut.points, newLevel = astronaut.level, newVictories = astronaut.victories, newDefeats = astronaut.defeats, newFights = astronaut.fights, newLastFight;
		let newOpPoints = opponent.points, newOpLevel = opponent.level, newOpLifePoints = fight.lifePoints, newOpWeapon = opponent.weapon;
		let opponentMove = Math.floor(Math.random() * (101 - 1) + 1); // dé 100 déterminant si l'adversaire subit des dégâts simples, critiques ou s'il esquive, résultat entre 2 et 99
		opponentMove -= astronautWeapon.modifier; // résultat compris entre -7 et 99

		if (opponentMove <= (10 + astronautWeapon.modifier)) { // résultat compris entre -7 et (10 à 19)
			// L'adversaire est en échec critique et ne peut esquiver, il subit des dégâts critiques
			newOpLifePoints -= astronautCriticalDamage;
			if (newOpLifePoints < 0) newOpLifePoints = 0;
			response.addField( `🗡️ Attaque`, `Réussite critique, le droïde adverse perd ${astronautCriticalDamage} ❤️` )
			   	.addField( `❤️ Ton droïde`, `${astronaut.lifePoints}`, true )
			   	.addField( `❤️ Droïde adverse`, `${newOpLifePoints}`, true )
			   	.addField( `\u200b`, `\u200b`, true )
		} else if (opponentMove > (10 + astronautWeapon.modifier) && opponentMove <= (80 + astronautWeapon.modifier)) { // résultat entre 10 et (80 à 89)
			// L'adversaire n'esquive pas, subit des dégâts standards et blesse le joueur
			newOpLifePoints -= astronautNormalDamage;
			if (newOpLifePoints < 0) newOpLifePoints = 0;
			newLifePoints -= opponentNormalDamage;
			if (newLifePoints < 0) newLifePoints = 0;
			response.addField( `🗡️ Attaque`, `Réussite, le droïde adverse perd ${astronautNormalDamage} ❤️`, true )
			   	.addField( `🛡️ Défense`, `L'adversaire parvient à toucher ton droïde qui perd ${opponentNormalDamage} ❤️`, true )
			   	.addField( `\u200b`, `\u200b`, true )
			   	.addField( `❤️ Ton droïde`, `${newLifePoints}`, true )
			   	.addField( `❤️ Droïde adverse`, `${newOpLifePoints}`, true )
			   	.addField( `\u200b`, `\u200b`, true )
		} else {
			// Échec critique, l'adversaire esquive et vous attaque, vous causant des dégâts critiques
			newLifePoints -= opponentCriticalDamage;
			if (newLifePoints < 0) newLifePoints = 0;
			response.addField( `🗡️ Attaque`, `Échec critique, le droïde adverse esquive et réplique, ton droïde perd ${opponentCriticalDamage} ❤️` )
			   	.addField( `❤️ Ton droïde`, `${newLifePoints}`, true )
			   	.addField( `❤️ Droïde adverse`, `${newOpLifePoints}`, true )
			   	.addField( `\u200b`, `\u200b`, true )
		}
		reply.push(response);

		// Analyse du résultat
		let result = false;
		responseEnd.setTitle( `⚔️ Fin du combat de ${interaction.guild.members.cache.get(userId).user.username}` )
		   	.setFooter({ text: `Utilise /astronaute pour voir ton profil de combat`, iconURL: interaction.guild.members.cache.get(userId).user.avatarURL({ dynmanic: true, size: 512 }) })
		if (newLifePoints === 0 && newOpLifePoints === 0) {
			// Défaite
			responseEnd.setColor('RED')
				.setDescription(`Défaite ! Alors que ton droïde porte le dernier coup, achevant le droïde adverse, celui-ci parvient, dans un dernier sursaut, à porter un dernier coup.\nLes deux droïdes tombent au sol, hors d'usage.`)
				.addField( `🎁 Expérience gagnée`, `0`, true )
				.addField( `💰 Crédits gagnés`, `0`, true )
			// Mise à jour des statistiques
			if (newGears === 0 && newCredits < 20) {
				newGears += 3;
				responseEnd.addField( `⚙️ Un peu d'aide`, `Tu gagnes **3 pièces détachées**`, true )
			} else responseEnd.addField( '\u200b', '\u200b', true );

			newLifePoints = 40 + (10 * newLevel);
			newFights += 1;
			newDefeats += 1;
			newState = false;
			if (opponent.id === client.user.id) {
				newOpPoints += fight.lootXp;
				while (((10 * (newOpLevel + 1)) + 10) * (newOpLevel + 1) < newOpPoints) {
					newOpLevel++;
					levelOpSup += 1;
				}
				if (newOpLevel <= 15) newOpWeapon = newOpLevel;

				newOpLifePoints = 40 + (10 * newOpLevel);
				responseEnd.addField( `🔺 Gain d'expérience pour`, `${interaction.guild.members.cache.get(opponent.id).user.username} qui gagne **${fight.lootXp} points d'expérience.**` )
				if (levelOpSup > 0) responseEnd.addField( `🔺 Gain de niveau`, `${interaction.guild.members.cache.get(opponent.id).user.username} gagne **${levelOpSup} niveau(x).**` )
			}
			reply.push(responseEnd);
			result = true;
		} else if (newOpLifePoints === 0) {
			// Victoire !
			responseEnd.setColor('GREEN')
				.setDescription(`Victoire ! Alors que ton droïde porte le dernier coup, achevant le droïde adverse, une profonde joie t'envahit.\nLe droïde adverse est détruit, tu peux maintenant te reposer et profiter de l'expérience durement acquise.`)
				.addField( `🎁 Expérience gagnée`, `${fight.lootXp}`, true )
				.addField( `💰 Crédits gagnés`, `${fight.lootCredits}`, true )
			let opponentLoot = Math.floor(Math.random() * (100 - 1) + 1);
			if (opponentLoot <= 20) {
				newCredits += creditsSup;
				newGears += gearsSup;
				responseEnd.addField( `📦 Objets suppl. gagnés`, `${creditsSup} 💰 | ${gearsSup} ⚙️`, true )
			} else if (opponentLoot > 20 && opponentLoot <= 40) {
				newCredits += creditsSup;
				responseEnd.addField( `📦 Objets suppl. gagnés`, `${creditsSup} 💰`, true )
			} else if (opponentLoot > 40 && opponentLoot <= 60) {
				newGears += gearsSup;
				responseEnd.addField( `📦 Objets suppl. gagnés`, `${gearsSup} ⚙️`, true )
			} else responseEnd.addField( '\u200b', '\u200b', true )

			// Mise à jour des statistiques
			newCredits += fight.lootCredits;
			newPoints += fight.lootXp;
			newVictories += 1;
			while (((10 * (newLevel + 1)) + 10) * (newLevel + 1) < newPoints) {
				newLevel++;
				levelSup += 1;
			}
			newLifePoints = 40 + (10 * newLevel);
			newFights += 1;
			newState = false;
			if (opponent.id === client.user.id) {
				newOpPoints += fight.lootXp;
				while (((10 * (newOpLevel + 1)) + 10) * (newOpLevel + 1) < newOpPoints) {
					newOpLevel++;
					levelOpSup += 1;
				}
				if (newOpLevel <= 15) newOpWeapon = newOpLevel;

				newOpLifePoints = 40 + (10 * newOpLevel);
				responseEnd.addField( `🔺 Gain d'expérience pour`, `${interaction.guild.members.cache.get(opponent.id).user.username} qui gagne **${fight.lootXp} points d'expérience.**` )
				if (levelOpSup > 0) responseEnd.addField( `🔺 Gain de niveau`, `${interaction.guild.members.cache.get(opponent.id).user.username} gagne **${levelOpSup} niveau(x).**` )
			}
			if (levelSup > 0) responseEnd.addField( `🔺 Gain de niveau`, `${interaction.guild.members.cache.get(userId).user.username} gagne **${levelSup} niveau(x).**` )
			reply.push(responseEnd);
			result = true;
		} else if (newLifePoints === 0) {
			// Défaite ! 
			responseEnd.setColor('RED')
				.setDescription(`Défaite ! Le dernier coup porté par le droïde adverse achève ton droïde.\nSon palmares s'achève ici.`)
			   	.addField( `☠️ Conséquence`, `Tu perds **1** niveau`, true )
				.addField( `💰 Crédits perdus`, `${fight.lootCredits}`, true )
			// Mise à jour des statistiques
			if (newGears === 0 && newCredits < 20) {
				newGears += 3;
				responseEnd.addField( `⚙️ Un peu d'aide`, `Tu gagnes **3 pièces détachées**`, true )
			} else responseEnd.addField( '\u200b', '\u200b', true )

			newLevel -= 1;
			newPoints = ((10 * (newLevel)) + 10) * (newLevel);
			if (newLevel <= 1) {
				newLevel = 1;
				newPoints = 0;
			}
			newLifePoints = 40 + (10 * newLevel);
			newFights += 1;
			newDefeats += 1;
			newState = false;
			newOpPoints += fight.lootXp;
			while (((10 * (newOpLevel + 1)) + 10) * (newOpLevel + 1) < newOpPoints) {
				newOpLevel++;
				levelOpSup += 1;
			}
			if (opponent.id === client.user.id && newOpLevel <= 15) newOpWeapon = newOpLevel;

			newOpLifePoints = 40 + (10 * newOpLevel);
			responseEnd.addField( `🔺 Gain d'expérience pour`, `${interaction.guild.members.cache.get(opponent.id).user.username} qui gagne **${fight.lootXp} points d'expérience.**` )
			if (levelOpSup > 0) responseEnd.addField( `🔺 Gain de niveau`, `${interaction.guild.members.cache.get(opponent.id).user.username} gagne **${levelOpSup} niveau(x).**` )
			reply.push(responseEnd);
			result = true;
		}
		// Sauvegarde des données
		await Astronautfight.update({ state: newState, lifePoints: newOpLifePoints }, { where: { userId: userId } });
		await Astronaut.update({ gears: newGears, level: newLevel, points: newPoints, fights: newFights, defeats: newDefeats, victories: newVictories, lifePoints: newLifePoints }, { where: { id: userId } });
		if (result) await Astronaut.update({ points: newOpPoints, level: newOpLevel, weapon: newOpWeapon, lifePoints: newOpLifePoints }, { where: { id: opponent.id } });
		await interaction.followUp({ content: `<@${userId}>`, embeds: reply });
		if (!result) client.astronautShowActions(interaction, userId, false, false, true, true, true);
	},
};