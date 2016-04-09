A wrapper which makes senecajs not hostile to promises. Also permits you
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

