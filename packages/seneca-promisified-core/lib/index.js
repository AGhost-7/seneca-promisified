'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* jshint esversion: 6 */

var _anyPromise = require('any-promise');

var _anyPromise2 = _interopRequireDefault(_anyPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var completesPromise = function completesPromise(resolve, reject) {
	return function (err, res) {
		if (err) return reject(err);
		resolve(res);
	};
};

/**
 * Automatically patched on the SenecaPromisified instance.
 * @memberof SenecaPromisified.prototype
 * @param {Object} args - Is the args object to pass to the next handler
 *
 * @example
 * seneca.add({ foo: 'bar' }, (args) => {
 *   return { response: 1 };
 * });
 * seneca.add({ foo: 'bar' }, (args, seneca) => {
 *   return seneca.prior(args).then(({ response }) => {
 *     return {
 *       response: response + 1
 *     };
 *   });
 * });
 *
 * seneca.act({ foo: 'bar' }).then(console.log); // => `{ response: 2 }`
 */
var prior = function prior(args) {
	var seneca = this._seneca;
	return new _anyPromise2.default(function (resolve, reject) {
		seneca.prior(args, completesPromise(resolve, reject));
	});
};

/**
 * Meant to wrap the global seneca instance.
 *
 * @class SenecaPromisified
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
  * Calls a seneca handler.
  *
  * @public
  * @returns {Promise}
  * @example
  * // These all do the same thing...
  * seneca.act('foo:true,bar:false').then(console.log);
  * seneca.act({ foo: true, bar: false }).then(console.log);
  * seneca.act('foo:true', { bar: false }).then(console.log);
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
   * override what the methods return. If you extend this class you should
   * override this method to return a new instance of this one for the
   * internals to work properly.
   *
   * @public
   * @param {Object} seneca - Is the callback-base seneca instance.
   * @returns {SenecaPromisified}
   */

	}, {
		key: 'create',
		value: function create(seneca) {
			return new SenecaPromisified(seneca);
		}

		/**
   * @private
   */

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
   * Adds a handler to the internal seneca instance.
   *
   * @public
   * @example
   * this.add({ cmd: 'foobar' }, function(args) {
   *   return Promise.resolve('FOOBAR');
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
				wrapped.prior = prior;
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
   * @public
   * @returns {Undefined}
   * @example
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
   * Returns a new seneca object which will automatically add the given
   * properties to the object you send.
   *
   * @public
   * @param {Object} opts - The properties to automatically add.
   * @returns {SenecaPromisified}
   * @example
   * const delegated = seneca.delegate({ safe: false });
   * // The object submitted will also have the `safe` property.
   * delegated.act({ cmd: 'ping' });
   */

	}, {
		key: 'delegate',
		value: function delegate(opts) {
			var del = this._seneca.delegate(opts);
			return this.create(del);
		}

		/**
   * Closes the connection established by `listen`.
   *
   * @public
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
   * Similar to delegate.
   *
   * @public
   * @returns {Object}
   *
   * @example
   * seneca.add({ cmd: 'save', entity: 'person' }, (args) => {
   *   return { saved: true };
   * });
   * seneca.add({ cmd: 'load', entity: 'person' }, (args) => {
   *   return { loaded: true };
   * });
   *
   * const pin = seneca.pin({ cmd: '*', entity: 'person' });
   *
   * pin.load({}).then(console.log); // => `{ loaded: true }`
   * pin.save({}).then(console.log); // => `{ saved: true }`
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

		/**
   * Opens a connection.
   * @public
   * @returns {Undefined}
   */

	}, {
		key: 'listen',
		value: function listen(opts) {
			this._seneca.listen(opts);
		}

		/**
   * Returns a promise which will be resolved when seneca is loaded.
   * @public
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

		/**
   * Modifies the prototype to add new methods.
   *
   * @public
   * @static
   * @param {Function} fn - Side effecting function which changes the
   * prototype.
   */

	}], [{
		key: 'use',
		value: function use(fn) {
			return fn(SenecaPromisified.prototype);
		}

		/**
   * Just an alternate way to instantiate the class...
   * @static
   */

	}, {
		key: 'create',
		value: function create(seneca) {
			return new SenecaPromisified(seneca);
		}
	}]);

	return SenecaPromisified;
}();

module.exports = SenecaPromisified;
