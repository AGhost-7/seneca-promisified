import patchMake from '../index';
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
			}, (args) => args.q);
		});

		it('immediate load', () => {
			return seneca
				.make('parrot')
				.load$({ id: 'foobar' })
				.then((ent) => {
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

	describe('list', () => {
		before(() => {
			seneca.add({
				role: 'entity',
				cmd: 'list',
				name: 'parrot'
			}, (args) => {
				return args.q;
			});
		});

		it('immediate list', () => {
			return seneca
				.make('parrot')
				.list$({ name: 'foobar' })
				.then((ent) => {
					assert.equal(ent.name, 'foobar');
				});
		});
	});

	describe('remove', () => {
		before(() => {
			seneca.add({
				role: 'entity',
				cmd: 'remove',
				name: 'parrot'
			}, (args) => args.q);
		});

		it('removes!', () => {
			return seneca
				.make('parrot')
				.remove$({ name: 'foobar' })
				.then((ent) => {
					assert.equal(ent.name, 'foobar');
				});
		});
	});

	describe('data', () => {
		const ent = seneca.make('person', { name: 'foobar' });

		it('should set', () => {
			ent.data$({ age: 1 });
			assert.equal(ent.age, 1);
			assert.equal(ent._entity.age, 1);
		});

		it('should return the wrapper instance when it sets properties', () => {
			var wrapper = ent.data$({ age: 1 });
			assert.notEqual(wrapper._entity, undefined);
		});

		it('should get', () => {
			var data = ent.data$();
			assert.equal(data.name, 'foobar');
			assert.equal(data._entity, undefined);
		});
	});

});
