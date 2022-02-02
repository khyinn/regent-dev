const { sequelize, Giveaway, Giveawayuser } = require('../managers/db.js');

module.exports = (client) => {
	/**
	 * @param {String} id
	 * @param {Boolean} end
	 * @param {Boolean} rerolled 
	 */
	client.majGiveaway = async (id, end, rerolled) => {
		const giveaway = await Giveaway.findOne({ where: { id: id } });
		if (!giveaway) return;
		let channel = await client.channels.cache.get(giveaway.channelID);
		if (!channel) return await Giveaway.update({ ended: true }, { where: { id: id} });
		const users = await Giveawayuser.findAndCountAll({
			attributes: ['userId'],
			where: { giveawayId: id },
			order: sequelize.random() });
		const winners = users.rows.slice(0, giveaway.winnerCount);
		const response = new MessageEmbed()
			.setTitle('🎉 **CONCOURS** 🎉')
			.setAuthor({ name: giveaway.author, iconURL: giveaway.authorURL })
			.setColor('GOLD')
			.setDescription(`**${giveaway.winnerCount} gagnant${giveaway.winnerCount > 1 ? 's': ''}** tiré${giveaway.winnerCount > 1 ? 's': ''} au sort pour gagner **${giveaway.prize}**.\nCliquez sur le bouton pour participer !\nTerminé : **<t:${Math.round(giveaway.endAt / 1000)}:R>** ${client.progressBar(giveaway.endAt - Date.now(), giveaway.endAt - giveaway.startAt)}\nParticipant(s) : **${users.count}**`)
			.setFooter({ text: `ID : ${giveaway.id}`, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
			.setTimestamp(giveaway.timestamp)
		if (end) {
			if (winners.length) {
				const winner = winners.map((x) => `<@${x.userId}>`).join(", ");
				response.setDescription(`Concours terminé !\n${rerolled ? 'Tirage au sort relancé !\n' : ''}Félicitations à ${winner} !\n**${users.count}** participant${users.count > 1 ? ' a tenté sa' : 's ont tenté leur'} chance.`);
				await channel.send({ content: `🎉 Félicitations ${winner}, gagnant${winners.length > 1 ? 's': ''} de **${giveaway.prize}** !  🎉`});
			} else {
				response.setDescription(`Concours annulé !\nAucun gagnant, la participation n'est pas suffisante.\nParticipant(s) : **${users.count}**`)
				await channel.send({ content: `🙁 Concours annulé !\nAucun gagnant, la participation n'est pas suffisante. 🙁` });
			}
			await Giveaway.update({ ended: true, winners: JSON.stringify(winners) }, { where: { id: id } });
		}
		if (giveaway.messageId)	await channel.messages.fetch(giveaway.messageId).then(msg => {
			if (giveaway.ended || end) msg.edit({ embeds: [response], components: [] }); else msg.edit({ embeds: [response] });
		});
	};
}