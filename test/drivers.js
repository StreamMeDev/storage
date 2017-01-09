/* global describe, it, beforeEach */
var assert = require('assert');
var Storage = require('../lib');

Storage.backends.forEach(function (Driver) {
	describe(Driver.backendName, function () {
		var d;
		beforeEach(function () {
			d = new Driver();
			d.clear();
		});

		it('should detect correct support', function () {
			assert(Driver.supported());
		});

		it('should set and remove a value', function () {
			d.setItem('test', 'foo');
			assert.equal(d.getItem('test'), 'foo');
			d.removeItem('test');
			assert.equal(d.getItem('test'), undefined);
		});

		it('should expire a key', function (done) {
			d.setItem('test', 'foo', {
				expires: 1
			});
			assert.equal(d.getItem('test'), 'foo');
			setTimeout(function () {
				assert.equal(d.getItem('test'), undefined);
				done();
			}, 1005);
		});

		it('should clear all keys', function () {
			d.setItem('test', 'foo');
			d.setItem('tester', 'bar');
			d.setItem('testerson', 'baz');
			d.clear();
			assert.equal(d.getItem('test'), undefined);
			assert.equal(d.getItem('tester'), undefined);
			assert.equal(d.getItem('testerson'), undefined);
		});

		it('should work fine when multiple instances are created', function () {
			var d1 = new Driver();
			var d2 = new Driver();
			d1.setItem('test', '1');
			d2.setItem('test', '2');
			assert.equal(d1.getItem('test'), '2');
			assert.equal(d2.getItem('test'), '2');
		});

		it('should maintain types of data', function () {
			d.setItem('number', 1);
			assert.strictEqual(d.getItem('number'), 1);
			d.setItem('bool', true);
			assert.strictEqual(d.getItem('bool'), true);
			d.setItem('obj', {});
			assert.equal(typeof d.getItem('obj'), 'object');
		});
	});
});
