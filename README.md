# sks-lib

[![npm package](https://img.shields.io/npm/v/sks-lib.svg)](https://www.npmjs.com/package/sks-lib) [![npm license](https://img.shields.io/npm/l/sks-lib.svg)](https://github.com/ntzwrk/sks-lib/blob/develop/LICENSE.md) [![code documentation](https://img.shields.io/badge/Code-documentation-blue.svg)](https://ntzwrk.github.io/sks-lib/code/)

<table>
	<tr>
		<td><tt><b>develop</b></tt></td>
		<td><a href="https://travis-ci.org/ntzwrk/sks-lib"><img src="https://img.shields.io/travis/ntzwrk/sks-lib/develop.svg" alt="Travis Build Status for develop"></a></td>
		<td><a href="https://david-dm.org/ntzwrk/sks-lib/develop"><img src="https://img.shields.io/david/ntzwrk/sks-lib/develop.svg" alt="Dependency Status for develop"></a></td>
	</tr>
	<tr>
		<td><tt><b>master</b></tt></td>
		<td><a href="https://travis-ci.org/ntzwrk/sks-lib"><img src="https://img.shields.io/travis/ntzwrk/sks-lib/master.svg" alt="Travis Build Status for master"></a></td>
		<td><a href="https://david-dm.org/ntzwrk/sks-lib/master"><img src="https://img.shields.io/david/ntzwrk/sks-lib/master.svg" alt="Dependency Status for master"></a></td>
	</tr>
</table>
<br />

`sks-lib` is a Typescript library for interacting with SKS keyservers. Currently there's only support for retrieving statistics of a keyserver.

*Please note that keyservers never return verified data. Do **not** trust the retrieved keys and **always verify** them.*


## Installation

Just add it with `yarn install sks-lib` (or `npm install sks-lib`) to your project. It ships the generated Javascript code along with Typescript's declaration files. The Typescript code itself lives in `lib/`.


## Example usage

```ts
import {Keyserver} from 'sks-lib';
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
).catch((reason: Error) => {
	console.log('Could not connect to "%s:11371"', keyserver.hostName);
	console.log('%s: %s', reason.name, reason.message);
});

keyserver.getKeyStats().then(
	(keyStats) => {
		var hostName = keyserver.hostName;
		var totalKeys = keyStats.totalKeys;
		var newKeys = keyStats.dailyKeys[11].newKeys;
		var date = keyStats.dailyKeys[11].dateTime.format('MMMM Do YYYY');

		console.log('"%s" has %s total keys and saw %s new keys on %s.', hostName, totalKeys, newKeys, date);
	}
).catch((reason: Error) => {
	console.log('Could not connect to "%s:11371"', keyserver.hostName);
	console.log('%s: %s', reason.name, reason.message);
});
```


## Documentation

Code documentation lives in `docs/code/`, the generated HTML version is available at https://ntzwrk.github.io/sks-lib/code/.


## Development

### Run tests
```bash
$ yarn test
```

### Generate documentation
```bash
$ yarn document
```


## License

This code is published under the [GNU General Public License v3.0](LICENSE.md).
