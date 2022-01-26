const { readdirSync } = require('fs');

module.exports = (client) => {
	client.handleButtons = async (buttonFolders, path) => {
		console.log(`🔻 Chargement des boutons...`);
		for (folder of buttonFolders) {
			const buttonFiles = readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));
			for (const file of buttonFiles) {
				const button = require(`../buttons/${folder}/${file}`);
				client.buttons.set(button.data.name, button);
				console.log(`✅ Bouton ${button.data.name} chargé !`);
			}
		}
	};
}