module.exports = function checkStorageSupport (key) {
	try {
		var k = '__supportTest' + Date.now();
		window[key].setItem(k, true);
		window[key].removeItem(k);
		return true;
	} catch (e) {
		return false;
	}
};
