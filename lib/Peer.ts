/**
 * Class representing a keyserver's peer
 */
export class Peer {
	/** The peer's hostname */
	public host: string;

	/** The peer's port */
	public port: number

	/** Constructor for creating a new peer */
	constructor(host: string, port: number) {
		this.host = host;
		this.port = port;
	};
}
