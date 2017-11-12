import {Moment} from 'moment';

import {GossipPeer, MailsyncPeer} from './Peer';


/**
 * Class representing stats of a given keyserver
 */
export class Stats {
	/** The keyserver's software */
	public readonly software: string;

	/** The keyserver's version number */
	public readonly version: string;

	/** The keyserver's hostname */
	public readonly hostName: string;

	/** The keyserver's nodename (server's given name) */
	public readonly nodeName: string;

	/** The keyserver's contact information */
	public readonly serverContact: string;

	/** The keyserver's port for user traffic */
	public readonly httpPort: number;

	/** The keyserver's port for sync traffic */
	public readonly reconPort: number;

	/** The keyserver's debug level */
	public readonly debugLevel: number;

	/** The keyserver's number of keys */
	public readonly keys: number;

	/** The keyserver's time of stats generation */
	public readonly statsTime: Moment;

	/** The keyserver's gossip peers */
	public readonly gossipPeers: GossipPeer[];

	/** The keyserver's gossip peer count */
	public readonly gossipPeerCount: number;

	/** The keyserver's mailsync peers */
	public readonly mailsyncPeers: MailsyncPeer[];

	/** The keyserver's mailsync peer count */
	public readonly mailsyncPeerCount: number;

	/** Constructor for creating a new stats object */
	constructor(
		software: string, version: string, hostName: string, nodeName: string,
		serverContact: string, httpPort: number, reconPort: number, debugLevel: number,
		keys: number, statsTime: Moment, gossipPeers: GossipPeer[], gossipPeerCount: number,
		mailsyncPeers: MailsyncPeer[], mailsyncPeerCount: number
	) {
		this.software = software;
		this.version = version;
		this.hostName = hostName;
		this.nodeName = nodeName;
		this.serverContact = serverContact;
		this.httpPort = httpPort;
		this.reconPort = reconPort;
		this.debugLevel = debugLevel;
		this.keys = keys;
		this.statsTime = statsTime;
		this.gossipPeers = gossipPeers;
		this.gossipPeerCount = gossipPeerCount;
		this.mailsyncPeers = mailsyncPeers;
		this.mailsyncPeerCount = mailsyncPeerCount;
	}
}
