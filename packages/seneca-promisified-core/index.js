'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* jshint esversion: 6 */

var _anyPromise = require('any-promise');

var _anyPromise2 = _interopRequireDefault(_anyPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var completesPromise = function completesPromise(resolve, reject) {
	return function (err, res) {
		if (err) return reject(err);
		resolve(res);
	};
};

/**
 * Meant to wrap the global seneca instance.
 */

var SenecaPromisified = function () {
	function SenecaPromisified(seneca) {
		_classCallCheck(this, SenecaPromisified);

		Object.defineProperties(this, {
			_seneca: {
				value: seneca
			},
			log: {
				value: seneca.log
			}
		});
	}

	/**
  * @returns {Promise}
  */


	_createClass(SenecaPromisified, [{
		key: 'act',
		value: function act() {
			var _this = this;

			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return new _anyPromise2.default(function (resolve, reject) {
				_this._seneca.act.apply(_this._seneca, args.concat(completesPromise(resolve, reject)));
			});
		}

		/**
   * This is only there to allow classes which inherit from this one to 
   * override what the methods return.
   */

	}, {
		key: 'create',
		value: function create(seneca) {
			return new SenecaPromisified(seneca);
		}
	}, {
		key: '_handleResult',
		value: function _handleResult(res, done) {
			if (typeof res.then === 'function') {
				res.then(done.bind(null, null), done);
			} else if (res instanceof Error) {
				done(err);
			} else {
				done(null, res);
			}
		}
		/**
   * Example:
   *
   * this.add({ cmd: 'foobar' }, function(args) {
   * 	return Promise.resolve('FOOBAR');
   * });
   */

	}, {
		key: 'add',
		value: function add(pat) {
			var handler = arguments.length - 1 > 1 ? arguments.length <= 2 ? undefined : arguments[2] : arguments.length <= 1 ? undefined : arguments[1];

			var handleResult = this._handleResult;
			var create = this.create;
			var wrappedHandler = function wrappedHandler(args, done) {
				var seneca = this;
				var wrapped = create(seneca);
				var res = handler.call(wrapped, args, wrapped);
				handleResult(res, done);
			};
			if (arguments.length - 1 > 1) {
				this._seneca.add(pat, arguments.length <= 1 ? undefined : arguments[1], wrappedHandler);
			} else {
				this._seneca.add(pat, wrappedHandler);
			}
		}

		/**
   * Example:
   * seneca.use((seneca) => {
   * 	seneca.add({ cmd: 'ping' }, (args, seneca) => {
   * 		return seneca.act({ cmd: '' });
   * 	});
   * });
   *
   * Or:
   * seneca.use(function() {
   * 	this.add({ cmd: 'pong' }, function(args) {
   * 		return this.act({ cmd: 'ping' });
   * 	});
   * });
   * @returns {Void}
   */

	}, {
		key: 'use',
		value: function use() {
			for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				args[_key2] = arguments[_key2];
			}

			// For now call the regular context...
			if (typeof args[0] === 'string') {
				return this._seneca.use.apply(this._seneca, args);
			}

			var plugin = typeof args[0] === 'string' ? args[1] : args[0];
			var create = this.create;
			var loader = function loader() {
				var seneca = this;
				var wrapped = create(seneca);
				plugin.call(wrapped, wrapped);
			};

			if (args.length > 1) {
				this._seneca.use(args[0], loader);
			} else {
				this._seneca.use(loader);
			}
		}

		/**
   * @returns {SenecaPromisified}
   */

	}, {
		key: 'delegate',
		value: function delegate(opts) {
			var del = this._seneca.delegate(opts);
			return this.create(del);
		}

		/**
   * @returns {Promise}
   */

	}, {
		key: 'close',
		value: function close() {
			var _this2 = this;

			return new _anyPromise2.default(function (resolve, reject) {
				_this2._seneca.close(function (err) {
					return err ? reject(err) : resolve();
				});
			});
		}

		/**
   * Similar to act.
   *
   * @returns {Object}
   */

	}, {
		key: 'pin',
		value: function pin(pat) {
			var pinned = this._seneca.pin(pat);
			return Object.keys(pinned).reduce(function (accu, key) {
				accu[key] = function (args) {
					return new _anyPromise2.default(function (resolve, reject) {
						pinned[key](args, completesPromise(resolve, reject));
					});
				};
				return accu;
			}, {});
		}
	}, {
		key: 'listen',
		value: function listen(opts) {
			this._seneca.listen(opts);
		}

		/**
   * @returns {Promise}
   */

	}, {
		key: 'ready',
		value: function ready() {
			var _this3 = this;

			return new _anyPromise2.default(function (resolve, reject) {
				_this3._seneca.ready(function (err) {
					return err ? reject(err) : resolve();
				});
			});
		}
	}]);

	return SenecaPromisified;
}();

/**
 * This is used to wrap the seneca context of action handlers..
 *
 * TODO: Should this be a mixin instead? Does `extend` make the prototype chain longer?
 */


var SenecaHandlerWrapper = function (_SenecaPromisified) {
	_inherits(SenecaHandlerWrapper, _SenecaPromisified);

	function SenecaHandlerWrapper(seneca) {
		_classCallCheck(this, SenecaHandlerWrapper);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(SenecaHandlerWrapper).call(this, seneca));
	}

	/**
  * @returns {Promise}
  */


	_createClass(SenecaHandlerWrapper, [{
		key: 'prior',
		value: function prior(args) {
			var _this5 = this;

			return new _anyPromise2.default(function (resolve, reject) {
				_this5._seneca.prior(args, completesPromise(resolve, reject));
			});
		}
	}]);

	return SenecaHandlerWrapper;
}(SenecaPromisified);

SenecaPromisified.create = function (seneca) {
	return new SenecaPromisified(seneca);
};
module.exports = SenecaPromisified;
