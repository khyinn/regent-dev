module.exports = (client) => {
	client.parseString = (...args) => {
		const str = args[0];
		const params = args.filter((arg, index) => index !== 0);
		if (!str) return "";
		return str.replace(/%s[0-9]+/g, matchedStr => {
			const variableIndex = matchedStr.replace("%s", "") - 1;
			return params[variableIndex];
		});
	};
}