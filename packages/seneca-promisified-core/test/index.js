/* jshint esversion: 6 */

const senecaModule = require('seneca');
const SenecaPromisified = require('../index');
const assert = require('assert');
const R = require('ramda');

const oldSeneca = senecaModule({
	log: {
		map: [
			{
				plugin: 'all',
				handler: () => {
				}
			}
		]
	}
});

const seneca = new SenecaPromisified(oldSeneca);

describe('seneca-promisified-core', () => {

	before(() => {
		return seneca.ready().then(() => {
			oldSeneca.add({
				name: 'foobar',
				role: 'entity'
			}, function (args, done) { done(null, 1); });
			seneca.add({ name: 'counter', role: 'entity' }, _ => R.objOf('value', 1));
			seneca.add({ cmd: 'ping' }, _ => R.objOf('value', 'pong'));
		});
	});

	describe('act', () => {

		it('simple form', () => {
			return seneca
					.act({ name: 'counter', role: 'entity' })
					.then((counter) => {
						assert.equal(counter.value, 1);
					});
		});

		it('wierd form', () => {
			seneca.add({
				a: 1, b: 2
			}, (args) => {
				return {
					value: true
				};
			});

			return seneca
				.act('a:1', { b: 2 })
				.then(({ value }) => {
					assert.ok(value);
				});
		});

		it('nested', () => {
			return seneca.act({ a: 1, b: 2, x: 10 })
				.then((res) => {
					assert.ok(res.value);
					return seneca.act({ a: 1, b: 2, y: 10 });
				})
				.then((res) => {
					assert.ok(res.value);
				});
		});
	});

	it('use', () => {
		seneca.use((seneca) => {
			seneca.add({
				cmd: 'my-plugin'
			}, function(args) {
				return this.act({
					cmd: 'ping'
				});
			});
		});

		return seneca
			.act({ cmd: 'my-plugin' })
			.then((res) => {
				assert.equal(res.value, 'pong');
			});
	});

	it('pin', () => {
		const pinned = seneca.pin({ role: 'entity', name: '*' });
		return pinned.counter({}).then((res) => {
			assert.equal(res.value, 1);
		});
	});

	it('delegates', () => {
		const del = seneca.delegate({ role: 'entity' });
		return del.act({
			name: 'counter'
		}).then(({ value }) => {
			assert.equal(value, 1);
		});
	});


});

