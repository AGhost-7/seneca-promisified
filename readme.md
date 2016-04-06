A wrapper which makes senecajs not hostile to promises. Also permits you i
to access seneca context without having to use the `this` keyword (arrow
functions).

This is not an _extension_, its just a wrapper; you will be able to use
old seneca plugins without having to worry about what its going to
break.

N.b.; This is only for the core module. The entity and options
module isnt included.

## Promises
This libary uses `any-promise`. You will need to register the kind of promise
you want the it to use.

See: https://www.npmjs.com/package/any-promise

## Example

```javascript
require('any-promise/register')('bluebird');

const oldSeneca = require('seneca')();
// No side-effect on the seneca instance is done here.
const seneca = require('seneca-promisified')(oldSeneca);

// Load your plugins through the 
oldSeneca.use(require('seneca-postgres-store'), {
	name: 'foobar',
	host: 'localhost',
	username: 'foobar',
	password: 'foobar'
});

seneca.add({
	cmd: 'ping'
}, function(args) {
	const seneca = this;
	return this
		.store
		.load('counter', { type: 'pings' })
		.then((counter) => {
			counter.value += 1;
			return counter
				.save()
				.thenReturn(counter.value);
		})
		.then((count) => {
			return seneca.act({ cmd: 'pong', count });
		});
});

seneca.add({
	cmd: 'pong'
}, (args, seneca) => {
	const { count } = args;
	return seneca
		.store
		.save('pongs', { count })
		.thenReturn('pong');
});
```


## TODO
- Tests...
