const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, MessageEmbed, } = require('discord.js')
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const { YouTube } = require('popyt');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const { Config } = require('../../managers/db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('musique')
		.setDescription('Permet de jouer de la musique.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('lit')
				.setDescription('▶️ Recherche la musique sur Youtube et la lit.')
				.addStringOption(option => option.setName('depuis-youtube').setDescription('URL Youtube (vidéo ou playlist) ou mots clés à rechercher.').setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('pause')
				.setDescription('⏸️ Met en pause la musique.')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('reprise')
				.setDescription('▶️ Reprend la lecture.')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('passe')
				.setDescription('⏭️ Passe à la chanson suivante.')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('mélange')
				.setDescription('🔀 Mélange la liste de lecture.')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('liste')
				.setDescription('🎶 Affiche la liste de lecture.')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('stop')
				.setDescription('⏹️ Stoppe la musique.')
		),
	cantinaChannelOnly: true,
	disallowMutin: true,
	/**
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const options = interaction.options.getSubcommand();
		const vc = interaction.member.voice.channel;
		const chan = interaction.channel;
		const yt_apikey = await Config.findOne({ where: { name: 'yt_api_key'} } );
		const music_channel = await Config.findOne({ where: { name: 'music_channel'} } );

		if (vc === null || vc.id != music_channel.value) {
			const response = new MessageEmbed()
				.setColor('RED')
				.setDescription('❌ Tu dois être dans le salon vocal 🎶 musique !')
			return interaction.reply({ embeds: [response], ephemeral: true })
		}

		const ytube = new YouTube(yt_apikey.value);

		if (options === 'lit') {
			const recherche = interaction.options.getString('depuis-youtube');

			if (recherche != null) {
				await interaction.reply({ content: `⏳ Recherche en cours...`});
				const { videoURL, videoResults } = await verifierRecherche(ytube, recherche);

				if (videoURL === null) await interaction.editReply({ content: `❌ Impossible de trouver une chanson avec les mots-clés recherchés ou l'URL est invalide ! ce message est temporaire ! ⏳` });

				if (!client.queue.has(vc.guild.id)) {
					const queueConstruct = {
						voiceChannel: vc,
						textChannel: chan,
						songs: [],
						player: null,
						connection: null,
						playing: true,
					}

					let setPlaylist = false;
					if (videoResults.length > 0) {
						setPlaylist = true;
						videoResults.forEach(async (video) => {
							await mettreEnQueue(video.shortUrl, ytube, interaction, queueConstruct);
						});
					} else await mettreEnQueue(videoURL, ytube, interaction, queueConstruct);

					const connection = joinVoiceChannel({
						channelId: vc.id,
						guildId: vc.guild.id,
						adapterCreator: vc.guild.voiceAdapterCreator,
					});

					client.queue.set(vc.guild.id, queueConstruct);

					client.queue.get(vc.guild.id).connection = connection;

					const stream = ytdl(videoURL, {
						filter: 'audioonly',
						opusEncoded: true,
						quality: 'highestaudio',
						highWaterMark: 1<<25
					});
					const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
					player = createAudioPlayer();
					player.play(resource);
					connection.subscribe(player);

					client.queue.get(vc.guild.id).player = player;

					player.on(AudioPlayerStatus.Idle, () => continuePlayer(vc, client));
					player.on('error', error => {
						console.log('Erreur:', error.message);
					});
					const song = client.queue.get(vc.guild.id).songs[0];
					const response = new MessageEmbed()
						.setThumbnail(`${song.thumb}`)
						.setColor('PURPLE')
						.addField(`▶️ En cours :`, `${song.title}`, false)
						.addField(`⌚ Durée :`, `${song.time}`, false)
						.addField(`🔗 Lien :`, `${song.songURL}`, false)
						.setFooter({ text: client.moment().format('LLLL'), iconURL: 'https://i.imgur.com/jlZaIbj.png' });
					if (setPlaylist) {
						response.setAuthor({ name: `🎶 ${interaction.member.user.username} a ajouté une playlist`, iconURL: `${interaction.member.user.displayAvatarURL({dynamic: true, size: 256})}` })
							.addField(`⏭️ À suivre :`, `_____________`, false);
						let songList = client.queue.get(vc.guild.id).songs;
						let i = 0;
						if (songList[1]) {
							songList.forEach(song => {
								if (i != 0 && i < 20)
									response.addField(`${i}: **${song.title}**`, `Durée : ${song.time}, demandée par : ${song.requestee.user.username}`, false);
								i++;
							});
						} else response.addField(`-`, `⏹️ La liste de lecture est vide.`, false);
					} else response.setAuthor({ name: `🎶 ${interaction.member.user.username} a ajouté une musique`, iconURL: `${interaction.member.user.displayAvatarURL({dynamic: true, size: 256})}` });

					await interaction.editReply({ embeds: [response], content: ` ` });
				} else {
					const response = new MessageEmbed()
						.setColor('PURPLE')
						.setFooter({ text: client.moment().format('LLLL'), iconURL: 'https://i.imgur.com/jlZaIbj.png' });
					if (videoResults.length > 0) {
						videoResults.forEach(async (video) => {
							await mettreEnQueue(video.shortUrl, ytube, interaction, client.queue.get(vc.guild.id));
						});
						response.setDescription(`🎶 **Une nouvelle playlist** est ajoutée à la liste de lecture.`);
					} else {
						await mettreEnQueue(videoURL, ytube, interaction, client.queue.get(vc.guild.id));
						const song = client.queue.get(vc.guild.id).songs[client.queue.get(vc.guild.id).songs.length - 1];
						response.setDescription(`🎶 **${song.title}** est ajoutée à la liste de lecture.`);
					}
					await interaction.editReply({ embeds: [response], content: ` ` });
				}
			} else {
				const response = new MessageEmbed();
				if (client.queue.has(vc.guild.id)) {
					let unpause = client.queue.get(vc.guild.id).player.unpause();

					if (unpause == true) {
						response.setColor('PURPLE')
							.setDescription(`▶️ C'est reparti pour la musique !`)
							.setFooter({ text: client.moment().format('LLLL'), iconURL: 'https://i.imgur.com/jlZaIbj.png' });
					} else {
						response.setColor('RED')
							.setDescription(`⛔ Impossible de reprendre la lecture.`);
					}
				} else {
					response.setColor('RED')
						.setDescription(`❓ Je ne suis pas dans un salon vocal !`);
				}
				await interaction.reply({ embeds: [response] });
			}
		}

		if (options == 'pause') {
			const response = new MessageEmbed();
			if (client.queue.has(vc.guild.id)) {
				let pause = client.queue.get(vc.guild.id).player.pause(true);
				if (pause == true) {
					response.setColor('PURPLE')
						.setDescription(`⏸️ Et je coupe le son...`)
						.setFooter({ text: client.moment().format('LLLL'), iconURL: 'https://i.imgur.com/jlZaIbj.png' });
				} else {
					response.setColor('RED')
						.setDescription(`⛔ Impossible de mettre en pause.`);
				}
			} else {
				response.setColor('RED')
					.setDescription(`❓ Je ne suis pas dans un salon vocal !`);
			}
			await interaction.reply({ embeds: [response] });
		}

		if (options == 'reprise') {
			const response = new MessageEmbed();
			if (client.queue.has(vc.guild.id)) {
				let unpause = client.queue.get(vc.guild.id).player.unpause();

				if (unpause == true) {
					response.setColor('PURPLE')
						.setDescription(`▶️ Je remets le son...`)
						.setFooter({ text: client.moment().format('LLLL'), iconURL: 'https://i.imgur.com/jlZaIbj.png' });
				} else {
					response.setColor('RED')
						.setDescription(`⛔ Impossible de reprendre la lecture.`);
				}
			} else {
				response.setColor('RED')
					.setDescription(`❓ Je ne suis pas dans un salon vocal !`);
			}
			await interaction.reply({ embeds: [response] });
		}

		if (options == 'stop') {
			const response = new MessageEmbed();
			if (client.queue.has(vc.guild.id)) {
				client.queue.get(vc.guild.id).player.stop();
				client.queue.get(vc.guild.id).connection.destroy();
				client.queue.delete(vc.guild.id);

				response.setColor('PURPLE')
					.setDescription(`⏹️ La fête est finie, on stoppe la musique !`)
					.setFooter({ text: client.moment().format('LLLL'), iconURL: 'https://i.imgur.com/jlZaIbj.png' });
			} else {
				response.setColor('RED')
					.setDescription(`❓ Je ne suis pas dans un salon vocal !`);
			}
			await interaction.reply({ embeds: [response] });
		}

		if (options == 'passe') {
			const response = new MessageEmbed();
			if (client.queue.has(vc.guild.id)) {
				var recalledSong = client.queue.get(vc.guild.id).songs[0].title;
				continuePlayer(vc, client);
				response.setColor('PURPLE')
					.setDescription(`⏩ On passe **${recalledSong}**.`)
					.setFooter({ text: client.moment().format('LLLL'), iconURL: 'https://i.imgur.com/jlZaIbj.png' });
			} else {
				response.setColor('RED')
					.setDescription(`❓ Je ne suis pas dans un salon vocal !`);
			}
			await interaction.reply({ embeds: [response] });
		}

		if (options == 'mélange') {
			const response = new MessageEmbed();
			if (client.queue.has(vc.guild.id)) {
				var queueSongs = client.queue.get(vc.guild.id).songs;
				for (let i = queueSongs.length - 1; i > 0; i--) {
					let j = Math.round(Math.random() * (i + 1));
					while (j === 0) {
						j = Math.round(Math.random() * (i + 1));
					}
					const temp = queueSongs[i];
					queueSongs[i] = queueSongs[j];
					queueSongs[j] = temp;
				}
				client.queue.get(vc.guild.id).songs = queueSongs;
				response.setColor('PURPLE')
					.setDescription(`🔀 La liste de lecture a été mélangée.`)
					.setFooter({ text: client.moment().format('LLLL'), iconURL: 'https://i.imgur.com/jlZaIbj.png' });
			} else {
				response.setColor('RED')
					.setDescription(`❓ Je ne suis pas dans un salon vocal !`);
			}
			await interaction.reply({ embeds: [response] });
		}

		if (options == 'liste') {
			const response = new MessageEmbed();
			if (client.queue.has(vc.guild.id)) {
				let songList = client.queue.get(vc.guild.id).songs;
				const song = songList[0];
					response.setAuthor({ name: `${song.requestee.user.username} a demandé cette musique`, iconURL: `${song.requestee.user.displayAvatarURL({dynamic: true, size: 256})}` })
						.setThumbnail(`${song.thumb}`)
						.setColor('PURPLE')
						.addField(`▶️ En cours :`, `${song.title}`, false)
						.addField(`⌚ Durée :`, `${song.time}`, false)
						.addField(`🔗 Lien :`, `${song.songURL}`, false)
						.addField(`⏭️ À suivre :`, `_____________`, false)
						.setFooter({ text: client.moment().format('LLLL'), iconURL: 'https://i.imgur.com/jlZaIbj.png' })
				let i = 0;
				if (songList[1]) {
					songList.forEach(song => {
						if (i != 0 && i < 20)
							response.addField(`${i}: **${song.title}**`, `Durée : ${song.time}, demandée par : ${song.requestee.user.username}`, false);
						i++;
					});
				} else response.addField(`-`, `⏹️ La liste de lecture est vide.`, false);
			} else {
				response.setColor('RED')
					.setDescription(`❓ Je ne suis pas dans un salon vocal !`);
			}
			await interaction.reply({ embeds: [response] });
		}
	},
};

async function mettreEnQueue(videoURL, ytube, interaction, constructor) {
	const info = await ytube.getVideo(videoURL);
	let time = ``;
	let timeHours = Math.floor(parseInt(info.minutes) / 60);
	let timeMinutes = timeHours > 0 ? Math.floor(parseInt(info.minutes) % 60) : parseInt(info.minutes);
	let timeSeconds = parseInt(info.seconds);
	if (timeHours > 0) {
		time = timeHours < 10 ? `0${timeHours}:` : `${timeHours}:`;
	}
	if (timeMinutes > 0) {
		time += timeMinutes < 10 ? `0${timeMinutes}:` : `${timeMinutes}:`;
	}
	time += timeSeconds < 10 ? `0${timeSeconds}` : `${timeSeconds}`;

	const songInfo = {
		songURL: info.shortUrl,
		title: info.title,
		time: time,
		requestee: interaction.member,
		id: info.id,
		thumb: info.thumbnails.medium.url
	}
	constructor.songs.push(songInfo);
}

async function verifierRecherche(ytube, recherche) {
	if (ytpl.validateID(recherche)) {
		// L'utilisateur a rentré une playlist
		const playlist = await ytube.getPlaylist(recherche);
		const videoResults = await playlist.fetchVideos();
		return {
			videoURL: videoResults[0].shortUrlL,
			videoResults: videoResults
		};
	} else if (ytdl.validateURL(recherche)) {
		// L'utilisateur a rentré une URL Youtube
		return {
			videoURL: recherche,
			videoResults: []
		};
	} else {
		// L'utilisateur a rentré des mots clés
		const searchResults = await ytube.searchVideos(recherche, 1);
		return {
			videoURL: searchResults.results[0].shortUrl,
			videoResults: []
		};
	}
}

async function continuePlayer(vc, client) {
	let oldtext = client.queue.get(vc.guild.id).textChannel;
	client.queue.get(vc.guild.id).songs.shift();
	let player = client.queue.get(vc.guild.id).player;
	if (client.queue.get(vc.guild.id).songs[0]) {
		let song = client.queue.get(vc.guild.id).songs[0];
		const stream = ytdl(song.songURL, {
			filter: 'audioonly',
			opusEncoded: true,
			quality: 'highestaudio',
			highWaterMark: 1<<25
		});
		const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
		player.play(resource);

		const response = new MessageEmbed()
			.setAuthor({ name: `${song.requestee.user.username} a demandé cette musique`, iconURL: `${song.requestee.user.displayAvatarURL({dynamic: true, size: 256})}` })
			.setThumbnail(`${song.thumb}`)
			.setColor('PURPLE')
			.addField(`▶️ En cours :`, `${song.title}`, false)
			.addField(`⌚ Durée :`, `${song.time}`, false)
			.addField(`🔗 Lien :`, `${song.songURL}`, false)
			.setFooter({ text: client.moment().format('LLLL'), iconURL: 'https://i.imgur.com/jlZaIbj.png' })

		await client.queue.get(vc.guild.id).textChannel.send({ embeds: [response] });
	} else {
		client.queue.get(vc.guild.id).connection.destroy();
		client.queue.get(vc.guild.id).player.stop();
		client.queue.delete(vc.guild.id);
		const response = new MessageEmbed()
			.setColor('PURPLE')
			.setDescription(`👋 C'est tout, il n'y a plus rien à lire !`);
		await oldtext.send({ embeds: [response] });
	}
}