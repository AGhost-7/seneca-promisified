'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _anyPromise = require('any-promise');

var _anyPromise2 = _interopRequireDefault(_anyPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This just wraps over the object which is created when you call `make`.
 *
 * The `fields$`, `is$`, `clone$`, `canon$`, `native$` methods all
 * work the exact same way as the original seneca entity.
 */
var SenecaEntityWrapper = function () {
	/**
  * @param {Object} entity - The entity returned when you call the real
  * `seneca.make$` method.
  */
	function SenecaEntityWrapper(entity) {
		_classCallCheck(this, SenecaEntityWrapper);

		Object.defineProperty(this, '_entity', {
			value: entity
		});
	}

	/** @private */


	_createClass(SenecaEntityWrapper, [{
		key: '_forDataInWrapper',
		value: function _forDataInWrapper(fn) {
			for (var k in this) {
				if (k[k.length - 1] !== '$' && k[0] !== '_') {
					fn(this[k], k);
				}
			}
		}

		/** @private */

	}, {
		key: '_forDataInEnt',
		value: function _forDataInEnt(fn) {
			for (var k in this._entity) {
				if (k[k.length - 1] !== '$') {
					fn(this._entity[k], k);
				}
			}
		}

		/** @private */

	}, {
		key: '_clearEnt',
		value: function _clearEnt() {
			var _this = this;

			this._forDataInEnt(function (_, k) {
				delete _this._entity[k];
			});
		}

		/** @private */

	}, {
		key: '_fromWrapperToEnt',
		value: function _fromWrapperToEnt() {
			var _this2 = this;

			this._forDataInWrapper(function (val, k) {
				_this2._entity[k] = val;
			});
		}

		/** @private */

	}, {
		key: '_fromEntToWrapper',
		value: function _fromEntToWrapper() {
			var _this3 = this;

			this._forDataInEnt(function (val, k) {
				_this3[k] = val;
			});
		}

		/** @private */

	}, {
		key: '_callWithOpt',
		value: function _callWithOpt(opt, prop) {
			var _this4 = this;

			return new _anyPromise2.default(function (resolve, reject) {
				var onComplete = function onComplete(err, ent) {
					if (err) return reject(err);
					if (Array.isArray(ent)) {
						var ents = ent;
						var wrappedEnts = ent.map(function (ent) {
							var wrapped = new SenecaEntityWrapper(ent);
							wrapped._fromEntToWrapper();
							return wrapped;
						});
						return resolve(wrappedEnts);
					} else {
						var wrapped = new SenecaEntityWrapper(ent);
						wrapped._fromEntToWrapper();
						return resolve(wrapped);
					}
				};

				if (opt !== undefined) {
					_this4._entity[prop](opt, onComplete);
				} else {
					// clear it to remove items which may not be
					// present in the wrapper. If they're not in
					// the wrapper they won't be overriden.
					_this4._clearEnt();
					_this4._fromWrapperToEnt();
					_this4._entity[prop](onComplete);
				}
			});
		}

		/**
   * Saves the stored entity
   * @param {Object} obj - Optional object to use for saving. If not specified
   * it will use the members on the entity object itself as the data to save.
   * @returns {Promise}
   * @example
   * const ent = seneca.make('person');
   * ent.id = 1;
   * ent.name = 'foobar';
   * ent.save$(); // => Promise
   */

	}, {
		key: 'save$',
		value: function save$(obj) {
			return this._callWithOpt(obj, 'save$');
		}

		/**
   * Loads an entity.
   * @param {Object} query - Query to pass down to the internal seneca
   * instance.
   * @returns {Promise}
   * @example
   * const funnyJoe = seneca
   *   .make('person')
   *   .load$({ funny: true, name: 'Joe' });
   */

	}, {
		key: 'load$',
		value: function load$(query) {
			return this._callWithOpt(query, 'load$');
		}

		/**
   * Returns a list of entities.
   * @param {Object} query - The query to pass down to the internal seneca
   * instance. The query dsl will depdend on what kind of module you're using
   * with the entity module.
   * @returns {Promise}
   * @example
   * const allPersons = seneca.make('person').list$({ all$: true });
   */

	}, {
		key: 'list$',
		value: function list$(query) {
			return this._callWithOpt(query, 'list$');
		}

		/**
   * Removes the given entity
   * @param {Object} query - The query to pass to the internal seneca instance.
   * If not specified will use the fields stored on the entity itself.
   * @returns {Promise}
   * @example
   * // Creates then removes the entity immediately.
   * seneca
   *   .make('person')
   *   .save$({ name: 'foobar' })
   *   .then((ent) => ent.remove$());
   */

	}, {
		key: 'remove$',
		value: function remove$(query) {
			return this._callWithOpt(query, 'remove$');
		}

		/**
   * Setter or getter depending on whether an object is specified as a parameter.
   * If the method is called with an object as the specified parameter it will
   * return the `SenecaEntityWrapper` instance(i.e., return itself). Otherwise,
   * it will behave like the seneca entity object and return the storable data
   * within the entity.
   *
   * @param {Object} setProperties - If specified will set all of the object's
   * iterable properties to the wrapper.
   * @returns {Object|SenecaEntityWrapper}
   * @example
   * var name = seneca
   *   .make('user')
   *   .data$({ name: 'foobar' })
   *   .name;
   *
   * console.log(name); // => 'foobar'
   *
   * var data = seneca
   *   .make('user', { name: 'foobar })
   *   .data$();
   *
   * console.log(data); // => { name: 'foobar' }
   */

	}, {
		key: 'data$',
		value: function data$(setProperties) {
			if ((typeof setProperties === 'undefined' ? 'undefined' : _typeof(setProperties)) === 'object' && setProperties !== null) {
				this._entity.data$(setProperties);
				this._fromEntToWrapper();
				return this;
			}

			return this._entity.data$();
		}
	}]);

	return SenecaEntityWrapper;
}();

var inheritsSymbolics = ['fields', 'is', 'canon', 'native', 'clone'];

inheritsSymbolics.forEach(function (key) {
	var symbolicKey = key + '$';
	SenecaEntityWrapper.prototype[symbolicKey] = function () {
		return this._entity[symbolicKey].apply(this._entity, arguments);
	};
});

var make = function make() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	var entity = this._seneca.make.apply(this._entity, args);
	var wrapper = new SenecaEntityWrapper(entity);
	wrapper._fromEntToWrapper();
	return wrapper;
};

// Need to patch the item.
module.exports = function (wrapper) {
	wrapper.make = make;
	wrapper.make$ = make;
};

module.exports.make = make;
module.exports.SenecaEntityWrapper = SenecaEntityWrapper;
