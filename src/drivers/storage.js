var storageTest = require('../storage-supported');
var matchesPath = require('../matches-path');
var normalizeExpires = require('../normalize-expires');

// Factory method for constructors for local and session storage
module.exports = function (storageKey) {
	var WebStorage = function (opts = {}) {
		this.metaKey = opts.metaKey || '@streammedev/storage';
	};

	WebStorage.backendName = storageKey;

	// Is this storage supported?
	WebStorage.supported = function () {
		return storageTest(storageKey);
	};

	WebStorage.prototype.setItem = function (key, value, params = {}) {
		// Save meta
		var meta = {};
		if (typeof params.expires === 'number') {
			meta.expires = normalizeExpires(params.expires);
		}

		if (typeof params.path === 'string') {
			meta.path = params.path;
		}

		if (typeof value !== 'string') {
			meta.stringify = true;
			value = JSON.stringify(value);
		}

		// Save the meta data if we have it first
		if (meta.expires || meta.path || meta.stringify) {
			try {
				let m = getJsonItem(this.metaKey) || {};
				m[key] = meta;
				setJsonItem(this.metaKey, m);
			} catch (e) {
				// Dont save the key
				return;
			}
		}

		// Try to save the data, if fails also delete the meta
		try {
			window[storageKey].setItem(key, value);
		} catch (e) {
			// Remove the meta key, and resave meta
			let m = getJsonItem(this.metaKey);
			if (m && m[key]) {
				delete m[key];
				setJsonItem(this.metaKey, m);
			}
		}
	};

	WebStorage.prototype.getItem = function (key) {
		// Reload meta to be sure
		var m = getJsonItem(this.metaKey);
		var meta = (m && m[key]) || {};

		// Check expiration
		if (meta.expires && new Date(meta.expires) < new Date()) {
			this.removeItem(key);
			return;
		}

		// Check path
		if (meta.path && !matchesPath(meta.path, window.location.pathname)) {
			return;
		}

		// Parse json?
		if (meta.stringify) {
			return getJsonItem(key);
		}

		return window[storageKey].getItem(key);
	};

	WebStorage.prototype.removeItem = function (key) {
		// Remove meta entry
		var m = getJsonItem(this.metaKey);
		if (m && m[key]) {
			delete m[key];
			setJsonItem(this.metaKey, m);
		}

		return window[storageKey].removeItem(key);
	};

	WebStorage.prototype.clear = function () {
		return window[storageKey].clear();
	};

	function getJsonItem (key) {
		var v;
		try {
			v = JSON.parse(window[storageKey].getItem(key));
		} catch (e) {
			// Corrupt or missing data, ignore it because it will
			// be set with valid data when we need to
		}
		return v;
	}
	function setJsonItem (key, val) {
		return window[storageKey].setItem(key, JSON.stringify(val));
	}

	return WebStorage;
};
