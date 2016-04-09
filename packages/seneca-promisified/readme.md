Metapackage containing all of the seneca-promisified wrappers.

```javascript

const cbSeneca = require('seneca')();
cbSeneca.use('entity');
const SenecaPromisified = require('seneca-promisified');
const seneca = new SenecaPromisified(cbSeneca);
seneca.add({
	role: 'entity',
	name: 'greet',
	cmd: 'save'

}, (args) => {
	return {
		gretting: 'hello ' + args.name
	};
});

seneca.make('greet').save$({ name: 'AGhost-7' }).then((res) => {
	console.log(res.greeting); // => hello AGhost-7
});

```
