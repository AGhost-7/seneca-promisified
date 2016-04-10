Metapackage containing all of the seneca-promisified wrappers.

## Example

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
    gretting: 'hello ' + args.ent.name
  };
});

seneca.make('greet').save$({ name: 'AGhost-7' }).then((res) => {
  console.log(res.greeting); // => hello AGhost-7
});

```

## API Documentation

See: <http://aghost-7.github.io/seneca-promisified>

