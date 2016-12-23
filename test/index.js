/* global describe, it, beforeEach */

// Phantom doesnt have object.assign, but all real browser this supports do
if (typeof Object.assign !== 'function') {
	Object.assign = function (target, varArgs) {
		if (target === null) {
			throw new TypeError('Cannot convert undefined or null to object');
		}
		var to = Object(target);
		for (var index = 1; index < arguments.length; index++) {
			var nextSource = arguments[index];
			if (nextSource != null) {
				for (var nextKey in nextSource) {
					if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
		}
		return to;
	};
}

var assert = require('assert');
var storage = require('..');

describe('Storage', function () {
	beforeEach(function () {
		storage.clear();
	});

	it('should export in instance of storage', function () {
		assert(storage instanceof storage.Storage);
	});

	it('should set and remove a value', function () {
		storage.setItem('test', 'foo');
		assert.equal(storage.getItem('test'), 'foo');
		storage.removeItem('test');
		assert.equal(storage.getItem('test'), undefined);
	});

	it('should expire a key', function (done) {
		storage.setItem('test', 'foo', {
			expires: 1
		});
		assert.equal(storage.getItem('test'), 'foo');
		setTimeout(function () {
			assert.equal(storage.getItem('test'), undefined);
			done();
		}, 1005);
	});

	it('should clear all keys', function () {
		storage.setItem('test', 'foo');
		storage.setItem('tester', 'bar');
		storage.setItem('testerson', 'baz');
		storage.clear();
		assert.equal(storage.getItem('test'), undefined);
		assert.equal(storage.getItem('tester'), undefined);
		assert.equal(storage.getItem('testerson'), undefined);
	});

	it('should maintain types of data', function () {
		storage.setItem('number', 1);
		assert.strictEqual(storage.getItem('number'), 1);
		storage.setItem('bool', true);
		assert.strictEqual(storage.getItem('bool'), true);
		storage.setItem('obj', {});
		assert.equal(typeof storage.getItem('obj'), 'object');
	});
});
