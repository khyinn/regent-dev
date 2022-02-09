const { MessageActionRow, Message, MessageEmbed, MessageButton } = require('discord.js');
  
/**
 * Crée un embed avec pagination
 * @param {Interaction} interaction
 * @param {MessageEmbed[]} pages
 * @param {MessageButton[]} buttonList
 * @param {number} timeout
 */
const paginationEmbed = async (interaction, pages, buttonList, timeout = 120000) => {
	let page = 0;
	const row = new MessageActionRow().addComponents(buttonList);
  
	if (interaction.deferred == false) await interaction.deferReply();
  
	const curPage = await interaction.editReply({ embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })], components: [row], fetchReply: true });
	const filter = (i) => i.customId === buttonList[0].customId || i.customId === buttonList[1].customId;
	const collector = await curPage.createMessageComponentCollector({ filter, time: timeout });
  
	collector.on('collect', async (i) => {
		switch (i.customId) {
			case buttonList[0].customId:
				page = page > 0 ? --page : pages.length - 1;
				break;
			case buttonList[1].customId:
				page = page + 1 < pages.length ? ++page : 0;
				break;
			default:
				break;
		}
		await i.deferUpdate();
		await i.editReply({ embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })], components: [row] });
		collector.resetTimer();
	});
  
	collector.on('end', (_, reason) => {
		if (reason !== 'messageDelete') {
			const disabledRow = new MessageActionRow().addComponents(buttonList[0].setDisabled(true), buttonList[1].setDisabled(true));
			curPage.edit({ embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })], components: [disabledRow] });
		}
	});
  
	return curPage;
};
module.exports = paginationEmbed;