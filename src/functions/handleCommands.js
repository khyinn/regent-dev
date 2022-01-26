const { readdirSync } = require('fs');

module.exports = (client) => {
	client.handleCommands = async (commandFolders, path) => {
		console.log(`🔻 Chargement des commandes...`);
		for (folder of commandFolders) {
			const commandFiles = readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));
			for (const file of commandFiles) {
				const command = require(`../commands/${folder}/${file}`);
				client.commands.set(command.data.name, command);
				client.commandsArray.push(command.data.toJSON());
				console.log(`✅ Commande ${command.data.name} chargée !`);
			}
		}
	};
}