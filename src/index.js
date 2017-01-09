var storage = require('./drivers/storage');
var cookie = require('./drivers/cookie');
var memory = require('./drivers/memory');

/**
 * A storage service
 *
 * Basic Usage:
 *
 *   storage.setItem('someKey', 'someValue');
 *   storage.getItem('someKey'); // 'someValue'
 *   storage.removeItem('someKey');
 *   storage.clear();
 *
 * The storage module allows storing data in localStorage, sessionStorage, cookies
 * or in memory, all with the same interface.  You can create a new
 * instance to manually select a storage backend:
 *
 *   var store = new storage.Storage({
 *     backend: 'cookie'
 *   });
 *   store.setItem('key', 'val', {
 *     expires: 60 // one minute
 *   });
 *
 * All backends support expiration and path.  The cookie
 * backend also supports domain and a secure flag.  You can also
 * set filters for the key's and values.  These can be used
 * to modify things like json encoding objects for storage,
 * or adding a prefix to the storage key.
 *
 * NOTE: The storage backends need to be registered in the order
 * in which they should be tried.  So typically that would be this:
 *
 * - localStorage
 * - cookie
 * - sessionStorage
 * - memory
 *
 * @constructor Storage
 * @param {object} [opts] - The storage options
 */
var Storage = module.exports = function Storage (opts = {}) {
	// Ensure it is created with new
	if (!(this instanceof Storage)) {
		return new Storage(opts);
	}

	// Merge options
	this.options = Object.assign({}, Storage.defaultOptions, opts);

	// Get the backend
	var Backend;
	if (typeof this.options.backend === 'string') {
		Backend = getBackend(this.options.backend);
	} else if (this.options.backend) {
		Backend = this.options.backend;
	} else {
		Backend = selectBackend();
	}

	// Verify that we got a backend
	if (!Backend) {
		return;
	}

	// Create backend instance
	this.backend = new Backend();
};

/**
 * Default options
 *
 * @var defaultOptions
 * @memberof Storage
 * @static
 */
Storage.defaultOptions = {
	backend: null,
	domain: null,
	setValueFilter: valIdent,
	getValueFilter: valIdent,
	keyFilter: keyIdent
};

/**
 * Get an item from storage
 *
 * @function getItem
 * @memberof Storage
 * @instance
 * @param {string} key - The key to get
 * @return {*} - The value from storage
 */
Storage.prototype.getItem = function (key) {
	var k = this.options.keyFilter(key);
	return this.options.getValueFilter(key, this.backend.getItem(k));
};

/**
 * Sets an item in storage
 *
 * @function setItem
 * @memberof Storage
 * @instance
 * @param {string} key - The storage key to set
 * @param {*} value - The value to store
 * @param {object} [params] - The optional storage params
 */
Storage.prototype.setItem = function (key, value, params = {}) {
	// Run key/val through filters
	var k = this.options.keyFilter(key, value, params);
	var v = this.options.setValueFilter(key, value, params);

	// Add domain to params
	params.domain = params.domain || this.options.domain;

	return this.backend.setItem(k, v, params);
};

/**
 * Remove an item from storage
 *
 * @function removeItem
 * @memberof Storage
 * @instance
 * @param {string} key - The key to remove
 * @param {object} [params] - The params to use for removal
 */
Storage.prototype.removeItem = function (key, params = {}) {
	var k = this.options.keyFilter(key, undefined, params);
	params.domain = params.domain || this.options.domain;
	return this.backend.removeItem(k, params);
};

/**
 * Clear out an entire backend store
 *
 * @function clear
 * @memberof Storage
 * @instance
 */
Storage.prototype.clear = function () {
	return this.backend.clear();
};

// Gets a particular storage backend by it's name
Storage.backends = [storage('localStorage'), cookie, storage('sessionStorage'), memory];
function getBackend (name) {
	for (var i = 0; i < Storage.backends.length; i++) {
		if (Storage.backends[i].backendName === name) {
			return Storage.backends[i];
		}
	}
}

// Select best storage backend
var Backend;
function selectBackend () {
	if (!Backend) {
		for (var i = 0; i < Storage.backends.length; i++) {
			if (Storage.backends[i].supported()) {
				Backend = Storage.backends[i];
				break;
			}
		}
	}
	return Backend;
}

// Identity functions for internal use
function valIdent (key, val/*, params*/) {
	return val;
}
function keyIdent (key/*, val, params*/) {
	return key;
}
