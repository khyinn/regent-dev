const { Client } = require('discord.js');
const { Config } = require('../managers/db.js');

module.exports = {
	name: 'ready',
	once: true,
	/**
	 * @param {Client} client 
	 */
	async execute(client) {
		const guildId = await Config.findOne({ where: { name: 'guildId'} } );
		const guild = await client.guilds.cache.get(guildId.value);
		await guild.members.fetch().catch(error => {console.error(error)});
		console.log(`⏳ Vérification des permissions des commandes...`);
		guild.commands.set(client.commandsArray).then(async (command) => {
			const Roles = (commandName) => {
				const cmdPerms = client.commands.find((c) => c.data.name === commandName).permission;
				if (!cmdPerms) return null;
				console.log(`➡️ La commande ${commandName} a des permissions spéciales.`)
				return guild.roles.cache.filter((r) => r.permissions.has(cmdPerms));
			}
	
			const fullPermissions = command.reduce((accumulator, cmd) => {
				const roles = Roles(cmd.name);
				if (!roles) return accumulator;
	
				const permissions = roles.reduce((a, r) => {
					return [...a, {id: r.id, type: "ROLE", permission: true}]
				}, []);
	
				return [...accumulator, {id: cmd.id, permissions}]
			}, []);
			console.log(`📖 Mise à jour des permissions des commandes en cours...`);
			await guild.commands.permissions.set({ fullPermissions });
			console.log(`✅ Mise à jour des permissions des commandes terminée !`)
		});
		console.log(`🟢 ${client.user.username} en ligne !`);
	},
};