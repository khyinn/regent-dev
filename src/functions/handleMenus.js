const { readdirSync } = require('fs');

module.exports = (client) => {
	client.handleMenus = async (menuFolders, path) => {
		console.log(`🔻 Chargement des menus...`);
		for (folder of menuFolders) {
			const menuFiles = readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));
			for (const file of menuFiles) {
				const menu = require(`../menus/${folder}/${file}`);
				client.menus.set(menu.data.name, menu);
				console.log(`✅ Menu ${menu.data.name} chargé !`);
			}
		}
	};
}