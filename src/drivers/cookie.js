var cookies = require('browser-cookies');

var CookieStore = module.exports = function CookieStore (opts = {}) {
	this.metaKey = opts.metaKey || '@streammedev/storage';
	this.meta = {};
};

CookieStore.backendName = 'cookie';

CookieStore.supported = function () {
	var ret = false;
	if (typeof document !== 'undefined') {
		try {
			// Create cookie
			document.cookie = 'cookietest=1';
			ret = document.cookie.indexOf('cookietest=') !== -1;
			// Delete cookie
			document.cookie = 'cookietest=; expires=Thu, 01-Jan-1970 00:00:01 GMT';
		} catch (e) {
			ret = false;
		}
	}
	return ret;
};

CookieStore.prototype.setItem = function (key, val, params = {}) {
	// Convert expires to days, because that is what the cookies module takes
	if (typeof params.expires === 'number') {
		params.expires = params.expires / (60 * 60 * 24);
	}

	// Save some meta data about this cookie if the
	// value is not a string.
	if (typeof val !== 'string') {
		try {
			var meta = JSON.parse(cookies.get(this.metaKey)) || {};
			meta[key] = {
				stringify: true
			};
			cookies.set(this.metaKey, JSON.stringify(meta));
			val = JSON.stringify(val);
		} catch (e) {
			// Dont save the key
			return;
		}
	}

	return cookies.set(key, val, params);
};

CookieStore.prototype.getItem = function (key) {
	// Load meta for key
	try {
		var m = JSON.parse(cookies.get(this.metaKey)) || {};
		var meta = (m && m[key]) || {};
	} catch (e) {
		// Ignore
	}

	var val = cookies.get(key);
	if (val && meta.stringify) {
		return JSON.parse(val);
	}
	return val;
};

CookieStore.prototype.removeItem = cookies.erase;

CookieStore.prototype.clear = function () {
	var c = cookies.get();
	for (var i in c) {
		this.removeItem(i);
	}
};
