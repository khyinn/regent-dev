const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { Suggestionsjeu } = require('../../managers/db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('suggererjeu')
		.setDescription('Permet de suggérer un jeu à découvrir/faire en let\'s play.')
		.addStringOption(option =>
            option
                .setName('nom')
                .setDescription('Indiquez le nom du jeu.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('url')
                .setDescription('Indiquez ici une URL décrivant le jeu (Steam, GOG, etc).')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('screenshot')
                .setDescription('Indiquez ici une URL vers une image du jeu.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Indiquez le type de vidéo(s) que vous souhaitez voir sur le jeu.')
                .addChoice('unique', 'Une vidéo découverte')
				.addChoice('lp', 'Un Let\'s Play complet')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('trailer')
                .setDescription('Indiquez ici une URL vers la bande-annonce du jeu.')
        ),
	suggestionChannelOnly: true,
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
        const { options } = interaction;
        const nom = options.getString('nom');
        const url = options.getString('url');
        const screen = options.getString('screenshot');
        const type = options.getString('type');
        const trailer = options.getString('trailer');

        const response = new MessageEmbed()
            .setColor('NAVY')
            .setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynamic: true, size: 512 }) })
        
        if (!url.startsWith('http')) {
            response.setDescription(`❌ L'URL vers le jeu n'est pas valide.`)
            return await interaction.reply({ embeds: [response], ephemeral: true });
        }
        if (!screen.startsWith('http')) {
            response.setDescription(`❌ L'URL vers l'image du jeu n'est pas valide.`)
            return await interaction.reply({ embeds: [response], ephemeral: true });
        }
        if (trailer && !trailer.startsWith('http')) {
            response.setDescription(`❌ L'URL vers la bande annonce du jeu n'est pas valide.`)
            return await interaction.reply({ embeds: [response], ephemeral: true });
        }

        response.setTitle(`🎮 Nouvelle suggestion de jeu de ${interaction.user.username}`)
            .setURL(url)
            .setImage(screen)
            .setTimestamp()
            .addField(`🎮 Nom du jeu`, nom)
            .addField(`⏳ Status`, `En attente`)
        
        if (type) response.addField(`📹 Type de vidéo`, type)
        if (trailer) response.addField(`▶️ Bande-annonce`, trailer)

        const buttons = new MessageActionRow()
            .addComponents(
                new MessageButton().setCustomId('bouton-accepter-jeu').setLabel('✅ Accepter').setStyle('PRIMARY'),
                new MessageButton().setCustomId('bouton-refuser-jeu').setLabel('⛔ Refuser').setStyle('SECONDARY')
            );

        const message = await interaction.reply({ embeds: [response], components: [buttons], fetchReply: true });
        await message.react(`<:oui:908482646416457769>`);
        await message.react(`<:non:908482751261454366>`);
        await Suggestionsjeu.create({ msgId: message.id, name: nom, url: url, screenshot: screen, type: type, trailer: trailer });
	},
};