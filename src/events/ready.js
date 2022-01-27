const { Client } = require('discord.js');
const { sequelize, Config, Textline, Youtube } = require('../managers/db.js');
const { YTube } = require('popyt');

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

		// activités
		setInterval(async () => {
			const activity = await Textline.findOne({ where : { linetype: `games` }, order: sequelize.random() });
			client.user.setPresence({ activities: [{ name: activity.value }], status: 'idle', type: "PLAYING" });
		}, 3600000); // 3600000 = 1h

		// nouvelle vidéo Youtube
		const yt_apikey = await Config.findOne({ where: { name: 'yt_api_key'} } );
		const yt_channel_url = await Config.findOne({ where: { name: 'yt_channel_url'} } );
		const yt_post_msg_channel = await Config.findOne({ where: { name: 'yt_post_msg_channel'} } );
		const friends_channel = await Config.findOne({ where: { name: 'friends_channel'} } );
		const youtubeData = await Youtube.findAll();
		for (let ytchannel in youtubeData) {
			setInterval(async () => {
				if (client.moment().minutes() === 45 || client.moment().minutes() === 30 || client.moment().minutes() === 15 || client.moment().minutes() === 0) {
					const ytube = new YTube(yt_apikey.value);
					const yt_channel = await ytube.getChannel(ytchannel.channel);
					const plist = await yt_channel.fetchVideos();
					const vids = await plist.fetchVideos();
					client.moment.locale('fr');
					if (vids[0].id != ytchannel.video_id) {
						Youtube.update({
							video_id: vids[0].id,
							video_title: vids[0].title,
							video_url: vids[0].shortUrl,
							video_date: client.moment(vids[0].datePublished).format('LLLL'),
							video_thumbnail: vids[0].thumbnails.medium.url
						},
						{ where: { channel: ytchannel.channel } });
						const c = await client.channels.cache.get((ytchannel.channel == yt_channel_url.value) ? yt_post_msg_channel.value : friends_channel.value);
						const videoEmbed = new MessageEmbed()
						.setTitle(`Nouvelle vidéo sur ${yt_channel.name} !`)
						.setURL(vids[0].shortUrl)
						.setDescription(`**${vids[0].title}**`)
						.setColor("RANDOM")
						.setThumbnail(client.user.avatarURL({ dynmanic: true, size: 512 }))
						.setImage(vids[0].thumbnails.medium.url)
						.setFooter({ text: client.moment(vids[0].datePublished).format('LLLL'), iconURL: "https://i.imgur.com/jlZaIbj.png" });
						c.send({ embeds: [videoEmbed] });
					}
				}
			}, 60000);
		}
	},
};