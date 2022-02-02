module.exports = (client) => {
	client.progressBar = (value, maxValue) => {
		let percentage = 1 - value / maxValue;
		if (percentage > 1) percentage = 1;
		const progress = Math.round((10 * percentage));
		const emptyProgress = 10 - progress;
		const progressText = '█'.repeat(progress);
		const emptyProgressText = '░'.repeat(emptyProgress);
		const percentageText = Math.round(percentage * 100) + '%';
		return `[${progressText + emptyProgressText}] **(${percentageText})**`;
	};
}