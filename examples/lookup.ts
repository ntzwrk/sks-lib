import {Keyserver, NoKeyFoundError} from '../lib/index';


var keyserver = new Keyserver('keyserver.ntzwrk.org');

keyserver.lookup('vsund').then(
	(key) => {
		console.log(key);
	}
).catch(
	(error) => {
		console.log('%s: %s', error.name, error.message);
	}
);

keyserver.lookup('this query doesn\'t result in a key').then(
	(key) => {
		console.log(key);
	}
).catch(
	(error) => {
		console.log('%s: %s', error.name, error.message);
	}
);
