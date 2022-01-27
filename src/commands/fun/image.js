const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const Scraper = require('images-scraper');
const Google = new Scraper({
	puppeteer: {
		headless: false
	},
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName("image")
		.setDescription("Affiche une image aléatoire concernant l'objet demandé.")
		.addStringOption(option =>
			option.setName("recherche")
				.setDescription("Sélectionnez l'objet à rechercher.")
				.setRequired(true)
				.addChoice("chat", "chat")
				.addChoice("chien", "chien")
				.addChoice("lama", "lama")
				.addChoice("rousse", "rousse")
				.addChoice("brune", "brune")
				.addChoice("blonde", "blonde")
				.addChoice("anna kendrick", "anna kendrick")
				.addChoice("roux", "roux")
				.addChoice("brun", "brun")
				.addChoice("blond", "blond")
		),
	cmdChannelOnly: true,
	disallowMutin: true,
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const choices = interaction.options.getString("recherche");
		let recherche;

		switch (choices) {
			case "chat": {
				recherche = `chat`;
			}
			break;
			case "chien": {
				recherche = `chien`;
			}
			break;
			case "lama": {
				recherche = `lama`;
			}
			break;
			case "rousse": {
				recherche = `jolie rousse`;
			}
			break;
			case "brune": {
				recherche = `jolie brune`;
			}
			break;
			case "blonde": {
				recherche = `jolie blonde`;
			}
			break;
			case "anna kendrick": {
				recherche = `anna kendrick`;
			}
			break;
			case "roux": {
				recherche = `joli roux`;
			}
			break;
			case "brun": {
				recherche = `joli brun`;
			}
			break;
			case "blond": {
				recherche = `joli blond`;
			}
			break;
		}

		await interaction.reply({ content: `Recherche d'image... Veuillez patienter...`});
		await Google.scrape(recherche, 30).then((results) => {
			const r = Math.floor((Math.random() * results.length));
			const response = new MessageEmbed()
				.setTitle(`Voici une image aléatoire de : ${choices}`)
				.setColor("RANDOM")
				.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
				.setImage(results[r].url);
			interaction.editReply({ content: null, embeds: [response] });
		});
	},
};