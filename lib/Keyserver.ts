import * as requestPromise from 'request-promise-native';
import * as moment from 'moment';

import {KeyStats, KeyStatsEntry} from './KeyStats';
import {ParseError} from './ParseError';
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

	/** The keyserver's raw stats html */
	private statsHtml: string|undefined = undefined;

	/** Constructor for creating a new keyserver */
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

	/** Retrieves the keyserver's html and returns it as Promise<string> */
	private getKeyserverHtml(path: string): Promise<string> {
		return requestPromise.get(path, this.requestOptions).then(
			(html: string) => {
				this.statsHtml = html;
				return html;
			}
		);
	}


	/** Retrieves the keyserver's stats html and returns it as Promise<string> */
	private getStatsHtml(): Promise<string> {
		var path = '/pks/lookup?op=stats';
		return this.getKeyserverHtml(path);
	}

	/** Maps the keyserver's html to a generic promise */
	public mapStatsToView<T>(transformFunction: (html: string) => T): Promise<T> {
		return this.getStatsHtml().then(transformFunction);
	}

	/** Retrieves the server's stats and returns a Promise<Stats>, uses the default parsing method (`parseStatsHtml`) */
	public getStats(): Promise<Stats> {
		return this.mapStatsToView(Keyserver.parseStatsHtml);
	}

	/** Retrieves the server's key stats and returns a Promise<KeyStats>, uses the default parsing method (`parseKeyStatsHtml`) */
	public getKeyStats(): Promise<KeyStats> {
		return this.mapStatsToView(Keyserver.parseKeyStatsHtml);
	}

	/** Parses given html into a Stats object, throws ParseError */
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

	/** Parses given html into a KeyStats object, throws ParseError */
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
