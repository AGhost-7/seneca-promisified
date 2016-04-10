'use strict';

var _senecaPromisifiedCore = require('seneca-promisified-core');

var _senecaPromisifiedCore2 = _interopRequireDefault(_senecaPromisifiedCore);

var _senecaPromisifiedEntity = require('seneca-promisified-entity');

var _senecaPromisifiedEntity2 = _interopRequireDefault(_senecaPromisifiedEntity);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_senecaPromisifiedCore2.default.use(_senecaPromisifiedEntity2.default);
module.exports = _senecaPromisifiedCore2.default;
