import {Keyserver} from '../lib/index';
import {Moment} from 'moment';


var keyserver = new Keyserver('keyserver.ntzwrk.org');

keyserver.getStats().then(
	(stats) => {
		var hostName = stats.hostName;
		var software = stats.software;
		var version = stats.version;
		var peerCount = stats.gossipPeerCount;

		console.log('"%s" is a %s %s keyserver with %s gossip peers.', hostName, software, version, peerCount);
	}
).catch(
	(error) => {
		console.log('%s: %s', error.name, error.message);
	}
);

keyserver.getKeyStats().then(
	(keyStats) => {
		var hostName = keyserver.hostName;
		var totalKeys = keyStats.totalKeys;
		var newKeys = keyStats.dailyKeys[11].newKeys;
		var date = keyStats.dailyKeys[11].dateTime.format('MMMM Do YYYY');

		console.log('"%s" has %s total keys and saw %s new keys on %s.', hostName, totalKeys, newKeys, date);
	}
).catch(
	(error) => {
		console.log('%s: %s', error.name, error.message);
	}
);
