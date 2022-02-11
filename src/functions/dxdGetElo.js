module.exports = (client) => {
	/*
	 * myRate : integer, current player elo
	 * opRate : integer, current opponent elo
	 * fResult : 0 => fight lost; 0.5 => tie; 1 => fight won
	 * returns JSON Object with new player elo and elo delta
	 */
	client.dxdGetElo = (myRate, opRate, fResult) => {
		var myChanceToWin = 1 / ( 1 + Math.pow(10, (opRate - myRate) / 400));
		var delta = Math.round(32 * (fResult - myChanceToWin));
		var newRate = myRate + delta;
		return { rate: newRate, delta: delta }
	};
}