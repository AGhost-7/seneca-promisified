'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _senecaPromisifiedCore = require('seneca-promisified-core');

var _senecaPromisifiedCore2 = _interopRequireDefault(_senecaPromisifiedCore);

var _seneca = require('seneca');

var _seneca2 = _interopRequireDefault(_seneca);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var cbSeneca = (0, _seneca2.default)({ log: 'silent' });

cbSeneca.use('entity');

var MyWrapper = function (_SenecaPromisified) {
	_inherits(MyWrapper, _SenecaPromisified);

	function MyWrapper() {
		_classCallCheck(this, MyWrapper);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(MyWrapper).apply(this, arguments));
	}

	_createClass(MyWrapper, [{
		key: 'create',
		value: function create(seneca) {
			return new MyWrapper(seneca);
		}
	}]);

	return MyWrapper;
}(_senecaPromisifiedCore2.default);

MyWrapper.create = function (seneca) {
	return new MyWrapper(seneca);
};

// This will add the `make` and `make$` methods to the
// prototype.
(0, _index2.default)(MyWrapper.prototype);

var seneca = MyWrapper.create(cbSeneca);

describe('entity', function () {
	before(function () {
		return seneca.ready(function (_) {});
	});

	describe('save', function () {
		before(function () {
			seneca.add({
				cmd: 'save',
				role: 'entity',
				name: 'ping'
			}, function (args) {
				return {
					original: args.ent.value,
					value: 'pong'
				};
			});
			seneca.add({
				cmd: 'save',
				role: 'entity',
				name: 'parrot'
			}, function (args) {
				return args.ent;
			});
		});
		it('immediate save', function () {
			return seneca.make('ping').save$({ value: 'ping' }).then(function (_ref) {
				var value = _ref.value;
				var original = _ref.original;

				_assert2.default.equal(value, 'pong');
				_assert2.default.equal(original, 'ping');
			});
		});

		it('side effects', function () {
			var ent = seneca.make('ping');
			ent.value = 'ping';
			return ent.save$().then(function (_ref2) {
				var value = _ref2.value;
				var original = _ref2.original;

				_assert2.default.equal(value, 'pong');
				_assert2.default.equal(original, 'ping');
			});
		});
		it('removes properties', function () {
			var ent = seneca.make('parrot');

			return ent.save$({ hello: 'world' }).then(function (ent) {
				delete ent.hello;
				ent.foo = 'bar';
				return ent.save$();
			}).then(function (ent) {
				_assert2.default.equal(ent.foo, 'bar');
			});
		});
	});

	describe('load', function () {
		before(function () {
			seneca.add({
				role: 'entity',
				cmd: 'load',
				name: 'parrot'
			}, function (args) {
				return args.q;
			});
		});

		it('immediate load', function () {
			return seneca.make('parrot').load$({ id: 'foobar' }).then(function (ent) {
				_assert2.default.equal(ent.id, 'foobar');
			});
		});

		it('by id', function () {
			return seneca.make('parrot').load$('foobar').then(function (ent) {
				_assert2.default.equal(ent.id, 'foobar');
			});
		});

		it('side effects', function () {
			var ent = seneca.make('parrot');
			ent.id = 'foobar';

			return ent.load$().then(function (loaded) {
				_assert2.default.equal(loaded.id, 'foobar');
			});
		});
	});

	describe('list', function () {
		before(function () {
			seneca.add({
				role: 'entity',
				cmd: 'list',
				name: 'parrot'
			}, function (args) {
				console.log(args);
				return args.q;
			});
		});

		it('immediate list', function () {
			return seneca.make('parrot').list$({ name: 'foobar' }).then(function (ent) {
				_assert2.default.equal(ent.name, 'foobar');
			});
		});
	});

	describe('remove', function () {
		before(function () {
			seneca.add({
				role: 'entity',
				cmd: 'remove',
				name: 'parrot'
			}, function (args) {
				return args.q;
			});
		});

		it('removes!', function () {
			return seneca.make('parrot').remove$({ name: 'foobar' }).then(function (ent) {
				_assert2.default.equal(ent.name, 'foobar');
			});
		});
	});
});
