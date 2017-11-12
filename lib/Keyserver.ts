import * as requestPromise from 'request-promise-native';
import * as moment from 'moment';
import {Option, option, none} from 'm.m';

import {ParseError} from './ParseError';
import {Peer} from './Peer';
import {Stats} from './Stats';


/**
 * Class representing a keyserver
 */
export class Keyserver {
	/** The keyserver's hostname */
	public hostName: string;

	/** The keyserver's raw stats html */
	private statsHtml: Option<string> = none();

	/** Constructor for creating a new keyserver */
	constructor(hostName: string) {
		this.hostName = hostName;
	}

	/** Retrieves the keyserver's stats html if necessary and then returns it as Promise<string>. */
	private getStatsHtml(): Promise<string> {
		if(this.statsHtml.isEmpty) {
			var options: requestPromise.Options = {
				uri: 'http://' + this.hostName + ':11371/pks/lookup?op=stats',
				timeout: 4000,
				headers: {
					'User-Agent': 'sks-lib (https://github.com/ntzwrk/sks-lib)'
				}
			};

			return requestPromise.get(options).then(
				(html: string) => {
					this.statsHtml = option(html);
					return html;
				}
			);
		} else {
			return new Promise<string>(() => this.statsHtml.get);
		}
	}

	/** Retrieves the server's stats and returns a promise, but takes a custom parse function */
	public getCustomStats(lambdaFunction: (html: string) => Stats): Promise<Stats> {
		var options: requestPromise.Options = {
			uri: 'http://' + this.hostName + ':11371/pks/lookup?op=stats',
			timeout: 4000,
			headers: {
				'User-Agent': 'sks-lib (https://github.com/ntzwrk/sks-lib)'
			}
		};

		return requestPromise.get(options).then(lambdaFunction);
	}

	/** Parses given html into a Stats object, throws ParseError */
	public static parseHtml(html: string): Stats {
		// TODO: mailsync
		// TODO: key fluctuation

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
		var peers: Peer[] = [];
		var peerCount: number;


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
		if (match) {
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

		// peers & peerCount
		match = html.match(/Gossip Peers([\s\S]*?)<\/table>/);
		if(match) {
			var regexPeers = /<tr>[\s\S]*?<td>([^<>]+)[ :]([0-9]+)/g;
			var peer;

			while(peer = regexPeers.exec(match[1])) {
				peers.push(new Peer(peer[1].trim(), parseInt(peer[2], 10)));
			}

			peerCount = peers.length;
		} else {
			throw new ParseError('peers');
		}


		return new Stats(
			software, version, hostName, nodeName, serverContact, httpPort,
			reconPort, debugLevel, keys, statsTime, peers, peerCount
		);
	}
}
