module.exports = (client) => {
	client.handleEvents = async (eventFiles) => {
		console.log(`🔻 Chargement des événements...`);
		for (const file of eventFiles) {
			const event = require(`../events/${file}`);
			console.log(`✅ Événement ${event.name} chargé !`);
			if (event.once) {
				client.once(event.name, (...args) => event.execute(...args, client));
			} else {
				client.on(event.name, (...args) => event.execute(...args, client));
			}
		}
	};
}