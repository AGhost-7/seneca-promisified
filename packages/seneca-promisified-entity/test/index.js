const patchMake = require('../index');
const SenecaPromisified = require('seneca-promisified-core');
const senecaModule = require('seneca');
const assert = require('assert');

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
				name: 'empty',
			}, (args) => {
				return Promise.resolve(null);
			});
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

		it('empty result', () => {
			return seneca
				.make('empty')
				.load$('foobar')
				.then((ent) => {
					assert.strictEqual(ent, null);
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
				return [args.q];
			});
		});

		it('immediate list', () => {
			return seneca
				.make('parrot')
				.list$({ name: 'foobar' })
				.then((ents) => {
					assert(Array.isArray(ents), 'should be an array: ' + JSON.stringify(ents, false, 2));
					const ent = ents[0];
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

	describe('make', () => {

		it('should return a wrapper instance', () => {
			assert.notEqual(seneca.make('person')._entity, undefined);
		});

		it('should set the entity with data if the first parameter is specified', () => {
			const ent = seneca.make('person', { name: 'foobar' });

			assert.equal(ent._entity.name, 'foobar');
			assert.equal(ent.name, 'foobar');
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

	describe('delegate', () => {

		let lastArgs, delegated;
		before(() => {
			const handler = (args) => {
				lastArgs = args;
				return args.cmd === 'save' ? args.ent : [];
			};

			seneca.add({
				role: 'entity',
				name: 'delegate',
				cmd: 'save'
			}, handler);
			seneca.add({
				role: 'entity',
				name: 'delegate',
				cmd: 'list'
			}, handler);

			delegated = seneca.delegate({
				a$: 1
			});
		});

		it('works with legacy', (done) => {
			cbSeneca
				.delegate({
					a$: 200
				})
				.make('delegate')
				.save$({}, function(err, saved) {
					if(err) return done(err);
					assert.equal(lastArgs.a$, 200);
					assert.notEqual(cbSeneca.fixedargs.a$, 200);
					assert.notEqual(seneca._seneca.fixedargs.a$, 200);
					done();
				});
		});

		it('should have the fixed args', () => {
			assert.equal(delegated._seneca.fixedargs.a$, 1);
		});

		it('save', () => {
			return delegated.make('delegate').save$({}).then((saved) => {
				assert.equal(lastArgs.a$, 1);
			});
		});

		it('list', () => {
			return delegated
				.delegate({ b$: 50 })
				.make('delegate')
				.list$({})
				.then((result) => {
					assert.equal(lastArgs.cmd, 'list');
					assert.equal(lastArgs.b$, 50);
					assert.equal(lastArgs.a$, 1);
					assert.deepEqual(result, []);
				});
		});
	});

});
