const SenecaPromisified = require('seneca-promisified-core');
const entity = require('seneca-promisified-entity');

SenecaPromisified.use(entity);
module.exports = SenecaPromisified;
