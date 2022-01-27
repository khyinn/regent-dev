const { Client, MessageEmbed, Message } = require('discord.js');
const { Config, Levelsystem, Textline } = require('../managers/db.js');

module.exports = {
	name: 'messageCreate',
	/**
	 * @param {Message} message
	 * @param {Client} client 
	 */
	async execute(message, client) {
		if (message.author.bot) return;
		await Levelsystem.findOrCreate({ where: { id: message.author.id }, defaults: { id: message.author.id } }).then(async ([userLvl, created]) => {
			const xpAdd = Math.floor(Math.random() * 10) + 50;
			let curXp = userLvl.xp;
			let curLvl = userLvl.level;
			const newXp = curXp + xpAdd;
			const nextLvl = 1000 * (Math.pow(2, curLvl) - 1);
			if (nextLvl <= newXp) {
				curLvl = curLvl + 1;
				const response = new MessageEmbed()
					.setAuthor({ name: `Bravo ${message.author.username}`, iconURL: message.author.avatarURL({ dynamic: true, size: 512 }) })
					.setTitle('🔺 Tu es monté de niveau ! 🔺')
					.setThumbnail('https://i.imgur.com/VkU5qrT.png')
					.setColor('AQUA')
					.addField('Nouveau niveau', curLvl.toString());
				if (curLvl === 5) {
					const stellaire_role = await Config.findOne({ where: { name: 'stellaire_role' } });
					let role = message.guild.roles.cache.find(r => r.id == stellaire_role.value);
					const member = message.guild.members.cache.get(message.author.id);
					member.roles.add(role);
				}
				message.channel.send({ content: `<@${message.author.id}>`, embeds: [response] });
			}
			await Levelsystem.update({ xp: newXp, level: curLvl }, { where: { id: message.author.id } });
		});

		// punchlines
		let rNumber = Math.random();
		const cantina_channel = await Config.findOne({ where: { name: 'cantina_channel' } });
		if (rNumber <= 0.025 && message.channel.id === cantina_channel.value) {
			const punchline = await Textline.findOne({ where : { linetype: `punchlines` }, order: sequelize.random() });
			message.channel.send({ content: client.parseString(punchline.value, `<@${message.author.id}>`) });
		}
	}
}