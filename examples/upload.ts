import {Keyserver} from '../lib/index';


var keyserver = new Keyserver('keyserver.ntzwrk.org');

var publicKey = `
-----BEGIN PGP PUBLIC KEY BLOCK-----
...
-----END PGP PUBLIC KEY BLOCK-----
`;

keyserver.upload(publicKey).then(
	(response) => {
		console.log(response);
	}
).catch(
	(error) => {
		console.log('%s: %s', error.name, error.message);
	}
);
