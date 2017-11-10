# sks-lib

| `develop` | `master` |
|:---:|:---:|
| [![Travis Build Status for develop](https://travis-ci.org/ntzwrk/sks-lib.svg?branch=develop)](https://travis-ci.org/ntzwrk/sks-lib) | [![Travis Build Status for master](https://travis-ci.org/ntzwrk/sks-lib.svg?branch=master)](https://travis-ci.org/ntzwrk/sks-lib) |
| [![Dependency Status](https://david-dm.org/ntzwrk/sks-lib/develop/status.svg)](https://david-dm.org/ntzwrk/sks-lib) | [![Dependency Status](https://david-dm.org/ntzwrk/sks-lib/master/status.svg)](https://david-dm.org/ntzwrk/sks-lib) |

`sks-lib` is a Typescript library for interacting with SKS keyservers. Currently there's only support for retrieving a keyserver's stats.


## Installation

Just add it with `yarn install sks-lib` (or `npm install sks-lib`) to your project. It ships the generated Javascript code along with Typescript's declaration files. The Typescript code itself lives in `lib/`.


## Example usage

```ts
import {Keyserver} from 'sks-lib';


var keyserver = new Keyserver('keyserver.ntzwrk.org');

keyserver.getStats().then(
	(stats) => {
		console.log('"%s" is a %s %s keyserver with %s peers.', stats.hostName, stats.software, stats.version, stats.peerCount);
	}
).catch((reason: Error) => {
	console.log('Could not connect to "%s:11371"', keyserver.hostName);
	console.log('%s: %s', reason.name, reason.message);
});
```

To play around with this example:
```bash
$ git clone https://github.com/ntzwrk/sks-lib && cd sks-lib/
$ yarn install
$ yarn runBasicExample
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
