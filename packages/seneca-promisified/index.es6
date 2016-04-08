import SenecaPromisified from 'seneca-promisified-core';
import addMake from 'seneca-promisified-entity';

class SenecaPromisifiedMeta extends SenecaPromisified {
	create(seneca) {
		return new SenecaPromisifiedMeta(seneca);
	SenecaPromisifiedMeta.create = (seneca) => new SenecaPromisifiedMeta(seneca);}
}

addMake(SenecaPromisifiedMeta.prototype);
SenecaPromisifiedMeta.create = (seneca) => new SenecaPromisifiedMeta(seneca);
module.exports = SenecaPromisifiedMeta;


