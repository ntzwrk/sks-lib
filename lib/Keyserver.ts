import * as requestPromise from 'request-promise-native';
import {StatusCodeError} from 'request-promise-native/errors';
import * as moment from 'moment';

import {KeyStats, KeyStatsEntry} from './KeyStats';
import {NoKeyFoundError, ParseError} from './Errors';
import {GossipPeer, MailsyncPeer} from './Peer';
import {Stats} from './Stats';


/**
 * Class representing a keyserver
 */
export class Keyserver {
	/** The keyserver's hostname */
	public hostName: string;

	/** Optional port to make requests on (default: 11371) */
	public port: number;

	/** Base path for the keyserver (where the `/pks` paths start), (default: '') */
	public basePath: string;

	/** Request options for a query to the keyserver */
	private requestOptions: requestPromise.RequestPromiseOptions;

	/**
	 * Constructor for creating a new keyserver
	 *
	 * @param hostName hostname of the keyserver
	 * @param port port of the keyserver
	 * @param basePath base path where to find the keyserver (the path before `/pks`, usually nothing)
	 */
	constructor(hostName: string, port: number = 11371, basePath: string = '') {
		this.hostName = hostName;
		this.port = port;
		this.basePath = basePath;
		this.requestOptions = {
			baseUrl: 'http://' + hostName + ':' + port + '/' + basePath,
			timeout: 4000,
			headers: {
				'User-Agent': 'sks-lib (https://github.com/ntzwrk/sks-lib)'
			}
		};
	}

	/**
	 * Retrieves the keyserver's html and returns it as Promise<string>
	 *
	 * @param path relative path to request, usually starts with `/pks`
	 */
	private getKeyserverHtml(path: string): Promise<string> {
		return requestPromise.get(path, this.requestOptions).then(
			html => html
		);
	}


	/**
	 * Retrieves a key by a given query, throws NoKeyFoundError
	 *
	 * @param query query to look up
	 */
	public lookup(query: string): Promise<string> {
		var path = '/pks/lookup?op=get&options=mr&search=';

		return this.getKeyserverHtml(path + encodeURIComponent(query)).then(
			(html: string) => {
				if(Keyserver.isPgpKey(html)) {
					return html;
				} else {
					throw new NoKeyFoundError();
				}
			}
		).catch(
			(error: Error) => {
				if(error instanceof StatusCodeError) {
					var statusError = <StatusCodeError>error;
					if(statusError.statusCode === 404) {
						throw new NoKeyFoundError();
					}
				}

				throw error;
			}
		);
	}

	/**
	 * Checks whether a given input is a PGP key
	 *
	 * @param key input to check
	 */
	private static isPgpKey(key: string): boolean {
		const PGP_KEY_START = '-----BEGIN PGP PUBLIC KEY BLOCK-----';
		const PGP_KEY_END = '-----END PGP PUBLIC KEY BLOCK-----';

		return (key.indexOf(PGP_KEY_START) >= 0)  &&  (key.indexOf(PGP_KEY_END) >= 0);
	}


	/**
	 * Uploads a public key onto a keyserver
	 *
	 * @param publicKey public key to upload
	 */
	public upload(publicKey: string): requestPromise.RequestPromise {
		var path = '/pks/add';
		var options = this.requestOptions;
		options.form = {keytext: publicKey};

		return requestPromise.post(path, options);
	}


	/**
	 * Retrieves the keyserver's stats html and returns it as Promise<string>
	 */
	private getStatsHtml(): Promise<string> {
		var path = '/pks/lookup?op=stats';
		return this.getKeyserverHtml(path);
	}

	/**
	 * Maps the keyserver's html to a generic promise
	 *
	 * @param transformFunction function to transform HTML into a generic object
	 */
	public mapStatsToView<T>(transformFunction: (html: string) => T): Promise<T> {
		return this.getStatsHtml().then(transformFunction);
	}

