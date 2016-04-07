/* jshint esversion: 6 */

import senecaModule from 'seneca';
import SenecaPromisified from './index';
import assert from 'assert';
import R from 'ramda';

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

const seneca = SenecaPromisified.create(oldSeneca);

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

