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
class SenecaPromisified {
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

	/**
	 * @returns {Promise}
	 */
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
	 *
	 * @returns {SenecaPromisified}
	 */
	create(seneca) {
		return new SenecaPromisified(seneca);
	}

	/**
	 * @private
	 */
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
		const create = this.create;
		const wrappedHandler = function(args, done) {
			const seneca = this;
			const wrapped = create(seneca);
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
		const create = this.create;
		const loader = function() {
			const seneca = this;
			const wrapped = create(seneca);
			plugin.call(wrapped, wrapped);
		};
		
		if(args.length > 1) {
			this._seneca.use(args[0], loader);
		} else {
			this._seneca.use(loader);
		}
	}

	/**
	 * @returns {SenecaPromisified}
	 */
	delegate(opts) {
		const del = this._seneca.delegate(opts);
		return this.create(del);
	}

	/**
	 * Closes the connection established by `listen`.
	 *
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
class SenecaHandlerWrapper extends SenecaPromisified {
	constructor(seneca) {
		super(seneca);
	}

	/**
	 * @returns {Promise}
	 */
	prior(args) {
		return new Promise((resolve, reject) => {
			this._seneca.prior(args, completesPromise(resolve, reject));
		});
	}
}

SenecaPromisified.create = (seneca) => new SenecaPromisified(seneca);
module.exports = SenecaPromisified;

