'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _senecaPromisifiedCore = require('seneca-promisified-core');

var _senecaPromisifiedCore2 = _interopRequireDefault(_senecaPromisifiedCore);

var _senecaPromisifiedEntity = require('seneca-promisified-entity');

var _senecaPromisifiedEntity2 = _interopRequireDefault(_senecaPromisifiedEntity);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SenecaPromisifiedMeta = function (_SenecaPromisified) {
	_inherits(SenecaPromisifiedMeta, _SenecaPromisified);

	function SenecaPromisifiedMeta() {
		_classCallCheck(this, SenecaPromisifiedMeta);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(SenecaPromisifiedMeta).apply(this, arguments));
	}

	_createClass(SenecaPromisifiedMeta, [{
		key: 'create',
		value: function create(seneca) {
			return new SenecaPromisifiedMeta(seneca);
		}
	}]);

	return SenecaPromisifiedMeta;
}(_senecaPromisifiedCore2.default);

(0, _senecaPromisifiedEntity2.default)(SenecaPromisifiedMeta.prototype);

module.exports = SenecaPromisifiedMeta;
