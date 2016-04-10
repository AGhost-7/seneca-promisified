import senecaModule from 'seneca';
import SenecaPromisified from '../index';
import assert from 'assert';

const cbSeneca = senecaModule({ log: 'silent' });
cbSeneca.use('entity');
const seneca = SenecaPromisified.create(cbSeneca);

describe('metapackage', () => {
	before(() => {
		seneca.add({
			role: 'entity',
			cmd: 'save',
			name: 'parrot'
		}, (args) => args.ent);
	});

	it('should have the entity of linked up', () => {
		return seneca
			.make('parrot')
			.save$({ id: 1 })
			.then((res) => {
				assert.ok(res.id);
			});
	});

});
