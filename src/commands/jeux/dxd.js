const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');
const { sequelize, Config, Dxdcard, Dxdplayer } = require('../../managers/db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dxd')
		.setDescription('Jouez au jeu de cartes à collectionner basé sur High School DxD !')
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
				.setDescription('Affiche le profil d\'un joueur ou votre profil.')
				.addUserOption(option => option.setName('cible').setDescription('Sélectionner l\'utilisateur pour afficher son profil.'))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('booster')
				.setDescription('Sélectionnez cette option pour acheter un booster de 5 cartes (500 💰).')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('combattre')
				.setDescription('Sélectionnez cette option pour lancer un combat (250 💰).')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('infocarte')
				.setDescription('Affiche les informations de la carte indiquée.')
				.addStringOption(option => option.setName('cardid').setDescription('Indiquez un identifiant de carte valide').setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('réinitialiser')
				.setDescription('Sélectionnez cette option pour réinitialiser votre personnage.')
		),
	charmeGameChannelOnly: true,
	disallowMutin: true,
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		let target;

		if (interaction.options.getSubcommand() === 'info') {
			if (!interaction.options.getUser('cible')) target = interaction.user.id;
			else target = interaction.options.getUser('cible').id;
		} else target = interaction.user.id;

		await Dxdplayer.findOrCreate({ where: { userId: target }, defaults: { userId: target }, include: 'cards' }).then(async ([player, created]) => {
			if (interaction.options.getSubcommand() === 'réinitialiser') {
				const id = player.userId;
				await player.removeDxdcards();
				await Dxdplayer.destroy({ where: { userId: id } });
				
				const reinit = new MessageEmbed()
					.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
					.setColor('GREEN')
					.setDescription('✅ Joueur réinitialisé !')
				await interaction.reply({ content: `<@${id}>`, embeds: [reinit] });
			} else {
				const raritycemoji = client.emojis.cache.get('916703129414795345');
				const rarityremoji = client.emojis.cache.get('916703151447502890');
				const raritysremoji = client.emojis.cache.get('916703169424293989');
				const rarityuremoji = client.emojis.cache.get('916703185241006101');
				const kingemoji = client.emojis.cache.get('916052200881524758');
				const queenemoji = client.emojis.cache.get('916052230782734367');
				const rookemoji = client.emojis.cache.get('916052284209774602');
				const knightemoji = client.emojis.cache.get('916052303159644171');
				const bishopemoji = client.emojis.cache.get('916052455240925276');
				const pawnemoji = client.emojis.cache.get('916052478380871730');
				const heartwingsemoji = client.emojis.cache.get('916050166551826503');
				const magicattackemoji = client.emojis.cache.get('916050396181594152');
				const magicdefenseemoji = client.emojis.cache.get('916050517426331730');

				const DxdConfigRaw = await Config.findOne({ where: { name: 'dxdConfig' } });
				const { DxdConfig } = JSON.parse(DxdConfigRaw.get('value'));

				if (interaction.options.getSubcommand() === 'info') {
					const allCardsCount = await Dxdcard.count();
					const allPlayerCardsCount = await player.countDxdcards();
					const commonCardsCount = await Dxdcard.count({ where: { rarity: 'Commune'} });
					const commonPlayerCardsCount = await player.countDxdcards({ where: { rarity: 'Commune'} });
					const rareCardsCount = await Dxdcard.count({ where: { rarity: 'Rare'} });
					const rarePlayerCardsCount = await player.countDxdcards({ where: { rarity: 'Rare'} });
					const superRareCardsCount = await Dxdcard.count({ where: { rarity: 'SuperRare'} });
					const superRarePlayerCardsCount = await player.countDxdcards({ where: { rarity: 'SuperRare'} });
					const ultraRareCardsCount = await Dxdcard.count({ where: { rarity: 'UltraRare'} });
					const ultraRarePlayerCardsCount = await player.countDxdcards({ where: { rarity: 'UltraRare'} });
					const kingCardsCount = await Dxdcard.count({ where: { class: 'Roi'} });
					const kingPlayerCardsCount = await player.countDxdcards({ where: { class: 'Roi'} });
					const queenCardsCount = await Dxdcard.count({ where: { class: 'Reine'} });
					const quuenPlayerCardsCount = await player.countDxdcards({ where: { class: 'Reine'} });
					const rookCardsCount = await Dxdcard.count({ where: { class: 'Tour'} });
					const rookPlayerCardsCount = await player.countDxdcards({ where: { class: 'Tour'} });
					const knightCardsCount = await Dxdcard.count({ where: { class: 'Cavalier'} });
					const knightPlayerCardsCount = await player.countDxdcards({ where: { class: 'Cavalier'} });
					const bishopCardsCount = await Dxdcard.count({ where: { class: 'Fou'} });
					const bishopPlayerCardsCount = await player.countDxdcards({ where: { class: 'Fou'} });
					const pawnCardsCount = await Dxdcard.count({ where: { class: 'Pion'} });
					const pawnPlayerCardsCount = await player.countDxdcards({ where: { class: 'Pion'} });

					const response = new MessageEmbed()
						.setTitle(`${heartwingsemoji} ${interaction.guild.members.cache.get(target).user.username} ${heartwingsemoji}`)
						.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
						.setColor('RANDOM')
						.addField( `⚔️ Statistiques de combat`, `☠️ Combats effectués: ${player.fights}\n✅ Victoires: ${player.victories} (${player.victories === 0 ? 0 : ((player.victories / player.fights) * 100).toFixed(2)} %)\n❌ Défaites: ${player.defeats}` )
						.addField( `📈 Économie`, `💰 Crédits démoniaques: ${player.credits}\n✨ Poussières démoniaques: ${player.dusts}` )
						.addField( `📚 Collection (${allPlayerCardsCount} / ${allCardsCount})`, `${raritycemoji} Communes: ${commonPlayerCardsCount} / ${commonCardsCount}\n
							${rarityremoji} Rares: ${rarePlayerCardsCount} / ${rareCardsCount}\n
							${raritysremoji} Super rares: ${superRarePlayerCardsCount} / ${superRareCardsCount}\n
							${rarityuremoji} Ultra rares: ${ultraRarePlayerCardsCount} / ${ultraRareCardsCount}\n\n
							${kingemoji} Roi: ${kingPlayerCardsCount} / ${kingCardsCount}\n
							${queenemoji} Reine: ${quuenPlayerCardsCount} / ${queenCardsCount}\n
							${rookemoji} Tour: ${rookPlayerCardsCount} / ${rookCardsCount}\n
							${knightemoji} Cavalier: ${knightPlayerCardsCount} / ${knightCardsCount}\n
							${bishopemoji} Fou: ${bishopPlayerCardsCount} / ${bishopCardsCount}\n
							${pawnemoji} Pion: ${pawnPlayerCardsCount} / ${pawnCardsCount}` )
						.setFooter({ text: `Lance des combats pour gagner des crédits et de l'expérience démoniaques`, iconURL: interaction.guild.members.cache.get(target).user.avatarURL({ dynmanic: true, size: 512 }) });

					await interaction.reply({ content: `<@${target}>`, embeds: [response] });
				}

				if (interaction.options.getSubcommand() === 'booster') {
					if (player.get('credits') >= 500) {
						player.credits = player.get('credits') - 500;
						let currentPage = 0;
						let messageContentList = [];
						let currentdusts = player.get('dusts');
						for (let i = 0; i < 5; i++) {
							const probability = Math.floor(Math.random() * 100) + 1;
							const droprater = DxdConfig.rarityrdroprate;
							const dropratesr = DxdConfig.raritysrdroprate;
							const droprateur = DxdConfig.rarityurdroprate;
							let messageContent = {};
							let newcardrarity;

							if (probability <= droprateur) {
								newcardrarity = 'UltraRare';
								messageContent.newcarddusts = DxdConfig.rarityurdusts;
								messageContent.rarityemoji = rarityuremoji;
							} else if (probability <= dropratesr) {
								newcardrarity = 'SuperRare';
								messageContent.newcarddusts = DxdConfig.raritysrdusts;
								messageContent.rarityemoji = raritysremoji;
							} else if (probability <= droprater) {
								newcardrarity = 'Rare';
								messageContent.newcarddusts = DxdConfig.rarityrdusts;
								messageContent.rarityemoji = rarityremoji;
							} else  {
								newcardrarity = 'Commune';
								messageContent.newcarddusts = DxdConfig.raritycdusts;
								messageContent.rarityemoji = raritycemoji;
							}
							await Dxdcard.findOne({ where: { rarity: newcardrarity }, order: sequelize.randomm() }).then(async newcard => {
								let hasCard = false;
								player.cards.forEach(card => {
									if (card.get('cardId') === newcard.get('cardId')) hasCard = true;
								});
								messageContent.cardName = newcard.get('name');
								messageContent.cardId = newcard.get('cardId');
								messageContent.cardURI = `./images/dxdcards/${messageContent.cardId} - ${messageContent.cardName}.png`;
								messageContent.hasCard = hasCard;
							})
							.catch(err => console.error(err));

							if (hasCard) {
								currentdusts = currentdusts + messageContent.newcarddusts;
							} else {
								await Dxdcard.findByPk(messageContent.cardId).then(card => {
									player.addCard(card);
								})
							}
							messageContentList.push(messageContent);
						}
						player.dusts = currentdusts;
						player.save();

						const response = new MessageEmbed()
							.setTitle(`${heartwingsemoji} ${interaction.guild.members.cache.get(target).user.username} ${heartwingsemoji}`)
							.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
							.setColor('RANDOM')

					} else interaction.reply({ content: `❌ Tu n'as pas assez de crédits démoniaques pour ouvrir un booster.`, ephemeral: true });
				}

				if (interaction.options.getSubcommand() === 'infocarte') {
					const cardId = interaction.options.getString('cardid');
					await Dxdcard.findOne({ where: { cardId: cardId } }).then(card => {
						let classemoji, rarityemoji, dusts;
						switch (card.get('class')) {
							case 'Roi':
								classemoji = kingemoji;
								break;
							case 'Reine':
								classemoji = queenemoji;
								break;
							case 'Tour':
								classemoji = rookemoji;
								break;
							case 'Cavalier':
								classemoji = knightemoji;
								break;
							case 'Fou':
								classemoji = bishopemoji;
								break;
							case 'Pion':
								classemoji = pawnemoji;
								break;
						}
						switch (card.get('rarity')) {
							case 'Commune':
								rarityemoji = raritycemoji;
								dusts = DxdConfig.raritycdusts;
								break;
							case 'Rare':
								rarityemoji = rarityremoji;
								dusts = DxdConfig.rarityrdusts;
								break;
							case 'SuperRare':
								rarityemoji = raritysremoji;
								dusts = DxdConfig.raritysrdusts;
								break;
							case 'UltraRare':
								rarityemoji = rarityuremoji;
								dusts = DxdConfig.rarityurdusts;
								break;
						}
						const response = new MessageEmbed()
							.setTitle(`${heartwingsemoji} ${card.get('name')} ${heartwingsemoji}`)
							.setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) })
							.setColor('RANDOM')
							.setImage(`./images/dxdcards/${card.get('cardId')} - ${card.get('name')}.png`)
							.addField( `Classe`, `${classemoji} ${card.get('class')}`, true )
							.addField( `Rareté`, `${rarityemoji} ${card.get('rarity').replace('SuperRare', 'Super rare').replace('UltraRare', 'Ultra rare')}`, true )
							.addField( `Poussière démoniaque`, `${dusts} ✨`, true )
							.addField( `Attaque`, `${magicattackemoji} ${card.get('attack')}`, true )
							.addField( `Défense`, `${magicdefenseemoji} ${card.get('defense')}`, true )
							.setFooter({ text: `ID: ${card.get('cardId')}`, iconURL: client.user.avatarURL({ dynmanic: true, size: 512 }) });
						await interaction.reply({ content: `Informations sur une carte`, embeds: [response] });
					}).catch(err => {
						interaction.reply({ content: `❌ Cet identifiant de carte n'existe pas ou la connexion avec la base de données est indisponible.`, ephemeral: true });
						console.error(JSON.stringify(err, null, 4));
					});
				}

				if (interaction.options.getSubcommand() === 'combattre') {

				}
			}
		});
	},
};