	/**
	 * Retrieves the server's stats and returns a Promise<Stats>,
	 * uses the default parsing method (`parseStatsHtml`)
	 */
	public getStats(): Promise<Stats> {
		return this.mapStatsToView(Keyserver.parseStatsHtml);
	}

	/**
	 * Retrieves the server's key stats and returns a Promise<KeyStats>,
	 * uses the default parsing method (`parseKeyStatsHtml`)
	 */
	public getKeyStats(): Promise<KeyStats> {
		return this.mapStatsToView(Keyserver.parseKeyStatsHtml);
	}

	/**
	 * Parses given html into a Stats object, throws ParseError
	 *
	 * @param html HTML to parse, usually from a keyserver's stats page
	 */
	public static parseStatsHtml(html: string): Stats {
		var match: RegExpMatchArray | null;
		var matchVersion: RegExpMatchArray | null;

		var software: string;
		var version: string;
		var hostName: string;
		var nodeName: string;
		var serverContact: string;
		var httpPort: number;
		var reconPort: number;
		var debugLevel: number;
		var keys: number;
		var statsTime: moment.Moment;
		var gossipPeers: GossipPeer[] = [];
		var gossipPeerCount: number;
		var mailsyncPeers: MailsyncPeer[] = [];
		var mailsyncPeerCount: number;


		// software
		match = html.match(/(SKS|Hockeypuck) OpenPGP Keyserver statistics/i);
		matchVersion = html.match(/<t[dh]>(SKS )?Version:?(?:<\/t[dh]>)?/);
		if(match) {
			software = match[1].trim();
		} else if(matchVersion) {
			software = matchVersion[1].trim();
		} else {
			throw new ParseError('software');
		}

		// version
		match = html.match(/<t[dh]>(?:SKS )?Version:?(?:<\/t[dh]>)?<td>(.+?)(?:<\/td>|\n)/);
		if(match) {
			version = match[1].trim();
		} else {
			throw new ParseError('version');
		}

		// hostName
		match = html.match(/<t[dh]>Hostname:?(?:<\/t[dh]>)?<td>(.+?)(?:<\/td>|\n)/);
		if(match) {
			hostName = match[1].trim();
		} else {
			throw new ParseError('hostName');
		}

		// nodeName
		match = html.match(/<t[dh]>Nodename:?(?:<\/t[dh]>)?<td>(.+?)(?:<\/td>|\n)/);
		if(match) {
			nodeName = match[1].trim();
		} else {
			throw new ParseError('nodeName');
		}

		// serverContact
		match = html.match(/<t[dh]>Server contact:?(?:<\/t[dh]>)?<td>(.+?)(?:<\/td>|\n)/);
		if(match) {
			serverContact = match[1].trim();
		} else {
			throw new ParseError('serverContact');
		}

		// httpPort
		match = html.match(/<t[dh]>HTTP(?: port)?:?(?:<\/t[dh]>)?<td>(?::)?(.+?)(?:<\/td>|\n)/);
		if(match) {
			httpPort = parseInt(match[1], 10);
		} else {
			throw new ParseError('httpPort');
		}

		// reconPort
		match = html.match(/<t[dh]>Recon(?: port)?:?(?:<\/t[dh]>)?<td>(?::)?(.+?)(?:<\/td>|\n)/);
		if(match) {
			reconPort = parseInt(match[1], 10);
		} else {
			throw new ParseError('reconPort');
		}

		// debugLevel
		match = html.match(/<t[dh]>Debug level:?(?:<\/t[dh]>)?<td>(.+?)(?:<\/td>|\n)/);
		if(match) {
			debugLevel = parseInt(match[1], 10);
		} else {
			throw new ParseError('debugLevel');
		}

		// keys
		match = html.match(/Total number of keys: ([0-9]+)/);
		if(match) {
			keys = parseInt(match[1], 10);
		} else {
			throw new ParseError('keys');
		}

		// statsTime
		match = html.match(/Taken at (.+?):?[<\n]/);
		if(match) {
			statsTime = moment(match[1], 'YYYY-MM-DD HH:mm:ss');
		} else {
			throw new ParseError('statsTime');
		}

		// gossipPeers & gossipPeerCount
		match = html.match(/Gossip Peers([\s\S]*?)<\/table>/);
		if(match) {
			var regexPeers = /<tr>[\s\S]*?<td>([^<>]+)[ :]([0-9]+)/g;
			var peer;

			while(peer = regexPeers.exec(match[1])) {
				gossipPeers.push(new GossipPeer(peer[1].trim(), parseInt(peer[2], 10)));
			}

			gossipPeerCount = gossipPeers.length;
		} else {
			throw new ParseError('peers');
		}

		// mailsyncPeers & mailsyncPeerCount
		match = html.match(/Outgoing Mailsync Peers([\s\S]*?)<\/table>/);
		if(match) {
			var regexPeers = /<tr>[\s\S]*?<td>([^<>]+)/g;
			var peer;

			while(peer = regexPeers.exec(match[1])) {
				mailsyncPeers.push(new MailsyncPeer(peer[1].trim()));
			}

			mailsyncPeerCount = mailsyncPeers.length;
		} else {
			throw new ParseError('peers');
		}


		return new Stats(
			software, version, hostName, nodeName, serverContact, httpPort,
			reconPort, debugLevel, keys, statsTime, gossipPeers, gossipPeerCount,
			mailsyncPeers, mailsyncPeerCount
		);
	}

