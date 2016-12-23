module.exports = function normalizeExpires (expires) {
	var now = new Date();
	var exp = now.getTime();
	exp += expires * 1000;
	now.setTime(exp);
	return now.toGMTString();
};
