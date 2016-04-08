import SenecaPromisified from 'seneca-promisified-core';
import addMake from 'seneca-promisified-entity';

class SenecaPromisifiedMeta extends SenecaPromisified {
	create(seneca) {
		return new SenecaPromisifiedMeta(seneca);
	}
}

addMake(SenecaPromisifiedMeta.prototype);

module.exports = SenecaPromisifiedMeta;


