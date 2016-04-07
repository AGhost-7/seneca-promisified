import Promise from 'any-promise';

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
	_onEnt(ent) {
		const wrapped = new SenecaEntityWrapper(ent);
		wrapped._fromEntToWrapper();
		return wrapped;
	}
	save$(obj) {
		return new Promise((resolve, reject) => {
			const onComplete = (err, ent) => {
				if(err) return reject(err);
				resolve(this._onEnt(ent));
			};

			if(obj) {
				this._entity.save(obj, onComplete);
			} else {
				this._entity.save(onComplete);
			}
		});
	}
	load$(query) {
		this._clearEnt();
		return new Promise((resolve, reject) => {
			this._entity.load$((err, ent) => {
			});
		});
	}
	list$(query) {
	}
	remove$() {
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
		this.entity[symbolicKey].apply(this.entity, arguments);
	};
});


const make = function (name, base, zone) {
	const entity = this._seneca.make(name, base, zone);
	return new SenecaEntityWrapper(entity);
};

// Need to patch the item.
module.exports = (wrapper) => {
	wrapper.make = make;
	wrapper.make$ = make;
};

module.exports.make = make;
module.exports.SenecaEntityWrapper = SenecaEntityWrapper;