	/**
	 * Parses given html into a KeyStats object, throws ParseError
	 *
	 * @param html HTML to parse, usually from a keyserver's stats page
	 */
	public static parseKeyStatsHtml(html: string): KeyStats {
		var match: RegExpMatchArray | null;

		var totalKeys: number;
		var dailyKeys: KeyStatsEntry[] = [];
		var hourlyKeys: KeyStatsEntry[] = [];


		// totalKeys
		match = html.match(/Total number of keys: ([0-9]+)/);
		if(match) {
			totalKeys = parseInt(match[1], 10);
		} else {
			throw new ParseError('totalKeys');
		}

		// statsTime
		match = html.match(/Taken at (.+?):?[<\n]/);
		if(match) {
			moment(match[1], 'YYYY-MM-DD HH:mm:ss');
		} else {
			throw new ParseError('statsTime');
		}

		// dailyKeys
		match = html.match(/Daily Histogram[\s\S]*<\/table>/);
		if(match) {
			var regexEntry = /<tr>[\s\S]*?<td>(\d{4}-\d{2}-\d{2})<\/td><td>(\d+)<\/td><td>(\d+)<\/td>/g;
			var entry;
			var dateTime: moment.Moment;

			while(entry = regexEntry.exec(match[0])) {
				dateTime = moment(entry[1].trim(), 'YYYY-MM-DD');
				dailyKeys.push(new KeyStatsEntry(dateTime, parseInt(entry[2], 10), parseInt(entry[3], 10)));
			}
		} else {
			throw new ParseError('dailyKeys');
		}

		// hourlyKeys
		match = html.match(/Hourly Histogram[\s\S]*<\/table>/);
		if(match) {
			var regexEntry = /<tr>[\s\S]*?<td>(\d{4}-\d{2}-\d{2} \d{2})<\/td><td>(\d+)<\/td><td>(\d+)<\/td>/g;
			var entry;
			var dateTime: moment.Moment;

			while(entry = regexEntry.exec(match[0])) {
				dateTime = moment(entry[1].trim(), 'YYYY-MM-DD HH');
				hourlyKeys.push(new KeyStatsEntry(dateTime, parseInt(entry[2], 10), parseInt(entry[3], 10)));
			}
		} else {
			throw new ParseError('hourlyKeys');
		}


		return new KeyStats(totalKeys, dailyKeys, hourlyKeys);
	}
}
