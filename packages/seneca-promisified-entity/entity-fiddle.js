const seneca = require('seneca')({log:'silent'});
seneca.use('entity');
seneca.add({
	name: 'coffee',
	role: 'entity',
	cmd: 'save'
}, (args, done) => {
	args.saved = true;
	done(null, args);
})

seneca.ready(_ => {

	const ent = seneca.make('coffee');
	ent.id = 1;
	ent.name = 'example';
	ent.save$((err, entS) => {
		console.log(err, 'ent:', ent, 'entS', entS);
	});
	
});
