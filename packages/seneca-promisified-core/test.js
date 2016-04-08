'use strict';

var _seneca = require('seneca');

var _seneca2 = _interopRequireDefault(_seneca);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* jshint esversion: 6 */

var oldSeneca = (0, _seneca2.default)({
	log: {
		map: [{
			plugin: 'all',
			handler: function handler() {}
		}]
	}
});

var seneca = _index2.default.create(oldSeneca);

describe('seneca-promisified-core', function () {

	before(function () {
		return seneca.ready().then(function () {
			oldSeneca.add({
				name: 'foobar',
				role: 'entity'
			}, function (args, done) {
				done(null, 1);
			});
			seneca.add({ name: 'counter', role: 'entity' }, function (_) {
				return _ramda2.default.objOf('value', 1);
			});
			seneca.add({ cmd: 'ping' }, function (_) {
				return _ramda2.default.objOf('value', 'pong');
			});
		});
	});

	describe('act', function () {

		it('simple form', function () {
			return seneca.act({ name: 'counter', role: 'entity' }).then(function (counter) {
				_assert2.default.equal(counter.value, 1);
			});
		});

		it('wierd form', function () {
			seneca.add({
				a: 1, b: 2
			}, function (args) {
				return {
					value: true
				};
			});

			return seneca.act('a:1', { b: 2 }).then(function (_ref) {
				var value = _ref.value;

				_assert2.default.ok(value);
			});
		});
	});

	it('use', function () {
		seneca.use(function (seneca) {
			seneca.add({
				cmd: 'my-plugin'
			}, function (args) {
				return this.act({
					cmd: 'ping'
				});
			});
		});

		return seneca.act({ cmd: 'my-plugin' }).then(function (res) {
			_assert2.default.equal(res.value, 'pong');
		});
	});

	it('pin', function () {
		var pinned = seneca.pin({ role: 'entity', name: '*' });
		return pinned.counter({}).then(function (res) {
			_assert2.default.equal(res.value, 1);
		});
	});

	it('delegates', function () {
		var del = seneca.delegate({ role: 'entity' });
		return del.act({
			name: 'counter'
		}).then(function (_ref2) {
			var value = _ref2.value;

			_assert2.default.equal(value, 1);
		});
	});
});
