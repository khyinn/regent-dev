const { Client, Intents, Collection } = require('discord.js');
const { readdirSync } = require('fs');
const { token, db_user, db_password } = require('./data/config.json');

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_VOICE_STATES
	]
});

client.buttons = new Collection();
client.commands = new Collection();
client.commandsArray = [];
client.cooldowns = new Collection();
client.menus = new Collection();

const buttonFolders = readdirSync("./src/buttons");
const commandFolders = readdirSync("./src/commands");
const eventFiles = readdirSync("./src/events").filter(file => file.endsWith(".js"));
const functions = readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const menuFolders = readdirSync("./src/menus");

(async () => {
	console.log(`🔻 Chargement des fonctions...`);
	for (file of functions) {
		require(`./functions/${file}`)(client);
		console.log(`✅ Fonction ${file} chargée !`);
	}
	client.handleButtons(buttonFolders, "./src/buttons");
	client.handleCommands(commandFolders, "./src/commands");
	client.handleMenus(menuFolders, "./src/menus");
	client.handleEvents(eventFiles);
	client.login(token);
})();