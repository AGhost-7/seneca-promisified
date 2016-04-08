import patchMake from './index';
import SenecaPromisified from 'seneca-promisified-core';
import senecaModule from 'seneca';
import assert from 'assert';

const cbSeneca = senecaModule({ log: 'silent' });

cbSeneca.use('entity');

class MyWrapper extends SenecaPromisified {
	create(seneca) {
		return new MyWrapper(seneca);
	}
}

MyWrapper.create = (seneca) => new MyWrapper(seneca);

// This will add the `make` and `make$` methods to the
// prototype.
patchMake(MyWrapper.prototype);

const seneca = MyWrapper.create(cbSeneca);

describe('entity', () => {
	before(() => {
		return seneca
			.ready(_ => {
				
			});
	});

	describe('save', () => {
		before(() => {
			seneca.add({
				cmd: 'save',
				role: 'entity',
				name: 'ping'
			}, (args) => {
				return {
					original: args.ent.value,
					value: 'pong'
				};
			});
			seneca.add({
				cmd: 'save',
				role: 'entity',
				name: 'parrot'
			}, (args) => {
				return args.ent;
			});
		});
		it('immediate save', () => {
			return seneca
				.make('ping')
				.save$({ value: 'ping' })
				.then(({ value, original }) => {
					assert.equal(value, 'pong');
					assert.equal(original, 'ping');
				});
		});

		it('side effects', () => {
			const ent = seneca.make('ping');
			ent.value = 'ping';
			return ent
				.save$()
				.then(({ value, original }) => {
					assert.equal(value, 'pong');
					assert.equal(original, 'ping');
				});
		});
		it('removes properties', () => {
			const ent = seneca.make('parrot');

			return ent
				.save$({ hello: 'world' })
				.then((ent) => {
					assert.equal(ent.hello, 'world');
					delete ent.hello;
					ent.foo = 'bar';
					return ent.save$();
				})
				.then((ent) => {
					assert.equal(ent.foo, 'bar');
				});
		});
	});

	describe('load', () => {
		before(() => {
			seneca.add({
				role: 'entity',
				cmd: 'load',
				name: 'parrot'
			}, (args) => args.ent);
		});

		it('immediate load', () => {
			return seneca
				.make('parrot')
				.load$({ id: 'foobar' })
				.then((ent) => {
					console.log(ent);
					assert.equal(ent.id, 'foobar');
				});
		});

		it('by id', () => {
			return seneca
				.make('parrot')
				.load$('foobar')
				.then((ent) => {
					assert.equal(ent.id, 'foobar');
				})
		});

		it('side effects', () => {
			const ent = seneca.make('parrot');
			ent.id = 'foobar';

			return ent
				.load$()
				.then((loaded) => {
					assert.equal(loaded.id, 'foobar');
				});
		});


	});
});
