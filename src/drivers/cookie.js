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

	// If the value is not a string, stringify it,
	// and save the metadata about it so we can
	// parse it on get
	if (typeof val !== 'string') {
		var meta = getMetaCookie(this.metaKey);
		meta[key] = {
			stringify: true
		};
		saveMeta(this.metaKey, meta);
		val = JSON.stringify(val);
	}

	return cookies.set(key, val, params);
};

CookieStore.prototype.getItem = function (key) {
	// Load meta for key
	var m = getMetaCookie(this.metaKey);
	var meta = (m && m[key]) || {};

	// Get cookie
	var val = cookies.get(key);
	if (val && meta.stringify) {
		return JSON.parse(val);
	}

	// Remove meta if we have it but no cookie (expired?)
	if (typeof val === 'undefined' && meta) {
		delete m[key];
		saveMeta(this.metaKey, m);
	}

	return val;
};

CookieStore.prototype.removeItem = function (key) {
	// Remove from meta
	var m = getMetaCookie(key);
	delete m[key];
	saveMeta(this.metaKey, m);

	return cookies.erase(key);
};

CookieStore.prototype.clear = function () {
	var c = cookies.all();
	for (var i in c) {
		cookies.erase(i);
	}
	cookies.erase(this.metaKey);
};

function getMetaCookie (key) {
	var m;
	try {
		m = JSON.parse(cookies.get(key) || {});
	} catch (e) {
		// Ignore
	}
	return m || {};
}

function saveMeta (key, val) {
	cookies.set(key, JSON.stringify(val));
}
