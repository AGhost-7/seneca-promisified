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

var oldSeneca = (0, _seneca2.default)();
oldSeneca.use('entity');
var seneca = (0, _index2.default)(oldSeneca);

describe('promisifaction', function () {

	before(function () {
		return seneca.ready().then(function () {
			console.log('getting ready');
			oldSeneca.add({
				name: 'foobar',
				role: 'entity'
			}, function (args, done) {
				done(null, 1);
			});
			seneca.add({ name: 'counter', role: 'entity' }, function (_) {
				return _ramda2.default.objOf('value', 1);
			});
			console.log('added counter');
			seneca.add({ cmd: 'ping' }, function (_) {
				return _ramda2.default.objOf('value', 'pong');
			});
		});
	});

	it('should handle arbirary calls', function () {
		return seneca.act({ name: 'counter', role: 'entity' }).then(function (counter) {
			_assert2.default.equal(counter.value, 1);
		});
	});

	it('should handle plugins', function () {
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

	it('should allow pining', function () {
		var pinned = seneca.pin({ role: 'entity', name: '*' });
		return pinned.counter({}).then(function (res) {
			_assert2.default.equal(res.value, 1);
		});
	});

	it('delegates', function () {});
});
