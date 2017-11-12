/**
 * Class representing a keyserver's gossip peer
 */
export class GossipPeer {
	/** The peer's hostname */
	public host: string;

	/** The peer's port */
	public port: number

	/** Constructor for creating a new gossip peer */
	constructor(host: string, port: number) {
		this.host = host;
		this.port = port;
	};
}

/**
 * Class representing a keyserver's mailsync peer
 */
export class MailsyncPeer {
	/** The peer's mailsync address */
	public address: string;

	/** Constructor for creating a new mailsync peer */
	constructor(address: string) {
		this.address = address;
	};
}
