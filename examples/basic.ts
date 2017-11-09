// import {Keyserver} from 'sks-lib';
import {Keyserver} from '../lib/index';


var keyserver = new Keyserver('keyserver.ntzwrk.org');

keyserver.getStats().then(
	(stats) => {
		console.log('"%s" is a %s %s keyserver with %s peers.', stats.hostName, stats.software, stats.version, stats.peerCount);
	}
).catch((reason: Error) => {
	console.log('Could not connect to "%s:11371"', keyserver.hostName);
	console.log('%s: %s', reason.name, reason.message);
});
