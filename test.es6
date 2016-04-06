/* jshint esversion: 6 */

import senecaModule from 'seneca';
import promisifySeneca from './index';
import assert from 'assert';
import R from 'ramda';

const oldSeneca = senecaModule();
oldSeneca.use('entity');
const seneca = promisifySeneca(oldSeneca);


describe('promisifaction', () => {

	before(() => {
		return seneca.ready().then(() => {
			console.log('getting ready');
			oldSeneca.add({
				name: 'foobar',
				role: 'entity'
			}, function (args, done) { done(null, 1); });
			seneca.add({ name: 'counter', role: 'entity' }, _ => R.objOf('value', 1));
			console.log('added counter');
			seneca.add({ cmd: 'ping' }, _ => R.objOf('value', 'pong'));
		});
	});

	it('should handle arbirary calls', () => {
		return seneca
			.act({ name: 'counter', role: 'entity' })
			.then((counter) => {
				assert.equal(counter.value, 1);
			});
	});

	it('should handle plugins', () => {
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

	it('should allow pining', () => {
		const pinned = seneca.pin({ role: 'entity', name: '*' });
		return pinned.counter({}).then((res) => {
			assert.equal(res.value, 1);
		});
	});

	it('delegates', () => {
		
	});

});

