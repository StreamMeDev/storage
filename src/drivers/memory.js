var matchesPath = require('../matches-path');
var normalizeExpires = require('../normalize-expires');

// The memory store
var _store = {};

var MemoryStore = function MemoryStore () { };

MemoryStore.backendName = 'memory';

MemoryStore.supported = function () {
	return true;
};

MemoryStore.prototype.getItem = function (key) {
	var item = _store[key];
	if (!item) {
		return;
	}

	// Check expiration
	if (item.expires && new Date(item.expires) < new Date()) {
		this.removeItem(key);
		return;
	}

	// Check path
	if (item.path && !matchesPath(item.path, window.location.pathname)) {
		return;
	}

	return item.value;
};

MemoryStore.prototype.setItem = function (key, value, params = {}) {
	var meta = {};
	// Process expiration
	if (typeof params.expires === 'number') {
		meta.expires = normalizeExpires(params.expires);
	}

	if (typeof params.path === 'string') {
		meta.path = params.path;
	}

	meta.value = value;

	// Store value
	_store[key] = meta;
};

MemoryStore.prototype.removeItem = function (key) {
	if (typeof _store[key] !== 'undefined') {
		delete _store[key];
	}
};

MemoryStore.prototype.clear = function () {
	_store = {};
};

// Register the store with the module
module.exports = MemoryStore;
