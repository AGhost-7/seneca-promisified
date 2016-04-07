/* jshint esversion: 6 */

import Promise from 'any-promise';

const completesPromise = (resolve, reject) => {
	return (err, res) => {
		if(err) return reject(err);
		resolve(res);
	};
};

/**
 * Meant to wrap the global seneca instance.
 */
class SenecaWrapper {
	constructor(seneca) {
		Object.defineProperties(this, {
			_seneca: {
				value: seneca
			},
			log: {
				value: seneca.log
			}
		});
	}
	act(...args) {
		return new Promise((resolve, reject) => {
			this._seneca.act.apply(
				this._seneca,
				args.concat(completesPromise(resolve, reject))
			);
		});
	}
	/**
	 * This is only there to allow classes which inherit from this one to 
	 * override what the methods return.
	 */
	_instantiate(seneca) {
		return new SenecaWrapper(seneca);
	}
	_handleResult(res, done) {
		if(typeof res.then === 'function') {
			res.then(done.bind(null, null), done);
		} else if(res instanceof Error) {
			done(err);
		} else {
			done(null, res);
		}
	}
	/**
	 * Example:
	 *
	 * this.add({ cmd: 'foobar' }, function(args) {
	 * 	return Promise.resolve('FOOBAR');
	 * });
	 */
	add(pat, ...rest) {
		const handler = rest.length > 1 ? rest[1] : rest[0];

		const handleResult = this._handleResult;
		const wrappedHandler = function(args, done) {
			const seneca = this;
			const wrapped = new SenecaHandlerWrapper(seneca);
			const res = handler.call(wrapped, args, wrapped);
			handleResult(res, done);
		};
		if(rest.length > 1) {
			this._seneca.add(pat, rest[0], wrappedHandler);
		} else {
			this._seneca.add(pat, wrappedHandler);
		}
	}

	/**
	 * Example:
	 * seneca.use((seneca) => {
	 * 	seneca.add({ cmd: 'ping' }, (args, seneca) => {
	 * 		return seneca.act({ cmd: '' });
	 * 	});
	 * });
	 *
	 * Or:
	 * seneca.use(function() {
	 * 	this.add({ cmd: 'pong' }, function(args) {
	 * 		return this.act({ cmd: 'ping' });
	 * 	});
	 * });
	 * @returns {Void}
	 */
	use(...args) {

		// For now call the regular context...
		if(typeof args[0] === 'string') {
			return this._seneca.use.apply(this._seneca, args);
		}

		const plugin = typeof args[0] === 'string' ? args[1] : args[0];
		const loader = function() {
			const seneca = this;
			const wrapped = new SenecaWrapper(seneca);
			plugin.call(wrapped, wrapped);
		};
		
		if(args.length > 1) {
			this._seneca.use(args[0], loader);
		} else {
			this._seneca.use(loader);
		}
	}

	/**
	 * @returns {SenecaWrapper}
	 */
	delegate(opts) {
		const del = this._seneca.delegate(opts);
		return new SenecaWrapper(del);
	}

	/**
	 * @returns {Promise}
	 */
	close() {
		return new Promise((resolve, reject) => {
			this._seneca.close((err) => err ? reject(err) : resolve());
		});
	}

	/**
	 * Similar to act.
	 *
	 * @returns {Object}
	 */
	pin(pat) {
		const pinned = this._seneca.pin(pat);
		return Object.keys(pinned).reduce((accu, key) => {
			accu[key] = (args) => {
				return new Promise((resolve, reject) => {
					pinned[key](args, completesPromise(resolve, reject));
				});
			};
			return accu;
		}, {});
	}

	listen(opts) {
		this._seneca.listen(opts);
	}

	/**
	 * @returns {Promise}
	 */
	ready() {
		return new Promise((resolve, reject) => {
			this._seneca.ready((err) => err ? reject(err) : resolve());

		});
	}

}

/**
 * This is used to wrap the seneca context of action handlers..
 *
 * TODO: Should this be a mixin instead? Does `extend` make the prototype chain longer?
 */
class SenecaHandlerWrapper extends SenecaWrapper {
	constructor(seneca) {
		super(seneca);
	}
	prior(args) {
		return new Promise((resolve, reject) => {
			this._seneca.prior(args, completesPromise(resolve, reject));
		});
	}
}

module.exports = (seneca) => new SenecaWrapper(seneca);
module.exports.SenecaWrapper = SenecaWrapper;

