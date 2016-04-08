import Promise from 'any-promise';

/**
 * This just wraps over the object which is created when you call `make`.
 */
class SenecaEntityWrapper {
	constructor(entity) {
		Object.defineProperty(this, '_entity', {
			value: entity
		});
	}
	_forDataInWrapper(fn) {
		for(var k in this) {
			if(k[k.length - 1] !== '$'
					&& k[0] !== '_') {
				fn(this[k], k);
			}
		}
	}
	_forDataInEnt(fn) {
		for(var k in this._entity) {
			if(k[k.length - 1] !== '$') {
				fn(this._entity[k], k);
			}
		}
	}
	_clearEnt() {
		this._forDataInEnt((_ , k) => {
			delete this._entity[k];
		});
	}
	_fromWrapperToEnt() {
		this._forDataInWrapper((val, k) => {
			this._entity[k] = val;
		});
	}
	_fromEntToWrapper() {
		this._forDataInEnt((val, k) => {
			this[k] = val;
		});
	}

	_callWithOpt(opt, prop) {
		return new Promise((resolve, reject) => {
			const onComplete = (err, ent) => {
				if(err) return reject(err);
				const wrapped = new SenecaEntityWrapper(ent);
				wrapped._fromEntToWrapper();
				resolve(wrapped);
			};

			if(opt !== undefined) {
				this._entity[prop](opt, onComplete);
			} else {
				// clear it to remove items which may not be
				// present in the wrapper. If they're not in
				// the wrapper they won't be overriden.
				this._clearEnt(); 
				this._fromWrapperToEnt();
				this._entity[prop](onComplete);
			}
		});
	}
	save$(obj) {
		return this._callWithOpt(obj, 'save$');
	}
	load$(query) {
		return this._callWithOpt(query, 'load$');
	}
	list$(query) {
		return this._callWithOpt(query, 'list$');
	}
	remove$(query) {
		return this._callWithOpt(query, 'remove$');
	}
	
}

const inheritsSymbolics = [
	'fields',
	'is',
	'canon',
	'native',
	'data',
	'clone'
];

inheritsSymbolics.forEach((key) => {
	const symbolicKey = key + '$';
	SenecaEntityWrapper.prototype[symbolicKey] = function() {
		this._entity[symbolicKey].apply(this._entity, arguments);
	};
});


const make = function (...args) {
	const entity = this._seneca.make.apply(this._entity, args);
	return new SenecaEntityWrapper(entity);
};

// Need to patch the item.
module.exports = (wrapper) => {
	wrapper.make = make;
	wrapper.make$ = make;
};

module.exports.make = make;
module.exports.SenecaEntityWrapper = SenecaEntityWrapper;
