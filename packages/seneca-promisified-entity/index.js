'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _anyPromise = require('any-promise');

var _anyPromise2 = _interopRequireDefault(_anyPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This just wraps over the object which is created when you call `make`.
 */

var SenecaEntityWrapper = function () {
	function SenecaEntityWrapper(entity) {
		_classCallCheck(this, SenecaEntityWrapper);

		Object.defineProperty(this, '_entity', {
			value: entity
		});
	}

	_createClass(SenecaEntityWrapper, [{
		key: '_forDataInWrapper',
		value: function _forDataInWrapper(fn) {
			for (var k in this) {
				if (k[k.length - 1] !== '$' && k[0] !== '_') {
					fn(this[k], k);
				}
			}
		}
	}, {
		key: '_forDataInEnt',
		value: function _forDataInEnt(fn) {
			for (var k in this._entity) {
				if (k[k.length - 1] !== '$') {
					fn(this._entity[k], k);
				}
			}
		}
	}, {
		key: '_clearEnt',
		value: function _clearEnt() {
			var _this = this;

			this._forDataInEnt(function (_, k) {
				delete _this._entity[k];
			});
		}
	}, {
		key: '_fromWrapperToEnt',
		value: function _fromWrapperToEnt() {
			var _this2 = this;

			this._forDataInWrapper(function (val, k) {
				_this2._entity[k] = val;
			});
		}
	}, {
		key: '_fromEntToWrapper',
		value: function _fromEntToWrapper() {
			var _this3 = this;

			this._forDataInEnt(function (val, k) {
				_this3[k] = val;
			});
		}
	}, {
		key: '_callWithOpt',
		value: function _callWithOpt(opt, prop) {
			var _this4 = this;

			return new _anyPromise2.default(function (resolve, reject) {
				var onComplete = function onComplete(err, ent) {
					if (err) return reject(err);
					var wrapped = new SenecaEntityWrapper(ent);
					wrapped._fromEntToWrapper();
					resolve(wrapped);
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
	}, {
		key: 'save$',
		value: function save$(obj) {
			return this._callWithOpt(obj, 'save$');
		}
	}, {
		key: 'load$',
		value: function load$(query) {
			return this._callWithOpt(query, 'load$');
			//return new Promise((resolve, reject) => {
			//	this._entity.load$((err, ent) => {
			//		const onComplete = (err, ent) => {
			//			if(err) return reject(err);
			//			resolve(this._onEnt(ent));
			//		};

			//		if(query) {
			//			this._entity.load$(query, onComplete);
			//		} else {
			//			this._clearEnt();
			//			this._fromWrapperToEnt();
			//			this._entity.load$(onComplete);
			//		}
			//	});
			//});
		}
	}, {
		key: 'list$',
		value: function list$(query) {}
	}, {
		key: 'remove$',
		value: function remove$() {}
	}]);

	return SenecaEntityWrapper;
}();

var inheritsSymbolics = ['fields', 'is', 'canon', 'native', 'data', 'clone'];

inheritsSymbolics.forEach(function (key) {
	var symbolicKey = key + '$';
	SenecaEntityWrapper.prototype[symbolicKey] = function () {
		this._entity[symbolicKey].apply(this._entity, arguments);
	};
});

var make = function make() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	var entity = this._seneca.make.apply(this._entity, args);
	return new SenecaEntityWrapper(entity);
};

// Need to patch the item.
module.exports = function (wrapper) {
	wrapper.make = make;
	wrapper.make$ = make;
};

module.exports.make = make;
module.exports.SenecaEntityWrapper = SenecaEntityWrapper;
