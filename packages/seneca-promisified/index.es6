import SenecaPromisified from 'seneca-promisified-core';
import entity from 'seneca-promisified-entity';

// For this package its fine to modify the prototype.
SenecaPromisified.use(entity);
module.exports = SenecaPromisified;
