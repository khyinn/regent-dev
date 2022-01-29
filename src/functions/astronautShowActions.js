const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');
const { Astronautmarket, Astronautweapon } = require('../managers/db.js');

module.exports = (client) => {
	client.astronautShowActions = async (interaction, userId, combattre, acheter, attaquer, reparer, fuir) => {
		let rows = [];
		const row = new MessageActionRow();
		if (combattre) {
			row.addComponents(
				new MessageButton().setCustomId('bouton-astronaute-combattre').setLabel('⚔️ Combattre').setStyle('DANGER')
			);
		}
		if (attaquer) {
			row.addComponents(
				new MessageButton().setCustomId('bouton-astronaute-attaquer').setLabel('⚔️ Attaquer').setStyle('DANGER')
			);
		}
		if (reparer) {
			row.addComponents(
				new MessageButton().setCustomId('bouton-astronaute-reparer').setLabel('🛠️ Réparer').setStyle('SUCCESS')
			);
		}
		if (fuir) {
			row.addComponents(
				new MessageButton().setCustomId('bouton-astronaute-fuir').setLabel('🏃 Tenter de fuir').setStyle('PRIMARY')
			);
		}
		rows.push(row);
		if (acheter) {
			const options = [];
			await Astronautmarket.findAll({ where: { type: 'gear' } }).then((gears) => {
				gears.forEach((gear) => {
					options.push({
						label: gear.name,
						descriptions: `Coût: ${gear.cost}, PV rendus (par pièce si pack): ${gear.lifeRestored}`,
						value: gear.id
					})
				});
			});
			await Astronautmarket.findAll({ where: { type: 'weapon' } }).then((weapons) => {
				weapons.forEach((weapon) => {
					let weaponDetails = await Astronautweapon.findOne({ where: { id: weapon.weaponId } });
					options.push({
						label: weaponDetails.name,
						descriptions: `Coût: ${weapon.cost}, Attaque: ${weaponDetails.attack}, Niveau: ${weaponDetails.level}, Modificateur: ${weaponDetails.modifier}`,
						value: weapon.id
					})
				});
			});
			const row2 = new MessageActionRow().addComponents(
				new MessageSelectMenu().setCustomId('menu-astronaute-acheter').setPlaceholder('💰 Sélectionne un objet à acheter').setMinValues(1).setMaxValues(1).addOptions([options])
			);
			rows.push(row2);
		}

		const actions = new MessageEmbed()
			.setAuthor({ name: `${interaction.guild.members.cache.get(userId).user.username}`, iconURL: `${interaction.guild.members.cache.get(userId).user.avatarURL({ dynmanic: true, size: 512 })}` })
			.setColor('RED')
			.setDescription('Choisis ta prochaine action')
		await interaction.followUp({ embeds: [actions], components: rows, ephemeral: true });
	};
}